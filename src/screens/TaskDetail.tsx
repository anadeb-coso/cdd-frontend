import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  ScrollView,
  Stack,
  Text,
  Modal,
  Input,
  FormControl,
  Button,
  VStack,
} from 'native-base';

import { TouchableOpacity, View, Image } from 'react-native';
import { Layout } from '../components/common/Layout';
import LocalDatabase from '../utils/databaseManager';

function TaskDetail({ route }) {
  const task = route.params?.task;
  const [tasks, setTasks] = useState([]);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showToProgressModal, setShowToProgressModal] = useState(false);

  const updateTask = () => {
    // eslint-disable-next-line no-underscore-dangle
    LocalDatabase.upsert(task._id, function (doc) {
      doc = task;
      return doc;
    })
      .then(function (res) {
        setShowCompleteModal(false);
        setShowToProgressModal(false);
      })
      .catch(function (err) {
        console.log('Error', err);
        // error
      });
  };

  return (
    <Layout disablePadding>
      <ScrollView _contentContainerStyle={{ pt: 7, px: 5, flexGrow: 1, pb: 7 }}>
        <Stack px="5">
          <Heading my={3} fontWeight="bold" size="sm">
            {task.name}
          </Heading>

          <Text fontSize="sm" color="gray.600">
            {task.description}
          </Text>
        </Stack>

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
        <Modal
          isOpen={showCompleteModal}
          onClose={() => setShowCompleteModal(false)}
          size="lg"
        >
          <Modal.Content maxWidth="400px">
            <Modal.Header>
              Souhaitez-vous marquer cette tâche comme terminée ?
            </Modal.Header>

            <Modal.Body>
              <VStack space="sm">
                <Button
                  rounded="xl"
                  onPress={() => {
                    task.completed = true;
                    updateTask();
                  }}
                >
                  OUI, MARQUÉE COMME TERMINÉE
                </Button>
                <Button
                  variant="ghost"
                  colorScheme="blueGray"
                  onPress={() => {
                    setShowCompleteModal(false);
                  }}
                >
                  Annuler
                </Button>
              </VStack>
            </Modal.Body>
          </Modal.Content>
        </Modal>
        <Modal
          isOpen={showToProgressModal}
          onClose={() => setShowToProgressModal(false)}
          size="lg"
        >
          <Modal.Content maxWidth="400px">
            <Modal.Header>
              Voulez-vous marquer cette tâche comme étant en cours ?
            </Modal.Header>

            <Modal.Body>
              <VStack space="sm">
                <Button
                  rounded="xl"
                  onPress={() => {
                    task.completed = false;
                    updateTask();
                  }}
                >
                  OUI, MARQUÉE COMME EN COURS
                </Button>
                <Button
                  variant="ghost"
                  colorScheme="blueGray"
                  onPress={() => {
                    setShowToProgressModal(false);
                  }}
                >
                  Annuler
                </Button>
              </VStack>
            </Modal.Body>
          </Modal.Content>
        </Modal>
        <TouchableOpacity
          onPress={() => {
            if (task.completed) {
              setShowToProgressModal(true);
            } else {
              setShowCompleteModal(true);
            }
          }}
          style={{ flexDirection: 'row', justifyContent: 'center' }}
        >
          <Box
            py={3}
            px={8}
            mt={6}
            bg={task.completed ? 'yellow.500' : 'primary.500'}
            rounded="xl"
            borderWidth={1}
            borderColor={task.completed ? 'yellow.500' : 'primary.500'}
            justifyContent="center"
            alignItems="center"
          >
            <Text fontWeight="bold" fontSize="xs" color="white">
              {task.completed
                ? 'MARQUÉE COMME EN COURS'
                : 'MARQUÉE COMME TERMINÉE'}
            </Text>
          </Box>
        </TouchableOpacity>
      </ScrollView>
    </Layout>
  );
}

export default TaskDetail;
