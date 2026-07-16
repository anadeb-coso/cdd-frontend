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
import Subjects from '../../screens/SupportMaterials/Subjects/Subjects';
import Lessons from '../../screens/SupportMaterials/Lessons/Lessons';
import SupportMaterials from '../../screens/SupportMaterials/SupportMaterials/SupportMaterials';
import WebViewComponent from '../../components/ReadFile/WebViewComponent';
import SubprojectDetails from '../../screens/Subprojects/MoreDetails/SubprojectDetails';
import TakeVillageGeolocation from '../../screens/Geolocation/Villages/TakeVillageGeolocation';
import GeoOthers from '../../screens/Geolocation/Others/GeoOthers';
import TakeOtherGeolocation from '../../screens/Geolocation/Others/TakeOtherGeolocation';
import AddNews from '../../screens/News/AddNews/AddNews';
import DetailNews from '../../screens/News/DetailNews/DetailNews';
import TakePosition from '../../screens/News/AddNews/TakePosition';
import NotificationsSettingsList from '../../screens/Settings/Notifications/NotificationsSettingsList';
import ChangeProjectScreen from '../../screens/Settings/ChangeProject/ChangeProjectScreen';
import ChangeFacilitatorDBScreen from '../../screens/Settings/ChangeFacilitatorDB/ChangeFacilitatorDBScreen';
import {useContext} from "react";
import ProjectContext from "../../contexts/project";
import SelectProjectScreen from "../../screens/SelectProject/SelectProjectScreen";
import DownloadList from "../../screens/Others/Download/DownloadList";
import InfosList from "../../screens/Others/Infos/InfosList";
import InfosPlanning from "../../screens/Others/Infos/InfosPlanning";
import TaskDetailTest from '../../screens/TaskDetailTest';
import ProfileScreen from '../../screens/Settings/ProfileScreen/ProfileScreen';
import PdfViewer from '../../components/PdfViewer';
import ImageViewerCustomer from '../../components/ImageViewer';
import CompaniesDetails from '../../screens/Subprojects/CompaniesDetails/CompaniesDetails';
import SocialAuditDetails from '../../screens/Subprojects/SocialAuditDetails/SocialAuditDetails';
import Diagnostics from '../../screens/Subprojects/Diagnostics/Diagnostics';
import DiagnosticActivitiesList from '../../screens/Subprojects/DiagnosticActivitiesList/DiagnosticActivitiesList';


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
    const { selectedProject } = useContext(ProjectContext);

    if (!selectedProject) {
        return(
            <Stack.Navigator
                screenOptions={{
                    headerTintColor: theme.colors.primary[500],
                    headerShadowVisible: false,
                    headerBackTitleVisible: false,
                    headerTitle: getHeaderTitle(theme),
                    headerTitleStyle: { color: 'black' },
                }}
                initialRouteName="SelectProject"
            >
                <Stack.Screen
                    options={{ headerShown: false }}
                    name="SelectProject"
                    component={SelectProjectScreen}
                />
            </Stack.Navigator>
        )
    }

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
        options={({ route } : {route: any}) => ({
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
      <Stack.Screen
        options={{ title: 'Aperçu - Test' }}
        name="TaskDetailTest" component={TaskDetailTest} />
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

      {/* Subprojects tracking */}
      <Stack.Screen
        options={({ route } : {route: any}) => ({
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
        options={({ route } : {route: any}) => ({
          title: route.params?.name || 'Villages',
        })}
        name="Villages"
        component={Villages}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || 'CVD',
        })}
        name="CVD"
        component={CVD}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || 'Modules',
        })}
        name="ListModules"
        component={ListModules}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || 'Suivi du sous-projet',
        })}
        name="TrackingSubprject"
        component={TrackingSubprject}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || "Niveau d'avancement",
        })}
        name="TrackingSubprjectLevel"
        component={TrackingSubprjectLevel}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || 'Suivi du sous-projet',
        })}
        name="ListInfrastructures"
        component={ListInfrastructures}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || 'Modules Infrastructure',
        })}
        name="ListModulesInfrastructure"
        component={ListModulesInfrastructure}
      />
      <Stack.Screen
        options={{ title: 'Diagnostic des sous-projets' }}
        name="DiagnosticActivities"
        component={Diagnostics}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || 'Diagnostic des sous-projets',
        })}
        name="DiagnosticActivitiesList"
        component={DiagnosticActivitiesList}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || 'Géolocalisation',
        })}
        name="TakeGeolocation"
        component={TakeGeolocation}
      />
      {/* <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || 'Géolocalisation',
        })}
        name="ViewGeolocation"
        component={ViewGeolocation}
      /> */}
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || 'Fichiers',
        })}
        name="Images"
        component={Images}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || "Détails de l'ouvrage",
        })}
        name="SubprojectDetails"
        component={SubprojectDetails}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || "Détails techniques et sur les entreprises",
        })}
        name="CompaniesDetails"
        component={CompaniesDetails}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || "Détails sur l'audit social",
        })}
        name="SocialAuditDetails"
        component={SocialAuditDetails}
      />
      {/* Subprojects tracking */}


      {/* Apps Store */}
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || 'COSO Store',
        })}
        name="StoreProjects"
        component={StoreProjects}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || 'Detail',
        })}
        name="AppDetail"
        component={AppDetail}
      />
      {/* Apps Store */}


      {/* Support Materials */}
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || 'Matériel de soutien',
        })}
        name="Subjects"
        component={Subjects}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || 'Matériel de soutien',
        })}
        name="Lessons"
        component={Lessons}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || 'Matériel de soutien',
        })}
        name="SupportMaterials"
        component={SupportMaterials}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || 'Matériel de soutien',
        })}
        name="WebViewComponent"
        component={WebViewComponent}
      />

      {/* Support Materials */}


      {/* Apps Geolocation */}
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || 'Géolocalisation',
        })}
        name="TakeVillageGeolocation"
        component={TakeVillageGeolocation}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || 'Lieux',
        })}
        name="GeoOthers"
        component={GeoOthers}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || 'Enrégistrez un lieu',
        })}
        name="TakeOtherGeolocation"
        component={TakeOtherGeolocation}
      />
      {/* Apps Geolocation */}

      {/* Apps News */}
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || "Ajout d'une publication",
        })}
        name="AddNews"
        component={AddNews}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || "Détail de la publication",
        })}
        name="DetailNews"
        component={DetailNews}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || "Prendre une position",
        })}
        name="TakePosition"
        component={TakePosition}
      />
      {/* Apps News */}


      {/* Apps Settings */}
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || "Notifications",
        })}
        name="NotificationsSettingsList"
        component={NotificationsSettingsList}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || "Changer de projet",
        })}
        name="ChangeProjectScreen"
        component={ChangeProjectScreen}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || "Changer de base de données",
        })}
        name="ChangeFacilitatorDBScreen"
        component={ChangeFacilitatorDBScreen}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || "Modifier votre mot de passe",
        })}
        name="ProfileScreen"
        component={ProfileScreen}
      />
      {/* Apps Settings */}

      {/* Others */}
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || "Téléchargements",
        })}
        name="DownloadList"
        component={DownloadList}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || "Informations",
        })}
        name="InfosList"
        component={InfosList}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || "Infos planning",
        })}
        name="InfosPlanning"
        component={InfosPlanning}
      />
      <Stack.Screen
        options={{ title: "PDF" }}
        name="PdfViewer" component={PdfViewer} />
      <Stack.Screen
        options={{ title: "Image" }}
        name="ImageViewerCustomer" component={ImageViewerCustomer} />
      {/* Others */}




    </Stack.Navigator>
  );
}
