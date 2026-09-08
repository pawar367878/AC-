import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Wind,
  Wrench,
  Crown,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  PhoneCall,
  Mail,
  HelpCircle,
  Cpu,
  Layers,
  Search,
  Droplets,
  Zap,
  RotateCcw,
  FileText,
  Star,
  Users,
  Award,
  ChevronRight,
  Check,
  Building2,
  Menu,
  X,
  Gauge,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigate } = useRouter();
  const { loginCustomerDemo } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCustomerLoggingIn, setIsCustomerLoggingIn] = useState(false);

  const handleCustomerDirectAccess = () => {
    navigate('/customer/login');
  };

  const servicesList = [
    {
      id: 'gen_service',
      title: 'AC General Service',
      desc: 'Filter cleaning, indoor coil wash, airflow tuning, and performance health check.',
      price: 'From ₹499',
      icon: Wind,
      badge: 'Popular',
    },
    {
      id: 'deep_clean',
      title: 'Deep Cleaning',
      desc: 'High-pressure foam jet wash of cooling coils, blower fan, drain tray, and condenser.',
      price: 'From ₹899',
      icon: Droplets,
      badge: 'Bestseller',
    },
    {
      id: 'ac_repair',
      title: 'AC Repair',
      desc: 'Comprehensive diagnostic, sensor troubleshooting, fan motor replacement, and PCB repair.',
      price: 'From ₹349',
      icon: Wrench,
      badge: 'Expert',
    },
    {
      id: 'cooling_prob',
      title: 'Cooling Problem',
      desc: 'Compressor check, thermal sensor recalibration, expansion valve check, and coil unblocking.',
      price: 'From ₹449',
      icon: Gauge,
      badge: 'Essential',
    },
    {
      id: 'gas_check',
      title: 'Gas Check & Charging',
      desc: 'Nitrogen pressure leak detection, vacuuming, and pure R32/R410A refrigerant charging.',
      price: 'From ₹1,499',
      icon: Zap,
      badge: 'Guaranteed',
    },
    {
      id: 'water_leak',
      title: 'Water Leakage',
      desc: 'Drain pipe descaling, condensation tray realignment, and overflow prevention.',
      price: 'From ₹399',
      icon: Droplets,
      badge: 'Same Day',
    },
    {
      id: 'install',
      title: 'AC Installation',
      desc: 'Precision copper piping, outdoor bracket wall mounting, and vacuum leak testing.',
      price: 'From ₹1,199',
      icon: Layers,
      badge: 'Certified',
    },
    {
      id: 'uninstall',
      title: 'AC Uninstallation',
      desc: 'Safe refrigerant pump-down, delicate dismounting, and indoor unit packing.',
      price: 'From ₹699',
      icon: RotateCcw,
      badge: 'Careful',
    },
    {
      id: 'electrical',
      title: 'Electrical Repair',
      desc: 'Capacitor renewal, contactor replacement, stabilizer integration, and wiring fix.',
      price: 'From ₹399',
      icon: Cpu,
      badge: 'Safety First',
    },
    {
      id: 'amc',
      title: 'Annual Maintenance (AMC)',
      desc: 'Comprehensive yearly protection: 3 scheduled tune-ups, priority breakdown support.',
      price: 'From ₹2,499/yr',
      icon: Award,
      badge: 'Best Value',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Notification / Guarantee Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-semibold text-[11px] border border-sky-400/30">
              <Sparkles className="w-3 h-3" /> Certified HVAC Network
            </span>
            <span className="hidden md:inline text-slate-400">
              Doorstep service within 90 minutes • Verified Technicians • 30-Day Service Guarantee
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium">
            <a href="tel:+919800011223" className="hover:text-sky-300 transition flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-sky-400" /> +91 (800) 247-COOL
            </a>
            <span className="text-slate-700">|</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Dispatch Live
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition">
              <Wind className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900">
                  Smart<span className="text-sky-600">AC</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-sky-100 text-sky-800">
                  Pro
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 leading-none">
                Service Management System
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#about" className="hover:text-sky-600 transition">About</a>
            <a href="#how-it-works" className="hover:text-sky-600 transition">How It Works</a>
            <a href="#services" className="hover:text-sky-600 transition">Services</a>
            <a href="#why-choose-us" className="hover:text-sky-600 transition">Why Choose Us</a>
          </nav>

          {/* CTA Buttons in Navbar */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 transition flex items-center gap-1.5 shadow-sm shadow-sky-600/20"
            >
              <Users className="w-3.5 h-3.5 text-white" />
              <span>Demo Login</span>
            </button>
            <button
              onClick={() => navigate('/customer/login')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition flex items-center gap-1.5"
            >
              <span>Customer</span>
            </button>
            <button
              onClick={() => navigate('/technician/login')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5 text-slate-600" />
              <span>Technician</span>
            </button>
            <button
              onClick={() => navigate('/owner/login')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 shadow-sm transition flex items-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Owner</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
            <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-700 pb-3 border-b border-slate-100">
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="py-1.5">About</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="py-1.5">How It Works</a>
              <a href="#services" onClick={() => setMobileMenuOpen(false)} className="py-1.5">Services</a>
              <a href="#why-choose-us" onClick={() => setMobileMenuOpen(false)} className="py-1.5">Why Choose Us</a>
            </nav>
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-teal-600 flex items-center justify-center gap-2 shadow-sm"
              >
                <Users className="w-4 h-4 text-white" /> Demo Login (All Roles)
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/customer/login');
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200 flex items-center justify-center gap-2"
              >
                Customer Login
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/technician/login');
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 flex items-center justify-center gap-2"
              >
                <Wrench className="w-4 h-4 text-slate-600" /> Technician Login
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/owner/login');
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4 text-amber-400" /> Owner / Admin Login
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-sky-50/50 via-white to-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 border border-sky-200 text-sky-800 text-xs font-bold">
                <Wind className="w-4 h-4 text-sky-600 animate-pulse" />
                <span>Smart AC Service Management System</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Fast, Reliable & Professional <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-teal-600 to-sky-700">
                  AC Service Management
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Book AC services, manage service requests, connect customers with technicians, and manage the complete AC service workflow from one centralized platform.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-sky-500/25 flex items-center gap-2.5 transition transform hover:-translate-y-0.5"
                >
                  <Users className="w-4 h-4" />
                  <span>Role Demo Login (All 3 Roles)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => navigate('/technician/login')}
                  className="px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 shadow-sm flex items-center gap-2 transition hover:border-slate-300"
                >
                  <Wrench className="w-4 h-4 text-sky-600" />
                  <span>Technician Login</span>
                </button>

                <button
                  onClick={() => navigate('/owner/login')}
                  className="px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md shadow-slate-900/15 flex items-center gap-2 transition"
                >
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Owner / Admin Login</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-center sm:text-left">
                <div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">9+ Brands</p>
                  <p className="text-[11px] text-slate-500 font-medium">LG, Daikin, Voltas & more</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">100% Verified</p>
                  <p className="text-[11px] text-slate-500 font-medium">Certified HVAC experts</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">4.9 ★</p>
                  <p className="text-[11px] text-slate-500 font-medium">Over 1,200+ AC jobs</p>
                </div>
              </div>
            </div>

            {/* Right Visual Image / Interactive Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative Glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-sky-400 to-teal-300 rounded-3xl blur-2xl opacity-25" />

                <div className="relative bg-white rounded-3xl p-3 shadow-2xl border border-slate-100 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80"
                    alt="Professional AC Service and Repair Technician"
                    className="w-full h-80 sm:h-96 object-cover rounded-2xl"
                    referrerPolicy="no-referrer"
                  />

                  {/* Floating Badges */}
                  <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-3 animate-in fade-in">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Live Technician Dispatch</p>
                      <p className="text-[10px] text-slate-500">Real-time GPS proximity tracking</p>
                    </div>
                  </div>

                  <div className="absolute bottom-6 right-6 bg-slate-900/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl text-white border border-slate-700/50 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Model-Specific Pricing</p>
                      <p className="text-[10px] text-slate-400">Zero hidden surcharges</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Prominent Role Portals / Cards */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Select Your Access Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Tailored workspaces for customers seeking rapid service, technicians fulfilling jobs, and administrators managing operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 1. Customer Card */}
            <div className="bg-gradient-to-b from-sky-50/70 to-white p-6 sm:p-8 rounded-3xl border border-sky-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20 mb-6 group-hover:scale-105 transition">
                  <Users className="w-7 h-7" />
                </div>
                <div className="inline-block px-2.5 py-1 rounded-md bg-sky-100 text-sky-800 text-[10px] font-bold uppercase tracking-wider mb-2">
                  Direct Demo Access
                </div>
                <h3 className="text-xl font-bold text-slate-900">Customer</h3>
                <p className="text-xs text-slate-600 font-semibold mt-1">
                  Book your AC service easily
                </p>
                <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                  Select your exact AC model, browse tailor-made services, pinpoint your doorstep with GPS, and track your technician in real-time.
                </p>

                <ul className="mt-5 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Search by AC brand & model</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Model-calibrated service catalogue</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Instant doorstep GPS dispatch</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={handleCustomerDirectAccess}
                  disabled={isCustomerLoggingIn}
                  className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-md shadow-sky-600/20 flex items-center justify-center gap-2"
                >
                  <span>{isCustomerLoggingIn ? 'Opening...' : 'Customer Login'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. Technician Card */}
            <div className="bg-gradient-to-b from-teal-50/70 to-white p-6 sm:p-8 rounded-3xl border border-teal-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20 mb-6 group-hover:scale-105 transition">
                  <Wrench className="w-7 h-7" />
                </div>
                <div className="inline-block px-2.5 py-1 rounded-md bg-teal-100 text-teal-800 text-[10px] font-bold uppercase tracking-wider mb-2">
                  Credential Protected
                </div>
                <h3 className="text-xl font-bold text-slate-900">Technician</h3>
                <p className="text-xs text-slate-600 font-semibold mt-1">
                  Manage your assigned AC service requests
                </p>
                <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                  Receive assigned service dispatches, review AC models and customer addresses, log spare parts, before/after photos, and complete jobs.
                </p>

                <ul className="mt-5 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Accept & start doorstep service jobs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Interactive route map & customer distance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Part charges & photo proof upload</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => navigate('/technician/login')}
                  className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-md shadow-teal-600/20 flex items-center justify-center gap-2"
                >
                  <span>Technician Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3. Owner / Admin Card */}
            <div className="bg-gradient-to-b from-indigo-50/70 to-white p-6 sm:p-8 rounded-3xl border border-indigo-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-900 text-amber-400 flex items-center justify-center shadow-md shadow-indigo-900/20 mb-6 group-hover:scale-105 transition">
                  <Crown className="w-7 h-7" />
                </div>
                <div className="inline-block px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase tracking-wider mb-2">
                  Administrator Portal
                </div>
                <h3 className="text-xl font-bold text-slate-900">Owner / Admin</h3>
                <p className="text-xs text-slate-600 font-semibold mt-1">
                  Manage the complete AC service operation
                </p>
                <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                  Oversee customer bookings, assign jobs to the nearest technicians, manage AC brand & model catalogues, configure service pricing, and audit logs.
                </p>

                <ul className="mt-5 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Full AC model → service mapping matrix</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Smart proximity technician dispatch</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Invoices, audit log & analytics summary</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => navigate('/owner/login')}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-md shadow-slate-900/20 flex items-center justify-center gap-2"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Owner / Admin Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-slate-50/80 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold">
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span>Centralized AC Management</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                About Our AC Service Platform
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Smart AC Service Management System is a centralized platform designed to simplify AC servicing and maintenance. Customers can select their AC model, choose the required service and submit a service request. Technicians can manage assigned service requests, while the Owner/Admin can manage customers, technicians, AC models, services, pricing and the complete service workflow.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs mb-2">
                    01
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Zero Guesswork Servicing</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Customers only see certified services supported by their specific model hardware.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs mb-2">
                    02
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">GPS Nearest Pro Dispatch</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Automated distance calculation assigns the closest active technician for 30-minute response.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-slate-900">
                  Platform Architecture at a Glance
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                      C
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Customer Flow</p>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Brand selection → Model picker → Dynamic services → GPS location drop → Real-time request tracking.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                      T
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Technician Flow</p>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Assigned dispatches → Accept/Start work → Log spare parts & before/after photos → Completion invoice.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 text-xs font-bold">
                      A
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Owner & Admin Flow</p>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        CRUD brand & models → Service pricing matrix → Proximity technician assignment → Audit logs & invoices.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sky-600 font-bold text-xs uppercase tracking-wider">Step-by-step Process</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              From selecting your specific AC brand to doorstep completion in 4 seamless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 relative hover:border-sky-300 transition group">
              <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white font-black text-base flex items-center justify-center shadow-md shadow-sky-600/20 mb-4 group-hover:scale-105 transition">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900">Select Your AC</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Choose your AC brand (LG, Samsung, Daikin, Voltas, etc.) and model name. Split, Window, Inverter or Cassette.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-1.5 text-[11px] font-semibold text-sky-600">
                <Search className="w-3.5 h-3.5" /> Fast Brand & Model Search
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 relative hover:border-sky-300 transition group">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-black text-base flex items-center justify-center shadow-md shadow-teal-600/20 mb-4 group-hover:scale-105 transition">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900">Choose Required Service</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Browse only the exact services calibrated for your model—from Jet Clean to Gas Charging, with guaranteed upfront pricing.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-1.5 text-[11px] font-semibold text-teal-600">
                <Layers className="w-3.5 h-3.5" /> Model-Specific Catalog
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 relative hover:border-sky-300 transition group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-base flex items-center justify-center shadow-md shadow-indigo-600/20 mb-4 group-hover:scale-105 transition">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900">Submit Service Request</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Select your preferred date & time, describe the problem, and confirm your location via automatic GPS pinpoint.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600">
                <MapPin className="w-3.5 h-3.5" /> Doorstep GPS Detection
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 relative hover:border-sky-300 transition group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-base flex items-center justify-center shadow-md shadow-emerald-600/20 mb-4 group-hover:scale-105 transition">
                4
              </div>
              <h3 className="text-sm font-bold text-slate-900">Technician Provides Service</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                A certified nearby technician arrives, performs the repair, logs before/after photos, and delivers an itemized digital invoice.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                <ShieldCheck className="w-3.5 h-3.5" /> 30-Day Service Guarantee
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-slate-50/60 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-sky-600 font-bold text-xs uppercase tracking-wider">Expert Solutions</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Comprehensive AC Services
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              All services include manufacturer-compliant spare parts, precision diagnosis, and satisfaction warranty.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            {servicesList.map((srv) => {
              const IconComp = srv.icon;
              return (
                <div
                  key={srv.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {srv.badge}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-sky-600 transition">
                      {srv.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed line-clamp-3">
                      {srv.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">{srv.price}</span>
                    <button
                      onClick={handleCustomerDirectAccess}
                      className="text-[11px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                    >
                      Book <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-choose-us" className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-sky-600 font-bold text-xs uppercase tracking-wider">The Smart AC Advantage</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Why Choose Our Platform
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Engineered specifically for AC servicing with end-to-end transparency and certified expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Professional Technicians</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Rigorous background checks, multi-brand HVAC factory training, and minimum 5+ years of verified field repair experience.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Easy Service Booking</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Book within 60 seconds. Pick your AC brand, select available services, select your convenient time window, and you are done.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Fast Request Management</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Intelligent dispatching system matches requests with the closest available pro to ensure minimum turnaround time.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Location Support</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  One-tap browser GPS coordinate capture and interactive maps ensure technicians never get lost or delayed.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Service Tracking</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Real-time status tracking from Pending to Assigned, Accepted, In Progress, and Completed with digital photo proof.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Transparent Pricing</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Guaranteed upfront pricing mapped per AC capacity & technology. Receive GST compliant digital invoices with zero surprise fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center text-slate-950 font-bold">
                  <Wind className="w-5 h-5" />
                </div>
                <span className="text-lg font-black tracking-tight text-white">
                  Smart<span className="text-sky-400">AC</span> Pro
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                Fast, reliable & professional AC service management platform connecting homeowners and enterprises with certified HVAC specialists.
              </p>
              <div className="flex items-center gap-3 pt-2 text-white">
                <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-[11px] font-mono">
                  ISO 9001:2015
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-[11px] font-mono">
                  100% Genuine Parts
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Platform</h5>
              <ul className="space-y-2 text-xs">
                <li><a href="#about" className="hover:text-white transition">About Our Platform</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                <li><a href="#services" className="hover:text-white transition">AC Services</a></li>
                <li><a href="#why-choose-us" className="hover:text-white transition">Why Choose Us</a></li>
              </ul>
            </div>

            {/* Role Portals */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Login Portals</h5>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={handleCustomerDirectAccess} className="hover:text-white transition text-left">
                    Customer Portal (Direct)
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/technician/login')} className="hover:text-white transition text-left">
                    Technician Login
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/owner/login')} className="hover:text-white transition text-left">
                    Owner / Admin Login
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact & Support */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Contact & Help</h5>
              <ul className="space-y-2.5 text-xs">
                <li className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>+91 (800) 247-COOL</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>support@smartac.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>100ft Road, Indiranagar, Bangalore</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} Smart AC Service Management System. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <a href="#" className="hover:text-slate-400 transition">Privacy Policy</a>
              <a href="#" className="hover:text-slate-400 transition">Terms & Conditions</a>
              <a href="#" className="hover:text-slate-400 transition">Cancellation & Refund</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
