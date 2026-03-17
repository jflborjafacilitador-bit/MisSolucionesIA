import { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiPlus, FiClock, FiVideo, FiMapPin, FiUser } from 'react-icons/fi';

interface Cita {
    id: string;
    titulo: string;
    horaInicio: string;
    horaFin: string;
    cliente: string;
    tipo: 'Videollamada' | 'Presencial';
    color: string;
}

const CITAS_INICIALES: Record<number, Cita[]> = {
    14: [
        { id: '1', titulo: 'Consulta Inicial', horaInicio: '09:00 AM', horaFin: '10:00 AM', cliente: 'Roberto Gómez', tipo: 'Videollamada', color: 'bg-blue-500/10 border-blue-500 text-blue-700' },
        { id: '2', titulo: 'Seguimiento', horaInicio: '11:30 AM', horaFin: '12:00 PM', cliente: 'Ana Sofía', tipo: 'Presencial', color: 'bg-emerald-500/10 border-emerald-500 text-emerald-700' },
    ],
    15: [
        { id: '3', titulo: 'Presentación de Proyecto', horaInicio: '10:00 AM', horaFin: '11:00 AM', cliente: 'Empresa XYZ', tipo: 'Videollamada', color: 'bg-purple-500/10 border-purple-500 text-purple-700' },
        { id: '4', titulo: 'Almuerzo con Socio', horaInicio: '01:00 PM', horaFin: '02:30 PM', cliente: 'Luis F.', tipo: 'Presencial', color: 'bg-amber-500/10 border-amber-500 text-amber-700' },
        { id: '5', titulo: 'Reunión de Cierre', horaInicio: '04:00 PM', horaFin: '05:00 PM', cliente: 'María López', tipo: 'Videollamada', color: 'bg-rose-500/10 border-rose-500 text-rose-700' },
    ]
};

export default function DemoCalendar() {
    const [diaSeleccionado, setDiaSeleccionado] = useState(15);
    const [citas, setCitas] = useState(CITAS_INICIALES);
    const [modalAbierto, setModalAbierto] = useState(false);

    // Días del mes mock (Octubre 2026)
    const diasMes = Array.from({ length: 31 }, (_, i) => i + 1);

    const handleAgendarClick = () => {
        // Simulador de agregar cita interactivo
        setModalAbierto(true);
        setTimeout(() => {
            const nuevaCita: Cita = {
                id: Date.now().toString(),
                titulo: 'Nueva Reunión Agendada',
                horaInicio: '08:00 AM',
                horaFin: '09:00 AM',
                cliente: 'Cliente Nuevo',
                tipo: 'Videollamada',
                color: 'bg-primary/20 border-primary text-primary'
            };
            setCitas(prev => ({
                ...prev,
                [diaSeleccionado]: [...(prev[diaSeleccionado] || []), nuevaCita]
            }));
            setModalAbierto(false);
        }, 800);
    };

    return (
        <div className="flex flex-col lg:flex-row h-full animate-in fade-in duration-500 bg-background">
            {/* Sidebar Calendar */}
            <div className="w-full lg:w-1/3 xl:w-1/4 border-r border-border bg-card p-6 flex flex-col gap-6 overflow-y-auto">
                <div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Agenda</h2>
                    <p className="text-xs text-muted-foreground mt-1">OCTUBRE 2026</p>
                </div>

                <button 
                    onClick={handleAgendarClick}
                    disabled={modalAbierto}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group relative overflow-hidden disabled:opacity-50"
                >
                    {modalAbierto ? <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <><FiPlus className="group-hover:rotate-90 transition-transform" /> Nueva Cita</>}
                </button>

                <div className="bg-background rounded-2xl border border-border p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-bold">Octubre 2026</span>
                        <div className="flex gap-1">
                            <button className="p-1 hover:bg-muted rounded"><FiChevronLeft /></button>
                            <button className="p-1 hover:bg-muted rounded"><FiChevronRight /></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground mb-2">
                        <div>Do</div><div>Lu</div><div>Ma</div><div>Mi</div><div>Ju</div><div>Vi</div><div>Sa</div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-sm">
                        {/* Espacios vacíos antes del 1 */}
                        <div className="p-2"></div><div className="p-2"></div><div className="p-2"></div><div className="p-2"></div>
                        {diasMes.map(dia => {
                            const tieneCitas = citas[dia] && citas[dia].length > 0;
                            return (
                                <button 
                                    key={dia}
                                    onClick={() => setDiaSeleccionado(dia)}
                                    className={`relative p-2 rounded-lg font-medium transition-all
                                        ${diaSeleccionado === dia ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted'}
                                        ${dia === 15 && diaSeleccionado !== 15 ? 'text-primary' : ''}
                                    `}
                                >
                                    {dia}
                                    {tieneCitas && diaSeleccionado !== dia && (
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-border">
                    <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-xl border border-border">
                        <strong>Tip:</strong> Selecciona cualquier día en el calendario o pulsa "Nueva Cita" para probar la interacción.
                    </div>
                </div>
            </div>

            {/* Daily Schedule */}
            <div className="flex-1 flex flex-col bg-muted/10 relative">
                <div className="p-6 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold">Jueves, {diaSeleccionado} de Octubre</h3>
                        <p className="text-sm text-muted-foreground">{citas[diaSeleccionado]?.length || 0} eventos programados</p>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 relative">
                    <div className="max-w-3xl mx-auto flex flex-col gap-4">
                        {(!citas[diaSeleccionado] || citas[diaSeleccionado].length === 0) ? (
                            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl bg-card">
                                <FiClock className="w-12 h-12 mb-4 opacity-20" />
                                <h4 className="font-bold text-lg text-foreground">Día libre</h4>
                                <p className="text-sm">No tienes eventos programados para este día.</p>
                            </div>
                        ) : (
                            citas[diaSeleccionado].map((cita) => (
                                <div key={cita.id} className={`p-4 rounded-xl border-l-4 shadow-sm bg-card hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${cita.color}`}>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1 text-foreground">{cita.titulo}</h4>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
                                            <span className="flex items-center gap-1.5"><FiClock className="w-4 h-4"/> {cita.horaInicio} - {cita.horaFin}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:items-end gap-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <FiUser className="text-muted-foreground" />
                                            <span className="font-semibold text-foreground">{cita.cliente}</span>
                                        </div>
                                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-background border border-current flex items-center gap-1 w-fit">
                                            {cita.tipo === 'Videollamada' ? <FiVideo /> : <FiMapPin />} {cita.tipo}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
