import { Request, Response } from "express";
import User from "../models/auth.model.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const JWT_SECRET = "ccc491ab81d3c849681a7e5d8d045b0d8ed99a413c98d160861f7ca02cbbe116";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env['EMAIL_USER'] || "your-email@gmail.com",
        pass: process.env['EMAIL_PASS'] || "your-app-password"
    }
});

const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const registerUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        if (!req.body) {
            return res.status(400).json({ message: "Request body is missing" });
        }
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const checkUser = await User.findOne({ email });
        if (checkUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const user = await User.create({ 
            name, 
            email, 
            password, 
            emailVerificationOTP: otp,
            emailVerificationOTPExpires: otpExpires,
            isEmailVerified: false
        });

        const mailOptions = {
            from: process.env['EMAIL_USER'] || "your-email@gmail.com",
            to: email,
            subject: "Email Verification OTP",
            html: `
                <h2>Email Verification</h2>
                <p>Hi ${name},</p>
                <p>Your OTP for email verification is: <strong>${otp}</strong></p>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(201).json({ 
            message: "User registered successfully. Please check your email for OTP verification.", 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isEmailVerified: user.isEmailVerified
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const sendOTP = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.emailVerificationOTP = otp;
        user.emailVerificationOTPExpires = otpExpires;
        await user.save();

        const mailOptions = {
            from: process.env['EMAIL_USER'] || "your-email@gmail.com",
            to: email,
            subject: "Email Verification OTP",
            html: `
                <h2>Email Verification</h2>
                <p>Hi ${user.name},</p>
                <p>Your OTP for email verification is: <strong>${otp}</strong></p>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const verifyOTP = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: "Email already verified" });
        }

        if (!user.emailVerificationOTP || !user.emailVerificationOTPExpires) {
            return res.status(400).json({ message: "No OTP found. Please request a new OTP." });
        }

        if (new Date() > user.emailVerificationOTPExpires) {
            return res.status(400).json({ message: "OTP has expired. Please request a new OTP." });
        }

        if (user.emailVerificationOTP !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        user.isEmailVerified = true;
        user.emailVerificationOTP = null;
        user.emailVerificationOTPExpires = null;
        await user.save();

        const token = jwt.sign({
            id: user._id
        }, JWT_SECRET);

        res.cookie("token", token);

        return res.status(200).json({ 
            message: "Email verified successfully", 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isEmailVerified: user.isEmailVerified
            },
            token 
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const allUsers = async (req: Request, res: Response): Promise<Response> => {
    try {
        const users = await User.find().select('-password -emailVerificationOTP -emailVerificationOTPExpires');
        return res.status(200).json({ users });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
