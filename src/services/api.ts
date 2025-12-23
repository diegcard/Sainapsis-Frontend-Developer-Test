import type { Order, StateTransition, OrderFormData, OrderAction } from '@/types/order.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * API Error class for handling HTTP errors
 */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, 'Network error: Unable to connect to the server');
  }
}

export const orderApi = {

    createOrder: async (formData: OrderFormData): Promise<Order> => {
    const response = await fetchApi<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    return {
      ...response,
      creationDate: new Date(response.creationDate),
    };
  },

  getAllOrders: async (): Promise<Order[]> => {
    const response = await fetchApi<Order[]>('/orders');

    return response.map((order) => ({
      ...order,
      creationDate: new Date(order.creationDate),
    }));
  },

  getOrderById: async (orderId: string): Promise<Order> => {
    const response = await fetchApi<Order>(`/orders/${orderId}`);

    return {
      ...response,
      creationDate: new Date(response.creationDate),
    };
  },

  getAvailableActions: async (orderId: string): Promise<OrderAction[]> => {
    return fetchApi<OrderAction[]>(`/orders/${orderId}/actions`);
  },

  executeTransition: async (
    orderId: string,
    action: OrderAction,
    metadata?: Record<string, unknown>
  ): Promise<{ order: Order; transition: StateTransition }> => {
    const response = await fetchApi<{ order: Order; transition: StateTransition }>(
      `/orders/${orderId}/transition`,
      {
        method: 'PATCH',
        body: JSON.stringify({ action, metadata }),
      }
    );

    return {
      order: {
        ...response.order,
        creationDate: new Date(response.order.creationDate),
      },
      transition: {
        ...response.transition,
        transitionDate: new Date(response.transition.transitionDate),
      },
    };
  },

  getAllTransitions: async (): Promise<StateTransition[]> => {
    const response = await fetchApi<StateTransition[]>('/orders/transitions/all');

    return response.map((transition) => ({
      ...transition,
      transitionDate: new Date(transition.transitionDate),
    }));
  },

  getTransitionsByOrderId: async (orderId: string): Promise<StateTransition[]> => {
    const response = await fetchApi<StateTransition[]>(`/orders/${orderId}/transitions`);

    return response.map((transition) => ({
      ...transition,
      transitionDate: new Date(transition.transitionDate),
    }));
  },
};

export default orderApi;
