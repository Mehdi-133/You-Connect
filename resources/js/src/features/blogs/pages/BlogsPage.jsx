import { useEffect, useMemo, useState } from 'react';
import { SectionCard } from '../../../shared/components/SectionCard';
import { EmptyState } from '../../../shared/ui/feedback/EmptyState';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';
import { LoadingState } from '../../../shared/ui/feedback/LoadingState';
import { createBlog, getBlogs } from '../../../services/api/blogs.service';
import { BlogFeedCard } from '../components/BlogFeedCard';

export function BlogsPage() {
    const [blogs, setBlogs] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState('Featured');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        title: '',
        content: '',
    });
    const [formError, setFormError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                content: '',
            });
            setSelectedFilter('Featured');
            setSuccessMessage('Blog created successfully.');
        } catch (requestError) {
            const message =
                requestError.response?.data?.message ||
                'We could not create your blog right now.';

            setFormError(message);
            setFieldErrors(requestError.response?.data?.errors || {});
        } finally {
            setIsSubmitting(false);
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
                title="Editorial feed with real backend data"
                description="This feed now reads the real blog list from Laravel and lets you scan status, author, and engagement quickly."
                className="hero-gradient"
            >
                <form onSubmit={handleCreateBlog} className="mb-6 grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5">
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

                <div className="flex flex-wrap gap-3">
                    {filterItems.map((item, index) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => setSelectedFilter(item)}
                            className={[
                                'festival-card rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.14em]',
                                selectedFilter === item || (index === 0 && selectedFilter === 'Featured')
                                    ? 'bg-[#25F2A0] text-black'
                                    : 'bg-white/70 text-black dark:bg-white/10 dark:text-[rgb(var(--fg))]',
                            ].join(' ')}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </SectionCard>

            {filteredBlogs.length ? (
                <div className="grid gap-5 lg:grid-cols-2">
                    {filteredBlogs.map((blog) => (
                        <BlogFeedCard key={blog.id} blog={blog} />
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
