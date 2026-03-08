import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { loginUser } from "../api/auth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const data = await loginUser(email, password);
      login(data);

      // Role-based redirect
      const role = data.user?.role;
      if (role === "client") {
        navigate("/client/dashboard", { replace: true });
      } else {
        navigate("/company/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left: Branding panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-600 to-green-700 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-white/5 rounded-full" />

        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white">Wefetch</h2>
          <p className="text-green-100 text-sm mt-1">Sustainability Platform</p>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Manage Your<br />Sustainability Data<br />With Confidence
            </h1>
            <p className="text-green-100 mt-4 text-lg max-w-md">
              Track, report, and improve your environmental impact with our comprehensive sustainability management platform.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">500+</p>
              <p className="text-green-200 text-xs">Companies</p>
            </div>
            <div className="w-px h-10 bg-green-400/40" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">98%</p>
              <p className="text-green-200 text-xs">Data Accuracy</p>
            </div>
            <div className="w-px h-10 bg-green-400/40" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">24/7</p>
              <p className="text-green-200 text-xs">Support</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-green-200 text-xs">© 2025 Wefetch. All rights reserved.</p>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden mb-2">
            <h2 className="text-2xl font-bold text-green-600">Wefetch</h2>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 mt-2">Enter your credentials to access your account</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <button type="button" className="text-sm text-green-600 hover:text-green-700 font-medium">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder-gray-400 pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg py-3 px-4 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400">
            Don't have an account? <span className="text-green-600 font-medium">Contact Wefetch</span>
          </p>
        </div>
      </div>
    </div>
  );
}
