import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, KeyRound, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BASE_URL from '../../api';

export default function Login() {
  const navigate = useNavigate();

  // ✅ FIXED: use login instead of setUser
  const { user, login } = useAuth();

  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(`/${user.role}`);
    }
  }, [user, navigate]);

  // 🔥 REAL BACKEND LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email & password");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.status === "success") {
        // ✅ Use AuthContext login
        login(data.user);

        // Save in localStorage
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirect safely
        navigate(`/${data.user?.role || 'student'}`);
      } else {
        alert(data.message || "Invalid login credentials!");
      }

    } catch (error) {
      console.error(error);
      alert("Server not reachable");
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
          Empowering academic excellence
        </p>
      </div>

      {/* Card */}
      <div className="card w-full max-w-md relative z-10 p-8 rounded-3xl border shadow-xl bg-white dark:bg-gray-800">
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-1">
            Login to your dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">

          {/* ROLE */}
          <div>
            <label className="text-xs font-bold text-gray-500 mb-3 block text-center">
              Select Role
            </label>

            <div className="grid grid-cols-3 gap-2 bg-gray-100 rounded-xl p-1">
              {['student', 'mentor', 'admin'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 rounded-lg font-semibold capitalize ${
                    role === r
                      ? 'bg-white text-indigo-600 shadow'
                      : 'text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-xs font-bold text-gray-500 mb-2 block">
              Email
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

          {/* PASSWORD */}
          <div>
            <label className="text-xs font-bold text-gray-500 mb-2 block">
              Password
            </label>

            <div className="relative">
              <KeyRound className="absolute left-4 top-3 text-gray-400 w-5 h-5" />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-12 h-12"
                placeholder="Enter password"
              />
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full h-12 font-semibold"
          >
            {isLoading ? "Signing In..." : "Sign In →"}
          </button>
        </form>

        <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500 mt-6 space-y-3 sm:space-y-0">
          <p>
            Don't have access?{" "}
            <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
              Register
            </Link>
          </p>
          <Link to="/forgot-password" className="text-gray-500 hover:text-indigo-600 transition-colors">
            Forgot Password?
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-xs text-gray-400">
        Secured System 🔒
      </div>
    </div>
  );
}