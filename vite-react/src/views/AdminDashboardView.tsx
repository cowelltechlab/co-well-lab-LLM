import { Button } from "@/components/ui/button";

export function AdminDashboardView() {
  const downloadCsv = () => {
    window.open("/api/admin/sessions/export", "_blank");
  };

  return (
    <div className="border rounded p-6 shadow">
      <h2 className="text-lg font-semibold mb-4">Download Sessions</h2>
      <Button onClick={downloadCsv}>Download CSV</Button>
    </div>
  );
}
