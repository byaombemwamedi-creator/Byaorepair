window.getMyProfile = async function(){

    if(!window.fetchMyUserProfile){
        console.error("fetchMyUserProfile bado haipo");
        return null;
    }

    return await window.fetchMyUserProfile();

};

// ======================================
// BYAO MOBILE SOLUTIONS
// AUTH SYSTEM V3 - OPTIMIZED & SECURE
// ======================================

console.log("AUTH.JS V3 LOADED SUCCESSFULLY");

// ======================================
// GET CURRENT SESSION USER
// ======================================
async function getCurrentUser() {
    try {

        if (!window.supabaseClient) {
            console.error("Supabase client haipatikani!");
            return null;
        }


        const { data, error } = await window.supabaseClient
            .auth
            .getUser();



        if (error || !data.user) {

            console.log(
                "Hakuna user aliyepo kwenye session:",
                error?.message
            );

            return null;
        }


        return data.user;


    } catch (err) {

        console.error(
            "GET USER ERROR:",
            err
        );

        return null;
    }
}

// ======================================
// LOGIN USER
// ======================================
async function loginUser(email, password) {
    try {
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email: email.trim(),
            password: password.trim()
        });

        if (error) {
            console.error("LOGIN ERROR:", error.message);
            return { success: false, message: error.message };
        }

        console.log("LOGIN SUCCESS:", data.user.email);
        return { success: true, user: data.user };
    } catch (err) {
        return { success: false, message: err.message };
    }
}


// ======================================
// HANDLE LOGIN FORM (Main Flow)
// ======================================
async function handleLogin(event) {
    event.preventDefault();

    const emailInput = document.getElementById("userEmail");
    const passwordInput = document.getElementById("userPassword");
    const errorBox = document.getElementById("errorMsgText");
    const errorBanner = document.getElementById("errorCodeBanner");

    if (!emailInput || !passwordInput) {
        console.error("Sehemu za kujaza email au password hazionekani kwenye HTML.");
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (errorBanner) errorBanner.classList.add("hidden");

    try {
        console.log("Inajaribu kuingiza mtumiaji...");
        const login = await loginUser(email, password);

        if (!login.success) {
            throw new Error(login.message);
        }

        const profile = await window.fetchMyUserProfile();

if (!profile) {
    throw new Error(
        "Profile haijapatikana kwenye mfumo. Wasiliana na Admin."
    );
}
        console.log("ROLE YA MTUMIAJI:", profile.role);

        // Angalia hali ya akaunti kwa uangalifu (Kama nguzo zipo kwenye DB)
        const status = profile.account_status || profile.status;
        if (status === "pending") {
            await logoutUser();
            throw new Error("Account bado haijaidhinishwa na uongozi.");
        }

        if (status === "suspended" || profile.is_active === false) {
            await logoutUser();
            throw new Error("Account hii imefungwa au kusimamishwa.");
        }

        // Hifadhi kwenye Cache
        saveToCache("byao_user_session", profile);

        // Elekeza mtumiaji kulingana na Role yake
        const role = (profile.role || "").toLowerCase().trim();
        console.log("Inaelekeza kwenye ukurasa wa role:", role);

        setTimeout(() => {
            switch (role) {
                case "admin":
                case "master_admin":
                    window.location.href = "admin.html";
                    break;
                case "technician":
                case "fundi":
                    window.location.href = "fundi.html";
                    break;
                case "merchant":
                case "mfanyabiashara":
                    window.location.href = "mfanyabiashara.html";
                    break;
                case "client":
                case "mteja":
                    window.location.href = "mteja.html";
                    break;
                case "assistant":
                    window.location.href = "assistant.html";
                    break;
                default:
                    window.location.href = "index.html";
            }
        }, 800);

    } catch (err) {
        console.error("LOGIN FLOW ERROR:", err.message);
        if (errorBox) errorBox.innerText = err.message;
        if (errorBanner) errorBanner.classList.remove("hidden");
    }
}

// ======================================
// LOGOUT & HELPERS
// ======================================
async function logoutUser() {
    try {
        await window.supabaseClient.auth.signOut();
        localStorage.removeItem("byao_user_session");
        console.log("LOGOUT COMPLETE");
        return true;
    } catch (err) {
        console.error("LOGOUT ERROR:", err);
        return false;
    }
}

function saveToCache(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getFromCache(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

async function forceSystemLogout() {
    const ok = confirm("Je, unataka kutoka kwenye mfumo?");
    if (!ok) return;
    await logoutUser();
    location.reload();
}

// ======================================
// EXPORTS TO WINDOW
// ======================================
window.getCurrentUser = getCurrentUser;
window.loginUser = loginUser;
window.getMyProfile = getMyProfile;
window.handleLogin = handleLogin;
window.logoutUser = logoutUser;
window.saveToCache = saveToCache;
window.getFromCache = getFromCache;
window.forceSystemLogout = forceSystemLogout;

console.log("AUTH V3 FUNCTIONS READY & EXPORTED");
