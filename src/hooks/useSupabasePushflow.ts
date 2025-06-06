
import { useState } from 'react';
import { useSupabaseConfig } from './useSupabaseConfig';
import { supabase } from '@/integrations/supabase/client';

export const useSupabasePushflow = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { getConfig } = useSupabaseConfig();

  const testConnection = async (instanceId: string, accessToken: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/functions/v1/pushflow-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceId,
          accessToken,
          action: 'test'
        })
      });

      if (!response.ok) {
        throw new Error('Connection test failed');
      }

      return true;
    } catch (error) {
      console.error('Pushflow connection test failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendSMS = async (phoneNumber: string, message: string, orderId?: string): Promise<void> => {
    setIsLoading(true);
    try {
      const instanceId = getConfig('pushflow_instance_id');
      const accessToken = getConfig('pushflow_access_token');

      if (!instanceId || !accessToken) {
        throw new Error('Pushflow not configured');
      }

      // Log the notification attempt
      const { error: logError } = await supabase
        .from('notification_logs')
        .insert({
          order_id: orderId || null,
          customer_phone: phoneNumber,
          message_text: message,
          status: 'pending'
        });

      if (logError) {
        console.error('Error logging notification:', logError);
      }

      const response = await fetch('/api/functions/v1/pushflow-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceId,
          accessToken,
          action: 'sendSMS',
          data: { phoneNumber, message }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send SMS');
      }

      const result = await response.json();

      // Update the notification log with success
      await supabase
        .from('notification_logs')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          api_response: result
        })
        .eq('customer_phone', phoneNumber)
        .eq('message_text', message)
        .eq('status', 'pending');

    } catch (error) {
      console.error('Error sending SMS:', error);
      
      // Update the notification log with error
      await supabase
        .from('notification_logs')
        .update({
          status: 'failed',
          error_message: error.message
        })
        .eq('customer_phone', phoneNumber)
        .eq('message_text', message)
        .eq('status', 'pending');

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    testConnection,
    sendSMS,
  };
};
