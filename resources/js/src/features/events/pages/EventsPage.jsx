import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SectionCard } from '../../../shared/components/SectionCard';
import { UserAvatar } from '../../../shared/components/UserAvatar';
import { useAuth } from '../../../hooks/useAuth';
import { EmptyState } from '../../../shared/ui/feedback/EmptyState';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';
import { LoadingState } from '../../../shared/ui/feedback/LoadingState';
import { Modal } from '../../../shared/ui/overlay/Modal';
import { CreateActionButton } from '../../../shared/ui/buttons/CreateActionButton';
import { createEvent, getEvents, joinEvent, leaveEvent } from '../../../services/api/events.service';
import { isBdeMembre } from '../../../shared/utils/roles';
import { getCachedPageData, setCachedPageData } from '../../../shared/utils/pageCache';

const EVENTS_CACHE_KEY = 'page:events';
const EVENTS_CACHE_TTL_MS = 45_000;

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
    if (typeof eventItem?.is_attending === 'boolean') {
        return eventItem.is_attending;
    }

    return Boolean(eventItem?.attendees?.some((attendee) => attendee.id === userId));
}

export function EventsPage() {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [processingEventId, setProcessingEventId] = useState(null);
    const [form, setForm] = useState({
        title: '',
        photo: '',
        description: '',
        location: '',
        starts_at: '',
        ends_at: '',
    });
    const [formError, setFormError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const cached = getCachedPageData(EVENTS_CACHE_KEY, EVENTS_CACHE_TTL_MS);
        if (cached?.events) {
            setEvents(cached.events);
            setIsLoading(false);
        }

        async function loadEvents() {
            if (!cached?.events) {
                setIsLoading(true);
            }
            setError('');

            try {
                const response = await getEvents();

                if (!isMounted) {
                    return;
                }

                const nextEvents = response?.data || [];
                setEvents(nextEvents);
                setCachedPageData(EVENTS_CACHE_KEY, { events: nextEvents });
            } catch (requestError) {
                if (!isMounted) {
                    return;
                }

                setError(
                    requestError.response?.data?.message ||
                    'We could not load events right now.'
                );
            } finally {
                if (isMounted) {
                    if (!cached?.events) {
                        setIsLoading(false);
                    }
                }
            }
        }

        loadEvents();

        return () => {
            isMounted = false;
        };
    }, []);

    const statusFilters = ['All', 'Upcoming', 'Ongoing', 'Finished', 'Cancelled', 'Suspended'];

    const filteredEvents = useMemo(() => {
        if (selectedStatus === 'All') {
            return events;
        }

        const normalized = selectedStatus.toLowerCase();

        if (normalized === 'upcoming') {
            return events.filter((eventItem) => !eventItem?.status || String(eventItem.status).toLowerCase() === 'upcoming');
        }

        return events.filter((eventItem) => String(eventItem?.status || '').toLowerCase() === normalized);
    }, [events, selectedStatus]);
    const canCreateEvent = isBdeMembre(user);

    function handleInputChange(event) {
        const { name, value } = event.target;

        setForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    }

    async function handleMembershipAction(eventItem) {
        if (!user?.id || ['cancelled', 'suspended', 'finished'].includes(eventItem.status)) {
            return;
        }

        setFeedbackMessage('');
        setProcessingEventId(eventItem.id);

        const isAttending = isUserAttending(eventItem, user.id);

        try {
            if (isAttending) {
                await leaveEvent(eventItem.id);
            } else {
                await joinEvent(eventItem.id);
            }

            setEvents((currentEvents) =>
                currentEvents.map((item) => {
                    if (item.id !== eventItem.id) {
                        return item;
                    }

                    const currentAttendees = item.attendees || [];

                    return {
                        ...item,
                        attendees: isAttending
                            ? currentAttendees.filter((attendee) => attendee.id !== user.id)
                            : [
                                ...currentAttendees,
                                {
                                    id: user.id,
                                    name: user.name,
                                    photo: user.photo || null,
                                },
                            ],
                        is_attending: !isAttending,
                        attendees_count: isAttending
                            ? Math.max(0, (item.attendees_count || currentAttendees.length || 0) - 1)
                            : (item.attendees_count || currentAttendees.length || 0) + 1,
                    };
                })
            );

            setFeedbackMessage(isAttending ? 'You left the event.' : 'You joined the event.');
        } catch (requestError) {
            setFeedbackMessage(
                requestError.response?.data?.message ||
                'We could not update your event attendance right now.'
            );
        } finally {
            setProcessingEventId(null);
        }
    }

    async function handleCreateEvent(event) {
        event.preventDefault();
        setFormError('');
        setFieldErrors({});
        setSuccessMessage('');

        if (!form.photo?.trim()) {
            setFormError('Event photo is required.');
            return;
        }

        setIsCreating(true);

        try {
            const createdEvent = await createEvent(form);

            setEvents((currentEvents) => [
                {
                    ...createdEvent,
                    creator: {
                        id: user.id,
                        name: user.name,
                        photo: user.photo || null,
                    },
                    attendees_count: 0,
                },
                ...currentEvents,
            ]);
            setForm({
                title: '',
                photo: '',
                description: '',
                location: '',
                starts_at: '',
                ends_at: '',
            });
            setSuccessMessage('Event created successfully.');
            setIsCreateOpen(false);
        } catch (requestError) {
            const nextFieldErrors = requestError.response?.data?.errors || {};

            setFieldErrors(nextFieldErrors);
            setFormError(
                Object.keys(nextFieldErrors).length
                    ? ''
                    : requestError.response?.data?.message ||
                      'We could not create this event right now.'
            );
        } finally {
            setIsCreating(false);
        }
    }

    if (isLoading) {
        return (
            <LoadingState
                eyebrow="Events"
                title="Loading events"
                description="We are pulling the event calendar, creators, and attendance signals."
            />
        );
    }

    if (error) {
        return (
            <ErrorState
                eyebrow="Events"
                title="Events unavailable"
                description={error}
                helperText="Check that the backend is running and refresh the page when the events API is available again."
            />
        );
    }

    if (!events.length && !canCreateEvent) {
        return (
            <EmptyState
                eyebrow="Events"
                title="No events yet"
                description="As soon as events are created, they will appear here for your community to explore and join."
            />
        );
    }

    return (
        <div className="grid gap-6">
            <SectionCard
                eyebrow="Events"
                title="Show up for the moments that move the community"
                description="Events turn YouConnect into a live space for workshops, meetups, and shared momentum beyond the feed."
                className="hero-gradient overflow-hidden"
            >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top_left,rgba(255,102,214,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(41,207,255,0.16),transparent_24%),radial-gradient(circle_at_55%_10%,rgba(255,211,39,0.12),transparent_28%)]" />

                <div className="relative flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-white/60">
                        Browse upcoming moments or create the next one.
                    </p>
                    {canCreateEvent ? (
                        <CreateActionButton
                            label="Create event"
                            onClick={() => {
                                setFormError('');
                                setFieldErrors({});
                                setSuccessMessage('');
                                setFeedbackMessage('');
                                setIsCreateOpen(true);
                            }}
                        />
                    ) : null}
                </div>

                {formError ? (
                    <p className="relative mt-4 text-sm font-bold text-[#FFD327]">{formError}</p>
                ) : null}

                {successMessage ? (
                    <p className="relative mt-4 text-sm font-bold text-[#25F2A0]">{successMessage}</p>
                ) : null}

                <div className="relative mt-6">
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                        Filter by status
                    </p>
                    <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {statusFilters.map((item) => {
                            const isActive = item === selectedStatus;
                            return (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setSelectedStatus(item)}
                                    className={[
                                        'festival-card shrink-0 rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.18em] shadow-[4px_4px_0_rgba(0,0,0,0.85)] transition',
                                        isActive
                                            ? 'border-2 border-black bg-[#25F2A0] text-black'
                                            : 'border border-white/10 bg-white/10 text-[#d8cfbd] hover:bg-white/15 hover:text-white',
                                    ].join(' ')}
                                >
                                    {item}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </SectionCard>

            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                eyebrow="Create"
                title="Create an event"
                description="Make the details clear so members can join with confidence."
                variant="section"
                footer={(
                    <div className="flex flex-wrap items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsCreateOpen(false)}
                            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#FFF3DC] transition hover:bg-white/10"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="create-event-form"
                            disabled={isCreating}
                            className="festival-card rounded-full border-2 border-black bg-[#25F2A0] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[6px_6px_0_rgba(0,0,0,0.85)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isCreating ? 'Creating…' : 'Create event'}
                        </button>
                    </div>
                )}
            >
                <form id="create-event-form" onSubmit={handleCreateEvent} className="grid gap-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">Event title</label>
                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleInputChange}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                    }
                                }}
                                placeholder="Hack Night"
                                className="w-full rounded-[1.3rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
                            />
                            {fieldErrors.title ? <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.title[0]}</p> : null}
                        </div>
                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">Photo URL</label>
                            <input
                                type="url"
                                name="photo"
                                required
                                value={form.photo}
                                onChange={handleInputChange}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                    }
                                }}
                                placeholder="https://..."
                                className="w-full rounded-[1.3rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
                            />
                            {fieldErrors.photo ? <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.photo[0]}</p> : null}
                        </div>
                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={form.location}
                                onChange={handleInputChange}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                    }
                                }}
                                placeholder="YouCode campus hall"
                                className="w-full rounded-[1.3rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
                            />
                            {fieldErrors.location ? <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.location[0]}</p> : null}
                        </div>
                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">Starts at</label>
                            <input
                                type="datetime-local"
                                name="starts_at"
                                value={form.starts_at}
                                onChange={handleInputChange}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                    }
                                }}
                                className="w-full rounded-[1.3rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
                            />
                            {fieldErrors.starts_at ? <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.starts_at[0]}</p> : null}
                        </div>
                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">Ends at</label>
                            <input
                                type="datetime-local"
                                name="ends_at"
                                value={form.ends_at}
                                onChange={handleInputChange}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                    }
                                }}
                                className="w-full rounded-[1.3rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
                            />
                            {fieldErrors.ends_at ? <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.ends_at[0]}</p> : null}
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">Description</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleInputChange}
                                rows="5"
                                placeholder="Explain what the event is about, who should join, and what people can expect."
                                className="w-full resize-none rounded-[1.3rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm leading-7 text-white outline-none placeholder:text-white/35 focus:border-white/20"
                            />
                            {fieldErrors.description ? <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.description[0]}</p> : null}
                        </div>
                    </div>

                    {formError ? <p className="text-sm font-bold text-[#FFD327]">{formError}</p> : null}
                </form>
            </Modal>

            {feedbackMessage ? <p className="text-sm font-bold text-[#25F2A0]">{feedbackMessage}</p> : null}

            <div className="grid items-start gap-5 lg:grid-cols-2">
                {filteredEvents.map((eventItem) => {
                    const isAttending = isUserAttending(eventItem, user?.id);
                    const isOwner = Boolean(user?.id && eventItem?.creator?.id && eventItem.creator.id === user.id) ||
                        Boolean(user?.id && eventItem?.you_coder_id && eventItem.you_coder_id === user.id);

                    return (
                        <article key={eventItem.id} className="surface festival-card rounded-[2rem] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.03)_100%)] p-6 shadow-[5px_5px_0_rgba(0,0,0,0.8)]">
                            {eventItem.photo ? (
                                <div className="mb-5 overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/40">
                                    <img src={eventItem.photo} alt="" className="h-44 w-full object-cover opacity-90" loading="lazy" />
                                </div>
                            ) : null}
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="font-display text-3xl font-extrabold leading-none text-[#FFF3DC]">{eventItem.title}</h2>
                                <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${getStatusTone(eventItem.status)}`}>
                                    {getStatusLabel(eventItem.status)}
                                </span>
                            </div>

                            <p className="mt-4 text-sm leading-7 text-[#d8cfbd]">
                                {eventItem.description || 'This event is waiting for its full story, details, and community context.'}
                            </p>

                            <div className="mt-5 grid gap-3 text-sm font-bold text-[#d8cfbd]">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 w-fit">
                                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#25F2A0] px-1.5 text-[10px] font-black text-black">
                                        {eventItem.attendees_count || eventItem.attendees?.length || 0}
                                    </span>
                                    <span className="text-[12px] font-black uppercase tracking-[0.12em] text-[#FFF3DC]">Attendees</span>
                                </div>
                                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 w-fit">{formatEventDate(eventItem.starts_at)}</span>
                                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 w-fit">
                                    <UserAvatar name={eventItem.creator?.name} photo={eventItem.creator?.photo} size="sm" />
                                    <span>Hosted by {eventItem.creator?.name || 'YouConnect member'}</span>
                                </div>
                                {eventItem.location ? (
                                    <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 w-fit">{eventItem.location}</span>
                                ) : null}
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link to={`/app/events/${eventItem.id}`} className="festival-card rounded-full border-2 border-black bg-[#FFF3DC] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]">
                                    Open event
                                </Link>
                                {isOwner ? (
                                    <Link
                                        to={`/app/events/${eventItem.id}/manage`}
                                        className="festival-card rounded-full border-2 border-black bg-[#29CFFF] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]"
                                    >
                                        Manage
                                    </Link>
                                ) : (
                                    <button
                                        type="button"
                                        disabled
                                        className="festival-card rounded-full border-2 border-black bg-white/10 px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#FFF3DC] shadow-[4px_4px_0_rgba(0,0,0,0.85)] opacity-60"
                                        title="Only the event owner can manage this event"
                                    >
                                        Manage
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleMembershipAction(eventItem)}
                                    disabled={processingEventId === eventItem.id || ['cancelled', 'suspended', 'finished'].includes(eventItem.status)}
                                    className={[
                                        'festival-card rounded-full border-2 border-black px-4 py-3 text-sm font-black uppercase tracking-[0.14em] shadow-[4px_4px_0_rgba(0,0,0,0.85)] disabled:cursor-not-allowed disabled:opacity-60',
                                        isAttending ? 'bg-[#FF66D6] text-black' : 'bg-[#25F2A0] text-black',
                                    ].join(' ')}
                                >
                                    {processingEventId === eventItem.id ? 'Updating...' : isAttending ? 'Leave event' : 'Join event'}
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
}
