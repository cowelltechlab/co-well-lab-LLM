import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAdminContext } from "@/context/useAdminContext";
import { Navigate } from "react-router-dom";

import { ProgressLogPanel } from "@/components/ProgressLogPanel";

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
    <div className="border rounded p-6 shadow bg-white h-full">
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

// Main admin dashboard layout
export function AdminDashboardView() {
  const [newToken, setNewToken] = useState<string | null>(null);
  const { isAdmin } = useAdminContext();

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  return (
    <div className="min-h-screen w-[80%] p-6 bg-gray-50 flex justify-center">
      <div className="">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-[80vw] h-[80vh]">
          {/* 1. System Health */}
          <div className="h-full">
            <HealthStatusCard />
          </div>

          {/* 2. Participant Tokens */}
          <div className="border rounded p-6 shadow bg-white h-full flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-4">Participant Tokens</h2>
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
                }}
              >
                Generate Token
              </Button>
            </div>
            {newToken && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">Latest Token:</p>
                <div className="text-xl font-mono bg-gray-100 px-4 py-2 rounded mt-1">
                  {newToken}
                </div>
              </div>
            )}
          </div>

          {/* 3. Progress Log */}
          <div className="border rounded p-6 shadow bg-white h-full">
            <ProgressLogPanel />
          </div>

          {/* 4. Download Sessions */}
          <div className="border rounded p-6 shadow bg-white h-full">
            <h2 className="text-lg font-semibold mb-4">Download Sessions</h2>
            <Button
              onClick={() =>
                window.open(`${apiBase}/api/admin/sessions/export`, "_blank")
              }
              className=""
            >
              Download CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
