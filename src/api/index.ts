import api from './client';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login:  (email: string, password: string) => api.post('/auth/login',  { email, password }),
  logout: ()                                 => api.post('/auth/logout'),
  me:     ()                                 => api.get('/auth/me'),
};

// ─── Locations ────────────────────────────────────────────────────────────────
export const locationsApi = {
  all:    ()           => api.get('/locations'),
  get:    (slug: string) => api.get(`/locations/${slug}`),
  create: (data: any)  => api.post('/locations', data),
  update: (id: any, data: any) => api.put(`/locations/${id}`, data),
  remove: (id: any)    => api.delete(`/locations/${id}`),
};

// ─── Districts ────────────────────────────────────────────────────────────────
export const districtsApi = {
  all:    (locationId?: any) => api.get('/districts', { params: locationId ? { location_id: locationId } : {} }),
  create: (data: any)  => api.post('/districts', data),
  update: (id: any, data: any) => api.put(`/districts/${id}`, data),
  remove: (id: any)    => api.delete(`/districts/${id}`),
};

// ─── Billboards ───────────────────────────────────────────────────────────────
export const billboardsApi = {
  all:        (params?: any) => api.get('/billboards', { params }),
  get:        (slug: string) => api.get(`/billboards/${slug}`),
  nextCode:   ()             => api.get('/billboards/next-code'),
  create:     (data: FormData) => api.post('/billboards', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:     (id: any, data: FormData) => api.post(`/billboards/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove:     (id: any)    => api.delete(`/billboards/${id}`),
  deleteImage:(id: any, mediaId: any) => api.delete(`/billboards/${id}/images`, { data: { media_id: mediaId } }),
};

// ─── Services ─────────────────────────────────────────────────────────────────
export const servicesApi = {
  all:    ()           => api.get('/services'),
  get:    (slug: string) => api.get(`/services/${slug}`),
  create: (data: any)  => api.post('/services', data),
  update: (id: any, data: any) => api.put(`/services/${id}`, data),
  remove: (id: any)    => api.delete(`/services/${id}`),
};

// ─── Projects ─────────────────────────────────────────────────────────────────
export const projectsApi = {
  all:    ()           => api.get('/projects'),
  get:    (slug: string) => api.get(`/projects/${slug}`),
  create: (data: FormData) => api.post('/projects', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: any, data: FormData) => api.post(`/projects/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id: any)    => api.delete(`/projects/${id}`),
};

// ─── Blog ─────────────────────────────────────────────────────────────────────
export const blogApi = {
  all:    (all = false) => api.get('/blog', { params: all ? { all: 1 } : {} }),
  get:    (slug: string) => api.get(`/blog/${slug}`),
  create: (data: any)  => api.post('/blog', data),
  update: (id: any, data: any) => api.put(`/blog/${id}`, data),
  remove: (id: any)    => api.delete(`/blog/${id}`),
};

// ─── Contacts ─────────────────────────────────────────────────────────────────
// Public: POST /contact  (visitor form submission)
// Admin:  GET/PUT/DELETE /contacts  (manage enquiries, requires auth)
export const contactsApi = {
  all:    ()           => api.get('/contacts'),
  submit: (data: any)  => api.post('/contact', data),
  update: (id: any, data: any) => api.put(`/contacts/${id}`, data),
  remove: (id: any)    => api.delete(`/contacts/${id}`),
};

// ─── Ad Formats ───────────────────────────────────────────────────────────────
export const adFormatsApi = {
  all:    ()           => api.get('/ad-formats'),
  create: (data: any)  => api.post('/ad-formats', data),
  update: (id: any, data: any) => api.put(`/ad-formats/${id}`, data),
  remove: (id: any)    => api.delete(`/ad-formats/${id}`),
};

// ─── Suppliers ────────────────────────────────────────────────────────────────
export const suppliersApi = {
  all:    ()           => api.get('/suppliers'),
  create: (data: any)  => api.post('/suppliers', data),
  update: (id: any, data: any) => api.put(`/suppliers/${id}`, data),
  remove: (id: any)    => api.delete(`/suppliers/${id}`),
};

// ─── Customers ────────────────────────────────────────────────────────────────
export const customersApi = {
  all:    ()           => api.get('/customers'),
  create: (data: any)  => api.post('/customers', data),
  update: (id: any, data: any) => api.put(`/customers/${id}`, data),
  remove: (id: any)    => api.delete(`/customers/${id}`),
};

// ─── Client Brands ────────────────────────────────────────────────────────────
// Laravel endpoint is /clients (not /client-brands)
export const clientBrandsApi = {
  all:    ()           => api.get('/clients'),
  create: (data: any)  => api.post('/clients', data),
  update: (id: any, data: any) => api.put(`/clients/${id}`, data),
  remove: (id: any)    => api.delete(`/clients/${id}`),
};

// ─── Trust Stats ──────────────────────────────────────────────────────────────
export const trustStatsApi = {
  all:    ()           => api.get('/trust-stats'),
  create: (data: any)  => api.post('/trust-stats', data),
  update: (id: any, data: any) => api.put(`/trust-stats/${id}`, data),
  remove: (id: any)    => api.delete(`/trust-stats/${id}`),
};

// ─── Process Steps ────────────────────────────────────────────────────────────
export const processStepsApi = {
  all:    ()           => api.get('/process-steps'),
  create: (data: any)  => api.post('/process-steps', data),
  update: (id: any, data: any) => api.put(`/process-steps/${id}`, data),
  remove: (id: any)    => api.delete(`/process-steps/${id}`),
};

// ─── Settings ─────────────────────────────────────────────────────────────────
// /home-content and /about-content are convenience aliases backed by SettingController
export const settingsApi = {
  all:               ()       => api.get('/settings'),
  update:            (d: any) => api.put('/settings', d),
  homeContent:       ()       => api.get('/home-content'),
  updateHomeContent: (d: any) => api.put('/home-content', d),
  aboutContent:      ()       => api.get('/about-content'),
  updateAboutContent:(d: any) => api.put('/about-content', d),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  all:    ()           => api.get('/users'),
  create: (data: any)  => api.post('/users', data),
  update: (id: any, data: any) => api.put(`/users/${id}`, data),
  remove: (id: any)    => api.delete(`/users/${id}`),
};
