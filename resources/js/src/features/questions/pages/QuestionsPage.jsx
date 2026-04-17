import { useEffect, useMemo, useState } from 'react';
import { SectionCard } from '../../../shared/components/SectionCard';
import { EmptyState } from '../../../shared/ui/feedback/EmptyState';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';
import { LoadingState } from '../../../shared/ui/feedback/LoadingState';
import { getQuestions } from '../../../services/api/questions.service';
import { QuestionFeedCard } from '../components/QuestionFeedCard';

export function QuestionsPage() {
    const [questions, setQuestions] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState('All topics');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        async function loadQuestions() {
            setIsLoading(true);
            setError('');

            try {
                const response = await getQuestions();

                if (!isMounted) {
                    return;
                }

                setQuestions(response.data || []);
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
