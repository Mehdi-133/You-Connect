import { Link } from 'react-router-dom';
import { UserAvatar } from '../../../shared/components/UserAvatar';

function formatCount(value) {
    const number = Number(value || 0);
    return Number.isFinite(number) ? number.toLocaleString() : '0';
}

function getAnswerCount(question) {
    return Number(question?.live_answers_count ?? question?.answers_count ?? 0);
}

function getStatusLabel(question) {
    if (question.status === 'closed') {
        return 'Closed';
    }

    if (getAnswerCount(question) > 0) {
        return 'Active discussion';
    }

    return 'Needs answers';
}

function getTagTone(index) {
    const tones = ['#29CFFF', '#25F2A0', '#FF66D6', '#FFD327'];
    return tones[index % tones.length];
}

export function QuestionFeedCard({ question }) {
    const tags = Array.isArray(question?.tags) ? question.tags : [];

    return (
        <article className="group relative isolate mx-auto w-full max-w-[1080px] overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)] p-4 text-white shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur transition hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_26px_80px_rgba(0,0,0,0.55)] sm:w-[96%] sm:rounded-[2rem] sm:p-5 md:w-[86%]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,242,160,0.14),transparent_30%),radial-gradient(circle_at_10%_25%,rgba(41,207,255,0.12),transparent_25%),radial-gradient(circle_at_70%_95%,rgba(255,211,39,0.10),transparent_35%)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(37,242,160,0.55),rgba(41,207,255,0.55),rgba(255,211,39,0.55),transparent)] opacity-80" />

            <div className="relative flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <UserAvatar
                        name={question.you_coder?.name}
                        photo={question.you_coder?.photo}
                        size="sm"
                    />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-[#FFF3DC]">
                            {question.you_coder?.name || 'YouConnect member'}
                        </p>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#25F2A0]">
                            Community question
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 flex-wrap justify-end gap-2">
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/80">
                        {formatCount(getAnswerCount(question))} answers
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/80">
                        {getStatusLabel(question)}
                    </span>
                </div>
            </div>

            <div className="relative mt-4">
                <p className="break-words font-display text-[1.4rem] font-extrabold leading-tight text-[#FFF3DC] transition group-hover:text-[#25F2A0] sm:text-3xl">
                    {question.title}
                </p>
                <p className="mt-2 break-words text-sm leading-7 text-[#d8cfbd] line-clamp-3">
                    {question.content}
                </p>
            </div>

            {tags.length ? (
                <div className="relative mt-4 flex flex-wrap gap-2">
                    {tags.slice(0, 6).map((tag, index) => (
                        <span
                            key={tag.id}
                            className="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-black shadow-[3px_3px_0_rgba(0,0,0,0.8)]"
                            style={{ backgroundColor: getTagTone(index) }}
                        >
                            {tag.name}
                        </span>
                    ))}
                    {tags.length > 6 ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white/70">
                            +{tags.length - 6}
                        </span>
                    ) : null}
                </div>
            ) : null}

            <div className="relative mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
                    Open the thread to answer or vote
                </span>
                <Link
                    to={`/app/questions/${question.id}`}
                    className="festival-card inline-flex items-center justify-center rounded-full border-2 border-black bg-[#FFF3DC] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)] transition hover:-translate-y-0.5 active:translate-y-0"
                >
                    Open
                </Link>
            </div>
        </article>
    );
}
