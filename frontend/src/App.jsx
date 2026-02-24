import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import FlightBooking from './pages/FlightBooking'
import FlightInquiry from './pages/FlightInquiry'
import YachtCharter from './pages/YachtCharter'
import Leasing from './pages/Leasing'
import Fleet from './pages/Fleet'
import TrackBooking from './pages/TrackBooking'

import About from './pages/About'
import Contact from './pages/Contact'
import GroupCharter from './pages/GroupCharter'
import AirCargo from './pages/AirCargo'
import AircraftSales from './pages/AircraftSales'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
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
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}