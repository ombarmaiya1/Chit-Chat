import React, { useState } from 'react';
import assets from '../../assets/assets';
import { loginUser, registerUser } from '../../logic';

export default function AuthPage({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (isSignUp && !fullName) {
      setError('Please enter your full name.');
      return;
    }
    if (isSignUp && !agreed) {
      setError('Please agree to the terms of use & privacy policy.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Register new user via backend logic
        await registerUser({
          fullName,
          email,
          password,
          description: description || '',
        });

        // Automatically log in on successful registration
        const loginRes = await loginUser({ email, password });
        onLoginSuccess(loginRes.user);
      } else {
        // Log in user via backend logic
        const res = await loginUser({ email, password });
        onLoginSuccess(res.user);
      }
    } catch (err) {
      console.warn('[Auth Request Error]', err);
      // Cleanly propagate server errors and connection issues without fabricating fake authenticated sessions
      if (err.isAxiosError && !err.status) {
        setError('Unable to connect to authentication server. Please check your network or server status.');
      } else {
        setError(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#05040a] bg-chitchat flex items-center justify-center p-4 md:p-8 overflow-hidden select-none">
      {/* Ambient background glow elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-700/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-700/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-20">
        
        {/* Left Side: Logo & Branding */}
        <div className="flex flex-col items-center justify-center text-center md:items-center w-full md:w-1/2">
          <div className="relative group">
            <img 
              src={assets.logo_big} 
              alt="chit-Chat Logo" 
              className="w-56 md:w-72 lg:w-80 h-auto drop-shadow-[0_10px_35px_rgba(147,110,255,0.45)] transition duration-500 hover:scale-105"
            />
          </div>
        </div>

        {/* Right Side: Auth Glassmorphic Card */}
        <div className="w-full md:w-[420px] lg:w-[440px]">
          <div className="glass-card rounded-2xl p-7 md:p-9 shadow-glass border border-white/10 relative overflow-hidden">
            
            {/* Subtle card internal glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

            <h2 className="text-2xl font-bold text-white mb-6 tracking-wide">
              {isSignUp ? 'Sign up' : 'Login'}
            </h2>

            {error && (
              <div className="mb-4 text-xs bg-red-500/20 border border-red-500/40 text-red-200 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {isSignUp && (
                <>
                  <div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-4 py-3 rounded-lg glass-input text-sm text-white placeholder-gray-400 focus:outline-none transition duration-200"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Description / Bio (Optional)"
                      className="w-full px-4 py-3 rounded-lg glass-input text-sm text-white placeholder-gray-400 focus:outline-none transition duration-200"
                    />
                  </div>
                </>
              )}

              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full px-4 py-3 rounded-lg glass-input text-sm text-white placeholder-gray-400 focus:outline-none transition duration-200"
                />
              </div>

              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 rounded-lg glass-input text-sm text-white placeholder-gray-400 focus:outline-none transition duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-lg btn-primary-purple text-white font-medium text-sm tracking-wide shadow-lg shadow-purple-600/30 transition duration-200 active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{isSignUp ? 'Creating Account...' : 'Logging In...'}</span>
                  </>
                ) : (
                  <span>{isSignUp ? 'Create Account' : 'Login Now'}</span>
                )}
              </button>

              {/* Terms Checkbox - Sign Up only */}
              {isSignUp && (
                <div className="flex items-center gap-2.5 mt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 bg-purple-950/40 text-purple-600 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#936EFF]"
                  />
                  <label htmlFor="terms" className="text-xs text-gray-300 cursor-pointer select-none">
                    Agree to the terms of use & privacy policy.
                  </label>
                </div>
              )}

              {/* Mode Toggle Footer */}
              <div className="mt-4 text-center text-xs text-gray-300">
                {isSignUp ? (
                  <span>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(false);
                        setError('');
                      }}
                      className="text-[#936EFF] hover:text-purple-400 font-semibold underline underline-offset-2 ml-1 transition"
                    >
                      Login here
                    </button>
                  </span>
                ) : (
                  <span>
                    Create an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(true);
                        setError('');
                      }}
                      className="text-[#936EFF] hover:text-purple-400 font-semibold underline underline-offset-2 ml-1 transition"
                    >
                      Click here
                    </button>
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
