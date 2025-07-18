import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Edit, Save, X, Clock, User } from "lucide-react";

const apiBase = import.meta.env.VITE_API_BASE_URL;

interface Prompt {
  _id: string;
  promptType: string;
  content: string;
  version: number;
  createdAt: string;
  modifiedBy: string;
  isActive: boolean;
}

interface PromptHistory {
  _id: string;
  promptType: string;
  content: string;
  version: number;
  createdAt: string;
  modifiedBy: string;
  isActive: boolean;
}

export function PromptManagementPanel() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showHistory, setShowHistory] = useState<string | null>(null);
  const [history, setHistory] = useState<PromptHistory[]>([]);

  const promptTypeLabels: Record<string, string> = {
    control: "Control Profile Generation",
    bse_generation: "BSE Bullet Generation", 
    regeneration: "Bullet Regeneration",
    final_synthesis: "Final Profile Synthesis"
  };

  const fetchPrompts = async () => {
    try {
      const response = await fetch(`${apiBase}/api/admin/prompts`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setPrompts(data.prompts || []);
      } else {
        setError("Failed to fetch prompts");
      }
    } catch (err) {
      setError("Error fetching prompts");
    } finally {
      setLoading(false);
    }
  };

  const fetchPromptHistory = async (promptType: string) => {
    try {
      const response = await fetch(`${apiBase}/api/admin/prompts/${promptType}/history`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      } else {
        setError("Failed to fetch prompt history");
      }
    } catch (err) {
      setError("Error fetching prompt history");
    }
  };

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt.promptType);
    setEditContent(prompt.content);
    setError("");
    setSuccess("");
  };

  const handleSave = async (promptType: string) => {
    if (!editContent.trim()) {
      setError("Prompt content cannot be empty");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`${apiBase}/api/admin/prompts/${promptType}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          content: editContent,
        }),
      });

      if (response.ok) {
        setSuccess(`${promptTypeLabels[promptType]} updated successfully`);
        setEditingPrompt(null);
        fetchPrompts(); // Refresh the prompts
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update prompt");
      }
    } catch (err) {
      setError("Error updating prompt");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingPrompt(null);
    setEditContent("");
    setError("");
    setSuccess("");
  };

  const handleShowHistory = async (promptType: string) => {
    if (showHistory === promptType) {
      setShowHistory(null);
      setHistory([]);
    } else {
      setShowHistory(promptType);
      await fetchPromptHistory(promptType);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    return content.length > maxLength ? content.substring(0, maxLength) + "..." : content;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading prompts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Prompt Management</h2>
        <Button
          onClick={fetchPrompts}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Refresh prompts"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {prompts.map((prompt) => (
          <Card key={prompt._id} className="border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {promptTypeLabels[prompt.promptType] || prompt.promptType}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => handleShowHistory(prompt.promptType)}
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    History
                  </Button>
                  {editingPrompt === prompt.promptType ? (
                    <div className="flex space-x-1">
                      <Button
                        onClick={() => handleSave(prompt.promptType)}
                        disabled={saving}
                        size="sm"
                        className="h-7 px-2 text-xs"
                      >
                        <Save className="h-3 w-3 mr-1" />
                        {saving ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleEdit(prompt)}
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {editingPrompt === prompt.promptType ? (
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-96 text-sm font-mono resize-y"
                  placeholder="Enter prompt content..."
                />
              ) : (
                <div className="text-sm text-gray-600 font-mono bg-gray-50 p-3 rounded border">
                  {truncateContent(prompt.content, 200)}
                </div>
              )}
              
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <div className="flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  {prompt.modifiedBy} • v{prompt.version}
                </div>
                <div>{formatDate(prompt.createdAt)}</div>
              </div>

              {/* History Panel */}
              {showHistory === prompt.promptType && (
                <div className="mt-4 border-t pt-3">
                  <h4 className="text-sm font-medium mb-2">Version History</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {history.map((historyItem) => (
                      <div key={historyItem._id} className="text-xs bg-gray-50 p-2 rounded border">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">v{historyItem.version}</span>
                          <span className="text-gray-500">{formatDate(historyItem.createdAt)}</span>
                        </div>
                        <div className="text-gray-600 font-mono">
                          {truncateContent(historyItem.content, 150)}
                        </div>
                        <div className="text-gray-500 mt-1">
                          Modified by: {historyItem.modifiedBy}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {prompts.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          No prompts found. Initialize default prompts to get started.
        </div>
      )}
    </div>
  );
}