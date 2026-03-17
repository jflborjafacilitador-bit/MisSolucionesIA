import { useState } from 'react';
import { FiMove, FiImage, FiType, FiLayout, FiMaximize, FiPlay, FiSettings, FiSave, FiEye, FiCheckCircle } from 'react-icons/fi';

export default function DemoMarketing() {
    const [modo, setModo] = useState<'editor' | 'preview'>('editor');

    return (
        <div className="flex flex-col h-full bg-background animate-in fade-in duration-500 overflow-hidden">
            {/* Topbar del Constructor */}
            <header className="h-14 border-b border-border bg-card flex justify-between items-center px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <span className="font-bold text-sm bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">FunnelBuilder PRO</span>
                    <span className="text-xs text-muted-foreground border-l border-border pl-4 hidden sm:block">Proyecto: Captación Leads 2026</span>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setModo(modo === 'editor' ? 'preview' : 'editor')}
                        className="flex items-center gap-2 px-3 py-1.5 rounded bg-muted/50 hover:bg-muted text-xs font-semibold transition-colors"
                    >
                        {modo === 'editor' ? <><FiPlay /> Preview</> : <><FiSettings /> Editor</>}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-1.5 rounded bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:bg-primary/90 transition-colors">
                        <FiSave /> Guardar
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Herramientas (Solo en editor mode) */}
                {modo === 'editor' && (
                    <div className="w-16 sm:w-64 border-r border-border bg-muted/10 p-2 sm:p-4 flex flex-col gap-4 animate-in slide-in-from-left-4 fade-in">
                        <div className="hidden sm:block">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Componentes</h3>
                            <p className="text-[10px] text-muted-foreground mt-1">Arrastra para construir</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            <div className="bg-card border border-border p-3 flex flex-col items-center justify-center gap-2 rounded-lg cursor-move hover:border-primary/50 transition-colors shadow-sm group">
                                <FiType className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="text-[10px] font-semibold hidden sm:block">Texto</span>
                            </div>
                            <div className="bg-card border border-border p-3 flex flex-col items-center justify-center gap-2 rounded-lg cursor-move hover:border-primary/50 transition-colors shadow-sm group">
                                <FiImage className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="text-[10px] font-semibold hidden sm:block">Imagen</span>
                            </div>
                            <div className="bg-card border border-border p-3 flex flex-col items-center justify-center gap-2 rounded-lg cursor-move hover:border-primary/50 transition-colors shadow-sm group">
                                <FiLayout className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="text-[10px] font-semibold hidden sm:block">Formulario</span>
                            </div>
                            <div className="bg-card border border-border p-3 flex flex-col items-center justify-center gap-2 rounded-lg cursor-move hover:border-primary/50 transition-colors shadow-sm group border-primary ring-1 ring-primary/20">
                                <FiMaximize className="w-5 h-5 text-primary" />
                                <span className="text-[10px] font-bold text-primary hidden sm:block">Call To Action</span>
                            </div>
                        </div>

                        <div className="mt-auto hidden sm:block p-3 bg-primary/5 border border-primary/20 rounded-xl">
                            <h4 className="text-xs font-bold text-primary flex items-center gap-1"><FiEye /> Stats en Vivo</h4>
                            <div className="mt-2 space-y-1">
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-muted-foreground">Visitas Hoy:</span>
                                    <span className="font-bold">1,240</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-muted-foreground">Conversión:</span>
                                    <span className="font-bold text-emerald-500">14.2%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Canvas o Vista Previa */}
                <div className={`flex-1 bg-muted/30 overflow-y-auto relative p-4 sm:p-8 flex justify-center ${modo === 'editor' ? 'editor-grid' : ''}`}>
                    {/* Grid de fondo en grid-mode */}
                    {modo === 'editor' && (
                        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #888 1px, transparent 1px), linear-gradient(to bottom, #888 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                    )}

                    <div className={`w-full max-w-3xl bg-background rounded-b-2xl shadow-2xl relative flex flex-col min-h-[600px] transition-all duration-500 ${modo === 'editor' ? 'border-2 border-primary/40 rounded-t-lg' : 'border-t-[20px] border-t-muted rounded-t-3xl'}`}>
                        {/* Browser Mock Header */}
                        {modo === 'preview' && (
                            <div className="absolute -top-5 left-4 flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                            </div>
                        )}

                        {/* Editor Controls Overlay */}
                        {modo === 'editor' && (
                            <div className="absolute -top-7 right-2 flex gap-1 z-10">
                                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-t-md">Viewport: Desktop</span>
                            </div>
                        )}

                        {/* Contenido Simulado de la Landing Page */}
                        <div className="flex-1 overflow-y-auto relative group/canvas">
                            
                            {/* Block 1: Hero */}
                            <div className={`p-10 text-center relative group/block ${modo === 'editor' ? 'hover:outline outline-2 outline-primary/50' : ''}`}>
                                {modo === 'editor' && <div className="absolute top-2 right-2 hidden group-hover/block:flex gap-1 bg-card border border-border rounded shadow-sm p-1 z-20"><FiMove className="text-xs text-muted-foreground cursor-move"/></div>}
                                
                                <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-600 font-bold text-xs rounded-full mb-4">Masterclass Gratuita</span>
                                <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 leading-tight">Escala tu Agencia a <span className="text-primary">$10k/mes</span> en 90 Días</h1>
                                <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Descubre el sistema exacto de 3 pasos que usamos para automatizar clientes y ventas en piloto automático.</p>
                                
                                {/* Form / CTA */}
                                <div className={`max-w-md mx-auto bg-card p-6 rounded-2xl shadow-xl border relative z-10 ${modo === 'editor' ? 'border-primary border-dashed ring-4 ring-primary/10' : 'border-border'}`}>
                                    {modo === 'editor' && <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center shadow-md cursor-pointer"><FiSettings className="w-3 h-3" /></div>}
                                    <h3 className="font-bold mb-4">Reserva tu lugar ahora</h3>
                                    <div className="space-y-3">
                                        <input type="text" placeholder="Tu nombre completo" className="w-full px-4 py-2 text-sm bg-muted/50 border border-border rounded flex items-center shadow-inner" disabled={modo === 'editor'} />
                                        <input type="email" placeholder="Tu mejor correo electrónico" className="w-full px-4 py-2 text-sm bg-muted/50 border border-border rounded flex items-center shadow-inner" disabled={modo === 'editor'} />
                                        <button className={`w-full py-3 rounded text-sm font-bold text-white shadow-lg transition-transform ${modo === 'preview' ? 'hover:scale-105 bg-emerald-500 hover:bg-emerald-600' : 'bg-emerald-500 pointer-events-none'}`}>
                                            ¡Si, quiero acceder ahora!
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-3 uppercase tracking-widest flex items-center justify-center gap-1"><FiCheckCircle className="text-emerald-500" /> Cupos limitados</p>
                                </div>
                            </div>
                            
                            {/* Fondo decorativo inferior */}
                            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-muted/50 to-transparent pointer-events-none z-0"></div>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    );
}
