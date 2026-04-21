import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, KeyRound, Mail, User } from 'lucide-react';
import BASE_URL from '../../api';

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !role) {
      alert("Please fill out all fields");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await res.json();

      if (data.status === "success") {
        alert("Registration successful! Please login.");
        navigate('/login');
      } else {
        alert(data.message || "Registration failed!");
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
          <h2 className="text-2xl font-bold">Create an Account</h2>
          <p className="text-sm text-gray-500 mt-1">
            Join the ecosystem
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">

          {/* NAME */}
          <div>
            <label className="text-xs font-bold text-gray-500 mb-2 block">
              Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field pl-12 h-12"
                placeholder="Enter full name"
              />
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

          {/* ROLE */}
          <div>
            <label className="text-xs font-bold text-gray-500 mb-2 block">
              System Role
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-field h-12 appearance-none pl-4"
              >
                <option value="student">Student</option>
                <option value="mentor">Mentor</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full h-12 font-semibold mt-2"
          >
            {isLoading ? "Creating..." : "Sign Up →"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
            Login here
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
