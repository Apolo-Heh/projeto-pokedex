
import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthContextData = {
    isAuthenticated: boolean;
    user: string | null;
    userId: string | null;
    isLoading: boolean;
    signIn: (username: string, userId?: string | null) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadStorageData() {
            const [storageUser, storageUserId] = await Promise.all([
                AsyncStorage.getItem('@Auth:user'),
                AsyncStorage.getItem('@Auth:userId'),
            ]);

            if (storageUser) {
                setUser(storageUser);
                setUserId(storageUserId);
                setIsAuthenticated(true);
            }
            setIsLoading(false);
        }
        loadStorageData();
    }, []);
    
    async function signIn(username: string, nextUserId?: string | null) {
        setUser(username);
        setUserId(nextUserId ?? null);
        setIsAuthenticated(true);
        await AsyncStorage.setItem('@Auth:user', username);
        if (nextUserId) {
            await AsyncStorage.setItem('@Auth:userId', nextUserId);
        } else {
            await AsyncStorage.removeItem('@Auth:userId');
        }
    }

    async function signOut() {
        setUser(null);
        setUserId(null);
        setIsAuthenticated(false);
        await AsyncStorage.removeItem('@Auth:user');
        await AsyncStorage.removeItem('@Auth:userId');
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, userId, signIn, signOut, isLoading }}>
            {children}
        </AuthContext.Provider>
    );

};

export const useAuth = () => useContext(AuthContext);