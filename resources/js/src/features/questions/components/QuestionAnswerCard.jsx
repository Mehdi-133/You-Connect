import { UserAvatar } from '../../../shared/components/UserAvatar';

function formatAnswerDate(value) {
    if (!value) {
        return 'Recently added';
    }

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

export function QuestionAnswerCard({
    answer,
    canAccept = false,
    canVote = false,
    currentVote = null,
    isProcessing = false,
    onAccept,
    onVote,
}) {
    const upVoteActive = currentVote === 'upVote';
    const downVoteActive = currentVote === 'downVote';

    return (
        <article className="surface festival-card rounded-[2rem] p-5 shadow-[5px_5px_0_rgba(0,0,0,0.8)]">
            <div className="flex items-start gap-4">
                <UserAvatar
                    name={answer.you_coder?.name}
                    photo={answer.you_coder?.photo}
                    size="md"
                />

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-[#FFF3DC]">
                            {answer.you_coder?.name || 'YouConnect member'}
                        </p>
                        <span className="rounded-full border border-[rgb(var(--line))] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">
                            {answer.vote_count || 0} votes
                        </span>
                        {answer.is_accepted ? (
                            <span className="rounded-full bg-[#25F2A0] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-black">
                                Accepted
                            </span>
                        ) : null}
                        {answer.is_highlighted ? (
                            <span className="rounded-full bg-[#FFD327] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-black">
                                Highlighted
                            </span>
                        ) : null}
                    </div>

                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#25F2A0]">
                        {formatAnswerDate(answer.created_at)}
                    </p>
                </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-[rgb(var(--fg-muted))]">
                {answer.content}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
                {canVote ? (
                    <>
                        <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => onVote?.(answer, 'upVote')}
                            className={[
                                'rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-70',
                                upVoteActive
                                    ? 'bg-[#25F2A0] text-black'
                                    : 'border border-[rgb(var(--line))] text-[rgb(var(--fg-muted))]',
                            ].join(' ')}
                        >
                            Upvote
                        </button>

                        <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => onVote?.(answer, 'downVote')}
                            className={[
                                'rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-70',
                                downVoteActive
                                    ? 'bg-[#FF66D6] text-black'
                                    : 'border border-[rgb(var(--line))] text-[rgb(var(--fg-muted))]',
                            ].join(' ')}
                        >
                            Downvote
                        </button>
                    </>
                ) : null}

                {canAccept ? (
                    <button
                        type="button"
                        disabled={isProcessing || answer.is_accepted}
                        onClick={() => onAccept?.(answer)}
                        className="rounded-full bg-[#FFD327] px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-black disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {answer.is_accepted ? 'Accepted' : 'Accept answer'}
                    </button>
                ) : null}
            </div>
        </article>
    );
}
