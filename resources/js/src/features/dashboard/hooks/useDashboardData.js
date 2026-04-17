import { useEffect, useState } from 'react';
import { getBlogs } from '../../../services/api/blogs.service';
import { getNotifications } from '../../../services/api/notifications.service';
import { getQuestions } from '../../../services/api/questions.service';
import { getUser, getUserScore, getUsers } from '../../../services/api/users.service';
import { getClubs } from '../../../services/api/clubs.service';
import { getEvents } from '../../../services/api/events.service';
import { isAdmin, isBdeMembre, isFormateur } from '../../../shared/utils/roles';

function getErrorMessage(error) {
    return error?.response?.data?.message || 'We could not load the dashboard right now.';
}

export function useDashboardData(user) {
    const [state, setState] = useState({
        isLoading: true,
        error: '',
        profile: null,
        score: 0,
        notifications: [],
        questions: [],
        blogs: [],
        usersTotal: 0,
        clubs: [],
        clubsTotal: 0,
        events: [],
    });

    useEffect(() => {
        if (!user?.id) {
            setState((currentState) => ({
                ...currentState,
                isLoading: false,
            }));

            return;
        }

        let isMounted = true;

        async function loadDashboardData() {
            setState((currentState) => ({
                ...currentState,
                isLoading: true,
                error: '',
            }));

            try {
                const requests = [
                    getUser(user.id),
                    getUserScore(user.id),
                    getNotifications(),
                    getQuestions(),
                    getBlogs(),
                ];

                if (isAdmin(user) || isFormateur(user)) {
                    requests.push(getUsers());
                }

                if (isBdeMembre(user)) {
                    requests.push(getClubs());
                    requests.push(getEvents());
                }

                const responses = await Promise.all(requests);

                const [profile, scoreResponse, notificationResponse, questionResponse, blogResponse, ...optionalResponses] = responses;

                let usersResponse = null;
                let clubsResponse = null;
                let eventsResponse = null;
                let optionalIndex = 0;

                if (isAdmin(user) || isFormateur(user)) {
                    usersResponse = optionalResponses[optionalIndex];
                    optionalIndex += 1;
                }

                if (isBdeMembre(user)) {
                    clubsResponse = optionalResponses[optionalIndex];
                    eventsResponse = optionalResponses[optionalIndex + 1];
                }

                if (!isMounted) {
                    return;
                }

                setState({
                    isLoading: false,
                    error: '',
                    profile,
                    score: scoreResponse?.reputation || 0,
                    notifications: notificationResponse?.data || [],
                    questions: questionResponse?.data || [],
                    blogs: blogResponse?.data || [],
                    usersTotal: usersResponse?.total || 0,
                    clubs: clubsResponse?.data || [],
                    clubsTotal: clubsResponse?.total || 0,
                    events: eventsResponse?.data || [],
                });
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                setState((currentState) => ({
                    ...currentState,
                    isLoading: false,
                    error: getErrorMessage(error),
                }));
            }
        }

        loadDashboardData();

        return () => {
            isMounted = false;
        };
    }, [user]);

    return state;
}
