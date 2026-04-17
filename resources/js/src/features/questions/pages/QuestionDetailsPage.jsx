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

function getInitials(name) {
    if (!name) {
        return 'YC';
    }

    return name
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
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
            const nextFieldErrors = requestError.response?.data?.errors || {};

            setAnswerFieldErrors(nextFieldErrors);
            setAnswerError(
                Object.keys(nextFieldErrors).length
                    ? ''
                    : requestError.response?.data?.message ||
                      'We could not post your answer right now.'
            );
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
                title=""
                description=""
                className="hero-gradient overflow-hidden"
            >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top_left,rgba(255,102,214,0.16),transparent_24%),radial-gradient(circle_at_top_right,rgba(41,207,255,0.16),transparent_24%),radial-gradient(circle_at_40%_30%,rgba(255,211,39,0.12),transparent_28%)]" />

                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        to="/app/questions"
                        className="festival-card rounded-full border-2 border-black bg-[#FFF3DC] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]"
                    >
                        Back to questions
                    </Link>
                    <span className="rounded-full border-2 border-black bg-[#FFF3DC] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]">
                        {answers.length} answers
                    </span>
                    <span className="rounded-full border-2 border-black bg-[#FFD327] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]">
                        {getQuestionStatusLabel(question, answers)}
                    </span>
                    {question.you_coder ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">
                            {question.you_coder.name}
                        </span>
                    ) : null}
                </div>

                <div className="relative mt-8 overflow-hidden rounded-[2.3rem] border-2 border-black bg-[linear-gradient(145deg,#FFF3DC_0%,#ffe7a6_100%)] p-8 text-black shadow-[8px_8px_0_rgba(0,0,0,0.85)]">
                    <div className="absolute right-5 top-5 h-5 w-5 rounded-full bg-[#FF66D6]" />
                    <div className="absolute right-12 top-10 h-3 w-3 rounded-full bg-[#29CFFF]" />

                    <div className="flex items-start gap-4">
                        {question.you_coder?.photo ? (
                            <img
                                src={question.you_coder.photo}
                                alt={question.you_coder.name}
                                className="h-16 w-16 rounded-[1.2rem] border-2 border-black object-cover shadow-[4px_4px_0_rgba(0,0,0,0.8)]"
                            />
                        ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-[1.2rem] border-2 border-black bg-[linear-gradient(135deg,#29CFFF_0%,#25F2A0_58%,#FFD327_100%)] text-xl font-black text-black shadow-[4px_4px_0_rgba(0,0,0,0.8)]">
                                {getInitials(question.you_coder?.name)}
                            </div>
                        )}

                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#7b5c3d]">
                                YouConnect discussion
                            </p>
                            <p className="mt-2 text-base font-bold text-black">
                                {question.you_coder?.name || 'YouConnect member'}
                            </p>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#7b5c3d]">
                                Community question
                            </p>
                        </div>
                    </div>

                    <h1 className="mt-6 max-w-5xl font-display text-5xl font-extrabold leading-[0.95]">
                        {question.title}
                    </h1>

                    <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-[#4d4239]">
                        <span className="rounded-full bg-black px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#FFF3DC]">
                            {answers.length} answers
                        </span>
                        <span className="rounded-full bg-white/60 px-4 py-2">
                            {getQuestionStatusLabel(question, answers)}
                        </span>
                    </div>

                    <p className="mt-8 max-w-4xl text-base leading-9 text-[#3d332c]">
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
                </div>

                {interactionError ? (
                    <p className="mt-6 text-sm font-bold text-[#FFD327]">{interactionError}</p>
                ) : null}

                <form onSubmit={handleCreateAnswer} className="mt-8 grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[5px_5px_0_rgba(0,0,0,0.8)]">
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
