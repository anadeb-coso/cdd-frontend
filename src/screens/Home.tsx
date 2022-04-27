import { Box, Heading, HStack, FlatList } from 'native-base';
import * as React from 'react';
import HomeCard from 'components/HomeCard';
import { Layout } from '../components/common/Layout';

function ListHeader() {
  return (
    <HStack mb={4} mx={3}>
      <Box mr="4" rounded="lg" h={88} w={88} backgroundColor="trueGray.500" />
      <Heading>Facilitator Name</Heading>
    </HStack>
  );
}

export default function HomeScreen() {
  const icons = [
    {
      name: 'Investment\n Cycle',
      bg: require('../../assets/backgrounds/green_bg.png'),
      bgIcon: require('../../assets/backgrounds/inv_cycle.png'),
      goesTo: 'InvestmentCycle',
    },
    {
      name: 'Diagnostics',
      bg: require('../../assets/backgrounds/beige_bg.png'),
      bgIcon: require('../../assets/backgrounds/diagnostics.png'),
      goesTo: 'InvestmentCycle',
    },
    {
      name: 'Capacity Building',
      bg: require('../../assets/backgrounds/orange_bg.png'),
      bgIcon: require('../../assets/backgrounds/capacity_building.png'),
      goesTo: 'InvestmentCycle',
    },
    {
      name: 'Grievance Redress Mechanism',
      bg: require('../../assets/backgrounds/dark_bg.png'),
      bgIcon: require('../../assets/backgrounds/grievance.png'),
      goesTo: 'InvestmentCycle',
    },
  ];
  return (
    <Layout disablePadding>
      <FlatList
        flex={1}
        bg="white"
        p={4}
        ListHeaderComponent={<ListHeader />}
        numColumns={2}
        data={icons}
        keyExtractor={(item, index) => `${item.name}_${index}`}
        renderItem={({ item }) => (
          <HomeCard
            title={item.name}
            backgroundImage={item.bg}
            backgroundImageIcon={item.bgIcon}
            goesTo={item.goesTo}
          />
        )}
      />
    </Layout>
  );
}
