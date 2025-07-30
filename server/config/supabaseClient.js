import { createClient } from "@supabase/supabase-js";

// Railway injects environment variables directly - no need for dotenv in production
// Only use dotenv for local development
if (process.env.NODE_ENV !== 'production') {
  const dotenv = await import("dotenv");
  dotenv.config();
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("=== RAILWAY ENVIRONMENT DEBUG ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("Railway Environment Variables:");
console.log("RAILWAY_ENVIRONMENT:", process.env.RAILWAY_ENVIRONMENT);
console.log("RAILWAY_PROJECT_ID:", process.env.RAILWAY_PROJECT_ID ? "Set" : "Missing");
console.log("All ENV vars starting with SUPABASE:");
Object.keys(process.env)
  .filter(key => key.startsWith('SUPABASE'))
  .forEach(key => console.log(`${key}:`, process.env[key] ? `Set (${process.env[key].substring(0, 20)}...)` : "Missing"));
console.log("=== END DEBUG ===");

console.log("Supabase Client Config:");
console.log("SUPABASE_URL:", supabaseUrl ? "Set" : "Missing");
console.log("SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "Set" : "Missing");

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "CRITICAL: Missing Supabase environment variables (URL or Service Role Key). Exiting."
  );
  console.error("Expected: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default supabase;
