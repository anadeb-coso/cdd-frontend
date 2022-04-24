import { Box, Heading, HStack, FlatList, ScrollView } from 'native-base';
import * as React from 'react';
import Card from 'components/Card';

export default function HomeScreen() {
  const icons = [
    {
      name: 'Investment\n Cycle',
      bg: 'amber.600',
    },
    {
      name: 'Diagnostics',
      bg: 'emerald.600',
    },
    {
      name: 'Capacity Building',
      bg: 'blue.600',
    },
    {
      name: 'Grievance Redress Mechanism',
      bg: 'orange.600',
    },
  ];
  return (
    <ScrollView flex={1} bg="white" p="4">
      <HStack mb={4}>
        <Box mr="4" rounded="lg" h={88} w={88} backgroundColor="trueGray.500" />
        <Heading>Facilitator Name</Heading>
      </HStack>
      <FlatList
        scrollEnabled={false}
        numColumns={2}
        data={icons}
        renderItem={({ item }) => <Card title={item.name} />}
      />
    </ScrollView>
  );
}
