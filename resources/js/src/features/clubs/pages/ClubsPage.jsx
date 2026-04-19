import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SectionCard } from '../../../shared/components/SectionCard';
import { useAuth } from '../../../hooks/useAuth';
import { EmptyState } from '../../../shared/ui/feedback/EmptyState';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';
import { LoadingState } from '../../../shared/ui/feedback/LoadingState';
import { getClubs, joinClub, leaveClub } from '../../../services/api/clubs.service';

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

    if (!clubs.length) {
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

            {feedbackMessage ? (
                <p className="text-sm font-bold text-[#25F2A0]">{feedbackMessage}</p>
            ) : null}

            <div className="grid gap-5 lg:grid-cols-2">
                {clubs.map((club, index) => {
                    const isMember = isUserMember(club, user?.id);

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
                                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                                    {club.members_count || club.members?.length || 0} members
                                </span>
                                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                                    Created by {club.creator?.name || 'YouConnect member'}
                                </span>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link
                                    to={`/app/clubs/${club.id}`}
                                    className="festival-card rounded-full border-2 border-black bg-[#FFF3DC] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]"
                                >
                                    Open club
                                </Link>
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
