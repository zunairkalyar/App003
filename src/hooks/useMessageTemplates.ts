
import { useState, useEffect } from 'react';

interface MessageTemplate {
  name: string;
  content: string;
}

interface MessageTemplates {
  [status: string]: MessageTemplate;
}

export const useMessageTemplates = () => {
  const [templates, setTemplates] = useState<MessageTemplates>({});

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    try {
      const saved = localStorage.getItem('message_templates');
      if (saved) {
        const parsedTemplates = JSON.parse(saved);
        setTemplates(parsedTemplates);
      } else {
        // Set default templates
        const defaultTemplates: MessageTemplates = {
          pending: {
            name: "Payment Pending",
            content: "Hi {customer_name}, thank you for your order {order_id}! We're waiting for your payment of {order_total}. Please complete payment to process your order."
          },
          processing: {
            name: "Order Processing",
            content: "Great news {customer_name}! Your order {order_id} for {order_total} is now being processed. We'll update you once it ships."
          },
          completed: {
            name: "Order Completed",
            content: "Hello {customer_name}, your order {order_id} has been completed! Thank you for shopping with us."
          }
        };
        setTemplates(defaultTemplates);
        localStorage.setItem('message_templates', JSON.stringify(defaultTemplates));
      }
    } catch (error) {
      console.error('Error loading message templates:', error);
    }
  };

  const saveTemplate = (status: string, template: MessageTemplate) => {
    try {
      const updatedTemplates = {
        ...templates,
        [status]: template
      };
      setTemplates(updatedTemplates);
      localStorage.setItem('message_templates', JSON.stringify(updatedTemplates));
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  };

  const deleteTemplate = (status: string) => {
    try {
      const updatedTemplates = { ...templates };
      delete updatedTemplates[status];
      setTemplates(updatedTemplates);
      localStorage.setItem('message_templates', JSON.stringify(updatedTemplates));
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  };

  const getTemplateForStatus = (status: string): MessageTemplate | null => {
    return templates[status] || null;
  };

  return {
    templates,
    saveTemplate,
    deleteTemplate,
    getTemplateForStatus,
  };
};
