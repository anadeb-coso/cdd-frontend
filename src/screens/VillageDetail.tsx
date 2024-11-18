import React, { useEffect, useState } from 'react';
import { Heading, HStack, Pressable, ScrollView, Text } from 'native-base';
import SmallCard from 'components/SmallCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Layout } from '../components/common/Layout';
// import LocalDatabase from '../utils/databaseManager';
import { getDocumentsByAttributes } from '../utils/coucdb_call';
import { PrivateStackParamList } from '../types/navigation';
import { handleStorageError } from '../utils/pouchdb_call';

const colors = ['primary.600', 'orange', 'lightblue', 'purple'];

function VillageDetail({ route }) {
  const navigation =
    useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();

  const village = route.params?.village;
  const progess_percent = route.params?.progess_percent;
  const facilitator = route.params?.facilitator;
  const tasks_invalidated = route.params?.tasks_invalidated ?? [];
  const [phases, setPhases] = useState([]);

  useEffect(() => {
    try {
      // LocalDatabase.find({
      //   selector: { type: 'phase', administrative_level_id: village.id },
      // })
      getDocumentsByAttributes({ type: 'phase', administrative_level_id: village.id })
        .then(result => {
          const phasesResult = result?.docs ?? [];

          //sort the phases by order
          phasesResult.sort(function (a: any, b: any) {
            var keyA = a.order ?? 0,
              keyB = b.order ?? 0;
            // Compare the 2 values
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
          });

          setPhases(phasesResult);
        })
        .catch(err => {
          handleStorageError(err);
          console.log(err);
          return [];
        });
    } catch (error) {
      handleStorageError(error);
    }
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
              // fontFamily="body"
              fontWeight={700}
              color="white"
            >
              Diagnostic
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
              // fontFamily="body"
              fontWeight={700}
              color="white"
            >
              Soutien
            </Text>
          </Pressable>
        </HStack>
        <Heading fontSize={24} mt={4} my={3} size="md">
          Cycle du projet {progess_percent && <Text fontSize={12}>({progess_percent})</Text>}
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
                  navigation.navigate('PhaseDetail', { phase: phases[i], cvd_name: route.params?.cvd_name, facilitator: facilitator })
                }
                id={phases[i]?.order}
                title={phases[i]?.name}
                tasks_number_validated={tasks_invalidated.filter((t_i: any) => (t_i.phase_id == phases[i]?._id || t_i.phase_name == phases[i]?.name)).length}
              />
              <SmallCard
                onPress={() =>
                  navigation.navigate('PhaseDetail', { phase: phases[i + 1], cvd_name: route.params?.cvd_name, facilitator: facilitator })
                }
                id={phases[i + 1]?.order}
                title={phases[i + 1]?.name}
                tasks_number_validated={tasks_invalidated.filter((t_i: any) => (t_i.phase_id == phases[i + 1]?._id || t_i.phase_name == phases[i + 1]?.name)).length}
                bg={
                  phases[i + 1]
                    ? require('../../assets/backgrounds/orange-cube.png')
                    : 'transparent'
                }
              />
            </HStack>
          );
        })}
      </ScrollView>
    </Layout>
  );
}

export default VillageDetail;
