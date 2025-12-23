import React, { useState } from 'react';
import { ArrowRight, Search, RefreshCw, Loader2 } from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDate } from '@/lib/utils';
import { OrderStateMachine } from '@/services/orderStateMachine';

export const TransitionLog: React.FC = () => {
  const { transitions, orders, loading, refreshTransitions } = useOrders();
  const [filterOrderId, setFilterOrderId] = useState('');

  const filteredTransitions = filterOrderId
    ? transitions.filter((t) => t.orderId.toLowerCase().includes(filterOrderId.toLowerCase()))
    : transitions;

  const getOrderShortId = (orderId: string) => orderId.slice(0, 8);

  if (loading && transitions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading transitions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filter Transitions</CardTitle>
            <Button variant="outline" size="sm" onClick={refreshTransitions} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="orderIdFilter">Filter by Order ID</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="orderIdFilter"
                placeholder="Enter order ID to filter..."
                value={filterOrderId}
                onChange={(e) => setFilterOrderId(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredTransitions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">No transitions found</h3>
            <p className="text-muted-foreground">
              {filterOrderId
                ? 'No transitions match your filter criteria'
                : 'State transitions will appear here'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Transition History ({filteredTransitions.length})
            </h2>
          </div>
          {filteredTransitions
            .sort((a, b) => b.transitionDate.getTime() - a.transitionDate.getTime())
            .map((transition) => {
              const order = orders.find((o) => o.id === transition.orderId);
              return (
                <Card key={transition.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">
                            Order #{getOrderShortId(transition.orderId)}
                          </h3>
                          {order && (
                            <p className="text-sm text-muted-foreground">
                              {order.customer.name}
                            </p>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(transition.transitionDate)}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                        <Badge
                          className={OrderStateMachine.getStateBadgeColor(
                            transition.previousState
                          )}
                        >
                          {transition.previousState}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Badge
                          className={OrderStateMachine.getStateBadgeColor(transition.newState)}
                        >
                          {transition.newState}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Action:</span>
                        <Badge variant="outline">{transition.actionTaken}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
};
