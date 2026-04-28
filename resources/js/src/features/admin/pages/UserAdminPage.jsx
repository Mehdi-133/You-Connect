import { useState } from 'react';
import { SectionCard } from '../../../shared/components/SectionCard';
import { useAuth } from '../../../hooks/useAuth';
import { isAdmin } from '../../../shared/utils/roles';
import { inviteUser } from '../../../services/api/users.service';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';

const ROLE_OPTIONS = [
    { value: 'student', label: 'Student' },
    { value: 'bde_membre', label: 'BDE member' },
    { value: 'formateur', label: 'Formateur' },
    { value: 'admin', label: 'Admin' },
    { value: 'visitor', label: 'Visitor' },
];

const CAMPUS_OPTIONS = [
    { value: 'nador', label: 'Nador' },
    { value: 'safi', label: 'Safi' },
    { value: 'youssoufia', label: 'Youssoufia' },
];

const CLASS_OPTIONS = [
    { value: 'dev room', label: 'Dev room' },
    { value: 'dar hamza', label: 'Dar hamza' },
    { value: 'JavaDore', label: 'JavaDore' },
    { value: 'ligue.js', label: 'ligue.js' },
];

function createEmptyForm() {
    return {
        first_name: '',
        last_name: '',
        email: '',
        role: 'student',
        campus: 'nador',
        class: 'dev room',
        photo: '',
        bio: '',
    };
}

export function UserAdminPage() {
    const { user } = useAuth();
    const [form, setForm] = useState(createEmptyForm());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!isAdmin(user)) {
        return (
            <ErrorState
                eyebrow="Admin"
                title="Access restricted"
                description="Only admins can manage users."
                helperText="Switch to an admin account to use this page."
            />
        );
    }

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');
        setFieldErrors({});

        try {
            const payload = {
                first_name: form.first_name,
                last_name: form.last_name,
                email: form.email,
                role: form.role,
                campus: form.campus,
                class: form.class,
                photo: form.photo ? form.photo : null,
                bio: form.bio ? form.bio : null,
            };

            await inviteUser(payload);
            setSuccess('User created. Invitation email sent with a temporary password.');
            setForm(createEmptyForm());
        } catch (requestError) {
            setError(requestError?.response?.data?.message || 'We could not create this user right now.');
            setFieldErrors(requestError?.response?.data?.errors || {});
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="grid gap-6">
            <SectionCard
                eyebrow="Admin"
                title="User management"
                description="Create users like register. We generate a password and email it to them automatically."
                className="hero-gradient"
            >
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                First name
                            </label>
                            <input
                                name="first_name"
                                value={form.first_name}
                                onChange={handleChange}
                                className="w-full rounded-[1.4rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
                                placeholder="Amina"
                            />
                            {fieldErrors.first_name ? (
                                <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.first_name[0]}</p>
                            ) : null}
                        </div>
                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                Last name
                            </label>
                            <input
                                name="last_name"
                                value={form.last_name}
                                onChange={handleChange}
                                className="w-full rounded-[1.4rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
                                placeholder="Student"
                            />
                            {fieldErrors.last_name ? (
                                <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.last_name[0]}</p>
                            ) : null}
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                            Email
                        </label>
                        <input
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full rounded-[1.4rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
                            placeholder="amina@youconnect.test"
                        />
                        {fieldErrors.email ? (
                            <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.email[0]}</p>
                        ) : null}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                Role
                            </label>
                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                className="w-full rounded-[1.4rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
                            >
                                {ROLE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.role ? (
                                <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.role[0]}</p>
                            ) : null}
                        </div>
                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                Campus
                            </label>
                            <select
                                name="campus"
                                value={form.campus}
                                onChange={handleChange}
                                className="w-full rounded-[1.4rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
                            >
                                {CAMPUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.campus ? (
                                <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.campus[0]}</p>
                            ) : null}
                        </div>
                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                Class
                            </label>
                            <select
                                name="class"
                                value={form.class}
                                onChange={handleChange}
                                className="w-full rounded-[1.4rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
                            >
                                {CLASS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.class ? (
                                <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.class[0]}</p>
                            ) : null}
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                Photo URL (optional)
                            </label>
                            <input
                                name="photo"
                                value={form.photo}
                                onChange={handleChange}
                                className="w-full rounded-[1.4rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
                                placeholder="https://..."
                            />
                            {fieldErrors.photo ? (
                                <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.photo[0]}</p>
                            ) : null}
                        </div>
                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                Bio (optional)
                            </label>
                            <input
                                name="bio"
                                value={form.bio}
                                onChange={handleChange}
                                className="w-full rounded-[1.4rem] border border-white/10 bg-[#05020d] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
                                placeholder="Short intro..."
                            />
                            {fieldErrors.bio ? (
                                <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.bio[0]}</p>
                            ) : null}
                        </div>
                    </div>

                    {error ? <p className="text-sm font-bold text-[#FFD327]">{error}</p> : null}
                    {success ? <p className="text-sm font-bold text-[#25F2A0]">{success}</p> : null}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="festival-card rounded-full border-2 border-black bg-[#25F2A0] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[6px_6px_0_rgba(0,0,0,0.85)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? 'Sending...' : 'Create & send email'}
                        </button>
                    </div>
                </form>
            </SectionCard>
        </div>
    );
}

