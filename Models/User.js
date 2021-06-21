const {Schema,model} =  require('mongoose')
const bcryptjs = require('bcryptjs')

//user schema
const schema = new Schema({

   firstName:{
       type:String,
       trim:true,
       required:true,
   },
   username:{
    type:String,
    trim:true,
    required:true, 
    unique:true
   },
   lastName:{
    type:String,
    trim:true,
    required:true
    },

    email:{
        type:String,
        trim:true,
        required:true,
        toLowerCase:true,
        unique:true
    },
    password:{
        type:String,
        require:true
    },
    phone:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    avatar:{
        type:String,
        default:`https://blogger-app-2021.herokuapp.com/user-img/bot.png`
    },
    biography:{
       type:String,
       default:''
    },
    intrest:{
      type:Array,
      default:[]  
    },
    device_tokens:{
        type:Array,
        default:[]
    },
    phone_verification:{
        type:Boolean,
        default:false
    },
    email_verification:{
        type:Boolean,
        default:false
    },
    soft_delete:{
        type:Boolean,
        default:false
    },
    block:{
        type:Boolean,
        default:false
    }

},{
    timestamps:true
})

//hashing password before saving user
schema.pre('save',async function(){
    try {
       let user = this
       const hashedpassword =await bcryptjs.hash(user.password,8)
       user.password = hashedpassword
    }
     catch (error) {   
       throw new Error(error) 
    }
})

module.exports=model('users',schema)