
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, TestTube, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePushflow } from '@/hooks/usePushflow';

interface PushflowConfigProps {
  onConfigUpdate: () => void;
}

const PushflowConfig = ({ onConfigUpdate }: PushflowConfigProps) => {
  const { toast } = useToast();
  const { testConnection, isLoading } = usePushflow();
  const [showSecrets, setShowSecrets] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    instanceId: '',
    accessToken: '',
    simulationMode: false,
  });

  useEffect(() => {
    // Load saved configuration
    const savedConfig = localStorage.getItem('pushflow_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setFormData(config);
        setConnectionStatus('success');
      } catch (error) {
        console.error('Error loading Pushflow config:', error);
      }
    }
  }, []);

  const handleSave = () => {
    if (!formData.instanceId || !formData.accessToken) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      localStorage.setItem('pushflow_config', JSON.stringify(formData));
      onConfigUpdate();
      toast({
        title: "Configuration Saved",
        description: "Pushflow settings have been saved successfully.",
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
    if (!formData.instanceId || !formData.accessToken) {
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
          description: formData.simulationMode 
            ? "Simulation mode is active - messages will be logged to console."
            : "Successfully connected to Pushflow SMS service.",
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: "Connection Failed",
          description: "Unable to connect to Pushflow. Please check your credentials.",
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
              <MessageSquare className="w-5 h-5" />
              Pushflow SMS Configuration
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
              Configure your Pushflow credentials to send SMS notifications to customers.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You can find your Instance ID and Access Token in your Pushflow dashboard under API settings.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="instance-id">Instance ID *</Label>
            <Input
              id="instance-id"
              placeholder="your-instance-id"
              value={formData.instanceId}
              onChange={(e) => setFormData({ ...formData, instanceId: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="access-token">Access Token *</Label>
            <div className="relative">
              <Input
                id="access-token"
                type={showSecrets ? "text" : "password"}
                placeholder="your-access-token"
                value={formData.accessToken}
                onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
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

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="simulation-mode" className="text-sm font-medium">
                Simulation Mode
              </Label>
              <p className="text-xs text-muted-foreground">
                When enabled, SMS messages will be logged to console instead of being sent.
              </p>
            </div>
            <Switch
              id="simulation-mode"
              checked={formData.simulationMode}
              onCheckedChange={(checked) => setFormData({ ...formData, simulationMode: checked })}
            />
          </div>

          {formData.simulationMode && (
            <Alert>
              <MessageSquare className="h-4 w-4" />
              <AlertDescription>
                Simulation mode is active. SMS messages will be logged to the browser console for testing.
              </AlertDescription>
            </Alert>
          )}
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

export default PushflowConfig;
