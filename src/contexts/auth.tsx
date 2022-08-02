import React, { createContext, useState } from 'react';

interface AuthContextData {
  signed: boolean;
  user: object | null;
  signIn(): void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<object | null>(null);
  const [signed, setSigned] = useState<boolean>(false);
  function signIn() {
    // setUser(true);
    setSigned(true);
  }

  return (
    <AuthContext.Provider value={{ signed, user, signIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
