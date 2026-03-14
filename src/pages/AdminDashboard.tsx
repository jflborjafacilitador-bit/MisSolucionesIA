import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, orderBy, query, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import AIAnalisis from '../components/AIAnalisis';
import { FiLogOut, FiMail, FiPhone, FiDollarSign, FiClock, FiUsers, FiBarChart2, FiToggleLeft, FiToggleRight, FiCopy, FiUserPlus, FiTrash2, FiSave, FiLink, FiExternalLink, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'sonner';
import { createMPPreference } from '../lib/mercadopago';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import KanbanBoard from '../components/KanbanBoard';
import { FiList, FiGrid, FiFileText } from 'react-icons/fi';
import jsPDF from 'jspdf';

type CotizacionStatus = 'por_atender' | 'en_proceso' | 'atendida' | 'descartada';

interface Cotizacion {
    id: string;
    nombre: string;
    telefono?: string;
    correo: string;
    proyecto: string;
    presupuesto: string;
    descripcion: string;
    createdAt: any;
    referralCodeUsed?: string | null;
    status: CotizacionStatus;
    precioCotizado?: number | null;
    mensualidadMantenimiento?: number | null;
    notasAdmin?: string | null;
    linkPago?: string | null;
}

interface Partner {
    id: string;
    email?: string;
    fullName?: string;
    phone?: string;
    isPartner: boolean;
    partnerCode?: string | null;
}

type ActiveTab = 'solicitudes' | 'partners' | 'referidos' | 'facturacion';

const FIREBASE_API_KEY = 'AIzaSyCgPww2i15SPqZncEdWbQaFmN8HpY2CUt0';

export default function AdminDashboard() {
    const { user, isAdmin, loading: authLoading, logout } = useAuth();
    const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [selected, setSelected] = useState<Cotizacion | null>(null);
    const [activeTab, setActiveTab] = useState<ActiveTab>('solicitudes');
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<CotizacionStatus | 'todas'>('todas');
    const [priceInput, setPriceInput] = useState('');
    const [mensualidadInput, setMensualidadInput] = useState('');
    const [notasInput, setNotasInput] = useState('');
    const [generatingLink, setGeneratingLink] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentTitle, setPaymentTitle] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [viewMode, setViewMode] = useState<'lista' | 'kanban'>('lista');
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [invitePassword, setInvitePassword] = useState('');
    const [invitePhone, setInvitePhone] = useState('');
    const [inviteName, setInviteName] = useState('');
    const [inviting, setInviting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (authLoading) return;
        if (!user) { navigate('/login'); return; }
        if (!isAdmin) { navigate('/partner'); return; }  // B2: partner no puede acceder al admin
        fetchAll();
    }, [user, isAdmin, authLoading, navigate]);

    const fetchAll = async () => {
        setDataLoading(true);
        await Promise.all([fetchCotizaciones(), fetchPartners()]);
        setDataLoading(false);
    };

    const fetchCotizaciones = async () => {
        const q = query(collection(db, 'cotizaciones'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setCotizaciones(snap.docs.map(d => ({ id: d.id, ...d.data() } as Cotizacion)));
    };

    const fetchPartners = async () => {
        const snap = await getDocs(collection(db, 'users'));
        setPartners(
            snap.docs
                .map(d => ({ id: d.id, ...d.data() } as Partner))
                .filter(u => !('isAdmin' in u && (u as any).isAdmin))
        );
    };

    const statusConfig: Record<CotizacionStatus, { label: string; color: string; dot: string }> = {
        por_atender: { label: 'Por Atender', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', dot: 'bg-yellow-400' },
        en_proceso: { label: 'En Proceso', color: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-400' },
        atendida: { label: 'Atendida', color: 'bg-green-100 text-green-800 border-green-200', dot: 'bg-green-400' },
        descartada: { label: 'Descartada', color: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-400' },
    };

    const updateCotizacion = async (id: string, updates: Partial<Cotizacion>) => {
        await updateDoc(doc(db, 'cotizaciones', id), updates);
        setCotizaciones(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        if (selected?.id === id) setSelected(prev => prev ? { ...prev, ...updates } : null);
        toast.success('Actualizado.');
    };

    const deleteCotizacion = async (id: string) => {
        if (!confirm('¿Eliminar esta solicitud?')) return;
        await deleteDoc(doc(db, 'cotizaciones', id));
        setCotizaciones(prev => prev.filter(c => c.id !== id));
        if (selected?.id === id) setSelected(null);
        toast.success('Solicitud eliminada.');
    };

    const openPaymentModal = () => {
        if (!selected || !selected.precioCotizado) return;
        setPaymentTitle(selected.proyecto || '');
        setPaymentAmount(String(selected.precioCotizado));
        setShowPaymentModal(true);
    };

    const generatePaymentLink = async () => {
        if (!selected) return;
        const amount = parseFloat(paymentAmount);
        if (!amount || amount <= 0) { toast.error('El monto debe ser mayor a 0'); return; }
        setGeneratingLink(true);
        setShowPaymentModal(false);
        try {
            const link = await createMPPreference({
                title: `${paymentTitle} — MisSolucionesIA`,
                amount,
                clientEmail: selected.correo,
                externalRef: selected.id,
            });
            await updateCotizacion(selected.id, { linkPago: link });
            navigator.clipboard.writeText(link);
            toast.success('¡Link de pago generado y copiado al portapapeles!');
        } catch (e: any) {
            toast.error(`Error al generar link: ${e.message}`);
        } finally {
            setGeneratingLink(false);
        }
    };

    const generateContractPDF = () => {
        if (!selected) return;
        const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
        const W = 210;
        const M = 20; // left margin
        const MR = W - M; // right margin
        const textW = W - M * 2;
        let y = 0;

        const PURPLE = [108, 99, 255] as [number, number, number];
        const DARK = [25, 25, 40] as [number, number, number];
        const GRAY = [120, 120, 130] as [number, number, number];
        const LIGHT = [245, 245, 250] as [number, number, number];

        const fecha = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
        const folioNum = `MSI-${Date.now().toString().slice(-6)}`;

        // ── HEADER BAND ───────────────────────────────────────────────
        pdf.setFillColor(...PURPLE);
        pdf.rect(0, 0, W, 24, 'F');

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('MisSolucionesIA', M, 10);
        pdf.setFontSize(8.5);
        pdf.setFont('helvetica', 'normal');
        pdf.text('missolucionesia.com  |  soporte@missolucionesia.com', M, 16);

        // Folio top-right
        pdf.setFontSize(8);
        pdf.text(`Folio: ${folioNum}`, MR - 30, 10);
        pdf.text(`Fecha: ${fecha}`, MR - 30, 15);

        // ── TITLE ─────────────────────────────────────────────────────
        y = 33;
        pdf.setTextColor(...DARK);
        pdf.setFontSize(15);
        pdf.setFont('helvetica', 'bold');
        pdf.text('ACUERDO DE PRESTACIÓN DE SERVICIOS', W / 2, y, { align: 'center' });
        y += 2;
        pdf.setFillColor(...PURPLE);
        pdf.rect(M, y, textW, 0.8, 'F');
        y += 7;

        // ── PARTIES SECTION ───────────────────────────────────────────
        const addSection = (title: string) => {
            y += 3;
            pdf.setFillColor(...LIGHT);
            pdf.rect(M, y - 4, textW, 7, 'F');
            pdf.setFontSize(9.5);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...PURPLE);
            pdf.text(title, M + 2, y);
            pdf.setTextColor(...DARK);
            y += 6;
        };

        const addLine = (label: string, value: string, bold = false) => {
            pdf.setFontSize(8.5);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...GRAY);
            pdf.text(label, M, y);
            pdf.setFont('helvetica', bold ? 'bold' : 'normal');
            pdf.setTextColor(...DARK);
            const lines = pdf.splitTextToSize(value || '—', textW - 45);
            pdf.text(lines, M + 45, y);
            y += lines.length * 5;
        };

        const addClause = (num: string, title: string, body: string) => {
            if (y > 255) { pdf.addPage(); y = 20; }
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...DARK);
            pdf.text(`${num}. ${title}`, M, y);
            y += 5;
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8.5);
            pdf.setTextColor(60, 60, 70);
            const lines = pdf.splitTextToSize(body, textW);
            pdf.text(lines, M, y);
            y += lines.length * 4.5 + 3;
        };

        addSection('PARTES DEL ACUERDO');
        addLine('Proveedor:', 'MisSolucionesIA');
        addLine('Representante:', 'Joseph Frank Lolek Borja Bonilla');
        addLine('Sitio web:', 'missolucionesia.com');
        addLine('Soporte:', 'soporte@missolucionesia.com');
        y += 2;
        addLine('Cliente:', selected.nombre, true);
        addLine('Correo:', selected.correo);
        if (selected.telefono) addLine('Teléfono:', selected.telefono);

        addSection('DATOS DEL SERVICIO');
        addLine('Concepto:', paymentTitle || selected.proyecto, true);
        addLine('Monto total:', `$${parseFloat(paymentAmount || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })} MXN`, true);
        addLine('Fecha del acuerdo:', fecha);
        addLine('Folio:', folioNum);

        addSection('TÉRMINOS Y CONDICIONES');
        y += 1;

        addClause('1', 'OBJETO DEL CONTRATO',
            `El Proveedor se compromete a desarrollar y entregar el servicio descrito en la sección "Datos del Servicio", conforme al alcance funcional acordado verbalmente o por escrito entre las partes antes de la firma del presente documento.`);

        addClause('2', 'CONDICIONES DE PAGO',
            `El Cliente se compromete a realizar el pago del 50% del monto total ($${(parseFloat(paymentAmount || '0') / 2).toLocaleString(undefined, { maximumFractionDigits: 2 })} MXN) como anticipo para el inicio del proyecto. El 50% restante se liquidará al momento de la entrega del entregable principal. El no pago en el plazo acordado dará derecho al Proveedor a suspender el proyecto sin responsabilidad.`);

        addClause('3', 'PROPIEDAD INTELECTUAL',
            `El código fuente, diseño, interfaces, bases de datos y materiales desarrollados por el Proveedor son propiedad exclusiva de MisSolucionesIA hasta la liquidación total del monto acordado. Una vez realizado el pago completo, el Cliente obtiene una licencia de uso exclusivo del sistema para sus fines comerciales propios.`);

        addClause('4', 'RESTRICCIÓN DE USO Y NO REPLICACIÓN',
            `El sistema, software o solución entregado NO podrá ser: (a) revendido o sublicenciado a terceros, (b) reproducido, clonado o reutilizado como base para ofrecer servicios similares a otras empresas, (c) modificado para fines distintos a los acordados sin autorización previa por escrito del Proveedor. El incumplimiento de esta cláusula otorga al Proveedor el derecho de exigir compensación económica equivalente al doble del monto original del contrato.`);

        addClause('5', 'CONFIDENCIALIDAD Y COMUNICACIONES',
            `Ambas partes acuerdan mantener en estricta confidencialidad cualquier información técnica, comercial, financiera o estratégica intercambiada durante la vigencia del proyecto. Esta obligación permanece vigente por 2 (dos) años posteriores a la entrega. Toda comunicación oficial deberá realizarse a través del correo electrónico soporte@missolucionesia.com o el canal escrito acordado entre las partes.`);

        addClause('6', 'MODIFICACIONES DE ALCANCE',
            `Cualquier funcionalidad adicional no contemplada en el alcance original deberá ser solicitada por escrito. El Proveedor evaluará el impacto en tiempo y costo y emitirá un presupuesto adicional antes de iniciar la modificación. El Cliente deberá aprobar dicho presupuesto por escrito.`);

        addClause('7', 'GARANTÍA',
            `El Proveedor ofrece una garantía de 30 días naturales a partir de la entrega del proyecto para corregir sin costo adicional cualquier error o falla directamente derivada del desarrollo entregado. Esta garantía no cubre cambios de alcance ni errores por uso inadecuado.`);

        addClause('8', 'JURISDICCIÓN',
            `Para cualquier controversia derivada del presente acuerdo, las partes se someten a las leyes aplicables de los Estados Unidos Mexicanos, renunciando a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios presentes o futuros.`);

        // C4: Cláusula de mantenimiento mensual (solo si se estableció mensualidad)
        if (selected.mensualidadMantenimiento) {
            addClause('9', 'SERVICIO DE MANTENIMIENTO MENSUAL',
                `El Proveedor prestará servicios de mantenimiento mensual por un monto de $${selected.mensualidadMantenimiento.toLocaleString(undefined, { minimumFractionDigits: 2 })} MXN al mes. Este servicio incluye: corrección de errores menores, actualizaciones de seguridad, respaldo de información y soporte por correo electrónico a través de soporte@missolucionesia.com. El servicio de mantenimiento iniciará a partir del mes siguiente a la entrega oficial del proyecto y podrá cancelarse por cualquiera de las partes con un aviso previo mínimo de 30 días naturales por escrito.`);
        }

        // ── SIGNATURES ────────────────────────────────────────────────
        if (y > 245) { pdf.addPage(); y = 20; }
        y += 6;
        pdf.setDrawColor(180, 180, 190);
        pdf.line(M, y, MR, y);
        y += 6;

        pdf.setFontSize(8.5);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...DARK);
        pdf.text('FIRMAS DE CONFORMIDAD', W / 2, y, { align: 'center' });
        y += 10;

        const sigY = y + 12;
        // Left: client
        pdf.setDrawColor(80, 80, 100);
        pdf.line(M, sigY, M + 70, sigY);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...DARK);
        pdf.text(selected.nombre || 'Cliente', M, sigY + 5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...GRAY);
        pdf.text('El Cliente', M, sigY + 10);

        // Right: company
        pdf.setDrawColor(80, 80, 100);
        pdf.line(MR - 70, sigY, MR, sigY);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...DARK);
        pdf.text('Joseph Frank Lolek Borja Bonilla', MR - 70, sigY + 5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...GRAY);
        pdf.text('Representante Legal — MisSolucionesIA', MR - 70, sigY + 10);

        // ── FOOTER ────────────────────────────────────────────────────
        pdf.setFillColor(...PURPLE);
        pdf.rect(0, 289, W, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`MisSolucionesIA | missolucionesia.com | soporte@missolucionesia.com | Folio ${folioNum}`, W / 2, 294, { align: 'center' });

        pdf.save(`contrato-MSI-${selected.nombre.replace(/\s+/g, '_')}-${folioNum}.pdf`);
        toast.success('Contrato PDF descargado correctamente');
    };

    // Generate a random partner code
    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return 'MSI-' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    };

    // Create partner using Firebase REST API (doesn't affect current admin session)
    const createPartner = async () => {
        if (!inviteEmail || !invitePassword) { toast.error('Email y contraseña son requeridos.'); return; }
        setInviting(true);
        try {
            // 1. Create auth user via Firebase REST API
            const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, password: invitePassword, returnSecureToken: true })
            });
            const result = await res.json();
            if (result.error) throw new Error(result.error.message);

            const newUid = result.localId;
            const partnerCode = generateCode();

            // 2. Create user profile in Firestore
            await setDoc(doc(db, 'users', newUid), {
                email: inviteEmail,
                fullName: inviteName || null,
                phone: invitePhone || null,
                isAdmin: false,
                isPartner: true,
                partnerCode,
            });

            toast.success(`Partner creado: ${inviteEmail} | Código: ${partnerCode}`);
            setInviteEmail(''); setInvitePassword(''); setInvitePhone(''); setInviteName('');
            setShowInviteForm(false);
            fetchPartners();
        } catch (e: any) {
            toast.error(`Error: ${e.message}`);
        } finally {
            setInviting(false);
        }
    };

    const togglePartner = async (partner: Partner) => {
        setTogglingId(partner.id);
        const newIsPartner = !partner.isPartner;
        const newCode = newIsPartner ? (partner.partnerCode || generateCode()) : null;
        await updateDoc(doc(db, 'users', partner.id), { isPartner: newIsPartner, partnerCode: newCode });
        fetchPartners();
        setTogglingId(null);
        toast.success(newIsPartner ? `Activado. Código: ${newCode}` : 'Partner desactivado.');
    };

    const deletePartner = async (partner: Partner) => {
        if (!confirm(`¿Eliminar a ${partner.email}?`)) return;
        await deleteDoc(doc(db, 'users', partner.id));
        fetchPartners();
        toast.success('Partner eliminado.');
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success('Código copiado!');
    };

    const referidosAgrupados = () => {
        const grouped: Record<string, Cotizacion[]> = {};
        const withoutCode: Cotizacion[] = [];
        cotizaciones.forEach(c => {
            if (c.referralCodeUsed) {
                if (!grouped[c.referralCodeUsed]) grouped[c.referralCodeUsed] = [];
                grouped[c.referralCodeUsed].push(c);
            } else withoutCode.push(c);
        });
        return { grouped, withoutCode };
    };

    if (authLoading || dataLoading) return <div className="p-10 text-center">Cargando dashboard...</div>;

    const { grouped, withoutCode } = referidosAgrupados();

    const tabs: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
        { key: 'solicitudes', label: 'Solicitudes', icon: <FiMail className="w-4 h-4" /> },
        { key: 'partners', label: 'Partners', icon: <FiUsers className="w-4 h-4" /> },
        { key: 'referidos', label: 'Referidos', icon: <FiBarChart2 className="w-4 h-4" /> },
        { key: 'facturacion', label: 'Facturación', icon: <FiDollarSign className="w-4 h-4" /> },
    ];

    return (
        <div className="flex-1 bg-muted/10 min-h-screen">
            <div className="bg-background border-b border-border shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 flex-wrap">
                            Admin Dashboard
                            <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                v{typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0'}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-green-500 font-normal">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                                Online
                            </span>
                            {/* A1: Identificador de usuario logueado */}
                            {user?.email && (
                                <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                    👤 {user.email}
                                </span>
                            )}
                        </h1>
                        <div className="flex gap-1 mt-2 flex-wrap">
                            {tabs.map(tab => (
                                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* A2: Botón de actualización manual */}
                        <button
                            onClick={fetchAll}
                            title="Actualizar datos"
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        >
                            <FiRefreshCw className="w-3.5 h-3.5" /> Actualizar
                        </button>
                        <button onClick={() => { logout(); navigate('/'); }} className="text-sm flex items-center gap-2 text-destructive hover:text-destructive/80 font-medium">
                            <FiLogOut /> Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">

                {/* ======= TAB: SOLICITUDES CRM ======= */}
                {activeTab === 'solicitudes' && (() => {
                    const filtered = statusFilter === 'todas' ? cotizaciones : cotizaciones.filter(c => (c.status || 'por_atender') === statusFilter);
                    return (
                        <>
                            {viewMode === 'kanban' ? (
                                <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
                                    <div className="p-4 border-b border-border bg-muted/30">
                                        <div className="flex justify-between items-center">
                                            <h2 className="font-semibold text-lg">Solicitudes — Vista Kanban</h2>
                                            <div className="flex items-center border border-border rounded-md overflow-hidden">
                                                <button onClick={() => setViewMode('lista')}
                                                    className="p-1.5 transition-colors hover:bg-muted text-muted-foreground"
                                                    title="Vista Lista"><FiList className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => setViewMode('kanban')}
                                                    className="p-1.5 transition-colors bg-primary text-primary-foreground"
                                                    title="Vista Kanban"><FiGrid className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <KanbanBoard
                                            cotizaciones={cotizaciones}
                                            selectedId={selected?.id}
                                            onSelect={(c) => { setSelected(c as unknown as Cotizacion); setPriceInput(String(c.precioCotizado ?? '')); setNotasInput(''); }}
                                            onDelete={deleteCotizacion}
                                            onStatusChange={(id, newStatus) => updateCotizacion(id, { status: newStatus })}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-1 bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden flex flex-col h-[82vh]">
                                        <div className="p-4 border-b border-border bg-muted/30">
                                            <div className="flex justify-between items-center mb-3">
                                                <h2 className="font-semibold text-lg">Solicitudes</h2>
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">{filtered.length}</span>
                                                    <div className="flex items-center border border-border rounded-md overflow-hidden">
                                                        <button onClick={() => setViewMode('lista')}
                                                            className="p-1.5 transition-colors bg-primary text-primary-foreground"
                                                            title="Vista Lista"><FiList className="w-3.5 h-3.5" /></button>
                                                        <button onClick={() => setViewMode('kanban')}
                                                            className="p-1.5 transition-colors hover:bg-muted text-muted-foreground"
                                                            title="Vista Kanban"><FiGrid className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {(['todas', 'por_atender', 'en_proceso', 'atendida', 'descartada'] as const).map(s => (
                                                    <button key={s} onClick={() => setStatusFilter(s)}
                                                        className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${statusFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
                                                        {s === 'todas' ? 'Todas' : statusConfig[s]?.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
                                            {filtered.length === 0 ? (
                                                <p className="text-center text-muted-foreground p-4 text-sm">No hay solicitudes en esta categoría.</p>
                                            ) : filtered.map(c => {
                                                const st = statusConfig[c.status || 'por_atender'];
                                                return (
                                                    <div key={c.id} className={`flex items-center gap-2 rounded-lg border transition-colors ${selected?.id === c.id ? 'bg-primary/10 border-primary/30' : 'bg-background border-transparent hover:bg-muted/50 hover:border-border'}`}>
                                                        <button onClick={() => { setSelected(c); setPriceInput(String(c.precioCotizado ?? '')); setMensualidadInput(String(c.mensualidadMantenimiento ?? '')); setNotasInput(c.notasAdmin ?? ''); }}
                                                            className="flex-1 text-left p-3 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${st?.color}`}>
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${st?.dot}`}></span>{st?.label}
                                                                </span>
                                                                {c.precioCotizado && <span className="text-[10px] text-green-600 font-mono font-bold">${c.precioCotizado.toLocaleString()}</span>}
                                                            </div>
                                                            <p className="font-medium text-sm truncate">{c.nombre}</p>
                                                            <p className="text-xs text-muted-foreground truncate">{c.proyecto}</p>
                                                        </button>
                                                        <button onClick={() => deleteCotizacion(c.id)} className="p-2 mr-1 text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors flex-shrink-0">
                                                            <FiTrash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2">
                                        {selected ? (
                                            <div className="bg-card border border-border/50 rounded-xl shadow-sm p-6 lg:p-8 space-y-6">
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                    <div>
                                                        <h2 className="text-2xl font-bold">{selected.nombre}</h2>
                                                        <p className="inline-block mt-2 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">{selected.proyecto}</p>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground font-mono bg-muted px-3 py-1 rounded-md flex items-center gap-2">
                                                        <FiClock /> {selected.createdAt?.toDate ? selected.createdAt.toDate().toLocaleDateString() : 'N/A'}
                                                    </div>
                                                </div>

                                                {selected.referralCodeUsed && (
                                                    <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg flex items-center gap-2">
                                                        <span className="text-xs font-bold uppercase tracking-wider text-primary">REFERIDO POR PARTNER:</span>
                                                        <span className="font-mono bg-background px-2 py-1 rounded text-sm shadow-sm">{selected.referralCodeUsed}</span>
                                                    </div>
                                                )}

                                                {/* CRM Status */}
                                                <div className="bg-muted/40 border border-border rounded-xl p-4">
                                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Estado</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(Object.keys(statusConfig) as CotizacionStatus[]).map(s => {
                                                            const cfg = statusConfig[s];
                                                            const isActive = (selected.status || 'por_atender') === s;
                                                            return (
                                                                <button key={s} onClick={() => updateCotizacion(selected.id, { status: s })}
                                                                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${isActive ? `${cfg.color} shadow-sm scale-105` : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                                                                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`}></span>{cfg.label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Price + Mensualidad + Notes */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="bg-background border border-border rounded-xl p-4">
                                                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Precio Cotizado (MXN)</p>
                                                        <div className="flex gap-2">
                                                            <input type="number" placeholder="0.00" value={priceInput} onChange={e => setPriceInput(e.target.value)}
                                                                className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
                                                            <button onClick={() => updateCotizacion(selected.id, { precioCotizado: priceInput ? parseFloat(priceInput) : null })}
                                                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-md hover:bg-green-700">
                                                                <FiSave className="w-3.5 h-3.5" /> Guardar
                                                            </button>
                                                        </div>
                                                        {selected.precioCotizado && <p className="text-2xl font-black text-green-600 mt-2">${selected.precioCotizado.toLocaleString()}</p>}
                                                    </div>
                                                    <div className="bg-background border border-blue-500/20 rounded-xl p-4">
                                                        <p className="text-xs font-bold uppercase tracking-wider text-blue-600/80 mb-2">Mensualidad Mantenimiento (MXN/mes)</p>
                                                        <div className="flex gap-2">
                                                            <input type="number" placeholder="0.00" value={mensualidadInput} onChange={e => setMensualidadInput(e.target.value)}
                                                                className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
                                                            <button onClick={() => updateCotizacion(selected.id, { mensualidadMantenimiento: mensualidadInput ? parseFloat(mensualidadInput) : null })}
                                                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700">
                                                                <FiSave className="w-3.5 h-3.5" /> Guardar
                                                            </button>
                                                        </div>
                                                        {selected.mensualidadMantenimiento && <p className="text-xl font-black text-blue-600 mt-2">${selected.mensualidadMantenimiento.toLocaleString()}<span className="text-sm font-normal">/mes</span></p>}
                                                    </div>
                                                </div>
                                                <div className="bg-background border border-border rounded-xl p-4">
                                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Notas del Admin</p>
                                                    <textarea rows={3} placeholder="Notas internas..." value={notasInput} onChange={e => setNotasInput(e.target.value)}
                                                        onBlur={() => updateCotizacion(selected.id, { notasAdmin: notasInput })}
                                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
                                                </div>

                                                {/* Contact */}
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    <div className="flex items-center gap-3 bg-background p-3 rounded-lg border border-border/50">
                                                        <div className="bg-primary/10 p-2 rounded-md text-primary"><FiMail /></div>
                                                        <div className="truncate"><p className="text-xs text-muted-foreground">Correo</p><p className="text-sm font-medium truncate">{selected.correo}</p></div>
                                                    </div>
                                                    <div className="flex items-center gap-3 bg-background p-3 rounded-lg border border-border/50">
                                                        <div className="bg-primary/10 p-2 rounded-md text-primary"><FiPhone /></div>
                                                        <div className="flex-1">
                                                            <p className="text-xs text-muted-foreground">Teléfono</p>
                                                            <a href={`tel:${selected.telefono}`} className="text-sm font-medium hover:text-primary">{selected.telefono || 'N/A'}</a>
                                                        </div>
                                                        {selected.telefono && (
                                                            <a
                                                                href={`https://wa.me/${selected.telefono?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${selected.nombre || ''}, te contactamos de MisSolucionesIA respecto a tu solicitud de "${selected.proyecto || 'tu proyecto'}". ¿Tienes un momento para hablar?`)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                title="Contactar por WhatsApp"
                                                                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-[#25D366] text-white hover:bg-[#1fb855] transition-colors flex-shrink-0"
                                                            >
                                                                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                                                WA
                                                            </a>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 bg-background p-3 rounded-lg border border-border/50">
                                                        <div className="bg-primary/10 p-2 rounded-md text-primary"><FiDollarSign /></div>
                                                        <div><p className="text-xs text-muted-foreground">Presupuesto cliente</p><p className="text-sm font-medium">{selected.presupuesto}</p></div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Descripción del Proyecto</h3>
                                                    <div className="bg-background p-5 rounded-lg border border-border/50 text-base leading-relaxed whitespace-pre-wrap">{selected.descripcion}</div>
                                                </div>

                                                {/* ===== MERCADOPAGO PAYMENT LINK ===== */}
                                                {selected.precioCotizado && (
                                                    <div className={`rounded-xl border p-4 ${selected.status === 'atendida' ? 'bg-green-50 dark:bg-green-950/20 border-green-300/50' : 'bg-muted/30 border-border'}`}>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <FiLink className="text-[#00B1EA] w-4 h-4" />
                                                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Link de Pago — MercadoPago</p>
                                                            </div>
                                                            <button
                                                                onClick={openPaymentModal}
                                                                disabled={generatingLink}
                                                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-[#00B1EA] text-white hover:bg-[#0095c8] disabled:opacity-60 transition-colors"
                                                            >
                                                                {generatingLink
                                                                    ? <><FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> Generando...</>
                                                                    : selected?.linkPago
                                                                        ? <><FiRefreshCw className="w-3.5 h-3.5" /> Editar y Regenerar</>
                                                                        : <><FiLink className="w-3.5 h-3.5" /> Generar Link</>
                                                                }
                                                            </button>
                                                        </div>

                                                        {selected.linkPago ? (
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-2 bg-background rounded-lg border border-border p-2">
                                                                    <p className="text-xs font-mono text-muted-foreground truncate flex-1">{selected.linkPago}</p>
                                                                    <button
                                                                        onClick={() => { navigator.clipboard.writeText(selected.linkPago!); toast.success('¡Copiado!'); }}
                                                                        className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                                                        title="Copiar link"
                                                                    >
                                                                        <FiCopy className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <a href={selected.linkPago} target="_blank" rel="noreferrer"
                                                                        className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                                                        title="Abrir en MercadoPago"
                                                                    >
                                                                        <FiExternalLink className="w-3.5 h-3.5" />
                                                                    </a>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground">💡 Envía este link al cliente por WhatsApp o email. Puede pagar con tarjeta, OXXO, transferencia y más.</p>
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-muted-foreground">
                                                                {selected.status === 'atendida'
                                                                    ? 'Haz click en "Generar Link" para crear el link de cobro de MercadoPago por $' + selected.precioCotizado?.toLocaleString() + ' MXN.'
                                                                    : 'Cambia el estado a "Atendida" para habilitar la generación del link de pago.'}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                <AIAnalisis data={{ nombre: selected.nombre, proyecto: selected.proyecto, presupuesto: selected.presupuesto, descripcion: selected.descripcion }} />
                                            </div>
                                        ) : (
                                            <div className="h-full min-h-[400px] flex items-center justify-center border border-dashed border-border rounded-xl bg-card">
                                                <p className="text-muted-foreground text-center">Selecciona una solicitud<br />para ver detalles y gestionar el CRM.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    );
                })()}

                {/* ======= TAB: PARTNERS ======= */}
                {activeTab === 'partners' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-border bg-muted/30 flex items-center justify-between">
                                <div>
                                    <h2 className="font-semibold text-lg">Gestión de Partners</h2>
                                    <p className="text-sm text-muted-foreground mt-0.5">Crea, activa o elimina partners. El código se genera automáticamente.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">{partners.filter(p => p.isPartner).length} activos</span>
                                    <button onClick={() => setShowInviteForm(v => !v)}
                                        className="flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors">
                                        <FiUserPlus className="w-3.5 h-3.5" /> Nuevo Partner
                                    </button>
                                </div>
                            </div>

                            {showInviteForm && (
                                <div className="p-5 bg-primary/5 border-b border-primary/10 space-y-3">
                                    <p className="text-sm font-semibold text-primary">Crear nuevo usuario Partner</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input type="text" placeholder="Nombre (opcional)" value={inviteName} onChange={e => setInviteName(e.target.value)}
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                                        <input type="tel" placeholder="Teléfono WhatsApp" value={invitePhone} onChange={e => setInvitePhone(e.target.value)}
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                                        <input type="email" placeholder="Email *" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                                        <input type="password" placeholder="Contraseña (mínimo 6 caracteres) *" value={invitePassword} onChange={e => setInvitePassword(e.target.value)}
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Comparte estas credenciales directamente con el partner para que pueda acceder a su panel.</p>
                                    <button onClick={createPartner} disabled={inviting}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold disabled:opacity-50">
                                        {inviting ? 'Creando...' : <><FiUserPlus /> Crear Partner</>}
                                    </button>
                                </div>
                            )}

                            <div className="divide-y divide-border">
                                {partners.length === 0 ? (
                                    <p className="text-center text-muted-foreground p-8 text-sm">No hay partners aún. Crea el primero.</p>
                                ) : partners.map(partner => (
                                    <div key={partner.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                                        <div>
                                            <p className="font-medium text-sm">{partner.fullName || partner.email}</p>
                                            {partner.fullName && <p className="text-xs text-muted-foreground">{partner.email}</p>}
                                            {partner.phone && <a href={`https://wa.me/${partner.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-xs text-green-600 hover:underline">📱 {partner.phone}</a>}
                                            {partner.partnerCode && (
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <span className="text-xs text-primary font-mono bg-primary/10 px-2 py-0.5 rounded">{partner.partnerCode}</span>
                                                    <button onClick={() => copyCode(partner.partnerCode!)} className="text-xs text-muted-foreground hover:text-foreground"><FiCopy /></button>
                                                </div>
                                            )}
                                            {!partner.partnerCode && <p className="text-xs text-muted-foreground">Sin código</p>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => togglePartner(partner)} disabled={togglingId === partner.id}
                                                className={`flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-md font-semibold transition-colors ${partner.isPartner ? 'text-green-600 hover:bg-green-50' : 'text-muted-foreground hover:bg-muted'}`}>
                                                {partner.isPartner ? <FiToggleRight className="w-5 h-5" /> : <FiToggleLeft className="w-5 h-5" />}
                                                {partner.isPartner ? 'Activo' : 'Inactivo'}
                                            </button>
                                            <button onClick={() => deletePartner(partner)} className="p-1.5 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ======= TAB: REFERIDOS ======= */}
                {activeTab === 'referidos' && (
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Leads</p>
                                <p className="text-3xl font-black text-foreground mt-1">{cotizaciones.length}</p>
                            </div>
                            <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Con Referido</p>
                                <p className="text-3xl font-black text-primary mt-1">{cotizaciones.filter(c => c.referralCodeUsed).length}</p>
                            </div>
                            <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm col-span-2 sm:col-span-1">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Partners Activos</p>
                                <p className="text-3xl font-black text-green-500 mt-1">{Object.keys(grouped).length}</p>
                            </div>
                        </div>

                        {Object.entries(grouped).map(([code, leads]) => (
                            <div key={code} className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
                                <div className="p-4 bg-primary/5 border-b border-primary/10 flex items-center gap-3">
                                    <span className="font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">{code}</span>
                                    <span className="text-sm text-muted-foreground">{leads.length} lead{leads.length !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="divide-y divide-border">
                                    {leads.map(lead => (
                                        <div key={lead.id} className="flex items-center justify-between p-4 text-sm">
                                            <div><p className="font-medium">{lead.nombre}</p><p className="text-xs text-muted-foreground">{lead.proyecto}</p></div>
                                            <div className="text-right"><p className="text-xs text-muted-foreground">{lead.presupuesto}</p></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
                            <div className="p-4 bg-muted/30 border-b border-border flex items-center gap-3">
                                <span className="font-semibold text-muted-foreground">Directos (sin código de referido)</span>
                                <span className="text-sm text-muted-foreground">{withoutCode.length} leads</span>
                            </div>
                            {withoutCode.length === 0 ? (
                                <p className="text-center text-muted-foreground p-6 text-sm">Todos los leads tienen código de referido.</p>
                            ) : (
                                <div className="divide-y divide-border">
                                    {withoutCode.map(lead => (
                                        <div key={lead.id} className="flex items-center justify-between p-4 text-sm">
                                            <div><p className="font-medium">{lead.nombre}</p><p className="text-xs text-muted-foreground">{lead.proyecto}</p></div>
                                            <p className="text-xs text-muted-foreground">{lead.presupuesto}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ======= TAB: FACTURACIÓN ======= */}
                {activeTab === 'facturacion' && (() => {
                    const atendidas = cotizaciones.filter(c => c.status === 'atendida' && c.precioCotizado);
                    const totalFacturado = atendidas.reduce((sum, c) => sum + (c.precioCotizado || 0), 0);
                    const totalPendiente = cotizaciones.filter(c => (c.status === 'por_atender' || c.status === 'en_proceso') && c.precioCotizado).reduce((sum, c) => sum + (c.precioCotizado || 0), 0);
                    const cotizadasConPrecio = cotizaciones.filter(c => c.precioCotizado);
                    // C5: MRR — suma de mensualidades de contratos atendidos
                    const mrr = cotizaciones.filter(c => c.mensualidadMantenimiento).reduce((sum, c) => sum + (c.mensualidadMantenimiento || 0), 0);
                    return (
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
                                    <p className="text-3xl font-black mt-1">{cotizaciones.length}</p>
                                </div>
                                <div className="bg-card border border-green-500/30 rounded-xl p-5 shadow-sm">
                                    <p className="text-xs text-green-600 uppercase tracking-wider font-semibold">Facturado</p>
                                    <p className="text-2xl font-black text-green-600 mt-1">${totalFacturado.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">{atendidas.length} atendidas</p>
                                </div>
                                <div className="bg-card border border-blue-500/30 rounded-xl p-5 shadow-sm">
                                    <p className="text-xs text-blue-600 uppercase tracking-wider font-semibold">En Pipeline</p>
                                    <p className="text-2xl font-black text-blue-600 mt-1">${totalPendiente.toLocaleString()}</p>
                                </div>
                                <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Con Precio</p>
                                    <p className="text-3xl font-black mt-1">{cotizadasConPrecio.length}</p>
                                </div>
                            </div>
                            {/* C5: KPI de Ingresos Recurrentes Mensuales */}
                            {mrr > 0 && (
                                <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-xl p-5 shadow-sm flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-blue-600 uppercase tracking-wider font-semibold">MRR — Ingresos Recurrentes Mensuales</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">Suma de mensualidades de mantenimiento activas</p>
                                    </div>
                                    <p className="text-3xl font-black text-blue-600">${mrr.toLocaleString()}<span className="text-base font-normal">/mes</span></p>
                                </div>
                            )}

                            {/* ===== MONTHLY REVENUE CHART ===== */}
                            {(() => {
                                // Build monthly data from cotizaciones with precioCotizado
                                const monthlyMap: Record<string, { mes: string; cotizado: number; atendido: number }> = {};
                                const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                                cotizaciones.filter(c => c.precioCotizado).forEach(c => {
                                    const d = c.createdAt?.toDate ? c.createdAt.toDate() : new Date((c.createdAt as any)?.seconds * 1000);
                                    if (!d) return;
                                    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                                    const label = `${meses[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
                                    if (!monthlyMap[key]) monthlyMap[key] = { mes: label, cotizado: 0, atendido: 0 };
                                    monthlyMap[key].cotizado += c.precioCotizado || 0;
                                    if (c.status === 'atendida') monthlyMap[key].atendido += c.precioCotizado || 0;
                                });
                                const chartData = Object.entries(monthlyMap).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
                                if (chartData.length === 0) return null;
                                return (
                                    <div className="bg-card border border-border/50 rounded-xl shadow-sm p-5">
                                        <h3 className="font-semibold mb-1">Ingresos por Mes</h3>
                                        <p className="text-xs text-muted-foreground mb-4">Monto cotizado vs. atendido/cobrado por mes</p>
                                        <ResponsiveContainer width="100%" height={220}>
                                            <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="gradCotizado" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="gradAtendido" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                                                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                                                <Tooltip formatter={(v: unknown) => `$${Number(v).toLocaleString()}`} />
                                                <Area type="monotone" dataKey="cotizado" name="Cotizado" stroke="#6C63FF" fill="url(#gradCotizado)" strokeWidth={2} />
                                                <Area type="monotone" dataKey="atendido" name="Atendido" stroke="#22c55e" fill="url(#gradAtendido)" strokeWidth={2} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                );
                            })()}

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {(Object.keys(statusConfig) as CotizacionStatus[]).map(s => {
                                    const count = cotizaciones.filter(c => (c.status || 'por_atender') === s).length;
                                    const cfg = statusConfig[s];
                                    return (
                                        <div key={s} className={`rounded-xl border p-4 ${cfg.color}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`w-2 h-2 rounded-full ${cfg.dot}`}></span>
                                                <span className="text-xs font-semibold">{cfg.label}</span>
                                            </div>
                                            <p className="text-2xl font-black">{count}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
                                <div className="p-4 bg-muted/30 border-b border-border">
                                    <h3 className="font-semibold">Detalle de Precios Cotizados</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">Agrega precios desde la pestaña Solicitudes.</p>
                                </div>
                                {cotizadasConPrecio.length === 0 ? (
                                    <p className="text-center text-muted-foreground p-8 text-sm">Aún no has cotizado precios.</p>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {cotizadasConPrecio.sort((a, b) => (b.precioCotizado || 0) - (a.precioCotizado || 0)).map(c => {
                                            const cfg = statusConfig[c.status || 'por_atender'];
                                            return (
                                                <div key={c.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                                                    <div className="min-w-0 flex-1">
                                                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${cfg.color}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>{cfg.label}
                                                        </span>
                                                        <p className="font-medium text-sm truncate mt-0.5">{c.nombre}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{c.proyecto}</p>
                                                    </div>
                                                    <div className="text-right ml-4 flex-shrink-0">
                                                        <p className="text-xl font-black text-green-600">${c.precioCotizado!.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div className="p-4 bg-green-50 dark:bg-green-950/30 border-t-2 border-green-500/30 flex justify-between items-center">
                                            <span className="font-bold text-sm text-green-700 dark:text-green-400">TOTAL COTIZADO</span>
                                            <span className="text-2xl font-black text-green-600">${cotizadasConPrecio.reduce((s, c) => s + (c.precioCotizado || 0), 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}
            </div >

            {/* ===== PAYMENT CUSTOMIZATION MODAL ===== */}
            {
                showPaymentModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="bg-[#00B1EA]/10 p-2.5 rounded-xl">
                                    <FiLink className="text-[#00B1EA] w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg">Personalizar Cobro</h2>
                                    <p className="text-xs text-muted-foreground">Edita el concepto y monto antes de generar el link de MercadoPago</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Concepto / Descripción del servicio</label>
                                    <input
                                        type="text"
                                        value={paymentTitle}
                                        onChange={e => setPaymentTitle(e.target.value)}
                                        placeholder="Ej: CRM con Pipeline personalizado"
                                        className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#00B1EA]/40"
                                    />
                                    <p className="text-[11px] text-muted-foreground mt-1">Esto aparece como descripción en el checkout de MercadoPago</p>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Monto a cobrar (MXN)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                                        <input
                                            type="number"
                                            min="1"
                                            value={paymentAmount}
                                            onChange={e => setPaymentAmount(e.target.value)}
                                            placeholder="0"
                                            className="w-full border border-border rounded-lg pl-7 pr-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#00B1EA]/40"
                                        />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-1">Precio original cotizado: <span className="font-semibold">${selected?.precioCotizado?.toLocaleString()} MXN</span></p>
                                </div>
                            </div>

                            <div className="bg-muted/40 rounded-lg p-3 text-xs text-muted-foreground">
                                <strong>Vista previa del cobro:</strong><br />
                                <span className="font-medium text-foreground">{paymentTitle || '(sin concepto)'}</span> — <span className="text-green-600 font-bold">${parseFloat(paymentAmount || '0').toLocaleString()} MXN</span>
                            </div>
                            {/* C3: Mostrar mensualidad en el modal de cobro */}
                            {selected?.mensualidadMantenimiento && (
                                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-3 text-xs flex items-center justify-between">
                                    <span className="text-blue-700 dark:text-blue-400">📅 Mantenimiento mensual incluido en contrato:</span>
                                    <span className="text-blue-600 font-black text-sm">${selected.mensualidadMantenimiento.toLocaleString()} MXN/mes</span>
                                </div>
                            )}

                            <div className="flex gap-2 pt-1 flex-wrap">
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 border border-border rounded-lg py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={generateContractPDF}
                                    disabled={!paymentTitle.trim() || !paymentAmount || parseFloat(paymentAmount) <= 0}
                                    className="flex items-center gap-1.5 border border-border rounded-lg py-2.5 px-3 text-sm font-medium hover:bg-muted disabled:opacity-40 transition-colors"
                                    title="Descargar contrato PDF"
                                >
                                    <FiFileText className="w-4 h-4" /> PDF
                                </button>
                                <button
                                    onClick={generatePaymentLink}
                                    disabled={!paymentTitle.trim() || !paymentAmount || parseFloat(paymentAmount) <= 0}
                                    className="flex-1 bg-[#00B1EA] text-white rounded-lg py-2.5 text-sm font-bold hover:bg-[#0095c8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                >
                                    <FiLink className="w-4 h-4" /> Generar Link
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}
