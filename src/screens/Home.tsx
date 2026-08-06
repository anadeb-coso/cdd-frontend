import { Box, Heading, HStack, FlatList, Text, Pressable, Stack, useToast } from 'native-base';
import { RefreshControl, Image, Platform, PermissionsAndroid, Alert } from 'react-native';
import { ProgressBar } from '@react-native-community/progress-bar-android';
// import * as React from 'react';
import React, { useContext } from 'react';
import HomeCard from 'components/HomeCard';
import HomeCardSmall from 'components/HomeCardSmall';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Clipboard from '@react-native-clipboard/clipboard';
import { PrivateStackParamList } from '../types/navigation';
import { Layout } from '../components/common/Layout';
// import LocalDatabase from '../utils/databaseManager';
import { View } from 'native-base';
import AuthContext from '../contexts/auth';
import { getData, storeData } from '../utils/storageManager';
import SnackBarCheckAppVersionComponent from '../components/SnackBarCheckAppVersionComponent';
import { handleStorageError } from '../utils/pouchdb_call';
import { fetchTaskStatsFull, getAllDocuments, getDocumentsByAttributes } from '../utils/coucdb_call';
import { getEadlByEmail } from '../services/facilitators/eadl';
import ProjectContext from "../contexts/project";
import { clear_duplicate_on_liste } from '../utils/functions';
import {
  requestCameraPermission, requestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync, requestWriteANdInstallPermissions,
  requestWritePermission, requestMediaPermissions,
  requestMediaLibraryCameraPermissionsAsync
} from '../utils/permissions';
// import '../utils/background_geolocation';


export default function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
  const { signOut } = useContext(AuthContext);
  const { selectProject } = useContext(ProjectContext)
  const toast = useToast();
  const [name, setName]: any = useState(null);
  const [email, setEmail]: any = useState(null);
  const [allDocsAre, setAllDocsAre] = useState(false);
  const [taskInvalid, setTaskInvalid] = useState(0);
  const [taskInvalidRevised, setTaskInvalidRevised] = useState(0);
  const [taskRemain, setTaskRemain] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isFacilitator, setIsFacilitator] = useState(false);
  const [icons, setIcons]: any = useState([]);
  const [project, setProject]: any = useState(null);
  const [villagesStabilized, setVillagesStabilized]: any = useState(null);
  const [anotherFacilitator, setAnotherFacilitator]: any = useState(null);
  const [no_sql_user, setNo_sql_user]: any = useState(null);
  let count_facilitator_search = 0;
  let count_tasks_search = 0;
  let count_check = 0;
  const [stats, setSetats]: any = useState(null);

  const handleSignOut = () => {
    selectProject(null);
    signOut();
  }

  // compactDatabase(LocalDatabase);


  useEffect(() => {
    requestMediaPermissions();
  }, []);


  async function villages_stabilized(email: any) {
    if (JSON.parse(await getData('no_sql_user'))) {

      let my_no_sql_db_name = JSON.parse(await getData('my_no_sql_db_name'));
      let no_sql_db_name = JSON.parse(await getData('no_sql_db_name'));

      setAnotherFacilitator(null);
      if (my_no_sql_db_name != no_sql_db_name) { //villagesStabilized == null && 
        email = email == null ? `${JSON.parse(await getData('email'))}` : email;
        try {


          setAnotherFacilitator((await getDocumentsByAttributes({ type: 'facilitator' }, 250, 0, no_sql_db_name))?.docs[0] ?? no_sql_db_name);

          let villagesResult: any = [];
          await getEadlByEmail(email)
            .then((response: any) => {
              if (response.docs && response.docs[0] && response.docs[0].administrative_regions_objects) {
                response.docs[0].administrative_regions_objects.forEach((elt: any) => {
                  if (elt.villages) villagesResult = villagesResult.concat(elt.villages.map((elt: any) => {
                    return {
                      id: String(elt.id),
                      name: elt.name
                    };
                  }));
                });
              }
              villagesResult = clear_duplicate_on_liste(villagesResult);
            }).catch((err: any) => {
              
              handleStorageError(err);
            });

          setVillagesStabilized(villagesResult);
          return {
            villages: villagesResult,
            facilitator: null
          }

        } catch (error) {
          handleStorageError(error);
        }
      }

    }
  }



  async function setUserInfos() {
    setProject(JSON.parse(await getData('project')));
    setNo_sql_user(JSON.parse(await getData('no_sql_user')))
    if (JSON.parse(await getData('no_sql_user'))) {
      setIsFacilitator(true);
      setIcons([
        {
          name: 'Cycle\nd’investissement',
          bg: require('../../assets/backgrounds/green_bg.png'),
          bgIcon: require('../../assets/backgrounds/inv_cycle.png'),
          // goesTo: { route: 'InvestmentCycle', params: { title: 'Village A' } },
          goesTo: { route: 'SelectVillage' },
        },
        {
          name: 'Suivi des sous-projets',
          bg: require('../../assets/backgrounds/beige_bg.png'),
          bgIcon: require('../../assets/backgrounds/diagnostics.png'),
          goesTo: { route: 'Cantons' },
        },
        {
          name: 'Renforcement\ndes capacités',
          bg: require('../../assets/backgrounds/orange_bg.png'),
          bgIcon: require('../../assets/backgrounds/capacity_building.png'),
          goesTo: { route: 'Subjects' },
        },
        {
          name: 'Diagnostics',
          bg: require('../../assets/backgrounds/beige_bg.png'),
          bgIcon: require('../../assets/backgrounds/diagnostics.png'),
          goesTo: { route: 'DiagnosticActivities' },
        }
      ]);
    } else {
      setIsFacilitator(false);
      setName(`${JSON.parse(await getData('first_name'))} ${JSON.parse(await getData('last_name'))}`);
      setEmail(`${JSON.parse(await getData('email'))}`);

      setIcons([
        {
          name: 'Suivi des sous-projets',
          bg: require('../../assets/backgrounds/beige_bg.png'),
          bgIcon: require('../../assets/backgrounds/diagnostics.png'),
          goesTo: { route: 'Cantons' },
        },
        {
          name: 'Renforcement\ndes capacités',
          bg: require('../../assets/backgrounds/orange_bg.png'),
          bgIcon: require('../../assets/backgrounds/capacity_building.png'),
          goesTo: { route: 'Subjects' },
        },
        {
          name: 'Diagnostics',
          bg: require('../../assets/backgrounds/beige_bg.png'),
          bgIcon: require('../../assets/backgrounds/diagnostics.png'),
          goesTo: { route: 'DiagnosticActivities' },
        }
      ]);
    }
  };

  const get_others = async () => {

    // try {
    //   // LocalDatabase.find({
    //   //   selector: { type: 'geolocation' }
    //   // })
    //   getDocumentsByAttributes({ type: 'geolocation' })
    //     .then((response: any) => {
    //       let geolocation_facilitator = response?.docs ?? [];
    //       let _geolocation = geolocation_facilitator.find((elt: any) => elt.type === 'geolocation')

    //       if (_geolocation && _geolocation.synced == false) {
    //         toast.show({
    //           description: "Veuillez synchroniser les coordonnées enregistrées récemment",
    //         });
    //       }

    //     }).catch((err: any) => {
    //       handleStorageError(err);
          
    //     });
    // } catch (error) {
    //   handleStorageError(error);
    // }

  }

  async function getNameAndEmail() {
    let project = JSON.parse(await getData('project'));
    if (JSON.parse(await getData('no_sql_user'))) {
      let my_no_sql_db_name = JSON.parse(await getData('my_no_sql_db_name'));
      let no_sql_db_name = JSON.parse(await getData('no_sql_db_name'));

      let r = await villages_stabilized(null);
      let _villages_stabilized = r?.villages;

      let _name = JSON.parse(await getData('name'));
      let _email = JSON.parse(await getData('email'));

      setName(_name);
      setEmail(_email);
      if (isFacilitator || JSON.parse(await getData('no_sql_user'))) {
        setAllDocsAre(false);
        try {
          // LocalDatabase.find({
          //   selector: { type: 'facilitator' },
          // })
          getDocumentsByAttributes({ type: 'facilitator' })
            .then(async (result: any) => {
              if (count_facilitator_search == 3) {

                Alert.alert('Alert', `Nous n'arrivons pas à trouver vos informations rélatives!`, [
                  {
                    text: "Déconnecter", onPress: async () => {
                      handleSignOut();
                    }
                  },
                  {
                    text: "Aller vérifier le projet", onPress: async () => {
                      navigation.navigate("ChangeProjectScreen");
                    }
                  },
                  {
                    text: "Aller vérifier la base de données", onPress: async () => {
                      navigation.navigate("ChangeFacilitatorDBScreen");
                    }
                  },
                ]);
              } else {
                count_facilitator_search++;

                setName(_name ? _name : (result?.docs[0]?.name ?? null));
                setEmail(_email ? _email : (result?.docs[0]?.email ?? null));

                if (
                  (
                    !result?.docs[0]?.total_tasks_by_project_by_cycle || (
                      result?.docs[0]?.total_tasks_by_project_by_cycle && !result?.docs[0]?.total_tasks_by_project_by_cycle[project.name][project.cycles[0].name]
                    )
                  ) && (
                    my_no_sql_db_name == no_sql_db_name || (my_no_sql_db_name != no_sql_db_name && !_villages_stabilized)
                  )
                ) {
                  getNameAndEmail()
                } else {
                  
                  let headquarters_villages_ids = (result?.docs[0]?.administrative_levels ?? []).filter((i: any) => project && i.project_name == project.name && (
                    my_no_sql_db_name == no_sql_db_name || (my_no_sql_db_name != no_sql_db_name && _villages_stabilized && _villages_stabilized.find((v_s: any) => String(v_s.id) == String(i.id)))
                  ) && i.is_headquarters_village).map((elt:any)=>elt.id);
                  
                  let stats = await fetchTaskStatsFull(headquarters_villages_ids);
                  setSetats(stats);
                  
                  // Initialiser les sommes
                  let sumCompleted = 0;
                  let sumInvalid = 0;
                  let sumInvalidRevised = 0;
                  let sumTotal = 0;

                  // Parcourir les IDs principaux
                  for (const key in stats) {
                    const obj = stats[key];
                    sumCompleted += obj.completed || 0;
                    sumInvalid += obj.invalid || 0;
                    sumInvalidRevised += obj.invalid_revised || 0;
                    sumTotal += obj.total || 0;
                  }
                  setTaskInvalidRevised(sumInvalidRevised);
                  setTaskRemain(sumTotal-sumCompleted);
                  setTaskInvalid(sumInvalid);

                  setAllDocsAre(true);
                  // allDocsAreGet(
                  //   headquarters_village_length,
                  //   result?.docs[0]?.total_tasks_by_project_by_cycle[project.name][project.cycles[0]?.name] ?? null,
                  //   _villages_stabilized
                  // );
                }
              }


            })
            .catch((err: any) => {
              
              setName(_name ?? null);
              setEmail(_email ?? null);
              handleStorageError(err);

              // if (LocalDatabase._destroyed) {
              //   signOut();
              // }
            });
        } catch (error) {
          handleStorageError(error);
        }
      }

    }
  }

  // async function allDocsAreGet(nbr_villages: number, total_tasks: number, _villages_stabilized: any) {
  //   if (count_tasks_search == 150) {
  //     Alert.alert('Alert', `Nous ne parvenons pas à récupérer toutes vos tâches.\nPlusieurs tentatives ont été effectuées sans succès.\nVeuillez vérifier votre connexion Internet ou redémarrer l'application.\n\nSi le problème persiste, contactez l'administrateur du système.`, [
  //       {
  //         text: "Ok", onPress: async () => {

  //         }
  //       },
  //       {
  //         text: "Aller vérifier le projet", onPress: async () => {
  //           navigation.navigate("ChangeProjectScreen");
  //         }
  //       },
  //       {
  //         text: "Aller vérifier la base de données", onPress: async () => {
  //           navigation.navigate("ChangeFacilitatorDBScreen");
  //         }
  //       },
  //     ]);
  //   } else {
  //     count_tasks_search++;
  //     try {
  //       let my_no_sql_db_name = JSON.parse(await getData('my_no_sql_db_name'));
  //       let no_sql_db_name = JSON.parse(await getData('no_sql_db_name'));

  //       // LocalDatabase.find({
  //       //   // selector: { type: 'task' },
  //       //   selector: {
  //       //     type: {
  //       //       $in: ['task', 'facilitator']
  //       //     }
  //       //   },
  //       // })
  //       let selector: any = {
  //         type: 'task'
  //       }

  //       if (my_no_sql_db_name != no_sql_db_name && _villages_stabilized) {
  //         selector = {
  //           type: 'task',
  //           administrative_level_id: {
  //             $in: _villages_stabilized.map((elt: any) => String(elt.id))
  //           }
  //         }
  //       }
  //       getDocumentsByAttributes(selector)
  //         .then(async (result: any) => {
  //           // let result_tasks = (result?.docs ?? []).filter((d: any) => d.type == 'task');
  //           // let result_facilitator = (result?.docs ?? []).find((f: any) => f.type == 'facilitator');
            
            
  //           let result_tasks = (result?.docs ?? []).filter((elt: any) => (
  //             my_no_sql_db_name == no_sql_db_name || (my_no_sql_db_name != no_sql_db_name && _villages_stabilized && _villages_stabilized.find((v_s: any) => String(v_s.id) == String(elt.administrative_level_id)))
  //           ));
            

  //           if (nbr_villages == 0 || result_tasks.length == 0) {
  //             setTaskRemain(0);
  //             setTaskInvalid(0);
  //             setAllDocsAre(true);
  //           } else if (nbr_villages && nbr_villages != 0 && total_tasks && total_tasks != 0 && ((result_tasks.length / total_tasks) == nbr_villages)) {
  //             setTaskRemain(result_tasks.filter((i: any) => !i.completed).length);
  //             setTaskInvalid(result_tasks.filter((i: any) => i.validated === false).length);
  //             setAllDocsAre(true);
  //           } else {
  //             count_check++;
  //             setAllDocsAre(false);

  //             // if(count_check%3 == 0 ){
  //             //   await syncDocuments(LocalDatabase);
  //             //   compactDatabase(LocalDatabase);
  //             // }

  //             allDocsAreGet(nbr_villages, total_tasks, _villages_stabilized);
  //           }
  //         })
  //         .catch((err: any) => {
            
  //           setAllDocsAre(false);
  //           handleStorageError(err);

  //           // if (LocalDatabase._destroyed) {
  //           //   signOut();
  //           // }
  //         });
  //     } catch (error) {
  //       handleStorageError(error);
  //     }
  //   }
  // }

  useEffect(() => {
    villages_stabilized(null);
    // clearLocalDatabase(LocalDatabase, false, false, true);
    // getAllDocuments();
    setUserInfos();
    getNameAndEmail();
    get_others();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      if (JSON.parse(await getData('infos_changed')) == true) {
        await storeData('infos_changed', false);
        count_tasks_search = 0;
        count_facilitator_search = 0;
        onRefresh();
      }
    });

    return unsubscribe;
  }, [navigation]);


  const onRefresh = () => {
    setRefreshing(true);
    setSetats(null);
    villages_stabilized(null);
    // clearLocalDatabase(LocalDatabase, false, false, true);
    setUserInfos();
    getNameAndEmail();
    // compactDatabase(LocalDatabase);
    setRefreshing(false);
  };

  const copyAnotherFacilitatorInfos = (elt: any) => {
    Clipboard.setString(anotherFacilitator.no_sql_db_name ? anotherFacilitator.no_sql_db_name : `${anotherFacilitator.name};${anotherFacilitator.email};${anotherFacilitator.phone}`);
    toast.show({
      description: "Détails sur l'AC copiés",
    });
  };

  const ListHeader = () => (
    <>
      <HStack my={4}>
        
        <Pressable
          mr="4" rounded="lg" h={120} w={95} backgroundColor="trueGray.500"
          onPress={() => {
            if (isFacilitator) {
              navigation.navigate("SyncDatas")
            } else {
              console.log("Specialist");
            }
          }}
        >
          {({ isPressed }) => {
            return (
              <Box
                flex={1}
                rounded="lg"
                style={[
                  {
                    transform: [
                      {
                        scale: isPressed ? 0.97 : 1,
                      },
                    ],
                  },
                ]}
              >

                <Stack position="absolute" bottom={0} flex={1} zIndex={10}>
                  <Image
                    style={{ height: 120, width: 95, alignSelf: 'center', margin: 'auto' }}
                    resizeMode="stretch"
                    source={isFacilitator ? require('../../assets/illustrations/cloud_with_sync_g_b.png') : require('../../assets/illustrations/user.png')}
                    alt="image"
                  />
                </Stack>
              </Box>
            );
          }}
        </Pressable>

        <View
          style={{ flexDirection: 'column', flex: 1 }}>
          {name ? (
            no_sql_user ? <>
              <Heading style={{ fontSize: 15, lineHeight: 18 }}>{name ? name : "Nom de l'AC"}</Heading>
              <Text fontSize="sm" color="blue" style={{ fontSize: 10 }}>
                {email}
              </Text>
              {project && <Text fontSize="sm" style={{ color: 'grey', fontSize: 9, marginVertical: -9 }} fontWeight={'bold'}>
                {`${project.name}`}
              </Text>}
              {allDocsAre && anotherFacilitator && <Text onLongPress={() => copyAnotherFacilitatorInfos(anotherFacilitator)} fontSize="sm" style={{ color: stats ? 'grey' : 'red', fontSize: 9, lineHeight: undefined, fontWeight: 'bold', marginVertical: 5 }}>
                {anotherFacilitator.no_sql_db_name ? anotherFacilitator.no_sql_db_name : `${anotherFacilitator.name} (${anotherFacilitator.email}, ${anotherFacilitator.phone})`}{`${stats ? '' : " (Il semble qu'aucune de vos tâches n'est présente dans cette base du projet sélectionné)"}`}
              </Text>}
            </> : <>
            <Text></Text>
              <Heading style={{ fontSize: 23, lineHeight: 23, marginVertical: -11 }}>{name ? name : "Nom de l'AC"}</Heading>
              <Text></Text>
              <Text fontSize="sm" color="blue" style={{ fontSize: 13 }}>
                {email}
              </Text>
              {project && <Text fontSize="sm" style={{ color: 'grey', fontSize: 13, marginVertical: -9 }} fontWeight={'bold'}>
                {`${project.name}`}
              </Text>}
            </>
          ) : (
            <>
              <Text></Text>
              <Heading>
                <ProgressBar color="primary.500" key="name_progress_key" />
              </Heading>
              
            </>
          )}

          {isFacilitator && (allDocsAre ? (
            <View>
              {!anotherFacilitator && <Text></Text>}
              <HomeCardSmall
                title={'Vos tâches'}
                backgroundImage={require('../../assets/backgrounds/horizontal-orange_bg.png')}
                goesTo={{ route: 'TaskDiagnostic' }}
                index={0}
                task_invalid_revised={taskInvalidRevised}
                task_invalid={taskInvalid}
                task_remain={taskRemain}
                key={`Vos_tâches_${(new Date).toISOString()}`}
                id={`Vos_tâches_${(new Date).toISOString()}`}
              />
            </View>
          ) : (
            <>
              <Text></Text>
              <View>
                <Text fontSize="10" color="blue">
                  Récupération en cours... <ProgressBar styleAttr="Horizontal" color="primary.500" key="task_progress_key" />
                </Text>
              </View>
            </>
          ))}
        </View>
      </HStack>
    </>
  );


  return (
    <Layout disablePadding bg="white" >
      <FlatList refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
        flex={1}
        _contentContainerStyle={{ px: 5 }}
        ListHeaderComponent={<ListHeader />}
        numColumns={2}
        data={icons}
        keyExtractor={(item, index) => `${item.name}_${index}`}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item, index }: { item: any, index: any }) => {
          return (
          <HomeCard
            key={`${item.name}_${index}`}
            id={`${item.name}_${index}`}
            title={item.name}
            backgroundImage={item.bg}
            backgroundImageIcon={item.bgIcon}
            goesTo={item.goesTo}
            index={index}
            stats={stats}
            allDocsAre={allDocsAre}
          />
        )
        }}
      />

      <SnackBarCheckAppVersionComponent />
    </Layout>
  );
}
