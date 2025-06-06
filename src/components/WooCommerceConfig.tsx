
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, TestTube, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWooCommerce } from '@/hooks/useWooCommerce';

interface WooCommerceConfigProps {
  onConfigUpdate: () => void;
}

const WooCommerceConfig = ({ onConfigUpdate }: WooCommerceConfigProps) => {
  const { toast } = useToast();
  const { testConnection, isLoading } = useWooCommerce();
  const [showSecrets, setShowSecrets] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    url: '',
    consumerKey: '',
    consumerSecret: '',
  });

  useEffect(() => {
    // Load saved configuration
    const savedConfig = localStorage.getItem('woocommerce_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setFormData(config);
        setConnectionStatus('success');
      } catch (error) {
        console.error('Error loading WooCommerce config:', error);
      }
    }
  }, []);

  const handleSave = () => {
    if (!formData.url || !formData.consumerKey || !formData.consumerSecret) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      localStorage.setItem('woocommerce_config', JSON.stringify(formData));
      onConfigUpdate();
      toast({
        title: "Configuration Saved",
        description: "WooCommerce settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTest = async () => {
    if (!formData.url || !formData.consumerKey || !formData.consumerSecret) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before testing.",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await testConnection(formData);
      if (success) {
        setConnectionStatus('success');
        toast({
          title: "Connection Successful",
          description: "Successfully connected to your WooCommerce store.",
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: "Connection Failed",
          description: "Unable to connect to WooCommerce. Please check your credentials.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Test Failed",
        description: "Error testing connection. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              WooCommerce Configuration
              {connectionStatus === 'success' && (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Connected
                </Badge>
              )}
              {connectionStatus === 'error' && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Error
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Configure your WooCommerce store API credentials to fetch and manage orders.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You'll need to create API keys in your WooCommerce dashboard under WooCommerce → Settings → Advanced → REST API.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="woo-url">Store URL *</Label>
            <Input
              id="woo-url"
              placeholder="https://yourstore.com"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consumer-key">Consumer Key *</Label>
            <Input
              id="consumer-key"
              type={showSecrets ? "text" : "password"}
              placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={formData.consumerKey}
              onChange={(e) => setFormData({ ...formData, consumerKey: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consumer-secret">Consumer Secret *</Label>
            <div className="relative">
              <Input
                id="consumer-secret"
                type={showSecrets ? "text" : "password"}
                placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={formData.consumerSecret}
                onChange={(e) => setFormData({ ...formData, consumerSecret: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowSecrets(!showSecrets)}
              >
                {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSave} className="flex-1">
            Save Configuration
          </Button>
          <Button 
            variant="outline" 
            onClick={handleTest}
            disabled={isLoading}
            className="gap-2"
          >
            <TestTube className="w-4 h-4" />
            {isLoading ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WooCommerceConfig;
