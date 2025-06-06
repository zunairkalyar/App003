
import { useState } from 'react';

interface WooConfig {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

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

export const useWooCommerce = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getConfig = (): WooConfig | null => {
    try {
      const config = localStorage.getItem('woocommerce_config');
      return config ? JSON.parse(config) : null;
    } catch (error) {
      console.error('Error loading WooCommerce config:', error);
      return null;
    }
  };

  const testConnection = async (config: WooConfig): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call
      console.log('Testing WooCommerce connection with:', { ...config, consumerSecret: '***' });
      
      // In a real implementation, you would make an actual API call here
      // const response = await fetch(`${config.url}/wp-json/wc/v3/orders?per_page=1`, {
      //   headers: {
      //     'Authorization': `Basic ${btoa(`${config.consumerKey}:${config.consumerSecret}`)}`
      //   }
      // });
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success (in real app, check response.ok)
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
      const config = getConfig();
      if (!config) {
        throw new Error('WooCommerce not configured');
      }

      console.log('Fetching orders from WooCommerce...');
      
      // In a real implementation, you would make an actual API call here
      // const response = await fetch(`${config.url}/wp-json/wc/v3/orders`, {
      //   headers: {
      //     'Authorization': `Basic ${btoa(`${config.consumerKey}:${config.consumerSecret}`)}`
      //   }
      // });
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return mock data for demonstration
      const mockOrders: Order[] = [
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
        },
        {
          id: 125,
          number: "125",
          status: "completed",
          date_created: "2024-01-14T09:15:00",
          total: "$249.99",
          billing: {
            first_name: "Mike",
            last_name: "Johnson",
            phone: "+1122334455"
          },
          line_items: [
            { name: "Smart Watch", quantity: 1 }
          ]
        }
      ];
      
      return mockOrders;
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
      const config = getConfig();
      if (!config) {
        throw new Error('WooCommerce not configured');
      }

      console.log(`Updating order ${orderId} status to ${newStatus}`);
      
      // In a real implementation, you would make an actual API call here
      // const response = await fetch(`${config.url}/wp-json/wc/v3/orders/${orderId}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Basic ${btoa(`${config.consumerKey}:${config.consumerSecret}`)}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ status: newStatus })
      // });
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`Order ${orderId} status updated to ${newStatus}`);
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
