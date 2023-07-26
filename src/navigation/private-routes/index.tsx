import * as React from 'react';
import { PrivateStackParamList } from 'types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import VillageDetail from 'screens/VillageDetail';
import { Heading, ITheme, useTheme } from 'native-base';
import { HeaderTitleProps } from '@react-navigation/elements';
import DrawerPages from './DrawerPages';
import SelectVillage from '../../screens/SelectVillage';
import PhaseDetail from '../../screens/PhaseDetail';
import ActivityDetail from '../../screens/ActivityDetail';
import TaskDetail from '../../screens/TaskDetail';
import SupportingMaterials from '../../screens/SupportingMaterials';
import TaskDiagnostic from '../../screens/TaskDiagnostic/TaskDiagnostic';
import TaskStatusDetail from '../../screens/TaskStatusDetail/TaskStatusDetail';

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
        headerTitleStyle: { color: 'black' },
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
          title: route.params?.name || 'Cycle d’investissement',
        })}
        name="VillageDetail"
        component={VillageDetail}
      />
      <Stack.Screen
        options={{ title: 'Sélectionnez un CVD' }}
        name="SelectVillage"
        component={SelectVillage}
      />
      <Stack.Screen name="Diagnostics" component={VillageDetail} />
      <Stack.Screen name="CapacityBuilding" component={VillageDetail} />
      <Stack.Screen
        name="GrievanceRedressMechanism"
        component={VillageDetail}
      />
      <Stack.Screen 
        options={{ title: 'Detail de la phase' }} 
        name="PhaseDetail" component={PhaseDetail} />
      <Stack.Screen 
        options={{ title: "Detail de l'étape" }} 
        name="ActivityDetail" component={ActivityDetail} />
      <Stack.Screen 
        options={{ title: 'Detail de la tâche' }} 
        name="TaskDetail" component={TaskDetail} />
      <Stack.Screen name="SupportingMaterials" component={SupportingMaterials} />
      <Stack.Screen
        options={{ title: 'Vos tâches' }}
        name="TaskDiagnostic"
        component={TaskDiagnostic}
      />
      <Stack.Screen 
        options={{ title: 'Statut' }} 
        name="TaskStatusDetail" component={TaskStatusDetail} />
    </Stack.Navigator>
  );
}
