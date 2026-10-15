import { UtensilsCrossed, Clock, MapPin, Phone, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-12 pb-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-stone-800 text-xs">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight">CampusBite</span>
            </div>
            <p className="text-stone-400 leading-relaxed text-xs">
              Skip the long canteen queues. Browse live menus, pre-order in seconds, and pick up your meals on your scheduled break.
            </p>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-stone-800/80 text-stone-400 text-[11px] border border-stone-700/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full-Stack Spring Boot & MySQL</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">Quick Navigation</h4>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-amber-400 transition-colors">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('menu')} className="hover:text-amber-400 transition-colors">
                  Canteen Menu
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="hover:text-amber-400 transition-colors">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('orders')} className="hover:text-amber-400 transition-colors">
                  My Orders & Tracking
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin-dashboard')} className="hover:text-amber-400 transition-colors font-medium text-amber-500">
                  Admin Portal & Kitchen
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('login')} className="hover:text-amber-400 transition-colors">
                  Sign In / Register
                </button>
              </li>
            </ul>
          </div>

          {/* Canteen Hours */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Canteen Hours</span>
            </h4>
            <div className="space-y-1 text-stone-400">
              <p><span className="text-stone-200">Monday - Friday:</span> 8:00 AM – 6:00 PM</p>
              <p><span className="text-stone-200">Saturday:</span> 9:00 AM – 4:00 PM</p>
              <p><span className="text-rose-400">Sunday:</span> Closed</p>
              <p className="pt-1 text-[11px] text-stone-500">Peak Slots: 12:00 PM – 2:00 PM</p>
            </div>
          </div>

          {/* Campus Location */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Canteen Location</span>
            </h4>
            <p className="text-stone-400 leading-relaxed">
              Ground Floor, Student Activities Center (SAC), Main Campus Quad.
            </p>
            <p className="text-stone-400 flex items-center space-x-1.5 pt-1">
              <Phone className="w-3 h-3 text-amber-400" />
              <span>Intercom Ext: 2045</span>
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-2">
          <p>© 2026 CampusBite – College Canteen Pre-Order System. All rights reserved.</p>
          <p className="text-stone-400">
            Powered by <span className="text-amber-400 font-medium">Java Spring Boot 3</span>, <span className="text-sky-400 font-medium">React</span> & <span className="text-emerald-400 font-medium">MySQL</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
