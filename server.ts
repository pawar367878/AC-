import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';
import { UserRole } from './src/types.ts';

const app = express();
const PORT = 3000;

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// ----------------------------------------------------
// AUTH ENDPOINTS
// ----------------------------------------------------

// Demo users quick switcher list
app.get('/api/auth/demo-users', (req, res) => {
  const users = db.getAllUsers();
  res.json({
    success: true,
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
    })),
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, email, password } = req.body;
  const identifier = (username || email || '').trim();

  if (!identifier) {
    return res.status(400).json({ success: false, message: 'Username or email is required' });
  }

  // Exact Technician authentication per requirements:
  // Username: technician, Password: technician123
  if (identifier.toLowerCase() === 'technician') {
    if (password !== 'technician123') {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }
    const techUser = db.getUserById('usr_tech_1') || db.getAllUsers().find((u) => u.role === 'SERVICE_PROVIDER');
    if (!techUser) {
      return res.status(404).json({ success: false, message: 'Technician account not found' });
    }
    const technician = db.getTechnicianByUserId(techUser.id);
    return res.json({
      success: true,
      user: techUser,
      customer: null,
      technician,
      token: `demo_token_${techUser.id}`,
    });
  }

  // Exact Owner/Admin authentication per requirements:
  // Username: owner, Password: owner123
  if (identifier.toLowerCase() === 'owner') {
    if (password !== 'owner123') {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }
    const ownerUser = db.getUserById('usr_admin') || db.getAllUsers().find((u) => u.role === 'OWNER');
    if (!ownerUser) {
      return res.status(404).json({ success: false, message: 'Owner account not found' });
    }
    return res.json({
      success: true,
      user: ownerUser,
      customer: null,
      technician: null,
      token: `demo_token_${ownerUser.id}`,
    });
  }

  // Exact Customer demo access per requirements:
  // Username: customer, Password: customer123
  if (identifier.toLowerCase() === 'customer' || identifier.toLowerCase() === 'democustomer') {
    if (password !== 'customer123') {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }
    const custUser = db.getUserById('usr_cust_1') || db.getAllUsers().find((u) => u.role === 'CUSTOMER');
    if (!custUser) {
      return res.status(404).json({ success: false, message: 'Customer account not found' });
    }
    const customer = db.getCustomerByUserId(custUser.id);
    return res.json({
      success: true,
      user: custUser,
      customer,
      technician: null,
      token: `demo_token_${custUser.id}`,
    });
  }

  // Email-based lookup (e.g., custom registered customer or demo switcher)
  const user = db.getUserByEmail(identifier.trim().toLowerCase()) || db.getUserByEmail(identifier);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid username or password.' });
  }

  // Password check for registered users with explicit password or demo fallbacks
  if (user.password && password && user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid username or password.' });
  } else if (!user.password && password && password !== 'pass123' && password !== 'admin123' && password !== 'technician123' && password !== 'owner123' && password !== 'customer123' && password.length < 3) {
    return res.status(401).json({ success: false, message: 'Invalid username or password.' });
  }

  let customer = null;
  let technician = null;

  if (user.role === 'CUSTOMER') {
    customer = db.getCustomerByUserId(user.id);
  } else if (user.role === 'SERVICE_PROVIDER') {
    technician = db.getTechnicianByUserId(user.id);
  }

  res.json({
    success: true,
    user,
    customer,
    technician,
    token: `demo_token_${user.id}`,
  });
});

// Session verification / restore endpoint
app.post('/api/auth/session', (req, res) => {
  const { token, userId } = req.body;
  if (!token && !userId) {
    return res.status(401).json({ success: false, message: 'No session payload' });
  }

  let user = null;
  if (userId) {
    user = db.getUserById(userId);
  } else if (token && token.startsWith('demo_token_')) {
    const idFromToken = token.replace('demo_token_', '');
    user = db.getUserById(idFromToken);
  }

  if (!user) {
    return res.status(401).json({ success: false, message: 'Session expired or user not found' });
  }

  let customer = null;
  let technician = null;
  if (user.role === 'CUSTOMER') {
    customer = db.getCustomerByUserId(user.id);
  } else if (user.role === 'SERVICE_PROVIDER') {
    technician = db.getTechnicianByUserId(user.id);
  }

  return res.json({
    success: true,
    user,
    customer,
    technician,
    token: `demo_token_${user.id}`,
  });
});

// Register Customer
app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password, address, latitude, longitude } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ success: false, message: 'Full name, email, and mobile number are required' });
  }

  const existing = db.getUserByEmail(email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists' });
  }

  const userId = `usr_cust_${Date.now()}`;
  const newUser = db.createUser({
    id: userId,
    email: email.trim().toLowerCase(),
    role: 'CUSTOMER',
    name: name.trim(),
    phone: phone.trim(),
    password: password || 'pass123',
    address: address || '',
    created_at: new Date().toISOString(),
  });

  const customerId = `cust_${Date.now()}`;
  const newCustomer = db.createCustomer({
    id: customerId,
    user_id: userId,
    full_name: name.trim(),
    phone: phone.trim(),
    email: email.trim().toLowerCase(),
    default_address: address || '',
    latitude: latitude ? Number(latitude) : null,
    longitude: longitude ? Number(longitude) : null,
    created_at: new Date().toISOString(),
  });

  res.status(201).json({
    success: true,
    user: newUser,
    customer: newCustomer,
    token: `token_${userId}`,
    message: 'Customer account created successfully!',
  });
});

// Register Technician
app.post('/api/auth/register-technician', (req, res) => {
  const { name, email, phone, address, services_provided, password } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ success: false, message: 'Full name, email, and mobile number are required' });
  }

  const existing = db.getUserByEmail(email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists' });
  }

  const userId = `usr_tech_${Date.now()}`;
  const newUser = db.createUser({
    id: userId,
    email: email.trim().toLowerCase(),
    role: 'SERVICE_PROVIDER',
    name: name.trim(),
    phone: phone.trim(),
    password: password || 'technician123',
    address: address || '',
    created_at: new Date().toISOString(),
  });

  const techId = `tech_${Date.now()}`;
  const skills = Array.isArray(services_provided) && services_provided.length > 0
    ? services_provided
    : ['AC General Service', 'AC Repair', 'Installation'];

  const newTechnician = db.createTechnician({
    id: techId,
    user_id: userId,
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim().toLowerCase(),
    skills,
    service_areas: address ? [address] : ['City Area'],
    address: address || '',
    availability: 'AVAILABLE',
    is_available: true,
    jobs_completed_count: 0,
    experience_years: 3,
    status: 'ACTIVE',
    current_latitude: 12.9716,
    current_longitude: 77.5946,
    rating: 5.0,
    total_ratings_count: 0,
    created_at: new Date().toISOString(),
  });

  res.status(201).json({
    success: true,
    user: newUser,
    technician: newTechnician,
    token: `token_${userId}`,
    message: 'Technician account registered successfully!',
  });
});

// Register Owner
app.post('/api/auth/register-owner', (req, res) => {
  const { name, email, phone, address, password } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ success: false, message: 'Name, email, and mobile number are required' });
  }

  const existing = db.getUserByEmail(email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists' });
  }

  const userId = `usr_owner_${Date.now()}`;
  const newUser = db.createUser({
    id: userId,
    email: email.trim().toLowerCase(),
    role: 'OWNER',
    name: name.trim(),
    phone: phone.trim(),
    password: password || 'owner123',
    address: address || '',
    created_at: new Date().toISOString(),
  });

  res.status(201).json({
    success: true,
    user: newUser,
    token: `token_${userId}`,
    message: 'Owner account registered successfully!',
  });
});

// Customers list endpoint for Owner/Admin
app.get('/api/customers', (req, res) => {
  const customers = db.getAllCustomers();
  res.json({ success: true, customers });
});

// ----------------------------------------------------
// BRANDS & MODELS
// ----------------------------------------------------

app.get('/api/brands', (req, res) => {
  const onlyActive = req.query.all !== 'true';
  const brands = db.getAllBrands(onlyActive);
  res.json({ success: true, brands });
});

app.post('/api/brands', (req, res) => {
  const { name, country, logo_badge, is_active } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Brand name required' });

  const id = `b_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
  const brand = db.createBrand({
    id,
    name,
    country: country || 'International',
    logo_badge: logo_badge || name.slice(0, 4).toUpperCase(),
    is_active: is_active ?? true,
    created_at: new Date().toISOString(),
  });

  db.recordAuditLog({
    owner_id: req.body.owner_id || 'usr_admin',
    owner_name: req.body.owner_name || 'Admin',
    action: 'CREATE_BRAND',
    entity_type: 'AC_BRAND',
    entity_id: id,
    previous_value: null,
    new_value: brand,
  });

  res.status(201).json({ success: true, brand });
});

app.put('/api/brands/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.getBrandById(id);
  if (!existing) return res.status(404).json({ success: false, message: 'Brand not found' });

  const updated = db.updateBrand(id, req.body);

  db.recordAuditLog({
    owner_id: req.body.owner_id || 'usr_admin',
    owner_name: req.body.owner_name || 'Admin',
    action: 'UPDATE_BRAND',
    entity_type: 'AC_BRAND',
    entity_id: id,
    previous_value: existing,
    new_value: updated,
  });

  res.json({ success: true, brand: updated });
});

app.delete('/api/brands/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.getBrandById(id);
  if (!existing) return res.status(404).json({ success: false, message: 'Brand not found' });

  db.deleteBrand(id);

  db.recordAuditLog({
    owner_id: 'usr_admin',
    owner_name: 'Admin',
    action: 'DELETE_BRAND',
    entity_type: 'AC_BRAND',
    entity_id: id,
    previous_value: existing.name,
    new_value: 'DELETED',
  });

  res.json({ success: true, message: 'Brand deleted successfully' });
});

// AC Models
app.get('/api/models', (req, res) => {
  const brandId = req.query.brandId as string | undefined;
  const onlyActive = req.query.all !== 'true';
  const models = db.getAllModels({ brandId, onlyActive });
  res.json({ success: true, models });
});

app.get('/api/models/:id', (req, res) => {
  const model = db.getModelById(req.params.id);
  if (!model) return res.status(404).json({ success: false, message: 'Model not found' });
  res.json({ success: true, model });
});

app.post('/api/models', (req, res) => {
  const { brand_id, model_name, ac_type, capacity, technology, star_rating, description, image_url, mapped_service_ids } = req.body;
  if (!brand_id || !model_name) {
    return res.status(400).json({ success: false, message: 'Brand ID and Model Name are required' });
  }

  const id = `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newModel = db.createModel(
    {
      id,
      brand_id,
      model_name,
      ac_type: ac_type || 'Split AC',
      capacity: capacity || '1.5 Ton',
      technology: technology || 'Inverter',
      star_rating: Number(star_rating) || 3,
      description: description || '',
      image_url: image_url || 'https://images.unsplash.com/photo-1614633833026-0820552978b6?w=600&auto=format&fit=crop&q=80',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    mapped_service_ids
  );

  db.recordAuditLog({
    owner_id: req.body.owner_id || 'usr_admin',
    owner_name: req.body.owner_name || 'Admin',
    action: 'CREATE_MODEL',
    entity_type: 'AC_MODEL',
    entity_id: id,
    previous_value: null,
    new_value: newModel.model_name,
  });

  res.status(201).json({ success: true, model: newModel });
});

app.put('/api/models/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.getModelById(id);
  if (!existing) return res.status(404).json({ success: false, message: 'Model not found' });

  const updated = db.updateModel(id, req.body);

  if (req.body.mapped_service_ids && Array.isArray(req.body.mapped_service_ids)) {
    db.batchUpdateModelServices(id, req.body.mapped_service_ids);
  }

  db.recordAuditLog({
    owner_id: req.body.owner_id || 'usr_admin',
    owner_name: req.body.owner_name || 'Admin',
    action: 'UPDATE_MODEL',
    entity_type: 'AC_MODEL',
    entity_id: id,
    previous_value: existing.model_name,
    new_value: updated?.model_name,
  });

  res.json({ success: true, model: db.getModelById(id) });
});

app.delete('/api/models/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.getModelById(id);
  if (!existing) return res.status(404).json({ success: false, message: 'Model not found' });

  db.deleteModel(id);

  db.recordAuditLog({
    owner_id: 'usr_admin',
    owner_name: 'Admin',
    action: 'DELETE_MODEL',
    entity_type: 'AC_MODEL',
    entity_id: id,
    previous_value: existing.model_name,
    new_value: 'DELETED',
  });

  res.json({ success: true, message: 'Model deleted successfully' });
});

// ----------------------------------------------------
// SERVICES & MODEL MAPPING
// ----------------------------------------------------

app.get('/api/services', (req, res) => {
  const onlyActive = req.query.all !== 'true';
  const services = db.getAllServices(onlyActive);
  res.json({ success: true, services });
});

// CRITICAL FEATURE: Fetch ONLY mapped services for this particular AC Model
app.get('/api/models/:modelId/services', (req, res) => {
  const { modelId } = req.params;
  const services = db.getMappedServicesForModel(modelId);
  res.json({ success: true, model_id: modelId, services });
});

// CRITICAL FEATURE: Fetch mapped services for selected AC Brand
app.get('/api/brands/:brandId/services', (req, res) => {
  const { brandId } = req.params;
  const services = db.getMappedServicesForBrand(brandId);
  res.json({ success: true, brand_id: brandId, services });
});

app.post('/api/services', (req, res) => {
  const { name, description, price, estimated_duration, status, category } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ success: false, message: 'Service name and price are required' });
  }

  const id = `srv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const service = db.createService({
    id,
    name,
    description: description || '',
    price: Number(price),
    estimated_duration: estimated_duration || '45 mins',
    status: status || 'ACTIVE',
    category: category || 'General',
    created_at: new Date().toISOString(),
  });

  db.recordAuditLog({
    owner_id: req.body.owner_id || 'usr_admin',
    owner_name: req.body.owner_name || 'Admin',
    action: 'CREATE_SERVICE',
    entity_type: 'SERVICE',
    entity_id: id,
    previous_value: null,
    new_value: `₹${service.price} - ${service.name}`,
  });

  res.status(201).json({ success: true, service });
});

app.put('/api/services/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.getServiceById(id);
  if (!existing) return res.status(404).json({ success: false, message: 'Service not found' });

  const oldPrice = existing.price;
  const updated = db.updateService(id, {
    ...req.body,
    price: req.body.price !== undefined ? Number(req.body.price) : existing.price,
  });

  if (req.body.price !== undefined && Number(req.body.price) !== oldPrice) {
    db.recordAuditLog({
      owner_id: req.body.owner_id || 'usr_admin',
      owner_name: req.body.owner_name || 'Rajesh Verma (Admin)',
      action: 'UPDATE_SERVICE_PRICE',
      entity_type: 'SERVICE',
      entity_id: id,
      previous_value: `₹${oldPrice}`,
      new_value: `₹${req.body.price}`,
    });
  } else {
    db.recordAuditLog({
      owner_id: req.body.owner_id || 'usr_admin',
      owner_name: req.body.owner_name || 'Admin',
      action: 'UPDATE_SERVICE',
      entity_type: 'SERVICE',
      entity_id: id,
      previous_value: existing.name,
      new_value: updated?.name,
    });
  }

  res.json({ success: true, service: updated });
});

app.delete('/api/services/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.getServiceById(id);
  if (!existing) return res.status(404).json({ success: false, message: 'Service not found' });

  db.deleteService(id);

  db.recordAuditLog({
    owner_id: 'usr_admin',
    owner_name: 'Admin',
    action: 'DELETE_SERVICE',
    entity_type: 'SERVICE',
    entity_id: id,
    previous_value: existing.name,
    new_value: 'DELETED',
  });

  res.json({ success: true, message: 'Service deleted successfully' });
});

// Model-Service Mappings
app.get('/api/mappings', (req, res) => {
  res.json({ success: true, mappings: db.getAllMappings() });
});

app.post('/api/mappings/toggle', (req, res) => {
  const { model_id, service_id, is_enabled, custom_price } = req.body;
  if (!model_id || !service_id) {
    return res.status(400).json({ success: false, message: 'model_id and service_id required' });
  }

  const mapping = db.toggleModelServiceMapping(
    model_id,
    service_id,
    is_enabled,
    custom_price ? Number(custom_price) : null
  );

  const model = db.getModelById(model_id);
  const service = db.getServiceById(service_id);

  db.recordAuditLog({
    owner_id: req.body.owner_id || 'usr_admin',
    owner_name: req.body.owner_name || 'Admin',
    action: 'TOGGLE_MODEL_SERVICE_MAPPING',
    entity_type: 'AC_MODEL_SERVICE',
    entity_id: mapping.id,
    previous_value: !is_enabled ? 'ENABLED' : 'DISABLED',
    new_value: is_enabled ? `ENABLED (${model?.model_name} -> ${service?.name})` : `DISABLED (${model?.model_name} -> ${service?.name})`,
  });

  res.json({ success: true, mapping });
});

// ----------------------------------------------------
// TECHNICIANS / SERVICE PROVIDERS
// ----------------------------------------------------

app.get('/api/technicians', (req, res) => {
  const lat = req.query.lat ? Number(req.query.lat) : undefined;
  const lon = req.query.lon ? Number(req.query.lon) : undefined;
  const technicians = db.getAllTechnicians(lat, lon);
  res.json({ success: true, technicians });
});

app.post('/api/technicians', (req, res) => {
  const { name, phone, email, skills, service_areas, experience_years } = req.body;
  if (!name || !phone || !email) {
    return res.status(400).json({ success: false, message: 'Name, phone, and email required' });
  }

  const userId = `usr_tech_${Date.now()}`;
  db.createUser({
    id: userId,
    email,
    role: 'SERVICE_PROVIDER',
    name,
    phone,
    created_at: new Date().toISOString(),
  });

  const techId = `tech_${Date.now()}`;
  const tech = db.createTechnician({
    id: techId,
    user_id: userId,
    name,
    phone,
    email,
    skills: Array.isArray(skills) ? skills : (skills || '').split(',').map((s: string) => s.trim()),
    service_areas: Array.isArray(service_areas) ? service_areas : (service_areas || '').split(',').map((s: string) => s.trim()),
    availability: 'AVAILABLE',
    experience_years: Number(experience_years) || 1,
    status: 'ACTIVE',
    current_latitude: 12.9716 + (Math.random() - 0.5) * 0.08,
    current_longitude: 77.5946 + (Math.random() - 0.5) * 0.08,
    rating: 5.0,
    total_ratings_count: 0,
    created_at: new Date().toISOString(),
  });

  res.status(201).json({ success: true, technician: tech });
});

app.put('/api/technicians/:id', (req, res) => {
  const { id } = req.params;
  const updated = db.updateTechnician(id, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Technician not found' });
  res.json({ success: true, technician: updated });
});

// ----------------------------------------------------
// SERVICE REQUESTS
// ----------------------------------------------------

app.get('/api/requests', (req, res) => {
  const customerId = req.query.customerId as string | undefined;
  const technicianId = req.query.technicianId as string | undefined;
  const status = req.query.status as any;

  const requests = db.getAllRequests({ customerId, technicianId, status });
  res.json({ success: true, requests });
});

app.get('/api/requests/:id', (req, res) => {
  const request = db.getRequestById(req.params.id);
  if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
  res.json({ success: true, request });
});

app.post('/api/requests', (req, res) => {
  const {
    customer_id,
    customer_name,
    customer_phone,
    customer_email,
    address,
    latitude,
    longitude,
    ac_brand_id,
    ac_model_id,
    service_id,
    preferred_date,
    preferred_time,
    problem_description,
  } = req.body;

  if (!customer_id || !ac_brand_id || !ac_model_id || !service_id) {
    return res.status(400).json({ success: false, message: 'Missing required request fields' });
  }

  const created = db.createServiceRequest({
    customer_id,
    customer_name: customer_name || 'Customer',
    customer_phone: customer_phone || '',
    customer_email: customer_email || '',
    address: address || '',
    latitude: latitude !== undefined ? Number(latitude) : null,
    longitude: longitude !== undefined ? Number(longitude) : null,
    ac_brand_id,
    ac_model_id,
    service_id,
    preferred_date: preferred_date || new Date().toISOString().split('T')[0],
    preferred_time: preferred_time || '10:00 AM - 12:00 PM',
    problem_description: problem_description || 'General Service',
  });

  res.status(201).json({ success: true, request: created });
});

// Owner assigns technician
app.post('/api/requests/:id/assign', (req, res) => {
  const { technician_id } = req.body;
  if (!technician_id) return res.status(400).json({ success: false, message: 'technician_id is required' });

  const ownerUser = {
    id: req.body.owner_id || 'usr_admin',
    name: req.body.owner_name || 'Rajesh Verma (Owner)',
    role: 'OWNER' as UserRole,
    email: 'admin@smartac.com',
    phone: '',
    created_at: '',
  };

  const updated = db.assignTechnician(req.params.id, technician_id, ownerUser);
  if (!updated) return res.status(404).json({ success: false, message: 'Request or technician not found' });

  res.json({ success: true, request: updated });
});

// Technician accepts job
app.post('/api/requests/:id/accept', (req, res) => {
  const techUser = {
    id: req.body.user_id || 'usr_tech_1',
    name: req.body.user_name || 'Technician',
    role: 'SERVICE_PROVIDER' as UserRole,
    email: '',
    phone: '',
    created_at: '',
  };

  const updated = db.technicianAccept(req.params.id, techUser);
  if (!updated) return res.status(404).json({ success: false, message: 'Request not found' });

  res.json({ success: true, request: updated });
});

// Technician rejects job
app.post('/api/requests/:id/reject', (req, res) => {
  const techUser = {
    id: req.body.user_id || 'usr_tech_1',
    name: req.body.user_name || 'Technician',
    role: 'SERVICE_PROVIDER' as UserRole,
    email: '',
    phone: '',
    created_at: '',
  };

  const updated = db.technicianReject(req.params.id, techUser, req.body.reason);
  if (!updated) return res.status(404).json({ success: false, message: 'Request not found' });

  res.json({ success: true, request: updated });
});

// Technician starts service
app.post('/api/requests/:id/start', (req, res) => {
  const techUser = {
    id: req.body.user_id || 'usr_tech_1',
    name: req.body.user_name || 'Technician',
    role: 'SERVICE_PROVIDER' as UserRole,
    email: '',
    phone: '',
    created_at: '',
  };

  const updated = db.technicianStart(req.params.id, techUser);
  if (!updated) return res.status(404).json({ success: false, message: 'Request not found' });

  res.json({ success: true, request: updated });
});

// Technician completes service
app.post('/api/requests/:id/complete', (req, res) => {
  const techUser = {
    id: req.body.user_id || 'usr_tech_1',
    name: req.body.user_name || 'Technician',
    role: 'SERVICE_PROVIDER' as UserRole,
    email: '',
    phone: '',
    created_at: '',
  };

  const { work_performed, technician_notes, parts_used, additional_charges, before_photo_url, after_photo_url } = req.body;

  const updated = db.technicianComplete(req.params.id, techUser, {
    work_performed: work_performed || 'AC Service Completed Successfully.',
    technician_notes: technician_notes || '',
    parts_used: parts_used || [],
    additional_charges: additional_charges || 0,
    before_photo_url,
    after_photo_url,
  });

  if (!updated) return res.status(404).json({ success: false, message: 'Request not found' });

  res.json({ success: true, request: updated });
});

// Cancel request
app.post('/api/requests/:id/cancel', (req, res) => {
  const user = {
    id: req.body.user_id || 'usr_cust_1',
    name: req.body.user_name || 'User',
    role: (req.body.role || 'CUSTOMER') as UserRole,
    email: '',
    phone: '',
    created_at: '',
  };

  const updated = db.cancelRequest(req.params.id, user, req.body.reason || 'Cancelled by user');
  if (!updated) return res.status(404).json({ success: false, message: 'Request not found' });

  res.json({ success: true, request: updated });
});

// ----------------------------------------------------
// INVOICES & REVIEWS & AUDIT LOGS & NOTIFICATIONS
// ----------------------------------------------------

app.get('/api/invoices', (req, res) => {
  const invoices = db.getAllInvoices();
  res.json({ success: true, invoices });
});

app.get('/api/invoices/:id', (req, res) => {
  const invoice = db.getInvoiceById(req.params.id);
  if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
  res.json({ success: true, invoice });
});

app.put('/api/invoices/:id/pay', (req, res) => {
  const updated = db.updateInvoicePayment(req.params.id, 'PAID', req.body.payment_method || 'Online UPI');
  if (!updated) return res.status(404).json({ success: false, message: 'Invoice not found' });
  res.json({ success: true, invoice: updated });
});

app.get('/api/reviews', (req, res) => {
  const techId = req.query.technicianId as string | undefined;
  const reviews = db.getAllReviews(techId);
  res.json({ success: true, reviews });
});

app.post('/api/reviews', (req, res) => {
  const { service_request_id, customer_id, customer_name, technician_id, rating, comment } = req.body;
  if (!service_request_id || !rating) {
    return res.status(400).json({ success: false, message: 'service_request_id and rating required' });
  }

  const review = db.addReview({
    service_request_id,
    customer_id: customer_id || 'cust_1',
    customer_name: customer_name || 'Customer',
    technician_id: technician_id || 'tech_1',
    rating: Number(rating),
    comment: comment || '',
  });

  res.status(201).json({ success: true, review });
});

app.get('/api/notifications', (req, res) => {
  const role = (req.query.role || 'CUSTOMER') as UserRole;
  const userId = (req.query.userId || '') as string;
  const notifications = db.getNotifications(role, userId);
  res.json({ success: true, notifications });
});

app.put('/api/notifications/:id/read', (req, res) => {
  const ok = db.markNotificationRead(req.params.id);
  res.json({ success: ok });
});

app.get('/api/audit-logs', (req, res) => {
  res.json({ success: true, audit_logs: db.getAuditLogs() });
});

app.get('/api/analytics/owner', (req, res) => {
  const analytics = db.getOwnerAnalytics();
  res.json({ success: true, analytics });
});

// ----------------------------------------------------
// VITE MIDDLEWARE & SERVER STARTUP
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart AC Service Management System running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
