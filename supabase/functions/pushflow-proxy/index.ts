
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { instanceId, accessToken, action, data } = await req.json();

    let url = '';
    let method = 'GET';
    let body = null;

    switch (action) {
      case 'test':
        url = `https://api.pushflow.com/v1/instances/${instanceId}/test`;
        break;
      case 'sendSMS':
        url = `https://api.pushflow.com/v1/instances/${instanceId}/messages`;
        method = 'POST';
        body = JSON.stringify({
          to: data.phoneNumber,
          message: data.message
        });
        break;
      default:
        throw new Error('Invalid action');
    }

    console.log(`Making Pushflow API request: ${action} to ${url}`);
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`Pushflow API error: ${response.status} ${response.statusText}`);
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in pushflow-proxy function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
