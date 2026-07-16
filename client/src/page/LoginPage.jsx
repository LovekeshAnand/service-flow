import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();
  
  const [formData, setFormData] = useState({ email: "", password: "" });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password) {
      setErrorMsg("Email and password are required.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const result = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (result.success) {
        const name = result.user?.fullname || result.user?.serviceName || "User";
        const isService = result.user?.isService || result.user?.serviceName;
        toast.success(`Welcome back, ${name}!`);
        
        const from = location.state?.from?.pathname || (isService ? `/services/${result.user?._id || result.user?.id}/dashboard` : "/");
        navigate(from, { replace: true });
      } else {
        setErrorMsg(result.error || "Login failed. Please check your credentials.");
        toast.error(result.error || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gradient-to-b from-[#061426] to-[#0a2341] relative overflow-hidden px-4 py-12">
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
        className="w-full max-w-md bg-gradient-to-br from-blue-950/40 to-black/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-blue-800/30 relative z-10"
      >
        {/* Glow effect at borders */}
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-blue-500/20 via-transparent to-blue-300/10 opacity-50 blur-sm pointer-events-none"></div>

        {/* Back Link */}
        <Link to="/" className="inline-flex items-center text-sm text-blue-300/80 hover:text-blue-100 mb-6 transition-colors group">
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            Welcome Back
          </h1>
          <p className="text-blue-300/70 mt-2 text-sm">
            Sign in to manage your services, issues, or feedbacks.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-blue-200 tracking-wider uppercase pl-1">
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
                  className="bg-black/40 border border-blue-900/50 rounded-xl pl-11 py-6 text-white placeholder:text-blue-200/30 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-semibold text-blue-200 tracking-wider uppercase">
                  Password
                </label>
              </div>
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
                  className="bg-black/40 border border-blue-900/50 rounded-xl pl-11 pr-11 py-6 text-white placeholder:text-blue-200/30 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-blue-400/60 hover:text-blue-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-6 rounded-xl font-bold transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white border border-blue-500/30 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center justify-center gap-2 mt-6 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Authenticating...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-blue-900/30">
          <p className="text-sm text-blue-300/60">
            Don't have an account?{" "}
            <Link to="/register" state={location.state} className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
