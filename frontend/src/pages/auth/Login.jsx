import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useAlert } from "../../hooks/useAlert";
import { useAuth } from "../../hooks/useAuth";

const Login = () => {
  const [loading, setLoading] = useState(false);
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
      alert.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
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
