import React, { useEffect, useState } from 'react';
import { Heading, HStack, Pressable, ScrollView, Text } from 'native-base';
import SmallCard from 'components/SmallCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Layout } from '../components/common/Layout';
import LocalDatabase from '../utils/databaseManager';
import { PrivateStackParamList } from '../types/navigation';

const colors = ['primary.600', 'orange', 'lightblue', 'purple']

function VillageDetail({ route }) {
  const navigation =
    useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();

  const village = route.params?.village;

  const [phases, setPhases] = useState([]);

  useEffect(() => {
    LocalDatabase.find({
      selector: { type: 'phase', administrative_level_id: village.id },
    })
      .then(result => {
        const phasesResult = result?.docs ?? [];
        setPhases(phasesResult);
      })
      .catch(err => {
        console.log(err);
        return [];
      });
  }, []);

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
        {/* TODO: Change to FlatList */}
        {phases.map((item, i) => {
          <Text>{JSON.stringify(item)}</Text>;
          if (i % 2 !== 0) {
            return null;
          }
          return (
            <HStack
              key={`${item.name}-${item.order}`}
              mb={5}
              space="5"
              justifyContent="space-between"
            >
              <SmallCard
                onPress={() =>
                  navigation.navigate('PhaseDetail', { phase: phases[i] })
                }
                id={phases[i]?.order}
                title={phases[i]?.name}
              />
              <SmallCard
                onPress={() =>
                  navigation.navigate('PhaseDetail', { phase: phases[i + 1] })
                }
                id={phases[i + 1]?.order}
                title={phases[i + 1]?.name}
                bg={phases[i + 1] ? 'orange' : 'transparent'}
              />
            </HStack>
          );
        })}
      </ScrollView>
    </Layout>
  );
}

export default VillageDetail;
