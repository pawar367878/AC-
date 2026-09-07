import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  ServiceRequest,
  PartUsed,
  Review,
} from '../../types.ts';
import { api } from '../../services/api.ts';
import { InteractiveMap } from '../common/InteractiveMap.tsx';
import { InvoiceModal } from '../common/InvoiceModal.tsx';
import { DashboardLayout, NavItem } from '../common/DashboardLayout.tsx';
import {
  Wrench,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  Camera,
  Plus,
  Trash2,
  ShieldCheck,
  Star,
  RefreshCw,
  Play,
  Check,
  FileText,
  User,
  Navigation,
  LayoutDashboard,
  Bell,
  CheckCircle,
  Award,
  Zap,
  X,
} from 'lucide-react';

export const TechnicianDashboard: React.FC = () => {
  const { user, technician, notifications, markNotificationAsRead } = useAuth();

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    | 'DASHBOARD'
    | 'ASSIGNED'
    | 'PENDING'
    | 'ACCEPTED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'NOTIFICATIONS'
    | 'PROFILE'
  >('DASHBOARD');

  // Technician availability toggle
  const [isAvailable, setIsAvailable] = useState(technician?.is_available ?? true);

  // Completion Modal State
  const [completingRequest, setCompletingRequest] = useState<ServiceRequest | null>(null);
  const [workPerformed, setWorkPerformed] = useState('');
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [partsUsed, setPartsUsed] = useState<PartUsed[]>([
    { name: 'Capacitor 45uF', cost: 350 },
  ]);
  const [newPartName, setNewPartName] = useState('');
  const [newPartCost, setNewPartCost] = useState<number | ''>('');
  const [additionalCharges, setAdditionalCharges] = useState<number | ''>(0);
  const [beforePhotoUrl, setBeforePhotoUrl] = useState(
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80'
  );
  const [afterPhotoUrl, setAfterPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
  );
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState(false);

  // Invoice modal
  const [viewInvoice, setViewInvoice] = useState<any>(null);

  // Rejection modal
  const [rejectingRequest, setRejectingRequest] = useState<ServiceRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('Schedule conflict / already on another job');
  const [customRejectReason, setCustomRejectReason] = useState('');
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRequest) return;
    const finalReason = rejectReason === 'Other' ? customRejectReason || 'Technician unavailable' : rejectReason;
    try {
      setIsSubmittingReject(true);
      const res = await api.technicianReject(rejectingRequest.id, finalReason, user?.id, user?.name);
      if (res.success) {
        setRejectingRequest(null);
        setCustomRejectReason('');
        await fetchTechnicianData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to decline request');
    } finally {
      setIsSubmittingReject(false);
    }
  };

  const fetchTechnicianData = async () => {
    try {
      setIsLoading(true);
      const techId = technician?.id || 'tech_1';
      const [reqRes, revRes] = await Promise.all([
        api.getRequests({ technicianId: techId }),
        api.getReviews(techId),
      ]);

      if (reqRes.success) setRequests(reqRes.requests);
      if (revRes.success) setReviews(revRes.reviews);
    } catch (err) {
      console.error('Failed to load technician data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicianData();
  }, [technician, user]);

  const handleToggleAvailability = async () => {
    if (!technician) return;
    try {
      const newStatus = !isAvailable;
      setIsAvailable(newStatus);
      await api.updateTechnician(technician.id, { is_available: newStatus });
    } catch (err) {
      console.error('Failed to update availability:', err);
    }
  };

  const handleAccept = async (reqId: string) => {
    try {
      const res = await api.technicianAccept(reqId, user?.id, user?.name);
      if (res.success) {
        await fetchTechnicianData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to accept request');
    }
  };

  const handleStart = async (reqId: string) => {
    try {
      const res = await api.technicianStart(reqId, user?.id, user?.name);
      if (res.success) {
        await fetchTechnicianData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to start request');
    }
  };

  const handleAddPart = () => {
    if (!newPartName || newPartCost === '' || Number(newPartCost) < 0) return;
    setPartsUsed((prev) => [...prev, { name: newPartName, cost: Number(newPartCost) }]);
    setNewPartName('');
    setNewPartCost('');
  };

  const handleRemovePart = (idx: number) => {
    setPartsUsed((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingRequest) return;

    try {
      setIsSubmittingCompletion(true);
      const res = await api.technicianComplete(completingRequest.id, {
        work_performed: workPerformed,
        technician_notes: technicianNotes,
        parts_used: partsUsed,
        additional_charges: Number(additionalCharges) || 0,
        before_photo_url: beforePhotoUrl,
        after_photo_url: afterPhotoUrl,
        user_id: user?.id,
        user_name: user?.name,
      });

      if (res.success) {
        setCompletingRequest(null);
        await fetchTechnicianData();
        const invoiceRes = await api.getInvoices();
        if (invoiceRes.success) {
          const matchedInv = invoiceRes.invoices.find((i) => i.service_request_id === completingRequest.id);
          if (matchedInv) {
            setViewInvoice(matchedInv);
          }
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to complete service');
    } finally {
      setIsSubmittingCompletion(false);
    }
  };

  // Metrics
  const activeJobs = requests.filter((r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
  const pendingJobs = requests.filter((r) => r.status === 'ASSIGNED');
  const acceptedJobs = requests.filter((r) => r.status === 'ACCEPTED');
  const inProgressJobs = requests.filter((r) => r.status === 'IN PROGRESS');
  const completedJobs = requests.filter((r) => r.status === 'COMPLETED');
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const navItems: NavItem[] = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ASSIGNED', label: 'Assigned Jobs', icon: Wrench, badge: activeJobs.length },
    {
      id: 'PENDING',
      label: 'Pending Acceptance',
      icon: Clock,
      badge: pendingJobs.length > 0 ? pendingJobs.length : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'ACCEPTED',
      label: 'Accepted',
      icon: Check,
      badge: acceptedJobs.length > 0 ? acceptedJobs.length : undefined,
    },
    {
      id: 'IN_PROGRESS',
      label: 'In Progress',
      icon: Play,
      badge: inProgressJobs.length > 0 ? inProgressJobs.length : undefined,
      badgeColor: 'bg-purple-600 text-white',
    },
    { id: 'COMPLETED', label: 'Completed', icon: CheckCircle2, badge: completedJobs.length },
    {
      id: 'NOTIFICATIONS',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotifs > 0 ? unreadNotifs : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'PROFILE', label: 'Profile', icon: User },
  ];

  // Helper to render individual job card
  const renderJobCard = (job: ServiceRequest) => {
    return (
      <div
        key={job.id}
        className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100"
      >
        {/* Job Header */}
        <div className="p-5 sm:p-6 bg-slate-50/70 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 flex items-center justify-center font-bold text-lg">
              ❄️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900">{job.id}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  job.status === 'ASSIGNED'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : job.status === 'ACCEPTED'
                    ? 'bg-sky-100 text-sky-800 border border-sky-300'
                    : job.status === 'IN PROGRESS'
                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  {job.status}
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">
                {job.brand?.name} • {job.model?.model_name || 'AC Unit'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* ACTION WORKFLOW BUTTONS */}
            {job.status === 'ASSIGNED' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAccept(job.id)}
                  className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-600/20 flex items-center gap-1.5 transition"
                >
                  <Check className="w-4 h-4" /> Accept Job
                </button>
                <button
                  onClick={() => setRejectingRequest(job)}
                  className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                >
                  <X className="w-4 h-4" /> Decline
                </button>
              </div>
            )}

            {job.status === 'ACCEPTED' && (
              <button
                onClick={() => handleStart(job.id)}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition"
              >
                <Play className="w-4 h-4" /> Start Service On-Site
              </button>
            )}

            {job.status === 'IN PROGRESS' && (
              <button
                onClick={() => {
                  setCompletingRequest(job);
                  setWorkPerformed(
                    `Serviced ${job.model?.model_name || 'AC Unit'} indoor and outdoor units. Cleaned condenser coils and checked refrigerant levels.`
                  );
                  setTechnicianNotes('All cooling metrics tested within optimal specifications.');
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition"
              >
                <CheckCircle2 className="w-4 h-4" /> Complete Service & Bill
              </button>
            )}
          </div>
        </div>

        {/* Job Details Grid */}
        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          {/* Customer Details */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Customer & Contact
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{job.customer_name}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-3.5 h-3.5 text-sky-600" />
              <a href={`tel:${job.customer_phone}`} className="hover:underline font-semibold">
                {job.customer_phone}
              </a>
            </div>
            <div className="flex items-start gap-2 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
              <span className="leading-tight">{job.address}</span>
            </div>
          </div>

          {/* Service Specs */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Booked Service Spec
            </span>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="font-bold text-slate-900 block">{job.service?.name}</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Category: {job.service?.category} • Est: {job.service?.estimated_duration || '45 mins'}
              </span>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium">Standard Base Fee:</span>
                <span className="text-xs font-black text-slate-900">₹{job.service?.price}</span>
              </div>
            </div>
          </div>

          {/* Schedule & Notes */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Schedule & Issue Description
            </span>
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span>
                {job.preferred_date} • Slot: {job.preferred_time}
              </span>
            </div>

            <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/80 text-amber-900 text-[11px]">
              <span className="font-bold block text-[10px] uppercase text-amber-700">Problem Reported:</span>
              <p className="mt-0.5 italic">"{job.problem_description || 'Routine maintenance requested'}"</p>
            </div>
          </div>
        </div>

        {/* Customer Location Coordinates & Map View */}
        {job.latitude && job.longitude && (
          <div className="p-4 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Navigation className="w-3 h-3 text-sky-600" /> Live GPS Dispatch Coordinates
              </span>
              <span className="text-[11px] font-mono text-slate-600">
                {job.latitude.toFixed(4)}, {job.longitude.toFixed(4)}
              </span>
            </div>
            <InteractiveMap
              latitude={job.latitude}
              longitude={job.longitude}
              label={`${job.customer_name}'s Location`}
              readonly={true}
              height="160px"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout
      role="SERVICE_PROVIDER"
      roleTitle="Technician Portal"
      roleSubtitle="Field Service Operations"
      navItems={navItems}
      activeItemId={activeTab}
      onSelectItemId={(id) => setActiveTab(id as any)}
      onRefreshData={fetchTechnicianData}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Card Header */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shrink-0 shadow-lg shadow-amber-500/20">
              🔧
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {technician?.name || user?.name || 'Technician Anil Kumar'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 border border-amber-400/30 text-amber-300">
                  Certified Service Partner
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Zone: <strong className="text-slate-200">Koramangala, Indiranagar, HSR Layout</strong> • Experience:{' '}
                <strong className="text-slate-200">{technician?.experience_years || 5} Years</strong>
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{technician?.rating || 4.9}</span>
                  <span className="text-slate-400 font-normal">({technician?.total_ratings_count || 84} ratings)</span>
                </div>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300">
                  Completed Jobs: <strong className="text-white">{technician?.jobs_completed_count || completedJobs.length}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-800">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Dispatch Status</span>
              <button
                onClick={handleToggleAvailability}
                className={`mt-1 px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  isAvailable
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
                {isAvailable ? 'ONLINE / AVAILABLE' : 'BUSY / OFF DUTY'}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar gap-2 sm:gap-4 text-xs font-bold">
          {[
            { id: 'DASHBOARD', label: 'Dashboard Overview' },
            { id: 'ASSIGNED', label: `Assigned Jobs (${activeJobs.length})` },
            { id: 'PENDING', label: `Pending (${pendingJobs.length})` },
            { id: 'ACCEPTED', label: `Accepted (${acceptedJobs.length})` },
            { id: 'IN_PROGRESS', label: `In Progress (${inProgressJobs.length})` },
            { id: 'COMPLETED', label: `Completed (${completedJobs.length})` },
            { id: 'NOTIFICATIONS', label: `Notifications (${unreadNotifs})` },
            { id: 'PROFILE', label: 'Profile' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'border-amber-600 text-amber-800 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB: DASHBOARD OVERVIEW */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-8 animate-in fade-in">
            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div
                onClick={() => setActiveTab('PENDING')}
                className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm bg-amber-50/20 cursor-pointer hover:border-amber-300 transition"
              >
                <span className="text-amber-700 text-[11px] font-bold uppercase tracking-wider">New Assigned</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{pendingJobs.length}</p>
                <span className="text-[10px] text-amber-600 font-semibold">Requires acceptance</span>
              </div>
              <div
                onClick={() => setActiveTab('ACCEPTED')}
                className="bg-white p-4 rounded-2xl border border-sky-200 shadow-sm bg-sky-50/20 cursor-pointer hover:border-sky-300 transition"
              >
                <span className="text-sky-700 text-[11px] font-bold uppercase tracking-wider">Accepted</span>
                <p className="text-2xl font-black text-sky-800 mt-1">{acceptedJobs.length}</p>
                <span className="text-[10px] text-sky-600">Ready to start</span>
              </div>
              <div
                onClick={() => setActiveTab('IN_PROGRESS')}
                className="bg-white p-4 rounded-2xl border border-purple-200 shadow-sm bg-purple-50/20 cursor-pointer hover:border-purple-300 transition"
              >
                <span className="text-purple-700 text-[11px] font-bold uppercase tracking-wider">In Progress</span>
                <p className="text-2xl font-black text-purple-800 mt-1">{inProgressJobs.length}</p>
                <span className="text-[10px] text-purple-600">Active on-site</span>
              </div>
              <div
                onClick={() => setActiveTab('COMPLETED')}
                className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/20 cursor-pointer hover:border-emerald-300 transition"
              >
                <span className="text-emerald-700 text-[11px] font-bold uppercase tracking-wider">Completed</span>
                <p className="text-2xl font-black text-emerald-800 mt-1">{completedJobs.length}</p>
                <span className="text-[10px] text-emerald-600">Invoices billed</span>
              </div>
            </div>

            {/* Urgent / Next Action Card */}
            {pendingJobs.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500 text-white">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-amber-950">You have {pendingJobs.length} new service request awaiting acceptance</h3>
                    <p className="text-[11px] text-amber-800 mt-0.5">Please review the customer address and accept before the dispatch timeout.</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('PENDING')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 transition"
                >
                  View Pending Requests
                </button>
              </div>
            )}

            {/* Active jobs preview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900">Current Assigned Service Queue</h2>
                <button
                  onClick={() => setActiveTab('ASSIGNED')}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700"
                >
                  View All ({activeJobs.length})
                </button>
              </div>

              {activeJobs.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900 mt-3">All caught up!</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    No active dispatches right now. Make sure your status is "ONLINE" to receive new customer allocations.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeJobs.slice(0, 3).map((job) => renderJobCard(job))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: ASSIGNED JOBS */}
        {activeTab === 'ASSIGNED' && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900">All Assigned Jobs ({activeJobs.length})</h2>
              <p className="text-xs text-slate-500">Active doorstep repair requests in your service zones</p>
            </div>

            {activeJobs.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 mt-3">No active jobs in queue</h3>
                <p className="text-xs text-slate-500 mt-1">All allocated customer calls have been completed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeJobs.map((job) => renderJobCard(job))}
              </div>
            )}
          </div>
        )}

        {/* TAB: PENDING JOBS */}
        {activeTab === 'PENDING' && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Pending Acceptance ({pendingJobs.length})</h2>
              <p className="text-xs text-slate-500">Service requests allocated to you that require confirmation</p>
            </div>

            {pendingJobs.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center text-xs text-slate-500">
                No pending requests requiring acceptance.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingJobs.map((job) => renderJobCard(job))}
              </div>
            )}
          </div>
        )}

        {/* TAB: ACCEPTED JOBS */}
        {activeTab === 'ACCEPTED' && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Accepted Jobs ({acceptedJobs.length})</h2>
              <p className="text-xs text-slate-500">Ready to travel to customer doorstep and begin diagnostics</p>
            </div>

            {acceptedJobs.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center text-xs text-slate-500">
                No accepted jobs pending arrival.
              </div>
            ) : (
              <div className="space-y-4">
                {acceptedJobs.map((job) => renderJobCard(job))}
              </div>
            )}
          </div>
        )}

        {/* TAB: IN PROGRESS JOBS */}
        {activeTab === 'IN_PROGRESS' && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900">In Progress On-Site ({inProgressJobs.length})</h2>
              <p className="text-xs text-slate-500">Repairs actively being conducted. Add parts used and photo proof before billing.</p>
            </div>

            {inProgressJobs.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center text-xs text-slate-500">
                No jobs currently marked in progress.
              </div>
            ) : (
              <div className="space-y-4">
                {inProgressJobs.map((job) => renderJobCard(job))}
              </div>
            )}
          </div>
        )}

        {/* TAB: COMPLETED JOBS */}
        {activeTab === 'COMPLETED' && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Completed Service History ({completedJobs.length})</h2>
              <p className="text-xs text-slate-500">Invoices generated and verified by central administration</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
              {completedJobs.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500">
                  No completed service records found yet.
                </div>
              ) : (
                completedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{job.id}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          COMPLETED
                        </span>
                        <span className="text-xs text-slate-400">• {job.preferred_date}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">
                        {job.customer_name} • {job.brand?.name} {job.model?.model_name}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Service: {job.service?.name} • Work: {job.work_performed}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {job.invoice && (
                        <button
                          onClick={() => setViewInvoice(job.invoice)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                        >
                          <FileText className="w-3.5 h-3.5" /> Invoice (₹{job.invoice.total_amount})
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB: NOTIFICATIONS */}
        {activeTab === 'NOTIFICATIONS' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Field Dispatch Alerts</h2>
                <p className="text-xs text-slate-500">Direct assignments from admin dispatch command and customer confirmations</p>
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
                  No notifications recorded.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationAsRead(notif.id)}
                    className={`p-4 sm:p-5 flex items-start gap-4 transition cursor-pointer ${
                      !notif.read ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 ${!notif.read ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
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

        {/* TAB: PROFILE */}
        {activeTab === 'PROFILE' && (
          <div className="space-y-6 animate-in fade-in max-w-2xl">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Technician Professional Profile</h2>
              <p className="text-xs text-slate-500">Field credentials, service zones, and certified skills</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-md shadow-amber-500/20">
                  🔧
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{technician?.name || user?.name || 'Technician Anil'}</h3>
                  <p className="text-xs text-slate-500">ID: {technician?.id || 'tech_1'} • {technician?.experience_years || 5} Years Certified Experience</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                      ⭐ {technician?.rating || 4.9} ({technician?.total_ratings_count || 84} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 text-xs">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Phone Number</span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-semibold text-slate-900">
                    {technician?.phone || '+91 98765 43210'}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block mb-1">Authorized Service Areas</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(technician?.service_areas || ['Koramangala', 'Indiranagar', 'HSR Layout', 'Whitefield']).map((area) => (
                      <span key={area} className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-800 rounded-lg text-xs font-medium">
                        📍 {area}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block mb-1">Certified Skill Sets</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(technician?.skills || ['Split AC', 'Inverter AC', 'Gas Charging', 'PCB Diagnostics']).map((skill) => (
                      <span key={skill} className="px-2.5 py-1 bg-sky-50 border border-sky-200 text-sky-800 rounded-lg text-xs font-semibold">
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">Dispatch Availability</span>
                      <span className="text-[11px] text-slate-500">Toggle whether central dispatch can allocate new calls</span>
                    </div>
                    <button
                      onClick={handleToggleAvailability}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isAvailable
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-300 text-slate-700'
                      }`}
                    >
                      {isAvailable ? 'Online (Accepting Calls)' : 'Offline (Paused)'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMPLETION MODAL */}
        {/* Completion Modal */}
        {completingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-sm text-white">Complete Service & Prepare Tax Invoice</h3>
                </div>
                <button
                  onClick={() => setCompletingRequest(null)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕ Cancel
                </button>
              </div>

              <form onSubmit={handleCompleteSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                {/* Summary Info */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{completingRequest.customer_name}</span>
                    <p className="text-[11px] text-slate-500">
                      Service: {completingRequest.service?.name} (Base: ₹{completingRequest.service?.price})
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-sky-100 text-sky-800 font-bold font-mono text-[11px]">
                    {completingRequest.id}
                  </span>
                </div>

                {/* Work Performed Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Work Performed Description *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={workPerformed}
                    onChange={(e) => setWorkPerformed(e.target.value)}
                    placeholder="Describe exact diagnostics, chemical wash, coil cleaning, or motor fixes carried out..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                  />
                </div>

                {/* Technician Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Technician Diagnostic Notes & Recommendations
                  </label>
                  <textarea
                    rows={2}
                    value={technicianNotes}
                    onChange={(e) => setTechnicianNotes(e.target.value)}
                    placeholder="Cooling airflow measured at 16°C, filter replaced, advised customer next routine servicing in 4 months..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                  />
                </div>

                {/* Parts Used Itemizer */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-900 block">
                    Parts Replaced / Used (Added to Tax Invoice)
                  </span>

                  <div className="space-y-2">
                    {partsUsed.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs"
                      >
                        <span className="font-semibold text-slate-800">{p.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-900">₹{p.cost}</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePart(idx)}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add new part input row */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newPartName}
                      onChange={(e) => setNewPartName(e.target.value)}
                      placeholder="Part Name (e.g. Copper Flare Nut, Capacitor)"
                      className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                    <input
                      type="number"
                      value={newPartCost}
                      onChange={(e) => setNewPartCost(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="₹ Price"
                      className="w-24 p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={handleAddPart}
                      className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Photos Proofs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-slate-500" /> Before Service Photo URL
                    </label>
                    <input
                      type="text"
                      value={beforePhotoUrl}
                      onChange={(e) => setBeforePhotoUrl(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700 truncate"
                    />
                    <div className="mt-1.5 h-20 rounded-lg overflow-hidden border border-slate-200">
                      <img src={beforePhotoUrl} alt="Before" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-emerald-600" /> After Service Photo URL
                    </label>
                    <input
                      type="text"
                      value={afterPhotoUrl}
                      onChange={(e) => setAfterPhotoUrl(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700 truncate"
                    />
                    <div className="mt-1.5 h-20 rounded-lg overflow-hidden border border-slate-200">
                      <img src={afterPhotoUrl} alt="After" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCompletingRequest(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCompletion}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    {isSubmittingCompletion ? 'Finalizing Invoice...' : 'Complete Service & Auto-Generate Invoice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* REJECTION MODAL */}
        {rejectingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
              <div className="p-6 bg-rose-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-800/80 flex items-center justify-center text-rose-200">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base">Decline Service Request</h3>
                    <p className="text-xs text-rose-200">Request #{rejectingRequest.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setRejectingRequest(null)}
                  className="p-1.5 rounded-lg text-rose-200 hover:text-white hover:bg-rose-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
                <p className="text-xs text-slate-600">
                  Please specify why you cannot take this job. The service administrator will be notified immediately so they can reassign the customer to another qualified technician.
                </p>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Select Reason:</label>
                  {[
                    'Schedule conflict / already on another job',
                    'Customer address is outside my service radius',
                    'Specific spare parts or diagnostic tools unavailable today',
                    'Emergency / personal leave',
                    'Other',
                  ].map((reasonOption) => (
                    <label
                      key={reasonOption}
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs text-slate-800 transition"
                    >
                      <input
                        type="radio"
                        name="rejectReason"
                        value={reasonOption}
                        checked={rejectReason === reasonOption}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>{reasonOption}</span>
                    </label>
                  ))}
                </div>

                {rejectReason === 'Other' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Specify Reason:</label>
                    <textarea
                      rows={2}
                      value={customRejectReason}
                      onChange={(e) => setCustomRejectReason(e.target.value)}
                      placeholder="Please explain reason for declining..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setRejectingRequest(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReject}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    {isSubmittingReject ? 'Declining...' : 'Confirm Decline & Notify Admin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invoice Modal if open */}
        {viewInvoice && (
          <InvoiceModal
            invoice={viewInvoice}
            onClose={() => setViewInvoice(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};
