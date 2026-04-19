import { useEffect, useMemo, useState } from 'react';
import { SectionCard } from '../../../shared/components/SectionCard';
import { useAuth } from '../../../hooks/useAuth';
import {
    addUserInterest,
    assignUserBadge,
    getBadges,
    getInterests,
    getUser,
    getUserScore,
    removeUserInterest,
    revokeUserBadge,
    updateUser,
} from '../../../services/api/users.service';
import { getRoleLabel, isAdmin } from '../../../shared/utils/roles';
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
    const [allBadges, setAllBadges] = useState([]);
    const [selectedInterestId, setSelectedInterestId] = useState('');
    const [selectedBadgeId, setSelectedBadgeId] = useState('');
    const [interestMessage, setInterestMessage] = useState('');
    const [interestError, setInterestError] = useState('');
    const [badgeMessage, setBadgeMessage] = useState('');
    const [badgeError, setBadgeError] = useState('');
    const [processingInterestId, setProcessingInterestId] = useState(null);
    const [processingBadgeId, setProcessingBadgeId] = useState(null);
    const [isAddingInterest, setIsAddingInterest] = useState(false);
    const [isAssigningBadge, setIsAssigningBadge] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function loadProfile() {
            if (!user?.id) {
                return;
            }

            setIsLoading(true);
            setError('');

            try {
                const requests = [
                    getUser(user.id),
                    getUserScore(user.id),
                    getInterests(),
                ];

                if (isAdmin(user)) {
                    requests.push(getBadges());
                }

                const [profileResponse, scoreResponse, interestsResponse, badgesResponse] = await Promise.all(requests);

                if (!isMounted) {
                    return;
                }

                setProfile(profileResponse);
                setScore(scoreResponse.reputation);
                setAllInterests(interestsResponse?.data || []);
                setAllBadges(badgesResponse?.data || []);
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

    const availableInterests = useMemo(() => {
        const selectedIds = new Set((profile?.interests || []).map((interest) => interest.id));

        return allInterests.filter((interest) => !selectedIds.has(interest.id));
    }, [allInterests, profile?.interests]);

    const availableBadges = useMemo(() => {
        const selectedIds = new Set((profile?.badges || []).map((badge) => badge.id));

        return allBadges.filter((badge) => !selectedIds.has(badge.id));
    }, [allBadges, profile?.badges]);

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

    async function handleAssignBadge() {
        if (!selectedBadgeId) {
            return;
        }

        setBadgeError('');
        setBadgeMessage('');
        setIsAssigningBadge(true);

        try {
            const response = await assignUserBadge(user.id, selectedBadgeId);
            const nextBadge = response.badge;

            setProfile((currentProfile) => ({
                ...currentProfile,
                badges: [...(currentProfile?.badges || []), nextBadge],
            }));
            setSelectedBadgeId('');
            setBadgeMessage('Badge assigned successfully.');
        } catch (requestError) {
            setBadgeError(
                requestError.response?.data?.message ||
                'We could not assign this badge right now.'
            );
        } finally {
            setIsAssigningBadge(false);
        }
    }

    async function handleRevokeBadge(badgeId) {
        setBadgeError('');
        setBadgeMessage('');
        setProcessingBadgeId(badgeId);

        try {
            await revokeUserBadge(user.id, badgeId);

            setProfile((currentProfile) => ({
                ...currentProfile,
                badges: (currentProfile?.badges || []).filter((badge) => badge.id !== badgeId),
            }));
            setBadgeMessage('Badge revoked successfully.');
        } catch (requestError) {
            setBadgeError(
                requestError.response?.data?.message ||
                'We could not revoke this badge right now.'
            );
        } finally {
            setProcessingBadgeId(null);
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

                                {isAdmin(user) ? (
                                    <div className="mb-4 rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#FFD327]">
                                            Admin controls
                                        </p>
                                        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                                            <select
                                                value={selectedBadgeId}
                                                onChange={(event) => setSelectedBadgeId(event.target.value)}
                                                className="flex-1 rounded-[1rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none"
                                            >
                                                <option value="">Assign a badge</option>
                                                {availableBadges.map((badge) => (
                                                    <option key={badge.id} value={badge.id}>
                                                        {badge.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={handleAssignBadge}
                                                disabled={!selectedBadgeId || isAssigningBadge}
                                                className="rounded-full bg-[#FFD327] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-black disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                                {isAssigningBadge ? 'Assigning...' : 'Assign'}
                                            </button>
                                        </div>
                                        {badgeError ? (
                                            <p className="mt-3 text-sm font-bold text-[#FFD327]">{badgeError}</p>
                                        ) : null}
                                        {badgeMessage ? (
                                            <p className="mt-3 text-sm font-bold text-[#25F2A0]">{badgeMessage}</p>
                                        ) : null}
                                    </div>
                                ) : null}

                                {profile.badges?.length ? (
                                    <div className="flex flex-wrap gap-3">
                                        {profile.badges.map((badge) => (
                                            <div
                                                key={badge.id}
                                                className="flex items-center gap-3 rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-[#FFF3DC]"
                                            >
                                                <span>{badge.name}</span>
                                                {isAdmin(user) ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRevokeBadge(badge.id)}
                                                        disabled={processingBadgeId === badge.id}
                                                        className="rounded-full border border-[#ff8f8f]/40 bg-[#2a0b15] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#ffb8b8] disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        {processingBadgeId === badge.id ? 'Removing...' : 'Revoke'}
                                                    </button>
                                                ) : null}
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
