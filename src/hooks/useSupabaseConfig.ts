
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AppConfig {
  [key: string]: string;
}

export const useSupabaseConfig = () => {
  const [config, setConfig] = useState<AppConfig>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value');

      if (error) throw error;
      
      const configObj = data.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as AppConfig);
      
      setConfig(configObj);
    } catch (error) {
      console.error('Error loading config:', error);
      toast({
        title: "Error",
        description: "Failed to load configuration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const saveConfig = async (key: string, value: string, description?: string) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          key,
          value,
          description: description || null
        });

      if (error) throw error;
      
      setConfig(prev => ({ ...prev, [key]: value }));
      toast({
        title: "Success",
        description: "Configuration saved successfully"
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive"
      });
      throw error;
    }
  };

  const getConfig = (key: string): string | null => {
    return config[key] || null;
  };

  return {
    config,
    isLoading,
    saveConfig,
    getConfig,
    refreshConfig: loadConfig
  };
};
