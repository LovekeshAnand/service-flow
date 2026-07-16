import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Mail, Lock, Eye, EyeOff, User, Briefcase, Link as LinkIcon, FileText, Upload, X, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated, user } = useAuth();
  
  const [registerType, setRegisterType] = useState("user"); // "user" or "service"
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    email: "",
    password: "",
    serviceName: "",
    description: "",
    serviceLink: "",
    logo: null,
  });
  
  const [logoPreview, setLogoPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMsg) setErrorMsg("");
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, logo: file }));
      setLogoPreview(URL.createObjectURL(file));
      if (errorMsg) setErrorMsg("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const dataToSend = new FormData();

    if (registerType === "user") {
      if (!formData.username.trim() || !formData.fullname.trim() || !formData.email.trim() || !formData.password) {
        setErrorMsg("All fields are required.");
        return;
      }
      dataToSend.append("username", formData.username.trim());
      dataToSend.append("fullname", formData.fullname.trim());
      dataToSend.append("email", formData.email.trim());
      dataToSend.append("password", formData.password);
    } else {
      if (!formData.serviceName.trim() || !formData.email.trim() || !formData.password || !formData.description.trim() || !formData.serviceLink.trim()) {
        setErrorMsg("All fields are required.");
        return;
      }
      if (!formData.logo) {
        setErrorMsg("Please upload a logo.");
        return;
      }
      dataToSend.append("serviceName", formData.serviceName.trim());
      dataToSend.append("email", formData.email.trim());
      dataToSend.append("password", formData.password);
      dataToSend.append("description", formData.description.trim());
      dataToSend.append("serviceLink", formData.serviceLink.trim());
      dataToSend.append("logo", formData.logo);
    }

    setLoading(true);

    try {
      // In useAuth, register receives the formData/object and send it.
      // If user, we can pass standard JSON object.
      // Let's pass the dataToSend object directly. For users, we can just pass the formData object or dataToSend.
      // Wait, let's verify if register supports FormData.
      // In useAuth, register has: const response = await axios.post(`${API_BASE_URL}${endpoint}`, formData, { headers });
      // So yes! It passes the object directly.
      const payload = registerType === "user" ? {
        username: formData.username.trim(),
        fullname: formData.fullname.trim(),
        email: formData.email.trim(),
        password: formData.password
      } : dataToSend;

      const result = await register(payload, registerType);

      if (result.success) {
        toast.success(`Account registered successfully! Welcome, ${result.user?.fullname || result.user?.serviceName}!`);
        const from = location.state?.from?.pathname || (registerType === "service" ? `/services/${result.user?._id || result.user?.id}/dashboard` : "/");
        navigate(from, { replace: true });
      } else {
        setErrorMsg(result.error || "Registration failed. Please check details.");
        toast.error(result.error || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#061426] to-[#0a2341] relative overflow-hidden px-4 py-16">
      {/* Background decoration elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-[#0a4b8c]/20 blur-[120px] -top-[10%] -left-[200px] animate-pulse"></div>
        <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-[120px] bottom-[10%] -right-[200px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg bg-gradient-to-br from-blue-950/40 to-black/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-blue-800/30 relative z-10"
      >
        {/* Glow effect at borders */}
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-blue-500/20 via-transparent to-blue-300/10 opacity-50 blur-sm pointer-events-none"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            Create Account
          </h1>
          <p className="text-blue-300/70 mt-2 text-sm">
            Join Service Flow to submit issues, give feedback, or manage services.
          </p>
        </div>

        {/* Sliding Segment Toggle */}
        <div className="relative flex p-1 bg-blue-950/60 rounded-xl mb-6 border border-blue-900/50">
          <div 
            className="absolute top-1 bottom-1 rounded-lg bg-blue-600 shadow-md transition-all duration-300 ease-out"
            style={{
              left: registerType === "user" ? "4px" : "50%",
              width: "calc(50% - 8px)"
            }}
          />
          <button
            type="button"
            onClick={() => { setRegisterType("user"); setErrorMsg(""); }}
            className={`w-1/2 py-2.5 text-sm font-semibold rounded-lg z-10 transition-colors duration-300 flex items-center justify-center gap-2 ${
              registerType === "user" ? "text-white" : "text-blue-300/60 hover:text-blue-200"
            }`}
          >
            <User size={16} />
            User Registration
          </button>
          <button
            type="button"
            onClick={() => { setRegisterType("service"); setErrorMsg(""); }}
            className={`w-1/2 py-2.5 text-sm font-semibold rounded-lg z-10 transition-colors duration-300 flex items-center justify-center gap-2 ${
              registerType === "service" ? "text-white" : "text-blue-300/60 hover:text-blue-200"
            }`}
          >
            <Briefcase size={16} />
            Service Partner
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={registerType}
            initial={{ opacity: 0, x: registerType === "user" ? -15 : 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: registerType === "user" ? 15 : -15 }}
            transition={{ duration: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-900/30 text-red-200 p-4 rounded-xl border border-red-500/30 flex items-start gap-3 backdrop-blur-sm text-sm"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              <div className="space-y-4">
                {registerType === "user" ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-blue-200 uppercase tracking-wider pl-1">
                        Username
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-blue-400/70" />
                        </div>
                        <Input
                          name="username"
                          placeholder="johndoe"
                          value={formData.username}
                          onChange={handleChange}
                          className="bg-black/40 border border-blue-900/50 rounded-xl pl-11 py-5 text-white placeholder:text-blue-200/30 focus:ring-2 focus:ring-blue-500/40"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-blue-200 uppercase tracking-wider pl-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-blue-400/70" />
                        </div>
                        <Input
                          name="fullname"
                          placeholder="John Doe"
                          value={formData.fullname}
                          onChange={handleChange}
                          className="bg-black/40 border border-blue-900/50 rounded-xl pl-11 py-5 text-white placeholder:text-blue-200/30 focus:ring-2 focus:ring-blue-500/40"
                          required
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-blue-200 uppercase tracking-wider pl-1">
                        Service Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Briefcase className="h-5 w-5 text-blue-400/70" />
                        </div>
                        <Input
                          name="serviceName"
                          placeholder="My Cloud Service"
                          value={formData.serviceName}
                          onChange={handleChange}
                          className="bg-black/40 border border-blue-900/50 rounded-xl pl-11 py-5 text-white placeholder:text-blue-200/30 focus:ring-2 focus:ring-blue-500/40"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-blue-200 uppercase tracking-wider pl-1">
                        Service Website Link
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <LinkIcon className="h-5 w-5 text-blue-400/70" />
                        </div>
                        <Input
                          name="serviceLink"
                          placeholder="https://example.com"
                          value={formData.serviceLink}
                          onChange={handleChange}
                          className="bg-black/40 border border-blue-900/50 rounded-xl pl-11 py-5 text-white placeholder:text-blue-200/30 focus:ring-2 focus:ring-blue-500/40"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-blue-200 uppercase tracking-wider pl-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-blue-400/70" />
                    </div>
                    <Input
                      type="email"
                      name="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-black/40 border border-blue-900/50 rounded-xl pl-11 py-5 text-white placeholder:text-blue-200/30 focus:ring-2 focus:ring-blue-500/40"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-blue-200 uppercase tracking-wider pl-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-blue-400/70" />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="bg-black/40 border border-blue-900/50 rounded-xl pl-11 pr-11 py-5 text-white placeholder:text-blue-200/30 focus:ring-2 focus:ring-blue-500/40"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-blue-400/60 hover:text-blue-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {registerType === "service" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-blue-200 uppercase tracking-wider pl-1">
                        Service Description
                      </label>
                      <div className="relative">
                        <div className="absolute top-3 left-0 pl-3.5 flex items-start pointer-events-none">
                          <FileText className="h-5 w-5 text-blue-400/70" />
                        </div>
                        <Textarea
                          name="description"
                          placeholder="Describe the utility or services offered..."
                          value={formData.description}
                          onChange={handleChange}
                          className="bg-black/40 border border-blue-900/50 rounded-xl pl-11 pt-3 pb-3 min-h-[90px] text-white placeholder:text-blue-200/30 focus:ring-2 focus:ring-blue-500/40"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-blue-200 uppercase tracking-wider pl-1 block">
                        Service Logo Logo
                      </label>
                      
                      <div className="flex flex-col items-center">
                        <div className="w-full relative flex flex-col items-center justify-center p-5 border-2 border-dashed border-blue-900/50 rounded-xl hover:bg-blue-950/10 cursor-pointer group transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <Upload className="w-9 h-9 text-blue-400 group-hover:scale-110 transition-transform mb-2" />
                          <span className="text-sm text-blue-200">
                            {formData.logo ? formData.logo.name : "Click or Drag to Upload Logo"}
                          </span>
                          <span className="text-xs text-blue-300/40 mt-1">PNG, JPG, SVG up to 2MB</span>
                        </div>

                        {logoPreview && (
                          <div className="mt-4 relative w-28 h-20 overflow-hidden rounded-xl border border-blue-800/40 p-1 bg-black/40 shadow-lg">
                            <img
                              src={logoPreview}
                              alt="Logo Preview"
                              className="object-contain w-full h-full"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setLogoPreview(null);
                                setFormData((prev) => ({ ...prev, logo: null }));
                              }}
                              className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 transition-colors z-20"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-6 rounded-xl font-bold transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white border border-blue-500/30 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center justify-center gap-2 mt-6 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 text-center pt-5 border-t border-blue-900/30">
          <p className="text-sm text-blue-300/60">
            Already have an account?{" "}
            <Link to="/login" state={location.state} className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
