import { useEffect, useMemo, useState } from 'react';
import { SectionCard } from '../../../shared/components/SectionCard';
import { useAuth } from '../../../hooks/useAuth';
import { getUser, getUserScore } from '../../../services/api/users.service';
import { getRoleLabel } from '../../../shared/utils/roles';
import { EmptyState } from '../../../shared/ui/feedback/EmptyState';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';
import { LoadingState } from '../../../shared/ui/feedback/LoadingState';

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

function getStatusLabel(status) {
    if (!status) {
        return 'Active';
    }

    return String(status)
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatLastSeen(value) {
    if (!value) {
        return 'Recently active';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Recently active';
    }

    return `Seen ${date.toLocaleDateString()}`;
}

function getProfileHighlights(profile, reputation) {
    return [
        {
            label: 'Reputation',
            value: reputation ?? profile?.reputation ?? 0,
            tone: 'bg-[#25F2A0] text-black',
        },
        {
            label: 'Badges',
            value: profile?.badges?.length ?? 0,
            tone: 'bg-[#FFD327] text-black',
        },
        {
            label: 'Interests',
            value: profile?.interests?.length ?? 0,
            tone: 'bg-[#29CFFF] text-black',
        },
    ];
}

export function ProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [score, setScore] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        async function loadProfile() {
            if (!user?.id) {
                return;
            }

            setIsLoading(true);
            setError('');

            try {
                const [profileResponse, scoreResponse] = await Promise.all([
                    getUser(user.id),
                    getUserScore(user.id),
                ]);

                if (!isMounted) {
                    return;
                }

                setProfile(profileResponse);
                setScore(scoreResponse.reputation);
            } catch (requestError) {
                if (!isMounted) {
                    return;
                }

                setError(
                    requestError.response?.data?.message ||
                    'We could not load your profile right now.'
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadProfile();

        return () => {
            isMounted = false;
        };
    }, [user?.id]);

    const highlights = useMemo(
        () => getProfileHighlights(profile, score),
        [profile, score]
    );

    if (isLoading) {
        return (
            <LoadingState
                eyebrow="Profile"
                title="Loading your profile"
                description="We are pulling your user details, badges, interests, and reputation."
            />
        );
    }

    if (error) {
        return (
            <ErrorState
                eyebrow="Profile"
                title="Profile unavailable"
                description={error}
                helperText="Refresh the page after checking that the backend is running and your session is still active."
            />
        );
    }

    if (!profile) {
        return (
            <EmptyState
                eyebrow="Profile"
                title="No profile data yet"
                description="As soon as your user details are available, your profile summary will show up here."
            />
        );
    }

    const roleLabel = getRoleLabel(profile);
    const avatarFallback = getInitials(profile.name);

    return (
        <div className="grid gap-6">
            <SectionCard
                eyebrow="Profile"
                title="Your learning identity"
                description="This view now reflects the real logged-in user instead of a placeholder mock card."
                className="hero-gradient overflow-hidden"
            >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(41,207,255,0.16),transparent_26%),radial-gradient(circle_at_top_right,rgba(37,242,160,0.16),transparent_26%)]" />

                <div className="relative grid gap-6 lg:grid-cols-[340px_1fr]">
                    <div className="festival-card rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(11,1,38,0.94)_0%,rgba(18,7,49,0.92)_100%)] p-6 text-[#FFF3DC] shadow-[6px_6px_0_rgba(0,0,0,0.85)]">
                        <div className="flex items-start gap-4">
                            {profile.photo ? (
                                <img
                                    src={profile.photo}
                                    alt={profile.name}
                                    className="h-24 w-24 rounded-[1.6rem] border-2 border-black object-cover shadow-[5px_5px_0_rgba(0,0,0,0.85)]"
                                />
                            ) : (
                                <div className="flex h-24 w-24 items-center justify-center rounded-[1.6rem] border-2 border-black bg-[linear-gradient(135deg,#29CFFF_0%,#25F2A0_58%,#FFD327_100%)] text-3xl font-black text-black shadow-[5px_5px_0_rgba(0,0,0,0.85)]">
                                    {avatarFallback}
                                </div>
                            )}

                            <div className="min-w-0 flex-1">
                                <h3 className="font-display text-3xl font-extrabold leading-none">
                                    {profile.name}
                                </h3>
                                <p className="mt-2 text-sm font-semibold text-[#d8cfbd]">
                                    {profile.email}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-[#25F2A0] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-black shadow-[3px_3px_0_rgba(0,0,0,0.75)]">
                                        {roleLabel}
                                    </span>
                                    <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#FFF3DC]">
                                        {getStatusLabel(profile.status)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3 text-sm text-[#d8cfbd]">
                            <div className="rounded-[1.2rem] bg-white/5 px-4 py-3">
                                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                    Class
                                </p>
                                <p className="mt-1 font-semibold text-[#FFF3DC]">
                                    {profile.class || 'Not specified yet'}
                                </p>
                            </div>

                            <div className="rounded-[1.2rem] bg-white/5 px-4 py-3">
                                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                    Last activity
                                </p>
                                <p className="mt-1 font-semibold text-[#FFF3DC]">
                                    {formatLastSeen(profile.last_seen)}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                Bio
                            </p>
                            <p className="mt-3 text-sm leading-7 text-[#FFF3DC]">
                                {profile.bio || 'Add a short bio so people can understand what you are learning and contributing.'}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            {highlights.map((item) => (
                                <div key={item.label} className="surface festival-card rounded-[1.8rem] p-5 shadow-[5px_5px_0_rgba(0,0,0,0.8)]">
                                    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${item.tone}`}>
                                        {item.label}
                                    </span>
                                    <p className="mt-4 font-display text-4xl font-extrabold leading-none">
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="surface festival-card rounded-[2rem] p-5 shadow-[5px_5px_0_rgba(0,0,0,0.8)]">
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="font-display text-2xl font-extrabold leading-none">
                                        Badges
                                    </p>
                                    <span className="rounded-full bg-[#FFD327] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-black">
                                        {profile.badges?.length ?? 0}
                                    </span>
                                </div>

                                {profile.badges?.length ? (
                                    <div className="flex flex-wrap gap-3">
                                        {profile.badges.map((badge) => (
                                            <div
                                                key={badge.id}
                                                className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-[#FFF3DC]"
                                            >
                                                {badge.name}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm leading-7 text-[rgb(var(--fg-muted))]">
                                        No badges assigned yet.
                                    </p>
                                )}
                            </div>

                            <div className="surface festival-card rounded-[2rem] p-5 shadow-[5px_5px_0_rgba(0,0,0,0.8)]">
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="font-display text-2xl font-extrabold leading-none">
                                        Interests
                                    </p>
                                    <span className="rounded-full bg-[#29CFFF] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-black">
                                        {profile.interests?.length ?? 0}
                                    </span>
                                </div>

                                {profile.interests?.length ? (
                                    <div className="flex flex-wrap gap-3">
                                        {profile.interests.map((interest) => (
                                            <div
                                                key={interest.id}
                                                className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-[#FFF3DC]"
                                            >
                                                {interest.name}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm leading-7 text-[rgb(var(--fg-muted))]">
                                        No interests selected yet.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </SectionCard>
        </div>
    );
}
