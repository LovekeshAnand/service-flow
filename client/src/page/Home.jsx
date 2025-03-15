import { useState, useEffect, useRef } from "react";
import { ArrowRight, ChevronDown, MessageSquare, Shield, Zap, Server, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";


const Home = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const scrollY = useRef(0);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);
  const partnersRef = useRef(null);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    const handleScroll = () => {
      scrollY.current = window.scrollY;
      
      // Calculate scroll progress for the video container
      if (containerRef.current) {
        const { top, height } = containerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Calculate progress as the container moves through the viewport
        let progress = 0;
        if (top < windowHeight) {
          // Start when the top of the container enters the viewport
          progress = Math.min(1, Math.max(0, 1 - (top / windowHeight)));
        }
        setScrollProgress(progress);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  // Modern animated feature card component
  const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => {
    const cardRef = useRef(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(cardRef.current);
          }
        },
        { threshold: 0.2 }
      );

      if (cardRef.current) {
        observer.observe(cardRef.current);
      }

      return () => {
        if (cardRef.current) {
          observer.unobserve(cardRef.current);
        }
      };
    }, []);

    return (
      <div
        ref={cardRef}
        className={`bg-gradient-to-br from-blue-900/30 to-blue-950/40 backdrop-blur-sm p-6 rounded-2xl border border-blue-800/30 transition duration-700 transform group hover:border-blue-600/50 hover:shadow-lg hover:shadow-blue-500/10 ${
          isInView 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-12"
        }`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <div className="p-3 bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl w-14 h-14 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-blue-500/20 transition-all duration-500 group-hover:scale-110">
          <Icon className="text-blue-100 w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-blue-200 leading-relaxed">{description}</p>
      </div>
    );
  };

  // Modern testimonial card component
  const TestimonialCard = ({ name, role, content, rating, delay = 0 }) => {
    const cardRef = useRef(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(cardRef.current);
          }
        },
        { threshold: 0.2 }
      );

      if (cardRef.current) {
        observer.observe(cardRef.current);
      }

      return () => {
        if (cardRef.current) {
          observer.unobserve(cardRef.current);
        }
      };
    }, []);

    return (
      <div
        ref={cardRef}
        className={`bg-gradient-to-br from-blue-900/20 to-blue-950/30 backdrop-blur-sm p-6 rounded-2xl border border-blue-800/30 transition duration-700 transform group hover:border-blue-600/50 relative ${
          isInView 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-12"
        }`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <div className="flex items-center mb-2">
          {[...Array(rating)].map((_, i) => (
            <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#60a5fa" stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
        </div>
        <p className="text-blue-100 italic leading-relaxed mb-6">{content}</p>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-800 to-blue-700 flex items-center justify-center text-xl font-bold text-white">
            {name.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-white">{name}</h4>
            <p className="text-blue-300 text-sm">{role}</p>
          </div>
        </div>
        <div className="absolute -right-3 -bottom-3 w-24 h-24 bg-blue-500/5 rounded-full blur-xl z-0"></div>
      </div>
    );
  };

  // Partner logo component
  const PartnerLogo = ({ name, delay = 0 }) => {
    const logoRef = useRef(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(logoRef.current);
          }
        },
        { threshold: 0.2 }
      );

      if (logoRef.current) {
        observer.observe(logoRef.current);
      }

      return () => {
        if (logoRef.current) {
          observer.unobserve(logoRef.current);
        }
      };
    }, []);

    return (
      <div
        ref={logoRef}
        className={`bg-gradient-to-br from-blue-900/10 to-blue-950/20 backdrop-blur-sm p-4 rounded-xl border border-blue-800/20 flex items-center justify-center h-20 transition duration-500 hover:border-blue-600/40 hover:shadow-blue-500/10 ${
          isInView 
            ? "opacity-100 scale-100" 
            : "opacity-0 scale-90"
        }`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <span className="text-blue-100 font-medium">{name}</span>
      </div>
    );
  };

  return (
    <div className="w-full bg-background text-foreground relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Animated gradient circles */}
        <div className="absolute w-[600px] h-[600px] rounded-full bg-[#0a4b8c]/10 blur-[100px] top-[10%] -left-[300px] animate-pulse"></div>
        <div className="absolute w-[600px] h-[600px] rounded-full bg-[#2a6baf]/10 blur-[100px] bottom-[20%] -right-[300px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[#5396e3]/5 blur-[80px] top-[60%] left-[30%] animate-pulse" style={{ animationDuration: '12s' }}></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
        
        {/* Animated lines */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent transform translate-y-[20vh] opacity-30" style={{ transform: `translateY(${20 + scrollY.current * 0.5}vh)` }}></div>
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent transform translate-y-[40vh] opacity-30" style={{ transform: `translateY(${40 + scrollY.current * 0.3}vh)` }}></div>
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent transform translate-y-[60vh] opacity-30" style={{ transform: `translateY(${60 + scrollY.current * 0.2}vh)` }}></div>
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent transform translate-y-[80vh] opacity-30" style={{ transform: `translateY(${80 + scrollY.current * 0.1}vh)` }}></div>
        </div>
        
        {/* Animated particles */}
        {[...Array(20)].map((_, i) => (
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

      {/* Hero Section - moved upwards */}
      <div ref={heroRef} className="relative flex flex-col items-center justify-center min-h-[80vh] text-center z-10 px-4 pt-12">
        <div className={`relative w-full max-w-5xl mx-auto flex flex-col items-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {/* Animated badge */}
          <div className="px-4 py-2 bg-blue-900/30 rounded-full text-blue-200 text-sm font-medium mb-8 border border-blue-800/40 backdrop-blur-sm">
            <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
            Join service Flow today!
          </div>
          
          {/* Modern animated heading */}
          <h1 className="text-5xl sm:text-7xl font-bold mb-6 tracking-tight leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#5396e3] to-[#9ecbff] block sm:inline">
              Streamline
            </span>{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-white to-blue-200 relative inline-block">
              Your Services
              <div className="absolute h-1 bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-transparent rounded-full transform origin-left transition-transform duration-1000" style={{ transform: isVisible ? 'scaleX(1)' : 'scaleX(0)' }}></div>
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-blue-200/90 max-w-2xl mx-auto font-light leading-relaxed mt-4 mb-8">
            Your complete platform for seamless service management and delivery. Automate, optimize, and grow.
          </p>

          {/* Single centered CTA button */}
          <div className="flex items-center justify-center mt-6">
            <button className="px-8 py-4 bg-gradient-to-r from-[#0a4b8c] to-[#0a2c54] rounded-xl text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#5396e3]/30 group flex items-center gap-2 relative overflow-hidden"
            onClick={() => navigate("/services")}
            >
              <span className="relative z-10">Get Started</span>
              <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1a5b9c] to-[#1a3c64] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-blue-500/50 to-blue-300/50 opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </div>

 {/* Video Container with Scroll Animation - UPDATED */}
 <div 
        ref={containerRef} 
        className="relative z-10 w-full max-w-6xl mx-auto my-24 px-4"
      >
        <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900/30 to-blue-950/40 backdrop-blur-sm border border-blue-800/30 shadow-xl"
          style={{
            transform: `scale(${0.8 + (0.2 * scrollProgress)})`,
            opacity: 0.3 + (0.7 * scrollProgress)
          }}
        >
          {/* Video element - UPDATED to fix brightness */}
          <div className="aspect-video relative">
            <video 
              ref={videoRef}
              className="w-full h-full object-cover brightness-110" 
              poster="/hq720.jpg" 
              muted
            >
              <source src="/2025-03-08 11-53-21.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Video controls - UPDATED with LARGER icons */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={togglePlay} 
                  className="w-14 h-14 rounded-full bg-blue-600/90 backdrop-blur-sm flex items-center justify-center text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/50 border border-blue-400/30"
                >
                  {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                </button>
                <button 
                  onClick={toggleMute} 
                  className="w-14 h-14 rounded-full bg-blue-600/90 backdrop-blur-sm flex items-center justify-center text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/50 border border-blue-400/30"
                >
                  {isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
                </button>
              </div>
              <div className="text-white text-sm font-medium px-4 py-2 bg-blue-600/90 backdrop-blur-sm rounded-md shadow-lg shadow-blue-900/50 border border-blue-400/30">
                Service Flow Demo
              </div>
            </div>

            {/* Updated gradient overlay - lighter to improve visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/30 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div ref={featuresRef} className="py-24 px-4 relative z-10" id="features">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16`}>
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              Powerful Features
            </h2>
            <p className="text-blue-200 max-w-2xl mx-auto">
              Everything you need to streamline your services and delight your customers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Zap} 
              title="Instant Deployment" 
              description="Deploy your services in minutes with our intuitive platform. No technical skills required."
              delay={100}
            />
            <FeatureCard 
              icon={Shield} 
              title="Enterprise Security" 
              description="Bank-grade security with advanced encryption and compliance with industry standards."
              delay={200}
            />
            <FeatureCard 
              icon={Server} 
              title="Scalable Infrastructure" 
              description="Grow your business without limits. Our infrastructure scales with your needs."
              delay={300}
            />
            <FeatureCard 
              icon={MessageSquare} 
              title="24/7 Support" 
              description="Our dedicated team is always ready to help you with any questions or issues."
              delay={400}
            />
            <FeatureCard 
              icon={Zap} 
              title="User Management" 
              description="Easily manage user access and permissions across your organization."
              delay={500}
            />
            <FeatureCard 
              icon={Shield} 
              title="Workflow Automation" 
              description="Automate repetitive tasks and focus on what matters most to your business."
              delay={600}
            />
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div ref={testimonialsRef} className="py-24 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16`}>
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              What Our Clients Say
            </h2>
            <p className="text-blue-200 max-w-2xl mx-auto">
              Don't take our word for it. See what our customers have to say about our platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard 
              name="Sarah Johnson" 
              role="CEO, TechCorp" 
              content="Service Flow has completely transformed how we deliver services to our clients. The automation alone has saved us countless hours every month."
              rating={5}
              delay={100}
            />
            <TestimonialCard 
              name="Michael Chen" 
              role="Director, GrowthLabs" 
              content="The scalability of Service Flow is impressive. As our business grew rapidly, the platform adapted seamlessly to our changing needs."
              rating={5}
              delay={200}
            />
            <TestimonialCard 
              name="Emma Davis" 
              role="Operations Manager, FutureServe" 
              content="Customer satisfaction has increased by 35% since we started using Service Flow. The streamlined processes make all the difference."
              rating={4}
              delay={300}
            />
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div ref={partnersRef} className="py-24 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16`}>
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              Our Partners
            </h2>
            <p className="text-blue-200 max-w-2xl mx-auto">
              We collaborate with industry leaders to provide you with the best service possible.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {["TechCorp", "GrowthLabs", "FutureServe", "InnovateCo", "NextLevel", "EvoSystems"].map((partner, index) => (
              <PartnerLogo 
                key={index}
                name={partner}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CSS animations for particles */}
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
    </div>
  );
};

export default Home;