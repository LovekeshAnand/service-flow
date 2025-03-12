import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAlert } from "../components/AlertProvider";
import { Search, ChevronLeft, ChevronRight, Filter, Star, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const API_URL = "http://localhost:8000/api/v1/services/all-services";

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

  // Fetch services from backend
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
  }, [search, page, sortBy]); // Fetch data when search, page, or sortBy changes

  // Function to truncate description text
  const truncateDescription = (description, maxLength = 80) => {
    if (!description) return "Professional service provider for all your needs.";
    
    if (description.length <= maxLength) return description;
    
    const truncated = description.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > 0 
      ? `${truncated.substring(0, lastSpace)}...` 
      : `${truncated}...`;
  };

  // Skeleton loader component
  const SkeletonCard = () => (
    <motion.div 
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
      className="bg-gray-100 dark:bg-gray-800 rounded-xl h-40 w-full"
    />
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pt-20 pb-16">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto px-6"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-violet-700 dark:text-violet-400 mb-4">
            Discover Services
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find and connect with the best service providers for your needs. Browse our curated selection of top professionals.
          </p>
        </div>
        
        {/* Search and Filter Bar with Indigo/Violet accent */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-md mb-8"
        >
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search for a service..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full p-3 pl-10 rounded-lg bg-white dark:bg-gray-700 border border-violet-300 dark:border-violet-600 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
                />
                <Search className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" size={20} />
              </div>
              <button 
                onClick={() => fetchServices()}
                className="py-3 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Search size={18} /> Search
              </button>
            </div>
            
            {/* Sort options */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="text-gray-500 dark:text-gray-400 flex items-center">
                <Filter size={16} className="mr-2" /> Sort by:
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSortBy("newest")}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors ${
                    sortBy === "newest"
                      ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <Clock size={14} /> Newest
                </button>
                <button
                  onClick={() => setSortBy("popular")}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors ${
                    sortBy === "popular"
                      ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <Star size={14} /> Popular
                </button>
                <button
                  onClick={() => setSortBy("alphabetical")}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors ${
                    sortBy === "alphabetical"
                      ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <span className="text-xs font-serif font-bold">A-Z</span> Alphabetical
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results counter */}
        {!loading && !error && (
          <div className="mb-4 text-gray-500 dark:text-gray-400">
            Showing {services.length} of {totalServices} services
          </div>
        )}

        {/* Services List */}
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
            className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center"
          >
            <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
            <button 
              onClick={fetchServices}
              className="mt-4 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              Try Again
            </button>
          </motion.div>
        ) : services.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-10 text-center"
          >
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No services found</p>
            <p className="text-gray-400 dark:text-gray-500">Try adjusting your search</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link 
                  to={`/services/${service._id}`} 
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer overflow-hidden group block h-full"
                >
                  <div className="p-5 flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="relative">
                        <img
                          src={service.logo || "https://via.placeholder.com/64"}
                          alt={service.serviceName}
                          className="h-16 w-16 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-md bg-gray-100 dark:bg-gray-700"
                        />
                        {service.upvotes > 0 && (
                          <div className="absolute -top-1 -right-1 bg-violet-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium shadow-sm">
                            {service.upvotes}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition">
                          {service.serviceName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {service.category || "Service"}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-3 flex-grow">
                      {truncateDescription(service.description)}
                    </p>
                    <div className="flex justify-between items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-amber-500" />
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

        {/* Enhanced Pagination with Indigo/Violet accents */}
        {totalPages > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center items-center mt-10"
          >
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-full p-1 flex items-center">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full transition
                  ${page === 1 
                    ? "text-gray-300 dark:text-gray-600 cursor-not-allowed" 
                    : "text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/30"}
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
                        w-10 h-10 rounded-full mx-1 font-medium transition
                        ${page === i + 1
                          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/30"}
                      `}
                    >
                      {i + 1}
                    </button>
                  );
                } else if (
                  (i === 1 && page > 3) || // Show ellipsis after first page
                  (i === totalPages - 2 && page < totalPages - 2) // Show ellipsis before last page
                ) {
                  return <span key={i} className="mx-1 text-gray-400">...</span>;
                }
                return null;
              })}
              
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full transition
                  ${page === totalPages 
                    ? "text-gray-300 dark:text-gray-600 cursor-not-allowed" 
                    : "text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/30"}
                `}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}