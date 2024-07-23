import React, { createContext, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import LocalDatabase, { SyncToRemoteDatabase } from '../utils/databaseManager';
import { useToast } from 'native-base';
import { getData } from '../utils/storageManager';
import { clearAsyncStorage } from '../utils/functions_native';

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
  const toast = useToast();
  function signIn(dbCredentials: React.SetStateAction<object | null>) {
    setUser(dbCredentials);
    SyncToRemoteDatabase(dbCredentials);
    setSigned(true);
  }

  async function signOut() {
    // setUser(true);
    if(LocalDatabase._destroyed){
      toast.show({
        description: `Votre session est expirée... \nPour tout autre problème, veuillez aller effacer vos données de stockage et revenez vous connecter à nouveau.`, 
        placement: "top", duration: 35000, color: 'white', bgColor: 'red.900'
      });
        SecureStore.deleteItemAsync('session');
        setSigned(false);
        setUser(null);
    }else{
      toast.show({
        description: `Vous êtes déconnecté de votre session... \nPour tout autre problème, veuillez fermer l'application et revenez vous connecter à nouveau.`, 
        placement: "top", duration: 35000, color: 'white', bgColor: 'red.900'
      });
      
      if(JSON.parse(await getData('no_sql_user'))){
        LocalDatabase.destroy()
        .then(function (response: any) {
          SecureStore.deleteItemAsync('session');
          setSigned(false);
          setUser(null);

          clearAsyncStorage();
        })
        .catch(function (err: any) {
          console.log(err);
        });
      }
      
      
    }
    
  }

  return (
    <AuthContext.Provider value={{ signed, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
