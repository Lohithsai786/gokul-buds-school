import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CreateAccountPayload {
  email: string;
  password: string;
  full_name: string;
  role: "admin" | "teacher" | "parent";
  phone?: string | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return new Response(JSON.stringify({ error: "Missing authorization token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate the caller's session with a anon-key client (uses caller's token).
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: callerAuth, error: callerAuthError } = await callerClient.auth.getUser();
    if (callerAuthError || !callerAuth.user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerUserId = callerAuth.user.id;

    // Confirm the caller is an admin in the public.users table.
    const { data: callerProfile, error: profileError } = await callerClient
      .from("users")
      .select("role")
      .eq("id", callerUserId)
      .maybeSingle();

    if (profileError || !callerProfile || callerProfile.role !== "admin") {
      return new Response(JSON.stringify({ error: "Unauthorized — admin privileges required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse payload.
    const body = (await req.json()) as CreateAccountPayload;
    const { email, password, full_name, role, phone } = body;

    if (!email || !password || !full_name || !role) {
      return new Response(JSON.stringify({ error: "Missing required fields: email, password, full_name, role" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!["admin", "teacher", "parent"].includes(role)) {
      return new Response(JSON.stringify({ error: "Invalid role" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (password.length < 6) {
      return new Response(JSON.stringify({ error: "Password must be at least 6 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use the service-role client to create the auth user (bypasses RLS).
    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: newUser, error: createError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role },
    });

    if (createError || !newUser.user) {
      return new Response(JSON.stringify({ error: createError?.message ?? "Failed to create auth user" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newUserId = newUser.user.id;

    // Insert the public.users profile row as the service role.
    const { error: profileInsertError } = await serviceClient.from("users").insert({
      id: newUserId,
      email,
      full_name,
      role,
      phone: phone ?? null,
    });

    if (profileInsertError) {
      // Best-effort rollback of the auth user.
      await serviceClient.auth.admin.deleteUser(newUserId);
      return new Response(JSON.stringify({ error: `Failed to create profile: ${profileInsertError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ userId: newUserId, email, full_name, role, message: "Account created successfully" }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
