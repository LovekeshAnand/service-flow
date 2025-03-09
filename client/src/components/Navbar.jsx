import { useState } from "react";
import RegisterPopup from "./RegisterPopup";

const Navbar = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleRegisterSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <>
      <nav className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-full px-8 py-3 flex items-center gap-8 border border-gray-300 z-50 backdrop-blur-lg">
        <a href="#" className="text-lg font-semibold text-green-700">
          Service Flow
        </a>
        <div className="flex gap-6">
          <a href="#" className="text-gray-700 hover:text-green-600 transition">
            Home
          </a>
          <a href="#" className="text-gray-700 hover:text-green-600 transition">
            About
          </a>
          <a href="#" className="text-gray-700 hover:text-green-600 transition">
            Services
          </a>
          <a href="#" className="text-gray-700 hover:text-green-600 transition">
            Contact
          </a>
        </div>
        <div className="ml-auto flex gap-4">
          {!isLoggedIn ? (
            <>
              <button className="px-5 py-2 text-green-700 border border-green-600 rounded-full bg-white hover:bg-green-100 transition">
                Login
              </button>
              <button
                onClick={() => setIsPopupOpen(true)}
                className="px-5 py-2 text-white bg-green-600 rounded-full hover:bg-green-700 transition"
              >
                Register
              </button>
            </>
          ) : (
            <button className="px-5 py-2 text-white bg-gray-800 rounded-full hover:bg-gray-900 transition">
              Profile
            </button>
          )}
        </div>
      </nav>

      <RegisterPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onRegisterSuccess={handleRegisterSuccess}
      />
    </>
  );
};

export default Navbar;
