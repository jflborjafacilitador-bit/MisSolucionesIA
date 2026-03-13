import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';

type CotizacionStatus = 'por_atender' | 'en_proceso' | 'atendida' | 'descartada';

interface Cotizacion {
    id: string;
    nombre: string;
    proyecto: string;
    status?: CotizacionStatus;
    precioCotizado?: number | null;
}

interface StatusConfig {
    label: string;
    color: string;
    dot: string;
    colBg: string;
    header: string;
}

const statusConfig: Record<CotizacionStatus, StatusConfig> = {
    por_atender: { label: 'Por Atender', color: 'bg-amber-50 dark:bg-amber-950/20 border-amber-300/40 text-amber-700', dot: 'bg-amber-500', colBg: 'bg-amber-50/50 dark:bg-amber-950/10', header: 'border-amber-400' },
    en_proceso: { label: 'En Proceso', color: 'bg-blue-50  dark:bg-blue-950/20  border-blue-300/40  text-blue-700', dot: 'bg-blue-500', colBg: 'bg-blue-50/50  dark:bg-blue-950/10', header: 'border-blue-400' },
    atendida: { label: 'Atendida', color: 'bg-green-50 dark:bg-green-950/20 border-green-300/40 text-green-700', dot: 'bg-green-500', colBg: 'bg-green-50/50 dark:bg-green-950/10', header: 'border-green-400' },
    descartada: { label: 'Descartada', color: 'bg-muted/40 border-border/40 text-muted-foreground', dot: 'bg-gray-400', colBg: 'bg-muted/20', header: 'border-gray-400' },
};

const COLUMNS: CotizacionStatus[] = ['por_atender', 'en_proceso', 'atendida', 'descartada'];

// ── Draggable Card ──────────────────────────────────────────────────────────
function KanbanCard({ c, onSelect, onDelete, isSelected }: {
    c: Cotizacion;
    onSelect: (c: Cotizacion) => void;
    onDelete: (id: string) => void;
    isSelected: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: c.id, data: { card: c } });
    const st = statusConfig[c.status || 'por_atender'];

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform) }}
            className={`rounded-lg border bg-card shadow-sm transition-all cursor-grab active:cursor-grabbing select-none
                ${isDragging ? 'opacity-40 scale-95' : ''}
                ${isSelected ? 'ring-2 ring-primary/50 border-primary/30' : 'border-border/50 hover:border-border'}
            `}
            {...attributes}
            {...listeners}
        >
            <div className="p-3" onClick={() => onSelect(c)}>
                <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    {c.precioCotizado && (
                        <span className="text-[10px] text-green-600 font-mono font-bold">${c.precioCotizado.toLocaleString()} MXN</span>
                    )}
                </div>
                <p className="font-semibold text-sm leading-tight">{c.nombre}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{c.proyecto}</p>
            </div>
            <div className="flex justify-end px-2 pb-2">
                <button
                    onPointerDown={e => e.stopPropagation()}
                    onClick={e => { e.stopPropagation(); onDelete(c.id); }}
                    className="p-1 text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                >
                    <FiTrash2 className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}

// ── Droppable Column ────────────────────────────────────────────────────────
function KanbanColumn({ status, cards, onSelect, onDelete, selectedId }: {
    status: CotizacionStatus;
    cards: Cotizacion[];
    onSelect: (c: Cotizacion) => void;
    onDelete: (id: string) => void;
    selectedId?: string;
}) {
    const { setNodeRef, isOver } = useDroppable({ id: status });
    const cfg = statusConfig[status];

    return (
        <div className={`flex flex-col rounded-xl border-2 ${cfg.header} ${cfg.colBg} min-h-[400px] w-72 flex-shrink-0 transition-all ${isOver ? 'ring-2 ring-primary/40 scale-[1.01]' : ''}`}>
            <div className="p-3 border-b border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                    <span className="font-semibold text-sm">{cfg.label}</span>
                </div>
                <span className="text-xs font-bold bg-background/70 border border-border/40 px-2 py-0.5 rounded-full">{cards.length}</span>
            </div>
            <div ref={setNodeRef} className="flex-1 p-2 space-y-2 overflow-y-auto">
                {cards.length === 0 && (
                    <div className={`border-2 border-dashed border-border/40 rounded-lg h-20 flex items-center justify-center text-xs text-muted-foreground transition-all ${isOver ? 'border-primary/40 bg-primary/5' : ''}`}>
                        Arrastra aquí
                    </div>
                )}
                {cards.map(c => (
                    <KanbanCard
                        key={c.id}
                        c={c}
                        onSelect={onSelect}
                        onDelete={onDelete}
                        isSelected={selectedId === c.id}
                    />
                ))}
            </div>
        </div>
    );
}

// ── Main Kanban Board ───────────────────────────────────────────────────────
interface KanbanBoardProps {
    cotizaciones: Cotizacion[];
    selectedId?: string;
    onSelect: (c: Cotizacion) => void;
    onDelete: (id: string) => void;
    onStatusChange: (id: string, newStatus: CotizacionStatus) => void;
}

export default function KanbanBoard({ cotizaciones, selectedId, onSelect, onDelete, onStatusChange }: KanbanBoardProps) {
    const [activeCard, setActiveCard] = useState<Cotizacion | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveCard((event.active.data.current as { card: Cotizacion }).card);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { over, active } = event;
        setActiveCard(null);
        if (!over) return;

        const card = (active.data.current as { card: Cotizacion }).card;
        const newStatus = over.id as CotizacionStatus;

        if (card.status !== newStatus) {
            onStatusChange(card.id, newStatus);
        }
    };

    const byStatus = (status: CotizacionStatus) =>
        cotizaciones.filter(c => (c.status || 'por_atender') === status);

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4 px-1">
                {COLUMNS.map(status => (
                    <KanbanColumn
                        key={status}
                        status={status}
                        cards={byStatus(status)}
                        onSelect={onSelect}
                        onDelete={onDelete}
                        selectedId={selectedId}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeCard && (
                    <div className="rounded-lg border border-primary/40 bg-card shadow-2xl p-3 w-68 cursor-grabbing opacity-95 rotate-2">
                        <p className="font-semibold text-sm">{activeCard.nombre}</p>
                        <p className="text-xs text-muted-foreground truncate">{activeCard.proyecto}</p>
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}
