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
        <article className="surface festival-card group relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] text-white shadow-[8px_8px_0_rgba(0,0,0,0.82)] transition hover:translate-y-[-2px] hover:border-white/20 hover:shadow-[0_18px_48px_rgba(0,0,0,0.52)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(163,77,255,0.20),transparent_26%),radial-gradient(circle_at_12%_22%,rgba(37,242,160,0.13),transparent_20%),radial-gradient(circle_at_80%_86%,rgba(255,211,39,0.12),transparent_25%)] opacity-90" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-[2px] bg-[linear-gradient(180deg,#29CFFF_0%,#25F2A0_45%,#FFD327_100%)] opacity-70" />

            <div className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(41,207,255,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,211,39,0.14),transparent_38%)]">
                <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_1px)] [background-size:18px_18px]" />
                <div className="relative h-40 bg-black/30 sm:h-44">
                    {blog.photo ? (
                        <img
                            src={blog.photo}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-white/60">
                            <div className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-black uppercase tracking-[0.18em]">
                                No image
                            </div>
                        </div>
                    )}

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.62)_60%,rgba(0,0,0,0.78)_100%)]" />

                    <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${getStatusBadgeClass(blog.status, blog.is_highlighted)}`}>
                            {getStatusLabel(blog.status, blog.is_highlighted)}
                        </span>
                        <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#FFF3DC] backdrop-blur">
                            {getRelativeTime(blog.created_at)}
                        </span>
                        {isOwner ? (
                            <span className="rounded-full border-2 border-black bg-[#FFF3DC] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-black shadow-[3px_3px_0_rgba(0,0,0,0.8)]">
                                Your post
                            </span>
                        ) : null}
                    </div>

                    <div className="absolute right-3 top-3 flex items-center gap-2">
                        <button type="button" className="rounded-full border border-white/10 bg-black/35 p-2 text-[#d8cfbd] backdrop-blur transition hover:bg-black/55 hover:text-white" aria-label="Save blog">
                            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                                <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
                            </svg>
                        </button>
                        <button type="button" className="rounded-full border border-white/10 bg-black/35 p-2 text-[#d8cfbd] backdrop-blur transition hover:bg-black/55 hover:text-white" aria-label="More actions">
                            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                                <circle cx="5" cy="12" r="1.8" />
                                <circle cx="12" cy="12" r="1.8" />
                                <circle cx="19" cy="12" r="1.8" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className="relative border-b border-white/10 px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <UserAvatar
                            name={blog.you_coder?.name}
                            photo={blog.you_coder?.photo}
                            size="md"
                        />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-extrabold text-[#FFF3DC]">
                                {blog.you_coder?.name || 'YouConnect member'}
                            </p>
                            <p className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#d8cfbd]">
                                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 uppercase tracking-[0.16em]">
                                    YouConnect
                                </span>
                                <span className="uppercase tracking-[0.14em] text-white/55">Blog post</span>
                            </p>
                        </div>
                    </div>

                    <Link
                        to={`/app/blogs/${blog.id}`}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#FFF3DC] transition hover:bg-[#FFF3DC] hover:text-black"
                    >
                        Open
                    </Link>
                </div>

                <h3 className="mt-3 font-display text-[1.35rem] font-extrabold leading-[1.14] text-[#FFF3DC] line-clamp-2 sm:text-[1.5rem]">
                    {blog.title}
                </h3>
                <p className="mt-2 text-[0.92rem] leading-7 text-[#edf1f8] line-clamp-2">
                    {truncateContent(blog.content)}
                </p>

                <Link
                    to={`/app/blogs/${blog.id}`}
                    className="mt-3 inline-flex items-center gap-2 text-[0.82rem] font-black uppercase tracking-[0.16em] text-[#25F2A0] transition group-hover:text-[#29CFFF]"
                >
                    See more
                    <span className="inline-block transition group-hover:translate-x-[2px]">→</span>
                </Link>
            </div>

            <div className="relative flex flex-wrap items-center justify-between gap-4 px-6 py-4 text-[#d8cfbd]">
                <div className="flex flex-wrap items-center gap-3">
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
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-[#FFF3DC] transition hover:bg-[#25F2A0] hover:text-black"
                >
                    Open post
                </Link>
            </div>
        </article>
    );
}
