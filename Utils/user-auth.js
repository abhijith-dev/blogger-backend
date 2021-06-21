const jwt = require('jsonwebtoken')
module.exports ={
    'token-auth':{
       'gen-token':(id)=>{
         return new Promise((resolve,reject)=>{
             jwt.sign({'_id':id},'heremysecretkey',function(err,token){
               if(err){
                   reject(err)
               }
               else{
                   resolve(token)
               }
             })

         })
       },
       'verify-token':(token)=>{
         return new Promise((resolve,reject)=>{
           jwt.verify(token,'heremysecretkey',function(err,userDetails){
              if(err){
                reject('invalid token')
              }
              else{
                resolve(userDetails)
              }
           })
         })
       }
    },
}