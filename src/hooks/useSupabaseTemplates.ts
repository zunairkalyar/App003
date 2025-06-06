
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MessageTemplate {
  id?: string;
  name: string;
  status: string;
  template_text: string;
  is_active?: boolean;
}

export const useSupabaseTemplates = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Failed to load message templates",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const saveTemplate = async (template: MessageTemplate) => {
    try {
      const { error } = await supabase
        .from('message_templates')
        .upsert({
          id: template.id,
          name: template.name,
          status: template.status,
          template_text: template.template_text,
          is_active: true
        });

      if (error) throw error;
      
      await loadTemplates();
      toast({
        title: "Success",
        description: "Template saved successfully"
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('message_templates')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      await loadTemplates();
      toast({
        title: "Success",
        description: "Template deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    templates,
    isLoading,
    saveTemplate,
    deleteTemplate,
    refreshTemplates: loadTemplates
  };
};
