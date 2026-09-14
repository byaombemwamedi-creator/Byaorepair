// ======================================
// BYAO MOBILE SOLUTIONS
// SUPABASE CONNECTION
// ======================================

console.log("SUPABASE.JS START");
console.log(window.supabase);


const SUPABASE_URL = "https://pxwezksplsqeonhkfdyx.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_OkD_t0xXCXzrz8ox0cIZ0w_jYblx4jX";


window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


console.log(
    "SUPABASE CLIENT CREATED:",
    window.supabaseClient
);
