import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { resendConfirmationEmail } from "../../api/authApi";
import { useAlert } from "../../hooks/useAlert";
import { useAuth } from "../../hooks/useAuth";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showConfirmHelp, setShowConfirmHelp] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const { login, isAuthenticated } = useAuth();
  const alert = useAlert();
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/" replace />;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!form.email.trim()) nextErrors.email = "Email is required";
    if (!form.password) nextErrors.password = "Password is required";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      await login(form);
      alert.success("Logged in successfully");
      navigate("/");
    } catch (error) {
      let message = "";
      if (typeof error === "string") message = error;
      else if (error && typeof error === "object") {
        message = error.response?.data?.message || error.message || error.error_description || error.error || "";
        if (typeof message === "object") message = JSON.stringify(message);
      }
      message = message.trim();
      if (!message || message === "{}") message = "Login failed. Please check your credentials.";

      if (message.toLowerCase().includes("email not confirmed") || message.toLowerCase().includes("email_not_confirmed")) {
        setShowConfirmHelp(true);
        alert.error("Email not confirmed. Please check your inbox.");
        return;
      }
      alert.error(message);
    } finally {
      setLoading(false);
    }
  };

  const resendEmail = async () => {
    if (!form.email.trim()) {
      setErrors((current) => ({ ...current, email: "Email required" }));
      return;
    }
    setResending(true);
    try {
      await resendConfirmationEmail(form.email.trim());
      alert.success("Confirmation email sent!");
    } catch (error) {
      alert.error(error.response?.data?.message || error.message || "Failed");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1a3557 50%, #0f2540 100%)' }}>
      <div className="w-full max-w-md mx-4">
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">RBC IMPORT EXPORT ERP</h1>
          <p className="text-[#94a3b8] mt-1 text-sm">Container Management System</p>
        </div>

        {/* Login Card */}
        <form onSubmit={submit} className="bg-white rounded-2xl shadow-2xl p-8 space-y-5">
          <div>
            <h2 className="text-xl font-bold text-[#1e293b]">Welcome back</h2>
            <p className="text-sm text-[#64748b] mt-1">Sign in to your account</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#1e293b] mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-[#d1d5db] bg-white text-sm text-[#1e293b] outline-none transition-all focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/10"
                placeholder="Enter your email"
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1e293b] mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-[#d1d5db] bg-white text-sm text-[#1e293b] outline-none transition-all focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/10"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <div className="flex justify-end">
              <button type="button" onClick={() => navigate("/forgot-password")} className="text-xs font-semibold text-[#3b82f6] hover:text-[#2563eb]">
                Forgot Password?
              </button>
            </div>
          </div>

          {showConfirmHelp && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-amber-900">Email confirmation pending</p>
              <p className="text-xs text-amber-700 mt-1">Check inbox/spam or resend confirmation.</p>
              <button type="button" onClick={resendEmail} disabled={resending} className="mt-3 w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50">
                {resending ? "Sending..." : "Resend Confirmation Email"}
              </button>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full h-11 bg-gradient-to-r from-[#1a56db] to-[#3b82f6] hover:from-[#1d4ed8] hover:to-[#2563eb] text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Signing in...
              </span>
            ) : "Sign in"}
          </button>

          <p className="text-center text-xs text-[#94a3b8]">
            Don't have an account?{" "}
            <button type="button" onClick={() => navigate("/register")} className="font-semibold text-[#3b82f6] hover:text-[#2563eb]">Sign Up</button>
          </p>
        </form>

        <p className="text-center text-xs text-[#64748b] mt-6">2026 RBC Import Export. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Login;