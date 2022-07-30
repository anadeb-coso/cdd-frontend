import React, { useContext } from 'react';

import PrivateRoutes from '../private-routes';
import PublicRoutes from '../public-routes';
import AuthContext from '../../contexts/auth';

const Routes: React.FC = () => {
  const { signed } = useContext(AuthContext);

  return signed ? <PrivateRoutes /> : <PublicRoutes />;
};

export default Routes;
