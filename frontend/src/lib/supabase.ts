import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

let restrictedUntil = 0;
const quotaAwareFetch: typeof fetch = async (input, init) => {
  if (restrictedUntil > Date.now()) {
    return new Response(JSON.stringify({ message: "Project temporarily restricted", code: "EGRESS_RESTRICTED" }), {
      status: 402, headers: { "Content-Type": "application/json" }
    });
  }
  const response = await fetch(input, init);
  if (response.status === 402) restrictedUntil = Date.now() + 5 * 60 * 1000;
  return response;
};

export const supabase = supabaseUrl
  ? createClient(supabaseUrl, supabaseAnonKey, { global: { fetch: quotaAwareFetch } })
  : null;
