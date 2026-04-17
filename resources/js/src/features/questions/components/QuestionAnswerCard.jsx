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

export function QuestionAnswerCard({ answer }) {
    return (
        <article className="surface festival-card rounded-[2rem] p-5">
            <div className="flex flex-wrap items-center gap-3">
                <span className="h-3 w-20 rounded-full bg-[#29CFFF]" />
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
                <span className="rounded-full border border-[rgb(var(--line))] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">
                    {answer.vote_count || 0} votes
                </span>
                {answer.you_coder ? (
                    <span className="rounded-full border border-[rgb(var(--line))] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">
                        {answer.you_coder.name}
                    </span>
                ) : null}
            </div>

            <p className="mt-4 text-sm leading-7 text-[rgb(var(--fg-muted))]">
                {answer.content}
            </p>

            <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">
                {formatAnswerDate(answer.created_at)}
            </p>
        </article>
    );
}
