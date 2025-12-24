import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from "@nestjs/common";
import { OrdersRepository } from "@orders/orders.repository";
import { CreateOrderDto } from "@orders/dto/create-order.dto";
import { TransitionOrderDto } from "@orders/dto/transition-order.dto";
import {
	Order,
	StateTransition,
	SupportTicket,
	OrderState,
	OrderAction,
	OrderStateType,
	OrderActionType,
} from "@orders/entities/order.entity";

/**
 * High value threshold for orders requiring review
 */
const HIGH_VALUE_THRESHOLD = 1000;

/**
 * State machine configuration mapping current state + action to next state
 */
const STATE_TRANSITIONS: Record<
	OrderStateType,
	Record<OrderActionType, OrderStateType | null>
> = {
	[OrderState.PENDING]: {
		[OrderAction.START_PREPARATION]: OrderState.IN_PREPARATION,
		[OrderAction.REVIEW_ORDER]: OrderState.IN_REVIEW,
		[OrderAction.CANCEL_ORDER]: OrderState.CANCELLED,
		[OrderAction.SEND_ORDER]: null,
		[OrderAction.CONFIRM_DELIVERY]: null,
		[OrderAction.APPROVE_REVIEW]: null,
	},
	[OrderState.IN_REVIEW]: {
		[OrderAction.APPROVE_REVIEW]: OrderState.IN_PREPARATION,
		[OrderAction.CANCEL_ORDER]: OrderState.CANCELLED,
		[OrderAction.START_PREPARATION]: null,
		[OrderAction.SEND_ORDER]: null,
		[OrderAction.CONFIRM_DELIVERY]: null,
		[OrderAction.REVIEW_ORDER]: null,
	},
	[OrderState.IN_PREPARATION]: {
		[OrderAction.SEND_ORDER]: OrderState.SHIPPED,
		[OrderAction.CANCEL_ORDER]: OrderState.CANCELLED,
		[OrderAction.START_PREPARATION]: null,
		[OrderAction.CONFIRM_DELIVERY]: null,
		[OrderAction.REVIEW_ORDER]: null,
		[OrderAction.APPROVE_REVIEW]: null,
	},
	[OrderState.SHIPPED]: {
		[OrderAction.CONFIRM_DELIVERY]: OrderState.DELIVERED,
		[OrderAction.START_PREPARATION]: null,
		[OrderAction.SEND_ORDER]: null,
		[OrderAction.CANCEL_ORDER]: null,
		[OrderAction.REVIEW_ORDER]: null,
		[OrderAction.APPROVE_REVIEW]: null,
	},
	[OrderState.DELIVERED]: {
		[OrderAction.START_PREPARATION]: null,
		[OrderAction.SEND_ORDER]: null,
		[OrderAction.CONFIRM_DELIVERY]: null,
		[OrderAction.CANCEL_ORDER]: null,
		[OrderAction.REVIEW_ORDER]: null,
		[OrderAction.APPROVE_REVIEW]: null,
	},
	[OrderState.CANCELLED]: {
		[OrderAction.START_PREPARATION]: null,
		[OrderAction.SEND_ORDER]: null,
		[OrderAction.CONFIRM_DELIVERY]: null,
		[OrderAction.CANCEL_ORDER]: null,
		[OrderAction.REVIEW_ORDER]: null,
		[OrderAction.APPROVE_REVIEW]: null,
	},
};

@Injectable()
export class OrdersService {
	constructor(private readonly ordersRepository: OrdersRepository) {}

	createOrder(createOrderDto: CreateOrderDto): Order {
		const amount = createOrderDto.productDetails.reduce(
			(sum, product) => sum + product.quantity * product.unitPrice,
			0,
		);

		const order: Order = {
			id: this.generateId(),
			amount,
			currentState: OrderState.PENDING,
			creationDate: new Date(),
			customer: createOrderDto.customer,
			productDetails: createOrderDto.productDetails,
			notes: createOrderDto.notes,
		};

		this.ordersRepository.saveOrder(order);

		const initialTransition: StateTransition = {
			id: this.generateId(),
			orderId: order.id,
			previousState: OrderState.PENDING,
			newState: OrderState.PENDING,
			transitionDate: new Date(),
			actionTaken: OrderAction.START_PREPARATION,
			metadata: { event: "order_created" },
		};

		this.ordersRepository.saveTransition(initialTransition);

		return order;
	}

	getAllOrders(): Order[] {
		return this.ordersRepository.getAllOrders();
	}

	getOrderById(orderId: string): Order {
		const order = this.ordersRepository.getOrderById(orderId);
		if (!order) {
			throw new NotFoundException(`Order with ID ${orderId} not found`);
		}
		return order;
	}

	executeTransition(
		orderId: string,
		transitionDto: TransitionOrderDto,
	): { order: Order; transition: StateTransition } {
		const order = this.ordersRepository.getOrderById(orderId);
		if (!order) {
			throw new NotFoundException(`Order with ID ${orderId} not found`);
		}

		const action = transitionDto.action as OrderActionType;

		if (!this.isValidTransition(order, action)) {
			throw new BadRequestException(
				`Invalid transition: Cannot perform "${action}" on order in state "${order.currentState}"`,
			);
		}

		const previousState = order.currentState;
		const newState = this.getNextState(order.currentState, action);

		if (!newState) {
			throw new BadRequestException(
				`No valid transition found for action "${action}" from state "${order.currentState}"`,
			);
		}

		order.currentState = newState;
		this.ordersRepository.saveOrder(order);

		const transition: StateTransition = {
			id: this.generateId(),
			orderId: order.id,
			previousState,
			newState,
			transitionDate: new Date(),
			actionTaken: action,
			metadata: transitionDto.metadata,
		};

		this.ordersRepository.saveTransition(transition);

		this.handleTransitionSideEffects(order, action, transitionDto.metadata);

		return { order, transition };
	}

	/**
	 * Check if a transition is valid for a given order and action
	 */
	private isValidTransition(order: Order, action: OrderActionType): boolean {
		const currentState = order.currentState;
		const nextState = STATE_TRANSITIONS[currentState]?.[action];

		if (!nextState) return false;

		// Additional rule: High value orders require review before preparation

		if (order.amount > HIGH_VALUE_THRESHOLD) {
			if (
				currentState === OrderState.PENDING &&
				action === OrderAction.START_PREPARATION
			) {
				return false;
			}
		}

		return true;
	}

	private getNextState(
		currentState: OrderStateType,
		action: OrderActionType,
	): OrderStateType | null {
		return STATE_TRANSITIONS[currentState]?.[action] || null;
	}

	getAvailableActions(orderId: string): OrderActionType[] {
		const order = this.ordersRepository.getOrderById(orderId);
		if (!order) {
			throw new NotFoundException(`Order with ID ${orderId} not found`);
		}

		const actions: OrderActionType[] = [];
		const currentState = order.currentState;

		if (
			currentState === OrderState.DELIVERED ||
			currentState === OrderState.CANCELLED
		) {
			return [];
		}

		for (const action of Object.values(OrderAction)) {
			if (this.isValidTransition(order, action)) {
				actions.push(action);
			}
		}

		return actions;
	}

	private handleTransitionSideEffects(
		order: Order,
		action: OrderActionType,
		metadata?: Record<string, any>,
	): void {
		// When order is cancelled with payment failure and amount > 1000, create support ticket
		if (
			action === OrderAction.CANCEL_ORDER &&
			metadata?.reason === "paymentFailed" &&
			order.amount > HIGH_VALUE_THRESHOLD
		) {
			this.createSupportTicket(order, "Payment failed for high value order");
		}
	}

	private createSupportTicket(order: Order, reason: string): SupportTicket {
		const ticket: SupportTicket = {
			id: this.generateId(),
			orderId: order.id,
			reason,
			amount: order.amount,
			createdAt: new Date(),
			status: "open",
		};

		return this.ordersRepository.saveTicket(ticket);
	}

	getAllTransitions(): StateTransition[] {
		return this.ordersRepository.getAllTransitions();
	}

	getTransitionsByOrderId(orderId: string): StateTransition[] {
		const order = this.ordersRepository.getOrderById(orderId);
		if (!order) {
			throw new NotFoundException(`Order with ID ${orderId} not found`);
		}
		return this.ordersRepository.getTransitionsByOrderId(orderId);
	}

	private generateId(): string {
		return (
			Math.random().toString(36).substring(2, 15) +
			Math.random().toString(36).substring(2, 15)
		);
	}
}
