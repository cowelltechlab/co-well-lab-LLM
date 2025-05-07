import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminContext } from "@/context/useAdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminLoginView() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setIsAdmin } = useAdminContext();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // important for Enter to trigger this
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username, password }),
        }
      );

      if (!res.ok) throw new Error("Login failed");

      setIsAdmin(true);
      navigate("/admin");
    } catch (err) {
      console.error("Bad admin login:", err);
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-xl font-semibold mb-4">Admin Login</h1>
      <form onSubmit={handleLogin} className="w-64 space-y-4">
        <Input
          type="text"
          placeholder="Username"
          className="w-full px-3 py-2 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button
          type="submit"
          className="w-full text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </Button>
      </form>
    </div>
  );
}
