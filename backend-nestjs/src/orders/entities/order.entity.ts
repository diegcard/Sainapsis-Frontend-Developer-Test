/**
 * Order States following the frontend state machine requirements
 * Pending → In Review (for high value) → In Preparation → Shipped → Delivered
 * Cancel available before Shipped state
 */
export const OrderState = {
	PENDING: "Pending",
	IN_REVIEW: "In Review",
	IN_PREPARATION: "In Preparation",
	SHIPPED: "Shipped",
	DELIVERED: "Delivered",
	CANCELLED: "Cancelled",
} as const;

export type OrderStateType = (typeof OrderState)[keyof typeof OrderState];

/**
 * Available actions for order state transitions
 */
export const OrderAction = {
	START_PREPARATION: "Start Preparation",
	SEND_ORDER: "Send Order",
	CONFIRM_DELIVERY: "Confirm Delivery",
	REVIEW_ORDER: "Review Order",
	CANCEL_ORDER: "Cancel Order",
	APPROVE_REVIEW: "Approve Review",
} as const;

export type OrderActionType = (typeof OrderAction)[keyof typeof OrderAction];

export class ProductDetail {
	name: string;
	quantity: number;
	unitPrice: number;
}

export class Customer {
	name: string;
	email: string;
}

export class Order {
	id: string;
	amount: number;
	currentState: OrderStateType;
	creationDate: Date;
	customer: Customer;
	productDetails: ProductDetail[];
	notes?: string;
}

export class StateTransition {
	id: string;
	orderId: string;
	previousState: OrderStateType;
	newState: OrderStateType;
	transitionDate: Date;
	actionTaken: OrderActionType;
	metadata?: Record<string, any>;
}

/**
 * Support Ticket for high value orders with payment failures
 */
export class SupportTicket {
	id: string;
	orderId: string;
	reason: string;
	amount: number;
	createdAt: Date;
	status: "open" | "in-progress" | "resolved";
}
