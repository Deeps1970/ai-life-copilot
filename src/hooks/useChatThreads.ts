import { useState, useEffect, useCallback } from "react";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}

const STORAGE_KEY = "chatThreads";
const ACTIVE_THREAD_KEY = "activeThreadId";

const createDefaultThread = (): ChatThread => ({
  id: crypto.randomUUID(),
  title: "New Chat",
  messages: [
    { role: "assistant", content: "Hi! I'm your AI Life Coach 🤖 Ask me anything about improving your lifestyle." },
  ],
  createdAt: Date.now(),
});

const loadThreads = (): ChatThread[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [createDefaultThread()];
};

const loadActiveId = (threads: ChatThread[]): string => {
  try {
    const id = localStorage.getItem(ACTIVE_THREAD_KEY);
    if (id && threads.some((t) => t.id === id)) return id;
  } catch {}
  return threads[0].id;
};

export function useChatThreads() {
  const [threads, setThreads] = useState<ChatThread[]>(loadThreads);
  const [activeThreadId, setActiveThreadId] = useState<string>(() => loadActiveId(loadThreads()));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_THREAD_KEY, activeThreadId);
  }, [activeThreadId]);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  const createThread = useCallback(() => {
    const newThread = createDefaultThread();
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
  }, []);

  const switchThread = useCallback((id: string) => {
    setActiveThreadId(id);
  }, []);

  const clearThread = useCallback(() => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId
          ? {
              ...t,
              messages: [
                { role: "assistant" as const, content: "Hi! I'm your AI Life Coach 🤖 Ask me anything about improving your lifestyle." },
              ],
            }
          : t
      )
    );
  }, [activeThreadId]);

  const deleteThread = useCallback(
    (id: string) => {
      setThreads((prev) => {
        const filtered = prev.filter((t) => t.id !== id);
        if (filtered.length === 0) {
          const newThread = createDefaultThread();
          setActiveThreadId(newThread.id);
          return [newThread];
        }
        if (id === activeThreadId) {
          setActiveThreadId(filtered[0].id);
        }
        return filtered;
      });
    },
    [activeThreadId]
  );

  const setMessages = useCallback(
    (updater: (prev: ChatMessage[]) => ChatMessage[]) => {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId ? { ...t, messages: updater(t.messages) } : t
        )
      );
    },
    [activeThreadId]
  );

  const updateThreadTitle = useCallback(
    (id: string, firstUserMessage: string) => {
      const title = firstUserMessage.length > 30 ? firstUserMessage.slice(0, 30) + "…" : firstUserMessage;
      setThreads((prev) =>
        prev.map((t) => (t.id === id ? { ...t, title } : t))
      );
    },
    []
  );

  return {
    threads,
    activeThread,
    activeThreadId,
    createThread,
    switchThread,
    clearThread,
    deleteThread,
    setMessages,
    updateThreadTitle,
  };
}
