export function isImageSource(value) {
    const raw = String(value || '').trim();
    if (!raw) {
        return false;
    }

    if (raw.startsWith('data:image/')) {
        return true;
    }

    try {
        const url = new URL(raw);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

