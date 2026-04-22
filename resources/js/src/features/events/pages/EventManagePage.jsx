import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SectionCard } from '../../../shared/components/SectionCard';
import { UserAvatar } from '../../../shared/components/UserAvatar';
import { useAuth } from '../../../hooks/useAuth';
import { EmptyState } from '../../../shared/ui/feedback/EmptyState';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';
import { LoadingState } from '../../../shared/ui/feedback/LoadingState';
import { deleteEvent, getEvent, updateEvent } from '../../../services/api/events.service';

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

export function EventManagePage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [eventItem, setEventItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [editForm, setEditForm] = useState({
        title: '',
        photo: '',
        description: '',
        location: '',
        starts_at: '',
        ends_at: '',
        status: '',
    });
    const [editError, setEditError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const isOwner = useMemo(() => {
        if (!user?.id || !eventItem) {
            return false;
        }

        if (eventItem?.creator?.id && eventItem.creator.id === user.id) {
            return true;
        }

        return eventItem?.you_coder_id === user.id;
    }, [eventItem, user?.id]);

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
                setEditForm({
                    title: response?.title || '',
                    photo: response?.photo || '',
                    description: response?.description || '',
                    location: response?.location || '',
                    starts_at: response?.starts_at || '',
                    ends_at: response?.ends_at || '',
                    status: response?.status || '',
                });
            } catch (requestError) {
                if (!isMounted) {
                    return;
                }

                setError(
                    requestError?.response?.data?.message ||
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

    function handleEditChange(event) {
        const { name, value } = event.target;
        setEditForm((current) => ({ ...current, [name]: value }));
    }

    async function handleSaveEvent(event) {
        event.preventDefault();

        if (!eventItem?.id || !isOwner) {
            return;
        }

        setEditError('');
        setFieldErrors({});
        setSuccessMessage('');
        setIsSaving(true);

        try {
            const updated = await updateEvent(eventItem.id, editForm);
            setEventItem((current) => (current ? { ...current, ...updated } : updated));
            setSuccessMessage('Event updated.');
        } catch (requestError) {
            const nextFieldErrors = requestError?.response?.data?.errors || {};
            setFieldErrors(nextFieldErrors);
            setEditError(
                Object.keys(nextFieldErrors).length
                    ? ''
                    : requestError?.response?.data?.message ||
                      'We could not update this event right now.'
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDeleteEvent() {
        if (!eventItem?.id || !isOwner) {
            return;
        }

        const confirmed = window.confirm('Delete this event? This cannot be undone.');
        if (!confirmed) {
            return;
        }

        setIsDeleting(true);
        setEditError('');
        setSuccessMessage('');

        try {
            await deleteEvent(eventItem.id);
            navigate('/app/events');
        } catch (requestError) {
            setEditError(
                requestError?.response?.data?.message ||
                'We could not delete this event right now.'
            );
        } finally {
            setIsDeleting(false);
        }
    }

    if (isLoading) {
        return (
            <LoadingState
                eyebrow="Events"
                title="Loading event"
                description="Preparing the manage panel and event preview."
                blocks={2}
            />
        );
    }

    if (error) {
        return (
            <ErrorState
                eyebrow="Events"
                title="Event unavailable"
                description={error}
                helperText="Check that the backend is running and refresh the page."
            />
        );
    }

    if (!eventItem) {
        return <EmptyState eyebrow="Events" title="Event not found" description="This event may have been removed." />;
    }

    return (
        <div className="space-y-6">
            <SectionCard
                eyebrow="Events"
                title={eventItem.title || 'Event'}
                description={eventItem.description || 'Manage event details and keep everything production-ready.'}
                accent="bg-[linear-gradient(135deg,#29CFFF_0%,#25F2A0_55%,#FFD327_100%)]"
            >
                {eventItem.photo ? (
                    <div className="mt-5 overflow-hidden rounded-[1.8rem] border border-white/10 bg-black/40">
                        <img src={eventItem.photo} alt="" className="h-56 w-full object-cover opacity-95" loading="lazy" />
                    </div>
                ) : null}

                <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link
                        to={`/app/events/${eventItem.id}`}
                        className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm font-semibold text-[#FFF3DC] hover:bg-black/55"
                    >
                        Back to event
                    </Link>
                    <Link
                        to="/app/events"
                        className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm font-semibold text-[#FFF3DC] hover:bg-black/55"
                    >
                        All events
                    </Link>
                    <span className={`rounded-full px-3 py-2 text-xs font-black uppercase tracking-[0.18em] ${getStatusTone(eventItem.status)}`}>
                        {getStatusLabel(eventItem.status)}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#FFF3DC]">
                        {(eventItem.attendees_count ?? eventItem.attendees?.length ?? 0)} attendees
                    </span>
                </div>
            </SectionCard>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
                <SectionCard
                    eyebrow="Preview"
                    title="What attendees will see"
                    description="A quick reality-check for timing, location, and copy."
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
                        <div className="rounded-2xl border border-white/10 bg-black/35 p-4 sm:col-span-2">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Host</p>
                            <div className="mt-3 flex items-center gap-3">
                                <UserAvatar user={eventItem.creator} size="md" ring />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-[#FFF3DC]">{eventItem.creator?.name || 'Community host'}</p>
                                    <p className="truncate text-xs text-white/60">Event owner</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </SectionCard>

                <SectionCard
                    eyebrow="Manage"
                    title="Update or delete"
                    description="Only the event owner can modify the event."
                    accent="bg-[linear-gradient(135deg,#FFD327_0%,#FF66D6_55%,#A34DFF_100%)]"
                >
                    {!isOwner ? (
                        <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-[#FFF3DC]">
                            You can view the details, but you cannot edit or delete this event.
                        </p>
                    ) : null}

                    {successMessage ? (
                        <p className="mt-4 rounded-2xl border border-[#25F2A0]/25 bg-[#071a14] px-4 py-3 text-sm font-semibold text-[#25F2A0]">
                            {successMessage}
                        </p>
                    ) : null}

                    {editError ? (
                        <p className="mt-4 rounded-2xl border border-[#FFD327]/25 bg-[#120422]/80 px-4 py-3 text-sm font-semibold text-[#FFF3DC]">
                            {editError}
                        </p>
                    ) : null}

                    <form onSubmit={handleSaveEvent} className="mt-6 grid gap-4">
                        <label>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Title</span>
                            <input
                                name="title"
                                value={editForm.title}
                                onChange={handleEditChange}
                                disabled={!isOwner}
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                            {fieldErrors?.title ? (
                                <p className="mt-2 text-xs font-semibold text-[#FFD327]">{fieldErrors.title[0]}</p>
                            ) : null}
                        </label>

                        <label>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Photo URL</span>
                            <input
                                name="photo"
                                value={editForm.photo}
                                onChange={handleEditChange}
                                disabled={!isOwner}
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 disabled:cursor-not-allowed disabled:opacity-60"
                                placeholder="https://..."
                            />
                            {fieldErrors?.photo ? (
                                <p className="mt-2 text-xs font-semibold text-[#FFD327]">{fieldErrors.photo[0]}</p>
                            ) : null}
                        </label>

                        <label>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Description</span>
                            <textarea
                                name="description"
                                value={editForm.description}
                                onChange={handleEditChange}
                                disabled={!isOwner}
                                rows={5}
                                className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-[#05020d] px-4 py-3 text-sm leading-7 text-white outline-none placeholder:text-white/35 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </label>

                        <label>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Location</span>
                            <input
                                name="location"
                                value={editForm.location}
                                onChange={handleEditChange}
                                disabled={!isOwner}
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </label>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <label>
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Starts at</span>
                                <input
                                    name="starts_at"
                                    type="datetime-local"
                                    value={editForm.starts_at ? editForm.starts_at.replace('Z', '') : ''}
                                    onChange={handleEditChange}
                                    disabled={!isOwner}
                                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </label>

                            <label>
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Ends at</span>
                                <input
                                    name="ends_at"
                                    type="datetime-local"
                                    value={editForm.ends_at ? editForm.ends_at.replace('Z', '') : ''}
                                    onChange={handleEditChange}
                                    disabled={!isOwner}
                                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </label>
                        </div>

                        <label>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Status</span>
                            <select
                                name="status"
                                value={editForm.status || ''}
                                onChange={handleEditChange}
                                disabled={!isOwner}
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <option value="">Upcoming</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="finished">Finished</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </label>

                        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={handleDeleteEvent}
                                disabled={!isOwner || isDeleting}
                                className="rounded-full border border-[#ff8f8f]/40 bg-[#2a0b15] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#ffb8b8] transition hover:bg-[#39101d] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isDeleting ? 'Deleting…' : 'Delete'}
                            </button>

                            <button
                                type="submit"
                                disabled={!isOwner || isSaving}
                                className="rounded-full border-2 border-black bg-[#25F2A0] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[6px_6px_0_rgba(0,0,0,0.85)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSaving ? 'Saving…' : 'Save changes'}
                            </button>
                        </div>
                    </form>
                </SectionCard>
            </div>
        </div>
    );
}

