import { Box, Heading, HStack, FlatList } from 'native-base';
import * as React from 'react';
import HomeCard from 'components/HomeCard';
import { useEffect } from 'react';
import { Layout } from '../components/common/Layout';
import { SyncToRemoteDatabase } from '../utils/databaseManager';

function ListHeader() {
  return (
    <HStack my={4}>
      <Box mr="4" rounded="lg" h={88} w={88} backgroundColor="trueGray.500" />
      <Heading>Facilitator Name</Heading>
    </HStack>
  );
}

export default function HomeScreen() {
  useEffect(() => {
    SyncToRemoteDatabase({ username: 'facilitator1', password: '123Qwerty' });
  }, []);
  const icons = [
    {
      name: 'Investment\n Cycle',
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
      name: 'Capacity Building',
      bg: require('../../assets/backgrounds/orange_bg.png'),
      bgIcon: require('../../assets/backgrounds/capacity_building.png'),
      goesTo: { route: '' },
    },
    {
      name: 'Grievance Redress Mechanism',
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
