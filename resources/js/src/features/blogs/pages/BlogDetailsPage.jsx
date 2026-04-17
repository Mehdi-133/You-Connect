import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SectionCard } from '../../../shared/components/SectionCard';
import { EmptyState } from '../../../shared/ui/feedback/EmptyState';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';
import { LoadingState } from '../../../shared/ui/feedback/LoadingState';
import { useAuth } from '../../../hooks/useAuth';
import { getBlog, updateBlog } from '../../../services/api/blogs.service';

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
    const { user } = useAuth();
    const { blogId } = useParams();
    const [blog, setBlog] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        title: '',
        content: '',
    });
    const [editError, setEditError] = useState('');
    const [editFieldErrors, setEditFieldErrors] = useState({});
    const [editSuccessMessage, setEditSuccessMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

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
                setEditForm({
                    title: response.title || '',
                    content: response.content || '',
                });
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

    function handleEditInputChange(event) {
        const { name, value } = event.target;

        setEditForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    }

    async function handleUpdateBlog(event) {
        event.preventDefault();
        setEditError('');
        setEditFieldErrors({});
        setEditSuccessMessage('');
        setIsSaving(true);

        try {
            const updatedBlog = await updateBlog(blogId, editForm);

            setBlog((currentBlog) => ({
                ...currentBlog,
                ...updatedBlog,
            }));
            setIsEditing(false);
            setEditSuccessMessage('Blog updated successfully.');
        } catch (requestError) {
            const message =
                requestError.response?.data?.message ||
                'We could not update this blog right now.';

            setEditError(message);
            setEditFieldErrors(requestError.response?.data?.errors || {});
        } finally {
            setIsSaving(false);
        }
    }

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

    const canEdit = user && blog.you_coder?.id === user.id;

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
                    {canEdit ? (
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing((currentState) => !currentState);
                                setEditError('');
                                setEditFieldErrors({});
                                setEditSuccessMessage('');
                            }}
                            className="festival-card rounded-full bg-[#25F2A0] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-black"
                        >
                            {isEditing ? 'Cancel edit' : 'Edit blog'}
                        </button>
                    ) : null}
                </div>

                {editSuccessMessage ? (
                    <p className="mt-6 text-sm font-bold text-[#25F2A0]">{editSuccessMessage}</p>
                ) : null}

                {isEditing ? (
                    <form onSubmit={handleUpdateBlog} className="mt-6 grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5">
                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                Blog title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={editForm.title}
                                onChange={handleEditInputChange}
                                className="w-full rounded-[1.4rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none"
                            />
                            {editFieldErrors.title ? (
                                <p className="mt-2 text-xs font-bold text-[#FFD327]">{editFieldErrors.title[0]}</p>
                            ) : null}
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                Blog content
                            </label>
                            <textarea
                                name="content"
                                value={editForm.content}
                                onChange={handleEditInputChange}
                                rows="8"
                                className="w-full rounded-[1.4rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none"
                            />
                            {editFieldErrors.content ? (
                                <p className="mt-2 text-xs font-bold text-[#FFD327]">{editFieldErrors.content[0]}</p>
                            ) : null}
                        </div>

                        {editError ? (
                            <p className="text-sm font-bold text-[#FFD327]">{editError}</p>
                        ) : null}

                        <div>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="festival-card rounded-full bg-[#25F2A0] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-black disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isSaving ? 'Saving changes...' : 'Save changes'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <p className="mt-6 max-w-4xl text-sm leading-8 text-[rgb(var(--fg-muted))]">
                        {blog.content}
                    </p>
                )}
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
