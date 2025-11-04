import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2025-08-27.basil', //update the stripe api version
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PRICE_TO_TIER: Record<string, string> = {
  'price_1S5umL93V4MxVtg8ofpuszEl': 'Weekly',
  'price_1S5umg93V4MxVtg8OZ7fGzOi': 'Monthly',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Stripe webhook received');
    
    // Verify webhook signature
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    
    if (!signature) {
      console.error('No stripe signature found');
      return new Response('No signature', { status: 400 });
    }

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return new Response('Webhook secret not configured', { status: 500 });
    }

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret,
        undefined,
        cryptoProvider
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Invalid signature', { status: 400 });
    }

    console.log('Event type:', event.type);

    // Import Supabase client
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Checkout session completed:', session.id);

      const userId = session.metadata?.user_id;
      const customerId = session.customer as string;

      if (!userId) {
        console.error('No user_id in session metadata');
        return new Response('No user_id', { status: 400 });
      }

      // Get the subscription details
      const subscriptionId = session.subscription as string;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      // Get the price ID from the subscription
      const priceId = subscription.items.data[0]?.price.id;
      const tier = PRICE_TO_TIER[priceId] || 'Unknown';
      
      console.log(`Updating user ${userId} to ${tier} tier (price: ${priceId})`);

      // Calculate subscription end date
      const currentPeriodEndUnix =
        subscription.current_period_end ??
        subscription.items?.data?.[0]?.current_period_end;

      if (!currentPeriodEndUnix) {
        console.error('Missing current_period_end in subscription payload:', subscription);
        throw new Error('Missing current_period_end');
      }

      const currentPeriodEnd = new Date(currentPeriodEndUnix * 1000);

      // Update subscriber record
      const { error: updateError } = await supabase
        .from('subscribers')
        .upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          subscribed: true,
          subscription_tier: tier,
          subscription_end: currentPeriodEnd.toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (updateError) {
        console.error('Error updating subscriber:', updateError);
        throw updateError;
      }

      console.log('Subscriber updated successfully');
    }

    // Handle subscription updates
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('Subscription updated:', subscription.id);

      const customerId = subscription.customer as string;
      const priceId = subscription.items.data[0]?.price.id;
      const tier = PRICE_TO_TIER[priceId] || 'Unknown';
      const currentPeriodEndUnix =
        subscription.current_period_end ??
        subscription.items?.data?.[0]?.current_period_end;

      if (!currentPeriodEndUnix) {
        console.error('Missing current_period_end:', subscription);
        return new Response('Missing current_period_end', { status: 400 });
      }

      const currentPeriodEnd = new Date(currentPeriodEndUnix * 1000);

      const { error: updateError } = await supabase
        .from('subscribers')
        .update({
          subscribed: subscription.status === 'active',
          subscription_tier: tier,
          subscription_end: currentPeriodEnd.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_customer_id', customerId);

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        throw updateError;
      }

      console.log('Subscription updated successfully');
    }

    // Handle subscription deletions/cancellations
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('Subscription cancelled:', subscription.id);

      const customerId = subscription.customer as string;

      const { error: updateError } = await supabase
        .from('subscribers')
        .update({
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_customer_id', customerId);

      if (updateError) {
        console.error('Error cancelling subscription:', updateError);
        throw updateError;
      }

      console.log('Subscription cancelled successfully');
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
