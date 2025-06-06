
import { useState } from 'react';
import { useSupabaseConfig } from './useSupabaseConfig';

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

export const useSupabaseWooCommerce = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { getConfig } = useSupabaseConfig();

  const testConnection = async (url: string, consumerKey: string, consumerSecret: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/functions/v1/woocommerce-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: `${url}/wp-json/wc/v3/orders?per_page=1`,
          consumerKey,
          consumerSecret,
          method: 'GET'
        })
      });

      if (!response.ok) {
        throw new Error('Connection test failed');
      }

      return true;
    } catch (error) {
      console.error('WooCommerce connection test failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async (): Promise<Order[]> => {
    setIsLoading(true);
    try {
      const url = getConfig('woocommerce_url');
      const consumerKey = getConfig('woocommerce_consumer_key');
      const consumerSecret = getConfig('woocommerce_consumer_secret');

      if (!url || !consumerKey || !consumerSecret) {
        throw new Error('WooCommerce not configured');
      }

      const response = await fetch('/api/functions/v1/woocommerce-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: `${url}/wp-json/wc/v3/orders`,
          consumerKey,
          consumerSecret,
          method: 'GET'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const orders = await response.json();
      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string): Promise<void> => {
    setIsLoading(true);
    try {
      const url = getConfig('woocommerce_url');
      const consumerKey = getConfig('woocommerce_consumer_key');
      const consumerSecret = getConfig('woocommerce_consumer_secret');

      if (!url || !consumerKey || !consumerSecret) {
        throw new Error('WooCommerce not configured');
      }

      const response = await fetch('/api/functions/v1/woocommerce-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: `${url}/wp-json/wc/v3/orders/${orderId}`,
          consumerKey,
          consumerSecret,
          method: 'PUT',
          data: { status: newStatus }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    testConnection,
    fetchOrders,
    updateOrderStatus,
  };
};
