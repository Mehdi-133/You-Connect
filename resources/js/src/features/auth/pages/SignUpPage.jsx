import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../../services/api/auth.service';
import { useAuth } from '../../../hooks/useAuth';

const CAMPUS_OPTIONS = [
    { value: 'nador', label: 'Nador' },
    { value: 'safi', label: 'Safi' },
    { value: 'youssoufia', label: 'Youssoufia' },
];

function MiniSpark({ className = '' }) {
    return (
        <div className={`pointer-events-none absolute ${className}`}>
            <div className="relative h-8 w-8">
                <span className="absolute left-1/2 top-0 h-full w-2 -translate-x-1/2 rounded-full bg-[#25F2A0]" />
                <span className="absolute left-0 top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-[#25F2A0]" />
            </div>
        </div>
    );
}

export function SignUpPage() {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [form, setForm] = useState({
        name: '',
        email: '',
        campus: 'nador',
        password: '',
        password_confirmation: '',
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const response = await register(form);
            signIn(response);
            navigate('/app', { replace: true });
        } catch (requestError) {
            const message =
                requestError.response?.data?.message ||
                'Unable to create an account right now. Please try again.';
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-12">
            <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="surface festival-card relative mx-auto w-full max-w-xl overflow-hidden rounded-[2.8rem] p-8 md:p-10">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(37,242,160,0.16),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(255,102,214,0.14),transparent_45%)]" />

                    <p className="relative inline-flex rounded-full bg-[#25F2A0] px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]">
                        Create account
                    </p>
                    <h1 className="relative mt-6 font-display text-6xl font-extrabold leading-none text-[#FFF3DC]">
                        Join YouConnect
                    </h1>
                    <p className="relative mt-4 max-w-lg text-base leading-8 text-[rgb(var(--fg-muted))]">
                        Pick your campus, build your profile, and start contributing through questions, blogs, and community activity.
                    </p>

                    <form onSubmit={handleSubmit} className="relative mt-10 grid gap-4">
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="festival-card rounded-[1.7rem] border border-[rgb(var(--line))] bg-[rgb(var(--bg-panel))] px-5 py-4 text-lg outline-none placeholder:text-[rgb(var(--fg-muted))]"
                            placeholder="Full name"
                            autoComplete="name"
                            required
                        />
                        <input
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="festival-card rounded-[1.7rem] border border-[rgb(var(--line))] bg-[rgb(var(--bg-panel))] px-5 py-4 text-lg outline-none placeholder:text-[rgb(var(--fg-muted))]"
                            placeholder="Email"
                            type="email"
                            autoComplete="email"
                            required
                        />

                        <div className="grid gap-2">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#25F2A0]">
                                Campus
                            </p>
                            <select
                                name="campus"
                                value={form.campus}
                                onChange={handleChange}
                                className="festival-card rounded-[1.7rem] border border-[rgb(var(--line))] bg-[rgb(var(--bg-panel))] px-5 py-4 text-lg text-[#FFF3DC] outline-none"
                                required
                            >
                                {CAMPUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <input
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="festival-card rounded-[1.7rem] border border-[rgb(var(--line))] bg-[rgb(var(--bg-panel))] px-5 py-4 text-lg outline-none placeholder:text-[rgb(var(--fg-muted))]"
                            placeholder="Password"
                            type="password"
                            autoComplete="new-password"
                            required
                        />
                        <input
                            name="password_confirmation"
                            value={form.password_confirmation}
                            onChange={handleChange}
                            className="festival-card rounded-[1.7rem] border border-[rgb(var(--line))] bg-[rgb(var(--bg-panel))] px-5 py-4 text-lg outline-none placeholder:text-[rgb(var(--fg-muted))]"
                            placeholder="Confirm password"
                            type="password"
                            autoComplete="new-password"
                            required
                        />

                        {error ? (
                            <p className="rounded-[1.4rem] border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">
                                {error}
                            </p>
                        ) : null}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="festival-card rounded-[1.8rem] border-2 border-black bg-[linear-gradient(90deg,#25F2A0_0%,#29CFFF_35%,#A34DFF_70%,#FFD327_100%)] px-5 py-4 font-black uppercase tracking-[0.24em] text-black disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSubmitting ? 'Creating...' : 'Create account'}
                        </button>
                    </form>
                </div>

                <div className="surface festival-card hero-gradient relative hidden overflow-hidden rounded-[2.8rem] p-10 lg:block">
                    <MiniSpark className="right-12 top-12 rotate-[10deg]" />
                    <MiniSpark className="left-16 top-44 -rotate-[18deg] scale-75" />

                    <span className="inline-flex rounded-full bg-[#FF66D6] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]">
                        Community perks
                    </span>
                    <h2 className="mt-8 max-w-4xl font-display text-[5.1rem] font-extrabold leading-[0.9] tracking-tight">
                        <span className="text-[#FFF3DC]">Earn</span>{' '}
                        <span className="text-[#FFD327]">your</span>
                        <br />
                        <span className="text-[#29CFFF]">place</span>{' '}
                        <span className="text-[#25F2A0]">in</span>{' '}
                        <span className="text-[#FF66D6]">the feed.</span>
                    </h2>
                    <div className="mt-10 grid gap-4">
                        {[
                            ['Ask technical questions and get fast peer support.', 'bg-[#FFD327]'],
                            ['Publish blogs and get approved by formateurs.', 'bg-[#29CFFF]'],
                            ['Unlock badges, streaks, and reputation over time.', 'bg-[#25F2A0]'],
                        ].map(([item, tone], index) => (
                            <div
                                key={item}
                                className={`${tone} festival-card rounded-[1.9rem] border-2 p-5 text-black ${
                                    index === 1 ? 'translate-x-4' : index === 2 ? '-translate-x-2' : ''
                                }`}
                            >
                                <p className="text-sm font-black uppercase tracking-[0.16em]">Feature {index + 1}</p>
                                <p className="mt-3 text-base font-semibold leading-7">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

