import React from 'react';
import { CreateOrderDialog } from '../components/orders/CreateOrderDialog';
import { OrderList } from '../components/orders/OrderList';

export const OrdersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all your orders through their lifecycle
          </p>
        </div>
        <CreateOrderDialog />
      </div>
      <OrderList />
    </div>
  );
};
