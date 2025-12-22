import React from 'react';
import { TransitionLog } from '@/components/transitions/TransitionLog';

export const TransitionsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transition Logs</h1>
        <p className="text-muted-foreground">
          View the complete history of all order state transitions
        </p>
      </div>
      <TransitionLog />
    </div>
  );
};
