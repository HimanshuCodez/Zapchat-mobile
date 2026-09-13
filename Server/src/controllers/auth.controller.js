import { generateToken } from "../utils/utils.js"
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../utils/cloudinary.js";

export const signup = async (req, res) => {
  const { fullname, email, password, number } = req.body;
  try {
    if (!fullname || !email || !password || !number) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (String(number).length < 10) {
      return res.status(400).json({ message: 'Number must be at least 10 characters' });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: 'Email already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
      number,
    });

    if (newUser) {
      const token = generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        token,
        user: {
          _id: newUser._id,
          fullname: newUser.fullname,
          email: newUser.email,
          profilePic: newUser.profilePic,
          number: newUser.number,
          role: newUser.role,
        },
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.log('Error in signup controller', error.message);
    res.status(500).json({ message: 'Sign Up Failed' });
  }
};

export const login = async (req, res) => {
  const { email, password, number } = req.body;
  try {
    const user = await User.findOne({ email, number });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, res);

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        profilePic: user.profilePic,
        number: user.number,
        role: user.role,
      },
    });
  } catch (error) {
    console.log('Error in login controller', error.message);
    res.status(500).json({ message: 'Cant Login Now' });
  }
};


export const logout = (req, res) => {
  try {
    res.cookie("jwtToken", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
    try {
      const { profilePic } = req.body;
      const userId = req.user._id;
  
      if (!profilePic) {
        return res.status(400).json({ message: "Profile pic is required" });
      }
  
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: uploadResponse.secure_url },
        { new: true }
      );
  
      res.status(200).json(updatedUser);
    } catch (error) {
      console.log("error in update profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

export const resetPassword = async (req, res) => {
  const { email, number, newPassword } = req.body;
  try {
    if (!email || !number || !newPassword) {
      return res.status(400).json({ message: 'Email, phone number, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email, number });
    if (!user) {
      return res.status(400).json({ message: 'No account matches that email and phone number' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.log('Error in resetPassword controller', error.message);
    res.status(500).json({ message: 'Could not reset password' });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};