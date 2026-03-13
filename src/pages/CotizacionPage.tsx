import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
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
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('cotizaciones')
                .insert([
                    {
                        nombre: data.nombre,
                        telefono: data.telefono,
                        correo: data.correo,
                        proyecto: data.proyecto,
                        presupuesto: data.presupuesto,
                        descripcion: data.descripcion
                    }
                ]);

            if (error) {
                console.error('Supabase error:', error);
                toast.error('Hubo un error al enviar tu solicitud. Intenta de nuevo.');
            } else {
                toast.success('¡Cotización enviada con éxito! Nos pondremos en contacto pronto.');
                reset();
            }
        } catch (err) {
            console.error(err);
            toast.error('Ocurrió un error inesperado.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-card border border-border/50 shadow-xl rounded-2xl overflow-hidden"
            >
                <div className="bg-primary/10 p-8 md:p-12 text-center border-b border-border/50">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4">
                        Cuéntanos sobre tu <span className="text-primary">Proyecto</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Completa el siguiente formulario con los detalles de tu idea. Utilizaremos inteligencia artificial para analizar tus requerimientos y ofrecerte una propuesta personalizada.
                    </p>
                </div>

                <div className="p-8 md:p-12">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Nombre Completo
                                </label>
                                <input
                                    {...register('nombre', { required: 'El nombre es obligatorio' })}
                                    placeholder="Ej: Elon Musk"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Teléfono (Opcional)</label>
                                <input
                                    {...register('telefono')}
                                    placeholder="Tu número telefónico"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Correo Electrónico</label>
                                <input
                                    type="email"
                                    {...register('correo', {
                                        required: 'El correo es obligatorio',
                                        pattern: { value: /^\S+@\S+$/i, message: 'Correo inválido' }
                                    })}
                                    placeholder="ejemplo@correo.com"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                />
                                {errors.correo && <p className="text-sm text-destructive">{errors.correo.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Presupuesto Estimado (MXN)</label>
                                <select
                                    {...register('presupuesto', { required: 'Selecciona un presupuesto' })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-foreground"
                                >
                                    <option value="">Selecciona una opción</option>
                                    <option value="Menos de $10,000 MXN">Menos de $10,000 MXN</option>
                                    <option value="$10,000 - $25,000 MXN">$10,000 - $25,000 MXN</option>
                                    <option value="$25,000 - $50,000 MXN">$25,000 - $50,000 MXN</option>
                                    <option value="$50,000 - $100,000 MXN">$50,000 - $100,000 MXN</option>
                                    <option value="Más de $100,000 MXN">Más de $100,000 MXN</option>
                                </select>
                                {errors.presupuesto && <p className="text-sm text-destructive">{errors.presupuesto.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Tipo de Proyecto</label>
                            <select
                                {...register('proyecto', { required: 'Selecciona el tipo principal' })}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-foreground"
                            >
                                <option value="">¿Qué necesitas desarrollar?</option>
                                {opcionesProyecto.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            {errors.proyecto && <p className="text-sm text-destructive">{errors.proyecto.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Descripción de la Idea</label>
                            <textarea
                                {...register('descripcion', {
                                    required: 'Por favor, describe tu idea para que nuestra IA pueda analizarla.',
                                    minLength: { value: 20, message: 'La descripción debe ser al menos de 20 caracteres.' }
                                })}
                                placeholder="Explica qué quieres lograr, cuáles son tus requerimientos principales y qué problema resuelve esta aplicación..."
                                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                            />
                            {errors.descripcion && <p className="text-sm text-destructive">{errors.descripcion.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 py-2 text-base font-semibold shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Enviando...' : 'Enviar Cotización'}
                            {!isSubmitting && <FiSend className="ml-2 w-5 h-5" />}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
