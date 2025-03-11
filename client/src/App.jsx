import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../src/page/Home";
import Navbar from "../src/components/Navbar";
import Footer from "../src/components/Footer";
import ProfilePage from "../src/page/Profile";
import ServiceDashboard from "../src/page/ServiceDashboard";
import ServicesPage from "../src/page/ServicesPage";
import ServiceDetails from "../src/page/ServiceDetails"; // ✅ Import ServiceDetails component

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-24 pb-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:id" element={<ServiceDetails />} /> {/* ✅ Added ServiceDetails Route */}
            <Route path="/services/:id/dashboard" element={<ServiceDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;