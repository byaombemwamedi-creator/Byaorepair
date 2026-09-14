// ========================================
// BYAO MOBILE SOLUTIONS
// MASTER ADMIN DASHBOARD SYSTEM
// ========================================

let currentAdmin = null;
let allMembers = [];
let allAds = [];
let allFundingRequests = [];
let allTechnicians = [];
let allMerchants = [];
let allNotifications = [];

// Helper Helper Client Getter
function getSupabase() {
    return window.supabaseClient;
}

// ----------------------------------------
// VERIFY ADMIN SESSION & ACCESS
// ----------------------------------------
async function verifyAdminSession() {
    try {
        const client = getSupabase();
        if (!client) {
            console.error("Supabase client haijapatikana");
            return false;
        }

        const { data: { user }, error } = await client.auth.getUser();
        if (error || !user) {
            console.warn("Hakuna user aliye login");
            redirectToLogin();
            return false;
        }

        const { data: profile, error: profileError } = await client
            .from("profiles")
            .select(`
                id,
                full_name,
                email,
                phone,
                role,
                avatar_url,
                account_status
            `)
            .eq("id", user.id)
            .single();

        if (profileError) {
            console.error("Profile haipatikani:", profileError);
            return false;
        }

        const allowedRoles = ["admin", "master_admin"];
        if (!allowedRoles.includes(profile.role)) {
            alert("Huna ruhusa ya kuingia Admin Dashboard");
            await client.auth.signOut();
            redirectToLogin();
            return false;
        }

        currentAdmin = profile;
        window.currentAdmin = profile;
        console.log("Admin Verified:", currentAdmin);

        loadAdminIdentity();
        return true;
    } catch (error) {
        console.error("Admin verification error:", error);
        return false;
    }
}

function loadAdminIdentity() {
    if (!currentAdmin) return;
    const nameElement = document.getElementById("adminName") || document.getElementById("admin-user-name");
    const roleElement = document.getElementById("adminRole");

    if (nameElement) nameElement.textContent = currentAdmin.full_name || "Admin";
    if (roleElement) roleElement.textContent = currentAdmin.role;
}

function redirectToLogin() {
    window.location.href = "login.html";
}

async function adminLogout() {
    const client = getSupabase();
    if (client) {
        await client.auth.signOut();
    }
    window.location.href = "login.html";
}

// ----------------------------------------
// DASHBOARD STATISTICS ENGINE
// ----------------------------------------
async function loadDashboardStats() {
    try {
        const client = getSupabase();
        if (!client) return;

        const results = await Promise.all([
            client.from("profiles").select("id", { count: "exact", head: true }),
            client.from("technicians").select("id", { count: "exact", head: true }),
            client.from("merchants").select("id", { count: "exact", head: true }),
            client.from("global_ads").select("id", { count: "exact", head: true }),
            client.from("repair_jobs").select("id", { count: "exact", head: true }),
            client.from("funding_requests").select("id", { count: "exact", head: true }),
            client.from("notifications").select("id", { count: "exact", head: true })
        ]);

        const stats = {
            users: results[0].count || 0,
            technicians: results[1].count || 0,
            merchants: results[2].count || 0,
            ads: results[3].count || 0,
            repairs: results[4].count || 0,
            funding: results[5].count || 0,
            notifications: results[6].count || 0,
            profiles: results[0].count || 0,
            repair_jobs: results[4].count || 0,
            global_ads: results[3].count || 0,
            funding_requests: results[5].count || 0
        };

        console.log("Dashboard Stats:", stats);
        updateDashboardCards(stats);
    } catch (error) {
        console.error("Stats loading error:", error);
    }
}

function updateDashboardCards(stats) {
    const elements = {
        users: ["totalUsers", "stat-total-users"],
        technicians: ["totalTechnicians", "stat-total-techs"],
        merchants: ["totalMerchants"],
        ads: ["totalAds", "stat-pending-ads"],
        repairs: ["totalRepairs", "stat-active-repairs"],
        funding: ["totalFunding", "stat-funding-reqs"],
        notifications: ["totalNotifications", "stat-unread-notifications"]
    };

    Object.keys(elements).forEach(key => {
        elements[key].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = stats[key];
        });
    });
}

// ----------------------------------------
// MEMBERS MANAGEMENT SYSTEM
// ----------------------------------------
async function loadMembers() {
    try {
        const client = getSupabase();
        const { data, error } = await client
            .from("profiles")
            .select(`
                id,
                full_name,
                phone,
                email,
                role,
                user_role,
                account_status,
                is_active,
                language,
                location,
                created_at,
                avatar_url
            `)
            .order("created_at", { ascending: false });

        if (error) throw error;
        allMembers = data || [];
        console.log("Members Loaded:", allMembers);
        displayMembers(allMembers);
    } catch (error) {
        console.error("Loading members error:", error);
    }
}

function displayMembers(members) {
    const container = document.getElementById("membersContainer") || document.getElementById("membersTable") || document.getElementById("users-table-body");

    if (container) {
        container.innerHTML = "";
        if (members.length === 0) {
            container.innerHTML = "<p class='text-slate-400 p-4'>Hakuna members waliopatikana</p>";
        } else {
            members.forEach(user => {
                const card = document.createElement("div");
                card.className = "bg-bgCard border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-md hover:border-slate-700 transition";
                card.innerHTML = `
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <h3 class="font-bold text-white text-sm">${escapeHtml(user.full_name || "No Name")}</h3>
                            <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">${escapeHtml(user.role || user.user_role || "-")}</span>
                        </div>
                        <p class="text-xs text-slate-400 mb-1">📧 ${escapeHtml(user.email || "-")}</p>
                        <p class="text-xs text-slate-400 mb-3">📞 ${escapeHtml(user.phone || "-")}</p>
                    </div>
                    <div class="flex items-center justify-between pt-3 border-t border-slate-800 gap-2">
                        <select onchange="changeMemberStatus('${user.id}', this.value)" class="bg-bgDeep text-xs border border-slate-700 rounded px-2 py-1 text-slate-300">
                            <option value="Active" ${user.account_status === "Active" ? "selected" : ""}>Active</option>
                            <option value="Blocked" ${user.account_status === "Blocked" ? "selected" : ""}>Blocked</option>
                            <option value="Suspended" ${user.account_status === "Suspended" ? "selected" : ""}>Suspended</option>
                        </select>
                        <button onclick="openMemberDetails('${user.id}')" class="text-xs text-accent hover:underline px-2 py-1">View</button>
                    </div>
                `;
                container.appendChild(card);
            });
        }
    }
}

function searchMembers(value) {
    const text = (typeof value === "string" ? value : document.getElementById("memberSearch")?.value || "").toLowerCase();
    const filtered = allMembers.filter(member => {
        return (
            member.full_name?.toLowerCase().includes(text) ||
            member.email?.toLowerCase().includes(text) ||
            member.phone?.includes(text) ||
            member.role?.toLowerCase().includes(text)
        );
    });
    displayMembers(filtered);
}

function filterMembersByRole(role) {
    if (role === "all") {
        displayMembers(allMembers);
        return;
    }
    const filtered = allMembers.filter(member => member.role === role || member.user_role === role);
    displayMembers(filtered);
}

async function changeMemberStatus(id, status) {
    try {
        const client = getSupabase();
        const active = status === "Active";
        const { error } = await client
            .from("profiles")
            .update({
                account_status: status,
                is_active: active
            })
            .eq("id", id);

        if (error) throw error;
        await createAdminLog("Changed member status", id);
        alert("Status imebadilishwa");
        loadMembers();
    } catch (error) {
        console.error(error);
        alert("Imeshindikana kubadilisha status");
    }
}

async function openMemberDetails(userId) {
    const client = getSupabase();
    const { data: user, error } = await client
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) {
        console.error(error);
        return;
    }

    const box = document.getElementById("memberDetails");
    if (box) {
        box.innerHTML = `
            <h3>${user.full_name}</h3>
            <p>Email: ${user.email}</p>
            <p>Phone: ${user.phone}</p>
            <p>Role: ${user.role}</p>
            <p>Status: ${user.account_status}</p>
            <button onclick="changeMemberRole('${user.id}', 'technician')">Make Technician</button>
            <button onclick="changeMemberRole('${user.id}', 'merchant')">Make Merchant</button>
        `;
    }
}

async function changeMemberRole(userId, newRole) {
    try {
        const client = getSupabase();
        const { error } = await client
            .from("profiles")
            .update({ role: newRole })
            .eq("id", userId);

        if (error) throw error;
        await createAdminLog("Changed member role to " + newRole, userId);
        alert("Role changed");
        loadMembers();
    } catch (err) {
        console.error(err);
    }
}

// ================================
// GLOBAL ADS MANAGEMENT SYSTEM
// ================================

async function loadGlobalAds() {
    try {
        const client = getSupabase();
        if (!client) {
            throw new Error("Supabase client haipatikani");
        }

        const { data, error } = await client
            .from("global_ads")
            .select(`
                id,
                merchant_id,
                owner,
                business_name,
                title,
                description,
                desc,
                media_url,
                media_type,
                phone,
                cta_text,
                duration,
                duration_hours,
                status,
                is_approved,
                created_at,
                expiresat
            `)
            .order("created_at", {
                ascending: false
            });

        if (error) {
            throw error;
        }

        allAds = data || [];
        console.log("Global Ads Loaded:", allAds);
        displayAds(allAds);
    } catch (error) {
        console.error("Global Ads Loading Error:", error);
    }
}

// OPEN ADS MANAGEMENT
function loadAdsManagement() {
    loadGlobalAds();
}

// SECURITY HTML
function escapeHtml(value) {
    if (value === null || value === undefined) {
        return "";
    }
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
    return escapeHtml(value);
}

// CHECK VIDEO
function isVideoAd(ad) {
    const type = String(ad.media_type || "").toLowerCase();
    const url = String(ad.media_url || "").toLowerCase();
    return (
        type.includes("video") ||
        url.includes(".mp4") ||
        url.includes(".webm") ||
        url.includes(".mov") ||
        url.includes(".ogg")
    );
}

// CREATE MEDIA PREVIEW
function createAdMedia(ad) {
    if (!ad.media_url) {
        return `<div class="w-full h-32 bg-slate-800 rounded-lg flex items-center justify-center text-xs text-slate-500">Hakuna media</div>`;
    }
    const url = escapeAttr(ad.media_url);

    if (isVideoAd(ad)) {
        return `
        <video width="100%" height="130" controls playsinline preload="metadata" style="border-radius:8px; object-fit:cover; background:black; height:130px;">
            <source src="${url}">
            Video haipatikani
        </video>
        `;
    }

    return `
    <img src="${url}" width="100%" height="130" loading="lazy" style="border-radius:8px; object-fit:cover; height:130px;">
    `;
}

// DISPLAY ADS CARDS (BADALA YA TABLE)
function displayAds(ads) {
    const container = document.getElementById("ads-table-body") || document.getElementById("adsContainer");

    if (!container) {
        console.error("ads-table-body au container haipo");
        return;
    }

    container.innerHTML = "";

    if (!ads || ads.length === 0) {
        container.innerHTML = `<p class="text-slate-400 p-4">Hakuna matangazo</p>`;
        return;
    }

    ads.forEach(ad => {
        const card = document.createElement("div");
        card.className = "bg-bgCard border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-md hover:border-slate-700 transition";
        card.innerHTML = `
            <div>
                <div class="mb-3">${createAdMedia(ad)}</div>
                <h3 class="font-bold text-white text-sm mb-1">${escapeHtml(ad.title || "-")}</h3>
                <p class="text-xs text-slate-300 mb-1">🏢 ${escapeHtml(ad.business_name || ad.owner || "-")}</p>
                <p class="text-xs text-slate-400 mb-2">📞 ${escapeHtml(ad.phone || "-")}</p>
                <div class="mb-3">
                    <span class="text-[10px] px-2 py-0.5 rounded ${ad.is_approved ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}">
                        ${ad.is_approved ? "Approved" : escapeHtml(ad.status || "Pending")}
                    </span>
                </div>
            </div>
            <div class="flex items-center justify-end gap-1 pt-3 border-t border-slate-800">
                <button onclick="approveAd('${escapeAttr(ad.id)}')" class="text-xs px-2 py-1 bg-emerald-900/40 text-emerald-300 border border-emerald-700 rounded hover:bg-emerald-900">Approve</button>
                <button onclick="rejectAd('${escapeAttr(ad.id)}')" class="text-xs px-2 py-1 bg-amber-900/40 text-amber-300 border border-amber-700 rounded hover:bg-amber-900">Reject</button>
                <button onclick="deleteAd('${escapeAttr(ad.id)}')" class="text-xs px-2 py-1 bg-rose-900/40 text-rose-300 border border-rose-700 rounded hover:bg-rose-900">Delete</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// APPROVE
async function approveAd(id) {
    await updateAdStatus(id, "active", true);
}

// REJECT
async function rejectAd(id) {
    await updateAdStatus(id, "rejected", false);
}

// UPDATE STATUS
async function updateAdStatus(id, status, approved) {
    try {
        const client = getSupabase();
        const { error } = await client
            .from("global_ads")
            .update({
                status: status,
                is_approved: approved
            })
            .eq("id", id);

        if (error) throw error;
        if (typeof createAdminLog === "function") {
            await createAdminLog("Updated Ad Status: " + status, id);
        }
        alert("Tangazo limebadilishwa");
        loadGlobalAds();
    } catch(error) {
        console.error(error);
        alert("Hitilafu imetokea");
    }
}

// DELETE
async function deleteAd(id) {
    if (!confirm("Una uhakika unataka kufuta tangazo?")) {
        return;
    }
    try {
        const client = getSupabase();
        const { error } = await client
            .from("global_ads")
            .delete()
            .eq("id", id);

        if (error) throw error;
        if (typeof createAdminLog === "function") {
            await createAdminLog("Deleted Ad", id);
        }
        alert("Tangazo limefutwa");
        loadGlobalAds();
    } catch(error) {
        console.error(error);
        alert("Delete imeshindikana");
    }
}

// SEARCH
function searchAds(value) {
    const text = String(value || "").toLowerCase();
    const filtered = allAds.filter(ad => {
        return (
            String(ad.title || "").toLowerCase().includes(text) ||
            String(ad.business_name || "").toLowerCase().includes(text) ||
            String(ad.owner || "").toLowerCase().includes(text) ||
            String(ad.phone || "").toLowerCase().includes(text)
        );
    });
    displayAds(filtered);
}

// ----------------------------------------
// FUNDING REQUEST MANAGEMENT
// ----------------------------------------
async function loadFundingRequests() {
    try {
        const client = getSupabase();
        const { data, error } = await client
            .from("funding_requests")
            .select(`
                id,
                transId,
                jina,
                simu,
                aina,
                status,
                isapproved,
                user_id,
                created_at
            `)
            .order("created_at", { ascending: false });

        if (error) throw error;
        allFundingRequests = data || [];
        console.log("Funding Requests:", allFundingRequests);
        displayFundingRequests(allFundingRequests);
    } catch (error) {
        console.error("Funding loading error:", error);
    }
}

function displayFundingRequests(requests) {
    const container = document.getElementById("fundingContainer") || document.getElementById("fundingList") || document.getElementById("funding-table-body");

    if (container) {
        container.innerHTML = "";
        if (requests.length === 0) {
            container.innerHTML = "<p class='text-slate-400 p-4'>Hakuna maombi ya fedha</p>";
        } else {
            requests.forEach(request => {
                const card = document.createElement("div");
                card.className = "bg-bgCard border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-md hover:border-slate-700 transition";
                card.innerHTML = `
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <h3 class="font-bold text-white text-sm">${escapeHtml(request.jina || "Bila jina")}</h3>
                            <span class="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">${escapeHtml(request.aina || "-")}</span>
                        </div>
                        <p class="text-xs text-slate-400 mb-1">TRANS ID: <b>${escapeHtml(request.transId || request.id)}</b></p>
                        <p class="text-xs text-slate-400 mb-1">Simu: ${escapeHtml(request.simu || "")}</p>
                        <p class="text-xs text-slate-300 mb-3">Status: <b>${escapeHtml(request.status || "-")}</b></p>
                    </div>
                    <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                        <button onclick="approveFunding('${request.id}')" class="text-xs px-3 py-1 bg-emerald-900/40 text-emerald-300 border border-emerald-700 rounded hover:bg-emerald-900">Approve</button>
                        <button onclick="rejectFunding('${request.id}')" class="text-xs px-3 py-1 bg-rose-900/40 text-rose-300 border border-rose-700 rounded hover:bg-rose-900">Reject</button>
                    </div>
                `;
                container.appendChild(card);
            });
        }
    }
}

function renderFundingTable(requests) {
    displayFundingRequests(requests);
}

async function approveFunding(id) {
    await updateFundingStatus(id, "Approved", true);
}

async function rejectFunding(id) {
    await updateFundingStatus(id, "Rejected", false);
}

async function updateFundingStatus(id, status, approved) {
    try {
        const client = getSupabase();
        const { error } = await client
            .from("funding_requests")
            .update({
                status: status,
                isapproved: approved
            })
            .eq("id", id);

        if (error) throw error;
        await createAdminLog(status + " Funding", id);
        await createNotification(id, "Funding " + status, "Maombi yako ya funding yamefanyiwa kazi: " + status);
        alert("Funding imebadilishwa");
        loadFundingRequests();
    } catch (error) {
        console.error(error);
        alert("Imeshindikana kubadilisha");
    }
}

function searchFunding(value) {
    const text = value.toLowerCase();
    const filtered = allFundingRequests.filter(item => {
        return (
            item.jina?.toLowerCase().includes(text) ||
            item.simu?.includes(text) ||
            item.aina?.toLowerCase().includes(text)
        );
    });
    displayFundingRequests(filtered);
}

// ----------------------------------------
// TECHNICIAN MANAGEMENT SYSTEM
// ----------------------------------------
async function loadTechnicians() {
    try {
        const client = getSupabase();
        const { data, error } = await client
            .from("technicians")
            .select(`
                id,
                jina,
                simu,
                status,
                created_at,
                profile_id
            `)
            .order("created_at", { ascending: false });

        if (error) throw error;
        allTechnicians = data || [];
        console.log("Technicians:", allTechnicians);
        displayTechnicians(allTechnicians);
    } catch (error) {
        console.error("Technician loading error:", error);
    }
}

function displayTechnicians(technicians) {
    const container = document.getElementById("technicianContainer") || document.getElementById("technicians-table-body");

    if (container) {
        container.innerHTML = "";
        if (technicians.length === 0) {
            container.innerHTML = "<p class='text-slate-400 p-4'>Hakuna mafundi</p>";
        } else {
            technicians.forEach(tech => {
                const card = document.createElement("div");
                card.className = "bg-bgCard border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-md hover:border-slate-700 transition";
                card.innerHTML = `
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <h3 class="font-bold text-white text-sm">${escapeHtml(tech.jina)}</h3>
                            <span class="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Hardware / Mobile</span>
                        </div>
                        <p class="text-xs text-slate-400 mb-1">Simu: ${escapeHtml(tech.simu)}</p>
                        <p class="text-xs text-slate-300 mb-3">Status: <b>${escapeHtml(tech.status)}</b></p>
                    </div>
                    <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                        <button onclick="activateTechnician('${tech.id}')" class="text-xs px-3 py-1 bg-emerald-900/40 text-emerald-300 border border-emerald-700 rounded hover:bg-emerald-900">Activate</button>
                        <button onclick="disableTechnician('${tech.id}')" class="text-xs px-3 py-1 bg-rose-900/40 text-rose-300 border border-rose-700 rounded hover:bg-rose-900">Disable</button>
                    </div>
                `;
                container.appendChild(card);
            });
        }
    }
}

async function activateTechnician(id) {
    await updateTechnicianStatus(id, "Verified");
}

async function disableTechnician(id) {
    await updateTechnicianStatus(id, "Blocked");
}

async function updateTechnicianStatus(id, status) {
    try {
        const client = getSupabase();
        const { error } = await client
            .from("technicians")
            .update({ status: status })
            .eq("id", id);

        if (error) throw error;
        await createAdminLog("Changed Technician status to " + status, id);
        alert("Status ya fundi imebadilishwa");
        loadTechnicians();
    } catch (error) {
        console.error(error);
        alert("Imeshindikana");
    }
}

function searchTechnicians(value) {
    const text = value.toLowerCase();
    const filtered = allTechnicians.filter(tech => {
        return (
            tech.jina?.toLowerCase().includes(text) ||
            tech.simu?.includes(text) ||
            tech.status?.toLowerCase().includes(text)
        );
    });
    displayTechnicians(filtered);
}

// ----------------------------------------
// MERCHANT MANAGEMENT SYSTEM
// ----------------------------------------
async function loadMerchants() {
    try {
        const client = getSupabase();
        const { data, error } = await client
            .from("merchants")
            .select(`
                id,
                profile_id,
                business_name,
                verified,
                package,
                subscription_status,
                activated_at,
                merchant_code,
                created_at
            `)
            .order("created_at", { ascending: false });

        if (error) throw error;
        allMerchants = data || [];
        console.log("Merchants:", allMerchants);
        displayMerchants(allMerchants);
    } catch (error) {
        console.error("Merchant loading error:", error);
    }
}

function displayMerchants(merchants) {
    const container = document.getElementById("merchantContainer");
    if (!container) return;

    container.innerHTML = "";
    if (merchants.length === 0) {
        container.innerHTML = "<p class='text-slate-400 p-4'>Hakuna wafanyabiashara</p>";
        return;
    }

    merchants.forEach(merchant => {
        const card = document.createElement("div");
        card.className = "bg-bgCard border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-md hover:border-slate-700 transition";
        card.innerHTML = `
            <div>
                <h3 class="font-bold text-white text-sm mb-2">${escapeHtml(merchant.business_name || "Biashara")}</h3>
                <p class="text-xs text-slate-400 mb-1">Package: <b>${escapeHtml(merchant.package || "-")}</b></p>
                <p class="text-xs text-slate-400 mb-1">Subscription: <b>${escapeHtml(merchant.subscription_status || "-")}</b></p>
                <p class="text-xs text-slate-400 mb-1">Verified: ${merchant.verified ? "NDIYO" : "HAPANA"}</p>
                <p class="text-xs text-slate-400 mb-3">Code: ${escapeHtml(merchant.merchant_code || "")}</p>
            </div>
            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button onclick="verifyMerchant('${merchant.id}')" class="text-xs px-3 py-1 bg-emerald-900/40 text-emerald-300 border border-emerald-700 rounded hover:bg-emerald-900">Verify</button>
                <button onclick="blockMerchant('${merchant.id}')" class="text-xs px-3 py-1 bg-rose-900/40 text-rose-300 border border-rose-700 rounded hover:bg-rose-900">Block</button>
            </div>
        `;
        container.appendChild(card);
    });
}

async function verifyMerchant(id) {
    await updateMerchantStatus(id, true, "Active");
}

async function blockMerchant(id) {
    await updateMerchantStatus(id, false, "Blocked");
}

async function updateMerchantStatus(id, verified, subscription) {
    try {
        const client = getSupabase();
        const { error } = await client
            .from("merchants")
            .update({
                verified: verified,
                subscription_status: subscription,
                activated_at: verified ? new Date() : null
            })
            .eq("id", id);

        if (error) throw error;
        await createAdminLog("Updated Merchant verification", id);
        alert("Merchant amebadilishwa");
        loadMerchants();
    } catch (error) {
        console.error(error);
        alert("Imeshindikana");
    }
}

function searchMerchants(value) {
    const text = value.toLowerCase();
    const filtered = allMerchants.filter(merchant => {
        return (
            merchant.business_name?.toLowerCase().includes(text) ||
            merchant.package?.toLowerCase().includes(text) ||
            merchant.subscription_status?.toLowerCase().includes(text)
        );
    });
    displayMerchants(filtered);
}

// ----------------------------------------
// NOTIFICATIONS SYSTEM
// ----------------------------------------
async function loadNotifications() {
    try {
        const client = getSupabase();
        const { data, error } = await client
            .from("notifications")
            .select(`
                id,
                user_id,
                title,
                message,
                is_read,
                sender_role,
                receiver_role,
                type,
                created_at
            `)
            .order("created_at", { ascending: false })
            .limit(100);

        if (error) throw error;
        allNotifications = data || [];
        console.log("Notifications:", allNotifications);
        displayNotifications(allNotifications);
    } catch (error) {
        console.error("Notification error:", error);
    }
}

function loadAdminNotifications() {
    loadNotifications();
}

function displayNotifications(notifications) {
    const container = document.getElementById("notificationContainer") || document.getElementById("notifications-list") || document.getElementById("adminNotifications");
    if (!container) return;

    container.innerHTML = "";
    if (notifications.length === 0) {
        container.innerHTML = "<p class='text-slate-400 p-4'>Hakuna notifications</p>";
        return;
    }

    notifications.forEach(notification => {
        const card = document.createElement("div");
        card.className = "notification-card notification-item p-3 bg-bgDeep rounded border border-slate-800 mb-2";
        card.innerHTML = `
            <h4 class="font-bold text-xs text-white">${escapeHtml(notification.title || "Notification")}</h4>
            <p class="text-xs text-slate-300 mt-1">${escapeHtml(notification.message || "")}</p>
            <small class="text-[10px] text-slate-500 block mt-2">${new Date(notification.created_at).toLocaleString()}</small>
        `;
        container.appendChild(card);
    });
}

async function sendNotification(userId, title, message, type = "system") {
    try {
        const client = getSupabase();
        const { data: user } = await client.auth.getUser();

        const { error } = await client
            .from("notifications")
            .insert({
                user_id: userId,
                title: title,
                message: message,
                type: type,
                sender_id: user.user.id,
                sender_role: "admin",
                is_read: false
            });

        if (error) throw error;
        alert("Notification imetumwa");
    } catch (error) {
        console.error(error);
        alert("Imeshindikana kutuma");
    }
}

async function createNotification(userId, title, message) {
    await sendNotification(userId, title, message);
}

async function markNotificationRead(id) {
    try {
        const client = getSupabase();
        const { error } = await client
            .from("notifications")
            .update({ is_read: true })
            .eq("id", id);

        if (error) throw error;
        loadNotifications();
    } catch (error) {
        console.error(error);
    }
}

function searchNotifications(value) {
    const text = value.toLowerCase();
    const filtered = allNotifications.filter(item => {
        return (
            item.title?.toLowerCase().includes(text) ||
            item.message?.toLowerCase().includes(text) ||
            item.receiver_role?.toLowerCase().includes(text)
        );
    });
    displayNotifications(filtered);
}

// ----------------------------------------
// ADMIN LOGS & HELPERS
// ----------------------------------------
async function createAdminLog(action, target) {
    try {
        const client = getSupabase();
        const { data: { user } } = await client.auth.getUser();
        if (!user) return;

        await client.from("admin_logs").insert({
            admin_id: user.id,
            action: action,
            target: String(target)
        });
    } catch (err) {
        console.error("Admin log error:", err);
    }
}

// ----------------------------------------
// MODERATION SYSTEM
// ----------------------------------------
async function loadModeration() {
    try {
        const client = getSupabase();
        const adsResult = await client
            .from("global_ads")
            .select("*")
            .eq("is_approved", false)
            .order("created_at", { ascending: false });

        if (adsResult.error) {
            console.error(adsResult.error);
            return;
        }

        const usersResult = await client
            .from("profiles")
            .select("*")
            .eq("account_status", "Suspended");

        if (usersResult.error) {
            console.error(usersResult.error);
            return;
        }

        renderModeration(adsResult.data, usersResult.data);
    } catch (error) {
        console.error("Moderation error:", error);
    }
}

function renderModeration(ads, blockedUsers) {
    const box = document.getElementById("moderationContainer");
    if (!box) return;

    box.innerHTML = "<h3 class='text-white font-bold mb-2'>Pending Ads</h3>";
    ads.forEach(ad => {
        box.innerHTML += `
            <div class="moderation-card bg-bgCard border border-slate-800 rounded-xl p-4 mb-3">
                <h4 class="font-bold text-sm text-white">${escapeHtml(ad.title || "No Title")}</h4>
                <p class="text-xs text-slate-400">Owner: ${escapeHtml(ad.owner || "-")}</p>
                <p class="text-xs text-slate-400 mb-2">Status: ${escapeHtml(ad.status)}</p>
                <div class="flex gap-2">
                    <button onclick="approveAd('${ad.id}')" class="text-xs px-2 py-1 bg-emerald-900/40 text-emerald-300 rounded">Approve</button>
                    <button onclick="rejectAd('${ad.id}')" class="text-xs px-2 py-1 bg-rose-900/40 text-rose-300 rounded">Reject</button>
                </div>
            </div>
        `;
    });

    box.innerHTML += "<h3 class='text-white font-bold mt-4 mb-2'>Suspended Users</h3>";
    blockedUsers.forEach(user => {
        box.innerHTML += `
            <div class="moderation-card bg-bgCard border border-slate-800 rounded-xl p-4 mb-3">
                <h4 class="font-bold text-sm text-white">${escapeHtml(user.full_name)}</h4>
                <p class="text-xs text-slate-400 mb-2">${escapeHtml(user.email)}</p>
                <button onclick="restoreUser('${user.id}')" class="text-xs px-2 py-1 bg-accent/20 text-accent rounded">Restore Account</button>
            </div>
        `;
    });
}

async function suspendUserAccount(userId) {
    try {
        const client = getSupabase();
        const { error } = await client
            .from("profiles")
            .update({ account_status: "Suspended", is_active: false })
            .eq("id", userId);

        if (error) throw error;
        await createAdminLog("Suspended User", userId);
        alert("Account suspended");
        loadModeration();
    } catch (error) {
        console.error(error);
    }
}

async function restoreUser(userId) {
    try {
        const client = getSupabase();
        const { error } = await client
            .from("profiles")
            .update({ account_status: "Active", is_active: true })
            .eq("id", userId);

        if (error) throw error;
        await createAdminLog("Restored User", userId);
        alert("Account restored");
        loadModeration();
    } catch (error) {
        console.error(error);
    }
}

async function removeAdForViolation(adId) {
    const confirmDelete = confirm("Ondoa tangazo hili?");
    if (!confirmDelete) return;

    try {
        const client = getSupabase();
        const { error } = await client
            .from("global_ads")
            .delete()
            .eq("id", adId);

        if (error) throw error;
        await createAdminLog("Removed violating ad", adId);
        alert("Tangazo limeondolewa");
        loadModeration();
    } catch (error) {
        console.error(error);
    }
}

// ----------------------------------------
// SYSTEM SETTINGS MODULE
// ----------------------------------------
async function loadSystemSettings() {
    try {
        const client = getSupabase();
        const { data, error } = await client
            .from("app_settings")
            .select("*")
            .single();

        if (error) {
            console.error("Settings loading error:", error);
            return;
        }

        window.systemSettings = data;
        const language = document.getElementById("defaultLanguage");
        const maintenance = document.getElementById("maintenanceMode") || document.getElementById("maintenance-mode");
        const languages = document.getElementById("supportedLanguages");

        if (language) language.value = data.default_language || "sw";
        if (maintenance) maintenance.checked = data.maintenance_mode || false;
        if (languages) languages.value = JSON.stringify(data.supported_languages || []);

        console.log("System settings loaded:", data);
    } catch (err) {
        console.error("loadSystemSettings:", err);
    }
}

async function updateSystemSettings() {
    try {
        const client = getSupabase();
        const default_language = document.getElementById("defaultLanguage")?.value || "sw";
        const maintenance_mode = (document.getElementById("maintenanceMode") || document.getElementById("maintenance-mode"))?.checked || false;

        let supported_languages = [];
        try {
            supported_languages = JSON.parse(document.getElementById("supportedLanguages")?.value);
        } catch {
            supported_languages = ["sw", "fr", "en"];
        }

        const { error } = await client
            .from("app_settings")
            .update({
                default_language,
                maintenance_mode,
                supported_languages,
                updated_at: new Date()
            })
            .not("id", "is", null);

        if (error) {
            console.error("Update settings error:", error);
            alert("Settings hazijahifadhiwa");
            return;
        }

        await createAdminLog("Updated system settings", "app_settings");
        alert("Settings zimehifadhiwa vizuri");
    } catch (err) {
        console.error("updateSystemSettings:", err);
    }
}

function saveSystemSettings() {
    updateSystemSettings();
}

// ----------------------------------------
// SYSTEM INITIALIZATION
// ----------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
    const verified = await verifyAdminSession();

    if (verified) {
        await loadDashboardStats();
        await loadGlobalAds();
        await loadFundingRequests();
        await loadTechnicians();
        await loadMembers();
        await loadMerchants();
        await loadNotifications();
        await loadReportsAnalytics();
        await loadModeration();
        await loadSystemSettings();
        await createAdminLog("LOGIN", "Admin Dashboard");
    }
});

// ======================================
// REPORTS & ANALYTICS ENGINE
// ======================================

async function loadReportsAnalytics() {
    try {
        const client = getSupabase();
        if (!client) return;

        const [
            repairsResult,
            completedResult,
            usersResult,
            revenueResult
        ] = await Promise.all([
            client.from("repair_jobs").select("id", { count: "exact", head: true }),
            client.from("repair_jobs").select("id", { count: "exact", head: true }).eq("status", "completed"),
            client.from("profiles").select("id", { count: "exact", head: true }).eq("is_active", true),
            client.from("repair_jobs").select("bei")
        ]);

        const totalRepairs = repairsResult.count || 0;
        const completedJobs = completedResult.count || 0;
        const activeUsers = usersResult.count || 0;

        let revenue = 0;
        if (revenueResult.data) {
            revenueResult.data.forEach(job => {
                revenue += Number(job.bei || 0);
            });
        }

        const report = {
            repairs: totalRepairs,
            completed: completedJobs,
            users: activeUsers,
            revenue: revenue
        };

        console.log("Reports Analytics:", report);
        updateReportsUI(report);
    } catch(error) {
        console.error("Reports Analytics Error:", error);
    }
}

function updateReportsUI(report) {
    const repairs = document.getElementById("report-total-repairs");
    const revenue = document.getElementById("report-total-revenue");
    const users = document.getElementById("report-active-users");
    const completed = document.getElementById("report-completed-jobs");

    if(repairs) repairs.textContent = report.repairs;
    if(revenue) revenue.textContent = report.revenue;
    if(users) users.textContent = report.users;
    if(completed) completed.textContent = report.completed;
}
// Kitendaji cha kusoma na kudhibiti video zilizotumwa (Video Verification Center)
async function fetchPendingVideosForAdmin() {
    try {
        const { data, error } = await supabaseClient
            .from('fundi_posts') // Jedwali linalohifadhi media na post
            .select('id, content, media_url, author, status, created_at')
            .eq('status', 'pending') // Inachuja video zote zinazosubiri uhakiki
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Hapa unaweza kupachika data hizi kwenye DOM ya Admin Hub yako
        console.log("Video za kuhakiki zimepakiwa:", data);
        return data;
    } catch (err) {
        console.error("Hitilafu katika kupata video za uhakiki:", err);
        showToast("Imeshindwa kupakia video za uhakiki", "⚠️");
    }
}

async function updateVideoStatus(videoId, newStatus) {
    try {
        if (newStatus === 'deleted') {
            // Amri ya SQL DELETE kupitia Supabase
            const { error } = await supabaseClient
                .from('fundi_posts')
                .delete()
                .eq('id', videoId);
                
            if (error) throw error;
            showToast("Video imefutwa kabisa kwenye mfumo!", "🗑️");
        } else {
            // Amri ya SQL UPDATE (Mfano: 'approved' au 'rejected')
            const { error } = await supabaseClient
                .from('fundi_posts')
                .update({ status: newStatus })
                .eq('id', videoId);
                
            if (error) throw error;
            showToast(`Hali ya video imebadilishwa kuwa: ${newStatus}`, "✅");
        }
        
        // Pakia upya orodha ya video baada ya mabadiliko
        fetchPendingVideosForAdmin();
    } catch (err) {
        console.error("Hitilafu wakati wa kusasisha video:", err);
        showToast("Imeshindwa kutekeleza amri ya Admin", "❌");
    }
}
