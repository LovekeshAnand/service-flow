import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAlert } from "../components/AlertProvider";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:8000/api/v1/services/all-services";

export default function ServicesPage() {
  const { showAlert } = useAlert();
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch services from backend
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL, {
        params: { search, page, limit: 9, sortBy: "newest" },
      });
      
      setServices(response.data.data.services);
      setTotalPages(response.data.data.totalPages);
      
      // Show success alert when services load
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
  }, [search, page]); // Fetch data when search or page changes

  // Function to truncate description text
  const truncateDescription = (description, maxLength = 80) => {
    if (!description) return "Professional service provider for all your needs.";
    
    if (description.length <= maxLength) return description;
    
    // Get the first few words that fit within maxLength
    const truncated = description.substring(0, maxLength);
    // Find the last space to avoid cutting words in half
    const lastSpace = truncated.lastIndexOf(' ');
    
    // Return the truncated text up to the last space plus ellipsis
    return lastSpace > 0 
      ? `${truncated.substring(0, lastSpace)}...` 
      : `${truncated}...`;
  };

  // Skeleton loader component
  const SkeletonCard = () => (
    <div className="bg-gray-100 animate-pulse rounded-xl h-32 w-full"></div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-green-700 mb-4">Discover Services</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find and connect with the best service providers for your needs. Browse our curated selection of top professionals.
          </p>
        </div>
        
        {/* Search Bar with green border */}
        <div className="bg-white p-4 rounded-2xl shadow-md mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search for a service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-3 pl-10 rounded-lg bg-white border border-green-300 text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition"
              />
              <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
            </div>
            <button 
              onClick={() => fetchServices()}
              className="py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              <Search size={18} /> Search
            </button>
          </div>
        </div>

        {/* Services List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 text-lg">{error}</p>
            <button 
              onClick={fetchServices}
              className="mt-4 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
            <p className="text-gray-500 text-lg mb-2">No services found</p>
            <p className="text-gray-400">Try adjusting your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link 
                to={`/services/${service._id}`} 
                key={service._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
              >
                <div className="p-5">
                  <div className="flex items-center gap-4 mb-3">
                    <img
                      src={service.logo || "https://via.placeholder.com/64"}
                      alt={service.serviceName}
                      className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-md"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 group-hover:text-green-600 transition">
                        {service.serviceName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {service.category || "Service"}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">
                    {truncateDescription(service.description)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-10">
            <div className="bg-white shadow-md rounded-full p-1 flex items-center">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full
                  ${page === 1 
                    ? "text-gray-300 cursor-not-allowed" 
                    : "text-green-600 hover:bg-green-50 transition"}
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
                          ? "bg-green-600 text-white"
                          : "text-gray-700 hover:bg-green-50"}
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
                  flex items-center justify-center w-10 h-10 rounded-full
                  ${page === totalPages 
                    ? "text-gray-300 cursor-not-allowed" 
                    : "text-green-600 hover:bg-green-50 transition"}
                `}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}