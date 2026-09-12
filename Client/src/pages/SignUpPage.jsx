import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  MessageSquare,
  Phone,
  Loader2
} from "lucide-react";
import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";
const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    number: "",
    password: ""
  });
  const { signup, isSigningUp } = useAuthStore();
  const validateForm = () => {
     if (!formData.fullname.trim()) return toast.error("Full Name is required")
     if (!formData.email.trim()) return toast.error("Email Name is required")
      if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
     if (!formData.password) return toast.error("Password is required")
      if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
     if (!formData.number) return toast.error("Phone Number is required")
      if (formData.number.length < 10) return toast.error("Number must be at least 10 characters");
     return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    validateForm()
    const success = validateForm();
    if (success===true) 
      signup(formData);
    
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-4 lg:p-12">
        <div className="w-full max-w-md space-y-5">
          {/* Logo and Title */}
          <div className="text-center mb-4">
            <div className="flex flex-col items-center group">
              <div className="size-16 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-all duration-300">
                <MessageSquare className="size-8 text-purple-500" strokeWidth={1.5} />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mt-4">Create Account</h1>
              <p className="text-gray-500 text-sm mt-2">
                Start your journey with our platform
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div className="relative">
              <label className="block text-gray-600 font-medium text-sm mb-1">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  value={formData.fullname}
                  onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="relative">
              <label className="block text-gray-600 font-medium text-sm mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@email.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Phone Number Input */}
            <div className="relative">
              <label className="block text-gray-600 font-medium text-sm mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  type="tel"
                  placeholder="+1 (123) 456-7890"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  value={formData.number}
                  onChange={(e) => setFormData({...formData, number: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="relative">
              <label className="block text-gray-600 font-medium text-sm mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-12 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-4 text-gray-400 hover:text-purple-500 transition"/>
                  ) : (
                    <Eye className="size-4 text-gray-400 hover:text-purple-500 transition"/>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-purple-500 text-white py-2 text-sm rounded-lg hover:bg-purple-600 transition duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <Loader2 className="size-5 animate-spin mr-2"/>
              ) : null}
              {isSigningUp ? "Signing Up..." : "Create Account"}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="text-purple-600 font-semibold hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Auth Image Pattern */}
      <AuthImagePattern
        title="Join our Community"
        subtitle="Connect with your friends, share moments"
      />
    </div>
  );
};

export default SignUpPage;

