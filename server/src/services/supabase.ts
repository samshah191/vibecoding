import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ilroebcnrmryadofbjfc.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlscm9lYmNucm1yeWFkb2ZiamZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODg2NjE5OCwiZXhwIjoyMDc0NDQyMTk4fQ.FPMEQMVpBYz6lVS5hHlKksbdcyUCHzsoWZsGbsYYE-k'

// Create client without type constraints to avoid RLS conflicts for service role operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Service-specific client for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export default supabase