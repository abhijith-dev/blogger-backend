const  {Router} = require('express')
const { users } = require('../Models')
const { Authentication } = require('../Utils')
const {_Authentication} = require('../Middlewares')
const bcryptjs = require('bcryptjs')
const router = Router()

/**
 * creating user account
 * @param {Object} request request.body getting from client end
 * @returns {Object}  retruns response obejct to client
 * 
 */
router.post (
    '/Accounts',
    _Authentication.requiresHeaders({useragent:true,device_id:true,fcm_token:true}),
    async(request,response)=>{
       try{
        let timer = new Date()   
        const {firstName,lastName,username,password,phone,email} = request.body  
        let requestBody={
            firstName,
            lastName,
            username,
            email,
            phone,
            password,
        }
        users.exists({$or:[{email},{username},{phone}]},async(error,isexist)=>{
            if(!error){
              if(isexist){
                  return response.status(400).json({message:'user already exist with is phone number  or email'})
              }
              else{
                let user =await users(requestBody)
                await user.save()
                Authentication['token-auth']['gen-token'](user._id).then(async(token)=>{
                    let device_token={
                        'user-agent':request.headers['user-agent'],
                        'device-id':request.headers['device-id'],
                        'fcm_token':request.headers['fcm_token'],
                        'token':token,
                        'login_date':timer.toDateString(),
                        'login_time':timer.toTimeString()
                    }
                    await users.updateOne({_id:user._id},{$push:{device_tokens:device_token}})
                    response.status(201).json({token:token})
                })
                .catch(error=>{
                  response.status(500).json({message:'something went wrong',...error})
                })  
              }
              
            }
            else{
                response.status(500).json({message:'something went wrong'})
            }
        })
       } catch (error) { 
         response.status(400).json({message:'validation error..',...error})
       }
    }
)
/**
 * logging in user 
 * @param {Object} request request body containing |email|phone number|username and password
 * @returns {Object} token of perticular user
 */
router.post('/Accounts-Auth',
_Authentication.requiresHeaders({useragent:true,device_id:true,fcm_token:true}),
async(request,response)=>{
    try {
    let timer = new Date()     
    const {cread,password} = request.body
    let isUserExistWithCred = await users.findOne({$or:[{email:cread},{phone:cread},{username:cread}]})
    if(!isUserExistWithCred){
        return response.status(400).json({message:'invalid credentials'})  
    }
    if(isUserExistWithCred.device_tokens.length>=5){
        return response.status(406).json({message:"Opps you reached maximum ammount of device allowance"})    
    }
    let isAuthSuccess = await bcryptjs.compare(password,isUserExistWithCred.password)
    if(isAuthSuccess){
        Authentication['token-auth']['gen-token'](isUserExistWithCred._id).then(async(token)=>{
            let device_token={
                'user-agent':request.headers['user-agent'],
                'device-id':request.headers['device-id'],
                'fcm_token':request.headers['fcm_token'],
                'token':token,
                'login_date':timer.toDateString(),
                'login_time':timer.toTimeString()
            }
            await users.updateOne({_id:isUserExistWithCred._id},{$push:{device_tokens:device_token}})
            response.status(200).json({token:token})
        })
        .catch(error =>{response.status(500).json({message:'something went wrong',...error})})
    }
    else{
        return response.status(400).json({message:'invalid credentials'})
    }
    } catch (error) {
       response.status(500).json({message:"server error"}) 
    }
}
)

/**
 * logging out user
 * @param {null} 
 */

router.post(
    '/Accounts-Logout',
    _Authentication.requiresHeaders({useragent:true,access_token:true,device_id:true}),
    _Authentication.verifyHeaders({access_token:true}),
    async(request,response)=>{  
      try{
        await users.updateOne({'_id':request.auth._id},{ $pull: { 'device_tokens': { 'device-id': request.headers['device-id']}}})
      response.status(200).send()
      }
      catch(error){
        response.status(500).json({message:error}) 
      }
    }
)
/**
 * fetching account details
 * @param {null}
 * @returns {Object}
 */
router.get('/Accounts',
_Authentication.requiresHeaders({access_token:true,useragent:true,device_id:true}),
_Authentication.verifyHeaders({access_token:true}),
_Authentication.securityAspects({phone:true,sd:true,block:true}),
async(request,response)=>{
  try{
    const user = request.auth
    const response_data = {
        "firstName":user.firstName,
        "lastName":user.lastName,
        "username":user.username,
        "phone":user.phone,
        "avatar":user.avatar,
        "biography":user.biography
    }
    response.status(200).json(response_data)
  }
  catch(error){
      response.status(500).json({message:error})
  }
}
)
module.exports=router