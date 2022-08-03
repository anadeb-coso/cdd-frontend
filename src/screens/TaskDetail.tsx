import React, { useEffect, useState } from 'react';
import { Box, Heading, Progress, ScrollView, Text } from 'native-base';
import { TouchableOpacity, View, ImageBackground } from 'react-native';
import { Layout } from '../components/common/Layout';
import LocalDatabase from '../utils/databaseManager';

function TaskDetail({ route }) {
  const task = route.params?.task;
  const [tasks, setTasks] = useState([]);

  return (
    <Layout disablePadding>
      <ScrollView _contentContainerStyle={{ pt: 7, px: 5, flexGrow: 1 }}>
        <Box
          // maxW="80"
          rounded="lg"
          p={3}
          flex={1}
          justifyContent={'space-between'}
          // overflow="hidden"
          bg="white"
          // borderWidth="1"
          shadow={1}
        >
          <Heading my={3} fontWeight="bold" size="sm">
            {task.name}
          </Heading>

          <Text fontSize="sm" color="gray.600">
            {task.description}
          </Text>
        </Box>

        <TouchableOpacity
          style={{ flexDirection: 'row', justifyContent: 'center' }}
        >
          <Box
            py={3}
            px={6}
            mt={6}
            bg="transparent"
            rounded="xl"
            borderWidth={1}
            borderColor="primary.500"
            justifyContent="center"
            alignItems="center"
          >
            <Text fontWeight="bold" fontSize="2xs" color="primary.500">
              Complete
            </Text>
          </Box>
        </TouchableOpacity>
      </ScrollView>
    </Layout>
  );
}

export default TaskDetail;
