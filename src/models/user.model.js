import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema = new Schema(
    {
        username: 
        {
            type: String,
            required: true,
            unique: true,
            lowerCase: true,
            trim: true,
            index: true
        },
        email: 
        {
            type: String,
            required: true,
            unique: true,
            lowerCase: true,
            trim: true,
        },
        fullname: 
        {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar:
        {
            type: String,  // cloudinary url
            required: true
        },
        coverphoto:
        {
            type: String
        },
        watchHistory:
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        password:
        {
            type: String,
            required: [true, "Password is required"]
        },
        referenceid:
        {
            type: String
        }
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next){
    if(!this.isModified("password"))    return next()

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect =  async function(password)
{
    return await bcrypt.compare(password, this.password)
}

userSchema.models.generateAccessToken = function()
{
    return jwt.sign
    (
        {
            id: this._id,
            email : this.email,
            username : this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        },
    )
}

userSchema.models.generateRefreshToken = function()
{
    return jwt.sign
    (
        {
            id: this._id,
        },
        process.env.REFRESH_TOKEN,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        },
    )
}


export default User = mongoose.model("User",userSchema)