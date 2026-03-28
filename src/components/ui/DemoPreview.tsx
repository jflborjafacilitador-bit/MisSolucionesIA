/**
 * DemoPreview — Contenedor escalado para mostrar demos en miniatura.
 *
 * Problema: Recharts usa ResizeObserver para medir su contenedor.
 * Cuando el elemento está dentro de `overflow:hidden` + `transform:scale`,
 * el observer puede reportar width/height = -1 y los charts no renderizan.
 *
 * Solución: Fijamos dimensiones absolutas en píxeles (no en %) para que
 * ResizeObserver siempre tenga un valor válido, independientemente de
 * la transformación visual.
 */

interface DemoPreviewProps {
    children: React.ReactNode;
    /** Altura visible del área de preview (px). Default: 160 */
    visibleHeight?: number;
}

// La demo se renderiza a 1200×800px y se escala a un ratio fijo
const INNER_W = 1200;
const INNER_H = 800;

export default function DemoPreview({ children, visibleHeight = 160 }: DemoPreviewProps) {
    const scale = visibleHeight / INNER_H;

    return (
        // Contenedor externo: define el espacio visible en el documento
        <div
            className="w-full relative overflow-hidden bg-background"
            style={{ height: visibleHeight }}
        >
            {/* Contenedor interno: dimensiones fijas reales, luego escalado */}
            <div
                className="absolute top-0 left-0 pointer-events-none"
                style={{
                    width:  INNER_W,
                    height: INNER_H,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                }}
            >
                {children}
            </div>
        </div>
    );
}
