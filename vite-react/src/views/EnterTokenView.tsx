import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/useAppContext";
import { Button } from "@/components/ui/button";

export function EnterTokenView() {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { setLetterLabData } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/lab/validate-token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        }
      );

      if (!res.ok) {
        throw new Error("Invalid or used token");
      }

      setLetterLabData((prev) => {
        if (!prev) return { token, hasAccess: true };

        return {
          ...prev,
          token,
          hasAccess: true,
        };
      });

      navigate("/");
    } catch (err) {
      console.error("Token submit error:", err);
      setError("❌ Invalid or used token. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold mb-4">Enter Your Access Code</h1>
        <input
          type="text"
          className="w-full border px-4 py-2 rounded mb-4 text-center"
          placeholder="e.g. abc123"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <Button onClick={handleSubmit} className="w-full">
          Submit
        </Button>
      </div>
    </div>
  );
}
