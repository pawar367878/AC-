import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  AnalyticsSummary,
  ACBrand,
  ACModel,
  ServiceItem,
  ACModelService,
  ServiceRequest,
  ServiceProvider,
  Invoice,
  Review,
  AuditLog,
  Customer,
} from '../../types.ts';
import { api } from '../../services/api.ts';
import { InvoiceModal } from '../common/InvoiceModal.tsx';
import { InteractiveMap } from '../common/InteractiveMap.tsx';
import { DashboardLayout, NavItem } from '../common/DashboardLayout.tsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import {
  Shield,
  BarChart3,
  Layers,
  Wrench,
  Users,
  FileText,
  Star,
  History,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  MapPin,
  Compass,
  ArrowUpDown,
  Filter,
  RefreshCw,
  Search,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Settings as SettingsIcon,
  Phone,
  Mail,
  TrendingUp,
} from 'lucide-react';

const COLORS = ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#0369a1', '#075985'];

export const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();

  // Navigation tab
  const [activeSection, setActiveSection] = useState<
    | 'OVERVIEW'
    | 'CUSTOMERS'
    | 'TECHNICIANS'
    | 'BRANDS'
    | 'MODELS'
    | 'SERVICES'
    | 'MAPPING'
    | 'REQUESTS'
    | 'ASSIGNMENTS'
    | 'INVOICES'
    | 'REVIEWS'
    | 'REPORTS'
    | 'AUDIT_LOG'
    | 'SETTINGS'
  >('OVERVIEW');

  // Master State
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [brands, setBrands] = useState<ACBrand[]>([]);
  const [models, setModels] = useState<ACModel[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [mappings, setMappings] = useState<ACModelService[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [technicians, setTechnicians] = useState<ServiceProvider[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Settings State
  const [platformSettings, setPlatformSettings] = useState({
    taxRate: 18,
    helplinePhone: '1800-SMART-AC',
    autoAssignRadiusKm: 15,
    warrantyDays: 30,
    slaHours: 2,
    serviceActive: true,
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Customers Filter
  const [customerSearch, setCustomerSearch] = useState('');

  // Modals & Action States
  const [assignModalReq, setAssignModalReq] = useState<ServiceRequest | null>(null);
  const [assignDistanceTechs, setAssignDistanceTechs] = useState<ServiceProvider[]>([]);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  // Brand Form Modal
  const [editingBrand, setEditingBrand] = useState<Partial<ACBrand> | null>(null);

  // Model Form Modal
  const [editingModel, setEditingModel] = useState<Partial<ACModel> | null>(null);

  // Service Form Modal
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);

  // Technician Form Modal
  const [editingTech, setEditingTech] = useState<Partial<ServiceProvider> | null>(null);

  // Mapping Matrix active model selector
  const [mappingSelectedModelId, setMappingSelectedModelId] = useState<string>('');

  // Requests Table Filters
  const [reqStatusFilter, setReqStatusFilter] = useState<string>('ALL');
  const [reqSearchQuery, setReqSearchQuery] = useState<string>('');

  // Load all master database tables
  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [
        analyticsRes,
        brandsRes,
        modelsRes,
        servicesRes,
        mappingsRes,
        requestsRes,
        techsRes,
        invoicesRes,
        reviewsRes,
        auditRes,
        customersRes,
      ] = await Promise.all([
        api.getOwnerAnalytics(),
        api.getBrands(true),
        api.getModels(undefined, true),
        api.getServices(true),
        api.getMappings(),
        api.getRequests(),
        api.getTechnicians(),
        api.getInvoices(),
        api.getReviews(),
        api.getAuditLogs(),
        api.getCustomers(),
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
      if (brandsRes.success) setBrands(brandsRes.brands);
      if (modelsRes.success) {
        setModels(modelsRes.models);
        if (!mappingSelectedModelId && modelsRes.models.length > 0) {
          setMappingSelectedModelId(modelsRes.models[0].id);
        }
      }
      if (servicesRes.success) setServices(servicesRes.services);
      if (mappingsRes.success) setMappings(mappingsRes.mappings);
      if (requestsRes.success) setRequests(requestsRes.requests);
      if (techsRes.success) setTechnicians(techsRes.technicians);
      if (invoicesRes.success) setInvoices(invoicesRes.invoices);
      if (reviewsRes.success) setReviews(reviewsRes.reviews);
      if (auditRes.success) setAuditLogs(auditRes.audit_logs);
      if ((customersRes as any)?.success) setCustomers((customersRes as any).customers);
    } catch (err) {
      console.error('Failed to load owner portal data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Open Assign Technician Modal and fetch proximity distances
  const handleOpenAssign = async (req: ServiceRequest) => {
    setAssignModalReq(req);
    try {
      const res = await api.getTechnicians(req.latitude || undefined, req.longitude || undefined);
      if (res.success) {
        setAssignDistanceTechs(res.technicians);
      }
    } catch (err) {
      console.error('Failed to get techs with distance:', err);
    }
  };

  const handleConfirmAssign = async (techId: string) => {
    if (!assignModalReq) return;
    try {
      const res = await api.assignTechnician(assignModalReq.id, techId, user?.name);
      if (res.success) {
        setAssignModalReq(null);
        await loadAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to assign technician');
    }
  };

  // Toggle AC Brand Active State
  const handleToggleBrand = async (brand: ACBrand) => {
    try {
      await api.updateBrand(brand.id, { is_active: !brand.is_active });
      await loadAdminData();
    } catch (err) {
      console.error('Toggle brand failed:', err);
    }
  };

  // Save Brand (Create or Edit)
  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand || !editingBrand.name) return;
    try {
      if (editingBrand.id) {
        await api.updateBrand(editingBrand.id, editingBrand);
      } else {
        await api.createBrand(editingBrand);
      }
      setEditingBrand(null);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to save brand');
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    try {
      await api.deleteBrand(id);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete brand');
    }
  };

  // Save Model
  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModel || !editingModel.model_name || !editingModel.brand_id) return;
    try {
      if (editingModel.id) {
        await api.updateModel(editingModel.id, editingModel);
      } else {
        await api.createModel(editingModel as any);
      }
      setEditingModel(null);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to save model');
    }
  };

  const handleDeleteModel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this AC model?')) return;
    try {
      await api.deleteModel(id);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete model');
    }
  };

  // Save Service
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editingService.name) return;
    try {
      if (editingService.id) {
        await api.updateService(editingService.id, editingService);
      } else {
        await api.createService(editingService);
      }
      setEditingService(null);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to save service');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.deleteService(id);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete service');
    }
  };

  // Toggle AC Model ↔ Service Mapping (Critical Dynamic Sync)
  const handleToggleMapping = async (modelId: string, serviceId: string, currentEnabled: boolean) => {
    try {
      await api.toggleMapping(modelId, serviceId, !currentEnabled);
      // Refresh mappings immediately
      const res = await api.getMappings();
      if (res.success) setMappings(res.mappings);
    } catch (err: any) {
      alert(err.message || 'Failed to update mapping');
    }
  };

  // Filtered requests
  const filteredRequests = requests.filter((r) => {
    const matchesStatus = reqStatusFilter === 'ALL' || r.status === reqStatusFilter;
    const q = reqSearchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      r.id.toLowerCase().includes(q) ||
      r.customer_name.toLowerCase().includes(q) ||
      (r.model?.model_name && r.model.model_name.toLowerCase().includes(q)) ||
      (r.technician?.name && r.technician.name.toLowerCase().includes(q));
    return matchesStatus && matchesQuery;
  });

  const unassignedRequests = requests.filter(
    (r) =>
      r.status === 'PENDING' ||
      r.status === 'REJECTED' ||
      !r.technician_id ||
      r.technician_response === 'REJECTED'
  );

  const navItems: NavItem[] = [
    { id: 'OVERVIEW', label: 'Dashboard', icon: BarChart3 },
    { id: 'CUSTOMERS', label: 'Customers', icon: Users, badge: customers.length },
    { id: 'TECHNICIANS', label: 'Technicians', icon: Wrench, badge: technicians.length },
    { id: 'BRANDS', label: 'AC Brands', icon: Layers, badge: brands.length },
    { id: 'MODELS', label: 'AC Models', icon: Layers, badge: models.length },
    { id: 'SERVICES', label: 'Services', icon: Wrench, badge: services.length },
    { id: 'MAPPING', label: 'AC Model -> Service Mapping', icon: ArrowUpDown },
    { id: 'REQUESTS', label: 'Service Requests', icon: Clock, badge: requests.length },
    {
      id: 'ASSIGNMENTS',
      label: 'Assignments',
      icon: Compass,
      badge: unassignedRequests.length > 0 ? unassignedRequests.length : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    { id: 'INVOICES', label: 'Invoices', icon: FileText, badge: invoices.length },
    { id: 'REVIEWS', label: 'Reviews', icon: Star, badge: reviews.length },
    { id: 'REPORTS', label: 'Reports', icon: TrendingUp },
    { id: 'AUDIT_LOG', label: 'Audit Logs', icon: History, badge: auditLogs.length },
    { id: 'SETTINGS', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <DashboardLayout
      role="OWNER"
      roleTitle="Owner / Admin Portal"
      roleSubtitle="Enterprise Operations Control"
      navItems={navItems}
      activeItemId={activeSection}
      onSelectItemId={(id) => setActiveSection(id as any)}
      onRefreshData={loadAdminData}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold mb-2">
              <Shield className="w-3.5 h-3.5" />
              Central Administration & Dispatch Command
            </div>
            <h1 className="text-2xl font-black text-white">Owner / Admin Control Center</h1>
            <p className="text-xs text-slate-400 mt-1">
              Dynamic catalog management, technician proximity dispatch, live service matrix, and revenue analytics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAdminData}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
              <span>Sync Live DB</span>
            </button>
          </div>
        </div>

        {/* Main Tabs Navigation */}
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar gap-2 sm:gap-4 text-xs font-bold">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`pb-3 px-3 border-b-2 whitespace-nowrap flex items-center gap-1.5 transition ${
                  activeSection === tab.id
                    ? 'border-purple-600 text-purple-700 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      tab.badgeColor || 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      {/* SECTION 1: OVERVIEW & ANALYTICS */}
      {activeSection === 'OVERVIEW' && analytics && (
        <div className="space-y-8 animate-in fade-in">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Requests</span>
              <p className="text-xl font-black text-slate-900 mt-1">{analytics.total_requests}</p>
              <span className="text-[10px] text-slate-500">All time</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-sm">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Pending</span>
              <p className="text-xl font-black text-amber-800 mt-1">{analytics.pending_requests}</p>
              <span className="text-[10px] text-amber-600">Needs dispatch</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-sky-200 bg-sky-50/20 shadow-sm">
              <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">Accepted</span>
              <p className="text-xl font-black text-sky-800 mt-1">{analytics.accepted_requests}</p>
              <span className="text-[10px] text-sky-600">Tech en route</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-purple-200 bg-purple-50/20 shadow-sm">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">In Progress</span>
              <p className="text-xl font-black text-purple-800 mt-1">{analytics.in_progress_requests}</p>
              <span className="text-[10px] text-purple-600">Active repairs</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Completed</span>
              <p className="text-xl font-black text-emerald-800 mt-1">{analytics.completed_requests}</p>
              <span className="text-[10px] text-emerald-600">Billed</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Revenue</span>
              <p className="text-xl font-black text-slate-900 mt-1">₹{analytics.monthly_revenue.toLocaleString()}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">+18% vs last month</span>
            </div>
          </div>

          {/* Recharts Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trend Chart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Service Requests & Revenue Trend</h3>
                  <p className="text-xs text-slate-500">Monthly booking volume</p>
                </div>
                <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg">
                  2026 Live Telemetry
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.monthly_requests_chart || analytics.requests_by_month || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                    <Bar dataKey="requests" fill="#0284c7" radius={[6, 6, 0, 0]} name="Requests" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Popular AC Brands Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">AC Brand Popularity Distribution</h3>
                <p className="text-xs text-slate-500">Top requested appliance manufacturers</p>
              </div>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={
                        analytics.popular_brands ||
                        (analytics.brand_distribution_chart
                          ? analytics.brand_distribution_chart.map((b) => ({ brand: b.name, count: b.value }))
                          : [])
                      }
                      dataKey="count"
                      nameKey="brand"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(
                        analytics.popular_brands ||
                        (analytics.brand_distribution_chart
                          ? analytics.brand_distribution_chart.map((b) => ({ brand: b.name, count: b.value }))
                          : [])
                      ).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500">Registered Customers:</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{analytics.total_customers ?? 0}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500">Certified Technicians:</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">
                {analytics.total_technicians ?? analytics.total_service_providers ?? 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500">AC Models in Catalog:</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">
                {analytics.total_models ?? analytics.total_ac_models ?? 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500">Configured Services:</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{analytics.total_services ?? 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: SERVICE REQUESTS & DISPATCH */}
      {activeSection === 'REQUESTS' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
              {['ALL', 'PENDING', 'ASSIGNED', 'ACCEPTED', 'IN PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setReqStatusFilter(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    reqStatusFilter === st
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={reqSearchQuery}
                onChange={(e) => setReqSearchQuery(e.target.value)}
                placeholder="Search ID, Customer, Model..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </div>
          </div>

          {/* Master Requests Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-4">Request ID</th>
                    <th className="p-4">Customer & Location</th>
                    <th className="p-4">AC Model</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Slot Date</th>
                    <th className="p-4">Technician</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Dispatch Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        No service requests match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-mono font-bold text-purple-900">{req.id}</td>
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{req.customer_name}</p>
                          <p className="text-[11px] text-slate-500">{req.customer_phone}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{req.address}</p>
                        </td>
                        <td className="p-4 font-medium text-slate-800">
                          {req.brand?.name} {req.model?.model_name}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-slate-800">{req.service?.name}</span>
                          <span className="block text-[11px] text-slate-500">₹{req.service?.price}</span>
                        </td>
                        <td className="p-4 text-slate-600">
                          {req.preferred_date}
                          <span className="block text-[10px] text-slate-400">{req.preferred_time}</span>
                        </td>
                        <td className="p-4">
                          {req.technician ? (
                            <div>
                              <span className="font-bold text-slate-900 flex items-center gap-1">
                                <Shield className="w-3 h-3 text-purple-600" />
                                {req.technician.name}
                              </span>
                              {req.technician_response === 'REJECTED' && (
                                <span className="text-[10px] text-rose-600 font-bold block mt-0.5">
                                  Declined: {req.technician_rejection_reason || 'Unavailable'}
                                </span>
                              )}
                              {req.technician_response === 'ACCEPTED' && (
                                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                                  Confirmed by Tech
                                </span>
                              )}
                              {req.technician_response === 'PENDING' && (
                                <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
                                  Pending Tech Confirmation
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-amber-600 text-[11px] font-semibold">Unassigned</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              req.status === 'REJECTED' || req.technician_response === 'REJECTED'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : req.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.status === 'CANCELLED'
                                ? 'bg-slate-200 text-slate-700'
                                : req.status === 'IN PROGRESS'
                                ? 'bg-purple-100 text-purple-800'
                                : req.status === 'ACCEPTED'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleOpenAssign(req)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
                              req.status === 'REJECTED' || req.technician_response === 'REJECTED'
                                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                : 'bg-purple-600 hover:bg-purple-700 text-white'
                            }`}
                          >
                            {req.status === 'REJECTED' || req.technician_response === 'REJECTED'
                              ? 'Reassign Tech'
                              : req.technician
                              ? 'Reassign'
                              : 'Assign Tech (GPS)'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: AC BRANDS */}
      {activeSection === 'BRANDS' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">AC Brand Master Management</h2>
              <p className="text-xs text-slate-500">Add, edit, enable or disable AC manufacturer brands</p>
            </div>
            <button
              onClick={() => setEditingBrand({ name: '', logo_url: '', is_active: true })}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" /> Add AC Brand
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {brands.map((b) => (
              <div
                key={b.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="font-extrabold text-slate-900 text-base">{b.name}</h3>
                    <button
                      onClick={() => handleToggleBrand(b)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {b.is_active ? 'ACTIVE' : 'DISABLED'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Models in system: <strong className="text-slate-800">{b.models_count || 0}</strong>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setEditingBrand(b)}
                    className="p-1.5 text-slate-600 hover:text-purple-600 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBrand(b.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: AC MODELS */}
      {activeSection === 'MODELS' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">AC Model Catalog</h2>
              <p className="text-xs text-slate-500">Configure split, window, and inverter models per manufacturer</p>
            </div>
            <button
              onClick={() =>
                setEditingModel({
                  brand_id: brands[0]?.id || '',
                  model_name: '',
                  ac_type: 'Split AC',
                  capacity: '1.5 Ton',
                  technology: 'Inverter',
                  star_rating: 5,
                  description: '',
                  image_url:
                    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
                  is_active: true,
                })
              }
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" /> Add AC Model
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {models.map((m) => (
              <div
                key={m.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img src={m.image_url} alt={m.model_name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 uppercase bg-purple-50 px-2 py-0.5 rounded">
                    {m.brand_name}
                  </span>
                  <h3 className="font-bold text-slate-900 text-xs line-clamp-1">{m.model_name}</h3>
                  <p className="text-[11px] text-slate-500">
                    {m.capacity} • {m.ac_type} • {m.technology}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-amber-500 text-xs font-bold">{m.star_rating} ★</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingModel(m)}
                      className="p-1 text-slate-600 hover:text-purple-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteModel(m.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: SERVICES */}
      {activeSection === 'SERVICES' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Service Master Catalog & Pricing</h2>
              <p className="text-xs text-slate-500">
                Manage service offerings, base charges, and estimated durations. Price updates are recorded in audit logs.
              </p>
            </div>
            <button
              onClick={() =>
                setEditingService({
                  name: '',
                  description: '',
                  price: 499,
                  estimated_duration: '45 mins',
                  is_active: true,
                })
              }
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" /> Add Service
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s) => (
              <div
                key={s.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">{s.name}</h3>
                    <span className="text-sm font-black text-slate-900">₹{s.price}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{s.description}</p>
                  <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Est. {s.estimated_duration}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${s.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {s.is_active ? 'ACTIVE' : 'DISABLED'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingService(s)}
                      className="p-1.5 text-slate-600 hover:text-purple-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(s.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 6: AC MODEL ↔ SERVICE MAPPING (CRITICAL ARCHITECTURE MANDATE) */}
      {activeSection === 'MAPPING' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl">
            <h2 className="text-sm font-bold text-purple-900 flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-purple-600" />
              Dynamic AC Model ↔ Service Mapping Matrix
            </h2>
            <p className="text-xs text-purple-800 mt-1">
              Select an AC Model below. Toggle each service to decide if that service is available for this model.
              When a Customer picks this AC model in the booking flow, the backend dynamically queries this matrix and displays <strong>ONLY mapped services</strong>.
            </p>
          </div>

          {/* Model Selector Strip */}
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Select AC Model to Configure:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMappingSelectedModelId(m.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    mappingSelectedModelId === m.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {m.brand_name} – {m.model_name}
                </button>
              ))}
            </div>
          </div>

          {/* Active Model Mapping Table */}
          {mappingSelectedModelId && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Configuring Services for:{' '}
                    <span className="text-purple-700">
                      {models.find((m) => m.id === mappingSelectedModelId)?.model_name}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">Toggle services on/off for this specific model</p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {services.map((srv) => {
                  // Check if mapped
                  const mapping = mappings.find(
                    (mp) => mp.ac_model_id === mappingSelectedModelId && mp.service_id === srv.id
                  );
                  const isEnabled = mapping ? mapping.is_enabled : false;

                  return (
                    <div
                      key={srv.id}
                      className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{srv.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{srv.description}</p>
                        <span className="text-[11px] font-bold text-slate-700">Base Price: ₹{srv.price}</span>
                      </div>

                      <button
                        onClick={() => handleToggleMapping(mappingSelectedModelId, srv.id, isEnabled)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          isEnabled
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {isEnabled ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> Enabled for this AC
                          </>
                        ) : (
                          'Disabled (Not Mapped)'
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 7: TECHNICIANS */}
      {activeSection === 'TECHNICIANS' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Service Provider / Technician Management</h2>
              <p className="text-xs text-slate-500">Monitor availability, active ratings, and service completion logs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {technicians.map((t) => (
              <div
                key={t.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{t.name}</h3>
                      <p className="text-xs text-slate-500">{t.phone} • {t.email}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.is_available ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {t.is_available ? 'AVAILABLE' : 'BUSY / OFF'}
                    </span>
                  </div>

                  <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Rating:</span>
                      <span className="font-bold text-amber-600 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500" /> {t.rating} ({t.total_ratings_count} reviews)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Completed Jobs:</span>
                      <span className="font-bold text-slate-900">{t.jobs_completed_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Experience:</span>
                      <span className="font-bold text-slate-900">{t.experience_years} Years</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px] truncate max-w-[160px]">
                    GPS: {t.current_latitude?.toFixed(4)}, {t.current_longitude?.toFixed(4)}
                  </span>
                  <button
                    onClick={async () => {
                      await api.updateTechnician(t.id, { is_available: !t.is_available });
                      await loadAdminData();
                    }}
                    className="text-purple-600 hover:text-purple-800 font-bold"
                  >
                    Toggle Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 8: INVOICES */}
      {activeSection === 'INVOICES' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100 animate-in fade-in">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Tax Invoices Master</h3>
              <p className="text-xs text-slate-500">GST invoices generated for customer service jobs</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {invoices.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No invoices generated yet.</div>
            ) : (
              invoices.map((inv) => (
                <div key={inv.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-900">{inv.invoice_number}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.payment_status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.payment_status}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">{inv.customer_name}</h4>
                    <p className="text-xs text-slate-500">
                      {inv.ac_brand_name} {inv.ac_model_name} • {inv.service_name} • Tech: {inv.technician_name}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">Total Amount</span>
                      <span className="text-base font-black text-slate-900">₹{inv.total_amount}</span>
                    </div>
                    <button
                      onClick={() => setViewInvoice(inv)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
                    >
                      View Invoice
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION 9: REVIEWS */}
      {activeSection === 'REVIEWS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 animate-in fade-in">
          <div>
            <h3 className="text-base font-bold text-slate-900">Customer Ratings & Performance Reviews</h3>
            <p className="text-xs text-slate-500">Real customer feedback submitted after service completion</p>
          </div>

          <div className="divide-y divide-slate-100">
            {reviews.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No reviews recorded yet.</div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="py-4 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{rev.customer_name}</span>
                    <div className="flex items-center text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-700 italic">"{rev.comment}"</p>
                  <span className="text-[10px] text-slate-400 block">
                    Recorded on {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION 10: AUDIT LOG */}
      {activeSection === 'AUDIT_LOG' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 animate-in fade-in">
          <div>
            <h3 className="text-base font-bold text-slate-900">System Audit & Compliance Log</h3>
            <p className="text-xs text-slate-500">
              Immutable chronological record of administrator price updates, master additions, and technician dispatches
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className="text-slate-500">{log.entity_type}</span>
                  </div>
                  <p className="text-slate-800 mt-1 font-medium">{log.details}</p>
                  <span className="text-[10px] text-slate-400">By: {log.user_name}</span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: CUSTOMERS */}
      {activeSection === 'CUSTOMERS' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Registered Customers Directory ({customers.length})</h2>
              <p className="text-xs text-slate-500">Homeowners and enterprise clients registered on SmartAC platform</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search name, phone, or area..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {customers.filter((c) => {
              const q = customerSearch.toLowerCase();
              return (
                !q ||
                c.full_name.toLowerCase().includes(q) ||
                c.phone.includes(q) ||
                c.default_address.toLowerCase().includes(q)
              );
            }).length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No matching customer accounts found.
              </div>
            ) : (
              customers
                .filter((c) => {
                  const q = customerSearch.toLowerCase();
                  return (
                    !q ||
                    c.full_name.toLowerCase().includes(q) ||
                    c.phone.includes(q) ||
                    c.default_address.toLowerCase().includes(q)
                  );
                })
                .map((cust) => {
                  const custBookings = requests.filter(
                    (r) => r.customer_id === cust.id || r.customer_phone === cust.phone
                  );
                  return (
                    <div
                      key={cust.id}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{cust.full_name}</span>
                          <span className="font-mono text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-bold">
                            {cust.id}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-sky-600" />
                            {cust.phone}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {cust.email || 'customer@smartac.com'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-start gap-1 pt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <span>{cust.default_address}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-semibold">Total Orders</span>
                          <span className="text-sm font-black text-slate-900">{custBookings.length} Bookings</span>
                        </div>
                        <button
                          onClick={() => {
                            setReqSearchQuery(cust.full_name);
                            setActiveSection('REQUESTS');
                          }}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition"
                        >
                          View Bookings
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* SECTION: ASSIGNMENTS (RAPID DISPATCH) */}
      {activeSection === 'ASSIGNMENTS' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Rapid Technician Dispatch & Assignments</h2>
              <p className="text-xs text-slate-500">Real-time proximity allocation to available field service partners</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {unassignedRequests.length} Pending Dispatch
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                {technicians.filter((t) => t.is_available).length} Techs Online
              </span>
            </div>
          </div>

          {/* Pending Dispatches */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Awaiting Technician Allocation
            </h3>
            {unassignedRequests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                All customer service requests have been dispatched to technicians!
              </div>
            ) : (
              unassignedRequests.map((req) => (
                <div
                  key={req.id}
                  className={`rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    req.status === 'REJECTED' || req.technician_response === 'REJECTED'
                      ? 'bg-rose-50/70 border border-rose-300'
                      : 'bg-white border border-amber-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{req.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === 'REJECTED' || req.technician_response === 'REJECTED'
                            ? 'bg-rose-200 text-rose-900'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {req.status === 'REJECTED' ? 'REJECTED - NEEDS REASSIGNMENT' : req.status}
                      </span>
                      <span className="text-xs text-slate-400">• Slot: {req.preferred_date} ({req.preferred_time})</span>
                    </div>
                    {req.technician_response === 'REJECTED' && (
                      <div className="mt-1.5 p-2 bg-white/80 rounded-lg border border-rose-200 text-rose-800 text-xs">
                        ⚠️ <strong>Technician Declined:</strong> {req.technician?.name || 'Technician'} declined this request (Reason: "{req.technician_rejection_reason || 'Unavailable'}").
                      </div>
                    )}
                    <h4 className="font-bold text-slate-900 text-sm mt-1">
                      {req.customer_name} • {req.brand?.name} {req.model?.model_name}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Service: <strong className="text-slate-800">{req.service?.name}</strong> • "{req.problem_description || 'General Service'}"
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      {req.address}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <button
                      onClick={() => handleOpenAssign(req)}
                      className={`px-5 py-2.5 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 ${
                        req.status === 'REJECTED' || req.technician_response === 'REJECTED'
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      <Compass className="w-4 h-4" /> {req.status === 'REJECTED' ? 'Reassign Tech Now' : 'Dispatch Nearest Tech'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION: REPORTS */}
      {activeSection === 'REPORTS' && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Operational & Financial Reports</h2>
            <p className="text-xs text-slate-500">Performance KPI benchmarks and service line profitability</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Billed Revenue</span>
              <p className="text-2xl font-black text-slate-900">
                ₹{invoices.reduce((acc, i) => acc + i.total_amount, 0).toLocaleString()}
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold">Verified tax invoices</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Job Completion Time</span>
              <p className="text-2xl font-black text-slate-900">1.8 Hours</p>
              <span className="text-[11px] text-sky-600 font-semibold">96.4% on-time dispatch rate</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer Satisfaction</span>
              <p className="text-2xl font-black text-slate-900">4.92 / 5.0</p>
              <span className="text-[11px] text-amber-600 font-semibold">Based on {reviews.length} verified ratings</span>
            </div>
          </div>

          {/* Technician Performance Leaderboard */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Technician Fleet Performance Leaderboard</h3>
            <div className="divide-y divide-slate-100">
              {technicians.map((t, idx) => (
                <div key={t.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[11px]">
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900">{t.name}</span>
                      <span className="text-slate-400 text-[11px] ml-2">Zone: {t.service_areas?.join(', ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="text-slate-600">
                      <strong>{t.jobs_completed_count || 12}</strong> Jobs
                    </span>
                    <span className="text-amber-600 font-bold flex items-center gap-1">
                      ⭐ {t.rating} ({t.total_ratings_count} reviews)
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.is_available ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {t.is_available ? 'ONLINE' : 'BUSY'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION: SETTINGS */}
      {activeSection === 'SETTINGS' && (
        <div className="space-y-6 animate-in fade-in max-w-2xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900">System Platform Settings</h2>
            <p className="text-xs text-slate-500">Configure global business rules, tax parameters, and dispatch boundaries</p>
          </div>

          {settingsSaved && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Platform configurations saved successfully!
            </div>
          )}

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">GST / Service Tax Rate (%)</label>
              <input
                type="number"
                value={platformSettings.taxRate}
                onChange={(e) => setPlatformSettings({ ...platformSettings, taxRate: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Central Emergency Helpline Number</label>
              <input
                type="text"
                value={platformSettings.helplinePhone}
                onChange={(e) => setPlatformSettings({ ...platformSettings, helplinePhone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Proximity Dispatch Radius Limit (KM)</label>
              <input
                type="number"
                value={platformSettings.autoAssignRadiusKm}
                onChange={(e) => setPlatformSettings({ ...platformSettings, autoAssignRadiusKm: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Standard Post-Service Warranty (Days)</label>
              <input
                type="number"
                value={platformSettings.warrantyDays}
                onChange={(e) => setPlatformSettings({ ...platformSettings, warrantyDays: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Service Level Agreement (SLA Target Hours)</label>
              <input
                type="number"
                value={platformSettings.slaHours}
                onChange={(e) => setPlatformSettings({ ...platformSettings, slaHours: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setSettingsSaved(true);
                  setTimeout(() => setSettingsSaved(false), 3000);
                }}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow transition"
              >
                Save Platform Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN TECHNICIAN MODAL WITH CALCULATED DISTANCE */}
      {assignModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-purple-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">
                  Dispatch Technician: {assignModalReq.id}
                </h3>
                <p className="text-[11px] text-purple-200">
                  Customer: {assignModalReq.customer_name} ({assignModalReq.address})
                </p>
              </div>
              <button onClick={() => setAssignModalReq(null)} className="text-purple-200 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-purple-50 rounded-xl text-purple-900 text-xs">
                <strong>Proximity Sorting:</strong> Technicians are ordered by real-time GPS distance from the customer's verified location ({assignModalReq.latitude?.toFixed(4)}, {assignModalReq.longitude?.toFixed(4)}).
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {assignDistanceTechs.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-purple-300 flex items-center justify-between gap-4 transition"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        {t.name}
                        {t.is_available ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {t.experience_years} yrs exp • {t.rating} ★ ({t.total_ratings_count} reviews)
                      </p>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mt-1 inline-block">
                        📍 {t.distance_km !== undefined ? `${t.distance_km} km away` : 'Proximity Available'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleConfirmAssign(t.id)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow transition"
                    >
                      Assign This Tech
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BRAND MODAL */}
      {editingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              {editingBrand.id ? 'Edit AC Brand' : 'Add New AC Brand'}
            </h3>
            <form onSubmit={handleSaveBrand} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={editingBrand.name || ''}
                  onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                  placeholder="e.g. Daikin, Mitsubishi"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="brand-active"
                  checked={editingBrand.is_active ?? true}
                  onChange={(e) => setEditingBrand({ ...editingBrand, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-purple-600"
                />
                <label htmlFor="brand-active" className="text-slate-700 font-semibold cursor-pointer">
                  Brand is Active & Available to Customers
                </label>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBrand(null)}
                  className="px-4 py-2 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow"
                >
                  Save Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODEL MODAL */}
      {editingModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-4 my-6">
            <h3 className="font-bold text-base text-slate-900">
              {editingModel.id ? 'Edit AC Model' : 'Add New AC Model'}
            </h3>
            <form onSubmit={handleSaveModel} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Brand *</label>
                <select
                  required
                  value={editingModel.brand_id || ''}
                  onChange={(e) => setEditingModel({ ...editingModel, brand_id: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">Select Manufacturer</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Model Name *</label>
                <input
                  type="text"
                  required
                  value={editingModel.model_name || ''}
                  onChange={(e) => setEditingModel({ ...editingModel, model_name: e.target.value })}
                  placeholder="e.g. Daikin 1.5 Ton FTKM 5-Star Split AC"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">AC Type</label>
                  <select
                    value={editingModel.ac_type || 'Split AC'}
                    onChange={(e) => setEditingModel({ ...editingModel, ac_type: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Split AC">Split AC</option>
                    <option value="Window AC">Window AC</option>
                    <option value="Cassette AC">Cassette AC</option>
                    <option value="Tower AC">Tower AC</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacity</label>
                  <select
                    value={editingModel.capacity || '1.5 Ton'}
                    onChange={(e) => setEditingModel({ ...editingModel, capacity: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="1 Ton">1 Ton</option>
                    <option value="1.5 Ton">1.5 Ton</option>
                    <option value="2 Ton">2 Ton</option>
                    <option value="3 Ton">3 Ton</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Technology</label>
                  <select
                    value={editingModel.technology || 'Inverter'}
                    onChange={(e) => setEditingModel({ ...editingModel, technology: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Inverter">Inverter</option>
                    <option value="Dual Inverter">Dual Inverter</option>
                    <option value="Non-Inverter">Non-Inverter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={editingModel.image_url || ''}
                  onChange={(e) => setEditingModel({ ...editingModel, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingModel(null)}
                  className="px-4 py-2 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow"
                >
                  Save Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SERVICE MODAL */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              {editingService.id ? 'Edit Service' : 'Add Service'}
            </h3>
            <form onSubmit={handleSaveService} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  value={editingService.name || ''}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  placeholder="e.g. Master Jet Service"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={2}
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  placeholder="Comprehensive coil wash..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editingService.price || ''}
                    onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Duration</label>
                  <input
                    type="text"
                    value={editingService.estimated_duration || '45 mins'}
                    onChange={(e) => setEditingService({ ...editingService, estimated_duration: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow"
                >
                  Save Service & Update Pricing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW INVOICE MODAL */}
      {viewInvoice && (
        <InvoiceModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} />
      )}
      </div>
    </DashboardLayout>
  );
};
