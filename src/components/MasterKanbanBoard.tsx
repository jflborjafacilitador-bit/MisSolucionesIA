import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { FiTrash2, FiUserCheck, FiMail } from 'react-icons/fi';
import { Cliente, ClienteStatus } from './ClientePipeline';
import { Cotizacion, CotizacionStatus } from '../pages/AdminDashboard';

export type MasterStatus = CotizacionStatus | ClienteStatus;

export type MasterItemType = 'cotizacion' | 'cliente';

export interface MasterItem {
    id: string;
    type: MasterItemType;
    nombre: string;
    proyecto: string;
    status: MasterStatus;
    badgeValue?: string | number | null;
    originalData: Cotizacion | Cliente;
}

interface StatusConfig {
    label: string;
    color: string;
    dot: string;
    colBg: string;
    header: string;
    acceptsType: MasterItemType | 'both';
}

const statusConfig: Record<MasterStatus, StatusConfig> = {
    por_atender: { label: 'Nuevos Leads', color: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700', dot: 'bg-amber-500', colBg: 'bg-amber-50/30 dark:bg-amber-950/10', header: 'border-amber-400', acceptsType: 'cotizacion' },
    en_proceso: { label: 'En Negociación', color: 'bg-blue-50 dark:bg-blue-950/20 text-blue-700', dot: 'bg-blue-500', colBg: 'bg-blue-50/30 dark:bg-blue-950/10', header: 'border-blue-400', acceptsType: 'cotizacion' },
    atendida: { label: 'Esperando Pago', color: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700', dot: 'bg-indigo-500', colBg: 'bg-indigo-50/30 dark:bg-indigo-950/10', header: 'border-indigo-400', acceptsType: 'cotizacion' },
    activo: { label: 'Clientes Activos', color: 'bg-green-50 dark:bg-green-950/20 text-green-700', dot: 'bg-green-500', colBg: 'bg-green-50/30 dark:bg-green-950/10', header: 'border-green-500', acceptsType: 'both' }, // Both to allow conversions
    en_mora: { label: 'En Mora', color: 'bg-red-50 dark:bg-red-950/20 text-red-700', dot: 'bg-red-500', colBg: 'bg-red-50/30 dark:bg-red-950/10', header: 'border-red-500', acceptsType: 'cliente' },
    pausado: { label: 'Pausados', color: 'bg-amber-50 text-amber-600', dot: 'bg-amber-400', colBg: 'bg-amber-50/50', header: 'border-amber-400', acceptsType: 'cliente' },
    terminado: { label: 'Terminados', color: 'bg-indigo-50 text-indigo-600', dot: 'bg-indigo-400', colBg: 'bg-indigo-50/50', header: 'border-indigo-400', acceptsType: 'cliente' },
    descartada: { label: 'Leads Descartados', color: 'bg-gray-50 border-gray-200 text-gray-500', dot: 'bg-gray-400', colBg: 'bg-gray-50/50', header: 'border-gray-300', acceptsType: 'cotizacion' }
};

const MASTER_COLUMNS: MasterStatus[] = ['por_atender', 'en_proceso', 'atendida', 'activo', 'en_mora', 'pausado', 'terminado', 'descartada'];

// ── Draggable Card ──────────────────────────────────────────────────────────
function KanbanCard({ item, onSelect, onDelete, isSelected }: {
    item: MasterItem;
    onSelect: (item: MasterItem) => void;
    onDelete: (id: string, type: MasterItemType) => void;
    isSelected: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.id, data: { item } });
    const st = statusConfig[item.status];

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform) }}
            className={`rounded-lg border bg-card shadow-sm transition-all cursor-grab active:cursor-grabbing select-none relative
                ${isDragging ? 'opacity-40 scale-95 z-50' : ''}
                ${isSelected ? 'ring-2 ring-primary/50 border-primary/30' : 'border-border/50 hover:border-primary/30'}
            `}
            {...attributes}
            {...listeners}
        >
            <div className="p-3" onClick={() => onSelect(item)}>
                <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {item.type === 'cotizacion' ? (
                            <FiMail className="w-3 h-3 text-muted-foreground" title="Lead/Cotización" />
                        ) : (
                            <FiUserCheck className="w-3 h-3 text-green-600" title="Cliente Activo" />
                        )}
                        {item.badgeValue && (
                            <span className="text-[10px] text-green-600 font-mono font-bold">${item.badgeValue.toLocaleString()} MXN</span>
                        )}
                    </div>
                </div>
                <p className="font-semibold text-sm leading-tight">{item.nombre}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{item.proyecto}</p>
            </div>
            <div className="flex justify-end px-2 pb-2">
                <button
                    onPointerDown={e => e.stopPropagation()}
                    onClick={e => { e.stopPropagation(); onDelete(item.id, item.type); }}
                    className="p-1 text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                >
                    <FiTrash2 className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}

// ── Droppable Column ────────────────────────────────────────────────────────
function KanbanColumn({ status, items, onSelect, onDelete, selectedId }: {
    status: MasterStatus;
    items: MasterItem[];
    onSelect: (item: MasterItem) => void;
    onDelete: (id: string, type: MasterItemType) => void;
    selectedId?: string;
}) {
    const { setNodeRef, isOver } = useDroppable({ id: status });
    const cfg = statusConfig[status];

    return (
        <div className={`flex flex-col rounded-xl border-2 ${cfg.header} ${cfg.colBg} min-h-[500px] w-72 flex-shrink-0 transition-all ${isOver ? 'ring-2 ring-primary/40 scale-[1.01] shadow-lg z-10' : ''}`}>
            <div className="p-3 border-b border-border/30 flex items-center justify-between bg-card/50 rounded-t-lg backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot} shadow-sm`} />
                    <span className="font-semibold text-sm">{cfg.label}</span>
                </div>
                <span className="text-xs font-bold bg-background shadow-sm border border-border/40 px-2 py-0.5 rounded-full">{items.length}</span>
            </div>
            <div ref={setNodeRef} className="flex-1 p-2 space-y-2 overflow-y-auto">
                {items.length === 0 && (
                    <div className={`border-2 border-dashed border-border/40 rounded-lg h-24 flex flex-col items-center justify-center text-xs text-muted-foreground transition-all ${isOver ? 'border-primary/40 bg-primary/5 text-primary font-medium' : ''}`}>
                        Arrastra aquí
                    </div>
                )}
                {items.map(item => (
                    <KanbanCard
                        key={item.id}
                        item={item}
                        onSelect={onSelect}
                        onDelete={onDelete}
                        isSelected={selectedId === item.id}
                    />
                ))}
            </div>
        </div>
    );
}

// ── Main Kanban Board ───────────────────────────────────────────────────────
interface MasterKanbanBoardProps {
    cotizaciones: Cotizacion[];
    clientes: Cliente[];
    selectedId?: string;
    onSelectCotizacion: (c: Cotizacion) => void;
    onSelectCliente: (c: Cliente) => void;
    onDeleteCotizacion: (id: string) => void;
    onDeleteCliente: (id: string) => void;
    onStatusChangeCotizacion: (id: string, newStatus: CotizacionStatus) => void;
    onStatusChangeCliente: (id: string, newStatus: ClienteStatus) => void;
    onConvertCotizacionToCliente: (cotizacionId: string) => void;
}

export default function MasterKanbanBoard({ 
    cotizaciones, clientes, selectedId, 
    onSelectCotizacion, onSelectCliente, 
    onDeleteCotizacion, onDeleteCliente, 
    onStatusChangeCotizacion, onStatusChangeCliente,
    onConvertCotizacionToCliente
}: MasterKanbanBoardProps) {
    const [activeItem, setActiveItem] = useState<MasterItem | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    // Mapeo unificado
    const masterItems: MasterItem[] = [
        ...cotizaciones.map(c => ({
            id: c.id,
            type: 'cotizacion' as MasterItemType,
            nombre: c.nombre,
            proyecto: c.proyecto,
            status: c.status || 'por_atender',
            badgeValue: c.precioCotizado,
            originalData: c
        })),
        ...clientes.map(c => ({
            id: c.id,
            type: 'cliente' as MasterItemType,
            nombre: c.nombre,
            proyecto: c.proyecto || 'Cliente',
            status: c.status || 'activo',
            badgeValue: c.mensualidadMonto,
            originalData: c
        }))
    ];

    const handleDragStart = (event: DragStartEvent) => {
        setActiveItem((event.active.data.current as { item: MasterItem }).item);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { over, active } = event;
        setActiveItem(null);
        if (!over) return;

        const item = (active.data.current as { item: MasterItem }).item;
        const newStatus = over.id as MasterStatus;
        const targetConfig = statusConfig[newStatus];

        if (item.status === newStatus) return;

        // Reglas de negocio:
        if (item.type === 'cotizacion') {
            if (newStatus === 'activo') {
                // Conversión! El admin arrastró un Lead a Clientes Activos
                onConvertCotizacionToCliente(item.id);
            } else if (targetConfig.acceptsType === 'cotizacion' || targetConfig.acceptsType === 'both') {
                onStatusChangeCotizacion(item.id, newStatus as CotizacionStatus);
            }
        } else if (item.type === 'cliente') {
            if (targetConfig.acceptsType === 'cliente' || targetConfig.acceptsType === 'both') {
                onStatusChangeCliente(item.id, newStatus as ClienteStatus);
            }
        }
    };

    const handleSelect = (item: MasterItem) => {
        if (item.type === 'cotizacion') onSelectCotizacion(item.originalData as Cotizacion);
        else onSelectCliente(item.originalData as Cliente);
    };

    const handleDelete = (id: string, type: MasterItemType) => {
        if (type === 'cotizacion') onDeleteCotizacion(id);
        else onDeleteCliente(id);
    };

    const byStatus = (status: MasterStatus) => masterItems.filter(i => i.status === status);

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-6 pt-2 px-2 scrollbar-thin scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/40">
                {MASTER_COLUMNS.map(status => (
                    <KanbanColumn
                        key={status}
                        status={status}
                        items={byStatus(status)}
                        onSelect={handleSelect}
                        onDelete={handleDelete}
                        selectedId={selectedId}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeItem && (
                    <div className="rounded-lg border-2 border-primary/50 bg-card shadow-2xl p-3 w-72 cursor-grabbing opacity-95 rotate-3 scale-105">
                        <div className="flex items-center gap-1.5 mb-1.5">
                            {activeItem.type === 'cotizacion' ? <FiMail className="w-3.5 h-3.5 text-primary" /> : <FiUserCheck className="w-3.5 h-3.5 text-green-600" />}
                            <p className="font-bold text-sm text-foreground">{activeItem.nombre}</p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{activeItem.proyecto}</p>
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}
