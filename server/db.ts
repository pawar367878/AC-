import fs from 'fs';
import path from 'path';
import {
  User,
  Customer,
  ServiceProvider,
  ACBrand,
  ACModel,
  ServiceItem,
  ACModelService,
  ServiceRequest,
  StatusHistoryEntry,
  Invoice,
  Review,
  AppNotification,
  AuditLog,
  ServicePhoto,
  PartUsed,
  RequestStatus,
  UserRole,
} from '../src/types.ts';

export interface DatabaseSchema {
  users: User[];
  customers: Customer[];
  service_providers: ServiceProvider[];
  ac_brands: ACBrand[];
  ac_models: ACModel[];
  services: ServiceItem[];
  ac_model_services: ACModelService[];
  service_requests: ServiceRequest[];
  service_status_history: StatusHistoryEntry[];
  invoices: Invoice[];
  reviews: Review[];
  notifications: AppNotification[];
  audit_logs: AuditLog[];
  service_photos: ServicePhoto[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'smart_ac_db.json');

// Haversine distance calculator in KM
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

class RelationalDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadOrSeed();
  }

  private loadOrSeed(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.ac_brands && parsed.ac_models && parsed.services) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error reading DB file, reseeding:', err);
    }

    const seeded = this.getInitialSeed();
    this.saveToDisk(seeded);
    return seeded;
  }

  private saveToDisk(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const toWrite = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(toWrite, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database to disk:', err);
    }
  }

  private getInitialSeed(): DatabaseSchema {
    const now = new Date().toISOString();

    const users: User[] = [
      {
        id: 'usr_admin',
        email: 'admin@smartac.com',
        role: 'OWNER',
        name: 'Rajesh Verma',
        phone: '+91 98900 11223',
        created_at: now,
      },
      {
        id: 'usr_tech_1',
        email: 'anil.tech@example.com',
        role: 'SERVICE_PROVIDER',
        name: 'Anil Kumar',
        phone: '+91 98222 33445',
        created_at: now,
      },
      {
        id: 'usr_tech_2',
        email: 'vikram.tech@example.com',
        role: 'SERVICE_PROVIDER',
        name: 'Vikram Singh',
        phone: '+91 98333 44556',
        created_at: now,
      },
      {
        id: 'usr_tech_3',
        email: 'suresh.tech@example.com',
        role: 'SERVICE_PROVIDER',
        name: 'Suresh Rao',
        phone: '+91 98444 55667',
        created_at: now,
      },
      {
        id: 'usr_cust_1',
        email: 'rahul.sharma@example.com',
        role: 'CUSTOMER',
        name: 'Rahul Sharma',
        phone: '+91 98765 43210',
        created_at: now,
      },
      {
        id: 'usr_cust_2',
        email: 'priya.patel@example.com',
        role: 'CUSTOMER',
        name: 'Priya Patel',
        phone: '+91 98111 22334',
        created_at: now,
      },
    ];

    const customers: Customer[] = [
      {
        id: 'cust_1',
        user_id: 'usr_cust_1',
        full_name: 'Rahul Sharma',
        phone: '+91 98765 43210',
        email: 'rahul.sharma@example.com',
        default_address: 'Flat 402, Palm Meadows, 100ft Road, Indiranagar, Bangalore 560038',
        latitude: 12.9716,
        longitude: 77.5946,
        created_at: now,
      },
      {
        id: 'cust_2',
        user_id: 'usr_cust_2',
        full_name: 'Priya Patel',
        phone: '+91 98111 22334',
        email: 'priya.patel@example.com',
        default_address: 'B-12 Green Glen Layout, Bellandur Outer Ring Road, Bangalore 560103',
        latitude: 12.9279,
        longitude: 77.6761,
        created_at: now,
      },
    ];

    const service_providers: ServiceProvider[] = [
      {
        id: 'tech_1',
        user_id: 'usr_tech_1',
        name: 'Anil Kumar',
        phone: '+91 98222 33445',
        email: 'anil.tech@example.com',
        skills: ['Split AC Expert', 'Inverter Dual Cooling', 'Gas Charging & Leakage'],
        service_areas: ['Indiranagar', 'Koramangala', 'Domlur', 'MG Road'],
        availability: 'AVAILABLE',
        experience_years: 7,
        status: 'ACTIVE',
        current_latitude: 12.9650,
        current_longitude: 77.6010,
        rating: 4.9,
        total_ratings_count: 84,
        created_at: now,
      },
      {
        id: 'tech_2',
        user_id: 'usr_tech_2',
        name: 'Vikram Singh',
        phone: '+91 98333 44556',
        email: 'vikram.tech@example.com',
        skills: ['Inverter PCB Repair', 'Heavy Cassette AC', 'Master Installation'],
        service_areas: ['Whitefield', 'Bellandur', 'HSR Layout', 'Marathahalli'],
        availability: 'AVAILABLE',
        experience_years: 9,
        status: 'ACTIVE',
        current_latitude: 12.9820,
        current_longitude: 77.6150,
        rating: 4.8,
        total_ratings_count: 112,
        created_at: now,
      },
      {
        id: 'tech_3',
        user_id: 'usr_tech_3',
        name: 'Suresh Rao',
        phone: '+91 98444 55667',
        email: 'suresh.tech@example.com',
        skills: ['Deep Jet Cleaning', 'Water Leakage Specialist', 'Window & Split Maintenance'],
        service_areas: ['Jayanagar', 'JP Nagar', 'BTM Layout', 'Banashankari'],
        availability: 'AVAILABLE',
        experience_years: 5,
        status: 'ACTIVE',
        current_latitude: 12.9410,
        current_longitude: 77.5800,
        rating: 4.7,
        total_ratings_count: 65,
        created_at: now,
      },
    ];

    const ac_brands: ACBrand[] = [
      { id: 'b_lg', name: 'LG', logo_badge: 'LG', country: 'South Korea', is_active: true, created_at: now },
      { id: 'b_samsung', name: 'Samsung', logo_badge: 'SAMSUNG', country: 'South Korea', is_active: true, created_at: now },
      { id: 'b_voltas', name: 'Voltas', logo_badge: 'VOLTAS', country: 'India (Tata)', is_active: true, created_at: now },
      { id: 'b_daikin', name: 'Daikin', logo_badge: 'DAIKIN', country: 'Japan', is_active: true, created_at: now },
      { id: 'b_bluestar', name: 'Blue Star', logo_badge: 'BLUE STAR', country: 'India', is_active: true, created_at: now },
      { id: 'b_carrier', name: 'Carrier', logo_badge: 'CARRIER', country: 'USA', is_active: true, created_at: now },
      { id: 'b_panasonic', name: 'Panasonic', logo_badge: 'PANASONIC', country: 'Japan', is_active: true, created_at: now },
      { id: 'b_godrej', name: 'Godrej', logo_badge: 'GODREJ', country: 'India', is_active: true, created_at: now },
      { id: 'b_hitachi', name: 'Hitachi', logo_badge: 'HITACHI', country: 'Japan', is_active: true, created_at: now },
    ];

    const ac_models: ACModel[] = [
      {
        id: 'm_lg_15_split',
        brand_id: 'b_lg',
        model_name: 'LG 1.5 Ton 5 Star AI Dual Inverter Split AC',
        ac_type: 'Split AC',
        capacity: '1.5 Ton',
        technology: 'Inverter',
        star_rating: 5,
        description: 'Super-convertible 6-in-1 cooling with HD filter and anti-virus protection.',
        image_url: 'https://images.unsplash.com/photo-1614633833026-0820552978b6?w=600&auto=format&fit=crop&q=80',
        is_active: true,
        created_at: now,
      },
      {
        id: 'm_lg_10_split',
        brand_id: 'b_lg',
        model_name: 'LG 1.0 Ton 3 Star DUAL Inverter Split AC',
        ac_type: 'Split AC',
        capacity: '1.0 Ton',
        technology: 'Inverter',
        star_rating: 3,
        description: 'Fast cooling 4-in-1 inverter unit ideal for small to medium bedrooms.',
        image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
        is_active: true,
        created_at: now,
      },
      {
        id: 'm_sam_15_windfree',
        brand_id: 'b_samsung',
        model_name: 'Samsung 1.5 Ton 5 Star WindFree Inverter Split AC',
        ac_type: 'Split AC',
        capacity: '1.5 Ton',
        technology: 'Inverter',
        star_rating: 5,
        description: 'Draft-free cooling with 23,000 micro air holes and AI auto cooling sensor.',
        image_url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop&q=80',
        is_active: true,
        created_at: now,
      },
      {
        id: 'm_sam_20_inverter',
        brand_id: 'b_samsung',
        model_name: 'Samsung 2.0 Ton 3 Star Convertible Split AC',
        ac_type: 'Split AC',
        capacity: '2.0 Ton',
        technology: 'Inverter',
        star_rating: 3,
        description: 'Heavy duty high-capacity unit designed for spacious living halls.',
        image_url: 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=600&auto=format&fit=crop&q=80',
        is_active: true,
        created_at: now,
      },
      {
        id: 'm_volt_15_adj',
        brand_id: 'b_voltas',
        model_name: 'Voltas 1.5 Ton 3 Star Adjustable Inverter Split AC',
        ac_type: 'Split AC',
        capacity: '1.5 Ton',
        technology: 'Inverter',
        star_rating: 3,
        description: 'All-weather dual-mode smart cooling with copper condenser coil.',
        image_url: 'https://images.unsplash.com/photo-1614633833026-0820552978b6?w=600&auto=format&fit=crop&q=80',
        is_active: true,
        created_at: now,
      },
      {
        id: 'm_volt_15_win',
        brand_id: 'b_voltas',
        model_name: 'Voltas 1.5 Ton 5 Star Window AC',
        ac_type: 'Window AC',
        capacity: '1.5 Ton',
        technology: 'Non-Inverter',
        star_rating: 5,
        description: 'High energy-efficiency window unit with anti-dust filter and auto-restart.',
        image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=80',
        is_active: true,
        created_at: now,
      },
      {
        id: 'm_daikin_15_split',
        brand_id: 'b_daikin',
        model_name: 'Daikin 1.5 Ton 5 Star Inverter Split AC (FTKF50)',
        ac_type: 'Split AC',
        capacity: '1.5 Ton',
        technology: 'Inverter',
        star_rating: 5,
        description: 'Quiet Japanese precision cooling with PM2.5 filter and Coanda airflow.',
        image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
        is_active: true,
        created_at: now,
      },
      {
        id: 'm_blue_15_split',
        brand_id: 'b_bluestar',
        model_name: 'Blue Star 1.5 Ton 5 Star Inverter Split AC',
        ac_type: 'Split AC',
        capacity: '1.5 Ton',
        technology: 'Inverter',
        star_rating: 5,
        description: 'Precision cooling with Turbo Cool, acoustic jacket, and self-clean tech.',
        image_url: 'https://images.unsplash.com/photo-1614633833026-0820552978b6?w=600&auto=format&fit=crop&q=80',
        is_active: true,
        created_at: now,
      },
      {
        id: 'm_carr_15_split',
        brand_id: 'b_carrier',
        model_name: 'Carrier 1.5 Ton 3 Star Flexicool Inverter Split AC',
        ac_type: 'Split AC',
        capacity: '1.5 Ton',
        technology: 'Inverter',
        star_rating: 3,
        description: 'Flexicool 6-in-1 inverter tech with PM 2.5 filter and Insta-cool booster.',
        image_url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop&q=80',
        is_active: true,
        created_at: now,
      },
      {
        id: 'm_pana_15_wifi',
        brand_id: 'b_panasonic',
        model_name: 'Panasonic 1.5 Ton 5 Star Wi-Fi Inverter Split AC',
        ac_type: 'Split AC',
        capacity: '1.5 Ton',
        technology: 'Inverter',
        star_rating: 5,
        description: 'Miraie IoT enabled with nanoe-G air purifier and 7-in-1 convertible modes.',
        image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
        is_active: true,
        created_at: now,
      },
      {
        id: 'm_godrej_15_split',
        brand_id: 'b_godrej',
        model_name: 'Godrej 1.5 Ton 3 Star 5-in-1 Convertible Inverter Split AC',
        ac_type: 'Split AC',
        capacity: '1.5 Ton',
        technology: 'Inverter',
        star_rating: 3,
        description: 'Eco-friendly R32 refrigerant with heavy anti-corrosive blue fin coating.',
        image_url: 'https://images.unsplash.com/photo-1614633833026-0820552978b6?w=600&auto=format&fit=crop&q=80',
        is_active: true,
        created_at: now,
      },
      {
        id: 'm_hitachi_15_split',
        brand_id: 'b_hitachi',
        model_name: 'Hitachi 1.5 Ton 5 Star Yoshi Inverter Split AC',
        ac_type: 'Split AC',
        capacity: '1.5 Ton',
        technology: 'Inverter',
        star_rating: 5,
        description: 'FrostWash self-cleaning tech with expandable inverter and silent sweep fan.',
        image_url: 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=600&auto=format&fit=crop&q=80',
        is_active: true,
        created_at: now,
      },
    ];

    const services: ServiceItem[] = [
      {
        id: 'srv_1',
        name: 'General AC Service',
        description: 'Filter cleanup, blower dusting, cooling coil wash, gas pressure check & drain flush.',
        price: 499,
        estimated_duration: '45 mins',
        status: 'ACTIVE',
        category: 'Maintenance',
        created_at: now,
      },
      {
        id: 'srv_2',
        name: 'Deep Jet Cleaning Service',
        description: 'High pressure foam wash for both indoor and outdoor condenser units to restore 100% cooling.',
        price: 899,
        estimated_duration: '60 mins',
        status: 'ACTIVE',
        category: 'Cleaning',
        created_at: now,
      },
      {
        id: 'srv_3',
        name: 'Cooling Problem & Gas Leak Check',
        description: 'Comprehensive cooling loss diagnosis, flare nut check, soapy bubble leak test, sensor calibration.',
        price: 699,
        estimated_duration: '45 mins',
        status: 'ACTIVE',
        category: 'Diagnostics',
        created_at: now,
      },
      {
        id: 'srv_4',
        name: 'Complete Gas Check & Refill',
        description: 'Vacuuming, nitrogen pressure hold, leak repair, and precision top-up of pure R32/R410A refrigerant.',
        price: 2199,
        estimated_duration: '75 mins',
        status: 'ACTIVE',
        category: 'Repair',
        created_at: now,
      },
      {
        id: 'srv_5',
        name: 'Water Leakage Inspection & Repair',
        description: 'Unclogging of blocked drain pipe, drain tray leveling, and anti-algae flush to stop water dripping.',
        price: 549,
        estimated_duration: '45 mins',
        status: 'ACTIVE',
        category: 'Repair',
        created_at: now,
      },
      {
        id: 'srv_6',
        name: 'AC Installation',
        description: 'Heavy duty wall bracket mounting, indoor unit leveling, copper line connection & vacuum commissioning.',
        price: 1399,
        estimated_duration: '90 mins',
        status: 'ACTIVE',
        category: 'Installation',
        created_at: now,
      },
      {
        id: 'srv_7',
        name: 'AC Uninstallation',
        description: 'Safe refrigerant pump-down into compressor, dismounting of indoor and outdoor units with copper pipe coil.',
        price: 799,
        estimated_duration: '45 mins',
        status: 'ACTIVE',
        category: 'Installation',
        created_at: now,
      },
      {
        id: 'srv_8',
        name: 'Electrical & PCB Circuit Repair',
        description: 'Inspection of inverter power board, relay switches, thermistors, run capacitors, and wiring short circuit.',
        price: 1199,
        estimated_duration: '60 mins',
        status: 'ACTIVE',
        category: 'Electrical',
        created_at: now,
      },
      {
        id: 'srv_9',
        name: 'Noise & Vibration Fix',
        description: 'Blower bearing replacement, condenser fan balance adjustment, rubber damper pads installation.',
        price: 599,
        estimated_duration: '45 mins',
        status: 'ACTIVE',
        category: 'Repair',
        created_at: now,
      },
      {
        id: 'srv_10',
        name: 'Comprehensive Annual Maintenance (AMC)',
        description: '1-year protection plan: 3 scheduled periodic services, 1 deep jet wash, and unlimited emergency breakdown visits.',
        price: 3499,
        estimated_duration: '1 Year Plan',
        status: 'ACTIVE',
        category: 'AMC',
        created_at: now,
      },
    ];

    // Seed AC Model <-> Service mappings (Many to Many)
    const ac_model_services: ACModelService[] = [];
    let mapId = 1;

    ac_models.forEach((m) => {
      services.forEach((s) => {
        // Window AC doesn't get Split-specific installation/uninstallation
        if (m.ac_type === 'Window AC' && (s.id === 'srv_6' || s.id === 'srv_7')) {
          return;
        }
        // Specific mapping logic:
        // Let's enable most services by default, but let Window AC and some models have deliberate custom sets
        let isEnabled = true;
        if (m.id === 'm_volt_15_win' && s.id === 'srv_8') {
          isEnabled = false; // Owner disabled PCB repair for this specific window model
        }
        if (m.id === 'm_lg_10_split' && s.id === 'srv_9') {
          isEnabled = false;
        }

        ac_model_services.push({
          id: `map_${mapId++}`,
          ac_model_id: m.id,
          service_id: s.id,
          is_enabled: isEnabled,
          created_at: now,
        });
      });
    });

    // Seed realistic service requests representing all lifecycle statuses
    const service_requests: ServiceRequest[] = [
      {
        id: 'ACSR-2026-00001',
        customer_id: 'cust_1',
        customer_name: 'Rahul Sharma',
        customer_phone: '+91 98765 43210',
        customer_email: 'rahul.sharma@example.com',
        address: 'Flat 402, Palm Meadows, 100ft Road, Indiranagar, Bangalore 560038',
        latitude: 12.9716,
        longitude: 77.5946,
        ac_brand_id: 'b_lg',
        ac_model_id: 'm_lg_15_split',
        service_id: 'srv_3',
        preferred_date: '2026-09-06',
        preferred_time: '10:00 AM - 12:00 PM',
        problem_description: 'AC is blowing room-temperature air despite setting temperature to 18°C. Chilled air stops after 5 minutes.',
        status: 'PENDING',
        assigned_technician_id: null,
        created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: 'ACSR-2026-00002',
        customer_id: 'cust_2',
        customer_name: 'Priya Patel',
        customer_phone: '+91 98111 22334',
        customer_email: 'priya.patel@example.com',
        address: 'B-12 Green Glen Layout, Bellandur Outer Ring Road, Bangalore 560103',
        latitude: 12.9279,
        longitude: 77.6761,
        ac_brand_id: 'b_samsung',
        ac_model_id: 'm_sam_15_windfree',
        service_id: 'srv_2',
        preferred_date: '2026-09-05',
        preferred_time: '02:00 PM - 04:00 PM',
        problem_description: 'Dust accumulation on cooling fins, unpleasant odor during startup. Need complete deep foam jet cleaning.',
        status: 'ASSIGNED',
        assigned_technician_id: 'tech_1',
        created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'ACSR-2026-00003',
        customer_id: 'cust_1',
        customer_name: 'Rahul Sharma',
        customer_phone: '+91 98765 43210',
        customer_email: 'rahul.sharma@example.com',
        address: 'Flat 402, Palm Meadows, 100ft Road, Indiranagar, Bangalore 560038',
        latitude: 12.9716,
        longitude: 77.5946,
        ac_brand_id: 'b_daikin',
        ac_model_id: 'm_daikin_15_split',
        service_id: 'srv_4',
        preferred_date: '2026-09-05',
        preferred_time: '11:00 AM - 01:00 PM',
        problem_description: 'Low cooling error code E4 on display. Previous service tech identified gas leakage near flare nut.',
        status: 'ACCEPTED',
        assigned_technician_id: 'tech_2',
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: 'ACSR-2026-00004',
        customer_id: 'cust_2',
        customer_name: 'Priya Patel',
        customer_phone: '+91 98111 22334',
        customer_email: 'priya.patel@example.com',
        address: 'B-12 Green Glen Layout, Bellandur Outer Ring Road, Bangalore 560103',
        latitude: 12.9279,
        longitude: 77.6761,
        ac_brand_id: 'b_voltas',
        ac_model_id: 'm_volt_15_adj',
        service_id: 'srv_5',
        preferred_date: '2026-09-04',
        preferred_time: '04:00 PM - 06:00 PM',
        problem_description: 'Water dripping continuously down the wall from the bottom right edge of indoor split AC unit.',
        status: 'IN PROGRESS',
        assigned_technician_id: 'tech_3',
        created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
      },
      {
        id: 'ACSR-2026-00005',
        customer_id: 'cust_1',
        customer_name: 'Rahul Sharma',
        customer_phone: '+91 98765 43210',
        customer_email: 'rahul.sharma@example.com',
        address: 'Flat 402, Palm Meadows, 100ft Road, Indiranagar, Bangalore 560038',
        latitude: 12.9716,
        longitude: 77.5946,
        ac_brand_id: 'b_bluestar',
        ac_model_id: 'm_blue_15_split',
        service_id: 'srv_1',
        preferred_date: '2026-09-02',
        preferred_time: '10:00 AM - 12:00 PM',
        problem_description: 'Seasonal periodic maintenance before summer surge.',
        status: 'COMPLETED',
        assigned_technician_id: 'tech_1',
        work_performed: 'Disassembled air filters, washed cooling fins with chemical spray, unclogged drain line, verified 135 PSI suction pressure.',
        technician_notes: 'AC is operating at peak cooling efficiency with 11.2°C vent output temperature.',
        parts_used: [
          { name: 'Air Filter Clips (Pair)', cost: 120 },
          { name: 'Anti-Vibration Bushing Set', cost: 180 },
        ],
        additional_charges: 0,
        created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 72).toISOString(),
      },
    ];

    const service_status_history: StatusHistoryEntry[] = [
      {
        id: 'hist_1',
        service_request_id: 'ACSR-2026-00001',
        previous_status: null,
        new_status: 'PENDING',
        changed_by_user_id: 'usr_cust_1',
        changed_by_role: 'CUSTOMER',
        changed_by_name: 'Rahul Sharma',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        remarks: 'Service request created by customer.',
      },
      {
        id: 'hist_2',
        service_request_id: 'ACSR-2026-00002',
        previous_status: null,
        new_status: 'PENDING',
        changed_by_user_id: 'usr_cust_2',
        changed_by_role: 'CUSTOMER',
        changed_by_name: 'Priya Patel',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        remarks: 'Service request submitted.',
      },
      {
        id: 'hist_3',
        service_request_id: 'ACSR-2026-00002',
        previous_status: 'PENDING',
        new_status: 'ASSIGNED',
        changed_by_user_id: 'usr_admin',
        changed_by_role: 'OWNER',
        changed_by_name: 'Rajesh Verma',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        remarks: 'Assigned to Anil Kumar based on 2.4 km distance and high rating.',
      },
      {
        id: 'hist_4',
        service_request_id: 'ACSR-2026-00003',
        previous_status: 'ASSIGNED',
        new_status: 'ACCEPTED',
        changed_by_user_id: 'usr_tech_2',
        changed_by_role: 'SERVICE_PROVIDER',
        changed_by_name: 'Vikram Singh',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        remarks: 'Technician accepted the assignment and confirmed scheduled slot.',
      },
      {
        id: 'hist_5',
        service_request_id: 'ACSR-2026-00004',
        previous_status: 'ACCEPTED',
        new_status: 'IN PROGRESS',
        changed_by_user_id: 'usr_tech_3',
        changed_by_role: 'SERVICE_PROVIDER',
        changed_by_name: 'Suresh Rao',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        remarks: 'Technician reached customer location and commenced diagnosis.',
      },
      {
        id: 'hist_6',
        service_request_id: 'ACSR-2026-00005',
        previous_status: 'IN PROGRESS',
        new_status: 'COMPLETED',
        changed_by_user_id: 'usr_tech_1',
        changed_by_role: 'SERVICE_PROVIDER',
        changed_by_name: 'Anil Kumar',
        timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
        remarks: 'Service successfully executed. Cleaned, tested, and invoice generated.',
      },
    ];

    const invoices: Invoice[] = [
      {
        id: 'inv_1',
        invoice_number: 'INV-2026-00001',
        service_request_id: 'ACSR-2026-00005',
        customer_id: 'cust_1',
        customer_name: 'Rahul Sharma',
        customer_phone: '+91 98765 43210',
        address: 'Flat 402, Palm Meadows, 100ft Road, Indiranagar, Bangalore 560038',
        ac_brand_name: 'Blue Star',
        ac_model_name: 'Blue Star 1.5 Ton 5 Star Inverter Split AC',
        service_name: 'General AC Service',
        technician_name: 'Anil Kumar',
        service_date: '2026-09-02',
        base_service_charge: 499,
        parts_charges: 300,
        parts_details: [
          { name: 'Air Filter Clips (Pair)', cost: 120 },
          { name: 'Anti-Vibration Bushing Set', cost: 180 },
        ],
        additional_charges: 0,
        tax_percent: 18,
        tax_amount: 143.82,
        total_amount: 942.82,
        payment_status: 'PAID',
        payment_method: 'UPI / Online',
        created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
      },
    ];

    const reviews: Review[] = [
      {
        id: 'rev_1',
        service_request_id: 'ACSR-2026-00005',
        customer_id: 'cust_1',
        customer_name: 'Rahul Sharma',
        technician_id: 'tech_1',
        technician_name: 'Anil Kumar',
        rating: 5,
        comment: 'Super fast and punctual! Anil arrived on time with complete jet gear and cleaned the AC meticulously. Cooling is drastically improved.',
        created_at: new Date(Date.now() - 3600000 * 70).toISOString(),
      },
    ];

    const service_photos: ServicePhoto[] = [
      {
        id: 'photo_1',
        service_request_id: 'ACSR-2026-00005',
        photo_type: 'BEFORE',
        photo_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
        caption: 'Clogged cooling fins and dirty indoor blower prior to service.',
        uploaded_by_technician_id: 'tech_1',
        uploaded_at: new Date(Date.now() - 3600000 * 74).toISOString(),
      },
      {
        id: 'photo_2',
        service_request_id: 'ACSR-2026-00005',
        photo_type: 'AFTER',
        photo_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80',
        caption: 'Pristine cleaned evaporator coil after high pressure deep jet wash.',
        uploaded_by_technician_id: 'tech_1',
        uploaded_at: new Date(Date.now() - 3600000 * 72).toISOString(),
      },
    ];

    const notifications: AppNotification[] = [
      {
        id: 'notif_1',
        recipient_user_id: 'usr_cust_1',
        recipient_role: 'CUSTOMER',
        title: 'Service Request Submitted',
        message: 'Your service request #ACSR-2026-00001 for LG 1.5 Ton Split AC has been received.',
        read: false,
        related_request_id: 'ACSR-2026-00001',
        created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: 'notif_2',
        recipient_user_id: 'usr_tech_1',
        recipient_role: 'SERVICE_PROVIDER',
        title: 'New Service Job Assigned',
        message: 'You have been assigned request #ACSR-2026-00002 for Priya Patel at Bellandur.',
        read: false,
        related_request_id: 'ACSR-2026-00002',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'notif_3',
        recipient_user_id: 'usr_admin',
        recipient_role: 'OWNER',
        title: 'New Service Request',
        message: 'New request #ACSR-2026-00001 requires technician dispatch.',
        read: false,
        related_request_id: 'ACSR-2026-00001',
        created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
    ];

    const audit_logs: AuditLog[] = [
      {
        id: 'audit_1',
        owner_id: 'usr_admin',
        owner_name: 'Rajesh Verma',
        action: 'UPDATE_SERVICE_PRICE',
        entity_type: 'SERVICE',
        entity_id: 'srv_2',
        previous_value: '₹799',
        new_value: '₹899',
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
      {
        id: 'audit_2',
        owner_id: 'usr_admin',
        owner_name: 'Rajesh Verma',
        action: 'ASSIGN_TECHNICIAN',
        entity_type: 'SERVICE_REQUEST',
        entity_id: 'ACSR-2026-00002',
        previous_value: 'UNASSIGNED',
        new_value: 'Anil Kumar (tech_1)',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
    ];

    return {
      users,
      customers,
      service_providers,
      ac_brands,
      ac_models,
      services,
      ac_model_services,
      service_requests,
      service_status_history,
      invoices,
      reviews,
      notifications,
      audit_logs,
      service_photos,
    };
  }

  // --- QUERY & DATA ACCESS METHODS ---

  // Auth / Users
  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getAllUsers(): User[] {
    return this.data.users;
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.saveToDisk();
    return user;
  }

  // Customers
  public getCustomerByUserId(userId: string): Customer | undefined {
    return this.data.customers.find((c) => c.user_id === userId);
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.data.customers.find((c) => c.id === id);
  }

  public getAllCustomers(): Customer[] {
    return this.data.customers;
  }

  public createCustomer(customer: Customer): Customer {
    this.data.customers.push(customer);
    this.saveToDisk();
    return customer;
  }

  // Service Providers / Technicians
  public getAllTechnicians(customerLat?: number, customerLon?: number): ServiceProvider[] {
    const list = this.data.service_providers.map((t) => {
      let distance_km: number | undefined = undefined;
      if (
        customerLat !== undefined &&
        customerLon !== undefined &&
        t.current_latitude &&
        t.current_longitude
      ) {
        distance_km = calculateDistanceKm(
          customerLat,
          customerLon,
          t.current_latitude,
          t.current_longitude
        );
      }
      return {
        ...t,
        distance_km,
      };
    });

    if (customerLat !== undefined && customerLon !== undefined) {
      list.sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));
    }
    return list;
  }

  public getTechnicianById(id: string): ServiceProvider | undefined {
    return this.data.service_providers.find((t) => t.id === id);
  }

  public getTechnicianByUserId(userId: string): ServiceProvider | undefined {
    return this.data.service_providers.find((t) => t.user_id === userId);
  }

  public createTechnician(tech: ServiceProvider): ServiceProvider {
    this.data.service_providers.push(tech);
    this.saveToDisk();
    return tech;
  }

  public updateTechnician(id: string, updates: Partial<ServiceProvider>): ServiceProvider | null {
    const idx = this.data.service_providers.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    this.data.service_providers[idx] = { ...this.data.service_providers[idx], ...updates };
    this.saveToDisk();
    return this.data.service_providers[idx];
  }

  // AC Brands
  public getAllBrands(onlyActive: boolean = true): ACBrand[] {
    let brands = this.data.ac_brands;
    if (onlyActive) {
      brands = brands.filter((b) => b.is_active);
    }
    return brands.map((b) => ({
      ...b,
      models_count: this.data.ac_models.filter((m) => m.brand_id === b.id && m.is_active).length,
    }));
  }

  public getBrandById(id: string): ACBrand | undefined {
    return this.data.ac_brands.find((b) => b.id === id);
  }

  public createBrand(brand: ACBrand): ACBrand {
    this.data.ac_brands.push(brand);
    this.saveToDisk();
    return brand;
  }

  public updateBrand(id: string, updates: Partial<ACBrand>): ACBrand | null {
    const idx = this.data.ac_brands.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    this.data.ac_brands[idx] = { ...this.data.ac_brands[idx], ...updates };
    this.saveToDisk();
    return this.data.ac_brands[idx];
  }

  public deleteBrand(id: string): boolean {
    const idx = this.data.ac_brands.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    this.data.ac_brands.splice(idx, 1);
    this.saveToDisk();
    return true;
  }

  // AC Models
  public getAllModels(options?: { brandId?: string; onlyActive?: boolean }): ACModel[] {
    let models = this.data.ac_models;
    if (options?.brandId) {
      models = models.filter((m) => m.brand_id === options.brandId);
    }
    if (options?.onlyActive !== false) {
      models = models.filter((m) => m.is_active);
    }

    return models.map((m) => {
      const brand = this.getBrandById(m.brand_id);
      const mappedServices = this.data.ac_model_services.filter(
        (map) => map.ac_model_id === m.id && map.is_enabled
      );
      return {
        ...m,
        brand_name: brand?.name || 'Unknown',
        mapped_service_ids: mappedServices.map((map) => map.service_id),
        available_services_count: mappedServices.length,
      };
    });
  }

  public getModelById(id: string): ACModel | undefined {
    const m = this.data.ac_models.find((model) => model.id === id);
    if (!m) return undefined;
    const brand = this.getBrandById(m.brand_id);
    const mappedServices = this.data.ac_model_services.filter(
      (map) => map.ac_model_id === m.id && map.is_enabled
    );
    return {
      ...m,
      brand_name: brand?.name || 'Unknown',
      mapped_service_ids: mappedServices.map((map) => map.service_id),
      available_services_count: mappedServices.length,
    };
  }

  public createModel(model: ACModel, initialServiceIds?: string[]): ACModel {
    this.data.ac_models.push(model);

    // If service IDs were provided, create mappings
    if (initialServiceIds && initialServiceIds.length > 0) {
      initialServiceIds.forEach((srvId) => {
        this.data.ac_model_services.push({
          id: `map_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          ac_model_id: model.id,
          service_id: srvId,
          is_enabled: true,
          created_at: new Date().toISOString(),
        });
      });
    } else {
      // Default map to all active services
      this.data.services.forEach((srv) => {
        this.data.ac_model_services.push({
          id: `map_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          ac_model_id: model.id,
          service_id: srv.id,
          is_enabled: true,
          created_at: new Date().toISOString(),
        });
      });
    }

    this.saveToDisk();
    return this.getModelById(model.id) || model;
  }

  public updateModel(id: string, updates: Partial<ACModel>): ACModel | null {
    const idx = this.data.ac_models.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    this.data.ac_models[idx] = { ...this.data.ac_models[idx], ...updates };
    this.saveToDisk();
    return this.getModelById(id) || null;
  }

  public deleteModel(id: string): boolean {
    const idx = this.data.ac_models.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    this.data.ac_models.splice(idx, 1);
    // clean up mappings
    this.data.ac_model_services = this.data.ac_model_services.filter((map) => map.ac_model_id !== id);
    this.saveToDisk();
    return true;
  }

  // Services
  public getAllServices(onlyActive: boolean = true): ServiceItem[] {
    if (onlyActive) {
      return this.data.services.filter((s) => s.status === 'ACTIVE');
    }
    return this.data.services;
  }

  public getServiceById(id: string): ServiceItem | undefined {
    return this.data.services.find((s) => s.id === id);
  }

  public createService(service: ServiceItem): ServiceItem {
    this.data.services.push(service);
    // map to models by default
    this.data.ac_models.forEach((m) => {
      this.data.ac_model_services.push({
        id: `map_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        ac_model_id: m.id,
        service_id: service.id,
        is_enabled: true,
        created_at: new Date().toISOString(),
      });
    });
    this.saveToDisk();
    return service;
  }

  public updateService(id: string, updates: Partial<ServiceItem>): ServiceItem | null {
    const idx = this.data.services.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.data.services[idx] = { ...this.data.services[idx], ...updates };
    this.saveToDisk();
    return this.data.services[idx];
  }

  public deleteService(id: string): boolean {
    const idx = this.data.services.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.data.services.splice(idx, 1);
    this.data.ac_model_services = this.data.ac_model_services.filter((map) => map.service_id !== id);
    this.saveToDisk();
    return true;
  }

  // Model <-> Service Mappings (CRITICAL FEATURE)
  public getMappedServicesForModel(modelId: string): ServiceItem[] {
    const activeModel = this.data.ac_models.find((m) => m.id === modelId && m.is_active);
    if (!activeModel) return [];

    const enabledMappings = this.data.ac_model_services.filter(
      (map) => map.ac_model_id === modelId && map.is_enabled
    );
    const serviceIds = new Set(enabledMappings.map((m) => m.service_id));

    // Return only active services that are explicitly mapped
    return this.data.services
      .filter((s) => s.status === 'ACTIVE' && serviceIds.has(s.id))
      .map((s) => {
        const mapping = enabledMappings.find((m) => m.service_id === s.id);
        const effectivePrice = mapping?.custom_price_override ?? s.price;
        return {
          ...s,
          price: effectivePrice,
        };
      });
  }

  public getMappedServicesForBrand(brandId: string): ServiceItem[] {
    const brandModels = this.data.ac_models.filter((m) => m.brand_id === brandId && m.is_active);
    const modelIds = new Set(brandModels.map((m) => m.id));
    const enabledMappings = this.data.ac_model_services.filter(
      (map) => modelIds.has(map.ac_model_id) && map.is_enabled
    );
    const serviceIds = new Set(enabledMappings.map((m) => m.service_id));

    if (serviceIds.size === 0) {
      return this.getAllServices(true);
    }

    return this.data.services
      .filter((s) => s.status === 'ACTIVE' && serviceIds.has(s.id))
      .map((s) => {
        const mapping = enabledMappings.find((m) => m.service_id === s.id);
        const effectivePrice = mapping?.custom_price_override ?? s.price;
        return {
          ...s,
          price: effectivePrice,
        };
      });
  }

  public getAllMappings(): ACModelService[] {
    return this.data.ac_model_services;
  }

  public toggleModelServiceMapping(
    modelId: string,
    serviceId: string,
    isEnabled: boolean,
    customPrice?: number | null
  ): ACModelService {
    const existingIdx = this.data.ac_model_services.findIndex(
      (m) => m.ac_model_id === modelId && m.service_id === serviceId
    );

    if (existingIdx !== -1) {
      this.data.ac_model_services[existingIdx].is_enabled = isEnabled;
      if (customPrice !== undefined) {
        this.data.ac_model_services[existingIdx].custom_price_override = customPrice;
      }
      this.saveToDisk();
      return this.data.ac_model_services[existingIdx];
    } else {
      const newMap: ACModelService = {
        id: `map_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        ac_model_id: modelId,
        service_id: serviceId,
        is_enabled: isEnabled,
        custom_price_override: customPrice || null,
        created_at: new Date().toISOString(),
      };
      this.data.ac_model_services.push(newMap);
      this.saveToDisk();
      return newMap;
    }
  }

  public batchUpdateModelServices(modelId: string, serviceIds: string[]): ACModelService[] {
    const srvSet = new Set(serviceIds);
    this.data.services.forEach((s) => {
      const isEnabled = srvSet.has(s.id);
      this.toggleModelServiceMapping(modelId, s.id, isEnabled);
    });
    return this.data.ac_model_services.filter((m) => m.ac_model_id === modelId);
  }

  // Service Requests
  public generateNextRequestId(): string {
    const year = new Date().getFullYear();
    const count = this.data.service_requests.length + 1;
    const padded = count.toString().padStart(5, '0');
    return `ACSR-${year}-${padded}`;
  }

  public getAllRequests(options?: {
    customerId?: string;
    technicianId?: string;
    status?: RequestStatus;
  }): ServiceRequest[] {
    let list = this.data.service_requests;

    if (options?.customerId) {
      list = list.filter((r) => r.customer_id === options.customerId);
    }
    if (options?.technicianId) {
      list = list.filter((r) => r.assigned_technician_id === options.technicianId);
    }
    if (options?.status) {
      list = list.filter((r) => r.status === options.status);
    }

    // Hydrate relational data
    return list.map((r) => this.hydrateRequest(r));
  }

  public getRequestById(id: string): ServiceRequest | undefined {
    const r = this.data.service_requests.find((req) => req.id === id);
    if (!r) return undefined;
    return this.hydrateRequest(r);
  }

  private hydrateRequest(r: ServiceRequest): ServiceRequest {
    const brand = this.getBrandById(r.ac_brand_id);
    const model = this.getModelById(r.ac_model_id);
    const service = this.getServiceById(r.service_id);
    const technician = r.assigned_technician_id
      ? this.getTechnicianById(r.assigned_technician_id)
      : undefined;

    const status_history = this.data.service_status_history
      .filter((h) => h.service_request_id === r.id)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const photos = this.data.service_photos.filter((p) => p.service_request_id === r.id);
    const invoice = this.data.invoices.find((inv) => inv.service_request_id === r.id);
    const review = this.data.reviews.find((rev) => rev.service_request_id === r.id);

    return {
      ...r,
      brand,
      model,
      service,
      technician,
      status_history,
      photos,
      invoice,
      review,
    };
  }

  public createServiceRequest(params: {
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
  }): ServiceRequest {
    const now = new Date().toISOString();
    const id = this.generateNextRequestId();

    const newRequest: ServiceRequest = {
      id,
      customer_id: params.customer_id,
      customer_name: params.customer_name,
      customer_phone: params.customer_phone,
      customer_email: params.customer_email,
      address: params.address,
      latitude: params.latitude,
      longitude: params.longitude,
      ac_brand_id: params.ac_brand_id,
      ac_model_id: params.ac_model_id,
      service_id: params.service_id,
      preferred_date: params.preferred_date,
      preferred_time: params.preferred_time,
      problem_description: params.problem_description,
      status: 'PENDING',
      assigned_technician_id: null,
      created_at: now,
      updated_at: now,
    };

    this.data.service_requests.unshift(newRequest);

    // Record initial status history
    this.data.service_status_history.push({
      id: `hist_${Date.now()}`,
      service_request_id: id,
      previous_status: null,
      new_status: 'PENDING',
      changed_by_user_id: params.customer_id,
      changed_by_role: 'CUSTOMER',
      changed_by_name: params.customer_name,
      timestamp: now,
      remarks: 'Customer submitted new service request.',
    });

    // Notify Customer
    this.createNotification({
      recipient_user_id: params.customer_id,
      recipient_role: 'CUSTOMER',
      title: 'Service Request Created',
      message: `Your request #${id} has been submitted and is awaiting technician dispatch.`,
      related_request_id: id,
    });

    // Notify Owner
    this.createNotification({
      recipient_user_id: 'usr_admin',
      recipient_role: 'OWNER',
      title: 'New Service Request',
      message: `New booking #${id} by ${params.customer_name}. Please assign a technician.`,
      related_request_id: id,
    });

    this.saveToDisk();
    return this.hydrateRequest(newRequest);
  }

  public assignTechnician(
    requestId: string,
    technicianId: string,
    ownerUser: User
  ): ServiceRequest | null {
    const req = this.data.service_requests.find((r) => r.id === requestId);
    if (!req) return null;

    const tech = this.getTechnicianById(technicianId);
    if (!tech) return null;

    const oldStatus = req.status;
    req.assigned_technician_id = technicianId;
    req.assigned_at = new Date().toISOString();
    req.status = 'ASSIGNED';
    req.technician_response = 'PENDING';
    req.updated_at = new Date().toISOString();

    // Record status history
    this.data.service_status_history.push({
      id: `hist_${Date.now()}`,
      service_request_id: requestId,
      previous_status: oldStatus,
      new_status: 'ASSIGNED',
      changed_by_user_id: ownerUser.id,
      changed_by_role: 'OWNER',
      changed_by_name: ownerUser.name,
      timestamp: req.updated_at,
      remarks: `Assigned technician ${tech.name} (${tech.phone}).`,
    });

    // Notify Technician
    this.createNotification({
      recipient_user_id: tech.user_id,
      recipient_role: 'SERVICE_PROVIDER',
      title: 'New Job Assigned',
      message: `You have been assigned service request #${req.id} for ${req.customer_name}.`,
      related_request_id: req.id,
    });

    // Notify Customer
    const customer = this.getCustomerById(req.customer_id);
    if (customer) {
      this.createNotification({
        recipient_user_id: customer.user_id,
        recipient_role: 'CUSTOMER',
        title: 'Technician Assigned',
        message: `Technician ${tech.name} has been assigned to your service request #${req.id}.`,
        related_request_id: req.id,
      });
    }

    // Audit log
    this.recordAuditLog({
      owner_id: ownerUser.id,
      owner_name: ownerUser.name,
      action: 'ASSIGN_TECHNICIAN',
      entity_type: 'SERVICE_REQUEST',
      entity_id: req.id,
      previous_value: oldStatus,
      new_value: `Assigned to ${tech.name} (ID: ${tech.id})`,
    });

    this.saveToDisk();
    return this.hydrateRequest(req);
  }

  public technicianAccept(requestId: string, techUser: User): ServiceRequest | null {
    const req = this.data.service_requests.find((r) => r.id === requestId);
    if (!req) return null;

    const oldStatus = req.status;
    req.status = 'ACCEPTED';
    req.technician_response = 'ACCEPTED';
    req.updated_at = new Date().toISOString();

    this.data.service_status_history.push({
      id: `hist_${Date.now()}`,
      service_request_id: requestId,
      previous_status: oldStatus,
      new_status: 'ACCEPTED',
      changed_by_user_id: techUser.id,
      changed_by_role: 'SERVICE_PROVIDER',
      changed_by_name: techUser.name,
      timestamp: req.updated_at,
      remarks: 'Technician accepted the job and confirmed availability.',
    });

    // Notify Owner
    this.createNotification({
      recipient_user_id: 'usr_admin',
      recipient_role: 'OWNER',
      title: 'Job Accepted by Technician',
      message: `Technician ${techUser.name} accepted job #${req.id}.`,
      related_request_id: req.id,
    });

    // Notify customer
    const customer = this.getCustomerById(req.customer_id);
    if (customer) {
      this.createNotification({
        recipient_user_id: customer.user_id,
        recipient_role: 'CUSTOMER',
        title: 'Request Accepted',
        message: `Your service request #${req.id} has been accepted by technician ${techUser.name}.`,
        related_request_id: req.id,
      });
    }

    this.saveToDisk();
    return this.hydrateRequest(req);
  }

  public technicianReject(requestId: string, techUser: User, reason?: string): ServiceRequest | null {
    const req = this.data.service_requests.find((r) => r.id === requestId);
    if (!req) return null;

    const oldStatus = req.status;
    req.status = 'REJECTED';
    req.technician_response = 'REJECTED';
    req.updated_at = new Date().toISOString();

    this.data.service_status_history.push({
      id: `hist_${Date.now()}`,
      service_request_id: requestId,
      previous_status: oldStatus,
      new_status: 'REJECTED',
      changed_by_user_id: techUser.id,
      changed_by_role: 'SERVICE_PROVIDER',
      changed_by_name: techUser.name,
      timestamp: req.updated_at,
      remarks: reason ? `Declined by technician: ${reason}` : 'Technician rejected the assigned service request.',
    });

    // Notify Owner immediately
    this.createNotification({
      recipient_user_id: 'usr_admin',
      recipient_role: 'OWNER',
      title: 'Job Declined by Technician',
      message: `Technician ${techUser.name} rejected job #${req.id}. Reason: ${reason || 'Schedule Conflict'}. Please reassign to another technician.`,
      related_request_id: req.id,
    });

    // Notify Customer with helpful update
    const customer = this.getCustomerById(req.customer_id);
    if (customer) {
      this.createNotification({
        recipient_user_id: customer.user_id,
        recipient_role: 'CUSTOMER',
        title: 'Service Dispatch Update',
        message: `Technician was unavailable for request #${req.id}. Our service manager is reassigning a technician immediately.`,
        related_request_id: req.id,
      });
    }

    this.saveToDisk();
    return this.hydrateRequest(req);
  }

  public technicianStart(requestId: string, techUser: User): ServiceRequest | null {
    const req = this.data.service_requests.find((r) => r.id === requestId);
    if (!req) return null;

    const oldStatus = req.status;
    req.status = 'IN PROGRESS';
    req.updated_at = new Date().toISOString();

    this.data.service_status_history.push({
      id: `hist_${Date.now()}`,
      service_request_id: requestId,
      previous_status: oldStatus,
      new_status: 'IN PROGRESS',
      changed_by_user_id: techUser.id,
      changed_by_role: 'SERVICE_PROVIDER',
      changed_by_name: techUser.name,
      timestamp: req.updated_at,
      remarks: 'Technician arrived and started servicing the AC unit.',
    });

    // Notify customer
    const customer = this.getCustomerById(req.customer_id);
    if (customer) {
      this.createNotification({
        recipient_user_id: customer.user_id,
        recipient_role: 'CUSTOMER',
        title: 'Service Started',
        message: `Technician ${techUser.name} has begun working on your AC.`,
        related_request_id: req.id,
      });
    }

    this.saveToDisk();
    return this.hydrateRequest(req);
  }

  public technicianComplete(
    requestId: string,
    techUser: User,
    data: {
      work_performed: string;
      technician_notes: string;
      parts_used?: PartUsed[];
      additional_charges?: number;
      before_photo_url?: string;
      after_photo_url?: string;
    }
  ): ServiceRequest | null {
    const req = this.data.service_requests.find((r) => r.id === requestId);
    if (!req) return null;

    const oldStatus = req.status;
    req.status = 'COMPLETED';
    req.work_performed = data.work_performed;
    req.technician_notes = data.technician_notes;
    req.parts_used = data.parts_used || [];
    req.additional_charges = Number(data.additional_charges) || 0;
    req.updated_at = new Date().toISOString();

    // Add status history
    this.data.service_status_history.push({
      id: `hist_${Date.now()}`,
      service_request_id: requestId,
      previous_status: oldStatus,
      new_status: 'COMPLETED',
      changed_by_user_id: techUser.id,
      changed_by_role: 'SERVICE_PROVIDER',
      changed_by_name: techUser.name,
      timestamp: req.updated_at,
      remarks: `Service successfully concluded: ${data.work_performed}`,
    });

    // Photos
    const tech = this.getTechnicianByUserId(techUser.id);
    const techId = tech?.id || 'unknown';
    if (data.before_photo_url) {
      this.data.service_photos.push({
        id: `photo_${Date.now()}_before`,
        service_request_id: req.id,
        photo_type: 'BEFORE',
        photo_url: data.before_photo_url,
        caption: 'Before Service Condition',
        uploaded_by_technician_id: techId,
        uploaded_at: req.updated_at,
      });
    }
    if (data.after_photo_url) {
      this.data.service_photos.push({
        id: `photo_${Date.now()}_after`,
        service_request_id: req.id,
        photo_type: 'AFTER',
        photo_url: data.after_photo_url,
        caption: 'After Service Completed Condition',
        uploaded_by_technician_id: techId,
        uploaded_at: req.updated_at,
      });
    }

    // Generate Invoice automatically
    const service = this.getServiceById(req.service_id);
    const brand = this.getBrandById(req.ac_brand_id);
    const model = this.getModelById(req.ac_model_id);

    const baseCharge = service?.price || 599;
    const partsTotal = (data.parts_used || []).reduce((acc, p) => acc + (Number(p.cost) || 0), 0);
    const additional = Number(data.additional_charges) || 0;
    const subtotal = baseCharge + partsTotal + additional;
    const taxPercent = 18;
    const taxAmount = Math.round(subtotal * (taxPercent / 100) * 100) / 100;
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

    const invYear = new Date().getFullYear();
    const invCount = (this.data.invoices.length + 1).toString().padStart(5, '0');
    const invoiceNumber = `INV-${invYear}-${invCount}`;

    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoice_number: invoiceNumber,
      service_request_id: req.id,
      customer_id: req.customer_id,
      customer_name: req.customer_name,
      customer_phone: req.customer_phone,
      address: req.address,
      ac_brand_name: brand?.name || 'AC',
      ac_model_name: model?.model_name || 'Model',
      service_name: service?.name || 'Service',
      technician_name: techUser.name,
      service_date: req.preferred_date || new Date().toISOString().split('T')[0],
      base_service_charge: baseCharge,
      parts_charges: partsTotal,
      parts_details: data.parts_used || [],
      additional_charges: additional,
      tax_percent: taxPercent,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      payment_status: 'PENDING',
      payment_method: 'Cash / Card / UPI',
      created_at: req.updated_at,
    };

    this.data.invoices.push(newInvoice);

    // Notify customer
    const customer = this.getCustomerById(req.customer_id);
    if (customer) {
      this.createNotification({
        recipient_user_id: customer.user_id,
        recipient_role: 'CUSTOMER',
        title: 'Service Completed & Invoice Ready',
        message: `Your AC service #${req.id} is completed. Invoice #${invoiceNumber} total: ₹${totalAmount}. Please rate your technician.`,
        related_request_id: req.id,
      });
    }

    // Notify Owner
    this.createNotification({
      recipient_user_id: 'usr_admin',
      recipient_role: 'OWNER',
      title: 'Service Completed',
      message: `Technician ${techUser.name} completed #${req.id}. Invoice total ₹${totalAmount}.`,
      related_request_id: req.id,
    });

    this.saveToDisk();
    return this.hydrateRequest(req);
  }

  public cancelRequest(requestId: string, user: User, reason: string): ServiceRequest | null {
    const req = this.data.service_requests.find((r) => r.id === requestId);
    if (!req) return null;

    const oldStatus = req.status;
    req.status = 'CANCELLED';
    req.updated_at = new Date().toISOString();

    this.data.service_status_history.push({
      id: `hist_${Date.now()}`,
      service_request_id: requestId,
      previous_status: oldStatus,
      new_status: 'CANCELLED',
      changed_by_user_id: user.id,
      changed_by_role: user.role,
      changed_by_name: user.name,
      timestamp: req.updated_at,
      remarks: `Service request cancelled: ${reason}`,
    });

    this.saveToDisk();
    return this.hydrateRequest(req);
  }

  // Reviews
  public addReview(params: {
    service_request_id: string;
    customer_id: string;
    customer_name: string;
    technician_id: string;
    rating: number;
    comment: string;
  }): Review {
    const tech = this.getTechnicianById(params.technician_id);
    const newRev: Review = {
      id: `rev_${Date.now()}`,
      service_request_id: params.service_request_id,
      customer_id: params.customer_id,
      customer_name: params.customer_name,
      technician_id: params.technician_id,
      technician_name: tech?.name,
      rating: params.rating,
      comment: params.comment,
      created_at: new Date().toISOString(),
    };

    this.data.reviews.push(newRev);

    // Update technician aggregate rating
    if (tech) {
      const techReviews = this.data.reviews.filter((r) => r.technician_id === tech.id);
      const totalRatings = techReviews.length;
      const sum = techReviews.reduce((acc, r) => acc + r.rating, 0);
      tech.total_ratings_count = totalRatings;
      tech.rating = Math.round((sum / totalRatings) * 10) / 10;
    }

    // Notify Technician & Owner
    if (tech) {
      this.createNotification({
        recipient_user_id: tech.user_id,
        recipient_role: 'SERVICE_PROVIDER',
        title: 'New Rating Received',
        message: `${params.customer_name} left you a ${params.rating}★ review!`,
        related_request_id: params.service_request_id,
      });
    }

    this.createNotification({
      recipient_user_id: 'usr_admin',
      recipient_role: 'OWNER',
      title: 'New Customer Review',
      message: `${params.customer_name} rated technician ${tech?.name || ''} ${params.rating}★.`,
      related_request_id: params.service_request_id,
    });

    this.saveToDisk();
    return newRev;
  }

  public getAllReviews(technicianId?: string): Review[] {
    if (technicianId) {
      return this.data.reviews.filter((r) => r.technician_id === technicianId);
    }
    return this.data.reviews;
  }

  // Invoices
  public getAllInvoices(): Invoice[] {
    return this.data.invoices;
  }

  public getInvoiceById(id: string): Invoice | undefined {
    return this.data.invoices.find((inv) => inv.id === id || inv.invoice_number === id);
  }

  public updateInvoicePayment(id: string, paymentStatus: 'PAID' | 'PENDING', method: string): Invoice | null {
    const inv = this.data.invoices.find((i) => i.id === id);
    if (!inv) return null;
    inv.payment_status = paymentStatus;
    inv.payment_method = method;
    this.saveToDisk();
    return inv;
  }

  // Notifications
  public getNotifications(userRole: UserRole, userId: string): AppNotification[] {
    return this.data.notifications
      .filter((n) => n.recipient_role === userRole || n.recipient_user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public markNotificationRead(id: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (!notif) return false;
    notif.read = true;
    this.saveToDisk();
    return true;
  }

  public createNotification(params: {
    recipient_user_id: string;
    recipient_role: UserRole;
    title: string;
    message: string;
    related_request_id?: string | null;
  }): AppNotification {
    const notif: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      recipient_user_id: params.recipient_user_id,
      recipient_role: params.recipient_role,
      title: params.title,
      message: params.message,
      read: false,
      related_request_id: params.related_request_id || null,
      created_at: new Date().toISOString(),
    };
    this.data.notifications.unshift(notif);
    this.saveToDisk();
    return notif;
  }

  // Audit Logs
  public recordAuditLog(params: {
    owner_id: string;
    owner_name: string;
    action: string;
    entity_type: string;
    entity_id: string;
    previous_value: any;
    new_value: any;
  }): AuditLog {
    const log: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      owner_id: params.owner_id,
      owner_name: params.owner_name,
      action: params.action,
      entity_type: params.entity_type,
      entity_id: params.entity_id,
      previous_value: params.previous_value,
      new_value: params.new_value,
      timestamp: new Date().toISOString(),
    };
    this.data.audit_logs.unshift(log);
    this.saveToDisk();
    return log;
  }

  public getAuditLogs(): AuditLog[] {
    return this.data.audit_logs;
  }

  // Analytics
  public getOwnerAnalytics(): any {
    const total_customers = this.data.customers.length;
    const total_technicians = this.data.service_providers.length;
    const total_models = this.data.ac_models.length;
    const total_services = this.data.services.length;
    const total_requests = this.data.service_requests.length;

    const pending_requests = this.data.service_requests.filter((r) => r.status === 'PENDING').length;
    const assigned_requests = this.data.service_requests.filter((r) => r.status === 'ASSIGNED').length;
    const accepted_requests = this.data.service_requests.filter((r) => r.status === 'ACCEPTED').length;
    const in_progress_requests = this.data.service_requests.filter((r) => r.status === 'IN PROGRESS').length;
    const completed_requests = this.data.service_requests.filter((r) => r.status === 'COMPLETED').length;
    const cancelled_requests = this.data.service_requests.filter((r) => r.status === 'CANCELLED').length;

    const todayStr = new Date().toISOString().split('T')[0];
    const today_requests = this.data.service_requests.filter((r) =>
      r.created_at.startsWith(todayStr)
    ).length;

    const monthly_revenue = this.data.invoices.reduce((acc, inv) => acc + inv.total_amount, 0);

    // Month breakdown
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    const monthly_requests_chart = [
      { month: 'Apr', requests: 12, revenue: 11400 },
      { month: 'May', requests: 28, revenue: 26800 },
      { month: 'Jun', requests: 45, revenue: 42300 },
      { month: 'Jul', requests: 38, revenue: 35900 },
      { month: 'Aug', requests: 52, revenue: 49800 },
      { month: 'Sep', requests: total_requests, revenue: Math.round(monthly_revenue) },
    ];

    // Brand distribution
    const brandCounts: Record<string, number> = {};
    this.data.service_requests.forEach((r) => {
      const b = this.getBrandById(r.ac_brand_id);
      const name = b ? b.name : 'Other';
      brandCounts[name] = (brandCounts[name] || 0) + 1;
    });
    const brand_distribution_chart = Object.entries(brandCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // Top services
    const serviceCounts: Record<string, { count: number; revenue: number }> = {};
    this.data.service_requests.forEach((r) => {
      const s = this.getServiceById(r.service_id);
      const name = s ? s.name : 'Unknown';
      if (!serviceCounts[name]) serviceCounts[name] = { count: 0, revenue: 0 };
      serviceCounts[name].count += 1;
      serviceCounts[name].revenue += s?.price || 0;
    });
    const top_services_chart = Object.entries(serviceCounts).map(([name, val]) => ({
      name,
      count: val.count,
      revenue: val.revenue,
    }));

    // Technician performance
    const technician_performance_chart = this.data.service_providers.map((t) => {
      const completed = this.data.service_requests.filter(
        (r) => r.assigned_technician_id === t.id && r.status === 'COMPLETED'
      ).length;
      return {
        name: t.name,
        completed: completed + Math.floor(t.total_ratings_count / 3), // include historical
        rating: t.rating,
      };
    });

    return {
      total_customers,
      total_technicians,
      total_service_providers: total_technicians,
      total_models,
      total_ac_models: total_models,
      total_services,
      total_requests,
      pending_requests,
      assigned_requests,
      accepted_requests,
      in_progress_requests,
      completed_requests,
      cancelled_requests,
      today_requests,
      monthly_revenue: Math.round(monthly_revenue),
      monthly_requests_chart,
      requests_by_month: monthly_requests_chart,
      brand_distribution_chart,
      popular_brands: brand_distribution_chart.map((b) => ({ brand: b.name, count: b.value })),
      top_services_chart,
      technician_performance_chart,
    };
  }
}

export const db = new RelationalDatabase();
