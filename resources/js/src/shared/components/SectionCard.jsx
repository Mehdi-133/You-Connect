export function SectionCard({ eyebrow, title, description, children, className = '' }) {
    return (
        <section className={`surface festival-card w-full rounded-2xl p-4 sm:rounded-[2rem] sm:p-6 ${className}`}>
            {(eyebrow || title || description) && (
                <div className="mb-6">
                    {eyebrow && (
                        <p className="mb-3 inline-flex rounded-full border border-black/70 bg-[rgb(var(--brand-gold))] px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]">
                            {eyebrow}
                        </p>
                    )}
                    {title && (
                        <h2 className="font-display text-2xl font-extrabold leading-tight sm:text-3xl sm:leading-none md:text-4xl">
                            {title}
                        </h2>
                    )}
                    {description && (
                        <p className="mt-2 max-w-2xl text-[13px] leading-7 text-[rgb(var(--fg-muted))] sm:text-sm">
                            {description}
                        </p>
                    )}
                </div>
            )}
            {children}
        </section>
    );
}
