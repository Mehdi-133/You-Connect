import { Link } from 'react-router-dom';

function getStatusTone(status) {
    if (status === 'approved') {
        return '#29CFFF';
    }

    if (status === 'pending') {
        return '#FFD327';
    }

    return '#FF66D6';
}

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

export function BlogFeedCard({ blog }) {
    return (
        <article className="surface festival-card rounded-[2rem] p-6">
            <div
                className="festival-card mb-5 rounded-[1.8rem] border-2 p-10"
                style={{ backgroundColor: getStatusTone(blog.status) }}
            />
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[rgb(var(--fg-muted))]">
                    {getStatusLabel(blog.status, blog.is_highlighted)}
                </p>
                <span className="rounded-full border border-[rgb(var(--line))] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[rgb(var(--fg-muted))]">
                    {blog.like_count || 0} likes
                </span>
            </div>
            <h3 className="mt-3 font-display text-3xl font-extrabold leading-none">{blog.title}</h3>
            <p className="mt-3 text-sm leading-7 text-[rgb(var(--fg-muted))]">
                {blog.content}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
                {blog.you_coder ? (
                    <span className="rounded-full border border-[rgb(var(--line))] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[rgb(var(--fg-muted))]">
                        {blog.you_coder.name}
                    </span>
                ) : null}
                <Link
                    to={`/app/blogs/${blog.id}`}
                    className="festival-card inline-flex rounded-full bg-[#FFF3DC] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-black"
                >
                    Read blog
                </Link>
            </div>
        </article>
    );
}
