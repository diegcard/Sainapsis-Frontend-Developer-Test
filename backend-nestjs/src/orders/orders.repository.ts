import { Injectable } from "@nestjs/common";
import type {
	Order,
	StateTransition,
	SupportTicket,
} from "@orders/entities/order.entity";

/**
 * Repository pattern implementation for Order, StateTransition, and SupportTicket entities
 * Stores data in memory using Map structures for professional data management
 * In a production environment, this would be replaced with a database adapter
 */
@Injectable()
export class OrdersRepository {
	private orders = new Map<string, Order>();
	private transitions = new Map<string, StateTransition[]>();
	private tickets = new Map<string, SupportTicket>();

	/**
	 * Save or update an order
	 * @param order - The order entity to persist
	 */
	saveOrder(order: Order): Order {
		this.orders.set(order.id, { ...order });
		return this.orders.get(order.id)!;
	}

	/**
	 * Retrieve an order by its ID
	 * @param orderId - The unique identifier of the order
	 * @returns The order if found, undefined otherwise
	 */
	getOrderById(orderId: string): Order | undefined {
		const order = this.orders.get(orderId);
		if (order) {
			return { ...order };
		}
		return undefined;
	}

	/**
	 * Get all orders
	 * @returns Array of all orders
	 */
	getAllOrders(): Order[] {
		return Array.from(this.orders.values()).map((order) => ({ ...order }));
	}

	/**
	 * Save a state transition log
	 * @param transition - The state transition to log
	 */
	saveTransition(transition: StateTransition): StateTransition {
		const orderTransitions = this.transitions.get(transition.orderId) || [];
		orderTransitions.push({ ...transition });
		this.transitions.set(transition.orderId, orderTransitions);
		return transition;
	}

	/**
	 * Get all transitions for a specific order
	 * @param orderId - The order ID to get transitions for
	 * @returns Array of state transitions
	 */
	getTransitionsByOrderId(orderId: string): StateTransition[] {
		return (this.transitions.get(orderId) || []).map((t) => ({ ...t }));
	}

	/**
	 * Get all transitions across all orders
	 * @returns Array of all state transitions
	 */
	getAllTransitions(): StateTransition[] {
		return Array.from(this.transitions.values())
			.flat()
			.map((t) => ({ ...t }));
	}

	/**
	 * Save a support ticket
	 * @param ticket - The support ticket to save
	 */
	saveTicket(ticket: SupportTicket): SupportTicket {
		this.tickets.set(ticket.id, { ...ticket });
		return this.tickets.get(ticket.id)!;
	}

	/**
	 * Get all support tickets
	 * @returns Array of all support tickets
	 */
	getAllTickets(): SupportTicket[] {
		return Array.from(this.tickets.values()).map((t) => ({ ...t }));
	}

	/**
	 * Get ticket by order ID
	 * @param orderId - The order ID to find tickets for
	 */
	getTicketsByOrderId(orderId: string): SupportTicket[] {
		return Array.from(this.tickets.values())
			.filter((t) => t.orderId === orderId)
			.map((t) => ({ ...t }));
	}

	/**
	 * Delete an order (for testing purposes)
	 * @param orderId - The order ID to delete
	 */
	deleteOrder(orderId: string): boolean {
		const deleted = this.orders.delete(orderId);
		this.transitions.delete(orderId);
		return deleted;
	}

	/**
	 * Clear all data (for testing purposes)
	 */
	clearAll(): void {
		this.orders.clear();
		this.transitions.clear();
		this.tickets.clear();
	}
}
