import { Outlet, Link } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import { FiSun, FiMoon, FiSettings, FiBell, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../lib/AuthContext';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { requestNotificationPermission, showNotification } from '../lib/notifications';
import { useRegisterSW } from 'virtual:pwa-register/react';

// Declare the global injected by vite define
declare const __APP_VERSION__: string;
const APP_VERSION: string = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0';

export default function Layout() {
    const { user, isAdmin } = useAuth();
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
    });
    const [notifGranted, setNotifGranted] = useState(false);
    const seenIds = useRef<Set<string>>(new Set());
    const initialized = useRef(false);

    // PWA auto-update hook
    const {
        needRefresh: [needRefresh],
        updateServiceWorker,
    } = useRegisterSW();

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

    // Request notification permission when admin logs in
    useEffect(() => {
        if (isAdmin) {
            requestNotificationPermission().then(setNotifGranted);
        }
    }, [isAdmin]);

    // Listen for new cotizaciones and fire notifications
    useEffect(() => {
        if (!isAdmin) return;

        const q = query(
            collection(db, 'cotizaciones'),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        const unsub = onSnapshot(q, (snap) => {
            if (!initialized.current) {
                // First load — mark all as already seen
                snap.docs.forEach(d => seenIds.current.add(d.id));
                initialized.current = true;
                return;
            }
            snap.docChanges().forEach(change => {
                if (change.type === 'added' && !seenIds.current.has(change.doc.id)) {
                    seenIds.current.add(change.doc.id);
                    const data = change.doc.data();
                    showNotification(
                        '🆕 Nueva solicitud',
                        `${data.nombre || 'Alguien'} solicitó: ${data.proyecto || 'un proyecto'}`
                    );
                }
            });
        });

        return () => unsub();
    }, [isAdmin]);

    const handleEnableNotifications = useCallback(async () => {
        const ok = await requestNotificationPermission();
        setNotifGranted(ok);
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">

            {/* PWA Update Banner */}
            {needRefresh && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-primary text-primary-foreground px-5 py-3 rounded-full shadow-2xl text-sm font-semibold animate-bounce-slow">
                    <FiRefreshCw className="w-4 h-4 animate-spin" />
                    <span>Nueva versión disponible</span>
                    <button
                        onClick={() => updateServiceWorker(true)}
                        className="bg-white text-primary px-3 py-1 rounded-full text-xs font-bold hover:bg-white/90 transition-colors"
                    >
                        Actualizar
                    </button>
                </div>
            )}

            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-foreground">
                <div className="container flex h-16 items-center justify-between mx-auto px-4 md:px-8">
                    <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter text-primary">
                        <img src="/icons/icon-192.png" alt="Logo" className="w-8 h-8 rounded-lg" />
                        MisSoluciones
                    </Link>

                    <nav className="flex items-center gap-4 sm:gap-6">
                        {!user && (
                            <Link to="/cotizacion" className="text-sm font-medium transition-colors hover:text-primary hidden sm:inline-block">
                                Cotización
                            </Link>
                        )}

                        <div className="flex items-center gap-2 sm:gap-4">
                            {/* Notification permission button (admin only, when not granted) */}
                            {isAdmin && !notifGranted && (
                                <button
                                    onClick={handleEnableNotifications}
                                    title="Activar notificaciones de nuevas solicitudes"
                                    className="p-2 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors text-amber-500"
                                >
                                    <FiBell className="w-5 h-5" />
                                </button>
                            )}
                            {isAdmin && notifGranted && (
                                <span title="Notificaciones activas" className="text-green-500">
                                    <FiBell className="w-4 h-4" />
                                </span>
                            )}

                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
                                aria-label="Toggle theme"
                            >
                                {theme === 'light' ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
                            </button>

                            {user ? (
                                <Link
                                    to={isAdmin ? '/admin' : '/partner'}
                                    className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground h-9 sm:h-10 px-4 py-2"
                                >
                                    <FiSettings className="w-4 h-4" />
                                    {isAdmin ? 'Admin' : 'Mi Panel'}
                                </Link>
                            ) : (
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 sm:h-10 px-4 py-2"
                                >
                                    Acceder
                                </Link>
                            )}
                        </div>
                    </nav>
                </div>
            </header>

            <main className="flex-1 w-full flex flex-col">
                <Outlet />
            </main>

            <footer className="border-t border-border py-8 md:py-12 bg-card text-card-foreground">
                <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 text-lg font-bold tracking-tighter text-primary">
                        <img src="/icons/icon-192.png" alt="Logo" className="w-6 h-6 rounded-md" />
                        MisSoluciones
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                        &copy; {new Date().getFullYear()} MisSoluciones IA. Todos los derechos reservados.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="text-xs font-mono text-muted-foreground/60">v{APP_VERSION}</span>
                        <Link to="#" className="hover:underline hover:text-foreground">Términos</Link>
                        <Link to="#" className="hover:underline hover:text-foreground">Privacidad</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
