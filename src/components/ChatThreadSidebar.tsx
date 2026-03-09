import { Plus, MessageSquare, Trash2, X } from "lucide-react";
import type { ChatThread } from "@/hooks/useChatThreads";

interface ChatThreadSidebarProps {
  threads: ChatThread[];
  activeThreadId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  open: boolean;
  onClose: () => void;
}

const ChatThreadSidebar = ({
  threads,
  activeThreadId,
  onSelect,
  onCreate,
  onDelete,
  open,
  onClose,
}: ChatThreadSidebarProps) => {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-card border-r border-border z-50 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-display font-semibold text-foreground">Chats</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={onCreate}
              className="p-2 rounded-xl hover:bg-muted transition-colors text-primary"
              title="New Chat"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {threads.map((thread) => (
            <div
              key={thread.id}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                thread.id === activeThreadId
                  ? "bg-primary/15 text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              onClick={() => {
                onSelect(thread.id);
                onClose();
              }}
            >
              <MessageSquare size={16} className="shrink-0" />
              <span className="flex-1 text-sm truncate">{thread.title}</span>
              {threads.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(thread.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-destructive/20 hover:text-destructive transition-all"
                  title="Delete thread"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ChatThreadSidebar;
