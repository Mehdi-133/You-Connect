import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserAvatar } from '../../../shared/components/UserAvatar';

function getStatusLabel(status, isHighlighted) {
    if (isHighlighted) return 'Highlighted';
    if (status === 'approved') return 'Approved';
    if (status === 'pending') return 'Pending review';
    if (status === 'rejected') return 'Rejected';
    return 'Draft';
}

function getStatusBadgeClass(status, isHighlighted) {
    if (isHighlighted) return 'border border-white/10 bg-[#29CFFF] text-black shadow-[0_10px_24px_rgba(0,0,0,0.35)]';
    if (status === 'approved') return 'border border-white/10 bg-[#25F2A0] text-black shadow-[0_10px_24px_rgba(0,0,0,0.35)]';
    if (status === 'pending') return 'border border-white/10 bg-[#FFD327] text-black shadow-[0_10px_24px_rgba(0,0,0,0.35)]';
    if (status === 'rejected') return 'border border-white/10 bg-[#FF66D6] text-black shadow-[0_10px_24px_rgba(0,0,0,0.35)]';
    return 'border border-white/10 bg-[#FFF3DC] text-black shadow-[0_10px_24px_rgba(0,0,0,0.35)]';
}

function getRelativeTime(value) {
    if (!value) return 'Recently';

    const now = new Date();
    const createdAt = new Date(value);
    const diffInHours = Math.max(1, Math.round((now - createdAt) / (1000 * 60 * 60)));

    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.round(diffInHours / 24)}d`;
}

function truncateContent(content) {
    if (!content) return '';
    if (content.length <= 180) return content;
    return `${content.slice(0, 180)}...`;
}

export function BlogFeedCard({
    blog,
    canLike = false,
    hasLiked = false,
    isLiking = false,
    onLike,
    isOwner = false,
    onDelete,
    isDeleting = false,
}) {
    const blogHref = `/app/blogs/${blog.id}`;
    const tags = Array.isArray(blog.tags) ? blog.tags : [];
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function handleOutsideClick(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    return (
        <article className="group relative isolate mx-auto w-full md:w-[86%] max-w-[1080px] overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)] text-white shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur transition hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_26px_80px_rgba(0,0,0,0.55)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(163,77,255,0.14),transparent_32%),radial-gradient(circle_at_10%_20%,rgba(37,242,160,0.10),transparent_28%),radial-gradient(circle_at_85%_90%,rgba(255,211,39,0.10),transparent_30%)] opacity-90" />

            <div className="relative md:flex">
                <Link
                    to={blogHref}
                    className="relative block border-b border-white/10 md:w-[300px] md:shrink-0 md:border-b-0 md:border-r"
                    aria-label={`Open blog: ${blog.title}`}
                >
                    <div className="relative h-52 bg-black/30 sm:h-60 md:h-full md:min-h-[260px]">
                        {blog.photo ? (
                            <img
                                src={blog.photo}
                                alt=""
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                                loading="lazy"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-white/60">
                                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em]">
                                    No image
                                </div>
                            </div>
                        )}

                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.56)_55%,rgba(0,0,0,0.82)_100%)]" />
                    </div>
                </Link>

                <div className="relative flex min-w-0 flex-1 flex-col p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className={[
                                    'rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em]',
                                    getStatusBadgeClass(blog.status, blog.is_highlighted),
                                ].join(' ')}
                            >
                                {getStatusLabel(blog.status, blog.is_highlighted)}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#FFF3DC]">
                                {getRelativeTime(blog.created_at)}
                            </span>
                            {isOwner ? (
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#FFD327]">
                                    Your post
                                </span>
                            ) : null}
                        </div>

                        <div className="flex items-center gap-2" ref={menuRef}>
                            <button
                                type="button"
                                className="rounded-full border border-white/10 bg-white/5 p-2.5 text-[#d8cfbd] transition hover:bg-white/10 hover:text-white"
                                aria-label="Save blog"
                            >
                                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                                    <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setIsMenuOpen((current) => !current);
                                }}
                                className="rounded-full border border-white/10 bg-white/5 p-2.5 text-[#d8cfbd] transition hover:bg-white/10 hover:text-white"
                                aria-label="More actions"
                                aria-haspopup="menu"
                                aria-expanded={isMenuOpen}
                            >
                                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                                    <circle cx="5" cy="12" r="1.8" />
                                    <circle cx="12" cy="12" r="1.8" />
                                    <circle cx="19" cy="12" r="1.8" />
                                </svg>
                            </button>

                            {isMenuOpen ? (
                                <div
                                    role="menu"
                                    className="absolute right-0 top-12 z-20 w-56 rounded-2xl border border-white/10 bg-[#0B0126] p-2 shadow-[10px_10px_0_rgba(0,0,0,0.85)]"
                                >
                                    {isOwner ? (
                                        <Link
                                            to={blogHref}
                                            role="menuitem"
                                            className="block rounded-xl px-4 py-3 text-sm font-bold text-[#d8cfbd] transition hover:bg-white/10 hover:text-white"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Update
                                        </Link>
                                    ) : (
                                        <button
                                            type="button"
                                            role="menuitem"
                                            disabled
                                            className="w-full cursor-not-allowed rounded-xl px-4 py-3 text-left text-sm font-bold text-white/35"
                                        >
                                            Update
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        role="menuitem"
                                        disabled={!isOwner || !onDelete || isDeleting}
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            onDelete?.(blog);
                                        }}
                                        className={[
                                            'w-full rounded-xl px-4 py-3 text-left text-sm font-black transition',
                                            !isOwner || !onDelete || isDeleting
                                                ? 'cursor-not-allowed text-white/35'
                                                : 'text-[#ffb8b8] hover:bg-[#39101d]',
                                        ].join(' ')}
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex min-w-0 items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                            <UserAvatar name={blog.you_coder?.name} photo={blog.you_coder?.photo} size="sm" />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-extrabold text-[#FFF3DC]">
                                    {blog.you_coder?.name || 'YouConnect member'}
                                </p>
                                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#d8cfbd]">
                                    Blog post
                                </p>
                            </div>
                        </div>
                    </div>

                    <Link
                        to={blogHref}
                        className="mt-4 block max-w-[60ch] font-display text-[1.35rem] font-extrabold leading-tight text-[#FFF3DC] transition group-hover:text-[#25F2A0] line-clamp-2 sm:text-[1.45rem]"
                    >
                        {blog.title}
                    </Link>

                    <p className="mt-2 max-w-[78ch] text-sm leading-7 text-[#edf1f8] line-clamp-3">
                        {truncateContent(blog.content)}
                    </p>

                    {tags.length ? (
                        <ul className="mt-4 flex flex-wrap gap-2">
                            {tags.slice(0, 4).map((tag) => (
                                <li
                                    key={tag.id ?? tag.name}
                                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold text-[#d8cfbd]"
                                >
                                    {tag.name ?? String(tag)}
                                </li>
                            ))}
                        </ul>
                    ) : null}

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                        <div className="flex flex-wrap items-center gap-2 text-[#d8cfbd]">
                            {canLike ? (
                                <button
                                    type="button"
                                    onClick={() => onLike?.(blog)}
                                    disabled={isLiking}
                                    aria-pressed={hasLiked}
                                    className={[
                                        'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] transition',
                                        hasLiked
                                            ? 'border-[#FF66D6]/50 bg-[#FF66D6]/15 text-[#FF66D6] hover:bg-[#FF66D6]/20'
                                            : 'border-white/10 bg-white/5 text-[#d8cfbd] hover:bg-white/10 hover:text-white',
                                        isLiking ? 'opacity-70' : 'active:scale-[0.98]',
                                    ].join(' ')}
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        className={[
                                            'h-5 w-5 stroke-current stroke-[1.8]',
                                            hasLiked ? 'fill-current' : 'fill-none',
                                        ].join(' ')}
                                    >
                                        <path d="M12 20.5s-7-4.35-7-10.1C5 7.45 7.2 5.5 10 5.5c1.65 0 2.95.8 4 2.15 1.05-1.35 2.35-2.15 4-2.15 2.8 0 5 1.95 5 4.9 0 5.75-7 10.1-7 10.1Z" />
                                    </svg>
                                    <span>{isLiking ? 'Updating...' : blog.like_count || 0}</span>
                                </button>
                            ) : (
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#d8cfbd]">
                                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
                                        <path d="M12 20.5s-7-4.35-7-10.1C5 7.45 7.2 5.5 10 5.5c1.65 0 2.95.8 4 2.15 1.05-1.35 2.35-2.15 4-2.15 2.8 0 5 1.95 5 4.9 0 5.75-7 10.1-7 10.1Z" />
                                    </svg>
                                    <span>{blog.like_count || 0}</span>
                                </div>
                            )}

                            <Link
                                to={blogHref}
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] transition hover:bg-white/10 hover:text-white"
                            >
                                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
                                    <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
                                </svg>
                                <span>{blog.comments?.length || 0}</span>
                            </Link>
                        </div>

                        <Link
                            to={blogHref}
                            className="inline-flex items-center justify-center rounded-full bg-[#25F2A0] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-[#2cffaa] focus:outline-none focus:ring-2 focus:ring-[#25F2A0]/50"
                        >
                            Open post
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
}
