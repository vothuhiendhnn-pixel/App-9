import { createClient } from '@supabase/supabase-js';

/**
 * JURY DEMO ONLY – deliberately refuses production Supabase configuration.
 * This file exists only on branch demo-giam-khao-2026.
 *
 * Vercel DEMO project must define:
 *   VITE_DEMO_MODE=true
 *   VITE_DEMO_SUPABASE_URL=https://<separate-demo-project>.supabase.co
 *   VITE_DEMO_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
 *
 * There is intentionally NO fallback to the production VITE_SUPABASE_* vars.
 */
const demoEnabled = import.meta.env.VITE_DEMO_MODE === 'true';
const supabaseUrl = String(import.meta.env.VITE_DEMO_SUPABASE_URL ?? '').trim();
const supabasePublishableKey = String(
  import.meta.env.VITE_DEMO_SUPABASE_PUBLISHABLE_KEY ?? ''
).trim();

const PRODUCTION_PROJECT_REF = 'jwfztukqbiamucrecuhf';
const isSupabaseHost = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(supabaseUrl);
const pointsAtProduction = supabaseUrl.includes(PRODUCTION_PROJECT_REF);

if (!demoEnabled || !isSupabaseHost || !supabasePublishableKey || pointsAtProduction) {
  throw new Error(
    'DEMO configuration is missing or unsafe. ' +
    'Use only a separate Supabase project with VITE_DEMO_* environment variables. ' +
    'Production data is intentionally blocked.'
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
