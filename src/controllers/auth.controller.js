import User from "../models/user.model.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { sendEmail } from "../lib/sendEmail.js";
export const registerUser = async(req , res)=>{
    try {
     const {userName , email , password} = req.body;
     const existingUser = await User.findOne({email});
     if(existingUser){
        return res.status(400).json({message:"User already exists"});
     }
     const hashedPassword = await bcrypt.hash( password , 10);
     const user = await User.create({
        userName,
        email,
        password: hashedPassword,
        isVerified: false
     });
     const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    const verificationLink = `http://localhost:5000/api/auth/verify/${token}`;
    const subject= "Email Verification - Auth App";
    const html = `
      <p>Hi ${userName},</p>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationLink}">${verificationLink}</a>
      <p>This link will expire in 24 hours.</p>
    `;

    await sendEmail(email, subject, html);

    res.status(201).json({ message: "User registered. Verification email sent." });
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Internal server error"});
    }

}

export const loginUser = async(req,res)=>{
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        const isPasswordValid = await bcrypt.compare(password , user.password);
        if(!isPasswordValid){
            return res.status(401).json({message:"Invalid credentials"});
        }
        if (!user.isVerified) {
          return res.status(403).json({ message: "Please verify your email first" });
        }

        const newRefreshToken = jwt.sign({
            id:user._id,
            email:user.email},
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn:"7d"}         
        )
        const  accessToken = jwt.sign({
            id:user._id,
            email:user.email},
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn:"15m"}
        )
        user.refreshToken = newRefreshToken;
        await user.save();
        res.cookie("refreshToken", newRefreshToken, {
             httpOnly: true,
             secure: true, // true if using HTTPS
             sameSite: "strict",
             maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
        res.status(200).json({message:"Login successful" , accessToken, newRefreshToken});
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal server error"});

    }
}
export const logout = async(req,res)=>{
    try {
        const {refreshToken} = req.body;
        if(!refreshToken){
            return res.status(400).json({message:"No refresh token found"});
        }
        const user = await User.findOne({refreshToken});
        if(!user){
            return res.status(404).json({message:"No user found"});
        }
        user.refreshToken = null;
        await user.save();
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true, // true if using HTTPS
            sameSite: "strict",
        });
        res.status(200).json({message:"Logout successful"});
    } catch (error) {
         console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken; // get from cookie

    if (!token) {
      return res.status(401).json({ message: "No refresh token found" });
    }

    // Verify refresh token
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid refresh token" });

      // Check if token matches the one saved in DB
      const user = await User.findById(decoded.id);
      if (!user || user.refreshToken !== token) {
        return res.status(403).json({ message: "Refresh token not valid" });
      }

      // Generate a new access token
      const newAccessToken = jwt.sign(
        { id: user._id, email: user.email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyEmail = async(req,res)=>{
  try {
    const {token} = req.params;
    if(!token){
        return res.status(400).json({message:"No token provided"});
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if(!user){
        return res.status(404).json({message:"User not found"});
    }
    if(user.isVerified){
        return res.status(400).json({message:"User already verified"});
    }
    user.isVerified = true;
    await user.save();
     res.send(`
      <html>
        <head>
          <title>Email Verified</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #f7f7f7;
              display: flex;
              height: 100vh;
              align-items: center;
              justify-content: center;
            }
            .card {
              background: white;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              text-align: center;
            }
            h1 {
              color: green;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>✅ Email Verified!</h1>
            <p>You can now log in to your account.</p>
            <a href="https://yourfrontend.com/login">Go to Login</a>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("❌ Email verification error:", error);
    res.status(500).json({message:"Internal server error"});
  }
}
export const deleteUser = async(req,res)=>{
 try {
  const userId= req.user.id;
  const user =await User.findByIdAndDelete(userId);
  if(!user){
    return res.status(404).json({message:"User not found"});

  }
  res.status(200).json({message:"User deleted successfully"});
 } catch (error) {
  console.error("❌ Delete user error:", error);
  res.status(500).json({ message: "Internal server error" });
 }
}

export const resendEmail = async(req,res)=>{
  try {
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user){
      return res.status(404).json({message: "User not Found"});

    }
    if(user.isVerified){
      return res.status(400).json({message: "User already verified"})
    }
    const token = jwt.sign(
      {userId: user._id},
      process.env.JWT_SECRET,
      {expiresIn: "1d"}
    );
    const verificationLink = `http://localhost:5000/api/auth/verify/${token}`;
    const subject= "Email Verification - Auth App";
    const html = `
      <p>Hi ${user.userName},</p>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationLink}">${verificationLink}</a>
      <p>This link will expire in 24 hours.</p>
    `;

    await sendEmail(email, subject, html);

    res.status(201).json({ message: "User registered. Verification email sent." });
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Internal server error"});
    }
}