import * as React from 'react';
import { PublicStackParamList } from 'types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Heading, ITheme, useTheme } from 'native-base';
import { HeaderTitleProps } from '@react-navigation/elements';
import Login from '../../screens/Login/Login';
import AppDetail from '../../screens/StoreApp/AppDetail/AppDetail';
import StoreProjects from '../../screens/StoreApp/StoreProjects/StoreProjects';

const Stack = createNativeStackNavigator<PublicStackParamList>();
function getHeaderTitle(theme: ITheme) {
  return function ({ children }: HeaderTitleProps) {
    return (
      <Heading size="md" fontWeight={500} color={theme.colors.trueGray[800]}>
        {children}
      </Heading>
    );
  };
}

export default function PublicRoutes(): JSX.Element {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: theme.colors.primary[500],
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        headerTitle: getHeaderTitle(theme),
        headerTitleStyle: { color: 'black' },
      }}
      initialRouteName="Login"
    >
      <Stack.Screen
        options={{ headerShown: false }}
        name="Login"
        component={Login}
      />
      
      {/* Apps Store */}
      <Stack.Screen
        options={({ route }) => ({
          title: route.params?.name || 'COSO Store',
        })}
        name="StoreProjects"
        component={StoreProjects}
      />
      <Stack.Screen
        options={({ route }) => ({
          title: route.params?.name || 'Detail',
        })}
        name="AppDetail"
        component={AppDetail}
      />
    </Stack.Navigator>
  );
}
