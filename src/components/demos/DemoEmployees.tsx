import { useState } from 'react';
import { FiBriefcase, FiFileText, FiClock, FiCalendar, FiCheckCircle, FiBell, FiChevronRight, FiTrendingUp } from 'react-icons/fi';

export default function DemoEmployees() {
    const [tab, setTab] = useState<'inicio' | 'vacaciones' | 'nominas'>('inicio');

    return (
        <div className="flex flex-col h-full bg-muted/10 animate-in fade-in duration-500 overflow-y-auto">
            {/* Header / Banner Perfil */}
            <div className="h-48 sm:h-64 bg-gradient-to-r from-primary to-secondary relative flex-shrink-0">
                <div className="absolute inset-0 bg-black/20"></div>
                
                {/* Navbar Interno */}
                <div className="absolute top-0 w-full p-4 flex justify-between items-center text-white z-10">
                    <div className="font-bold flex items-center gap-2 tracking-tight">
                        <FiBriefcase className="w-5 h-5" /> PortalRH
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative">
                            <FiBell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-primary"></span>
                        </button>
                    </div>
                </div>

                {/* Perfil Header */}
                <div className="absolute -bottom-12 left-6 sm:left-12 flex items-end gap-6 z-10 w-full px-6 sm:px-0">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-background bg-card shadow-xl overflow-hidden shadow-primary/20">
                        <img src="https://i.pravatar.cc/100?img=5" alt="Carlos Sanchez" className="w-full h-full object-cover" />
                    </div>
                    <div className="mb-2 sm:mb-4 text-white">
                        <h1 className="text-2xl sm:text-3xl font-black drop-shadow-md leading-tight">Carlos Sánchez</h1>
                        <p className="text-sm sm:text-base opacity-90 font-medium drop-shadow flex items-center gap-2">Senior Frontend Developer <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span></p>
                    </div>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="max-w-6xl mx-auto w-full px-6 sm:px-12 pt-20 pb-12 flex flex-col md:flex-row gap-8 flex-1">
                {/* Sidebar */}
                <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
                    <button 
                        onClick={() => setTab('inicio')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${tab === 'inicio' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-card hover:text-foreground border border-transparent hover:border-border'}`}
                    >
                        <FiClock className="w-5 h-5" /> Inicio
                    </button>
                    <button 
                        onClick={() => setTab('vacaciones')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${tab === 'vacaciones' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-card hover:text-foreground border border-transparent hover:border-border'}`}
                    >
                        <FiCalendar className="w-5 h-5" /> Vacaciones y Permisos
                    </button>
                    <button 
                        onClick={() => setTab('nominas')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${tab === 'nominas' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-card hover:text-foreground border border-transparent hover:border-border'}`}
                    >
                        <FiFileText className="w-5 h-5" /> Recibos de Nómina
                    </button>
                </div>

                {/* Área de Visualización */}
                <div className="flex-1 flex flex-col gap-6">
                    {tab === 'inicio' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-6">
                            {/* Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary"><FiCalendar /></div>
                                        <span className="font-semibold text-sm">Vacaciones Disp.</span>
                                    </div>
                                    <div className="text-3xl font-black">12 <span className="text-sm text-muted-foreground font-normal">días</span></div>
                                    <div className="w-full bg-muted rounded-full h-1.5 mt-4">
                                        <div className="bg-primary h-1.5 rounded-full" style={{ width: '40%' }}></div>
                                    </div>
                                </div>
                                <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><FiTrendingUp /></div>
                                        <span className="font-semibold text-sm">Desempeño</span>
                                    </div>
                                    <div className="text-3xl font-black">94<span className="text-sm text-muted-foreground font-normal">/100</span></div>
                                    <p className="text-xs text-emerald-500 font-bold mt-2">Excelente este trimestre</p>
                                </div>
                                <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between cursor-pointer hover:border-primary/50 transition-colors group">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-4 group-hover:text-primary transition-colors">
                                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><FiCheckCircle /></div>
                                        <span className="font-semibold text-sm">Tareas Pdt. (HR)</span>
                                    </div>
                                    <div className="text-3xl font-black">2</div>
                                    <button className="mt-2 text-xs font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                                        Ver Tareas <FiChevronRight />
                                    </button>
                                </div>
                            </div>

                            {/* Comunicados */}
                            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                                <h3 className="font-bold text-lg mb-4 flex items-center justify-between">
                                    Comunicados Internos
                                    <span className="text-xs font-semibold text-primary cursor-pointer hover:underline">Ver todos</span>
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex gap-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center shrink-0">
                                            <FiBell className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-blue-900 dark:text-blue-100">Evaluación 360 - Ultimo día</h4>
                                            <p className="text-xs text-blue-800/70 dark:text-blue-200/70 mt-1">Hoy es el último día para completar la evaluación de tus pares. Es mandatorio para el cierre de Q3.</p>
                                            <span className="text-[10px] font-bold text-blue-500 mt-2 block">Hace 2 horas</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 p-4 rounded-xl hover:bg-muted/50 border border-transparent transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                                            <FiCalendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">Fiesta de Fin de Año Confirmada</h4>
                                            <p className="text-xs text-muted-foreground mt-1">Aparta la fecha: 15 de Diciembre. Estaremos celebrando los grandes logros de este 2026.</p>
                                            <span className="text-[10px] font-bold text-muted-foreground mt-2 block">Ayer, 09:30 AM</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'vacaciones' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 bg-card border border-border rounded-2xl p-6 shadow-sm h-full flex flex-col justify-center items-center text-center">
                            <FiCalendar className="w-16 h-16 text-muted-foreground/30 mb-4" />
                            <h3 className="text-xl font-bold">Gestión de Vacaciones</h3>
                            <p className="text-muted-foreground mt-2 max-w-sm">Solicita días libres, reporta ausencias y revisa el historial de tus permisos aprobados.</p>
                            <button className="mt-6 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-bold shadow-sm hover:scale-105 transition-transform">
                                Solicitar Permiso
                            </button>
                        </div>
                    )}

                    {tab === 'nominas' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 bg-card border border-border rounded-2xl p-6 shadow-sm h-full flex flex-col">
                            <h3 className="font-bold text-lg mb-4">Últimos Recibos</h3>
                            <div className="flex-1 flex flex-col justify-center items-center py-12 text-center border-2 border-dashed border-border/50 rounded-xl">
                                <FiFileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
                                <h4 className="font-bold">Módulo de Nóminas</h4>
                                <p className="text-sm text-muted-foreground mt-1">Descarga tus recibos de nómina timbrados (CFDI).</p>
                                <div className="mt-6 flex flex-col gap-2 w-full max-w-sm">
                                    <div className="flex justify-between items-center p-3 border border-border rounded-lg hover:border-primary/50 cursor-pointer transition-colors bg-background">
                                        <span className="font-semibold text-sm">Quincena 20 - Octubre</span>
                                        <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded">Descargar PDF</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 border border-border rounded-lg hover:border-primary/50 cursor-pointer transition-colors bg-background">
                                        <span className="font-semibold text-sm">Quincena 19 - Octubre</span>
                                        <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded">Descargar PDF</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
