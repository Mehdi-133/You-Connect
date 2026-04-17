import { Link } from 'react-router-dom';

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

export function QuestionFeedCard({ question }) {
    return (
        <article className="surface festival-card rounded-[2rem] p-5 shadow-[5px_5px_0_rgba(0,0,0,0.8)]">
            <div className="flex items-start gap-4">
                {question.you_coder?.photo ? (
                    <img
                        src={question.you_coder.photo}
                        alt={question.you_coder.name}
                        className="h-14 w-14 rounded-[1.1rem] border-2 border-black object-cover shadow-[4px_4px_0_rgba(0,0,0,0.8)]"
                    />
                ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-[1.1rem] border-2 border-black bg-[linear-gradient(135deg,#29CFFF_0%,#25F2A0_58%,#FFD327_100%)] text-lg font-black text-black shadow-[4px_4px_0_rgba(0,0,0,0.8)]">
                        {getInitials(question.you_coder?.name)}
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-[#FFF3DC]">
                            {question.you_coder?.name || 'YouConnect member'}
                        </p>
                        <span className="rounded-full border border-[rgb(var(--line))] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">
                            {(question.answers_count || 0)} answers
                        </span>
                        <span className="rounded-full border border-[rgb(var(--line))] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">
                            {getStatusLabel(question)}
                        </span>
                    </div>

                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#25F2A0]">
                        Community question
                    </p>
                </div>
            </div>

            <p className="mt-5 font-display text-3xl font-extrabold leading-none">{question.title}</p>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[rgb(var(--fg-muted))]">
                {question.content}
            </p>

            <div className="mt-4">
                <Link
                    to={`/app/questions/${question.id}`}
                    className="festival-card inline-flex rounded-full bg-[#FFF3DC] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-black"
                >
                    View discussion
                </Link>
            </div>

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
