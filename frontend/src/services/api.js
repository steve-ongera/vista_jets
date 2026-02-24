const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

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