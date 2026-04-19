import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SectionCard } from '../../../shared/components/SectionCard';
import { EmptyState } from '../../../shared/ui/feedback/EmptyState';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';
import { LoadingState } from '../../../shared/ui/feedback/LoadingState';
import { useAuth } from '../../../hooks/useAuth';
import { canModerateBlogs } from '../../../shared/utils/roles';
import { createComment } from '../../../services/api/comments.service';
import { UserAvatar } from '../../../shared/components/UserAvatar';
import {
    approveBlog,
    getBlog,
    highlightBlog,
    likeBlog,
    rejectBlog,
    updateBlog,
} from '../../../services/api/blogs.service';

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
    const [interactionMessage, setInteractionMessage] = useState('');
    const [interactionError, setInteractionError] = useState('');
    const [isLiking, setIsLiking] = useState(false);
    const [isModerating, setIsModerating] = useState(false);
    const [hasLikedInSession, setHasLikedInSession] = useState(false);
    const [commentContent, setCommentContent] = useState('');
    const [commentError, setCommentError] = useState('');
    const [commentFieldErrors, setCommentFieldErrors] = useState({});
    const [commentSuccessMessage, setCommentSuccessMessage] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

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
        setInteractionMessage('');
        setInteractionError('');
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
            const nextFieldErrors = requestError.response?.data?.errors || {};

            setEditFieldErrors(nextFieldErrors);
            setEditError(
                Object.keys(nextFieldErrors).length
                    ? ''
                    : requestError.response?.data?.message ||
                      'We could not update this blog right now.'
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function handleLikeBlog() {
        setInteractionMessage('');
        setInteractionError('');
        setIsLiking(true);

        try {
            const response = await likeBlog({ blog_id: blog.id });

            setBlog((currentBlog) => ({
                ...currentBlog,
                like_count: response.message === 'Like removed'
                    ? Math.max(0, (currentBlog.like_count || 0) - 1)
                    : (currentBlog.like_count || 0) + 1,
            }));
            setHasLikedInSession(response.message === 'Blog liked');
            setInteractionMessage(response.message);
        } catch (requestError) {
            setInteractionError(
                requestError.response?.data?.message ||
                'We could not update the like right now.'
            );
        } finally {
            setIsLiking(false);
        }
    }

    async function handleModerationAction(action) {
        setInteractionMessage('');
        setInteractionError('');
        setIsModerating(true);

        try {
            let response;

            if (action === 'approve') {
                response = await approveBlog(blog.id);
                setBlog((currentBlog) => ({
                    ...currentBlog,
                    status: 'approved',
                }));
            }

            if (action === 'reject') {
                response = await rejectBlog(blog.id);
                setBlog((currentBlog) => ({
                    ...currentBlog,
                    status: 'rejected',
                }));
            }

            if (action === 'highlight') {
                response = await highlightBlog(blog.id);
                setBlog((currentBlog) => ({
                    ...currentBlog,
                    is_highlighted: !currentBlog.is_highlighted,
                }));
            }

            setInteractionMessage(response?.message || 'Action completed');
        } catch (requestError) {
            setInteractionError(
                requestError.response?.data?.message ||
                'We could not complete this moderation action right now.'
            );
        } finally {
            setIsModerating(false);
        }
    }

    async function handleCreateComment(event) {
        event.preventDefault();
        setCommentError('');
        setCommentFieldErrors({});
        setCommentSuccessMessage('');

        if (!blog) {
            return;
        }

        setIsSubmittingComment(true);

        try {
            const createdComment = await createComment({
                content: commentContent,
                commentable_id: blog.id,
                commentable_type: 'blog',
            });

            setBlog((currentBlog) => ({
                ...currentBlog,
                comments: [createdComment, ...(currentBlog.comments || [])],
            }));
            setCommentContent('');
            setCommentSuccessMessage('Comment posted successfully.');
        } catch (requestError) {
            const nextFieldErrors = requestError.response?.data?.errors || {};

            setCommentFieldErrors(nextFieldErrors);
            setCommentError(
                Object.keys(nextFieldErrors).length
                    ? ''
                    : requestError.response?.data?.message ||
                      'We could not post your comment right now.'
            );
        } finally {
            setIsSubmittingComment(false);
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
    const canLike = user && blog.you_coder?.id !== user.id;
    const canModerate = canModerateBlogs(user);

    return (
        <div className="grid gap-6">
            <SectionCard
                eyebrow="Blog details"
                title=""
                description=""
                className="hero-gradient overflow-hidden"
            >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top_left,rgba(255,102,214,0.16),transparent_24%),radial-gradient(circle_at_top_right,rgba(41,207,255,0.16),transparent_24%),radial-gradient(circle_at_40%_30%,rgba(255,211,39,0.12),transparent_28%)]" />

                <div className="relative flex flex-wrap items-center gap-3">
                    <Link
                        to="/app/blogs"
                        className="festival-card rounded-full border-2 border-black bg-[#FFF3DC] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]"
                    >
                        Back to blogs
                    </Link>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${getStatusBadgeClass(blog.status, blog.is_highlighted)}`}>
                        {getStatusLabel(blog.status, blog.is_highlighted)}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">
                        {blog.like_count || 0} likes
                    </span>
                    {blog.you_coder ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">
                            {blog.you_coder.name}
                        </span>
                    ) : null}
                    {canLike ? (
                        <button
                            type="button"
                            onClick={handleLikeBlog}
                            disabled={isLiking}
                            className={[
                                'festival-card rounded-full border-2 border-black px-4 py-2 text-sm font-black uppercase tracking-[0.14em] shadow-[4px_4px_0_rgba(0,0,0,0.85)] disabled:cursor-not-allowed disabled:opacity-70',
                                hasLikedInSession ? 'bg-[#FF66D6] text-black' : 'bg-[#FFF3DC] text-black',
                            ].join(' ')}
                        >
                            {isLiking ? 'Updating like...' : hasLikedInSession ? 'Remove like' : 'Like blog'}
                        </button>
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
                            className="festival-card rounded-full border-2 border-black bg-[#25F2A0] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]"
                        >
                            {isEditing ? 'Cancel edit' : 'Edit blog'}
                        </button>
                    ) : null}
                    {canModerate ? (
                        <>
                            <button
                                type="button"
                                onClick={() => handleModerationAction('approve')}
                                disabled={isModerating}
                                className="festival-card rounded-full border-2 border-black bg-[#25F2A0] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                Approve
                            </button>
                            <button
                                type="button"
                                onClick={() => handleModerationAction('reject')}
                                disabled={isModerating}
                                className="festival-card rounded-full border-2 border-black bg-[#FFD327] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                Reject
                            </button>
                            <button
                                type="button"
                                onClick={() => handleModerationAction('highlight')}
                                disabled={isModerating}
                                className="festival-card rounded-full border-2 border-black bg-[#29CFFF] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {blog.is_highlighted ? 'Unhighlight' : 'Highlight'}
                            </button>
                        </>
                    ) : null}
                </div>

                {editSuccessMessage ? (
                    <p className="mt-6 text-sm font-bold text-[#25F2A0]">{editSuccessMessage}</p>
                ) : null}

                {interactionMessage ? (
                    <p className="mt-4 text-sm font-bold text-[#25F2A0]">{interactionMessage}</p>
                ) : null}

                {interactionError ? (
                    <p className="mt-4 text-sm font-bold text-[#FFD327]">{interactionError}</p>
                ) : null}

                <div className="relative mt-8 overflow-hidden rounded-[2.3rem] border-2 border-black bg-[linear-gradient(145deg,#FFF3DC_0%,#ffe7a6_100%)] p-8 text-black shadow-[8px_8px_0_rgba(0,0,0,0.85)]">
                    <div className="absolute right-5 top-5 h-5 w-5 rounded-full bg-[#FF66D6]" />
                    <div className="absolute right-12 top-10 h-3 w-3 rounded-full bg-[#29CFFF]" />
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#7b5c3d]">
                        YouConnect editorial
                    </p>
                    <h1 className="mt-4 font-display text-5xl font-extrabold leading-[0.95]">
                        {blog.title}
                    </h1>

                    <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-[#4d4239]">
                        <span className="rounded-full bg-black px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#FFF3DC]">
                            {blog.like_count || 0} likes
                        </span>
                        <span className="rounded-full bg-white/60 px-4 py-2">
                            {blog.comments?.length || 0} comments
                        </span>
                    </div>

                    {isEditing ? (
                    <form onSubmit={handleUpdateBlog} className="mt-8 grid gap-4 rounded-[2rem] border border-black/15 bg-white/50 p-5">
                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#7b5c3d]">
                                Blog title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={editForm.title}
                                onChange={handleEditInputChange}
                                className="w-full rounded-[1.4rem] border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none"
                            />
                            {editFieldErrors.title ? (
                                <p className="mt-2 text-xs font-bold text-[#FFD327]">{editFieldErrors.title[0]}</p>
                            ) : null}
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#7b5c3d]">
                                Blog content
                            </label>
                            <textarea
                                name="content"
                                value={editForm.content}
                                onChange={handleEditInputChange}
                                rows="8"
                                className="w-full rounded-[1.4rem] border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none"
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
                                className="festival-card rounded-full border-2 border-black bg-[#25F2A0] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isSaving ? 'Saving changes...' : 'Save changes'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <p className="mt-8 max-w-4xl text-base leading-9 text-[#3d332c]">
                        {blog.content}
                    </p>
                )}
                </div>
            </SectionCard>

            <SectionCard
                eyebrow="Comment"
                title="Join the discussion"
                description="Add your reaction, feedback, or follow-up right under the article."
            >
                <form
                    onSubmit={handleCreateComment}
                    className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[5px_5px_0_rgba(0,0,0,0.8)]"
                >
                    <div>
                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                            Your comment
                        </label>
                        <textarea
                            value={commentContent}
                            onChange={(event) => setCommentContent(event.target.value)}
                            rows="4"
                            placeholder="Share your reaction to this blog."
                            className="w-full rounded-[1.4rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none"
                        />
                        {commentFieldErrors.content ? (
                            <p className="mt-2 text-xs font-bold text-[#FFD327]">
                                {commentFieldErrors.content[0]}
                            </p>
                        ) : null}
                    </div>

                    {commentError ? (
                        <p className="text-sm font-bold text-[#FFD327]">{commentError}</p>
                    ) : null}

                    {commentSuccessMessage ? (
                        <p className="text-sm font-bold text-[#25F2A0]">{commentSuccessMessage}</p>
                    ) : null}

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmittingComment}
                            className="festival-card rounded-full border-2 border-black bg-[#25F2A0] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSubmittingComment ? 'Posting comment...' : 'Post comment'}
                        </button>
                    </div>
                </form>
            </SectionCard>

            {blog.comments?.length ? (
                <SectionCard
                    eyebrow="Discussion"
                    title="Comments on this blog"
                    description="The discussion keeps the same bold visual feel, but the reading stays calm and clear."
                >
                    <div className="grid gap-4">
                        {blog.comments.map((comment) => (
                            <article key={comment.id} className="surface festival-card rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[5px_5px_0_rgba(0,0,0,0.8)]">
                                <div className="flex items-start gap-4">
                                    {comment.you_coder?.photo ? (
                                        <UserAvatar
                                            name={comment.you_coder?.name}
                                            photo={comment.you_coder?.photo}
                                            size="sm"
                                        />
                                    ) : (
                                        <UserAvatar
                                            name={comment.you_coder?.name}
                                            photo={comment.you_coder?.photo}
                                            size="sm"
                                        />
                                    )}

                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold text-[#FFF3DC]">
                                            {comment.you_coder?.name || 'YouConnect member'}
                                        </p>
                                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#25F2A0]">
                                            Community comment
                                        </p>
                                        <p className="mt-4 text-sm leading-7 text-[rgb(var(--fg-muted))]">
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
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
