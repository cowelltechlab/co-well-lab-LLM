import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Edit, Save, X, Clock, User, RotateCcw } from "lucide-react";

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
  const [originalContent, setOriginalContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showHistory, setShowHistory] = useState<string | null>(null);
  const [history, setHistory] = useState<PromptHistory[]>([]);
  const [reverting, setReverting] = useState<string | null>(null);

  const promptTypeLabels: Record<string, string> = {
    control: "Control Profile Generation",
    bse_generation: "Initial Bullet Generation", 
    regeneration: "Bullet Regeneration",
    final_synthesis: "Final Profile Synthesis"
  };

  const promptVariables: Record<string, string[]> = {
    control: ["{resume}", "{jobDescription}"],
    bse_generation: ["{resume}", "{jobDescription}"],
    regeneration: ["{bulletText}", "{rationale}", "{rating}", "{feedback}", "{iterationHistory}"],
    final_synthesis: ["{finalBullets}", "{allFeedback}", "{originalProfile}", "{resume}", "{jobDescription}"]
  };

  // Define the order of prompts based on UI flow
  const promptOrder = ['control', 'bse_generation', 'regeneration', 'final_synthesis'];

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
    setOriginalContent(prompt.content);
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
        setOriginalContent("");
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
    setOriginalContent("");
    setError("");
    setSuccess("");
  };

  const hasContentChanged = () => {
    return editContent.trim() !== originalContent.trim();
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

  const handleRevert = async (promptType: string, historyItem: PromptHistory) => {
    if (historyItem.isActive) {
      setError("Cannot revert to the currently active version");
      return;
    }

    setReverting(historyItem._id);
    setError("");

    try {
      const response = await fetch(`${apiBase}/api/admin/prompts/${promptType}/revert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          version: historyItem.version,
        }),
      });

      if (response.ok) {
        setSuccess(`Reverted ${promptTypeLabels[promptType]} to version ${historyItem.version}`);
        fetchPrompts(); // Refresh the main prompts list
        await fetchPromptHistory(promptType); // Refresh the history
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to revert prompt");
      }
    } catch (err) {
      setError("Error reverting prompt");
    } finally {
      setReverting(null);
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
        {prompts
          .sort((a, b) => {
            const aIndex = promptOrder.indexOf(a.promptType);
            const bIndex = promptOrder.indexOf(b.promptType);
            return aIndex - bIndex;
          })
          .map((prompt) => (
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
                        disabled={saving || !hasContentChanged()}
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

              {/* Available Variables Panel */}
              {editingPrompt === prompt.promptType && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Available Variables:</h4>
                  <div className="flex flex-wrap gap-1">
                    {promptVariables[prompt.promptType]?.map((variable) => (
                      <code 
                        key={variable} 
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded cursor-pointer hover:bg-blue-200"
                        onClick={() => {
                          // Insert variable at cursor position
                          const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const newContent = editContent.substring(0, start) + variable + editContent.substring(end);
                            setEditContent(newContent);
                            // Set cursor position after the inserted variable
                            setTimeout(() => {
                              textarea.setSelectionRange(start + variable.length, start + variable.length);
                              textarea.focus();
                            }, 0);
                          }
                        }}
                      >
                        {variable}
                      </code>
                    ))}
                  </div>
                  <p className="text-xs text-blue-600 mt-2">Click on a variable to insert it at your cursor position</p>
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
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {history.map((historyItem) => (
                      <div key={historyItem._id} className="bg-gray-50 p-3 rounded border">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-sm">v{historyItem.version} {historyItem.isActive && <span className="text-green-600 text-xs">(Active)</span>}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500 text-xs">{formatDate(historyItem.createdAt)}</span>
                            {!historyItem.isActive && (
                              <Button
                                onClick={() => handleRevert(prompt.promptType, historyItem)}
                                disabled={reverting === historyItem._id}
                                size="sm"
                                variant="outline"
                                className="h-6 px-2 text-xs"
                              >
                                {reverting === historyItem._id ? (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : (
                                  <>
                                    <RotateCcw className="h-3 w-3 mr-1" />
                                    Revert
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="text-gray-600 font-mono text-xs bg-white p-2 rounded border whitespace-pre-wrap">
                          {historyItem.content}
                        </div>
                        <div className="text-gray-500 mt-2 text-xs">
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