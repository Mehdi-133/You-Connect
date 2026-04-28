import Echo from 'laravel-echo';
import axios from 'axios';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

function getAuthHeaders() {
    const authToken = localStorage.getItem('auth_token');

    return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

function createAuthorizer() {
    return (channel) => ({
        authorize: (socketId, callback) => {
            axios.post(
                '/broadcasting/auth',
                {
                    socket_id: socketId,
                    channel_name: channel.name,
                },
                {
                    headers: {
                        ...getAuthHeaders(),
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            ).then((response) => {
                callback(false, response.data);
            }).catch((error) => {
                callback(true, error);
            });
        },
    });
}

// Prefer Pusher env if present (your .env uses BROADCAST_CONNECTION=pusher).
// If you later switch to Reverb, you can set VITE_REVERB_* and this will still work.
const hasPusher = Boolean(import.meta.env.VITE_PUSHER_APP_KEY);
const hasReverb = Boolean(import.meta.env.VITE_REVERB_APP_KEY);

window.Echo = new Echo(
    hasReverb && !hasPusher
        ? {
            broadcaster: 'reverb',
            key: import.meta.env.VITE_REVERB_APP_KEY,
            wsHost: import.meta.env.VITE_REVERB_HOST,
            wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
            wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
            forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
            enabledTransports: ['ws', 'wss'],
            authEndpoint: '/broadcasting/auth',
            auth: { headers: getAuthHeaders() },
            authorizer: createAuthorizer(),
        }
        : {
            broadcaster: 'pusher',
            key: import.meta.env.VITE_PUSHER_APP_KEY,
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
            forceTLS: true,
            authEndpoint: '/broadcasting/auth',
            auth: { headers: getAuthHeaders() },
            authorizer: createAuthorizer(),
        }
);
