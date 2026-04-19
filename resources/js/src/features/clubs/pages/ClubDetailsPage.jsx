import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SectionCard } from '../../../shared/components/SectionCard';
import { useAuth } from '../../../hooks/useAuth';
import { EmptyState } from '../../../shared/ui/feedback/EmptyState';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';
import { LoadingState } from '../../../shared/ui/feedback/LoadingState';
import { getClub, joinClub, leaveClub } from '../../../services/api/clubs.service';

function getInitials(name) {
    if (!name) {
        return 'YC';
    }

    return name
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
}

export function ClubDetailsPage() {
    const { clubId } = useParams();
    const { user } = useAuth();
    const [club, setClub] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [processingMembership, setProcessingMembership] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function loadClub() {
            setIsLoading(true);
            setError('');

            try {
                const response = await getClub(clubId);

                if (!isMounted) {
                    return;
                }

                setClub(response);
            } catch (requestError) {
                if (!isMounted) {
                    return;
                }

                setError(
                    requestError.response?.data?.message ||
                    'We could not load this club right now.'
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadClub();

        return () => {
            isMounted = false;
        };
    }, [clubId]);

    const isMember = useMemo(
        () => Boolean(club?.members?.some((member) => member.id === user?.id)),
        [club?.members, user?.id]
    );

    async function handleMembershipAction() {
        if (!club || !user?.id || club.is_suspended) {
            return;
        }

        setFeedbackMessage('');
        setProcessingMembership(true);

        try {
            if (isMember) {
                await leaveClub(club.id);
            } else {
                await joinClub(club.id);
            }

            setClub((currentClub) => {
                const currentMembers = currentClub?.members || [];

                return {
                    ...currentClub,
                    members: isMember
                        ? currentMembers.filter((member) => member.id !== user.id)
                        : [
                            ...currentMembers,
                            {
                                id: user.id,
                                name: user.name,
                                photo: user.photo || null,
                                bio: user.bio || '',
                                pivot: {
                                    role: 'member',
                                },
                            },
                        ],
                    members_count: isMember
                        ? Math.max(0, (currentClub?.members_count || currentMembers.length || 0) - 1)
                        : (currentClub?.members_count || currentMembers.length || 0) + 1,
                };
            });

            setFeedbackMessage(isMember ? 'You left this club.' : 'You joined this club.');
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                'We could not update your membership right now.'
            );
        } finally {
            setProcessingMembership(false);
        }
    }

    if (isLoading) {
        return (
            <LoadingState
                eyebrow="Club details"
                title="Loading club page"
                description="We are pulling the club profile, creator, and member roster."
            />
        );
    }

    if (error) {
        return (
            <ErrorState
                eyebrow="Club details"
                title="Club unavailable"
                description={error}
                helperText="Return to the clubs page, then refresh once the club data is available again."
            />
        );
    }

    if (!club) {
        return (
            <EmptyState
                eyebrow="Club details"
                title="Club not found"
                description="This club may have been removed or is no longer visible to your account."
            />
        );
    }

    return (
        <div className="grid gap-6">
            <SectionCard
                eyebrow="Club details"
                title=""
                description=""
                className="hero-gradient overflow-hidden"
            >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top_left,rgba(37,242,160,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(41,207,255,0.16),transparent_24%),radial-gradient(circle_at_55%_8%,rgba(255,211,39,0.12),transparent_28%)]" />

                <div className="relative flex flex-wrap items-center gap-3">
                    <Link
                        to="/app/clubs"
                        className="festival-card rounded-full border-2 border-black bg-[#FFF3DC] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]"
                    >
                        Back to clubs
                    </Link>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${club.is_suspended ? 'bg-[#FF66D6] text-black' : 'bg-[#25F2A0] text-black'}`}>
                        {club.is_suspended ? 'Suspended' : 'Active club'}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#d8cfbd]">
                        {club.members_count || club.members?.length || 0} members
                    </span>
                </div>

                {feedbackMessage ? (
                    <p className="relative mt-6 text-sm font-bold text-[#25F2A0]">{feedbackMessage}</p>
                ) : null}

                <div className="relative mt-8 rounded-[2.3rem] border-2 border-black bg-[linear-gradient(145deg,#FFF3DC_0%,#e7fff6_100%)] p-8 text-black shadow-[8px_8px_0_rgba(0,0,0,0.85)]">
                    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#39705d]">
                                YouConnect club space
                            </p>
                            <h1 className="mt-4 font-display text-5xl font-extrabold leading-[0.95]">
                                {club.name}
                            </h1>
                            <p className="mt-6 max-w-3xl text-base leading-9 text-[#2f342f]">
                                {club.description || 'This club is building a space for members to connect, learn together, and create momentum inside YouConnect.'}
                            </p>

                            <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold text-[#2f342f]">
                                <span className="rounded-full bg-black px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#FFF3DC]">
                                    Created by {club.creator?.name || 'YouConnect member'}
                                </span>
                                <span className="rounded-full bg-white/70 px-4 py-2">
                                    {club.members_count || club.members?.length || 0} active members
                                </span>
                            </div>
                        </div>

                        <div className="rounded-[1.9rem] border border-black/10 bg-white/60 p-5">
                            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#39705d]">
                                Membership
                            </p>
                            <p className="mt-3 text-sm leading-7 text-[#2f342f]">
                                Join this club to become part of its member roster and keep your community participation visible.
                            </p>
                            <button
                                type="button"
                                onClick={handleMembershipAction}
                                disabled={processingMembership || club.is_suspended}
                                className={[
                                    'mt-5 festival-card rounded-full border-2 border-black px-5 py-3 text-sm font-black uppercase tracking-[0.14em] shadow-[4px_4px_0_rgba(0,0,0,0.85)] disabled:cursor-not-allowed disabled:opacity-60',
                                    isMember ? 'bg-[#FF66D6] text-black' : 'bg-[#25F2A0] text-black',
                                ].join(' ')}
                            >
                                {processingMembership
                                    ? 'Updating membership...'
                                    : isMember
                                        ? 'Leave club'
                                        : 'Join club'}
                            </button>
                        </div>
                    </div>
                </div>
            </SectionCard>

            <SectionCard
                eyebrow="Members"
                title="People inside this club"
                description="A club becomes real when its member roster feels visible, active, and welcoming."
            >
                {club.members?.length ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {club.members.map((member, index) => (
                            <article
                                key={member.id}
                                className="surface festival-card rounded-[1.8rem] border border-white/10 bg-white/5 p-5 shadow-[5px_5px_0_rgba(0,0,0,0.8)]"
                            >
                                <div className="flex items-start gap-4">
                                    {member.photo ? (
                                        <img
                                            src={member.photo}
                                            alt={member.name}
                                            className="h-14 w-14 rounded-[1rem] border-2 border-black object-cover shadow-[4px_4px_0_rgba(0,0,0,0.8)]"
                                        />
                                    ) : (
                                        <div className={`flex h-14 w-14 items-center justify-center rounded-[1rem] border-2 border-black text-sm font-black text-black shadow-[4px_4px_0_rgba(0,0,0,0.8)] ${index % 2 === 0 ? 'bg-[linear-gradient(135deg,#29CFFF_0%,#25F2A0_58%,#FFD327_100%)]' : 'bg-[linear-gradient(135deg,#FFD327_0%,#FF9F1C_52%,#FF66D6_100%)]'}`}>
                                            {getInitials(member.name)}
                                        </div>
                                    )}

                                    <div className="min-w-0 flex-1">
                                        <p className="text-lg font-black text-[#FFF3DC]">{member.name}</p>
                                        <p className="mt-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#25F2A0]">
                                            {member.pivot?.role || 'Member'}
                                        </p>
                                        <p className="mt-3 text-sm leading-7 text-[#d8cfbd]">
                                            {member.bio || 'This member has not added a club-facing bio yet.'}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        eyebrow="Members"
                        title="No members yet"
                        description="This club has not built its roster yet, so this is a good place for the first join."
                    />
                )}
            </SectionCard>
        </div>
    );
}
