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
import { View, StyleSheet, ProgressBarAndroid, TouchableOpacity, Image, RefreshControl, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Layout } from '../components/common/Layout';
import { PressableCard } from '../components/common/PressableCard';
import { PrivateStackParamList } from '../types/navigation';
// import LocalDatabase from '../utils/databaseManager';
import { getDocumentsByAttributes } from '../utils/coucdb_call';
import { handleStorageError } from '../utils/pouchdb_call';

function SelectVillage() {
  const navigation =
    useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
  // const [villages, setVillages] = useState([]);
  const [cvds, setCvds] = useState([]);
  const [showInfoModal, setShowInfoModal] = useState(false);
  // const [village, setVillage] = useState(null);
  const [cvd, setCvd] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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
  const fetchCVDSWithInfos = () => {
    setCvds([]);
    try {
      // LocalDatabase.find({
      //   selector: { type: 'facilitator' },
      //   // fields: ["_id", "commune", "phases"],
      // })
      getDocumentsByAttributes({ type: 'facilitator' })
        .then((result: any) => {
          const villagesResult = result?.docs[0]?.administrative_levels ?? [];
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
              // if(villages.length != 0){
              //   elt.village = villages[0];
              // }
              elt.villages = villages;
              elt.unit = element.name;
              CVDs.push(elt);
            });
          });

          setCvds(CVDs);


          let total_tasks_completed = 0;
          let total_tasks = 0; //Total tasks of the activities

          //Find the phases and calcul the progression bar
          CVDs.forEach(async (element_cvd: any, index_village: number) => {
            let element_village = element_cvd.village;
            try {
              // await LocalDatabase.find({
              //   selector: { type: 'phase', administrative_level_id: element_village.id },
              // })
              // getDocumentsByAttributes({ type: 'phase', administrative_level_id: element_village.id })
              //   .then(async (result_phases: any) => {
              //     const phasesResult = result_phases?.docs ?? [];
              //     let ids_phases: any = [];
              //     phasesResult.forEach((element_phase: any) => {
              //       ids_phases.push(element_phase._id);
              //     });

                  try {
                    // await LocalDatabase.find({
                    //   selector: { type: 'task', phase_id: { $in: ids_phases } },
                    // })
                    await getDocumentsByAttributes({ type: 'task', administrative_level_id: element_village.id
                      // phase_id: { $in: ids_phases } 
                    })
                      .then((result_tasks: any) => {
                        const tasksResults = result_tasks?.docs ?? [];

                        const _completedTasks = tasksResults.filter((i: any) => i.completed).length;
                        total_tasks += tasksResults.length;
                        total_tasks_completed += _completedTasks;
                        CVDs[index_village].value_progess_bar = total_tasks != 0 ? ((total_tasks_completed / total_tasks) * 100) : 0;

                        if (CVDs.length == (index_village + 1)) {
                          setCvds([]);
                          setCvds(CVDs);
                        }
                      })
                      .catch((err: any) => {
                        handleStorageError(err);
                        console.log(err);
                        return [];
                      });
                  } catch (error) {
                    handleStorageError(error);
                  }

                // })
                // .catch((err: any) => {
                //   handleStorageError(err);
                //   console.log(err);
                //   return [];
                // });
            } catch (error) {
              handleStorageError(error);
            }

            total_tasks_completed = 0;
            total_tasks = 0;

          });
          //End for phases


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

  useEffect(() => {
    fetchCVDSWithInfos();
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
    <PressableCard bgColor="white" shadow="0" my={4} key={`${item.name}_${index}`}>
      <HStack>
        <Text fontWeight={400} fontSize={20} w="95%">
          {item.name}
        </Text>
        <Box w="5%" >
          <TouchableOpacity
            key={item.id}
            onPress={() => { showInfo(item); }}
          >
            <Image
              resizeMode="stretch"
              style={{ width: 15, height: 15, borderRadius: 30 }}
              source={require('../../assets/info.png')}
            />
          </TouchableOpacity>
        </Box>
      </HStack>
      {/* <Heading mt={2} fontSize={11}>
        {'CVD : ' + item.cvd}
      </Heading> */}
      <HStack mt={5} alignItems="center">
        <Box w="70%" >
          {(item.value_progess_bar != null && item.value_progess_bar != undefined) ? (
            <>
              <View style={{ alignItems: 'center' }}>
                <Text>{`${(item.value_progess_bar).toFixed(2)}%`}</Text>
              </View>
              <Progress
                rounded={5}
                size="xl"
                _filledTrack={{
                  rounded: 2,
                  bg: 'primary.500',
                }}
                value={(item.value_progess_bar).toFixed(2)}
                mr="4"

              >
                <Text style={{ fontSize: 10, color: 'white' }}>{`${(item.value_progess_bar).toFixed(2)}%`}</Text>
              </Progress></>) : <ProgressBarAndroid
            styleAttr="Horizontal" color="primary.500" />}
        </Box>
        <Button
          bgColor="primary.500"
          // onPress={() =>
          //   navigation.navigate('VillageDetail', { village: item })
          // }
          onPress={() =>
            navigation.navigate('VillageDetail', {
              village: item.village, name: item.name.length > 22 ? null : item.name, cvd_name: item.name
            })
          }
          w="30%"
        >
          Ouvrir
        </Button>
      </HStack>
    </PressableCard>
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchCVDSWithInfos();
    setRefreshing(false);
  };

  return (
    <Layout disablePadding>
      {/* <FlatList
        flex={1}
        _contentContainerStyle={{ px: 3 }}
        data={cvds}
        keyExtractor={(item: any, index: number) => `${item.name}_${index}`}
        renderItem={({ item, index }) => }
      /> */}
      <ScrollView
        flex={1}
        contentContainerStyle={{ px: 3 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {cvds.map((elt: any, i: any) => renderItemCVD(elt, i))}
      </ScrollView>



      {/* <Modal
          isOpen={showInfoModal}
          onClose={() => {
            setShowInfoModal(false);
            // setVillage(null);
          }}
          size="lg"
        >
          <Modal.Content maxWidth="400px">
            <Modal.Header>
              <Text textAlign='center' fontWeight='bold' fontSize={20} >Detail</Text>
            </Modal.Header>

            <Modal.Body>
              <VStack space="sm">

                <HStack mt={3} >
                  <Box w="100%"><Text textAlign='center' fontWeight='bold' >{village ? village.name : ''}</Text></Box>
                </HStack>

                <HStack mt={3} >
                  <Box w="20%" >Unité :</Box>
                  <Box w="80%" ><Text>{village ? village.unit : ''}</Text></Box>
                </HStack>

                <HStack mt={1} mb={3}>
                  <Box w="20%" >CVD :</Box>
                  <Box w="80%" >{village ? village.cvd : ''}</Box>
                </HStack>

                <Button
                  variant="ghost"
                  colorScheme="blueGray"
                  onPress={() => {
                    setShowInfoModal(false);
                    // setVillage(null);
                  }}
                >
                  Quitter
                </Button>
              </VStack>
            </Modal.Body>
          </Modal.Content>
        </Modal> */}



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
            <Text textAlign='center' fontWeight='bold' fontSize={20} >Detail</Text>
          </Modal.Header>

          <Modal.Body>
            <VStack space="sm">

              <HStack mt={3} >
                <Box w="20%" >Unité :</Box>
                <Box w="80%" ><Text>{cvd ? cvd.unit : ''}</Text></Box>
              </HStack>

              <HStack mt={3} >
                <Box w="100%"><Text textAlign='center' fontWeight='bold' >{cvd ? (cvd.villages.length == 1 ? "Village" : "Villages formants le CVD") : ''}</Text></Box>
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
                Quitter
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
