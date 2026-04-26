import { useCallback, useEffect, useState, useRef } from "react";
import { useAuth } from "../../auth/AuthContext";
import { Send, Search, MessageCircle } from "lucide-react";

const API_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

export default function ClientMessages() {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedThread, setSelectedThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessages(data.data);
        setSelectedThread((previousThread) => {
          if (data.data.length > 0 && !previousThread) {
            return "general";
          }
          return previousThread;
        });
      }
    } catch (err) {
      console.error("Messages fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);

    const latestExternal = [...messages].reverse().find((msg) => msg.sender_name !== user?.name);
    const inferredRecipientOrgId = latestExternal
      ? Number(latestExternal.sender_organization_id)
      : null;

    try {
      const res = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          content: newMessage,
          ...(inferredRecipientOrgId ? { recipient_organization_id: inferredRecipientOrgId } : {})
        }),
      });
      if (res.ok) {
        setNewMessage("");
        await fetchMessages();
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setSending(false);
    }
  }

  // Group messages for thread display
  const threads = [
    { id: "general", name: "Wefetch Team", lastMessage: messages[messages.length - 1]?.content || "Start a conversation", date: messages[messages.length - 1]?.created_at },
  ];

  const filteredThreads = threads.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sidebar - Conversations */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 mb-3">Messages</h1>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredThreads.map(thread => (
            <button
              key={thread.id}
              onClick={() => setSelectedThread(thread.id)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                selectedThread === thread.id ? "bg-green-50 border-l-2 border-l-green-600" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-green-700 font-semibold text-sm">W</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 text-sm">{thread.name}</p>
                    {thread.date && (
                      <span className="text-xs text-gray-400">
                        {new Date(thread.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {thread.lastMessage?.slice(0, 40)}{thread.lastMessage?.length > 40 ? "..." : ""}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Conversation */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedThread ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-700 font-semibold text-xs">W</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Wefetch Team</p>
                <p className="text-xs text-gray-400">Sustainability Consultants</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageCircle size={40} className="mb-3" />
                  <p className="font-medium">No messages yet</p>
                  <p className="text-sm">Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.sender_id === user?.id || msg.sender_name === user?.name;
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-md px-4 py-3 rounded-2xl ${
                        isOwn
                          ? "bg-green-600 text-white rounded-br-md"
                          : "bg-white text-gray-900 border border-gray-200 rounded-bl-md"
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${isOwn ? "text-green-200" : "text-gray-400"}`}>
                          {new Date(msg.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white p-2.5 rounded-lg transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageCircle size={48} className="mb-3" />
            <p className="font-medium text-lg">Select a conversation</p>
            <p className="text-sm">Choose a conversation from the left panel to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
