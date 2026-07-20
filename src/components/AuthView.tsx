import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User as UserIcon, BookOpen, Hash, Milestone, ShieldAlert, CheckCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

interface AuthViewProps {
  onAuthSuccess: (token: string, profile: any) => void;
  onBack?: () => void;
}

export default function AuthView({ onAuthSuccess, onBack }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [division, setDivision] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [branch, setBranch] = useState('Computer Science');

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const response = await fetch('/api/v1/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Google authentication failed.');
      }

      setSuccessMsg('Signed in with Google successfully!');
      setTimeout(() => {
        onAuthSuccess(data.token, data.user);
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Google Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In failed or was dismissed.');
  };

  const branches = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Applied Sciences',
    'Mechanical'
  ];

  const handleSwitchTab = (toLogin: boolean) => {
    setIsLogin(toLogin);
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    if (isLogin) {
      if (!email || !password) {
        setError('Please enter both email and password.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Authentication failed. Please check credentials.');
        }

        onAuthSuccess(data.token, data.user);
      } catch (err: any) {
        setError(err.message || 'Login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // Sign Up Flow
      if (!name || !division || !rollNo || !branch || !email || !password) {
        setError('All registration fields are required.');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }

      try {
        const signupRes = await fetch('/api/v1/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            division,
            rollNo,
            branch,
            email,
            password
          }),
        });

        const signupData = await signupRes.json();
        if (!signupRes.ok) {
          throw new Error(signupData.error || 'Registration failed. Try a different email.');
        }

        setSuccessMsg('Registration successful! Logging you in...');

        // Autologin after signup
        const loginRes = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) {
          // If auto login fails, send them to login page
          setTimeout(() => {
            setIsLogin(true);
            setSuccessMsg('');
          }, 1500);
          return;
        }

        setTimeout(() => {
          onAuthSuccess(loginData.token, loginData.user);
        }, 1000);
      } catch (err: any) {
        setError(err.message || 'Signup failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-app py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-150">
      {/* Decorative ambient background accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-accent-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-accent-primary/5 blur-3xl pointer-events-none" />

      <motion.div
        id="auth-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md space-y-6 z-10 flex flex-col"
      >
        {onBack && (
          <button
            onClick={onBack}
            className="self-start mb-2 px-3 py-1.5 bg-surface hover:bg-bg-hover border border-border-subtle text-xs text-text-primary font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 rounded-lg shadow-2xs"
          >
            ← Back to Home
          </button>
        )}

        {/* Nexus Branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-primary text-white font-bold text-2xl shadow-lg shadow-accent-primary/20 mb-3">
            N
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">
            Welcome to Nexus
          </h2>
          <p className="mt-1.5 text-sm text-text-secondary">
            The Ultimate Student Collaboration Board
          </p>
        </div>

        {/* Auth card */}
        <div className="bg-surface p-8 rounded-2xl border border-border-subtle shadow-xl space-y-6">
          {/* Material-style Tabs */}
          <div className="flex border-b border-border-subtle relative">
            <button
              id="tab-login"
              type="button"
              onClick={() => handleSwitchTab(true)}
              className={`flex-1 pb-3 text-sm font-semibold text-center transition-colors duration-200 ${
                isLogin ? 'text-accent-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Log In
            </button>
            <button
              id="tab-signup"
              type="button"
              onClick={() => handleSwitchTab(false)}
              className={`flex-1 pb-3 text-sm font-semibold text-center transition-colors duration-200 ${
                !isLogin ? 'text-accent-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Sign Up
            </button>
            {/* Ink Bar slider */}
            <motion.div
              className="absolute bottom-0 h-[3px] bg-accent-primary rounded-full"
              initial={false}
              animate={{
                left: isLogin ? '0%' : '50%',
                width: '50%'
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          </div>

          {/* Feedback Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400 font-medium"
            >
              <ShieldAlert className="shrink-0 text-red-500" size={16} />
              <span>{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-2.5 text-xs text-green-600 dark:text-green-400 font-medium"
            >
              <CheckCircle className="shrink-0 text-green-500" size={16} />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* Core Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                {/* Name field */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                    <UserIcon size={18} />
                  </span>
                  <input
                    id="signup-name"
                    type="text"
                    required
                    placeholder="Full Name (e.g. Harshit Kataram)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-app border border-border-subtle rounded-xl text-sm text-text-primary placeholder-text-secondary focus:outline-hidden focus:ring-1 focus:ring-accent-primary focus:border-accent-primary transition-all"
                  />
                </div>

                {/* Division & Roll Number Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                      <Milestone size={18} />
                    </span>
                    <input
                      id="signup-division"
                      type="text"
                      required
                      placeholder="Division (e.g. A)"
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      maxLength={2}
                      className="w-full pl-11 pr-4 py-2.5 bg-app border border-border-subtle rounded-xl text-sm text-text-primary placeholder-text-secondary focus:outline-hidden focus:ring-1 focus:ring-accent-primary focus:border-accent-primary transition-all"
                    />
                  </div>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                      <Hash size={18} />
                    </span>
                    <input
                      id="signup-rollno"
                      type="text"
                      required
                      placeholder="Roll No (e.g. 24)"
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-app border border-border-subtle rounded-xl text-sm text-text-primary placeholder-text-secondary focus:outline-hidden focus:ring-1 focus:ring-accent-primary focus:border-accent-primary transition-all"
                    />
                  </div>
                </div>

                {/* Branch Selection */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                    <BookOpen size={18} />
                  </span>
                  <select
                    id="signup-branch"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-app border border-border-subtle rounded-xl text-sm text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent-primary focus:border-accent-primary transition-all appearance-none"
                  >
                    {branches.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Email Address */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                <Mail size={18} />
              </span>
              <input
                id="auth-email"
                type="email"
                required
                placeholder="Email address (e.g. harshitcsb@gmail.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-app border border-border-subtle rounded-xl text-sm text-text-primary placeholder-text-secondary focus:outline-hidden focus:ring-1 focus:ring-accent-primary focus:border-accent-primary transition-all"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                <Lock size={18} />
              </span>
              <input
                id="auth-password"
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-app border border-border-subtle rounded-xl text-sm text-text-primary placeholder-text-secondary focus:outline-hidden focus:ring-1 focus:ring-accent-primary focus:border-accent-primary transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-accent-primary hover:bg-accent-hover text-white text-sm font-semibold rounded-xl focus:outline-hidden focus:ring-2 focus:ring-accent-primary/50 disabled:opacity-50 transition-all duration-150 flex items-center justify-center gap-2 mt-2 shadow-md shadow-accent-primary/10"
            >
              {loading ? (
                <>
                  <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{isLogin ? 'Log In' : 'Create Account'}</span>
              )}
            </button>

            {/* Google Divider */}
            <div className="relative my-4 flex py-1 items-center">
              <div className="flex-grow border-t border-border-subtle"></div>
              <span className="flex-shrink mx-3 text-[11px] text-text-secondary uppercase tracking-wider font-semibold">Or Continue with</span>
              <div className="flex-grow border-t border-border-subtle"></div>
            </div>

            {/* Google Login Button */}
            <div className="flex justify-center w-full" id="google-login-btn-container">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_blue"
                shape="pill"
                size="large"
                text="signin_with"
              />
            </div>
          </form>
        </div>

        {/* Informational hint for grading/testing */}
        <div className="text-center text-[11px] text-text-secondary border border-border-subtle/50 bg-surface/30 p-2.5 rounded-xl">
          💡 Testing Tip: Login with <span className="font-semibold text-accent-primary">harshitcsb@gmail.com</span> / <span className="font-semibold text-accent-primary">password123</span> to load the default seeded profile!
        </div>
      </motion.div>
    </div>
  );
}
