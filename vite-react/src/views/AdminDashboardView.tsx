import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAdminContext } from "@/context/useAdminContext";
import { Navigate, useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";

import { ProgressLogPanel } from "@/components/ProgressLogPanel";
import { PromptManagementPanel } from "@/components/PromptManagementPanel";

const apiBase = import.meta.env.VITE_API_BASE_URL;

// Health status component
function HealthStatusCard() {
  const [health, setHealth] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    fetch(`${apiBase}/api/admin/health`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch(() => setHealth(null));
  }, []);

  const statusColor = (s: string) =>
    s === "ok" ? "text-green-600" : "text-red-500";

  return (
    <div className="border rounded p-6 shadow bg-white w-full h-full">
      <h2 className="text-lg font-semibold mb-4">System Health</h2>
      {health ? (
        <ul className="space-y-1">
          {Object.entries(health).map(([key, value]) => (
            <li key={key}>
              <span className="font-medium">{key}</span>:{" "}
              <span className={statusColor(value)}>{value}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">Unable to load status.</p>
      )}
    </div>
  );
}

interface Token {
  _id: string;
  token: string;
  used: boolean;
  created_at: string;
  used_at?: string;
  session_id?: string;
}

// Main admin dashboard layout
export function AdminDashboardView() {
  const [newToken, setNewToken] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isAdmin, setIsAdmin } = useAdminContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${apiBase}/api/admin/tokens`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setTokens(data.tokens);
      }
    } catch (error) {
      console.error("Error fetching tokens:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleInvalidateToken = async (token: string) => {
    try {
      const res = await fetch(`${apiBase}/api/admin/tokens/invalidate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        // Refresh token list
        fetchTokens();
      }
    } catch (error) {
      console.error("Error invalidating token:", error);
    }
  };

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  return (
    <div className="min-h-screen w-full p-6 bg-gray-50 flex justify-center">
      <div className="w-full max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button
            variant="outline"
            onClick={async () => {
              await fetch(`${apiBase}/api/admin/logout`, {
                method: "POST",
                credentials: "include",
              });
              setIsAdmin(false);
              navigate("/admin/login");
            }}
          >
            Logout
          </Button>
        </div>

        <div className="space-y-6">
          {/* Row 1: System Health and Participant Tokens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. System Health */}
            <div className="w-full h-[35vh]">
              <HealthStatusCard />
            </div>

            {/* 2. Participant Tokens */}
            <div className="border rounded p-6 shadow bg-white w-full h-[35vh] flex flex-col">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Participant Tokens</h2>
                  <Button
                    onClick={fetchTokens}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Refresh tokens"
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <Button
                  onClick={async () => {
                    const res = await fetch(
                      `${apiBase}/api/admin/tokens/create`,
                      {
                        method: "POST",
                        credentials: "include",
                      }
                    );
                    const data = await res.json();
                    setNewToken(data.token);
                    fetchTokens(); // Refresh list
                  }}
                  className="mb-4"
                >
                  Generate Token
                </Button>
              </div>

              {newToken && (
                <div className="mb-4 text-center bg-green-50 p-3 rounded">
                  <p className="text-sm text-gray-600">New Token Created:</p>
                  <div className="text-xl font-mono bg-gray-100 px-4 py-2 rounded mt-1">
                    {newToken}
                  </div>
                </div>
              )}

              {/* Token List */}
              <div className="flex-1 overflow-y-auto min-h-0 border-t pt-4 mt-4">
                {tokens.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No active tokens</p>
                ) : (
                  <div className="space-y-2 pr-2">
                    {tokens.map((token) => (
                      <div
                        key={token._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        <div className="flex-1">
                          <div className="font-mono text-sm">{token.token}</div>
                          <div className="text-xs text-gray-500">
                            {token.used ? (
                              <>Used • Session: {token.session_id}</>
                            ) : (
                              "Unused"
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleInvalidateToken(token.token)}
                        >
                          Invalidate
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Progress Log and Download Sessions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 3. Progress Log */}
            <div className="border rounded p-6 shadow bg-white w-full h-[35vh]">
              <ProgressLogPanel />
            </div>

            {/* 4. Download Sessions */}
            <div className="border rounded p-6 shadow bg-white w-full h-[35vh]">
              <h2 className="text-lg font-semibold mb-4">Download Research Data</h2>
              <p className="text-sm text-gray-600 mb-4">
                Downloads a single CSV file containing all research data in wide format (one row per participant):
                <br />• Session information (timestamp, resume, job description)
                <br />• Control and aligned profile text
                <br />• Likert scale responses (1-7 ratings) for both phases
                <br />• Open-ended survey responses for both phases
                <br />• All bullet iterations with numbering (bullet_1_1, bullet_1_2, bullet_2_1, etc.)
                <br />• Final bullet text, rationale, ratings, and feedback for each iteration
              </p>
              <Button
                onClick={() =>
                  window.open(`${apiBase}/api/admin/sessions/export`, "_blank")
                }
                className=""
              >
                Download Research Data (CSV)
              </Button>
            </div>
          </div>

          {/* Row 3: Full Width Prompt Management */}
          <div className="border rounded p-6 shadow bg-white w-full">
            <PromptManagementPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
