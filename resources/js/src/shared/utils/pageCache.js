const PAGE_CACHE = new Map();

export function getCachedPageData(key, ttlMs) {
    if (!key) {
        return null;
    }

    const cached = PAGE_CACHE.get(String(key));
    if (!cached) {
        return null;
    }

    if (typeof ttlMs === 'number' && ttlMs > 0) {
        const age = Date.now() - cached.timestamp;
        if (age > ttlMs) {
            return null;
        }
    }

    return cached.data;
}

export function setCachedPageData(key, data) {
    if (!key) {
        return;
    }

    PAGE_CACHE.set(String(key), { timestamp: Date.now(), data });
}

export function clearCachedPageData(key) {
    if (!key) {
        return;
    }

    PAGE_CACHE.delete(String(key));
}

