import React from "react";
import { Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative bg-background text-foreground overflow-hidden">
      {/* Animated background elements - matching the home page */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Animated gradient circles */}
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[#0a4b8c]/10 blur-[80px] bottom-[10%] -left-[200px] animate-pulse"></div>
        <div className="absolute w-[300px] h-[300px] rounded-full bg-[#2a6baf]/10 blur-[60px] top-[20%] -right-[150px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
        
        {/* Animated lines */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
        
        {/* Animated particles */}
        {[...Array(8)].map((_, i) => (
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Column 1: About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 group">
            <img 
                src="/logo.png"  // Replace with your actual logo filename
                alt="Service Flow Logo"
                className="w-10 h-10 object-contain"
              />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#5396e3] to-[#9ecbff]">
                Service Flow
              </span>
            </div>
            <p className="text-blue-200/80">
              Your complete platform for seamless service management and delivery. Automate, optimize, and grow.
            </p>
          </div>
          
          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#5396e3] to-[#9ecbff]">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="h-[1px] w-0 bg-blue-400 mr-0 group-hover:w-5 group-hover:mr-2 transition-all duration-300"></span>
                  Home
                </Link>
              </li>
              <li>
                <a href="/about" className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="h-[1px] w-0 bg-blue-400 mr-0 group-hover:w-5 group-hover:mr-2 transition-all duration-300"></span>
                  About
                </a>
              </li>
              <li>
                <Link to="/services" className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="h-[1px] w-0 bg-blue-400 mr-0 group-hover:w-5 group-hover:mr-2 transition-all duration-300"></span>
                  Services
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Social Media */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#5396e3] to-[#9ecbff]">
              Connect With Us
            </h3>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-[#0a4b8c]/20 flex items-center justify-center border border-[#5396e3]/30 hover:border-[#5396e3]/50 hover:bg-[#0a4b8c]/30 hover:shadow-md hover:shadow-blue-500/20 transition-all duration-300"
                aria-label="Twitter"
              >
                <Twitter size={20} className="text-blue-200" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-[#0a4b8c]/20 flex items-center justify-center border border-[#5396e3]/30 hover:border-[#5396e3]/50 hover:bg-[#0a4b8c]/30 hover:shadow-md hover:shadow-blue-500/20 transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram size={20} className="text-blue-200" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-[#0a4b8c]/20 flex items-center justify-center border border-[#5396e3]/30 hover:border-[#5396e3]/50 hover:bg-[#0a4b8c]/30 hover:shadow-md hover:shadow-blue-500/20 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} className="text-blue-200" />
              </a>
            </div>
            <div className="pt-4">
              <a 
                href="lovekeshanand6@gmail.com" 
                className="text-blue-200 hover:text-white transition-colors duration-300"
              >
                lovekeshanand6@gmail.com
              </a>
            </div>
          </div>
        </div>
        
        {/* Call to action - matching the home page style */}
        <div className="mt-16 pt-8 pb-2 border-t border-blue-900/30">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#5396e3] to-[#9ecbff]">
              Ready to Streamline Your Services?
            </h3>
            <p className="text-blue-200/80 max-w-2xl mx-auto">
              Join thousands of businesses that trust Service Flow for their service management needs.
            </p>
          </div>
        </div>
        
        {/* Copyright section */}
        <div className="mt-16 pt-8 border-t border-blue-900/30 flex flex-col items-center justify-center text-center">
          <p className="text-blue-200/70">
            © {currentYear} Service Flow. All rights reserved.
          </p>
        </div>

      </div>
      
      {/* CSS animations for particles - matching the home page */}
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
    </footer>
  );
};

export default Footer;