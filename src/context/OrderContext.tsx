import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { OrderState, OrderAction } from '../types/order.types';
import type { Order, StateTransition, OrderFormData } from '../types/order.types';
import { OrderStateMachine } from '../services/orderStateMachine';

interface OrderContextType {
  orders: Order[];
  transitions: StateTransition[];
  createOrder: (formData: OrderFormData) => Order;
  executeTransition: (orderId: string, action: OrderAction) => boolean;
  getOrderById: (orderId: string) => Order | undefined;
  getTransitionsByOrderId: (orderId: string) => StateTransition[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [transitions, setTransitions] = useState<StateTransition[]>([]);

  const createOrder = useCallback((formData: OrderFormData): Order => {
    // Calculate total amount from product details
    const amount = formData.productDetails.reduce(
      (sum, product) => sum + product.quantity * product.unitPrice,
      0
    );

    const newOrder: Order = {
      id: crypto.randomUUID(),
      amount,
      currentState: OrderState.PENDING,
      creationDate: new Date(),
      customer: formData.customer,
      productDetails: formData.productDetails,
      notes: formData.notes,
    };

    setOrders((prev) => [...prev, newOrder]);

    // Create initial transition log
    const initialTransition: StateTransition = {
      id: crypto.randomUUID(),
      orderId: newOrder.id,
      previousState: OrderState.PENDING,
      newState: OrderState.PENDING,
      transitionDate: new Date(),
      actionTaken: OrderAction.START_PREPARATION, // Placeholder action for creation
    };

    setTransitions((prev) => [...prev, initialTransition]);

    return newOrder;
  }, []);

  const executeTransition = useCallback(
    (orderId: string, action: OrderAction): boolean => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return false;

      const result = OrderStateMachine.executeTransition(order, action);
      if (!result) return false;

      const { newOrder, transition } = result;

      setOrders((prev) => prev.map((o) => (o.id === orderId ? newOrder : o)));
      setTransitions((prev) => [...prev, transition]);

      return true;
    },
    [orders]
  );

  const getOrderById = useCallback(
    (orderId: string): Order | undefined => {
      return orders.find((o) => o.id === orderId);
    },
    [orders]
  );

  const getTransitionsByOrderId = useCallback(
    (orderId: string): StateTransition[] => {
      return transitions.filter((t) => t.orderId === orderId);
    },
    [transitions]
  );

  const value: OrderContextType = {
    orders,
    transitions,
    createOrder,
    executeTransition,
    getOrderById,
    getTransitionsByOrderId,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};
