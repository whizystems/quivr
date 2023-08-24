"use client";
import { useTranslation } from "react-i18next";

import { useSupabase } from "@/lib/context/SupabaseProvider";

import { usePricing } from "./hooks/usePricing";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const PricingPage = () => {
  const { t } = useTranslation(["translation", "explore"]);
  const { session } = useSupabase();
  const { subscriptionStatus } = usePricing();

  console.log(subscriptionStatus);


  return (
    <main>
      <section className="w-full outline-none pt-10 flex flex-col gap-5 items-center justify-center p-6">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold text-center">
            {t("title", { ns: "explore" })}
          </h1>
          <h2 className="opacity-50">
            {t("subtitle", { ns: "explore" })}
          </h2>
        </div>
        <h1>Pricing</h1>
        <h2>Your current tier {subscriptionStatus == null ? 'None' : subscriptionStatus.tier}</h2>
      </section>
      <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
      {/* @ts-ignore: This ignore comment should be accompanied by an explanation */}
      <stripe-pricing-table
        pricing-table-id={process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID || ''}
        publishable-key={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}
        client-reference-id={session?.user.id}
      >
        {/* @ts-ignore: This ignore comment should be accompanied by an explanation */}
      </stripe-pricing-table>
    </main>
  );
};

export default PricingPage;
