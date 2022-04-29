import * as React from 'react';
import { PrivateStackParamList } from 'types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InvestmentCycle from 'screens/InvestmentCycle';
import { useTheme } from 'native-base';
import DrawerPages from './DrawerPages';

const Stack = createNativeStackNavigator<PrivateStackParamList>();

export default function PrivateRoutes(): JSX.Element {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.primary[500],
        headerShadowVisible: false,
      }}
      initialRouteName="Drawer"
    >
      <Stack.Screen
        options={{ headerShown: false }}
        name="Drawer"
        component={DrawerPages}
      />

      {/*  Nested screens that can be accessed by the Drawer Pages */}
      {/*  This structure was used to be able to have the  */}
      <Stack.Screen
        options={({ route }) => ({
          title: route.params?.title || 'Investment Cycle',
        })}
        name="InvestmentCycle"
        component={InvestmentCycle}
      />
      <Stack.Screen name="Diagnostics" component={InvestmentCycle} />
      <Stack.Screen name="CapacityBuilding" component={InvestmentCycle} />
      <Stack.Screen
        name="GrievanceRedressMechanism"
        component={InvestmentCycle}
      />
    </Stack.Navigator>
  );
}
