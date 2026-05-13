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
import { TouchableOpacity, View, Image, Platform, FlatList, SafeAreaView, Dimensions, Alert, Modal as RNModal, Pressable } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as DocumentPicker from 'expo-document-picker';
import NetInfo from '@react-native-community/netinfo';
import { Snackbar } from 'react-native-paper';
import moment from 'moment';
import ImageViewer from 'react-native-image-zoom-viewer';
import { FontAwesome5 } from '@expo/vector-icons';
import { ImageInfo, ImagePickerCancelledResult } from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Layout } from '../components/common/Layout';
// import LocalDatabase from '../utils/databaseManager';
import { getDocumentsByAttributes, updateDocument } from '../utils/coucdb_call';
import { getData } from '../utils/storageManager';

import CustomDropDownPicker from '../components/common/CustomDropdownPicker';
import AuthContext from '../contexts/auth';
import { PrivateStackParamList } from '../types/navigation';
import * as Linking from 'expo-linking';
import { baseURL } from '../services/API';
import { uploadFile } from '../services/upload';
import { image_compress, applyStyleRecursively, applyStylesToOptions, normaliserChaine, comparerChaines } from '../utils/functions';
import { handleStorageError } from '../utils/pouchdb_call';
import { requestCameraPermissionsAsync, requestMediaLibraryPermissionsAsync, requestCameraPermission } from '../utils/permissions';
import SendMailAPI from '../services/mail/mail';
import { FILE_CONTENT_CONNAT_IMAGE_LIST_OPTIONS } from '../utils/constants';
import DownloadComponent from '../components/DownloadComponent/DownloadComponent';
import { getImageSize } from '../utils/functions_native';


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
const WIDTH = Dimensions.get('window').width;

const t = require('tcomb-form-native');
// var _lodash = require('lodash');
// var i18n = require('tcomb-form-native/lib/i18n/en');
// var templates = require('tcomb-form-native/lib/templates/bootstrap');
// var stylesheet = require('tcomb-form-native/lib/stylesheets/bootstrap');
// // var stylesheet = {};

// t.form.Form.stylesheet = stylesheet;
// t.form.Form.templates = templates;
// t.form.Form.i18n = i18n;

if (t.form.Form.stylesheet.button.backgroundColor != "#24c38b") t.form.Form.stylesheet.button.backgroundColor = '#24c38b';
if (t.form.Form.stylesheet.controlLabel.normal.color == "#000000") t.form.Form.stylesheet.controlLabel.normal.color = '#707070';
// t.form.Form.stylesheet.controlLabel.normal.color = '#707070';
t.form.Form.stylesheet.pickerTouchable.normal.borderWidth = 1;
// t.form.Form.stylesheet.controlLabel.normal.color = '#707070';


const transform = require("../utils/functions_tcomb_json_schema");//require('tcomb-json-schema');



const { Form } = t.form;
// let options = {}; // optional rendering options (see documentation)

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




function TaskDetail({ route }: {route: any}) {
  const { user, signOut } = useContext(AuthContext);
  const { task, currentPage } = route.params; //onTaskComplete
  const facilitator = route.params?.facilitator;
  const project = route.params?.project;
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

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showToProgressModal, setShowToProgressModal] = useState(false);
  const [showToAddAttachModal, setShowToAddAttachModal] = useState(false);
  const [showToAddOrEditAttachModal, setShowToAddOrEditAttachModal] = useState(false);
  const [selectedAttachmentId, setSelectedAttachmentId] = useState(null);
  const [selectedAttachment, setSelectedAttachment]: any = useState({ result: null, order: null, name: null, type: null });
  const [attachmentLoaded, setAttachmentLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [initialValue, setInitialValue] = useState({});
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [visibleImage, setVisibleImage] = useState(false);
  const [fileUrlToShow, setFileUrlToShow]: any = useState(null);

  let TcombType = {};
  if (task.form && task.form.length > currentPage) {
    TcombType = transform(task.form[currentPage]?.page);
  }

  const [options, setOptions] = useState(() => {
    const baseOptions = (task.form && task.form[currentPage]?.options) ? task.form[currentPage]?.options : {};

    const styledFields = applyStyleRecursively(t, baseOptions.fields || {}, TcombType, WIDTH - 25);

    return {
      ...baseOptions,
      fields: styledFields
    };


  }); // optional rendering options (see documentation)
  // if (task.form && task.form[currentPage]?.options) {
  //   setOptions(task.form[currentPage]?.options);
  // }

  const refForm = useRef(null);

  const openUrl = (url: any) => {
    Linking.openURL(url);
  };

  const [connected, setConnected] = useState(true);
  const [errorMessage, setErrorMessage]: any = useState(null);
  const [errorVisible, setErrorVisible] = React.useState(false);
  const onDismissSnackBar = () => setErrorVisible(false);
  const check_network = async () => {
    NetInfo.fetch().then((state: any) => {
      if (!state.isConnected) {
        setErrorMessage("Vous n'êtes pas connecté à aucun réseau. Veuillez activer votre donnée mobile ou connecter vous à un wifi.");
        setErrorVisible(true);
        setConnected(false);
      } else if (!state.isInternetReachable) {
        setErrorMessage("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
        setErrorVisible(true);
        setConnected(false);
      }
    });
  }

  const itemAttachments = (item: any, index: number) => {

    return (

      <ItemAttachment
        key={`${item.id}${index}`}
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
    attachmentName: string;
    task: any;
    // truncateFileName: any;
  }) {
    let _is_document_file = props?.attachmentName && FILE_CONTENT_CONNAT_IMAGE_LIST_OPTIONS.some((mot: string) => props?.attachmentName.toUpperCase().includes(mot))
    return (
      <>
        {(!_is_document_file) && <Button mt={6}
          rounded="xl"
          onPress={props.onPressTakePicture}
        >
          PRENDRE UNE PHOTO
        </Button>}
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

  const ItemAttachment = ({ item, onPress }: { item: any; onPress: any; }) => {
    if ((item.attachment && item.attachment.uri) || (item.server_url && item.server_url.fileUrl)) {
      return (
        <TouchableOpacity
          onPress={onPress}
          key={item.order ?? item.id}
          onLongPress={() => {
            if (!task.validated) {
              Alert.alert(
                "Alert",
                "Souhaitez vous réellement supprimer ce fichier ?",
                [
                  {
                    text: "Oui", onPress: async () => {
                      setIsSaving(true);
                      let updatedAttachments = [...task.attachments];

                      updatedAttachments[item.order] = {
                        ...updatedAttachments[item.order],
                        attachment: null
                      }

                      task.attachments = updatedAttachments;
                      insertTaskToLocalDb();
                      setIsSaving(false);
                    }
                  },
                  {
                    text: "Non", onPress: async () => {

                    }
                  }
                ]
              );
            } else {
              toast.show({
                description: `Vous ne pouvez pas supprimer ce fichier. Cette tâche est déjà validée par les spécialistes le ` + task.date_validated,
              });
            }

          }}
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
            {showNameImage(item) ?? 'Non Défini'}{`${item.optional == true ? " (Optionnel)" : ""}`}
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
  //         `${baseURL}attachments/upload-to-issue`,
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
  //     
  //   }
  // };


  const uploadImages = async () => {
    setConnected(true);
    check_network();
    if (connected) {
      setIsSyncing(true);
      try {
        let count = 0;
        let body;
        const updatedAttachments = [...task.attachments];
        for (let i = 0; i < task.attachments.length; i++) {
          let elt = task.attachments[i];

          if (elt && elt?.attachment && elt?.attachment.uri && elt?.attachment.uri.includes("file://")) {

            try {
              const response = await uploadFile(
                `${baseURL}attachments/upload-to-issue`,
                {
                  ...user,
                  url: elt?.attachment.uri
                }
              );

              if (response.fileUrl) {
                elt.attachment.uri = response.fileUrl;
                updatedAttachments[elt.order] = {
                  ...updatedAttachments[elt.order],
                  attachment: elt?.attachment
                };

                count++;
              } else if (response.file) {
                Alert.alert('Alert', response.file[0], [
                  {
                    text: "OK", onPress: () => { }
                  }
                ]);
              } else {
                Alert.alert('Alert', `Une erreur est survenue! Il pourrait que la pièces jointe ${elt.name} est introuvable sur votre portable.`, [
                  {
                    text: "OK", onPress: () => { }
                  }
                ]);
              }

            } catch (e) {
              setIsSyncing(false);
              Alert.alert('Alert', `Une erreur est survenue! Il pourrait que la pièces jointe ${elt.name} est introuvable sur votre portable.`, [
                {
                  text: "OK", onPress: () => { }
                }
              ]);
            }

          }
        }
        setIsSyncing(false);
        if (count != 0) {
          task.attachments = updatedAttachments;
          insertTaskToLocalDb();
          if (count == 1) {
            toast.show({
              description: 'La pièce jointe est synchronisée avec succès.',
            });
          } else {
            toast.show({
              description: 'Les pièces jointes sont synchronisées avec succès.',
            });
          }

        }

      } catch (e) {
        setIsSyncing(false);
        Alert.alert('Alert', 'Veuillez ajouter toutes les pièces jointes.', [
          {
            text: "OK", onPress: () => { }
          }
        ]);
      }
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
    const unsubscribe = navigation.addListener('focus', () => {
      setAttachmentLoaded(false);
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    setInitialValue(task.form_response[currentPage]);
    toggleFields(task.form_response[currentPage]); //Display | hidden field optional
  }, []);

  const toggleFields = (form_value: any) => {
    //Display | hidden field optional
    if (options && form_value) {
      let op = options;

      //15 - Vérification de l'existence d'un comité cantonal de développement (CCD)
      if (task.sql_id == 15 || task.name == "Vérification de l'existence d'un comité cantonal de développement (CCD)") {
        if (currentPage == 0) {
          op.fields = {
            ...op.fields,
            siOui: {
              ...op.fields.siOui,
              hidden: (form_value.existenceCDD === "Oui") ? false : true
            }
          }
        } else if (currentPage == 1) {
          let form_value_0 = task.form_response[0];
          op.fields = {
            ...op.fields,
            members: {
              ...op.fields.members,
              hidden: (form_value_0.existenceCDD === "Oui") ? false : true
            }
          }
          if (form_value_0.existenceCDD === "Non") {
            onPress();
          }
        }
      }
      //End 15 - Vérification de l'existence d'un comité cantonal de développement (CCD)

      //19 - Vérification de l'existence du CVD et de ses organes
      else if (task.sql_id == 19 || task.name == "Vérification de l'existence du CVD et de ses organes") {
        if (currentPage == 0) {
          op.fields.structuration.fields = {
            ...op.fields.structuration.fields,
            dateElection: {
              ...op.fields.structuration.fields.dateElection,
              hidden: (form_value.structuration && form_value.structuration.existenCVD === "Oui") ? false : true
            },
            effectifComplet: {
              ...op.fields.structuration.fields.effectifComplet,
              hidden: (form_value.structuration && form_value.structuration.existenCVD === "Oui") ? false : true
            },
            dateElectionDesMembres: {
              ...op.fields.structuration.fields.dateElectionDesMembres,
              hidden: (form_value.structuration && form_value.structuration.existenCVD === "Oui") ? false : true
            },
            separationDesTaches: {
              ...op.fields.structuration.fields.separationDesTaches,
              hidden: (form_value.structuration && form_value.structuration.existenCVD === "Oui") ? false : true
            },
            revueAnnuelle: {
              ...op.fields.structuration.fields.revueAnnuelle,
              hidden: (form_value.structuration && form_value.structuration.existenCVD === "Oui") ? false : true
            },
            dateRevue: {
              ...op.fields.structuration.fields.dateRevue,
              hidden: (form_value.structuration && form_value.structuration.existenCVD === "Oui" && form_value.structuration.revueAnnuelle === "Oui") ? false : true
            }
          }
        } else if (currentPage == 1) {
          let form_value_0 = task.form_response[0];
          op.fields = {
            ...op.fields,
            fonctionnement: {
              ...op.fields.fonctionnement,
              hidden: (form_value_0.structuration.existenCVD === "Oui") ? false : true
            }
          }
          op.fields.fonctionnement.fields = {
            ...op.fields.fonctionnement.fields,
            niveauDeRealisation: {
              ...op.fields.fonctionnement.fields.niveauDeRealisation,
              hidden: (form_value_0.structuration.existenCVD === "Oui" && form_value && form_value.fonctionnement && form_value.fonctionnement.existencePlanAction === "Oui") ? false : true
            }
          }
          if (form_value_0.structuration.existenCVD === "Non") {
            onPress();
          }

        } else if (currentPage == 2) {
          let form_value_0 = task.form_response[0];
          op.fields = {
            ...op.fields,
            existenceOutils: {
              ...op.fields.existenceOutils,
              hidden: (form_value_0.structuration.existenCVD === "Oui") ? false : true
            },
            utilisationOutils: {
              ...op.fields.utilisationOutils,
              hidden: (form_value_0.structuration.existenCVD === "Oui") ? (
                (form_value && form_value.existenceOutils && form_value.existenceOutils.cahierDerapport === "Non" &&
                  form_value.existenceOutils.cahierDecotisation === "Non" && form_value.existenceOutils.cahierJournal === "Non"
                  && form_value.existenceOutils.cahierDeVisite === "Non") ? true : false
              ) : true
            }
          }

          op.fields.utilisationOutils.fields = {
            ...op.fields.utilisationOutils.fields,
            utilisationCahierDerapport: {
              ...op.fields.utilisationOutils.fields.utilisationCahierDerapport,
              hidden: (form_value_0.structuration.existenCVD === "Oui" && form_value && form_value.existenceOutils && form_value.existenceOutils.cahierDerapport === "Oui") ? false : true,
              // isRequired: (form_value_0.structuration.existenCVD === "Oui" && form_value && form_value.existenceOutils && form_value.existenceOutils.cahierDerapport === "Oui") ? true : false
            },
            utilisationCahierDecotisation: {
              ...op.fields.utilisationOutils.fields.utilisationCahierDecotisation,
              hidden: (form_value_0.structuration.existenCVD === "Oui" && form_value && form_value.existenceOutils && form_value.existenceOutils.cahierDecotisation === "Oui") ? false : true,
              // isRequired: (form_value_0.structuration.existenCVD === "Oui" && form_value && form_value.existenceOutils && form_value.existenceOutils.cahierDecotisation === "Oui") ? true : false
            },
            utilisationCahierJournal: {
              ...op.fields.utilisationOutils.fields.utilisationCahierJournal,
              hidden: (form_value_0.structuration.existenCVD === "Oui" && form_value && form_value.existenceOutils && form_value.existenceOutils.cahierJournal === "Oui") ? false : true,
              // isRequired: (form_value_0.structuration.existenCVD === "Oui" && form_value && form_value.existenceOutils && form_value.existenceOutils.cahierJournal === "Oui") ? true : false
            },
            utilisationCahierDeVisite: {
              ...op.fields.utilisationOutils.fields.utilisationCahierDeVisite,
              hidden: (form_value_0.structuration.existenCVD === "Oui" && form_value && form_value.existenceOutils && form_value.existenceOutils.cahierDeVisite === "Oui") ? false : true,
              // isRequired: (form_value_0.structuration.existenCVD === "Oui" && form_value && form_value.existenceOutils && form_value.existenceOutils.cahierDeVisite === "Oui") ? true : false
            }
          }
          if (form_value_0.structuration.existenCVD === "Non") {
            onPress();
          }

        } else if (currentPage == 3) {
          let form_value_0 = task.form_response[0];
          op.fields = {
            ...op.fields,
            actions: {
              ...op.fields.actions,
              // hidden: (form_value_0.structuration.existenCVD === "Oui") ? false : true
            }
          }
          op.fields.actions.fields = {
            ...op.fields.actions.fields,
            modulesProposes: {
              ...op.fields.actions.fields.modulesProposes,
              hidden: (form_value_0.structuration.existenCVD === "Oui" && form_value && form_value.actions && form_value.actions.CVDaFormer === "Oui") ? false : true
            }
          }
          // if (form_value_0.structuration.existenCVD === "Non") {
          //   onPress();
          // }

        }

      }
      //End 19 - Vérification de l'existence du CVD et de ses organes

      //31 - Convenir de la date de l’évaluation sociale participative la fin de la réunion
      if (task.sql_id == 31 || task.name == "Convenir de la date de l’évaluation sociale participative la fin de la réunion") {
        if (currentPage == 0) {
          op.fields = {
            ...op.fields,
            siOui: {
              ...op.fields.siOui,
              hidden: (form_value.evaluationEtPlan === "Oui") ? false : true
            }
          }
        }
      }
      //End 31 - Convenir de la date de l’évaluation sociale participative la fin de la réunion

      //42
      // if(task.sql_id == 42){
      //   if(currentPage == 0){
      //     const CustomSelect = ({subtype, options, onChange, value}) => {
      //       const onChangeValue = (newValue: any) => {
      //         onChange(newValue);
      //       };

      //       return (
      //         <>
      //           <t.form.Select subtype={subtype} options={options} onChange={onChangeValue} value={value} />
      //           {(value === 'Autre') && <t.form.Textbox label="Description" name="descriptionDuGroupe" />}
      //         </>
      //       );
      //     };

      //     const selectFactory = (subtype: any, options: any) => {
      //       return CustomSelect;
      //     };
      //     op.fields = {
      //       ...op.fields,
      //       groupesDeTravail: {
      //         ...op.fields.groupesDeTravail,
      //         factory:  selectFactory
      //         // (locals: any) => {
      //         //   const onChange = (value: any) => {
      //         //     locals.onChange(value);
      //         //     if (value === 'Autre') {
      //         //       locals.options.fields.descriptionDuGroupe.hidden = false;
      //         //     }
      //         //   };
      //         //   return t.form.Select.subtype({
      //         //     ...locals,
      //         //     onChange
      //         //   });
      //         // }

      //       },
      //       descriptionDuGroupe: {
      //         hidden: true
      //       }
      //     }
      //   }
      // }
      //End 42

      //50 - Réunion d'information de la communauté sur le sous projet: activités, coût estimatif et prochainbes étapes
      if (task.sql_id == 50 || task.name == "Réunion d'information de la communauté sur le sous projet: activités, coût estimatif et prochainbes étapes") {
        if (currentPage == 0) {
          op.fields = {
            ...op.fields,
            raisonObjections: {
              ...op.fields.raisonObjections,
              hidden: (form_value.objectionsDeLaPartMembreCommunaute === "Oui") ? false : true
            }
          }
        }
      }
      //End 50 - Réunion d'information de la communauté sur le sous projet: activités, coût estimatif et prochainbes étapes


      setOptions(op);
    }

  }

  const onChange = (value: any) => {
    setInitialValue(value);



    toggleFields(value); //Display | hidden field optional

  };

  // useEffect(() => {
  //   requestMediaLibraryPermissionsAsync();
  // }, []);

  useEffect(() => {
    requestCameraPermissionsAsync();
    requestMediaLibraryPermissionsAsync();
  }, []);


  const getCVDVillages = async (id_village: string) => {
    let geographical_units: any = [];
    try {
      // await LocalDatabase.find({
      //   selector: { type: 'facilitator' },
      // })
      await getDocumentsByAttributes({ type: 'facilitator' })
        .then((result: any) => {
          geographical_units = result?.docs[0]?.geographical_units ?? [];

        })
        .catch((err: any) => {
          handleStorageError(err);
        });
    } catch (error) {
      handleStorageError(error);
    }

    let villages: any = [];
    geographical_units.forEach((element: any, index: number) => {
      if (element["villages"] && element["villages"].includes(id_village)) {
        element["cvd_groups"].forEach((elt: any, i: number) => {
          if (elt["villages"] && elt["villages"].includes(id_village)) {
            villages = elt["villages"];
          }
        });
      }
    });
    return villages;
  }

  const insertTaskToLocalDbForCantonVillagesRemain = (id_canton: string, sql_id: Number, _id_task: string) => {
    let villages: any = [];
    try {
      // LocalDatabase.find({
      //   selector: { type: 'task', sql_id: sql_id, canton_sql_id: id_canton },
      // })
      getDocumentsByAttributes({ type: 'task', sql_id: sql_id, canton_sql_id: id_canton })
        .then((result: any) => {

          (result?.docs ?? []).forEach((elt: any, i: number) => {
            if (elt._id != _id_task) {

              try {
                // LocalDatabase.upsert
                updateDocument(elt._id, function (doc: any) {
                  doc = elt;
                  doc.attachments = task.attachments;
                  doc.last_updated = task.last_updated;
                  doc.last_updated_moment = task.last_updated_moment;
                  //['13', '15', "46", "47"]
                  if (String(task.sql_id) == "15" || comparerChaines(task.name, "Vérification de l'existence d'un comité cantonal de développement (CCD)")) {
                    doc.form_response = task.form_response;
                    doc.completed = task.completed;
                    doc.completed_date = task.completed_date;
                    doc.completed_date_moment = task.completed_date_moment;
                  } else if (String(task.sql_id) == "46" || comparerChaines(task.name, "Mise en place et/ou restructuration du comité cantonal de développement (CCD)  et du comité cantonal de gestion des plaintes (CCGP)")) {
                    doc.form_response[0] = {
                      ...doc.form_response[0],
                      dateDeLaReunion: (task.form_response && task.form_response[0].dateDeLaReunion) ? task.form_response[0].dateDeLaReunion : null,
                      totalHommesMembresBureauCCD: (task.form_response && task.form_response[0].totalHommesMembresBureauCCD) ? task.form_response[0].totalHommesMembresBureauCCD : null,
                      totalFemmesMembresBureauCCD: (task.form_response && task.form_response[0].totalFemmesMembresBureauCCD) ? task.form_response[0].totalFemmesMembresBureauCCD : null,
                      totalMembresBureauCCD: (task.form_response && task.form_response[0].totalMembresBureauCCD) ? task.form_response[0].totalMembresBureauCCD : null,
                      totalHommesMembresCCGP: (task.form_response && task.form_response[0].totalHommesMembresCCGP) ? task.form_response[0].totalHommesMembresCCGP : null,
                      totalFemmesMembresCCGP: (task.form_response && task.form_response[0].totalFemmesMembresCCGP) ? task.form_response[0].totalFemmesMembresCCGP : null,
                      totalMembresCCGP: (task.form_response && task.form_response[0].totalMembresCCGP) ? task.form_response[0].totalMembresCCGP : null
                    }
                  } else if (String(task.sql_id) == "47" || comparerChaines(task.name, "Appui au CCD dans  l'analyse des PAV des villages, l'arbitrage, la sélection des sous - projets à financer et l'affection des ressources par sous - projet")) {
                    doc.form_response[0] = {
                      ...doc.form_response[0],
                      dateDeLaReunion: (task.form_response && task.form_response[0].dateDeLaReunion) ? task.form_response[0].dateDeLaReunion : null,
                      totalVillagesDuCanton: (task.form_response && task.form_response[0].totalVillagesDuCanton) ? task.form_response[0].totalVillagesDuCanton : null,
                      totalVillagesPresents: (task.form_response && task.form_response[0].totalVillagesPresents) ? task.form_response[0].totalVillagesPresents : null,
                      totalSousProjetsSoumisAArbitrage: (task.form_response && task.form_response[0].totalSousProjetsSoumisAArbitrage) ? task.form_response[0].totalSousProjetsSoumisAArbitrage : null,
                      totalSousProjetsApprouves: (task.form_response && task.form_response[0].totalSousProjetsApprouves) ? task.form_response[0].totalSousProjetsApprouves : null,
                      totalSecteursCouvertsParSousProjetsApprouves: (task.form_response && task.form_response[0].totalSecteursCouvertsParSousProjetsApprouves) ? task.form_response[0].totalSecteursCouvertsParSousProjetsApprouves : null,
                      totalVillagesBeneficiaires: (task.form_response && task.form_response[0].totalVillagesBeneficiaires) ? task.form_response[0].totalVillagesBeneficiaires : null,
                      totalSubventionAllouee: (task.form_response && task.form_response[0].totalSubventionAllouee) ? task.form_response[0].totalSubventionAllouee : null,
                      totalSousProjetsRejetes: (task.form_response && task.form_response[0].totalSousProjetsRejetes) ? task.form_response[0].totalSousProjetsRejetes : null
                    }
                  }
                  else {
                    doc.form_response[0] = {
                      ...doc.form_response[0],
                      dateDeLaReunion: (task.form_response && task.form_response[0].dateDeLaReunion) ? task.form_response[0].dateDeLaReunion : null
                    }

                    // task.form_response[0] = {
                    //   ...task.form_response[0],
                    //   totalHommes: (doc.form_response && doc.form_response[0].totalHommes) ? doc.form_response[0].totalHommes : null,
                    //   totalFemmes: (doc.form_response && doc.form_response[0].totalFemmes) ? doc.form_response[0].totalFemmes : null,
                    //   totalParticipants: (doc.form_response && doc.form_response[0].totalParticipants) ? doc.form_response[0].totalParticipants : null,
                    //   totalMoins35: (doc.form_response && doc.form_response[0].totalMoins35) ? doc.form_response[0].totalMoins35 : null,
                    //   nombreEthniques: (doc.form_response && doc.form_response[0].nombreEthniques) ? doc.form_response[0].nombreEthniques : null,
                    //   totalPlus35: (doc.form_response && doc.form_response[0].totalPlus35) ? doc.form_response[0].totalPlus35 : null,
                    //   totalHommesMoins35: (doc.form_response && doc.form_response[0].totalHommesMoins35) ? doc.form_response[0].totalHommesMoins35 : null,
                    //   totalFemmesMoins35: (doc.form_response && doc.form_response[0].totalFemmesMoins35) ? doc.form_response[0].totalFemmesMoins35 : null
                    // }

                    // if (["46", "47"].includes(String(task.sql_id))) {
                    //   task.form_response[0] = {
                    //     ...task.form_response[0],
                    //     totalMenages: (doc.form_response && doc.form_response[0].totalMenages) ? doc.form_response[0].totalMenages : null
                    //   }
                    // }
                    // doc.form_response = task.form_response;
                  }

                  return doc;
                })
                  .then(function (res: any) {

                  })
                  .catch(function (err: any) {
                    handleStorageError(err);
                  });
              } catch (e) {
                handleStorageError(e);
              }
            }
          });

        })
        .catch((err: any) => {
          handleStorageError(err);
        });
    } catch (error) {
      handleStorageError(error);
    }
  };

  const insertTaskToLocalDbForCVDVillagesRemain = (villages: Array<String>, sql_id: Number) => {

    try {
      // LocalDatabase.find({
      //   selector: { type: 'task', sql_id: sql_id, administrative_level_id: { $in: villages } },
      // })
      getDocumentsByAttributes({ type: 'task', sql_id: sql_id, administrative_level_id: { $in: villages } })
        .then((result: any) => {
          (result?.docs ?? []).forEach((elt: any, i: number) => {

            try {
              // LocalDatabase.upsert
              updateDocument(elt._id, function (doc: any) {
                doc = elt;
                doc.attachments = task.attachments;
                doc.form_response = task.form_response;
                doc.completed = task.completed;
                doc.completed_date = task.completed_date;
                doc.completed_date_moment = task.completed_date_moment;
                doc.last_updated = task.last_updated;
                doc.last_updated_moment = task.last_updated_moment;

                return doc;
              })
                .then(function (res: any) {

                })
                .catch(function (err: any) {
                  handleStorageError(err);
                });
            } catch (error) {
              handleStorageError(error);
            }

          });
        })
        .catch((err: any) => {
          handleStorageError(err);
        });
    } catch (error) {
      handleStorageError(error);
    }

  };

  const insertTaskToLocalDb = async () => {
    // eslint-disable-next-line no-underscore-dangle
    if (task.validated) {
      toast.show({
        description: `Vos modifications ne sont pas prises en compte. Cette tâche est déjà validée par les spécialistes le ` + task.date_validated,
      });
    } else {
      try {
        let send_update_after_invalidation_mail = false;
        let fields_updated: any = [];
        let fields_updated_response: any = {};
        let attachments_updated: any = [];
        let attachments_updated_response: any = {};
        let date_moment = moment();
        // LocalDatabase.upsert

        updateDocument(task._id, function (doc: any) {

          const date = new Date();
          task.last_updated = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
          task.last_updated_moment = date_moment;

          //Updated history

          task.users_involved_in_task = task.users_involved_in_task ?? [];
          let u = null;
          let u_index = 0;
          for (let i = 0; i < task.users_involved_in_task.length; i++) {
            if (task.users_involved_in_task[i]?.email == facilitator?.email) {
              u_index = i;
              u = task.users_involved_in_task[i];
              break;
            }
          }

          if (u) {
            task.users_involved_in_task[u_index] = { ...u, last_intervention_date: date_moment }
          } else {
            task.users_involved_in_task.push({
              name: facilitator?.name,
              email: facilitator?.email,
              phone: facilitator?.phone,
              sex: facilitator?.sex,
              sql_id: facilitator?.sql_id,
              type: facilitator?.type,
              first_intervention_date: date_moment,
              last_intervention_date: date_moment,
            });
          }

          if (task?.form_response[currentPage] && doc?.form_response[currentPage]) {
            for (const [key, value] of Object.entries(task?.form_response[currentPage] ?? {})) {
              if (JSON.stringify(doc?.form_response[currentPage][key] ?? {}) !== JSON.stringify(value ?? {})) {
                fields_updated.push(key);
                fields_updated_response[key] = { old: doc?.form_response[currentPage][key], new: value };
              }
            }
          }

          if (task.attachments) {
            for (let a_i = 0; a_i < task?.attachments?.length; a_i++) {
              if (doc?.attachments[a_i]?.attachment?.uri !== task?.attachments[a_i]?.attachment?.uri) {
                task.updated_after_invalidation = true;
                send_update_after_invalidation_mail = true;
                attachments_updated.push(doc?.attachments[a_i]?.name);
                attachments_updated_response[doc?.attachments[a_i]?.name] = {
                  old: doc?.attachments[a_i]?.attachment?.uri,
                  new: task?.attachments[a_i]?.attachment?.uri
                };
              }
            }
          }


          task.updated_history = task.updated_history ?? [];
          task.updated_history.push({
            facilitator: {
              name: facilitator?.name,
              email: facilitator?.email,
              phone: facilitator?.phone,
              sex: facilitator?.sex,
              sql_id: facilitator?.sql_id,
              type: facilitator?.type,
              fields_updated_response: fields_updated_response,
              fields_updated: fields_updated,
              attachments_updated: attachments_updated,
              attachments_updated_response: attachments_updated_response,
              page: currentPage
            },
            date: date_moment
          });

          if ((task.validated == false && doc?.form_response[currentPage] && task.form_response[currentPage]) && (
            JSON.stringify(doc?.form_response[currentPage] ?? {}) !== JSON.stringify(task.form_response[currentPage] ?? {}) ||
            JSON.stringify(doc?.attachments ?? []) !== JSON.stringify(task.attachments ?? [])
          )) {

            task.updated_after_invalidation = true;
            send_update_after_invalidation_mail = true;
            task.updated_after_invalidation_history = task.updated_after_invalidation_history ?? [];
            task.updated_after_invalidation_history.push({
              facilitator: {
                name: facilitator?.name,
                email: facilitator?.email,
                phone: facilitator?.phone,
                sex: facilitator?.sex,
                sql_id: facilitator?.sql_id,
                type: facilitator?.type,
                fields_updated_response: fields_updated_response,
                fields_updated: fields_updated,
                attachments_updated: attachments_updated,
                attachments_updated_response: attachments_updated_response,
                page: currentPage
              },
              date: date_moment
            });
          }
          //End updated history

          doc = task;

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
            // onTaskComplete();
            // onExitPress();

            if (
              task.canton_sql_id && (
                ['13', '15', "46", "47"].includes(String(task.sql_id))
                ||
                [
                  normaliserChaine("Introduction et présentation de l'AC par l'AADB lors de la première réunion cantonale"),
                  normaliserChaine("Vérification de l'existence d'un comité cantonal de développement (CCD)"),
                  normaliserChaine("Mise en place et/ou restructuration du comité cantonal de développement (CCD)  et du comité cantonal de gestion des plaintes (CCGP)"),
                  normaliserChaine("Appui au CCD dans  l'analyse des PAV des villages, l'arbitrage, la sélection des sous - projets à financer et l'affection des ressources par sous - projet")

                ].includes(normaliserChaine(task.name))
              )
            ) {//Save the same task of the villages remain who are in the same Canton with this village
              insertTaskToLocalDbForCantonVillagesRemain(task.canton_sql_id, task.sql_id, task._id);
              /*if(String(task.sql_id) != "20"){*/ //Save the same task of the villages remain who are in the same CVD with this village
            } else {
              getCVDVillages(String(task.administrative_level_id)).then((res: Array<String>) => {

                const index = res.indexOf(task.administrative_level_id);
                const x = res.splice(index, 1);

                insertTaskToLocalDbForCVDVillagesRemain(res, task.sql_id);

              });
            }


            if (send_update_after_invalidation_mail) {
              NetInfo.fetch().then(async (state) => {
                if (!state.isConnected) {
                  setErrorMessage("Vous n'êtes pas connecté à aucun réseau. Nous n'avions pas pu envoyer le mail de votre mise à jour. Veuillez vérifier votre connexion!");
                  setErrorVisible(true);
                  setConnected(false);
                } else if (!state.isInternetReachable) {
                  setErrorMessage("Nous n'arrivons pas a accéder à l'internet pour envoyer le mail de votre mise à jour. Veuillez vérifier votre connexion!");
                  setErrorVisible(true);
                  setConnected(false);
                } else {
                  try {
                    new SendMailAPI().send_mail({
                      task: task,
                      facilitator: facilitator,
                      fields_updated: fields_updated,
                      attachments_updated: attachments_updated,
                      form_fields: task.form[currentPage],
                      no_sql_db_name: JSON.parse(await getData('no_sql_db_name')),
                      date_moment: date_moment,
                    });
                  } catch (e) {
                    console.error(e);
                  }

                }
              });

            }

            // compactDatabase(LocalDatabase);
          })
          .catch(function (err: any) {
            console.error(err);
            handleStorageError(err);
            // error
            // if (LocalDatabase._destroyed) {
            //   signOut();
            // }
          });
      } catch (error) {
        console.error(error);
        handleStorageError(error);
      }
    }
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
  const getImageDimensions = async (imageUri: string) => {
    return new Promise((resolve, reject) => {
      Image.getSize(
        imageUri,
        (width, height) => {
          resolve({ width, height });
        },
        (error) => {
          reject(error);
        }
      );
    });
  };


  async function insertAttachmentInTask(elt: any) {
    let result = elt.result;
    let order = elt.order;
    let filename = elt.name;

    let localUri = (!result) ? null : result.uri ?? (result.assets ? result.assets[0].uri : null);
    const type = (!result) ? null : (result.mimeType ?? (result.assets ? result.assets[0].type ?? result.assets[0].mimeType : null));
    let width = (!result) ? 1000 : result.width ?? (result.assets ? result.assets[0].width : 1000);
    let height = (!result) ? 1000 : result.height ?? (result.assets ? result.assets[0].height : 1000);

    setIsSaving(true);
    const updatedAttachments = [...task.attachments];
    if (localUri && localUri.includes("file://")) {
      try {

        if (type && (type.toLowerCase().includes('image') || type.toLowerCase().includes('img'))) {
          const imageSize: any = await getImageSize(localUri);

          if (imageSize && imageSize > 0.2) {
            const dimensions: any = await getImageDimensions(localUri);
            width = width ?? dimensions.width;
            height = height ?? dimensions.height;

            const manipResult = await ImageManipulator.manipulateAsync(
              localUri,
              [{ resize: { width: width, height: height } }],
              { compress: image_compress(imageSize) }//, format: ImageManipulator.SaveFormat.PNG },
            );
            localUri = manipResult.uri;
          }


        }

        updatedAttachments[order] = {
          ...updatedAttachments[order],
          // attachment: manipResult,
          attachment: { uri: localUri },
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
          Alert.alert('Alert', "Un problème est survenu. Il semble que ce fichier n'est pas sur votre portable", [
            {
              text: "OK", onPress: () => { }
            }
          ]);
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

  const openCamera = async (order: any) => {
    setAttachmentLoaded(false);
    if (task.completed) {
      Alert.alert('Alert', "Vous ne pouvez pas prendre une photo après avoir achevée la tâche!", [
        {
          text: "OK", onPress: () => { }
        }
      ]);
    } else {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        const _result = ((result.assets && result.assets.length > 0) ? result.assets[0] : result) as any;
        let mimeType = _result?.mimeType ?? _result?.type;
        setSelectedAttachment({ result: result, order: order, name: selectedAttachment.name, type: selectedAttachment.type ?? mimeType });
        setAttachmentLoaded(true);
      }
    }

  };

  const pickImage = async (order: any) => {

    pickDocument(order);

  };

  const pickDocument = async (order: number) => {
    setAttachmentLoaded(false);
    if (task.completed) {
      Alert.alert('Alert', "Vous ne pouvez pas changer un fichier après avoir achevée la tâche!", [
        {
          text: "OK", onPress: () => { }
        }
      ]);
    } else {

      try {
        let result;
        if (!selectedAttachment.name) {
          result = await DocumentPicker.getDocumentAsync({
            type: ["image/*", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
            multiple: false,
          });
        } else if (selectedAttachment?.name && FILE_CONTENT_CONNAT_IMAGE_LIST_OPTIONS.some((mot: string) => selectedAttachment?.name?.toUpperCase().includes(mot))) {
          result = await DocumentPicker.getDocumentAsync({
            type: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
            multiple: false,
          });
        } else {
          result = await DocumentPicker.getDocumentAsync({
            type: ["image/*"],
            multiple: false,
          });
        }

        if (!result.canceled) {
          const _result = ((result.assets && result.assets.length > 0) ? result.assets[0] : result) as any;
          let mimeType = _result?.mimeType ?? _result.type;
          setSelectedAttachment({ result: result, order: order, name: selectedAttachment.name, type: selectedAttachment.type ?? mimeType });
          setAttachmentLoaded(true);
        }
        
      } catch (err) {
        console.warn(err);
      }
    }

  };


  const saveAttachment = async () => {
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
            <Pressable onPress={() => {
              setFileUrlToShow(uri.split("?")[0]);
              setVisibleImage(true);
            }}>
              <Image
                source={{ uri: uri.split("?")[0] }}
                style={{ width: width, height: height, borderRadius: 10 }}
              />
            </Pressable>
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

  const showDoc = async (uri: string) => {
    if (uri) {
      if (uri.includes("file://")) {
        const buff = Buffer.from(uri, "base64");
        const base64 = buff.toString("base64");
        const fileUri = FileSystem.documentDirectory + `${encodeURI(selectedAttachment.name ? selectedAttachment.name : "pdf")}.pdf`;

        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });


        Sharing.shareAsync(uri);

      } else {
        openUrl(uri.split("?")[0]);
      }
    } else {
      Alert.alert('Alert', `Nous n'arrivons pas à ouvrir le fichier!`, [
        {
          text: "OK", onPress: () => {

          }
        }
      ]);
    }



  }

  const increaseDropDownCount = () => {
    if (dropdownCount < 3) {
      setDropDownCount(dropdownCount + 1);
    }
  };

  const onChangeStatus = (value: any, order: any) => {
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
    const value = (refForm?.current as any)?.getValue();
    if (value) {
      // if validation fails, value will be null
      if (task.form_response) {
        task.form_response[currentPage] = value;
      } else {
        task.form_response = [value];
      }
      insertTaskToLocalDb();
    }

    navigation.pop();
  };

  const onExitPress = () => {
    try {
      navigation.pop(task.form?.length + 1);
    } catch (e) {
      navigation.popToTop();
    }
  };

  const onPress = async () => {
    if (task.form?.length === currentPage) {
      const value = (refForm?.current as any)?.getValue();

      if (value) {
        // if validation fails, value will be null
        // task.form_response = value;r
        // insertTaskToLocalDb(currentPage);
      }
    } else {
      const value = (refForm?.current as any)?.getValue();

      if (value) {
        // if validation fails, value will be null
        if (task.form_response) {
          task.form_response[currentPage] = value;
        } else {
          task.form_response = [value];
        }
        await insertTaskToLocalDb();

        navigation.push('TaskDetail', {
          task,
          currentPage: currentPage + 1,
          // onTaskComplete: () => onTaskComplete(),
          cvd_name: route.params?.cvd_name,
          facilitator: facilitator,
          project: project
        });
      }
    }
  };

  const truncateFileName = (filename: any) => {
    return filename?.length > 10 ? `${filename.substring(0, 12)}...` : filename;
  };

  return (
    <Layout disablePadding>

      <View
        style={{
          position: 'absolute', top: 0,
          right: 10, elevation: 8,
          zIndex: 9,
        }}>
        <Box
          px={3}
          mt={3}
          bg={
            task.completed != true ? (
              task.form_response && task.form_response.length != 0 ? 'gray.200' : 'gray.200'
            ) : (
              task.validated == true ? 'primary.500' : (
                task.validated == false ? 'red.500' : 'yellow.500'
              )
            )
          }
          rounded="xl"
          justifyContent="center"
          alignItems="center"
        >
          <Text
            onPress={() => navigation.navigate('TaskStatusDetail', {
              _id: task._id, cvd: { name: route.params?.cvd_name }, hide_button: true
            })}
            fontWeight="bold" fontSize="2xs" color={task.completed ? "white" : 'black'}>
            {
              task.completed != true ? (
                task.form_response && task.form_response.length != 0 ? (
                  task.validated == false ? 'Invalidée (Remise en cours)' : 'En cours'
                ) : 'Non démarré'
              ) : (
                task.validated == true ? 'Validée' : (
                  task.validated == false ? (task.updated_after_invalidation ? 'Invalidée (Mise à jour après invalidation)' : 'Invalidée') : 'Achevée (En attente de validation)'
                )
              )
            }
          </Text>
        </Box>
      </View>

      <ScrollView _contentContainerStyle={{ pt: 7, px: 5, flexGrow: 1, pb: 7 }} keyboardShouldPersistTaps="handled">
        <Stack px="5">
          <Heading my={3} fontWeight="bold" size="sm">
            {task.name}
          </Heading>

          <Text fontSize="sm" color="gray.600">
            {task.description}
          </Text>
          {route.params?.cvd_name && <Text fontSize="sm" color="gray.600" marginTop={2} fontWeight="bold" >
            {'CVD : '}{route.params?.cvd_name}{project?.name ? ` - ${project?.name}` : ""}
          </Text>}
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
                // underlayColor="#99d9f4"
                backgroundColor="gray.300"
              >
                Retour
              </Button>
              <Button flex={1} onPress={onPress} 
                // underlayColor="#99d9f4"
                >
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
                      (selectedAttachment && selectedAttachment.result && (selectedAttachment.result?.uri || (selectedAttachment.result?.assets && selectedAttachment.result?.assets[0]?.uri)))
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
                          (selectedAttachment && selectedAttachment.result && (selectedAttachment.result?.uri || (selectedAttachment.result?.assets && selectedAttachment.result?.assets[0]?.uri)))
                            ? 'Nom du fichier : ' + (selectedAttachment.name?.name ?? selectedAttachment.name)
                            : selectedAttachment.name?.name ?? selectedAttachment.name
                        }
                      </Text>


                      {
                        (selectedAttachment && selectedAttachment.result && (selectedAttachment.result?.uri || (selectedAttachment.result?.assets && selectedAttachment.result?.assets[0]?.uri)))
                          ? <>
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                              {
                                showImage(
                                  (selectedAttachment && selectedAttachment.result && (selectedAttachment.result?.uri || (selectedAttachment.result?.assets && selectedAttachment.result?.assets[0]?.uri)))
                                    ? (selectedAttachment.result?.uri ?? (selectedAttachment.result?.assets ? selectedAttachment.result?.assets[0]?.uri : null))
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
                              {(
                                (selectedAttachment && selectedAttachment.result && (
                                  selectedAttachment.result?.uri || (selectedAttachment.result?.assets && selectedAttachment.result?.assets[0]?.uri)
                                )
                                ) && selectedAttachment.name &&
                                !FILE_CONTENT_CONNAT_IMAGE_LIST_OPTIONS.some((mot: string) => selectedAttachment.name.toUpperCase().includes(mot))) && <TouchableOpacity style={{ flex: 0.3, justifyContent: 'center', alignItems: 'center' }}
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
                                </TouchableOpacity>}

                              {
                                (selectedAttachment && selectedAttachment?.type)
                                  // &&
                                  // ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].indexOf(selectedAttachment?.type) != -1) 
                                  ? (
                                    <>
                                      <TouchableOpacity style={{ flex: 0.3, justifyContent: 'center', alignItems: 'center' }}
                                        onPress={() => { showDoc((selectedAttachment.result?.uri ?? (selectedAttachment.result?.assets ? selectedAttachment.result?.assets[0]?.uri : null))); }} >
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

                            {
                              !(
                                selectedAttachment.result?.uri ?? (selectedAttachment.result?.assets ? selectedAttachment.result?.assets[0]?.uri : "file://")
                              ).includes("file://") && <DownloadComponent
                                url={(selectedAttachment.result?.uri ?? (selectedAttachment.result?.assets ? selectedAttachment.result?.assets[0]?.uri : null))}
                                username={""}
                                password={""} />
                            }

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
                              attachmentName={(selectedAttachment && selectedAttachment.result && (selectedAttachment.result?.uri || (selectedAttachment.result?.assets && selectedAttachment.result?.assets[0]?.uri)))
                                ? (selectedAttachment.name?.name ?? selectedAttachment.name)
                                : (selectedAttachment.name?.name ?? selectedAttachment.name)}
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
                {task.attachments.map((elt: any, index: number) => itemAttachments(elt, index))}
                {/* <FlatList
                  data={task.attachments}
                  renderItem={itemAttachments}
                  keyExtractor={(item) => item.order ?? item.id}
                  extraData={selectedAttachmentId}
                /> */}
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
                    task.completed_date_moment = moment();

                    //Completed history
                    task.completed_history = task.completed_history ?? [];
                    task.completed_history.push({
                      facilitator: {
                        name: facilitator?.name,
                        email: facilitator?.email,
                        phone: facilitator?.phone,
                        sex: facilitator?.sex,
                        sql_id: facilitator?.sql_id,
                        type: facilitator?.type,
                        form_response: task.form_response,
                        attachments: task.attachments,
                      },
                      date: moment()
                    })
                    //End completed history

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
                    task.completed_date_moment = null;

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
        
        <RNModal visible={visibleImage} transparent onRequestClose={() => setVisibleImage(false)}>
          <ImageViewer
            imageUrls={[{ url: fileUrlToShow }]}
            enableSwipeDown
            onSwipeDown={() => setVisibleImage(false)}
            onCancel={() => setVisibleImage(false)}
          />
        </RNModal>

        {task.form?.length > currentPage ? null : (
          <>
            <HStack mt={4} space="md">
              <Button
                flex={1}
                onPress={onBackPress}
                // underlayColor="#99d9f4"
                backgroundColor="gray.300"
              >
                Retour
              </Button>
              <Button flex={1} onPress={onExitPress} 
                // underlayColor="#99d9f4"
                >
                Quitter
              </Button>
            </HStack>
            {!task.validated && <TouchableOpacity
              onPress={async () => {
                if (task.completed) {
                  setShowToProgressModal(true);
                } else {

                  let all_attachs_filled = true;
                  for (let i = 0; i < task.attachments.length; i++) {

                    if (!task.attachments[i].attachment && ([undefined, null, false, "", 0].includes(task.attachments[i]?.optional) || task.attachments[i]?.optional != true)) {
                      all_attachs_filled = false;
                      // toast.show({
                      //   description: `Fichier(s) non joint(s). Veuillez joindre le(s) fichier(s) et le(s) synchronisé(s) avant d'achever la tâche.`,
                      // });
                      Alert.alert('Alert', `Fichier(s) non joint(s). Veuillez joindre le(s) fichier(s) et le(s) synchronisé(s) avant d'achever la tâche.`, [
                        {
                          text: "OK", onPress: () => { }
                        }
                      ]);
                      break;
                    }
                    if (task.attachments[i].attachment && task.attachments[i].attachment.uri.includes("file:///data")) {
                      all_attachs_filled = false;
                      // toast.show({
                      //   description: `Fichier(s) en attente de synchronisation. Veuillez synchroniser le(s) fichier(s) avant d'achever la tâche.`,
                      // });
                      Alert.alert('Alert', `Fichier(s) en attente de synchronisation. Veuillez synchroniser le(s) fichier(s) avant d'achever la tâche.`, [
                        {
                          text: "OK", onPress: () => { }
                        }
                      ]);
                      break;
                    }

                  }

                  if (all_attachs_filled) {
                    let previous_ok = false;
                    if (!task.task_order || task.task_order <= 1) {
                      previous_ok = true;
                    } else {
                      try {
                        // await LocalDatabase.find({
                        //   selector: { type: 'task', administrative_level_id: task.administrative_level_id, task_order: (task.task_order - 1) },
                        // })
                        await getDocumentsByAttributes({ type: 'task', administrative_level_id: task.administrative_level_id, task_order: (task.task_order - 1) })
                          .then((result_tasks: any) => {
                            for (let index = 0; index < (result_tasks?.docs ?? []).length; index++) {
                              previous_ok = result_tasks?.docs[index].completed;
                            }
                          })
                          .catch((err: any) => {
                            handleStorageError(err);
                            return [];
                          });
                      } catch (error) {
                        handleStorageError(error);
                      }
                    }


                    if (previous_ok) {
                      setShowCompleteModal(true);
                    } else {
                      // toast.show({
                      //   description: `Tâche précédente non achevée. Veuillez aller achever la tâche précédente avant d'achever cette tâche.`,
                      // });
                      Alert.alert('Alert', `Tâche précédente non achevée. Veuillez aller achever la tâche précédente avant d'achever cette tâche.`, [
                        {
                          text: "OK", onPress: () => { }
                        }
                      ]);
                    }
                  }


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
                    ? 'METTRE LA TACHE EN COURS'
                    : 'METTRE LA TACHE COMME TERMINÉE'}
                </Text>
              </Box>
            </TouchableOpacity>}
          </>
        )}
      </ScrollView>

      <Snackbar visible={errorVisible} duration={1000} onDismiss={onDismissSnackBar}>
        {errorMessage}
      </Snackbar>

    </Layout>
  );
}

export default TaskDetail;
