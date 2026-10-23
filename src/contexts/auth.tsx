import React, {createContext, useState, ReactNode} from 'react';
import * as SecureStore from 'expo-secure-store';
import { SyncToRemoteDatabase } from '../utils/databaseManager';
import { useToast } from 'native-base';
import { clearAsyncStorage, clearCache } from '../utils/pouchdb_call';
import { startCollectSync, stopCollectSync } from '../services/collect/sync';
import { sessionToken } from '../utils/apiCredentials';
import { revokeSessionToken } from '../utils/sessionToken';

interface AuthContextData {
  signed: boolean;
  user: object | null;
  signIn(userInput: React.SetStateAction<object | null>): void;
  signOut(): void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children : ReactNode }> = ({ children }: { children : ReactNode }) => {
  const [user, setUser] = useState<object | null>(null);
  const [signed, setSigned] = useState<boolean>(false);
  const toast = useToast();
  function signIn(dbCredentials: React.SetStateAction<object | null>) {
    setUser(dbCredentials);
    SyncToRemoteDatabase(dbCredentials as any);
    // COSOCollect : synchronisation périodique (5 min au premier plan, 1 h en arrière-plan).
    startCollectSync();
    setSigned(true);
  }

  async function signOut() {
    stopCollectSync();

    // jeton de session révoqué sur toutes les plateformes (lu avant l'effacement des données de session)
    revokeSessionToken(await sessionToken());

    // Attendu avant de revenir à l'écran de connexion : sinon des écrans encore affichés relisaient les données
    // du compte précédent (projet choisi…) pendant l'effacement, et le compte suivant en héritait.
    await clearAsyncStorage();
    clearCache();

    await SecureStore.deleteItemAsync('session').catch(() => undefined);
    setSigned(false);
    setUser(null);
    // setUser(true);
    // if(LocalDatabase._destroyed){
    //   toast.show({
    //     description: `Votre session est expirée... \nPour tout autre problème, veuillez aller effacer vos données de stockage et revenez vous connecter à nouveau.`,
    //     placement: "top", duration: 35000, color: 'white', bgColor: 'red.900'
    //   });
    //     SecureStore.deleteItemAsync('session');
    //     setSigned(false);
    //     setUser(null);
    // }else{
    //   toast.show({
    //     description: `Vous êtes déconnecté de votre session... \nPour tout autre problème, veuillez fermer l'application et revenez vous connecter à nouveau.`,
    //     placement: "top", duration: 35000, color: 'white', bgColor: 'red.900'
    //   });

    // if(JSON.parse(await getData('no_sql_user'))){
    //   LocalDatabase.destroy()
    //   .then(function (response: any) {
    //     SecureStore.deleteItemAsync('session');

    //     // clearAsyncStorage();
    //     // clearCache();

    //     setSigned(false);
    //     setUser(null);
    //   })
    //   .catch(function (err: any) {
    //     console.log(err);
    //   });
    // }


    // }

  }

  return (
    <AuthContext.Provider value={{ signed, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
