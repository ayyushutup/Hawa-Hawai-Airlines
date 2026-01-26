import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';

import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import FlightTracker from './pages/FlightTracker';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import { Login, Signup } from './pages/AuthPages';
import { CabinExperience, DiningExperience, LoungeExperience } from './pages/ExperiencePages';
import PrivilegeClub from './pages/PrivilegeClub';
import HowItWorks from './pages/HowItWorks';
import CancelBooking from './pages/CancelBooking';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/results" element={<SearchResults />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/experience/cabin" element={<CabinExperience />} />
            <Route path="/experience/dining" element={<DiningExperience />} />
            <Route path="/experience/lounge" element={<LoungeExperience />} />
            <Route path="/privilege-club" element={<PrivilegeClub />} />
            <Route path="/how-its-made" element={<HowItWorks />} />

            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/tracker" element={<FlightTracker />} />
            <Route path="/cancel-booking" element={<CancelBooking />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
