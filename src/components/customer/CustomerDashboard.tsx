import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  ACBrand,
  ACModel,
  ServiceItem,
  ServiceRequest,
} from '../../types.ts';
import { api } from '../../services/api.ts';
import { InteractiveMap } from '../common/InteractiveMap.tsx';
import { RequestDetailsModal } from './RequestDetailsModal.tsx';
import { DashboardLayout, NavItem } from '../common/DashboardLayout.tsx';
import {
  Search,
  Wrench,
  Wind,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Compass,
  FileText,
  Star,
  Check,
  Layers,
  ArrowRight,
  Plus,
  RefreshCw,
  Sparkles,
  LayoutDashboard,
  History,
  Bell,
  User,
  Save,
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { user, customer, notifications, markNotificationAsRead, refreshNotifications } = useAuth();

  // Active section (Sidebar navigation)
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'BOOK_SERVICE' | 'MY_REQUESTS' | 'HISTORY' | 'NOTIFICATIONS' | 'PROFILE'>('DASHBOARD');

  // Customer Profile state
  const [profileName, setProfileName] = useState(customer?.full_name || user?.name || '');
  const [profilePhone, setProfilePhone] = useState(customer?.phone || user?.phone || '');
  const [profileAddress, setProfileAddress] = useState(customer?.default_address || '');
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  // Master Data
  const [brands, setBrands] = useState<ACBrand[]>([]);
  const [models, setModels] = useState<ACModel[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Booking Flow State
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<ACModel | null>(null);
  const [modelServices, setModelServices] = useState<ServiceItem[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  // Search input for models / brands
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [fullName, setFullName] = useState(customer?.full_name || user?.name || '');
  const [mobileNumber, setMobileNumber] = useState(customer?.phone || user?.phone || '');
  const [email, setEmail] = useState(customer?.email || user?.email || '');
  const [address, setAddress] = useState(customer?.default_address || '');
  const [preferredDate, setPreferredDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [preferredTime, setPreferredTime] = useState('10:00 AM - 12:00 PM');
  const [problemDescription, setProblemDescription] = useState('');

  // Location State
  const [locationMode, setLocationMode] = useState<'MANUAL' | 'GPS'>('MANUAL');
  const [latitude, setLatitude] = useState<number | null>(customer?.latitude || 12.9716);
  const [longitude, setLongitude] = useState<number | null>(customer?.longitude || 77.5946);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [locationConfirmed, setLocationConfirmed] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<ServiceRequest | null>(null);
  const [selectedRequestForModal, setSelectedRequestForModal] = useState<ServiceRequest | null>(null);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [brandsRes, modelsRes, requestsRes] = await Promise.all([
        api.getBrands(false),
        api.getModels(undefined, false),
        api.getRequests({ customerId: customer?.id || (user?.id ? user.id : undefined) }),
      ]);

      if (brandsRes.success) setBrands(brandsRes.brands);
      if (modelsRes.success) setModels(modelsRes.models);
      if (requestsRes.success) setRequests(requestsRes.requests);
    } catch (err) {
      console.error('Failed to load customer data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [customer, user]);

  // Synchronize customer profile values into booking form
  useEffect(() => {
    if (customer || user) {
      setFullName(customer?.full_name || user?.name || '');
      setMobileNumber(customer?.phone || user?.phone || '');
      setEmail(customer?.email || user?.email || '');
      if (customer?.default_address && !address) {
        setAddress(customer.default_address);
      }
      if (customer?.latitude && !latitude) {
        setLatitude(customer.latitude);
      }
      if (customer?.longitude && !longitude) {
        setLongitude(customer.longitude);
      }
    }
  }, [customer, user]);

  // When model is selected, fetch ONLY mapped services for this model from backend
  const handleSelectModel = async (model: ACModel) => {
    setSelectedModel(model);
    setSelectedService(null);
    setIsLoadingServices(true);
    try {
      const res = await api.getServicesForModel(model.id);
      if (res.success) {
        setModelServices(res.services);
      }
    } catch (err) {
      console.error('Failed to load mapped services for model:', err);
    } finally {
      setIsLoadingServices(false);
    }
  };

  // Filtered Models based on brand and search query
  const filteredModels = useMemo(() => {
    return models.filter((m) => {
      const matchesBrand = !selectedBrandId || m.brand_id === selectedBrandId;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        m.model_name.toLowerCase().includes(q) ||
        (m.brand_name && m.brand_name.toLowerCase().includes(q)) ||
        m.ac_type.toLowerCase().includes(q) ||
        m.capacity.toLowerCase().includes(q);
      return matchesBrand && matchesQuery;
    });
  }, [models, selectedBrandId, searchQuery]);

  // GPS Current Location Handler
  const handleGetCurrentLocation = () => {
    setGpsError('');
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lon = Number(pos.coords.longitude.toFixed(4));
        setLatitude(lat);
        setLongitude(lon);
        setLocationMode('GPS');
        setLocationConfirmed(true);
        if (!address) {
          setAddress(`GPS Detected Location (${lat}°N, ${lon}°E)`);
        }
        setIsLocating(false);
      },
      (err) => {
        console.warn('GPS location error, using default coordinates:', err.message);
        setGpsError('Location permission was denied or unavailable. You can enter manually or adjust pin on map.');
        // Fallback default
        setLatitude(12.9716);
        setLongitude(77.5946);
        setIsLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Submit Service Request
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModel || !selectedService) return;

    setIsSubmitting(true);
    try {
      const res = await api.createRequest({
        customer_id: customer?.id || `cust_${user?.id || 'demo'}`,
        customer_name: fullName,
        customer_phone: mobileNumber,
        customer_email: email,
        address,
        latitude,
        longitude,
        ac_brand_id: selectedModel.brand_id,
        ac_model_id: selectedModel.id,
        service_id: selectedService.id,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        problem_description: problemDescription || 'Routine service / checkup',
      });

      if (res.success) {
        setSubmittedRequest(res.request);
        await fetchData();
        refreshNotifications();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit service request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBookingFlow = () => {
    setSelectedModel(null);
    setSelectedService(null);
    setModelServices([]);
    setSubmittedRequest(null);
    setProblemDescription('');
    setLocationConfirmed(false);
    setActiveTab('MY_REQUESTS');
  };

  // High-level Customer Metric Stats
  const totalRequestsCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const acceptedCount = requests.filter((r) => r.status === 'ACCEPTED' || r.status === 'ASSIGNED').length;
  const inProgressCount = requests.filter((r) => r.status === 'IN PROGRESS').length;
  const completedCount = requests.filter((r) => r.status === 'COMPLETED').length;

  const completedServices = requests.filter((r) => r.status === 'COMPLETED');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">PENDING</span>;
      case 'ASSIGNED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">ASSIGNED</span>;
      case 'ACCEPTED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">ACCEPTED</span>;
      case 'IN PROGRESS':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300 animate-pulse">IN PROGRESS</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">COMPLETED</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const navItems: NavItem[] = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'MY_REQUESTS', label: 'My Requests', icon: Clock, badge: requests.length },
    { id: 'BOOK_SERVICE', label: 'Book Service', icon: Plus },
    { id: 'HISTORY', label: 'Service History', icon: History, badge: completedServices.length },
    {
      id: 'NOTIFICATIONS',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotifs > 0 ? unreadNotifs : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'PROFILE', label: 'Profile', icon: User },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSavedMsg(true);
    setTimeout(() => setProfileSavedMsg(false), 3000);
  };

  return (
    <DashboardLayout
      role="CUSTOMER"
      roleTitle="Customer Portal"
      roleSubtitle="Instant Doorstep AC Care"
      navItems={navItems}
      activeItemId={activeTab}
      onSelectItemId={(id) => setActiveTab(id as any)}
      onRefreshData={fetchData}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-cyan-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold mb-3">
              <Wind className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              Smart AC Customer Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {fullName || 'Customer'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              Select your exact AC model to view certified manufacturer services, book doorstep technicians with live GPS dispatch, and track real-time repairs.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setActiveTab('BOOK_SERVICE');
                  setSelectedModel(null);
                  setSelectedService(null);
                }}
                className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-sky-500/25 flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" /> Book New AC Service
              </button>
              <button
                onClick={() => setActiveTab('MY_REQUESTS')}
                className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition"
              >
                View My Requests ({requests.length})
              </button>
            </div>
          </div>

          {/* Subtle decorative vector backdrop */}
          <div className="absolute right-4 -bottom-10 opacity-10 pointer-events-none hidden md:block">
            <Wind className="w-72 h-72 text-white" />
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar gap-2 sm:gap-4 text-xs font-bold">
          {[
            { id: 'DASHBOARD', label: 'Dashboard' },
            { id: 'MY_REQUESTS', label: `My Requests (${requests.length})` },
            { id: 'BOOK_SERVICE', label: 'Book Service' },
            { id: 'HISTORY', label: `Service History (${completedServices.length})` },
            { id: 'NOTIFICATIONS', label: `Notifications (${unreadNotifs})` },
            { id: 'PROFILE', label: 'Profile' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'border-sky-600 text-sky-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      {/* TAB 1: DASHBOARD OVERVIEW */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-8 animate-in fade-in">
          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Total Bookings</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalRequestsCount}</p>
              <span className="text-[10px] text-slate-500">All registered services</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-sm bg-amber-50/20">
              <span className="text-amber-700 text-[11px] font-bold uppercase tracking-wider">Pending</span>
              <p className="text-2xl font-black text-amber-800 mt-1">{pendingCount}</p>
              <span className="text-[10px] text-amber-600">Awaiting technician</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-sky-200/80 shadow-sm bg-sky-50/20">
              <span className="text-sky-700 text-[11px] font-bold uppercase tracking-wider">Accepted</span>
              <p className="text-2xl font-black text-sky-800 mt-1">{acceptedCount}</p>
              <span className="text-[10px] text-sky-600">Tech dispatched</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-sm bg-purple-50/20">
              <span className="text-purple-700 text-[11px] font-bold uppercase tracking-wider">In Progress</span>
              <p className="text-2xl font-black text-purple-800 mt-1">{inProgressCount}</p>
              <span className="text-[10px] text-purple-600">Active repairs</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-sm bg-emerald-50/20 col-span-2 sm:col-span-1">
              <span className="text-emerald-700 text-[11px] font-bold uppercase tracking-wider">Completed</span>
              <p className="text-2xl font-black text-emerald-800 mt-1">{completedCount}</p>
              <span className="text-[10px] text-emerald-600">Invoices ready</span>
            </div>
          </div>

          {/* Quick Booking Teaser Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sky-700 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-sky-600" /> Instant Model-Specific AC Care
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Need cooling diagnosis, deep foam jet cleaning, or gas top-up?
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                Choose your AC brand and model to automatically unlock dynamic pricing and mapped technician packages.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('BOOK_SERVICE')}
              className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-600/20 shrink-0 flex items-center gap-2 transition"
            >
              Start AC Booking Wizard <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Active Bookings Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Service Requests</h3>
                <p className="text-xs text-slate-500">Track progress and assigned technician details</p>
              </div>
              <button
                onClick={() => setActiveTab('MY_REQUESTS')}
                className="text-xs font-bold text-sky-600 hover:text-sky-700"
              >
                View All
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {requests.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  You have not submitted any service requests yet.
                </div>
              ) : (
                requests.slice(0, 3).map((req) => (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRequestForModal(req)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition cursor-pointer"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0">
                        ❄️
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">{req.id}</span>
                          {getStatusBadge(req.status)}
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm mt-0.5">
                          {req.brand?.name} • {req.model?.model_name || 'AC Unit'}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Service: <span className="font-medium text-slate-700">{req.service?.name}</span> • Slot:{' '}
                          {req.preferred_date} ({req.preferred_time})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      {req.technician ? (
                        <div className="text-left sm:text-right text-xs">
                          <span className="text-[10px] text-slate-400 block font-semibold">Technician</span>
                          <span className="font-bold text-slate-800">{req.technician.name}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Pending Dispatch
                        </span>
                      )}
                      <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 transition">
                        Details <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BOOK AC SERVICE WIZARD */}
      {activeTab === 'BOOK_SERVICE' && (
        <div className="space-y-8 animate-in fade-in">
          {/* Submission confirmation card if request just created */}
          {submittedRequest ? (
            <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-xl max-w-xl mx-auto text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  REQUEST CONFIRMED
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-3">
                  Your service request has been submitted successfully!
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Our system is calculating the nearest certified technician for immediate dispatch.
                </p>
              </div>

              {/* Confirmation Details Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service Request ID:</span>
                  <span className="font-bold text-sky-700 font-mono text-sm">{submittedRequest.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">AC Model:</span>
                  <span className="font-bold text-slate-900">{submittedRequest.model?.model_name || 'Selected AC'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-bold text-slate-900">{submittedRequest.service?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled Date:</span>
                  <span className="font-bold text-slate-900">{submittedRequest.preferred_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-amber-700">PENDING DISPATCH</span>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-0.5">Location:</span>
                  <span className="font-medium text-slate-800">{submittedRequest.address}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setSelectedRequestForModal(submittedRequest);
                    resetBookingFlow();
                  }}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  Track in My Requests
                </button>
                <button
                  onClick={resetBookingFlow}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  Book Another Service
                </button>
              </div>
            </div>
          ) : (
            /* WIZARD STEPS */
            <div className="space-y-8">
              {/* STEP 1: AC MODEL SELECTION */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">
                        1
                      </span>
                      <h2 className="text-lg font-bold text-slate-900">Select Your AC Brand & Model</h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Choose company and model so only manufacturer-compatible services are displayed.
                    </p>
                  </div>

                  {/* Search AC Model Input */}
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search your AC model..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Brands Chips / Logos */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Filter by Brand:
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <button
                      onClick={() => setSelectedBrandId('')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                        selectedBrandId === ''
                          ? 'bg-slate-900 text-white shadow'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      All Brands ({models.length})
                    </button>
                    {brands.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBrandId(b.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                          selectedBrandId === b.id
                            ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span>{b.name}</span>
                        {b.models_count !== undefined && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                              selectedBrandId === b.id ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {b.models_count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Models Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredModels.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-xs text-slate-500">
                      No AC models match your search query. Try another brand or model keyword.
                    </div>
                  ) : (
                    filteredModels.map((model) => {
                      const isSelected = selectedModel?.id === model.id;
                      return (
                        <div
                          key={model.id}
                          onClick={() => handleSelectModel(model)}
                          className={`relative rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-sky-600 bg-sky-50/40 ring-2 ring-sky-500/20 shadow-md'
                              : 'border-slate-200 hover:border-sky-300 hover:bg-slate-50/50'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold shadow">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}

                          <div className="space-y-3">
                            <div className="h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80">
                              <img
                                src={model.image_url}
                                alt={model.model_name}
                                className="w-full h-full object-cover group-hover:scale-105 transition"
                              />
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider bg-sky-50 px-2 py-0.5 rounded border border-sky-200/60">
                                {model.brand_name || 'Brand'}
                              </span>
                              <h3 className="font-bold text-slate-900 text-xs mt-1.5 line-clamp-2 leading-snug">
                                {model.model_name}
                              </h3>
                              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                                {model.description}
                              </p>
                            </div>
                          </div>

                          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="text-slate-600 font-medium">
                              {model.capacity} • {model.ac_type}
                            </span>
                            <span className="text-amber-500 font-bold flex items-center gap-0.5">
                              {model.star_rating} ★
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* STEP 2: AVAILABLE SERVICES FOR SELECTED MODEL (CRITICAL RULE) */}
              {selectedModel && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">
                          2
                        </span>
                        <h2 className="text-lg font-bold text-slate-900">
                          Available Services for {selectedModel.model_name}
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Only services officially mapped and configured for this specific model by the service administrator are shown.
                      </p>
                    </div>

                    <div className="px-3 py-1 bg-sky-50 border border-sky-200 text-sky-800 rounded-xl text-xs font-bold">
                      {modelServices.length} mapped services available
                    </div>
                  </div>

                  {isLoadingServices ? (
                    <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
                      Loading mapped services dynamically from database...
                    </div>
                  ) : modelServices.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
                      No services are currently mapped to this AC model by the owner. Please pick another model or contact administrator.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {modelServices.map((srv) => {
                        const isSelected = selectedService?.id === srv.id;
                        return (
                          <div
                            key={srv.id}
                            className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                              isSelected
                                ? 'border-sky-600 bg-sky-50/50 ring-2 ring-sky-500/20 shadow-md'
                                : 'border-slate-200 bg-white hover:border-sky-300'
                            }`}
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-bold text-slate-900 text-sm">{srv.name}</h3>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  AVAILABLE
                                </span>
                              </div>

                              <p className="text-slate-600 text-xs leading-relaxed">
                                {srv.description}
                              </p>

                              <div className="flex items-center gap-2 text-slate-500 text-xs">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>Est. {srv.estimated_duration}</span>
                              </div>
                            </div>

                            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Service Fee</span>
                                <span className="text-base font-extrabold text-slate-900">₹{srv.price}</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => setSelectedService(srv)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                  isSelected
                                    ? 'bg-sky-600 text-white shadow'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                                }`}
                              >
                                {isSelected ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 stroke-[3]" /> Selected
                                  </>
                                ) : (
                                  'Select Service'
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: CUSTOMER SERVICE REQUEST FORM WITH LOCATION */}
              {selectedModel && selectedService && (
                <form
                  onSubmit={handleSubmitBooking}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in"
                >
                  <div className="border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">
                        3
                      </span>
                      <h2 className="text-lg font-bold text-slate-900">Enter Service Details & Confirm Location</h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Enter contact information, preferred appointment timing, and doorstep address with GPS verification.
                    </p>
                  </div>

                  {/* Summary Callout of Selected Item */}
                  <div className="bg-sky-50/60 p-4 rounded-2xl border border-sky-200/80 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block">
                        Selected Package
                      </span>
                      <span className="font-bold text-slate-900 text-sm">
                        {selectedModel.brand_name} – {selectedModel.model_name}
                      </span>
                      <p className="text-slate-600 text-xs mt-0.5">
                        Service: <strong className="text-sky-700">{selectedService.name}</strong> • Fixed Price:{' '}
                        <strong className="text-slate-900">₹{selectedService.price}</strong>
                      </p>
                    </div>
                    <div className="px-3 py-1.5 bg-white rounded-xl border border-sky-200 text-xs font-bold text-sky-800">
                      Duration: ~{selectedService.estimated_duration}
                    </div>
                  </div>

                  {/* Basic Information Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                      />
                    </div>
                  </div>

                  {/* Appointment Timing */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Date *</label>
                      <input
                        type="date"
                        required
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Time Window *</label>
                      <select
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                      >
                        <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM (Morning)</option>
                        <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM (Morning)</option>
                        <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM (Afternoon)</option>
                        <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM (Afternoon)</option>
                        <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM (Evening)</option>
                        <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM (Late Evening)</option>
                      </select>
                    </div>
                  </div>

                  {/* Problem Description */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Problem Description / Specific Symptoms
                    </label>
                    <textarea
                      rows={2}
                      value={problemDescription}
                      onChange={(e) => setProblemDescription(e.target.value)}
                      placeholder="e.g. AC makes buzzing sound when starting, cooling slows down after 15 mins, water drips from indoor corner..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                    />
                  </div>

                  {/* LOCATION FEATURE (MANUAL vs GPS) */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-sky-600" /> Service Location Verification
                        </span>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Choose manual address entry or use GPS to capture exact latitude & longitude for precision technician dispatch.
                        </p>
                      </div>

                      {/* Location Selector Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleGetCurrentLocation}
                          disabled={isLocating}
                          className="px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                        >
                          <Compass className={`w-3.5 h-3.5 text-sky-600 ${isLocating ? 'animate-spin' : ''}`} />
                          {isLocating ? 'Detecting GPS...' : 'Use Current Location'}
                        </button>
                      </div>
                    </div>

                    {gpsError && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        {gpsError}
                      </p>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Doorstep Address & Landmarks *
                      </label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House / Flat No., Apartment Name, Street, Landmark, Pincode"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                      />
                    </div>

                    {/* Interactive Map Visualizer */}
                    <div className="space-y-2">
                      <InteractiveMap
                        latitude={latitude}
                        longitude={longitude}
                        address={address}
                        interactive={true}
                        onLocationSelect={(newLat, newLon) => {
                          setLatitude(newLat);
                          setLongitude(newLon);
                          setLocationConfirmed(true);
                        }}
                        heightClass="h-48"
                      />

                      {/* Confirmation Checkbox */}
                      <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <input
                          type="checkbox"
                          id="confirm-location-check"
                          checked={locationConfirmed}
                          onChange={(e) => setLocationConfirmed(e.target.checked)}
                          className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                        />
                        <label htmlFor="confirm-location-check" className="text-slate-700 cursor-pointer font-medium">
                          I confirm this location and coordinates ({latitude?.toFixed(4)}°N, {longitude?.toFixed(4)}°E) are accurate for technician arrival.
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedService(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                    >
                      Back to Services
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/25 transition flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Generating Booking...' : 'Submit Service Request (₹' + selectedService.price + ')'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY SERVICE REQUESTS */}
      {activeTab === 'MY_REQUESTS' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">My Service Requests</h2>
              <p className="text-xs text-slate-500">Track real-time technician assignments and timeline updates</p>
            </div>
            <button
              onClick={fetchData}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh List
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {requests.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                You have no active or previous service requests.
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequestForModal(req)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 text-xl font-bold shrink-0">
                      ❄️
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{req.id}</span>
                        {getStatusBadge(req.status)}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">
                        {req.brand?.name} • {req.model?.model_name || 'AC Unit'}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Service: <strong className="text-slate-800">{req.service?.name}</strong> • Date:{' '}
                        {req.preferred_date} ({req.preferred_time})
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-md">
                        Address: {req.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Technician</span>
                      {req.technician ? (
                        <span className="text-xs font-bold text-slate-800 flex items-center md:justify-end gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" /> {req.technician.name}
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 italic">Finding nearest tech...</span>
                      )}
                    </div>

                    <button className="px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-xl border border-sky-200 transition">
                      View Status & Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SERVICE HISTORY */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Completed Service History</h2>
            <p className="text-xs text-slate-500">Access invoices, service logs, and technician reviews</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {completedServices.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No completed services found in your history yet.
              </div>
            ) : (
              completedServices.map((req) => (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequestForModal(req)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{req.id}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        COMPLETED
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">
                      {req.brand?.name} • {req.model?.model_name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {req.service?.name} • Serviced by {req.technician?.name || 'Technician'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {req.invoice && (
                      <span className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                        Invoice: ₹{req.invoice.total_amount}
                      </span>
                    )}
                    <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow hover:bg-slate-800 transition">
                      View Summary & Invoice
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: NOTIFICATIONS */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Service Alerts & Updates</h2>
              <p className="text-xs text-slate-500">Live booking status updates, dispatch notifications, and completed service receipts</p>
            </div>
            {unreadNotifs > 0 && (
              <button
                onClick={() => {
                  notifications.forEach((n) => markNotificationAsRead(n.id));
                }}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                You have no notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif.id)}
                  className={`p-4 sm:p-5 flex items-start gap-4 transition cursor-pointer ${
                    !notif.read ? 'bg-sky-50/40 hover:bg-sky-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${!notif.read ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs ${!notif.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{notif.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: CUSTOMER PROFILE */}
      {activeTab === 'PROFILE' && (
        <div className="space-y-6 animate-in fade-in max-w-2xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Customer Account Profile</h2>
            <p className="text-xs text-slate-500">Your contact information, saved service address, and default GPS dispatch coordinates</p>
          </div>

          <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            {profileSavedMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Profile details updated successfully!
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone</label>
                <input
                  type="text"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  readOnly
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Default Service Address</label>
              <textarea
                rows={3}
                value={profileAddress}
                onChange={(e) => setProfileAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Apartment / Flat, Street, Area, City, Pincode"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-sky-600" />
                Dispatch Coordinates:
              </span>
              <span className="font-mono text-slate-800 font-semibold">
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Profile Details
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Selected Request Modal Details */}
      {selectedRequestForModal && (
        <RequestDetailsModal
          request={selectedRequestForModal}
          onClose={() => setSelectedRequestForModal(null)}
          onStatusUpdated={() => {
            fetchData();
          }}
        />
      )}
      </div>
    </DashboardLayout>
  );
};
