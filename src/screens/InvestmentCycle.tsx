import React from 'react';
import { Heading, HStack, Pressable, ScrollView, Text } from 'native-base';
import SmallCard from 'components/SmallCard';
import { Layout } from '../components/common/Layout';

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
    <Layout disablePadding>
      <ScrollView _contentContainerStyle={{ pt: 7, px: 5 }}>
        <HStack mb={3} space="5" justifyContent="space-between">
          <Pressable
            p={3}
            h="16"
            flex={1}
            bg="primary.500"
            rounded="xl"
            shadow={3}
            onPress={() => console.log('pressed')}
          >
            <Text
              fontSize={16}
              fontFamily="body"
              fontWeight={700}
              color="white"
            >
              Diagnostics
            </Text>
          </Pressable>
          <Pressable
            p={3}
            h="16"
            flex={1}
            bg="primary.600"
            rounded="xl"
            shadow={3}
            onPress={() => console.log('pressed')}
          >
            <Text
              fontSize={16}
              fontFamily="body"
              fontWeight={700}
              color="white"
            >
              Support
            </Text>
          </Pressable>
        </HStack>
        <Heading fontSize={24} mt={4} my={3} size="md">
          Project Cycle
        </Heading>
        {layoutItems.map((item, i) => {
          if (i % 2 !== 0) {
            return null;
          }
          return (
            <HStack
              key={`${item.title}-${item.id}`}
              mb={5}
              space="5"
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
    </Layout>
  );
}

export default InvestmentCycle;
