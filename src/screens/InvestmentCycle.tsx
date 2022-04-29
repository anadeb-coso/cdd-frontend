import React from 'react';
import { Heading, HStack, Pressable, ScrollView, Text } from 'native-base';
import SmallCard from 'components/SmallCard';

const layoutItems = [
  {
    id: '1.',
    title: 'Community Mobilization',
  },
  {
    id: '2.',
    title: 'Participatory Assessment',
  },
  {
    id: '3.',
    title: 'Approvals',
  },
  {
    id: '4.',
    title: 'Sub-Project Preparation',
  },
  {
    id: '5.',
    title: 'Implementation',
  },
  {
    id: '6.',
    title: 'Closing and Replanning',
  },
];

function InvestmentCycle() {
  return (
    <ScrollView p={3}>
      <HStack space="sm" justifyContent="space-between">
        <Pressable
          p={3}
          h="12"
          flex={1}
          bg="primary.500"
          rounded="md"
          shadow={3}
          onPress={() => console.log('pressed')}
        >
          <Text fontFamily="body" fontWeight={700} color="white">
            Diagnostics
          </Text>
        </Pressable>
        <Pressable
          p={3}
          h="12"
          flex={1}
          bg="primary.600"
          rounded="md"
          shadow={3}
          onPress={() => console.log('pressed')}
        >
          <Text fontFamily="body" fontWeight={700} color="white">
            Support
          </Text>
        </Pressable>
      </HStack>
      <Heading mt={4} my={3} size="md">
        Project Cycle
      </Heading>
      {layoutItems.map((item, i) => {
        if (i % 2 !== 0) {
          return null;
        }
        return (
          <HStack
            key={`${item.title}-${item.id}`}
            mb={3}
            space="sm"
            justifyContent="space-between"
          >
            <SmallCard
              onPress={() => console.log('navigate!')}
              id={layoutItems[i]?.id}
              title={layoutItems[i]?.title}
            />
            <SmallCard
              onPress={() => console.log('navigate!')}
              id={layoutItems[i + 1]?.id}
              title={layoutItems[i + 1]?.title}
            />
          </HStack>
        );
      })}
    </ScrollView>
  );
}

export default InvestmentCycle;
