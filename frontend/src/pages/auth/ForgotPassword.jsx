import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, KeyRound, Mail } from 'lucide-react';
import BASE_URL from '../../api';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email || !newPassword) {
      alert("Please enter both email and your new password");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, new_password: newPassword })
      });

      const data = await res.json();

      if (data.status === "success") {
        alert("Password reset successfully! Please login with your new password.");
        navigate('/login');
      } else {
        alert(data.message || "Reset failed!");
      }

    } catch (error) {
      console.error(error);
      alert("Server not reachable. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900 p-4 relative overflow-hidden">
      
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-900/20 z-0" />
      
      {/* Logo */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center mb-8">
        <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg">
          <BookOpen className="text-white w-7 h-7" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Mentorship Pro
        </h1>
        <p className="text-gray-500 text-center">
          Account Recovery
        </p>
      </div>

      {/* Card */}
      <div className="card w-full max-w-md relative z-10 p-8 rounded-3xl border shadow-xl bg-white dark:bg-gray-800">
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Reset Password</h2>
          <p className="text-sm text-gray-500 mt-1">
            Create a new password to access your account
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">

          {/* EMAIL */}
          <div>
            <label className="text-xs font-bold text-gray-500 mb-2 block">
              Account Email
            </label>

            <div className="relative">
              <Mail className="absolute left-4 top-3 text-gray-400 w-5 h-5" />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-12 h-12"
                placeholder="Enter email"
              />
            </div>
          </div>

          {/* NEW PASSWORD */}
          <div>
            <label className="text-xs font-bold text-gray-500 mb-2 block">
              New Password
            </label>

            <div className="relative">
              <KeyRound className="absolute left-4 top-3 text-gray-400 w-5 h-5" />

              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field pl-12 h-12"
                placeholder="Enter new password"
              />
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full h-12 font-semibold"
          >
            {isLoading ? "Resetting..." : "Reset Password →"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Remebered your password?{" "}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
            Back to Login
          </Link>
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-xs text-gray-400">
        Secured System 🔒
      </div>
    </div>
  );
}
