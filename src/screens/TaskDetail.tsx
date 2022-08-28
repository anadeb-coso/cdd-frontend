import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Heading,
  ScrollView,
  Stack,
  Text,
  Modal,
  Button,
  VStack,
} from 'native-base';

// import entire SDK
// import AWS object without services
// import individual service

import fs from 'react-native-fs';
var S3 = require('aws-sdk/clients/s3');
import {
  TouchableOpacity,
  View,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

import { FontAwesome5 } from '@expo/vector-icons';
import moment from 'moment';
import { Layout } from '../components/common/Layout';
import LocalDatabase from '../utils/databaseManager';

import CustomDropDownPicker from '../components/common/CustomDropdownPicker';
import { decode } from 'base64-arraybuffer';

const screenWidth = Dimensions.get('window').width;

const t = require('tcomb-form-native');

const transform = require('tcomb-json-schema');

const { Form } = t.form;

const options = {}; // optional rendering options (see documentation)

function TaskDetail({ route }) {
  const { task, onTaskComplete } = route.params;
  const [dropdownCount, setDropDownCount] = useState(task.attachments?.length);
  const [attachmentType1, setAttachmentType1] = useState(
    task.attachments[0]?.type ? task.attachments[0]?.type : 'photos',
  );
  const [attachmentType2, setAttachmentType2] = useState(
    task.attachments[1]?.type ? task.attachments[1]?.type : 'photos',
  );
  const [attachmentType3, setAttachmentType3] = useState(
    task.attachments[2]?.type ? task.attachments[2]?.type : 'photos',
  );

  const [open, setOpen] = useState(false);

  // console.log('TASK: ', task);
  // console.log('TASK FORM: ', task.form);
  const TcombType =
    task.form && task.form !== null ? transform(task.form) : undefined;
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showToProgressModal, setShowToProgressModal] = useState(false);

  const refForm = useRef(null);



  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const openCamera = async order => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.cancelled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.localUri || result.uri,
        [{ resize: { width: 1000, height: 1000 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG },
      );
      const updatedAttachments = [...task.attachments];
      updatedAttachments[order] = {
        ...updatedAttachments[order],
        attachment: manipResult,
        order,
      };
      task.attachments = updatedAttachments;
    }
  };

  const pickImage = async order => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,

      quality: 1,
    });
    if (!result.cancelled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.localUri || result.uri,
        [{ resize: { width: 1000, height: 1000 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG },
      );
      console.log(manipResult)
      const updatedAttachments = [...task.attachments];
      updatedAttachments[order] = {
        ...updatedAttachments[order],
        attachment: manipResult,
        order,
      };
      task.attachments = updatedAttachments;
      updateTask();

    }
  };

  const increaseDropDownCount = () => {
    if (dropdownCount < 3) {
      setDropDownCount(dropdownCount + 1);
    }
  };

  const updateTask = () => {
    // eslint-disable-next-line no-underscore-dangle
    LocalDatabase.upsert(task._id, function (doc) {
      doc = task;
      return doc;
    })
      .then(function (res) {
        setShowCompleteModal(false);
        setShowToProgressModal(false);
        onTaskComplete();
      })
      .catch(function (err) {
        console.log('Error', err);
        // error
      });
  };

  const onChangeStatus = (value, order) => {
    const updatedAttachments = [...task.attachments];
    updatedAttachments[order] = {
      ...updatedAttachments[order],
      type: value,
      order,
    };
    task.attachments = updatedAttachments;
    updateTask();
  };

  const selectAttachment = () => {};

  const onPress = () => {
    const value = refForm?.current?.getValue();

    // test de validacion
    console.log('Resultado de la validacion: ', refForm?.current?.validate());

    if (value) {
      // if validation fails, value will be null
      task.saved_form = value;
      updateTask();
      console.log('SAVED RESULT: ', value); // value here is an instance of Person
    }
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

        <View>
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
        {TcombType && (
          <View>
            <Form ref={refForm} type={TcombType} options={options} />
            <Button onPress={onPress} underlayColor="#99d9f4">
              Save
            </Button>
          </View>
        )}
        <CustomDropDownPicker
          items={[
            {
              label: 'photos',
              value: 'photos',
            },
            {
              label: 'procès-verbaux',
              value: 'procès-verbaux',
            },
            {
              label: 'autre document',
              value: 'autre document',
            },
          ]}
          customDropdownWrapperStyle={{
            // flex: 1,
            marginHorizontal: 0,
            alignSelf: 'center',
          }}
          onChangeValue={value => onChangeStatus(value, 0)}
          open={open}
          value={attachmentType1}
          setOpen={setOpen}
          setPickerValue={newValue => setAttachmentType1(newValue)}
          ArrowDownIconComponent={() => (
            <FontAwesome5
              name="chevron-circle-down"
              size={12}
              color="#24c38b"
            />
          )}
          ArrowUpIconComponent={() => (
            <FontAwesome5 name="chevron-circle-up" size={12} color="#24c38b" />
          )}
        />
        <View style={{ flexDirection: 'row' }}>
          <Button
            style={{ alignSelf: 'center' }}
            labelStyle={{ color: 'white', fontFamily: 'Poppins_500Medium' }}
            mode="contained"
            // onPress={() => pickImage(0)}
            uppercase={false}
          >
            Gallery
          </Button>
        </View>
        {dropdownCount > 0 && (
          <View>
            <CustomDropDownPicker
              items={[
                {
                  label: 'Pas commencé',
                  value: 'not-started',
                  // hidden: true,
                },
                {
                  label: 'En cours',
                  value: 'in-progress',
                },
                {
                  label: 'Complété',
                  value: 'completed',
                },
              ]}
              customDropdownWrapperStyle={{
                // flex: 1,
                marginHorizontal: 0,
                alignSelf: 'center',
              }}
              onChangeValue={value => onChangeStatus(value, 1)}
              open={open}
              value={attachmentType2}
              setOpen={setOpen}
              setPickerValue={newValue => setAttachmentType2(newValue)}
              ArrowDownIconComponent={() => (
                <FontAwesome5
                  name="chevron-circle-down"
                  size={12}
                  color="#24c38b"
                />
              )}
              ArrowUpIconComponent={() => (
                <FontAwesome5
                  name="chevron-circle-up"
                  size={12}
                  color="#24c38b"
                />
              )}
            />
            <View style={{ flexDirection: 'row' }}>
              <Button
                style={{ alignSelf: 'center' }}
                labelStyle={{ color: 'white', fontFamily: 'Poppins_500Medium' }}
                mode="contained"
                // onPress={() => pickImage(1)}
                uppercase={false}
              >
                Gallery
              </Button>
            </View>
          </View>
        )}
        {dropdownCount > 1 && (
          <View>
            <CustomDropDownPicker
              items={[
                {
                  label: 'Pas commencé',
                  value: 'not-started',
                  // hidden: true,
                },
                {
                  label: 'En cours',
                  value: 'in-progress',
                },
                {
                  label: 'Complété',
                  value: 'completed',
                },
              ]}
              customDropdownWrapperStyle={{
                // flex: 1,
                marginHorizontal: 0,
                alignSelf: 'center',
              }}
              onChangeValue={value => onChangeStatus(value, 2)}
              open={open}
              value={attachmentType3}
              setOpen={setOpen}
              setPickerValue={newValue => setAttachmentType3(newValue)}
              ArrowDownIconComponent={() => (
                <FontAwesome5
                  name="chevron-circle-down"
                  size={12}
                  color="#24c38b"
                />
              )}
              ArrowUpIconComponent={() => (
                <FontAwesome5
                  name="chevron-circle-up"
                  size={12}
                  color="#24c38b"
                />
              )}
            />
            <View style={{ flexDirection: 'row' }}>
              <Button
                style={{ alignSelf: 'center' }}
                labelStyle={{ color: 'white', fontFamily: 'Poppins_500Medium' }}
                mode="contained"
                onPress={() => pickImage(2)}
                uppercase={false}
              >
                Gallery
              </Button>
              <Button icon="camera" onPress={() => openCamera(2)}>
                Camera
              </Button>
            </View>
          </View>
        )}
        <Button onPress={increaseDropDownCount} underlayColor="#99d9f4">
          Add
        </Button>
        <View style={{ flex: 1 }} />
        <Button onPress={increaseDropDownCount} underlayColor="#99d9f4">
          SYNC
        </Button>
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
