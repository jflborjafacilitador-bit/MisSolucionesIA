import { useState, useMemo } from 'react';
import { FiMessageSquare, FiSearch, FiFilter, FiUser, FiClock, FiCheckCircle } from 'react-icons/fi';

type TicketStatus = 'Abierto' | 'En Progreso' | 'Resuelto';
type TicketPriority = 'Urgente' | 'Alta' | 'Normal' | 'Baja';

interface Ticket {
    id: string;
    titulo: string;
    cliente: string;
    estado: TicketStatus;
    prioridad: TicketPriority;
    actualizado: string;
    mensajes: number;
}

const INITIAL_TICKETS: Ticket[] = [
    { id: '#4092', titulo: 'Sistema caído al procesar pago', cliente: 'TechCorp S.A.', estado: 'Abierto', prioridad: 'Urgente', actualizado: 'Hace 5 min', mensajes: 2 },
    { id: '#4091', titulo: 'Error en exportación de PDF', cliente: 'Ana Martínez', estado: 'En Progreso', prioridad: 'Alta', actualizado: 'Hace 1 hora', mensajes: 4 },
    { id: '#4090', titulo: 'Solicitud de cambio de plan anual', cliente: 'Empresa Z', estado: 'Abierto', prioridad: 'Normal', actualizado: 'Hace 3 horas', mensajes: 1 },
    { id: '#4089', titulo: 'Problema de acceso a cuenta compartida', cliente: 'Luis G.', estado: 'Resuelto', prioridad: 'Alta', actualizado: 'Ayer', mensajes: 7 },
    { id: '#4088', titulo: 'Duda sobre la facturación de Abril', cliente: 'Laura S.', estado: 'Resuelto', prioridad: 'Baja', actualizado: 'Ayer', mensajes: 3 },
    { id: '#4087', titulo: 'Cómo configurar el webhook?', cliente: 'DevStudio', estado: 'En Progreso', prioridad: 'Normal', actualizado: 'Hace 2 días', mensajes: 5 },
];

export default function DemoTickets() {
    const [filtroEstado, setFiltroEstado] = useState<TicketStatus | 'Todos'>('Todos');
    const [busqueda, setBusqueda] = useState('');

    const ticketsFiltrados = useMemo(() => {
        return INITIAL_TICKETS.filter(t => {
            const matchBusqueda = t.titulo.toLowerCase().includes(busqueda.toLowerCase()) || 
                                  t.id.toLowerCase().includes(busqueda.toLowerCase()) ||
                                  t.cliente.toLowerCase().includes(busqueda.toLowerCase());
            const matchEstado = filtroEstado === 'Todos' || t.estado === filtroEstado;
            return matchBusqueda && matchEstado;
        });
    }, [busqueda, filtroEstado]);

    const getPriorityColor = (p: TicketPriority) => {
        switch(p) {
            case 'Urgente': return 'bg-red-500 text-white';
            case 'Alta': return 'bg-amber-500 text-white';
            case 'Normal': return 'bg-blue-500 text-white';
            case 'Baja': return 'bg-slate-400 text-white dark:bg-slate-600';
        }
    };

    const getStatusColor = (s: TicketStatus) => {
        switch(s) {
            case 'Abierto': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
            case 'En Progreso': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
            case 'Resuelto': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
        }
    };

    return (
        <div className="flex h-full bg-background animate-in fade-in duration-500 overflow-hidden">
            {/* Sidebar Filtros */}
            <div className="w-64 border-r border-border bg-card p-4 hidden md:flex flex-col gap-6">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                        <FiMessageSquare /> Helpdesk
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">Sistema de Tickets v2.0</p>
                </div>
                
                <button className="w-full bg-foreground text-background font-bold py-2.5 rounded-lg shadow-md hover:bg-foreground/90 transition-colors">
                    + Nuevo Ticket
                </button>

                <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Vistas</span>
                    <div className="space-y-1">
                        {['Todos', 'Abierto', 'En Progreso', 'Resuelto'].map(st => (
                            <button 
                                key={st}
                                onClick={() => setFiltroEstado(st as any)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${filtroEstado === st ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-muted'}`}
                            >
                                {st}
                                {st === 'Abierto' && <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">3</span>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Listado de Tickets */}
            <div className="flex-1 flex flex-col min-w-0 bg-muted/10">
                {/* Topbar interno */}
                <div className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
                    <h3 className="font-bold text-lg">
                        {filtroEstado === 'Todos' ? 'Bandeja de Entrada' : `Tickets: ${filtroEstado}`}
                        <span className="text-muted-foreground font-normal ml-2 text-sm">({ticketsFiltrados.length})</span>
                    </h3>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input 
                                type="text" 
                                placeholder="Buscar ticket..." 
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-48 sm:w-64 pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <button className="p-2 bg-background border border-border rounded-lg text-muted-foreground hover:text-foreground md:hidden">
                            <FiFilter />
                        </button>
                    </div>
                </div>

                {/* Lista */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                        {ticketsFiltrados.length > 0 ? ticketsFiltrados.map((ticket, idx) => (
                            <div key={ticket.id} className={`p-4 sm:p-5 flex flex-col sm:flex-row gap-4 justify-between transition-colors hover:bg-muted/30 cursor-pointer ${idx !== ticketsFiltrados.length - 1 ? 'border-b border-border/50' : ''}`}>
                                <div className="flex gap-4">
                                    <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary font-bold items-center justify-center border border-primary/20">
                                        {ticket.cliente.charAt(0)}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${getPriorityColor(ticket.prioridad)}`}>
                                                {ticket.prioridad}
                                            </span>
                                            <h4 className="font-bold text-base leading-tight group-hover:text-primary transition-colors">{ticket.titulo}</h4>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap mt-1">
                                            <span className="flex items-center gap-1 font-mono">{ticket.id}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><FiUser /> {ticket.cliente}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><FiClock /> {ticket.actualizado}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0">
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(ticket.estado)}`}>
                                        {ticket.estado}
                                    </span>
                                    {ticket.mensajes > 0 && (
                                        <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                                            <FiMessageSquare /> {ticket.mensajes} mensajes
                                        </span>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="p-12 text-center flex flex-col items-center justify-center text-muted-foreground">
                                <FiCheckCircle className="w-12 h-12 mb-4 text-emerald-500/50" />
                                <h4 className="text-lg font-bold text-foreground">¡Todo al día!</h4>
                                <p>No hay tickets que coincidan con los filtros actuales.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
