import { useEffect, useMemo, useRef, useState } from 'react';
import { UserAvatar } from '../../../shared/components/UserAvatar';
import { Modal } from '../../../shared/ui/overlay/Modal';
import { banUser, getUser, restoreUser } from '../../../services/api/users.service';

const CAMPUS_OPTIONS = [
    { value: 'all', label: 'All campuses' },
    { value: 'nador', label: 'Nador' },
    { value: 'safi', label: 'Safi' },
    { value: 'youssoufia', label: 'Youssoufia' },
];

const ROLE_OPTIONS = [
    { value: 'all', label: 'All roles' },
    { value: 'student', label: 'Students' },
    { value: 'bde_membre', label: 'BDE members' },
    { value: 'formateur', label: 'Formateurs' },
    { value: 'admin', label: 'Admins' },
];

const STATUS_OPTIONS = [
    { value: 'all', label: 'All statuses' },
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'banned', label: 'Banned' },
];

function formatCampus(value) {
    if (!value) return '--';
    const raw = String(value).toLowerCase();
    return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function formatRole(value) {
    if (!value) return '--';
    const raw = String(value);
    if (raw === 'bde_membre') return 'BDE';
    return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function formatDate(value) {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--';
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function formatRelativeTime(value) {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--';

    const deltaMs = Date.now() - date.getTime();
    if (deltaMs < 60_000) return 'now';
    const minutes = Math.floor(deltaMs / 60_000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
}

function getStatusMeta(statusRaw) {
    const status = String(statusRaw || 'active').toLowerCase();
    if (status === 'banned') return { label: 'Banned', className: 'border-white/10 bg-[#FF66D6] text-black' };
    if (status === 'suspended') return { label: 'Suspended', className: 'border-white/10 bg-[#FFD327] text-black' };
    return { label: 'Active', className: 'border-white/10 bg-[#25F2A0] text-black' };
}

function computeCampusCounts(users) {
    return users.reduce((acc, user) => {
        const campus = String(user?.campus || 'unknown');
        acc[campus] = (acc[campus] || 0) + 1;
        return acc;
    }, {});
}

function computeStatusCounts(users) {
    return users.reduce((acc, user) => {
        const status = String(user?.status || 'active');
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});
}

export function UserIntelligenceTable({ users = [], mode = 'admin', currentUserId = null }) {
    // Body filled in next patch chunks (kept small to avoid Windows patch size limits).
    const [campusFilter, setCampusFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [query, setQuery] = useState('');

    const [localUsers, setLocalUsers] = useState(users);
    const [processingUserId, setProcessingUserId] = useState(null);
    const [actionMessage, setActionMessage] = useState('');
    const [actionTone, setActionTone] = useState('success'); // success | danger | warning
    const actionTimeoutRef = useRef(null);

    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [detailsUserId, setDetailsUserId] = useState(null);
    const [detailsUser, setDetailsUser] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState('');
    const detailsRequestRef = useRef(0);

    useEffect(() => {
        setLocalUsers(users);
    }, [users]);

    useEffect(() => {
        return () => {
            if (actionTimeoutRef.current) {
                window.clearTimeout(actionTimeoutRef.current);
            }
        };
    }, []);

    function showActionMessage(message, tone = 'success') {
        setActionMessage(message);
        setActionTone(tone);
        if (actionTimeoutRef.current) {
            window.clearTimeout(actionTimeoutRef.current);
        }
        actionTimeoutRef.current = window.setTimeout(() => {
            setActionMessage('');
        }, 2200);
    }

    const allowedUsers = useMemo(() => {
        if (mode === 'formateur') {
            return localUsers.filter((u) => u?.role === 'student' || u?.role === 'bde_membre');
        }
        return localUsers;
    }, [mode, localUsers]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return allowedUsers.filter((u) => {
            if (campusFilter !== 'all' && String(u?.campus || '') !== campusFilter) return false;
            if (roleFilter !== 'all' && String(u?.role || '') !== roleFilter) return false;
            if (statusFilter !== 'all' && String(u?.status || 'active') !== statusFilter) return false;
            if (!q) return true;

            const haystack = [u?.name, u?.email, u?.class, u?.campus, u?.role, u?.status]
                .map((v) => String(v || '').toLowerCase())
                .join(' ');
            return haystack.includes(q);
        });
    }, [allowedUsers, campusFilter, roleFilter, statusFilter, query]);

    const campusCounts = useMemo(() => computeCampusCounts(allowedUsers), [allowedUsers]);
    const statusCounts = useMemo(() => computeStatusCounts(allowedUsers), [allowedUsers]);

    async function handleOpenDetails(userId) {
        if (!userId) return;
        setIsDetailsOpen(true);
        setDetailsUserId(userId);
        setDetailsUser(null);
        setDetailsError('');
        setDetailsLoading(true);

        const requestId = detailsRequestRef.current + 1;
        detailsRequestRef.current = requestId;

        try {
            const fullUser = await getUser(userId);
            if (detailsRequestRef.current !== requestId) return;
            setDetailsUser(fullUser);
        } catch (error) {
            if (detailsRequestRef.current !== requestId) return;
            setDetailsError(error?.response?.data?.message || 'We could not load this user right now.');
        } finally {
            if (detailsRequestRef.current === requestId) setDetailsLoading(false);
        }
    }

    function handleCloseDetails() {
        setIsDetailsOpen(false);
        setDetailsUserId(null);
        setDetailsUser(null);
        setDetailsLoading(false);
        setDetailsError('');
    }

    async function handleToggleBan(userRow) {
        if (!userRow?.id || mode !== 'admin') return;
        const targetId = userRow.id;
        const isSelf = currentUserId && String(targetId) === String(currentUserId);
        if (isSelf) return;

        const isCurrentlyBanned = String(userRow?.status || 'active') === 'banned';

        setProcessingUserId(targetId);
        try {
            if (isCurrentlyBanned) {
                await restoreUser(targetId);
            } else {
                await banUser(targetId);
            }

            const nextStatus = isCurrentlyBanned ? 'active' : 'banned';
            setLocalUsers((current) =>
                current.map((u) => (String(u?.id) === String(targetId) ? { ...u, status: nextStatus } : u))
            );

            if (detailsUserId && String(detailsUserId) === String(targetId)) {
                setDetailsUser((current) => (current ? { ...current, status: nextStatus } : current));
            }
            showActionMessage(
                isCurrentlyBanned ? `${userRow?.name || 'User'} restored.` : `${userRow?.name || 'User'} banned.`,
                isCurrentlyBanned ? 'success' : 'danger'
            );
        } catch (error) {
            showActionMessage(error?.response?.data?.message || 'We could not update this user right now.', 'warning');
        } finally {
            setProcessingUserId(null);
        }
    }

    return (
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.03)_100%)] p-5 shadow-[5px_5px_0_rgba(0,0,0,0.8)]">
            {actionMessage ? (
                <div className="mb-4 flex justify-end">
                    <div
                        className={[
                            'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] shadow-[6px_6px_0_rgba(0,0,0,0.8)]',
                            actionTone === 'danger'
                                ? 'border-white/10 bg-[#FF66D6] text-black'
                                : actionTone === 'warning'
                                    ? 'border-white/10 bg-[#FFD327] text-black'
                                    : 'border-white/10 bg-[#25F2A0] text-black',
                        ].join(' ')}
                    >
                        {actionMessage}
                    </div>
                </div>
            ) : null}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#25F2A0]">User intelligence</p>
                    <p className="mt-2 text-sm leading-7 text-[#d8cfbd]">
                        {mode === 'admin'
                            ? 'A production-ready view of who is in the platform, segmented by campus, role, and access status.'
                            : 'A teaching view focused on students and BDE members across campuses.'}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#FFF3DC]">
                        {filtered.length} shown
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#d8cfbd]">
                        Active{statusCounts.active ? ` (${statusCounts.active})` : ''}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#d8cfbd]">
                        Banned{statusCounts.banned ? ` (${statusCounts.banned})` : ''}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#d8cfbd]">
                        Suspended{statusCounts.suspended ? ` (${statusCounts.suspended})` : ''}
                    </span>
                    {['nador', 'safi', 'youssoufia'].map((campus) => (
                        <span
                            key={campus}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#d8cfbd]"
                        >
                            {formatCampus(campus)}
                            {campusCounts[campus] ? ` (${campusCounts[campus]})` : ''}
                        </span>
                    ))}
                </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_190px_190px_190px]">
                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search name, email, class..."
                    className="w-full rounded-[1.4rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
                />

                <select
                    value={campusFilter}
                    onChange={(event) => setCampusFilter(event.target.value)}
                    className="w-full rounded-[1.4rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
                >
                    {CAMPUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <select
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value)}
                    className="w-full rounded-[1.4rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
                >
                    {ROLE_OPTIONS.filter((option) =>
                        mode === 'formateur'
                            ? option.value === 'all' || option.value === 'student' || option.value === 'bde_membre'
                            : true
                    ).map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="w-full rounded-[1.4rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
                >
                    {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mt-5 overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#09051a]/70">
                <div className="max-h-[460px] overflow-auto">
                    <table className="w-full min-w-[980px] border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-left text-[11px] font-black uppercase tracking-[0.16em] text-[#d8cfbd]">
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Campus</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Last seen</th>
                                <th className="px-4 py-3">Joined</th>
                                <th className="px-4 py-3 text-right">Reputation</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length ? (
                                filtered.map((u) => {
                                    const statusMeta = getStatusMeta(u?.status);
                                    const isSelf = currentUserId && String(u?.id) === String(currentUserId);
                                    const canManage = mode === 'admin' && !isSelf;
                                    const isBanned = String(u?.status || 'active') === 'banned';

                                    const profileWarnings = [
                                        !u?.photo ? 'No photo' : '',
                                        !String(u?.bio || '').trim() ? 'No bio' : '',
                                    ].filter(Boolean);

                                    return (
                                        <tr
                                            key={u.id}
                                            className="border-b border-white/5 text-sm text-[#FFF3DC] transition hover:bg-white/5"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <UserAvatar name={u?.name} photo={u?.photo} size="sm" />
                                                    <div className="min-w-0">
                                                        <p className="truncate font-black">{u?.name || 'User'}</p>
                                                        <p className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-[#d8cfbd]">
                                                            {u?.email || '--'}
                                                            {u?.class ? ` · ${u.class}` : ''}
                                                        </p>
                                                        {profileWarnings.length ? (
                                                            <div className="mt-2 flex flex-wrap gap-1">
                                                                {profileWarnings.slice(0, 2).map((warning) => (
                                                                    <span
                                                                        key={warning}
                                                                        className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#FFD327]"
                                                                    >
                                                                        {warning}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={[
                                                        'inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em]',
                                                        statusMeta.className,
                                                    ].join(' ')}
                                                >
                                                    {statusMeta.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#FFF3DC]">
                                                    {formatCampus(u?.campus)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#d8cfbd]">
                                                    {formatRole(u?.role)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-black text-[#d8cfbd]">
                                                <span title={u?.last_seen ? formatDate(u.last_seen) : ''}>
                                                    {formatRelativeTime(u?.last_seen)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-black text-[#d8cfbd]">{formatDate(u?.created_at)}</td>
                                            <td className="px-4 py-3 text-right font-black text-[#25F2A0]">
                                                {Number(u?.reputation || 0).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenDetails(u.id)}
                                                        className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#FFF3DC] transition hover:bg-white/10"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleBan(u)}
                                                        disabled={!canManage || processingUserId === u.id}
                                                        title={
                                                            isSelf
                                                                ? 'You cannot ban your own account.'
                                                                : mode !== 'admin'
                                                                    ? 'Only admins can ban/unban users.'
                                                                    : ''
                                                        }
                                                        className={[
                                                            'rounded-full border px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] transition',
                                                            canManage
                                                                ? isBanned
                                                                    ? 'border-white/10 bg-[#25F2A0] text-black hover:brightness-110'
                                                                    : 'border-white/10 bg-[#FF66D6] text-black hover:brightness-110'
                                                                : 'cursor-not-allowed border-white/10 bg-white/5 text-white/35',
                                                        ].join(' ')}
                                                    >
                                                        {isBanned ? 'Unban' : 'Ban'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-[#d8cfbd]">
                                        No users match these filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isDetailsOpen}
                onClose={handleCloseDetails}
                eyebrow="User details"
                title={detailsUser?.name || (detailsLoading ? 'Loading user...' : 'User details')}
                description="Full account snapshot for decisions: profile, reputation, badges, interests, and access status."
                size="sm"
                ariaLabel="Close user details"
                footer={
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={handleCloseDetails}
                            className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#FFF3DC] transition hover:bg-white/10"
                        >
                            Close
                        </button>
                        {mode === 'admin' && detailsUserId ? (
                            <button
                                type="button"
                                onClick={() => {
                                    const row = localUsers.find((u) => String(u?.id) === String(detailsUserId));
                                    handleToggleBan(row || { id: detailsUserId, status: detailsUser?.status, name: detailsUser?.name });
                                }}
                                disabled={
                                    processingUserId === detailsUserId ||
                                    (currentUserId && String(detailsUserId) === String(currentUserId))
                                }
                                className={[
                                    'rounded-full border border-white/10 px-5 py-2 text-xs font-black uppercase tracking-[0.16em] transition',
                                    String(detailsUser?.status || 'active') === 'banned'
                                        ? 'bg-[#25F2A0] text-black hover:brightness-110'
                                        : 'bg-[#FF66D6] text-black hover:brightness-110',
                                ].join(' ')}
                            >
                                {String(detailsUser?.status || 'active') === 'banned' ? 'Unban user' : 'Ban user'}
                            </button>
                        ) : null}
                    </div>
                }
            >
                {detailsLoading ? (
                    <p className="text-sm font-bold text-[#d8cfbd]">Loading user details...</p>
                ) : detailsError ? (
                    <p className="text-sm font-bold text-[#FFD327]">{detailsError}</p>
                ) : detailsUser ? (
                    <div className="grid gap-4">
                        <div className="flex flex-wrap items-start justify-between gap-4 rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <UserAvatar name={detailsUser?.name} photo={detailsUser?.photo} size="md" />
                                <div className="min-w-0">
                                    <p className="truncate text-lg font-black text-[#FFF3DC]">{detailsUser?.name}</p>
                                    <p className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-[#d8cfbd]">
                                        {detailsUser?.email || '--'}
                                        {detailsUser?.class ? ` · ${detailsUser.class}` : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center justify-end gap-2">
                                <span
                                    className={[
                                        'rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em]',
                                        getStatusMeta(detailsUser?.status).className,
                                    ].join(' ')}
                                >
                                    {getStatusMeta(detailsUser?.status).label}
                                </span>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#d8cfbd]">
                                    {formatRole(detailsUser?.role)}
                                </span>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#d8cfbd]">
                                    {formatCampus(detailsUser?.campus)}
                                </span>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                    {Number(detailsUser?.reputation || 0).toLocaleString()} rep
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-3 rounded-[1.6rem] border border-white/10 bg-[#05020d] p-4 text-sm text-[#d8cfbd]">
                            <div className="flex flex-wrap gap-3">
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#FFF3DC]">
                                    Joined {formatDate(detailsUser?.created_at)}
                                </span>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#FFF3DC]">
                                    Last seen {formatRelativeTime(detailsUser?.last_seen)}
                                </span>
                            </div>
                            {String(detailsUser?.bio || '').trim() ? (
                                <p className="leading-7">{detailsUser.bio}</p>
                            ) : (
                                <p className="leading-7 text-white/40">No bio provided yet.</p>
                            )}
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#25F2A0]">Badges</p>
                                {Array.isArray(detailsUser?.badges) && detailsUser.badges.length ? (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {detailsUser.badges.slice(0, 12).map((badge) => (
                                            <span
                                                key={badge.id}
                                                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#FFF3DC]"
                                            >
                                                {badge?.name || 'Badge'}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-3 text-sm leading-7 text-[#d8cfbd]">No badges earned yet.</p>
                                )}
                            </div>
                            <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#25F2A0]">Interests</p>
                                {Array.isArray(detailsUser?.interests) && detailsUser.interests.length ? (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {detailsUser.interests.slice(0, 14).map((interest) => (
                                            <span
                                                key={interest.id}
                                                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#d8cfbd]"
                                            >
                                                {interest?.name || 'Interest'}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-3 text-sm leading-7 text-[#d8cfbd]">No interests selected yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm font-bold text-[#d8cfbd]">Select a user to view details.</p>
                )}
            </Modal>
        </div>
    );
}
