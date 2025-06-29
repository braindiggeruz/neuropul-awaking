import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const signature = req.headers.get('stripe-signature')
    const body = await req.text()
    
    if (!signature) {
      throw new Error('No Stripe signature found')
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    )

    console.log('Processing Stripe event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const { tg_id, subscription_tier } = session.metadata

        // Update user subscription
        const { error } = await supabase
          .from('users')
          .update({
            subscription_status: 'premium',
            subscription_tier,
            subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            stripe_customer_id: session.customer
          })
          .eq('tg_id', tg_id)

        if (error) throw error

        // Record payment
        await supabase
          .from('payments')
          .insert({
            user_id: (await supabase.from('users').select('id').eq('tg_id', tg_id).single()).data?.id,
            stripe_payment_id: session.payment_intent,
            amount: session.amount_total / 100,
            currency: session.currency,
            type: 'subscription',
            status: 'completed',
            metadata: { subscription_tier },
            processed_at: new Date().toISOString()
          })

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        
        // Downgrade user to free
        await supabase
          .from('users')
          .update({
            subscription_status: 'free',
            subscription_tier: 'none',
            subscription_expires_at: null
          })
          .eq('stripe_customer_id', subscription.customer)

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any
        
        if (invoice.subscription) {
          // Extend subscription
          await supabase
            .from('users')
            .update({
              subscription_expires_at: new Date(invoice.period_end * 1000).toISOString()
            })
            .eq('stripe_customer_id', invoice.customer)
        }

        break
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})