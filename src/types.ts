export type UserRole = 'CUSTOMER' | 'SERVICE_PROVIDER' | 'OWNER';

export type RequestStatus = 
  | 'PENDING' 
  | 'ASSIGNED' 
  | 'ACCEPTED' 
  | 'IN PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone: string;
  created_at: string;
}

export interface Customer {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  email: string;
  default_address: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface ServiceProvider {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string;
  skills: string[];
  service_areas: string[];
  availability: 'AVAILABLE' | 'BUSY' | 'ON_LEAVE' | 'OFFLINE';
  is_available?: boolean;
  jobs_completed_count?: number;
  experience_years: number;
  status: 'ACTIVE' | 'INACTIVE';
  current_latitude: number;
  current_longitude: number;
  rating: number;
  total_ratings_count: number;
  created_at: string;
  // calculated runtime fields
  distance_km?: number;
}

export interface ACBrand {
  id: string;
  name: string;
  logo_badge: string;
  country: string;
  is_active: boolean;
  models_count?: number;
  created_at: string;
}

export type ACType = 'Split AC' | 'Window AC' | 'Cassette AC' | 'Tower AC' | 'Inverter Ducted';
export type ACCapacity = '1.0 Ton' | '1.5 Ton' | '2.0 Ton' | '3.0 Ton';

export interface ACModel {
  id: string;
  brand_id: string;
  brand_name?: string;
  model_name: string;
  ac_type: ACType;
  capacity: ACCapacity;
  technology: 'Inverter' | 'Non-Inverter';
  star_rating: number;
  description: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
  mapped_service_ids?: string[];
  available_services_count?: number;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  estimated_duration: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  category?: string;
}

export interface ACModelService {
  id: string;
  ac_model_id: string;
  service_id: string;
  is_enabled: boolean;
  custom_price_override?: number | null;
  created_at: string;
}

export interface ServicePhoto {
  id: string;
  service_request_id: string;
  photo_type: 'BEFORE' | 'AFTER';
  photo_url: string;
  caption: string;
  uploaded_by_technician_id: string;
  uploaded_at: string;
}

export interface StatusHistoryEntry {
  id: string;
  service_request_id: string;
  previous_status: string | null;
  new_status: RequestStatus;
  changed_by_user_id: string;
  changed_by_role: UserRole;
  changed_by_name: string;
  timestamp: string;
  remarks: string;
}

export interface PartUsed {
  name: string;
  cost: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  service_request_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  ac_brand_name: string;
  ac_model_name: string;
  service_name: string;
  technician_name: string;
  service_date: string;
  base_service_charge: number;
  parts_charges: number;
  parts_details: PartUsed[];
  additional_charges: number;
  tax_percent: number;
  tax_amount: number;
  total_amount: number;
  payment_status: 'PAID' | 'PENDING';
  payment_method: string;
  created_at: string;
}

export interface Review {
  id: string;
  service_request_id: string;
  customer_id: string;
  customer_name: string;
  technician_id: string;
  technician_name?: string;
  rating: number; // 1-5
  comment: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  recipient_user_id: string;
  recipient_role: UserRole;
  title: string;
  message: string;
  read: boolean;
  related_request_id: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  owner_id: string;
  owner_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  previous_value: any;
  new_value: any;
  timestamp: string;
}

export interface ServiceRequest {
  id: string; // e.g. ACSR-2026-00001
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
  status: RequestStatus;
  assigned_technician_id: string | null;
  created_at: string;
  updated_at: string;
  // Hydrated relational fields for UI
  brand?: ACBrand;
  model?: ACModel;
  service?: ServiceItem;
  technician?: ServiceProvider;
  status_history?: StatusHistoryEntry[];
  photos?: ServicePhoto[];
  invoice?: Invoice;
  review?: Review;
  // Completion details
  work_performed?: string;
  technician_notes?: string;
  parts_used?: PartUsed[];
  additional_charges?: number;
}

export interface AnalyticsSummary {
  total_customers: number;
  total_technicians: number;
  total_service_providers?: number;
  total_models: number;
  total_ac_models?: number;
  total_services: number;
  total_requests: number;
  pending_requests: number;
  assigned_requests: number;
  accepted_requests: number;
  in_progress_requests: number;
  completed_requests: number;
  cancelled_requests: number;
  today_requests: number;
  monthly_revenue: number;
  monthly_requests_chart: { month: string; requests: number; revenue: number }[];
  requests_by_month?: { month: string; requests: number; revenue: number }[];
  brand_distribution_chart: { name: string; value: number }[];
  popular_brands?: { brand: string; count: number }[];
  top_services_chart: { name: string; count: number; revenue: number }[];
  technician_performance_chart: { name: string; completed: number; rating: number }[];
}
