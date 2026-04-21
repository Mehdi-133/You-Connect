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
    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        async function loadThread() {
            setIsLoading(true);
            setError('');

            try {
                const [chatResponse, messageResponse] = await Promise.all([
                    getChat(chatId),
                    getChatMessages(chatId),
                ]);

                if (!isMounted) {
                    return;
                }

                setChat(chatResponse);

                // Messages endpoint returns newest-first (latest()).
                const apiMessages = messageResponse?.data || [];
                setMessages([...apiMessages].reverse());
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

        bottomRef.current.scrollIntoView({ block: 'end' });
    }, [messages.length]);

    const peer = useMemo(() => getPeer(chat, user?.id), [chat, user?.id]);
    const title = peer?.name || safeText(chat?.name, 'Conversation');

    async function handleSendMessage(event) {
        event?.preventDefault?.();

        const content = draft.trim();
        if (!content || !chatId) {
            return;
        }

        setIsSending(true);
        try {
            const created = await sendChatMessage(chatId, { content });

            setMessages((current) => [...current, created]);
            setDraft('');
        } catch (requestError) {
            setError(
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
                            <div className="flex-1 overflow-auto px-5 py-6">
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
                                    <div className="grid gap-3">
                                        {messages.map((message) => {
                                            const isMine = message?.sender_id === user?.id || message?.sender?.id === user?.id;
                                            return (
                                                <div
                                                    key={message.id}
                                                    className={[
                                                        'flex',
                                                        isMine ? 'justify-end' : 'justify-start',
                                                    ].join(' ')}
                                                >
                                                    <div
                                                        className={[
                                                            'max-w-[82%] rounded-[1.6rem] border px-4 py-3 shadow-[4px_4px_0_rgba(0,0,0,0.7)]',
                                                            isMine
                                                                ? 'border-black bg-[#25F2A0] text-black'
                                                                : 'border-white/10 bg-[#0B0126] text-[#FFF3DC]',
                                                        ].join(' ')}
                                                    >
                                                        {!isMine ? (
                                                            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#25F2A0]">
                                                                {message?.sender?.name || 'User'}
                                                            </p>
                                                        ) : null}
                                                        <p className="mt-1 whitespace-pre-wrap text-sm leading-7">
                                                            {message?.content}
                                                        </p>
                                                        <p
                                                            className={[
                                                                'mt-2 text-[10px] font-black uppercase tracking-[0.16em] opacity-70',
                                                                isMine ? 'text-black' : 'text-[#d8cfbd]',
                                                            ].join(' ')}
                                                        >
                                                            {formatTime(message?.created_at)}
                                                        </p>
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
                                <div className="flex flex-col gap-3 md:flex-row md:items-end">
                                    <label className="flex-1">
                                        <span className="sr-only">Message</span>
                                        <textarea
                                            value={draft}
                                            onChange={(event) => setDraft(event.target.value)}
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
