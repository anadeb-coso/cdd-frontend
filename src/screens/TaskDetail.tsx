import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  Box,
  Heading,
  ScrollView,
  Stack,
  Text,
  Modal,
  Button,
  VStack,
  Divider,
  useToast,
  HStack,
} from 'native-base';

import { TouchableOpacity, View, Image, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

import { FontAwesome5 } from '@expo/vector-icons';
import { ImageInfo, ImagePickerCancelledResult } from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Layout } from '../components/common/Layout';
import LocalDatabase from '../utils/databaseManager';

import CustomDropDownPicker from '../components/common/CustomDropdownPicker';
import AuthContext from '../contexts/auth';
import { PrivateStackParamList } from '../types/navigation';

const attachmentTypes = [
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
];

const t = require('tcomb-form-native');

t.form.Form.stylesheet.button.backgroundColor = '#24c38b';
t.form.Form.stylesheet.controlLabel.normal.color = '#707070';
const transform = require('tcomb-json-schema');

const { Form } = t.form;
let options = {}; // optional rendering options (see documentation)

function AttachmentInput(props: {
  onPressGallery: () => Promise<void>;
  onPressTakePicture: () => Promise<void>;
  task: any;
  truncateFileName: any;
}) {
  return (
    <Stack mb={5}>
      <Stack backgroundColor="gray.300" flex={1} borderRadius={10}>
        <Button
          alignSelf="flex-start"
          backgroundColor="gray.300"
          onPress={props.onPressTakePicture}
        >
          Take Picture
        </Button>
        <Divider backgroundColor="gray.50" />

        <Button
          alignSelf="flex-start"
          backgroundColor="gray.300"
          labelStyle={{ color: 'white', fontFamily: 'Poppins_500Medium' }}
          mode="contained"
          onPress={props.onPressGallery}
          uppercase={false}
        >
          Select from gallery
        </Button>
        <Divider backgroundColor="gray.50" />
      </Stack>
      <Text color="primary.500">
        {props.task.attachments[1]?.name != ''
          ? props.truncateFileName
          : 'No file selected'}
      </Text>
    </Stack>
  );
}

function TaskDetail({ route }) {
  const { user } = useContext(AuthContext);
  const { task, onTaskComplete, currentPage } = route.params;
  const navigation =
    useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
  const toast = useToast();
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
  if (task.form && task.form[currentPage]?.options) {
    options = task.form[currentPage]?.options;
  }
  // console.log('TASK: ', task);
  // console.log('TASK FORM: ', task.form);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showToProgressModal, setShowToProgressModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  let TcombType = {};
  if (task.form && task.form.length > currentPage) {
    TcombType = transform(task.form[currentPage]?.page);
  }

  const refForm = useRef(null);

  const uploadImages = async () => {
    setIsSyncing(true);
    try {
      for (let i = 0; i < 3; i++) {
        const response = await FileSystem.uploadAsync(
          `https://cddanadeb.e3grm.org/attachments/upload-to-issue`,
          task.attachments[i]?.attachment.uri,
          {
            fieldName: 'file',
            httpMethod: 'POST',
            uploadType: FileSystem.FileSystemUploadType.MULTIPART,
            parameters: user,
          },
        );
        console.log(JSON.stringify(response, null, 4));
        setIsSyncing(false);
      }
    } catch (e) {
      setIsSyncing(false);
      toast.show({
        description: 'Veuillez ajouter toutes les pièces jointes.',
      });
      console.log(e);
    }
  };

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

  const insertTaskToLocalDb = () => {
    // eslint-disable-next-line no-underscore-dangle
    LocalDatabase.upsert(task._id, function (doc) {
      doc = task;
      return doc;
    })
      .then(function (res) {
        setShowCompleteModal(false);
        setShowToProgressModal(false);
        setRefreshFlag(!refreshFlag);
        onTaskComplete();
      })
      .catch(function (err) {
        console.log('Error', err);
        // error
      });
  };

  async function insertAttachmentInTask(
    result: ImagePickerCancelledResult | ImageInfo,
    order,
  ) {
    const localUri = result.uri;
    const filename = localUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    const manipResult = await ImageManipulator.manipulateAsync(
      localUri,
      [{ resize: { width: 1000, height: 1000 } }],
      { compress: 1, format: ImageManipulator.SaveFormat.PNG },
    );
    const updatedAttachments = [...task.attachments];
    updatedAttachments[order] = {
      ...updatedAttachments[order],
      attachment: manipResult,
      name: filename,
      type,
      order,
    };
    task.attachments = updatedAttachments;
    insertTaskToLocalDb();
  }

  const openCamera = async order => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.cancelled) {
      await insertAttachmentInTask(result, order);
    }
  };

  const pickImage = async order => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.cancelled) {
      await insertAttachmentInTask(result, order);
    }
  };

  const increaseDropDownCount = () => {
    if (dropdownCount < 3) {
      setDropDownCount(dropdownCount + 1);
    }
  };

  const onChangeStatus = (value, order) => {
    const updatedAttachments = [...task.attachments];
    updatedAttachments[order] = {
      ...updatedAttachments[order],
      type: value,
      order,
    };
    task.attachments = updatedAttachments;
    insertTaskToLocalDb();
  };

  const onBackPress = () => {
    navigation.pop();
  };

  const onPress = () => {
    if (task.form?.length === currentPage) {
      const value = refForm?.current?.getValue();

      // test de validacion
      console.log('Resultado de la validacion: ', refForm?.current?.validate());

      if (value) {
        // if validation fails, value will be null
        task.saved_form = value;
        insertTaskToLocalDb();
        console.log('SAVED RESULT: ', value); // value here is an instance of Person
      }
    } else {
      navigation.push('TaskDetail', {
        task,
        currentPage: currentPage + 1,
        onTaskComplete: () => onTaskComplete(),
      });
    }
  };

  const truncateFileName = filename => {
    return filename?.length > 10 ? `${filename.substring(0, 12)}...` : filename;
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
        {task.form?.length > currentPage ? (
          <>
            <Form ref={refForm} type={TcombType} options={options} />
            <HStack space="md">
              <Button
                flex={1}
                onPress={onBackPress}
                underlayColor="#99d9f4"
                backgroundColor="gray.300"
              >
                Back
              </Button>
              <Button flex={1} onPress={onPress} underlayColor="#99d9f4">
                Next
              </Button>
            </HStack>
          </>
        ) : (
          <>
            <CustomDropDownPicker
              items={attachmentTypes}
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
                <FontAwesome5
                  name="chevron-circle-up"
                  size={12}
                  color="#24c38b"
                />
              )}
            />
            <AttachmentInput
              onPressGallery={() => pickImage(0)}
              onPressTakePicture={() => openCamera(0)}
              task={task}
              truncateFileName={truncateFileName(task.attachments[0]?.name)}
            />
            {dropdownCount > 0 && (
              <View>
                <CustomDropDownPicker
                  items={attachmentTypes}
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

                <AttachmentInput
                  onPressGallery={() => pickImage(1)}
                  onPressTakePicture={() => openCamera(1)}
                  task={task}
                  truncateFileName={truncateFileName(task.attachments[1]?.name)}
                />
              </View>
            )}
            {dropdownCount > 1 && (
              <View>
                <CustomDropDownPicker
                  items={attachmentTypes}
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
                <AttachmentInput
                  onPressGallery={() => pickImage(2)}
                  onPressTakePicture={() => openCamera(2)}
                  task={task}
                  truncateFileName={truncateFileName(task.attachments[2]?.name)}
                />
              </View>
            )}

            <Button.Group
              isAttached
              colorScheme="primary"
              mx={{
                base: 'auto',
                md: 0,
              }}
              size="sm"
            >
              <Button onPress={increaseDropDownCount} variant="outline">
                Add Field
              </Button>
              <Button
                onPress={uploadImages}
                isLoading={isSyncing}
                isLoadingText="Syncing"
              >
                Sync
              </Button>
              <Button onPress={onPress} underlayColor="#99d9f4">
                Save
              </Button>
            </Button.Group>
          </>
        )}

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
                    insertTaskToLocalDb();
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
                    insertTaskToLocalDb();
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
        {task.form?.length > currentPage ? null : (
          <>
            <Button
              flex={1}
              mt={4}
              onPress={onBackPress}
              underlayColor="#99d9f4"
              backgroundColor="gray.300"
            >
              Back
            </Button>
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
          </>
        )}
      </ScrollView>
    </Layout>
  );
}

export default TaskDetail;
