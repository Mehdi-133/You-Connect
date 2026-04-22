import { useState } from 'react';
import { isImageSource } from '../utils/isImageSource';

function getFallbackLabel(badge) {
    if (badge?.icon && !isImageSource(badge.icon)) {
        return String(badge.icon)
            .split(/[-_]/)
            .map((part) => part[0]?.toUpperCase())
            .join('')
            .slice(0, 2);
    }

    const name = String(badge?.name || '').trim();
    if (!name) {
        return 'B';
    }

    return name
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('')
        .slice(0, 2);
}

export function BadgeEmblem({
    badge,
    gradientClassName = 'from-[#FFD327] via-[#FFB800] to-[#FF8B1F]',
    sizeClassName = 'h-12 w-12',
    className = '',
    imgClassName = '',
}) {
    const [isBroken, setIsBroken] = useState(false);
    const icon = String(badge?.icon || '').trim();
    const canShowImage = Boolean(icon && isImageSource(icon) && !isBroken);

    return (
        <div
            className={[
                'relative flex items-center justify-center overflow-hidden rounded-[1rem] bg-gradient-to-br text-sm font-black text-black shadow-[3px_3px_0_rgba(0,0,0,0.55)]',
                gradientClassName,
                sizeClassName,
                className,
            ].join(' ')}
            aria-label={badge?.name ? `Badge: ${badge.name}` : 'Badge emblem'}
        >
            {canShowImage ? (
                <>
                    <img
                        src={icon}
                        alt=""
                        className={[
                            'h-full w-full object-cover',
                            imgClassName,
                        ].join(' ')}
                        loading="lazy"
                        onError={() => setIsBroken(true)}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.10)_0%,rgba(0,0,0,0.38)_100%)]" />
                </>
            ) : (
                <span>{getFallbackLabel(badge)}</span>
            )}
        </div>
    );
}

