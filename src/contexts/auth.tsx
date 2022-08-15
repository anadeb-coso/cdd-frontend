import React, { createContext, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

interface AuthContextData {
  signed: boolean;
  user: object | null;
  signIn(): void;
  signOut(): void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<object | null>(null);
  const [signed, setSigned] = useState<boolean>(false);
  function signIn() {
    // setUser(true);
    setSigned(true);
  }

  function signOut() {
    // setUser(true);
    SecureStore.deleteItemAsync('session');
    setSigned(false);
  }

  return (
    <AuthContext.Provider value={{ signed, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
