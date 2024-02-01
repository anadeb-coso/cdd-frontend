import React from "react";
import { StyleSheet, TextInput, View, Keyboard, TouchableOpacity, Text, ImageBackground } from "react-native";
import { Box } from 'native-base';
import { Feather, Entypo } from "@expo/vector-icons";
import { useState, useRef, useEffect, useContext } from 'react';
import {
  Heading,
  ScrollView,
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
import { FontAwesome5 } from '@expo/vector-icons';
import { ImageInfo, ImagePickerCancelledResult } from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { IconButton } from 'react-native-paper';
import axios from 'axios';

import { getData } from '../utils/storageManager';
import { misBaseURL } from '../services/env';
import moment from "moment";
import SubprojectFileAPI from "../services/subprojects/file";
import LoadingScreen from './LoadingScreen';

const theme = {
  roundness: 12,
  colors: {
    background: 'white',
    placeholder: '#dedede',
    text: '#707070',
  },
};


const AttachmentsComponent = ({ attachmentsParams, object, type_object, subproject, width = 80, height = 80 }: {
  attachmentsParams: any; object: any; type_object: any; subproject: any; width: any; height: any;
}) => {
  const toast = useToast();
  const [selectedAttachment, setSelectedAttachment]: any = useState(null);
  const [attachments, setAttachments] = useState(attachmentsParams);
  const [attachmentLoaded, setAttachmentLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [attachmentToDeleteLoaded, setAttachmentToDeleteLoaded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const openUrl = (url: any) => {
    Linking.openURL(url);
  };


  async function insertAttachment(elt: any) {
    let result = elt.result;
    let order = elt.order;
    let filename = elt.name;

    const localUri = (!result) ? null : result.uri;
    const type = (!result) ? null : (result.mimeType ?? result.type);
    const width = (!result) ? 1000 : result.width;
    const height = (!result) ? 1000 : result.height;

    setIsSaving(true);
    const updatedAttachments = [...attachments];
    if (localUri && localUri.includes("file://")) {
      try {
        setIsLoading(true);
        const manipResult = await ImageManipulator.manipulateAsync(
          localUri,
          [{ resize: { width: width, height: height } }],
          { compress: 1, format: ImageManipulator.SaveFormat.PNG },
        );

        updatedAttachments[order] = {
          ...updatedAttachments[order],
          name: filename,
          localUri: manipResult.uri,
          url: manipResult.uri,
          order: order,
          date_taken: (new Date()).toISOString().split('T')[0],
          file_type: type
        };
      } catch (e) {
        try {
          updatedAttachments[order] = {
            ...updatedAttachments[order],
            name: filename,
            localUri: localUri,
            url: localUri,
            order: order,
            date_taken: (new Date()).toISOString().split('T')[0],
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

    setAttachments(updatedAttachments);

    setIsSaving(false);
    return attachments[order]
  }


  const itemAttachments = (item: any, index: number) => {
    return (

      <ItemAttachment
        key={`${item.id}${index}`}
        item={item}
        onPress={() => {
          setSelectedAttachment(item);
          setAttachmentLoaded(true);
        }}
      />
    );
  };

  function AttachmentInput(props: {
    onPressGallery: () => Promise<void>;
    onPressTakePicture: () => Promise<void>;
    // elt: any;
    // truncateFileName: any;
  }) {
    return (
      <>
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
            PIECE A JOINDRE
          </Button>
          <View style={styles.iconButtonStyle}>
            <IconButton icon="camera" color={'#24c38b'} size={24} onPress={props.onPressTakePicture} />
          </View>
        </View>


        {/* <Button mt={6}
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
        </Button> */}
      </>
    );
  }


  const ItemAttachment = ({ item, onPress }: { item: any; onPress: () => void; }) => {


    if ((item.url)) {
      return (
        <TouchableOpacity
          onPress={onPress}
          key={item.order ?? item.id}
          style={{ flexDirection: 'row', width: '100%' }}
        >
          <ImageBackground
            key={item.id}
            source={(
              item.url.includes('.pdf') ?
                require('../../assets/illustrations/pdf.png')
                : (item.url.includes(".docx") || item.url.includes(".doc")) ?
                  require('../../assets/illustrations/docx.png')
                  : { uri: item.url })}
            style={{
              height: width,
              width: width,
              marginHorizontal: 1,
              alignSelf: 'center',
              justifyContent: 'flex-end',
              marginVertical: 20,
            }}
          >
            <TouchableOpacity
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
            </TouchableOpacity>
          </ImageBackground>
          {!type_object && <View style={{padding: 15, width: Dimensions.get('window').width/2 }}>
            <View style={{marginTop: 18, marginLeft: 7, marginRight: 7}}>
              <Text style={{fontWeight: 'bold'}}>{item.name} {item.order ? `[${item.order}]` : ''}</Text>
              {item.date_taken && <Text style={{color: 'grey', fontSize: 11}}>{`${item.date_taken}`}</Text>}
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


  const uploadImages = async (order: any = null) => {
    setIsSyncing(true);
    try {
      let count = 0;
      let body;
      const updatedAttachments = [...attachments];
      for (let i = 0; i < attachments.length; i++) {
        let elt = attachments[i];
        if (!order || elt.order == order) {

          if (elt && elt?.url && elt?.url.includes("file://")) {
            try {
              let parameter = {
                ...elt,
                subproject: subproject.id,
                subproject_step: type_object == "SubprojectStep" ? object.id : null,
                subproject_level: type_object == "Level" ? object.id : null,
                username: JSON.parse(await getData('username')),
                password: JSON.parse(await getData('password'))
              };

              const tmp = await FileSystem.getInfoAsync(elt?.url);
              if (tmp.exists) {
                await new SubprojectFileAPI()
                  .uploadSubprojectFile(parameter)
                  .then(async (reponse: any) => {
                    if (reponse.error) {
                      return;
                    }
                    setAttachmentLoaded(false);
                    elt.url = reponse.url;
                    updatedAttachments[elt.order] = {
                      ...updatedAttachments[elt.order],
                      url: elt?.url
                    };
                    count++;
                  })
                  .catch(error => {
                    console.error(error);
                  });

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
        if (count == 1) {
          toast.show({
            description: 'La pièce jointe est synchronisée avec succès.',
          });
        } else {
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


  const removeItemOnAttachment = (item: any) => {
    if (item.url) {
      const updatedAttachments = [...attachments].filter((elt: any) => elt.url != item.url);
      setAttachments(updatedAttachments);
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
            username: JSON.parse(await getData('username')),
            password: JSON.parse(await getData('password'))
          })
          .then(async (reponse: any) => {
            if (reponse.error) {
              toast.show({
                description: 'Une erreur est survenue. Veuillez réessayer plus tard.',
              });
              return;
            }
            setAttachmentToDeleteLoaded(false);
            removeItemOnAttachment(item);
            toast.show({
              description: 'Fichier supprimé avec succès.',
            });
          })
          .catch(error => {
            console.error(error);
          });
      }
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
    });
    if (!result.cancelled) {
      let elt = { ...selectedAttachment, result: result, url: result.uri, order: order, name: object.wording, file_type: null };
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
        type: ["image/*", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        multiple: false,
      });
      let elt = { ...selectedAttachment, result: result, url: result.uri, order: order, name: object.wording, file_type: null };
      setSelectedAttachment(elt);
      saveAttachment(elt);
      setAttachmentLoaded(true);
    } catch (err) {
      console.warn(err);
    }

  };


  const saveAttachment = async (elt: any) => {
    await insertAttachment(elt);
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
              source={{ uri: uri.split("?")[0] }}
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
                    ? 'Nom du fichier : ' + (object.wording)
                    : object.wording
                }
              </Text>


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

                    <View
                      style={{ flexDirection: 'row', alignSelf: 'center', alignItems: 'center', flex: 1, top: -70, width: 250, backgroundColor: 'rgba(52, 52, 52, alpha)' }}>

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

                    {/* <Button mt={1} mb={2}
                      rounded="xl"
                      onPress={() => {
                        saveAttachment();
                      }}
                      isLoading={isSaving}
                      isLoadingText="Enregistrement en cours..."
                    >
                      ENREGISTRER
                    </Button> */}

                    {
                      (type_object && !(selectedAttachment && selectedAttachment?.url && (selectedAttachment?.url.includes('http') || selectedAttachment?.url.includes('https')))) ?
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
              <Button mt={1} mb={2}
                rounded="xl"
                onPress={() => { deleteImage(selectedAttachment); }}
                isLoading={isDeleting}
                isLoadingText={"Suppression en cours..."}
                isDisabled={!(selectedAttachment && selectedAttachment?.url) || isSyncing}
                bgColor={'red.500'}
              >
                Supprimer
              </Button>

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


      {/* LIST ATTACHMENT */}
      <SafeAreaView >
        <View>
          {attachments && attachments.map((elt: any, index: number) => itemAttachments(elt, index))}
        </View>
        {((object && object.wording != "En cours" && type_object) && ([null, undefined].includes(attachments) || (attachments && attachments.length < 3))) && (<View>
          <ItemAttachment
            key={`attachments.length`}
            item={{ order: ([null, undefined].includes(attachments)) ? 0 : attachments.length }}
            onPress={() => {
              setSelectedAttachment({ order: ([null, undefined].includes(attachments)) ? 0 : attachments.length });
              setAttachmentLoaded(true);
            }}
          />
        </View>)}

      </SafeAreaView>
      {/* END LIST ATTACHMENT */}


      {/* <Button.Group
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

      </Button.Group> */}

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
});