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
  create: (data: any)  => api.post('/admin/locations', data),
  update: (id: any, data: any) => api.put(`/admin/locations/${id}`, data),
  remove: (id: any)    => api.delete(`/admin/locations/${id}`),
};

// ─── Districts ────────────────────────────────────────────────────────────────
export const districtsApi = {
  all:    (locationId?: any) => api.get('/districts', { params: locationId ? { location_id: locationId } : {} }),
  create: (data: any)  => api.post('/admin/districts', data),
  update: (id: any, data: any) => api.put(`/admin/districts/${id}`, data),
  remove: (id: any)    => api.delete(`/admin/districts/${id}`),
};

// ─── Billboards ───────────────────────────────────────────────────────────────
export const billboardsApi = {
  all:        (params?: any) => api.get('/billboards', { params }),
  get:        (slug: string) => api.get(`/billboards/${slug}`),
  nextCode:   ()             => api.get('/billboards/next-code'),
  create:     (data: FormData) => api.post('/admin/billboards', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:     (id: any, data: FormData) => api.post(`/admin/billboards/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove:     (id: any)    => api.delete(`/admin/billboards/${id}`),
  deleteImage:(id: any, mediaId: any) => api.delete(`/admin/billboards/${id}/images`, { data: { media_id: mediaId } }),
};

// ─── Services ─────────────────────────────────────────────────────────────────
export const servicesApi = {
  all:    ()           => api.get('/services'),
  get:    (slug: string) => api.get(`/services/${slug}`),
  create: (data: any)  => api.post('/admin/services', data),
  update: (id: any, data: any) => api.put(`/admin/services/${id}`, data),
  remove: (id: any)    => api.delete(`/admin/services/${id}`),
};

// ─── Projects ─────────────────────────────────────────────────────────────────
export const projectsApi = {
  all:    ()           => api.get('/projects'),
  get:    (slug: string) => api.get(`/projects/${slug}`),
  create: (data: FormData) => api.post('/admin/projects', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: any, data: FormData) => api.post(`/admin/projects/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id: any)    => api.delete(`/admin/projects/${id}`),
};

// ─── Blog ─────────────────────────────────────────────────────────────────────
export const blogApi = {
  all:    (all = false) => api.get('/blog', { params: all ? { all: 1 } : {} }),
  get:    (slug: string) => api.get(`/blog/${slug}`),
  create: (data: any)  => api.post('/admin/blog', data),
  update: (id: any, data: any) => api.put(`/admin/blog/${id}`, data),
  remove: (id: any)    => api.delete(`/admin/blog/${id}`),
};

// ─── Contacts ─────────────────────────────────────────────────────────────────
export const contactsApi = {
  all:    ()           => api.get('/admin/contacts'),
  submit: (data: any)  => api.post('/contacts', data),
  update: (id: any, data: any) => api.put(`/admin/contacts/${id}`, data),
  remove: (id: any)    => api.delete(`/admin/contacts/${id}`),
};

// ─── Ad Formats ───────────────────────────────────────────────────────────────
export const adFormatsApi = {
  all:    ()           => api.get('/ad-formats'),
  create: (data: any)  => api.post('/admin/ad-formats', data),
  update: (id: any, data: any) => api.put(`/admin/ad-formats/${id}`, data),
  remove: (id: any)    => api.delete(`/admin/ad-formats/${id}`),
};

// ─── Suppliers ────────────────────────────────────────────────────────────────
export const suppliersApi = {
  all:    ()           => api.get('/admin/suppliers'),
  create: (data: any)  => api.post('/admin/suppliers', data),
  update: (id: any, data: any) => api.put(`/admin/suppliers/${id}`, data),
  remove: (id: any)    => api.delete(`/admin/suppliers/${id}`),
};

// ─── Customers ────────────────────────────────────────────────────────────────
export const customersApi = {
  all:    ()           => api.get('/admin/customers'),
  create: (data: any)  => api.post('/admin/customers', data),
  update: (id: any, data: any) => api.put(`/admin/customers/${id}`, data),
  remove: (id: any)    => api.delete(`/admin/customers/${id}`),
};

// ─── Client Brands ────────────────────────────────────────────────────────────
export const clientBrandsApi = {
  all:    ()           => api.get('/client-brands'),
  create: (data: any)  => api.post('/admin/client-brands', data),
  update: (id: any, data: any) => api.put(`/admin/client-brands/${id}`, data),
  remove: (id: any)    => api.delete(`/admin/client-brands/${id}`),
};

// ─── Trust Stats ──────────────────────────────────────────────────────────────
export const trustStatsApi = {
  all:    ()           => api.get('/trust-stats'),
  create: (data: any)  => api.post('/admin/trust-stats', data),
  update: (id: any, data: any) => api.put(`/admin/trust-stats/${id}`, data),
  remove: (id: any)    => api.delete(`/admin/trust-stats/${id}`),
};

// ─── Process Steps ────────────────────────────────────────────────────────────
export const processStepsApi = {
  all:    ()           => api.get('/process-steps'),
  create: (data: any)  => api.post('/admin/process-steps', data),
  update: (id: any, data: any) => api.put(`/admin/process-steps/${id}`, data),
  remove: (id: any)    => api.delete(`/admin/process-steps/${id}`),
};

// ─── Settings ─────────────────────────────────────────────────────────────────
export const settingsApi = {
  all:               ()       => api.get('/settings'),
  update:            (d: any) => api.put('/admin/settings', d),
  homeContent:       ()       => api.get('/home-content'),
  updateHomeContent: (d: any) => api.put('/admin/home-content', d),
  aboutContent:      ()       => api.get('/about-content'),
  updateAboutContent:(d: any) => api.put('/admin/about-content', d),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  all:    ()           => api.get('/admin/users'),
  create: (data: any)  => api.post('/admin/users', data),
  update: (id: any, data: any) => api.put(`/admin/users/${id}`, data),
  remove: (id: any)    => api.delete(`/admin/users/${id}`),
};
