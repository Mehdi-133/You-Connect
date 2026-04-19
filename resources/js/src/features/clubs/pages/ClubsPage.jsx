import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SectionCard } from '../../../shared/components/SectionCard';
import { UserAvatar } from '../../../shared/components/UserAvatar';
import { useAuth } from '../../../hooks/useAuth';
import { EmptyState } from '../../../shared/ui/feedback/EmptyState';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';
import { LoadingState } from '../../../shared/ui/feedback/LoadingState';
import { createClub, getClubs, joinClub, leaveClub } from '../../../services/api/clubs.service';
import { isFormateur } from '../../../shared/utils/roles';

function getClubInitial(name) {
    return name?.slice(0, 1)?.toUpperCase() || 'C';
}

function isUserMember(club, userId) {
    return Boolean(club?.members?.some((member) => member.id === userId));
}

export function ClubsPage() {
    const { user } = useAuth();
    const [clubs, setClubs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [processingClubId, setProcessingClubId] = useState(null);
    const [clubForm, setClubForm] = useState({
        name: '',
        description: '',
        logo: '',
    });
    const [clubFormError, setClubFormError] = useState('');
    const [clubFieldErrors, setClubFieldErrors] = useState({});
    const [clubSuccessMessage, setClubSuccessMessage] = useState('');
    const [isCreatingClub, setIsCreatingClub] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function loadClubs() {
            setIsLoading(true);
            setError('');

            try {
                const response = await getClubs();

                if (!isMounted) {
                    return;
                }

                setClubs(response?.data || []);
            } catch (requestError) {
                if (!isMounted) {
                    return;
                }

                setError(
                    requestError.response?.data?.message ||
                    'We could not load clubs right now.'
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadClubs();

        return () => {
            isMounted = false;
        };
    }, []);

    const featuredClubs = useMemo(
        () => clubs.slice(0, 3),
        [clubs]
    );
    const canCreateClub = isFormateur(user);

    function handleClubInputChange(event) {
        const { name, value } = event.target;

        setClubForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    }

    async function handleMembershipAction(club) {
        if (!user?.id || club.is_suspended) {
            return;
        }

        setFeedbackMessage('');
        setProcessingClubId(club.id);

        const isMember = isUserMember(club, user.id);

        try {
            if (isMember) {
                await leaveClub(club.id);
            } else {
                await joinClub(club.id);
            }

            setClubs((currentClubs) =>
                currentClubs.map((item) => {
                    if (item.id !== club.id) {
                        return item;
                    }

                    const currentMembers = item.members || [];

                    return {
                        ...item,
                        members: isMember
                            ? currentMembers.filter((member) => member.id !== user.id)
                            : [
                                ...currentMembers,
                                {
                                    id: user.id,
                                    name: user.name,
                                    photo: user.photo || null,
                                },
                            ],
                        members_count: isMember
                            ? Math.max(0, (item.members_count || currentMembers.length || 0) - 1)
                            : (item.members_count || currentMembers.length || 0) + 1,
                    };
                })
            );

            setFeedbackMessage(isMember ? 'You left the club.' : 'You joined the club.');
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                'We could not update your club membership right now.'
            );
        } finally {
            setProcessingClubId(null);
        }
    }

    async function handleCreateClub(event) {
        event.preventDefault();
        setClubFormError('');
        setClubFieldErrors({});
        setClubSuccessMessage('');
        setFeedbackMessage('');
        setIsCreatingClub(true);

        try {
            const createdClub = await createClub({
                name: clubForm.name.trim(),
                description: clubForm.description.trim(),
                logo: clubForm.logo.trim(),
            });

            setClubs((currentClubs) => [
                {
                    ...createdClub,
                    creator: {
                        id: user.id,
                        name: user.name,
                        photo: user.photo || null,
                    },
                    creator_id: user.id,
                    members_count: createdClub.members?.length || 1,
                },
                ...currentClubs,
            ]);
            setClubForm({
                name: '',
                description: '',
                logo: '',
            });
            setClubSuccessMessage('Club created successfully.');
        } catch (requestError) {
            const nextFieldErrors = requestError.response?.data?.errors || {};

            setClubFieldErrors(nextFieldErrors);
            setClubFormError(
                Object.keys(nextFieldErrors).length
                    ? ''
                    : requestError.response?.data?.message ||
                      'We could not create this club right now.'
            );
        } finally {
            setIsCreatingClub(false);
        }
    }

    if (isLoading) {
        return (
            <LoadingState
                eyebrow="Clubs"
                title="Loading clubs"
                description="We are pulling the community clubs, creators, and membership signals."
            />
        );
    }

    if (error) {
        return (
            <ErrorState
                eyebrow="Clubs"
                title="Clubs unavailable"
                description={error}
                helperText="Check that the backend is running and refresh the page when the clubs API is available again."
            />
        );
    }

    if (!clubs.length && !canCreateClub) {
        return (
            <EmptyState
                eyebrow="Clubs"
                title="No clubs yet"
                description="As soon as clubs are created, they will appear here for members to explore and join."
            />
        );
    }

    return (
        <div className="grid gap-6">
            <SectionCard
                eyebrow="Clubs"
                title="Find the circles that match your energy"
                description="Clubs give YouConnect a stronger community layer: shared interests, visible momentum, and spaces people can actually belong to."
                className="hero-gradient overflow-hidden"
            >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top_left,rgba(37,242,160,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(41,207,255,0.16),transparent_24%),radial-gradient(circle_at_55%_10%,rgba(255,211,39,0.12),transparent_28%)]" />

                <div className="relative grid gap-4 lg:grid-cols-3">
                    {featuredClubs.map((club, index) => (
                        <div
                            key={club.id}
                            className={[
                                'rounded-[1.9rem] border border-white/10 p-5 shadow-[5px_5px_0_rgba(0,0,0,0.8)]',
                                index === 0
                                    ? 'bg-[linear-gradient(160deg,rgba(37,242,160,0.18)_0%,rgba(255,255,255,0.04)_100%)]'
                                    : index === 1
                                        ? 'bg-[linear-gradient(160deg,rgba(41,207,255,0.18)_0%,rgba(255,255,255,0.04)_100%)]'
                                        : 'bg-[linear-gradient(160deg,rgba(255,211,39,0.18)_0%,rgba(255,255,255,0.04)_100%)]',
                            ].join(' ')}
                        >
                            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                Featured club
                            </p>
                            <p className="mt-4 font-display text-3xl font-extrabold leading-none text-[#FFF3DC]">
                                {club.name}
                            </p>
                            <p className="mt-4 text-sm leading-7 text-[#d8cfbd]">
                                {club.description || 'This club is building a shared space for members to learn, contribute, and stay connected.'}
                            </p>
                        </div>
                    ))}
                </div>
            </SectionCard>

            {canCreateClub ? (
                <SectionCard
                    eyebrow="Create club"
                    title="Launch a club space that people can join"
                    description="As a formateur, you can create clubs and then manage them from their club page."
                >
                    <form
                        onSubmit={handleCreateClub}
                        className="grid gap-4 rounded-[2rem] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.03)_100%)] p-5 shadow-[5px_5px_0_rgba(0,0,0,0.8)]"
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                    Club name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={clubForm.name}
                                    onChange={handleClubInputChange}
                                    placeholder="Frontend Builders"
                                    className="w-full rounded-[1.3rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none"
                                />
                                {clubFieldErrors.name ? (
                                    <p className="mt-2 text-xs font-bold text-[#FFD327]">{clubFieldErrors.name[0]}</p>
                                ) : null}
                            </div>
                            <div>
                                <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                    Logo URL
                                </label>
                                <input
                                    type="text"
                                    name="logo"
                                    value={clubForm.logo}
                                    onChange={handleClubInputChange}
                                    placeholder="https://example.com/club-logo.png"
                                    className="w-full rounded-[1.3rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none"
                                />
                                {clubFieldErrors.logo ? (
                                    <p className="mt-2 text-xs font-bold text-[#FFD327]">{clubFieldErrors.logo[0]}</p>
                                ) : null}
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={clubForm.description}
                                    onChange={handleClubInputChange}
                                    rows="4"
                                    placeholder="Explain the mission of the club, what members will do, and why people should join."
                                    className="w-full rounded-[1.3rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none"
                                />
                                {clubFieldErrors.description ? (
                                    <p className="mt-2 text-xs font-bold text-[#FFD327]">{clubFieldErrors.description[0]}</p>
                                ) : null}
                            </div>
                        </div>

                        {clubFormError ? (
                            <p className="text-sm font-bold text-[#FFD327]">{clubFormError}</p>
                        ) : null}

                        {clubSuccessMessage ? (
                            <p className="text-sm font-bold text-[#25F2A0]">{clubSuccessMessage}</p>
                        ) : null}

                        <div>
                            <button
                                type="submit"
                                disabled={isCreatingClub}
                                className="festival-card rounded-full border-2 border-black bg-[#25F2A0] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isCreatingClub ? 'Creating club...' : 'Create club'}
                            </button>
                        </div>
                    </form>
                </SectionCard>
            ) : null}

            {feedbackMessage ? (
                <p className="text-sm font-bold text-[#25F2A0]">{feedbackMessage}</p>
            ) : null}

            <div className="grid gap-5 lg:grid-cols-2">
                {clubs.map((club, index) => {
                    const isMember = isUserMember(club, user?.id);
                    const isOwner = Boolean(user && club.creator_id === user.id);

                    return (
                        <article
                            key={club.id}
                            className="surface festival-card rounded-[2rem] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.03)_100%)] p-6 shadow-[5px_5px_0_rgba(0,0,0,0.8)]"
                        >
                            <div className="flex items-start gap-4">
                                {club.logo ? (
                                    <img
                                        src={club.logo}
                                        alt={club.name}
                                        className="h-16 w-16 rounded-[1.2rem] border-2 border-black object-cover shadow-[4px_4px_0_rgba(0,0,0,0.75)]"
                                    />
                                ) : (
                                    <div className={`flex h-16 w-16 items-center justify-center rounded-[1.2rem] border-2 border-black text-xl font-black text-black shadow-[4px_4px_0_rgba(0,0,0,0.75)] ${index % 2 === 0 ? 'bg-[linear-gradient(135deg,#29CFFF_0%,#25F2A0_58%,#FFD327_100%)]' : 'bg-[linear-gradient(135deg,#FFD327_0%,#FF9F1C_52%,#FF66D6_100%)]'}`}>
                                        {getClubInitial(club.name)}
                                    </div>
                                )}

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="font-display text-3xl font-extrabold leading-none text-[#FFF3DC]">
                                            {club.name}
                                        </h2>
                                        {club.is_suspended ? (
                                            <span className="rounded-full bg-[#FF66D6] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-black">
                                                Suspended
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-[#25F2A0] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-black">
                                                Active
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-3 text-sm leading-7 text-[#d8cfbd]">
                                        {club.description || 'This club is waiting for its story, mission, and member highlights.'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-[#d8cfbd]">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_100%)] px-3 py-1.5 text-[12px] font-black uppercase tracking-[0.12em] text-[#FFF3DC]">
                                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#25F2A0] px-1.5 text-[10px] text-black">
                                        {club.members_count || club.members?.length || 0}
                                    </span>
                                    <span>Members</span>
                                </span>
                                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_100%)] px-3 py-1.5">
                                    <UserAvatar
                                        name={club.creator?.name}
                                        photo={club.creator?.photo}
                                        size="sm"
                                    />
                                    <span>Created by {club.creator?.name || 'YouConnect member'}</span>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link
                                    to={`/app/clubs/${club.id}`}
                                    className="festival-card rounded-full border-2 border-black bg-[#FFF3DC] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]"
                                >
                                    Open club
                                </Link>
                                {isOwner ? (
                                    <Link
                                        to={`/app/clubs/${club.id}`}
                                        className="festival-card rounded-full border-2 border-black bg-[#FFD327] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]"
                                    >
                                        Manage club
                                    </Link>
                                ) : null}
                                <button
                                    type="button"
                                    onClick={() => handleMembershipAction(club)}
                                    disabled={processingClubId === club.id || club.is_suspended}
                                    className={[
                                        'festival-card rounded-full border-2 border-black px-4 py-3 text-sm font-black uppercase tracking-[0.14em] shadow-[4px_4px_0_rgba(0,0,0,0.85)] disabled:cursor-not-allowed disabled:opacity-60',
                                        isMember ? 'bg-[#FF66D6] text-black' : 'bg-[#25F2A0] text-black',
                                    ].join(' ')}
                                >
                                    {processingClubId === club.id
                                        ? 'Updating...'
                                        : isMember
                                            ? 'Leave club'
                                            : 'Join club'}
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
}
