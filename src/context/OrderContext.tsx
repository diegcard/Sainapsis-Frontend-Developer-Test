import type React from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { OrderAction } from '@/types/order.types';
import type { Order, StateTransition, OrderFormData } from '@/types/order.types';
import { orderApi, ApiError } from '@/services/api';

interface OrderContextType {
  orders: Order[];
  transitions: StateTransition[];
  loading: boolean;
  error: string | null;
  createOrder: (formData: OrderFormData) => Promise<Order | null>;
  executeTransition: (orderId: string, action: OrderAction) => Promise<boolean>;
  getOrderById: (orderId: string) => Order | undefined;
  getTransitionsByOrderId: (orderId: string) => StateTransition[];
  refreshOrders: () => Promise<void>;
  refreshTransitions: () => Promise<void>;
  clearError: () => void;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all orders from the backend
   */
  const refreshOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedOrders = await orderApi.getAllOrders();
      setOrders(fetchedOrders);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch orders';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch all transitions from the backend
   */
  const refreshTransitions = useCallback(async () => {
    try {
      const fetchedTransitions = await orderApi.getAllTransitions();
      setTransitions(fetchedTransitions);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch transitions';
      setError(message);
    }
  }, []);

  /**
   * Load initial data on mount
   */
  useEffect(() => {
    refreshOrders();
    refreshTransitions();
  }, [refreshOrders, refreshTransitions]);

  /**
   * Create a new order via API
   */
  const createOrder = useCallback(
    async (formData: OrderFormData): Promise<Order | null> => {
      setLoading(true);
      setError(null);
      try {
        const newOrder = await orderApi.createOrder(formData);
        // Refresh data to ensure consistency with backend
        await refreshOrders();
        await refreshTransitions();
        return newOrder;
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Failed to create order';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [refreshOrders, refreshTransitions],
  );

  /**
   * Execute a state transition via API
   */
  const executeTransition = useCallback(
    async (orderId: string, action: OrderAction): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        await orderApi.executeTransition(orderId, action);
        // Refresh data to ensure consistency with backend
        await refreshOrders();
        await refreshTransitions();
        return true;
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Failed to execute transition';
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [refreshOrders, refreshTransitions],
  );

  const getOrderById = useCallback(
    (orderId: string): Order | undefined => {
      return orders.find((o) => o.id === orderId);
    },
    [orders],
  );

  const getTransitionsByOrderId = useCallback(
    (orderId: string): StateTransition[] => {
      return transitions.filter((t) => t.orderId === orderId);
    },
    [transitions],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: OrderContextType = {
    orders,
    transitions,
    loading,
    error,
    createOrder,
    executeTransition,
    getOrderById,
    getTransitionsByOrderId,
    refreshOrders,
    refreshTransitions,
    clearError,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};
