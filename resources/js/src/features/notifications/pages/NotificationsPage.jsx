import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { SectionCard } from '../../../shared/components/SectionCard';
import { EmptyState } from '../../../shared/ui/feedback/EmptyState';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';
import { LoadingState } from '../../../shared/ui/feedback/LoadingState';
import {
    deleteAllNotifications,
    deleteNotification,
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from '../../../services/api/notifications.service';

const FILTER_ITEMS = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'answer', label: 'Answers' },
    { key: 'vote', label: 'Votes' },
    { key: 'blog', label: 'Blogs' },
    { key: 'comment', label: 'Comments' },
    { key: 'badge', label: 'Badges' },
    { key: 'like', label: 'Likes' },
];

function getErrorMessage(error, fallback) {
    return error?.response?.data?.message || fallback;
}

function getTypeLabel(type) {
    const labels = {
        answer: 'Answer',
        badge: 'Badge',
        blog: 'Blog',
        comment: 'Comment',
        like: 'Like',
        mention: 'Mention',
        message: 'Message',
        vote: 'Vote',
    };

    return labels[type] || 'Notification';
}

function getToneClasses(type, isRead) {
    const tones = {
        answer: 'from-[#25F2A0]/22 via-[#29CFFF]/14 to-transparent',
        badge: 'from-[#FFD327]/20 via-[#FF8B1F]/12 to-transparent',
        blog: 'from-[#A34DFF]/20 via-[#29CFFF]/12 to-transparent',
        comment: 'from-[#FF66D6]/18 via-[#FFD327]/10 to-transparent',
        like: 'from-[#FF66D6]/20 via-[#ffb3df]/8 to-transparent',
        mention: 'from-[#29CFFF]/20 via-[#A34DFF]/10 to-transparent',
        message: 'from-[#25F2A0]/18 via-[#FFD327]/10 to-transparent',
        vote: 'from-[#29CFFF]/20 via-[#25F2A0]/12 to-transparent',
    };

    return [
        'bg-[linear-gradient(140deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.03)_100%)]',
        `before:bg-[radial-gradient(circle_at_top_left,var(--tw-gradient-stops))] ${tones[type] || tones.message}`,
        isRead ? 'before:opacity-60' : '',
    ].join(' ');
}

function getNotificationLink(notification) {
    const data = notification?.data || {};

    if (data.question_id) {
        return `/app/questions/${data.question_id}`;
    }

    if (data.blog_id) {
        return `/app/blogs/${data.blog_id}`;
    }

    if (data.commentable_type === 'question' && data.commentable_id) {
        return `/app/questions/${data.commentable_id}`;
    }

    if (data.commentable_type === 'answer' && data.commentable_id) {
        return '/app/questions';
    }

    if (data.commentable_type === 'blog' && data.commentable_id) {
        return `/app/blogs/${data.commentable_id}`;
    }

    if (notification?.type === 'badge') {
        return '/app/profile';
    }

    return '';
}

function getActorInitials(name) {
    if (!name) {
        return 'YC';
    }

    return name
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
}

function formatTimestamp(value) {
    if (!value) {
        return 'Just now';
    }

    const date = new Date(value);
    const diffMs = date.getTime() - Date.now();
    const absDiffMs = Math.abs(diffMs);
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    if (absDiffMs < hour) {
        return formatter.format(Math.round(diffMs / minute), 'minute');
    }

    if (absDiffMs < day) {
        return formatter.format(Math.round(diffMs / hour), 'hour');
    }

    if (absDiffMs < day * 7) {
        return formatter.format(Math.round(diffMs / day), 'day');
    }

    return new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

export function NotificationsPage() {
    const outletContext = useOutletContext() || {};
    const { setUnreadNotificationsCount } = outletContext;
    const [notifications, setNotifications] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [processingNotificationId, setProcessingNotificationId] = useState(null);
    const [isRunningBulkAction, setIsRunningBulkAction] = useState(false);
    const [meta, setMeta] = useState({
        total: 0,
        unread: 0,
    });

    useEffect(() => {
        let isMounted = true;

        async function loadNotificationCenter() {
            setIsLoading(true);
            setError('');

            try {
                const response = await getNotifications();

                if (!isMounted) {
                    return;
                }

                const items = response?.data || [];

                setNotifications(items);
                setMeta({
                    total: response?.total || items.length,
                    unread: response?.unread_count ?? items.filter((item) => !item.is_read).length,
                });
                setUnreadNotificationsCount?.(response?.unread_count ?? items.filter((item) => !item.is_read).length);
            } catch (requestError) {
                if (!isMounted) {
                    return;
                }

                setError(getErrorMessage(requestError, 'We could not load your notifications right now.'));
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadNotificationCenter();

        return () => {
            isMounted = false;
        };
    }, []);

    const filteredNotifications = useMemo(() => {
        if (selectedFilter === 'all') {
            return notifications;
        }

        if (selectedFilter === 'unread') {
            return notifications.filter((item) => !item.is_read);
        }

        return notifications.filter((item) => item.type === selectedFilter);
    }, [notifications, selectedFilter]);

    const unreadCount = useMemo(
        () => notifications.filter((item) => !item.is_read).length,
        [notifications]
    );

    async function handleMarkAsRead(notificationId) {
        setError('');
        setSuccessMessage('');
        setProcessingNotificationId(notificationId);

        try {
            await markNotificationAsRead(notificationId);

            setNotifications((currentNotifications) =>
                currentNotifications.map((item) =>
                    item.id === notificationId
                        ? { ...item, is_read: true }
                        : item
                )
            );
            setMeta((currentMeta) => ({
                ...currentMeta,
                unread: Math.max(0, currentMeta.unread - 1),
            }));
            setUnreadNotificationsCount?.((currentCount) => Math.max(0, currentCount - 1));
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'We could not mark this notification as read.'));
        } finally {
            setProcessingNotificationId(null);
        }
    }

    async function handleDelete(notificationId) {
        const deletedNotification = notifications.find((item) => item.id === notificationId);

        setError('');
        setSuccessMessage('');
        setProcessingNotificationId(notificationId);

        try {
            await deleteNotification(notificationId);

            setNotifications((currentNotifications) =>
                currentNotifications.filter((item) => item.id !== notificationId)
            );
            setMeta((currentMeta) => ({
                total: Math.max(0, currentMeta.total - 1),
                unread: deletedNotification && !deletedNotification.is_read
                    ? Math.max(0, currentMeta.unread - 1)
                    : currentMeta.unread,
            }));
            if (deletedNotification && !deletedNotification.is_read) {
                setUnreadNotificationsCount?.((currentCount) => Math.max(0, currentCount - 1));
            }
            setSuccessMessage('Notification deleted.');
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'We could not delete this notification.'));
        } finally {
            setProcessingNotificationId(null);
        }
    }

    async function handleMarkAllAsRead() {
        setError('');
        setSuccessMessage('');
        setIsRunningBulkAction(true);

        try {
            await markAllNotificationsAsRead();

            setNotifications((currentNotifications) =>
                currentNotifications.map((item) => ({
                    ...item,
                    is_read: true,
                }))
            );
            setMeta((currentMeta) => ({
                ...currentMeta,
                unread: 0,
            }));
            setUnreadNotificationsCount?.(0);
            setSuccessMessage('All notifications marked as read.');
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'We could not mark all notifications as read.'));
        } finally {
            setIsRunningBulkAction(false);
        }
    }

    async function handleDeleteAll() {
        setError('');
        setSuccessMessage('');
        setIsRunningBulkAction(true);

        try {
            await deleteAllNotifications();

            setNotifications([]);
            setMeta({
                total: 0,
                unread: 0,
            });
            setUnreadNotificationsCount?.(0);
            setSuccessMessage('All notifications deleted.');
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'We could not clear your notifications.'));
        } finally {
            setIsRunningBulkAction(false);
        }
    }

    if (isLoading) {
        return (
            <LoadingState
                eyebrow="Notifications"
                title="Loading notification center"
                description="We are pulling the latest unread signals, updates, and activity."
            />
        );
    }

    if (error && !notifications.length) {
        return (
            <ErrorState
                eyebrow="Notifications"
                title="Notification center unavailable"
                description={error}
                helperText="Check that the backend is running and that your session is still valid, then refresh the page."
            />
        );
    }

    return (
        <div className="grid gap-6">
            <SectionCard
                eyebrow="Notifications"
                title="Everything that needs your attention"
                description="This center is now wired to Laravel, so the cards below come from the real notification API instead of demo placeholders."
                className="hero-gradient overflow-hidden"
            >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(255,102,214,0.16),transparent_24%),radial-gradient(circle_at_top_right,rgba(41,207,255,0.16),transparent_24%),radial-gradient(circle_at_50%_20%,rgba(37,242,160,0.12),transparent_30%)]" />

                <div className="relative grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
                    <div>
                        <div className="flex flex-wrap gap-3">
                            {FILTER_ITEMS.map((item) => (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => setSelectedFilter(item.key)}
                                    className={[
                                        'rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.14em] shadow-[4px_4px_0_rgba(0,0,0,0.8)] transition',
                                        selectedFilter === item.key
                                            ? 'border-2 border-black bg-[#FFD327] text-black'
                                            : 'border border-white/10 bg-white/5 text-[#d8cfbd] hover:bg-white/10 hover:text-white',
                                    ].join(' ')}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {error ? (
                            <p className="mt-4 text-sm font-bold text-[#FFD327]">{error}</p>
                        ) : null}

                        {successMessage ? (
                            <p className="mt-4 text-sm font-bold text-[#25F2A0]">{successMessage}</p>
                        ) : null}
                    </div>

                    <div className="grid gap-3 rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[6px_6px_0_rgba(0,0,0,0.85)]">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#25F2A0]">Unread</p>
                                <p className="mt-2 font-display text-4xl font-extrabold text-[#FFF3DC]">{unreadCount}</p>
                            </div>
                            <div className="rounded-full bg-[#FFD327] px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.8)]">
                                {meta.total} total
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={handleMarkAllAsRead}
                                disabled={!unreadCount || isRunningBulkAction}
                                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#d8cfbd] transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Mark all read
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteAll}
                                disabled={!notifications.length || isRunningBulkAction}
                                className="rounded-full border border-[#ff8f8f]/40 bg-[#2a0b15] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#ffb8b8] transition hover:bg-[#39101d] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Clear all
                            </button>
                        </div>
                    </div>
                </div>
            </SectionCard>

            {!notifications.length ? (
                <EmptyState
                    eyebrow="Notifications"
                    title="No notifications yet"
                    description="As soon as someone interacts with your questions, answers, blogs, or badges, this center will start filling up."
                    className="hero-gradient"
                />
            ) : !filteredNotifications.length ? (
                <EmptyState
                    eyebrow="Notifications"
                    title="No matches for this filter"
                    description="Try switching back to All or Unread to see more activity."
                    className="hero-gradient"
                />
            ) : (
                <div className="grid gap-4">
                    {filteredNotifications.map((notification) => {
                        const actorName = notification.actor?.name || 'YouConnect';
                        const destination = getNotificationLink(notification);
                        const isProcessingThisItem = processingNotificationId === notification.id;

                        return (
                            <article
                                key={notification.id}
                                className={`surface relative overflow-hidden rounded-[2rem] border border-white/10 p-5 shadow-[6px_6px_0_rgba(0,0,0,0.85)] before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:opacity-100 ${getToneClasses(notification.type, notification.is_read)}`}
                            >
                                <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="flex gap-4">
                                        {notification.actor?.photo ? (
                                            <img
                                                src={notification.actor.photo}
                                                alt={actorName}
                                                className="h-14 w-14 rounded-[1.1rem] border-2 border-black object-cover shadow-[4px_4px_0_rgba(0,0,0,0.8)]"
                                            />
                                        ) : (
                                            <div className="flex h-14 w-14 items-center justify-center rounded-[1.1rem] border-2 border-black bg-[linear-gradient(135deg,#29CFFF_0%,#25F2A0_58%,#FFD327_100%)] text-sm font-black text-black shadow-[4px_4px_0_rgba(0,0,0,0.8)]">
                                                {getActorInitials(actorName)}
                                            </div>
                                        )}

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-full bg-black px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#FFF3DC]">
                                                    {getTypeLabel(notification.type)}
                                                </span>
                                                <span className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">
                                                    {formatTimestamp(notification.created_at)}
                                                </span>
                                                <span
                                                    className={[
                                                        'rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em]',
                                                        notification.is_read
                                                            ? 'bg-white/10 text-[#d8cfbd]'
                                                            : 'bg-[#FF66D6] text-black',
                                                    ].join(' ')}
                                                >
                                                    {notification.is_read ? 'Read' : 'New'}
                                                </span>
                                            </div>

                                            <p className="mt-3 font-display text-2xl font-extrabold leading-none text-[#FFF3DC]">
                                                {notification.title}
                                            </p>
                                            <p className="mt-3 text-sm leading-7 text-[#d8cfbd]">
                                                {notification.content || `${actorName} triggered a new notification.`}
                                            </p>
                                            <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-[#25F2A0]">
                                                Triggered by {actorName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 lg:max-w-[260px] lg:justify-end">
                                        {destination ? (
                                            <Link
                                                to={destination}
                                                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#d8cfbd] transition hover:bg-white/10 hover:text-white"
                                            >
                                                Open
                                            </Link>
                                        ) : null}

                                        {!notification.is_read ? (
                                            <button
                                                type="button"
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                disabled={isProcessingThisItem}
                                                className="rounded-full bg-[#FFD327] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                Mark read
                                            </button>
                                        ) : null}

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(notification.id)}
                                            disabled={isProcessingThisItem}
                                            className="rounded-full border border-[#ff8f8f]/40 bg-[#2a0b15] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#ffb8b8] transition hover:bg-[#39101d] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
