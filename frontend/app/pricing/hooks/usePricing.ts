import { useEffect, useState } from "react";

import { useSupabase } from "@/lib/context/SupabaseProvider";
import { useAxios } from "@/lib/hooks";
import { checkSubscriptionStatus } from "@/utils/supabase-admin";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const usePricing = () => {
  const { session } = useSupabase();
  const { axiosInstance } = useAxios();
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    tier: string;
  } | null>(null);


  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (session !== null) {
        const status = await checkSubscriptionStatus(session.user.id);
        setSubscriptionStatus(status);
      }
    };
    void fetchSubscriptionStatus();
  }, [session?.access_token, axiosInstance]);

  return {
    subscriptionStatus,
  };
};
