import React, { useContext, useState, useEffect } from 'react';
import { Heading, ITheme, useTheme, Select, Box, useToast } from 'native-base';
import HomeScreen from 'screens/Home';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
// eslint-disable-next-line import/no-extraneous-dependencies
import { HeaderTitleProps } from '@react-navigation/elements';
import { View, Alert, Dimensions, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AuthContext from '../../contexts/auth';
import StoreProjects from '../../screens/StoreApp/StoreProjects/StoreProjects';
import GeoVillages from '../../screens/Geolocation/Villages/GeoVillages'
import CalendarScreen from '../../screens/Planning/CalendarScreen';
import NewsSearch from '../../screens/News/NewsSearch/NewsSearch';
import SettingsList from '../../screens/Settings/SettingsList';
import ProjectContext from "../../contexts/project";
import OthersList from "../../screens/Others/OthersList";
import { getData, storeData } from "../../utils/storageManager";
import ProjectsAPI from "../../services/project/projects";
import { PrivateStackParamList } from '../../types/navigation';
import { EXPO_PUBLIC_ANDROID_VERSION_CODE, EXPO_PUBLIC_VERSION } from '../../services/env'


const width = Dimensions.get('window').width
const Drawer = createDrawerNavigator();

function getHeaderTitle(theme: ITheme, selectedTitle: any | undefined) {
  // if (selectedTitle)
  //   return function () {
  //     return (
  //       <Heading size="md" fontWeight={700} color={theme.colors.primary[500]}>
  //         {selectedTitle}
  //       </Heading>
  //     );
  //   };

  return function ({ children }: HeaderTitleProps) {
    return (
      <Heading size="md" fontWeight={350} color={theme.colors.primary[500]}>
        {selectedTitle ? selectedTitle + " - " + children : children}
      </Heading>
    );
  };
}

function CustomDrawerContent(props: any): JSX.Element {
  const { signOut } = useContext(AuthContext);
  const { selectProject } = useContext(ProjectContext)
  const handleSignOut = () => {
    selectProject(null);
    signOut();
  }
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1, justifyContent: 'space-between' }}
    >
      <View style={{ justifyContent: 'flex-start' }}>
        <DrawerItemList {...props} />
      </View>
      <DrawerItem
        label={() => (
          <Heading size="xs" alignSelf="center">
            {`V${EXPO_PUBLIC_ANDROID_VERSION_CODE} (${EXPO_PUBLIC_VERSION})`}
          </Heading>
        )}
        onPress={() => {}}
      />
      <DrawerItem
        label={() => (
          <Heading size="xs" alignSelf="center">
            Se déconnecter
          </Heading>
        )}
        onPress={() => handleSignOut()}
      />
    </DrawerContentScrollView>
  );
}

function DrawerPages(): JSX.Element {
  const theme = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();

  const [selectedTitle, setSelectedTitle] = useState("DCC App");


  const [projects, setProjects]: any = useState([]);
  const { selectProject } = useContext(ProjectContext);
  const toast = useToast();

  const get_projects = async () => {
    try {
      let project_current = JSON.parse(await getData('project'));
      if (project_current && project_current.name) {
        setSelectedTitle(project_current.name);
      }
      await new ProjectsAPI()
        .get_projects()
        .then(async (response: any) => {
          if (response.error) {
            return;
          }
          const projects = response as Array<any>;
          setProjects(projects)
        })
        .catch(error => {
          console.error(error);
        });
    } catch (e) {
      console.log("Error1 : " + e);
    }

  };

  const onSelectProject = async (project: any, projects_length: number) => {

    let project_current = JSON.parse(await getData('project'));

    if (projects_length == 1) {
      toast.show({
        description: `Le projet ${project.name} est sélectionné par défaut!`,
      });
    } else {
      if (project_current.name == project.name) {

      } else {
        Alert.alert('Alert', project_current ? `Souhaitez vraiment changer de projet de ${project_current?.name} en ${project.name} ?` : `Souhaitez vraiment changer de projet en ${project.name} ?`, [
          {
            text: "Oui", onPress: async () => {

              setSelectedTitle(project.name);

              await storeData('project', JSON.stringify(project));
              selectProject(project);
              await storeData('infos_changed', true);

              toast.show({
                description: `Projet changé en ${project.name} avec succès`,
              });

              navigation.reset({
                index: 0,  // Réinitialise l'index à 0
                routes: [{ name: 'Home' }],  // Réinitialise la route
              });


            }
          },
          {
            text: "Non", onPress: async () => {

            }
          }
        ]);

      }

    }
  }
  useEffect(() => {
    get_projects();
  }, []);


  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerTintColor: theme.colors.gray[500],
        drawerActiveTintColor: theme.colors.primary[500],
        headerTitleAlign: 'center',
        headerTitle: getHeaderTitle(theme, selectedTitle),
        headerShadowVisible: false,
        headerLeftContainerStyle: { paddingHorizontal: theme.sizes['1'] },
        headerRightContainerStyle: { paddingHorizontal: theme.sizes['1'] },
      }}
      initialRouteName="Home"
    >
      <Drawer.Screen
        name="Home"
        // options={{ title: 'DCC App' }}
        options={{
          headerTitle: () => {
            return (
              <View style={{ flexDirection: 'row', width: width - 100 }}>
                <View style={{ flex: 0.7, alignSelf: 'center', marginLeft: 11 }}>
                  <Box flex={1}
                    rounded="xl"
                    style={{ backgroundColor: "#24c38b" }}
                    borderColor={"black.500"}
                  >
                    <Select
                      style={{ alignSelf: 'center', alignContent: 'center', alignItems: 'center' }}
                      selectedValue={selectedTitle}
                      // width={width - 100}
                      // color={'black'}
                      height={35}
                      // colorScheme={'black'}
                      bgColor={'white'}
                      // outlineColor={'black'}
                      // tintColor={'black'}
                      placeholderTextColor={'primary.500'}
                      textDecorationColor={'primary.500'}
                      fontWeight={'bold'}

                      accessibilityLabel={selectedTitle ? `DCC App - ${selectedTitle}` : "Choisir un projet"}
                      placeholder={selectedTitle ? `DCC App - ${selectedTitle}` : "Choisir un projet"}
                      onValueChange={(itemValue) => onSelectProject(itemValue, projects.length)}
                    >
                      {projects.map((project: any) => (
                        <Select.Item key={`${project.id}_${project.name}`} label={project.name} value={project} color={'black'} />
                      ))}
                    </Select>
                  </Box>
                </View>
                <View style={{ flex: 0.3, alignSelf: 'flex-end', marginBottom: 11 }}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("SettingsList")}
                    style={{ alignSelf: 'flex-end' }}>
                    <FontAwesome name="cogs" size={25} color="green" />
                  </TouchableOpacity>
                </View>
              </View>
            )
          },
        }}
        listeners={({ navigation, route }) => ({
          // Lorsque l'écran est focus
          focus: async () => {
            let project_current = JSON.parse(await getData('project'));
            if (project_current && project_current.name) {
              setSelectedTitle(project_current.name);
            }
          },
          // // Lorsque l'écran perd le focus
          // blur: () => {
          //   console.log('L\'écran Home a perdu le focus');
          //   // Effectuer des actions comme l'enregistrement des données ou l'arrêt de certaines tâches
          // },
          // // Lorsque l'état de navigation change
          // state: (e) => {
          //   console.log('État de navigation mis à jour:', e.data);
          // },
        })}
        component={HomeScreen}
      />
      <Drawer.Screen
        name="StoreProjects"
        options={{ title: 'COSO Store' }}
        component={StoreProjects}
      />
      <Drawer.Screen
        name="GeoVillages"
        options={{ title: 'Géolocalisation' }}
        component={GeoVillages}
      />
      <Drawer.Screen
        name="CalendarScreen"
        options={{ title: 'Mes tâches' }}
        component={CalendarScreen}
      />
      <Drawer.Screen
        name="NewsSearch"
        options={{ title: 'Actualités' }}
        component={NewsSearch}
      />
      <Drawer.Screen
        name="SettingsList"
        options={{ title: 'Paramètres' }}
        component={SettingsList}
      />
      <Drawer.Screen
        name="OthersList"
        options={{ title: 'Autres' }}
        component={OthersList}
      />

      {/* <Drawer.Screen name="Notifications" component={HomeScreen} /> */}
    </Drawer.Navigator>
  );
}

export default DrawerPages;
