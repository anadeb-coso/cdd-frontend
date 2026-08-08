import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Center,
  FlatList,
  Heading,
  HStack,
  Progress,
  Text,
  Modal,
  VStack,
  ScrollView,
} from 'native-base';
import { View, StyleSheet, TouchableOpacity, Image, RefreshControl, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ProgressBar } from '@react-native-community/progress-bar-android';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Layout } from '../components/common/Layout';
import { PressableCard } from '../components/common/PressableCard';
import { PrivateStackParamList } from '../types/navigation';
// import LocalDatabase from '../utils/databaseManager';
import { getDocumentsByAttributes } from '../utils/coucdb_call';
import { getEadlByEmail } from '../services/facilitators/eadl';
import { handleStorageError } from '../utils/pouchdb_call';
import { getData, storeData } from '../utils/storageManager';
import { clear_duplicate_on_liste } from '../utils/functions';
import FacilitatorsAPI from "../services/facilitators/facilitators";

function SelectVillage({ route }: { route: any }) {
  const { t } = useTranslation(['core', 'common']);
  const tasks_stats = route.params?.tasks_stats ?? {};

  const navigation =
    useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
  // const [villages, setVillages] = useState([]);
  const [cvds, setCvds] = useState([]);
  const [showInfoModal, setShowInfoModal] = useState(false);
  // const [village, setVillage] = useState(null);
  const [cvd, setCvd]: any = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [facilitator, setFacilitator]: any = useState(null);
  const [villagesStabilized, setVillagesStabilized]: any = useState(null);
  const [noSQLDBsNames, setNoSQLDBsNames]: any = useState([]);

  // useEffect(() => {
  //   LocalDatabase.find({
  //     selector: { type: 'facilitator' },
  //     // fields: ["_id", "commune", "phases"],
  //   })
  //     .then((result: any) => {
  //       const villagesResult = result?.docs[0]?.administrative_levels ?? [];
  //       const geographical_units = result?.docs[0]?.geographical_units ?? [];
  //       villagesResult.forEach((element_village: any, index_village: number) => {
  //         villagesResult[index_village].value_progess_bar = null;

  //         villagesResult[index_village].cvd = null;
  //         geographical_units.forEach((element: any, index: number) => {
  //           if(element["villages"] && element["villages"].includes(villagesResult[index_village].id)){
  //             if(element["name"]){
  //               villagesResult[index_village].unit = element["name"];
  //             }

  //             element["cvd_groups"].forEach((elt: any, i: number) => {
  //               if(elt["villages"] && elt["villages"].includes(villagesResult[index_village].id)){
  //                 if(elt["name"]){
  //                   villagesResult[index_village].cvd = elt["name"];
  //                 }
  //               }
  //             });
  //           }

  //         });

  //         if(villagesResult.length == (index_village+1)){
  //           setVillages(villagesResult);
  //         }
  //       });

  //       let total_tasks_completed = 0;
  //       let total_tasks = 0; //Total tasks of the activities

  //       //Find the phases and calcul the progression bar
  //       villagesResult.forEach(async (element_village: any, index_village: number) => {

  //         await LocalDatabase.find({
  //           selector: { type: 'phase', administrative_level_id: element_village.id },
  //         })
  //           .then(async (result_phases: any) => {
  //             const phasesResult = result_phases?.docs ?? [];
  //             let ids_phases: any = [];
  //             phasesResult.forEach((element_phase: any) => {
  //               ids_phases.push(element_phase._id);
  //             });

  //             await LocalDatabase.find({
  //               selector: { type: 'task', phase_id: {$in: ids_phases} },
  //             })
  //               .then((result_tasks: any) => {
  //                 const tasksResults = result_tasks?.docs ?? [];

  //                 const _completedTasks = tasksResults.filter((i: any) => i.completed).length;
  //                 total_tasks += tasksResults.length;
  //                 total_tasks_completed += _completedTasks;
  //                 villagesResult[index_village].value_progess_bar = total_tasks != 0 ? ((total_tasks_completed / total_tasks) * 100) : 0;

  //                 if(villagesResult.length == (index_village+1)){
  //                   setVillages([]);
  //                   setVillages(villagesResult);
  //                 }
  //               })
  //               .catch((err: any) => {
  //                 console.log(err);
  //                 return [];
  //               });

  //           })
  //           .catch((err: any) => {
  //             console.log(err);
  //             return [];
  //           });

  //           total_tasks_completed = 0;
  //           total_tasks = 0;

  //       });
  //       //End for phases


  //     })
  //     .catch((err: any) => {
  //       console.log(err);
  //       setVillages([]);
  //     });
  // }, []);

  const get_no_sql_dbs = async () => {
    // setNoSQLDBsNames(await new FacilitatorsAPI().get_no_sql_dbs_names());

    setNoSQLDBsNames(JSON.parse(await getData('no_sql_dbs_names')));

  }

  async function villages_stabilized(email: any) {
    let my_no_sql_db_name = JSON.parse(await getData('my_no_sql_db_name'));
    let no_sql_db_name = JSON.parse(await getData('no_sql_db_name'));
    if (my_no_sql_db_name != no_sql_db_name) { //villagesStabilized == null && 
      email = email == null ? `${JSON.parse(await getData('email'))}` : email;
      try {
        let villagesResult: any = [];
        await getEadlByEmail(email ?? null)
          .then((response: any) => {
            setFacilitator({
              name: response?.docs[0]?.representative?.name,
              email: response?.docs[0]?.representative?.email,
              phone: response?.docs[0]?.representative?.phone
            });
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
            console.log("Error1 : " + err);
            handleStorageError(err);
          });

        setVillagesStabilized(villagesResult);

        return {
          villages: villagesResult,
          facilitator: (await getDocumentsByAttributes({ type: 'facilitator' }, 250, 0, my_no_sql_db_name))?.docs[0]
        }

      } catch (error) {
        handleStorageError(error);
      }
    }


  }


  const fetchCVDSWithInfos = async () => {
    let project = JSON.parse(await getData('project'));

    let r = await villages_stabilized(null);
    let _villages_stabilized = r?.villages;
    let _facilitator = r?.facilitator;

    let my_no_sql_db_name = JSON.parse(await getData('my_no_sql_db_name'));
    let no_sql_db_name = JSON.parse(await getData('no_sql_db_name'));
    setCvds([]);
    try {
      // LocalDatabase.find({
      //   selector: { type: 'facilitator' },
      //   // fields: ["_id", "commune", "phases"],
      // })
      await getDocumentsByAttributes({ type: 'facilitator' })
        .then(async (result: any) => {

          setFacilitator(_facilitator ?? result?.docs[0]);
          const villagesResult = (result?.docs[0]?.administrative_levels ?? []).filter((elt: any) => project && elt.project_name == project.name && (
            my_no_sql_db_name == no_sql_db_name || (my_no_sql_db_name != no_sql_db_name && _villages_stabilized && _villages_stabilized.find((v_s: any) => v_s.id == elt.id))
          ));

          const geographical_units = result?.docs[0]?.geographical_units ?? [];


          let CVDs: any = [];
          let villages: any;
          geographical_units.forEach((element: any, index: number) => {
            element["cvd_groups"].forEach((elt: any, i: number) => {
              villages = []
              for (let _index = 0; _index < villagesResult.length; _index++) {
                if (elt.villages && elt.villages.includes(villagesResult[_index].id)) {
                  villages.push(villagesResult[_index]);
                  if (villagesResult[_index].is_headquarters_village == true) {
                    elt.village = villagesResult[_index];
                  }
                }
              }
              
              if (villages.length != 0) {
                elt.villages = villages;
                elt.unit = element.name;
                elt.project = project
                
                let villages_infos = tasks_stats[elt?.village?.id];
                if(villages_infos && villages_infos.total){
                  
                  elt.value_progess_bar = villages_infos.total != 0 ? ((villages_infos.completed / villages_infos.total) * 100) : 0;
                  elt.tasks_number_validated = villages_infos.invalid;
                  elt.tasks_number_validated_revised = villages_infos.invalid_revised;
                  elt.tasks_remain = villages_infos.total != 0 ? villages_infos.total - villages_infos.completed : 0;

                
                  CVDs.push(elt);
                }
                // else{
                //   elt.value_progess_bar = 0;
                //   elt.tasks_number_validated = 0;
                //   elt.tasks_number_validated_revised = 0;
                //   elt.tasks_remain = 0;
                // }
                
              }

            });
          });

          setCvds(CVDs);

          /*
          let total_tasks_completed = 0;
          let total_tasks = 0; //Total tasks of the activities

          let villages_infos;
          //Find the phases and calcul the progression bar
          for (let index_village = 0; index_village < CVDs.length; index_village++) {

            let element_cvd = CVDs[index_village];
            let element_village = element_cvd.village;
            try {
              try {
                let result_tasks = await getDocumentsByAttributes({
                  type: 'task', administrative_level_id: element_village.id
                })

                const tasksResults = result_tasks?.docs ?? [];

                const _completedTasks = tasksResults.filter((i: any) => i.completed).length;
                total_tasks += tasksResults.length;
                total_tasks_completed += _completedTasks;
                CVDs[index_village].value_progess_bar = total_tasks != 0 ? ((total_tasks_completed / total_tasks) * 100) : 0;
                CVDs[index_village].tasks_invalidated = tasksResults.filter((i: any) => i.validated == false);
                CVDs[index_village].tasks_number_validated = CVDs[index_village].tasks_invalidated.length;

                

              } catch (error) {
                handleStorageError(error);
                console.log(error);
              }

            } catch (error) {
              handleStorageError(error);
            }

            total_tasks_completed = 0;
            total_tasks = 0;


            setCvds([]);
            setCvds(CVDs);

          }
          //End for phases
          */


        })
        .catch((err: any) => {
          handleStorageError(err);
          console.log(err);
          setCvds([]);
        });
    } catch (error) {
      handleStorageError(error);
    }
  };

  const callFetchCVDSWithInfos = async () => {
    await fetchCVDSWithInfos()
  };

  useEffect(() => {
    callFetchCVDSWithInfos();
    get_no_sql_dbs();
  }, []);




  const showInfo = (item: any) => {
    // setVillage(item);
    setCvd(item);
    setShowInfoModal(true);
  };

  const getVillages = (villages: any) => {
    return (
      <SafeAreaView style={{ padding: 3, flex: 1 }}>
        {villages.map((item: any, index: any) => (
          <View key={`${item.name}_${index}`}>
            <Text>{(index + 1) + "-/ " + item.name}</Text>
          </View>
        ))}
      </SafeAreaView>
    );
  };

  const renderItemCVD = (item: any, index: number) => (

    <PressableCard bgColor="gray" shadow="2" my={2} mx={2} id={`${item.name}_${index}`} key={`${item.name}_${index}`} onPress={() =>
      navigation.navigate('VillageDetail', {
        village: item.village,
        name: item.name.length > 22 ? null : item.name,
        cvd_name: item.name,
        progess_percent: item?.value_progess_bar ? `${(item.value_progess_bar).toFixed(2)}%` : "??",
        facilitator: facilitator,
        tasks_stats: tasks_stats[item?.village?.id],
        // tasks_invalidated: item.tasks_invalidated,
        project: item.project
      })}>
      <HStack>
        <Text fontWeight={400} fontSize={17} w="90%">
          {item.name}
        </Text>
        <Box w="10%" >
          <TouchableOpacity
            key={item.name}
            onPress={() => { showInfo(item); }}
          >
            <Image
              resizeMode="stretch"
              style={{ width: 20, height: 20, borderRadius: 30 }}
              source={require('../../assets/info.png')}
            />
          </TouchableOpacity>
          {item?.tasks_number_validated ? <View>
              <Text
                style={{
                  backgroundColor: "red", borderRadius: 8, color: "white",
                  textAlign: "center",
                  flex: 1, fontSize: 10
                }}
              >{`${![0, null, undefined].includes(item?.tasks_number_validated_revised) ? item?.tasks_number_validated_revised + '/': ''}`}{item?.tasks_number_validated}</Text>
          </View> : <></>}
          {item?.tasks_remain ? <View>
              <Text
                style={{
                  backgroundColor: "orange", borderRadius: 8, color: "white",
                  textAlign: "center",
                  flex: 1, fontSize: 10
                }}
              >{item?.tasks_remain}</Text>
          </View> : <></>}
        </Box>
      </HStack>
      {/* <Heading mt={2} fontSize={11}>
        {'CVD : ' + item.cvd}
      </Heading> */}

      <HStack mt={5} alignItems="center">
        <Box w="80%" >
          {(item.value_progess_bar != null && item.value_progess_bar != undefined) ? (
            <>
              <View style={{ alignItems: 'center' }}>
                <Text fontWeight={'bold'} fontSize={11}>{`${(item.value_progess_bar).toFixed(2)}%`}</Text>
              </View>
              <Progress
                rounded={5}
                // size="xl"
                _filledTrack={{
                  rounded: 2,
                  bg: 'primary.500',
                }}
                value={(item.value_progess_bar).toFixed(2)}
                mr="4"

              >
                <Text style={{ fontSize: 1, color: 'white' }}>{`${(item.value_progess_bar).toFixed(2)}%`}</Text>
              </Progress></>) : <ProgressBar
            styleAttr="Horizontal" color="primary.500" style={{ height: 24 }} />}
        </Box>
        <Box w="19%" alignSelf={'end'}>
          <View style={{ alignItems: 'flex-end' }}>
            <Text fontWeight={50} fontSize={11} >
              {item?.project?.name}
            </Text>
          </View>
        </Box>
        
      </HStack>
    </PressableCard>

  );

  const onRefresh = async () => {
    // setRefreshing(true);
    // callFetchCVDSWithInfos();
    // get_no_sql_dbs();
    // setRefreshing(false);
    await storeData('infos_changed', true);
    navigation.goBack();
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      if (JSON.parse(await getData('infos_changed')) == true) {
        // onRefresh();
        navigation.goBack();
        
      }
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <Layout disablePadding>
      <ScrollView
        flex={1}
        contentContainerStyle={{ paddingHorizontal: 3 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {noSQLDBsNames && <View style={{ marginTop: 5 }}>
          <TouchableOpacity
            key={`change_db`}
            onPress={() => { navigation.navigate("ChangeFacilitatorDBScreen"); }}
          >
            <Text>{t('select_village.change_database_action')}</Text>
          </TouchableOpacity>
        </View>}
        {(cvds && cvds.length != 0) ? cvds.map((elt: any, i: any) => renderItemCVD(elt, i)) : <View style={{ alignContent: 'center' }}>

          <ProgressBar color="primary.500" />

        </View>}
      </ScrollView>


      <Modal
        isOpen={showInfoModal}
        onClose={() => {
          setShowInfoModal(false);
          // setVillage(null);
        }}
        size="lg"
      >
        <Modal.Content maxWidth="400px">
          <Modal.Header>
            <Text textAlign='center' fontWeight='bold' fontSize={20} >{t('select_village.detail_title')}</Text>
          </Modal.Header>

          <Modal.Body>
            <VStack space="sm">

              <HStack mt={3} >
                <Box w="20%" >{t('select_village.unit_label')}</Box>
                <Box w="80%" ><Text>{cvd ? cvd.unit : ''}</Text></Box>
              </HStack>

              <HStack mt={3} >
                <Box w="100%"><Text textAlign='center' fontWeight='bold' >{cvd ? (cvd.villages.length == 1 ? t('select_village.village_singular') : t('select_village.villages_cvd_heading')) : ''}</Text></Box>
              </HStack>

              {
                getVillages(cvd ? cvd.villages : [])
              }

              <Button
                variant="ghost"
                colorScheme="blueGray"
                onPress={() => {
                  setShowInfoModal(false);
                  // setVillage(null);
                }}
              >
                {t('select_village.quit_button')}
              </Button>
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>


    </Layout>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  example: {
    marginVertical: 24,
  },
});

export default SelectVillage;
