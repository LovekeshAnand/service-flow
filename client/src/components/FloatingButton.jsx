import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

const FloatingButton = () => {
  const [float, setFloat] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFloat((prev) => (prev === 0 ? 5 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToFeatures = () => {
    setTimeout(() => {
      const featuresSection = document.getElementById("features");
      if (featuresSection) {
        const offset = 100; // Adjust this value to scroll slightly below
        const elementPosition = featuresSection.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: elementPosition - offset, behavior: "smooth" });
      }
    }, 200); // Small delay for smoother navigation
  };

  return (
    <div className="flex justify-center">
      <button
        onClick={scrollToFeatures}
        className="relative bg-green-600 text-white p-5 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300"
        style={{ transform: `translateY(${float}px)`, transition: "transform 0.8s ease-in-out" }}
      >
        <ChevronDown className="w-6 h-6" />
      </button>
    </div>
  );
};

export default FloatingButton;
