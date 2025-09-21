import React, { useContext, useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Sparkles, ArrowRight } from 'lucide-react';
import { UserDataContext } from '../context/UserContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import bg from '../assets/AIBG.png'
const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isScratched, setIsScratched] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  
  const { serverUrl,userData,setUserData } = useContext(UserDataContext);
  const navigate = useNavigate();

  const handleSignUp = async(e) => {
    e.preventDefault();
    
    // Validation for mandatory fields
    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      let result = await axios.post(`${serverUrl}/api/auth/signup`, {
        email: formData.email,
        name: formData.name,
        password: formData.password
      }, { withCredentials: true });
      setUserData(result.data)
      console.log(result.data);
      setSuccess('Account created successfully! Redirecting to sign in...');

      
      // Clear form
      setFormData({
        name: '',
        email: '',
        password: ''
      });
      
      // Navigate to signin page after success
      setTimeout(() => {
        navigate('/customize');
      }, 1000);
      
    } catch (error) {
      console.log(error);
      setUserData(null)
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else if (error.response && error.response.status === 400) {
        setError('Invalid input data. Please check your information.');
      } else if (error.response && error.response.status === 409) {
        setError('User already exists with this email.');
      } else {
        setError('Network error. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleSignInNavigation = () => {
    navigate('/signin');
  };

  const generateRandomCredentials = () => {
    const randomId = Math.random().toString(36).substring(2, 10);
    const email = `recruiter_${randomId}@demo.com`;
    const password = Math.random().toString(36).substring(2, 10);
    return { email, password };
  };

  const handleDemoSignup = async() => {
    const { email, password } = generateRandomCredentials();

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      let result = await axios.post(`${serverUrl}/api/auth/signup`, {
        email: email,
        name: 'Recruiter',
        password: password
      }, { withCredentials: true });
      setUserData(result.data)
      console.log(result.data);
      setSuccess('Demo account created successfully! Redirecting...');

      // Navigate to customize page after demo signup
      navigate('/customize');

    } catch (error) {
      console.log(error);
      setUserData(null)
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else if (error.response && error.response.status === 400) {
        setError('Failed to create demo account. Please try again.');
      } else if (error.response && error.response.status === 409) {
        setError('Demo account conflict. Please try again.');
      } else {
        setError('Network error. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-in-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      {/* Scratch Card Overlay */}
      {!isScratched && (
        <div className="fixed top-4 left-4 z-40">
          <div className="relative">
            {/* Scratch Surface */}
            <div
              className={`relative bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                isScratching ? 'animate-pulse' : ''
              }`}
              onMouseDown={() => setIsScratching(true)}
              onMouseUp={() => {
                setIsScratching(false);
                setTimeout(() => setIsScratched(true), 500);
              }}
              onMouseLeave={() => setIsScratching(false)}
            >
              {/* Scratch Pattern Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-silver via-gray-300 to-gray-400 rounded-xl opacity-90"></div>

              {/* Scratch Text */}
              <div className="relative z-10 text-center">
                <p className="text-gray-800 font-bold text-sm">
                  Recruiter??
                </p>
                <p className="text-gray-700 text-xs mt-1">
                  Scratch here 👆
                </p>
              </div>

              {/* Scratch Effects */}
              {isScratching && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse rounded-xl"></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Revealed Demo Button */}
      {isScratched && (
        <div className="fixed top-4 left-4 z-40 animate-fadeIn">
          <button
            onClick={handleDemoSignup}
            disabled={isLoading}
            className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-bold px-4 py-3 rounded-xl shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            🎭 Demo Access
          </button>
        </div>
      )}
      

      <div className="h-screen w-screen fixed inset-0 overflow-hidden">
      {/* Background Image with Fallback */}
      <div 
        className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* AI-themed Pattern Overlay as Fallback */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #00f5ff 1px, transparent 1px),
                             radial-gradient(circle at 75% 75%, #ff0080 1px, transparent 1px),
                             radial-gradient(circle at 25% 75%, #8000ff 1px, transparent 1px)`,
            backgroundSize: '100px 100px, 150px 150px, 200px 200px'
          }}></div>
        </div>
        
        {/* Gradient Overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent"></div>
      </div>

      {/* Animated Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Data Particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-70 animate-pulse"
            style={{
              left: `${10 + Math.random() * 40}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          ></div>
        ))}
        
        {/* Circuit Lines */}
        <div className="absolute left-0 top-1/4 w-64 h-px bg-gradient-to-r from-cyan-400/50 to-transparent animate-pulse"></div>
        <div className="absolute left-0 top-1/2 w-48 h-px bg-gradient-to-r from-purple-400/50 to-transparent animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute left-0 top-3/4 w-56 h-px bg-gradient-to-r from-pink-400/50 to-transparent animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 h-full flex">
        {/* Left Side - Form Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-3 lg:p-6 overflow-y-auto hide-scrollbar" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
          <div className="w-full max-w-sm lg:max-w-md my-auto">
            {/* Futuristic Form Container */}
            <form onSubmit={handleSignUp}>
              <div className="relative">
                {/* Glowing Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-sm opacity-30 animate-pulse"></div>
                
                {/* Main Form Card */}
                <div className="relative bg-black/60 backdrop-blur-2xl border border-cyan-400/30 rounded-3xl shadow-2xl p-6 lg:p-8 overflow-hidden">
                  {/* Animated Corner Decorations */}
                  <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-cyan-400 rounded-tl-3xl opacity-60"></div>
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-pink-400 rounded-br-3xl opacity-60"></div>
                  
                  {/* Header Section */}
                  <div className="text-center mb-6 lg:mb-8">
                    
                    <h1 className="text-2xl lg:text-4xl font-bold mb-2">
                      <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Virtual Assistant
                      </span>
                    </h1>
                    <p className="text-sm lg:text-base text-gray-400 mb-2">
                      Created by <span className="text-cyan-400 font-semibold">Rohit Kumar</span>
                    </p>
                    <h2 className="text-lg lg:text-2xl font-semibold text-white mb-2">
                      Access Portal
                    </h2>
                    
                    {/* Status Messages */}
                    {error && (
                      <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                        {error}
                      </div>
                    )}
                    {success && (
                      <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-sm">
                        {success}
                      </div>
                    )}
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4 lg:space-y-6">
                    {/* Name Field */}
                    <div className="relative group">
                      <label className="block text-cyan-400 text-xs font-semibold mb-2 uppercase tracking-wide">
                        User Name <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="w-5 h-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-12 pr-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 hover:border-gray-500"
                          placeholder="Enter full name"
                        />
                        {/* Field Glow Effect */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="relative group">
                      <label className="block text-cyan-400 text-xs font-semibold mb-2 uppercase tracking-wide">
                        Email <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-12 pr-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 hover:border-gray-500"
                          placeholder="name@gmail.com"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="relative group">
                      <label className="block text-cyan-400 text-xs font-semibold mb-2 uppercase tracking-wide">
                        Password <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          minLength="6"
                          className="w-full pl-12 pr-12 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 hover:border-gray-500"
                          placeholder="Enter secure passkey (min 6 chars)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-cyan-400 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Connecting...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          Sign Up
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                      
                      {/* Button Scan Line Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 lg:mt-8 text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-cyan-400/50"></div>
                      <span className="px-4 text-gray-400 text-xs uppercase tracking-wider">System Status</span>
                      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-purple-400/50"></div>
                    </div>
                    
                    <p className="text-gray-300 text-sm">
                      Already connected ?{" "}
                      <button 
                        type="button"
                        onClick={handleSignInNavigation}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors hover:underline"
                      >
                        Access Portal
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Background Space */}
        <div className="hidden lg:block lg:w-1/2">
          {/* This space allows the full background image to show through */}
        </div>
      </div>
    </div>
    </>
  );
};

export default SignUp;