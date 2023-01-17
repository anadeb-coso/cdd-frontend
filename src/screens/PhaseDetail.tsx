import React, { useEffect, useState } from 'react';
import { Box, Divider, Heading, Progress, ScrollView, Text } from 'native-base';
import { Image, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Layout } from '../components/common/Layout';
import LocalDatabase from '../utils/databaseManager';
import { PrivateStackParamList } from '../types/navigation';

function PhaseDetail({ route }) {
  const phase = route.params?.phase ?? {};
  const [activities, setActivities] = useState([]);
  const [nbrCompletedTasks, setNbrCompletedTasks] = useState(0);
  const [totalTasksActivities, setTotalTasksActivities] = useState(0);
  const navigation =
    useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();

  useEffect(() => {
    LocalDatabase.find({
      // eslint-disable-next-line no-underscore-dangle
      selector: { type: 'activity', phase_id: phase._id },
    })
      .then(async (result: any) => {
        const activitiesResult = result?.docs ?? [];

        //sort the activies by order
        activitiesResult.sort(function(a: any, b: any) {
          var keyA = a.order ?? 0,
            keyB = b.order ?? 0;
          // Compare the 2 values
          if (keyA < keyB) return -1;
          if (keyA > keyB) return 1;
          return 0;
        });

        //Search the total of the tasks completed
        let total_tasks_completed = 0;


        let ids_activities = [];
        activitiesResult.forEach((elt_activity: any, activity_index: number) => {
          ids_activities.push(elt_activity._id);
        });
        
        await LocalDatabase.find({
          selector: { type: 'task', activity_id: {$in: ids_activities} },
        })
          .then((result_tasks: any) => {
            const tasksResults = result_tasks?.docs ?? [];
            
            const _completedTasks = tasksResults.filter(i => i.completed).length;
            total_tasks_completed += _completedTasks;
            setNbrCompletedTasks(total_tasks_completed);

            //Put variable "completed" to true if all tasks are completed and false if not
            let _activities_tasks = [];
            let _activities_tasks_completed_length = 0;
            activitiesResult.forEach((elt_activity: any, activity_index: number) => {
              _activities_tasks = tasksResults.filter((elt: any) => elt.activity_id === elt_activity._id);
              _activities_tasks_completed_length = _activities_tasks.filter((_i: any) => _i.completed).length;
              if(_activities_tasks.length != 0 && _activities_tasks_completed_length == _activities_tasks.length){
                activitiesResult[activity_index].completed = true;
              }else{
                activitiesResult[activity_index].completed = false;
              }
            });
            

            setActivities(activitiesResult);

          })
          .catch((err: any) => {
            console.log(err);
            return [];
          });

        
        
        //Total tasks of the activities
        let total_tasks = 0;
        activitiesResult.forEach((elt_activity: any) => {
          total_tasks += elt_activity.total_tasks
          setTotalTasksActivities(total_tasks);
        });
        

      })
      .catch(err => {
        console.log(err);
        return [];
      });
  }, []);

  const goToSupportingMaterials = () => {
    const title = `${phase.order}-${phase.name}`;
    navigation.navigate('SupportingMaterials', {
      materials: phase.capacity_attachments,
      title,
    });
  };

  const ActivityRow = activity => (
    <TouchableOpacity
      key={activity.order ?? activity._id}
      onPress={() => navigation.navigate('ActivityDetail', { activity })}
    >
      <Box rounded="lg" p={3} mt={3} bg="white" shadow={1}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row' }}>
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
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Box
            px={3}
            mt={3}
            bg={activity.completed ? 'primary.500' : 'gray.200'}
            rounded="xl"
            justifyContent="center"
            alignItems="center"
          >
            <Text fontWeight="bold" fontSize="2xs" color="white">
              {activity.completed ? 'Achevée' : 'Non démarré'}
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

  return (
    <Layout disablePadding>
      <ScrollView _contentContainerStyle={{ pt: 7, px: 5 }}>
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
              value={(totalTasksActivities != 0 ? ((nbrCompletedTasks / totalTasksActivities) * 100) : 0).toFixed(2)}
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
                Matériel de soutien
              </Heading>
              <Text fontSize="sm" color="white">
                Cliquez pour voir
              </Text>
            </View>
          </Box>
        </TouchableOpacity>

        <Heading my={3} fontWeight="bold" size="sm">
          {activities.length} étapes dans cette phase{' '}
        </Heading>
        {activities.map((activity, i) => ActivityRow(activity))}
      </ScrollView>
    </Layout>
  );
}

export default PhaseDetail;
