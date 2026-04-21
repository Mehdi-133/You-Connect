import { useEffect, useMemo, useState } from 'react';
import { SectionCard } from '../../../shared/components/SectionCard';
import { useAuth } from '../../../hooks/useAuth';
import { EmptyState } from '../../../shared/ui/feedback/EmptyState';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';
import { LoadingState } from '../../../shared/ui/feedback/LoadingState';
import { createBlog, deleteBlog, getBlogs, likeBlog } from '../../../services/api/blogs.service';
import { BlogFeedCard } from '../components/BlogFeedCard';

export function BlogsPage() {
    const { user } = useAuth();
    const [blogs, setBlogs] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState('Featured');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
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
        let isMounted = true;

        async function loadBlogs() {
            setIsLoading(true);
            setError('');

            try {
                const response = await getBlogs();

                if (!isMounted) {
                    return;
                }

                setBlogs(response.data || []);
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
                    setIsLoading(false);
                }
            }
        }

        loadBlogs();

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
                [blog.id]: !isRemovingLike,
            }));
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
            <EmptyState
                eyebrow="Blogs"
                title="No blogs yet"
                description="As soon as someone writes and submits a blog, the editorial feed will appear here."
            />
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

                <form onSubmit={handleCreateBlog} className="relative mb-6 grid gap-4 rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.03)_100%)] p-5 shadow-[6px_6px_0_rgba(0,0,0,0.85)]">
                    <div>
                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                            Blog title
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleInputChange}
                            placeholder="Share a lesson, tutorial, or community story"
                            className="w-full rounded-[1.4rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none"
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
                            placeholder="https://..."
                            className="w-full rounded-[1.4rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none"
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
                            className="w-full rounded-[1.4rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none"
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

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="festival-card rounded-full bg-[#25F2A0] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-black disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSubmitting ? 'Publishing blog...' : 'Create blog'}
                        </button>
                    </div>
                </form>

                <div className="relative flex flex-wrap gap-3">
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
            </SectionCard>

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
