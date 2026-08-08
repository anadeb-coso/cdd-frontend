import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Divider, Heading, Progress, ScrollView, Text } from 'native-base';
import { Image, TouchableOpacity, View, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Layout } from '../components/common/Layout';
// import LocalDatabase from '../utils/databaseManager';
import { getDocumentsByAttributes } from '../utils/coucdb_call';
import { PrivateStackParamList } from '../types/navigation';
import { handleStorageError } from '../utils/pouchdb_call';

function PhaseDetail({ route }: {route: any}) {
  const { t } = useTranslation('core');
  const phase = route.params?.phase ?? {};
  const facilitator = route.params?.facilitator;
  const project = route.params?.project;
  const tasks_stats = route.params?.tasks_stats ?? {};
  const phase_tasks_stats = route.params?.phase_tasks_stats ?? {};
  const [activities, setActivities] = useState([]);
  const [nbrCompletedTasks, setNbrCompletedTasks] = useState(0);
  const [totalTasksActivities, setTotalTasksActivities] = useState(0);
  const navigation =
    useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivities = (refreshMode = false) => {
    setActivities([]);
    try {
      // LocalDatabase.find({
      //   // eslint-disable-next-line no-underscore-dangle
      //   selector: { type: 'activity', phase_id: phase._id },
      // })
      getDocumentsByAttributes({ type: 'activity', phase_id: phase._id })
        .then(async (result: any) => {
          const activitiesResult = result?.docs ?? [];

          //sort the activies by order
          activitiesResult.sort(function (a: any, b: any) {
            var keyA = a.order ?? 0,
              keyB = b.order ?? 0;
            // Compare the 2 values
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
          });

          if (refreshMode) {
            //Search the total of the tasks completed
            let total_tasks_completed = 0;


            let ids_activities: any = [];
            activitiesResult.forEach((elt_activity: any, activity_index: number) => {
              ids_activities.push(elt_activity._id);
            });

            try {
              // await LocalDatabase.find({
              //   selector: { type: 'task', activity_id: { $in: ids_activities } },
              // })
              getDocumentsByAttributes({ type: 'task', activity_id: { $in: ids_activities } })
                .then((result_tasks: any) => {
                  const tasksResults = result_tasks?.docs ?? [];

                  const _completedTasks = tasksResults.filter((i: any) => i.completed).length;
                  total_tasks_completed += _completedTasks;
                  setNbrCompletedTasks(total_tasks_completed);

                  //Put variable "completed" to true if all tasks are completed and false if not
                  let _activities_tasks = [];
                  let _activities_tasks_completed_length = 0;
                  activitiesResult.forEach((elt_activity: any, activity_index: number) => {
                    _activities_tasks = tasksResults.filter((elt: any) => elt.activity_id === elt_activity._id);
                    _activities_tasks_completed_length = _activities_tasks.filter((_i: any) => _i.completed).length;
                    if (_activities_tasks.length != 0 && _activities_tasks_completed_length == _activities_tasks.length) {
                      activitiesResult[activity_index].completed = true;
                    } else {
                      activitiesResult[activity_index].completed = false;
                    }
                    activitiesResult[activity_index].tasks_number_invalidated = _activities_tasks.filter((_i: any) => _i.validated == false).length;
                    activitiesResult[activity_index].tasks_number_invalidated_revised = _activities_tasks.filter((_i: any) => _i.validated == false && _i.updated_after_invalidation == true).length;
                    activitiesResult[activity_index].tasks_number_remain = _activities_tasks.length != 0 ? _activities_tasks.length - _activities_tasks_completed_length : 0;
                  });


                  setActivities(activitiesResult);

                })
                .catch((err: any) => {
                  handleStorageError(err);
                  console.log(err);
                  return [];
                });
            } catch (error) {
              handleStorageError(error);
            }


            //Total tasks of the activities
            let total_tasks = 0;
            activitiesResult.forEach((elt_activity: any) => {
              total_tasks += elt_activity.total_tasks
              setTotalTasksActivities(total_tasks);
            });
          } else {
            let activity_stats;
            setNbrCompletedTasks(phase_tasks_stats.completed);
            setTotalTasksActivities(phase_tasks_stats.total);
            activitiesResult.forEach((elt_activity: any, activity_index: number) => {
              activity_stats = tasks_stats[`activity_id_${elt_activity._id}`];
              if (activity_stats.total != 0 && activity_stats.completed == activity_stats.total) {
                activitiesResult[activity_index].completed = true;
              } else {
                activitiesResult[activity_index].completed = false;
              }
              activitiesResult[activity_index].tasks_number_invalidated = activity_stats.invalid;
              activitiesResult[activity_index].tasks_number_invalidated_revised = activity_stats.invalid_revised;
              activitiesResult[activity_index].tasks_number_remain = activity_stats.total != 0 ? activity_stats.total - activity_stats.completed : 0;

            });
            setActivities(activitiesResult);
          }

        })
        .catch((err: any) => {
          handleStorageError(err);
          console.log(err);
          return [];
        });
    } catch (error) {
      handleStorageError(error);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const goToSupportingMaterials = () => {
    const title = `${phase.order}-${phase.name}`;
    navigation.navigate('SupportingMaterials', {
      materials: phase.capacity_attachments,
      title,
    });
  };

  const ActivityRow = (activity: any) => (
    <TouchableOpacity
      key={`${activity.order}_${activity._id}`}
      onPress={() => navigation.navigate('ActivityDetail', { activity, cvd_name: route.params?.cvd_name, facilitator: facilitator, project: project })}
    >
      <Box rounded="lg" p={3} mt={3} bg="white" shadow={1}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', flex: 0.90 }}>
            <Box rounded="lg" bg="gray.200" p={2}>
              <Heading px="1" size="md">
                {activity.order}
              </Heading>
            </Box>
            <Text
              flexWrap="wrap"
              flexShrink={1}
              ml={3}
              mr={3}
              fontWeight="bold"
              fontSize="xs"
              color="gray.500"
            >
              {activity.name}
            </Text>
          </View>

          <View style={{ flex: 0.10, height: (activity?.tasks_number_invalidated && activity?.tasks_number_remain) ? 50 : (
            (activity?.tasks_number_invalidated || activity?.tasks_number_remain) ? 25 : 0
          ) }}>
            {activity?.tasks_number_invalidated ? <Text
              style={{
                backgroundColor: "red", borderRadius: 8, color: "white",
                textAlign: "center", height: 25, fontWeight: 'bold',
                flex: 1, fontSize: 10
              }}
            >{`${![0, null, undefined].includes(activity?.tasks_number_invalidated_revised) ? activity?.tasks_number_invalidated_revised + '/' : ''}`}{activity?.tasks_number_invalidated}</Text> : <></>}
            {activity?.tasks_number_remain ? <Text
              style={{
                backgroundColor: "orange", borderRadius: 8, color: "white",
                textAlign: "center", height: 25, fontWeight: 'bold',
                flex: 1, fontSize: 10
              }}
            >{activity?.tasks_number_remain}</Text> : <></>}
          </View>

        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Box
            px={3}
            mt={3}
            bg={activity.completed ? (activity?.tasks_number_invalidated ? 'yellow.500' : 'primary.500') : 'gray.200'}
            rounded="xl"
            justifyContent="center"
            alignItems="center"
          >
            <Text fontWeight="bold" fontSize="2xs" color="white">
              {activity.completed ? t('phase_detail.completed_status') : t('phase_detail.pending_status')}
            </Text>
          </Box>
          <Image
            resizeMode="contain"
            style={{ height: 20, width: 50, alignSelf: 'flex-end' }}
            source={require('../../assets/right_arrow.png')}
            alt="image"
          />
        </View>
      </Box>
    </TouchableOpacity>
  );


  const onRefresh = () => {
    setRefreshing(true);
    fetchActivities(true);
    setRefreshing(false);
  };

  return (
    <Layout disablePadding>
      <ScrollView _contentContainerStyle={{ pt: 7, px: 5 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <Box
          // maxW="80"
          rounded="lg"
          p={3}
          // overflow="hidden"
          bg="white"
          // borderWidth="1"
          shadow={1}
        >
          <Box w="70%" alignSelf="center">
            <Progress
              rounded={5}
              size="xl"
              _filledTrack={{
                rounded: 2,
                bg: 'primary.500',
              }}
              value={Number((totalTasksActivities != 0 ? ((nbrCompletedTasks / totalTasksActivities) * 100) : 0).toFixed(2))}
              mr="4"
            >
              <Text style={{ fontSize: 10, color: 'white' }}>
                {`${(totalTasksActivities != 0 ? ((nbrCompletedTasks / totalTasksActivities) * 100) : 0).toFixed(2)}%`}
              </Text>
            </Progress>
          </Box>

          <Heading my={3} fontWeight="bold" size="sm">
            {phase.order}-{phase.name}
          </Heading>

          <Text fontSize="sm" color="gray.600">
            {phase.description}
          </Text>
          {route.params?.cvd_name && <Text fontSize="sm" color="gray.600" marginTop={2} fontWeight="bold" >
            {t('phase_detail.cvd_label')}{route.params?.cvd_name}{project?.name ? ` - ${project?.name}` : ""}
          </Text>}
        </Box>
        <TouchableOpacity onPress={goToSupportingMaterials} style={{ flex: 1 }}>
          <Image
            resizeMode="stretch"
            style={{ height: 100, width: undefined }}
            source={require('../../assets/backgrounds/horizontal-blue.png')}
          />
          <Box
            top={7}
            position="absolute"
            px={7}
            rounded="lg"
            // p={3}
            // mt={3}
            flexDirection="row"
            justifyContent="space-evenly"
            bg="transparent"
          // shadow={1}
          >
            <View style={{ flex: 3 }}>
              <Heading fontWeight="bold" size="xs" color="white">
                {t('phase_detail.support_materials_title')}
              </Heading>
              <Text fontSize="sm" color="white">
                {t('phase_detail.click_to_view')}
              </Text>
            </View>
          </Box>
        </TouchableOpacity>

        <Heading my={3} fontWeight="bold" size="sm">
          {t('phase_detail.steps_in_phase_count', { count: activities.length })}
        </Heading>
        {activities.map((activity, i) => ActivityRow(activity))}
      </ScrollView>
    </Layout>
  );
}

export default PhaseDetail;
