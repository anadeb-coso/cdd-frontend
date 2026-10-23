import React, { useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import PrivateRoutes from '../private-routes';
import PublicRoutes from '../public-routes';
import AuthContext from '../../contexts/auth';
import SessionExpiredModal from '../../components/SessionExpiredModal';
import { ensureSessionToken } from '../../utils/sessionToken';

const Routes: React.FC = () => {
  const { signIn } = useContext(AuthContext);

  useEffect(() => {
    const getSession = async () => {
      const credentials = await SecureStore.getItemAsync('session');
      if (credentials) {
        signIn(JSON.parse(credentials));
        // jeton de session : conversion d'une session d'avant les jetons, ou renouvellement avant expiration
        ensureSessionToken();
      }
    };
    getSession();
  }, []);
  const { signed } = useContext(AuthContext);

  return signed ? (
    <>
      <PrivateRoutes />
      <SessionExpiredModal />
    </>
  ) : <PublicRoutes />;
};

export default Routes;
