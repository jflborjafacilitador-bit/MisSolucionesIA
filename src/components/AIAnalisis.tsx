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
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const analyzeRequest = async () => {
        setLoading(true);
        setError('');
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

            const prompt = `
        Tengo un cliente llamado ${data.nombre} que está interesado en un proyecto de tipo "${data.proyecto}".
        Su presupuesto indicado es: ${data.presupuesto}.
        
        La descripción de su idea es la siguiente:
        "${data.descripcion}"
        
        Como experto en desarrollo de software y ventas B2B, analiza esto:
        1. Interpreta detalladamente qué es lo que busca el cliente y cuáles son las características técnicas principales que requiere.
        2. Analiza si su presupuesto es realista.
        3. Cuánto podríamos cobrar realmente por este proyecto (escribe un rango estimado en Pesos Mexicanos MXN).
        4. ¿Qué estrategia de ventas deberíamos abordar con este cliente para convencerlo?
        
        Responde sin usar formato Markdown complejo (evita negritas marcadas con **), utiliza listas con guiones simples para que sea fácil de leer en texto plano.
      `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            setAnalysis(response.text());
        } catch (err: any) {
            console.error(err);
            setError('Error al generar el análisis. Verifica la API Key y la conexión.');
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
                {!analysis && !loading && (
                    <button
                        onClick={analyzeRequest}
                        className="text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
                    >
                        Generar Resumen y Cotización
                    </button>
                )}
            </div>

            {loading && (
                <div className="flex items-center justify-center gap-3 text-muted-foreground py-8">
                    <FiLoader className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-base font-medium">Analizando requerimientos con Gemini...</span>
                </div>
            )}

            {error && <p className="text-sm text-destructive p-4 bg-destructive/10 rounded-md">{error}</p>}

            {analysis && (
                <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed mt-4 bg-background p-6 rounded-lg border border-border/50 shadow-inner">
                    {analysis}
                </div>
            )}
        </div>
    );
}
