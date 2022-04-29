import * as React from 'react';
import { PrivateStackParamList } from 'types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InvestmentCycle from 'screens/InvestmentCycle';
import { Heading, ITheme, useTheme } from 'native-base';
import { HeaderTitleProps } from '@react-navigation/elements';
import DrawerPages from './DrawerPages';

const Stack = createNativeStackNavigator<PrivateStackParamList>();
function getHeaderTitle(theme: ITheme) {
  return function ({ children }: HeaderTitleProps) {
    return (
      <Heading size="md" fontWeight={500} color={theme.colors.trueGray[800]}>
        {children}
      </Heading>
    );
  };
}

export default function PrivateRoutes(): JSX.Element {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: theme.colors.primary[500],
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        headerTitle: getHeaderTitle(theme),
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
          headerTitleStyle: { color: 'black' },
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
