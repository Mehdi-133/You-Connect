function getStatusLabel(question) {
    if (question.status === 'closed') {
        return 'Closed';
    }

    if ((question.answers_count || 0) > 0) {
        return 'Active discussion';
    }

    return 'Needs answers';
}

function getTagTone(index) {
    const tones = ['#29CFFF', '#25F2A0', '#FF66D6', '#FFD327'];
    return tones[index % tones.length];
}

export function QuestionFeedCard({ question }) {
    return (
        <article className="surface festival-card rounded-[2rem] p-5">
            <div className="flex flex-wrap items-center gap-3">
                <span className="h-3 w-20 rounded-full" style={{ backgroundColor: getTagTone(0) }} />
                <span className="rounded-full border border-[rgb(var(--line))] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">
                    {(question.answers_count || 0)} answers
                </span>
                <span className="rounded-full border border-[rgb(var(--line))] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">
                    {getStatusLabel(question)}
                </span>
                {question.you_coder ? (
                    <span className="rounded-full border border-[rgb(var(--line))] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">
                        {question.you_coder.name}
                    </span>
                ) : null}
            </div>

            <p className="mt-4 font-display text-3xl font-extrabold leading-none">{question.title}</p>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[rgb(var(--fg-muted))]">
                {question.content}
            </p>

            {question.tags?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
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
        </article>
    );
}
