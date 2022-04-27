import * as React from 'react';
import { PrivateStackParamList } from 'types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InvestmentCycle from 'screens/InvestmentCycle';
import DrawerPages from './DrawerPages';

const Stack = createNativeStackNavigator<PrivateStackParamList>();

export default function PrivateRoutes(): JSX.Element {
  return (
    <Stack.Navigator initialRouteName="Drawer">
      <Stack.Screen
        options={{ headerShown: false }}
        name="Drawer"
        component={DrawerPages}
      />

      {/*  Nested screens that can be accessed by the Drawer Pages */}
      {/*  This structure was used to be able to have the  */}
      <Stack.Screen name="InvestmentCycle" component={InvestmentCycle} />
      <Stack.Screen name="Diagnostics" component={InvestmentCycle} />
      <Stack.Screen name="CapacityBuilding" component={InvestmentCycle} />
      <Stack.Screen
        name="GrievanceRedressMechanism"
        component={InvestmentCycle}
      />
    </Stack.Navigator>
  );
}
