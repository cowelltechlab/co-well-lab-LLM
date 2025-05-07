import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ProgressEvent {
  event_name: string;
  timestamp: string;
  session_id?: string;
}

export function ProgressLogPanel() {
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [completedCount, setCompletedCount] = useState<number | null>(null);

  const fetchProgressLog = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/progress-log`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok) {
        setEvents(data.events);
        setCompletedCount(data.completed);
      } else {
        console.error("Failed to load progress log:", data.error);
      }
    } catch (err) {
      console.error("Error fetching progress log:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressLog();
  }, []);

  return (
    <div className="border rounded p-4 bg-white shadow h-full overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">
          Progress Log
          {completedCount !== null && (
            <span className="text-sm text-gray-600 ml-2">
              ({completedCount} completed)
            </span>
          )}
        </h2>
        <Button onClick={fetchProgressLog} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      <ul className="text-sm space-y-2 overflow-auto max-h-80 pr-2">
        {events.map((event, index) => (
          <li key={index} className="text-gray-700">
            <span className="font-mono text-xs text-gray-500">
              {new Date(event.timestamp + "Z").toLocaleString()}
            </span>
            <br />
            <strong>{event.event_name}</strong>
            {event.session_id && (
              <span className="text-xs text-gray-500 ml-2">
                (session: {event.session_id})
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
