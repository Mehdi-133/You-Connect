import { useEffect, useMemo, useRef, useState } from 'react';
import { SectionCard } from '../../../shared/components/SectionCard';
import { EmptyState } from '../../../shared/ui/feedback/EmptyState';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';
import { LoadingState } from '../../../shared/ui/feedback/LoadingState';
import { Modal } from '../../../shared/ui/overlay/Modal';
import { CreateActionButton } from '../../../shared/ui/buttons/CreateActionButton';
import { createQuestion, getQuestions } from '../../../services/api/questions.service';
import { getTags } from '../../../services/api/tags.service';
import { QuestionFeedCard } from '../components/QuestionFeedCard';
import { getCachedPageData, setCachedPageData } from '../../../shared/utils/pageCache';

const QUESTIONS_CACHE_KEY = 'page:questions';
const QUESTIONS_CACHE_TTL_MS = 45_000;

export function QuestionsPage() {
    const [questions, setQuestions] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedFilterTagId, setSelectedFilterTagId] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [form, setForm] = useState({
        title: '',
        content: '',
        tags: [],
    });
    const [formError, setFormError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isTagPickerOpen, setIsTagPickerOpen] = useState(false);
    const [tagQuery, setTagQuery] = useState('');
    const tagPickerRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        const cached = getCachedPageData(QUESTIONS_CACHE_KEY, QUESTIONS_CACHE_TTL_MS);
        if (cached?.questions || cached?.tags) {
            setQuestions(cached?.questions || []);
            setAvailableTags(cached?.tags || []);
            setIsLoading(false);
        }

        async function loadQuestions() {
            if (!cached) {
                setIsLoading(true);
            }
            setError('');

            try {
                const [questionsResponse, tagsResponse] = await Promise.all([
                    getQuestions({}),
                    getTags({ per_page: 100 }),
                ]);

                if (!isMounted) {
                    return;
                }

                const nextQuestions = questionsResponse.data || [];
                const nextTags = tagsResponse.data || [];
                setQuestions(nextQuestions);
                setAvailableTags(nextTags);
                setCachedPageData(QUESTIONS_CACHE_KEY, { questions: nextQuestions, tags: nextTags });
            } catch (requestError) {
                if (!isMounted) {
                    return;
                }

                setError(
                    requestError.response?.data?.message ||
                    'We could not load the questions feed right now.'
                );
            } finally {
                if (isMounted) {
                    if (!cached) {
                        setIsLoading(false);
                    }
                }
            }
        }

        loadQuestions();

        return () => {
            isMounted = false;
        };
    }, []);

    const selectedFilterTag = useMemo(() => {
        if (!selectedFilterTagId) {
            return null;
        }

        return availableTags.find((tag) => String(tag.id) === String(selectedFilterTagId)) || null;
    }, [availableTags, selectedFilterTagId]);

    const statusFilters = ['All', 'Open', 'Closed'];

    const topicFilteredQuestions = useMemo(() => {
        if (!selectedFilterTagId) {
            return questions;
        }

        return questions.filter((question) =>
            question.tags?.some((tag) => String(tag.id) === String(selectedFilterTagId))
        );
    }, [questions, selectedFilterTagId]);

    const filteredQuestions = useMemo(() => {
        if (selectedStatus === 'All') {
            return topicFilteredQuestions;
        }

        const normalized = selectedStatus.toLowerCase();

        if (normalized === 'open') {
            return topicFilteredQuestions.filter(
                (question) => String(question?.status || 'open').toLowerCase() !== 'closed'
            );
        }

        return topicFilteredQuestions.filter(
            (question) => String(question?.status || '').toLowerCase() === normalized
        );
    }, [topicFilteredQuestions, selectedStatus]);

    const filterTags = useMemo(() => {
        return [...availableTags]
            .sort((left, right) => {
                const leftCount = left.questions_count ?? 0;
                const rightCount = right.questions_count ?? 0;

                if (rightCount !== leftCount) {
                    return rightCount - leftCount;
                }

                return String(left.name || '').localeCompare(String(right.name || ''));
            })
            .slice(0, 10);
    }, [availableTags]);

    const tagPickerOptions = useMemo(() => {
        const query = tagQuery.trim().toLowerCase();

        if (!query) {
            return availableTags;
        }

        return availableTags.filter((tag) => String(tag.name || '').toLowerCase().includes(query));
    }, [availableTags, tagQuery]);

    useEffect(() => {
        function handleOutsideClick(event) {
            if (tagPickerRef.current && !tagPickerRef.current.contains(event.target)) {
                setIsTagPickerOpen(false);
            }
        }

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    function handleInputChange(event) {
        const { name, value } = event.target;

        setForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    }

    function toggleTag(tagId) {
        setForm((currentForm) => {
            const hasTag = currentForm.tags.includes(tagId);

            return {
                ...currentForm,
                tags: hasTag
                    ? currentForm.tags.filter((id) => id !== tagId)
                    : [...currentForm.tags, tagId],
            };
        });
    }

    function clearSelectedTags() {
        setForm((currentForm) => ({
            ...currentForm,
            tags: [],
        }));
    }

    async function handleCreateQuestion(event) {
        event.preventDefault();
        setFormError('');
        setFieldErrors({});
        setSuccessMessage('');
        setIsSubmitting(true);

        try {
            const createdQuestion = await createQuestion(form);

            setQuestions((currentQuestions) => [createdQuestion, ...currentQuestions]);
            setForm({
                title: '',
                content: '',
                tags: [],
            });
            setSelectedFilterTagId('');
            setSuccessMessage('Question created successfully.');
            setIsCreateOpen(false);
            setIsTagPickerOpen(false);
            setTagQuery('');
        } catch (requestError) {
            const message =
                requestError.response?.data?.message ||
                'We could not create your question right now.';

            setFormError(message);
            setFieldErrors(requestError.response?.data?.errors || {});
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <LoadingState
                eyebrow="Questions"
                title="Loading question feed"
                description="We are pulling the latest questions, tags, and discussion counts."
            />
        );
    }

    if (error) {
        return (
            <ErrorState
                eyebrow="Questions"
                title="Question feed unavailable"
                description={error}
                helperText="Check that the backend is running and that your session is still valid, then refresh the page."
            />
        );
    }

    if (!questions.length) {
        return (
            <div className="grid gap-6">
                <EmptyState
                    eyebrow="Questions"
                    title="No questions yet"
                    description="Ask the first one. Add a tag so the right people can spot it fast."
                    action={(
                        <CreateActionButton
                            label="Create question"
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
                    onClose={() => {
                        setIsCreateOpen(false);
                        setIsTagPickerOpen(false);
                        setTagQuery('');
                    }}
                    eyebrow="Create"
                    title="Ask a question"
                    description="Be specific and tag the topic so mentors can find it quickly."
                    footer={(
                        <div className="flex flex-wrap items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCreateOpen(false);
                                    setIsTagPickerOpen(false);
                                    setTagQuery('');
                                }}
                                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#FFF3DC] transition hover:bg-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="create-question-form"
                                disabled={isSubmitting}
                                className="festival-card rounded-full border-2 border-black bg-[#25F2A0] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[6px_6px_0_rgba(0,0,0,0.85)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? 'Publishing…' : 'Ask question'}
                            </button>
                        </div>
                    )}
                >
                    <form id="create-question-form" onSubmit={handleCreateQuestion} className="grid gap-4">
                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                Question title
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
                                placeholder="How should I structure my React feature folders?"
                                className="w-full rounded-[1.4rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
                            />
                            {fieldErrors.title ? (
                                <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.title[0]}</p>
                            ) : null}
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                Question details
                            </label>
                            <textarea
                                name="content"
                                value={form.content}
                                onChange={handleInputChange}
                                rows="6"
                                placeholder="Explain your problem clearly so the community can help."
                                className="w-full resize-none rounded-[1.4rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm leading-7 text-white outline-none placeholder:text-white/35 focus:border-white/20"
                            />
                            {fieldErrors.content ? (
                                <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.content[0]}</p>
                            ) : null}
                        </div>

                        <div>
                            <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                What technology / topic does this question belong to?
                            </p>
                            <div ref={tagPickerRef} className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsTagPickerOpen((current) => !current)}
                                    className={[
                                        'w-full rounded-[1.6rem] border border-white/10 bg-[#05020d] px-4 py-3 text-left text-sm text-white outline-none transition',
                                        isTagPickerOpen ? 'ring-2 ring-[#25F2A0]/40' : 'hover:bg-[#0f0636]',
                                    ].join(' ')}
                                >
                                    {form.tags.length ? (
                                        <span className="flex flex-wrap items-center gap-2 pr-8">
                                            {availableTags
                                                .filter((tag) => form.tags.includes(tag.id))
                                                .slice(0, 6)
                                                .map((tag) => (
                                                    <span
                                                        key={tag.id}
                                                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#FFF3DC]"
                                                    >
                                                        {tag.name}
                                                        <button
                                                            type="button"
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                event.stopPropagation();
                                                                toggleTag(tag.id);
                                                            }}
                                                            className="rounded-full bg-black/35 px-2 py-1 text-[10px] font-black text-white/70 transition hover:bg-black/55 hover:text-white"
                                                            aria-label={`Remove ${tag.name}`}
                                                        >
                                                            x
                                                        </button>
                                                    </span>
                                                ))}
                                            {form.tags.length > 6 ? (
                                                <span className="text-xs font-semibold text-white/60">
                                                    +{form.tags.length - 6} more
                                                </span>
                                            ) : null}
                                        </span>
                                    ) : (
                                        <span className="text-white/60">Pick topics (Laravel, React, Sanctum...)</span>
                                    )}
                                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/60">
                                        <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[2]">
                                            <path d="M5 7l5 6 5-6" />
                                        </svg>
                                    </span>
                                </button>

                                {isTagPickerOpen ? (
                                    <div className="absolute left-0 right-0 z-20 mt-3 overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#0B0126] shadow-[8px_8px_0_rgba(0,0,0,0.85)]">
                                        <div className="border-b border-white/10 p-3">
                                            <input
                                                type="text"
                                                value={tagQuery}
                                                onChange={(event) => setTagQuery(event.target.value)}
                                                onKeyDown={(event) => {
                                                    if (event.key === 'Enter') {
                                                        event.preventDefault();
                                                    }
                                                }}
                                                placeholder="Search tags..."
                                                className="w-full rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40"
                                            />
                                        </div>
                                        <div className="max-h-64 overflow-y-auto p-2">
                                            {tagPickerOptions.length ? (
                                                tagPickerOptions.map((tag) => {
                                                    const isSelected = form.tags.includes(tag.id);

                                                    return (
                                                        <button
                                                            key={tag.id}
                                                            type="button"
                                                            onClick={() => toggleTag(tag.id)}
                                                            className={[
                                                                'flex w-full items-center justify-between gap-3 rounded-[1.2rem] px-4 py-3 text-left text-sm font-bold transition',
                                                                isSelected
                                                                    ? 'bg-white/10 text-white'
                                                                    : 'text-[#d8cfbd] hover:bg-white/8 hover:text-white',
                                                            ].join(' ')}
                                                        >
                                                            <span className="min-w-0 truncate">{tag.name}</span>
                                                            <span className={[
                                                                'inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-[10px] font-black uppercase tracking-[0.14em]',
                                                                isSelected ? 'bg-[#25F2A0] text-black' : 'border border-white/10 bg-white/5 text-white/70',
                                                            ].join(' ')}>
                                                                {isSelected ? 'On' : 'Off'}
                                                            </span>
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                <div className="p-4 text-sm font-semibold text-white/60">
                                                    No tags match your search.
                                                </div>
                                            )}
                                        </div>

                                        {form.tags.length ? (
                                            <div className="flex items-center justify-between gap-3 border-t border-white/10 p-3">
                                                <p className="text-xs font-semibold text-white/60">
                                                    {form.tags.length} selected
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={clearSelectedTags}
                                                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#FFF3DC] transition hover:bg-white/10"
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                ) : null}
                            </div>
                            {fieldErrors.tags ? (
                                <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.tags[0]}</p>
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
        <div className="mx-auto grid w-full max-w-[1080px] gap-6">
            <SectionCard
                eyebrow="Questions"
                title="Question feed with real backend data"
                description="This page now reads the latest questions from Laravel and lets you scan topics, authors, answer counts, and status quickly."
                className="hero-gradient p-4 sm:p-6"
            >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-white/60">
                            Ask with clarity. Tag the topic. Get faster answers.
                        </p>
                        {selectedFilterTag ? (
                            <p className="mt-2 text-xs font-semibold text-[#d8cfbd]">
                                Showing questions tagged with <span className="font-black text-[#FFF3DC]">{selectedFilterTag.name}</span>.
                            </p>
                        ) : null}
                    </div>

                    <CreateActionButton
                        label="Create question"
                        shortLabel="Create"
                        className="w-full sm:w-auto"
                        onClick={() => {
                            setFormError('');
                            setFieldErrors({});
                            setSuccessMessage('');
                            setIsCreateOpen(true);
                        }}
                    />
                </div>

                {formError ? (
                    <p className="mt-4 text-sm font-bold text-[#FFD327]">{formError}</p>
                ) : null}

                {successMessage ? (
                    <p className="mt-4 text-sm font-bold text-[#25F2A0]">{successMessage}</p>
                ) : null}

                <div className="mt-5">
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                        Filter by topic
                    </p>
                    <div className="-mx-2 flex gap-3 overflow-x-auto px-2 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
                        <button
                            type="button"
                            onClick={() => setSelectedFilterTagId('')}
                            className={[
                                'festival-card shrink-0 rounded-full px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] shadow-[4px_4px_0_rgba(0,0,0,0.85)] transition sm:px-5 sm:py-3 sm:text-xs',
                                selectedFilterTagId
                                    ? 'border border-white/10 bg-white/10 text-[#d8cfbd] hover:bg-white/15 hover:text-white'
                                    : 'border-2 border-black bg-[#25F2A0] text-black',
                            ].join(' ')}
                        >
                            All topics
                        </button>

                        {filterTags.map((tag) => {
                            const isActive = String(tag.id) === String(selectedFilterTagId);

                            return (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => setSelectedFilterTagId(String(tag.id))}
                                    className={[
                                        'festival-card shrink-0 rounded-full px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] shadow-[4px_4px_0_rgba(0,0,0,0.85)] transition sm:px-5 sm:py-3 sm:text-xs',
                                        isActive
                                            ? 'border-2 border-black bg-[#FFD327] text-black'
                                            : 'border border-white/10 bg-white/10 text-[#d8cfbd] hover:bg-white/15 hover:text-white',
                                    ].join(' ')}
                                >
                                    <span className="flex items-center gap-2">
                                        <span>{tag.name}</span>
                                        {tag.questions_count ? (
                                            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-black/40 px-2 py-1 text-[10px] font-black leading-none text-[#FFF3DC]">
                                                {tag.questions_count}
                                            </span>
                                        ) : null}
                                    </span>
                                </button>
                            );
                        })}

                        {selectedFilterTag ? (
                            <button
                                type="button"
                                onClick={() => setSelectedFilterTagId('')}
                                className="festival-card shrink-0 rounded-full border border-[#ff8f8f]/40 bg-[#2a0b15] px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#ffb8b8] shadow-[4px_4px_0_rgba(0,0,0,0.85)] transition hover:bg-[#39101d] sm:px-5 sm:py-3 sm:text-xs"
                            >
                                Clear
                            </button>
                        ) : null}
                    </div>
                    {selectedFilterTag ? (
                        <p className="mt-2 text-xs font-semibold text-[#d8cfbd]">
                            Showing questions tagged with <span className="font-black text-[#FFF3DC]">{selectedFilterTag.name}</span>.
                        </p>
                    ) : null}
                </div>

                <div className="mt-6">
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                        Filter by status
                    </p>
                    <div className="-mx-2 flex gap-3 overflow-x-auto px-2 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
                        {statusFilters.map((item) => {
                            const isActive = item === selectedStatus;
                            return (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setSelectedStatus(item)}
                                    className={[
                                        'festival-card shrink-0 rounded-full px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] shadow-[4px_4px_0_rgba(0,0,0,0.85)] transition sm:px-5 sm:py-3 sm:text-xs',
                                        isActive
                                            ? 'border-2 border-black bg-[#25F2A0] text-black'
                                            : 'border border-white/10 bg-white/10 text-[#d8cfbd] hover:bg-white/15 hover:text-white',
                                    ].join(' ')}
                                >
                                    {item}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </SectionCard>

            <Modal
                isOpen={isCreateOpen}
                onClose={() => {
                    setIsCreateOpen(false);
                    setIsTagPickerOpen(false);
                    setTagQuery('');
                }}
                eyebrow="Create"
                title="Ask a question"
                description="Be specific and tag the topic so mentors can find it quickly."
                footer={(
                    <div className="flex flex-wrap items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setIsCreateOpen(false);
                                setIsTagPickerOpen(false);
                                setTagQuery('');
                            }}
                            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#FFF3DC] transition hover:bg-white/10"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="create-question-form"
                            disabled={isSubmitting}
                            className="festival-card rounded-full border-2 border-black bg-[#25F2A0] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[6px_6px_0_rgba(0,0,0,0.85)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? 'Publishing…' : 'Ask question'}
                        </button>
                    </div>
                )}
            >
                <form id="create-question-form" onSubmit={handleCreateQuestion} className="grid gap-4">
                    <div>
                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                            Question title
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
                            placeholder="How should I structure my React feature folders?"
                            className="w-full rounded-[1.4rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
                        />
                        {fieldErrors.title ? (
                            <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.title[0]}</p>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                            Question details
                        </label>
                        <textarea
                            name="content"
                            value={form.content}
                            onChange={handleInputChange}
                            rows="6"
                            placeholder="Explain your problem clearly so the community can help."
                            className="w-full resize-none rounded-[1.4rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm leading-7 text-white outline-none placeholder:text-white/35 focus:border-white/20"
                        />
                        {fieldErrors.content ? (
                            <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.content[0]}</p>
                        ) : null}
                    </div>

                    <div>
                        <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                            What technology / topic does this question belong to?
                        </p>
                        <div ref={tagPickerRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setIsTagPickerOpen((current) => !current)}
                                className={[
                                    'w-full rounded-[1.6rem] border border-white/10 bg-[#05020d] px-4 py-3 text-left text-sm text-white outline-none transition',
                                    isTagPickerOpen ? 'ring-2 ring-[#25F2A0]/40' : 'hover:bg-[#0f0636]',
                                ].join(' ')}
                            >
                                {form.tags.length ? (
                                    <span className="flex flex-wrap items-center gap-2 pr-8">
                                        {availableTags
                                            .filter((tag) => form.tags.includes(tag.id))
                                            .slice(0, 6)
                                            .map((tag) => (
                                                <span
                                                    key={tag.id}
                                                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#FFF3DC]"
                                                >
                                                    {tag.name}
                                                    <button
                                                        type="button"
                                                        onClick={(event) => {
                                                            event.preventDefault();
                                                            event.stopPropagation();
                                                            toggleTag(tag.id);
                                                        }}
                                                        className="rounded-full bg-black/35 px-2 py-1 text-[10px] font-black text-white/70 transition hover:bg-black/55 hover:text-white"
                                                        aria-label={`Remove ${tag.name}`}
                                                    >
                                                        x
                                                    </button>
                                                </span>
                                            ))}
                                        {form.tags.length > 6 ? (
                                            <span className="text-xs font-semibold text-white/60">
                                                +{form.tags.length - 6} more
                                            </span>
                                        ) : null}
                                    </span>
                                ) : (
                                    <span className="text-white/60">Pick topics (Laravel, React, Sanctum...)</span>
                                )}
                                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/60">
                                    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[2]">
                                        <path d="M5 7l5 6 5-6" />
                                    </svg>
                                </span>
                            </button>

                            {isTagPickerOpen ? (
                                <div className="absolute left-0 right-0 z-20 mt-3 overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#0B0126] shadow-[8px_8px_0_rgba(0,0,0,0.85)]">
                                    <div className="border-b border-white/10 p-3">
                                        <input
                                            type="text"
                                            value={tagQuery}
                                            onChange={(event) => setTagQuery(event.target.value)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter') {
                                                    event.preventDefault();
                                                }
                                            }}
                                            placeholder="Search tags..."
                                            className="w-full rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40"
                                        />
                                    </div>
                                    <div className="max-h-64 overflow-y-auto p-2">
                                        {tagPickerOptions.length ? (
                                            tagPickerOptions.map((tag) => {
                                                const isSelected = form.tags.includes(tag.id);

                                                return (
                                                    <button
                                                        key={tag.id}
                                                        type="button"
                                                        onClick={() => toggleTag(tag.id)}
                                                        className={[
                                                            'flex w-full items-center justify-between gap-3 rounded-[1.2rem] px-4 py-3 text-left text-sm font-bold transition',
                                                            isSelected
                                                                ? 'bg-white/10 text-white'
                                                                : 'text-[#d8cfbd] hover:bg-white/8 hover:text-white',
                                                        ].join(' ')}
                                                    >
                                                        <span className="min-w-0 truncate">{tag.name}</span>
                                                        <span className={[
                                                            'inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-[10px] font-black uppercase tracking-[0.14em]',
                                                            isSelected ? 'bg-[#25F2A0] text-black' : 'border border-white/10 bg-white/5 text-white/70',
                                                        ].join(' ')}>
                                                            {isSelected ? 'On' : 'Off'}
                                                        </span>
                                                    </button>
                                                );
                                            })
                                        ) : (
                                            <div className="p-4 text-sm font-semibold text-white/60">
                                                No tags match your search.
                                            </div>
                                        )}
                                    </div>

                                    {form.tags.length ? (
                                        <div className="flex items-center justify-between gap-3 border-t border-white/10 p-3">
                                            <p className="text-xs font-semibold text-white/60">
                                                {form.tags.length} selected
                                            </p>
                                            <button
                                                type="button"
                                                onClick={clearSelectedTags}
                                                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#FFF3DC] transition hover:bg-white/10"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>
                        {fieldErrors.tags ? (
                            <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.tags[0]}</p>
                        ) : null}
                    </div>

                    {formError ? (
                        <p className="text-sm font-bold text-[#FFD327]">{formError}</p>
                    ) : null}
                </form>
            </Modal>

            <div className="grid gap-4">
                {filteredQuestions.length ? (
                    filteredQuestions.map((question) => (
                        <QuestionFeedCard key={question.id} question={question} />
                    ))
                ) : (
                    <EmptyState
                        eyebrow="Questions"
                        title={selectedFilterTag ? `No ${selectedFilterTag.name} questions yet` : 'No questions for this filter'}
                        description={selectedFilterTag ? 'Try another topic, switch status, or ask a new tagged question.' : 'Try switching back to All or add more questions to the database.'}
                    />
                )}
            </div>
        </div>
    );
}
