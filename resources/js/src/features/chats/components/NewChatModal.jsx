import { useEffect, useMemo, useState } from 'react';
import { UserAvatar } from '../../../shared/components/UserAvatar';
import { getUsers } from '../../../services/api/users.service';

function normalize(value) {
    return String(value || '').trim().toLowerCase();
}

export function NewChatModal({ isOpen, onClose, onSelectUser, currentUserId }) {
    const [users, setUsers] = useState([]);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        let isMounted = true;

        async function loadUsers() {
            setIsLoading(true);
            setError('');

            try {
                const response = await getUsers({ per_page: 50 });

                if (!isMounted) {
                    return;
                }

                const items = response?.data || [];
                setUsers(items.filter((item) => item?.id && item.id !== currentUserId));
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

                                    <span className="rounded-full bg-[#25F2A0] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-black transition group-hover:bg-[#2cffaa]">
                                        Select
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

