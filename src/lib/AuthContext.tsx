import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

interface AuthContextType {
    user: User | null;
    isAdmin: boolean;
    isPartner: boolean;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAdmin: false,
    isPartner: false,
    loading: true,
    logout: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isPartner, setIsPartner] = useState(false);
    const [loading, setLoading] = useState(true);
    const lastUid = useRef<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser && lastUid.current !== firebaseUser.uid) {
                lastUid.current = firebaseUser.uid;
                setLoading(true); // Asegura que authLoading = true mientras carga el perfil
                await loadProfile(firebaseUser.uid);
            } else if (!firebaseUser) {
                lastUid.current = null;
                setIsAdmin(false);
                setIsPartner(false);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const loadProfile = async (uid: string) => {
        try {
            const snap = await getDoc(doc(db, 'users', uid));
            const data = snap.data();
            setIsAdmin(data?.isAdmin ?? false);
            setIsPartner(data?.isPartner ?? false);
        } catch {
            // No profile yet
        } finally {
            setLoading(false);
        }
    };

    const logout = () => signOut(auth);

    return (
        <AuthContext.Provider value={{ user, isAdmin, isPartner, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
