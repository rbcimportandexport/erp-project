import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
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
      console.error("Login error details:", error);
      let message = "";
      if (typeof error === "string") {
        message = error;
      } else if (error && typeof error === "object") {
        message = error.response?.data?.message || error.message || error.error_description || error.error || "";
        if (typeof message === "object") {
          message = JSON.stringify(message);
        }
      }
      
      message = message.trim();
      if (!message || message === "{}") {
        message = "Login failed. Please check your credentials or network connection.";
      }

      if (message.toLowerCase().includes("email not confirmed") || message.toLowerCase().includes("email_not_confirmed")) {
        setShowConfirmHelp(true);
        alert.error("Email confirm nahi hai. Resend confirmation button se mail dobara bhejo.");
        return;
      }
      alert.error(message);
    } finally {
      setLoading(false);
    }
  };

  const resendEmail = async () => {
    if (!form.email.trim()) {
      setErrors((current) => ({ ...current, email: "Email is required" }));
      return;
    }

    setResending(true);
    try {
      await resendConfirmationEmail(form.email.trim());
      alert.success("Confirmation email sent. Inbox aur spam folder check karo.");
    } catch (error) {
      const message = error.response?.data?.message || error.message || "";
      if (message.toLowerCase().includes("email rate limit")) {
        alert.error("Supabase email limit hit ho gaya. Thoda wait karo ya Supabase SMTP setup karo.");
        return;
      }
      alert.error(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-md bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-slate-950">RBC ERP</h1>
        <p className="mb-6 text-sm text-slate-500">Sign in to manage import-export containers.</p>
        <div className="space-y-4">
          <Input label="Email" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} error={errors.email} autoComplete="email" />
          <Input label="Password" type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} error={errors.password} autoComplete="current-password" />
          <div className="flex justify-end text-sm -mt-2">
            <span onClick={() => navigate("/forgot-password")} className="text-brand-600 hover:underline cursor-pointer font-semibold">
              Forgot Password?
            </span>
          </div>
          {showConfirmHelp ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold">Email confirmation pending hai.</p>
              <p className="mt-1">Confirmation link inbox ya spam me check karo. Mail nahi aaya to dobara bhejo.</p>
              <Button type="button" variant="outline" loading={resending} onClick={resendEmail} className="mt-3 w-full">
                Resend Confirmation Email
              </Button>
            </div>
          ) : null}
          <Button type="submit" loading={loading} className="w-full">Login</Button>
          
          <div className="text-center text-sm text-slate-500 pt-2">
            Don't have an account?{" "}
            <span onClick={() => navigate("/register")} className="text-brand-600 hover:underline cursor-pointer font-semibold">
              Sign Up
            </span>
          </div>
        </div>
      </form>
    </main>
  );
};

export default Login;
