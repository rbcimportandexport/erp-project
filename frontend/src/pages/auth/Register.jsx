import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import { register as registerUser } from "../../api/authApi";
import { useAlert } from "../../hooks/useAlert";
import { useAuth } from "../../hooks/useAuth";

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({ mode: "onChange", defaultValues: { role: "user", isActive: true } });
  const [loading, setLoading] = useState(false);
  const alert = useAlert();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const submit = async (payload) => {
    setLoading(true);
    try {
      const response = await registerUser(payload);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        if (response.data.user) localStorage.setItem("user", JSON.stringify(response.data.user));
        await refreshUser();
        alert.success("Account created and logged in successfully");
        navigate("/");
        return;
      }

      if (response.data.needsEmailConfirmation) {
        alert.success("Account created. Email inbox mein confirmation link click karke phir login karo.");
        navigate("/login");
        return;
      }

      alert.success("User registered successfully. Please login.");
      navigate("/login");
    } catch (error) {
      console.error("Register error details:", error);
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
        message = "Registration failed. Please check your credentials or network connection.";
      }

      if (message.toLowerCase().includes("email rate limit") || message.toLowerCase().includes("email_rate_limit")) {
        alert.error("Supabase email limit hit ho gaya. Same email se signup repeat mat karo, login try karo ya Supabase mein Confirm email OFF karo.");
        navigate("/login");
        return;
      }

      if (message.toLowerCase().includes("already registered") || message.toLowerCase().includes("user_already_exists")) {
        alert.error("Ye email already signup ho chuka hai. Login page se login karo.");
        navigate("/login");
        return;
      }

      alert.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form onSubmit={handleSubmit(submit)} className="w-full max-w-md rounded-md bg-white p-6 shadow-sm space-y-4">
        <h1 className="text-2xl font-bold text-slate-950">RBC ERP</h1>
        <p className="text-sm text-slate-500">Create an account to manage import-export containers.</p>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          Agar same email se signup ho chuka hai to dobara signup mat karo. Login page se login karo.
        </div>
        
        <Input label="Name" error={errors.name?.message} {...register("name", { required: "Name is required" })} />
        <Input label="Email" type="email" error={errors.email?.message} {...register("email", { required: "Email is required" })} />
        <Input label="Password" type="password" error={errors.password?.message} {...register("password", { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } })} />
        
        <Button type="submit" loading={loading} className="w-full">Sign Up</Button>
        
        <div className="text-center text-sm text-slate-500 pt-2">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")} className="text-brand-600 hover:underline cursor-pointer font-semibold">
            Login
          </span>
        </div>
      </form>
    </main>
  );
};

export default Register;
