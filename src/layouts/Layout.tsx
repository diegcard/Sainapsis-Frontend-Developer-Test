import type React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Package, FileText } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Layout: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname === '/' ? '/orders' : location.pathname;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Sainapsis Order Manager</h1>
              <p className="text-sm text-muted-foreground">
                Advanced order state machine management system
              </p>
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b bg-muted/50">
        <div className="container mx-auto px-4 py-3">
          <Tabs value={currentPath} className="w-full">
            <TabsList>
              <TabsTrigger value="/orders" asChild>
                <Link to="/orders" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Orders
                </Link>
              </TabsTrigger>
              <TabsTrigger value="/transitions" asChild>
                <Link to="/transitions" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Transition Logs
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Sainapsis Order Management System - Technical Test</p>
          <p className="mt-1">Built with React, TypeScript, Tailwind CSS, and Shadcn/ui</p>
        </div>
      </footer>
    </div>
  );
};
