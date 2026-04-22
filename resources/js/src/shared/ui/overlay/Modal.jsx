import { useEffect, useId, useMemo, useRef, useState } from 'react';

function getFocusableElements(container) {
    if (!container) {
        return [];
    }

    const elements = container.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    return Array.from(elements).filter((el) => el.offsetParent !== null);
}

export function Modal({
    isOpen,
    onClose,
    eyebrow = '',
    title = '',
    description = '',
    size = 'md',
    children,
    footer = null,
    ariaLabel = '',
}) {
    const titleId = useId();
    const descriptionId = useId();
    const dialogRef = useRef(null);
    const previouslyFocusedRef = useRef(null);
    const onCloseRef = useRef(onClose);

    const [isMounted, setIsMounted] = useState(Boolean(isOpen));
    const [isVisible, setIsVisible] = useState(Boolean(isOpen));

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    const maxWidthClass = useMemo(() => {
        if (size === 'lg') return 'max-w-[920px]';
        if (size === 'sm') return 'max-w-[560px]';
        return 'max-w-[720px]';
    }, [size]);

    useEffect(() => {
        if (isOpen) {
            setIsMounted(true);
            requestAnimationFrame(() => setIsVisible(true));
            return;
        }

        setIsVisible(false);
        const timeout = window.setTimeout(() => {
            setIsMounted(false);
        }, 180);

        return () => window.clearTimeout(timeout);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        previouslyFocusedRef.current = document.activeElement;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const timeout = window.setTimeout(() => {
            const dialog = dialogRef.current;
            if (!dialog) {
                return;
            }

            // If the user already focused an input inside the modal (e.g. clicked and started typing),
            // do not steal focus.
            const activeElement = document.activeElement;
            if (activeElement && dialog.contains(activeElement)) {
                return;
            }

            const focusable = getFocusableElements(dialog);
            const firstField = focusable.find((el) => {
                const tag = el.tagName?.toLowerCase();
                return tag === 'input' || tag === 'textarea' || tag === 'select';
            });

            (firstField || focusable[0] || dialogRef.current)?.focus?.();
        }, 20);

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                event.preventDefault();
                onCloseRef.current?.();
                return;
            }

            if (event.key !== 'Tab') {
                return;
            }

            const focusable = getFocusableElements(dialogRef.current);
            if (!focusable.length) {
                event.preventDefault();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey) {
                if (document.activeElement === first || document.activeElement === dialogRef.current) {
                    event.preventDefault();
                    last.focus();
                }
                return;
            }

            if (document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            window.clearTimeout(timeout);
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
            previouslyFocusedRef.current?.focus?.();
        };
    }, [isOpen]);

    if (!isMounted) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                type="button"
                className={[
                    'absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-200',
                    isVisible ? 'opacity-100' : 'opacity-0',
                ].join(' ')}
                onClick={() => onCloseRef.current?.()}
                aria-label={ariaLabel || 'Close modal'}
            />

            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
                aria-describedby={description ? descriptionId : undefined}
                className={[
                    'relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#0B0126] shadow-[16px_16px_0_rgba(0,0,0,0.85)]',
                    'transition duration-200',
                    isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-[0.98] opacity-0',
                    maxWidthClass,
                ].join(' ')}
            >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(163,77,255,0.22),transparent_30%),radial-gradient(circle_at_10%_18%,rgba(37,242,160,0.11),transparent_26%),radial-gradient(circle_at_85%_90%,rgba(255,211,39,0.10),transparent_32%)]" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(37,242,160,0.6),rgba(41,207,255,0.55),rgba(255,211,39,0.5),transparent)]" />

                <div className="relative border-b border-white/10 p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            {eyebrow ? (
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#25F2A0]">
                                    {eyebrow}
                                </p>
                            ) : null}
                            {title ? (
                                <p id={titleId} className="mt-2 font-display text-3xl font-extrabold text-[#FFF3DC]">
                                    {title}
                                </p>
                            ) : null}
                            {description ? (
                                <p id={descriptionId} className="mt-2 text-sm leading-7 text-[#d8cfbd]">
                                    {description}
                                </p>
                            ) : null}
                        </div>

                        <button
                            ref={null}
                            type="button"
                            onClick={() => onCloseRef.current?.()}
                            aria-label="Close modal"
                            className="hidden"
                        >
                            <span className="text-lg font-black leading-none transition group-hover:scale-105">×</span>
                        </button>
                    </div>
                </div>

                <div className="relative max-h-[74vh] overflow-auto p-6">
                    {children}
                </div>

                {footer ? (
                    <div className="relative border-t border-white/10 bg-[#070112]/70 p-5 backdrop-blur">
                        {footer}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
