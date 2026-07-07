import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { forgotPassword } from "../../api/authApi";
import { useAlert } from "../../hooks/useAlert";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", pin: "", newPassword: "" });
  const [errors, setErrors] = useState({});
  const alert = useAlert();
  const navigate = useNavigate();

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!form.email.trim()) nextErrors.email = "Email is required";
    if (!form.pin.trim()) nextErrors.pin = "Security PIN is required";
    if (!form.newPassword) nextErrors.newPassword = "New Password is required";
    else if (form.newPassword.length < 6) nextErrors.newPassword = "Password must be at least 6 characters";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(form);
      alert.success("Password reset successfully! Log in with your new password.");
      navigate("/login");
    } catch (error) {
      console.error("Reset password error:", error);
      const message = error.response?.data?.message || error.message || "Failed to reset password. Please try again.";
      alert.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-md bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-slate-950">RBC ERP</h1>
        <p className="mb-6 text-sm text-slate-500">Reset your password using the security PIN.</p>
        <div className="space-y-4">
          <Input 
            label="Email Address" 
            type="email" 
            value={form.email} 
            onChange={(event) => updateField("email", event.target.value)} 
            error={errors.email} 
            autoComplete="email" 
          />
          <Input 
            label="Security Reset PIN" 
            type="password" 
            value={form.pin} 
            onChange={(event) => updateField("pin", event.target.value)} 
            error={errors.pin} 
            placeholder="Enter security PIN" 
          />
          <Input 
            label="New Password" 
            type="password" 
            value={form.newPassword} 
            onChange={(event) => updateField("newPassword", event.target.value)} 
            error={errors.newPassword} 
            placeholder="At least 6 characters" 
          />
          
          <Button type="submit" loading={loading} className="w-full">
            Reset Password
          </Button>
          
          <div className="text-center text-sm text-slate-500 pt-2 flex justify-between">
            <span onClick={() => navigate("/login")} className="text-brand-600 hover:underline cursor-pointer font-semibold">
              Back to Login
            </span>
            <span onClick={() => navigate("/register")} className="text-brand-600 hover:underline cursor-pointer font-semibold">
              Sign Up
            </span>
          </div>
        </div>
      </form>
    </main>
  );
};

export default ForgotPassword;
