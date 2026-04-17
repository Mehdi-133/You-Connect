import { SectionCard } from '../../components/SectionCard';

export function LoadingState({
    eyebrow = 'Loading',
    title = 'Loading content',
    description = 'Please wait while we fetch the latest data.',
    className = '',
    blocks = 3,
}) {
    return (
        <SectionCard
            eyebrow={eyebrow}
            title={title}
            description={description}
            className={`hero-gradient ${className}`.trim()}
        >
            <div className="grid gap-4 md:grid-cols-3">
                {Array.from({ length: blocks }).map((_, index) => (
                    <div key={index} className="h-36 rounded-[2rem] border border-white/10 bg-white/5" />
                ))}
            </div>
        </SectionCard>
    );
}
