import Stripe from 'stripe';

const STRIPE_SECRET_KEY = "sk_test_51NcYd8FHD0vSmeBw1eRwgIjGEgqTSEJfawpY7Z2tqkPUjbrVDmsbhSEqY3vKooaffetgDYTb8I6ilw1HtxENmSoE00GTcWEtYm";
export const stripe = new Stripe(
    //   process.env.STRIPE_SECRET_KEY_LIVE ?? process.env.STRIPE_SECRET_KEY ?? '',
    STRIPE_SECRET_KEY,
    {
        // https://github.com/stripe/stripe-node#configuration
        //@ts-ignore
        apiVersion: '2022-11-15',
        // Register this as an official Stripe plugin.
        // https://stripe.com/docs/building-plugins#setappinfo
        appInfo: {
            name: 'Next.js Subscription Starter',
            version: '0.1.0'
        }
    }
);