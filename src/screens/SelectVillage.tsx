import React from 'react';
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
} from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Layout } from '../components/common/Layout';
import { PressableCard } from '../components/common/PressableCard';
import { PrivateStackParamList } from '../types/navigation';

const villages = [
  {
    id: '1.',
    title: 'Village A',
    description: 'Region A, Canton A',
  },
  {
    id: '2.',
    title: 'Village B',
    description: 'Region A, Canton A',
  },
  {
    id: '3.',
    title: 'Village C',
    description: 'Region A, Canton A',
  },
  {
    id: '4.',
    title: 'Village D',
    description: 'Region A, Canton A',
  },
  {
    id: '5.',
    title: 'Village E',
    description: 'Region A, Canton A',
  },
  {
    id: '6.',
    title: 'Village F',
    description: 'Region A, Canton A',
  },
];

function SelectVillage() {
  const navigation =
    useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
  return (
    <Layout disablePadding>
      <FlatList
        flex={1}
        _contentContainerStyle={{ px: 3 }}
        data={villages}
        keyExtractor={(item, index) => `${item.title}_${index}`}
        renderItem={({ item, index }) => (
          <PressableCard bgColor="white" shadow="0" my={4}>
            <Text fontWeight={400} fontSize={20}>
              {item.title}
            </Text>
            <Heading mt={2} fontSize={16}>
              {item.description}
            </Heading>
            <HStack mt={5} alignItems="center">
              <Box w="70%">
                <Progress
                  rounded={5}
                  size="xl"
                  _filledTrack={{
                    rounded: 2,
                    bg: 'primary.500',
                  }}
                  value={45}
                  mr="4"
                >
                  45%
                </Progress>
              </Box>
              <Button
                bgColor="primary.500"
                onPress={() =>
                  navigation.navigate('InvestmentCycle', { title: item.title })
                }
                w="30%"
              >
                Open
              </Button>
            </HStack>
          </PressableCard>
        )}
      />
    </Layout>
  );
}

export default SelectVillage;
