require('dotenv').config()
const express = require('express')
const app = express()
const mongo = require('mongoose')
const {bgGreen,bgRed} = require('chalk')
const { 
  userRouter 
} = require('./Routes')
const log = console.log
app.use(require('cors')())
app.use(express.json())
app.use(userRouter)
app.listen(process.env.PORT,
    (err)=>{
      if(!err){
          log();log(bgGreen.black('[+] SUCCESS. server is running at port :- '+process.env.PORT));log()
          mongo.connect('mongodb://127.0.0.1:27017/blogger',{ useNewUrlParser: true,useUnifiedTopology: true, useCreateIndex: true},
          err=>{
              if(!err){
                log(bgGreen.black('[+] SUCCESS. connected to database..'));log()
              }
              else{
                log(bgRed.black('[-] ERROR ! while connecting database'));log()
              }
          }
          )
      }
      else{
        log();log(bgRed.black('[-] ERROR ! while server running at:-'+process.env.PORT));log()
      }
})