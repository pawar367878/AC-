import {
  User,
  Customer,
  ServiceProvider,
  ACBrand,
  ACModel,
  ServiceItem,
  ACModelService,
  ServiceRequest,
  Invoice,
  Review,
  AppNotification,
  AuditLog,
  AnalyticsSummary,
  PartUsed,
  RequestStatus,
} from '../types.ts';

const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
}

export const api = {
  // Auth
  getDemoUsers: () => request<{ success: boolean; users: User[] }>('/auth/demo-users'),
  login: (identifier: string, password?: string) =>
    request<{
      success: boolean;
      user: User;
      customer: Customer | null;
      technician: ServiceProvider | null;
      token: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: identifier, email: identifier, password }),
    }),
  registerCustomer: (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    address?: string;
    latitude?: number | null;
    longitude?: number | null;
  }) =>
    request<{
      success: boolean;
      user: User;
      customer: Customer;
      token: string;
      message?: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  registerTechnician: (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    address?: string;
    services_provided?: string[];
  }) =>
    request<{
      success: boolean;
      user: User;
      technician: ServiceProvider;
      token: string;
      message?: string;
    }>('/auth/register-technician', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  registerOwner: (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    address?: string;
  }) =>
    request<{
      success: boolean;
      user: User;
      token: string;
      message?: string;
    }>('/auth/register-owner', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Customers
  getCustomers: () => request<{ success: boolean; customers: Customer[] }>('/customers'),

  // Brands
  getBrands: (all: boolean = false) =>
    request<{ success: boolean; brands: ACBrand[] }>(`/brands${all ? '?all=true' : ''}`),
  createBrand: (data: Partial<ACBrand>) =>
    request<{ success: boolean; brand: ACBrand }>('/brands', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBrand: (id: string, data: Partial<ACBrand>) =>
    request<{ success: boolean; brand: ACBrand }>(`/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteBrand: (id: string) =>
    request<{ success: boolean; message: string }>(`/brands/${id}`, {
      method: 'DELETE',
    }),

  // Models
  getModels: (brandId?: string, all: boolean = false) => {
    const params = new URLSearchParams();
    if (brandId) params.set('brandId', brandId);
    if (all) params.set('all', 'true');
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<{ success: boolean; models: ACModel[] }>(`/models${query}`);
  },
  getModelById: (id: string) =>
    request<{ success: boolean; model: ACModel }>(`/models/${id}`),
  createModel: (data: Partial<ACModel> & { mapped_service_ids?: string[] }) =>
    request<{ success: boolean; model: ACModel }>('/models', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateModel: (id: string, data: Partial<ACModel> & { mapped_service_ids?: string[] }) =>
    request<{ success: boolean; model: ACModel }>(`/models/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteModel: (id: string) =>
    request<{ success: boolean; message: string }>(`/models/${id}`, {
      method: 'DELETE',
    }),

  // Services
  getServices: (all: boolean = false) =>
    request<{ success: boolean; services: ServiceItem[] }>(`/services${all ? '?all=true' : ''}`),
  getServicesForModel: (modelId: string) =>
    request<{ success: boolean; model_id: string; services: ServiceItem[] }>(
      `/models/${modelId}/services`
    ),
  getServicesForBrand: (brandId: string) =>
    request<{ success: boolean; brand_id: string; services: ServiceItem[] }>(
      `/brands/${brandId}/services`
    ),
  createService: (data: Partial<ServiceItem>) =>
    request<{ success: boolean; service: ServiceItem }>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateService: (id: string, data: Partial<ServiceItem>) =>
    request<{ success: boolean; service: ServiceItem }>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteService: (id: string) =>
    request<{ success: boolean; message: string }>(`/services/${id}`, {
      method: 'DELETE',
    }),

  // Mappings
  getMappings: () =>
    request<{ success: boolean; mappings: ACModelService[] }>('/mappings'),
  toggleMapping: (model_id: string, service_id: string, is_enabled: boolean, custom_price?: number | null) =>
    request<{ success: boolean; mapping: ACModelService }>('/mappings/toggle', {
      method: 'POST',
      body: JSON.stringify({ model_id, service_id, is_enabled, custom_price }),
    }),

  // Technicians
  getTechnicians: (customerLat?: number, customerLon?: number) => {
    let query = '';
    if (customerLat !== undefined && customerLon !== undefined) {
      query = `?lat=${customerLat}&lon=${customerLon}`;
    }
    return request<{ success: boolean; technicians: ServiceProvider[] }>(`/technicians${query}`);
  },
  createTechnician: (data: any) =>
    request<{ success: boolean; technician: ServiceProvider }>('/technicians', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTechnician: (id: string, data: Partial<ServiceProvider>) =>
    request<{ success: boolean; technician: ServiceProvider }>(`/technicians/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Service Requests
  getRequests: (params?: { customerId?: string; technicianId?: string; status?: RequestStatus }) => {
    const q = new URLSearchParams();
    if (params?.customerId) q.set('customerId', params.customerId);
    if (params?.technicianId) q.set('technicianId', params.technicianId);
    if (params?.status) q.set('status', params.status);
    const queryString = q.toString() ? `?${q.toString()}` : '';
    return request<{ success: boolean; requests: ServiceRequest[] }>(`/requests${queryString}`);
  },
  getRequestById: (id: string) =>
    request<{ success: boolean; request: ServiceRequest }>(`/requests/${id}`),
  createRequest: (data: {
    customer_id: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    ac_brand_id: string;
    ac_model_id: string;
    service_id: string;
    preferred_date: string;
    preferred_time: string;
    problem_description: string;
  }) =>
    request<{ success: boolean; request: ServiceRequest }>('/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  assignTechnician: (requestId: string, technician_id: string, owner_name?: string) =>
    request<{ success: boolean; request: ServiceRequest }>(`/requests/${requestId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ technician_id, owner_name }),
    }),
  technicianAccept: (requestId: string, user_id?: string, user_name?: string) =>
    request<{ success: boolean; request: ServiceRequest }>(`/requests/${requestId}/accept`, {
      method: 'POST',
      body: JSON.stringify({ user_id, user_name }),
    }),
  technicianReject: (requestId: string, reason?: string, user_id?: string, user_name?: string) =>
    request<{ success: boolean; request: ServiceRequest }>(`/requests/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason, user_id, user_name }),
    }),
  technicianStart: (requestId: string, user_id?: string, user_name?: string) =>
    request<{ success: boolean; request: ServiceRequest }>(`/requests/${requestId}/start`, {
      method: 'POST',
      body: JSON.stringify({ user_id, user_name }),
    }),
  technicianComplete: (
    requestId: string,
    data: {
      work_performed: string;
      technician_notes: string;
      parts_used?: PartUsed[];
      additional_charges?: number;
      before_photo_url?: string;
      after_photo_url?: string;
      user_id?: string;
      user_name?: string;
    }
  ) =>
    request<{ success: boolean; request: ServiceRequest }>(`/requests/${requestId}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  cancelRequest: (requestId: string, reason: string, user_id?: string, user_name?: string, role?: string) =>
    request<{ success: boolean; request: ServiceRequest }>(`/requests/${requestId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason, user_id, user_name, role }),
    }),

  // Invoices
  getInvoices: () =>
    request<{ success: boolean; invoices: Invoice[] }>('/invoices'),
  getInvoiceById: (id: string) =>
    request<{ success: boolean; invoice: Invoice }>(`/invoices/${id}`),
  payInvoice: (id: string, method?: string) =>
    request<{ success: boolean; invoice: Invoice }>(`/invoices/${id}/pay`, {
      method: 'PUT',
      body: JSON.stringify({ payment_method: method }),
    }),

  // Reviews
  getReviews: (technicianId?: string) =>
    request<{ success: boolean; reviews: Review[] }>(
      `/reviews${technicianId ? `?technicianId=${technicianId}` : ''}`
    ),
  submitReview: (data: {
    service_request_id: string;
    customer_id: string;
    customer_name: string;
    technician_id: string;
    rating: number;
    comment: string;
  }) =>
    request<{ success: boolean; review: Review }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Notifications
  getNotifications: (role: string, userId: string) =>
    request<{ success: boolean; notifications: AppNotification[] }>(
      `/notifications?role=${role}&userId=${userId}`
    ),
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  // Audit Logs
  getAuditLogs: () =>
    request<{ success: boolean; audit_logs: AuditLog[] }>('/audit-logs'),

  // Owner Analytics
  getOwnerAnalytics: () =>
    request<{ success: boolean; analytics: AnalyticsSummary }>('/analytics/owner'),
};
