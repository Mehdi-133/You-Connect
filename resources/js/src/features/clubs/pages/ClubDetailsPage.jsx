import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SectionCard } from '../../../shared/components/SectionCard';
import { useAuth } from '../../../hooks/useAuth';
import { EmptyState } from '../../../shared/ui/feedback/EmptyState';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';
import { LoadingState } from '../../../shared/ui/feedback/LoadingState';
import { getUsers } from '../../../services/api/users.service';
import { UserAvatar } from '../../../shared/components/UserAvatar';
import {
    changeClubMemberRole,
    deleteClub,
    getClub,
    inviteClubMember,
    joinClub,
    leaveClub,
    removeClubMember,
    restoreClub,
    suspendClub,
    updateClub,
} from '../../../services/api/clubs.service';
import { isAdmin } from '../../../shared/utils/roles';

export function ClubDetailsPage() {
    const { clubId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [club, setClub] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [processingMembership, setProcessingMembership] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [managementMessage, setManagementMessage] = useState('');
    const [managementError, setManagementError] = useState('');
    const [isSavingClub, setIsSavingClub] = useState(false);
    const [isDeletingClub, setIsDeletingClub] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [processingMemberId, setProcessingMemberId] = useState(null);
    const [inviteUserId, setInviteUserId] = useState('');
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        logo: '',
    });

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
                setEditForm({
                    name: response.name || '',
                    description: response.description || '',
                    logo: response.logo || '',
                });
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

    const canManageMembers = useMemo(
        () => Boolean(user && club && (user.id === club.creator_id || isAdmin(user))),
        [club, user]
    );

    const canEditClub = useMemo(
        () => Boolean(user && club && user.id === club.creator_id),
        [club, user]
    );

    const canModerateClub = useMemo(
        () => Boolean(user && club && isAdmin(user)),
        [club, user]
    );

    useEffect(() => {
        let isMounted = true;

        async function loadUsers() {
            if (!canManageMembers) {
                setAllUsers([]);
                return;
            }

            setIsLoadingUsers(true);

            try {
                const response = await getUsers();

                if (!isMounted) {
                    return;
                }

                setAllUsers(response?.data || []);
            } catch {
                if (!isMounted) {
                    return;
                }

                setAllUsers([]);
            } finally {
                if (isMounted) {
                    setIsLoadingUsers(false);
                }
            }
        }

        loadUsers();

        return () => {
            isMounted = false;
        };
    }, [canManageMembers]);

    const isMember = useMemo(
        () => Boolean(club?.members?.some((member) => member.id === user?.id)),
        [club?.members, user?.id]
    );

    const availableUsersToInvite = useMemo(() => {
        const memberIds = new Set((club?.members || []).map((member) => member.id));
        return allUsers.filter((item) => !memberIds.has(item.id));
    }, [allUsers, club?.members]);

    function handleEditInputChange(event) {
        const { name, value } = event.target;

        setEditForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    }

    async function handleMembershipAction() {
        if (!club || !user?.id || club.is_suspended) {
            return;
        }

        setFeedbackMessage('');
        setManagementError('');
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

    async function handleSaveClub(event) {
        event.preventDefault();
        setManagementMessage('');
        setManagementError('');
        setIsSavingClub(true);

        try {
            const updatedClub = await updateClub(club.id, {
                name: editForm.name.trim(),
                description: editForm.description.trim(),
                logo: editForm.logo.trim(),
            });

            setClub((currentClub) => ({
                ...currentClub,
                ...updatedClub,
            }));
            setManagementMessage('Club details updated successfully.');
        } catch (requestError) {
            setManagementError(
                requestError.response?.data?.message ||
                'We could not update this club right now.'
            );
        } finally {
            setIsSavingClub(false);
        }
    }

    async function handleInviteMember() {
        if (!inviteUserId || !club) {
            return;
        }

        setManagementMessage('');
        setManagementError('');
        setProcessingMemberId(`invite-${inviteUserId}`);

        try {
            await inviteClubMember(club.id, inviteUserId);
            const invitedUser = allUsers.find((item) => String(item.id) === String(inviteUserId));

            if (invitedUser) {
                setClub((currentClub) => ({
                    ...currentClub,
                    members: [
                        ...(currentClub?.members || []),
                        {
                            ...invitedUser,
                            pivot: { role: 'member' },
                        },
                    ],
                    members_count: (currentClub?.members_count || currentClub?.members?.length || 0) + 1,
                }));
            }

            setInviteUserId('');
            setManagementMessage('Member invited successfully.');
        } catch (requestError) {
            setManagementError(
                requestError.response?.data?.message ||
                'We could not invite this member right now.'
            );
        } finally {
            setProcessingMemberId(null);
        }
    }

    async function handleRemoveMember(memberId) {
        if (!club) {
            return;
        }

        setManagementMessage('');
        setManagementError('');
        setProcessingMemberId(memberId);

        try {
            await removeClubMember(club.id, memberId);
            setClub((currentClub) => ({
                ...currentClub,
                members: (currentClub?.members || []).filter((member) => member.id !== memberId),
                members_count: Math.max(0, (currentClub?.members_count || currentClub?.members?.length || 0) - 1),
            }));
            setManagementMessage('Member removed successfully.');
        } catch (requestError) {
            setManagementError(
                requestError.response?.data?.message ||
                'We could not remove this member right now.'
            );
        } finally {
            setProcessingMemberId(null);
        }
    }

    async function handleChangeMemberRole(memberId, role) {
        if (!club) {
            return;
        }

        setManagementMessage('');
        setManagementError('');
        setProcessingMemberId(memberId);

        try {
            await changeClubMemberRole(club.id, memberId, role);
            setClub((currentClub) => ({
                ...currentClub,
                members: (currentClub?.members || []).map((member) =>
                    member.id === memberId
                        ? {
                            ...member,
                            pivot: {
                                ...member.pivot,
                                role,
                            },
                        }
                        : member
                ),
            }));
            setManagementMessage('Member role updated successfully.');
        } catch (requestError) {
            setManagementError(
                requestError.response?.data?.message ||
                'We could not update this member role right now.'
            );
        } finally {
            setProcessingMemberId(null);
        }
    }

    async function handleToggleSuspension() {
        if (!club) {
            return;
        }

        setManagementMessage('');
        setManagementError('');
        setIsUpdatingStatus(true);

        try {
            if (club.is_suspended) {
                await restoreClub(club.id);
            } else {
                await suspendClub(club.id);
            }

            setClub((currentClub) => ({
                ...currentClub,
                is_suspended: !currentClub.is_suspended,
            }));
            setManagementMessage(club.is_suspended ? 'Club restored successfully.' : 'Club suspended successfully.');
        } catch (requestError) {
            setManagementError(
                requestError.response?.data?.message ||
                'We could not update the club status right now.'
            );
        } finally {
            setIsUpdatingStatus(false);
        }
    }

    async function handleDeleteClub() {
        if (!club) {
            return;
        }

        setManagementMessage('');
        setManagementError('');
        setIsDeletingClub(true);

        try {
            await deleteClub(club.id);
            navigate('/app/clubs', { replace: true });
        } catch (requestError) {
            setManagementError(
                requestError.response?.data?.message ||
                'We could not delete this club right now.'
            );
            setIsDeletingClub(false);
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
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-[#FFF3DC]">
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#25F2A0] px-1.5 text-[10px] text-black">
                            {club.members_count || club.members?.length || 0}
                        </span>
                        <span>Members</span>
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
                                <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-[12px] font-black uppercase tracking-[0.12em]">
                                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#25F2A0] px-1.5 text-[10px] text-black">
                                        {club.members_count || club.members?.length || 0}
                                    </span>
                                    <span>Active members</span>
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
                                        <UserAvatar
                                            name={member.name}
                                            photo={member.photo}
                                            size="md"
                                        />
                                    ) : (
                                        <UserAvatar
                                            name={member.name}
                                            photo={member.photo}
                                            size="md"
                                            ringClassName={index % 2 === 0 ? 'from-[#29CFFF] via-[#25F2A0] to-[#FFD327]' : 'from-[#FFD327] via-[#FF9F1C] to-[#FF66D6]'}
                                        />
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

            {(canEditClub || canManageMembers || canModerateClub) ? (
                <SectionCard
                    eyebrow="Club management"
                    title="Keep this club clear, active, and well managed"
                    description="These controls help club owners and admins manage identity, members, and moderation without leaving the club page."
                >
                    {managementMessage ? (
                        <p className="mb-4 text-sm font-bold text-[#25F2A0]">{managementMessage}</p>
                    ) : null}

                    {managementError ? (
                        <p className="mb-4 text-sm font-bold text-[#FFD327]">{managementError}</p>
                    ) : null}

                    <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                        {canEditClub ? (
                            <form
                                onSubmit={handleSaveClub}
                                className="surface festival-card rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[5px_5px_0_rgba(0,0,0,0.8)]"
                            >
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                    Edit club
                                </p>
                                <div className="mt-4 grid gap-4">
                                    <div>
                                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#d8cfbd]">
                                            Club name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={editForm.name}
                                            onChange={handleEditInputChange}
                                            className="w-full rounded-[1.3rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#d8cfbd]">
                                            Logo URL
                                        </label>
                                        <input
                                            type="text"
                                            name="logo"
                                            value={editForm.logo}
                                            onChange={handleEditInputChange}
                                            placeholder="https://example.com/club-logo.png"
                                            className="w-full rounded-[1.3rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#d8cfbd]">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={editForm.description}
                                            onChange={handleEditInputChange}
                                            rows="5"
                                            className="w-full rounded-[1.3rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none"
                                        />
                                    </div>
                                    <div>
                                        <button
                                            type="submit"
                                            disabled={isSavingClub}
                                            className="festival-card rounded-full border-2 border-black bg-[#25F2A0] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)] disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            {isSavingClub ? 'Saving...' : 'Save club changes'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        ) : null}

                        {(canManageMembers || canModerateClub) ? (
                            <div className="grid gap-4">
                                {canManageMembers ? (
                                    <div className="surface festival-card rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[5px_5px_0_rgba(0,0,0,0.8)]">
                                        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFD327]">
                                            Member controls
                                        </p>

                                        <div className="mt-4 flex flex-col gap-3">
                                            <select
                                                value={inviteUserId}
                                                onChange={(event) => setInviteUserId(event.target.value)}
                                                className="w-full rounded-[1.3rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none"
                                                disabled={isLoadingUsers}
                                            >
                                                <option value="">Choose a user to invite</option>
                                                {availableUsersToInvite.map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.name}
                                                    </option>
                                                ))}
                                            </select>

                                            <button
                                                type="button"
                                                onClick={handleInviteMember}
                                                disabled={!inviteUserId || Boolean(processingMemberId)}
                                                className="festival-card rounded-full border-2 border-black bg-[#FFD327] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)] disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                                {processingMemberId?.toString().startsWith('invite-') ? 'Inviting...' : 'Invite member'}
                                            </button>
                                        </div>

                                        <div className="mt-5 max-h-[320px] space-y-3 overflow-y-auto pr-1">
                                            {(club.members || []).map((member) => (
                                                <div
                                                    key={member.id}
                                                    className="rounded-[1.3rem] border border-white/10 bg-[#0B0126]/70 px-4 py-3"
                                                >
                                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="truncate font-bold text-[#FFF3DC]">{member.name}</p>
                                                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#d8cfbd]">
                                                                {member.pivot?.role || 'member'}
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {member.id !== club.creator_id ? (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleChangeMemberRole(member.id, member.pivot?.role === 'admin' ? 'member' : 'admin')}
                                                                        disabled={processingMemberId === member.id}
                                                                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#d8cfbd] disabled:cursor-not-allowed disabled:opacity-60"
                                                                    >
                                                                        {member.pivot?.role === 'admin' ? 'Make member' : 'Make admin'}
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveMember(member.id)}
                                                                        disabled={processingMemberId === member.id}
                                                                        className="rounded-full border border-[#ff8f8f]/40 bg-[#2a0b15] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#ffb8b8] disabled:cursor-not-allowed disabled:opacity-60"
                                                                    >
                                                                        {processingMemberId === member.id ? 'Working...' : 'Remove'}
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <span className="rounded-full bg-[#25F2A0] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-black">
                                                                    Creator
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}

                                {canModerateClub ? (
                                    <div className="surface festival-card rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[5px_5px_0_rgba(0,0,0,0.8)]">
                                        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF66D6]">
                                            Admin moderation
                                        </p>
                                        <div className="mt-4 flex flex-wrap gap-3">
                                            <button
                                                type="button"
                                                onClick={handleToggleSuspension}
                                                disabled={isUpdatingStatus}
                                                className="festival-card rounded-full border-2 border-black bg-[#FFD327] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)] disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                                {isUpdatingStatus
                                                    ? 'Updating...'
                                                    : club.is_suspended
                                                        ? 'Restore club'
                                                        : 'Suspend club'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleDeleteClub}
                                                disabled={isDeletingClub}
                                                className="festival-card rounded-full border-2 border-black bg-[#FF66D6] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)] disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                                {isDeletingClub ? 'Deleting...' : 'Delete club'}
                                            </button>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </SectionCard>
            ) : null}
        </div>
    );
}
