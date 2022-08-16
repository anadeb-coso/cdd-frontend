import React, { useEffect, useState } from 'react';
import { Box, Heading, Progress, ScrollView, Text } from 'native-base';
import { TouchableOpacity, View, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Layout } from '../components/common/Layout';
import LocalDatabase from '../utils/databaseManager';
import { PrivateStackParamList } from '../types/navigation';

function ActivityDetail({ route }) {
  const activity = route.params?.activity;
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState(0);
  const navigation =
    useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
  const fetchTasks = () => {
    LocalDatabase.find({
      // eslint-disable-next-line no-underscore-dangle
      selector: { type: 'task', activity_id: activity._id },
    })
      .then(result => {
        const tasksResults = result?.docs ?? [];
        const _completedTasks = tasksResults.filter(i => i.completed).length;
        setCompletedTasks(_completedTasks);
        setTasks(tasksResults);
      })
      .catch(err => {
        console.log(err);
        return [];
      });
  };

  const updateActivity = () => {
    // eslint-disable-next-line no-underscore-dangle
    activity.completed_tasks = completedTasks;
    LocalDatabase.upsert(activity._id, function (doc) {
      doc = activity;
      return doc;
    })
      .then(function (res) {
        console.log('###############', res);
      })
      .catch(function (err) {
        console.log('Error', err);
        // error
      });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    updateActivity();
  }, [completedTasks]);

  const TaskRow = task => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('TaskDetail', {
          task,
          onTaskComplete: () => fetchTasks(),
        })
      }
    >
      <Box rounded="lg" p={3} mt={3} bg="white" shadow={1}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row' }}>
            <Box rounded="lg" bg="gray.200" p={2}>
              <Heading px="1" size="md">
                {task.order}
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
              {task.name}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Box
            px={3}
            mt={3}
            bg={task.completed ? 'primary.500' : 'gray.200'}
            rounded="xl"
            justifyContent="center"
            alignItems="center"
          >
            <Text fontWeight="bold" fontSize="2xs" color="white">
              {task.completed ? 'Completed' : 'Not Started'}
            </Text>
          </Box>
          <Text>[Icon]</Text>
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
              value={(completedTasks / activity.total_tasks) * 100}
              mr="4"
            >
              {`${(completedTasks / activity.total_tasks) * 100}%`}
            </Progress>
          </Box>

          <Heading my={3} fontWeight="bold" size="sm">
            {activity.name}
          </Heading>

          <Text fontSize="sm" color="gray.600">
            {activity.description}
          </Text>
        </Box>
        <View style={{ flex: 1 }}>
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
            <Box
              justifyContent="center"
              alignItems="center"
              flex={1}
              rounded="lg"
              backgroundColor="rgba(2,3,6,0.3)"
            >
              <Text fontWeight="bold" fontSize="8" color="white">
                Vu sur
              </Text>
              <Heading fontWeight="bold" size="sm" color="white">
                0/5
              </Heading>
            </Box>
          </Box>
        </View>
        <Heading my={3} fontWeight="bold" size="sm">
          Cette activité comporte {tasks.length} tâches
        </Heading>

        {tasks.map((task, i) => TaskRow(task))}
      </ScrollView>
    </Layout>
  );
}

export default ActivityDetail;
