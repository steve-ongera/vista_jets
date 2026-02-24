// src/services/api.js

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ============================================================================
// PART 1: PUBLIC APIs (No Authentication Required)
// ============================================================================

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  };
  if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body);
  }
  const res = await fetch(url, config);
  const data = await res.json();
  if (!res.ok) throw { status: res.status, data };
  return data;
}

// ── Airports ──────────────────────────────────────────────────────────────────
export const searchAirports = (q) =>
  request(`/airports/?search=${encodeURIComponent(q)}`);

// ── Aircraft ──────────────────────────────────────────────────────────────────
export const getAircraft = (params = '') =>
  request(`/aircraft/${params}`);

// ── Yachts ────────────────────────────────────────────────────────────────────
export const getYachts = (params = '') =>
  request(`/yachts/${params}`);

// ── Flight Bookings ───────────────────────────────────────────────────────────
export const createFlightBooking = (data) =>
  request('/flight-bookings/', { method: 'POST', body: data });

export const trackFlightBooking = (reference) =>
  request(`/flight-bookings/track/${reference}/`);

export const getMyFlightBookings = (email) =>
  request(`/flight-bookings/?email=${encodeURIComponent(email)}`);

// ── Yacht Charters ────────────────────────────────────────────────────────────
export const createYachtCharter = (data) =>
  request('/yacht-charters/', { method: 'POST', body: data });

export const trackYachtCharter = (reference) =>
  request(`/yacht-charters/track/${reference}/`);

// ── Lease Inquiries ───────────────────────────────────────────────────────────
export const createLeaseInquiry = (data) =>
  request('/lease-inquiries/', { method: 'POST', body: data });

// ── Flight Inquiries ──────────────────────────────────────────────────────────
export const createFlightInquiry = (data) =>
  request('/flight-inquiries/', { method: 'POST', body: data });

// ── Quick Quote ───────────────────────────────────────────────────────────────
export const getQuickQuote = (data) =>
  request('/quick-quote/', { method: 'POST', body: data });

// ── Contact ───────────────────────────────────────────────────────────────────
export const createContactInquiry = (data) =>
  request('/contact/', { method: 'POST', body: data });

// ── Group Charter ─────────────────────────────────────────────────────────────
export const createGroupCharterInquiry = (data) =>
  request('/group-charters/', { method: 'POST', body: data });

export const trackGroupCharter = (reference) =>
  request(`/group-charters/track/${reference}/`);

// ── Air Cargo ─────────────────────────────────────────────────────────────────
export const createAirCargoInquiry = (data) =>
  request('/air-cargo/', { method: 'POST', body: data });

export const trackAirCargo = (reference) =>
  request(`/air-cargo/track/${reference}/`);

// ── Aircraft Sales ────────────────────────────────────────────────────────────
export const createAircraftSalesInquiry = (data) =>
  request('/aircraft-sales/', { method: 'POST', body: data });

export const trackAircraftSales = (reference) =>
  request(`/aircraft-sales/track/${reference}/`);


// ============================================================================
// PART 2: MEMBERSHIP APIS (Authentication Required)
// ============================================================================

// ── Token helpers ─────────────────────────────────────────────────────────────
export const getAccessToken = () => localStorage.getItem('vj_access');
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

// ── Save/load user data ───────────────────────────────────────────────────────
export const saveUser = (user) => {
  localStorage.setItem('vj_user', JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem('vj_user');
  return user ? JSON.parse(user) : null;
};

// ── Base fetch with auto-refresh ──────────────────────────────────────────────
async function authFetch(endpoint, options = {}) {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  let config = {
    ...options,
    headers,
  };
  
  if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body);
  }
  
  let res = await fetch(`${BASE_URL}${endpoint}`, config);

  // Try token refresh on 401
  if (res.status === 401 && getRefreshToken()) {
    try {
      const refreshRes = await fetch(`${BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: getRefreshToken() }),
      });
      
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        saveTokens({ access: data.access, refresh: getRefreshToken() });
        
        // Retry original request with new token
        headers.Authorization = `Bearer ${data.access}`;
        config.headers = headers;
        res = await fetch(`${BASE_URL}${endpoint}`, config);
      } else {
        // Refresh failed - clear tokens and redirect to login
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/membership/login';
        }
        throw new Error('Session expired. Please login again.');
      }
    } catch (error) {
      clearTokens();
      throw error;
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const error = new Error(errorData.detail || errorData.message || 'Request failed');
    error.status = res.status;
    error.data = errorData;
    throw error;
  }
  
  if (res.status === 204) return null;
  return res.json();
}

// ── AUTHENTICATION ────────────────────────────────────────────────────────────
export const registerUser = (data) => 
  authFetch('/auth/register/', { method: 'POST', body: data });

export const loginUser = async (data) => {
  const response = await authFetch('/auth/login/', { method: 'POST', body: data });
  if (response.access && response.refresh) {
    saveTokens({ access: response.access, refresh: response.refresh });
    if (response.user) {
      saveUser(response.user);
    }
  }
  return response;
};

export const logoutUser = async () => {
  const refresh = getRefreshToken();
  if (refresh) {
    try {
      await authFetch('/auth/logout/', { method: 'POST', body: { refresh } });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  clearTokens();
};

export const getMe = () => authFetch('/auth/me/');

export const updateProfile = (data) => 
  authFetch('/auth/update_profile/', { method: 'PATCH', body: data });

export const changePassword = (data) => 
  authFetch('/auth/change_password/', { method: 'POST', body: data });

export const requestPasswordReset = (email) => 
  authFetch('/auth/password-reset/', { method: 'POST', body: { email } });

export const resetPassword = (data) => 
  authFetch('/auth/password-reset/confirm/', { method: 'POST', body: data });

// ── MEMBERSHIP TIERS ──────────────────────────────────────────────────────────
export const getMembershipTiers = () => authFetch('/membership-tiers/');
export const getMembershipTier = (id) => authFetch(`/membership-tiers/${id}/`);

// ── MEMBERSHIP ────────────────────────────────────────────────────────────────
export const getMyMembership = () => authFetch('/memberships/my_membership/');
export const subscribeMembership = (data) => 
  authFetch('/memberships/subscribe/', { method: 'POST', body: data });
export const cancelMembership = () => 
  authFetch('/memberships/cancel/', { method: 'POST' });
export const renewMembership = () => 
  authFetch('/memberships/renew/', { method: 'POST' });
export const upgradeMembership = (tierId) => 
  authFetch('/memberships/upgrade/', { method: 'POST', body: { tier_id: tierId } });

// ── MARKETPLACE AIRCRAFT ──────────────────────────────────────────────────────
export const getMarketplaceAircraft = (params = '') => 
  authFetch(`/marketplace/aircraft/${params}`);
export const getAircraftDetail = (id) => 
  authFetch(`/marketplace/aircraft/${id}/`);
export const createAircraft = (data) => 
  authFetch('/marketplace/aircraft/', { method: 'POST', body: data });
export const updateAircraft = (id, data) => 
  authFetch(`/marketplace/aircraft/${id}/`, { method: 'PATCH', body: data });
export const deleteAircraft = (id) => 
  authFetch(`/marketplace/aircraft/${id}/`, { method: 'DELETE' });
export const approveAircraft = (id) => 
  authFetch(`/marketplace/aircraft/${id}/approve/`, { method: 'POST' });
export const updateAircraftStatus = (id, status) => 
  authFetch(`/marketplace/aircraft/${id}/update_status/`, { method: 'POST', body: { status } });
export const logFlightHours = (id, hours) => 
  authFetch(`/marketplace/aircraft/${id}/log_flight_hours/`, { method: 'POST', body: { hours } });

// ── MAINTENANCE ───────────────────────────────────────────────────────────────
export const getMaintenanceLogs = (aircraftId = '') => 
  authFetch(`/marketplace/maintenance/${aircraftId ? `?aircraft=${aircraftId}` : ''}`);
export const getMaintenanceLog = (id) => 
  authFetch(`/marketplace/maintenance/${id}/`);
export const createMaintenanceLog = (data) => 
  authFetch('/marketplace/maintenance/', { method: 'POST', body: data });
export const updateMaintenanceLog = (id, data) => 
  authFetch(`/marketplace/maintenance/${id}/`, { method: 'PATCH', body: data });
export const deleteMaintenanceLog = (id) => 
  authFetch(`/marketplace/maintenance/${id}/`, { method: 'DELETE' });
export const getMaintenanceAlerts = () => 
  authFetch('/marketplace/maintenance/alerts/');

// ── BOOKINGS ──────────────────────────────────────────────────────────────────
export const getMyBookings = (params = '') => 
  authFetch(`/marketplace/bookings/${params}`);
export const getBooking = (id) => 
  authFetch(`/marketplace/bookings/${id}/`);
export const createBooking = (data) => 
  authFetch('/marketplace/bookings/', { method: 'POST', body: data });
export const cancelBooking = (id) => 
  authFetch(`/marketplace/bookings/${id}/cancel/`, { method: 'POST' });
export const trackBooking = (ref) => 
  authFetch(`/marketplace/bookings/track/?reference=${ref}`);
export const getBookingReceipt = (id) => 
  authFetch(`/marketplace/bookings/${id}/receipt/`);

// ── PAYMENTS ──────────────────────────────────────────────────────────────────
export const getPaymentHistory = (params = '') => 
  authFetch(`/payments/${params}`);
export const getPayment = (id) => 
  authFetch(`/payments/${id}/`);
export const createPaymentIntent = (data) => 
  authFetch('/payments/create-intent/', { method: 'POST', body: data });
export const confirmPayment = (data) => 
  authFetch('/payments/confirm/', { method: 'POST', body: data });
export const getPaymentMethods = () => 
  authFetch('/payments/methods/');
export const addPaymentMethod = (data) => 
  authFetch('/payments/methods/', { method: 'POST', body: data });
export const deletePaymentMethod = (id) => 
  authFetch(`/payments/methods/${id}/`, { method: 'DELETE' });
export const setDefaultPaymentMethod = (id) => 
  authFetch(`/payments/methods/${id}/set_default/`, { method: 'POST' });

// ── SAVED ROUTES ──────────────────────────────────────────────────────────────
export const getSavedRoutes = () => authFetch('/saved-routes/');
export const getSavedRoute = (id) => authFetch(`/saved-routes/${id}/`);
export const createSavedRoute = (data) => 
  authFetch('/saved-routes/', { method: 'POST', body: data });
export const updateSavedRoute = (id, data) => 
  authFetch(`/saved-routes/${id}/`, { method: 'PATCH', body: data });
export const deleteSavedRoute = (id) => 
  authFetch(`/saved-routes/${id}/`, { method: 'DELETE' });

// ── DISPUTES ──────────────────────────────────────────────────────────────────
export const getDisputes = (params = '') => 
  authFetch(`/disputes/${params}`);
export const getDispute = (id) => 
  authFetch(`/disputes/${id}/`);
export const createDispute = (data) => 
  authFetch('/disputes/', { method: 'POST', body: data });
export const resolveDispute = (id, resolution) => 
  authFetch(`/disputes/${id}/resolve/`, { method: 'POST', body: { resolution } });
export const addDisputeMessage = (id, message) => 
  authFetch(`/disputes/${id}/messages/`, { method: 'POST', body: { message } });

// ── COMMISSION (admin only) ───────────────────────────────────────────────────
export const getCommissionSettings = (params = '') => 
  authFetch(`/commissions/${params}`);
export const getCurrentCommission = () => 
  authFetch('/commissions/current/');
export const setCommissionRate = (data) => 
  authFetch('/commissions/', { method: 'POST', body: data });
export const updateCommissionRate = (id, data) => 
  authFetch(`/commissions/${id}/`, { method: 'PATCH', body: data });

// ── DASHBOARDS ────────────────────────────────────────────────────────────────
export const getClientDashboard = () => authFetch('/dashboard/client/summary/');
export const getOwnerDashboard = () => authFetch('/dashboard/owner/summary/');
export const getAdminDashboard = () => authFetch('/dashboard/admin/summary/');

// ── OWNER STATISTICS ──────────────────────────────────────────────────────────
export const getOwnerEarnings = (params = '') => 
  authFetch(`/dashboard/owner/earnings/${params}`);
export const getOwnerAircraftStats = () => 
  authFetch('/dashboard/owner/aircraft-stats/');
export const getOwnerBookings = (params = '') => 
  authFetch(`/dashboard/owner/bookings/${params}`);

// ── ADMIN STATISTICS ──────────────────────────────────────────────────────────
export const getAdminStats = () => authFetch('/dashboard/admin/stats/');
export const getAdminRevenue = (params = '') => 
  authFetch(`/dashboard/admin/revenue/${params}`);
export const getAdminUsers = (params = '') => 
  authFetch(`/dashboard/admin/users/${params}`);
export const getAdminBookings = (params = '') => 
  authFetch(`/dashboard/admin/bookings/${params}`);
export const getAdminAircraft = (params = '') => 
  authFetch(`/dashboard/admin/aircraft/${params}`);

// ── STRIPE INTEGRATION ────────────────────────────────────────────────────────
export const createStripeSetupIntent = () => 
  authFetch('/payments/setup-intent/', { method: 'POST' });
export const createStripePaymentIntent = (data) => 
  authFetch('/payments/payment-intent/', { method: 'POST', body: data });
export const getStripePublishableKey = () => 
  authFetch('/payments/config/');

// ── MEMBERSHIP BENEFITS ───────────────────────────────────────────────────────
export const getMembershipBenefits = () => authFetch('/membership-benefits/');
export const calculateMembershipDiscount = (tierId, amount) => 
  authFetch(`/memberships/calculate-discount/?tier=${tierId}&amount=${amount}`);

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
export const getNotifications = () => authFetch('/notifications/');
export const markNotificationRead = (id) => 
  authFetch(`/notifications/${id}/read/`, { method: 'POST' });
export const markAllNotificationsRead = () => 
  authFetch('/notifications/read-all/', { method: 'POST' });


// ============================================================================
// PART 3: HELPER FUNCTIONS
// ============================================================================

// ── Check if user is authenticated ────────────────────────────────────────────
export const isAuthenticated = () => {
  return !!getAccessToken();
};

// ── Check user role ───────────────────────────────────────────────────────────
export const getUserRole = () => {
  const user = getUser();
  return user?.role || null;
};

// ── Check if user has specific role ───────────────────────────────────────────
export const hasRole = (role) => {
  const userRole = getUserRole();
  return userRole === role;
};

// ── Check if user is admin ────────────────────────────────────────────────────
export const isAdmin = () => {
  return hasRole('admin');
};

// ── Check if user is owner ────────────────────────────────────────────────────
export const isOwner = () => {
  return hasRole('owner');
};

// ── Check if user is client ───────────────────────────────────────────────────
export const isClient = () => {
  return hasRole('client');
};

// ── Get auth headers for manual requests ──────────────────────────────────────
export const getAuthHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ── Refresh token manually ────────────────────────────────────────────────────
export const refreshAccessToken = async () => {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error('No refresh token available');
  
  const response = await fetch(`${BASE_URL}/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  
  if (!response.ok) throw new Error('Failed to refresh token');
  
  const data = await response.json();
  saveTokens({ access: data.access, refresh });
  return data.access;
};