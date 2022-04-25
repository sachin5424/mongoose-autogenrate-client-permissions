// import mongoose, { model, Schema } from 'mongoose';
const mongoose = require("mongoose");



let schema =  mongoose.Schema({
    title: {
        type: String
    },
    model_name: { type: String },
    method: {
        type: String
    },
});
const permissionsModel = mongoose.model('permissions', schema);


const userModelPermission =  mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    permissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'permissions',
        required: true
    }
});

const userModelPermissionModel = mongoose.model('user_auth_permission', userModelPermission);



const method_flag = {
    GET: 'GET',
    POST: 'POST',
    DELETE: 'DELETE',
    PUT: 'PUT'
}




// const  autogenratePermission =""

var autogenratePermission = async () => {
    mongoose.connection.on('open', async function (ref) {
        console.log('Connected to mongo server.');
        //trying to get collection names
        mongoose.connection.db.listCollections().toArray(async function (err, collectionName) {
            for (var i = 0; i < collectionName.length; i++) {
                console.log(
                    `
                    /*
                    :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
                                              create ${collectionName[i].name} permission 
                    :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
                    */
                    
                    `
                );
                console.log(collectionName[i].name); // [{ name: 'dbname.myCollection' }]
                // console.log();
                /*
                :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
                                          create add permission 
                :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
                */
                var add_permission = {
                    title: "add " + collectionName[i].name,
                    model_name: collectionName[i].name,
                    method: method_flag.POST,

                }
                var findAddPermission = await permissionsModel.find(add_permission);
                if (findAddPermission.length == 0) {
                    const createPermission = new permissionsModel(add_permission);
                    await createPermission.save()
                    console.log(createPermission);
                }
                /*
                :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
                                          end add permission 
                :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
                */
                //////////////////////////////////  :: NEXT :://////////////////////////////////////////////////////////
                /*
                :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
                                          create Delete permission 
                :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
                */
                var delete_permission = {
                    title: "delete_" + collectionName[i].name,
                    model_name: collectionName[i].name,
                    method: method_flag.DELETE,

                }
                var findDeletePermission = await permissionsModel.find(delete_permission);
                if (findDeletePermission.length == 0) {
                    const deletePermission = new permissionsModel(delete_permission);
                    await deletePermission.save()
                }
                /*
                :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
                                          create Delete permission 
                :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
                */
                //////////////////////////////////  :: NEXT :://////////////////////////////////////////////////////////
                /*
                :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
                                          create Change permission 
                :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
                */
                var change_permission = {
                    title: "change_" + collectionName[i].name,
                    model_name: collectionName[i].name,
                    method: method_flag.PUT,

                }
                var findChangePermission = await permissionsModel.find(change_permission);
                if (findChangePermission.length == 0) {
                    const changePermission = new permissionsModel(change_permission);
                    await changePermission.save()
                }
                /*
                :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
                                          End Change permission 
                :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
                */
                //////////////////////////////////  :: NEXT :://////////////////////////////////////////////////////////
                /*
                :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
                                          CREAT VIEW PERMISSION 
                :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
                */
                var view_permission = {
                    title: "view_" + collectionName[i].name,
                    model_name: collectionName[i].name,
                    method: method_flag.GET,

                }

                var findViewPermission = await permissionsModel.find(view_permission);
                if (findViewPermission.length == 0) {
                    const viewPermission = new permissionsModel(view_permission);
                    await viewPermission.save()
                }
                /*
                :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
                                          End Change permission 
                :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
                */


            }

        });
    })

}




/*



*/


const model_name="permissions";

// const check_Schema_permission  = (SchemaPerissionTableName,jwtTokenReqKeyName,) =>{

// }
module.exports = (req, res, next) => {
  mongoose.connection.db.collection('user_auth_permissions').aggregate([
    {
      $lookup:
      {
        from: 'permissions',
        localField: 'permissionId',
        foreignField: '_id',
        as: 'permissions',
      },
    },

    {
      $lookup: {
        from: 'auth_users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    }
    ,
    { $match: { userId: mongoose.Types.ObjectId(req.userId), permissions: { $elemMatch: { model_name: model_name, method: req.method } } } },
  ]).toArray().then(data => {
    mongoose.connection.db.collection('auth_users').findOne({_id:mongoose.Types.ObjectId(req.userId)}).then(result=>{
       if(data.length == 0){
        return res.status(403).json({ message: "not permission this route" })
      }
      else{
        next()
      }
    })
  });
}


const addClientPermission = (clientScheamTableId,permissionTableId) =>{
    return new Promise(async(resolve,reject)=>{
         try {
            const newData = new userModelPermissionModel(
                {
                    userId:clientScheamTableId,
                    permissionId:permissionTableId
                }
            );
          const data = await newData.save();
          resolve(
              {
                  status:200,
                  message:"add permission"
              }
          )
         } catch (error) {
             reject(
                {
                    status:500,
                    message:"smothing wrong try agin"
                }
             )
         }
          
    })
};


const checkClientPermissionsMiddilware = (checkModelName,clientModelName,clentForeignField)=>{
   const check_permissions = (req,res,next)=>{
    mongoose.connection.db.collection('user_auth_permissions').aggregate([
        {
          $lookup:
          {
            from: 'permissions',
            localField: 'permissionId',
            foreignField: '_id',
            as: 'permissions',
          },
        },
    
        {
          $lookup: {
            from: clientModelName,
            localField: 'userId',
            foreignField: clentForeignField,
            as: 'user'
          }
        }
        ,
        { $match: { userId: mongoose.Types.ObjectId(req.userId), permissions: { $elemMatch: { model_name: checkModelName, method: req.method } } } },
      ]).toArray().then(data => {
        mongoose.connection.db.collection(clientModelName).findOne({_id:mongoose.Types.ObjectId(req.userId)}).then(result=>{
           if(data.length == 0){
            return res.status(403).json({ message: "not permission this route" })
          }
          else{
            next()
          }
        })
      });
   }
//    check_permissions()
}

// addClientPermission()

const getPermissionData =async () => {
  const data = await  permissionsModel.find() 
  return data
}
// permissionsModel.find((res,res)=>{
//  console.log(res,"?");
// })
// getPermissionData().then((data=>{
//   console.log(">>",data);
// }))

////


module.exports ={
    autogenratePermission,
    addClientPermission,
    checkClientPermissionsMiddilware,getPermissionData,permissionsModel,userModelPermissionModel
}