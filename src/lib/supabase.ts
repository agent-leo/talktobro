import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  name: string;
  phone: string;
  goals?: string;
  experience?: string;
  style?: string;
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  user_id: string;
  stripe_payment_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
};

export type AllowlistEntry = {
  id: string;
  phone: string;
  user_id: string;
  added_at: string;
};