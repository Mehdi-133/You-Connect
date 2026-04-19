import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SectionCard } from '../../../shared/components/SectionCard';
import { UserAvatar } from '../../../shared/components/UserAvatar';
import { useAuth } from '../../../hooks/useAuth';
import { EmptyState } from '../../../shared/ui/feedback/EmptyState';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';
import { LoadingState } from '../../../shared/ui/feedback/LoadingState';
import { getEvent, joinEvent, leaveEvent } from '../../../services/api/events.service';

function formatEventDate(value) {
    if (!value) {
        return 'Date to be announced';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Date to be announced';
    }

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function getStatusTone(status) {
    if (status === 'cancelled') {
        return 'bg-[#FF66D6] text-black';
    }

    if (status === 'suspended') {
        return 'bg-[#FFD327] text-black';
    }

    if (status === 'finished') {
        return 'bg-white/10 text-[#FFF3DC]';
    }

    if (status === 'ongoing') {
        return 'bg-[#29CFFF] text-black';
    }

    return 'bg-[#25F2A0] text-black';
}

function getStatusLabel(status) {
    if (!status) {
        return 'Upcoming';
    }

    return String(status)
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function isUserAttending(eventItem, userId) {
    return Boolean(eventItem?.attendees?.some((attendee) => attendee.id === userId));
}

export function EventDetailsPage() {
    const { eventId } = useParams();
    const { user } = useAuth();
    const [eventItem, setEventItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [isProcessingMembership, setIsProcessingMembership] = useState(false);

    const isAttending = useMemo(
        () => isUserAttending(eventItem, user?.id),
        [eventItem, user?.id]
    );

    useEffect(() => {
        let isMounted = true;

        async function loadEvent() {
            setIsLoading(true);
            setError('');

            try {
                const response = await getEvent(eventId);

                if (!isMounted) {
                    return;
                }

                setEventItem(response);
            } catch (requestError) {
                if (!isMounted) {
                    return;
                }

                setError(
                    requestError.response?.data?.message ||
                    'We could not load this event right now.'
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadEvent();

        return () => {
            isMounted = false;
        };
    }, [eventId]);

    async function handleMembershipAction() {
        if (!eventItem?.id || !user?.id) {
            return;
        }

        setFeedbackMessage('');
        setIsProcessingMembership(true);

        try {
            if (isAttending) {
                await leaveEvent(eventItem.id);
                setFeedbackMessage('You left the event.');
                setEventItem((previous) => {
                    if (!previous) {
                        return previous;
                    }

                    return {
                        ...previous,
                        attendees_count: Math.max(0, (previous.attendees_count || 0) - 1),
                        attendees: (previous.attendees || []).filter((attendee) => attendee.id !== user.id),
                    };
                });
            } else {
                await joinEvent(eventItem.id);
                setFeedbackMessage('You joined the event.');
                setEventItem((previous) => {
                    if (!previous) {
                        return previous;
                    }

                    const updatedAttendees = previous.attendees || [];
                    const nextAttendees = isUserAttending(previous, user.id)
                        ? updatedAttendees
                        : [...updatedAttendees, { id: user.id, name: user.name, photo: user.photo, bio: user.bio }];

                    return {
                        ...previous,
                        attendees_count: (previous.attendees_count || 0) + 1,
                        attendees: nextAttendees,
                    };
                });
            }
        } catch (requestError) {
            setFeedbackMessage(
                requestError.response?.data?.message ||
                'We could not update your attendance right now.'
            );
        } finally {
            setIsProcessingMembership(false);
        }
    }

    if (isLoading) {
        return <LoadingState label="Loading event..." />;
    }

    if (error) {
        return <ErrorState message={error} />;
    }

    if (!eventItem) {
        return <EmptyState title="Event not found" message="This event may have been removed." />;
    }

    return (
        <div className="space-y-6">
            <SectionCard
                eyebrow="Events"
                title={eventItem.title || 'Event'}
                description={eventItem.description || 'Event details and attendee list.'}
                accent="bg-[linear-gradient(135deg,#29CFFF_0%,#25F2A0_55%,#FFD327_100%)]"
            >
                <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link
                        to="/app/events"
                        className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm font-semibold text-[#FFF3DC] hover:bg-black/55"
                    >
                        Back to events
                    </Link>
                    <span className={`rounded-full px-3 py-2 text-xs font-black uppercase tracking-[0.18em] ${getStatusTone(eventItem.status)}`}>
                        {getStatusLabel(eventItem.status)}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#FFF3DC]">
                        {(eventItem.attendees_count ?? eventItem.attendees?.length ?? 0)} attendees
                    </span>
                </div>
            </SectionCard>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr] lg:items-start">
                <SectionCard
                    eyebrow="Details"
                    title="Event overview"
                    description="Timing, location, and the context behind the event."
                    accent="bg-[linear-gradient(135deg,#A34DFF_0%,#29CFFF_55%,#25F2A0_100%)]"
                >
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Starts</p>
                            <p className="mt-2 text-sm font-semibold text-[#FFF3DC]">{formatEventDate(eventItem.starts_at)}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Ends</p>
                            <p className="mt-2 text-sm font-semibold text-[#FFF3DC]">{formatEventDate(eventItem.ends_at)}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/35 p-4 sm:col-span-2">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Location</p>
                            <p className="mt-2 text-sm font-semibold text-[#FFF3DC]">{eventItem.location || 'Location to be announced'}</p>
                        </div>
                    </div>
                </SectionCard>

                <SectionCard
                    eyebrow="Attendance"
                    title="Your spot"
                    description="Join the attendee list and keep track of community moments."
                    accent="bg-[linear-gradient(135deg,#FFD327_0%,#FF66D6_55%,#A34DFF_100%)]"
                >
                    <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 p-4">
                        <UserAvatar user={eventItem.creator} size="md" ring />
                        <div>
                            <p className="text-sm font-semibold text-[#FFF3DC]">{eventItem.creator?.name || 'Community host'}</p>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">Host</p>
                        </div>
                    </div>

                    <div className="mt-5 space-y-3">
                        {feedbackMessage ? (
                            <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-[#FFF3DC]">
                                {feedbackMessage}
                            </p>
                        ) : null}

                        <button
                            type="button"
                            onClick={handleMembershipAction}
                            disabled={isProcessingMembership}
                            className="w-full rounded-full border-2 border-black bg-[#FFF3DC] px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isProcessingMembership ? 'Working...' : (isAttending ? 'Leave event' : 'Join event')}
                        </button>
                    </div>
                </SectionCard>
            </div>

            <SectionCard
                eyebrow="Attendees"
                title="People joining"
                description="A quick roster of who is already in."
                accent="bg-[linear-gradient(135deg,#25F2A0_0%,#29CFFF_55%,#FFD327_100%)]"
            >
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {(eventItem.attendees || []).length === 0 ? (
                        <div className="sm:col-span-2 lg:col-span-3">
                            <EmptyState title="No attendees yet" message="Be the first to join this event." />
                        </div>
                    ) : (
                        eventItem.attendees.map((attendee) => (
                            <div key={attendee.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 p-4">
                                <UserAvatar user={attendee} size="md" ring />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-[#FFF3DC]">{attendee.name}</p>
                                    <p className="truncate text-xs text-white/60">{attendee.bio || 'Member of the community'}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </SectionCard>
        </div>
    );
}

