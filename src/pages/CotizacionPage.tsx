import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { FiSend } from 'react-icons/fi';

type FormData = {
    nombre: string;
    telefono: string;
    correo: string;
    proyecto: string;
    presupuesto: string;
    descripcion: string;
    referral_code_used?: string;
};

const opcionesProyecto = [
    'CRM con Pipeline',
    'Dashboards Analíticos',
    'Sistemas de Registros',
    'Agendas y Reservas',
    'E-Commerce y Tiendas Virtuales',
    'Portal de Empleados (RRHH)',
    'Sistema de Tickets de Soporte',
    'Landing Pages y Embudos de Marketing',
    'Gestión de Inventarios',
    'Plataformas de E-Learning',
    'Otro'
];

export default function CotizacionPage() {
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const refCode = searchParams.get('ref');
        if (refCode) {
            setValue('referral_code_used', refCode);
        }
    }, [searchParams, setValue]);

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'cotizaciones'), {
                nombre: data.nombre,
                telefono: data.telefono || null,
                correo: data.correo,
                proyecto: data.proyecto,
                presupuesto: data.presupuesto,
                descripcion: data.descripcion,
                referralCodeUsed: data.referral_code_used || null,
                status: 'por_atender',
                precioCotizado: null,
                notasAdmin: null,
                createdAt: serverTimestamp(),
            });
            toast.success('¡Cotización enviada con éxito! Nos pondremos en contacto pronto.');
            reset();
        } catch (err) {
            console.error(err);
            toast.error('Ocurrió un error al enviar tu solicitud. Intenta de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-card/80 backdrop-blur-2xl border border-primary/20 shadow-2xl rounded-[2.5rem] overflow-hidden relative"
            >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                
                <div className="bg-gradient-to-b from-primary/10 to-transparent p-6 sm:p-10 md:p-14 text-center border-b border-primary/10 relative">
                    <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay pointer-events-none"></div>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-foreground tracking-tight mb-4 sm:mb-6">
                        Inicia tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]">Visión</span>
                    </h1>
                    <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                        Detalla tu proyecto. Nuestra IA y equipo de ingeniería diseñarán una propuesta tecnológica exclusiva para elevar tu negocio.
                    </p>
                </div>

                <div className="p-5 sm:p-8 md:p-14 relative">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-sm font-bold tracking-wide uppercase text-muted-foreground ml-1">
                                    Nombre Completo
                                </label>
                                <input
                                    {...register('nombre', { required: 'El nombre es obligatorio' })}
                                    placeholder="Ej: Elon Musk"
                                    className="flex h-14 w-full rounded-2xl border border-primary/20 bg-background/50 backdrop-blur-md px-5 py-3 text-base ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                {errors.nombre && <p className="text-sm text-red-400 ml-1">{errors.nombre.message}</p>}
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold tracking-wide uppercase text-muted-foreground ml-1">Teléfono</label>
                                <input
                                    {...register('telefono', { required: 'El teléfono es obligatorio' })}
                                    placeholder="+52 55 1234 5678"
                                    className="flex h-14 w-full rounded-2xl border border-primary/20 bg-background/50 backdrop-blur-md px-5 py-3 text-base ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                {errors.telefono && <p className="text-sm text-red-400 ml-1">{errors.telefono.message}</p>}
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold tracking-wide uppercase text-muted-foreground ml-1">Correo Electrónico</label>
                                <input
                                    type="email"
                                    {...register('correo', {
                                        required: 'El correo es obligatorio',
                                        pattern: { value: /^\S+@\S+$/i, message: 'Correo inválido' }
                                    })}
                                    placeholder="contacto@empresa.com"
                                    className="flex h-14 w-full rounded-2xl border border-primary/20 bg-background/50 backdrop-blur-md px-5 py-3 text-base ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                {errors.correo && <p className="text-sm text-red-400 ml-1">{errors.correo.message}</p>}
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold tracking-wide uppercase text-muted-foreground ml-1">Rango de Inversión (MXN)</label>
                                <select
                                    {...register('presupuesto', { required: 'Selecciona una estimación' })}
                                    className="flex h-14 w-full rounded-2xl border border-primary/20 bg-background/50 backdrop-blur-md px-5 py-3 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all duration-300 text-foreground appearance-none"
                                >
                                    <option value="" className="bg-card">Selecciona una opción</option>
                                    <option value="Menos de $10,000 MXN" className="bg-card">Menos de $10,000 MXN</option>
                                    <option value="$10,000 - $25,000 MXN" className="bg-card">$10,000 - $25,000 MXN</option>
                                    <option value="$25,000 - $50,000 MXN" className="bg-card">$25,000 - $50,000 MXN</option>
                                    <option value="$50,000 - $100,000 MXN" className="bg-card">$50,000 - $100,000 MXN</option>
                                    <option value="Más de $100,000 MXN" className="bg-card">Más de $100,000 MXN</option>
                                </select>
                                {errors.presupuesto && <p className="text-sm text-red-400 ml-1">{errors.presupuesto.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold tracking-wide uppercase text-muted-foreground ml-1">Solución Core</label>
                            <select
                                {...register('proyecto', { required: 'Selecciona el tipo principal' })}
                                className="flex h-14 w-full rounded-2xl border border-primary/20 bg-background/50 backdrop-blur-md px-5 py-3 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all duration-300 text-foreground appearance-none"
                            >
                                <option value="" className="bg-card">¿Qué desarrollo tecnológico buscas?</option>
                                {opcionesProyecto.map(opt => (
                                    <option key={opt} value={opt} className="bg-card">{opt}</option>
                                ))}
                            </select>
                            {errors.proyecto && <p className="text-sm text-red-400 ml-1">{errors.proyecto.message}</p>}
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold tracking-wide uppercase text-muted-foreground ml-1">Especificaciones del Proyecto</label>
                            <textarea
                                {...register('descripcion', {
                                    required: 'Por favor, describe tu idea para que nuestra IA pueda analizarla.',
                                    minLength: { value: 20, message: 'La descripción debe ser al menos de 20 caracteres detallando tu visión.' }
                                })}
                                placeholder="Describe a detalle tus objetivos, el problema que resuelves, tu público objetivo y las integraciones clave..."
                                className="flex min-h-[180px] w-full rounded-2xl border border-primary/20 bg-background/50 backdrop-blur-md px-5 py-4 text-base ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all duration-300 resize-y"
                            />
                            {errors.descripcion && <p className="text-sm text-red-400 ml-1">{errors.descripcion.message}</p>}
                        </div>

                        {/* Campo de Código de Referido */}
                        <div className="bg-primary/5 border border-dashed border-primary/30 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 space-y-4 relative overflow-hidden group hover:border-primary/50 transition-colors duration-500">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <label className="relative z-10 text-sm font-bold tracking-wide uppercase text-foreground flex items-center gap-3">
                                <span className="text-xl">🤝</span> Alianza Estratégica <span className="text-xs font-normal opacity-60 normal-case">(Opcional)</span>
                            </label>
                            <input
                                {...register('referral_code_used')}
                                placeholder="Código de Partner, ej: MSI-LUXURY"
                                className="relative z-10 flex h-14 w-full rounded-xl border border-primary/20 bg-background/80 backdrop-blur-md px-5 py-3 text-base ring-offset-background placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all duration-300 uppercase font-mono tracking-widest"
                                onChange={(e) => e.target.value = e.target.value.toUpperCase()}
                            />
                            <p className="relative z-10 text-sm text-muted-foreground font-light">Si fuiste referido por un partner exclusivo, ingresa su código para beneficios preferenciales.</p>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-16 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B5952F] text-black hover:from-[#F3E5AB] hover:to-[#D4AF37] px-10 py-3 text-lg font-extrabold shadow-[0_0_40px_rgba(212,175,55,0.3)] hover:shadow-[0_0_60px_rgba(212,175,55,0.5)] transition-all duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1"
                            >
                                {isSubmitting ? 'Procesando Solicitud...' : 'Solicitar Propuesta Exclusiva'}
                                {!isSubmitting && <FiSend className="ml-3 w-6 h-6" />}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
