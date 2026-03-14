import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { FiCalendar, FiCheckCircle, FiAlertCircle, FiClock } from 'react-icons/fi';

export type ClienteStatus = 'activo' | 'en_mora' | 'pausado' | 'terminado';

export interface Cliente {
    id: string;
    nombre: string;
    correo: string;
    telefono?: string;
    proyecto: string;
    precioCobrado?: number | null;
    mensualidadMonto?: number | null;
    fechaInicio: any;
    cotizacionId?: string;
    status: ClienteStatus;
    notasAdmin?: string | null;
    referralCodeUsed?: string | null;
    // Pago del mes actual (cargado on demand)
    pagoMesActual?: { pagado: boolean; pagoId?: string } | null;
}

interface ColConfig {
    label: string;
    dot: string;
    colBg: string;
    header: string;
    icon: React.ReactNode;
}

const colConfig: Record<ClienteStatus, ColConfig> = {
    activo: { label: 'Activo', dot: 'bg-green-500', colBg: 'bg-green-50/50 dark:bg-green-950/10', header: 'border-green-400', icon: <FiCheckCircle className="w-3.5 h-3.5 text-green-500" /> },
    en_mora: { label: 'En Mora', dot: 'bg-red-500', colBg: 'bg-red-50/50 dark:bg-red-950/10', header: 'border-red-400', icon: <FiAlertCircle className="w-3.5 h-3.5 text-red-500" /> },
    pausado: { label: 'Pausado', dot: 'bg-gray-400', colBg: 'bg-muted/20', header: 'border-gray-400', icon: <FiClock className="w-3.5 h-3.5 text-gray-400" /> },
    terminado: { label: 'Terminado', dot: 'bg-indigo-400', colBg: 'bg-indigo-50/30 dark:bg-indigo-950/10', header: 'border-indigo-400', icon: <FiCalendar className="w-3.5 h-3.5 text-indigo-400" /> },
};

const COLUMNS: ClienteStatus[] = ['activo', 'en_mora', 'pausado', 'terminado'];

// ── Client Card ──────────────────────────────────────────────────────────────
function ClienteCard({ c, onSelect, isSelected }: {
    c: Cliente;
    onSelect: (c: Cliente) => void;
    isSelected: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: c.id, data: { card: c } });
    const cfg = colConfig[c.status];
    const pagado = c.pagoMesActual?.pagado;
    const tieneMensualidad = !!c.mensualidadMonto;

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
                {/* Header: dot + status */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{cfg.label}</span>
                    </div>
                    {tieneMensualidad && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${pagado
                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400'
                                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400'
                            }`}>
                            {pagado ? '✓ Pagado' : '⏳ Pendiente'}
                        </span>
                    )}
                </div>

                {/* Name + project */}
                <p className="font-semibold text-sm leading-tight">{c.nombre}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{c.proyecto}</p>

                {/* Amounts */}
                <div className="flex items-center gap-2 mt-2">
                    {c.precioCobrado && (
                        <span className="text-[10px] text-green-600 font-mono font-bold bg-green-50 dark:bg-green-950/20 border border-green-200/50 px-1.5 py-0.5 rounded">
                            ${c.precioCobrado.toLocaleString()}
                        </span>
                    )}
                    {c.mensualidadMonto && (
                        <span className="text-[10px] text-blue-600 font-mono font-bold bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 px-1.5 py-0.5 rounded">
                            ${c.mensualidadMonto.toLocaleString()}/mes
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Droppable Column ─────────────────────────────────────────────────────────
function ClienteColumn({ status, cards, onSelect, selectedId }: {
    status: ClienteStatus;
    cards: Cliente[];
    onSelect: (c: Cliente) => void;
    selectedId?: string;
}) {
    const { setNodeRef, isOver } = useDroppable({ id: status });
    const cfg = colConfig[status];

    return (
        <div className={`flex flex-col rounded-xl border-2 ${cfg.header} ${cfg.colBg} min-h-[400px] w-72 flex-shrink-0 transition-all ${isOver ? 'ring-2 ring-primary/40 scale-[1.01]' : ''}`}>
            <div className="p-3 border-b border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {cfg.icon}
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
                    <ClienteCard
                        key={c.id}
                        c={c}
                        onSelect={onSelect}
                        isSelected={selectedId === c.id}
                    />
                ))}
            </div>
        </div>
    );
}

// ── Main Pipeline ─────────────────────────────────────────────────────────────
interface ClientePipelineProps {
    clientes: Cliente[];
    selectedId?: string;
    onSelect: (c: Cliente) => void;
    onStatusChange: (id: string, newStatus: ClienteStatus) => void;
}

export default function ClientePipeline({ clientes, selectedId, onSelect, onStatusChange }: ClientePipelineProps) {
    const [activeCard, setActiveCard] = useState<Cliente | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveCard((event.active.data.current as { card: Cliente }).card);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { over, active } = event;
        setActiveCard(null);
        if (!over) return;
        const card = (active.data.current as { card: Cliente }).card;
        const newStatus = over.id as ClienteStatus;
        if (card.status !== newStatus) {
            onStatusChange(card.id, newStatus);
        }
    };

    const byStatus = (status: ClienteStatus) => clientes.filter(c => c.status === status);

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4 px-1">
                {COLUMNS.map(status => (
                    <ClienteColumn
                        key={status}
                        status={status}
                        cards={byStatus(status)}
                        onSelect={onSelect}
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
