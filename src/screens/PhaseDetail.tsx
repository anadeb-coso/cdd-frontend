import React, { useEffect, useState } from 'react';
import { Box, Divider, Progress, ScrollView, Text } from 'native-base';
import { TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Layout } from '../components/common/Layout';
import LocalDatabase from '../utils/databaseManager';
import { PrivateStackParamList } from '../types/navigation';

function PhaseDetail({ route }) {
  const phase = route.params?.phase;
  const [activities, setActivities] = useState([]);
  const navigation =
    useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
  useEffect(() => {
    LocalDatabase.find({
      // eslint-disable-next-line no-underscore-dangle
      selector: { type: 'activity', phase_id: phase._id },
    })
      .then(result => {
        console.log(result);
        const activitiesResult = result?.docs ?? [];
        setActivities(activitiesResult);
      })
      .catch(err => {
        console.log(err);
        return [];
      });
  }, []);

  const ActivityRow = activity => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ActivityDetail', { activity })}
    >
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flexDirection: 'row' }}>
          <Text>{activity.order}-</Text>
          <Text>{activity.name}</Text>
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
    </TouchableOpacity>
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
          <Text>{phase.order}-</Text>
          <Text>{phase.name}</Text>
        </View>
        <Text>{phase.description}</Text>
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
        <Text style={{ fontFamily: 'Poppins_Bold', fontWeight: 'bold' }}>
          {activities.length} activities on this phase{' '}
        </Text>

        {activities.map((activity, i) => ActivityRow(activity))}
      </ScrollView>
    </Layout>
  );
}

export default PhaseDetail;
