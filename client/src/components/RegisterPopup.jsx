import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, Upload, User, Briefcase, Mail, Lock, Link, FileText, Image } from "lucide-react";
import { useAlert } from "../components/AlertProvider";

const RegisterPopup = ({ isOpen, onClose, onRegisterSuccess, setUser }) => {
  const { showAlert } = useAlert();
  const [registerType, setRegisterType] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    email: "",
    password: "",
    serviceName: "",
    description: "",
    serviceLink: "",
    logo: null,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const modalRef = useRef(null);
  const [animateIn, setAnimateIn] = useState(false);
  
  // Handle animation timing
  useEffect(() => {
    if (isOpen) {
      // Small delay to trigger animations after modal appears
      setTimeout(() => setAnimateIn(true), 50);
    } else {
      setAnimateIn(false);
    }
  }, [isOpen]);

  // Reset form when popup closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target) && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  // Handle escape key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);


  const resetForm = () => {
    console.log("resetForm - Token before reset:", localStorage.getItem("accessToken"));
    setRegisterType(null);
    setFormData({
        username: "",
        fullname: "",
        email: "",
        password: "",
        serviceName: "",
        description: "",
        serviceLink: "",
        logo: null,
    });
    setLogoPreview(null);
    setErrorMessage("");
    console.log("resetForm - Token after reset:", localStorage.getItem("accessToken"));
};

const handleClose = () => {
    console.log("handleClose - Token before close:", localStorage.getItem("accessToken"));
    setAnimateIn(false);
    setTimeout(() => {
        onClose();
        console.log("handleClose - Token after close:", localStorage.getItem("accessToken"));
    }, 300);
};

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setLogoPreview(null); // Clear previous preview
      setFormData((prev) => ({ ...prev, logo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const API_BASE = import.meta.env.VITE_API_URL + "/api/v1";
    const registerUrl =
        registerType === "user"
            ? `${API_BASE}/users/register`
            : `${API_BASE}/services/register`;

    const formDataToSend = new FormData();
    const existingToken = localStorage.getItem("accessToken");
    console.log("Existing Token (before API call):", existingToken);

    // Populate formDataToSend (unchanged logic)
    if (registerType === "user") {
        if (!formData.username.trim() || !formData.fullname.trim() || !formData.email.trim() || !formData.password) {
            setErrorMessage("⚠️ All fields are required.");
            return;
        }
        formDataToSend.append("username", formData.username.trim());
        formDataToSend.append("fullname", formData.fullname.trim());
        formDataToSend.append("email", formData.email.trim());
        formDataToSend.append("password", formData.password);
    } else {
        if (!formData.serviceName.trim() || !formData.email.trim() || !formData.password || !formData.description.trim() || !formData.serviceLink.trim()) {
            setErrorMessage("⚠️ All fields are required.");
            return;
        }
        formDataToSend.append("serviceName", formData.serviceName.trim());
        formDataToSend.append("email", formData.email.trim());
        formDataToSend.append("password", formData.password);
        formDataToSend.append("description", formData.description.trim());
        formDataToSend.append("serviceLink", formData.serviceLink.trim());
        if (!formData.logo) {
            setErrorMessage("⚠️ Please upload a logo.");
            return;
        }
        formDataToSend.append("logo", formData.logo);
    }

    try {
        const response = await fetch(registerUrl, {
            method: "POST",
            body: formDataToSend,
            headers: {
                ...(existingToken ? { Authorization: `Bearer ${existingToken}` } : {}),
            },
        });

        const responseData = await response.json();
        console.log("API Response:", responseData);

        if (response.ok && responseData.data) {
            const accessToken = responseData.data.accessToken;
            console.log("Extracted accessToken:", accessToken); // Verify token value

            let userData;
            if (registerType === "user") {
                userData = responseData.data.user;
            } else {
                userData = responseData.data.service;
                if (userData) userData.isService = true;
            }

            if (!userData) {
                console.error("No user/service data in response.");
                setErrorMessage("Registration successful but user data is missing.");
                return;
            }

            if (accessToken) {
                // Step-by-step storage check
                console.log("Before setting token:", localStorage.getItem("accessToken"));
                localStorage.setItem("accessToken", accessToken);
                console.log("Immediately after setItem:", localStorage.getItem("accessToken"));

                // Double-check after a tiny delay to catch async interference
                setTimeout(() => {
                    console.log("After 100ms delay:", localStorage.getItem("accessToken"));
                }, 100);
            } else {
                console.log("No accessToken found in response data.");
            }

            localStorage.setItem("profile", JSON.stringify(userData));
            console.log("Profile stored:", localStorage.getItem("profile"));

            if (setUser) setUser(userData);
            if (onRegisterSuccess) onRegisterSuccess(userData);

            showAlert("Registration Successful", "🎉 Your account has been created successfully!", "success");

            // Log before closing to check if resetForm/handleClose interferes
            console.log("Before resetForm/handleClose:", localStorage.getItem("accessToken"));
            resetForm();
            handleClose();
        } else {
            showAlert("Registration Failed", responseData.message || "❌ Registration failed. Try again.", "error");
            setErrorMessage(responseData.message || "❌ Registration failed. Try again.");
        }
    } catch (error) {
        console.error("❌ Error:", error);
        showAlert("Registration Error", "Something went wrong. Please try again.", "error");
        setErrorMessage("Something went wrong. Please try again.");
    }
};

  

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-lg transition-opacity duration-300 ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
      {/* Animated background elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Animated gradient circles */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gray-900/20 blur-[100px] top-[10%] -left-[200px] animate-pulse"></div>
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gray-800/20 blur-[100px] bottom-[20%] -right-[200px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
        
        {/* Animated lines */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-500/20 to-transparent opacity-30"></div>
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-500/20 to-transparent transform translate-y-[40vh] opacity-30"></div>
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-500/20 to-transparent transform translate-y-[80vh] opacity-30"></div>
        </div>
        
        {/* Animated particles */}
        {[...Array(12)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 rounded-full bg-gray-500/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.2 + Math.random() * 0.5,
              animation: `float${i % 3 + 1} ${8 + Math.random() * 15}s infinite ease-in-out`
            }}
          ></div>
        ))}
      </div>

      <div 
        ref={modalRef}
        className={`max-w-md w-full bg-gradient-to-br from-black to-gray-900/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl shadow-gray-900/50 border border-gray-800/30 relative transition-all duration-500 
        ${animateIn ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}
      >
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-gray-500/30 rounded-tl-2xl"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-gray-500/30 rounded-br-2xl"></div>
        
        {/* Glowing orbs decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gray-500/10 blur-xl"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-gray-600/10 blur-xl"></div>
        
        {/* Close button with animation */}
        <button
          onClick={handleClose}
          className="absolute right-6 top-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-800/50 hover:bg-gray-700/60 transition-all duration-300 hover:rotate-90 transform border border-gray-700/30 group z-10"
          aria-label="Close"
        >
          <X className="h-4 w-4 text-gray-100 group-hover:text-white" />
        </button>
        
        <div className="text-center mb-8 relative">
          <h2 className={`text-2xl font-bold text-white transition-all duration-500 ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {registerType 
              ? `Register as a ${registerType === "user" ? "User" : "Service"}`
              : "How would you like to register?"
            }
            <div className="mt-2 mx-auto w-16 h-1 bg-gradient-to-r from-gray-600 to-gray-400 rounded-full"></div>
          </h2>
        </div>

        {!registerType ? (
          <div className="flex flex-col space-y-6 items-center py-4">
            <Button 
              onClick={() => setRegisterType("user")} 
              className={`relative w-64 h-16 group overflow-hidden bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-600/30 rounded-xl shadow-lg hover:shadow-gray-500/20 transition-all duration-300 ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              style={{ transitionDelay: '100ms' }}
            >
              <div className="absolute inset-0 bg-gray-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 bg-gradient-to-r from-gray-400/20 to-transparent blur-sm"></div>
              
              <div className="relative flex items-center justify-center gap-3 text-lg">
                <User className="w-5 h-5 text-gray-200 group-hover:text-white transition-colors duration-300" />
                <span className="text-gray-100 group-hover:text-white transition-colors duration-300">Register as User</span>
              </div>
              
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-gray-400 to-gray-300 w-0 group-hover:w-full transition-all duration-500"></div>
            </Button>
            
            <Button 
              onClick={() => setRegisterType("service")} 
              className={`relative w-64 h-16 group overflow-hidden bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-600/30 rounded-xl shadow-lg hover:shadow-gray-500/20 transition-all duration-300 ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              style={{ transitionDelay: '200ms' }}
            >
              <div className="absolute inset-0 bg-gray-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 bg-gradient-to-r from-gray-400/20 to-transparent blur-sm"></div>
              
              <div className="relative flex items-center justify-center gap-3 text-lg">
              <Briefcase className="w-5 h-5 text-gray-200 group-hover:text-white transition-colors duration-300" />
                <span className="text-gray-100 group-hover:text-white transition-colors duration-300">Register as Service</span>
              </div>
              
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-gray-400 to-gray-300 w-0 group-hover:w-full transition-all duration-500"></div>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <div className="bg-red-900/30 text-red-100 p-4 rounded-xl text-center font-medium border border-red-500/40 animate-pulse backdrop-blur-sm">
                {errorMessage}
              </div>
            )}
            
            <div className="space-y-4">
              {registerType === "user" ? (
                <>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                      name="username" 
                      placeholder="Username" 
                      value={formData.username} 
                      onChange={handleChange} 
                      className="bg-gray-950/50 border border-gray-700/30 rounded-xl pl-12 py-6 text-gray-100 placeholder:text-gray-400/60 focus:ring-2 focus:ring-gray-500/40 focus:border-gray-600/40"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                      name="fullname" 
                      placeholder="Full Name" 
                      value={formData.fullname} 
                      onChange={handleChange} 
                      className="bg-gray-950/50 border border-gray-700/30 rounded-xl pl-12 py-6 text-gray-100 placeholder:text-gray-400/60 focus:ring-2 focus:ring-gray-500/40 focus:border-gray-600/40"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                      type="email" 
                      name="email" 
                      placeholder="Email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      className="bg-gray-950/50 border border-gray-700/30 rounded-xl pl-12 py-6 text-gray-100 placeholder:text-gray-400/60 focus:ring-2 focus:ring-gray-500/40 focus:border-gray-600/40"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                      type="password" 
                      name="password" 
                      placeholder="Password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      className="bg-gray-950/50 border border-gray-700/30 rounded-xl pl-12 py-6 text-gray-100 placeholder:text-gray-400/60 focus:ring-2 focus:ring-gray-500/40 focus:border-gray-600/40"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                      name="serviceName" 
                      placeholder="Service Name" 
                      value={formData.serviceName} 
                      onChange={handleChange} 
                      className="bg-gray-950/50 border border-gray-700/30 rounded-xl pl-12 py-6 text-gray-100 placeholder:text-gray-400/60 focus:ring-2 focus:ring-gray-500/40 focus:border-gray-600/40"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                      type="email" 
                      name="email" 
                      placeholder="Email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      className="bg-gray-950/50 border border-gray-700/30 rounded-xl pl-12 py-6 text-gray-100 placeholder:text-gray-400/60 focus:ring-2 focus:ring-gray-500/40 focus:border-gray-600/40"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                      type="password" 
                      name="password" 
                      placeholder="Password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      className="bg-gray-950/50 border border-gray-700/30 rounded-xl pl-12 py-6 text-gray-100 placeholder:text-gray-400/60 focus:ring-2 focus:ring-gray-500/40 focus:border-gray-600/40"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Link className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                      name="serviceLink" 
                      placeholder="Service Website URL" 
                      value={formData.serviceLink} 
                      onChange={handleChange} 
                      className="bg-gray-950/50 border border-gray-700/30 rounded-xl pl-12 py-6 text-gray-100 placeholder:text-gray-400/60 focus:ring-2 focus:ring-gray-500/40 focus:border-gray-600/40"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <Textarea 
                      name="description" 
                      placeholder="Service Description" 
                      value={formData.description} 
                      onChange={handleChange} 
                      className="bg-gray-950/50 border border-gray-700/30 rounded-xl pl-12 pt-3 pb-3 min-h-[120px] text-gray-100 placeholder:text-gray-400/60 focus:ring-2 focus:ring-gray-500/40 focus:border-gray-600/40"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-200 flex items-center">
                      <Image className="h-5 w-5 text-gray-400 mr-2" />
                      Upload your logo (rectangle preferred)
                    </label>
                    <div className="flex flex-col items-center">
                      <div className="w-full flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed border-gray-700/50 rounded-xl text-center hover:bg-gray-800/20 transition-all cursor-pointer group">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileChange} 
                          className="hidden" 
                          id="logo-upload" 
                        />
                        <label htmlFor="logo-upload" className="cursor-pointer flex flex-col items-center">
                          <Upload className="w-10 h-10 text-gray-400 group-hover:scale-110 transition-transform" />
                          <span className="mt-2 text-sm text-gray-300 group-hover:text-gray-200 transition-colors">Click to upload</span>
                        </label>
                      </div>
                      {logoPreview && (
                        <div className="mt-4 flex justify-center">
                          <div className="relative w-32 h-24 overflow-hidden rounded-xl border-2 border-gray-700/40 p-1 bg-gray-950/30 shadow-lg shadow-gray-500/10">
                            <img 
                              src={logoPreview} 
                              alt="Logo Preview" 
                              className="object-contain w-full h-full" 
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setLogoPreview(null);
                                setFormData(prev => ({ ...prev, logo: null }));
                              }}
                              className="absolute -top-2 -right-2 bg-red-500/80 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="pt-6 space-y-3">
              <Button 
                type="submit" 
                className="w-full py-6 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 text-white border border-gray-500/30 shadow-lg shadow-gray-600/20 hover:shadow-gray-500/30 group"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Submit
                </span>
              </Button>
              <Button 
                type="button" 
                onClick={() => { resetForm(); handleClose(); }} 
                className="w-full py-6 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-red-600/80 to-red-500/80 hover:from-red-500 hover:to-red-400 text-white border border-red-500/30 group"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  Cancel
                </span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default RegisterPopup;