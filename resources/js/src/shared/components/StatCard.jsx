export function StatCard({ label, value, hint, accent = 'rgb(var(--brand-cyan))' }) {
    return (
        <article className="surface festival-card rounded-3xl p-5">
            <div className="mb-4 flex items-center justify-between">
                <div className="h-3 w-16 rounded-full" style={{ backgroundColor: accent }} />
                <div className="rounded-full border border-black/80 bg-white/70 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-black dark:bg-white/10 dark:text-[rgb(var(--brand-cream))]">
                    Live
                </div>
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">{label}</p>
            <p className="mt-3 font-display text-4xl font-extrabold">{value}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[rgb(var(--fg-muted))]">{hint}</p>
        </article>
    );
}
