function getInitials(name) {
    if (!name) {
        return 'YC';
    }

    return name
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
}

const SIZE_CLASSES = {
    sm: {
        frame: 'p-[2px]',
        image: 'h-12 w-12',
        text: 'text-sm',
    },
    md: {
        frame: 'p-[2px]',
        image: 'h-14 w-14',
        text: 'text-lg',
    },
    lg: {
        frame: 'p-[3px]',
        image: 'h-16 w-16',
        text: 'text-xl',
    },
    xl: {
        frame: 'p-[3px]',
        image: 'h-24 w-24',
        text: 'text-3xl',
    },
};

export function UserAvatar({
    name,
    photo,
    size = 'md',
    alt,
    ringClassName = 'from-[#29CFFF] via-[#25F2A0] to-[#FFD327]',
    innerClassName = 'bg-[#05020d] text-[#FFF3DC]',
}) {
    const currentSize = SIZE_CLASSES[size] || SIZE_CLASSES.md;

    return (
        <div className={`rounded-full bg-gradient-to-br ${ringClassName} ${currentSize.frame}`}>
            {photo ? (
                <img
                    src={photo}
                    alt={alt || name}
                    className={`${currentSize.image} rounded-full border border-black/80 object-cover`}
                />
            ) : (
                <div className={`flex ${currentSize.image} items-center justify-center rounded-full border border-black/80 font-black ${currentSize.text} ${innerClassName}`}>
                    {getInitials(name)}
                </div>
            )}
        </div>
    );
}
