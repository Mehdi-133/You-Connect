export function SectionCard({ eyebrow, title, description, children, className = '' }) {
    return (
        <section className={`surface festival-card rounded-4xl p-6 ${className}`}>
            {(eyebrow || title || description) && (
                <div className="mb-6">
                    {eyebrow && (
                        <p className="mb-3 inline-flex rounded-full border border-black/70 bg-[rgb(var(--brand-gold))] px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]">
                            {eyebrow}
                        </p>
                    )}
                    {title && <h2 className="font-display text-3xl font-extrabold leading-none md:text-4xl">{title}</h2>}
                    {description && <p className="mt-2 max-w-2xl text-sm leading-7 text-[rgb(var(--fg-muted))]">{description}</p>}
                </div>
            )}
            {children}
        </section>
    );
}
