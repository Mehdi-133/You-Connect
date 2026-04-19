import { useEffect, useMemo, useState } from 'react';
import { SectionCard } from '../../../shared/components/SectionCard';
import { useAuth } from '../../../hooks/useAuth';
import {
    addUserInterest,
    getInterests,
    getUser,
    getUserScore,
    removeUserInterest,
    updateUser,
} from '../../../services/api/users.service';
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

function getFieldValue(form, key) {
    return form[key] || '';
}

function getBadgeTone(index) {
    const tones = [
        'from-[#FFD327] via-[#FFB800] to-[#FF8B1F]',
        'from-[#29CFFF] via-[#54E2FF] to-[#25F2A0]',
        'from-[#A34DFF] via-[#C975FF] to-[#FF66D6]',
        'from-[#25F2A0] via-[#A8FF6A] to-[#FFD327]',
    ];

    return tones[index % tones.length];
}

function getBadgeIconLabel(badge) {
    if (badge?.icon) {
        return badge.icon
            .split(/[-_]/)
            .map((part) => part[0]?.toUpperCase())
            .join('')
            .slice(0, 2);
    }

    return badge?.name?.slice(0, 1)?.toUpperCase() || 'B';
}

function formatAwardedAt(value) {
    if (!value) {
        return 'Recently earned';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Recently earned';
    }

    return `Earned ${date.toLocaleDateString()}`;
}

function getReputationDetails(scoreValue) {
    const score = Number(scoreValue) || 0;
    const milestones = [
        { min: 0, max: 49, label: 'New member', nextLabel: 'Active learner' },
        { min: 50, max: 149, label: 'Active learner', nextLabel: 'Rising contributor' },
        { min: 150, max: 299, label: 'Rising contributor', nextLabel: 'Trusted builder' },
        { min: 300, max: 499, label: 'Trusted builder', nextLabel: 'Community standout' },
        { min: 500, max: Infinity, label: 'Community standout', nextLabel: null },
    ];

    const currentTier = milestones.find((tier) => score >= tier.min && score <= tier.max) || milestones[0];
    const span = currentTier.max === Infinity ? 1 : currentTier.max - currentTier.min + 1;
    const progressValue = currentTier.max === Infinity
        ? 100
        : Math.min(100, Math.round(((score - currentTier.min) / span) * 100));

    return {
        score,
        label: currentTier.label,
        nextLabel: currentTier.nextLabel,
        currentFloor: currentTier.min,
        nextMilestone: currentTier.max === Infinity ? null : currentTier.max + 1,
        progressValue,
    };
}

export function ProfilePage() {
    const { user, updateCurrentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [score, setScore] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        name: '',
        bio: '',
        class: '',
        photo: '',
    });
    const [formError, setFormError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [allInterests, setAllInterests] = useState([]);
    const [selectedInterestId, setSelectedInterestId] = useState('');
    const [interestMessage, setInterestMessage] = useState('');
    const [interestError, setInterestError] = useState('');
    const [processingInterestId, setProcessingInterestId] = useState(null);
    const [isAddingInterest, setIsAddingInterest] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function loadProfile() {
            if (!user?.id) {
                return;
            }

            setIsLoading(true);
            setError('');

            try {
                const [profileResponse, scoreResponse, interestsResponse] = await Promise.all([
                    getUser(user.id),
                    getUserScore(user.id),
                    getInterests(),
                ]);

                if (!isMounted) {
                    return;
                }

                setProfile(profileResponse);
                setScore(scoreResponse.reputation);
                setAllInterests(interestsResponse?.data || []);
                setForm({
                    name: profileResponse.name || '',
                    bio: profileResponse.bio || '',
                    class: profileResponse.class || '',
                    photo: profileResponse.photo || '',
                });
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
    const reputationDetails = useMemo(
        () => getReputationDetails(score ?? profile?.reputation ?? 0),
        [profile?.reputation, score]
    );

    const availableInterests = useMemo(() => {
        const selectedIds = new Set((profile?.interests || []).map((interest) => interest.id));

        return allInterests.filter((interest) => !selectedIds.has(interest.id));
    }, [allInterests, profile?.interests]);
    const featuredBadges = useMemo(
        () => (profile?.badges || []).slice(0, 3),
        [profile?.badges]
    );

    function handleInputChange(event) {
        const { name, value } = event.target;

        setForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    }

    async function handleSaveProfile(event) {
        event.preventDefault();
        setFormError('');
        setFieldErrors({});
        setSuccessMessage('');
        setIsSaving(true);

        const payload = {
            name: form.name.trim(),
            bio: form.bio.trim(),
            class: form.class || null,
            photo: form.photo.trim(),
        };

        if (!payload.class) {
            delete payload.class;
        }

        if (!payload.photo) {
            delete payload.photo;
        }

        try {
            const updatedProfile = await updateUser(user.id, payload);

            setProfile((currentProfile) => ({
                ...currentProfile,
                ...updatedProfile,
            }));
            updateCurrentUser?.({
                name: updatedProfile.name,
                bio: updatedProfile.bio,
                class: updatedProfile.class,
                photo: updatedProfile.photo,
            });
            setForm({
                name: updatedProfile.name || '',
                bio: updatedProfile.bio || '',
                class: updatedProfile.class || '',
                photo: updatedProfile.photo || '',
            });
            setSuccessMessage('Profile updated successfully.');
        } catch (requestError) {
            const nextFieldErrors = requestError.response?.data?.errors || {};

            setFieldErrors(nextFieldErrors);
            setFormError(
                Object.keys(nextFieldErrors).length
                    ? ''
                    : requestError.response?.data?.message ||
                      'We could not update your profile right now.'
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function handleAddInterest() {
        if (!selectedInterestId) {
            return;
        }

        setInterestError('');
        setInterestMessage('');
        setIsAddingInterest(true);

        try {
            const response = await addUserInterest(user.id, selectedInterestId);
            const nextInterest = response.interest;

            setProfile((currentProfile) => ({
                ...currentProfile,
                interests: [...(currentProfile?.interests || []), nextInterest],
            }));
            setSelectedInterestId('');
            setInterestMessage('Interest added successfully.');
        } catch (requestError) {
            setInterestError(
                requestError.response?.data?.message ||
                'We could not add this interest right now.'
            );
        } finally {
            setIsAddingInterest(false);
        }
    }

    async function handleRemoveInterest(interestId) {
        setInterestError('');
        setInterestMessage('');
        setProcessingInterestId(interestId);

        try {
            await removeUserInterest(user.id, interestId);

            setProfile((currentProfile) => ({
                ...currentProfile,
                interests: (currentProfile?.interests || []).filter((interest) => interest.id !== interestId),
            }));
            setInterestMessage('Interest removed successfully.');
        } catch (requestError) {
            setInterestError(
                requestError.response?.data?.message ||
                'We could not remove this interest right now.'
            );
        } finally {
            setProcessingInterestId(null);
        }
    }

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
                title="Your learning profile"
                description="Review your account details, keep your introduction sharp, and make your profile feel ready for classmates, mentors, and collaborators."
                className="hero-gradient overflow-hidden"
            >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top_left,rgba(41,207,255,0.18),transparent_26%),radial-gradient(circle_at_top_right,rgba(37,242,160,0.16),transparent_26%),radial-gradient(circle_at_50%_0%,rgba(255,211,39,0.12),transparent_30%)]" />

                <div className="relative grid gap-6 xl:grid-cols-[360px_1fr]">
                    <div className="festival-card rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(11,1,38,0.96)_0%,rgba(16,8,43,0.94)_100%)] p-6 text-[#FFF3DC] shadow-[6px_6px_0_rgba(0,0,0,0.85)]">
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

                        <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_100%)] p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#FFD327]">
                                        Badge showcase
                                    </p>
                                    <p className="mt-2 text-sm text-[#d8cfbd]">
                                        Your latest achievements stay visible right under your identity.
                                    </p>
                                </div>
                                <span className="rounded-full bg-[#FFD327] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-black shadow-[3px_3px_0_rgba(0,0,0,0.75)]">
                                    {profile.badges?.length ?? 0}
                                </span>
                            </div>

                            {featuredBadges.length ? (
                                <div className="mt-4 grid gap-3">
                                    {featuredBadges.map((badge, index) => (
                                        <div
                                            key={badge.id}
                                            className="rounded-[1.3rem] border border-white/10 bg-[#09051a]/70 p-3 shadow-[4px_4px_0_rgba(0,0,0,0.65)]"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`flex h-12 w-12 items-center justify-center rounded-[1rem] bg-gradient-to-br ${getBadgeTone(index)} text-sm font-black text-black shadow-[3px_3px_0_rgba(0,0,0,0.55)]`}>
                                                    {getBadgeIconLabel(badge)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-black text-[#FFF3DC]">{badge.name}</p>
                                                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#d8cfbd]">
                                                        {formatAwardedAt(badge.pivot?.awarded_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-4 text-sm leading-7 text-[#d8cfbd]">
                                    Earned badges will appear here as a quick showcase.
                                </p>
                            )}
                        </div>

                        <div className="mt-6 grid gap-3 text-sm text-[#d8cfbd]">
                            <div className="rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-3">
                                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                    Profile snapshot
                                </p>
                                <div className="mt-3 grid gap-3">
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#9be7c4]">Class</p>
                                        <p className="mt-1 font-semibold text-[#FFF3DC]">
                                            {profile.class || 'Not specified yet'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#9be7c4]">Last activity</p>
                                        <p className="mt-1 font-semibold text-[#FFF3DC]">
                                            {formatLastSeen(profile.last_seen)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.03)_100%)] p-4">
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

                        <div className="surface festival-card overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(140deg,rgba(255,211,39,0.12)_0%,rgba(41,207,255,0.08)_38%,rgba(163,77,255,0.08)_100%)] p-6 shadow-[5px_5px_0_rgba(0,0,0,0.8)]">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FFD327]">
                                        Reputation
                                    </p>
                                    <h3 className="mt-3 font-display text-3xl font-extrabold leading-none text-[#FFF3DC]">
                                        Your community signal
                                    </h3>
                                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d8cfbd]">
                                        Your reputation grows when you stay active, share knowledge, and keep showing up across questions, blogs, and recognition moments.
                                    </p>
                                </div>
                                <div className="rounded-[1.4rem] border border-white/10 bg-[#09051a]/70 px-5 py-4 text-right shadow-[4px_4px_0_rgba(0,0,0,0.6)]">
                                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                        Current tier
                                    </p>
                                    <p className="mt-2 text-xl font-black text-[#FFF3DC]">
                                        {reputationDetails.label}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                                <div className="rounded-[1.6rem] border border-white/10 bg-[#09051a]/75 p-5 shadow-[4px_4px_0_rgba(0,0,0,0.65)]">
                                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#FFD327]">
                                        Reputation score
                                    </p>
                                    <div className="mt-4 flex items-end gap-3">
                                        <span className="font-display text-6xl font-extrabold leading-none text-[#FFF3DC]">
                                            {reputationDetails.score}
                                        </span>
                                        <span className="pb-2 text-sm font-bold uppercase tracking-[0.14em] text-[#d8cfbd]">
                                            points
                                        </span>
                                    </div>

                                    <div className="mt-6">
                                        <div className="flex items-center justify-between gap-3 text-[11px] font-black uppercase tracking-[0.14em] text-[#d8cfbd]">
                                            <span>{reputationDetails.label}</span>
                                            <span>
                                                {reputationDetails.nextMilestone
                                                    ? `${reputationDetails.progressValue}% to ${reputationDetails.nextLabel}`
                                                    : 'Top tier reached'}
                                            </span>
                                        </div>
                                        <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                                            <div
                                                className="h-full rounded-full bg-[linear-gradient(90deg,#FFD327_0%,#25F2A0_48%,#29CFFF_100%)]"
                                                style={{ width: `${reputationDetails.progressValue}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-3">
                                    <div className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4">
                                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                            Next milestone
                                        </p>
                                        <p className="mt-2 text-2xl font-black text-[#FFF3DC]">
                                            {reputationDetails.nextMilestone || 'Maxed out'}
                                        </p>
                                        <p className="mt-2 text-sm leading-7 text-[#d8cfbd]">
                                            {reputationDetails.nextMilestone
                                                ? `Reach ${reputationDetails.nextMilestone} points to unlock the ${reputationDetails.nextLabel} tier.`
                                                : 'You are already in the highest visible reputation tier.'}
                                        </p>
                                    </div>

                                    <div className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4">
                                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#29CFFF]">
                                            Why it matters
                                        </p>
                                        <p className="mt-2 text-sm leading-7 text-[#d8cfbd]">
                                            Reputation helps others quickly understand how consistently you contribute, collaborate, and create value inside YouConnect.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                            <form
                                onSubmit={handleSaveProfile}
                                className="surface festival-card rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.03)_100%)] p-6 shadow-[5px_5px_0_rgba(0,0,0,0.8)]"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#25F2A0]">
                                            Edit profile
                                        </p>
                                        <h3 className="mt-3 font-display text-3xl font-extrabold leading-none">
                                            Keep your profile sharp
                                        </h3>
                                    </div>
                                    <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#d8cfbd]">
                                        Live account settings
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-4 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                            Display name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={getFieldValue(form, 'name')}
                                            onChange={handleInputChange}
                                            placeholder="Your public profile name"
                                            className="w-full rounded-[1.3rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none"
                                        />
                                        {fieldErrors.name ? (
                                            <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.name[0]}</p>
                                        ) : null}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                            Class
                                        </label>
                                        <select
                                            name="class"
                                            value={getFieldValue(form, 'class')}
                                            onChange={handleInputChange}
                                            className="w-full rounded-[1.3rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none"
                                        >
                                            <option value="">Choose your class</option>
                                            <option value="dev room">Dev room</option>
                                            <option value="dar hamza">Dar Hamza</option>
                                        </select>
                                        {fieldErrors.class ? (
                                            <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.class[0]}</p>
                                        ) : null}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                            Photo URL
                                        </label>
                                        <input
                                            type="text"
                                            name="photo"
                                            value={getFieldValue(form, 'photo')}
                                            onChange={handleInputChange}
                                            placeholder="https://example.com/profile.jpg"
                                            className="w-full rounded-[1.3rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none"
                                        />
                                        {fieldErrors.photo ? (
                                            <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.photo[0]}</p>
                                        ) : null}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                            Bio
                                        </label>
                                        <textarea
                                            name="bio"
                                            value={getFieldValue(form, 'bio')}
                                            onChange={handleInputChange}
                                            rows="5"
                                            placeholder="Share what you are learning, building, or helping with in the community."
                                            className="w-full rounded-[1.3rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none"
                                        />
                                        {fieldErrors.bio ? (
                                            <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.bio[0]}</p>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                                    <div>
                                        {formError ? (
                                            <p className="text-sm font-bold text-[#FFD327]">{formError}</p>
                                        ) : null}
                                        {successMessage ? (
                                            <p className="text-sm font-bold text-[#25F2A0]">{successMessage}</p>
                                        ) : null}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="festival-card rounded-full bg-[#25F2A0] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-black disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {isSaving ? 'Saving...' : 'Save profile'}
                                    </button>
                                </div>
                            </form>

                            <div className="surface festival-card rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.03)_100%)] p-6 shadow-[5px_5px_0_rgba(0,0,0,0.8)]">
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#25F2A0]">
                                    Profile guidance
                                </p>
                                <h3 className="mt-3 font-display text-3xl font-extrabold leading-none">
                                    What makes this page feel complete
                                </h3>

                                <div className="mt-6 grid gap-3">
                                    {[
                                        ['Name', 'Use the same identity your classmates and mentors recognize.'],
                                        ['Bio', 'Explain what you are learning and what kind of help or collaboration you enjoy.'],
                                        ['Photo', 'A photo URL makes your profile feel more human across questions, blogs, and notifications.'],
                                    ].map(([label, copy]) => (
                                        <div key={label} className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3">
                                            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#FFD327]">{label}</p>
                                            <p className="mt-2 text-sm leading-7 text-[#d8cfbd]">{copy}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
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
                                    <div className="grid gap-3">
                                        {profile.badges.map((badge, index) => (
                                            <div
                                                key={badge.id}
                                                className="rounded-[1.4rem] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.03)_100%)] p-4"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`flex h-14 w-14 items-center justify-center rounded-[1rem] bg-gradient-to-br ${getBadgeTone(index)} text-sm font-black text-black shadow-[4px_4px_0_rgba(0,0,0,0.55)]`}>
                                                        {getBadgeIconLabel(badge)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="font-display text-2xl font-extrabold leading-none text-[#FFF3DC]">
                                                                {badge.name}
                                                            </p>
                                                            <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#d8cfbd]">
                                                                {badge.points_required || 0} pts
                                                            </span>
                                                        </div>
                                                        <p className="mt-3 text-sm leading-7 text-[#d8cfbd]">
                                                            {badge.description || 'This badge marks a meaningful milestone inside your learning journey.'}
                                                        </p>
                                                        <p className="mt-3 text-[11px] font-black uppercase tracking-[0.14em] text-[#FFD327]">
                                                            {formatAwardedAt(badge.pivot?.awarded_at)}
                                                        </p>
                                                    </div>
                                                </div>
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

                                <div className="mb-4 rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#29CFFF]">
                                        Interest picker
                                    </p>
                                    <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                                        <select
                                            value={selectedInterestId}
                                            onChange={(event) => setSelectedInterestId(event.target.value)}
                                            className="flex-1 rounded-[1rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none"
                                        >
                                            <option value="">Choose an interest</option>
                                            {availableInterests.map((interest) => (
                                                <option key={interest.id} value={interest.id}>
                                                    {interest.name}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={handleAddInterest}
                                            disabled={!selectedInterestId || isAddingInterest}
                                            className="rounded-full bg-[#29CFFF] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-black disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            {isAddingInterest ? 'Adding...' : 'Add'}
                                        </button>
                                    </div>
                                    {interestError ? (
                                        <p className="mt-3 text-sm font-bold text-[#FFD327]">{interestError}</p>
                                    ) : null}
                                    {interestMessage ? (
                                        <p className="mt-3 text-sm font-bold text-[#25F2A0]">{interestMessage}</p>
                                    ) : null}
                                </div>

                                {profile.interests?.length ? (
                                    <div className="flex flex-wrap gap-3">
                                        {profile.interests.map((interest) => (
                                            <div
                                                key={interest.id}
                                                className="flex items-center gap-3 rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-[#FFF3DC]"
                                            >
                                                <span>{interest.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveInterest(interest.id)}
                                                    disabled={processingInterestId === interest.id}
                                                    className="rounded-full border border-[#7ad7ff]/40 bg-[#071b2c] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#8de1ff] disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {processingInterestId === interest.id ? 'Removing...' : 'Remove'}
                                                </button>
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
