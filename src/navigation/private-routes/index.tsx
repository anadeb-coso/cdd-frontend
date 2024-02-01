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
import SyncDatas from '../../screens/SyncDatas/SyncDatas';
import SubprojectRouter from '../../screens/Subprojects';
import ListSubprojects from '../../screens/Subprojects/ListSubprojects/ListSubprojects';
import Cantons from '../../screens/Subprojects/Cantons/Cantons';
import Villages from '../../screens/Subprojects/Villages/Villages';
import CVD from '../../screens/Subprojects/CVD/CVD';
import ListModules from '../../screens/Subprojects/ListModules/ListModules';
import TrackingSubprject from '../../screens/Subprojects/TrackingSubprject/TrackingSubprject';
import TrackingSubprjectLevel from '../../screens/Subprojects/TrackingSubprject/TrackingSubprjectLevel';
import ListInfrastructures from '../../screens/Subprojects/ListInfrastructures/ListInfrastructures';
import ListModulesInfrastructure from '../../screens/Subprojects/ListModulesInfrastructure/ListModulesInfrastructure';
import TakeGeolocation from '../../screens/Subprojects/Geolocation/TakeGeolocation';
import ViewGeolocation from '../../screens/Subprojects/Geolocation/ViewGeolocation';
import Images from '../../screens/Subprojects/Images/Images';
import AppDetail from '../../screens/StoreApp/AppDetail/AppDetail';
import StoreProjects from '../../screens/StoreApp/StoreProjects/StoreProjects';

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
      <Stack.Screen
        options={{ title: 'Sync les Données' }}
        name="SyncDatas" component={SyncDatas} />



      {/* //* Home */}
      {/* <Stack.Screen
        options={{
          headerShown: false,
        }}
        name="SubprojectRouter"
        component={SubprojectRouter}
      /> */}

      <Stack.Screen
        options={({ route }) => ({
          title: route.params?.name || 'Sous-projets',
        })}
        name="ListSubprojects"
        component={ListSubprojects}
      />
      <Stack.Screen
        options={{ title: 'Cantons' }}
        name="Cantons"
        component={Cantons}
      />
      <Stack.Screen
        options={({ route }) => ({
          title: route.params?.name || 'Villages',
        })}
        name="Villages"
        component={Villages}
      />
      <Stack.Screen
        options={({ route }) => ({
          title: route.params?.name || 'CVD',
        })}
        name="CVD"
        component={CVD}
      />
      <Stack.Screen
        options={({ route }) => ({
          title: route.params?.name || 'Modules',
        })}
        name="ListModules"
        component={ListModules}
      />
      <Stack.Screen
        options={({ route }) => ({
          title: route.params?.name || 'Suivi du sous-projet',
        })}
        name="TrackingSubprject"
        component={TrackingSubprject}
      />
      <Stack.Screen
        options={({ route }) => ({
          title: route.params?.name || 'Suivi du sous-projet',
        })}
        name="TrackingSubprjectLevel"
        component={TrackingSubprjectLevel}
      />
      <Stack.Screen
        options={({ route }) => ({
          title: route.params?.name || 'Suivi du sous-projet',
        })}
        name="ListInfrastructures"
        component={ListInfrastructures}
      />
      <Stack.Screen
        options={({ route }) => ({
          title: route.params?.name || 'Modules Infrastructure',
        })}
        name="ListModulesInfrastructure"
        component={ListModulesInfrastructure}
      />
      <Stack.Screen
        options={({ route }) => ({
          title: route.params?.name || 'Géolocalisation',
        })}
        name="TakeGeolocation"
        component={TakeGeolocation}
      />
      <Stack.Screen
        options={({ route }) => ({
          title: route.params?.name || 'Géolocalisation',
        })}
        name="ViewGeolocation"
        component={ViewGeolocation}
      />
      <Stack.Screen
        options={({ route }) => ({
          title: route.params?.name || 'Images prises',
        })}
        name="Images"
        component={Images}
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

      {/*  */}


    </Stack.Navigator>
  );
}
