import { useRef, useState, useEffect } from 'react';

interface Props {
    children: (width: number, height: number) => React.ReactNode;
    className?: string;
}

/**
 * SizedContainer — mide su propio tamaño y pasa w/h como números
 * explícitos al children. Elimina el warning de Recharts width=-1
 * porque los charts nunca reciben dimensiones indefinidas.
 */
export default function SizedContainer({ children, className = 'w-full h-full' }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState<{ w: number; h: number } | null>(null);

    useEffect(() => {
        if (!ref.current) return;
        const ro = new ResizeObserver(entries => {
            // contentBoxSize da dimensiones CSS lógicas (sin transformaciones visuales)
            const entry = entries[0];
            const w = entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
            const h = entry.contentBoxSize?.[0]?.blockSize  ?? entry.contentRect.height;
            if (w > 0 && h > 0) setSize({ w, h });
        });
        ro.observe(ref.current);
        return () => ro.disconnect();
    }, []);

    return (
        <div ref={ref} className={className}>
            {size && children(size.w, size.h)}
        </div>
    );
}
