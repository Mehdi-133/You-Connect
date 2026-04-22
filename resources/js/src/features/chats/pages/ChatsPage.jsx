import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SectionCard } from '../../../shared/components/SectionCard';
import { LoadingState } from '../../../shared/ui/feedback/LoadingState';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';
import { EmptyState } from '../../../shared/ui/feedback/EmptyState';
import { useAuth } from '../../../hooks/useAuth';
import { UserAvatar } from '../../../shared/components/UserAvatar';
import { getChats, createChat } from '../../../services/api/chats.service';
import { getChatMessages } from '../../../services/api/messages.service';
import { NewChatModal } from '../components/NewChatModal';
import { getCachedPageData, setCachedPageData } from '../../../shared/utils/pageCache';

const CHATS_CACHE_KEY = 'page:chats';
const CHATS_CACHE_TTL_MS = 30_000;

function safeText(value, fallback = '') {
    const text = String(value || '').trim();
    return text.length ? text : fallback;
}

function getPeer(chat, currentUserId) {
    const members = Array.isArray(chat?.members) ? chat.members : [];
    return members.find((member) => member.id !== currentUserId) || members[0] || null;
}

function formatRelativeTime(value) {
    if (!value) {
        return '';
    }

    const now = new Date();
    const date = new Date(value);
    const diffMinutes = Math.max(1, Math.round((now - date) / (1000 * 60)));

    if (Number.isNaN(diffMinutes)) {
        return '';
    }

    if (diffMinutes < 60) {
        return `${diffMinutes}m`;
    }

    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) {
        return `${diffHours}h`;
    }

    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}d`;
}

function getLastSeenKey(chatId) {
    return `youconnect_chat_last_seen_${chatId}`;
}

function getLastSeenMessageId(chatId) {
    const raw = localStorage.getItem(getLastSeenKey(chatId));
    if (!raw) {
        return null;
    }

    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
}

function setLastSeenMessageId(chatId, messageId) {
    if (!chatId || !messageId) {
        return;
    }

    const numeric = Number(messageId);
    if (!Number.isFinite(numeric)) {
        return;
    }

    localStorage.setItem(getLastSeenKey(chatId), String(numeric));
    window.dispatchEvent(new CustomEvent('youconnect:chat-seen', { detail: { chatId: String(chatId), messageId: numeric } }));
}

export function ChatsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [chats, setChats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState('');
    const [isNewChatOpen, setIsNewChatOpen] = useState(false);
    const [latestMessageByChatId, setLatestMessageByChatId] = useState({});

    useEffect(() => {
        let isMounted = true;

        const cached = getCachedPageData(CHATS_CACHE_KEY, CHATS_CACHE_TTL_MS);
        if (cached?.chats) {
            setChats(cached.chats);
            setLatestMessageByChatId(cached.latestByChatId || {});
            setIsLoading(false);
        }

        async function loadChats() {
            if (!cached?.chats) {
                setIsLoading(true);
            }
            setError('');

            try {
                const response = await getChats();

                if (!isMounted) {
                    return;
                }

                const items = response?.data || [];
                setChats(items);
                setCachedPageData(CHATS_CACHE_KEY, {
                    chats: items,
                    latestByChatId: cached?.latestByChatId || {},
                });

                // Best-effort: fetch latest message for visible chats so unread indicators work, but do it
                // in the background so the chat list UI can render instantly.
                Promise.all(
                    items.slice(0, 10).map(async (chat) => {
                        try {
                            const messagesResponse = await getChatMessages(chat.id, { page: 1 });
                            const latest = messagesResponse?.data?.[0] || null;
                            return [String(chat.id), latest];
                        } catch {
                            return [String(chat.id), null];
                        }
                    })
                ).then((latestPairs) => {
                    if (!isMounted) {
                        return;
                    }

                    const nextLatest = latestPairs.reduce((acc, [id, msg]) => {
                        acc[id] = msg;
                        return acc;
                    }, {});

                    setLatestMessageByChatId(nextLatest);
                    setCachedPageData(CHATS_CACHE_KEY, { chats: items, latestByChatId: nextLatest });
                });
            } catch (requestError) {
                if (!isMounted) {
                    return;
                }

                setError(
                    requestError.response?.data?.message ||
                    'We could not load chats right now.'
                );
            } finally {
                if (isMounted) {
                    if (!cached?.chats) {
                        setIsLoading(false);
                    }
                }
            }
        }

        loadChats();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!window.Echo) {
            return undefined;
        }

        const chatIds = chats.map((chat) => chat?.id).filter(Boolean);
        const channels = chatIds.map((id) => window.Echo.private(`chat.${id}`));

        channels.forEach((channel, index) => {
            const chatId = String(chatIds[index]);
            channel.listen('.message.sent', (payload) => {
                const incoming = payload?.message;
                if (!incoming?.id) {
                    return;
                }

                setLatestMessageByChatId((current) => {
                    const next = { ...(current || {}) };
                    next[chatId] = incoming;
                    return next;
                });
            });
        });

        return () => {
            chatIds.forEach((id) => window.Echo.leave(`chat.${id}`));
        };
    }, [chats]);

    const chatRows = useMemo(() => {
        return chats.map((chat) => {
            const peer = getPeer(chat, user?.id);
            const latest = latestMessageByChatId?.[String(chat.id)] || null;
            const latestId = latest?.id || null;
            const lastSeen = getLastSeenMessageId(chat.id);
            const hasUnread = Boolean(latestId && latestId !== lastSeen);
            return {
                chat,
                peer,
                title: peer?.name || safeText(chat?.name, 'Chat'),
                subtitle: peer ? 'Private chat' : 'Conversation',
                time: formatRelativeTime(latest?.created_at || chat?.updated_at || chat?.created_at),
                preview: latest?.content ? safeText(latest.content, '') : '',
                hasUnread,
            };
        });
    }, [chats, user?.id, latestMessageByChatId]);

    async function handleCreatePrivateChat(selectedUser) {
        if (!selectedUser?.id || !user?.id) {
            return;
        }

        setCreateError('');
        setIsCreating(true);

        try {
            const created = await createChat({
                type: 'private',
                member_ids: [selectedUser.id],
            });

            const chatId = created?.chat?.id || created?.id;
            const chatObject = created?.chat || created;
            if (chatObject?.id) {
                setChats((current) => {
                    const exists = current.some((item) => item.id === chatObject.id);
                    return exists ? current : [chatObject, ...current];
                });
            }

            if (chatId) {
                setIsNewChatOpen(false);
                navigate(`/app/chats/${chatId}`);
            }
        } catch (requestError) {
            const status = requestError?.response?.status;
            const existingChat = requestError?.response?.data?.chat;

            if (status === 409 && existingChat?.id) {
                setIsNewChatOpen(false);
                navigate(`/app/chats/${existingChat.id}`);
                return;
            }

            setCreateError(
                requestError?.response?.data?.message ||
                'We could not create this chat right now.'
            );
        } finally {
            setIsCreating(false);
        }
    }

    if (isLoading) {
        return (
            <LoadingState
                eyebrow="Chat"
                title="Loading your inbox"
                description="We are pulling your conversations and member list."
            />
        );
    }

    if (error) {
        return (
            <ErrorState
                eyebrow="Chat"
                title="Chat unavailable"
                description={error}
                helperText="Check that the backend is running and refresh the page."
            />
        );
    }

    if (!chatRows.length) {
        return (
            <div className="grid gap-6">
                <EmptyState
                    eyebrow="Chat"
                    title="No chats yet"
                    description="Start a private chat with a student, mentor, or teammate."
                />

                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={() => setIsNewChatOpen(true)}
                        className="festival-card rounded-full border-2 border-black bg-[#25F2A0] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[6px_6px_0_rgba(0,0,0,0.85)] transition hover:-translate-y-0.5"
                    >
                        New chat
                    </button>
                </div>

                <NewChatModal
                    isOpen={isNewChatOpen}
                    onClose={() => setIsNewChatOpen(false)}
                    onSelectUser={handleCreatePrivateChat}
                    currentUserId={user?.id}
                />
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            <SectionCard
                eyebrow="Chat"
                title="Your inbox"
                description="Private 1-to-1 conversations. Clean, fast, and focused."
                className="hero-gradient overflow-hidden"
            >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top_left,rgba(255,102,214,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(41,207,255,0.14),transparent_26%),radial-gradient(circle_at_40%_30%,rgba(255,211,39,0.10),transparent_30%)]" />

                <div className="relative flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#FFF3DC]">
                            {chatRows.length} chats
                        </span>
                        {createError ? (
                            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#FFD327]">
                                {createError}
                            </span>
                        ) : null}
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsNewChatOpen(true)}
                        disabled={isCreating}
                        className="festival-card rounded-full border-2 border-black bg-[#25F2A0] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[6px_6px_0_rgba(0,0,0,0.85)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isCreating ? 'Creating...' : 'New chat'}
                    </button>
                </div>
            </SectionCard>

            <div className="grid gap-3">
                {chatRows.map(({ chat, peer, title, subtitle, time, preview, hasUnread }) => (
                    <Link
                        key={chat.id}
                        to={`/app/chats/${chat.id}`}
                        onClick={() => {
                            const latest = latestMessageByChatId?.[String(chat.id)];
                            if (latest?.id) {
                                setLastSeenMessageId(chat.id, latest.id);
                            }
                        }}
                        className="surface group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)] p-5 shadow-[6px_6px_0_rgba(0,0,0,0.82)] transition hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_18px_48px_rgba(0,0,0,0.45)]"
                    >
                        <div className="pointer-events-none absolute inset-0 opacity-90 bg-[radial-gradient(circle_at_top_right,rgba(163,77,255,0.12),transparent_30%),radial-gradient(circle_at_10%_20%,rgba(37,242,160,0.08),transparent_26%)]" />
                        <div className="pointer-events-none absolute inset-y-0 left-0 w-[2px] bg-[linear-gradient(180deg,#29CFFF_0%,#25F2A0_45%,#FFD327_100%)] opacity-70" />

                        <div className="relative flex items-center justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-4">
                                <UserAvatar name={title} photo={peer?.photo} size="md" ringClassName="from-[#29CFFF] via-[#25F2A0] to-[#FFD327]" />
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="truncate font-display text-2xl font-extrabold text-[#FFF3DC] transition group-hover:text-[#25F2A0]">
                                            {title}
                                        </p>
                                        {hasUnread ? (
                                            <span className="inline-flex items-center gap-2 rounded-full border border-[#25F2A0]/25 bg-[#25F2A0]/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                                <span className="h-2 w-2 rounded-full bg-[#25F2A0]" />
                                                New
                                            </span>
                                        ) : null}
                                    </div>
                                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#d8cfbd]">
                                        {subtitle}
                                    </p>
                                    {preview ? (
                                        <p className="mt-2 line-clamp-1 text-sm text-white/45">
                                            {preview}
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                            <div className="shrink-0 text-right">
                                {time ? (
                                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                        {time}
                                    </p>
                                ) : null}
                                <p className="mt-2 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#FFF3DC]">
                                    Open
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <NewChatModal
                isOpen={isNewChatOpen}
                onClose={() => setIsNewChatOpen(false)}
                onSelectUser={handleCreatePrivateChat}
                currentUserId={user?.id}
            />
        </div>
    );
}
