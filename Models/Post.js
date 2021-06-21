const {Schema,model} = require('mongoose')

const postSchema = new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:'Users',
        required:true
    },
    picture:{
        type:Array,
        
    },
    caption:{
        type:String,
        default:''
    },
    likes:{
        type:Array,
        default:[]
    },
    comments:{
        type:Array,
        default:[]
    },
    tags:{
        type:Array,
        default:[]
    }
})