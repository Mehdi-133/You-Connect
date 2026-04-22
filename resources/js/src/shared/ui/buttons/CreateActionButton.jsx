function PlusIcon() {
    return (
        <svg viewBox="0 0 20 20" className="h-5 w-5 fill-none stroke-current stroke-[2]">
            <path d="M10 4v12" strokeLinecap="round" />
            <path d="M4 10h12" strokeLinecap="round" />
        </svg>
    );
}

export function CreateActionButton({
    label,
    onClick,
    disabled = false,
    tone = 'mint',
    className = '',
}) {
    const toneClasses =
        tone === 'sky'
            ? 'bg-[#29CFFF] text-black hover:bg-[#4ad9ff]'
            : tone === 'sand'
                ? 'bg-[#FFF3DC] text-black hover:bg-[#fff8ea]'
                : 'bg-[#25F2A0] text-black hover:bg-[#2cffaa]';

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={[
                'festival-card inline-flex items-center justify-center gap-2 rounded-full border-2 border-black px-5 py-3 text-sm font-black uppercase tracking-[0.14em]',
                'shadow-[6px_6px_0_rgba(0,0,0,0.85)] transition hover:-translate-y-0.5 active:translate-y-0',
                'focus:outline-none focus:ring-2 focus:ring-white/25',
                'disabled:cursor-not-allowed disabled:opacity-60',
                toneClasses,
                className,
            ].join(' ')}
        >
            <PlusIcon />
            <span>{label}</span>
        </button>
    );
}

