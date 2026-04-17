import { useEffect, useMemo, useState } from 'react';
import { SectionCard } from '../../../shared/components/SectionCard';
import { EmptyState } from '../../../shared/ui/feedback/EmptyState';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';
import { LoadingState } from '../../../shared/ui/feedback/LoadingState';
import { createQuestion, getQuestions } from '../../../services/api/questions.service';
import { getTags } from '../../../services/api/tags.service';
import { QuestionFeedCard } from '../components/QuestionFeedCard';

export function QuestionsPage() {
    const [questions, setQuestions] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState('All topics');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        title: '',
        content: '',
        tags: [],
    });
    const [formError, setFormError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        let isMounted = true;

        async function loadQuestions() {
            setIsLoading(true);
            setError('');

            try {
                const [questionsResponse, tagsResponse] = await Promise.all([
                    getQuestions(),
                    getTags(),
                ]);

                if (!isMounted) {
                    return;
                }

                setQuestions(questionsResponse.data || []);
                setAvailableTags(tagsResponse.data || []);
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
                    setIsLoading(false);
                }
            }
        }

        loadQuestions();

        return () => {
            isMounted = false;
        };
    }, []);

    const topicItems = useMemo(() => {
        const tagNames = questions.flatMap((question) => question.tags?.map((tag) => tag.name) || []);
        const uniqueTagNames = [...new Set(tagNames)];

        return ['All topics', ...uniqueTagNames.slice(0, 5)];
    }, [questions]);

    const filteredQuestions = useMemo(() => {
        if (selectedTopic === 'All topics') {
            return questions;
        }

        return questions.filter((question) =>
            question.tags?.some((tag) => tag.name === selectedTopic)
        );
    }, [questions, selectedTopic]);

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
            setSelectedTopic('All topics');
            setSuccessMessage('Question created successfully.');
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
            <EmptyState
                eyebrow="Questions"
                title="No questions yet"
                description="As soon as people start asking, the question feed will show up here."
            />
        );
    }

    return (
        <div className="grid gap-6">
            <SectionCard
                eyebrow="Questions"
                title="Question feed with real backend data"
                description="This page now reads the latest questions from Laravel and lets you scan topics, authors, answer counts, and status quickly."
                className="hero-gradient"
            >
                <form onSubmit={handleCreateQuestion} className="mb-6 grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5">
                    <div>
                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                            Question title
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleInputChange}
                            placeholder="How should I structure my React feature folders?"
                            className="w-full rounded-[1.4rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none"
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
                            rows="5"
                            placeholder="Explain your problem clearly so the community can help."
                            className="w-full rounded-[1.4rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none"
                        />
                        {fieldErrors.content ? (
                            <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.content[0]}</p>
                        ) : null}
                    </div>

                    <div>
                        <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                            Tags
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map((tag) => {
                                const isSelected = form.tags.includes(tag.id);

                                return (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => toggleTag(tag.id)}
                                        className={[
                                            'rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em]',
                                            isSelected
                                                ? 'bg-[#FFD327] text-black'
                                                : 'border border-white/10 bg-white/5 text-[#d8cfbd]',
                                        ].join(' ')}
                                    >
                                        {tag.name}
                                    </button>
                                );
                            })}
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

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="festival-card rounded-full bg-[#25F2A0] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-black disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSubmitting ? 'Publishing question...' : 'Ask question'}
                        </button>
                    </div>
                </form>

                <div className="flex flex-wrap gap-3">
                    {topicItems.map((item, index) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => setSelectedTopic(item)}
                            className={[
                                'festival-card rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.14em]',
                                selectedTopic === item || (index === 0 && selectedTopic === 'All topics')
                                    ? 'bg-[#FFD327] text-black'
                                    : 'bg-white/70 text-black dark:bg-white/10 dark:text-[rgb(var(--fg))]',
                            ].join(' ')}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </SectionCard>

            <div className="grid gap-4">
                {filteredQuestions.length ? (
                    filteredQuestions.map((question) => (
                        <QuestionFeedCard key={question.id} question={question} />
                    ))
                ) : (
                    <EmptyState
                        eyebrow="Questions"
                        title="No questions for this topic"
                        description="Try switching back to all topics or add more tagged questions to the database."
                    />
                )}
            </div>
        </div>
    );
}
