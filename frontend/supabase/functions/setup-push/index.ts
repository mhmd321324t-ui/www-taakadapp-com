import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check if VAPID public key already exists
    const { data: existing } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'vapid_public_key')
      .maybeSingle();

    if (existing?.value) {
      return new Response(JSON.stringify({ publicKey: existing.value }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate new VAPID keys
    const vapidKeys = webpush.generateVAPIDKeys();

    // Store both keys in site_settings
    await supabase.from('site_settings').insert([
      { key: 'vapid_public_key', value: vapidKeys.publicKey },
      { key: 'vapid_private_key', value: vapidKeys.privateKey },
    ]);

    return new Response(JSON.stringify({ publicKey: vapidKeys.publicKey }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('setup-push error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
