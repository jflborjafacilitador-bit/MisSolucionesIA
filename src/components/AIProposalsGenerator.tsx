import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FiCpu, FiLoader, FiZap, FiTarget, FiDollarSign, FiList } from 'react-icons/fi';
import { toast } from 'sonner';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY!);

interface ProposalResponse {
    resumenCliente: string;
    solucionPropuesta: string;
    presupuestoEstimado: string;
    planDePagos: string;
    puntosDeVenta: string[];
}

export default function AIProposalsGenerator() {
    const [promptInput, setPromptInput] = useState('');
    const [proposal, setProposal] = useState<ProposalResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generateProposal = async () => {
        if (!promptInput.trim()) {
            toast.error('Por favor escribe el contexto del cliente o proyecto primero.');
            return;
        }

        setLoading(true);
        setError('');
        setProposal(null);
        
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const prompt = `
Eres un experto consultor técnico de ventas B2B para una agencia de desarrollo de software e inteligencia artificial llamada "MisSolucionesIA".

He aquí la solicitud, idea o contexto de un cliente potencial que me interesa cerrar:
"${promptInput}"

Tu tarea es analizar esto y entregarme una ESTRUCTURA DE PARÁMETROS JSON VÁLIDOS (sin markdown, solo el objeto raw) para que yo pueda presentar esta propuesta y venderle el sistema.
El JSON debe tener estrictamente esta estructura exacta:
{
  "resumenCliente": "Una breve frase interpretando cuál es el verdadero dolor comercial o necesidad de este cliente.",
  "solucionPropuesta": "Describe en 2-3 párrafos máximo cuál sería la solución ideal (Ej: Una webapp con estas 3 características clave) orientada a dar impresiones 'premium'.",
  "presupuestoEstimado": "Dime el rango en MXN (Ej. $20,000 - $35,000 MXN) que deberíamos cobrarle de enganche o desarrollo.",
  "planDePagos": "Sugerencia de mensualidad de mantenimiento (Ej. $3,000 MXN mensuales por soporte y host).",
  "puntosDeVenta": [
     "Viñeta 1: Un argumento fuerte de cómo esto le ahorra dinero o gana tiempo.",
     "Viñeta 2: Otra razón para elegirnos.",
     "Viñeta 3: ...etc"
  ]
}
No envíes texto fuera de las llaves { }.
`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            const parsedData = JSON.parse(text) as ProposalResponse;
            setProposal(parsedData);
            toast.success('Propuesta generada exitosamente');
        } catch (err: any) {
            console.error(err);
            setError(`Error al consultar la IA: ${err.message || 'Verifica la API key.'}`);
            toast.error('Ocurrió un error al generar la propuesta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30 shadow-inner">
                    <FiCpu className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Generador de Propuestas IA</h2>
                    <p className="text-sm text-muted-foreground">Describe a tu cliente y la idea, Gemini te devolverá un plan de ataque para venderle.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Panel de Input */}
                <div className="col-span-1 lg:col-span-5 bg-background border border-border/80 rounded-xl p-5 shadow-sm h-fit">
                    <label className="block text-sm font-bold tracking-wide uppercase text-foreground/80 mb-3">Contexto del Cliente / Proyecto</label>
                    <textarea 
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        placeholder="Ej: Tengo un cliente que tiene una red de 5 ferreterías. Actualmente llevan su inventario en libretas y no saben cuánto venden por día. Quieren algo moderno pero muy fácil de usar porque sus empleados no son técnicos y no tienen gran presupuesto."
                        className="w-full h-48 resize-none bg-muted/30 border border-input rounded-lg p-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all mb-4"
                    />
                    
                    <button 
                        onClick={generateProposal}
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                    >
                        {loading ? (
                            <><FiLoader className="w-5 h-5 animate-spin" /> Analizando contexto...</>
                        ) : (
                            <><FiZap className="w-5 h-5 text-yellow-300" /> Generar Propuesta Standalone </>
                        )}
                    </button>
                    {error && (
                        <p className="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">{error}</p>
                    )}
                </div>

                {/* Panel de Output */}
                <div className="col-span-1 lg:col-span-7">
                    {loading ? (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-muted/10 p-10">
                            <FiCpu className="w-12 h-12 text-primary/40 animate-pulse mb-4" />
                            <h3 className="text-lg font-bold text-foreground">Creando magia comercial...</h3>
                            <p className="text-sm text-muted-foreground text-center max-w-sm mt-2">Gemini está estructurando la solución técnica y calculando costos para maximizar las chances de venta.</p>
                        </div>
                    ) : proposal ? (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                            
                            <div className="bg-background border border-border/80 rounded-xl p-6 shadow-md border-t-4 border-t-primary">
                                <h3 className="text-sm font-black uppercase text-primary mb-2 flex items-center gap-2">
                                    <FiTarget /> Interpretación del Dolor
                                </h3>
                                <p className="text-foreground font-medium">{proposal.resumenCliente}</p>
                            </div>

                            <div className="bg-background border border-border/80 rounded-xl p-6 shadow-sm">
                                <h3 className="text-sm font-black uppercase tracking-wide text-foreground/70 mb-3 border-b border-border pb-2">Estructura de la Solución Propuesta</h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{proposal.solucionPropuesta}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-xl p-5 shadow-sm">
                                    <h3 className="text-xs font-bold uppercase text-green-700 dark:text-green-500 mb-1 flex items-center gap-1">
                                        <FiDollarSign /> Desarrollo Inicial
                                    </h3>
                                    <p className="text-2xl font-black text-green-700 dark:text-green-400">{proposal.presupuestoEstimado}</p>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-xl p-5 shadow-sm">
                                    <h3 className="text-xs font-bold uppercase text-blue-700 dark:text-blue-500 mb-1 flex items-center gap-1">
                                        <FiDollarSign /> Retención (Mensualidad)
                                    </h3>
                                    <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{proposal.planDePagos}</p>
                                </div>
                            </div>

                            <div className="bg-background border border-border/80 rounded-xl p-6 shadow-sm">
                                <h3 className="text-sm font-black uppercase tracking-wide text-foreground/70 mb-4 flex items-center gap-2">
                                    <FiList /> Puntos de Venta (Argumentos)
                                </h3>
                                <ul className="space-y-3">
                                    {proposal.puntosDeVenta.map((punto, idx) => (
                                        <li key={idx} className="flex gap-3 text-sm">
                                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">{idx + 1}</span>
                                            <span className="text-muted-foreground pt-0.5">{punto}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-muted/10 p-10 text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary/40 mb-4">
                                <FiZap className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-foreground">Esperando instrucciones...</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mt-2">Escribe el caso de negocio en el panel izquierdo y dale clic a generar para ver tu propuesta en segundos.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
