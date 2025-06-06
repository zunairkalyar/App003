
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, MessageSquare, Settings, ShoppingCart } from 'lucide-react';
import WooCommerceConfig from '@/components/WooCommerceConfig';
import PushflowConfig from '@/components/PushflowConfig';
import OrderDashboard from '@/components/OrderDashboard';
import MessageTemplates from '@/components/MessageTemplates';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Check if basic configuration exists
    const wooConfig = localStorage.getItem('woocommerce_config');
    const pushflowConfig = localStorage.getItem('pushflow_config');
    
    if (wooConfig && pushflowConfig) {
      setIsConfigured(true);
    }
  }, []);

  const handleConfigurationUpdate = () => {
    const wooConfig = localStorage.getItem('woocommerce_config');
    const pushflowConfig = localStorage.getItem('pushflow_config');
    
    if (wooConfig && pushflowConfig) {
      setIsConfigured(true);
      toast({
        title: "Configuration Updated",
        description: "Your settings have been saved successfully.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                WooCommerce Order Manager
              </h1>
              <p className="text-muted-foreground">
                Streamline your order management with automated SMS notifications
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge variant={isConfigured ? "default" : "secondary"} className="gap-1">
              <div className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-orange-500'}`} />
              {isConfigured ? 'Configured' : 'Configuration Required'}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="dashboard" className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="woocommerce" className="gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">WooCommerce</span>
            </TabsTrigger>
            <TabsTrigger value="pushflow" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Pushflow</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {!isConfigured ? (
              <Card>
                <CardHeader>
                  <CardTitle>Configuration Required</CardTitle>
                  <CardDescription>
                    Please configure your WooCommerce and Pushflow settings before managing orders.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <OrderDashboard />
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <MessageTemplates />
          </TabsContent>

          <TabsContent value="woocommerce" className="space-y-6">
            <WooCommerceConfig onConfigUpdate={handleConfigurationUpdate} />
          </TabsContent>

          <TabsContent value="pushflow" className="space-y-6">
            <PushflowConfig onConfigUpdate={handleConfigurationUpdate} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
