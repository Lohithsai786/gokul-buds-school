'use client';

import { createClient } from '@/lib/supabase';

export interface CreateAccountParams {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'teacher' | 'parent';
  phone?: string | null;
}

export interface CreateAccountResult {
  userId: string;
  email: string;
  full_name: string;
  role: 'admin' | 'teacher' | 'parent';
  message: string;
}

/**
 * Calls the create-user-account edge function (admin-only) to create a new
 * auth user + public.users profile with login credentials.
 */
export async function createUserAccount(
  params: CreateAccountParams
): Promise<CreateAccountResult> {
  const supabase = createClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  if (!accessToken) {
    throw new Error('Not authenticated. Please log in again.');
  }

  const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-user-account`;

  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    },
    body: JSON.stringify(params),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = (data as { error?: string })?.error ?? `Request failed (${response.status})`;
    throw new Error(message);
  }

  if (!data || !(data as CreateAccountResult).userId) {
    throw new Error('Unexpected response from account creation service.');
  }

  return data as CreateAccountResult;
}

/**
 * Calls the delete-user-account edge function (admin-only) to remove an auth user.
 */
export async function deleteUserAccount(userId: string): Promise<void> {
  const supabase = createClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  if (!accessToken) {
    throw new Error('Not authenticated. Please log in again.');
  }

  const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/delete-user-account`;

  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    },
    body: JSON.stringify({ userId }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = (data as { error?: string })?.error ?? `Request failed (${response.status})`;
    throw new Error(message);
  }
}
