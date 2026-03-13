import { Outlet, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function Layout() {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-foreground">
                <div className="container flex h-16 items-center justify-between mx-auto px-4 md:px-8">
                    <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter text-primary">
                        <span className="bg-primary text-primary-foreground px-2 py-1 rounded-md">IA</span>
                        MisSoluciones
                    </Link>

                    <nav className="flex items-center gap-4 sm:gap-6">
                        <Link to="/cotizacion" className="text-sm font-medium transition-colors hover:text-primary hidden sm:inline-block">
                            Cotización
                        </Link>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
                                aria-label="Toggle theme"
                            >
                                {theme === 'light' ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
                            </button>
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 sm:h-10 px-4 py-2"
                            >
                                Acceder
                            </Link>
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
                        <span className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm">IA</span>
                        MisSoluciones
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                        &copy; {new Date().getFullYear()} MisSoluciones IA. Todos los derechos reservados.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <Link to="#" className="hover:underline hover:text-foreground">Términos</Link>
                        <Link to="#" className="hover:underline hover:text-foreground">Privacidad</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
