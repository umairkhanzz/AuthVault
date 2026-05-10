import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    isEmailVerified: boolean;
    emailVerificationOTP: string | null;
    emailVerificationOTPExpires: Date | null;
}

const userSchema: Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationOTP: {
        type: String,
        default: null
    },
    emailVerificationOTPExpires: {
        type: Date,
        default: null
    }
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;
