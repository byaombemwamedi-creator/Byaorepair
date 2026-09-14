// ======================================
// BYAO MOBILE SOLUTIONS
// REGISTER ENGINE V4
// ======================================

console.log("REGISTER.JS V4 LOADED");


// ======================================
// POPUP MESSAGE
// ======================================

function showRegisterPopup(message, type="success"){

    const popup = document.createElement("div");

    popup.className = `
    fixed top-5 left-1/2 -translate-x-1/2
    z-50 w-[90%] max-w-md
    p-4 rounded-2xl
    shadow-2xl text-white font-bold text-sm
    backdrop-blur-xl border
    animate-bounce
    ${
        type === "error"
        ? "bg-rose-600/90 border-rose-300"
        : "bg-emerald-600/90 border-emerald-300"
    }
    `;


    popup.innerHTML = `
    <div class="flex items-center gap-3">
        <span class="text-2xl">
        ${type==="error" ? "⚠️" : "🎉"}
        </span>

        <span>${message}</span>
    </div>
    `;


    document.body.appendChild(popup);


    setTimeout(()=>{

        popup.style.opacity="0";

        setTimeout(()=>{
            popup.remove();
        },500);

    },3000);

}



// ======================================
// LOADING
// ======================================

function showLoading(text){

    const box=document.getElementById("loadingOverlay");
    const label=document.getElementById("loadingText");


    if(box)
        box.classList.remove("hidden");


    if(label)
        label.innerText=text;

}



function hideLoading(){

    const box=document.getElementById("loadingOverlay");

    if(box)
        box.classList.add("hidden");

}



// ======================================
// REGISTER FLOW
// ======================================

document.addEventListener(
"DOMContentLoaded",
()=>{


const form=document.getElementById("registerForm");


if(!form){

console.log("REGISTER FORM HAIPO");

return;

}



form.addEventListener(
"submit",
async(e)=>{


e.preventDefault();



try{


showLoading(
"⏳ Inatengeneza akaunti..."
);



if(!window.supabaseClient){

throw new Error(
"Supabase client haipo"
);

}




// ================================
// FORM DATA
// ================================


const fullName =
document.getElementById("fullName")
.value.trim();


const email =
document.getElementById("email")
.value.trim();


const password =
document.getElementById("password")
.value.trim();


const phone =
document.getElementById("phone")
.value.trim();


const location =
document.getElementById("location")
.value.trim();


let role =
document.getElementById("role")
.value
.toLowerCase()
.trim();



// ================================
// BLOCK ADMIN REGISTER
// ================================


if(role==="admin" || role==="master_admin"){

role="client";

}




console.log(
"REGISTER ROLE:",
role
);



// ================================
// CREATE AUTH USER
// ================================


const {
data,
error

}=await window.supabaseClient.auth.signUp({

email,

password,


options:{

data:{

full_name:fullName,

phone,

location,

role

}

}

});



if(error)
throw error;



const user=data.user;



if(!user){

throw new Error(
"User hakutengenezwa"
);

}



console.log(
"AUTH CREATED:",
user.id
);



// Subiri database trigger

await new Promise(
resolve=>setTimeout(resolve,1500)
);



// ================================
// CREATE TECHNICIAN PROFILE
// ================================


let technicianData=null;



if(role==="technician"){


const {
data:tech,
error:techError

}=await window.supabaseClient

.from("technicians")

.insert({

profile_id:user.id,

jina:fullName,

simu:phone,

status:"Pending"

})

.select()
.single();



if(techError){

console.error(
"TECH ERROR:",
techError.message
);

}
else{

technicianData=tech;

console.log(
"TECH CREATED",
tech
);

}



}



// ================================
// NOTIFY ADMIN
// ================================


if(role==="technician"){


if(
typeof getAdminProfileId==="function" &&
typeof createNotification==="function"
){


const adminId =
await getAdminProfileId();



if(adminId){


await createNotification(

adminId,

"Fundi Mpya Amesajiliwa",

`Fundi ${fullName} amejiunga BYAO Mobile Solutions`

);


console.log(
"ADMIN NOTIFICATION SENT"
);


}


}


}



// ================================
// SAVE CACHE ONLY
// ================================


const sessionData={

user_id:user.id,

profile_id:user.id,

technician_id:
technicianData
?
technicianData.id
:
null,


role,

name:fullName,

phone,

location,

approved:false

};



localStorage.setItem(

"byao_user_session",

JSON.stringify(sessionData)

);



console.log(
"SESSION SAVED",
sessionData
);




// ================================
// SUCCESS
// ================================


hideLoading();



if(role==="technician"){


showRegisterPopup(
"✅ Akaunti ya fundi imetengenezwa. Subiri approval ya Admin."
);


}else{


showRegisterPopup(
"✅ Akaunti imetengenezwa vizuri."
);


}



setTimeout(()=>{

window.location.href="index.html";

},3000);



}



catch(error){


console.error(
"REGISTER ERROR:",
error
);



hideLoading();



showRegisterPopup(

"❌ "+error.message,

"error"

);


}



});


});
