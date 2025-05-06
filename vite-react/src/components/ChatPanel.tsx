import { useState } from "react";
import { useAppContext } from "@/context/useAppContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  draftKey: "draft1" | "draft2";
}

export default function ChatPanel({ draftKey }: ChatPanelProps) {
  const { letterLabData, setLetterLabData } = useAppContext();

  const [messages, setMessages] = useState<Message[]>(() => {
    if (!letterLabData) return [];
    return (
      letterLabData.chatMessages?.[draftKey] ?? [
        {
          role: "assistant",
          content:
            "Is there any content in this letter you feel isn't accurate?",
        },
      ]
    );
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const updateContext = (updatedMessages: Message[]) => {
    if (!letterLabData) return;
    setLetterLabData({
      ...letterLabData,
      chatMessages: {
        ...(letterLabData?.chatMessages ?? {}),
        [draftKey]: updatedMessages,
      },
    });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages: Message[] = [...messages, userMessage];

    setMessages(newMessages);
    updateContext(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };

      const updated = [...newMessages, assistantMessage];
      setMessages(updated);
      updateContext(updated);
    } catch (err) {
      console.error("Chat send error:", err);
      const fallback: Message = {
        role: "assistant",
        content: "Sorry, something went wrong.",
      };

      const failed = [...newMessages, fallback];
      setMessages(failed);
      updateContext(failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-2">
      <div className="flex-1 overflow-y-auto border rounded p-2 space-y-2 text-sm">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={msg.role === "user" ? "text-right" : "text-left"}
          >
            <span
              className={
                msg.role === "user"
                  ? "bg-blue-100 px-2 py-1 rounded"
                  : "bg-gray-100 px-2 py-1 rounded"
              }
            >
              {msg.content}
            </span>
          </div>
        ))}
        {loading && <div className="text-gray-400 italic">...</div>}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 border px-2 py-1 rounded"
          placeholder="Type your reply..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
