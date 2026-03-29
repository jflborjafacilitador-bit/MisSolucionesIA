import { useState, useEffect } from 'react';

interface DemoPreviewProps {
    children: React.ReactNode;
    visibleHeight?: number;
}

const INNER_W = 1200;
const INNER_H = 800;

/**
 * DemoPreview — renderiza demos en miniatura con dimensiones fijas.
 *
 * Fix Recharts width=-1: Recharts usa ResizeObserver que reporta -1
 * en el primer render (antes de que el browser complete el layout).
 * Solución: retrasar el mount de `children` hasta después del primer
 * requestAnimationFrame — cuando el browser ya completó el layout y
 * ResizeObserver puede medir dimensiones reales desde el primer callback.
 */
export default function DemoPreview({ children, visibleHeight = 160 }: DemoPreviewProps) {
    const [mounted, setMounted] = useState(false);
    const scale = visibleHeight / INNER_H;

    useEffect(() => {
        // Esperar un frame completo antes de montar los hijos
        // para que el browser haya completado el layout del contenedor
        const raf = requestAnimationFrame(() => {
            setMounted(true);
        });
        return () => cancelAnimationFrame(raf);
    }, []);

    return (
        <div
            className="w-full relative overflow-hidden bg-background"
            style={{ height: visibleHeight }}
        >
            {mounted && (
                <div
                    className="absolute top-0 left-0 pointer-events-none"
                    style={{
                        width: INNER_W,
                        height: INNER_H,
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                    }}
                >
                    {children}
                </div>
            )}
        </div>
    );
}
