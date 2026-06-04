import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search } from "lucide-react";
import { useAppData } from "../store/AppDataContext";

interface ContactsListProps {
  activeId?: number;
}

export function ContactsList({ activeId }: ContactsListProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { currentUser, chatThreads, getUserById, getFriendshipStatus, markThreadRead } = useAppData();

  const contacts = useMemo(() => {
    const contactsByUserId = new Map<
      string,
      {
        thread: (typeof chatThreads)[number];
        user: NonNullable<ReturnType<typeof getUserById>>;
        unread: number;
        time: string;
      }
    >();

    for (const thread of chatThreads) {
      const otherId = thread.participantIds.find((id) => id !== currentUser.id);
      const user = getUserById(otherId);
      if (!user || getFriendshipStatus(user.id) !== "friend") continue;

      const lastMessageTime = thread.messages.at(-1)?.createdAt;
      if (!contactsByUserId.has(user.id)) {
        contactsByUserId.set(user.id, {
          thread,
          user,
          unread: thread.unreadCountByUserId[currentUser.id] ?? 0,
          time: lastMessageTime
            ? new Date(lastMessageTime).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })
            : "",
        });
      }
    }

    return Array.from(contactsByUserId.values()).filter(
      (item) => item.user.name.includes(search) || item.thread.lastMessage.includes(search),
    );
  }, [chatThreads, currentUser.id, getFriendshipStatus, getUserById, search]);

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: "#FFF8F4", borderRight: "1.5px solid #F5DDD0" }}
    >
      <div className="p-3 flex-shrink-0">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-full"
          style={{ background: "white", border: "1.5px solid #F0D5C8" }}
        >
          <Search size={14} style={{ color: "#AAAAAA" }} />
          <input
            type="text"
            placeholder="チャットを検索"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="flex-1 outline-none text-sm bg-transparent"
            style={{ color: "#555" }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {contacts.map(({ thread, user, unread, time }) => {
          const isActive = user.profileId === activeId;
          return (
            <button
              key={thread.id}
              onClick={() => {
                markThreadRead(thread.id);
                navigate(`/chat/${user.profileId}`);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 text-left transition-colors"
              style={{
                background: isActive ? "#FEE6D5" : "transparent",
                borderBottom: "1px solid #F5DDD0",
              }}
            >
              <div className="relative flex-shrink-0">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                  style={{ background: user.avatarColor }}
                >
                  {user.avatarEmoji}
                </div>
                <div
                  className="absolute bottom-0 right-1 w-3 h-3 rounded-full border-2 border-white"
                  style={{ background: user.online ? "#22C55E" : "#A3A3A3" }}
                  aria-label={user.online ? "オンライン" : "オフライン"}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span
                    style={{
                      fontWeight: 600,
                      color: isActive ? "#F97316" : "#E8641A",
                      fontSize: "0.9rem",
                    }}
                  >
                    {user.name}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#AAAAAA", flexShrink: 0 }}>
                    {time}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5 gap-1">
                  <span className="truncate" style={{ fontSize: "0.8rem", color: "#888" }}>
                    {thread.lastMessage || "まだメッセージがありません"}
                  </span>
                  {unread > 0 && (
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0"
                      style={{
                        background: "#F97316",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                      }}
                    >
                      {unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
