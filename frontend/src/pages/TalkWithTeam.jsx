import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import LoadingState from "../components/LoadingState";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const categories = [
  "Data Clarification",
  "Report Discussion",
  "Compliance Support",
  "Ongoing Data Help",
  "General Discussion",
  "Onboarding Guidance"
];

export default function TalkWithTeam() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [category, setCategory] = useState("General Discussion");
  const [content, setContent] = useState("");

  const filtered = useMemo(
    () => messages.filter((message) => message.category === category),
    [messages, category]
  );

  useEffect(() => {
    async function loadMessages() {
      setLoading(true);

      try {
        const response = await fetch(`${API_URL}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setMessages(data.data);
        }
      } finally {
        setLoading(false);
      }
    }

    loadMessages();
  }, [token]);

  const sendMessage = async () => {
    if (!content.trim()) {
      return;
    }

    const response = await fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ category, content: content.trim() })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      setMessages((prev) => [
        ...prev,
        {
          ...data.data,
          sender_name: user?.name || "You"
        }
      ]);
      setContent("");
    }
  };

  if (loading) {
    return <LoadingState message="Loading conversation..." />;
  }

  return (
    <div className="space-y-4 text-white h-full flex flex-col">
      <div>
        <h2 className="text-2xl font-semibold">Talk With Your Team</h2>
        <p className="text-zinc-400">Human, supportive communication with your sustainability experts.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((entry) => (
          <button
            key={entry}
            onClick={() => setCategory(entry)}
            className={`px-3 py-1 rounded-full text-sm ${
              entry === category ? "bg-green-600" : "bg-zinc-800"
            }`}
          >
            {entry}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex-1 overflow-auto space-y-3">
        {filtered.length === 0 ? (
          <p className="text-zinc-400">No messages in this discussion yet.</p>
        ) : (
          filtered.map((message) => {
            const mine = message.sender_name === user?.name;

            return (
              <div
                key={message.id}
                className={`max-w-xl rounded-lg px-3 py-2 ${
                  mine ? "ml-auto bg-green-700" : "bg-zinc-800"
                }`}
              >
                <p className="text-xs text-zinc-300 mb-1">
                  {message.sender_name} • {new Date(message.created_at).toLocaleTimeString()}
                </p>
                <p>{message.content}</p>
              </div>
            );
          })
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
          placeholder="Type your message..."
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              sendMessage();
            }
          }}
        />
        <button
          onClick={sendMessage}
          className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
