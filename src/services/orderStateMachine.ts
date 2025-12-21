import { OrderState, OrderAction } from '../types/order.types';
import type { Order, StateTransition } from '../types/order.types';

// State Machine Configuration
export const HIGH_VALUE_THRESHOLD = 1000;

// Define valid transitions for the state machine
const stateTransitions: Record<OrderState, Record<OrderAction, OrderState | null>> = {
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

export class OrderStateMachine {
  /**
   * Check if a transition is valid for a given order and action
   */
  static isValidTransition(order: Order, action: OrderAction): boolean {
    const currentState = order.currentState;
    const nextState = stateTransitions[currentState][action];

    // Check if the transition exists in the state machine
    if (!nextState) return false;

    // Special rule: Orders > $1000 must go through Review before In Preparation
    if (
      order.amount > HIGH_VALUE_THRESHOLD &&
      currentState === OrderState.PENDING &&
      action === OrderAction.START_PREPARATION
    ) {
      return false;
    }

    // Orders > $1000 in Pending state can only be reviewed or cancelled
    if (
      order.amount > HIGH_VALUE_THRESHOLD &&
      currentState === OrderState.PENDING &&
      action !== OrderAction.REVIEW_ORDER &&
      action !== OrderAction.CANCEL_ORDER
    ) {
      return false;
    }

    return true;
  }

  /**
   * Get the next state for a given action
   */
  static getNextState(currentState: OrderState, action: OrderAction): OrderState | null {
    return stateTransitions[currentState][action];
  }

  /**
   * Get available actions for a given order
   */
  static getAvailableActions(order: Order): OrderAction[] {
    const currentState = order.currentState;
    const actions: OrderAction[] = [];

    // If order is in terminal state, no actions available
    if (currentState === OrderState.DELIVERED || currentState === OrderState.CANCELLED) {
      return [];
    }

    // Check each possible action
    for (const action of Object.values(OrderAction)) {
      if (this.isValidTransition(order, action)) {
        actions.push(action);
      }
    }

    return actions;
  }

  /**
   * Execute a transition and create a transition record
   */
  static executeTransition(
    order: Order,
    action: OrderAction
  ): { newOrder: Order; transition: StateTransition } | null {
    if (!this.isValidTransition(order, action)) {
      return null;
    }

    const nextState = this.getNextState(order.currentState, action);
    if (!nextState) return null;

    const transition: StateTransition = {
      id: crypto.randomUUID(),
      orderId: order.id,
      previousState: order.currentState,
      newState: nextState,
      transitionDate: new Date(),
      actionTaken: action,
    };

    const newOrder: Order = {
      ...order,
      currentState: nextState,
    };

    return { newOrder, transition };
  }

  /**
   * Get the state badge color based on the state
   */
  static getStateBadgeColor(state: OrderState): string {
    const colors: Record<OrderState, string> = {
      [OrderState.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      [OrderState.IN_REVIEW]: 'bg-purple-100 text-purple-800 border-purple-300',
      [OrderState.IN_PREPARATION]: 'bg-blue-100 text-blue-800 border-blue-300',
      [OrderState.SHIPPED]: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      [OrderState.DELIVERED]: 'bg-green-100 text-green-800 border-green-300',
      [OrderState.CANCELLED]: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[state];
  }

  /**
   * Get the action button variant based on the action type
   */
  static getActionButtonVariant(
    action: OrderAction
  ): 'default' | 'secondary' | 'destructive' | 'outline' {
    const variants: Record<
      OrderAction,
      'default' | 'secondary' | 'destructive' | 'outline'
    > = {
      [OrderAction.START_PREPARATION]: 'default',
      [OrderAction.SEND_ORDER]: 'default',
      [OrderAction.CONFIRM_DELIVERY]: 'default',
      [OrderAction.REVIEW_ORDER]: 'secondary',
      [OrderAction.APPROVE_REVIEW]: 'default',
      [OrderAction.CANCEL_ORDER]: 'destructive',
    };
    return variants[action];
  }
}
