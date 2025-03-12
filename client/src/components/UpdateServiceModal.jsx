import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload, Check } from 'lucide-react';
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
      setFormData({
        serviceName: '',
        email: '',
        description: '',
        serviceLink: '',
        newPassword: '',
        currentPassword: '',
      });
      setLogoFile(null);
      setLogoPreview(null);
      
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
  
  // Animation variants
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } }
  };
  
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
        >
          <motion.div 
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Update Service</h2>
                <Button 
                  onClick={onClose} 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Service Name
                  </label>
                  <Input
                    name="serviceName"
                    value={formData.serviceName}
                    onChange={handleInputChange}
                    placeholder="Service name"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email address"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Service Link
                  </label>
                  <Input
                    name="serviceLink"
                    value={formData.serviceLink}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your service"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 min-h-[100px]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password (Optional)
                  </label>
                  <Input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Leave blank to keep current password"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Required to confirm changes"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Logo
                  </label>
                  
                  <div className="flex items-center space-x-4">
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="Logo preview" 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <input 
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    <Button 
                      type="button"
                      onClick={triggerFileInput}
                      className="flex items-center gap-2 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800"
                    >
                      <Upload className="h-4 w-4" />
                      Upload New Logo
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 transition-colors"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Updating...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Check className="h-4 w-4" />
                        Save Changes
                      </span>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={() => {
                      resetForm();
                      onClose();
                    }}
                    variant="outline"
                    className="flex-1 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl py-2"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdateServiceModal