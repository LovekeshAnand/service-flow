import SplitText from "../components/SplitText";
import MagneticButton from "../components/MagneticButton";
import FeaturesSection from "../components/FeaturesSection";
import Testimonials from "../components/Testimonials";

const Home = () => {
    return (
      <div className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white relative">
        {/* Hero Section */}
        <div className="relative flex flex-col items-center justify-center min-h-screen text-center z-10">
          <SplitText
            text="Welcome to Service Flow"
            className="text-7xl font-extrabold text-green-700 dark:text-green-500"
          />
          <p className="mt-4 text-2xl text-gray-600 dark:text-gray-300">
            Your one-stop solution for seamless service management.
          </p>
          <div className="mt-8">
            <MagneticButton text="Get Started" />
          </div>
        </div>
  
        {/* Feature Cards */}
        <FeaturesSection />
  
        {/* Testimonials Section */}
        <Testimonials />
      </div>
    );
  };
  
export default Home;
