import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white py-10">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Column 1: About */}
        <div>
          <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">Service Flow</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Simplifying service management with seamless workflows.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-300">Quick Links</h3>
          <ul className="mt-2 space-y-2">
            <li><a href="#" className="hover:text-green-600 dark:hover:text-green-400">Home</a></li>
            <li><a href="#" className="hover:text-green-600 dark:hover:text-green-400">About</a></li>
            <li><a href="#" className="hover:text-green-600 dark:hover:text-green-400">Services</a></li>
            <li><a href="#" className="hover:text-green-600 dark:hover:text-green-400">Contact</a></li>
          </ul>
        </div>

        {/* Column 3: Social Media */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-300">Follow Us</h3>
          <div className="mt-2 flex gap-4">
            <a href="#" className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-green-500 dark:hover:bg-green-400 transition">
              <Facebook size={20} className="text-gray-800 dark:text-white" />
            </a>
            <a href="#" className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-green-500 dark:hover:bg-green-400 transition">
              <Twitter size={20} className="text-gray-800 dark:text-white" />
            </a>
            <a href="#" className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-green-500 dark:hover:bg-green-400 transition">
              <Instagram size={20} className="text-gray-800 dark:text-white" />
            </a>
            <a href="#" className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-green-500 dark:hover:bg-green-400 transition">
              <Linkedin size={20} className="text-gray-800 dark:text-white" />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="text-center text-gray-600 dark:text-gray-400 mt-6 border-t border-gray-300 dark:border-gray-700 pt-4">
        © {new Date().getFullYear()} Service Flow. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
