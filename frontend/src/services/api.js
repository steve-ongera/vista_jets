// src/services/api.js — FULL REPLACEMENT
// Includes all existing endpoints + new admin CRUD endpoints

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ============================================================================
// CORE FETCH HELPERS
// ============================================================================

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  };
  if (config.body && typeof config.body !== 'string') config.body = JSON.stringify(config.body);
  const res  = await fetch(url, config);
  const data = await res.json();
  if (!res.ok) throw { status: res.status, data };
  return data;
}

export const getAccessToken  = () => localStorage.getItem('vj_access');
export const getRefreshToken = () => localStorage.getItem('vj_refresh');
export const saveTokens = ({ access, refresh }) => {
  localStorage.setItem('vj_access', access);
  localStorage.setItem('vj_refresh', refresh);
};
export const clearTokens = () => {
  localStorage.removeItem('vj_access');
  localStorage.removeItem('vj_refresh');
  localStorage.removeItem('vj_user');
};
export const saveUser = (user) => localStorage.setItem('vj_user', JSON.stringify(user));
export const getUser  = () => { const u = localStorage.getItem('vj_user'); return u ? JSON.parse(u) : null; };

async function authFetch(endpoint, options = {}) {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  let config = { ...options, headers };
  if (config.body && typeof config.body !== 'string') config.body = JSON.stringify(config.body);

  let res = await fetch(`${BASE_URL}${endpoint}`, config);

  if (res.status === 401 && getRefreshToken()) {
    try {
      const rr = await fetch(`${BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: getRefreshToken() }),
      });
      if (rr.ok) {
        const rd = await rr.json();
        saveTokens({ access: rd.access, refresh: getRefreshToken() });
        headers.Authorization = `Bearer ${rd.access}`;
        config.headers = headers;
        res = await fetch(`${BASE_URL}${endpoint}`, config);
      } else {
        clearTokens();
        window.location.href = '/membership/login';
        throw new Error('Session expired.');
      }
    } catch (e) { clearTokens(); throw e; }
  }

  if (!res.ok) {
    const err = new Error();
    err.status = res.status;
    try { err.data = await res.json(); err.message = err.data.detail || err.data.message || err.data.error || 'Request failed'; }
    catch { err.message = 'Request failed'; err.data = {}; }
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

// ============================================================================
// PART 1: PUBLIC APIs
// ============================================================================

export const searchAirports        = (q)    => request(`/airports/?search=${encodeURIComponent(q)}`);
export const getAircraft           = (p='') => request(`/aircraft/${p}`);
export const getYachts             = (p='') => request(`/yachts/${p}`);
export const createFlightBooking   = (d)    => request('/flight-bookings/', { method: 'POST', body: d });
export const trackFlightBooking    = (ref)  => request(`/flight-bookings/track/${ref}/`);
export const getMyFlightBookings   = (email)=> request(`/flight-bookings/?email=${encodeURIComponent(email)}`);
export const createYachtCharter    = (d)    => request('/yacht-charters/', { method: 'POST', body: d });
export const trackYachtCharter     = (ref)  => request(`/yacht-charters/track/${ref}/`);
export const createLeaseInquiry    = (d)    => request('/lease-inquiries/', { method: 'POST', body: d });
export const createFlightInquiry   = (d)    => request('/flight-inquiries/', { method: 'POST', body: d });
export const getQuickQuote         = (d)    => request('/quick-quote/', { method: 'POST', body: d });
export const createContactInquiry  = (d)    => request('/contact/', { method: 'POST', body: d });
export const createGroupCharterInquiry = (d)=> request('/group-charters/', { method: 'POST', body: d });
export const trackGroupCharter     = (ref)  => request(`/group-charters/track/${ref}/`);
export const createAirCargoInquiry = (d)    => request('/air-cargo/', { method: 'POST', body: d });
export const trackAirCargo         = (ref)  => request(`/air-cargo/track/${ref}/`);
export const createAircraftSalesInquiry = (d)=> request('/aircraft-sales/', { method: 'POST', body: d });
export const trackAircraftSales    = (ref)  => request(`/aircraft-sales/track/${ref}/`);

// ============================================================================
// PART 2: MEMBERSHIP APIs
// ============================================================================

// Auth
export const registerUser  = (d)  => authFetch('/auth/register/', { method: 'POST', body: d });
export const loginUser     = async (d) => {
  const r = await authFetch('/auth/login/', { method: 'POST', body: d });
  if (r.tokens) saveTokens({ access: r.tokens.access, refresh: r.tokens.refresh });
  if (r.user)   saveUser(r.user);
  return r;
};
export const logoutUser    = async () => {
  try { await authFetch('/auth/logout/', { method: 'POST', body: { refresh: getRefreshToken() } }); } catch {}
  clearTokens();
};
export const getMe             = ()  => authFetch('/auth/me/');
export const updateProfile     = (d) => authFetch('/auth/update_profile/', { method: 'PATCH', body: d });

// Membership
export const getMembershipTiers  = ()  => authFetch('/membership-tiers/');
export const getMyMembership     = ()  => authFetch('/memberships/my_membership/');
export const subscribeMembership = (d) => authFetch('/memberships/subscribe/', { method: 'POST', body: d });
export const cancelMembership    = ()  => authFetch('/memberships/cancel/', { method: 'POST' });

// Marketplace
export const getMarketplaceAircraft  = (p='') => authFetch(`/marketplace/aircraft/${p}`);
export const getAircraftDetail       = (id)   => authFetch(`/marketplace/aircraft/${id}/`);
export const createAircraft          = (d)    => authFetch('/marketplace/aircraft/', { method: 'POST', body: d });
export const updateAircraft          = (id,d) => authFetch(`/marketplace/aircraft/${id}/`, { method: 'PATCH', body: d });
export const deleteAircraft          = (id)   => authFetch(`/marketplace/aircraft/${id}/`, { method: 'DELETE' });
export const approveAircraft         = (id)   => authFetch(`/marketplace/aircraft/${id}/approve/`, { method: 'POST' });
export const updateAircraftStatus    = (id,s) => authFetch(`/marketplace/aircraft/${id}/update_status/`, { method: 'POST', body: { status: s } });

// Maintenance
export const getMaintenanceLogs  = (id='') => authFetch(`/marketplace/maintenance/${id ? `?aircraft=${id}` : ''}`);
export const createMaintenanceLog = (d)    => authFetch('/marketplace/maintenance/', { method: 'POST', body: d });
export const updateMaintenanceLog = (id,d) => authFetch(`/marketplace/maintenance/${id}/`, { method: 'PATCH', body: d });
export const deleteMaintenanceLog = (id)   => authFetch(`/marketplace/maintenance/${id}/`, { method: 'DELETE' });

// Bookings
export const getMyBookings  = (p='') => authFetch(`/marketplace/bookings/${p}`);
export const getBooking     = (id)   => authFetch(`/marketplace/bookings/${id}/`);
export const createBooking  = (d)    => authFetch('/marketplace/bookings/', { method: 'POST', body: d });
export const cancelBooking  = (id)   => authFetch(`/marketplace/bookings/${id}/cancel/`, { method: 'POST' });

// Payments
export const getPaymentHistory = (p='') => authFetch(`/payments/${p}`);

// Saved routes
export const getSavedRoutes   = ()  => authFetch('/saved-routes/');
export const createSavedRoute = (d) => authFetch('/saved-routes/', { method: 'POST', body: d });
export const deleteSavedRoute = (id)=> authFetch(`/saved-routes/${id}/`, { method: 'DELETE' });

// Disputes
export const getDisputes    = (p='') => authFetch(`/disputes/${p}`);
export const createDispute  = (d)    => authFetch('/disputes/', { method: 'POST', body: d });
export const resolveDispute = (id,r) => authFetch(`/disputes/${id}/resolve/`, { method: 'POST', body: { resolution: r } });

// Commission
export const getCommissionSettings = (p='') => authFetch(`/commissions/${p}`);
export const setCommissionRate     = (d)    => authFetch('/commissions/', { method: 'POST', body: d });

// Dashboards
export const getClientDashboard = () => authFetch('/dashboard/client/summary/');
export const getOwnerDashboard  = () => authFetch('/dashboard/owner/summary/');
export const getAdminDashboard  = () => authFetch('/dashboard/admin/summary/');

// ============================================================================
// PART 3: ADMIN CRUD APIs
// ============================================================================

// ── Email ──────────────────────────────────────────────────────────────────
export const getEmailLogs  = (p='') => authFetch(`/admin/email-logs/${p}`);
export const sendAdminEmail = (d)   => authFetch('/admin/email-logs/send/', { method: 'POST', body: d });

// ── Price Calculator ───────────────────────────────────────────────────────
export const calculatePrice = (d) => authFetch('/admin/price-calculator/calculate/', { method: 'POST', body: d });

// ── Flight Bookings (Admin) ────────────────────────────────────────────────
export const adminGetFlightBookings   = (p='')    => authFetch(`/admin/flight-bookings/${p}`);
export const adminGetFlightBooking    = (id)      => authFetch(`/admin/flight-bookings/${id}/`);
export const adminCreateFlightBooking = (d)       => authFetch('/admin/flight-bookings/', { method: 'POST', body: d });
export const adminUpdateFlightBooking = (id, d)   => authFetch(`/admin/flight-bookings/${id}/`, { method: 'PATCH', body: d });
export const adminDeleteFlightBooking = (id)      => authFetch(`/admin/flight-bookings/${id}/`, { method: 'DELETE' });
export const adminSetFlightPrice      = (id, d)   => authFetch(`/admin/flight-bookings/${id}/set_price/`, { method: 'POST', body: d });
export const adminReplyFlightBooking  = (id, d)   => authFetch(`/admin/flight-bookings/${id}/reply/`, { method: 'POST', body: d });
export const adminUpdateFlightStatus  = (id, s)   => authFetch(`/admin/flight-bookings/${id}/update_status/`, { method: 'PATCH', body: { status: s } });

// ── Yacht Charters (Admin) ─────────────────────────────────────────────────
export const adminGetYachtCharters   = (p='')   => authFetch(`/admin/yacht-charters/${p}`);
export const adminGetYachtCharter    = (id)     => authFetch(`/admin/yacht-charters/${id}/`);
export const adminCreateYachtCharter = (d)      => authFetch('/admin/yacht-charters/', { method: 'POST', body: d });
export const adminUpdateYachtCharter = (id, d)  => authFetch(`/admin/yacht-charters/${id}/`, { method: 'PATCH', body: d });
export const adminDeleteYachtCharter = (id)     => authFetch(`/admin/yacht-charters/${id}/`, { method: 'DELETE' });
export const adminSetYachtPrice      = (id, d)  => authFetch(`/admin/yacht-charters/${id}/set_price/`, { method: 'POST', body: d });
export const adminReplyYachtCharter  = (id, d)  => authFetch(`/admin/yacht-charters/${id}/reply/`, { method: 'POST', body: d });

// ── Lease Inquiries (Admin) ────────────────────────────────────────────────
export const adminGetLeaseInquiries  = (p='')   => authFetch(`/admin/lease-inquiries/${p}`);
export const adminGetLeaseInquiry    = (id)     => authFetch(`/admin/lease-inquiries/${id}/`);
export const adminUpdateLeaseInquiry = (id, d)  => authFetch(`/admin/lease-inquiries/${id}/`, { method: 'PATCH', body: d });
export const adminDeleteLeaseInquiry = (id)     => authFetch(`/admin/lease-inquiries/${id}/`, { method: 'DELETE' });
export const adminReplyLeaseInquiry  = (id, d)  => authFetch(`/admin/lease-inquiries/${id}/reply/`, { method: 'POST', body: d });
export const adminUpdateLeaseStatus  = (id, s)  => authFetch(`/admin/lease-inquiries/${id}/update_status/`, { method: 'PATCH', body: { status: s } });

// ── Contacts (Admin) ───────────────────────────────────────────────────────
export const adminGetContacts   = (p='')  => authFetch(`/admin/contacts/${p}`);
export const adminGetContact    = (id)    => authFetch(`/admin/contacts/${id}/`);
export const adminDeleteContact = (id)    => authFetch(`/admin/contacts/${id}/`, { method: 'DELETE' });
export const adminReplyContact  = (id, d) => authFetch(`/admin/contacts/${id}/reply/`, { method: 'POST', body: d });

// ── Group Charters (Admin) ─────────────────────────────────────────────────
export const adminGetGroupCharters   = (p='')  => authFetch(`/admin/group-charters/${p}`);
export const adminGetGroupCharter    = (id)    => authFetch(`/admin/group-charters/${id}/`);
export const adminUpdateGroupCharter = (id, d) => authFetch(`/admin/group-charters/${id}/`, { method: 'PATCH', body: d });
export const adminDeleteGroupCharter = (id)    => authFetch(`/admin/group-charters/${id}/`, { method: 'DELETE' });
export const adminReplyGroupCharter  = (id, d) => authFetch(`/admin/group-charters/${id}/reply/`, { method: 'POST', body: d });
export const adminUpdateGroupStatus  = (id, s) => authFetch(`/admin/group-charters/${id}/update_status/`, { method: 'PATCH', body: { status: s } });

// ── Air Cargo (Admin) ──────────────────────────────────────────────────────
export const adminGetAirCargo       = (p='')  => authFetch(`/admin/air-cargo/${p}`);
export const adminGetAirCargoItem   = (id)    => authFetch(`/admin/air-cargo/${id}/`);
export const adminUpdateAirCargo    = (id, d) => authFetch(`/admin/air-cargo/${id}/`, { method: 'PATCH', body: d });
export const adminDeleteAirCargo    = (id)    => authFetch(`/admin/air-cargo/${id}/`, { method: 'DELETE' });
export const adminReplyAirCargo     = (id, d) => authFetch(`/admin/air-cargo/${id}/reply/`, { method: 'POST', body: d });
export const adminUpdateCargoStatus = (id, s) => authFetch(`/admin/air-cargo/${id}/update_status/`, { method: 'PATCH', body: { status: s } });

// ── Aircraft Sales (Admin) ─────────────────────────────────────────────────
export const adminGetAircraftSales       = (p='')  => authFetch(`/admin/aircraft-sales/${p}`);
export const adminGetAircraftSale        = (id)    => authFetch(`/admin/aircraft-sales/${id}/`);
export const adminUpdateAircraftSale     = (id, d) => authFetch(`/admin/aircraft-sales/${id}/`, { method: 'PATCH', body: d });
export const adminDeleteAircraftSale     = (id)    => authFetch(`/admin/aircraft-sales/${id}/`, { method: 'DELETE' });
export const adminReplyAircraftSale      = (id, d) => authFetch(`/admin/aircraft-sales/${id}/reply/`, { method: 'POST', body: d });
export const adminUpdateAircraftSaleStatus = (id,s)=> authFetch(`/admin/aircraft-sales/${id}/update_status/`, { method: 'PATCH', body: { status: s } });

// ── Flight Inquiries (Admin) ───────────────────────────────────────────────
export const adminGetFlightInquiries  = (p='')  => authFetch(`/admin/flight-inquiries/${p}`);
export const adminGetFlightInquiry    = (id)    => authFetch(`/admin/flight-inquiries/${id}/`);
export const adminDeleteFlightInquiry = (id)    => authFetch(`/admin/flight-inquiries/${id}/`, { method: 'DELETE' });
export const adminReplyFlightInquiry  = (id, d) => authFetch(`/admin/flight-inquiries/${id}/reply/`, { method: 'POST', body: d });

// ── Marketplace Bookings (Admin) ───────────────────────────────────────────
export const adminGetMpBookings         = (p='')  => authFetch(`/admin/marketplace-bookings/${p}`);
export const adminGetMpBooking          = (id)    => authFetch(`/admin/marketplace-bookings/${id}/`);
export const adminCreateMpBooking       = (d)     => authFetch('/admin/marketplace-bookings/', { method: 'POST', body: d });
export const adminUpdateMpBooking       = (id, d) => authFetch(`/admin/marketplace-bookings/${id}/`, { method: 'PATCH', body: d });
export const adminDeleteMpBooking       = (id)    => authFetch(`/admin/marketplace-bookings/${id}/`, { method: 'DELETE' });
export const adminSendMpConfirmation    = (id, d) => authFetch(`/admin/marketplace-bookings/${id}/send_confirmation/`, { method: 'POST', body: d });
export const adminUpdateMpBookingStatus = (id, s) => authFetch(`/admin/marketplace-bookings/${id}/update_status/`, { method: 'PATCH', body: { status: s } });

// ── Users (Admin) ──────────────────────────────────────────────────────────
export const adminGetUsers      = (p='')  => authFetch(`/admin/users/${p}`);
export const adminGetUser       = (id)    => authFetch(`/admin/users/${id}/`);
export const adminUpdateUser    = (id, d) => authFetch(`/admin/users/${id}/`, { method: 'PATCH', body: d });
export const adminToggleUser    = (id)    => authFetch(`/admin/users/${id}/toggle_active/`, { method: 'POST' });
export const adminEmailUser     = (id, d) => authFetch(`/admin/users/${id}/send_email/`, { method: 'POST', body: d });

// ── Admin Overview ─────────────────────────────────────────────────────────
export const adminGetInquiriesSummary = () => authFetch('/admin/overview/inquiries_summary/');
export const adminGetUsersSummary     = () => authFetch('/admin/overview/users_summary/');

// ============================================================================
// PART 4: HELPERS
// ============================================================================

export const isAuthenticated = () => !!getAccessToken();
export const getUserRole     = () => getUser()?.role || null;
export const hasRole         = (r) => getUserRole() === r;
export const isAdmin         = () => hasRole('admin');
export const isOwner         = () => hasRole('owner');
export const isClient        = () => hasRole('client');
export const getAuthHeaders  = () => {
  const t = getAccessToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};