import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload, Check, Briefcase, Mail, Link, FileText, Lock, Image } from 'lucide-react';
import { toast } from "sonner";

const UpdateServiceModal = ({
  isOpen,
  onClose,
  onUpdate,
  initialData
}) => {
  const [formData, setFormData] = useState({
    serviceName: initialData.serviceName,
    email: initialData.email,
    description: initialData.description,
    serviceLink: initialData.serviceLink,
    newPassword: '',
    currentPassword: '',
  });
  
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(initialData.logo);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
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

  const handleClose = () => {
    // Set animateIn to false to trigger exit animations
    setAnimateIn(false);
    // Delay actual closing to allow exit animations to play
    setTimeout(() => onClose(), 300);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      toast.success("Logo selected");
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.serviceName.trim()) {
      toast.error("Service name is required");
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    
    if (!formData.currentPassword.trim()) {
      toast.error("Current password is required");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const submitData = new FormData();
      submitData.append("serviceName", formData.serviceName);
      submitData.append("email", formData.email);
      submitData.append("description", formData.description);
      submitData.append("serviceLink", formData.serviceLink);
      submitData.append("password", formData.currentPassword);
      
      if (formData.newPassword) {
        submitData.append("newPassword", formData.newPassword);
      }
      
      if (logoFile) {
        submitData.append("logo", logoFile);
      }
      
      await onUpdate(submitData);
      
      // Reset form state
      setIsSubmitting(false);
      handleClose();
      
    } catch (error) {
      setIsSubmitting(false);
      console.error("Update error:", error);
    }
  };
  
  const resetForm = () => {
    setFormData({
      serviceName: initialData.serviceName,
      email: initialData.email,
      description: initialData.description,
      serviceLink: initialData.serviceLink,
      newPassword: '',
      currentPassword: '',
    });
    setLogoFile(null);
    setLogoPreview(initialData.logo);
  };
  
  // Handle clicking the upload button
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
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
            Update Service
            <div className="mt-2 mx-auto w-16 h-1 bg-gradient-to-r from-gray-600 to-gray-400 rounded-full"></div>
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Briefcase className="h-5 w-5 text-gray-400" />
              </div>
              <Input 
                name="serviceName" 
                placeholder="Service Name" 
                value={formData.serviceName} 
                onChange={handleInputChange} 
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
                onChange={handleInputChange} 
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
                onChange={handleInputChange} 
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
                onChange={handleInputChange} 
                className="bg-gray-950/50 border border-gray-700/30 rounded-xl pl-12 pt-3 pb-3 min-h-[120px] text-gray-100 placeholder:text-gray-400/60 focus:ring-2 focus:ring-gray-500/40 focus:border-gray-600/40"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input 
                type="password" 
                name="newPassword" 
                placeholder="New Password (Optional)" 
                value={formData.newPassword} 
                onChange={handleInputChange} 
                className="bg-gray-950/50 border border-gray-700/30 rounded-xl pl-12 py-6 text-gray-100 placeholder:text-gray-400/60 focus:ring-2 focus:ring-gray-500/40 focus:border-gray-600/40"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input 
                type="password" 
                name="currentPassword" 
                placeholder="Current Password (Required)" 
                value={formData.currentPassword} 
                onChange={handleInputChange} 
                className="bg-gray-950/50 border border-gray-700/30 rounded-xl pl-12 py-6 text-gray-100 placeholder:text-gray-400/60 focus:ring-2 focus:ring-gray-500/40 focus:border-gray-600/40"
              />
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-200 flex items-center">
                <Image className="h-5 w-5 text-gray-400 mr-2" />
                Service Logo
              </label>
              <div className="flex flex-col items-center">
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                  id="logo-upload" 
                />
                
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-700/50 flex items-center justify-center bg-gray-900/50">
                    {logoPreview ? (
                      <img 
                      src={logoPreview} 
                      alt="Logo Preview" 
                      className="object-contain w-full h-full" 
                    />
                  ) : (
                    <div className="text-gray-400 flex items-center justify-center">
                      <Image className="h-8 w-8" />
                    </div>
                  )}
                </div>
                
                <div className="w-full flex flex-col items-center px-4 py-3 border-2 border-dashed border-gray-700/50 rounded-xl text-center hover:bg-gray-800/20 transition-all cursor-pointer group"
                  onClick={triggerFileInput}>
                  <Upload className="w-6 h-6 text-gray-400 group-hover:scale-110 transition-transform" />
                  <span className="mt-1 text-sm text-gray-300 group-hover:text-gray-200 transition-colors">Upload new logo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-6 space-y-3">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-6 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 text-white border border-gray-500/30 shadow-lg shadow-gray-600/20 hover:shadow-gray-500/30 group"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-gray-200 border-t-transparent rounded-full animate-spin mr-2"></div>
                Updating...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Check className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Save Changes
              </span>
            )}
          </Button>
          <Button 
            type="button" 
            onClick={() => { resetForm(); handleClose(); }} 
            className="w-full py-6 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-red-600/80 to-red-500/80 hover:from-red-500 hover:to-red-400 text-white border border-red-500/30 group"
          >
            <span className="flex items-center justify-center">
              <X className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              Cancel
            </span>
          </Button>
        </div>
      </form>
    </div>
  </div>
);
};

export default UpdateServiceModal;