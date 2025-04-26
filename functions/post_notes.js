// POST because we are creating a resource (notes) - standard REST practice.

import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req) => {
  const { title, content } = await req.json();
  const { data, error } = await supabase
    .from("notes")
    .insert([{ title, content, user_id: req.headers.get("x-user-id") }])
    .select();
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});
