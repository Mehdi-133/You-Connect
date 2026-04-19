import { Link } from 'react-router-dom';
import { UserAvatar } from '../../../shared/components/UserAvatar';

function getStatusLabel(status, isHighlighted) {
    if (isHighlighted) {
        return 'Highlighted';
    }

    if (status === 'approved') {
        return 'Approved';
    }

    if (status === 'pending') {
        return 'Pending review';
    }

    if (status === 'rejected') {
        return 'Rejected';
    }

    return 'Draft';
}

function getStatusBadgeClass(status, isHighlighted) {
    if (isHighlighted) {
        return 'border-2 border-black bg-[#29CFFF] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]';
    }

    if (status === 'approved') {
        return 'border-2 border-black bg-[#25F2A0] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]';
    }

    if (status === 'pending') {
        return 'border-2 border-black bg-[#FFD327] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]';
    }

    if (status === 'rejected') {
        return 'border-2 border-black bg-[#FF66D6] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]';
    }

    return 'border-2 border-black bg-[#FFF3DC] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]';
}

function getRelativeTime(value) {
    if (!value) {
        return 'Recently';
    }

    const now = new Date();
    const createdAt = new Date(value);
    const diffInHours = Math.max(1, Math.round((now - createdAt) / (1000 * 60 * 60)));

    if (diffInHours < 24) {
        return `${diffInHours}h`;
    }

    const diffInDays = Math.round(diffInHours / 24);
    return `${diffInDays}d`;
}

function truncateContent(content) {
    if (!content) {
        return '';
    }

    if (content.length <= 240) {
        return content;
    }

    return `${content.slice(0, 240)}...`;
}

export function BlogFeedCard({
    blog,
    canLike = false,
    hasLiked = false,
    isLiking = false,
    onLike,
    isOwner = false,
}) {
    return (
        <article className="surface festival-card group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.03)_100%)] text-white shadow-[8px_8px_0_rgba(0,0,0,0.85)] transition hover:translate-y-[-2px]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(163,77,255,0.22),transparent_24%),radial-gradient(circle_at_18%_16%,rgba(37,242,160,0.16),transparent_18%),radial-gradient(circle_at_82%_80%,rgba(255,211,39,0.14),transparent_22%)] opacity-80" />

            <div className="relative border-b border-white/10 px-7 py-7">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-4">
                        <div className="shrink-0">
                            <UserAvatar
                                name={blog.you_coder?.name}
                                photo={blog.you_coder?.photo}
                                size="md"
                            />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate text-[1.05rem] font-bold text-[#FFF3DC]">
                                    {blog.you_coder?.name || 'YouConnect member'}
                                </p>
                                <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${getStatusBadgeClass(blog.status, blog.is_highlighted)}`}>
                                    {getStatusLabel(blog.status, blog.is_highlighted)}
                                </span>
                                <span className="text-sm font-semibold text-[#d8cfbd]">{getRelativeTime(blog.created_at)}</span>
                            </div>
                            <p className="mt-1 text-sm text-[#d8cfbd]">
                                Posted in <span className="font-bold text-[#29CFFF]">YouConnect community</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-[#d8cfbd]">
                        <button type="button" className="rounded-full p-2 transition hover:bg-white/10 hover:text-white" aria-label="Save blog">
                            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                                <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
                            </svg>
                        </button>
                        <button type="button" className="rounded-full p-2 transition hover:bg-white/10 hover:text-white" aria-label="More actions">
                            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                                <circle cx="5" cy="12" r="1.8" />
                                <circle cx="12" cy="12" r="1.8" />
                                <circle cx="19" cy="12" r="1.8" />
                            </svg>
                        </button>
                    </div>
                </div>

                <h3 className="mt-7 max-w-4xl font-display text-[2.35rem] font-extrabold leading-[1.02] text-[#FFF3DC]">
                    {blog.title}
                </h3>
                <p className="mt-6 max-w-4xl text-[1.05rem] leading-9 text-[#edf1f8]">
                    {truncateContent(blog.content)}
                </p>
                <Link
                    to={`/app/blogs/${blog.id}`}
                    className="mt-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-[#FFF3DC] transition hover:bg-[#FFF3DC] hover:text-black"
                >
                    See more
                </Link>
            </div>

            <div className="relative flex flex-wrap items-center justify-between gap-4 px-7 py-5 text-[#d8cfbd]">
                <div className="flex flex-wrap items-center gap-5">
                    {canLike ? (
                        <button
                            type="button"
                            onClick={() => onLike?.(blog)}
                            disabled={isLiking}
                            className={[
                                'flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition',
                                hasLiked
                                    ? 'bg-[#FF66D6] text-black'
                                    : 'bg-white/5 hover:bg-white/10 hover:text-white',
                                isLiking ? 'opacity-70' : '',
                            ].join(' ')}
                        >
                            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]">
                                <path d="M12 20.5s-7-4.35-7-10.1C5 7.45 7.2 5.5 10 5.5c1.65 0 2.95.8 4 2.15 1.05-1.35 2.35-2.15 4-2.15 2.8 0 5 1.95 5 4.9 0 5.75-7 10.1-7 10.1Z" />
                            </svg>
                            <span className="text-sm font-medium">
                                {isLiking ? 'Updating...' : `${blog.like_count || 0} likes`}
                            </span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-sm font-medium">
                            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]">
                                <path d="M12 20.5s-7-4.35-7-10.1C5 7.45 7.2 5.5 10 5.5c1.65 0 2.95.8 4 2.15 1.05-1.35 2.35-2.15 4-2.15 2.8 0 5 1.95 5 4.9 0 5.75-7 10.1-7 10.1Z" />
                            </svg>
                            <span className="text-sm font-medium">{blog.like_count || 0} likes</span>
                            {isOwner ? (
                                <span className="rounded-full bg-[#FFF3DC] px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-black">
                                    Your post
                                </span>
                            ) : null}
                        </div>
                    )}

                    <Link
                        to={`/app/blogs/${blog.id}`}
                        className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-sm font-medium transition hover:text-white"
                    >
                        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]">
                            <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
                        </svg>
                        <span>{blog.comments?.length || 0} comments</span>
                    </Link>
                </div>

                <Link
                    to={`/app/blogs/${blog.id}`}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-[#FFF3DC] transition hover:bg-[#25F2A0] hover:text-black"
                >
                    Open post
                </Link>
            </div>
        </article>
    );
}
