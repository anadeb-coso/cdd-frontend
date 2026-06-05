import React from "react";
import { StyleSheet, TextInput, View, Keyboard, TouchableOpacity, Text, ImageBackground, Modal as RNModal, Pressable } from "react-native";
import { Box } from 'native-base';
import { useState, useRef, useEffect, useContext } from 'react';
import {
  Heading,
  Stack,
  Modal,
  Button,
  VStack,
  Divider,
  useToast,
  HStack,
} from 'native-base';
import { Buffer } from "buffer";
import * as Sharing from "expo-sharing";
import { Image, Platform, FlatList, SafeAreaView, Dimensions } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { IconButton, TextInput as TextInputPaper, Checkbox, Button as RNPButton, Snackbar } from 'react-native-paper';
import ImageViewer from 'react-native-image-zoom-viewer';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { FontAwesome } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';

import { getData } from '../utils/storageManager';
import moment from "moment";
import SubprojectFileAPI from "../services/subprojects/file";
import LoadingScreen from './LoadingScreen';
import { getImageDimensions, getImageSize } from '../utils/functions_native';
import { image_compress } from "../utils/functions";
import { uploadFile } from '../services/upload';
import AuthContext from '../contexts/auth';
import { baseURL } from '../services/API';
import { requestMediaLibraryPermissionsAsync, requestCameraPermissionsAsync, requestCameraPermission } from "../utils/permissions";
import DownloadComponent from "./DownloadComponent/DownloadComponent";
import { PrivateStackParamList } from '../types/navigation';
import { colors } from '../utils/colors';
import { FileComment } from '../models/subprojects/FileComment';
import { 
  STRUCTURE_IN_PROGRESS_STATUS, STRUCTURE_IN_PROGRESS_RANKING_LIST
} from '../utils/constants';

const theme = {
  roundness: 12,
  colors: {
    background: 'white',
    placeholder: '#dedede',
    text: '#707070',
  },
};

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;
const TODAY = (new Date()).toISOString().split('T')[0];


const AttachmentsComponent = ({ attachmentsParams, object, type_object, subproject, width = 80, height = 80, showList = true, showAdd = true, showListBeforeAddIcon = false }: {
  attachmentsParams: any; object: any; type_object: any; subproject: any; width?: any; height?: any; showList?: boolean; showAdd?: boolean; showListBeforeAddIcon?: boolean;
}) => {
  const { user, signOut } = useContext(AuthContext);
  const toast = useToast();
  const navigation = useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
  const [selectedAttachment, setSelectedAttachment]: any = useState(null);
  const [attachments, setAttachments] = useState(attachmentsParams);
  const [attachmentLoaded, setAttachmentLoaded] = useState(false);
  const [attachmentsLoaded, setAttachmentsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [visibleImage, setVisibleImage] = useState(false);
  const [fileUrlToShow, setFileUrlToShow]: any = useState(null);

  const [attachmentToDeleteLoaded, setAttachmentToDeleteLoaded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription]: any = useState(null);
  const [isPrincipal, setIsPrincipal] = useState(false);
  const [isSpecial, setIsSpecial] = useState(false);
  const [dateTaken, setDateTaken]: any = useState(TODAY);
  
  const [fileComments, setFileComments] = useState<FileComment[]>([]); 
  const [errorMessage, setErrorMessage] = useState("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
  const [connected, setConnected] = useState(true);
  const [errorVisible, setErrorVisible] = React.useState(false);
  const onDismissSnackBar = () => setErrorVisible(false);
  
  const check_network = async () => {
      NetInfo.fetch().then((state) => {
          if (!state.isConnected) {
              setErrorMessage("Vous n'êtes pas connecté à aucun réseau. Veuillez activer votre donnée mobile ou connecter vous à un wifi.");
              setErrorVisible(true);
              setConnected(false);
          }else if(!state.isInternetReachable){
              setErrorMessage("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
              setErrorVisible(true);
              setConnected(false);
          }
      });
  }
  
  const [attachmentMessages, setAttachmentMessages] = useState(false);

  const [isDateVisibleTaken, setIsDateVisibleTaken] = useState(false);
  const handleConfirmTaken = (_date: any) => {
    let date_taken = TODAY;
    try {
      date_taken = _date ? _date.toISOString().split('T')[0] : undefined;
    } catch (e) {
      //Nothing
    }
    setDateTaken(date_taken);
    hideDatePickerTaken();
  };
  const hideDatePickerTaken = () => {
    setIsDateVisibleTaken(false);
  }; const showDatePickerTaken = () => {
    setIsDateVisibleTaken(true);
  };


  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setAttachmentLoaded(false);
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    requestCameraPermissionsAsync();
    // requestCameraPermission();
    requestMediaLibraryPermissionsAsync();
  }, []);

  const openUrl = (url: any) => {
    Linking.openURL(url);
  };

  async function insertAttachment(elt: any, _attachments: any[] | undefined = undefined) {
    let result = elt.result;
    let order = elt.order;
    let filename = elt.name;

    let localUri = (!result) ? null : result.uri ?? (result.assets ? result.assets[0].uri : null);
    const type = (!result) ? null : ((result.mimeType ?? result.type) ?? (result.assets ? result.assets[0].type ?? result.assets[0].mimeType : null));
    let width = (!result) ? 1000 : result.width ?? (result.assets ? result.assets[0].width : 1000);
    let height = (!result) ? 1000 : result.height ?? (result.assets ? result.assets[0].height : 1000);

    setIsSaving(true);
    const updatedAttachments = _attachments ? [..._attachments] : [...attachments];
    if (localUri && localUri.includes("file://")) {

      let date_taken = TODAY;
      try {
        date_taken = dateTaken ? dateTaken.toISOString().split('T')[0] : undefined;
      } catch (e) {
        //Nothing
      }

      try {
        setIsLoading(true);
        if (type && (type.toLowerCase().includes('image') || type.toLowerCase().includes('img'))) {
          const imageSize: any = await getImageSize(localUri);

          if (imageSize && imageSize >= 0.1) {
            const dimensions: any = await getImageDimensions(localUri);
            width = width ?? dimensions.width;
            height = height ?? dimensions.height;

            const manipResult = await ImageManipulator.manipulateAsync(
              localUri,
              [{ resize: { width: width, height: height } }],
              { compress: image_compress(imageSize) }//, format: ImageManipulator.SaveFormat.PNG },
            );
            localUri = manipResult.uri;

            setSelectedAttachment({...selectedAttachment, url: localUri});

          }


        }


        updatedAttachments[order] = {
          ...updatedAttachments[order],
          name: filename,
          localUri: localUri,
          url: localUri,
          order: order,
          date_taken: date_taken,
          file_type: type,
          width: width,
          height: height
        };
      } catch (e) {
        try {
          updatedAttachments[order] = {
            ...updatedAttachments[order],
            name: filename,
            localUri: localUri,
            url: localUri,
            order: order,
            date_taken: date_taken,
            file_type: type
          };
        } catch (exc) {
          toast.show({
            description: "Un problème est survenu. Il semble que ce fichier n'est pas sur votre portable",
          });
          updatedAttachments[order] = {
            ...updatedAttachments[order],
            name: filename,
            file_type: type,
            order: order,
          };
        }

      }
      setIsLoading(false);
    } else {
      updatedAttachments[order] = {
        ...updatedAttachments[order],
        name: filename,
        file_type: type,
        order: order,
      };
    }

    if (!_attachments) {
      setAttachments(updatedAttachments);
    }

    setIsSaving(false);
    return updatedAttachments;
  }


  const itemAttachments = (item: any, index: number) => {
    return (

      <ItemAttachment
        key={`${item.id}${index}`}
        item={item}
        onPress={() => {
          setSelectedAttachment(item);
          setDescription(item?.description);
          setIsPrincipal(item?.principal ?? false);
          setIsSpecial(item?.special ?? false);
          setDateTaken(item?.date_taken);
          setAttachmentLoaded(true);
        }}
        onLongPress={() => {
          setSelectedAttachment(item);
          setAttachmentMessages(true);
          if(get_file_comments) get_file_comments(item.id);
        }}
      />
    );
  };

  function AttachmentInput(props: {
    onPressGallery: () => Promise<void>;
    onPressTakePicture: () => Promise<void>;
    onPressGalleryPhotos: () => Promise<void>;
  }) {
    return (
      <>
        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Button
              style={{ alignSelf: 'center' }}
              onPress={props.onPressGallery}
            >
              UNE PIECE A JOINDRE
            </Button>
            <View style={styles.iconButtonStyle}>
              <IconButton icon="camera" size={24} onPress={props.onPressTakePicture} />
            </View>
          </View>
          <Button
            style={{ alignSelf: 'center', backgroundColor: '#127779', marginTop: 10 }}
            onPress={props.onPressGalleryPhotos}
          >
            PHOTOS A JOINDRE
          </Button>
        </View>

      </>
    );
  }


  const ItemAttachment = ({ item, onPress, onLongPress }: { item: any; onPress: () => void; onLongPress?: () => void; }) => {


    if ((item.url)) {
      return (
        <TouchableOpacity
          onPress={onPress}
          key={item.order ?? item.id}
          onLongPress={onLongPress}
          style={{ 
            flexDirection: 'row', width: '100%',
            borderLeftColor: item.principal ? 'green' : (item.special ? 'orange' : 'transparent'),
            borderLeftWidth: item.principal || item.special ? 3 : 0,
          }}
        >
          <ImageBackground
            key={item.id}
            source={(
              item.url.includes('.pdf') ?
                require('../../assets/illustrations/pdf.png')
                : (item.url.includes(".docx") || item.url.includes(".doc")) ?
                  require('../../assets/illustrations/docx.png')
                  : { uri: item.url.split("?")[0] })}
            style={{
              height: width,
              width: width,
              marginHorizontal: 1,
              alignSelf: 'center',
              justifyContent: 'flex-end',
              marginVertical: 18,
              borderTopColor: item.validated == true ? 'green' : (item.validated == false ? 'red' : 'yellow'),
              borderTopWidth: 3,
            }}
          >
            {showAdd && (<TouchableOpacity
              onPress={() => {
                setSelectedAttachment(item);
                setAttachmentToDeleteLoaded(true);
              }}
              style={{
                alignItems: 'center',
                padding: 5,
                backgroundColor: 'rgba(255, 1, 1, 1)',
              }}
            >
              <Text style={{ color: 'white' }}>X</Text>
            </TouchableOpacity>)}
          </ImageBackground>

          {([true, false].includes(item?.validated) && item?.comments_count && item?.comments_count > 0) ? (
            <TouchableOpacity
              onPress={() => {
                if(onLongPress) onLongPress();
                if(get_file_comments) get_file_comments(item.id);
              }}
              style={{
                
              }}
            >
              <FontAwesome name="envelope-o" size={15} color="black" />
              <Text style={styles.messages_length}>{item.comments_count}</Text>
            </TouchableOpacity>) : <></>}
          {!type_object && <View style={{ padding: 15, width: Dimensions.get('window').width / 2 - 15 }}>
            <View style={{ marginTop: 18, marginLeft: 7, marginRight: 7 }}>
              <Text style={{ fontWeight: 'bold' }}>{item.name} {item.order ? `[${item.order}]` : ''}</Text>
              {item.date_taken && <Text style={{ color: 'grey', fontSize: 11 }}>{`${item.date_taken}`}</Text>}
              {item.description && <Text style={{}}>{`\n${item.description}`}</Text>}
            </View>
          </View>}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={onPress}
        key={item.order ?? item.id}
        style={{ flexDirection: 'row', width: '100%' }}
      >
        <ImageBackground
          key={item.id}
          source={require('../../assets/illustrations/plus.png')}
          style={{
            height: 50,
            width: 50,
            marginHorizontal: 1,
            alignSelf: 'center',
            justifyContent: 'flex-end',
            marginVertical: 20,
          }}
        >
          <TouchableOpacity
            onPress={onPress}
            style={{
              alignItems: 'center',
              padding: 5,
            }}
          >
            <Text style={{ color: 'white' }}>+</Text>
          </TouchableOpacity>
        </ImageBackground>
      </TouchableOpacity>
    );

  }


  const uploadImages = async (order: any = null, isOneAttachment: boolean = true) => {
    setIsSyncing(true);

    try {
      let count = 0;
      let error = false;
      const updatedAttachments = [...attachments];

      for (let i = 0; i < attachments.length; i++) {
        let elt = attachments[i];
        if (!order || elt.order == order) {

          if (elt && elt?.url && elt?.url.includes("file://")) {
            try {

              const tmp = await FileSystem.getInfoAsync(elt?.url);
              if (tmp.exists) {
                try {

                  const response = await uploadFile(
                    `${baseURL}attachments/upload-to-issue`,
                    {
                      ...user,
                      url: elt?.url
                    }
                  );

                  if (response.fileUrl) {
                    elt.url = response.fileUrl;
                    elt.file = response.fileUrl;
                    updatedAttachments[elt.order] = {
                      ...updatedAttachments[elt.order],
                      url: elt?.url,
                      file: elt?.file
                    };
                    //count++;

                    let parameter = {
                      ...elt,
                      subproject: subproject.id,
                      username: JSON.parse(await getData('username')),
                      password: JSON.parse(await getData('password')),
                      description: description,
                      principal: isPrincipal,
                      special: isSpecial,
                      date_taken: dateTaken
                    };

                    if (type_object == "SubprojectStep") {
                      parameter = { ...parameter, subproject_step: object.id }
                    } else if (type_object == "Level") {
                      parameter = { ...parameter, subproject_level: object.id }
                    }

                    await new SubprojectFileAPI()
                      .addSubprojectFileUrl(parameter)
                      .then(async (rs: any) => {

                        if (rs.file) {
                          setIsSyncing(false);
                          toast.show({
                            description: rs.file[0],
                          });
                          return;
                        } else if (rs.error) {
                          setIsSyncing(false);
                          toast.show({
                            description: rs.error,
                          });
                          return;
                        }

                        setAttachmentLoaded(false);

                        elt.url = rs.url;

                        updatedAttachments[elt.order] = {
                          ...updatedAttachments[elt.order],
                          url: elt?.url,
                          principal: isPrincipal,
                          special: isSpecial,
                          description: description,
                          date_taken: dateTaken
                        };

                        count++;
                      })
                      .catch(error => {
                        console.error(error);
                        error = true;
                      });



                  } else if (response.file) {
                    toast.show({
                      description: response.file[0],
                      duration: 5000
                    });
                  } else {
                    toast.show({
                      description: `Une erreur est survenue! Il pourrait que la pièces jointe ${elt.name} est introuvable sur votre portable.`,
                      duration: 5000
                    });
                  }






                } catch (e) {
                  console.error("e");
                  console.error(e);
                }
              }

            } catch (e) {
              setIsSyncing(false);
              toast.show({
                description: `La pièces jointe ${elt.name} est introuvable sur votre portable.`,
              });
              // console.log(e);
            }

          }
        }
      }
      setIsSyncing(false);
      if (count != 0) {
        setAttachments(updatedAttachments);
        setAttachmentsLoaded(false);
        if (count == 1) {
          toast.show({
            description: 'La pièce jointe est synchronisée avec succès.',
          });
        } else {
          toast.show({
            description: 'Les pièces jointes sont synchronisées avec succès.',
          });
        }
        setDescription(null);
        setIsPrincipal(false);
        setIsSpecial(false);
        setDateTaken(TODAY);
      } else {
        if (error) {
          toast.show({
            description: "Aucune synchronisation n'a été fait.",
          });
        }
      }

    } catch (e) {
      setIsSyncing(false);
      toast.show({
        description: 'Veuillez ajouter toutes les pièces jointes.',
      });
      // console.log(e);
    }
  };


  const saveFileInformations = async (order: any = null) => {
    setIsSyncing(true);
    try {

      const updatedAttachments = [...attachments];
      let elt = updatedAttachments.find((a) => a.order == order);
      if (elt) {

        let parameter = {
          ...elt,
          subproject: subproject.id,
          username: JSON.parse(await getData('username')),
          password: JSON.parse(await getData('password')),
          description: description,
          principal: isPrincipal,
          special: isSpecial,
          date_taken: dateTaken
        };

        if (type_object == "SubprojectStep") {
          parameter = { ...parameter, subproject_step: object.id }
        } else if (type_object == "Level") {
          parameter = { ...parameter, subproject_level: object.id }
        }

        await new SubprojectFileAPI()
          .addSubprojectFileUrl(parameter)
          .then(async (rs: any) => {

            if (rs.file) {
              setIsSyncing(false);
              toast.show({
                description: rs.file[0],
              });
              return;
            } else if (rs.error) {
              setIsSyncing(false);
              toast.show({
                description: rs.error,
              });
              return;
            }

            setAttachmentLoaded(false);


            updatedAttachments[elt.order] = {
              ...updatedAttachments[elt.order],
              url: elt?.url,
              principal: isPrincipal,
              special: isSpecial,
              description: description,
              date_taken: dateTaken
            };

            setAttachments(updatedAttachments);

            toast.show({
              description: 'Contenu mise à jour avec succès.',
            });

          })
          .catch(error => {
            console.error(error);
            error = true;
          });


      } else {
        toast.show({
          description: 'Nous ne pouvons pas enregistrer les informations de la pièce jointe.',
        });
      }
      setIsSyncing(false);


    } catch (e) {
      setIsSyncing(false);
      toast.show({
        description: 'Nous ne pouvons pas enregistrer les informations de la pièce jointe.',
      });

    }
  };


  const removeItemOnAttachment = async (item: any) => {
    if (item.url) {
      const updatedAttachments = [...attachments].filter((elt: any) => elt.url != item.url);
      setAttachments(updatedAttachments);
      setDescription(null);
      setIsPrincipal(false);
      setIsSpecial(false);
      setDateTaken(TODAY);
    }
  };

  const deleteImage = async (item: any = null) => {
    setIsDeleting(true);
    if (item && item.url) {
      if (item.url.includes("file://")) {
        removeItemOnAttachment(item);
        toast.show({
          description: 'Fichier supprimé avec succès.',
        });
        setAttachmentToDeleteLoaded(false);
      } else {
        await new SubprojectFileAPI()
          .deleteSubprojectFileByUrl({
            url: item.url,
            subproject: subproject.id,
            username: JSON.parse(await getData('username')),
            password: JSON.parse(await getData('password')),
            user: {
              username: JSON.parse(await getData('username')),
              email: JSON.parse(await getData('email'))
            }
          }, JSON.parse(await getData('access')))
          .then(async (reponse: any) => {

            if (reponse.error) {
              toast.show({
                description: 'Une erreur est survenue. Veuillez réessayer plus tard.',
              });
              return;
            }

            removeItemOnAttachment(item);

            toast.show({
              description: 'Fichier supprimé avec succès.',
            });

            setAttachmentToDeleteLoaded(false);
          })
          .catch(error => {
            console.error(error);
          });
      }
      setDescription(null);
      setIsPrincipal(false);
      setIsSpecial(false);
      setDateTaken(TODAY);
    } else {
      toast.show({
        description: "Nous n'arrivons pas à trouver le fichier en question. Veuillez assurer l'existance du fichier.",
      });
    }
    setIsDeleting(false);


  };

  const openCamera = async (order: any) => {
    setAttachmentLoaded(false);
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    }) as any;

    if (!result.canceled && (result?.uri || (result.assets && result.assets.length))) {
      let elt = { ...selectedAttachment, result: result, url: result?.uri ?? (result.assets ? result.assets[0].uri : null), order: order, name: object.wording, file_type: null };
      setSelectedAttachment(elt);
      saveAttachment(elt);
      setAttachmentLoaded(true);

    }

  };

  const pickImage = async (order: any) => {

    pickDocument(order);

  };

  const pickDocument = async (order: any) => {
    setAttachmentLoaded(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],//, "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        multiple: false,
      }) as any;
      if (!result.canceled && (result?.uri || (result.assets && result.assets.length))) {
        let elt = { ...selectedAttachment, result: result, url: result?.uri ?? (result.assets ? result.assets[0].uri : null), order: order, name: object.wording, file_type: null };
        setSelectedAttachment(elt);
        saveAttachment(elt);
        setAttachmentLoaded(true);
      }

    } catch (err) {
      console.warn(err);
    }

  };

  const pickMultipleImages = async () => {
    setSelectedAttachment(null);
    setAttachmentLoaded(false);
    setAttachmentsLoaded(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*"],
        multiple: true,
      });
      if (!result.canceled && (result.assets && result.assets.length)) {
        let _attachments = [...attachments];
        for (let i = 0; i < result.assets.length; i++) {
          let asset = result.assets[i];
          let elt = { result: asset, url: asset.uri, order: attachments.length + i, name: object.wording, file_type: null };
          _attachments = await saveAttachment(elt, _attachments);
        }
        setAttachments(_attachments);
        setAttachmentsLoaded(true);
      }

    } catch (err) {
      console.warn(err);
    }

  };


  const saveAttachment = async (elt: any, _attachments: any[] | undefined = undefined) => {
    return await insertAttachment(elt, _attachments);
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


  }


  const get_file_comments = async (file_id: number) => {
          setFileComments([]);
          setIsLoading(true);
          setConnected(true);
          await check_network();
          //Get Subproject
          await new SubprojectFileAPI()
              .get_file_comments(
                  {
                      username: JSON.parse(await getData('username')),
                      password: JSON.parse(await getData('password')), 
                      user: {
                          username: JSON.parse(await getData('username')),
                          email: JSON.parse(await getData('email'))
                      }
                  }, JSON.parse(await getData('access')), file_id)
              .then(async (reponse: any) => {
                  setIsLoading(false);
                  if (reponse.error) {
                      return;
                  }
                  
                  setFileComments(reponse as FileComment[]);
  
              })
              .catch(error => {
                  setFileComments([]);
                  setIsLoading(false);
                  console.error(error);
              });
          //End Get Subproject
  
      };


  return (
    <View style={styles.container}>
      <Modal
        isOpen={attachmentLoaded}
        onClose={() => setAttachmentLoaded(false)}
        size="lg"
      >
        <Modal.Content maxWidth="400px">
          <Modal.Header style={{ flexDirection: 'row', justifyContent: 'center' }}>
            {
              (selectedAttachment && selectedAttachment?.url)
                ? 'DÉTAILS DE LA PIÈCE JOINTE'
                : 'SÉLECTIONNER LA SOURCE DU FICHIER'
            }
          </Modal.Header>

          <Modal.Body>
            <VStack space="sm">
              <Text>
                {
                  (selectedAttachment && selectedAttachment?.url)
                    ? 'Nom du fichier : ' + (object.wording ?? selectedAttachment.name)
                    : object.wording
                }
              </Text>

              {
                !(selectedAttachment?.url ?? "file://").includes("file://") && <DownloadComponent
                  url={selectedAttachment?.url ?? null}
                  username={""}
                  password={""} />
              }


              {
                (selectedAttachment && selectedAttachment.url)
                  ? <>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                      {
                        showImage(
                          (selectedAttachment && selectedAttachment?.url)
                            ? selectedAttachment.url
                            : null, 250, 250
                        )
                      }
                    </View>

                    <View style={{}}>
                      <View
                        style={{ position: 'absolute', flexDirection: 'row', alignSelf: 'center', alignItems: 'center', top: -70, width: 250, backgroundColor: 'rgba(52, 52, 52, alpha)' }}>

                        <TouchableOpacity style={{ flex: 0.3, justifyContent: 'center', alignItems: 'center' }}
                          onPress={() => {
                            pickDocument(
                              (selectedAttachment && selectedAttachment.order != undefined && selectedAttachment.order != null)
                                ? selectedAttachment.order
                                : attachments.length
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
                                : attachments.length
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
                          (selectedAttachment && selectedAttachment?.file_type &&
                            ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/*"].indexOf(selectedAttachment?.file_type) != -1) ? (
                            <>
                              <TouchableOpacity style={{ flex: 0.3, justifyContent: 'center', alignItems: 'center' }}
                                onPress={() => { showDoc(selectedAttachment.url); }} >
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
                    </View>


                    {/* {["Level", "SubprojectStep"].includes(type_object) &&  */}
                    <View style={{}}>
                      <TextInputPaper
                        multiline
                        numberOfLines={3}
                        style={[
                          styles.grmInput,
                          {
                            height: 50,
                            justifyContent: 'flex-start',
                            textAlignVertical: 'top'
                          },
                        ]}
                        // disabled={(selectedAttachment?.url && selectedAttachment?.url.includes('http') || selectedAttachment?.url.includes('https'))}
                        placeholder={"Description"}
                        outlineColor="#3e4000"
                        placeholderTextColor="#5f6800"
                        mode="outlined"
                        value={description ?? ""}
                        onChangeText={(text) => setDescription(text)}
                        render={(innerProps) => (
                          <TextInput
                            {...innerProps}
                            style={[
                              innerProps.style,
                              {
                                paddingTop: 4,
                                paddingBottom: 4,
                                height: 50,
                              },
                            ]}
                          />
                        )}
                      />

                      <View
                        style={{
                          flexDirection: 'row',
                          paddingHorizontal: 5,
                          paddingBottom: 10,
                          alignItems: 'center',
                        }}
                      >
                        <Checkbox.Android
                          color={colors.primary}
                          status={isPrincipal ? 'checked' : 'unchecked'}
                          onPress={() => {
                            setIsPrincipal(!isPrincipal);
                          }}
                        />
                        <Text style={[styles.title, { flex: 1 }]}>Element principal ? (notez bien qu'un seul fichier/photo qui peut être principal pour un ouvrage donnée.)</Text>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          paddingHorizontal: 5,
                          paddingBottom: 10,
                          alignItems: 'center',
                        }}
                      >
                        <Checkbox.Android
                          color={colors.primary}
                          status={isSpecial ? 'checked' : 'unchecked'}
                          onPress={() => {
                            setIsSpecial(!isSpecial);
                          }}
                        />
                        <Text style={[styles.title, { flex: 1 }]}>Element spécial ?</Text>
                      </View>

                      <View
                        style={{
                          paddingHorizontal: 5,
                          paddingBottom: 10,
                          alignContent: 'flex-start',
                          alignSelf: 'flex-start',
                          flexDirection: 'row',
                        }}
                      >
                        <Text style={{ ...styles.subTitle, marginVertical: 'auto', fontWeight: 'bold', flex: 0.3 }}>Date prise</Text>
                        <View
                          style={{
                            justifyContent: 'space-between',
                            flex: 0.7
                          }}
                        >

                          <RNPButton
                            theme={{ ...theme, colors: { ...theme.colors, primary: 'white' } }}
                            icon="calendar"
                            compact
                            style={{ ...styles.dateBtn, borderColor: 'green', borderWidth: 2 }}
                            uppercase={false}
                            labelStyle={{ ...styles.dateBtnLabelStyle }}
                            mode="contained"
                            onPress={showDatePickerTaken}
                          >
                            {dateTaken ? moment(dateTaken).format('DD-MMMM-YY') : "Date de prise"}
                          </RNPButton>
                          
                        </View>
                        <DateTimePickerModal
                          isVisible={isDateVisibleTaken}
                          mode="date"
                          onConfirm={handleConfirmTaken}
                          onCancel={hideDatePickerTaken}
                          date={dateTaken ? new Date(dateTaken) : new Date()}
                        />
                      </View>

                    </View>
                    {/* } */}

                    {
                      showAdd && 
                      (// type_object && 
                      (!(selectedAttachment && selectedAttachment?.url && (selectedAttachment?.url.includes('http') || selectedAttachment?.url.includes('https')))) ?
                        <>
                          <Button mt={1} mb={2}
                            rounded="xl"
                            onPress={() => { uploadImages(selectedAttachment.order); }}
                            isLoading={isSyncing}
                            isLoadingText={"Synchronisation en cours..."}
                            isDisabled={selectedAttachment && selectedAttachment?.url && (selectedAttachment?.url.includes('http') || selectedAttachment?.url.includes('https'))}
                          >
                            Synchroniser
                          </Button>
                          {
                            (selectedAttachment && selectedAttachment?.url && selectedAttachment?.url.includes('file://')) &&
                            <Button mt={1} mb={2}
                              rounded="xl"
                              onPress={() => {
                                setSelectedAttachment(selectedAttachment);
                                setAttachmentLoaded(false);
                                setAttachmentToDeleteLoaded(true);
                              }}
                              isLoading={isDeleting}
                              isDisabled={!(selectedAttachment && selectedAttachment?.url) || isSyncing}
                              bgColor={'red.500'}
                            >
                              Supprimer
                            </Button>
                          }
                        </>
                        :
                        <>
                          <Button mt={1} mb={2}
                            rounded="xl"
                            onPress={() => { saveFileInformations(selectedAttachment.order); }}
                            isLoading={isSyncing}
                            isLoadingText={"Enregistrement en cours..."}
                            isDisabled={selectedAttachment && selectedAttachment?.url && !(selectedAttachment?.url.includes('http') || selectedAttachment?.url.includes('https'))}
                          >
                            Enregistrer
                          </Button>


                          <Button mt={1} mb={2}
                            rounded="xl"
                            onPress={() => {
                              setSelectedAttachment(selectedAttachment);
                              setAttachmentLoaded(false);
                              setAttachmentToDeleteLoaded(true);
                            }}
                            isLoading={isDeleting}
                            isDisabled={!(selectedAttachment && selectedAttachment?.url) || isSyncing}
                            bgColor={'red.500'}
                          >
                            Supprimer
                          </Button>
                        </>
                      )
                    }


                  </>

                  : <>
                    <AttachmentInput
                      onPressGallery={() => pickDocument(
                        (selectedAttachment && selectedAttachment.order != undefined && selectedAttachment.order != null)
                          ? selectedAttachment.order
                          : attachments.length
                      )}
                      onPressTakePicture={() => openCamera(
                        (selectedAttachment && selectedAttachment.order != undefined && selectedAttachment.order != null)
                          ? selectedAttachment.order
                          : attachments.length
                      )}
                      onPressGalleryPhotos={() => pickMultipleImages()}
                    // attach={elt}
                    // truncateFileName={truncateFileName(attachments[0]?.name)}
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





      <Modal
        isOpen={attachmentsLoaded}
        onClose={() => setAttachmentsLoaded(false)}
        size="full"
      >
        <Modal.Content maxWidth="full">
          <Modal.Header style={{ flexDirection: 'row', justifyContent: 'center' }}>
            PHOTOS SÉLECTIONNÉES
          </Modal.Header>

          <Modal.Body>
            <VStack space="sm">
              <Text>
                {
                  object.wording
                }
              </Text>



              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                {
                  attachments.map((_elt: any, _index: any) => {
                    if (_elt && _elt?.url && _elt?.url.includes("file://")) {

                      return (
                        <View key={`${_elt?.url}-${_index}`} style={{ marginBottom: 10 }}>
                          <View style={{}}>
                            {
                              showImage(
                                (_elt && _elt?.url)
                                  ? _elt.url
                                  : null, WIDTH * 0.8, HEIGHT * 0.5
                              )
                            }
                          </View>

                          <View style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                          }}>
                            <View
                              style={{ flexDirection: 'row', }}>

                              <TouchableOpacity style={{
                                justifyContent: 'center', alignItems: 'center', marginRight: 5, backgroundColor: 'rgba(52, 52, 52, 0.6)',
                                padding: 6,
                                borderRadius: 20,
                              }}
                                disabled={isDeleting}
                                onPress={() => {
                                  deleteImage(_elt);
                                }} >
                                <Box rounded="lg"   >
                                  <Text style={{ fontWeight: 'bold', color: 'red' }} >X</Text>
                                </Box>
                              </TouchableOpacity>


                              {
                                (_elt && _elt?.file_type &&
                                  ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/*"].indexOf(_elt?.file_type) != -1) ? (
                                  <>
                                    <TouchableOpacity style={{
                                      justifyContent: 'center', alignItems: 'center', marginRight: 5, backgroundColor: 'rgba(52, 52, 52, 0.6)',
                                      padding: 6,
                                      borderRadius: 20,
                                    }}
                                      onPress={() => { showDoc(_elt.url); }} >
                                      <Box rounded="lg"   >
                                        <Image
                                          resizeMode="stretch"
                                          style={{ width: 15, height: 15, borderRadius: 50 }}
                                          source={require('../../assets/illustrations/eye.png')}
                                        />
                                      </Box>
                                    </TouchableOpacity>
                                  </>
                                ) : <><View></View></>
                              }

                            </View>
                          </View>
                        </View>
                      );
                    }
                  })
                }
              </View>



              {
                attachments.find((elt: any) => elt && elt?.url && elt?.url.includes("file://")) ? <Button mt={1} mb={2}
                  rounded="xl"
                  onPress={() => { uploadImages(null, false); }}
                  isLoading={isSyncing}
                  isLoadingText={"Synchronisation en cours..."}
                  isDisabled={isSyncing}
                >
                  Synchroniser
                </Button>
                  :
                  <Button
                    style={{ alignSelf: 'center', backgroundColor: '#127779' }}
                    onPress={pickMultipleImages}
                  >
                    PHOTOS A JOINDRE
                  </Button>
              }



              <Button
                style={{ backgroundColor: '#dcdcdc' }}

                color="#ffffff"
                rounded="xl"
                onPress={() => {
                  setAttachmentsLoaded(false);
                }}
              >
                Annuler
              </Button>
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>



      {/* Delete Modal */}
      <Modal
        isOpen={attachmentToDeleteLoaded}
        onClose={() => setAttachmentToDeleteLoaded(false)}
        size="lg"
      >
        <Modal.Content maxWidth="400px">
          <Modal.Header style={{ flexDirection: 'row', justifyContent: 'center' }}>
            {
              (selectedAttachment && selectedAttachment?.url)
                ? 'CONFIRMER LA SUPPRESSION DE CE FICHIER'
                : 'SOURCE DU FICHIER INTROUVABLE'
            }
          </Modal.Header>

          <Modal.Body>
            <VStack space="sm">
              {showAdd && (<Button mt={1} mb={2}
                rounded="xl"
                onPress={() => { deleteImage(selectedAttachment); }}
                isLoading={isDeleting}
                isLoadingText={"Suppression en cours..."}
                isDisabled={!(selectedAttachment && selectedAttachment?.url) || isSyncing}
                bgColor={'red.500'}
              >
                Supprimer
              </Button>)}

              <Button
                style={{ backgroundColor: '#dcdcdc' }}

                color="#ffffff"
                rounded="xl"
                onPress={() => {
                  setAttachmentToDeleteLoaded(false);
                }}
              >
                Annuler
              </Button>
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      {/* End Delete Modal */}


      {/* Messages Modal */}
      <Modal
        isOpen={attachmentMessages}
        onClose={() => setAttachmentMessages(false)}
        size="lg"
      >
        <Modal.Content maxWidth="400px">
          <Modal.Header style={{ flexDirection: 'row', justifyContent: 'center' }}>
            {
              (selectedAttachment && selectedAttachment?.url)
                ? 'MESSAGES CONCERNANT CE FICHIER'
                : 'MESSAGES CONCERNANT CE FICHIER'
            }
          </Modal.Header>

          <Modal.Body>
            <VStack space="sm">
              {
                ([true, false].includes(selectedAttachment?.validated) && fileComments && fileComments.length > 0) ? fileComments.map((item: any, index: number) => (
                  <View key={`${index}-${item.created_date}`}>
                    <View key={`${index}-${index}-${item.created_date}`} style={styles.commentCard}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                        <View style={{...styles.greenCircle, backgroundColor: item?.type == 'comment_validated' ? 'green' : 'red' }} />
                        <View>
                          <Text style={styles.radioLabel}>{`${item?.user?.last_name ?? ''} ${item?.user?.first_name ?? ''}`}{item?.type?.includes('comment') ? <>
                            <Text>{'('}<Text style={{ color: item?.type == 'comment_validated' ? 'green' : 'red' }}>{item?.type == 'comment_validated' ? "Action de validation" : "Action d'invalidation"}</Text>{')'}</Text>
                          </> : ""}</Text>
                          <Text style={styles.radioLabel}>{moment(item.created_date).format('DD-MMM-YYYY HH:mm')}</Text>
                        </View>
                      </View>
                      <Text style={styles.stepNote}>{item.comment}</Text>
                    </View>
                    <Divider />
                  </View>
                )) : <></>
              }
            </VStack>
          </Modal.Body>
          <Modal.Footer style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Button
                style={{ backgroundColor: '#dcdcdc', width: '80%' }}

                color="#ffffff"
                rounded="xl"
                onPress={() => {
                  setAttachmentMessages(false);
                }}
              >
                Fermer
              </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
      {/* End Messages Modal */}


      <RNModal visible={visibleImage} transparent onRequestClose={() => setVisibleImage(false)}>
        <ImageViewer
          imageUrls={[{ url: fileUrlToShow }]}
          enableSwipeDown
          onSwipeDown={() => setVisibleImage(false)}
          onCancel={() => setVisibleImage(false)}
        />
      </RNModal>


      {/* LIST ATTACHMENT */}
      <SafeAreaView >
        {showListBeforeAddIcon && showList && <View>
          {
            attachments &&
            attachments.find((elt: any) => !(elt.url.includes(".docx") || elt.url.includes(".doc") || elt.url.includes(".pdf"))) && <View>
              <Text style={{ textAlign: 'center' }}>---  Photos  ---</Text>
              {
                attachments.filter(
                  (elt: any) => !(elt.url.includes(".docx") || elt.url.includes(".doc") || elt.url.includes(".pdf"))
                ).map((elt: any, index: number) => itemAttachments(elt, index))
              }
              <Text></Text>
            </View>
          }
          {
            attachments &&
            attachments.find((elt: any) => (elt.url.includes(".docx") || elt.url.includes(".doc") || elt.url.includes(".pdf"))) && <View>
              <Text style={{ textAlign: 'center' }}>---  Documents  ---</Text>
              {
                attachments.filter(
                  (elt: any) => (elt.url.includes(".docx") || elt.url.includes(".doc") || elt.url.includes(".pdf"))
                ).map((elt: any, index: number) => itemAttachments(elt, index))
              }
            </View>
          }
        </View>}
        {(
          (showAdd && object && (
            !STRUCTURE_IN_PROGRESS_STATUS.includes(object.wording) || !STRUCTURE_IN_PROGRESS_RANKING_LIST.includes(object.ranking)
          )) && ( // && type_object
            [null, undefined].includes(attachments) || attachments
            //  || (attachments && attachments.length < 3)
          )
        ) && (<View>
          <ItemAttachment
            key={`attachments.length`}
            item={{ order: ([null, undefined].includes(attachments)) ? 0 : attachments.length }}
            onPress={() => {
              setSelectedAttachment({ order: ([null, undefined].includes(attachments)) ? 0 : attachments.length });
              setDescription(null);
              setIsPrincipal(false);
              setIsSpecial(false);
              setDateTaken(TODAY);
              setAttachmentLoaded(true);
            }}
          />
        </View>)}
        {!showListBeforeAddIcon && showList && <View>
          {
            attachments &&
            attachments.find((elt: any) => !(elt.url.includes(".docx") || elt.url.includes(".doc") || elt.url.includes(".pdf"))) && <View>
              <Text style={{ textAlign: 'center' }}>---  Photos  ---</Text>
              {
                attachments.filter(
                  (elt: any) => !(elt.url.includes(".docx") || elt.url.includes(".doc") || elt.url.includes(".pdf"))
                ).map((elt: any, index: number) => itemAttachments(elt, index))
              }
              <Text></Text>
            </View>
          }
          {
            attachments &&
            attachments.find((elt: any) => (elt.url.includes(".docx") || elt.url.includes(".doc") || elt.url.includes(".pdf"))) && <View>
              <Text style={{ textAlign: 'center' }}>---  Documents  ---</Text>
              {
                attachments.filter(
                  (elt: any) => (elt.url.includes(".docx") || elt.url.includes(".doc") || elt.url.includes(".pdf"))
                ).map((elt: any, index: number) => itemAttachments(elt, index))
              }
            </View>
          }
        </View>}

      </SafeAreaView>
      {/* END LIST ATTACHMENT */}
      
      
        
        <Snackbar visible={errorVisible} duration={3000} onDismiss={onDismissSnackBar}>
            {errorMessage}
        </Snackbar>

      {/* END MANAGEMENT ATTACHMENT */}

      <LoadingScreen visible={isLoading} />
    </View >
  );
};
export default AttachmentsComponent;

// styles
const styles = StyleSheet.create({
  container: {
    margin: 15,
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    width: "90%",

  },
  searchBar__unclicked: {
    padding: 10,
    flexDirection: "row",
    width: "95%",
    backgroundColor: "#d9dbda",
    borderRadius: 15,
    alignItems: "center",
  },
  searchBar__clicked: {
    padding: 10,
    flexDirection: "row",
    // width: "80%",
    width: "100%",
    backgroundColor: "#d9dbda",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  input: {
    fontSize: 20,
    marginLeft: 10,
    width: "90%",
  },
  grmInput: {
    // height: 40,
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    letterSpacing: 0,
    // textAlign: "left",
    color: "#707070",
  },
  iconButtonStyle: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  subTitle: {
    fontFamily: 'Poppins_300Light',
    fontSize: 12,
    fontWeight: 'normal',
    fontStyle: 'normal',
    // lineHeight: 10,
    letterSpacing: 0,
    // textAlign: "left",
    color: '#707070',
  },
  title: {
    fontFamily: 'Poppins_500Medium',
    // fontSize: 12,
    fontWeight: 'normal',
    fontStyle: 'normal',
    // lineHeight: 10,
    letterSpacing: 0,
    // textAlign: "left",
    color: '#707070',
  },
  dateBtn: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
    marginHorizontal: 10,
  },
  dateBtnLabelStyle: {
    color: colors.primary,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
  },
  dateBtnLabelStyleToday: {
    color: 'white',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
  },

  messages_length: {
    fontSize: 13,
    backgroundColor: 'transparent',
    borderRadius: 11,
    width: 15,
    textAlign: 'center',
    color: 'red',
    alignSelf: "flex-end",
    marginTop: -9,
    fontWeight: 'bold',
  },


  commentCard: {
    marginVertical: 5,
    marginHorizontal: 10
  },
  greenCircle: {
    backgroundColor: colors.primary,
    height: 20,
    width: 20,
    borderRadius: 10,
    marginRight: 10
  },
  radioLabel: {
    fontFamily: "Poppins_400Regular",
    fontWeight: "normal",
    fontStyle: "normal",
    lineHeight: 18,
    letterSpacing: 0,
    textAlign: "left",
    color: "#707070",
  },
  stepNote: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    fontWeight: "normal",
    fontStyle: "normal",
    lineHeight: 14,
    letterSpacing: 0,
    textAlign: "left",
    color: "#707070",
  }
});