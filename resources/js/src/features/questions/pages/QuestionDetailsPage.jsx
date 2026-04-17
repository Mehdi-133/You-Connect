import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SectionCard } from '../../../shared/components/SectionCard';
import { EmptyState } from '../../../shared/ui/feedback/EmptyState';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';
import { LoadingState } from '../../../shared/ui/feedback/LoadingState';
import { useAuth } from '../../../hooks/useAuth';
import { isFormateur } from '../../../shared/utils/roles';
import { acceptAnswer, createAnswer, getQuestion, getQuestionAnswers, voteAnswer } from '../../../services/api/questions.service';
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
    const { user } = useAuth();
    const { questionId } = useParams();
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [answerContent, setAnswerContent] = useState('');
    const [answerError, setAnswerError] = useState('');
    const [answerFieldErrors, setAnswerFieldErrors] = useState({});
    const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
    const [voteSelections, setVoteSelections] = useState({});
    const [processingAnswerId, setProcessingAnswerId] = useState(null);
    const [interactionError, setInteractionError] = useState('');

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

    async function handleCreateAnswer(event) {
        event.preventDefault();
        setAnswerError('');
        setAnswerFieldErrors({});
        setInteractionError('');
        setIsSubmittingAnswer(true);

        try {
            const createdAnswer = await createAnswer({
                content: answerContent,
                question_id: Number(questionId),
            });

            setAnswers((currentAnswers) => [createdAnswer, ...currentAnswers]);
            setQuestion((currentQuestion) => ({
                ...currentQuestion,
                answers_count: (currentQuestion?.answers_count || 0) + 1,
            }));
            setAnswerContent('');
        } catch (requestError) {
            const message =
                requestError.response?.data?.message ||
                'We could not post your answer right now.';

            setAnswerError(message);
            setAnswerFieldErrors(requestError.response?.data?.errors || {});
        } finally {
            setIsSubmittingAnswer(false);
        }
    }

    function canAcceptAnswer(answer) {
        return Boolean(
            user &&
            question &&
            (question.you_coder?.id === user.id || isFormateur(user))
        );
    }

    function canVoteAnswer(answer) {
        return Boolean(user && user.id !== answer.you_coder?.id);
    }

    async function handleAcceptAnswer(answer) {
        setInteractionError('');
        setProcessingAnswerId(answer.id);

        try {
            await acceptAnswer(answer.id);

            setAnswers((currentAnswers) =>
                currentAnswers.map((item) => ({
                    ...item,
                    is_accepted: item.id === answer.id,
                }))
            );
        } catch (requestError) {
            setInteractionError(
                requestError.response?.data?.message ||
                'We could not accept this answer right now.'
            );
        } finally {
            setProcessingAnswerId(null);
        }
    }

    async function handleVoteAnswer(answer, type) {
        setInteractionError('');
        setProcessingAnswerId(answer.id);

        try {
            const response = await voteAnswer({
                answer_id: answer.id,
                type,
            });

            const previousVote = voteSelections[answer.id] || null;
            let nextVote = previousVote;
            let countDelta = 0;

            if (response.message === 'Vote removed') {
                nextVote = null;
                countDelta = -1;
            } else if (response.message === 'Vote switched') {
                nextVote = type;
                countDelta = 0;
            } else {
                nextVote = type;
                countDelta = previousVote ? 0 : 1;
            }

            setVoteSelections((currentVotes) => ({
                ...currentVotes,
                [answer.id]: nextVote,
            }));

            setAnswers((currentAnswers) =>
                currentAnswers.map((item) =>
                    item.id === answer.id
                        ? { ...item, vote_count: Math.max(0, (item.vote_count || 0) + countDelta) }
                        : item
                )
            );
        } catch (requestError) {
            setInteractionError(
                requestError.response?.data?.message ||
                'We could not update your vote right now.'
            );
        } finally {
            setProcessingAnswerId(null);
        }
    }

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

                {interactionError ? (
                    <p className="mt-6 text-sm font-bold text-[#FFD327]">{interactionError}</p>
                ) : null}

                <form onSubmit={handleCreateAnswer} className="mt-8 grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5">
                    <div>
                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                            Your answer
                        </label>
                        <textarea
                            value={answerContent}
                            onChange={(event) => setAnswerContent(event.target.value)}
                            rows="5"
                            placeholder="Share the clearest solution you can."
                            className="w-full rounded-[1.4rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none"
                        />
                        {answerFieldErrors.content ? (
                            <p className="mt-2 text-xs font-bold text-[#FFD327]">{answerFieldErrors.content[0]}</p>
                        ) : null}
                    </div>

                    {answerError ? (
                        <p className="text-sm font-bold text-[#FFD327]">{answerError}</p>
                    ) : null}

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmittingAnswer}
                            className="festival-card rounded-full bg-[#25F2A0] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-black disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSubmittingAnswer ? 'Posting answer...' : 'Post answer'}
                        </button>
                    </div>
                </form>
            </SectionCard>

            {answers.length ? (
                <div className="grid gap-4">
                    {answers.map((answer) => (
                        <QuestionAnswerCard
                            key={answer.id}
                            answer={answer}
                            canAccept={canAcceptAnswer(answer)}
                            canVote={canVoteAnswer(answer)}
                            currentVote={voteSelections[answer.id] || null}
                            isProcessing={processingAnswerId === answer.id}
                            onAccept={handleAcceptAnswer}
                            onVote={handleVoteAnswer}
                        />
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
