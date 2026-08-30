import * as React from 'react';
import { useTranslation } from 'react-i18next';
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
import DiagnosticsChooser from '../../screens/DiagnosticsChooser/DiagnosticsChooser';
import InvestmentCycleDiagnostic from '../../screens/InvestmentCycleDiagnostic/InvestmentCycleDiagnostic';
import InvestmentCycleDiagnosticList from '../../screens/InvestmentCycleDiagnostic/InvestmentCycleDiagnosticList';


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
  const { t } = useTranslation('navigation');
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
          title: route.params?.name || t('private_routes_index.investment_cycle_title'),
        })}
        name="VillageDetail"
        component={VillageDetail}
      />
      <Stack.Screen
        options={{ title: t('private_routes_index.select_cvd_title') }}
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
        options={{ title: t('private_routes_index.phase_detail_title') }}
        name="PhaseDetail" component={PhaseDetail} />
      <Stack.Screen
        options={{ title: t('private_routes_index.activity_detail_title') }}
        name="ActivityDetail" component={ActivityDetail} />
      <Stack.Screen
        options={{ title: t('private_routes_index.task_detail_title') }}
        name="TaskDetail" component={TaskDetail} />
      <Stack.Screen
        options={{ title: t('private_routes_index.task_detail_test_title') }}
        name="TaskDetailTest" component={TaskDetailTest} />
      <Stack.Screen name="SupportingMaterials" component={SupportingMaterials} />
      <Stack.Screen
        options={{ title: t('private_routes_index.your_tasks_title') }}
        name="TaskDiagnostic"
        component={TaskDiagnostic}
      />
      <Stack.Screen
        options={{ title: t('private_routes_index.status_title') }}
        name="TaskStatusDetail" component={TaskStatusDetail} />
      <Stack.Screen
        options={{ title: t('private_routes_index.sync_data_title') }}
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
          title: route.params?.name || t('private_routes_index.subprojects_title'),
        })}
        name="ListSubprojects"
        component={ListSubprojects}
      />
      <Stack.Screen
        options={{ title: t('private_routes_index.cantons_title') }}
        name="Cantons"
        component={Cantons}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.villages_title'),
        })}
        name="Villages"
        component={Villages}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.cvd_title'),
        })}
        name="CVD"
        component={CVD}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.modules_title'),
        })}
        name="ListModules"
        component={ListModules}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.subproject_tracking_title'),
        })}
        name="TrackingSubprject"
        component={TrackingSubprject}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.progress_level_title'),
        })}
        name="TrackingSubprjectLevel"
        component={TrackingSubprjectLevel}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.list_infrastructures_title'),
        })}
        name="ListInfrastructures"
        component={ListInfrastructures}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.modules_infrastructure_title'),
        })}
        name="ListModulesInfrastructure"
        component={ListModulesInfrastructure}
      />
      <Stack.Screen
        options={{ title: t('private_routes_index.diagnostic_subprojects_title') }}
        name="DiagnosticActivities"
        component={Diagnostics}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.diagnostic_subprojects_title'),
        })}
        name="DiagnosticActivitiesList"
        component={DiagnosticActivitiesList}
      />
      <Stack.Screen
        options={{ title: t('private_routes_index.diagnostics_chooser_title') }}
        name="DiagnosticsChooser"
        component={DiagnosticsChooser}
      />
      <Stack.Screen
        options={{ title: t('private_routes_index.investment_cycle_diagnostic_title') }}
        name="InvestmentCycleDiagnostic"
        component={InvestmentCycleDiagnostic}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.investment_cycle_diagnostic_list_title'),
        })}
        name="InvestmentCycleDiagnosticList"
        component={InvestmentCycleDiagnosticList}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.geolocation_title'),
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
          title: route.params?.name || t('private_routes_index.files_title'),
        })}
        name="Images"
        component={Images}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.subproject_details_title'),
        })}
        name="SubprojectDetails"
        component={SubprojectDetails}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.companies_details_title'),
        })}
        name="CompaniesDetails"
        component={CompaniesDetails}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.social_audit_details_title'),
        })}
        name="SocialAuditDetails"
        component={SocialAuditDetails}
      />
      {/* Subprojects tracking */}


      {/* Apps Store */}
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.coso_store_title'),
        })}
        name="StoreProjects"
        component={StoreProjects}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.detail_title'),
        })}
        name="AppDetail"
        component={AppDetail}
      />
      {/* Apps Store */}


      {/* Support Materials */}
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.support_materials_title'),
        })}
        name="Subjects"
        component={Subjects}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.support_materials_title'),
        })}
        name="Lessons"
        component={Lessons}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.support_materials_title'),
        })}
        name="SupportMaterials"
        component={SupportMaterials}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.support_materials_title'),
        })}
        name="WebViewComponent"
        component={WebViewComponent}
      />

      {/* Support Materials */}


      {/* Apps Geolocation */}
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.village_geolocation_title'),
        })}
        name="TakeVillageGeolocation"
        component={TakeVillageGeolocation}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.places_title'),
        })}
        name="GeoOthers"
        component={GeoOthers}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.record_place_title'),
        })}
        name="TakeOtherGeolocation"
        component={TakeOtherGeolocation}
      />
      {/* Apps Geolocation */}

      {/* Apps News */}
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.add_publication_title'),
        })}
        name="AddNews"
        component={AddNews}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.publication_detail_title'),
        })}
        name="DetailNews"
        component={DetailNews}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.take_position_title'),
        })}
        name="TakePosition"
        component={TakePosition}
      />
      {/* Apps News */}


      {/* Apps Settings */}
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.notifications_title'),
        })}
        name="NotificationsSettingsList"
        component={NotificationsSettingsList}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.change_project_title'),
        })}
        name="ChangeProjectScreen"
        component={ChangeProjectScreen}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.change_database_title'),
        })}
        name="ChangeFacilitatorDBScreen"
        component={ChangeFacilitatorDBScreen}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.change_password_title'),
        })}
        name="ProfileScreen"
        component={ProfileScreen}
      />
      {/* Apps Settings */}

      {/* Others */}
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.downloads_title'),
        })}
        name="DownloadList"
        component={DownloadList}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.informations_title'),
        })}
        name="InfosList"
        component={InfosList}
      />
      <Stack.Screen
        options={({ route } : {route: any}) => ({
          title: route.params?.name || t('private_routes_index.planning_info_title'),
        })}
        name="InfosPlanning"
        component={InfosPlanning}
      />
      <Stack.Screen
        options={{ title: t('private_routes_index.pdf_title') }}
        name="PdfViewer" component={PdfViewer} />
      <Stack.Screen
        options={{ title: t('private_routes_index.image_title') }}
        name="ImageViewerCustomer" component={ImageViewerCustomer} />
      {/* Others */}




    </Stack.Navigator>
  );
}
