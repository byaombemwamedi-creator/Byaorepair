// ======================================
// BYAO MOBILE SOLUTIONS
// NOTIFICATIONS ENGINE V2
// ======================================


console.log("NOTIFICATIONS.JS V2 LOADED");




// ======================================
// SUPABASE CLIENT
// ======================================


function getSupabaseClient(){

    return window.supabaseClient || null;

}




// ======================================
// CURRENT USER SESSION
// ======================================


function getCurrentUserSession(){

    try{

        const session =
        localStorage.getItem(
            "byao_user_session"
        );


        if(!session){

            return null;

        }


        return JSON.parse(session);


    }catch(error){

        console.error(
            "SESSION READ ERROR:",
            error
        );

        return null;

    }

}





// ======================================
// CREATE NOTIFICATION
// ======================================


async function createNotification(
    userId,
    title,
    message
){


const supabase=getSupabaseClient();



if(!supabase){

console.error(
"Supabase client haipo"
);

return false;

}



if(!userId){

console.error(
"Notification user_id haipo"
);

return false;

}



try{


const {data,error}=

await supabase
.from("notifications")
.insert([{


user_id:userId,

title:title,

message:message,

is_read:false


}])
.select()
.single();




if(error){

console.error(
"CREATE NOTIFICATION ERROR:",
error.message
);


return false;

}



console.log(
"NOTIFICATION CREATED:",
data
);



return data;



}catch(err){


console.error(
"NOTIFICATION FAILED:",
err
);


return false;


}


}







// ======================================
// LOAD USER NOTIFICATIONS
// ======================================


async function loadMyNotifications(userId){



const supabase=getSupabaseClient();



if(!supabase || !userId){

return [];

}



try{


const {data,error}=

await supabase

.from("notifications")

.select("*")

.eq(
"user_id",
userId
)

.order(
"created_at",
{
ascending:false
}
);



if(error){

console.error(
"LOAD NOTIFICATION ERROR:",
error.message
);

return [];

}



return data || [];



}catch(err){


console.error(
err
);


return [];

}



}







// ======================================
// COUNT UNREAD
// ======================================


async function countUnreadNotifications(userId){



const supabase=getSupabaseClient();



if(!supabase || !userId){

return 0;

}




const {count,error}=

await supabase

.from("notifications")

.select("*",{

count:"exact",

head:true

})

.eq(
"user_id",
userId
)

.eq(
"is_read",
false
);




if(error){

console.error(
"COUNT ERROR:",
error.message
);

return 0;

}



return count || 0;



}








// ======================================
// MARK AS READ
// ======================================


async function markNotificationRead(id){


const supabase=getSupabaseClient();


if(!supabase || !id){

return;

}



const {error}=

await supabase

.from("notifications")

.update({

is_read:true

})

.eq(
"id",
id
);



if(error){

console.error(
"MARK READ ERROR:",
error.message
);

}


}








// ======================================
// DELETE NOTIFICATION
// ======================================


async function deleteNotification(id){



const supabase=getSupabaseClient();



if(!supabase){

return;

}



const {error}=

await supabase

.from("notifications")

.delete()

.eq(
"id",
id
);



if(error){

console.error(
"DELETE ERROR:",
error.message
);

}



}







// ======================================
// TOAST POPUP
// ======================================


function showNotificationToast(message){



const toast=document.createElement(
"div"
);



toast.className=`

fixed top-5 right-5
z-50
bg-slate-900
border border-cyan-400
text-white
px-5 py-4
rounded-2xl
shadow-2xl
font-bold
text-sm
animate-bounce

`;



toast.innerHTML=`

🔔 ${message}

`;



document.body.appendChild(toast);



setTimeout(()=>{


toast.style.opacity="0";


setTimeout(()=>{

toast.remove();

},500);



},3000);



}







// ======================================
// REALTIME LISTENER
// ======================================


function listenNotifications(userId){



const supabase=getSupabaseClient();



if(!supabase || !userId){

console.warn(
"Realtime notification haijaanza"
);

return null;

}



const channel=

supabase

.channel(
"notifications-"+userId
)


.on(

"postgres_changes",

{

event:"INSERT",

schema:"public",

table:"notifications",

filter:
`user_id=eq.${userId}`


},


(payload)=>{


console.log(
"NEW NOTIFICATION:",
payload.new
);



showNotificationToast(
payload.new.title
);



}


)



.subscribe();



return channel;


}








// ======================================
// INITIALIZE
// ======================================


async function initNotifications(){



const session=
getCurrentUserSession();



if(!session){

console.log(
"No user session"
);

return;

}



const userId=
session.profile_id || session.user_id;




console.log(
"Notification system started for:",
userId
);



// start realtime

listenNotifications(
userId
);



// unread count

const count=
await countUnreadNotifications(
userId
);



console.log(
"Unread notifications:",
count
);



const badge=
document.getElementById(
"notificationBadge"
);



if(badge){

badge.innerText=count;


if(count>0){

badge.classList.remove(
"hidden"
);

}

}



}





console.log(
"NOTIFICATIONS ENGINE READY"
);

 // ======================================
// CREATE NOTIFICATION
// ======================================

async function createNotification(
userId,
title,
message
){

const {
error
}=await window.supabaseClient

.from("notifications")

.insert({

user_id:userId,

title:title,

message:message,

is_read:false

});


if(error){

console.error(
"NOTIFICATION ERROR:",
error
);

}


}
