import React, { createContext, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { SyncToRemoteDatabase } from '../utils/databaseManager';

interface AuthContextData {
  signed: boolean;
  user: object | null;
  signIn(userInput: React.SetStateAction<object | null>): void;
  signOut(): void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<object | null>(null);
  const [signed, setSigned] = useState<boolean>(false);
  function signIn(dbCredentials: React.SetStateAction<object | null>) {
    setUser(dbCredentials);
    SyncToRemoteDatabase(dbCredentials);
    setSigned(true);
  }

  function signOut() {
    // setUser(true);
    SecureStore.deleteItemAsync('session');
    setSigned(false);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ signed, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
