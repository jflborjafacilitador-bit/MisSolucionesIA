import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, orderBy, query, setDoc, addDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import AIAnalisis from '../components/AIAnalisis';
import ClientePipeline, { Cliente, ClienteStatus } from '../components/ClientePipeline';
import { FiLogOut, FiMail, FiPhone, FiDollarSign, FiClock, FiUsers, FiBarChart2, FiToggleLeft, FiToggleRight, FiCopy, FiUserPlus, FiTrash2, FiSave, FiLink, FiExternalLink, FiRefreshCw, FiUserCheck, FiCheckCircle, FiXCircle, FiCpu } from 'react-icons/fi';
import { toast } from 'sonner';
import { createMPPreference } from '../lib/mercadopago';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiList, FiGrid, FiFileText, FiX, FiEdit2 } from 'react-icons/fi';
import jsPDF from 'jspdf';
import AIProposalsGenerator from '../components/AIProposalsGenerator';
import MasterKanbanBoard from '../components/MasterKanbanBoard';

export type CotizacionStatus = 'por_atender' | 'en_proceso' | 'atendida' | 'descartada';

export interface Cotizacion {
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
    convertidoACliente?: boolean;
}

interface Partner {
    id: string;
    email?: string;
    fullName?: string;
    phone?: string;
    isPartner: boolean;
    partnerCode?: string | null;
}

type ActiveTab = 'solicitudes' | 'clientes' | 'partners' | 'referidos' | 'facturacion' | 'ia_proposals';

interface Pago {
    id: string;
    mes: number;
    anio: number;
    monto: number;
    pagado: boolean;
    fechaPago?: any;
    linkPago?: string | null;
}

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
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
    const [pagosCliente, setPagosCliente] = useState<Pago[]>([]);
    const [showConvertirModal, setShowConvertirModal] = useState(false);
    const [convertirFecha, setConvertirFecha] = useState('');
    const [convertirLoading, setConvertirLoading] = useState(false);
    const [clienteViewMode, setClienteViewMode] = useState<'pipeline' | 'lista'>('pipeline');
    const [showDeleteCliente, setShowDeleteCliente] = useState(false);
    const [showEditCliente, setShowEditCliente] = useState(false);
    const [editClienteData, setEditClienteData] = useState<Partial<Cliente>>({});
    const [editLoading, setEditLoading] = useState(false);
    const [showNewLeadModal, setShowNewLeadModal] = useState(false);
    const [newLeadData, setNewLeadData] = useState<Partial<Cotizacion>>({});
    const [newLeadLoading, setNewLeadLoading] = useState(false);
    const [isCustomProyecto, setIsCustomProyecto] = useState(false);
    const [editPagoId, setEditPagoId] = useState<string | null>(null);
    const [editPagoMonto, setEditPagoMonto] = useState<number>(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (authLoading) return;
        if (!user) { navigate('/login'); return; }
        if (!isAdmin) { navigate('/partner'); return; }  // B2: partner no puede acceder al admin
        fetchAll();
    }, [user, isAdmin, authLoading, navigate]);

    const fetchAll = async () => {
        setDataLoading(true);
        await Promise.all([fetchCotizaciones(), fetchPartners(), fetchClientes()]);
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

    const fetchClientes = async () => {
        const snap = await getDocs(collection(db, 'clientes'));
        setClientes(snap.docs.map(d => ({ id: d.id, ...d.data() } as Cliente)));
    };

    // Asegura que exista el pago del mes actual para un cliente
    const ensurePagoMesActual = async (cliente: Cliente) => {
        try {
            const hoy = new Date();
            const mes = hoy.getMonth() + 1;
            const anio = hoy.getFullYear();
            const pagosSnap = await getDocs(collection(db, 'clientes', cliente.id, 'pagos'));
            const pagos = pagosSnap.docs.map(d => ({ id: d.id, ...d.data() } as Pago));
            const existeMes = pagos.find(p => p.mes === mes && p.anio === anio);
            if (!existeMes && cliente.mensualidadMonto) {
                await addDoc(collection(db, 'clientes', cliente.id, 'pagos'), {
                    mes, anio, monto: cliente.mensualidadMonto, pagado: false
                });
            }
        } catch (error: any) {
            console.error('Error en ensurePagoMesActual:', error);
            toast.error('Error al verificar pagos del mes: ' + error.message);
        }
    };

    const handleSelectCliente = async (c: Cliente) => {
        setSelectedCliente(c);
        setPagosCliente([]);
        await ensurePagoMesActual(c);
    };

    useEffect(() => {
        if (!selectedCliente) return;
        const q = query(collection(db, 'clientes', selectedCliente.id, 'pagos'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const pagos: Pago[] = [];
            snapshot.forEach(doc => { pagos.push({ id: doc.id, ...doc.data() } as Pago); });
            setPagosCliente(pagos.sort((a, b) => (b.anio * 12 + b.mes) - (a.anio * 12 + a.mes)));
        }, (error) => {
            console.error("Error fetching pagos en realtime:", error);
            toast.error("No se pudieron cargar los pagos: " + error.message);
        });
        return () => unsubscribe();
    }, [selectedCliente]);

    const marcarPagado = async (clienteId: string, pago: Pago, pagado: boolean) => {
        await updateDoc(doc(db, 'clientes', clienteId, 'pagos', pago.id), {
            pagado,
            fechaPago: pagado ? Timestamp.now() : null
        });
        setPagosCliente(prev => prev.map(p => p.id === pago.id ? { ...p, pagado, fechaPago: pagado ? new Date() : null } : p));
        toast.success(pagado ? 'Pago registrado ✓' : 'Pago desmarcado');
    };

    const actualizarStatusCliente = async (id: string, status: ClienteStatus) => {
        await updateDoc(doc(db, 'clientes', id), { status });
        setClientes(prev => prev.map(c => c.id === id ? { ...c, status } : c));
        if (selectedCliente?.id === id) setSelectedCliente(prev => prev ? { ...prev, status } : null);
        toast.success('Estado actualizado.');
    };

    const convertirACliente = async () => {
        if (!selected || !convertirFecha) return;
        setConvertirLoading(true);
        try {
            const nuevoId = doc(collection(db, 'clientes')).id;
            const nuevoCliente: Omit<Cliente, 'id'> = {
                nombre: selected.nombre,
                correo: selected.correo,
                telefono: selected.telefono,
                proyecto: selected.proyecto,
                precioCobrado: selected.precioCotizado ?? null,
                mensualidadMonto: selected.mensualidadMantenimiento ?? null,
                fechaInicio: Timestamp.fromDate(new Date(convertirFecha + 'T12:00:00')),
                cotizacionId: selected.id,
                status: 'activo',
                notasAdmin: selected.notasAdmin ?? null,
                referralCodeUsed: selected.referralCodeUsed ?? null,
            };
            await setDoc(doc(db, 'clientes', nuevoId), nuevoCliente);
            await updateDoc(doc(db, 'cotizaciones', selected.id), { convertidoACliente: true });
            setClientes(prev => [...prev, { id: nuevoId, ...nuevoCliente }]);
            setShowConvertirModal(false);
            setActiveTab('clientes');
            toast.success(`✓ ${selected.nombre} ahora es cliente activo`);
        } catch (e) {
            toast.error('Error al convertir. Intenta de nuevo.');
        } finally {
            setConvertirLoading(false);
        }
    };
    const crearLeadManual = async () => {
        if (!newLeadData.nombre || !newLeadData.correo || (!newLeadData.proyecto && !isCustomProyecto)) {
            toast.error('Nombre, Correo y Proyecto son obligatorios.');
            return;
        }
        setNewLeadLoading(true);
        try {
            const nuevoId = doc(collection(db, 'cotizaciones')).id;
            const nuevaCotizacion: Omit<Cotizacion, 'id'> = {
                nombre: newLeadData.nombre,
                correo: newLeadData.correo,
                telefono: newLeadData.telefono || '',
                proyecto: newLeadData.proyecto || 'Proyecto Personalizado',
                presupuesto: newLeadData.presupuesto || 'No especificado',
                descripcion: newLeadData.descripcion || 'Lead ingresado manualmente.',
                precioCotizado: newLeadData.precioCotizado || null,
                mensualidadMantenimiento: newLeadData.mensualidadMantenimiento || null,
                createdAt: Timestamp.now(),
                status: 'por_atender',
                notasAdmin: '',
            };
            await setDoc(doc(db, 'cotizaciones', nuevoId), nuevaCotizacion);
            setCotizaciones(prev => [{ id: nuevoId, ...nuevaCotizacion }, ...prev]);
            setShowNewLeadModal(false);
            setNewLeadData({});
            toast.success('Lead creado correctamente.');
        } catch (e) {
            toast.error('Error al crear el Lead. Intenta de nuevo.');
        } finally {
            setNewLeadLoading(false);
        }
    };

    const eliminarCliente = async () => {
        if (!selectedCliente) return;
        try {
            // Eliminar subcolección de pagos
            const pagosSnap = await getDocs(collection(db, 'clientes', selectedCliente.id, 'pagos'));
            await Promise.all(pagosSnap.docs.map(d => deleteDoc(d.ref)));
            // Eliminar el cliente
            await deleteDoc(doc(db, 'clientes', selectedCliente.id));
            setClientes(prev => prev.filter(c => c.id !== selectedCliente.id));
            setSelectedCliente(null);
            setShowDeleteCliente(false);
            toast.success('Cliente eliminado.');
        } catch {
            toast.error('Error al eliminar. Intenta de nuevo.');
        }
    };

    const guardarEdicionCliente = async () => {
        if (!selectedCliente) return;
        setEditLoading(true);
        try {
            const updates: Partial<Cliente> = {
                nombre: editClienteData.nombre ?? selectedCliente.nombre,
                proyecto: editClienteData.proyecto ?? selectedCliente.proyecto,
                correo: editClienteData.correo ?? selectedCliente.correo,
                precioCobrado: editClienteData.precioCobrado !== undefined ? editClienteData.precioCobrado : selectedCliente.precioCobrado,
                mensualidadMonto: editClienteData.mensualidadMonto !== undefined ? editClienteData.mensualidadMonto : selectedCliente.mensualidadMonto,
            };
            await updateDoc(doc(db, 'clientes', selectedCliente.id), updates);
            
            // Sincronizar importes con la Cotización Base para que los links y contratos tengan el monto final
            if (selectedCliente.cotizacionId) {
                const cotiUpdates: Partial<Cotizacion> = {};
                if (editClienteData.precioCobrado !== undefined) cotiUpdates.precioCotizado = editClienteData.precioCobrado;
                if (editClienteData.mensualidadMonto !== undefined) cotiUpdates.mensualidadMantenimiento = editClienteData.mensualidadMonto;
                if (editClienteData.nombre) cotiUpdates.nombre = editClienteData.nombre;
                if (editClienteData.proyecto) cotiUpdates.proyecto = editClienteData.proyecto;
                
                await updateDoc(doc(db, 'cotizaciones', selectedCliente.cotizacionId), cotiUpdates);
                setCotizaciones(prev => prev.map(c => c.id === selectedCliente.cotizacionId ? { ...c, ...cotiUpdates } : c));
                if (selected?.id === selectedCliente.cotizacionId) {
                     setSelected(prev => prev ? { ...prev, ...cotiUpdates } : null);
                }
            }

            const updated = { ...selectedCliente, ...updates };
            setClientes(prev => prev.map(c => c.id === selectedCliente.id ? updated : c));
            setSelectedCliente(updated);
            setShowEditCliente(false);
            toast.success('Cliente y Cotización Base actualizados sincronizadamente.');
        } catch {
            toast.error('Error al actualizar.');
        } finally {
            setEditLoading(false);
        }
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

    const generarLinkMensualidad = async (pago: Pago) => {
        if (!selectedCliente || !selectedCliente.correo) {
            toast.error('El cliente debe tener correo configurado para MercadoPago.');
            return;
        }
        if (pago.linkPago) {
            navigator.clipboard.writeText(pago.linkPago);
            toast.success('¡Link de mensualidad copiado al portapapeles!');
            return;
        }
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const nombreMes = meses[pago.mes - 1];
        const loadingId = toast.loading('Generando link de mensualidad...');
        try {
            const link = await createMPPreference({
                title: `Mensualidad ${nombreMes} ${pago.anio} — ${selectedCliente.proyecto}`,
                amount: pago.monto,
                clientEmail: selectedCliente.correo,
                externalRef: `mens-${selectedCliente.id}-${pago.anio}-${pago.mes}`,
            });
            await updateDoc(doc(db, 'clientes', selectedCliente.id, 'pagos', pago.id), { linkPago: link });
            setPagosCliente(prev => prev.map(p => p.id === pago.id ? { ...p, linkPago: link } : p));
            navigator.clipboard.writeText(link);
            toast.success('¡Link de mensualidad generado y copiado!', { id: loadingId });
        } catch (e: any) {
            toast.error(`Error al generar link: ${e.message}`, { id: loadingId });
        }
    };

    const saveEditPago = async (pago: Pago) => {
        if (!selectedCliente) return;
        try {
            await updateDoc(doc(db, 'clientes', selectedCliente.id, 'pagos', pago.id), { monto: editPagoMonto, linkPago: null });
            setPagosCliente(prev => prev.map(p => p.id === pago.id ? { ...p, monto: editPagoMonto, linkPago: undefined } : p));
            setEditPagoId(null);
            toast.success('Monto de mensualidad actualizado.');
        } catch {
            toast.error('Error al actualizar.');
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
        { key: 'solicitudes', label: 'CRM Master', icon: <FiUserCheck className="w-4 h-4" /> },
        { key: 'partners', label: 'Partners', icon: <FiUsers className="w-4 h-4" /> },
        { key: 'referidos', label: 'Referidos', icon: <FiBarChart2 className="w-4 h-4" /> },
        { key: 'facturacion', label: 'Facturación', icon: <FiDollarSign className="w-4 h-4" /> },
        { key: 'ia_proposals', label: 'Generador IA', icon: <FiCpu className="w-4 h-4" /> },
    ];

    return (
        <div className="flex-1 bg-muted/10 min-h-screen">
            <div className="bg-background border-b border-border shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 flex-wrap">
                            Admin Dashboard
                            <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                v1.2.0
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

                {/* ======= TAB: GENERADOR IA ======= */}
                {activeTab === 'ia_proposals' && (
                    <div className="bg-card shadow-sm rounded-xl border border-border/50 p-6 lg:p-8">
                        <AIProposalsGenerator />
                    </div>
                )}

                {/* ======= TAB: SOLICITUDES CRM ======= */}
                {activeTab === 'solicitudes' && (() => {
                    const activeCotizaciones = cotizaciones.filter(c => !c.convertidoACliente);
                    const filtered = statusFilter === 'todas' ? activeCotizaciones : activeCotizaciones.filter(c => (c.status || 'por_atender') === statusFilter);
                    return (
                        <>
                            <div className="flex justify-end mb-4">
                                <button
                                    onClick={() => { setNewLeadData({}); setIsCustomProyecto(false); setShowNewLeadModal(true); }}
                                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                                >
                                    <FiUserPlus className="w-4 h-4" /> Nuevo Lead Manual
                                </button>
                            </div>

                            {/* Modal Nuevo Lead */}
                            {showNewLeadModal && (
                                <div className="p-5 bg-card border border-primary/20 rounded-xl shadow-md mb-6 animate-in fade-in zoom-in-95 duration-200">
                                    <h3 className="font-bold text-lg text-foreground flex items-center gap-2 mb-4">
                                        <FiUserPlus className="text-primary w-5 h-5" /> Registrar Lead Manualmente
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold uppercase text-muted-foreground">Nombre Completo *</label>
                                            <input type="text" placeholder="Ej: Juan Pérez" value={newLeadData.nombre || ''} onChange={e => setNewLeadData(prev => ({ ...prev, nombre: e.target.value }))} className="w-full mt-1 text-sm px-3 py-2 border border-input rounded-md bg-background focus:ring-1 focus:ring-primary" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold uppercase text-muted-foreground">Correo Electrónico *</label>
                                            <input type="email" placeholder="ejemplo@correo.com" value={newLeadData.correo || ''} onChange={e => setNewLeadData(prev => ({ ...prev, correo: e.target.value }))} className="w-full mt-1 text-sm px-3 py-2 border border-input rounded-md bg-background focus:ring-1 focus:ring-primary" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold uppercase text-muted-foreground">Teléfono (WhatsApp)</label>
                                            <input type="tel" placeholder="Ej: 5512345678" value={newLeadData.telefono || ''} onChange={e => setNewLeadData(prev => ({ ...prev, telefono: e.target.value }))} className="w-full mt-1 text-sm px-3 py-2 border border-input rounded-md bg-background focus:ring-1 focus:ring-primary" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold uppercase text-muted-foreground">Presupuesto (Opcional)</label>
                                            <input type="text" placeholder="Ej: $15,000 MXN" value={newLeadData.presupuesto || ''} onChange={e => setNewLeadData(prev => ({ ...prev, presupuesto: e.target.value }))} className="w-full mt-1 text-sm px-3 py-2 border border-input rounded-md bg-background focus:ring-1 focus:ring-primary" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-semibold uppercase text-muted-foreground">Servicio / Proyecto *</label>
                                            <select 
                                                value={isCustomProyecto ? 'otro' : (newLeadData.proyecto || '')}
                                                onChange={e => {
                                                    if (e.target.value === 'otro') {
                                                        setIsCustomProyecto(true);
                                                        setNewLeadData(prev => ({ ...prev, proyecto: '' }));
                                                    } else {
                                                        setIsCustomProyecto(false);
                                                        setNewLeadData(prev => ({ ...prev, proyecto: e.target.value }));
                                                    }
                                                }}
                                                className="w-full mt-1 text-sm px-3 py-2 border border-input rounded-md bg-background focus:ring-1 focus:ring-primary"
                                            >
                                                <option value="" disabled>Selecciona el servicio de interés...</option>
                                                <option value="CRM Multi-agente">CRM Multi-agente</option>
                                                <option value="Landing Pages / Embudos">Landing Pages / Embudos</option>
                                                <option value="E-commerce / Tiendas Online">E-commerce / Tiendas Online</option>
                                                <option value="Portales Educativos (E-learning)">Portales Educativos (E-learning)</option>
                                                <option value="Sistemas de Tickets (Helpdesk)">Sistemas de Tickets (Helpdesk)</option>
                                                <option value="Directorios / Marketplaces">Directorios / Marketplaces</option>
                                                <option value="Portales de Empleados (RRHH)">Portales de Empleados (RRHH)</option>
                                                <option value="Sistemas de Reservas / Citas">Sistemas de Reservas / Citas</option>
                                                <option value="Analíticas y Dashboards Financieros">Analíticas y Dashboards Financieros</option>
                                                <option value="Sistemas de Registros (Médicos, Escolares)">Sistemas de Registros (Médicos, Escolares)</option>
                                                <option value="otro">Otro / Personalizado</option>
                                            </select>
                                        </div>
                                        {isCustomProyecto && (
                                            <div className="md:col-span-2">
                                                <label className="text-xs font-semibold uppercase text-muted-foreground">Especificar Proyecto</label>
                                                <input type="text" placeholder="Escribe el proyecto o requerimiento..." value={newLeadData.proyecto || ''} onChange={e => setNewLeadData(prev => ({ ...prev, proyecto: e.target.value }))} className="w-full mt-1 text-sm px-3 py-2 border border-input rounded-md bg-background focus:ring-1 focus:ring-primary" />
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                            <div>
                                                <label className="text-xs font-semibold uppercase text-muted-foreground">Cobro de Desarrollo ($ MXN)</label>
                                                <input type="number" placeholder="Ej: 15000" value={newLeadData.precioCotizado || ''} onChange={e => setNewLeadData(prev => ({ ...prev, precioCotizado: e.target.value ? parseFloat(e.target.value) : undefined }))} className="w-full mt-1 text-sm px-3 py-2 border border-input rounded-md bg-background focus:ring-1 focus:ring-primary" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold uppercase text-muted-foreground">Mensualidad Soporte ($ MXN)</label>
                                                <input type="number" placeholder="Ej: 3000" value={newLeadData.mensualidadMantenimiento || ''} onChange={e => setNewLeadData(prev => ({ ...prev, mensualidadMantenimiento: e.target.value ? parseFloat(e.target.value) : undefined }))} className="w-full mt-1 text-sm px-3 py-2 border border-input rounded-md bg-background focus:ring-1 focus:ring-primary" />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-semibold uppercase text-muted-foreground">Descripción Adicional (Opcional)</label>
                                            <textarea placeholder="Detalles del lead, requerimientos específicos..." value={newLeadData.descripcion || ''} onChange={e => setNewLeadData(prev => ({ ...prev, descripcion: e.target.value }))} className="w-full mt-1 text-sm px-3 py-2 border border-input rounded-md bg-background focus:ring-1 focus:ring-primary h-20 resize-none" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-6 border-t border-border pt-4">
                                        <button onClick={crearLeadManual} disabled={newLeadLoading} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 hover:shadow-lg disabled:opacity-50 transition-all">
                                            {newLeadLoading ? 'Guardando...' : <><FiSave className="w-4 h-4" /> Crear Lead Cotización</>}
                                        </button>
                                        <button onClick={() => setShowNewLeadModal(false)} className="px-5 py-2.5 bg-muted text-foreground border border-input rounded-lg text-sm font-medium hover:bg-muted/80 transition-all">Cancelar</button>
                                    </div>
                                </div>
                            )}

                            {viewMode === 'kanban' ? (
                                <div className="flex gap-4">
                                    <div className="flex-1 bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden flex flex-col h-[82vh]">
                                        <div className="p-4 border-b border-border bg-muted/30">
                                            <div className="flex justify-between items-center">
                                                <h2 className="font-semibold text-lg">Master CRM — Kanban</h2>
                                                <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => setViewMode('kanban')}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all bg-background text-foreground shadow-sm"
                                                        >
                                                            <FiGrid className="w-3.5 h-3.5" /> Pipeline
                                                        </button>
                                                        <button
                                                            onClick={() => setViewMode('lista')}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all text-muted-foreground hover:text-foreground"
                                                        >
                                                            <FiList className="w-3.5 h-3.5" /> Lista Leads
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        <div className="flex-1 overflow-x-auto bg-muted/5">
                                            <MasterKanbanBoard
                                                cotizaciones={activeCotizaciones}
                                                clientes={clientes}
                                                selectedId={selected?.id || selectedCliente?.id}
                                                onSelectCotizacion={(c) => { 
                                                    setSelected(c as unknown as Cotizacion); 
                                                    setSelectedCliente(null);
                                                    setPriceInput(String(c.precioCotizado ?? '')); 
                                                    setMensualidadInput(String(c.mensualidadMantenimiento ?? ''));
                                                    setNotasInput(c.notasAdmin ?? ''); 
                                                }}
                                                onSelectCliente={(c) => { 
                                                    handleSelectCliente(c); 
                                                    setSelected(null);
                                                }}
                                                onDeleteCotizacion={deleteCotizacion}
                                                onDeleteCliente={(id) => { setSelectedCliente(clientes.find(cl => cl.id === id) || null); setShowDeleteCliente(true); }}
                                                onStatusChangeCotizacion={(id, newStatus) => updateCotizacion(id, { status: newStatus })}
                                                onStatusChangeCliente={actualizarStatusCliente}
                                                onConvertCotizacionToCliente={(id) => {
                                                    const cot = cotizaciones.find(c => c.id === id);
                                                    if (cot) {
                                                        setSelected(cot);
                                                        setConvertirFecha('');
                                                        setShowConvertirModal(true);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* PANEL DERECHO KANBAN UNIFICADO */}
                                    {(selected || selectedCliente) && (
                                        <div className="w-[380px] flex-shrink-0 bg-card border border-border rounded-xl p-5 space-y-4 overflow-y-auto max-h-[82vh] shadow-sm">
                                            {selected ? (
                                                /* DETALLE COTIZACION */
                                                <>
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-lg truncate">{selected.nombre}</p>
                                                            <p className="text-xs text-muted-foreground truncate">{selected.proyecto}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig[selected.status || 'por_atender']?.color}`}>Lead</span>
                                                            <button onClick={() => setSelected(null)} className="p-1.5 text-muted-foreground hover:bg-muted rounded-md text-xs">✕</button>
                                                        </div>
                                                    </div>

                                                    {/* Contact */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-3 bg-muted/30 p-2.5 rounded-lg border border-border/50">
                                                            <FiMail className="text-primary w-4 h-4 flex-shrink-0" />
                                                            <div className="truncate"><p className="text-xs text-muted-foreground">Correo</p><p className="text-sm font-medium truncate">{selected.correo}</p></div>
                                                        </div>
                                                        <div className="flex items-center gap-3 bg-muted/30 p-2.5 rounded-lg border border-border/50">
                                                            <FiPhone className="text-primary w-4 h-4 flex-shrink-0" />
                                                            <div className="flex-1 truncate"><p className="text-xs text-muted-foreground">Teléfono</p><p className="text-sm font-medium truncate">{selected.telefono || 'N/A'}</p></div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-background border border-border rounded-xl p-3">
                                                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Precios Cotizados (MXN)</p>
                                                        <div className="space-y-3">
                                                            <div className="flex gap-2">
                                                                <input type="number" placeholder="Desarrollo" value={priceInput} onChange={e => setPriceInput(e.target.value)}
                                                                    className="flex h-8 flex-1 rounded-md border border-input bg-background px-2 text-xs" />
                                                                <input type="number" placeholder="Mensualidad" value={mensualidadInput} onChange={e => setMensualidadInput(e.target.value)}
                                                                    className="flex h-8 w-24 rounded-md border border-input bg-background px-2 text-xs" />
                                                                <button onClick={() => updateCotizacion(selected.id, { precioCotizado: priceInput ? parseFloat(priceInput) : null, mensualidadMantenimiento: mensualidadInput ? parseFloat(mensualidadInput) : null })}
                                                                    className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 font-semibold flex-shrink-0">
                                                                    <FiSave className="inline-block" />
                                                                </button>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span>Desarrollo: <strong className="text-green-600">${selected.precioCotizado?.toLocaleString() || '0'}</strong></span>
                                                                <span>Mensual: <strong className="text-blue-600">${selected.mensualidadMantenimiento?.toLocaleString() || '0'}</strong></span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {selected.precioCotizado && (
                                                        <div className={`rounded-xl border p-3 ${selected.status === 'atendida' ? 'bg-green-50 dark:bg-green-950/20 border-green-300/50' : 'bg-muted/30 border-border'}`}>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <FiLink className="text-[#00B1EA] w-3 h-3" />
                                                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Link MercadoPago</p>
                                                                </div>
                                                                <button onClick={openPaymentModal} disabled={generatingLink} className="text-[10px] font-semibold px-2 py-1 rounded bg-[#00B1EA] text-white hover:bg-[#0095c8]">
                                                                    {selected.linkPago ? 'Generar de nuevo' : 'Generar Link'}
                                                                </button>
                                                            </div>
                                                            {selected.linkPago && <p className="text-[10px] truncate text-muted-foreground font-mono bg-background p-1.5 rounded">{selected.linkPago}</p>}
                                                        </div>
                                                    )}

                                                    <AIAnalisis data={{ nombre: selected.nombre, proyecto: selected.proyecto, presupuesto: selected.presupuesto, descripcion: selected.descripcion }} />

                                                    {selected.status === 'atendida' && selected.precioCotizado && (
                                                        <button onClick={() => { setConvertirFecha(''); setShowConvertirModal(true); }} className="w-full flex justify-center items-center gap-2 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 mt-4">
                                                            <FiUserCheck /> Formalizar a Cliente Activo
                                                        </button>
                                                    )}
                                                </>
                                            ) : selectedCliente ? (
                                                /* DETALLE CLIENTE ACTIVO */
                                                <>
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-lg truncate">{selectedCliente.nombre}</p>
                                                            <p className="text-xs text-muted-foreground truncate">{selectedCliente.proyecto}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-green-500 text-green-600 bg-green-50">Cliente</span>
                                                            <button onClick={() => { setEditClienteData({ ...selectedCliente }); setShowEditCliente(true); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-1.414c0-.53.21-1.04.586-1.414z" /></svg></button>
                                                            <button onClick={() => setShowDeleteCliente(true)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"><FiTrash2 className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => setSelectedCliente(null)} className="p-1.5 text-muted-foreground hover:bg-muted rounded-md text-xs">✕</button>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        {selectedCliente.precioCobrado && <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded font-semibold flex-1 text-center">Desarrollo: ${selectedCliente.precioCobrado.toLocaleString()}</span>}
                                                        {selectedCliente.mensualidadMonto && <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded font-semibold flex-1 text-center">${selectedCliente.mensualidadMonto.toLocaleString()}/mes</span>}
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 mt-4">Historial de Mensualidades</p>
                                                        {!selectedCliente.mensualidadMonto ? (
                                                            <p className="text-xs text-muted-foreground italic">Este cliente no paga mensualidad.</p>
                                                        ) : pagosCliente.length === 0 ? (
                                                            <p className="text-xs text-muted-foreground italic">No hay registros de pago.</p>
                                                        ) : (
                                                            <div className="space-y-1.5">
                                                                {pagosCliente.map(p => {
                                                                    const nombreMes = new Date(p.anio, p.mes - 1).toLocaleString('es', { month: 'long' });
                                                                    return (
                                                                        <div key={p.id} className="flex items-center justify-between bg-muted/30 border border-border rounded-md px-3 py-2 text-sm">
                                                                            <span className="capitalize text-xs font-semibold">{nombreMes} {p.anio}</span>
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-xs font-mono">${p.monto}</span>
                                                                                {p.pagado ? (
                                                                                    <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded cursor-pointer" onClick={() => marcarPagado(selectedCliente.id, p, false)}>Pagado</span>
                                                                                ) : (
                                                                                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded cursor-pointer" onClick={() => marcarPagado(selectedCliente.id, p, true)}>Cobrar</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Modal eliminar cliente */}
                                                    {showDeleteCliente && (
                                                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                            <p className="text-xs font-semibold text-red-700 mb-2">¿Eliminar cliente?</p>
                                                            <div className="flex gap-2">
                                                                <button onClick={eliminarCliente} className="flex-1 text-xs px-2 py-1 bg-red-600 text-white rounded">Sí, eliminar</button>
                                                                <button onClick={() => setShowDeleteCliente(false)} className="flex-1 text-xs px-2 py-1 border rounded hover:bg-muted">Cancelar</button>
                                                            </div>
                                                        </div>
                                                    )}

                                                </>
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-1 bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden flex flex-col h-[82vh]">
                                        <div className="p-4 border-b border-border bg-muted/30">
                                            <div className="flex justify-between items-center mb-3">
                                                <h2 className="font-semibold text-lg flex gap-2">Listado</h2>
                                                <div className="flex items-center gap-2">
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
                                            
                                            <div className="flex bg-muted/50 p-1 rounded-lg mb-3">
                                                <button onClick={() => { setSelectedCliente(null); setSelected(null); }} className={`flex-1 text-xs py-1.5 rounded-md font-semibold ${selectedCliente === null ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}>
                                                    Leads ({activeCotizaciones.length})
                                                </button>
                                                <button onClick={() => { setSelected(null); setSelectedCliente(clientes[0] || null); }} className={`flex-1 text-xs py-1.5 rounded-md font-semibold ${selectedCliente !== null ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}>
                                                    Clientes ({clientes.length})
                                                </button>
                                            </div>

                                            {selectedCliente === null && (
                                                <div className="flex flex-wrap gap-1">
                                                    {(['todas', 'por_atender', 'en_proceso', 'atendida', 'descartada'] as const).map(s => (
                                                        <button key={s} onClick={() => setStatusFilter(s)}
                                                            className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${statusFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
                                                            {s === 'todas' ? 'Todas' : statusConfig[s]?.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
                                            {selectedCliente === null ? (
                                                filtered.length === 0 ? (
                                                    <p className="text-center text-muted-foreground p-4 text-sm">No hay solicitudes en esta categoría.</p>
                                                ) : filtered.map(c => {
                                                    const st = statusConfig[c.status || 'por_atender'];
                                                    return (
                                                        <div key={c.id} className={`flex items-center gap-2 rounded-lg border transition-colors ${selected?.id === c.id ? 'bg-primary/10 border-primary/30' : 'bg-background border-transparent hover:bg-muted/50 hover:border-border'}`}>
                                                            <button onClick={() => { setSelected(c); setSelectedCliente(null); setPriceInput(String(c.precioCotizado ?? '')); setMensualidadInput(String(c.mensualidadMantenimiento ?? '')); setNotasInput(c.notasAdmin ?? ''); }}
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
                                                })
                                            ) : (
                                                clientes.length === 0 ? (
                                                    <p className="text-center text-muted-foreground p-4 text-sm">No hay clientes activos.</p>
                                                ) : clientes.map(c => (
                                                    <div key={c.id} className={`flex items-center gap-2 rounded-lg border transition-colors ${selectedCliente?.id === c.id ? 'bg-primary/10 border-primary/30' : 'bg-background border-transparent hover:bg-muted/50 hover:border-border'}`}>
                                                        <button onClick={() => { setSelectedCliente(c); setSelected(null); }} className="flex-1 text-left p-3 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-green-200 bg-green-50 text-green-700">
                                                                    Cliente Activo
                                                                </span>
                                                                {c.mensualidadMonto && <span className="text-[10px] text-blue-600 font-mono font-bold">${c.mensualidadMonto.toLocaleString()}/m</span>}
                                                            </div>
                                                            <p className="font-medium text-sm truncate">{c.nombre}</p>
                                                            <p className="text-xs text-muted-foreground truncate">{c.proyecto}</p>
                                                        </button>
                                                    </div>
                                                ))
                                            )}
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

                                                {/* Botón Convertir a Cliente */}
                                                {selected.status === 'atendida' && selected.precioCotizado && (
                                                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-bold text-green-700 dark:text-green-400">¿Listo para formalizar?</p>
                                                            <p className="text-xs text-muted-foreground">Convierte esta solicitud en un cliente activo del CRM</p>
                                                        </div>
                                                        <button
                                                            onClick={() => { setConvertirFecha(''); setShowConvertirModal(true); }}
                                                            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
                                                        >
                                                            <FiUserCheck className="w-4 h-4" /> Convertir a Cliente
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : selectedCliente ? (
                                            <div className="bg-card border border-border/50 rounded-xl shadow-sm p-6 lg:p-8 space-y-6">
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                    <div>
                                                        <h2 className="text-2xl font-bold">{selectedCliente.nombre}</h2>
                                                        <p className="inline-block mt-2 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">{selectedCliente.proyecto}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => {
                                                            const coti = cotizaciones.find(cot => cot.id === selectedCliente.cotizacionId);
                                                            if (coti) {
                                                                setSelected(coti);
                                                                setSelectedCliente(null);
                                                                toast.success('Abriendo cotización original para ver contrato/link...');
                                                            } else {
                                                                toast.error('No se encontró la cotización original.');
                                                            }
                                                        }} className="px-3 py-1.5 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200" title="Ver cotización original, contratos y links de pago">
                                                            <FiFileText className="inline w-3.5 h-3.5" /> Cotización Base
                                                        </button>
                                                        <button onClick={() => { setEditClienteData({ ...selectedCliente }); setShowEditCliente(true); }} className="px-3 py-1.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
                                                            Editar
                                                        </button>
                                                        <button onClick={() => setShowDeleteCliente(true)} className="px-3 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-md hover:bg-red-200">
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="bg-background p-4 rounded-xl border border-border">
                                                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Precio Cobrado</p>
                                                        <p className="text-xl font-black text-green-600">${selectedCliente.precioCobrado?.toLocaleString() || '0'}</p>
                                                    </div>
                                                    <div className="bg-background p-4 rounded-xl border border-border">
                                                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Mensualidad</p>
                                                        <p className="text-xl font-black text-blue-600">${selectedCliente.mensualidadMonto?.toLocaleString() || '0'}<span className="text-sm font-normal text-muted-foreground">/mes</span></p>
                                                    </div>
                                                </div>

                                                <div className="bg-muted/30 p-4 rounded-xl border border-border">
                                                    <h3 className="text-sm font-bold uppercase text-muted-foreground mb-3">Historial de Mensualidades</h3>
                                                    {pagosCliente.length === 0 ? (
                                                        <p className="text-sm text-muted-foreground italic">No hay historial de pagos.</p>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {pagosCliente.map(pago => {
                                                                const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                                                                const isEditing = editPagoId === pago.id;
                                                                return (
                                                                    <div key={pago.id} className={`flex flex-col gap-2 p-3 rounded-lg border text-xs shadow-sm transition-colors ${pago.pagado ? 'bg-green-50 dark:bg-green-950/20 border-green-200/60 text-green-800 dark:text-green-300' : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200/60 text-amber-800 dark:text-amber-300'}`}>
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex flex-col gap-1">
                                                                                <p className="font-bold text-sm">{meses[pago.mes - 1]} {pago.anio}</p>
                                                                                {isEditing ? (
                                                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                                                        <span className="font-semibold text-muted-foreground">$</span>
                                                                                        <input 
                                                                                            type="number" 
                                                                                            value={editPagoMonto} 
                                                                                            onChange={e => setEditPagoMonto(Number(e.target.value))} 
                                                                                            className="w-20 h-7 px-2 text-xs border border-border rounded-md bg-background focus:ring-1 focus:ring-primary/50 text-foreground"
                                                                                            autoFocus
                                                                                        />
                                                                                        <button onClick={() => saveEditPago(pago)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"><FiSave className="w-3.5 h-3.5" /></button>
                                                                                        <button onClick={() => setEditPagoId(null)} className="p-1 text-red-600 hover:bg-red-100 rounded-md transition-colors"><FiX className="w-3.5 h-3.5" /></button>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="flex items-center gap-2 group">
                                                                                        <p className="text-[11px] font-medium opacity-80">${pago.monto.toLocaleString()} MXN</p>
                                                                                        {!pago.pagado && (
                                                                                            <button 
                                                                                                onClick={() => { setEditPagoId(pago.id); setEditPagoMonto(pago.monto); }} 
                                                                                                className="text-blue-500 hover:text-blue-700 opacity-40 group-hover:opacity-100 transition-opacity" 
                                                                                                title="Editar monto a cobrar de este mes"
                                                                                            >
                                                                                                <FiEdit2 className="w-3 h-3" />
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                {!pago.pagado && (
                                                                                    <button 
                                                                                        onClick={() => generarLinkMensualidad(pago)} 
                                                                                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-semibold text-[10px] text-white shadow-sm transition-all ${pago.linkPago ? 'bg-[#00B1EA] hover:bg-[#0090c0] hover:shadow-md' : 'bg-indigo-500 hover:bg-indigo-600'}`}
                                                                                        title={pago.linkPago ? 'Copiar link ya generado' : 'Generar link de MercadoPago para esta mensualidad'}
                                                                                    >
                                                                                        {pago.linkPago ? <><FiCopy className="w-3 h-3" /> Copiar Link</> : <><FiLink className="w-3 h-3" /> Crear Link</>}
                                                                                    </button>
                                                                                )}
                                                                                <button onClick={() => marcarPagado(selectedCliente.id, pago, !pago.pagado)}
                                                                                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md shadow-sm font-semibold text-[10px] transition-colors ${pago.pagado ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>
                                                                                    {pago.pagado ? <><FiCheckCircle className="w-3 h-3" /> Pagado</> : <><FiXCircle className="w-3 h-3" /> Pendiente</>}
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        {pago.linkPago && !pago.pagado && (
                                                                            <div className="text-[9px] text-muted-foreground truncate w-full pt-1 border-t border-black/5 dark:border-white/5 mt-1 opacity-70">
                                                                                Link adjunto y listo para enviar.
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-4 pt-4 border-t border-border">
                                                    <a href={`mailto:${selectedCliente.correo}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><FiMail /> {selectedCliente.correo}</a>
                                                    {selectedCliente.telefono && <a href={`tel:${selectedCliente.telefono}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><FiPhone /> {selectedCliente.telefono}</a>}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-full min-h-[400px] flex items-center justify-center border border-dashed border-border rounded-xl bg-card">
                                                <p className="text-muted-foreground text-center">Selecciona un elemento<br />para ver detalles y gestionar el CRM.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    );
                })()}

                {/* ======= TAB: CLIENTES ======= */}
                {activeTab === 'clientes' && (
                    <div className="space-y-4">
                        {/* Header con toggle */}
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <h2 className="font-semibold text-lg">CRM — Clientes</h2>
                                <p className="text-sm text-muted-foreground">
                                    {clienteViewMode === 'pipeline'
                                        ? 'Pipeline visual. Arrastra para cambiar estado.'
                                        : 'Vista tabla con todos los datos del cliente.'}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Sub-selector Pipeline / Lista */}
                                <div className="flex bg-muted rounded-lg p-0.5 border border-border/50">
                                    <button
                                        onClick={() => setClienteViewMode('pipeline')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${clienteViewMode === 'pipeline'
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        <FiGrid className="w-3.5 h-3.5" /> Pipeline
                                    </button>
                                    <button
                                        onClick={() => setClienteViewMode('lista')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${clienteViewMode === 'lista'
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        <FiList className="w-3.5 h-3.5" /> Lista
                                    </button>
                                </div>
                                <div className="flex gap-2 text-xs">
                                    <span className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 px-2 py-1 rounded-full font-semibold">{clientes.filter(c => c.status === 'activo').length} activos</span>
                                    <span className="bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 px-2 py-1 rounded-full font-semibold">{clientes.filter(c => c.status === 'en_mora').length} en mora</span>
                                </div>
                            </div>
                        </div>



                        {clientes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded-xl text-center">
                                <FiUserCheck className="w-10 h-10 text-muted-foreground/40 mb-3" />
                                <p className="font-medium text-muted-foreground">No hay clientes aún</p>
                                <p className="text-sm text-muted-foreground/60 mt-1">Convierte una solicitud atendida en cliente usando el botón <strong>"Convertir a Cliente"</strong></p>
                            </div>
                        ) : clienteViewMode === 'lista' ? (
                            /* ── VISTA LISTA ── */
                            <div className="flex gap-4">
                                <div className="flex-1 overflow-x-auto bg-card border border-border rounded-xl">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                <th className="text-left px-4 py-3">Cliente</th>
                                                <th className="text-left px-4 py-3">Proyecto</th>
                                                <th className="text-left px-4 py-3">Estado</th>
                                                <th className="text-right px-4 py-3">Precio</th>
                                                <th className="text-right px-4 py-3">Mensualidad</th>
                                                <th className="text-center px-4 py-3">Mes actual</th>
                                                <th className="text-left px-4 py-3">Email</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {clientes.map(cl => {
                                                const statusColors: Record<string, string> = {
                                                    activo: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
                                                    en_mora: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
                                                    pausado: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
                                                    terminado: 'bg-muted text-muted-foreground',
                                                };
                                                const statusLabel: Record<string, string> = {
                                                    activo: 'Activo', en_mora: 'En Mora', pausado: 'Pausado', terminado: 'Terminado',
                                                };
                                                const mesActual = pagosCliente.find(p =>
                                                    selectedCliente?.id === cl.id &&
                                                    p.mes === new Date().getMonth() + 1 &&
                                                    p.anio === new Date().getFullYear()
                                                );
                                                return (
                                                    <tr
                                                        key={cl.id}
                                                        onClick={() => handleSelectCliente(cl)}
                                                        className={`border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors ${selectedCliente?.id === cl.id ? 'bg-primary/5' : ''}`}
                                                    >
                                                        <td className="px-4 py-3 font-semibold">{cl.nombre}</td>
                                                        <td className="px-4 py-3 text-muted-foreground max-w-[180px] truncate">{cl.proyecto}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[cl.status] ?? 'bg-muted text-muted-foreground'}`}>
                                                                {statusLabel[cl.status] ?? cl.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-mono font-semibold text-green-600">
                                                            {cl.precioCobrado ? `$${cl.precioCobrado.toLocaleString()}` : '—'}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-mono font-semibold text-blue-600">
                                                            {cl.mensualidadMonto ? `$${cl.mensualidadMonto.toLocaleString()}/mes` : '—'}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {!cl.mensualidadMonto ? (
                                                                <span className="text-xs text-muted-foreground">N/A</span>
                                                            ) : selectedCliente?.id !== cl.id ? (
                                                                <span className="text-xs text-muted-foreground italic">Clic para ver</span>
                                                            ) : mesActual ? (
                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${mesActual.pagado ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                                    {mesActual.pagado ? '✓ Pagado' : '⏳ Pendiente'}
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground">Cargando...</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-xs text-muted-foreground truncate max-w-[160px]">{cl.correo ?? '—'}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                            </div>
                        ) : (
                            /* ── VISTA PIPELINE ── */
                            <div className="flex gap-4">
                                <div className="flex-1 overflow-hidden">
                                    <ClientePipeline
                                        clientes={clientes}
                                        selectedId={selectedCliente?.id}
                                        onSelect={handleSelectCliente}
                                        onStatusChange={actualizarStatusCliente}
                                    />
                                </div>

                                {selectedCliente && (
                                    <div className="w-80 flex-shrink-0 bg-card border border-border rounded-xl p-4 space-y-4 overflow-y-auto max-h-[70vh]">
                                        <div>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-base truncate">{selectedCliente.nombre}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{selectedCliente.proyecto}</p>
                                                </div>
                                                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                                        <button
                                                            onClick={() => {
                                                                const coti = cotizaciones.find(cot => cot.id === selectedCliente.cotizacionId);
                                                                if (coti) {
                                                                    setSelected(coti);
                                                                    setSelectedCliente(null);
                                                                    toast.success('Abriendo cotización original para ver contrato/link...');
                                                                } else {
                                                                    toast.error('No se encontró la cotización original.');
                                                                }
                                                            }}
                                                            className="p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-md transition-colors"
                                                            title="Ver cotización original, contratos y links"
                                                        >
                                                            <FiFileText className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => { setEditClienteData({ ...selectedCliente }); setShowEditCliente(true); }}
                                                            className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-colors"
                                                            title="Editar cliente"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-1.414c0-.53.21-1.04.586-1.414z" /></svg>
                                                        </button>
                                                    <button
                                                        onClick={() => setShowDeleteCliente(true)}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                                                        title="Eliminar cliente"
                                                    >
                                                        <FiTrash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => setSelectedCliente(null)} className="p-1.5 text-muted-foreground hover:text-foreground rounded-md text-xs">✕</button>
                                                </div>
                                            </div>

                                            {/* Modales reubicados fuera de este contenedor */}

                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {selectedCliente.precioCobrado && (
                                                    <span className="text-xs bg-green-50 text-green-700 dark:bg-green-950/20 border border-green-200/50 px-2 py-0.5 rounded-full font-semibold">
                                                        Proyecto: ${selectedCliente.precioCobrado.toLocaleString()}
                                                    </span>
                                                )}
                                                {selectedCliente.mensualidadMonto && (
                                                    <span className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-950/20 border border-blue-200/50 px-2 py-0.5 rounded-full font-semibold">
                                                        ${selectedCliente.mensualidadMonto.toLocaleString()}/mes
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-1.5 mt-2 text-xs">
                                                {selectedCliente.correo && <a href={`mailto:${selectedCliente.correo}`} className="text-primary hover:underline truncate">{selectedCliente.correo}</a>}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Historial de Mensualidades</p>
                                            {!selectedCliente.mensualidadMonto ? (
                                                <p className="text-xs text-muted-foreground italic">Sin mensualidad.</p>
                                            ) : pagosCliente.length === 0 ? (
                                                <p className="text-xs text-muted-foreground">Cargando...</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {pagosCliente.map(pago => {
                                                        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                                                        const isEditing = editPagoId === pago.id;
                                                        return (
                                                            <div key={pago.id} className={`flex flex-col gap-2 p-3 rounded-lg border text-xs shadow-sm transition-colors ${pago.pagado ? 'bg-green-50 dark:bg-green-950/20 border-green-200/60 text-green-800 dark:text-green-300' : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200/60 text-amber-800 dark:text-amber-300'}`}>
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex flex-col gap-1">
                                                                        <p className="font-bold text-sm">{meses[pago.mes - 1]} {pago.anio}</p>
                                                                        {isEditing ? (
                                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                                <span className="font-semibold text-muted-foreground">$</span>
                                                                                <input 
                                                                                    type="number" 
                                                                                    value={editPagoMonto} 
                                                                                    onChange={e => setEditPagoMonto(Number(e.target.value))} 
                                                                                    className="w-20 h-7 px-2 text-xs border border-border rounded-md bg-background focus:ring-1 focus:ring-primary/50 text-foreground"
                                                                                    autoFocus
                                                                                />
                                                                                <button onClick={() => saveEditPago(pago)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"><FiSave className="w-3.5 h-3.5" /></button>
                                                                                <button onClick={() => setEditPagoId(null)} className="p-1 text-red-600 hover:bg-red-100 rounded-md transition-colors"><FiX className="w-3.5 h-3.5" /></button>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex items-center gap-2 group">
                                                                                <p className="text-[11px] font-medium opacity-80">${pago.monto.toLocaleString()} MXN</p>
                                                                                {!pago.pagado && (
                                                                                    <button 
                                                                                        onClick={() => { setEditPagoId(pago.id); setEditPagoMonto(pago.monto); }} 
                                                                                        className="text-blue-500 hover:text-blue-700 opacity-40 group-hover:opacity-100 transition-opacity" 
                                                                                        title="Editar monto a cobrar de este mes"
                                                                                    >
                                                                                        <FiEdit2 className="w-3 h-3" />
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        {!pago.pagado && (
                                                                            <button 
                                                                                onClick={() => generarLinkMensualidad(pago)} 
                                                                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-semibold text-[10px] text-white shadow-sm transition-all ${pago.linkPago ? 'bg-[#00B1EA] hover:bg-[#0090c0] hover:shadow-md' : 'bg-indigo-500 hover:bg-indigo-600'}`}
                                                                                title={pago.linkPago ? 'Copiar link ya generado' : 'Generar link de MercadoPago para esta mensualidad'}
                                                                            >
                                                                                {pago.linkPago ? <><FiCopy className="w-3 h-3" /> Copiar Link</> : <><FiLink className="w-3 h-3" /> Crear Link</>}
                                                                            </button>
                                                                        )}
                                                                        <button onClick={() => marcarPagado(selectedCliente.id, pago, !pago.pagado)}
                                                                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md shadow-sm font-semibold text-[10px] transition-colors ${pago.pagado ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>
                                                                            {pago.pagado ? <><FiCheckCircle className="w-3 h-3" /> Pagado</> : <><FiXCircle className="w-3 h-3" /> Pendiente</>}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                {pago.linkPago && !pago.pagado && (
                                                                    <div className="text-[9px] text-muted-foreground truncate w-full pt-1 border-t border-black/5 dark:border-white/5 mt-1 opacity-70">
                                                                        Link adjunto y listo para enviar.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Edit and Delete Modals have been relocated to the component root */}
                    </div>
                )}

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
            {/* ======= MODAL: CONVERTIR A CLIENTE ======= */}
            {showConvertirModal && selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
                        <div>
                            <h3 className="font-bold text-lg">Convertir a Cliente</h3>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                <strong>{selected.nombre}</strong> — {selected.proyecto}
                            </p>
                        </div>

                        <div className="bg-muted/30 rounded-lg p-3 space-y-1 text-xs">
                            {selected.precioCotizado && (
                                <div className="flex justify-between"><span className="text-muted-foreground">Precio del proyecto</span><span className="font-semibold text-green-600">${selected.precioCotizado.toLocaleString()} MXN</span></div>
                            )}
                            {selected.mensualidadMantenimiento && (
                                <div className="flex justify-between"><span className="text-muted-foreground">Mensualidad mantenimiento</span><span className="font-semibold text-blue-600">${selected.mensualidadMantenimiento.toLocaleString()} MXN/mes</span></div>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                                Fecha de inicio del contrato *
                            </label>
                            <input
                                type="date"
                                value={convertirFecha}
                                onChange={e => setConvertirFecha(e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                            />
                        </div>

                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={() => setShowConvertirModal(false)}
                                className="flex-1 border border-border rounded-lg py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={convertirACliente}
                                disabled={!convertirFecha || convertirLoading}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2.5 text-sm font-bold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                            >
                                {convertirLoading ? 'Procesando...' : <><FiUserCheck className="w-4 h-4" /> Confirmar</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ================= MODALES FLOTANTES COMPARTIDOS (EDICIÓN / ELIMINACIÓN DE CLIENTES) ================= */}
            {showDeleteCliente && selectedCliente && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md border border-red-200/60 shadow-xl rounded-xl p-6">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <FiTrash2 className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold">Eliminar Cliente</h2>
                        </div>
                        <p className="text-base text-muted-foreground mb-6">
                            ¿Estás seguro de que deseas eliminar permanentemente a <strong>{selectedCliente.nombre}</strong>? 
                            Esta acción no se puede deshacer y borrará todo su historial asociado.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowDeleteCliente(false)} className="px-4 py-2 border border-border rounded-lg hover:bg-muted font-medium transition-colors">
                                Cancelar
                            </button>
                            <button onClick={eliminarCliente} className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-sm">
                                Sí, eliminar cliente
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEditCliente && selectedCliente && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md border border-border shadow-xl rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                            <h2 className="text-lg font-bold">Editar Cliente: {selectedCliente.nombre}</h2>
                            <button onClick={() => setShowEditCliente(false)} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"><FiX /></button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            {[
                                { key: 'nombre', label: 'Nombre Completo', type: 'text' },
                                { key: 'proyecto', label: 'Proyecto / Servicio Activo', type: 'text' },
                                { key: 'correo', label: 'Correo Electrónico', type: 'email' },
                                { key: 'telefono', label: 'Teléfono', type: 'tel' }
                            ].map(({ key, label, type }) => (
                                <div key={key}>
                                    <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">{label}</label>
                                    <input
                                        type={type}
                                        value={String(editClienteData[key as keyof Cliente] ?? '')}
                                        onChange={e => setEditClienteData(prev => ({ ...prev, [key]: e.target.value }))}
                                        className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            ))}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Precio Cobrado ($)</label>
                                    <input type="number" value={editClienteData.precioCobrado ?? ''} onChange={e => setEditClienteData(prev => ({ ...prev, precioCobrado: e.target.value ? parseFloat(e.target.value) : null }))}
                                        className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-background font-mono focus:outline-none focus:ring-2 focus:ring-primary/50" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Mensualidad ($)</label>
                                    <input type="number" value={editClienteData.mensualidadMonto ?? ''} onChange={e => setEditClienteData(prev => ({ ...prev, mensualidadMonto: e.target.value ? parseFloat(e.target.value) : null }))}
                                        className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-background font-mono focus:outline-none focus:ring-2 focus:ring-primary/50" />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-border bg-muted/10 flex justify-end gap-3">
                            <button onClick={() => setShowEditCliente(false)} disabled={editLoading} className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50">Cancelar</button>
                            <button onClick={guardarEdicionCliente} disabled={editLoading} className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2 transition-colors disabled:opacity-50">
                                {editLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave className="w-4 h-4" />}
                                {editLoading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
