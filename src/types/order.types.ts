export const OrderState = {
  PENDING: 'Pending',
  IN_REVIEW: 'In Review',
  IN_PREPARATION: 'In Preparation',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
} as const;

export type OrderState = typeof OrderState[keyof typeof OrderState];

export const OrderAction = {
  START_PREPARATION: 'Start Preparation',
  SEND_ORDER: 'Send Order',
  CONFIRM_DELIVERY: 'Confirm Delivery',
  REVIEW_ORDER: 'Review Order',
  CANCEL_ORDER: 'Cancel Order',
  APPROVE_REVIEW: 'Approve Review',
} as const;

export type OrderAction = typeof OrderAction[keyof typeof OrderAction];

export interface ProductDetail {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Customer {
  name: string;
  email: string;
}

export interface Order {
  id: string;
  amount: number;
  currentState: OrderState;
  creationDate: Date;
  customer: Customer;
  productDetails: ProductDetail[];
  notes?: string;
}

export interface StateTransition {
  id: string;
  orderId: string;
  previousState: OrderState;
  newState: OrderState;
  transitionDate: Date;
  actionTaken: OrderAction;
}

export interface OrderFormData {
  customer: Customer;
  productDetails: ProductDetail[];
  notes?: string;
}
