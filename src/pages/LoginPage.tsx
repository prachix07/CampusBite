import { useState } from 'react';
import { UtensilsCrossed, Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onNavigate: (view: string) => void;
  onLoginSuccess?: () => void;
}

export function LoginPage({ onNavigate, onLoginSuccess }: LoginPageProps) {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (result.success) {
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        onNavigate('menu');
      }
    } else {
      setError(result.error || 'Invalid email or password.');
    }
  };

  const handleFillDemo = (role: 'student' | 'admin') => {
    if (role === 'student') {
      setEmail('aarav.sharma@college.edu');
      setPassword('studentSecret123');
    } else {
      setEmail('admin@campusbite.com');
      setPassword('adminPassword123');
    }
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Sign In to CampusBite
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Access your pre-orders, scheduled slots, and canteen dashboard
          </p>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs space-y-2">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            Quick Test Accounts:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('student')}
              className="py-1.5 px-2.5 rounded-lg bg-white border border-stone-200 hover:border-amber-400 text-stone-700 font-medium text-[11px] text-center transition-colors"
            >
              Fill Student Login
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="py-1.5 px-2.5 rounded-lg bg-white border border-stone-200 hover:border-purple-400 text-purple-700 font-medium text-[11px] text-center transition-colors"
            >
              Fill Admin Login
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Authentication Error</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">College Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="e.g. aarav.sharma@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-800 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-800 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white font-bold text-sm transition-all shadow-xs flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-stone-100 text-xs text-stone-500">
          <span>New student to CampusBite? </span>
          <button
            onClick={() => onNavigate('register')}
            className="font-bold text-amber-700 hover:text-amber-800"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
}
