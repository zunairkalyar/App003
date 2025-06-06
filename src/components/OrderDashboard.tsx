
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Search, Send, Package, Clock, CheckCircle, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWooCommerce } from '@/hooks/useWooCommerce';
import { usePushflow } from '@/hooks/usePushflow';
import { useMessageTemplates } from '@/hooks/useMessageTemplates';

interface Order {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
  billing: {
    first_name: string;
    last_name: string;
    phone: string;
  };
  line_items: Array<{
    name: string;
    quantity: number;
  }>;
}

const OrderDashboard = () => {
  const { toast } = useToast();
  const { fetchOrders, updateOrderStatus, isLoading } = useWooCommerce();
  const { sendSMS } = usePushflow();
  const { getTemplateForStatus, templates } = useMessageTemplates();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const statusConfig = {
    pending: { label: 'Pending', icon: Clock, color: 'bg-orange-500', variant: 'secondary' as const },
    processing: { label: 'Processing', icon: Package, color: 'bg-blue-500', variant: 'default' as const },
    'on-hold': { label: 'On Hold', icon: Clock, color: 'bg-yellow-500', variant: 'secondary' as const },
    completed: { label: 'Completed', icon: CheckCircle, color: 'bg-green-500', variant: 'default' as const },
    cancelled: { label: 'Cancelled', icon: Clock, color: 'bg-red-500', variant: 'destructive' as const },
    refunded: { label: 'Refunded', icon: Clock, color: 'bg-gray-500', variant: 'secondary' as const },
    failed: { label: 'Failed', icon: Clock, color: 'bg-red-500', variant: 'destructive' as const },
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter, searchTerm]);

  const loadOrders = async () => {
    try {
      const fetchedOrders = await fetchOrders();
      setOrders(fetchedOrders);
    } catch (error) {
      toast({
        title: "Error Loading Orders",
        description: "Failed to fetch orders. Using mock data for demonstration.",
        variant: "destructive",
      });
      // Set mock data for demonstration
      setOrders(getMockOrders());
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${order.billing.first_name} ${order.billing.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      // Send SMS notification if template exists and phone number is available
      const order = orders.find(o => o.id === orderId);
      if (order && order.billing.phone) {
        const template = getTemplateForStatus(newStatus);
        if (template) {
          const message = template.content
            .replace('{customer_name}', `${order.billing.first_name} ${order.billing.last_name}`)
            .replace('{order_id}', order.number)
            .replace('{order_total}', order.total);

          await sendSMS(order.billing.phone, message);
          
          toast({
            title: "Status Updated",
            description: `Order ${order.number} status changed to ${newStatus}. SMS notification sent.`,
          });
        } else {
          toast({
            title: "Status Updated",
            description: `Order ${order.number} status changed to ${newStatus}.`,
          });
        }
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getMockOrders = (): Order[] => [
    {
      id: 123,
      number: "123",
      status: "processing",
      date_created: "2024-01-15T10:30:00",
      total: "$99.99",
      billing: {
        first_name: "John",
        last_name: "Doe",
        phone: "+1234567890"
      },
      line_items: [
        { name: "Wireless Headphones", quantity: 1 }
      ]
    },
    {
      id: 124,
      number: "124",
      status: "pending",
      date_created: "2024-01-15T14:20:00",
      total: "$149.99",
      billing: {
        first_name: "Jane",
        last_name: "Smith",
        phone: "+1987654321"
      },
      line_items: [
        { name: "Bluetooth Speaker", quantity: 2 }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>
                Manage your WooCommerce orders and send automated SMS notifications
              </CardDescription>
            </div>
            <Button onClick={loadOrders} disabled={isLoading} variant="outline" className="gap-2">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {orders.length === 0 ? "No orders found" : "No orders match your filters"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const statusInfo = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
            const StatusIcon = statusInfo.icon;
            
            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">Order #{order.number}</h3>
                        <Badge variant={statusInfo.variant} className="gap-1">
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div>
                          <strong>Customer:</strong> {`${order.billing.first_name} ${order.billing.last_name}`}
                        </div>
                        <div>
                          <strong>Total:</strong> {order.total}
                        </div>
                        <div>
                          <strong>Date:</strong> {new Date(order.date_created).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <strong>Items:</strong> {order.line_items.map(item => 
                          `${item.name} (${item.quantity})`
                        ).join(', ')}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Select value={order.status} onValueChange={(value) => handleStatusChange(order.id, value)}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Status Summary */}
      {orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(statusConfig).map(([status, config]) => {
                const count = orders.filter(order => order.status === status).length;
                if (count === 0) return null;
                
                const StatusIcon = config.icon;
                return (
                  <div key={status} className="flex items-center gap-2 p-3 rounded-lg border">
                    <div className={`w-3 h-3 rounded-full ${config.color}`} />
                    <span className="text-sm font-medium">{config.label}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderDashboard;
