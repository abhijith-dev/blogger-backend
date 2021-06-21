const jwt = require('jsonwebtoken')
const { users } = require('../Models')
const {Authentication} = require('../Utils')
/**
 * 
 * @param {Object} headers 
 * @returns auth-middleware
 */
function requiresHeaders({useragent,access_token,fcm_token,device_id}){
    return function(request,response,next){
        if(useragent){
            if(request.headers['user-agent']===undefined){
                return response.status(401  ).json({message:'unauthorized operation @-user-agent'})
            }
        }
        if(access_token){
            if(request.headers['access-token']===undefined){
                return response.status(401).json({message:'unauthorized operation @-access-token'})
            }
        }
        if(device_id){
            if(request.headers['device-id']===undefined){
                return response.status(401).json({message:'unauthorized operation @-device-id'})
            }
        }
        if(fcm_token){
            console.log(request.headers['fcm_token'])
            if(request.headers['fcm_token']===undefined){
                return response.status(401).json({message:'unauthorized operation @-fcm_token'})
            }
        }
        next()
    }
}


 function verifyHeaders({access_token,useragent,device_id,fcm_token}){
    return  function(request,response,next){
        if(access_token){
            let token = request.headers['access-token'].split(" ")[1]
            Authentication['token-auth']['verify-token'](token)
            .then(async(user)=>{ 
               let user_details =await users.findOne({_id:user._id})
               request.auth = user_details
               let tokenlist = user_details.device_tokens
               let isTokenExist=tokenlist.some(item =>item.token===token)
               if(!isTokenExist){
                return response.status(406).json({message:'opps login again something went wrong'})
               }
               next()
            })
            .catch(error=>{
              console.log(error)  
              return response.status(401).json({message:" user not found"})
            })
        }
        
    }
}
function securityAspects({phone,email,block,sd}){
    return function(request,response,next){
    let token = request.headers['access-token'].split(" ")[1]
    Authentication['token-auth']['verify-token'](token)
    .then(async(user)=>{ 
       let user_details =await users.findOne({_id:user._id})
       if(phone){
           if(!user_details.phone_verification){
              return response.status(401).json("required @phone verification")
           }
       }
       if(email){
        if(!user_details.email_verification){
           return response.status(406).json("required @email verification")
        }
    }
    if(sd){
        if(user_details.sd){
           return response.status(406).json("account tempororly disabled")
        }
    }
    if(block){
        if(user_details.block){
           return response.status(406).json("account is blocked action required")
        }
    }
    next()
    }).catch(error=>{
      return response.status(401).json(error)
    })
    } 
}
module.exports={
    requiresHeaders,
    verifyHeaders,
    securityAspects
}