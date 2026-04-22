function getStorageKey(userId) {
    return `youconnect_blog_likes_${userId}`;
}

export function getLikedBlogIds(userId) {
    if (!userId) {
        return new Set();
    }

    try {
        const raw = localStorage.getItem(getStorageKey(userId));
        if (!raw) {
            return new Set();
        }

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return new Set();
        }

        return new Set(parsed.map((value) => String(value)));
    } catch {
        return new Set();
    }
}

export function isBlogLiked(userId, blogId) {
    if (!userId || !blogId) {
        return false;
    }

    return getLikedBlogIds(userId).has(String(blogId));
}

export function setBlogLiked(userId, blogId, liked) {
    if (!userId || !blogId) {
        return;
    }

    const ids = getLikedBlogIds(userId);
    const key = String(blogId);

    if (liked) {
        ids.add(key);
    } else {
        ids.delete(key);
    }

    try {
        localStorage.setItem(getStorageKey(userId), JSON.stringify(Array.from(ids)));
    } catch {
        // If storage is unavailable, we still keep the in-memory UI state.
    }
}

