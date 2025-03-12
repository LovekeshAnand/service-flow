import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../src/page/Home";
import Navbar from "../src/components/Navbar";
import Footer from "../src/components/Footer";
import ProfilePage from "../src/page/Profile";
import ServiceDashboard from "../src/page/ServiceDashboard";
import ServicesPage from "../src/page/ServicesPage";
import ServiceDetails from "../src/page/ServiceDetails";
import IssuesPage from "../src/page/IssuePage";
import FeedbacksPage from "../src/page/FeedbackPage";
import UserIssuesPage from "../src/page/UserIssuesPage";
import UserFeedbacksPage from "../src/page/UserFeedbacksPage";
import NotFound from "../src/page/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner /> {/* ✅ This is your Toaster component */}
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow pt-24 pb-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile/:userId" element={<ProfilePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:id" element={<ServiceDetails />} />
              <Route path="/services/:id/dashboard" element={<ServiceDashboard />} />
              {/* Service-specific issues and feedbacks */}
              <Route path="/issues/:serviceId" element={<IssuesPage />} />
              <Route path="/feedbacks/:serviceId" element={<FeedbacksPage />} />
              {/* User-specific issues and feedbacks */}
              <Route path="/users/:userId/issues" element={<UserIssuesPage />} />
              <Route path="/users/:userId/feedbacks" element={<UserFeedbacksPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;