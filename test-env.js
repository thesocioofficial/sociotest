// Simple test script to debug Railway environment variables
console.log("=== ENVIRONMENT VARIABLE TEST ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PWD:", process.env.PWD);
console.log("RAILWAY_ENVIRONMENT:", process.env.RAILWAY_ENVIRONMENT);

console.log("\n=== ALL ENVIRONMENT VARIABLES ===");
const sortedKeys = Object.keys(process.env).sort();
sortedKeys.forEach(key => {
  if (key.includes('SUPABASE') || key.includes('RAILWAY')) {
    console.log(`${key}: ${process.env[key] ? 'SET' : 'UNDEFINED'}`);
  }
});

console.log("\n=== DIRECT SUPABASE ACCESS ===");
console.log("SUPABASE_URL:", process.env.SUPABASE_URL || "NOT FOUND");
console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY || "NOT FOUND");

console.log("\n=== TOTAL ENV COUNT ===");
console.log("Total environment variables:", Object.keys(process.env).length);
