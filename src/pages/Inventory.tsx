import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, AlertTriangle } from 'lucide-react';

const Inventory: React.FC = () => {
  const inventoryItems = [
    { id: 1, name: 'Premium Laptop', sku: 'LAP001', quantity: 45, lowStock: false, category: 'Electronics' },
    { id: 2, name: 'Wireless Mouse', sku: 'MOU002', quantity: 8, lowStock: true, category: 'Accessories' },
    { id: 3, name: 'Office Chair', sku: 'CHA003', quantity: 23, lowStock: false, category: 'Furniture' },
    { id: 4, name: 'USB Keyboard', sku: 'KEY004', quantity: 3, lowStock: true, category: 'Accessories' },
    { id: 5, name: 'Monitor Stand', sku: 'STA005', quantity: 67, lowStock: false, category: 'Accessories' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <h1 className="text-xl font-bold text-foreground">In Progress</h1>
        </div>
        <Button className="bg-chart-primary hover:bg-chart-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-chart-primary/10 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-chart-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{inventoryItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-metric-users/10 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-metric-users" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Stock</p>
                <p className="text-2xl font-bold">{inventoryItems.reduce((sum, item) => sum + item.quantity, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{inventoryItems.filter(item => item.lowStock).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Item Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">SKU</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Quantity</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventoryItems.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-chart-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-chart-primary" />
                        </div>
                        <span className="font-medium text-foreground">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{item.sku}</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.category}</td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${item.lowStock ? 'text-red-600' : 'text-foreground'}`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={item.lowStock ? 'destructive' : 'default'}>
                        {item.lowStock ? 'Low Stock' : 'In Stock'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Reorder</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;