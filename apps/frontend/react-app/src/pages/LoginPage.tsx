import React, { useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "../auth/AuthProviders";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const [token, setToken] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!token) return alert("Enter token");
    login(token);
    navigate("/dashboard");
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="p-6 bg-white rounded shadow w-80 flex flex-col gap-4">
        <Input type="text" placeholder="Token" value={token} onChange={(e: ChangeEvent<HTMLInputElement>) => setToken(e.target.value)} />
        <Button type="submit">Login</Button>
      </form>
    </div>
  );
};

export default LoginPage;
