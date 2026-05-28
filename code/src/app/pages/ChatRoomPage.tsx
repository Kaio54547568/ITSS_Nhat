import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Mic, Send, Smile } from "lucide-react";
import { ContactsList } from "../components/ContactsList";
import { Layout } from "../components/Layout";
import { useAppData } from "../store/AppDataContext";
import { supabase } from "../supabase";

function EmojiPickerPanel({ emojis, onSelect }: { emojis: string[]; onSelect: (emoji: string) => void }) {
  return (
    <div
      className="absolute grid grid-cols-6 gap-1 p-3 rounded-2xl"
      style={{
        left: 16,
        bottom: 64,
        width: "min(300px, calc(100vw - 32px))",
        maxHeight: 280,
        overflowY: "auto",
        background: "white",
        border: "1.5px solid #F5DDD0",
        boxShadow: "0 12px 36px rgba(0,0,0,0.16)",
        zIndex: 60,
      }}
    >
      {emojis.length === 0 ? (
        <span className="col-span-6 py-3 text-center" style={{ color: "#AAAAAA", fontSize: "0.82rem" }}>絵文字は未設定です</span>
      ) : (
        emojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onSelect(emoji)}
            className="w-10 h-10 rounded-full hover:bg-orange-50 transition-colors"
            style={{ fontSize: "1.3rem", lineHeight: 1 }}
          >
            {emoji}
          </button>
        ))
      )}
    </div>
  );
}

export function ChatRoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const contactId = Number(id ?? "0");
  const { currentUser, getUserById, getThreadByProfileId, markThreadRead, sendMessage } = useAppData();
  const contact = getUserById(contactId);
  const thread = getThreadByProfileId(contactId);
  const [input, setInput] = useState("");
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [emojiList, setEmojiList] = useState<string[]>([]);
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiRootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase
        .from("reference_options")
        .select("kind, value")
        .in("kind", ["emoji", "conversation_topic"])
        .order("sort_order", { ascending: true });
      if (error) {
        console.error("Failed to load chat reference options", error);
        return;
      }
      setEmojiList((data ?? []).filter((option) => option.kind === "emoji").map((option) => option.value));
      setSuggestedTopics((data ?? []).filter((option) => option.kind === "conversation_topic").map((option) => option.value));
    })();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages]);

  useEffect(() => {
    if (thread) markThreadRead(thread.id);
  }, [markThreadRead, thread?.id]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!emojiRootRef.current?.contains(event.target as Node)) setIsEmojiOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const handleSend = () => {
    if (!thread || !input.trim()) return;
    sendMessage(thread.id, input);
    setInput("");
    setIsEmojiOpen(false);
    inputRef.current?.focus();
  };

  const handleEmojiSelect = (emoji: string) => {
    setInput((prev) => `${prev}${emoji}`);
    inputRef.current?.focus();
  };

  const handleTopicClick = (topic: string) => {
    setInput(topic);
    inputRef.current?.focus();
  };

  if (!contact || !thread) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full" style={{ background: "#fff7f2" }}>
          <p style={{ color: "#999" }}>チャットが見つかりません</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex" style={{ height: "calc(100vh - 57px)" }}>
        <div className="w-72 flex-shrink-0 h-full hidden md:block">
          <ContactsList activeId={contactId} />
        </div>

        <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ background: "#FFFFFF" }}>
          <div
            className="flex items-center gap-3 px-5 py-3 flex-shrink-0 cursor-pointer hover:bg-orange-50 transition-colors"
            style={{ borderBottom: "1.5px solid #F5DDD0", background: "white" }}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => navigate(`/review/${contactId}`)}>
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl" style={{ background: contact.avatarColor }}>
                  {contact.avatarEmoji}
                </div>
                {contact.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white" style={{ background: "#22C55E" }} />
                )}
              </div>

              <div className="min-w-0">
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "#1A1A1A" }}>{contact.name}</div>
                <div style={{ fontSize: "0.78rem", color: contact.online ? "#22C55E" : "#AAAAAA" }}>
                  {contact.online ? "オンライン中" : "オフライン"}
                </div>
              </div>
            </div>

            <div className="flex-shrink-0" />
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
            {thread.messages.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <p style={{ color: "#CCCCCC", fontSize: "0.9rem" }}>
                  まだメッセージがありません。最初のメッセージを送りましょう!
                </p>
              </div>
            )}

            {thread.messages.map((message, idx) => {
              const previous = thread.messages[idx - 1];
              const showTime = idx === 0 || previous?.createdAt.slice(0, 16) !== message.createdAt.slice(0, 16);
              const isMine = message.senderId === currentUser.id;
              const time = new Date(message.createdAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });

              return (
                <div key={message.id}>
                  {showTime && (
                    <div className="flex items-center justify-center mb-2">
                      <span className="px-3 py-0.5 rounded-full text-xs" style={{ background: "#F5F5F5", color: "#AAAAAA" }}>
                        {time}
                      </span>
                    </div>
                  )}

                  {isMine ? (
                    <div className="flex justify-end">
                      <div
                        className="px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-xs whitespace-pre-line"
                        style={{ background: "#F97316", color: "white", fontSize: "0.9rem", lineHeight: 1.5 }}
                      >
                        {message.text}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-end gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ background: contact.avatarColor }}>
                        {contact.avatarEmoji}
                      </div>
                      <div
                        className="px-4 py-2.5 rounded-2xl rounded-tl-sm max-w-xs whitespace-pre-line"
                        style={{ background: "#F5F5F5", color: "#1A1A1A", fontSize: "0.9rem", lineHeight: 1.5 }}
                      >
                        {message.text}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {suggestedTopics.length > 0 && (
            <div className="px-4 py-2 flex-shrink-0" style={{ borderTop: "1px solid #F5DDD0", background: "#FAFAFA" }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span style={{ fontSize: "0.75rem", color: "#AAAAAA" }}>💡</span>
                <span style={{ fontSize: "0.75rem", color: "#AAAAAA" }}>提案されたトピック</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {suggestedTopics.slice(0, 2).map((topic) => (
                  <button
                    key={topic}
                    type="button"
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
          )}

          <div
            ref={emojiRootRef}
            className="flex items-center gap-2 px-4 py-3 flex-shrink-0 relative"
            style={{ borderTop: "1.5px solid #F5DDD0", background: "white", minHeight: 64 }}
          >
            {isEmojiOpen && <EmojiPickerPanel emojis={emojiList} onSelect={handleEmojiSelect} />}

            <button
              type="button"
              onClick={() => setIsEmojiOpen((prev) => !prev)}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-orange-50 transition-colors"
              aria-label="絵文字を選択"
            >
              <Smile size={20} style={{ color: "#F97316" }} />
            </button>

            <input
              ref={inputRef}
              type="text"
              placeholder="Aa"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 px-4 py-2 rounded-full outline-none text-sm"
              style={{ background: "#F5F5F5", border: "1.5px solid #EBEBEB", color: "#333" }}
            />

            <button
              type="button"
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-orange-50 transition-colors"
              aria-label="音声入力"
            >
              <Mic size={18} style={{ color: "#F97316" }} />
            </button>

            <button
              type="button"
              onClick={handleSend}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:opacity-90 active:scale-95"
              style={{ background: input.trim() ? "#F97316" : "#F0D5C8" }}
              aria-label="送信"
            >
              <Send size={16} style={{ color: "white" }} />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
