import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Phone, Video, Smile, Mic, Send } from "lucide-react";
import { Layout } from "../components/Layout";
import { ContactsList } from "../components/ContactsList";
import {
  mockMessages,
  suggestedTopics,
  getUserById,
  type Message,
} from "../data/mockData";

export function ChatRoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const contactId = parseInt(id ?? "1");

  const contact = getUserById(contactId);
  const [messages, setMessages] = useState<Message[]>(
    () => {
      const saved = localStorage.getItem(`nv_friend_chat_${contactId}`);
      if (saved) return JSON.parse(saved);
      return mockMessages[contactId] ? [...mockMessages[contactId]] : [];
    }
  );
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset messages when contact changes
  useEffect(() => {
    const saved = localStorage.getItem(`nv_friend_chat_${contactId}`);
    setMessages(saved ? JSON.parse(saved) : mockMessages[contactId] ? [...mockMessages[contactId]] : []);
  }, [contactId]);

  const handleSend = () => {
    if (!input.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages((prev) => {
      const next: Message[] = [
        ...prev,
        { id: prev.length + 1, sender: "me", content: input.trim(), time: timeStr },
      ];
      localStorage.setItem(`nv_friend_chat_${contactId}`, JSON.stringify(next));
      return next;
    });
    setInput("");
  };

  const handleTopicClick = (topic: string) => {
    setInput(topic);
  };

  if (!contact) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p style={{ color: "#999" }}>ユーザーが見つかりません</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex" style={{ height: "calc(100vh - 57px)" }}>
        {/* Left panel – contacts list */}
        <div className="w-72 flex-shrink-0 h-full hidden md:block">
          <ContactsList activeId={contactId} />
        </div>

        {/* Right panel – chat room */}
        <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ background: "#FFFFFF" }}>
          {/* Chat header – clickable → review page */}
          <div
            className="flex items-center gap-3 px-5 py-3 flex-shrink-0 cursor-pointer hover:bg-orange-50 transition-colors"
            style={{
              borderBottom: "1.5px solid #F5DDD0",
              background: "white",
            }}
          >
            {/* Clickable user info area */}
            <div
              className="flex items-center gap-3 flex-1 min-w-0"
              onClick={() => navigate(`/review/${contactId}`)}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
                  style={{ background: contact.avatarColor }}
                >
                  {contact.avatarEmoji}
                </div>
                {contact.online && (
                  <div
                    className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
                    style={{ background: "#22C55E" }}
                  />
                )}
              </div>

              {/* Name + status */}
              <div className="min-w-0">
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "#1A1A1A" }}>
                  {contact.name}
                </div>
                <div style={{ fontSize: "0.78rem", color: contact.online ? "#22C55E" : "#AAAAAA" }}>
                  {contact.online ? "オンライン中" : "オフライン"}
                </div>
              </div>
            </div>

            {/* Call / Video icons */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-orange-100 transition-colors"
                style={{ border: "1.5px solid #F0D5C8" }}
              >
                <Phone size={17} style={{ color: "#F97316" }} />
              </button>
              <button
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-orange-100 transition-colors"
                style={{ border: "1.5px solid #F0D5C8" }}
              >
                <Video size={17} style={{ color: "#F97316" }} />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <p style={{ color: "#CCCCCC", fontSize: "0.9rem" }}>
                  まだメッセージがありません。最初のメッセージを送りましょう！
                </p>
              </div>
            )}

            {messages.map((msg, idx) => {
              // Show time divider before first message or when time changes
              const showTime =
                idx === 0 ||
                messages[idx - 1].time !== msg.time;

              return (
                <div key={msg.id}>
                  {showTime && idx === 0 && (
                    <div className="flex items-center justify-center mb-2">
                      <span
                        className="px-3 py-0.5 rounded-full text-xs"
                        style={{ background: "#F5F5F5", color: "#AAAAAA" }}
                      >
                        {msg.time}
                      </span>
                    </div>
                  )}

                  {msg.sender === "me" ? (
                    /* My message – right aligned, orange bubble */
                    <div className="flex justify-end">
                      <div
                        className="px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-xs whitespace-pre-line"
                        style={{
                          background: "#F97316",
                          color: "white",
                          fontSize: "0.9rem",
                          lineHeight: 1.5,
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    /* Other's message – left aligned, white bubble with avatar */
                    <div className="flex items-end gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                        style={{ background: contact.avatarColor }}
                      >
                        {contact.avatarEmoji}
                      </div>
                      <div
                        className="px-4 py-2.5 rounded-2xl rounded-tl-sm max-w-xs whitespace-pre-line"
                        style={{
                          background: "#F5F5F5",
                          color: "#1A1A1A",
                          fontSize: "0.9rem",
                          lineHeight: 1.5,
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested topics */}
          <div
            className="px-4 py-2 flex-shrink-0"
            style={{ borderTop: "1px solid #F5DDD0", background: "#FAFAFA" }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span style={{ fontSize: "0.75rem", color: "#AAAAAA" }}>💡</span>
              <span style={{ fontSize: "0.75rem", color: "#AAAAAA" }}>
                提案されたトピック
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {suggestedTopics.slice(0, 2).map((topic, i) => (
                <button
                  key={i}
                  onClick={() => handleTopicClick(topic)}
                  className="px-3 py-1.5 rounded-full text-left hover:opacity-80 transition-opacity"
                  style={{
                    background: "#FFF0E8",
                    border: "1.5px solid #F5DDD0",
                    color: "#E8641A",
                    fontSize: "0.78rem",
                    maxWidth: 220,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Input area */}
          <div
            className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
            style={{ borderTop: "1.5px solid #F5DDD0", background: "white" }}
          >
            {/* Emoji */}
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-orange-50 transition-colors"
            >
              <Smile size={20} style={{ color: "#F97316" }} />
            </button>

            {/* Text input */}
            <input
              type="text"
              placeholder="Aa"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 px-4 py-2 rounded-full outline-none text-sm"
              style={{
                background: "#F5F5F5",
                border: "1.5px solid #EBEBEB",
                color: "#333",
              }}
            />

            {/* Mic */}
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-orange-50 transition-colors"
            >
              <Mic size={18} style={{ color: "#F97316" }} />
            </button>

            {/* Send */}
            <button
              onClick={handleSend}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:opacity-90 active:scale-95"
              style={{
                background: input.trim() ? "#F97316" : "#F0D5C8",
              }}
            >
              <Send size={16} style={{ color: "white" }} />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
