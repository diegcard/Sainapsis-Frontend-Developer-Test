import React from 'react';
import { Calendar, Mail, Package, User, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrderAction } from '@/types/order.types';
import type { Order } from '@/types/order.types';
import { OrderStateMachine, HIGH_VALUE_THRESHOLD } from '@/services/orderStateMachine';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useOrders } from '@/context/OrderContext';

interface OrderCardProps {
  order: Order;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const { executeTransition } = useOrders();

  const availableActions = OrderStateMachine.getAvailableActions(order);

  const handleAction = (action: OrderAction) => {
    const success = executeTransition(order.id, action);
    if (!success) {
      alert('Failed to execute transition. Please check the order state.');
    }
  };

  const isHighValue = order.amount > HIGH_VALUE_THRESHOLD;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
            <Badge className={OrderStateMachine.getStateBadgeColor(order.currentState)}>
              {order.currentState}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{formatCurrency(order.amount)}</div>
            {isHighValue && (
              <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                <AlertCircle className="h-3 w-3" />
                High Value Order
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{order.customer.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{order.customer.email}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Package className="h-4 w-4 text-muted-foreground" />
            Products ({order.productDetails.length})
          </div>
          <div className="pl-6 space-y-1">
            {order.productDetails.map((product, index) => (
              <div key={index} className="text-sm text-muted-foreground">
                {product.name} - {product.quantity}x {formatCurrency(product.unitPrice)}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(order.creationDate)}</span>
        </div>

        {order.notes && (
          <div className="text-sm p-3 bg-muted rounded-md">
            <p className="font-medium mb-1">Notes:</p>
            <p className="text-muted-foreground">{order.notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex flex-wrap gap-2 w-full">
          {availableActions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No actions available</p>
          ) : (
            availableActions.map((action) => (
              <Button
                key={action}
                variant={OrderStateMachine.getActionButtonVariant(action)}
                size="sm"
                onClick={() => handleAction(action)}
              >
                {action}
              </Button>
            ))
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
