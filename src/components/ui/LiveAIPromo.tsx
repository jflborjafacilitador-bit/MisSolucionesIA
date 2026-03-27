import { useState } from 'react';
import { motion } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FiCpu, FiSend, FiLoader } from 'react-icons/fi';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY!);

export default function LiveAIPromo() {
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [interactionCount, setInteractionCount] = useState(0);

    const handleSend = async () => {
        if (!input.trim() || interactionCount >= 3) return;

        const userText = input;
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setInput('');
        setLoading(true);

        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const prompt = `Actúa como una IA muy inteligente, concisa (máx 3 líneas) y persuasiva de una consultora Premium llamada "MisSolucionesIA". Responde a esta curiosidad de un visitante: "${userText}"`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            setMessages(prev => [...prev, { role: 'ai', text: response.text() }]);
            setInteractionCount(prev => prev + 1);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'ai', text: 'Nuestros servidores cuánticos están calibrándose o han detectado tráfico inusual. Intenta más tarde.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="py-24 bg-background border-y border-border/30 relative overflow-hidden">
            {/* Background gradient orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="max-w-4xl mx-auto px-8 relative z-10">
                <div className="text-center mb-12">
                    <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase mb-3 block">Neural Playground</span>
                    <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Interactúa con el Futuro, Hoy.</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto">Pon a prueba nuestro motor base de inteligencia artificial. Tienes 3 consultas anónimas disponibles para desafiarnos.</p>
                </div>

                <div className="bg-card/40 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl overflow-hidden flex flex-col h-[400px]">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-border">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/60 transition-opacity">
                                <FiCpu className="w-12 h-12 mb-4 opacity-50" />
                                <p className="text-sm">Escribe "Hola, ¿qué puede hacer MisSoluciones por mi empresa?"</p>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                key={i} 
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[75%] p-4 rounded-xl text-sm ${
                                    msg.role === 'user' 
                                        ? 'bg-foreground text-background rounded-br-none' 
                                        : 'bg-muted/50 text-foreground border border-border rounded-bl-none'
                                }`}>
                                    {msg.text}
                                </div>
                            </motion.div>
                        ))}
                        {loading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                <div className="bg-muted/50 border border-border p-4 rounded-xl rounded-bl-none flex items-center gap-2">
                                    <FiLoader className="w-4 h-4 animate-spin text-primary" />
                                    <span className="text-xs text-muted-foreground">Procesando sinapsis...</span>
                                </div>
                            </motion.div>
                        )}
                    </div>
                    
                    <div className="p-4 bg-muted/20 border-t border-border/50 flex gap-3 items-center">
                        <div className="text-[10px] font-bold tracking-widest text-primary bg-primary/10 px-2 py-1 rounded shrink-0" title="Consultas Restantes">
                            0{3 - interactionCount}
                        </div>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            disabled={loading || interactionCount >= 3}
                            placeholder={interactionCount >= 3 ? "Límite de demostración alcanzado." : "Escribe tu duda o curiosidad técnica aquí..."}
                            className="flex-1 bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50 shadow-inner"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!input.trim() || loading || interactionCount >= 3}
                            className="bg-primary text-primary-foreground p-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center shrink-0 cursor-pointer"
                        >
                            <FiSend className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
