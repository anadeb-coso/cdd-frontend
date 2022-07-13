import React, { useEffect, useState } from 'react';
import { Box, Divider, Progress, ScrollView, Text } from 'native-base';
import { View } from 'react-native';
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
    <View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flexDirection: 'row' }}>
          <Text>{task.order}-</Text>
          <Text>{task.name}</Text>
        </View>
        <View>
          <Text>3/7</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Text>Started</Text>
        </View>
        <Text>Arrow icon</Text>
      </View>
    </View>
  );

  return (
    <Layout disablePadding>
      <ScrollView _contentContainerStyle={{ pt: 7, px: 5 }}>
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
        <View style={{ flexDirection: 'row' }}>
          <Text>{activity.order}-</Text>
          <Text>{activity.name}</Text>
        </View>
        <Text>{activity.description}</Text>
        <View
          style={{
            padding: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <View>
            <Text>Supporting Materials</Text>
            <Text>Click to view</Text>
          </View>
          <View>
            <Text>Viewed 0/5</Text>
          </View>
        </View>
        <Divider />
        <Text style={{fontFamily: "Poppins_Bold", fontWeight: "bold"}}>This activity has {tasks.length} tasks</Text>

        {tasks.map((task, i) => TaskRow(task))}
      </ScrollView>
    </Layout>
  );
}

export default ActivityDetail;
