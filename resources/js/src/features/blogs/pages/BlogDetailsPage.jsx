import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SectionCard } from '../../../shared/components/SectionCard';
import { EmptyState } from '../../../shared/ui/feedback/EmptyState';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';
import { LoadingState } from '../../../shared/ui/feedback/LoadingState';
import { getBlog } from '../../../services/api/blogs.service';

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

export function BlogDetailsPage() {
    const { blogId } = useParams();
    const [blog, setBlog] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        async function loadBlog() {
            setIsLoading(true);
            setError('');

            try {
                const response = await getBlog(blogId);

                if (!isMounted) {
                    return;
                }

                setBlog(response);
            } catch (requestError) {
                if (!isMounted) {
                    return;
                }

                setError(
                    requestError.response?.data?.message ||
                    'We could not load this blog right now.'
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadBlog();

        return () => {
            isMounted = false;
        };
    }, [blogId]);

    if (isLoading) {
        return (
            <LoadingState
                eyebrow="Blog details"
                title="Loading blog article"
                description="We are pulling the full article and its discussion."
            />
        );
    }

    if (error) {
        return (
            <ErrorState
                eyebrow="Blog details"
                title="Blog unavailable"
                description={error}
                helperText="Go back to the blog feed, refresh the page, and try again after the backend is running."
            />
        );
    }

    if (!blog) {
        return (
            <EmptyState
                eyebrow="Blog details"
                title="Blog not found"
                description="This article may have been deleted or is no longer available."
            />
        );
    }

    return (
        <div className="grid gap-6">
            <SectionCard
                eyebrow="Blog details"
                title={blog.title}
                description="Read the full article, inspect its moderation status, and review its author and engagement details."
                className="hero-gradient"
            >
                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        to="/app/blogs"
                        className="festival-card rounded-full bg-[#FFF3DC] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-black"
                    >
                        Back to blogs
                    </Link>
                    <span className="rounded-full border border-[rgb(var(--line))] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">
                        {getStatusLabel(blog.status, blog.is_highlighted)}
                    </span>
                    <span className="rounded-full border border-[rgb(var(--line))] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">
                        {blog.like_count || 0} likes
                    </span>
                    {blog.you_coder ? (
                        <span className="rounded-full border border-[rgb(var(--line))] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">
                            {blog.you_coder.name}
                        </span>
                    ) : null}
                </div>

                <p className="mt-6 max-w-4xl text-sm leading-8 text-[rgb(var(--fg-muted))]">
                    {blog.content}
                </p>
            </SectionCard>

            {blog.comments?.length ? (
                <SectionCard
                    eyebrow="Discussion"
                    title="Comments on this blog"
                    description="The backend already sends the comments with the blog details, so this page can surface that discussion."
                >
                    <div className="grid gap-4">
                        {blog.comments.map((comment) => (
                            <article key={comment.id} className="surface festival-card rounded-[2rem] p-5">
                                <p className="text-sm leading-7 text-[rgb(var(--fg-muted))]">
                                    {comment.content}
                                </p>
                            </article>
                        ))}
                    </div>
                </SectionCard>
            ) : (
                <EmptyState
                    eyebrow="Discussion"
                    title="No comments yet"
                    description="This article has no comments yet, so it is a good candidate for the next community response."
                />
            )}
        </div>
    );
}
