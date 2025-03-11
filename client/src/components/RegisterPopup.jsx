import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useAlert } from "../components/AlertProvider"; // Import the custom alert hook

const RegisterPopup = ({ isOpen, onClose, onRegisterSuccess, setUser }) => {
  const { showAlert } = useAlert(); // Use the custom alert hook
  const [registerType, setRegisterType] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    email: "",
    password: "",
    serviceName: "",
    description: "",
    serviceLink: "", // Added serviceLink field
    logo: null,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const modalRef = useRef(null);

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
        onClose();
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
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  const resetForm = () => {
    setRegisterType(null);
    setFormData({
      username: "",
      fullname: "",
      email: "",
      password: "",
      serviceName: "",
      description: "",
      serviceLink: "", // Reset serviceLink field
      logo: null,
    });
    setLogoPreview(null);
    setErrorMessage("");
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, logo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
  
    const API_BASE = "http://localhost:8000/api/v1";
    const registerUrl =
      registerType === "user"
        ? `${API_BASE}/users/register`
        : `${API_BASE}/services/register`;
  
    const formDataToSend = new FormData();
  
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
      formDataToSend.append("serviceLink", formData.serviceLink.trim()); // Append serviceLink to FormData
  
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
      });
  
      const responseData = await response.json();
  
      if (response.ok && responseData.data) {
        // Handle different response structures for user and service registration
        let userData;
        const accessToken = responseData.data.accessToken;
        
        if (registerType === "user") {
          userData = responseData.data.user;
        } else {
          userData = responseData.data.service;
          // For services, add isService flag if it doesn't exist
          if (userData) {
            userData.isService = true;
          }
        }
        
        // Verify we have user data before proceeding
        if (!userData) {
          console.error("No user/service data in response:", responseData);
          setErrorMessage("Registration successful but user data is missing.");
          return;
        }
  
        if (accessToken) {
          localStorage.setItem("token", accessToken);
        }
        
        // Store in localStorage
        localStorage.setItem("profile", JSON.stringify(userData));
        
        console.log("Successfully registered as:", registerType);
        console.log("User data:", userData);
  
        // Call both callbacks with the user data
        if (setUser) {
          setUser(userData); // Update state immediately in Navbar
        }
        
        if (onRegisterSuccess) {
          onRegisterSuccess(userData); // Pass the user data to the callback
        }
        
        // Replace alert with custom alert
        showAlert("Registration Successful", "🎉 Your account has been created successfully!", "success");
        
        resetForm();
        onClose();
      } else {
        // Show error in custom alert instead of in the form
        showAlert("Registration Failed", responseData.message || "❌ Registration failed. Try again.", "error");
        setErrorMessage(responseData.message || "❌ Registration failed. Try again.");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      // Show network error in custom alert
      showAlert("Registration Error", "Something went wrong. Please try again.", "error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };
  
  const inputClasses = "rounded-2xl px-4 py-3 w-full border-2 border-green-100 focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 outline-none";
  const buttonClasses = "w-full rounded-2xl py-3 font-medium transition-all duration-200 transform hover:scale-[1.02] focus:scale-[0.98]";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="max-w-md w-full p-6 rounded-3xl shadow-2xl bg-white relative animate-fadeIn"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Improved close button with animation */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-green-50 hover:bg-green-100 transition-colors duration-200 hover:rotate-90 transform"
          aria-label="Close"
        >
          <X className="h-4 w-4 text-green-700" />
        </button>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-green-700 relative">
            {registerType 
              ? `Register as a ${registerType === "user" ? "User" : "Service"}`
              : "Register As"
            }
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-green-500 rounded-full"></div>
          </h2>
        </div>

        {!registerType ? (
          <div className="flex flex-col space-y-4 items-center py-4">
            <Button 
              onClick={() => setRegisterType("user")} 
              className={`${buttonClasses} max-w-xs group`}
              style={{ backgroundColor: "#16a34a", color: "white" }}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-white transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Register as User
              </div>
            </Button>
            <Button 
              onClick={() => setRegisterType("service")} 
              className={`${buttonClasses} max-w-xs group`}
              style={{ backgroundColor: "#16a34a", color: "white" }}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-white transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                Register as Service
              </div>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <div className="bg-red-50 text-red-500 p-3 rounded-2xl text-center font-semibold border-l-4 border-red-500 animate-pulse">
                {errorMessage}
              </div>
            )}
            
            <div className="space-y-4">
              {registerType === "user" ? (
                <>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <Input 
                      name="username" 
                      placeholder="Username" 
                      value={formData.username} 
                      onChange={handleChange} 
                      className={`${inputClasses} pl-10`}
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <Input 
                      name="fullname" 
                      placeholder="Full Name" 
                      value={formData.fullname} 
                      onChange={handleChange} 
                      className={`${inputClasses} pl-10`}
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <Input 
                      type="email" 
                      name="email" 
                      placeholder="Email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      className={`${inputClasses} pl-10`}
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                    </div>
                    <Input 
                      type="password" 
                      name="password" 
                      placeholder="Password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      className={`${inputClasses} pl-10`}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <Input 
                      name="serviceName" 
                      placeholder="Service Name" 
                      value={formData.serviceName} 
                      onChange={handleChange} 
                      className={`${inputClasses} pl-10`}
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <Input 
                      type="email" 
                      name="email" 
                      placeholder="Email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      className={`${inputClasses} pl-10`}
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                    </div>
                    <Input 
                      type="password" 
                      name="password" 
                      placeholder="Password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      className={`${inputClasses} pl-10`}
                    />
                  </div>
                  {/* Added Service Link input field */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                      </svg>
                    </div>
                    <Input 
                      name="serviceLink" 
                      placeholder="Service Website URL" 
                      value={formData.serviceLink} 
                      onChange={handleChange} 
                      className={`${inputClasses} pl-10`}
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                      <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <Textarea 
                      name="description" 
                      placeholder="Service Description" 
                      value={formData.description} 
                      onChange={handleChange} 
                      className={`${inputClasses} pl-10 min-h-[100px]`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      Upload your logo (rectangle preferred)
                    </label>
                    <div className="flex flex-col items-center">
                      <div className="w-full flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed border-green-200 rounded-2xl text-center hover:bg-green-50 transition-all cursor-pointer group">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileChange} 
                          className="hidden" 
                          id="logo-upload" 
                        />
                        <label htmlFor="logo-upload" className="cursor-pointer flex flex-col items-center">
                          <svg className="w-10 h-10 text-green-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                          </svg>
                          <span className="mt-2 text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Click to upload</span>
                        </label>
                      </div>
                      {logoPreview && (
                        <div className="mt-3 flex justify-center">
                          <div className="relative w-32 h-24 overflow-hidden rounded-xl border-2 border-green-200 p-1 shadow-sm">
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
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
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
            
            <div className="pt-4 space-y-3">
              <Button 
                type="submit" 
                className={`${buttonClasses} group`}
                style={{ backgroundColor: "#16a34a", color: "white" }}
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
                onClick={() => { resetForm(); onClose(); }} 
                className={`${buttonClasses} group`}
                style={{ backgroundColor: "#ef4444", color: "white" }}
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
};

export default RegisterPopup;