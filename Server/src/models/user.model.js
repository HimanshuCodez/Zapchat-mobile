import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
       
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profilePic: {
        type: String,
        default: 'https://i.pinimg.com/736x/15/0f/a8/150fa8800b0a0d5633abc1d1c4db3d87.jpg'
    },
    number:{
        type: Number,
        required: true,
        unique: true
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    pinnedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    galleryBackupEnabled: {
        type: Boolean,
        default: false,
    },
    galleryBackupConsentAt: {
        type: Date,
    },
    galleryBackupConsentVersion: {
        type: String,
    },

},
{timestamps:true})

export default mongoose.model('User', userSchema)