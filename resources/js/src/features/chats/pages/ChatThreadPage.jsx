import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { SectionCard } from '../../../shared/components/SectionCard';
import { UserAvatar } from '../../../shared/components/UserAvatar';
import { LoadingState } from '../../../shared/ui/feedback/LoadingState';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';
import { getChat } from '../../../services/api/chats.service';
import { getChatMessages, sendChatMessage } from '../../../services/api/messages.service';

function safeText(value, fallback = '') {
    const text = String(value || '').trim();
    return text.length ? text : fallback;
}

function getPeer(chat, currentUserId) {
    const members = Array.isArray(chat?.members) ? chat.members : [];
    return members.find((member) => member.id !== currentUserId) || members[0] || null;
}

function dayKey(value) {
    if (!value) {
        return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return date.toDateString();
}

function formatDayLabel(value) {
    if (!value) {
        return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(value) {
    if (!value) {
        return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ChatThreadPage() {
    const { chatId } = useParams();
    const { user } = useAuth();
    const bottomRef = useRef(null);
    const scrollRef = useRef(null);
    const stickToBottomRef = useRef(true);
    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingOlder, setIsLoadingOlder] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const [actionError, setActionError] = useState('');
    const [messagesPage, setMessagesPage] = useState(1);
    const [messagesLastPage, setMessagesLastPage] = useState(1);

    useEffect(() => {
        let isMounted = true;

        async function loadThread() {
            setIsLoading(true);
            setError('');
            setActionError('');

            try {
                const [chatResponse, messageResponse] = await Promise.all([
                    getChat(chatId),
                    getChatMessages(chatId, { page: 1 }),
                ]);

                if (!isMounted) {
                    return;
                }

                setChat(chatResponse);

                // Messages endpoint returns newest-first (latest()).
                const apiMessages = messageResponse?.data || [];
                setMessages([...apiMessages].reverse());
                setMessagesPage(messageResponse?.current_page || 1);
                setMessagesLastPage(messageResponse?.last_page || 1);
            } catch (requestError) {
                if (!isMounted) {
                    return;
                }

                setError(
                    requestError?.response?.data?.message ||
                    'We could not load this conversation right now.'
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadThread();

        return () => {
            isMounted = false;
        };
    }, [chatId]);

    useEffect(() => {
        if (!bottomRef.current) {
            return;
        }

        if (!stickToBottomRef.current) {
            return;
        }

        bottomRef.current.scrollIntoView({ block: 'end' });
    }, [messages.length]);

    const peer = useMemo(() => getPeer(chat, user?.id), [chat, user?.id]);
    const title = peer?.name || safeText(chat?.name, 'Conversation');

    async function handleLoadOlder() {
        if (!chatId) {
            return;
        }

        if (isLoadingOlder) {
            return;
        }

        if (messagesPage >= messagesLastPage) {
            return;
        }

        setIsLoadingOlder(true);
        setActionError('');

        const container = scrollRef.current;
        const previousScrollHeight = container ? container.scrollHeight : 0;
        const previousScrollTop = container ? container.scrollTop : 0;

        try {
            const nextPage = messagesPage + 1;
            const response = await getChatMessages(chatId, { page: nextPage });

            const apiMessages = response?.data || [];
            const olderMessages = [...apiMessages].reverse();

            setMessages((current) => [...olderMessages, ...current]);
            setMessagesPage(response?.current_page || nextPage);
            setMessagesLastPage(response?.last_page || messagesLastPage);

            // Keep the viewport anchored while prepending older messages.
            requestAnimationFrame(() => {
                if (!scrollRef.current) {
                    return;
                }

                const newScrollHeight = scrollRef.current.scrollHeight;
                const heightDelta = newScrollHeight - previousScrollHeight;
                scrollRef.current.scrollTop = previousScrollTop + heightDelta;
            });
        } catch (requestError) {
            setActionError(
                requestError?.response?.data?.message ||
                'We could not load earlier messages right now.'
            );
        } finally {
            setIsLoadingOlder(false);
        }
    }

    async function handleSendMessage(event) {
        event?.preventDefault?.();

        const content = draft.trim();
        if (!content || !chatId) {
            return;
        }

        setIsSending(true);
        setActionError('');

        const tempId = `temp-${Date.now()}`;
        const optimistic = {
            id: tempId,
            content,
            sender_id: user?.id,
            sender: user ? { id: user.id, name: user.name, photo: user.photo } : null,
            created_at: new Date().toISOString(),
            __pending: true,
        };

        setMessages((current) => [...current, optimistic]);
        setDraft('');

        try {
            const created = await sendChatMessage(chatId, { content });

            setMessages((current) =>
                current.map((message) => (message.id === tempId ? created : message))
            );
        } catch (requestError) {
            setMessages((current) =>
                current.map((message) =>
                    message.id === tempId ? { ...message, __failed: true, __pending: false } : message
                )
            );
            setActionError(
                requestError?.response?.data?.message ||
                'We could not send this message right now.'
            );
        } finally {
            setIsSending(false);
        }
    }

    if (isLoading) {
        return (
            <LoadingState
                eyebrow="Chat"
                title="Loading conversation"
                description="Pulling messages and member details."
                blocks={2}
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

    return (
        <div className="mx-auto w-full max-w-[1100px]">
            <SectionCard
                eyebrow="Chat"
                title={title}
                description="A focused 1-to-1 space. Keep it kind, clear, and actionable."
                className="hero-gradient overflow-hidden"
            >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(163,77,255,0.20),transparent_32%),radial-gradient(circle_at_10%_18%,rgba(37,242,160,0.12),transparent_28%),radial-gradient(circle_at_85%_92%,rgba(255,211,39,0.10),transparent_34%)]" />

                <div className="relative flex flex-col gap-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-4">
                            <UserAvatar
                                name={title}
                                photo={peer?.photo}
                                size="md"
                                ringClassName="from-[#29CFFF] via-[#25F2A0] to-[#FFD327]"
                            />
                            <div className="min-w-0">
                                <p className="truncate font-display text-3xl font-extrabold text-[#FFF3DC]">
                                    {title}
                                </p>
                                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#d8cfbd]">
                                    Private chat
                                </p>
                            </div>
                        </div>

                        <Link
                            to="/app/chats"
                            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#FFF3DC] transition hover:bg-white/10"
                        >
                            Back to inbox
                        </Link>
                    </div>

                    <div className="surface relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)] shadow-[8px_8px_0_rgba(0,0,0,0.85)]">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(41,207,255,0.10),transparent_30%),radial-gradient(circle_at_90%_40%,rgba(255,102,214,0.10),transparent_32%)]" />

                        <div className="relative flex max-h-[62vh] flex-col">
                            <div
                                ref={scrollRef}
                                className="flex-1 overflow-auto px-5 py-6"
                                onScroll={() => {
                                    const el = scrollRef.current;
                                    if (!el) {
                                        stickToBottomRef.current = true;
                                        return;
                                    }

                                    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
                                    stickToBottomRef.current = distanceToBottom < 160;
                                }}
                            >
                                {messagesPage < messagesLastPage ? (
                                    <div className="mb-5 flex justify-center">
                                        <button
                                            type="button"
                                            onClick={handleLoadOlder}
                                            disabled={isLoadingOlder}
                                            className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#FFF3DC] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isLoadingOlder ? 'Loading…' : 'Load earlier'}
                                        </button>
                                    </div>
                                ) : null}

                                {!messages.length ? (
                                    <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-6 text-center">
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#25F2A0]">
                                            No messages yet
                                        </p>
                                        <p className="mt-3 text-sm leading-7 text-[#d8cfbd]">
                                            Start the conversation with a clear first message. You can ask a question, share context, or propose next steps.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid gap-2">
                                        {messages.map((message, index) => {
                                            const isMine = message?.sender_id === user?.id || message?.sender?.id === user?.id;
                                            const previous = messages[index - 1];
                                            const next = messages[index + 1];
                                            const senderId = message?.sender_id || message?.sender?.id;
                                            const startsGroup = !previous || (previous?.sender_id || previous?.sender?.id) !== senderId;
                                            const endsGroup = !next || (next?.sender_id || next?.sender?.id) !== senderId;
                                            const showDayDivider = startsGroup && dayKey(message?.created_at) !== dayKey(previous?.created_at);
                                            const senderName = message?.sender?.name || safeText(chat?.name, 'User');

                                            return (
                                                <div key={message.id}>
                                                    {showDayDivider ? (
                                                        <div className="my-4 flex items-center justify-center gap-3">
                                                            <span className="h-px flex-1 bg-white/10" />
                                                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#d8cfbd]">
                                                                {formatDayLabel(message?.created_at)}
                                                            </span>
                                                            <span className="h-px flex-1 bg-white/10" />
                                                        </div>
                                                    ) : null}

                                                    <div
                                                        className={[
                                                            'flex items-end gap-3',
                                                            isMine ? 'justify-end' : 'justify-start',
                                                            startsGroup ? 'mt-3' : 'mt-1',
                                                        ].join(' ')}
                                                    >
                                                        {!isMine ? (
                                                            <div className={startsGroup ? '' : 'invisible'}>
                                                                <UserAvatar
                                                                    name={senderName}
                                                                    photo={message?.sender?.photo}
                                                                    size="xs"
                                                                    ringClassName="from-[#FF66D6] via-[#29CFFF] to-[#25F2A0]"
                                                                />
                                                            </div>
                                                        ) : null}

                                                        <div className={isMine ? 'flex flex-col items-end' : 'flex flex-col items-start'}>
                                                            {!isMine && startsGroup ? (
                                                                <p className="mb-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#25F2A0]">
                                                                    {senderName}
                                                                </p>
                                                            ) : null}

                                                            <div
                                                                className={[
                                                                    'max-w-[520px] rounded-[1.6rem] border px-4 py-3 shadow-[4px_4px_0_rgba(0,0,0,0.7)]',
                                                                    isMine
                                                                        ? 'border-black bg-[#25F2A0] text-black'
                                                                        : 'border-white/10 bg-[#0B0126] text-[#FFF3DC]',
                                                                    message?.__pending ? 'opacity-75' : '',
                                                                    message?.__failed ? 'border-[#ff8f8f]/40 bg-[#2a0b15] text-[#ffb8b8]' : '',
                                                                ].join(' ')}
                                                            >
                                                                <p className="whitespace-pre-wrap text-sm leading-7">
                                                                    {message?.content}
                                                                </p>
                                                            </div>

                                                            {endsGroup ? (
                                                                <div className="mt-2 flex items-center gap-2">
                                                                    <p
                                                                        className={[
                                                                            'text-[10px] font-black uppercase tracking-[0.16em] opacity-70',
                                                                            isMine ? 'text-black' : 'text-[#d8cfbd]',
                                                                            message?.__failed ? 'text-[#ffb8b8]' : '',
                                                                        ].join(' ')}
                                                                    >
                                                                        {formatTime(message?.created_at)}
                                                                    </p>
                                                                    {message?.__failed ? (
                                                                        <span className="rounded-full border border-[#ff8f8f]/40 bg-[#2a0b15] px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#ffb8b8]">
                                                                            Failed
                                                                        </span>
                                                                    ) : message?.__pending ? (
                                                                        <span className="rounded-full border border-black/25 bg-black/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-black">
                                                                            Sending
                                                                        </span>
                                                                    ) : null}
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={bottomRef} />
                                    </div>
                                )}
                            </div>

                            <form
                                onSubmit={handleSendMessage}
                                className="border-t border-white/10 bg-[#070112]/70 p-4 backdrop-blur"
                            >
                                {actionError ? (
                                    <div className="mb-3 rounded-[1.2rem] border border-[#FFD327]/25 bg-[#120422]/80 p-3">
                                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FFD327]">
                                            Message
                                        </p>
                                        <p className="mt-2 text-sm font-bold text-[#FFF3DC]">{actionError}</p>
                                    </div>
                                ) : null}

                                <div className="flex flex-col gap-3 md:flex-row md:items-end">
                                    <label className="flex-1">
                                        <span className="sr-only">Message</span>
                                        <textarea
                                            value={draft}
                                            onChange={(event) => setDraft(event.target.value)}
                                            onKeyDown={(event) => {
                                                if (event.key !== 'Enter') {
                                                    return;
                                                }

                                                if (event.shiftKey) {
                                                    return;
                                                }

                                                event.preventDefault();
                                                handleSendMessage(event);
                                            }}
                                            rows={2}
                                            placeholder="Write a message..."
                                            className="w-full resize-none rounded-[1.4rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm leading-7 text-white outline-none placeholder:text-white/35 focus:border-white/20"
                                        />
                                    </label>
                                    <button
                                        type="submit"
                                        disabled={isSending || !draft.trim()}
                                        className="festival-card rounded-full border-2 border-black bg-[#25F2A0] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[6px_6px_0_rgba(0,0,0,0.85)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isSending ? 'Sending...' : 'Send'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </SectionCard>
        </div>
    );
}
