import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SectionCard } from '../../../shared/components/SectionCard';
import { EmptyState } from '../../../shared/ui/feedback/EmptyState';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';
import { LoadingState } from '../../../shared/ui/feedback/LoadingState';
import { getQuestion, getQuestionAnswers } from '../../../services/api/questions.service';
import { QuestionAnswerCard } from '../components/QuestionAnswerCard';

function getTagTone(index) {
    const tones = ['#29CFFF', '#25F2A0', '#FF66D6', '#FFD327'];
    return tones[index % tones.length];
}

function getQuestionStatusLabel(question, answers) {
    if (question?.status === 'closed') {
        return 'Closed';
    }

    if (answers.some((answer) => answer.is_accepted)) {
        return 'Accepted answer';
    }

    if (answers.length) {
        return 'Active discussion';
    }

    return 'Needs answers';
}

export function QuestionDetailsPage() {
    const { questionId } = useParams();
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        async function loadQuestionDetails() {
            setIsLoading(true);
            setError('');

            try {
                const [questionResponse, answersResponse] = await Promise.all([
                    getQuestion(questionId),
                    getQuestionAnswers(questionId),
                ]);

                if (!isMounted) {
                    return;
                }

                setQuestion(questionResponse);
                setAnswers(answersResponse || []);
            } catch (requestError) {
                if (!isMounted) {
                    return;
                }

                setError(
                    requestError.response?.data?.message ||
                    'We could not load this question right now.'
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadQuestionDetails();

        return () => {
            isMounted = false;
        };
    }, [questionId]);

    if (isLoading) {
        return (
            <LoadingState
                eyebrow="Question details"
                title="Loading question and answers"
                description="We are pulling the full discussion for this question."
            />
        );
    }

    if (error) {
        return (
            <ErrorState
                eyebrow="Question details"
                title="Question unavailable"
                description={error}
                helperText="Go back to the questions list, refresh the page, and try again after the backend is running."
            />
        );
    }

    if (!question) {
        return (
            <EmptyState
                eyebrow="Question details"
                title="Question not found"
                description="This question may have been deleted or is no longer available."
            />
        );
    }

    return (
        <div className="grid gap-6">
            <SectionCard
                eyebrow="Question details"
                title={question.title}
                description="Read the full question, scan its tags, and review the answers that have been posted so far."
                className="hero-gradient"
            >
                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        to="/app/questions"
                        className="festival-card rounded-full bg-[#FFF3DC] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-black"
                    >
                        Back to questions
                    </Link>
                    <span className="rounded-full border border-[rgb(var(--line))] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">
                        {answers.length} answers
                    </span>
                    <span className="rounded-full border border-[rgb(var(--line))] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">
                        {getQuestionStatusLabel(question, answers)}
                    </span>
                    {question.you_coder ? (
                        <span className="rounded-full border border-[rgb(var(--line))] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">
                            {question.you_coder.name}
                        </span>
                    ) : null}
                </div>

                <p className="mt-6 max-w-4xl text-sm leading-8 text-[rgb(var(--fg-muted))]">
                    {question.content}
                </p>

                {question.tags?.length ? (
                    <div className="mt-6 flex flex-wrap gap-2">
                        {question.tags.map((tag, index) => (
                            <span
                                key={tag.id}
                                className="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-black shadow-[3px_3px_0_rgba(0,0,0,0.8)]"
                                style={{ backgroundColor: getTagTone(index) }}
                            >
                                {tag.name}
                            </span>
                        ))}
                    </div>
                ) : null}
            </SectionCard>

            {answers.length ? (
                <div className="grid gap-4">
                    {answers.map((answer) => (
                        <QuestionAnswerCard key={answer.id} answer={answer} />
                    ))}
                </div>
            ) : (
                <EmptyState
                    eyebrow="Answers"
                    title="No answers yet"
                    description="This question is still waiting for the first answer from the community."
                />
            )}
        </div>
    );
}
