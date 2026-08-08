import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

function VillageDetail({ route }: {route: any}) {
  const { t } = useTranslation('core');
  const navigation =
    useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();

  const village = route.params?.village;
  const progess_percent = route.params?.progess_percent;
  const facilitator = route.params?.facilitator;
  // const tasks_invalidated = route.params?.tasks_invalidated ?? [];
  const tasks_stats = route.params?.tasks_stats ?? {};
  const project = route.params?.project;
  const [phases, setPhases]: any = useState([]);

  useEffect(() => {
    try {
      // LocalDatabase.find({
      //   selector: { type: 'phase', administrative_level_id: village.id },
      // })
      getDocumentsByAttributes({ type: 'phase', administrative_level_id: village.id })
        .then((result: any) => {
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
        .catch((err: any) => {
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
              {t('village_detail.diagnostic_button')}
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
              {t('village_detail.support_button')}
            </Text>
          </Pressable>
        </HStack>
        <Heading 
        fontSize={24} 
        // mt={4} 
        my={2} 
        size="md" 
        >
          {(project?.cycles && project?.cycles.length != 0 && project?.cycles[0]?.description) ? project.cycles[0].description : t('village_detail.default_cycle_title')}
          {progess_percent && <Text fontSize={12}>({progess_percent})</Text>}
        </Heading>
        {/* TODO: Change to FlatList */}
        {phases.map((item: any, i: any) => {
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
                  navigation.navigate('PhaseDetail', { phase: phases[i], cvd_name: route.params?.cvd_name, facilitator: facilitator, project: project, tasks_stats: tasks_stats, phase_tasks_stats: tasks_stats[`phase_id_${phases[i]?._id}`] })
                }
                id={phases[i]?.order}
                title={phases[i]?.name}
                // tasks_number_validated={tasks_invalidated.filter((t_i: any) => (t_i.phase_id == phases[i]?._id || t_i.phase_name == phases[i]?.name)).length}
                tasks_number_invalidated={tasks_stats[`phase_id_${phases[i]?._id}`]?.invalid}
                tasks_number_invalidated_revised={tasks_stats[`phase_id_${phases[i]?._id}`]?.invalid_revised}
                tasks_number_remain={tasks_stats[`phase_id_${phases[i]?._id}`]?.total != 0 ? tasks_stats[`phase_id_${phases[i]?._id}`]?.total - tasks_stats[`phase_id_${phases[i]?._id}`]?.completed : 0}
              />
              <SmallCard
                onPress={() =>
                  navigation.navigate('PhaseDetail', { phase: phases[i + 1], cvd_name: route.params?.cvd_name, facilitator: facilitator, project: project, tasks_stats: tasks_stats, phase_tasks_stats: tasks_stats[`phase_id_${phases[i + 1]?._id}`] })
                }
                id={phases[i + 1]?.order}
                title={phases[i + 1]?.name}
                // tasks_number_invalidated={tasks_invalidated.filter((t_i: any) => (t_i.phase_id == phases[i + 1]?._id || t_i.phase_name == phases[i + 1]?.name)).length}
                tasks_number_invalidated={tasks_stats[`phase_id_${phases[i + 1]?._id}`]?.invalid}
                tasks_number_invalidated_revised={tasks_stats[`phase_id_${phases[i + 1]?._id}`]?.invalid_revised}
                tasks_number_remain={tasks_stats[`phase_id_${phases[i + 1]?._id}`]?.total != 0 ? tasks_stats[`phase_id_${phases[i + 1]?._id}`]?.total - tasks_stats[`phase_id_${phases[i + 1]?._id}`]?.completed : 0}
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
