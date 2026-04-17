import { SectionCard } from '../../components/SectionCard';

export function EmptyState({
    eyebrow = 'Nothing here yet',
    title = 'No content to show',
    description = 'This area will fill up as you start using the app.',
    action = null,
    className = '',
}) {
    return (
        <SectionCard
            eyebrow={eyebrow}
            title={title}
            description={description}
            className={className}
        >
            {action ? <div className="mt-2">{action}</div> : null}
        </SectionCard>
    );
}
