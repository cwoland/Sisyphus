import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../shared/lib/axios.js';
import { todayApi, safeFormat } from '../../shared/lib/date.js';
import { Button } from '../../shared/ui/Button.jsx';

const base = '/body/photos';
const dateOf = (name) => safeFormat(name.slice(0, 10), 'dd.MM.yyyy');

async function jpeg(file) {
    const url = URL.createObjectURL(file);
    try {
        const image = new Image();
        image.src = url;
        await image.decode();

        const scale = Math.min(1, 1440 / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const context = canvas.getContext('2d');
        context.fillStyle = '#fff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8));
        if (!blob || blob.size > 2 * 1024 * 1024) throw new Error();
        return blob;
    } catch {
        throw new Error('Не удалось подготовить снимок. Попробуй JPEG или PNG форматы.');
    } finally {
        URL.revokeObjectURL(url);
    }
}

function Photo({ owner, name }) {
    const query = useQuery({
        queryKey: ['progress-image', owner, name],
        queryFn: async ({ signal }) => (
            await api.get(base + '/' + name, {
                responseType: 'blob', signal, _ownerId: owner,
            })
        ).data,
        staleTime: Infinity,
        gcTime: 0,
    });

    const [url, setUrl] = useState('');
    useEffect(() => {
        if (!query.data) return;
        const next = URL.createObjectURL(query.data);
        setUrl(next);
        return () => URL.revokeObjectURL(next);
    }, [query.data]);

    return (
        <figure className="min-w-0">
            {url ? (
                <img
                    src={url}
                    alt={'Фото прогресса за ' + dateOf(time)}
                    className="aspect-[3/4] w-full rounded-xl bg-surface-2 object-contain"
                />
            ) : (
                <div className="grid aspect-[3/4] place-items-center rounded-xl bg-surface-2 text-xs">
                    {query.isError
                        ? <button onClick={() => query.refetch()}>Повторить загрузку</button>
                        : 'Загрузка...'}
                </div>
            )}
            <figcaption className="mt-1 text-sm">{dateOf(name)}</figcaption>
        </figure>
    );
}

export function ProgressPhotos({ owner }) {
    const qc = useQueryClient();
    const [date, setDate] = useState(todayApi);
    const [page, setPage] = useState(0);
    const [selected, setSelected] = useState([]);
    const key = ['progress-photos', owner];

    const list = useQuery({
        queryKey: [...key, page],
        queryFn: async ({ signal }) => (
            await api.get(base, { params: { page }, signal, _ownerId: owner })
        ).data,
    });

    const write = useMutation({
        mutationFn: async ({ file, name }) => {
            if (!file) return api.delete(base + '/' + name, { _ownerId: owner });
            const blob = await jpeg(file);
            return api.put(base + '/' + name, blob, { _ownerId: owner, headers: { 'Content-Type': 'image/jpeg' }});
        },
        onSuccess: async (_, { file, name }) => {
            if (file) {
                setPage(0);
            } else {
                setSelected((prev) => prev.filter((n) => n != name));
                if (list.data?.names.length === 1) setPage((p) => Math.max(0, p - 1));
            }
            await qc.invalidateQueries({ queryKey: key });
        },
    });

    function upload(event) {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (file && date){
            write.mutate({ file, name: date + '_' + crypto.randomUUID() + '.jpg' });
        }
    }

    return (
        <section className="epic-panel space-y-4 p-4">
            <h2 className="font-display text-xl font-bold">Фотографии прогресса</h2>

            <div className="flex flex-wrap items-end gap-3">
                <label className="min-w-0 text-sm">Дата снимка
                <input
                    className="block max-w-full rounded-lg border border-border bg-surface p-2 text-base"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
                </label>
                <label className="relative cursor-pointer rounded-xl bg-cta px-4 py-3 text-sm text-on-cta focus-within:ring-2">
                    {write.isPending ? 'Сохраняем...' : 'Добавить фото'}
                    <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        disabled={!date || write.isPending}
                        onChange={upload}
                    />
                </label>
            </div>

            {write.isError && (
                <p role="alert">
                    {write.error.response?.data?.message || write.error.message}
                </p>
            )}
            {list.isError && (
                <Button onClick={() => list.refetch()} variant="secondary">Повторить загрузку</Button>
            )}
            {list.isLoading && <p role="status">Загружаем...</p>}
            {list.data?.names.length === 0 && <p>Снимков пока нет.</p>}

            {selected.length === 2 && (
                <div>
                    <h3 className="mb-2 font-semibold">Сравнение</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[...selected].sort().map((name) => (
                            <Photo key={name} owner={owner} name={name} />
                        ))}
                    </div>
                    <Button variant="ghost" onClick={() => setSelected()}>
                        Сбросить сравнение
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {list.data?.names.map((name) => (
                    <div key={name} className="min-w-0">
                        <Photo owner={owner} name={name} />
                        <button
                            className="block min-h-11 text-sm text-accent"
                            aria-pressed={selected.includes(name)}
                            disabled={!selected.includes(name) && selected.length === 2}
                            onClick={() => setSelected((prev) => prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name])}
                        >
                            {selected.includes(name) ? 'Выбрано' : 'Сравнить'}
                        </button>
                        <button
                            className="min-h-11 text-xs text-danger"
                            disabled={write.isPending}
                            onClick={() => {
                                if (window.confirm('Удалить фото за ' + dateOf(name) + '?')) {
                                    write.mutate({ name }); 
                                }
                            }}
                        >
                            Удалить
                        </button>
                    </div>
                ))}
            </div>

            {(page > 0 || list.data?.hasNext) && (
                <div className="flex gap-2">
                    <Button variant="secondary" disabled={!list.data?.hasNext} onClick={() => setPage(page + 1)}>
                        Дальше
                    </Button>
                </div>
            )}
        </section>
    );
}