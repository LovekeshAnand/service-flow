import React from 'react';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

const Header = ({ 
  serviceName, 
  logo, 
  email,
  serviceLink,
  description 
}) => {
  return (
    <motion.div 
      className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 dark:bg-blue-900/20 rounded-full -mr-32 -mt-32 opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 dark:bg-blue-900/20 rounded-full -ml-16 -mb-16 opacity-20"></div>
      
      <div className="relative z-10 p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <motion.div 
            className="relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-blue-500 shadow-xl flex items-center justify-center bg-white">
              {logo ? (
                <img 
                  src={logo} 
                  alt={`${serviceName} logo`} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="bg-blue-50 w-full h-full flex items-center justify-center">
                  <Package className="h-12 w-12 text-blue-500" />
                </div>
              )}
            </div>
            <motion.div 
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </motion.div>
          </motion.div>
          
          <div className="flex-1 text-center md:text-left">
            <motion.h1 
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              {serviceName}
            </motion.h1>
            
            <motion.div 
              className="mt-4 space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <div className="flex flex-col md:flex-row gap-2 md:gap-6 md:items-center text-sm font-medium text-gray-600 dark:text-gray-300">
                <p className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <span>{email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                  <a 
                    href={serviceLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-500 hover:text-blue-600 hover:underline transition-colors"
                  >
                    {serviceLink.replace(/^https?:\/\//, '')}
                  </a>
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">About</p>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {description || "No description available."}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Header;