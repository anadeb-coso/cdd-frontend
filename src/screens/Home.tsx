import { Box, Heading, HStack, FlatList, Text, Pressable, Stack } from 'native-base';
import {ProgressBarAndroid, RefreshControl, Image} from 'react-native';
// import * as React from 'react';
import React, { useContext } from 'react';
import HomeCard from 'components/HomeCard';
import HomeCardSmall from 'components/HomeCardSmall';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrivateStackParamList } from '../types/navigation';
import { Layout } from '../components/common/Layout';
import LocalDatabase from '../utils/databaseManager';
import { View } from 'native-base';
import AuthContext from '../contexts/auth';

export default function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();

  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const [allDocsAre, setAllDocsAre] = useState(false);
  const { signOut } = useContext(AuthContext);
  const [taskInvalid, setTaskInvalid] = useState(0);
  const [taskRemain, setTaskRemain] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  

  function getNameAndEmail(){
    setName(null);
    setEmail(null);
    setAllDocsAre(false);
    LocalDatabase.find({
      selector: { type: 'facilitator' },
    })
      .then((result: any) => {
        setName(result?.docs[0]?.name ?? null);
        setEmail(result?.docs[0]?.email ?? null);
        
        if(!result?.docs[0]?.total_number_of_tasks){
          getNameAndEmail()
        }else{
          allDocsAreGet(
            (result?.docs[0]?.administrative_levels ?? []).filter((i: any) => i.is_headquarters_village).length,
            result?.docs[0]?.total_number_of_tasks ?? null
          );
        }
        
      })
      .catch((err: any) => {
        console.log("Error1 : "+err);
        setName(null);
        setEmail(null);
        
        if(LocalDatabase._destroyed){
          signOut();
        }
      });
      
  }

  function allDocsAreGet(nbr_villages: number, total_tasks:number){
    LocalDatabase.find({
      selector: { type: 'task' },
    })
      .then((result: any) => {
        if(nbr_villages && nbr_villages != 0 && total_tasks && total_tasks != 0 && (((result?.docs ?? []).length/total_tasks) == nbr_villages)){
          setTaskRemain((result?.docs ?? []).filter((i: any) => !i.completed).length);
          setTaskInvalid((result?.docs ?? []).filter((i: any) => i.validated === false).length);
          setAllDocsAre(true);
        }else{
          setAllDocsAre(false);
          allDocsAreGet(nbr_villages, total_tasks);
        }
      })
      .catch((err: any) => {
        console.log("Error2 : "+err);
        setAllDocsAre(false);
        
        if(LocalDatabase._destroyed){
          signOut();
        }
      });
  }

  useEffect(() => {
    getNameAndEmail()
  }, []);

  
  const onRefresh = () => {
    setRefreshing(true);
    getNameAndEmail();
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
      onPress={() => navigation.navigate("SyncDatas")}
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
                source={require('../../assets/illustrations/sync_green.png')}
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
                <ProgressBarAndroid  color="primary.500" />
            </Heading>
            {/* <Text fontSize="sm" color="blue">
              Patientez un peu...
            </Text> */}
        </>
        )}

        {allDocsAre ? (
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
        )}
        </View>
      </HStack>
    </>
  );


  const icons = [
    {
      name: 'Cycle\nd’investissement',
      bg: require('../../assets/backgrounds/green_bg.png'),
      bgIcon: require('../../assets/backgrounds/inv_cycle.png'),
      // goesTo: { route: 'InvestmentCycle', params: { title: 'Village A' } },
      goesTo: { route: 'SelectVillage' },
    },
    {
      name: 'Diagnostics',
      bg: require('../../assets/backgrounds/beige_bg.png'),
      bgIcon: require('../../assets/backgrounds/diagnostics.png'),
      goesTo: { route: '' },
    },
    {
      name: 'Renforcement\ndes capacités',
      bg: require('../../assets/backgrounds/orange_bg.png'),
      bgIcon: require('../../assets/backgrounds/capacity_building.png'),
      goesTo: { route: '' },
    },
    {
      name: 'Mécanisme\n' +
          'de gestion\n' +
          'des plaintes',
      bg: require('../../assets/backgrounds/dark_bg.png'),
      bgIcon: require('../../assets/backgrounds/grievance.png'),
      goesTo: { route: '' },
    },
  ];
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
    </Layout>
  );
}
