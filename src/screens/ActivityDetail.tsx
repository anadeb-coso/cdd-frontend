import React, { useEffect, useState } from 'react';
import { Box, Heading, Progress, ScrollView, Text } from 'native-base';
import { TouchableOpacity, View, ImageBackground } from 'react-native';
import { Layout } from '../components/common/Layout';
import LocalDatabase from '../utils/databaseManager';

function ActivityDetail({ route }) {
  const activity = route.params?.activity;
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    LocalDatabase.find({
      // eslint-disable-next-line no-underscore-dangle
      selector: { type: 'task', activity_id: activity._id },
    })
      .then(result => {
        console.log(result);
        const activitiesResult = result?.docs ?? [];
        setTasks(activitiesResult);
      })
      .catch(err => {
        console.log(err);
        return [];
      });
  }, []);

  const TaskRow = task => (
    <TouchableOpacity
    // onPress={() => navigation.navigate('ActivityDetail', { activity })}
    >
      <Box rounded="lg" p={3} mt={3} bg="white" shadow={1}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row' }}>
            <Box rounded="lg" bg="gray.200" p={2}>
              <Heading px="1" size="md">
                {task.order}
              </Heading>
            </Box>
            <Text ml={3} fontWeight="bold" fontSize="xs" color="gray.500">
              {task.name}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Box
            px={3}
            mt={3}
            bg="primary.500"
            rounded="xl"
            justifyContent="center"
            alignItems="center"
          >
            <Text fontWeight="bold" fontSize="2xs" color="white">
              Completed
            </Text>
          </Box>
          <Text>Arrow icon</Text>
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
              value={45}
              mr="4"
            >
              45%
            </Progress>
          </Box>

          <Heading my={3} fontWeight="bold" size="sm">
            {activity.name}
          </Heading>

          <Text fontSize="sm" color="gray.600">
            {activity.description}
          </Text>
        </Box>
        <ImageBackground
          style={{ height: 100, width: '100%', borderRadius: 20 }}
          source={require('../../assets/backgrounds/horizontal-blue.png')}
        >
          <Box
            rounded="lg"
            p={3}
            mt={3}
            flexDirection="row"
            justifyContent="space-between"
            bg="transparent"
            shadow={1}
          >
            <View>
              <Heading fontWeight="bold" size="sm" color="white">
                Supporting Materials
              </Heading>
              <Text fontSize="sm" color="white">
                Click to view
              </Text>
            </View>
            <Box rounded="lg" px={7} backgroundColor="rgba(2,3,6,0.3)">

            <Text fontWeight="bold" fontSize="8" color="white">
                Viewed
              </Text>
              <Heading fontWeight="bold" size="sm" color="white">
                0/5
              </Heading>
            </Box>
          </Box>
        </ImageBackground>
        <Heading my={3} fontWeight="bold" size="sm">
          This activity has {tasks.length} tasks
        </Heading>

        {tasks.map((task, i) => TaskRow(task))}
      </ScrollView>
    </Layout>
  );
}

export default ActivityDetail;
