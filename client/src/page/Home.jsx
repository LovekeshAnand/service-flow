import SplitText from "../components/SplitText";
import MagneticButton from "../components/MagneticButton";
import FeaturesSection from "../components/FeaturesSection";
import Testimonials from "../components/Testimonials";
import FloatingButton from "../components/FloatingButton";

const Home = () => {
    return (
      <div className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white relative">
        {/* Hero Section */}
        <div className="relative flex flex-col items-center justify-center min-h-screen text-center z-10">
          <div className="relative w-full flex flex-col items-center">
            <div className="relative z-10 mt-30">
              <SplitText
                text="Welcome to Service Flow"
                className="text-7xl font-extrabold text-green-700 dark:text-green-500"
              />
              <p className="mt-4 text-2xl text-gray-600 dark:text-gray-300">
                Your one-stop solution for seamless service management.
              </p>
              <div className="mt-8">
                <MagneticButton text="Get Started" />
                  <div className="mt-20 flex justify-center">
                    <FloatingButton />
                  </div>
              </div>
            </div>
          </div>
        </div>
        {/* Floating Button Positioned Below MagneticButton with Proper Spacing */}
        
  
        {/* Feature Cards */}
        <div className="mt-32" id="features">
          <FeaturesSection />
        </div>
  
        {/* Testimonials Section */}
        <Testimonials />
      </div>
    );
  };
  
export default Home;