import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useOrders } from '@/context/OrderContext';
import type { OrderFormData, ProductDetail } from '@/types/order.types';

export const CreateOrderDialog: React.FC = () => {
  const { createOrder } = useOrders();
  const [open, setOpen] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [products, setProducts] = useState<ProductDetail[]>([
    { name: '', quantity: 1, unitPrice: 0 },
  ]);
  const [notes, setNotes] = useState('');

  const addProduct = () => {
    setProducts([...products, { name: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: keyof ProductDetail, value: string | number) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setProducts(newProducts);
  };

  const calculateTotal = () => {
    return products.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!customerName || !customerEmail) {
      alert('Please fill in customer information');
      return;
    }

    if (products.some((p) => !p.name || p.quantity <= 0 || p.unitPrice <= 0)) {
      alert('Please fill in all product details correctly');
      return;
    }

    const formData: OrderFormData = {
      customer: {
        name: customerName,
        email: customerEmail,
      },
      productDetails: products,
      notes: notes || undefined,
    };

    createOrder(formData);

    // Reset form
    setCustomerName('');
    setCustomerEmail('');
    setProducts([{ name: '', quantity: 1, unitPrice: 0 }]);
    setNotes('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Fill in the order details. Orders over $1,000 will require review before preparation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Name *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Product Details</h3>
                <Button type="button" variant="outline" size="sm" onClick={addProduct}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Product
                </Button>
              </div>
              {products.map((product, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-medium">Product {index + 1}</span>
                    {products.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProduct(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-3 space-y-2">
                      <Label htmlFor={`productName-${index}`}>Product Name *</Label>
                      <Input
                        id={`productName-${index}`}
                        value={product.name}
                        onChange={(e) => updateProduct(index, 'name', e.target.value)}
                        placeholder="Product name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`quantity-${index}`}>Quantity *</Label>
                      <Input
                        id={`quantity-${index}`}
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`unitPrice-${index}`}>Unit Price ($) *</Label>
                      <Input
                        id={`unitPrice-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={product.unitPrice}
                        onChange={(e) =>
                          updateProduct(index, 'unitPrice', parseFloat(e.target.value))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Subtotal</Label>
                      <Input
                        value={`$${(product.quantity * product.unitPrice).toFixed(2)}`}
                        disabled
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-end">
                <div className="text-lg font-semibold">
                  Total: ${calculateTotal().toFixed(2)}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special instructions or comments..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Order</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
