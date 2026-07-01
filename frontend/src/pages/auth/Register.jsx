import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import { register as registerUser } from "../../api/authApi";
import { useAlert } from "../../hooks/useAlert";

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({ mode: "onChange", defaultValues: { role: "user", isActive: true } });
  const [loading, setLoading] = useState(false);
  const alert = useAlert();
  const navigate = useNavigate();

  const submit = async (payload) => {
    setLoading(true);
    try {
      await registerUser(payload);
      alert.success("User registered successfully! Please login.");
      navigate("/login");
    } catch (error) {
      alert.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form onSubmit={handleSubmit(submit)} className="w-full max-w-md rounded-md bg-white p-6 shadow-sm space-y-4">
        <h1 className="text-2xl font-bold text-slate-950">RBC ERP</h1>
        <p className="text-sm text-slate-500">Create an account to manage import-export containers.</p>
        
        <Input label="Name" error={errors.name?.message} {...register("name", { required: "Name is required" })} />
        <Input label="Email" type="email" error={errors.email?.message} {...register("email", { required: "Email is required" })} />
        <Input label="Password" type="password" error={errors.password?.message} {...register("password", { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } })} />
        <Select label="Role" options={[{ value: "masterAdmin", label: "Master Admin" }, { value: "admin", label: "Admin" }, { value: "user", label: "User" }]} {...register("role")} />
        
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
