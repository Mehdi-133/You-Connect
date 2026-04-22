import { useEffect, useMemo, useState } from 'react';
import { UserAvatar } from '../../../shared/components/UserAvatar';
import { getUsers } from '../../../services/api/users.service';
import { getChats } from '../../../services/api/chats.service';
import { getChatMessages } from '../../../services/api/messages.service';

function normalize(value) {
    return String(value || '').trim().toLowerCase();
}

function getPeerId(chat, currentUserId) {
    const members = Array.isArray(chat?.members) ? chat.members : [];
    const peer = members.find((member) => member?.id && member.id !== currentUserId);
    return peer?.id || null;
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

export function NewChatModal({ isOpen, onClose, onSelectUser, currentUserId }) {
    const [users, setUsers] = useState([]);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [unreadByUserId, setUnreadByUserId] = useState({});
    const [hasChatByUserId, setHasChatByUserId] = useState({});

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        let isMounted = true;

        async function loadUsers() {
            setIsLoading(true);
            setError('');
            setUnreadByUserId({});
            setHasChatByUserId({});

            try {
                const [usersResponse, chatsResponse] = await Promise.all([
                    getUsers({ per_page: 50 }),
                    getChats({ page: 1 }),
                ]);

                if (!isMounted) {
                    return;
                }

                const items = usersResponse?.data || [];
                setUsers(items.filter((item) => item?.id && item.id !== currentUserId));

                const chats = chatsResponse?.data || [];
                const privateChats = chats.filter((chat) => chat?.type === 'private');

                // Build a peerId -> chatId map so we can show message totals for existing 1:1 chats.
                const peerToChatId = privateChats.reduce((acc, chat) => {
                    const peerId = getPeerId(chat, currentUserId);
                    if (peerId && chat?.id) {
                        acc[peerId] = chat.id;
                    }
                    return acc;
                }, {});

                // Avoid a request storm: only fetch totals for up to 15 existing chats.
                const peerIds = Object.keys(peerToChatId).slice(0, 15);
                if (!peerIds.length) {
                    return;
                }

                const unreadMap = {};
                const hasChatMap = {};
                await Promise.all(
                    peerIds.map(async (peerId) => {
                        const chatId = peerToChatId[peerId];
                        try {
                            const messagesResponse = await getChatMessages(chatId, { page: 1 });
                            hasChatMap[peerId] = true;
                            const latestId = messagesResponse?.data?.[0]?.id || null;
                            const lastSeen = getLastSeenMessageId(chatId);
                            unreadMap[peerId] = Boolean(latestId && latestId !== lastSeen);
                        } catch {
                            hasChatMap[peerId] = true;
                            unreadMap[peerId] = false;
                        }
                    })
                );

                if (isMounted) {
                    setUnreadByUserId(unreadMap);
                    setHasChatByUserId(hasChatMap);
                }
            } catch (requestError) {
                if (!isMounted) {
                    return;
                }

                setError(
                    requestError.response?.data?.message ||
                    'We could not load users right now.'
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadUsers();

        return () => {
            isMounted = false;
        };
    }, [isOpen, currentUserId]);

    const filteredUsers = useMemo(() => {
        const q = normalize(query);
        if (!q) {
            return users;
        }

        return users.filter((user) => normalize(user.name).includes(q));
    }, [users, query]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <button
                type="button"
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
                aria-label="Close new chat"
            />

            <div className="relative w-full max-w-[620px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0B0126] shadow-[10px_10px_0_rgba(0,0,0,0.85)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(163,77,255,0.20),transparent_28%),radial-gradient(circle_at_10%_18%,rgba(37,242,160,0.10),transparent_26%),radial-gradient(circle_at_85%_90%,rgba(255,211,39,0.10),transparent_30%)]" />

                <div className="relative border-b border-white/10 p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#25F2A0]">
                                New chat
                            </p>
                            <p className="mt-2 font-display text-3xl font-extrabold text-[#FFF3DC]">
                                Start a 1-to-1 conversation
                            </p>
                            <p className="mt-2 text-sm leading-7 text-[#d8cfbd]">
                                Pick a user. If a private chat already exists, we will open it.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#FFF3DC] transition hover:bg-white/10"
                        >
                            Close
                        </button>
                    </div>

                    <div className="mt-4">
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search users by name..."
                            className="w-full rounded-[1.4rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                        />
                    </div>
                </div>

                <div className="relative max-h-[55vh] overflow-auto p-4">
                    {isLoading ? (
                        <p className="p-4 text-sm font-bold text-[#d8cfbd]">Loading users...</p>
                    ) : error ? (
                        <p className="p-4 text-sm font-bold text-[#FFD327]">{error}</p>
                    ) : filteredUsers.length ? (
                        <div className="grid gap-2">
                            {filteredUsers.map((user) => (
                                <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => onSelectUser(user)}
                                    className="group flex w-full items-center justify-between gap-3 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10"
                                >
                                    <span className="flex min-w-0 items-center gap-3">
                                        <UserAvatar name={user.name} photo={user.photo} size="sm" />
                                        <span className="min-w-0">
                                            <span className="block truncate text-sm font-extrabold text-[#FFF3DC]">
                                                {user.name}
                                            </span>
                                            <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#d8cfbd]">
                                                Start private chat
                                            </span>
                                        </span>
                                    </span>

                                    <span className="flex items-center gap-2">
                                        {hasChatByUserId?.[user.id] ? (
                                            unreadByUserId?.[user.id] ? (
                                                <span className="rounded-full border border-white/10 bg-[#FFD327] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-black shadow-[3px_3px_0_rgba(0,0,0,0.8)]">
                                                    Unread
                                                </span>
                                            ) : null
                                        ) : (
                                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#FFF3DC]">
                                                New
                                            </span>
                                        )}

                                        <span className="rounded-full bg-[#25F2A0] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-black transition group-hover:bg-[#2cffaa]">
                                            Chat
                                        </span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="p-4 text-sm font-bold text-[#d8cfbd]">No users match your search.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
