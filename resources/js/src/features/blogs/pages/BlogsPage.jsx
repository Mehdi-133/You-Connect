import { useEffect, useMemo, useState } from 'react';
import { SectionCard } from '../../../shared/components/SectionCard';
import { useAuth } from '../../../hooks/useAuth';
import { EmptyState } from '../../../shared/ui/feedback/EmptyState';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';
import { LoadingState } from '../../../shared/ui/feedback/LoadingState';
import { Modal } from '../../../shared/ui/overlay/Modal';
import { CreateActionButton } from '../../../shared/ui/buttons/CreateActionButton';
import { createBlog, deleteBlog, getBlogs, likeBlog } from '../../../services/api/blogs.service';
import { BlogFeedCard } from '../components/BlogFeedCard';
import { getCachedPageData, setCachedPageData } from '../../../shared/utils/pageCache';
import { getLikedBlogIds, setBlogLiked } from '../../../shared/utils/blogLikes';

const BLOGS_CACHE_KEY = 'page:blogs';
const BLOGS_CACHE_TTL_MS = 45_000;

export function BlogsPage() {
    const { user } = useAuth();
    const [blogs, setBlogs] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState('Featured');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [form, setForm] = useState({
        title: '',
        photo: '',
        content: '',
    });
    const [formError, setFormError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [likedBlogs, setLikedBlogs] = useState({});
    const [processingBlogId, setProcessingBlogId] = useState(null);
    const [deletingBlogId, setDeletingBlogId] = useState(null);

    useEffect(() => {
        if (!user?.id) {
            setLikedBlogs({});
            return;
        }

        const ids = getLikedBlogIds(user.id);
        const next = Array.from(ids).reduce((acc, id) => {
            acc[id] = true;
            return acc;
        }, {});

        setLikedBlogs(next);
    }, [user?.id]);

    useEffect(() => {
        let isMounted = true;

        const cached = getCachedPageData(BLOGS_CACHE_KEY, BLOGS_CACHE_TTL_MS);
        if (cached?.blogs?.length) {
            setBlogs(cached.blogs);
            setIsLoading(false);
        }

        async function loadBlogs({ silent } = { silent: false }) {
            if (!silent) {
                setIsLoading(true);
            }
            setError('');

            try {
                const response = await getBlogs();

                if (!isMounted) {
                    return;
                }

                const nextBlogs = response.data || [];
                setBlogs(nextBlogs);
                setCachedPageData(BLOGS_CACHE_KEY, { blogs: nextBlogs });
            } catch (requestError) {
                if (!isMounted) {
                    return;
                }

                setError(
                    requestError.response?.data?.message ||
                    'We could not load the blogs feed right now.'
                );
            } finally {
                if (isMounted) {
                    if (!silent) {
                        setIsLoading(false);
                    }
                }
            }
        }

        loadBlogs({ silent: Boolean(cached?.blogs?.length) });

        return () => {
            isMounted = false;
        };
    }, []);

    const filterItems = ['Featured', 'Pending', 'Approved', 'Highlighted'];

    const filteredBlogs = useMemo(() => {
        if (selectedFilter === 'Featured') {
            return blogs;
        }

        if (selectedFilter === 'Pending') {
            return blogs.filter((blog) => blog.status === 'pending');
        }

        if (selectedFilter === 'Approved') {
            return blogs.filter((blog) => blog.status === 'approved');
        }

        if (selectedFilter === 'Highlighted') {
            return blogs.filter((blog) => blog.is_highlighted);
        }

        return blogs;
    }, [blogs, selectedFilter]);

    function handleInputChange(event) {
        const { name, value } = event.target;

        setForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    }

    async function handleCreateBlog(event) {
        event.preventDefault();
        setFormError('');
        setFieldErrors({});
        setSuccessMessage('');
        setIsSubmitting(true);

        try {
            const createdBlog = await createBlog(form);

            setBlogs((currentBlogs) => [createdBlog, ...currentBlogs]);
            setForm({
                title: '',
                photo: '',
                content: '',
            });
            setSelectedFilter('Featured');
            setSuccessMessage('Blog created successfully.');
            setIsCreateOpen(false);
        } catch (requestError) {
            const nextFieldErrors = requestError.response?.data?.errors || {};

            setFieldErrors(nextFieldErrors);
            setFormError(
                Object.keys(nextFieldErrors).length
                    ? ''
                    : requestError.response?.data?.message ||
                      'We could not create your blog right now.'
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleLikeBlog(blog) {
        setSuccessMessage('');
        setFormError('');
        setProcessingBlogId(blog.id);

        try {
            const response = await likeBlog({ blog_id: blog.id });
            const isRemovingLike = response.message === 'Like removed';
            const isNowLiked = !isRemovingLike;

            setBlogs((currentBlogs) =>
                currentBlogs.map((item) =>
                    item.id === blog.id
                        ? {
                            ...item,
                            like_count: isRemovingLike
                                ? Math.max(0, (item.like_count || 0) - 1)
                                : (item.like_count || 0) + 1,
                        }
                        : item
                )
            );

            setLikedBlogs((currentLikedBlogs) => ({
                ...currentLikedBlogs,
                [blog.id]: isNowLiked,
            }));
            setBlogLiked(user?.id, blog.id, isNowLiked);
        } catch (requestError) {
            setFormError(
                requestError.response?.data?.message ||
                'We could not update the like right now.'
            );
        } finally {
            setProcessingBlogId(null);
        }
    }

    async function handleDeleteBlog(blog) {
        if (!blog?.id) {
            return;
        }

        setSuccessMessage('');
        setFormError('');

        const confirmed = window.confirm('Delete this blog? This action cannot be undone.');
        if (!confirmed) {
            return;
        }

        setDeletingBlogId(blog.id);

        try {
            await deleteBlog(blog.id);

            setBlogs((currentBlogs) => currentBlogs.filter((item) => item.id !== blog.id));
            setBlogLiked(user?.id, blog.id, false);
            setLikedBlogs((current) => {
                const next = { ...(current || {}) };
                delete next[blog.id];
                return next;
            });
            setSuccessMessage('Blog deleted.');
        } catch (requestError) {
            setFormError(
                requestError.response?.data?.message ||
                'We could not delete this blog right now.'
            );
        } finally {
            setDeletingBlogId(null);
        }
    }

    if (isLoading) {
        return (
            <LoadingState
                eyebrow="Blogs"
                title="Loading blog feed"
                description="We are pulling the latest blog cards, authors, and statuses."
            />
        );
    }

    if (error) {
        return (
            <ErrorState
                eyebrow="Blogs"
                title="Blog feed unavailable"
                description={error}
                helperText="Check that the backend is running and that your session is still valid, then refresh the page."
            />
        );
    }

    if (!blogs.length) {
        return (
            <div className="grid gap-6">
                <EmptyState
                    eyebrow="Blogs"
                    title="No blogs yet"
                    description="Start the first story. Once people publish, the editorial feed will appear here."
                    action={(
                        <CreateActionButton
                            label="Create blog"
                            onClick={() => {
                                setFormError('');
                                setFieldErrors({});
                                setSuccessMessage('');
                                setIsCreateOpen(true);
                            }}
                        />
                    )}
                />

                <Modal
                    isOpen={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    eyebrow="Create"
                    title="Create a blog post"
                    description="Share a lesson, tutorial, or community story. Keep it clear and useful."
                    variant="section"
                    footer={(
                        <div className="flex flex-wrap items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsCreateOpen(false)}
                                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#FFF3DC] transition hover:bg-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="create-blog-form"
                                disabled={isSubmitting}
                                className="festival-card rounded-full border-2 border-black bg-[#25F2A0] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[6px_6px_0_rgba(0,0,0,0.85)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? 'Publishing…' : 'Create blog'}
                            </button>
                        </div>
                    )}
                >
                    <form id="create-blog-form" onSubmit={handleCreateBlog} className="grid gap-3">
                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                Blog title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleInputChange}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                    }
                                }}
                                placeholder="Share a lesson, tutorial, or community story"
                                className="w-full rounded-[1.4rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
                            />
                            {fieldErrors.title ? (
                                <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.title[0]}</p>
                            ) : null}
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                Photo URL (optional)
                            </label>
                            <input
                                type="text"
                                name="photo"
                                value={form.photo}
                                onChange={handleInputChange}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                    }
                                }}
                                placeholder="https://..."
                                className="w-full rounded-[1.4rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
                            />
                            {fieldErrors.photo ? (
                                <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.photo[0]}</p>
                            ) : null}
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                Blog content
                            </label>
                            <textarea
                                name="content"
                                value={form.content}
                                onChange={handleInputChange}
                                rows="6"
                                placeholder="Write the full blog content here."
                                className="h-[clamp(180px,28vh,260px)] w-full resize-none overflow-y-auto rounded-[1.4rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm leading-7 text-white outline-none placeholder:text-white/35 focus:border-white/20"
                            />
                            {fieldErrors.content ? (
                                <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.content[0]}</p>
                            ) : null}
                        </div>

                        {formError ? (
                            <p className="text-sm font-bold text-[#FFD327]">{formError}</p>
                        ) : null}

                        {successMessage ? (
                            <p className="text-sm font-bold text-[#25F2A0]">{successMessage}</p>
                        ) : null}
                    </form>
                </Modal>
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            <SectionCard
                eyebrow="Blogs"
                title="Stories, lessons, and community momentum"
                description="Your blog feed now feels closer to the rest of YouConnect: bold, layered, and still easy to read when the content gets serious."
                className="hero-gradient overflow-hidden"
            >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(255,102,214,0.16),transparent_26%),radial-gradient(circle_at_top_right,rgba(41,207,255,0.16),transparent_22%)]" />

                <div className="relative flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-3">
                        {filterItems.map((item, index) => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => setSelectedFilter(item)}
                                className={[
                                    'festival-card rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.14em] shadow-[4px_4px_0_rgba(0,0,0,0.85)]',
                                    selectedFilter === item || (index === 0 && selectedFilter === 'Featured')
                                        ? 'border-2 border-black bg-[#25F2A0] text-black'
                                        : 'border border-white/10 bg-white/70 text-black dark:bg-white/10 dark:text-[rgb(var(--fg))]',
                                ].join(' ')}
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    <CreateActionButton
                        label="Create blog"
                        onClick={() => {
                            setFormError('');
                            setFieldErrors({});
                            setSuccessMessage('');
                            setIsCreateOpen(true);
                        }}
                    />
                </div>

                {formError ? (
                    <p className="relative mt-4 text-sm font-bold text-[#FFD327]">{formError}</p>
                ) : null}

                {successMessage ? (
                    <p className="relative mt-4 text-sm font-bold text-[#25F2A0]">{successMessage}</p>
                ) : null}
            </SectionCard>

                <Modal
                    isOpen={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    eyebrow="Create"
                    title="Create a blog post"
                    description="Share a lesson, tutorial, or community story. Keep it clear and useful."
                    variant="section"
                    footer={(
                        <div className="flex flex-wrap items-center justify-end gap-3">
                            <button
                                type="button"
                            onClick={() => setIsCreateOpen(false)}
                            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#FFF3DC] transition hover:bg-white/10"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="create-blog-form"
                            disabled={isSubmitting}
                            className="festival-card rounded-full border-2 border-black bg-[#25F2A0] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[6px_6px_0_rgba(0,0,0,0.85)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? 'Publishing…' : 'Create blog'}
                        </button>
                    </div>
                    )}
                >
                    <form id="create-blog-form" onSubmit={handleCreateBlog} className="grid gap-3">
                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                Blog title
                            </label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleInputChange}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                }
                            }}
                            placeholder="Share a lesson, tutorial, or community story"
                            className="w-full rounded-[1.4rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
                        />
                        {fieldErrors.title ? (
                            <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.title[0]}</p>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                            Photo URL (optional)
                        </label>
                        <input
                            type="text"
                            name="photo"
                            value={form.photo}
                            onChange={handleInputChange}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                }
                            }}
                            placeholder="https://..."
                            className="w-full rounded-[1.4rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
                        />
                        {fieldErrors.photo ? (
                            <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.photo[0]}</p>
                        ) : null}
                    </div>

                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                Blog content
                            </label>
                            <textarea
                                name="content"
                                value={form.content}
                                onChange={handleInputChange}
                                rows="6"
                                placeholder="Write the full blog content here."
                                className="h-[clamp(180px,28vh,260px)] w-full resize-none overflow-y-auto rounded-[1.4rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm leading-7 text-white outline-none placeholder:text-white/35 focus:border-white/20"
                            />
                            {fieldErrors.content ? (
                                <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.content[0]}</p>
                            ) : null}
                        </div>

                    {formError ? (
                        <p className="text-sm font-bold text-[#FFD327]">{formError}</p>
                    ) : null}
                </form>
            </Modal>

            {filteredBlogs.length ? (
                <div className="grid gap-5">
                    {filteredBlogs.map((blog) => (
                        <BlogFeedCard
                            key={blog.id}
                            blog={blog}
                            canLike={Boolean(user && blog.you_coder?.id !== user.id)}
                            hasLiked={Boolean(likedBlogs[blog.id])}
                            isLiking={processingBlogId === blog.id}
                            onLike={handleLikeBlog}
                            isOwner={Boolean(user && blog.you_coder?.id === user.id)}
                            onDelete={handleDeleteBlog}
                            isDeleting={deletingBlogId === blog.id}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    eyebrow="Blogs"
                    title="No blogs for this filter"
                    description="Try another filter or create more blog data to populate this view."
                />
            )}
        </div>
    );
}
