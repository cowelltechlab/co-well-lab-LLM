import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function AdminLoginView() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // important for session cookie
          body: JSON.stringify({ username, password }),
        }
      );

      if (!res.ok) throw new Error("Login failed");
      navigate("/admin");
    } catch (err) {
      console.error("Bad admin login:", err);
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-xl font-semibold mb-4">Admin Login</h1>
      <div className="w-64 space-y-4">
        <input
          type="text"
          placeholder="Username"
          className="w-full px-3 py-2 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </div>
    </div>
  );
}
