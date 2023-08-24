import { createClient } from '@supabase/supabase-js';

// Note: supabaseAdmin uses the SERVICE_ROLE_KEY which you must only use in a secure server-side context
// as it has admin privileges and overwrites RLS policies!
const supabaseAdmin = createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const checkSubscriptionStatus = async (userId: string) => {
    // Retrieve user information including subscription status and tier
    const { data, error } = await supabaseAdmin
        .from('stripe_subscriptions')
        .select('tier')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching user information:', error);
        return null;
    }

    if (!data) {
        console.error('User not found.');
        return null;
    }

    return {
        tier: data.tier,
    };
};

const manageSubscriptionStatusChange = async (
    subscriptionId: string,
    customerId: string,
    createAction = false,
    customerClientRefId: string | null,
    tier: string | null
) => {
    if (!customerClientRefId || !tier) {
        throw new Error('customerClientRefId and tier must be provided.');
    }

    // Check if the user exists
    // const { data: existingUser } = await supabaseAdmin
    //     .from('users') // Replace 'users' with your actual table name
    //     .select('*')
    //     .eq('user_id', customerClientRefId)
    //     .single();

    // if (!existingUser) {
    //     console.error('User not found.');
    //     return;
    // }

    // User exists, proceed with update
    const { data, error } = await supabaseAdmin
        .from('stripe_subscriptions')
        .upsert([
            {
                id: customerClientRefId,
                tier: tier,
            },
        ]);

    if (error) {
        console.error('Error updating user:', error);
        return;
    }

    console.log('User updated successfully:', data);
};

export {
    checkSubscriptionStatus, manageSubscriptionStatusChange
};

