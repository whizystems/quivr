import axios from 'axios';
import { headers } from 'next/headers';
import Stripe from 'stripe';

import { stripe } from '@/utils/stripe';
import { manageSubscriptionStatusChange } from '@/utils/supabase-admin';


type ResonseDataType = {
  object: string,
  url: string,
  has_more: boolean,
  data: Stripe.Price[]
};


const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted'
]);

const fetchPrices = async () => {
  const productId = "prod_OSa6dl1TrAY0H6";
  try {
    const response = await axios.get('https://api.stripe.com/v1/prices', {
      headers: {
        Authorization: `Bearer `,
      },
      params: {
        product: productId,
      },
    });

    return (response.data as ResonseDataType).data;
  } catch (error) {
    console.error('Error fetching prices:', error);

    return [];
  }
};

const findMatchingTier = async (checkoutPrice: number) => {
  const prices = await fetchPrices();

  const matchingPrice = prices.find((price: Stripe.Price) => price.unit_amount === checkoutPrice);

  if (matchingPrice) {
    return matchingPrice.metadata.tier;
  } else {
    return "Unknown Tier";
  }
};

export const POST = async (req: Request): Promise<Response> => {
  const body = await req.text();
  const sig = headers().get('Stripe-Signature') as string;
  const webhookSecret = ""; //process.env.STRIPE_WEBHOOK_SECRET;

  if (sig === "") {
    return new Response('', { status: 400 });
  }

  // if (!webhookSecret) {
  //   return new Response('', { status: 400 });
  // }

  const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === 'customer.subscription.created',
            null,
            null
          );
          break;
        }
        case 'checkout.session.completed': {
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          const tier = await findMatchingTier(checkoutSession.amount_total!);

          if (checkoutSession.mode === 'subscription') {
            const subscriptionId = checkoutSession.subscription;
            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true,
              checkoutSession.client_reference_id,
              tier
            );
          }
          break;
        }
        default:
          throw new Error('Unhandled relevant event!');
      }
    } catch (error) {
      console.log(error);

      return new Response('Webhook handler failed. View your nextjs function logs.', {
        status: 400
      });
    }
  }

  return new Response(JSON.stringify({ received: true }));
};
