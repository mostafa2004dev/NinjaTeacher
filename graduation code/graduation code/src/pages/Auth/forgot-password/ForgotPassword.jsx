import React, { useState } from 'react';
import { Link } from 'react-router';
import { Alert } from '@heroui/react';
import { Mail } from 'lucide-react';

const FORGOT_PASSWORD_API = 'http://localhost:3000/auth/forgot-password';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(FORGOT_PASSWORD_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || 'If this email exists, a reset link has been sent.');
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#faf5ff] dark:bg-[#0d0f1a] flex items-center justify-center p-6 min-h-[calc(100vh-136px)] transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-[#111827] rounded-3xl shadow-2xl px-8 md:px-14 py-12">

          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-[#295AFC] to-[#9b59ff] rounded-xl flex items-center justify-center shadow-md shadow-[#295AFC]/30">
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M12 3L4 7v5c0 5.25 3.4 10.15 8 11.35C16.6 22.15 20 17.25 20 12V7l-8-4z" />
              </svg>
            </div>
            <span className="text-[#6d4cff] font-bold text-base tracking-tight">Ninja Teacher</span>
          </div>

          <div className="w-12 h-12 bg-[#eff4ff] rounded-2xl flex items-center justify-center mb-5">
            <Mail className="w-6 h-6 text-[#5d3bdc]" />
          </div>

          <h1 className="text-[1.75rem] font-bold text-gray-900 dark:text-[#f1f0ff] mb-1 leading-tight">Forgot Password?</h1>
          <p className="text-gray-400 dark:text-[#9d94c4] text-sm mb-8">
            Enter your email and we'll send you a reset link.
          </p>

          <div className="space-y-4">
            {error   && <Alert hideIconWrapper color="danger"  description={error}   title="Error"   variant="bordered" />}
            {success && <Alert hideIconWrapper color="success" description={success} title="Email sent" variant="bordered" />}

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#c4b5fd]">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-200 dark:border-[#2d3748] rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-[#e8e4ff] dark:bg-[#1a2236] placeholder:text-gray-400 dark:placeholder:text-[#4b5563] outline-none focus:border-[#6d4cff] focus:ring-1 focus:ring-[#6d4cff] transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-br from-[#295AFC] to-[#9b59ff] hover:from-[#1f4df5] hover:to-[#8d4dff] text-white font-semibold py-3.5 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#295AFC]/30"
                >
                  {loading ? (
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : 'Send Reset Link'}
                </button>
              </form>
            )}

            <div className="text-center mt-2">
              <Link to="/login" className="text-[#6d4cff] text-sm font-semibold hover:underline">← Back to Sign In</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
