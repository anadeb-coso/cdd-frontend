import React, { useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import PrivateRoutes from '../private-routes';
import PublicRoutes from '../public-routes';
import AuthContext from '../../contexts/auth';

const Routes: React.FC = () => {
  const { signIn } = useContext(AuthContext);

  useEffect(() => {
    const getSession = async () => {
      const credentials = await SecureStore.getItemAsync('session');
      if (credentials) {
        signIn(JSON.parse(credentials));
      }
    };
    getSession();
  }, []);
  const { signed } = useContext(AuthContext);

  return signed ? <PrivateRoutes /> : <PublicRoutes />;
};

export default Routes;
