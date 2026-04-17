import { SectionCard } from '../../../shared/components/SectionCard';
import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../../shared/ui/feedback/EmptyState';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';
import { LoadingState } from '../../../shared/ui/feedback/LoadingState';
import { getBlogs } from '../../../services/api/blogs.service';
import { BlogFeedCard } from '../components/BlogFeedCard';

export function BlogsPage() {
    const [blogs, setBlogs] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState('Featured');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

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
