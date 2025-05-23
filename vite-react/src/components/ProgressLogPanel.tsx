import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

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
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          Progress Log
          {completedCount !== null && (
            <span className="text-sm text-gray-600 ml-2">
              ({completedCount} completed)
            </span>
          )}
        </h2>
        <Button
          onClick={fetchProgressLog}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Refresh progress log"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 border-t pt-4">
        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No events logged</p>
        ) : (
          <ul className="text-sm space-y-2 pr-2">
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
        )}
      </div>
    </div>
  );
}
