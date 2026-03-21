import { useState, useRef, useEffect } from "react";

type Conversation = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  online?: boolean;
  avatarEmoji: string;
};

type ChatMessage = {
  id: string;
  fromMe: boolean;
  text: string;
  time: string;
};

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    name: "Marie Laurent",
    lastMessage: "Super, à ce soir pour le film !",
    time: "2min",
    unread: 3,
    online: true,
    avatarEmoji: "👩",
  },
  {
    id: "2",
    name: "Thomas Dubois",
    lastMessage: "Tu as vu le dernier Nolan ?",
    time: "1h",
    avatarEmoji: "🧑",
  },
  {
    id: "3",
    name: "Sophie Martin",
    lastMessage: "Merci pour la reco !",
    time: "Hier",
    unread: 1,
    online: true,
    avatarEmoji: "👩‍🦰",
  },
];

const MOCK_THREAD: Record<string, ChatMessage[]> = {
  "1": [
    { id: "m1", fromMe: false, text: "Salut ! Tu es dispo pour aller voir Dune ce soir ?", time: "14:28" },
    { id: "m2", fromMe: true, text: "Oui carrément, quelle heure ?", time: "14:29" },
    { id: "m3", fromMe: false, text: "Super, à ce soir pour le film !", time: "14:30" },
  ],
};

export const MessagesView = () => {
  const [conversations] = useState(MOCK_CONVERSATIONS);
  const [activeId, setActiveId] = useState("1");
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_THREAD["1"] ?? []);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];

  useEffect(() => {
    setMessages(MOCK_THREAD[activeId] ?? []);
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeId]);

  const filtered = conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    setMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, fromMe: true, text: input.trim(), time },
    ]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-black pt-16 flex flex-col text-white">
      <div className="flex flex-1 min-h-[calc(100vh-4rem)] max-w-[1600px] mx-auto w-full">
        <aside className="w-full max-w-[360px] shrink-0 border-r border-gray-800/80 bg-[#0d0d0f] flex flex-col">
          <div className="p-4 border-b border-gray-800/80">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="search"
                placeholder="Rechercher une conversation.."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#1a1a1e] border border-gray-800 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#9747FF]/50"
              />
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                    activeId === c.id ? "bg-[#9747FF]/15 border-l-2 border-[#9747FF]" : "hover:bg-white/5 border-l-2 border-transparent"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-[#9747FF]/40 flex items-center justify-center text-xl">
                      {c.avatarEmoji}
                    </div>
                    {c.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#0d0d0f]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm truncate">{c.name}</span>
                      <span className="text-[11px] text-gray-500 shrink-0">{c.time}</span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{c.lastMessage}</p>
                  </div>
                  {c.unread != null && c.unread > 0 && (
                    <span className="shrink-0 min-w-[22px] h-[22px] px-1.5 rounded-full bg-[#9747FF] text-[11px] font-bold flex items-center justify-center">
                      {c.unread > 9 ? "9+" : c.unread}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="flex-1 flex flex-col min-w-0 bg-[#0a0a0c]">
          <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800/80 bg-[#0d0d0f]/90">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#9747FF]/40 flex items-center justify-center text-lg">
                  {active?.avatarEmoji}
                </div>
                {active?.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0d0d0f]" />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-white">{active?.name}</h2>
                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  {active?.online ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      En ligne
                    </>
                  ) : (
                    "Hors ligne"
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="p-2.5 rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-colors" aria-label="Appel">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              <button type="button" className="p-2.5 rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-colors" aria-label="Vidéo">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button type="button" className="p-2.5 rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-colors" aria-label="Plus">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[min(72%,480px)] rounded-2xl px-4 py-3 relative ${
                    m.fromMe
                      ? "bg-[#9747FF] text-white rounded-br-md"
                      : "bg-[#1f1f24] text-gray-100 rounded-bl-md border border-gray-800/80"
                  }`}
                >
                  <p className="text-sm leading-relaxed pr-14">{m.text}</p>
                  <span
                    className={`absolute bottom-2 right-3 text-[10px] flex items-center gap-1 ${
                      m.fromMe ? "text-white/80" : "text-gray-500"
                    }`}
                  >
                    {m.time}
                    {m.fromMe && (
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                    )}
                  </span>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendMessage} className="p-4 border-t border-gray-800/80 bg-[#0d0d0f]">
            <div className="flex items-end gap-2 max-w-4xl mx-auto">
              <div className="flex-1 relative flex items-center rounded-2xl bg-[#1a1a1e] border border-gray-800 focus-within:ring-2 focus-within:ring-[#9747FF]/40">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="flex-1 bg-transparent px-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none rounded-2xl"
                />
                <div className="flex items-center gap-1 pr-2 pb-1">
                  <button type="button" className="p-2 text-gray-500 hover:text-[#9747FF] rounded-lg" aria-label="Pièce jointe">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  <button type="button" className="p-2 text-gray-500 hover:text-[#9747FF] rounded-lg" aria-label="Image">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button type="button" className="p-2 text-gray-500 hover:text-[#9747FF] rounded-lg" aria-label="Emoji">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="shrink-0 w-12 h-12 rounded-full bg-[#9747FF] text-white flex items-center justify-center hover:bg-[#8a3ae6] shadow-lg shadow-[#9747FF]/30 transition-colors"
                aria-label="Envoyer"
              >
                <svg className="w-5 h-5 -rotate-45 translate-x-0.5 -translate-y-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};
