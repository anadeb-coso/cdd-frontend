import { Box, Heading, HStack, FlatList, Text } from 'native-base';
import {ProgressBarAndroid} from 'react-native';
import * as React from 'react';
import HomeCard from 'components/HomeCard';
import { useEffect, useState } from 'react';
import { Layout } from '../components/common/Layout';
import LocalDatabase from '../utils/databaseManager';
import { View } from 'native-base';

function ListHeader() {

  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const [allDocsAre, setAllDocsAre] = useState(false);

  function getNameAndEmail(){
    LocalDatabase.find({
      selector: { type: 'facilitator' },
    })
      .then((result: any) => {
        setName(result?.docs[0]?.name ?? null);
        setEmail(result?.docs[0]?.email ?? null);
        
        if(!result?.docs[0]?.name){
          getNameAndEmail()
        }else{
          allDocsAreGet((result?.docs[0]?.administrative_levels ?? []).length);
        }
        
      })
      .catch((err: any) => {
        console.log(err);
        setName(null);
        setEmail(null);
      });
      
  }

  function allDocsAreGet(nbr_villages: number){
    LocalDatabase.find({
      selector: { type: 'task' },
    })
      .then((result: any) => {
        if(nbr_villages && nbr_villages != 0 && (((result?.docs ?? []).length/44) == nbr_villages)){
          setAllDocsAre(true);
        }else{
          setAllDocsAre(false);
          allDocsAreGet(nbr_villages);
        }
      })
      .catch((err: any) => {
        setAllDocsAre(false);
      });
  }

  useEffect(() => {
    getNameAndEmail()
  }, []);


  return (
    <>
      <HStack my={4}>
        <Box mr="4" rounded="lg" h={88} w={88} backgroundColor="trueGray.500" />
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
          </View>
        ) : (
          <>
            <Text></Text>
            <View>
              <Text fontSize="sm" color="blue">
                En cours de récupération... <ProgressBarAndroid styleAttr="Horizontal" color="primary.500" />
              </Text>
            </View>
        </>
        )}
        </View>
      </HStack>
    </>
  );
}

export default function HomeScreen() {
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
    <Layout disablePadding bg="white">
      <FlatList
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
