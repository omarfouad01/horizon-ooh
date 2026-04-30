/**
 * api/index.ts — All API endpoint definitions.
 *
 * Public endpoints  → cachedGet() for read performance
 * Admin endpoints   → direct api.post/put/delete (bypass cache)
 * Auth endpoints    → multiple fallback paths for Laravel compatibility
 */
import api, { cachedGet } from './client';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  loginFallback: (email: string, password: string) =>
    api.post('/login', { email, password }),

  logout: () => api.post('/auth/logout'),
  me:     () => api.get('/auth/me'),

  updateProfile: (data: any) => api.put('/auth/profile', data),

  register: (data: any) => api.post('/auth/register', data),

  registerFallback: (data: any) => api.post('/register', data),
};

// ─── Locations ────────────────────────────────────────────────────────────────
export const locationsApi = {
  all:    ()             => cachedGet('/locations'),
  get:    (slug: string) => cachedGet(`/locations/${slug}`),
  create: (data: any)    => api.post('/locations', data),
  update: (id: any, data: any) => api.put(`/locations/${id}`, data),
  remove: (id: any)      => api.delete(`/locations/${id}`),
};

// ─── Districts ────────────────────────────────────────────────────────────────
export const districtsApi = {
  all:    (locationId?: any) => cachedGet('/districts', locationId ? { params: { location_id: locationId } } : {}),
  create: (data: any)  => api.post('/districts', data),
  update: (id: any, data: any) => api.put(`/districts/${id}`, data),
  remove: (id: any)    => api.delete(`/districts/${id}`),
};

// ─── Billboards ───────────────────────────────────────────────────────────────
export const billboardsApi = {
  all:         (params?: any) => cachedGet('/billboards', params ? { params } : {}),
  get:         (slug: string) => cachedGet(`/billboards/${slug}`),
  nextCode:    ()             => api.get('/billboards/next-code'),
  create:      (data: FormData) => api.post('/billboards', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:      (id: any, data: FormData) => api.post(`/billboards/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove:      (id: any)      => api.delete(`/billboards/${id}`),
  deleteImage: (id: any, mediaId: any) => api.delete(`/billboards/${id}/images`, { data: { media_id: mediaId } }),
};

// ─── Services ─────────────────────────────────────────────────────────────────
export const servicesApi = {
  all:    ()             => cachedGet('/services'),
  get:    (slug: string) => cachedGet(`/services/${slug}`),
  create: (data: any)    => api.post('/services', data),
  update: (id: any, data: any) => api.put(`/services/${id}`, data),
  remove: (id: any)      => api.delete(`/services/${id}`),
};

// ─── Projects ─────────────────────────────────────────────────────────────────
export const projectsApi = {
  all:    ()             => cachedGet('/projects'),
  get:    (slug: string) => cachedGet(`/projects/${slug}`),
  create: (data: any)    => api.post('/projects', data),
  update: (id: any, data: any) => api.put(`/projects/${id}`, data),
  remove: (id: any)      => api.delete(`/projects/${id}`),
};

// ─── Blog ─────────────────────────────────────────────────────────────────────
export const blogApi = {
  all:    (all = false) => cachedGet('/blog', all ? { params: { all: 1 } } : {}),
  get:    (slug: string) => cachedGet(`/blog/${slug}`),
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

// ─── Users (dashboard / admin) ────────────────────────────────────────────────
export const usersApi = {
  all:             ()           => api.get('/users?source=dashboard'),
  allWebsiteUsers: ()           => api.get('/users?source=website'),
  create:          (data: any)  => api.post('/users', data),
  update:          (id: any, data: any) => api.put(`/users/${id}`, data),
  remove:          (id: any)    => api.delete(`/users/${id}`),
};

// ─── Billboard Sizes ──────────────────────────────────────────────────────────
export const billboardSizesApi = {
  all:    ()           => cachedGet('/billboard-sizes'),
  create: (data: any)  => api.post('/billboard-sizes', data),
  update: (id: any, data: any) => api.put(`/billboard-sizes/${id}`, data),
  remove: (id: any)    => api.delete(`/billboard-sizes/${id}`),
};

// ─── Simulator Templates ──────────────────────────────────────────────────────
function toSimulatorFormData(data: any): FormData | any {
  // If a mockupFile (File object) is present, send as multipart; otherwise plain JSON
  if (data instanceof FormData) return data;
  if (data.mockupFile instanceof File) {
    const fd = new FormData();
    if (data.typeName)  fd.append('typeName',  data.typeName);
    if (data.sizeLabel !== undefined) fd.append('sizeLabel', data.sizeLabel ?? '');
    if (data.notes !== undefined)     fd.append('notes', data.notes ?? '');
    if (data.panels !== undefined)    fd.append('panels', JSON.stringify(data.panels));
    fd.append('mockup', data.mockupFile);
    return fd;
  }
  return data;
}
export const simulatorTemplatesApi = {
  all:    ()           => cachedGet('/simulator-templates'),
  create: (data: any)  => {
    const payload = toSimulatorFormData(data);
    return payload instanceof FormData
      ? api.post('/simulator-templates', payload, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.post('/simulator-templates', payload);
  },
  update: (id: any, data: any) => {
    const payload = toSimulatorFormData(data);
    return payload instanceof FormData
      ? api.post(`/simulator-templates/${id}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.put(`/simulator-templates/${id}`, payload);
  },
  remove: (id: any)    => api.delete(`/simulator-templates/${id}`),
};

// ─── Design Uploads ───────────────────────────────────────────────────────────
export const designUploadsApi = {
  all:    ()           => api.get('/design-uploads'),
  create: (data: any)  => api.post('/design-uploads', data),
  update: (id: any, data: any) => api.put(`/design-uploads/${id}`, data),
  remove: (id: any)    => api.delete(`/design-uploads/${id}`),
};
