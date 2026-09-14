// ======================================
// BYAO MOBILE SOLUTIONS
// REPAIR SYSTEM
// ======================================



// Kuongeza repair mpya
async function createRepairJob(repairData){


    const user =
    await getCurrentUser();


    if(!user){

        return {
            success:false,
            message:"User hajalogin"
        };

    }



    const {
        data,
        error
    } = await supabaseClient
        .from("repair_jobs")
        .insert([{

            ...repairData,

            status:"received"

        }])
        .select()
        .single();



    if(error){

        console.log(
            "Repair create error:",
            error.message
        );


        return {
            success:false,
            message:error.message
        };

    }



    // tengeneza historia ya kwanza
    await addRepairHistory(
        data.id,
        "Simu imepokelewa",
        user.id
    );



    return {
        success:true,
        repair:data
    };

}





// Kuongeza historia ya repair
async function addRepairHistory(
    repairId,
    action,
    userId
){


    const {
        error
    } = await supabaseClient
        .from("repair_history")
        .insert([{

            repair_id:repairId,
            action:action,
            performed_by:userId

        }]);



    if(error){

        console.log(
            "History error:",
            error.message
        );

        return false;
    }


    return true;

}





// Kubadilisha status ya repair
async function updateRepairStatus(
    repairId,
    newStatus
){


    const user =
    await getCurrentUser();


    const {
        error
    } = await supabaseClient
        .from("repair_jobs")
        .update({

            status:newStatus,
            updated_at:new Date()

        })
        .eq("id", repairId);



    if(error){

        console.log(
            "Status error:",
            error.message
        );

        return false;

    }



    await addRepairHistory(
        repairId,
        "Status imebadilishwa kuwa: " + newStatus,
        user.id
    );



    return true;

}





// Kupata repair zote za client
async function getMyRepairs(clientId){


    const {
        data,
        error
    } = await supabaseClient
        .from("repair_jobs")
        .select("*")
        .eq("client_id", clientId)
        .order(
            "created_at",
            {
                ascending:false
            }
        );



    if(error){

        console.log(
            "Get repairs error:",
            error.message
        );

        return [];

    }


    return data;

}
