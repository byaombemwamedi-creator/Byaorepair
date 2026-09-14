// ======================================
// BYAO MOBILE SOLUTIONS - PROFILE MODULE
// ======================================

console.log("PROFILE.JS LOADED");

let currentProfile = null;

async function fetchMyUserProfile() {
    try {
        if (typeof getCurrentUser !== 'function') {
            console.error("getCurrentUser haipatikani bado.");
            return null;
        }

        const user = await getCurrentUser();
        if (!user) {
            console.log("Hakuna user aliyelogin kwa sasa.");
            return null;
        }

        const { data, error } = await window.supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (error) {
            console.error("PROFILE FETCH ERROR:", error.message);
            return null;
        }

        currentProfile = data;
        console.log("MY PROFILE LOADED:", data);
        return data;
    } catch (err) {
        console.error("PROFILE EXCEPTION:", err);
        return null;
    }
}

// Tunatumia jina la kipekee ili kuzuia kugongana na auth.js
window.fetchMyUserProfile = fetchMyUserProfile;
window.getMyProfile = fetchMyUserProfile;
window.getCurrentProfileData = () => currentProfile;

// Compatibility function
async function getMyProfile(){

    return await fetchMyUserProfile();

}

window.getMyProfile = getMyProfile;
