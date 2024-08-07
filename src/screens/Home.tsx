import { Box, Heading, HStack, FlatList, Text, Pressable, Stack, useToast } from 'native-base';
import { ProgressBarAndroid, RefreshControl, Image, Platform } from 'react-native';
// import * as React from 'react';
import React, { useContext } from 'react';
import HomeCard from 'components/HomeCard';
import HomeCardSmall from 'components/HomeCardSmall';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { PrivateStackParamList } from '../types/navigation';
import { Layout } from '../components/common/Layout';
// import LocalDatabase from '../utils/databaseManager';
import { View } from 'native-base';
import AuthContext from '../contexts/auth';
import { getData } from '../utils/storageManager';
import SnackBarCheckAppVersionComponent from '../components/SnackBarCheckAppVersionComponent';
import { handleStorageError } from '../utils/pouchdb_call';
import { getAllDocuments, getDocumentsByAttributes } from '../utils/coucdb_call';


export default function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
  const toast = useToast();
  const [name, setName]: any = useState(null);
  const [email, setEmail]: any = useState(null);
  const [allDocsAre, setAllDocsAre] = useState(false);
  const { signOut } = useContext(AuthContext);
  const [taskInvalid, setTaskInvalid] = useState(0);
  const [taskRemain, setTaskRemain] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isFacilitator, setIsFacilitator] = useState(false);
  const [icons, setIcons]: any = useState([]);
  let count_check = 0;

  // compactDatabase(LocalDatabase);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);



  async function setUserInfos() {
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
          goesTo: { route: '' },
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
          goesTo: { route: '' },
        }
      ]);
    }
  };

  const get_others = async () => {

    try {
      // LocalDatabase.find({
      //   selector: { type: 'geolocation' }
      // })
      getDocumentsByAttributes({ type: 'geolocation' })
        .then((response: any) => {
          let geolocation_facilitator = response?.docs ?? [];
          let _geolocation = geolocation_facilitator.find((elt: any) => elt.type === 'geolocation')

          if (_geolocation && _geolocation.synced == false) {
            toast.show({
              description: "Veuillez synchroniser les coordonnées enregistrées récemment",
            });
          }

        }).catch((err: any) => {
          handleStorageError(err);
          console.log("Error1 : " + err);
        });
    } catch (error) {
      handleStorageError(error);
    }

  }

  async function getNameAndEmail() {
    setName(null);
    setEmail(null);
    if (isFacilitator || JSON.parse(await getData('no_sql_user'))) {
      setAllDocsAre(false);
      try {
        // LocalDatabase.find({
        //   selector: { type: 'facilitator' },
        // })
        getDocumentsByAttributes({ type: 'facilitator' })
          .then((result: any) => {
            setName(result?.docs[0]?.name ?? null);
            setEmail(result?.docs[0]?.email ?? null);

            if (!result?.docs[0]?.total_number_of_tasks) {
              getNameAndEmail()
            } else {
              allDocsAreGet(
                (result?.docs[0]?.administrative_levels ?? []).filter((i: any) => i.is_headquarters_village).length,
                result?.docs[0]?.total_number_of_tasks ?? null
              );
            }

          })
          .catch((err: any) => {
            console.log("Error1 : " + err);
            setName(null);
            setEmail(null);
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

  async function allDocsAreGet(nbr_villages: number, total_tasks: number) {
    try {
      // LocalDatabase.find({
      //   // selector: { type: 'task' },
      //   selector: {
      //     type: {
      //       $in: ['task', 'facilitator']
      //     }
      //   },
      // })
      getDocumentsByAttributes({
        // type: {
        //   $in: ['task', 'facilitator']
        // }
        type: 'task'
      })
        .then(async (result: any) => {
          // let result_tasks = (result?.docs ?? []).filter((d: any) => d.type == 'task');
          // let result_facilitator = (result?.docs ?? []).find((f: any) => f.type == 'facilitator');
          // console.log("==================================");
          // (result_facilitator.administrative_levels ?? []).filter((i: any) => i.is_headquarters_village).forEach((elt: any) => {
          //   console.log(elt.id + " " + elt.name + " " + result_tasks.filter((e: any) => e.administrative_level_id == elt.id).length);
          // });
          // console.log(result_tasks.filter((e: any) => !["1986", "4023"].includes(e.administrative_level_id)));
          // console.log("==================================");
          
          let result_tasks = result?.docs ?? [];
          if (nbr_villages && nbr_villages != 0 && total_tasks && total_tasks != 0 && ((result_tasks.length / total_tasks) == nbr_villages)) {
            setTaskRemain(result_tasks.filter((i: any) => !i.completed).length);
            setTaskInvalid(result_tasks.filter((i: any) => i.validated === false).length);
            setAllDocsAre(true);
          } else {
            count_check++;
            setAllDocsAre(false);

            // if(count_check%3 == 0 ){
            //   await syncDocuments(LocalDatabase);
            //   compactDatabase(LocalDatabase);
            // }

            allDocsAreGet(nbr_villages, total_tasks);
          }
        })
        .catch((err: any) => {
          console.log("Error2 : " + err);
          setAllDocsAre(false);
          handleStorageError(err);

          // if (LocalDatabase._destroyed) {
          //   signOut();
          // }
        });
    } catch (error) {
      handleStorageError(error);
    }
  }

  useEffect(() => {
    // clearLocalDatabase(LocalDatabase, false, false, true);
    // getAllDocuments();
    setUserInfos();
    getNameAndEmail();
    get_others();
  }, []);


  const onRefresh = () => {
    setRefreshing(true);
    // clearLocalDatabase(LocalDatabase, false, false, true);
    setUserInfos();
    getNameAndEmail();
    // compactDatabase(LocalDatabase);
    setRefreshing(false);
  };

  const ListHeader = () => (
    <>
      <HStack my={4}>
        {/* <Box mr="4" rounded="lg" h={120} w={95} backgroundColor="trueGray.500" >
          <Image
              resizeMode="cover"
              style={{ height: 70, width: 70, alignSelf: 'center', margin: 'auto' }}
              source={require('../../assets/illustrations/sync_green.png')}
              alt="image"
            />
        </Box> */}
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
                    flex={1}
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
            <>
              <Heading>{name ? name : "Nom de l'AC"}</Heading>
              <Text fontSize="sm" color="blue">
                {email}
              </Text>
            </>
          ) : (
            <>
              <Text></Text>
              <Heading>
                <ProgressBarAndroid color="primary.500" />
              </Heading>
              {/* <Text fontSize="sm" color="blue">
              Patientez un peu...
            </Text> */}
            </>
          )}

          {isFacilitator && (allDocsAre ? (
            <View>
              <Text></Text>
              <HomeCardSmall
                title={'Vos tâches'}
                backgroundImage={require('../../assets/backgrounds/horizontal-orange_bg.png')}
                goesTo={{ route: 'TaskDiagnostic' }}
                index={0}
                task_invalid={taskInvalid}
                task_remain={taskRemain}
              />
            </View>
          ) : (
            <>
              <Text></Text>
              <View>
                <Text fontSize="10" color="blue">
                  Récupération en cours... <ProgressBarAndroid styleAttr="Horizontal" color="primary.500" />
                </Text>
              </View>
            </>
          ))}
        </View>
      </HStack>
    </>
  );


  // const icons = [
  //   {
  //     name: 'Cycle\nd’investissement',
  //     bg: require('../../assets/backgrounds/green_bg.png'),
  //     bgIcon: require('../../assets/backgrounds/inv_cycle.png'),
  //     // goesTo: { route: 'InvestmentCycle', params: { title: 'Village A' } },
  //     goesTo: { route: 'SelectVillage' },
  //   },
  //   {
  //     name: 'Suivi des sous-projets',
  //     bg: require('../../assets/backgrounds/beige_bg.png'),
  //     bgIcon: require('../../assets/backgrounds/diagnostics.png'),
  //     goesTo: { route: 'Cantons' },
  //   },
  //   {
  //     name: 'Renforcement\ndes capacités',
  //     bg: require('../../assets/backgrounds/orange_bg.png'),
  //     bgIcon: require('../../assets/backgrounds/capacity_building.png'),
  //     goesTo: { route: '' },
  //   },
  //   {
  //     name: 'Diagnostics',
  //     bg: require('../../assets/backgrounds/beige_bg.png'),
  //     bgIcon: require('../../assets/backgrounds/diagnostics.png'),
  //     goesTo: { route: '' },
  //   },
  //   // {
  //   //   name: 'Mécanisme\n' +
  //   //       'de gestion\n' +
  //   //       'des plaintes',
  //   //   bg: require('../../assets/backgrounds/dark_bg.png'),
  //   //   bgIcon: require('../../assets/backgrounds/grievance.png'),
  //   //   goesTo: { route: '' },
  //   // },
  // ];
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
        renderItem={({ item, index }) => (
          <HomeCard
            title={item.name}
            backgroundImage={item.bg}
            backgroundImageIcon={item.bgIcon}
            goesTo={item.goesTo}
            index={index}
          />
        )}
      />

      <SnackBarCheckAppVersionComponent />
    </Layout>
  );
}
