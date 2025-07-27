import { useState, useEffect, useRef } from "react";
import { ArrowRight, MessageSquare, Shield, Zap, Server, ChartBar, Users, Tag } from "lucide-react";

const About = () => {
  const [isVisible, setIsVisible] = useState(false);
  const scrollY = useRef(0);
  const aboutRef = useRef(null);
  const howItWorksRef = useRef(null);
  const featuresRef = useRef(null);
  const whyUsRef = useRef(null);
  const futurePlansRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    const handleScroll = () => {
      scrollY.current = window.scrollY;
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const FeatureBox = ({ icon: Icon, title, description, delay = 0 }) => {
    const boxRef = useRef(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(boxRef.current);
          }
        },
        { threshold: 0.2 }
      );

      if (boxRef.current) {
        observer.observe(boxRef.current);
      }

      return () => {
        if (boxRef.current) {
          observer.unobserve(boxRef.current);
        }
      };
    }, []);

    return (
      <div
        ref={boxRef}
        className={`bg-gradient-to-br from-blue-900/30 to-blue-950/40 backdrop-blur-sm p-5 rounded-2xl border border-blue-800/30 transition duration-700 transform group hover:border-blue-600/50 hover:shadow-lg hover:shadow-blue-500/10 ${
          isInView 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-12"
        }`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <div className="p-3 bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl w-12 h-12 flex items-center justify-center mb-3 shadow-lg group-hover:shadow-blue-500/20 transition-all duration-500 group-hover:scale-110">
          <Icon className="text-blue-100 w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-blue-200 leading-relaxed text-sm">{description}</p>
      </div>
    );
  };

  const StepCard = ({ number, title, description, delay = 0 }) => {
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
        className={`flex items-start gap-3 transition duration-700 transform ${
          isInView 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-12"
        }`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-lg font-bold text-white border border-blue-500/50 shadow-lg shadow-blue-900/30">
          {number}
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
          <p className="text-blue-200 leading-relaxed text-sm">{description}</p>
        </div>
      </div>
    );
  };

  const FuturePlanCard = ({ icon: Icon, title, description, delay = 0 }) => {
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
        className={`bg-gradient-to-br from-blue-900/20 to-blue-950/30 backdrop-blur-sm p-5 rounded-2xl border border-blue-800/30 transition duration-700 transform group hover:border-blue-600/50 relative ${
          isInView 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-12"
        }`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <div className="p-2 bg-gradient-to-br from-blue-700 to-blue-900 rounded-xl w-12 h-12 flex items-center justify-center mb-3 shadow-lg group-hover:shadow-blue-500/20 transition-all duration-500 group-hover:scale-110">
          <Icon className="text-blue-100 w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-blue-200 leading-relaxed text-sm">{description}</p>
        <div className="absolute -right-3 -bottom-3 w-24 h-24 bg-blue-500/5 rounded-full blur-xl z-0"></div>
      </div>
    );
  };

  const BenefitItem = ({ title, description, emoji, delay = 0 }) => {
    const itemRef = useRef(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(itemRef.current);
          }
        },
        { threshold: 0.2 }
      );

      if (itemRef.current) {
        observer.observe(itemRef.current);
      }

      return () => {
        if (itemRef.current) {
          observer.unobserve(itemRef.current);
        }
      };
    }, []);

    return (
      <div
        ref={itemRef}
        className={`bg-gradient-to-br from-blue-900/30 to-blue-950/40 backdrop-blur-sm p-5 rounded-2xl border border-blue-800/30 transition duration-700 transform ${
          isInView 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-12"
        }`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <div className="text-2xl mb-3">{emoji}</div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-blue-200 leading-relaxed text-sm">{description}</p>
      </div>
    );
  };

  const ScreenshotCard = ({ title, description, type, image, delay = 0 }) => {
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
        className={`bg-gradient-to-br from-blue-900/30 to-blue-950/40 backdrop-blur-sm rounded-2xl border border-blue-800/30 transition duration-700 transform overflow-hidden group hover:border-blue-600/50 hover:shadow-lg hover:shadow-blue-500/10 ${
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {/* Screenshot Image */}
        <div className="aspect-video bg-blue-900/50 relative overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 to-transparent"></div>
        </div>
  
        {/* Text Content */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
          <p className="text-blue-200 leading-relaxed text-sm">{description}</p>
        </div>
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

      {/* About Section Hero - REDUCED HEIGHT */}
      <div ref={aboutRef} className="relative flex flex-col items-center justify-center min-h-[40vh] text-center z-10 px-4 pt-8">
        <div className={`relative w-full max-w-5xl mx-auto flex flex-col items-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {/* Animated badge */}
          <div className="px-3 py-1 bg-blue-900/30 rounded-full text-blue-200 text-xs font-medium mb-4 border border-blue-800/40 backdrop-blur-sm">
            <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
            About Service Flow
          </div>
          
          {/* Modern animated heading - SMALLER TEXT */}
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight leading-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#5396e3] to-[#9ecbff] block sm:inline">
              Empowering
            </span>{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-white to-blue-200 relative inline-block">
              Businesses
              <div className="absolute h-1 bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-transparent rounded-full transform origin-left transition-transform duration-1000" style={{ transform: isVisible ? 'scaleX(1)' : 'scaleX(0)' }}></div>
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-blue-200/90 max-w-2xl mx-auto font-light leading-relaxed mt-2 mb-6">
            Bridging the gap between service providers and their users through organized, transparent communication.
          </p>
        </div>
      </div>

      <div ref={howItWorksRef} className="py-6 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-8`}>
            <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              How It Works
            </h2>
            <p className="text-blue-200 max-w-2xl mx-auto text-sm">
              A simple four-step process to improve services through user feedback
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <StepCard 
              number="1" 
              title="Businesses Register" 
              description="Service providers create profiles and list their services for users to interact with."
              delay={100}
            />
            <StepCard 
              number="2" 
              title="Users Submit Feedback" 
              description="Users report bugs, suggestions, or issues about specific services they've used."
              delay={200}
            />
            <StepCard 
              number="3" 
              title="Feedback Gets Upvoted" 
              description="Other users can upvote feedback to highlight the most important concerns."
              delay={300}
            />
            <StepCard 
              number="4" 
              title="Businesses Take Action" 
              description="Service providers analyze insights and improve their offerings based on user feedback."
              delay={400}
            />
          </div>
        </div>
      </div>


      <div ref={featuresRef} className="py-12 px-4 relative z-10 bg-blue-950/30">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-8`}>
            <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              Key Features
            </h2>
            <p className="text-blue-200 max-w-2xl mx-auto text-sm">
              Everything you need to gather, analyze, and act on user feedback
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureBox 
              icon={ChartBar} 
              title="Real-time Analytics" 
              description="Businesses get instant data visualization on the most reported issues and user sentiment."
              delay={100}
            />
            <FeatureBox 
              icon={Zap} 
              title="Upvote System" 
              description="Users can upvote issues to indicate urgency and help businesses prioritize improvements."
              delay={200}
            />
            <FeatureBox 
              icon={Server} 
              title="Interactive Dashboard" 
              description="Comprehensive view of feedback trends, metrics, and analytics for data-driven decisions."
              delay={300}
            />
            <FeatureBox 
              icon={Users} 
              title="User Profiles" 
              description="Users can track their submitted feedback, upvotes, and see the status of reported issues."
              delay={400}
            />
            <FeatureBox 
              icon={MessageSquare} 
              title="Sorting & Filtering" 
              description="Organize feedback by date, upvotes, status, or custom categories to find what matters most."
              delay={500}
            />
            <FeatureBox 
              icon={Shield} 
              title="Secure Communication" 
              description="Protected channels between users and businesses with privacy controls and data security."
              delay={600}
            />
          </div>
        </div>
      </div>


      <div ref={whyUsRef} className="py-12 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-8`}>
            <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              Why Use Service Flow?
            </h2>
            <p className="text-blue-200 max-w-2xl mx-auto text-sm">
              Benefits for users, businesses and the entire ecosystem
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BenefitItem 
              emoji="💡" 
              title="For Users" 
              description="Get your concerns heard and help improve the services you use daily. Track the status of your feedback and see real changes."
              delay={100}
            />
            <BenefitItem 
              emoji="🚀" 
              title="For Businesses" 
              description="Identify top issues, improve customer experience, and gain trust through responsive action. Turn feedback into competitive advantage."
              delay={200}
            />
            <BenefitItem 
              emoji="📊" 
              title="For Everyone" 
              description="A structured way to track service improvement through data. Build better products and services through collaboration."
              delay={300}
            />
          </div>
        </div>
      </div>

      {/* Screenshots Section - REDUCED PADDING */}
      <div className="py-12 px-4 relative z-10 bg-blue-950/30">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-8`}>
            <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              Screenshots & Explanations
            </h2>
            <p className="text-blue-200 max-w-2xl mx-auto text-sm">
              See how Service Flow looks in action
            </p>
          </div>
          
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ScreenshotCard 
            title="Dashboard Overview" 
            description="Comprehensive analytics dashboard showing feedback trends, user engagement metrics, and actionable insights at a glance."
            type="Dashboard Screenshot"
            image="/dashboard.png"  
            delay={100}
        />
        <ScreenshotCard 
            title="User Profile Page" 
            description="Personalized profile displaying submitted feedback, upvoted issues, and activity history for both users and businesses."
            type="Profile Screenshot"
            image="/profile.png"  
            delay={200}
        />
</div>

        </div>
      </div>

      {/* Future Plans Section - REDUCED PADDING */}
      <div ref={futurePlansRef} className="py-12 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-8`}>
            <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              Future Plans
            </h2>
            <p className="text-blue-200 max-w-2xl mx-auto text-sm">
              What's next for Service Flow
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FuturePlanCard 
              icon={MessageSquare} 
              title="Verified Business Responses" 
              description="Businesses can officially respond to feedback with updates on implementation status and timeline."
              delay={100}
            />
            <FuturePlanCard 
              icon={Zap} 
              title="Automated Status Updates" 
              description="Users get notified when their feedback is addressed, with real-time status tracking of reported issues."
              delay={200}
            />
            <FuturePlanCard 
              icon={Tag} 
              title="Tagging System" 
              description="Categorize issues based on UI, performance, security, and other relevant aspects for better organization."
              delay={300}
            />
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

export default About;