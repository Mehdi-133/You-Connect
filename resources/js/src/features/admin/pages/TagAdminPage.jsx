import { useEffect, useMemo, useState } from 'react';
import { SectionCard } from '../../../shared/components/SectionCard';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';
import { LoadingState } from '../../../shared/ui/feedback/LoadingState';
import { createTag, deleteTag, getTags, updateTag } from '../../../services/api/tags.service';

function createEmptyTagForm() {
    return {
        name: '',
        description: '',
    };
}

export function TagAdminPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [tags, setTags] = useState([]);
    const [form, setForm] = useState(createEmptyTagForm());
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [editingTagId, setEditingTagId] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function loadTags() {
            setIsLoading(true);
            setError('');

            try {
                const response = await getTags();

                if (!isMounted) {
                    return;
                }

                setTags(response?.data || []);
            } catch (requestError) {
                if (!isMounted) {
                    return;
                }

                setError(
                    requestError.response?.data?.message ||
                    'We could not load tags right now.'
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadTags();

        return () => {
            isMounted = false;
        };
    }, []);

    const sortedTags = useMemo(() => {
        return [...tags].sort((left, right) => String(left.name || '').localeCompare(String(right.name || '')));
    }, [tags]);

    function handleInputChange(event) {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    function startCreate() {
        setEditingTagId(null);
        setForm(createEmptyTagForm());
        setFieldErrors({});
        setFormError('');
        setSuccessMessage('');
    }

    function startEdit(tag) {
        setEditingTagId(tag.id);
        setForm({
            name: tag.name || '',
            description: tag.description || '',
        });
        setFieldErrors({});
        setFormError('');
        setSuccessMessage('');
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setIsSaving(true);
        setFormError('');
        setFieldErrors({});
        setSuccessMessage('');

        try {
            if (editingTagId) {
                const updated = await updateTag(editingTagId, form);

                setTags((current) =>
                    current.map((tag) => (tag.id === editingTagId ? { ...tag, ...updated } : tag))
                );
                setSuccessMessage('Tag updated.');
            } else {
                const created = await createTag(form);
                setTags((current) => [created, ...current]);
                setSuccessMessage('Tag created.');
                setForm(createEmptyTagForm());
            }
        } catch (requestError) {
            const nextFieldErrors = requestError.response?.data?.errors || {};
            setFieldErrors(nextFieldErrors);
            setFormError(
                Object.keys(nextFieldErrors).length
                    ? ''
                    : requestError.response?.data?.message ||
                      'We could not save this tag right now.'
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete(tagId) {
        setSuccessMessage('');
        setFormError('');

        try {
            await deleteTag(tagId);
            setTags((current) => current.filter((tag) => tag.id !== tagId));

            if (editingTagId === tagId) {
                startCreate();
            }
        } catch (requestError) {
            setFormError(
                requestError.response?.data?.message ||
                'We could not delete this tag right now.'
            );
        }
    }

    if (isLoading) {
        return (
            <LoadingState
                eyebrow="Admin"
                title="Loading tags"
                description="We are pulling your topic labels and question tag metadata."
            />
        );
    }

    if (error) {
        return (
            <ErrorState
                eyebrow="Admin"
                title="Tags unavailable"
                description={error}
                helperText="Confirm the backend is running and that your account has permission to manage tags."
            />
        );
    }

    return (
        <div className="grid gap-6">
            <SectionCard
                eyebrow="Admin"
                title="Tags"
                description="Create the topics that users can attach to questions (Laravel, React, Sanctum, and more)."
                className="hero-gradient overflow-hidden"
            >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(41,207,255,0.18),transparent_26%),radial-gradient(circle_at_top_right,rgba(255,211,39,0.14),transparent_26%)]" />

                <form onSubmit={handleSubmit} className="relative mt-6 grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[6px_6px_0_rgba(0,0,0,0.85)]">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                            {editingTagId ? 'Edit tag' : 'Create tag'}
                        </p>
                        {editingTagId ? (
                            <button
                                type="button"
                                onClick={startCreate}
                                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#FFF3DC] transition hover:bg-white/10"
                            >
                                New tag
                            </button>
                        ) : null}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleInputChange}
                                placeholder="Laravel"
                                className="w-full rounded-[1.4rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none"
                            />
                            {fieldErrors.name ? (
                                <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.name[0]}</p>
                            ) : null}
                        </div>
                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                Description (optional)
                            </label>
                            <input
                                type="text"
                                name="description"
                                value={form.description}
                                onChange={handleInputChange}
                                placeholder="Authentication, routing, controllers, and policies"
                                className="w-full rounded-[1.4rem] border border-white/10 bg-[#0B0126] px-4 py-3 text-sm text-white outline-none"
                            />
                            {fieldErrors.description ? (
                                <p className="mt-2 text-xs font-bold text-[#FFD327]">{fieldErrors.description[0]}</p>
                            ) : null}
                        </div>
                    </div>

                    {formError ? <p className="text-sm font-bold text-[#FFD327]">{formError}</p> : null}
                    {successMessage ? <p className="text-sm font-bold text-[#25F2A0]">{successMessage}</p> : null}

                    <div>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="festival-card rounded-full border-2 border-black bg-[#25F2A0] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSaving ? 'Saving...' : editingTagId ? 'Update tag' : 'Create tag'}
                        </button>
                    </div>
                </form>
            </SectionCard>

            <SectionCard
                eyebrow="Catalog"
                title="Available tags"
                description="These tags will appear in the question form as topics."
            >
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {sortedTags.map((tag) => (
                        <div key={tag.id} className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4 shadow-[5px_5px_0_rgba(0,0,0,0.8)]">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-black text-[#FFF3DC]">{tag.name}</p>
                                    <p className="mt-1 text-xs text-[#d8cfbd] line-clamp-2">{tag.description || 'No description.'}</p>
                                </div>
                                <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-white/5 px-2 py-1 text-[10px] font-black text-[#FFF3DC]">
                                    {tag.questions_count ?? 0}
                                </span>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => startEdit(tag)}
                                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#FFF3DC] transition hover:bg-white/10"
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(tag.id)}
                                    className="rounded-full border border-[#ff8f8f]/40 bg-[#2a0b15] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#ffb8b8] transition hover:bg-[#39101d]"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCard>
        </div>
    );
}
