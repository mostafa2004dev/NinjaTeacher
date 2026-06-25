import React, { useEffect, useState } from 'react'
import Validmessage from '../../../component/shared/validationMessage/validmessage';
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import { Alert } from "@heroui/react";
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, Zap, MessageCircle, TrendingUp } from 'lucide-react';
import { Loginschema } from '../../../schema/login.schema'
import { Authcontext } from '../../../context/Authcontext';
import { useContext } from 'react';

const Singin_API = 'http://localhost:3000/auth/login'

export default function Login() {

  let timout_ID;
  const { SaveUserToken } = useContext(Authcontext)
  const [errorMessage, seterrorMessage] = useState("")
  const [isSuccess, setisSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const Navigate = useNavigate()
  const { handleSubmit, register, formState: { errors, touchedFields, isSubmitting } } = useForm({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(Loginschema)
  });

  async function submitForm(data) {
    try {
      const response = await axios.post(Singin_API, data)

      setisSuccess("Logged in successfully")
      const token = response.data.data.token
      SaveUserToken(token)

      const role = response.data.data.user.role

      timout_ID = setTimeout(() => {
        if (role === "admin") {
          Navigate('/Admin')
        } else if (role === "teacher") {
          const surveyDone = !!response.data.data.user.survey_submitted_at
          Navigate(surveyDone ? '/TeacherPortal' : '/TeacherSurvey')
        } else {
          Navigate('/')
        }
      }, 1000);

    } catch (error) {
      seterrorMessage(error?.response?.data?.message || "Something went wrong")
    }
  }

  useEffect(() => {
    return () => clearTimeout(timout_ID);
  }, [timout_ID]);

  const features = [
    { icon: Zap, title: "Smart Matching", desc: "AI finds your perfect fit" },
    { icon: MessageCircle, title: "Easy Communication", desc: "Connect instantly with matches" },
    { icon: TrendingUp, title: "Better Opportunities", desc: "Unlock your full potential" },
  ];

  const bullets = [
    "AI-powered recommendations for perfect matches",
    "Seamless connections between teachers & schools",
    "Fast, modern, and intuitive experience",
  ];

  return (
    <div className="bg-[#faf5ff] dark:bg-[#0d0f1a] flex items-center justify-center p-6 min-h-[calc(100vh-136px)] transition-colors duration-300">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-2xl">

        {/* Left - Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-14 py-12 bg-white dark:bg-[#111827]">

          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-[#295AFC] to-[#9b59ff] rounded-xl flex items-center justify-center shadow-md shadow-[#295AFC]/30">
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M12 3L4 7v5c0 5.25 3.4 10.15 8 11.35C16.6 22.15 20 17.25 20 12V7l-8-4z" />
              </svg>
            </div>
            <span className="text-[#6d4cff] font-bold text-base tracking-tight">Ninja Teacher</span>
          </div>

          <h1 className="text-[1.75rem] font-bold text-gray-900 dark:text-[#f1f0ff] mb-1 leading-tight">Welcome Back! 👋</h1>
          <p className="text-gray-400 dark:text-[#9d94c4] text-sm mb-8">Sign in to continue your journey</p>

          <div className="space-y-4">
            {errorMessage && <Alert hideIconWrapper color="danger" description={errorMessage} title="Please try again" variant="bordered" />}
            {isSuccess && <Alert hideIconWrapper color="success" description={isSuccess} title="Welcome back" variant="bordered" />}

            <form onSubmit={handleSubmit(submitForm)} className="space-y-5">

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-[#c4b5fd]">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full border border-gray-200 dark:border-[#2d3748] rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-[#e8e4ff] dark:bg-[#1a2236] placeholder:text-gray-400 dark:placeholder:text-[#4b5563] outline-none focus:border-[#6d4cff] focus:ring-1 focus:ring-[#6d4cff] transition"
                  {...register("email")}
                />
                <Validmessage field={errors.email} isTouched={touchedFields.email} />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-[#c4b5fd]">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full border border-gray-200 dark:border-[#2d3748] rounded-xl px-4 py-3 pr-12 text-sm text-gray-800 dark:text-[#e8e4ff] dark:bg-[#1a2236] placeholder:text-gray-400 dark:placeholder:text-[#4b5563] outline-none focus:border-[#6d4cff] focus:ring-1 focus:ring-[#6d4cff] transition"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#6b7280] hover:text-gray-600 dark:hover:text-[#9d94c4]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Validmessage field={errors.password} isTouched={touchedFields.password} />
              </div>

              {/* Remember / Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-[#9d94c4] cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 dark:border-[#2d3748] dark:bg-[#1a2236]" />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-sm text-[#6d4cff] font-medium hover:underline">Forgot Password?</Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-br from-[#295AFC] to-[#9b59ff] hover:from-[#1f4df5] hover:to-[#8d4dff] text-white font-semibold py-3.5 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#295AFC]/30"
              >
                {isSubmitting ? (
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <>
                    Sign In
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-2">
              <span className="text-gray-500 dark:text-[#9d94c4] text-sm">Don't have an account? </span>
              <Link to="/register" className="text-[#6d4cff] text-sm font-semibold hover:underline">Sign up for free →</Link>
            </div>
            <div className="text-center mt-1">
              <Link to="/admin-login" className="text-gray-400 dark:text-[#6b7280] text-xs hover:text-[#6d4cff] transition">Admin? Sign in here →</Link>
            </div>
          </div>
        </div>

        {/* Right - Banner */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#295AFC] to-[#9b59ff] flex-col items-center justify-center px-12 py-14 text-white">

          {/* Sparkle Icon */}
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-7">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill="white" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-center mb-3 leading-snug">Find the Perfect<br />Educational Match</h2>
          <p className="text-white/70 text-center text-sm mb-8 leading-relaxed px-2">
            AI-powered platform connecting talented teachers<br />with exceptional schools.
          </p>

          {/* Feature Cards */}
          <div className="w-full space-y-3 mb-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 bg-white/15 hover:bg-white/20 transition-colors rounded-2xl px-5 py-3.5">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{title}</div>
                  <div className="text-xs text-white/60 mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bullet Points */}
          <ul className="w-full space-y-2.5">
            {bullets.map((point) => (
              <li key={point} className="flex items-center gap-3 text-sm text-white/80">
                <svg className="w-4 h-4 shrink-0 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {point}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  )
}