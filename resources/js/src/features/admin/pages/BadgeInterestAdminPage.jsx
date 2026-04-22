import { useEffect, useMemo, useState } from 'react';
import { SectionCard } from '../../../shared/components/SectionCard';
import { useAuth } from '../../../hooks/useAuth';
import {
    assignUserBadge,
    createBadge,
    createInterest,
    deleteBadge,
    deleteInterest,
    getBadges,
    getInterests,
    getUser,
    getUsers,
    revokeUserBadge,
    updateBadge,
    updateInterest,
} from '../../../services/api/users.service';
import { isAdmin } from '../../../shared/utils/roles';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';
import { LoadingState } from '../../../shared/ui/feedback/LoadingState';
import { BadgeEmblem } from '../../../shared/components/BadgeEmblem';

const INTEREST_TYPE_OPTIONS = [
    'web_development',
    'mobile_development',
    'data_science',
    'machine_learning',
    'artificial_intelligence',
    'cyber_security',
    'cloud_computing',
    'devops',
    'blockchain',
    'game_development',
    'embedded',
    'networking',
    'database_administration',
    'systems_programming',
    'open_source',
    'ui_ux_design',
    'software_architecture',
    'testing',
    'other',
];

function formatTypeLabel(value) {
    return String(value || '')
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function createEmptyBadgeForm() {
    return {
        name: '',
        description: '',
        icon: '',
        points_required: 0,
    };
}

function createEmptyInterestForm() {
    return {
        name: '',
        type: 'web_development',
        icon: '',
    };
}

export function BadgeInterestAdminPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [badges, setBadges] = useState([]);
    const [interests, setInterests] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedUserProfile, setSelectedUserProfile] = useState(null);
    const [isLoadingSelectedUser, setIsLoadingSelectedUser] = useState(false);
    const [selectedBadgeId, setSelectedBadgeId] = useState('');

    const [badgeForm, setBadgeForm] = useState(createEmptyBadgeForm());
    const [editingBadgeId, setEditingBadgeId] = useState(null);
    const [badgeError, setBadgeError] = useState('');
    const [badgeMessage, setBadgeMessage] = useState('');
    const [isSavingBadge, setIsSavingBadge] = useState(false);
    const [processingBadgeId, setProcessingBadgeId] = useState(null);
    const [isAssigningBadge, setIsAssigningBadge] = useState(false);

    const [interestForm, setInterestForm] = useState(createEmptyInterestForm());
    const [editingInterestId, setEditingInterestId] = useState(null);
    const [interestError, setInterestError] = useState('');
    const [interestMessage, setInterestMessage] = useState('');
    const [isSavingInterest, setIsSavingInterest] = useState(false);
    const [processingInterestId, setProcessingInterestId] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function loadAdminData() {
            setIsLoading(true);
            setError('');

            try {
                const [usersResponse, badgesResponse, interestsResponse] = await Promise.all([
                    getUsers(),
                    getBadges(),
                    getInterests(),
                ]);

                if (!isMounted) {
                    return;
                }

                setUsers(usersResponse?.data || []);
                setBadges(badgesResponse?.data || []);
                setInterests(interestsResponse?.data || []);
            } catch (requestError) {
                if (!isMounted) {
                    return;
                }

                setError(
                    requestError.response?.data?.message ||
                    'We could not load the admin badge and interest workspace right now.'
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadAdminData();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function loadSelectedUser() {
            if (!selectedUserId) {
                setSelectedUserProfile(null);
                return;
            }

            setIsLoadingSelectedUser(true);

            try {
                const response = await getUser(selectedUserId);

                if (!isMounted) {
                    return;
                }

                setSelectedUserProfile(response);
            } catch (requestError) {
                if (!isMounted) {
                    return;
                }

                setBadgeError(
                    requestError.response?.data?.message ||
                    'We could not load the selected user profile.'
                );
            } finally {
                if (isMounted) {
                    setIsLoadingSelectedUser(false);
                }
            }
        }

        loadSelectedUser();

        return () => {
            isMounted = false;
        };
    }, [selectedUserId]);

    const assignableBadges = useMemo(() => {
        const assignedIds = new Set((selectedUserProfile?.badges || []).map((badge) => badge.id));

        return badges.filter((badge) => !assignedIds.has(badge.id));
    }, [badges, selectedUserProfile?.badges]);

    function handleBadgeInputChange(event) {
        const { name, value } = event.target;

        setBadgeForm((currentForm) => ({
            ...currentForm,
            [name]: name === 'points_required' ? Number(value) : value,
        }));
    }

    function handleInterestInputChange(event) {
        const { name, value } = event.target;

        setInterestForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    }

    function startEditingBadge(badge) {
        setEditingBadgeId(badge.id);
        setBadgeForm({
            name: badge.name || '',
            description: badge.description || '',
            icon: badge.icon || '',
            points_required: badge.points_required || 0,
        });
        setBadgeError('');
        setBadgeMessage('');
    }

    function resetBadgeForm() {
        setEditingBadgeId(null);
        setBadgeForm(createEmptyBadgeForm());
    }

    function startEditingInterest(interest) {
        setEditingInterestId(interest.id);
        setInterestForm({
            name: interest.name || '',
            type: interest.type || 'web_development',
            icon: interest.icon || '',
        });
        setInterestError('');
        setInterestMessage('');
    }

    function resetInterestForm() {
        setEditingInterestId(null);
        setInterestForm(createEmptyInterestForm());
    }

    async function handleSaveBadge(event) {
        event.preventDefault();
        setBadgeError('');
        setBadgeMessage('');
        setIsSavingBadge(true);

        const payload = {
            name: badgeForm.name.trim(),
            description: badgeForm.description.trim(),
            icon: badgeForm.icon.trim(),
            points_required: Number(badgeForm.points_required) || 0,
        };

        try {
            const savedBadge = editingBadgeId
                ? await updateBadge(editingBadgeId, payload)
                : await createBadge(payload);

            setBadges((currentBadges) =>
                editingBadgeId
                    ? currentBadges.map((badge) => (badge.id === editingBadgeId ? savedBadge : badge))
                    : [savedBadge, ...currentBadges]
            );
            resetBadgeForm();
            setBadgeMessage(editingBadgeId ? 'Badge updated successfully.' : 'Badge created successfully.');
        } catch (requestError) {
            setBadgeError(
                requestError.response?.data?.message ||
                'We could not save this badge right now.'
            );
        } finally {
            setIsSavingBadge(false);
        }
    }

    async function handleDeleteBadge(badgeId) {
        setBadgeError('');
        setBadgeMessage('');
        setProcessingBadgeId(badgeId);

        try {
            await deleteBadge(badgeId);
            setBadges((currentBadges) => currentBadges.filter((badge) => badge.id !== badgeId));

            if (editingBadgeId === badgeId) {
                resetBadgeForm();
            }

            setBadgeMessage('Badge deleted successfully.');
        } catch (requestError) {
            setBadgeError(
                requestError.response?.data?.message ||
                'We could not delete this badge right now.'
            );
        } finally {
            setProcessingBadgeId(null);
        }
    }

    async function handleSaveInterest(event) {
        event.preventDefault();
        setInterestError('');
        setInterestMessage('');
        setIsSavingInterest(true);

        const payload = {
            name: interestForm.name.trim(),
            type: interestForm.type,
            icon: interestForm.icon.trim(),
        };

        try {
            const savedInterest = editingInterestId
                ? await updateInterest(editingInterestId, payload)
                : await createInterest(payload);

            setInterests((currentInterests) =>
                editingInterestId
                    ? currentInterests.map((interest) => (interest.id === editingInterestId ? savedInterest : interest))
                    : [savedInterest, ...currentInterests]
            );
            resetInterestForm();
            setInterestMessage(editingInterestId ? 'Interest updated successfully.' : 'Interest created successfully.');
        } catch (requestError) {
            setInterestError(
                requestError.response?.data?.message ||
                'We could not save this interest right now.'
            );
        } finally {
            setIsSavingInterest(false);
        }
    }

    async function handleDeleteInterest(interestId) {
        setInterestError('');
        setInterestMessage('');
        setProcessingInterestId(interestId);

        try {
            await deleteInterest(interestId);
            setInterests((currentInterests) => currentInterests.filter((interest) => interest.id !== interestId));

            if (editingInterestId === interestId) {
                resetInterestForm();
            }

            setInterestMessage('Interest deleted successfully.');
        } catch (requestError) {
            setInterestError(
                requestError.response?.data?.message ||
                'We could not delete this interest right now.'
            );
        } finally {
            setProcessingInterestId(null);
        }
    }

    async function handleAssignBadge() {
        if (!selectedUserId || !selectedBadgeId) {
            return;
        }

        setBadgeError('');
        setBadgeMessage('');
        setIsAssigningBadge(true);

        try {
            const response = await assignUserBadge(selectedUserId, selectedBadgeId);

            setSelectedUserProfile((currentProfile) => ({
                ...currentProfile,
                badges: [...(currentProfile?.badges || []), response.badge],
            }));
            setSelectedBadgeId('');
            setBadgeMessage('Badge assigned to the selected user.');
        } catch (requestError) {
            setBadgeError(
                requestError.response?.data?.message ||
                'We could not assign this badge right now.'
            );
        } finally {
            setIsAssigningBadge(false);
        }
    }

    async function handleRevokeAssignedBadge(badgeId) {
        if (!selectedUserId) {
            return;
        }

        setBadgeError('');
        setBadgeMessage('');
        setProcessingBadgeId(badgeId);

        try {
            await revokeUserBadge(selectedUserId, badgeId);
            setSelectedUserProfile((currentProfile) => ({
                ...currentProfile,
                badges: (currentProfile?.badges || []).filter((badge) => badge.id !== badgeId),
            }));
            setBadgeMessage('Badge revoked from the selected user.');
        } catch (requestError) {
            setBadgeError(
                requestError.response?.data?.message ||
                'We could not revoke this badge right now.'
            );
        } finally {
            setProcessingBadgeId(null);
        }
    }

    if (!isAdmin(user)) {
        return (
            <ErrorState
                eyebrow="Admin"
                title="Admin tools unavailable"
                description="This workspace is only available to admin accounts."
                helperText="Sign in as an admin user to manage the badge catalog, interest catalog, and badge assignment flows."
            />
        );
    }

    if (isLoading) {
        return (
            <LoadingState
                eyebrow="Admin lab"
                title="Loading badge and interest tools"
                description="We are pulling users, badges, and interests for the admin workspace."
                blocks={4}
            />
        );
    }

    if (error) {
        return (
            <ErrorState
                eyebrow="Admin lab"
                title="Admin workspace unavailable"
                description={error}
                helperText="Check that the backend is running and that your admin session is still valid, then refresh the page."
            />
        );
    }

    return (
        <div className="grid gap-6">
            <SectionCard
                eyebrow="Admin lab"
                title="Shape recognition, identity, and achievement"
                description="Manage the badge catalog, tune the interest library, and assign badges to the right people from one focused admin workspace."
                className="hero-gradient overflow-hidden"
            >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top_left,rgba(255,211,39,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(41,207,255,0.16),transparent_24%),radial-gradient(circle_at_60%_10%,rgba(163,77,255,0.14),transparent_26%)]" />
                <div className="relative grid gap-4 lg:grid-cols-3">
                    {[
                        ['Catalog badges', badges.length, 'Build a clean reward system your community can understand at a glance.'],
                        ['Catalog interests', interests.length, 'Keep the interest library useful so users can describe themselves quickly.'],
                        ['Assignable users', users.length, 'Choose a user first, then assign the right badge with clear intent.'],
                    ].map(([label, value, copy], index) => (
                        <div
                            key={label}
                            className={[
                                'rounded-[1.8rem] border border-white/10 p-5 shadow-[5px_5px_0_rgba(0,0,0,0.8)]',
                                index === 0
                                    ? 'bg-[linear-gradient(160deg,rgba(255,211,39,0.18)_0%,rgba(255,255,255,0.04)_100%)]'
                                    : index === 1
                                        ? 'bg-[linear-gradient(160deg,rgba(41,207,255,0.18)_0%,rgba(255,255,255,0.04)_100%)]'
                                        : 'bg-[linear-gradient(160deg,rgba(163,77,255,0.18)_0%,rgba(255,255,255,0.04)_100%)]',
                            ].join(' ')}
                        >
                            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#25F2A0]">{label}</p>
                            <p className="mt-4 font-display text-5xl font-extrabold leading-none text-[#FFF3DC]">{value}</p>
                            <p className="mt-4 text-sm leading-7 text-[#d8cfbd]">{copy}</p>
                        </div>
                    ))}
                </div>
            </SectionCard>

            <div className="grid items-start gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <section className="grid gap-6">
                    <SectionCard eyebrow="Badge catalog" title="Create and refine achievements" description="A strong badge library feels curated, specific, and easy to award.">
                        <form onSubmit={handleSaveBadge} className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[5px_5px_0_rgba(0,0,0,0.8)]">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#FFD327]">Badge name</label>
                                    <input type="text" name="name" value={badgeForm.name} onChange={handleBadgeInputChange} className="w-full rounded-[1.3rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none" />
                                </div>
                                <div>
                                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#FFD327]">Points required</label>
                                    <input type="number" min="0" name="points_required" value={badgeForm.points_required} onChange={handleBadgeInputChange} className="w-full rounded-[1.3rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none" />
                                </div>
                                <div>
                                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#FFD327]">Logo URL</label>
                                    <input type="text" name="icon" value={badgeForm.icon} onChange={handleBadgeInputChange} placeholder="https://..." className="w-full rounded-[1.3rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none" />
                                    <p className="mt-2 text-xs font-semibold text-[#d8cfbd]">
                                        Paste an image link to display a badge logo (we fall back to initials if it fails).
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#FFD327]">Description</label>
                                    <textarea name="description" value={badgeForm.description} onChange={handleBadgeInputChange} rows="3" className="w-full rounded-[1.3rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none" />
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.6rem] border border-white/10 bg-[#09051a]/60 px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <BadgeEmblem
                                        badge={{ name: badgeForm.name || 'Badge', icon: badgeForm.icon }}
                                        gradientClassName="from-[#FFD327] via-[#FFB800] to-[#FF8B1F]"
                                        sizeClassName="h-12 w-12"
                                    />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-black text-[#FFF3DC]">
                                            {badgeForm.name || 'Badge preview'}
                                        </p>
                                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#d8cfbd]">
                                            {Number(badgeForm.points_required) || 0} pts required
                                        </p>
                                    </div>
                                </div>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#d8cfbd]">
                                    Preview
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <button type="submit" disabled={isSavingBadge} className="rounded-full bg-[#FFD327] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-black disabled:cursor-not-allowed disabled:opacity-70">
                                    {isSavingBadge ? 'Saving...' : editingBadgeId ? 'Update badge' : 'Create badge'}
                                </button>
                                {editingBadgeId ? (
                                    <button type="button" onClick={resetBadgeForm} className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#d8cfbd]">
                                        Cancel edit
                                    </button>
                                ) : null}
                            </div>
                            {badgeError ? <p className="text-sm font-bold text-[#FFD327]">{badgeError}</p> : null}
                            {badgeMessage ? <p className="text-sm font-bold text-[#25F2A0]">{badgeMessage}</p> : null}
                        </form>
                        <div className="mt-6 grid gap-3">
                            {badges.map((badge) => (
                                <div key={badge.id} className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4 shadow-[4px_4px_0_rgba(0,0,0,0.7)]">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <BadgeEmblem
                                                badge={badge}
                                                gradientClassName="from-[#29CFFF] via-[#25F2A0] to-[#FFD327]"
                                                sizeClassName="h-12 w-12"
                                            />
                                            <div className="min-w-0">
                                                <p className="font-display text-2xl font-extrabold leading-none text-[#FFF3DC]">{badge.name}</p>
                                                <p className="mt-2 text-sm leading-7 text-[#d8cfbd]">{badge.description || 'No description yet.'}</p>
                                            </div>
                                        </div>
                                        <span className="rounded-full bg-[#FFD327] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-black">
                                            {badge.points_required} pts
                                        </span>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-3">
                                        <button type="button" onClick={() => startEditingBadge(badge)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#d8cfbd]">
                                            Edit
                                        </button>
                                        <button type="button" onClick={() => handleDeleteBadge(badge.id)} disabled={processingBadgeId === badge.id} className="rounded-full border border-[#ff8f8f]/40 bg-[#2a0b15] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#ffb8b8] disabled:cursor-not-allowed disabled:opacity-60">
                                            {processingBadgeId === badge.id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard eyebrow="Interest catalog" title="Curate what users can identify with" description="Interests should feel intentional, broad enough to choose from, and specific enough to be meaningful.">
                        <form onSubmit={handleSaveInterest} className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[5px_5px_0_rgba(0,0,0,0.8)]">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#29CFFF]">Interest name</label>
                                    <input type="text" name="name" value={interestForm.name} onChange={handleInterestInputChange} className="w-full rounded-[1.3rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none" />
                                </div>
                                <div>
                                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#29CFFF]">Interest type</label>
                                    <select name="type" value={interestForm.type} onChange={handleInterestInputChange} className="w-full rounded-[1.3rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none">
                                        {INTEREST_TYPE_OPTIONS.map((option) => (
                                            <option key={option} value={option}>{formatTypeLabel(option)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#29CFFF]">Icon</label>
                                    <input type="text" name="icon" value={interestForm.icon} onChange={handleInterestInputChange} placeholder="frontend-builders" className="w-full rounded-[1.3rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none" />
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <button type="submit" disabled={isSavingInterest} className="rounded-full bg-[#29CFFF] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-black disabled:cursor-not-allowed disabled:opacity-70">
                                    {isSavingInterest ? 'Saving...' : editingInterestId ? 'Update interest' : 'Create interest'}
                                </button>
                                {editingInterestId ? (
                                    <button type="button" onClick={resetInterestForm} className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#d8cfbd]">
                                        Cancel edit
                                    </button>
                                ) : null}
                            </div>
                            {interestError ? <p className="text-sm font-bold text-[#FFD327]">{interestError}</p> : null}
                            {interestMessage ? <p className="text-sm font-bold text-[#25F2A0]">{interestMessage}</p> : null}
                        </form>
                        <div className="mt-6 grid gap-3">
                            {interests.map((interest) => (
                                <div key={interest.id} className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4 shadow-[4px_4px_0_rgba(0,0,0,0.7)]">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="font-display text-2xl font-extrabold leading-none text-[#FFF3DC]">{interest.name}</p>
                                            <p className="mt-2 text-sm font-semibold text-[#29CFFF]">{formatTypeLabel(interest.type)}</p>
                                        </div>
                                        {interest.icon ? (
                                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#d8cfbd]">
                                                {interest.icon}
                                            </span>
                                        ) : null}
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-3">
                                        <button type="button" onClick={() => startEditingInterest(interest)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#d8cfbd]">
                                            Edit
                                        </button>
                                        <button type="button" onClick={() => handleDeleteInterest(interest.id)} disabled={processingInterestId === interest.id} className="rounded-full border border-[#ff8f8f]/40 bg-[#2a0b15] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#ffb8b8] disabled:cursor-not-allowed disabled:opacity-60">
                                            {processingInterestId === interest.id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </section>

                <SectionCard eyebrow="Badge assignment" title="Choose a user, then award intentionally" description="This panel keeps assignment separate from catalog management so admin work stays clear and deliberate." className="self-start overflow-hidden">
                    <div className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.03)_100%)] p-5 shadow-[5px_5px_0_rgba(0,0,0,0.8)]">
                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#A8FF6A]">Target user</label>
                        <select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)} className="w-full rounded-[1.3rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none">
                            <option value="">Choose a user</option>
                            {users.map((item) => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                    </div>

                    {!selectedUserId ? (
                        <p className="mt-6 text-sm leading-7 text-[rgb(var(--fg-muted))]">Pick a user first to review their current badges and assign a new one.</p>
                    ) : isLoadingSelectedUser ? (
                        <p className="mt-6 text-sm leading-7 text-[rgb(var(--fg-muted))]">Loading selected user profile...</p>
                    ) : selectedUserProfile ? (
                        <div className="mt-6 grid gap-4">
                            <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-4 shadow-[5px_5px_0_rgba(0,0,0,0.8)]">
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#A8FF6A]">Selected profile</p>
                                <h3 className="mt-3 font-display text-2xl font-extrabold leading-none text-[#FFF3DC]">{selectedUserProfile.name}</h3>
                                <p className="mt-2 text-sm text-[#d8cfbd]">{selectedUserProfile.email}</p>
                                <p className="mt-3 text-sm leading-6 text-[#d8cfbd] line-clamp-3">{selectedUserProfile.bio || 'No bio added yet.'}</p>
                            </div>
                            <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-4 shadow-[5px_5px_0_rgba(0,0,0,0.8)]">
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFD327]">Assign badge</p>
                                <div className="mt-3 flex flex-col gap-3">
                                    <select value={selectedBadgeId} onChange={(event) => setSelectedBadgeId(event.target.value)} className="w-full rounded-[1.3rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none">
                                        <option value="">Choose a badge</option>
                                        {assignableBadges.map((badge) => (
                                            <option key={badge.id} value={badge.id}>{badge.name}</option>
                                        ))}
                                    </select>
                                    <button type="button" onClick={handleAssignBadge} disabled={!selectedBadgeId || isAssigningBadge} className="rounded-full bg-[#FFD327] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-black disabled:cursor-not-allowed disabled:opacity-70">
                                        {isAssigningBadge ? 'Assigning...' : 'Assign badge'}
                                    </button>
                                </div>
                                {badgeError ? <p className="mt-3 text-sm font-bold text-[#FFD327]">{badgeError}</p> : null}
                                {badgeMessage ? <p className="mt-3 text-sm font-bold text-[#25F2A0]">{badgeMessage}</p> : null}
                            </div>
                            <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-4 shadow-[5px_5px_0_rgba(0,0,0,0.8)]">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="font-display text-2xl font-extrabold leading-none text-[#FFF3DC]">Assigned badges</p>
                                    <span className="rounded-full bg-[#FFD327] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-black">
                                        {selectedUserProfile.badges?.length ?? 0}
                                    </span>
                                </div>
                                {selectedUserProfile.badges?.length ? (
                                    <div className="mt-4 max-h-[260px] space-y-2 overflow-y-auto pr-1">
                                        {selectedUserProfile.badges.map((badge) => (
                                            <div key={badge.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[1.15rem] border border-white/10 bg-[#0B0126]/70 px-3 py-2.5">
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-bold text-[#FFF3DC]">{badge.name}</p>
                                                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#d8cfbd]">{badge.points_required} points</p>
                                                </div>
                                                <button type="button" onClick={() => handleRevokeAssignedBadge(badge.id)} disabled={processingBadgeId === badge.id} className="rounded-full border border-[#ff8f8f]/40 bg-[#2a0b15] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#ffb8b8] disabled:cursor-not-allowed disabled:opacity-60">
                                                    {processingBadgeId === badge.id ? 'Revoking...' : 'Revoke'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-4 text-sm leading-7 text-[rgb(var(--fg-muted))]">This user does not have any badges yet.</p>
                                )}
                            </div>
                            <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-4 shadow-[5px_5px_0_rgba(0,0,0,0.8)]">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="font-display text-2xl font-extrabold leading-none text-[#FFF3DC]">Selected interests</p>
                                    <span className="rounded-full bg-[#29CFFF] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-black">
                                        {selectedUserProfile.interests?.length ?? 0}
                                    </span>
                                </div>
                                {selectedUserProfile.interests?.length ? (
                                    <div className="mt-4 max-h-[220px] overflow-y-auto pr-1">
                                        <div className="flex flex-wrap gap-2">
                                            {selectedUserProfile.interests.map((interest) => (
                                                <span
                                                    key={interest.id}
                                                    className="rounded-full border border-white/10 bg-[#071b2c] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#8de1ff]"
                                                >
                                                    {interest.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="mt-4 text-sm leading-7 text-[rgb(var(--fg-muted))]">This user has not selected any interests yet.</p>
                                )}
                            </div>
                        </div>
                    ) : null}
                </SectionCard>
            </div>
        </div>
    );
}
