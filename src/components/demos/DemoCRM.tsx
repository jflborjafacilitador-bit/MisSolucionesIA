import { useState } from 'react';
import { FiPlus, FiSearch, FiFilter, FiMoreHorizontal, FiCalendar } from 'react-icons/fi';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

type DealStatus = 'leads' | 'negociacion' | 'cerrados';

interface Deal {
    id: string;
    empresa: string;
    monto: number;
    estado: DealStatus;
    etiqueta: string;
    colorEtiqueta: string;
    avatarUrl: string;
    fecha: string;
}

const INITIAL_DEALS: Deal[] = [
    { id: '1', empresa: 'Reise Corp', monto: 12000, estado: 'leads', etiqueta: 'Nuevo', colorEtiqueta: 'bg-blue-500/10 text-blue-500 border-blue-500/20', avatarUrl: 'https://i.pravatar.cc/100?img=11', fecha: '2 Oct' },
    { id: '2', empresa: 'Tech Flow SL', monto: 8500, estado: 'leads', etiqueta: 'Orgánico', colorEtiqueta: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', avatarUrl: 'https://i.pravatar.cc/100?img=12', fecha: '3 Oct' },
    { id: '3', empresa: 'Inversiones XYZ', monto: 45000, estado: 'negociacion', etiqueta: 'Prioridad Alta', colorEtiqueta: 'bg-amber-500/10 text-amber-500 border-amber-500/20', avatarUrl: 'https://i.pravatar.cc/100?img=47', fecha: '28 Sep' },
    { id: '4', empresa: 'Stark Ind.', monto: 120000, estado: 'cerrados', etiqueta: 'Ganado', colorEtiqueta: 'bg-green-500/10 text-green-500 border-green-500/20', avatarUrl: 'https://i.pravatar.cc/100?img=33', fecha: '15 Sep' },
    { id: '5', empresa: 'Wayne Ent.', monto: 85000, estado: 'cerrados', etiqueta: 'Ganado', colorEtiqueta: 'bg-green-500/10 text-green-500 border-green-500/20', avatarUrl: 'https://i.pravatar.cc/100?img=68', fecha: '10 Sep' }
];

const COLUMNS: { id: DealStatus, title: string, color: string }[] = [
    { id: 'leads', title: 'Leads Iniciales', color: 'border-blue-500' },
    { id: 'negociacion', title: 'En Negociación', color: 'border-amber-500' },
    { id: 'cerrados', title: 'Cerrados / Ganados', color: 'border-green-500' }
];

/* --- Componentes Draggable y Droppable --- */

function DealCard({ deal, isDragging }: { deal: Deal, isDragging?: boolean }) {
    const { attributes, listeners, setNodeRef, transform, isDragging: selfDragging } = useDraggable({ id: deal.id, data: { deal } });
    
    // Formato de moneda
    const formateado = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(deal.monto);

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform) }}
            className={`bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col gap-3 relative overflow-hidden group hover:border-primary/50 transition-colors cursor-grab active:cursor-grabbing 
                ${selfDragging || isDragging ? 'opacity-50 ring-2 ring-primary scale-95 z-50' : ''}`}
            {...attributes}
            {...listeners}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-sm text-foreground">{deal.empresa}</h4>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">{formateado}</p>
                </div>
                <button className="text-muted-foreground hover:text-foreground p-1 transition-colors">
                    <FiMoreHorizontal className="w-4 h-4" />
                </button>
            </div>
            <div className="flex justify-between items-center mt-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${deal.colorEtiqueta}`}>
                    {deal.etiqueta}
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" /> {deal.fecha}
                    </span>
                    <img src={deal.avatarUrl} alt="Agente" className="w-6 h-6 rounded-full border border-border" />
                </div>
            </div>
        </div>
    );
}

function BoardColumn({ status, title, colorCls, deals }: { status: DealStatus, title: string, colorCls: string, deals: Deal[] }) {
    const { setNodeRef, isOver } = useDroppable({ id: status });

    return (
        <div className={`flex flex-col flex-1 min-w-[300px] bg-muted/30 rounded-2xl border border-border overflow-hidden transition-colors ${isOver ? 'bg-primary/5 border-primary/30' : ''}`}>
            {/* Header Columna */}
            <div className={`p-4 border-b border-border bg-card flex justify-between items-center border-t-4 ${colorCls}`}>
                <h3 className="font-bold text-sm">{title}</h3>
                <span className="bg-muted text-muted-foreground text-xs font-bold px-2 py-0.5 rounded-full">{deals.length}</span>
            </div>
            
            {/* Contenedor Droppable */}
            <div ref={setNodeRef} className="p-3 flex-1 flex flex-col gap-3 min-h-[300px] overflow-y-auto">
                {deals.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-border/50 rounded-xl flex items-center justify-center text-xs text-muted-foreground">
                        Arrastra un prospecto aquí
                    </div>
                )}
                {deals.map(d => <DealCard key={d.id} deal={d} />)}
            </div>
        </div>
    );
}

export default function DemoCRM() {
    const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
    const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveDeal((active.data.current as any).deal);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveDeal(null);
        const { active, over } = event;
        if (!over) return;

        const dealId = active.id as string;
        const newStatus = over.id as DealStatus;

        setDeals(prev => prev.map(d => {
            if (d.id === dealId && d.estado !== newStatus) {
                // Si movemos a cerrados, actualizamos la etiqueta por diversion
                let newEtiqueta = d.etiqueta;
                let newColor = d.colorEtiqueta;
                if(newStatus === 'cerrados') {
                    newEtiqueta = 'Ganado';
                    newColor = 'bg-green-500/10 text-green-500 border-green-500/20';
                }
                return { ...d, estado: newStatus, etiqueta: newEtiqueta, colorEtiqueta: newColor };
            }
            return d;
        }));
    };

    return (
        <div className="h-full flex flex-col p-6 animate-in fade-in duration-500">
            {/* Header del CRM */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Sales Pipeline</h2>
                    <p className="text-sm text-muted-foreground">Gestiona tus prospectos arrastrando las tarjetas de una columna a otra.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-auto">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <input type="text" placeholder="Buscar prospecto..." className="w-full sm:w-64 pl-9 pr-4 py-2 border border-border rounded-lg bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                    </div>
                    <button className="p-2 border border-border rounded-lg bg-card hover:bg-muted transition-colors text-muted-foreground">
                        <FiFilter className="w-4 h-4" />
                    </button>
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap">
                        <FiPlus /> Nuevo Deal
                    </button>
                </div>
            </div>

            {/* Board Kanban */}
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex-1 flex gap-5 overflow-x-auto pb-4">
                    {COLUMNS.map(col => (
                        <BoardColumn 
                            key={col.id}
                            status={col.id}
                            title={col.title}
                            colorCls={col.color}
                            deals={deals.filter(d => d.estado === col.id)}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeDeal ? <DealCard deal={activeDeal} isDragging /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
