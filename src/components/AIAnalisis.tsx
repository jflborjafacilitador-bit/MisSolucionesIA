import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FiCpu, FiLoader } from 'react-icons/fi';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY!);

interface Props {
    data: {
        nombre: string;
        proyecto: string;
        presupuesto: string;
        descripcion: string;
    };
}

export default function AIAnalisis({ data }: Props) {
    const [analysisData, setAnalysisData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const analyzeRequest = async () => {
        setLoading(true);
        setError('');
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const prompt = `
        Tengo un cliente llamado ${data.nombre} que está interesado en un proyecto de tipo "${data.proyecto}".
        Su presupuesto indicado es: ${data.presupuesto}.
        
        La descripción de su idea es la siguiente:
        "${data.descripcion}"
        
        Como experto en desarrollo de software y ventas B2B, analiza esto y responde ÚNICAMENTE con un objeto JSON válido con la siguiente estructura exacta:
        {
          "interpretacion": "Breve interpretación de lo que busca el cliente y características técnicas principales.",
          "analisisPresupuesto": "Análisis breve de si su presupuesto es realista.",
          "costoCreacion": "Rango estimado en MXN de lo que deberíamos cobrar por el desarrollo inicial (ej. $15,000 - $25,000 MXN).",
          "costoMensualidad": "Rango estimado en MXN de lo que deberíamos cobrar de mensualidad por mantenimiento y soporte (ej. $2,000 - $5,000 MXN).",
          "estrategiaVentas": "Breve estrategia de ventas recomendada para convencer al cliente."
        }
        NO incluyas formato markdown (\`\`\`json etc), solo el objeto JSON crudo en texto plano.
      `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            const parsedData = JSON.parse(text);
            setAnalysisData(parsedData);
        } catch (err: any) {
            console.error(err);
            setError(`Error: ${err.message || 'Error al generar el análisis. Verifica la API Key y la conexión.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-6 border border-border bg-muted/20 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                    <FiCpu className="w-5 h-5" /> Análisis con AI (Gemini)
                </h3>
                {!analysisData && !loading && (
                    <button
                        onClick={analyzeRequest}
                        className="text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
                    >
                        Generar Análisis Inteligente
                    </button>
                )}
            </div>

            {loading && (
                <div className="flex items-center justify-center gap-3 text-muted-foreground py-12">
                    <FiLoader className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-lg font-medium">Analizando con Inteligencia Artificial...</span>
                </div>
            )}

            {error && <p className="text-sm text-destructive p-4 bg-destructive/10 rounded-md border border-destructive/20">{error}</p>}

            {analysisData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="col-span-1 md:col-span-2 bg-background p-5 rounded-lg border border-border shadow-sm">
                        <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                            Interpretación del Requerimiento
                        </h4>
                        <p className="text-sm text-foreground/80 leading-relaxed">{analysisData.interpretacion}</p>
                    </div>

                    <div className="bg-background p-5 rounded-lg border border-border shadow-sm">
                        <h4 className="text-sm font-semibold text-primary mb-2">Presupuesto del Cliente</h4>
                        <p className="text-sm text-foreground/80 leading-relaxed mb-4">{analysisData.analisisPresupuesto}</p>

                        <div className="space-y-3 pt-3 border-t border-border">
                            <div>
                                <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Costo Estimado de Creación</h5>
                                <p className="text-lg font-bold text-green-600 dark:text-green-400">{analysisData.costoCreacion}</p>
                            </div>
                            <div>
                                <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Mensualidad por Mantenimiento</h5>
                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{analysisData.costoMensualidad}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-background p-5 rounded-lg border border-border shadow-sm">
                        <h4 className="text-sm font-semibold text-primary mb-2">Estrategia de Ventas Recomendada</h4>
                        <p className="text-sm text-foreground/80 leading-relaxed">{analysisData.estrategiaVentas}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
