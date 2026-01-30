import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from 'axios'
import { useToken } from "../../context/StoreProvider";
import { toast } from 'react-hot-toast';
import Loader from "../components/Loader";

export const FadeUp = (delay) => {
    return {
        initial: {
            opacity: 0,
            y: 50,
        },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                duration: 0.5,
                delay: delay,
                ease: "easeInOut"
            }
        }
    }
}

const Login = () => {
    const [activeTab, setActiveTab] = useState("register");
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false);
    const { setToken, setRegisterToken } = useToken();


    const navigate = useNavigate()

    const baseUrl = import.meta.env.VITE_AUTHBASE_URL;

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError("");
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const requestOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = isLogin
                ? `${baseUrl}/kitchen-loginOtp`
                : `${baseUrl}/kitchen/send-otp`;
            const response = await axios.post(endpoint, {
                phone: phoneNumber,
            });
            setOtpSent(true)
            toast.success(response.data.message)
        } catch (error) {
            // Handle specific error for "number already exists"
            if (error.response?.status === 409) {
                setError('Phone number already exists. Please log in or use a different number.');
            } else {
                // console.error('Error sending OTP:', error.response?.data || error.message);
                setError(error.response?.data?.message || 'Failed to send OTP');
            }
        } finally {
            setLoading(false);
        }
    };

const verifyOTP = async (e) => {
  e.preventDefault();
  if (!otp || otp.length !== 6) {
    return setError("Enter a valid 6-digit OTP");
  }

  setLoading(true);
  try {
    const endpoint = isLogin
      ? `${baseUrl}/kitchen-loginverifyOtp`
      : `${baseUrl}/kitchen/verify-otp`;

    const { data } = await axios.post(endpoint, { phone: phoneNumber, otp });

    if (isLogin) {
      const { token, kitchen } = data;
      
      // ✅ Save token & kitchenId for WebSocket and authentication
      localStorage.setItem("kitchenToken", token);
      localStorage.setItem("kitchenId", kitchen?.id); 

      setToken(token);
      toast.success(data.message || "Login successful");

      navigate("/dashboard");
    } else {
      const { token, kitchen } = data;

      localStorage.setItem("RegisterToken", token);
      if (kitchen?.id) localStorage.setItem("kitchenId", kitchen.id);
      setRegisterToken(token);

      toast.success(data.message || "OTP verified successfully");
      navigate("/register", { state: { phone: phoneNumber } });
    }
  } catch (err) {
    toast.error(err.response?.data?.message || "Invalid OTP");
  } finally {
    setLoading(false);
  }
};



    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (otpSent) {
                verifyOTP(e);
            } else {
                requestOTP(e);
            }
        }
    };

    // const formatPhoneNumber = (phoneNumber) => {
    //     if (phoneNumber.length !== 10) return phoneNumber;
    //     return `XXXX-XX-${phoneNumber.slice(-4)}`;
    // };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Left Image Section */}
            <div className="w-full md:w-1/2 h-[400px] md:h-screen bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: "url('/img.jpg')" }}>
                <div className="absolute inset-0  bg-opacity-60 flex flex-col items-center justify-center px-4 sm:px-6 text-white text-center">
                    <div

                        className="bg-black bg-opacity-60 p-4 sm:p-6 rounded-lg shadow-lg max-w-md sm:max-w-xl border-2 border-[#76694D] ">
                        <div className="flex justify-center mb-4 ">
                            <motion.img
                                variants={FadeUp(0.9)}
                                initial="initial"
                                animate="animate"
                                src="/logo.png" className="w-[150px] h-[50px]  " alt="logo" />
                        </div>


                        <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold mb-2 sm:mb-4 md:py-4">
                            Partner with BiteBuddie and grow your business
                        </h1>
                        <p className="text-sm sm:text-lg">
                            0% commission for the 1st month for new restaurant partners
                        </p>
                    </div>
                </div>
            </div>


            {/* Right Form Section */}
            <div className="md:w-1/2 w-full flex items-center justify-center p-6 bg-white">
                <div className="w-full max-w-md">

                    {/* Tabs */}
                    <div className="flex justify-between border-b mb-6">
                        <button
                            className={`w-1/2 py-2 text-lg font-semibold ${activeTab === "register" ? "text-[#D9291A] border-b-2 border-[#D9291A]" : "text-gray-400"}`}
                            onClick={() => {
                                setActiveTab("register");
                                setPhoneNumber("");
                                setError("");
                                setIsLogin(false);
                                setOtpSent(false);
                            }}
                        >
                            Register
                        </button>
                        <button
                            className={`w-1/2 py-2 text-lg font-semibold ${activeTab === "login" ? "text-[#D9291A] border-b-2 border-[#D9291A]" : "text-gray-400"}`}
                            onClick={() => {
                                setActiveTab("login");
                                setPhoneNumber("");
                                setError("");
                                setIsLogin(true);
                                setOtpSent(false);
                            }}
                        >
                            Login
                        </button>
                    </div>



                    {/* Form */}
                    <div>
                        {error && <p className="bg-red-100 text-red-700 text-center px-3 py-2 rounded mb-4">{error}</p>}

                        <div className="relative">
                            <input
                                type="tel"
                                id="floating_outlined"
                                className="block w-full px-2.5 pb-2.5 pt-4 text-sm text-black bg-transparent border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:ring-red-500 focus:border-red-600 dark:text-black dark:border-gray-600 dark:focus:border-red-500 peer appearance-none hide-spinner"
                                placeholder=" "
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                maxLength={10}
                                disabled={otpSent}
                            />
                            <label
                                htmlFor="floating_outlined"
                                className="absolute text-sm text-black dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 left-2.5 z-10 origin-[0] bg-white px-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-red-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2"
                            >
                                Enter mobile number
                            </label>
                        </div>

                        {otpSent && (
                            <div className="relative">
                                <input
                                    type="tel"
                                    id="floating_outlined"
                                    className="block w-full mt-2 px-2.5 pb-2.5 pt-4 text-sm text-black bg-transparent border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:ring-red-500 focus:border-red-600 dark:text-black dark:border-gray-600 dark:focus:border-red-500 peer appearance-none hide-spinner"
                                    placeholder=" "
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                />
                                <label
                                    htmlFor="floating_outlined"
                                    className="absolute text-sm text-black dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 left-2.5 z-10 origin-[0] bg-white px-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-red-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2"
                                >
                                    Enter OTP
                                </label>
                            </div>
                        )}

                        <button
                            onClick={otpSent ? verifyOTP : requestOTP}
                            className={`w-full text-white mt-4 py-3 rounded text-lg transition-all ${otpSent ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-400 hover:bg-gray-500'
                                }`}
                        >
                            {loading ? <Loader /> : (isLogin ? 'Login' : 'Register')}
                        </button>

                    </div>
                </div>
            </div>
        </div>

    );
};

export default Login;