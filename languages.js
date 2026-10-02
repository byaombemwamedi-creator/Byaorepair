    // Kamusi ya Maneno (Translations Dictionary)
    const translations = {
      sw: {
        title: "BYAO GLOBAL GATEWAY 2026",
        subtitle: "Lango Kuu la Mfumo & Access Portal",
        roleLabel: "Chagua Wadhifa (Role)",
        optSelectRole: "-- Chagua Role Yako --",
        optCustomer: "Mteja (Customer)",
        optMerchant: "Mfanyabiashara (Merchant)",
        optFundi: "Fundi Spares/Repair",
        optAdmin: "Admin Mkuu (Master Admin)",
        nameLabel: "Jina Kamili",
        namePlaceholder: "Ingiza jina lako",
        phoneLabel: "Namba ya Simu / WhatsApp",
        locationLabel: "Eneo Unapopatikana (Location)",
        adminPinLabel: "Security PIN ya Admin Mkuu",
        btnSubmit: "Ingia Kwenye Mfumo",
        waitText: "Tafadhali kusubiri kidogo uhakikisho wa Uongozi...",
        subWaitText: "Mfumo unathibitisha Njia na Role yako..."
      },
      fr: {
        title: "BYAO GLOBAL GATEWAY 2026",
        subtitle: "Portail Principal & Accès Système",
        roleLabel: "Sélectionner le Rôle",
        optSelectRole: "-- Sélectionnez votre Rôle --",
        optCustomer: "Client (Customer)",
        optMerchant: "Marchand (Merchant)",
        optFundi: "Technicien Pièces/Réparation",
        optAdmin: "Admin Principal (Master Admin)",
        nameLabel: "Nom Complet",
        namePlaceholder: "Entrez votre nom",
        phoneLabel: "Numéro de Téléphone / WhatsApp",
        locationLabel: "Emplacement (Location)",
        adminPinLabel: "PIN de Sécurité Admin",
        btnSubmit: "Entrer dans le Système",
        waitText: "Veuillez patienter pendant la vérification...",
        subWaitText: "Le système valide votre accès et rôle..."
      },
      en: {
        title: "BYAO GLOBAL GATEWAY 2026",
        subtitle: "Main Gateway & Access Portal",
        roleLabel: "Select Role",
        optSelectRole: "-- Select Your Role --",
        optCustomer: "Customer",
        optMerchant: "Merchant",
        optFundi: "Spares/Repair Technician",
        optAdmin: "Master Admin",
        nameLabel: "Full Name",
        namePlaceholder: "Enter your name",
        phoneLabel: "Phone Number / WhatsApp",
        locationLabel: "Location",
        adminPinLabel: "Master Admin Security PIN",
        btnSubmit: "Enter System",
        waitText: "Please wait for management verification...",
        subWaitText: "System is verifying your path and role..."
      }
    };

    function badilishaLugha(lang) {
      localStorage.setItem('byao_selected_lang', lang);
      applyTranslations(lang);
    }

    function applyTranslations(lang) {
      const t = translations[lang];
      if (!t) return;

      if (document.getElementById('appTitle')) document.getElementById('appTitle').innerText = t.title;
      if (document.getElementById('appSubtitle')) document.getElementById('appSubtitle').innerText = t.subtitle;
      if (document.getElementById('labelRole')) document.getElementById('labelRole').innerText = t.roleLabel;
      if (document.getElementById('optSelectRole')) document.getElementById('optSelectRole').innerText = t.optSelectRole;
      if (document.getElementById('optCustomer')) document.getElementById('optCustomer').innerText = t.optCustomer;
      if (document.getElementById('optMerchant')) document.getElementById('optMerchant').innerText = t.optMerchant;
      if (document.getElementById('optFundi')) document.getElementById('optFundi').innerText = t.optFundi;
      if (document.getElementById('optAdmin')) document.getElementById('optAdmin').innerText = t.optAdmin;
      if (document.getElementById('labelPhone')) document.getElementById('labelPhone').innerText = t.phoneLabel;
      if (document.getElementById('labelLocation')) document.getElementById('labelLocation').innerText = t.locationLabel;
      if (document.getElementById('labelAdminPin')) document.getElementById('labelAdminPin').innerText = t.adminPinLabel;
      if (document.getElementById('btnSubmitText')) document.getElementById('btnSubmitText').innerText = t.btnSubmit;
      if (document.getElementById('verificationWaitText')) document.getElementById('verificationWaitText').innerText = t.waitText;
      if (document.getElementById('verificationSubText')) document.getElementById('verificationSubText').innerText = t.subWaitText;

      adjustFormFields();
    }
function adjustFormFields() {

    const roleElement = document.getElementById('userRole');
    const nameLabel = document.getElementById('nameLabel');
    const nameInput = document.getElementById('userName');
    const adminBox = document.getElementById('adminPinBox');

    const lang =
    localStorage.getItem('byao_selected_lang') || 'sw';


    // Kama form haipo, usifanye chochote
    if(!roleElement){
        return;
    }


    const role = roleElement.value;


    if(!nameLabel || !nameInput || !adminBox){
        return;
    }



    if(role === 'mfanyabiashara') {


        nameLabel.innerText =
        lang === 'fr'
        ? "Nom du Magasin / Commerce"
        : lang === 'en'
        ? "Shop / Business Name"
        : "Jina la Duka / Biashara";


        nameInput.placeholder =
        "Mfano: Byao Smart Electronics";


        adminBox.classList.add('hidden');


    }


    else if(role === 'admin') {


        nameLabel.innerText =
        lang === 'fr'
        ? "Nom de l'Admin Principal"
        : lang === 'en'
        ? "Master Admin Name"
        : "Jina la Admin Mkuu";


        nameInput.placeholder =
        lang === 'fr'
        ? "Entrez le nom de l'administration"
        : lang === 'en'
        ? "Enter management name"
        : "Ingiza jina la Uongozi";


        adminBox.classList.remove('hidden');


    }


    else {


        nameLabel.innerText =
        translations[lang]?.nameLabel || "Jina Kamili";


        nameInput.placeholder =
        translations[lang]?.namePlaceholder || "Ingiza jina lako";


        adminBox.classList.add('hidden');

    }

}
 // ===============================
// LOCAL CACHE SYSTEM
// ===============================

function saveToCache(key, data) {
    try {
        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

        localStorage.setItem(
            key + "_time",
            Date.now()
        );

    } catch(error){
        console.error(
            "Cache save error:",
            error
        );
    }
}


function getFromCache(key) {

    try {

        const data =
        localStorage.getItem(key);


        if(data){
            return JSON.parse(data);
        }

    } catch(error){

        console.error(
            "Cache read error:",
            error
        );

    }

    return null;
}
