import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const serviceSchema = new Schema({
    serviceName: {
        type: String,
        required: true,
        trim: true
    },
    
    cloudinaryLogoId: {
        type: String,
        required: true
    },
    
    serviceLink: {
        type: String,
        required: true
    },
    
    upvotes: {
        type: Number,
        default: 0
    },
    
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    
    description: {
        type: String,
        required: true
    },
    
    logo: {
        type: String,
        required: true
    },
    
    refreshToken: {
        type: String
    }
}, {
    timestamps: true
});

serviceSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

serviceSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
};

serviceSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.serviceName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

serviceSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export const Service = mongoose.model("Service", serviceSchema);