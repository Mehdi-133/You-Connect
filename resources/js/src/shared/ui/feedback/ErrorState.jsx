import { SectionCard } from '../../components/SectionCard';

export function ErrorState({
    eyebrow = 'Something went wrong',
    title = 'We could not load this section',
    description = 'Please refresh the page and try again.',
    helperText = 'If the problem keeps happening, check that the backend is running and that your session is still valid.',
    className = '',
}) {
    return (
        <SectionCard
            eyebrow={eyebrow}
            title={title}
            description={description}
            className={`hero-gradient ${className}`.trim()}
        >
            <p className="text-sm leading-7 text-[rgb(var(--fg-muted))]">{helperText}</p>
        </SectionCard>
    );
}
