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

// import Constants from 'expo-constants';
// import PDFReader from 'rn-pdf-reader-js'
import { Buffer } from "buffer";
import * as Sharing from "expo-sharing";
import { TouchableOpacity, View, Image, Platform, FlatList, SafeAreaView, Dimensions } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as DocumentPicker from 'expo-document-picker';

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
t.form.Form.stylesheet.pickerTouchable.normal.borderWidth = 1;
t.form.Form.stylesheet.controlLabel.normal.color = '#707070';
const transform = require('tcomb-json-schema');

const { Form } = t.form;
let options = {}; // optional rendering options (see documentation)

// function AttachmentInput(props: {
//   onPressGallery: () => Promise<void>;
//   onPressTakePicture: () => Promise<void>;
//   task: any;
//   truncateFileName: any;
// }) {
//   return (
//     <Stack mb={5}>
//       <Stack backgroundColor="gray.300" flex={1} borderRadius={10}>
//         <Button
//           alignSelf="flex-start"
//           backgroundColor="gray.300"
//           onPress={props.onPressTakePicture}
//         >
//           Prendre une photo
//         </Button>
//         <Divider backgroundColor="gray.50" />

//         <Button
//           alignSelf="flex-start"
//           backgroundColor="gray.300"
//           labelStyle={{ color: 'white', fontFamily: 'Poppins_500Medium' }}
//           mode="contained"
//           onPress={props.onPressGallery}
//           uppercase={false}
//         >
//           Choisir un élément
//         </Button>
//         <Divider backgroundColor="gray.50" />
//       </Stack>
//       <Text color="primary.500">
//         {props.task.attachments[1]?.name != ''
//           ? props.truncateFileName
//           : 'No file selected'}
//       </Text>
//     </Stack>
//   );
// }




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
  // // console.log('TASK: ', task);
  // // console.log('TASK FORM: ', task.form);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showToProgressModal, setShowToProgressModal] = useState(false);
  const [showToAddAttachModal, setShowToAddAttachModal] = useState(false);
  const [showToAddOrEditAttachModal, setShowToAddOrEditAttachModal] = useState(false);
  const [selectedAttachmentId, setSelectedAttachmentId] = useState(null);
  const [selectedAttachment, setSelectedAttachment] = useState({ result: null, order: null, name: null, type: null });
  const [attachmentLoaded, setAttachmentLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [initialValue, setInitialValue] = useState({});
  const [refreshFlag, setRefreshFlag] = useState(false);
  let TcombType = {};
  if (task.form && task.form.length > currentPage) {
    TcombType = transform(task.form[currentPage]?.page);
  }

  const refForm = useRef(null);

  const itemAttachments = ({ item }) => {

    return (

      <ItemAttachment
        item={item}
        onPress={() => {
          setSelectedAttachment({ result: item.attachment, order: item.order, name: item.name, type: item.type });
          setAttachmentLoaded(true);
        }}
      />
    );
  };

  function AttachmentInput(props: {
    onPressGallery: () => Promise<void>;
    onPressTakePicture: () => Promise<void>;
    task: any;
    // truncateFileName: any;
  }) {
    return (
      <>
        <Button mt={6}
          rounded="xl"
          onPress={props.onPressTakePicture}
        >
          PRENDRE UNE PHOTO
        </Button>
        <Button mt={6} mb={2}
          rounded="xl"
          onPress={props.onPressGallery}
        >
          CHOISIR UN FICHIER
        </Button>
      </>
    );
  }

  const showNameImage = (elt: any) => {
    try {
      return elt.name.name ?? elt.name;
    } catch (e) {
      return elt.name;
    }
  }

  const ItemAttachment = ({ item, onPress }) => {
    if ((item.attachment && item.attachment.uri) || (item.server_url && item.server_url.fileUrl)) {
      return (
        <TouchableOpacity
          onPress={onPress}
          key={item.order ?? item.id}
        >
          <Box rounded="lg" p={3} mt={3} bg="white" shadow={1} >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', flex: 1 }}>
                <Box rounded="lg" bg="gray.200" p={2} style={{ flex: 0.3 }}>
                  <View >
                    {
                      showImage(
                        (item.attachment && item.attachment.uri) ? item.attachment.uri : null,
                        85, 75)
                    }
                  </View>
                </Box>
                <View style={{ flexDirection: 'column', flex: 0.7 }}>
                  <View style={{}}>
                    <Text
                      fontSize="sm" color="gray.600" fontWeight="bold"
                    >
                      {showNameImage(item) ?? 'Non Défini'}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <Box
                      px={3}
                      mt={3}
                      bg="white"
                      rounded="xl"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Text fontWeight="bold" fontSize="2xs" color="white">
                        {/* En attente */}
                      </Text>
                    </Box>
                    <Box
                      style={{ alignSelf: 'flex-end', bottom: -15, justifyContent: 'flex-end' }}
                      px={3}
                      mt={3}
                      bg={
                        ((item.attachment && item.attachment.uri) || (item.server_url && item.server_url.fileUrl))
                          ? (item.attachment && item.attachment.uri && item.attachment.uri.includes("file:///data")) ? 'yellow.500'
                            : (item.attachment && item.attachment.uri && (item.attachment.uri.includes("https://") || item.attachment.uri.includes("http://")))
                              ? 'primary.500'
                              : (item.server_url && item.server_url.fileUrl)
                                ? 'primary.500'
                                : 'red.500'
                          : 'red.500'
                      }
                      rounded="xl"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Text fontWeight="bold" fontSize="2xs" color="white" >
                        {
                          ((item.attachment && item.attachment.uri) || (item.server_url && item.server_url.fileUrl))
                            ? (item.attachment && item.attachment.uri && item.attachment.uri.includes("file:///data")) ? "synchronisation en attente"
                              : (item.attachment && item.attachment.uri && (item.attachment.uri.includes("https://") || item.attachment.uri.includes("http://")))
                                ? "synchronisé" + ((item.type && (item.type.includes("photo") || item.type.includes("image"))) ? 'e' : '')
                                : (item.server_url && item.server_url.fileUrl)
                                  ? "synchronisé" + ((item.type && (item.type.includes("photo") || item.type.includes("image"))) ? 'e' : '')
                                  : "Fichier non trouvé"
                            : 'Fichier non trouvé'}
                      </Text>
                    </Box>
                  </View>
                </View>
              </View>
            </View>
          </Box>
        </TouchableOpacity>
      );
    }
    return (<>
      <Box rounded="lg" p={3} mt={3} bg="white" shadow={1} >
        <View style={{}}>
          <Text
            fontSize="sm" color="gray.600" fontWeight="bold"
          >
            {showNameImage(item) ?? 'Non Défini'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onPress}
          key={item.order ?? item.id}
          style={{ flexDirection: 'row', justifyContent: 'center' }}
        >
          <Box
            py={3}
            px={8}
            mt={6}
            mb={4}
            bg={'primary.500'}
            rounded="xl"
            borderWidth={1}
            borderColor={'primary.500'}
            justifyContent="center"
            alignItems="center"
          >
            <Text fontWeight="bold" fontSize="xs" color="white">JOINDRE UN NOUVEAU FICHIER</Text>
          </Box>
        </TouchableOpacity>
      </Box>
    </>);


  }

  // const uploadImages = async () => {
  //   setIsSyncing(true);
  //   try {
  //     for (let i = 0; i < 3; i++) {
  //       const response = await FileSystem.uploadAsync(
  //         `https://cddanadeb.e3grm.org/attachments/upload-to-issue`,
  //         task.attachments[i]?.attachment.uri,
  //         {
  //           fieldName: 'file',
  //           httpMethod: 'POST',
  //           uploadType: FileSystem.FileSystemUploadType.MULTIPART,
  //           parameters: user,
  //         },
  //       );
  //       setIsSyncing(false);
  //     }

  //   } catch (e) {
  //     setIsSyncing(false);
  //     toast.show({
  //       description: 'Veuillez ajouter toutes les pièces jointes.',
  //     });
  //     // console.log(e);
  //   }
  // };


  const uploadImages = async () => {
    setIsSyncing(true);
    try {
      let count = 0;
      let body;
      const updatedAttachments = [...task.attachments];
      for (let i = 0; i < task.attachments.length; i++) {
        let elt = task.attachments[i];

        if (elt && elt?.attachment && elt?.attachment.uri && elt?.attachment.uri.includes("file://")) {
          console.log(elt?.attachment.uri)
          try {
            const response = await FileSystem.uploadAsync(
              `https://cddanadeb.e3grm.org/attachments/upload-to-issue`,
              elt?.attachment.uri,
              {
                fieldName: 'file',
                httpMethod: 'POST',
                uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                parameters: user,
              },
            );
            console.log(response)
            body = JSON.parse(response.body);
            console.log(body.fileUrl)
            elt.attachment.uri = body.fileUrl;
            updatedAttachments[elt.order] = {
              ...updatedAttachments[elt.order],
              attachment: elt?.attachment
            };

            count++;
          } catch (e) {
            setIsSyncing(false);
            toast.show({
              description: `La pièces jointe ${elt.name} est introuvable sur votre portable.`,
            });
            // console.log(e);
          }

        }
      }
      setIsSyncing(false);
      if (count != 0) {
        task.attachments = updatedAttachments;
        insertTaskToLocalDb();
        if(count == 1){
          toast.show({
            description: 'La pièce jointe est synchronisée avec succès.',
          });
        }else{
          toast.show({
            description: 'Les pièces jointes sont synchronisées avec succès.',
          });
        }
        
      } else {
        toast.show({
          description: "Aucune synchronisation n'a été fait.",
        });
      }

    } catch (e) {
      setIsSyncing(false);
      toast.show({
        description: 'Veuillez ajouter toutes les pièces jointes.',
      });
      // console.log(e);
    }
  };

  const goToSupportingMaterials = () => {
    const title = `${task.order}-${task.name}`;
    navigation.navigate('SupportingMaterials', {
      materials: task.capacity_attachments,
      title,
    });
  };

  useEffect(() => {
    setInitialValue(task.form_response[currentPage]);
  }, []);

  const onChange = value => {
    setInitialValue(value);
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

      const date = new Date();
      doc.last_updated = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
      
      return doc;
    })
      .then(function (res) {
        setShowCompleteModal(false);
        setShowToProgressModal(false);
        setShowToAddAttachModal(false);
        setShowToAddOrEditAttachModal(false);
        setSelectedAttachmentId(null);
        setSelectedAttachment({ result: null, order: null, name: null, type: null });
        setAttachmentLoaded(false);
        setRefreshFlag(!refreshFlag);
        onTaskComplete();
        // onExitPress();
      })
      .catch(function (err) {
        // console.log('Error', err);
        // error
      });
  };

  // async function insertAttachmentInTask(
  //   result: ImagePickerCancelledResult | ImageInfo,
  //   order
  // ) {
  //   const localUri = result.uri;
  //   const filename = localUri.split('/').pop();
  //   const match = /\.(\w+)$/.exec(filename);
  //   const type = match ? `image/${match[1]}` : `image`;

  //   const manipResult = await ImageManipulator.manipulateAsync(
  //     localUri,
  //     [{ resize: { width: 1000, height: 1000 } }],
  //     { compress: 1, format: ImageManipulator.SaveFormat.PNG },
  //   );
  //   const updatedAttachments = [...task.attachments];
  //   updatedAttachments[order] = {
  //     ...updatedAttachments[order],
  //     attachment: manipResult,
  //     name: filename,
  //     type,
  //     order,
  //   };
  //   task.attachments = updatedAttachments;
  //   insertTaskToLocalDb();

  //   return task.attachments[order]
  // }
  async function insertAttachmentInTask(elt: any) {
    let result = elt.result;
    let order = elt.order;
    let filename = elt.name;

    const localUri = (!result) ? null : result.uri;
    const type = (!result) ? null : result.mimeType;
    const width = (!result) ? 1000 : result.width;
    const height = (!result) ? 1000 : result.height;


    setIsSaving(true);
    const updatedAttachments = [...task.attachments];
    if (localUri && localUri.includes("file://")) {
      try {
        const manipResult = await ImageManipulator.manipulateAsync(
          localUri,
          [{ resize: { width: width, height: height } }],
          { compress: 1, format: ImageManipulator.SaveFormat.PNG },
        );
        // console.log(manipResult)
        // console.log(manipResult.uri)
        updatedAttachments[order] = {
          ...updatedAttachments[order],
          attachment: manipResult,
          name: filename,
          type: type,
          order: order,
        };
      } catch (e) {
        try {
          updatedAttachments[order] = {
            ...updatedAttachments[order],
            attachment: { uri: localUri },
            name: filename,
            type: type,
            order: order,
          };
        } catch (exc) {
          toast.show({
            description: "Un problème est survenu. Il semble que ce fichier n'est pas sur votre portable",
          });
          updatedAttachments[order] = {
            ...updatedAttachments[order],
            name: filename,
            type: type,
            order: order,
          };
        }

      }
    } else {
      updatedAttachments[order] = {
        ...updatedAttachments[order],
        name: filename,
        type: type,
        order: order,
      };
    }

    task.attachments = updatedAttachments;
    insertTaskToLocalDb();

    setIsSaving(false);
    return task.attachments[order]
  }

  // const openCamera = async order => {
  //   const result = await ImagePicker.launchCameraAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.All,
  //     allowsEditing: false,
  //     quality: 1,
  //   });

  //   if (!result.cancelled) {
  //     await insertAttachmentInTask(result, order);
  //   }
  // };
  const openCamera = async order => {
    setAttachmentLoaded(false);
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.cancelled) {
      setSelectedAttachment({ result: result, order: order, name: selectedAttachment.name, type: selectedAttachment.type });
      setAttachmentLoaded(true);
    }
  };

  // const pickImage = async order => {
  //   const result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.All,
  //     allowsEditing: false,
  //     quality: 1,
  //   });
  //   if (!result.cancelled) {
  //     await insertAttachmentInTask(result, order);
  //   }
  // };
  const pickImage = async order => {

    // if(selectedAttachment && selectedAttachment.result && selectedAttachment.result?.uri && selectedAttachment.result?.uri.includes(".pdf")){
    //If the element selected is a document
    pickDocument(order);
    // }else{
    //   setAttachmentLoaded(false);
    //   const result = await ImagePicker.launchImageLibraryAsync({
    //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //     allowsEditing: false,
    //     quality: 1,
    //   });
    //   // console.log("222");
    //   if (!result.cancelled) {
    //     setSelectedAttachment({ result: result, order: order, name: selectedAttachment.name, type: selectedAttachment.type });
    //     setAttachmentLoaded(true);
    //   }
    // }

  };

  const pickDocument = async order => {
    setAttachmentLoaded(false);
    // console.log(selectedAttachment?.type)
    // // console.log(["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].indexOf("application/msword"))
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        multiple: false,
      });
      // console.log("222 document");
      // if (!result.cancelled) {
      //   setSelectedAttachment({ result: result, order: order, name: selectedAttachment.name, type: selectedAttachment.type });
      //   setAttachmentLoaded(true);
      // }
      setSelectedAttachment({ result: result, order: order, name: selectedAttachment.name, type: selectedAttachment.type });
      setAttachmentLoaded(true);
    } catch (err) {
      console.warn(err);
    }

  };


  const saveAttachment = async () => {
    // if(selectedAttachment.result){
    //   await insertAttachmentInTask(selectedAttachment);
    // }
    await insertAttachmentInTask(selectedAttachment);
  }

  const showImage = (uri: string, width: number, height: number) => {
    if (uri) {
      if (uri.includes(".pdf")) {
        return (
          <View>
            <Image
              resizeMode="stretch"
              style={{ width: width, height: height, borderRadius: 10 }}
              source={require('../../assets/illustrations/pdf.png')}
            />
          </View>
        );
      } else if (uri.includes(".docx") || uri.includes(".doc")) {
        return (
          <View>
            <Image
              resizeMode="stretch"
              style={{ width: width, height: height, borderRadius: 10 }}
              source={require('../../assets/illustrations/docx.png')}
            />
          </View>
        );
      } else {
        return (
          <View>
            <Image
              source={{ uri: uri }}
              style={{ width: width, height: height, borderRadius: 10 }}
            />
          </View>
        );
      }
    }
    return (
      <View>
        <Image
          resizeMode="stretch"
          style={{ width: width, height: height, borderRadius: 10 }}
          source={require('../../assets/illustrations/file.png')}
        />
      </View>
    );
  }

  // const PdfReader = ({ url: uri }) => <WebView javaScriptEnabled={true} style={{ flex: 1 }} source={{ uri }} />;

  const showDoc = async (uri: string) => {

    const buff = Buffer.from(uri, "base64");
    const base64 = buff.toString("base64");
    const fileUri = FileSystem.documentDirectory + `${encodeURI(selectedAttachment.name ? selectedAttachment.name : "pdf")}.pdf`;

    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });


    Sharing.shareAsync(uri);

    // return (
    // <View style={{ flex: 1, paddingTop: Constants.statusBarHeight, backgroundColor: '#ecf0f1' }}>
    {/* <PDFReader
          source={{
            uri: uri,
          }}
        /> */}
    //   <Image
    //     resizeMode="stretch"
    //     style={{ width: 300, height: 300, borderRadius: 10 }}
    //     source={require('../../assets/illustrations/file.png')}
    //   />
    // </View>
    // );

  }

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

  const onExitPress = () => {
    try {
      navigation.pop(task.form?.length + 1);
    } catch (e) {
      navigation.popToTop();
    }
  };

  const onPress = () => {
    if (task.form?.length === currentPage) {
      const value = refForm?.current?.getValue();

      // // console.log('validation: ', refForm?.current?.validate());

      if (value) {
        // if validation fails, value will be null
        // task.form_response = value;r
        // insertTaskToLocalDb(currentPage);
      }
    } else {
      const value = refForm?.current?.getValue();

      if (value) {
        // if validation fails, value will be null
        if (task.form_response) {
          task.form_response[currentPage] = value;
        } else {
          task.form_response = [value];
        }
        insertTaskToLocalDb();
        // // console.log('SAVED RESULT: ', value);
        navigation.push('TaskDetail', {
          task,
          currentPage: currentPage + 1,
          onTaskComplete: () => onTaskComplete(),
        });
      }
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
        {task.form?.length > currentPage ? (
          <>
            <Form
              value={initialValue}
              ref={refForm}
              onChange={onChange}
              type={TcombType}
              options={options}
            />
            <HStack space="md">
              <Button
                flex={1}
                onPress={onBackPress}
                underlayColor="#99d9f4"
                backgroundColor="gray.300"
              >
                Retour
              </Button>
              <Button flex={1} onPress={onPress} underlayColor="#99d9f4">
                Suivant
              </Button>
            </HStack>
          </>
        ) : (
          task.support_attachments ? (
            // Si support_attachments is defined and not null
            <>
              {/* <CustomDropDownPicker
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
                Ajouter un champ
              </Button>
              <Button
                onPress={uploadImages}
                isLoading={isSyncing}
                isLoadingText="Syncing"
              >
                Synchroniser
              </Button>
              <Button onPress={onPress} underlayColor="#99d9f4">
                Enregister
              </Button>
            </Button.Group> */}

              {/* MANAGEMENT ATTACHMENT */}

              {/* task.attachments */}


              {/* <Modal
              isOpen={showToAddAttachModal}
              onClose={() => setShowToAddAttachModal(false)}
              size="lg"
            >
              <Modal.Content maxWidth="400px">
                <Modal.Header style={{ flexDirection: 'row', justifyContent: 'center' }}>
                  SÉLECTIONNER LA SOURCE DU FICHIER
                </Modal.Header>

                <Modal.Body>
                  <VStack space="sm">
                    <AttachmentInput
                      onPressGallery={() => pickDocument(task.attachments.length)}
                      onPressTakePicture={() => openCamera(task.attachments.length)}
                      
                      task={task}
                    // truncateFileName={truncateFileName(task.attachments[0]?.name)}
                    />
                    <Button
                      style={{ backgroundColor: '#dcdcdc' }}

                      color="#ffffff"
                      rounded="xl"
                      onPress={() => {
                        setShowToAddAttachModal(false);
                      }}
                    >
                      Annuler
                    </Button>
                  </VStack>
                </Modal.Body>
              </Modal.Content>
            </Modal> */}

              {/* MODAL TO ADD OR MODIFY */}
              <Modal
                isOpen={attachmentLoaded}
                onClose={() => setAttachmentLoaded(false)}
                size="lg"
              >
                <Modal.Content maxWidth="400px">
                  <Modal.Header style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    {
                      (selectedAttachment && selectedAttachment.result && selectedAttachment.result?.uri)
                        ? 'DÉTAILS DE LA PIÈCE JOINTE'
                        : 'SÉLECTIONNER LA SOURCE DU FICHIER'
                    }
                  </Modal.Header>

                  <Modal.Body>
                    <VStack space="sm">
                      {/* <Form
                      value={{ name: selectedAttachment.name?.name ?? selectedAttachment.name }}
                      ref={refForm}
                      onChange={(value: any) => { selectedAttachment.name = value.name; }}
                      type={t.struct({
                        name: t.String,
                      })}
                      options={{
                        fields: {
                          name: {
                            label: 'Nom du fichier',
                            require: true,
                          },
                        },
                      }}
                    /> */}
                      <Text>
                      {
                      (selectedAttachment && selectedAttachment.result && selectedAttachment.result?.uri)
                        ? 'Nom du fichier : ' + (selectedAttachment.name?.name ?? selectedAttachment.name)
                        : selectedAttachment.name?.name ?? selectedAttachment.name
                    }
                    </Text>


                      {
                        (selectedAttachment && selectedAttachment.result && selectedAttachment.result?.uri)
                          ? <>
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                              {
                                showImage(
                                  (selectedAttachment && selectedAttachment.result && selectedAttachment.result?.uri)
                                    ? selectedAttachment.result.uri
                                    : null, 250, 250
                                )
                              }
                            </View>

                            <View
                              style={{ flexDirection: 'row', alignSelf: 'center', alignItems: 'center', flex: 1, top: -70, width: 250, backgroundColor: 'rgba(52, 52, 52, alpha)' }}>

                              <TouchableOpacity style={{ flex: 0.3, justifyContent: 'center', alignItems: 'center' }}
                                onPress={() => {
                                  pickDocument(
                                    (selectedAttachment && selectedAttachment.order != undefined && selectedAttachment.order != null)
                                      ? selectedAttachment.order
                                      : task.attachments.length
                                  );
                                }} >
                                <Box rounded="lg"   >
                                  <Image
                                    resizeMode="stretch"
                                    style={{ width: 50, height: 50, borderRadius: 50 }}
                                    source={require('../../assets/illustrations/gallery.png')}
                                  />
                                </Box>
                              </TouchableOpacity>
                              <TouchableOpacity style={{ flex: 0.3, justifyContent: 'center', alignItems: 'center' }}
                                onPress={() => {
                                  openCamera(
                                    (selectedAttachment && selectedAttachment.order != undefined && selectedAttachment.order != null)
                                      ? selectedAttachment.order
                                      : task.attachments.length
                                  );
                                }} >
                                <Box rounded="lg"   >
                                  <Image
                                    resizeMode="stretch"
                                    style={{ width: 50, height: 50, borderRadius: 50 }}
                                    source={require('../../assets/illustrations/camera.png')}
                                  />
                                </Box>
                              </TouchableOpacity>

                              {
                                (selectedAttachment && selectedAttachment?.type &&
                                  ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].indexOf(selectedAttachment?.type) != -1) ? (
                                  <>
                                    <TouchableOpacity style={{ flex: 0.3, justifyContent: 'center', alignItems: 'center' }}
                                      onPress={() => { showDoc(selectedAttachment.result?.uri); }} >
                                      <Box rounded="lg"   >
                                        <Image
                                          resizeMode="stretch"
                                          style={{ width: 50, height: 50, borderRadius: 50 }}
                                          source={require('../../assets/illustrations/eye.png')}
                                        />
                                      </Box>
                                    </TouchableOpacity>
                                  </>
                                ) : <><View></View></>
                              }

                            </View>

                            <Button mt={1} mb={2}
                              rounded="xl"
                              onPress={() => {
                                saveAttachment();
                              }}
                              isLoading={isSaving}
                              isLoadingText="Enregistrement en cours..."
                            >
                              ENREGISTRER
                            </Button>
                          </>

                          : <>
                            <AttachmentInput
                              onPressGallery={() => pickDocument(
                                (selectedAttachment && selectedAttachment.order != undefined && selectedAttachment.order != null)
                                  ? selectedAttachment.order
                                  : task.attachments.length
                              )}
                              onPressTakePicture={() => openCamera(
                                (selectedAttachment && selectedAttachment.order != undefined && selectedAttachment.order != null)
                                  ? selectedAttachment.order
                                  : task.attachments.length
                              )}

                              task={task}
                            // truncateFileName={truncateFileName(task.attachments[0]?.name)}
                            />
                          </>
                      }







                      <Button
                        style={{ backgroundColor: '#dcdcdc' }}

                        color="#ffffff"
                        rounded="xl"
                        onPress={() => {
                          setAttachmentLoaded(false);
                        }}
                      >
                        Annuler
                      </Button>
                    </VStack>
                  </Modal.Body>
                </Modal.Content>
              </Modal>
              {/* END MODAL TO ADD OR MODIFY */}

              {/* <TouchableOpacity
              onPress={() => { setShowToAddAttachModal(true); }}
              style={{ flexDirection: 'row', justifyContent: 'center' }}
            >
              <Box
                py={3}
                px={8}
                mt={6}
                mb={4}
                bg={'primary.500'}
                rounded="xl"
                borderWidth={1}
                borderColor={'primary.500'}
                justifyContent="center"
                alignItems="center"
              >
                <Text fontWeight="bold" fontSize="xs" color="white">JOINDRE UN NOUVEAU FICHIER</Text>
              </Box>
            </TouchableOpacity> */}

              {/* LIST ATTACHMENT */}
              <SafeAreaView >
                <FlatList
                  data={task.attachments}
                  renderItem={itemAttachments}
                  keyExtractor={(item) => item.order ?? item.id}
                  extraData={selectedAttachmentId}
                />
              </SafeAreaView>
              {/* END LIST ATTACHMENT */}


              <Button.Group
                isAttached
                colorScheme="primary"
                mx={{
                  base: 'auto',
                  md: 0,
                }}
                size="sm"
              >

                <Button
                  onPress={uploadImages}
                  isLoading={isSyncing}
                  isLoadingText="Synchronisation en cours..."
                >
                  Synchroniser
                </Button>

              </Button.Group>

              {/* END MANAGEMENT ATTACHMENT */}


            </>) : (
            // If support_attachments is not defined or null
            <>
              <View></View>
            </>
          )
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
                    const date = new Date();
                    task.completed_date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
      
                    insertTaskToLocalDb();
                    onExitPress();
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
                    task.completed_date = "0000-00-00 00:00:00";

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
            <HStack mt={4} space="md">
              <Button
                flex={1}
                onPress={onBackPress}
                underlayColor="#99d9f4"
                backgroundColor="gray.300"
              >
                Retour
              </Button>
              <Button flex={1} onPress={onExitPress} underlayColor="#99d9f4">
                Quitter
              </Button>
            </HStack>
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
