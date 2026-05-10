import { useState } from "react";
import { useNavigate } from "react-router";
import { Search } from "lucide-react";
import { mockContacts } from "../data/mockData";

interface ContactsListProps {
  activeId?: number;
}

export function ContactsList({ activeId }: ContactsListProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = mockContacts.filter((c) =>
    c.name.includes(search) || c.lastMessage.includes(search)
  );

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: "#FFF8F4", borderRight: "1.5px solid #F5DDD0" }}
    >
      {/* Search box */}
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
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none text-sm bg-transparent"
            style={{ color: "#555" }}
          />
        </div>
      </div>

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((contact) => {
          const isActive = contact.id === activeId;
          return (
            <button
              key={contact.id}
              onClick={() => navigate(`/chat/${contact.id}`)}
              className="w-full flex items-center gap-3 px-3 py-3 text-left transition-colors"
              style={{
                background: isActive ? "#FEE6D5" : "transparent",
                borderBottom: "1px solid #F5DDD0",
              }}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                  style={{ background: contact.avatarColor }}
                >
                  {contact.avatarEmoji}
                </div>
                {contact.online && (
                  <div
                    className="absolute bottom-0 right-1 w-3 h-3 rounded-full border-2 border-white"
                    style={{ background: "#22C55E" }}
                  />
                )}
                <span
                  className="absolute -bottom-1 -right-0.5 text-xs"
                  style={{ lineHeight: 1 }}
                >
                  {contact.flag}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span
                    style={{
                      fontWeight: 600,
                      color: isActive ? "#F97316" : "#E8641A",
                      fontSize: "0.9rem",
                    }}
                  >
                    {contact.name}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#AAAAAA", flexShrink: 0 }}>
                    {contact.time}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5 gap-1">
                  <span
                    className="truncate"
                    style={{ fontSize: "0.8rem", color: "#888" }}
                  >
                    {contact.lastMessage}
                  </span>
                  {contact.unread > 0 && (
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0"
                      style={{
                        background: "#F97316",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                      }}
                    >
                      {contact.unread}
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
