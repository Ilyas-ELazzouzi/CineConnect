import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { io, type Socket } from "socket.io-client";
import { Route } from "../routes/messages";
import { dmRoomIdForPair, fetchPublicProfile } from "../lib/userPublic";
import {
  getSocketUrl,
  fetchRoomMessages,
  fetchConversations,
  type ApiMessage,
  type ConversationSummary,
} from "../lib/messages";
import { useAuthStore } from "../hooks";

type ChatMessage = {
  id: string;
  fromMe: boolean;
  text: string;
  time: string;
};

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function mapApiToChat(m: ApiMessage, myId: string): ChatMessage {
  return {
    id: m.id,
    fromMe: m.userId === myId,
    text: m.content,
    time: formatTime(m.createdAt),
  };
}

export const MessagesView = () => {
  const { with: withUserId } = Route.useSearch();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [peerName, setPeerName] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [listFilter, setListFilter] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const activeRoomIdRef = useRef<string | null>(null);
  const userRef = useRef(user);
  userRef.current = user;

  const loadConversations = useCallback(async () => {
    if (!token) return;
    try {
      const list = await fetchConversations(token);
      setConversations(list);
    } catch {
      setConversations([]);
    }
  }, [token]);

  useEffect(() => {
    if (!withUserId) {
      setPeerName(null);
      return;
    }
    let cancelled = false;
    void fetchPublicProfile(withUserId, token)
      .then((r) => {
        if (!cancelled) setPeerName(r.profile.username);
      })
      .catch(() => {
        if (!cancelled) setPeerName(null);
      });
    return () => {
      cancelled = true;
    };
  }, [withUserId, token]);

  useEffect(() => {
    if (!token || !user) {
      setLoadingList(false);
      return;
    }
    void loadConversations().finally(() => setLoadingList(false));
  }, [token, user, loadConversations]);

  useEffect(() => {
    if (!token || !user) return;

    const s = io(getSocketUrl(), {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = s;

    s.on("connect", () => {
      const r = activeRoomIdRef.current;
      if (r) s.emit("room:join", r);
    });

    s.on(
      "message:new",
      (payload: {
        message: {
          id?: string;
          roomId: string;
          userId: string;
          content: string;
          createdAt: string | Date;
        };
        user: { id: string; username: string };
      }) => {
        if (payload.message.roomId !== activeRoomIdRef.current) return;
        const me = userRef.current;
        if (!me) return;
        const iso =
          typeof payload.message.createdAt === "string"
            ? payload.message.createdAt
            : payload.message.createdAt instanceof Date
              ? payload.message.createdAt.toISOString()
              : new Date().toISOString();
        setMessages((prev) => [
          ...prev,
          {
            id: payload.message.id ?? `evt-${Date.now()}`,
            fromMe: payload.message.userId === me.id,
            text: payload.message.content,
            time: formatTime(iso),
          },
        ]);
        void loadConversations();
      },
    );

    s.on("message:error", (p: { error?: string }) => {
      setSendError(p.error ?? "Envoi impossible");
    });

    return () => {
      s.removeAllListeners();
      s.disconnect();
      socketRef.current = null;
    };
  }, [token, user, loadConversations]);

  useEffect(() => {
    if (!token || !user || !withUserId) {
      activeRoomIdRef.current = null;
      setMessages([]);
      return;
    }
    if (withUserId === user.id) {
      activeRoomIdRef.current = null;
      setMessages([]);
      return;
    }

    const roomId = dmRoomIdForPair(user.id, withUserId);
    activeRoomIdRef.current = roomId;

    const sock = socketRef.current;
    if (sock?.connected) {
      sock.emit("room:join", roomId);
    }

    let cancelled = false;
    setLoadingThread(true);
    void fetchRoomMessages(roomId, token)
      .then((rows) => {
        if (cancelled) return;
        setMessages(rows.map((m) => mapApiToChat(m, user.id)));
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingThread(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, user, withUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openConversation = (peerId: string) => {
    navigate({ to: "/messages", search: { with: peerId } });
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !token || !user || !withUserId || withUserId === user.id) return;
    const roomId = dmRoomIdForPair(user.id, withUserId);
    const sock = socketRef.current;
    if (!sock?.connected) {
      setSendError("Connexion temps réel indisponible. Réessayez.");
      return;
    }
    setSendError(null);
    sock.emit("message:send", { roomId, content: input.trim() });
    setInput("");
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.peerUsername.toLowerCase().includes(listFilter.toLowerCase()) ||
      (c.lastContent?.toLowerCase().includes(listFilter.toLowerCase()) ?? false),
  );

  const activePeer = withUserId
    ? conversations.find((c) => c.peerId === withUserId)
    : undefined;

  if (!user || !token) {
    return (
      <div className="min-h-screen bg-black pt-24 px-4 flex flex-col items-center justify-center text-center">
        <p className="text-gray-300 mb-6 max-w-md">
          Connectez-vous pour accéder à vos messages et discuter avec d’autres membres.
        </p>
        <Link
          to="/login"
          className="rounded-xl bg-[#9747FF] px-8 py-3 font-semibold text-white hover:bg-[#7c3aed]"
        >
          Connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-16 flex flex-col text-white">
      {withUserId && (
        <div className="border-b border-[#9747FF]/25 bg-[#9747FF]/10 px-4 py-3 text-sm text-gray-200 flex flex-wrap items-center justify-between gap-3 max-w-[1600px] mx-auto w-full">
          <div className="flex flex-col gap-0.5">
            <span>
              {peerName ? (
                <>
                  Conversation avec <strong className="text-white">{peerName}</strong>
                </>
              ) : (
                <span className="text-gray-400">Chargement du contact…</span>
              )}
            </span>
            {user && withUserId && withUserId !== user.id && (
              <span className="text-[11px] text-gray-500 font-mono">
                Salon : {dmRoomIdForPair(user.id, withUserId)}
              </span>
            )}
          </div>
          <Link
            to="/user/$userId"
            params={{ userId: withUserId }}
            className="text-[#9747FF] hover:underline text-sm shrink-0"
          >
            Voir le profil
          </Link>
        </div>
      )}

      {sendError && (
        <div className="max-w-[1600px] mx-auto w-full px-4 py-2 text-sm text-red-400 bg-red-950/40 border-b border-red-900/50">
          {sendError}
        </div>
      )}

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
                value={listFilter}
                onChange={(e) => setListFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#1a1a1e] border border-gray-800 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#9747FF]/50"
              />
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 && !loadingList ? (
              <li className="px-4 py-8 text-center text-xs text-gray-500">
                Aucune conversation pour l’instant. Ouvrez un profil et cliquez sur « Message ».
              </li>
            ) : (
              filteredConversations.map((c) => {
                const isActive = withUserId === c.peerId;
                return (
                  <li key={c.roomId}>
                    <button
                      type="button"
                      onClick={() => openConversation(c.peerId)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                        isActive
                          ? "bg-[#9747FF]/15 border-l-2 border-[#9747FF]"
                          : "hover:bg-white/5 border-l-2 border-transparent"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-[#9747FF]/40 flex items-center justify-center text-lg font-semibold text-white shrink-0">
                        {c.peerUsername.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-sm truncate">{c.peerUsername}</span>
                          {c.lastAt && (
                            <span className="text-[11px] text-gray-500 shrink-0">
                              {formatTime(c.lastAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {c.lastContent ?? "…"}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </aside>

        <section className="flex-1 flex flex-col min-w-0 bg-[#0a0a0c]">
          <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800/80 bg-[#0d0d0f]/90">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#9747FF]/40 flex items-center justify-center text-lg font-semibold text-white">
                {(activePeer?.peerUsername ?? peerName ?? "?").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h2 className="font-semibold text-white">
                  {activePeer?.peerUsername ?? peerName ?? (withUserId ? "…" : "Messages")}
                </h2>
                <p className="text-xs text-gray-400">
                  {withUserId ? "Discussion privée" : "Sélectionnez une conversation"}
                </p>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {!withUserId ? (
              <p className="text-center text-gray-500 text-sm mt-12">
                Choisissez une conversation dans la liste ou ouvrez un profil et cliquez sur « Message ».
              </p>
            ) : withUserId === user.id ? (
              <p className="text-center text-amber-400 text-sm mt-12">
                Vous ne pouvez pas vous envoyer un message à vous-même.
              </p>
            ) : loadingThread ? (
              <p className="text-center text-gray-500 text-sm mt-12">Chargement des messages…</p>
            ) : messages.length === 0 ? (
              <p className="text-center text-gray-500 text-sm mt-12">
                Aucun message pour l’instant. Envoyez le premier !
              </p>
            ) : (
              messages.map((m) => (
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
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendMessage} className="p-4 border-t border-gray-800/80 bg-[#0d0d0f]">
            <div className="flex items-end gap-2 max-w-4xl mx-auto">
              <div className="flex-1 relative flex items-center rounded-2xl bg-[#1a1a1e] border border-gray-800 focus-within:ring-2 focus-within:ring-[#9747FF]/40">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    withUserId && withUserId !== user.id
                      ? "Écrivez votre message…"
                      : "Sélectionnez une conversation"
                  }
                  disabled={!withUserId || withUserId === user.id}
                  className="flex-1 bg-transparent px-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none rounded-2xl disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={!withUserId || withUserId === user.id || !input.trim()}
                className="shrink-0 w-12 h-12 rounded-full bg-[#9747FF] text-white flex items-center justify-center hover:bg-[#8a3ae6] shadow-lg shadow-[#9747FF]/30 transition-colors disabled:opacity-40"
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
