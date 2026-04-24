import api, { cachedGet } from './client';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login:           (email: string, password: string) => api.post('/auth/login',  { email, password }),
  loginFallback:   (email: string, password: string) => api.post('/login',       { email, password }),
  logout:          ()                                 => api.post('/auth/logout'),
  me:              ()                                 => api.get('/auth/me'),
  register:        (data: any)                        => api.post('/auth/register', data),
  registerFallback:(data: any)                        => api.post('/register',      data),
};

// ─── Locations ────────────────────────────────────────────────────────────────
export const locationsApi = {
  all:    ()             => cachedGet('/locations'),
  get:    (slug: string) => api.get(`/locations/${slug}`),
  create: (data: any)    => api.post('/locations', data),
  update: (id: any, data: any) => api.put(`/locations/${id}`, data),
  remove: (id: any)      => api.delete(`/locations/${id}`),
};

// ─── Districts ────────────────────────────────────────────────────────────────
export const districtsApi = {
  all:    (_locationId?: any) => cachedGet('/districts'),
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
  all:    ()             => cachedGet('/services'),
  get:    (slug: string) => api.get(`/services/${slug}`),
  create: (data: any)    => api.post('/services', data),
  update: (id: any, data: any) => api.put(`/services/${id}`, data),
  remove: (id: any)      => api.delete(`/services/${id}`),
};

// ─── Projects ─────────────────────────────────────────────────────────────────
export const projectsApi = {
  all:    ()             => cachedGet('/projects'),
  get:    (slug: string) => api.get(`/projects/${slug}`),
  create: (data: FormData) => api.post('/projects', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: any, data: FormData) => api.post(`/projects/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id: any)      => api.delete(`/projects/${id}`),
};

// ─── Blog ─────────────────────────────────────────────────────────────────────
export const blogApi = {
  all:    (all = false) => all ? api.get('/blog', { params: { all: 1 } }) : cachedGet('/blog'),
  get:    (slug: string) => api.get(`/blog/${slug}`),
  create: (data: any)    => api.post('/blog', data),
  update: (id: any, data: any) => api.put(`/blog/${id}`, data),
  remove: (id: any)      => api.delete(`/blog/${id}`),
};

// ─── Contacts ─────────────────────────────────────────────────────────────────
export const contactsApi = {
  all:    ()           => api.get('/contacts'),
  submit: (data: any)  => api.post('/contact', data),
  update: (id: any, data: any) => api.put(`/contacts/${id}`, data),
  remove: (id: any)    => api.delete(`/contacts/${id}`),
};

// ─── Ad Formats ───────────────────────────────────────────────────────────────
export const adFormatsApi = {
  all:    ()           => cachedGet('/ad-formats'),
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
export const clientBrandsApi = {
  all:    ()           => cachedGet('/clients'),
  create: (data: any)  => api.post('/clients', data),
  update: (id: any, data: any) => api.put(`/clients/${id}`, data),
  remove: (id: any)    => api.delete(`/clients/${id}`),
};

// ─── Trust Stats ──────────────────────────────────────────────────────────────
export const trustStatsApi = {
  all:    ()           => cachedGet('/trust-stats'),
  create: (data: any)  => api.post('/trust-stats', data),
  update: (id: any, data: any) => api.put(`/trust-stats/${id}`, data),
  remove: (id: any)    => api.delete(`/trust-stats/${id}`),
};

// ─── Process Steps ────────────────────────────────────────────────────────────
export const processStepsApi = {
  all:    ()           => cachedGet('/process-steps'),
  create: (data: any)  => api.post('/process-steps', data),
  update: (id: any, data: any) => api.put(`/process-steps/${id}`, data),
  remove: (id: any)    => api.delete(`/process-steps/${id}`),
};

// ─── Settings ─────────────────────────────────────────────────────────────────
export const settingsApi = {
  all:               ()       => cachedGet('/settings'),
  update:            (d: any) => api.put('/settings', d),
  homeContent:       ()       => cachedGet('/home-content'),
  updateHomeContent: (d: any) => api.put('/home-content', d),
  aboutContent:      ()       => cachedGet('/about-content'),
  updateAboutContent:(d: any) => api.put('/about-content', d),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  all:    ()           => api.get('/users'),
  create: (data: any)  => api.post('/users', data),
  update: (id: any, data: any) => api.put(`/users/${id}`, data),
  remove: (id: any)    => api.delete(`/users/${id}`),
};

// ─── Billboard Sizes ──────────────────────────────────────────────────────────
export const billboardSizesApi = {
  all:    ()           => cachedGet('/billboard-sizes'),
  create: (data: any)  => api.post('/billboard-sizes', data),
  update: (id: any, data: any) => api.put(`/billboard-sizes/${id}`, data),
  remove: (id: any)    => api.delete(`/billboard-sizes/${id}`),
};

// ─── Simulator Templates ──────────────────────────────────────────────────────
export const simulatorTemplatesApi = {
  all:    ()           => cachedGet('/simulator-templates'),
  create: (data: any)  => api.post('/simulator-templates', data),
  update: (id: any, data: any) => api.put(`/simulator-templates/${id}`, data),
  remove: (id: any)    => api.delete(`/simulator-templates/${id}`),
};

// ─── Design Uploads ───────────────────────────────────────────────────────────
export const designUploadsApi = {
  all:    ()           => api.get('/design-uploads'),
  create: (data: any)  => api.post('/design-uploads', data),
  update: (id: any, data: any) => api.put(`/design-uploads/${id}`, data),
  remove: (id: any)    => api.delete(`/design-uploads/${id}`),
};
