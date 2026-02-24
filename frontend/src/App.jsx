import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // Add Navigate here
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import FlightBooking from './pages/FlightBooking';
import FlightInquiry from './pages/FlightInquiry';
import YachtCharter from './pages/YachtCharter';
import Leasing from './pages/Leasing';
import Fleet from './pages/Fleet';
import TrackBooking from './pages/TrackBooking';
import About from './pages/About';
import Contact from './pages/Contact';
import GroupCharter from './pages/GroupCharter';
import AirCargo from './pages/AirCargo';
import AircraftSales from './pages/AircraftSales';

// Membership imports - check these paths carefully!
// Option 1: If your files are named exactly as shown and are default exports
import Login from './pages/membership/Login';
import Register from './pages/membership/Register';
import Plans from './pages/membership/Plans';
import ClientDashboard from './pages/membership/ClientDashboard';
import OwnerDashboard from './pages/membership/OwnerDashboard';
import AdminDashboard from './pages/membership/AdminDashboard';

// Option 2: If they are named exports (uncomment if needed)
// import { Login } from './pages/membership/Login';
// import { Register } from './pages/membership/Register';
// import { Plans } from './pages/membership/Plans';
// import { ClientDashboard } from './pages/membership/ClientDashboard';
// import { OwnerDashboard } from './pages/membership/OwnerDashboard';
// import { AdminDashboard } from './pages/membership/AdminDashboard';

// Auth guard helper
function RequireAuth({ children, role }) {
  try {
    const user = JSON.parse(localStorage.getItem('vj_user') || 'null');
    if (!user) return <Navigate to="/membership/login" replace />;
    if (role && user.role !== role) return <Navigate to="/membership/login" replace />;
    return children;
  } catch (error) {
    console.error('Auth guard error:', error);
    return <Navigate to="/membership/login" replace />;
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/book-flight" element={<FlightBooking />} />
          <Route path="/flight-inquiry" element={<FlightInquiry />} />
          <Route path="/yacht-charter" element={<YachtCharter />} />
          <Route path="/leasing" element={<Leasing />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/track" element={<TrackBooking />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/group-charter" element={<GroupCharter />} />
          <Route path="/air-cargo" element={<AirCargo />} />
          <Route path="/aircraft-sales" element={<AircraftSales />} />

          {/* Membership Routes */}
          <Route path="/membership/login" element={<Login />} />
          <Route path="/membership/register" element={<Register />} />
          <Route path="/membership/plans" element={<Plans />} />
          
          {/* Protected Dashboard Routes */}
          <Route 
            path="/membership/dashboard" 
            element={
              <RequireAuth role="client">
                <ClientDashboard />
              </RequireAuth>
            } 
          />
          <Route 
            path="/membership/owner-dashboard" 
            element={
              <RequireAuth role="owner">
                <OwnerDashboard />
              </RequireAuth>
            } 
          />
          <Route 
            path="/membership/admin-dashboard" 
            element={
              <RequireAuth role="admin">
                <AdminDashboard />
              </RequireAuth>
            } 
          />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}