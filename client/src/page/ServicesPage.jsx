import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAlert } from "../components/AlertProvider";
import { Search, ChevronLeft, ChevronRight, Filter, Star, Clock, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL + "/api/v1/services/all-services";

export default function ServicesPage() {
  const { showAlert } = useAlert();
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [totalServices, setTotalServices] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const scrollY = useRef(0);

  // Fetch services from backend - FUNCTIONALITY PRESERVED
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL, {
        params: { search, page, limit: 9, sortBy },
      });
      
      setServices(response.data.data.services);
      setTotalPages(response.data.data.totalPages);
      setTotalServices(response.data.data.totalServices);
      
      showAlert("Success", "Services loaded successfully", "success");
    } catch (err) {
      setError("Failed to load services.");
      showAlert("Error", "Failed to load services. Try again later.", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [search, page, sortBy]); // FUNCTIONALITY PRESERVED

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    const handleScroll = () => {
      scrollY.current = window.scrollY;
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Function to truncate description text - FUNCTIONALITY PRESERVED
  const truncateDescription = (description, maxLength = 80) => {
    if (!description) return "Professional service provider for all your needs.";
    
    if (description.length <= maxLength) return description;
    
    const truncated = description.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > 0 
      ? `${truncated.substring(0, lastSpace)}...` 
      : `${truncated}...`;
  };

  // Enhanced skeleton loader with pulse animation
  const SkeletonCard = () => (
    <motion.div 
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
      className="bg-gradient-to-br from-blue-900/20 to-blue-950/30 backdrop-blur-sm rounded-xl h-56 w-full border border-blue-800/30"
    />
  );

  return (
    <div className="bg-gradient-to-b from-[#061426] to-[#0a2341] min-h-screen pt-20 pb-16 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Animated gradient circles */}
        <div className="absolute w-[600px] h-[600px] rounded-full bg-[#0a4b8c]/10 blur-[100px] top-[10%] -left-[300px] animate-pulse"></div>
        <div className="absolute w-[600px] h-[600px] rounded-full bg-[#2a6baf]/10 blur-[100px] bottom-[20%] -right-[300px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[#5396e3]/5 blur-[80px] top-[60%] left-[30%] animate-pulse" style={{ animationDuration: '12s' }}></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
        
        {/* Animated lines */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent transform opacity-30" style={{ transform: `translateY(${20 + scrollY.current * 0.5}vh)` }}></div>
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent transform opacity-30" style={{ transform: `translateY(${40 + scrollY.current * 0.3}vh)` }}></div>
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent transform opacity-30" style={{ transform: `translateY(${60 + scrollY.current * 0.2}vh)` }}></div>
        </div>
        
        {/* Animated particles */}
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 rounded-full bg-blue-500/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.2 + Math.random() * 0.5,
              animation: `float${i % 3 + 1} ${8 + Math.random() * 15}s infinite ease-in-out`
            }}
          ></div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto px-6 relative z-10"
      >
        {/* Header with enhanced styling */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="inline-block px-4 py-2 bg-blue-900/30 rounded-full text-blue-200 text-sm font-medium mb-6 border border-blue-800/40 backdrop-blur-sm"
          >
            <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
            Discover Amazing Services
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#5396e3] to-[#9ecbff]"
          >
            Discover Services
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-blue-200/90 max-w-2xl mx-auto"
          >
            Find and connect with the best service providers for your needs. Browse our curated selection of top professionals.
          </motion.p>
        </div>
        
        {/* Search and Filter Bar with enhanced styling */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-blue-900/30 to-blue-950/40 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-lg mb-8 border border-blue-800/30"
        >
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search for a service..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full p-3 pl-10 rounded-lg bg-blue-900/20 backdrop-blur-sm border border-blue-700/50 text-blue-100 placeholder-blue-300/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                />
                <Search className="absolute left-3 top-3.5 text-blue-400" size={20} />
              </div>
              <button 
                onClick={() => fetchServices()}
                className="py-3 px-6 bg-gradient-to-r from-[#0a4b8c] to-[#0a2c54] rounded-xl text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#5396e3]/30 group flex items-center justify-center gap-2 relative overflow-hidden"
              >
                <span className="relative z-10">Search</span>
                <Search size={18} className="relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1a5b9c] to-[#1a3c64] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-blue-500/50 to-blue-300/50 opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-300"></div>
              </button>
            </div>
            
            {/* Sort options with enhanced styling */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="text-blue-300 flex items-center">
                <Filter size={16} className="mr-2" /> Sort by:
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSortBy("newest")}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors ${
                    sortBy === "newest"
                      ? "bg-blue-600/30 text-blue-200 font-medium border border-blue-600/50"
                      : "bg-blue-900/20 text-blue-300 hover:bg-blue-800/30 border border-blue-800/30"
                  }`}
                >
                  <Clock size={14} /> Newest
                </button>
                <button
                  onClick={() => setSortBy("popular")}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors ${
                    sortBy === "popular"
                      ? "bg-blue-600/30 text-blue-200 font-medium border border-blue-600/50"
                      : "bg-blue-900/20 text-blue-300 hover:bg-blue-800/30 border border-blue-800/30"
                  }`}
                >
                  <Star size={14} /> Popular
                </button>
                <button
                  onClick={() => setSortBy("alphabetical")}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors ${
                    sortBy === "alphabetical"
                      ? "bg-blue-600/30 text-blue-200 font-medium border border-blue-600/50"
                      : "bg-blue-900/20 text-blue-300 hover:bg-blue-800/30 border border-blue-800/30"
                  }`}
                >
                  <span className="text-xs font-serif font-bold">A-Z</span> Alphabetical
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results counter with enhanced styling */}
        {!loading && !error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-4 text-blue-300"
          >
            Showing {services.length} of {totalServices} services
          </motion.div>
        )}

        {/* Services List - FUNCTIONALITY PRESERVED BUT ENHANCED VISUALS */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-red-900/20 border border-red-700/30 rounded-xl p-6 text-center backdrop-blur-sm"
          >
            <p className="text-red-300 text-lg">{error}</p>
            <button 
              onClick={fetchServices}
              className="mt-4 px-5 py-2 bg-red-600/80 hover:bg-red-700/80 text-white rounded-lg transition"
            >
              Try Again
            </button>
          </motion.div>
        ) : services.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-10 text-center backdrop-blur-sm"
          >
            <p className="text-blue-300 text-lg mb-2">No services found</p>
            <p className="text-blue-400/70">Try adjusting your search</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group"
              >
                <Link 
                  to={`/services/${service._id}`} 
                  className="bg-gradient-to-br from-blue-900/30 to-blue-950/40 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer overflow-hidden block h-full border border-blue-800/30 group-hover:border-blue-600/50 relative"
                >
                  {/* Hover effect glow */}
                  <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-blue-500/50 to-blue-300/50 opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></div>
                  
                  <div className="p-5 flex flex-col h-full relative z-10">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-900 to-blue-800 p-[2px]">
                          <img
                            src={service.logo || "https://via.placeholder.com/64"}
                            alt={service.serviceName}
                            className="h-full w-full rounded-full object-cover bg-blue-950"
                          />
                        </div>
                        {service.upvotes > 0 && (
                          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium shadow-sm border border-blue-400/20">
                            {service.upvotes}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-blue-100 group-hover:text-white transition duration-300">
                          {service.serviceName}
                        </h3>
                        <p className="text-sm text-blue-300">
                          {service.category || "Service"}
                        </p>
                      </div>
                    </div>
                    <p className="text-blue-200 mb-3 flex-grow">
                      {truncateDescription(service.description)}
                    </p>
                    <div className="flex justify-between items-center mt-2 text-sm text-blue-300">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-amber-400" />
                        <span>{service.upvotes || 0} upvotes</span>
                      </div>
                      {service.createdAt && (
                        <span>
                          {new Date(service.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Enhanced Pagination with blue theme */}
        {totalPages > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center items-center mt-10"
          >
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-950/40 backdrop-blur-sm shadow-md rounded-full p-1 flex items-center border border-blue-800/30">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full transition
                  ${page === 1 
                    ? "text-blue-700 dark:text-blue-800 cursor-not-allowed" 
                    : "text-blue-300 hover:bg-blue-800/30"}
                `}
              >
                <ChevronLeft size={20} />
              </button>
              
              {/* Page Number Buttons */}
              {[...Array(totalPages)].map((_, i) => {
                // Calculate which page numbers to show
                if (
                  i === 0 || // Always show first page
                  i === totalPages - 1 || // Always show last page
                  (i >= page - 2 && i <= page) || // Show 2 pages before current
                  (i >= page && i <= page + 1) // Show 1 page after current
                ) {
                  return (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`
                        w-10 h-10 rounded-full mx-1 font-medium transition duration-300
                        ${page === i + 1
                          ? "bg-gradient-to-r from-[#0a4b8c] to-[#0a2c54] text-white"
                          : "text-blue-200 hover:bg-blue-800/30"}
                      `}
                    >
                      {i + 1}
                    </button>
                  );
                } else if (
                  (i === 1 && page > 3) || // Show ellipsis after first page
                  (i === totalPages - 2 && page < totalPages - 2) // Show ellipsis before last page
                ) {
                  return <span key={i} className="mx-1 text-blue-400">...</span>;
                }
                return null;
              })}
              
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full transition
                  ${page === totalPages 
                    ? "text-blue-700 dark:text-blue-800 cursor-not-allowed" 
                    : "text-blue-300 hover:bg-blue-800/30"}
                `}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
      
      {/* CSS animations for particles */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(20px) translateX(-15px); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-15px) translateX(-10px); }
        }
      `}</style>
    </div>
  );
}