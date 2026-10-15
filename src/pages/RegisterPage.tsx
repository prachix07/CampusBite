import { useState } from 'react';
import { UtensilsCrossed, Lock, Mail, User as UserIcon, Phone, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RegisterPageProps {
  onNavigate: (view: string) => void;
  onRegisterSuccess?: () => void;
}

export function RegisterPage({ onNavigate, onRegisterSuccess }: RegisterPageProps) {
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid college email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const result = await register(fullName.trim(), email.trim(), password, phone.trim());
    setLoading(false);

    if (result.success) {
      if (onRegisterSuccess) {
        onRegisterSuccess();
      } else {
        onNavigate('menu');
      }
    } else {
      setError(result.error || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Register Student Account
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Pre-order canteen food, track pickup slots, and skip queues
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Registration Error</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Full Student Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Aarav Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-800 text-sm"
              />
            </div>
          </div>

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
            <label className="block font-semibold text-stone-700 mb-1">Mobile Phone (Optional)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-800 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Password (Min. 6 Characters)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="Create a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-800 text-sm"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white font-bold text-sm transition-all shadow-xs flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Student Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-stone-100 text-xs text-stone-500">
          <span>Already registered with CampusBite? </span>
          <button
            onClick={() => onNavigate('login')}
            className="font-bold text-amber-700 hover:text-amber-800"
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
}
