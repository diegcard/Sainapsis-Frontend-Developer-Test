import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OrderProvider } from '@/context/OrderContext';
import { Layout } from '@/layouts/Layout';
import { OrdersPage } from '@/pages/OrdersPage';
import { TransitionsPage } from '@/pages/TransitionsPage';

function App() {
  return (
    <OrderProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/orders" replace />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="transitions" element={<TransitionsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </OrderProvider>
  );
}

export default App;

