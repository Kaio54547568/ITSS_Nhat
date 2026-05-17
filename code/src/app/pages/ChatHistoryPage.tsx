import { Layout } from "../components/Layout";
import { ContactsList } from "../components/ContactsList";
import { MessageSquare } from "lucide-react";

export function ChatHistoryPage() {
  return (
    <Layout>
      <div className="flex" style={{ height: "calc(100vh - 57px)" }}>
        {/* Left panel – contacts */}
        <div className="w-72 flex-shrink-0 h-full">
          <ContactsList />
        </div>

        {/* Right panel – empty state */}
        <div
          className="flex-1 flex flex-col items-center justify-center gap-4"
          style={{ background: "#fff7f2" }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "rgba(249,115,22,0.12)" }}
          >
            <MessageSquare size={32} style={{ color: "#F97316" }} />
          </div>
          <p style={{ color: "#BBBBBB", fontSize: "1rem" }}>
            チャットを選択してください
          </p>
        </div>
      </div>
    </Layout>
  );
}
