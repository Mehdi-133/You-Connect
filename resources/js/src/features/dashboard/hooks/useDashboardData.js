import { useEffect, useState } from 'react';
import { getBlogs } from '../../../services/api/blogs.service';
import { getNotifications } from '../../../services/api/notifications.service';
import { getQuestions } from '../../../services/api/questions.service';
import { getUser, getUserScore, getUsers, getBadges, getInterests } from '../../../services/api/users.service';
import { getClubs } from '../../../services/api/clubs.service';
import { getEvents } from '../../../services/api/events.service';
import { getTags } from '../../../services/api/tags.service';
import { isAdmin, isBdeMembre, isFormateur } from '../../../shared/utils/roles';

function getErrorMessage(error) {
    return error?.response?.data?.message || 'We could not load the dashboard right now.';
}

const DASHBOARD_CACHE = new Map();
const DASHBOARD_CACHE_TTL_MS = 45_000;

export function useDashboardData(user) {
    const [state, setState] = useState({
        isLoading: true,
        error: '',
        profile: null,
        score: 0,
        notifications: [],
        questions: [],
        blogs: [],
        users: [],
        badges: [],
        interests: [],
        tags: [],
        usersTotal: 0,
        clubs: [],
        clubsTotal: 0,
        events: [],
    });

    useEffect(() => {
        const userId = user?.id;
        const role = user?.role || 'unknown';

        if (!userId) {
            setState((currentState) => ({
                ...currentState,
                isLoading: false,
            }));

            return;
        }

        let isMounted = true;
        const cacheKey = `${userId}:${role}`;
        const cached = DASHBOARD_CACHE.get(cacheKey);
        const isCacheFresh = Boolean(cached && (Date.now() - cached.timestamp) < DASHBOARD_CACHE_TTL_MS);

        if (isCacheFresh) {
            setState({
                ...cached.data,
                isLoading: false,
                error: '',
            });
        }

        async function loadDashboardData({ silent } = { silent: false }) {
            if (!silent) {
                setState((currentState) => ({
                    ...currentState,
                    isLoading: true,
                    error: '',
                }));
            } else {
                setState((currentState) => ({
                    ...currentState,
                    error: '',
                }));
            }

                try {
                    const requests = [
                        getUser(userId),
                        getUserScore(userId),
                        getNotifications({ per_page: 6 }),
                        getQuestions({ per_page: 8 }),
                        getBlogs({ per_page: 8 }),
                    ];

                    if (isAdmin(user) || isFormateur(user)) {
                        // Pull a bigger slice so dashboards can compute campus/role stats quickly.
                        requests.push(getUsers({ per_page: 100 }));
                    }

                    if (isAdmin(user)) {
                        requests.push(getBadges({ per_page: 100 }));
                        requests.push(getInterests({ per_page: 100 }));
                        requests.push(getTags({ per_page: 100 }));
                    }

                    if (isBdeMembre(user)) {
                        requests.push(getClubs({ per_page: 6 }));
                        requests.push(getEvents({ per_page: 6 }));
                    }

                const responses = await Promise.all(requests);

                const [profile, scoreResponse, notificationResponse, questionResponse, blogResponse, ...optionalResponses] = responses;

                let usersResponse = null;
                let badgesResponse = null;
                let interestsResponse = null;
                let tagsResponse = null;
                let clubsResponse = null;
                let eventsResponse = null;
                let optionalIndex = 0;

                if (isAdmin(user) || isFormateur(user)) {
                    usersResponse = optionalResponses[optionalIndex];
                    optionalIndex += 1;
                }

                if (isAdmin(user)) {
                    badgesResponse = optionalResponses[optionalIndex];
                    interestsResponse = optionalResponses[optionalIndex + 1];
                    tagsResponse = optionalResponses[optionalIndex + 2];
                    optionalIndex += 3;
                }

                if (isBdeMembre(user)) {
                    clubsResponse = optionalResponses[optionalIndex];
                    eventsResponse = optionalResponses[optionalIndex + 1];
                }

                if (!isMounted) {
                    return;
                }

                const nextState = {
                    isLoading: false,
                    error: '',
                    profile,
                    score: scoreResponse?.reputation || 0,
                    notifications: notificationResponse?.data || [],
                    questions: questionResponse?.data || [],
                    blogs: blogResponse?.data || [],
                    users: usersResponse?.data || [],
                    badges: badgesResponse?.data || [],
                    interests: interestsResponse?.data || [],
                    tags: tagsResponse?.data || [],
                    usersTotal: usersResponse?.total || 0,
                    clubs: clubsResponse?.data || [],
                    clubsTotal: clubsResponse?.total || 0,
                    events: eventsResponse?.data || [],
                };

                DASHBOARD_CACHE.set(cacheKey, { timestamp: Date.now(), data: nextState });
                setState(nextState);
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                if (silent && isCacheFresh) {
                    return;
                }

                setState((currentState) => ({
                    ...currentState,
                    isLoading: false,
                    error: getErrorMessage(error),
                }));
            }
        }

        loadDashboardData({ silent: isCacheFresh });

        return () => {
            isMounted = false;
        };
    }, [user?.id, user?.role]);

    return state;
}
