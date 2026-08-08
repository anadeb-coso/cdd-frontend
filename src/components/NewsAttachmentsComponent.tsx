import React from "react";
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, View, Keyboard, TouchableOpacity, Text, ImageBackground, ScrollView } from "react-native";
import { Box } from 'native-base';
import { Feather, Entypo } from "@expo/vector-icons";
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
import NewsFilesAPI from "../services/news/newsfiles";
import LoadingScreen from './LoadingScreen';
import { getImageDimensions, getImageSize } from '../utils/functions_native';
import { image_compress } from "../utils/functions";
import { uploadFile } from '../services/upload';
import AuthContext from '../contexts/auth';
import { baseURL } from '../services/API';
import { requestMediaLibraryPermissionsAsync, requestCameraPermissionsAsync, requestCameraPermission } from "../utils/permissions";

const theme = {
  roundness: 12,
  colors: {
    background: 'white',
    placeholder: '#dedede',
    text: '#707070',
  },
};


const NewsAttachmentsComponent = ({ attachments, setAttachments, width = 80, height = 80 }: {
  attachments: any; setAttachments: (e: any) => void; width?: any; height?: any;
}) => {
  const { t } = useTranslation(['components', 'common']);
  const { user, signOut } = useContext(AuthContext);
  const toast = useToast();
  const [selectedAttachment, setSelectedAttachment]: any = useState(null);
  const [attachmentLoaded, setAttachmentLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [attachmentToDeleteLoaded, setAttachmentToDeleteLoaded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    requestCameraPermissionsAsync();
    // requestCameraPermission();
    requestMediaLibraryPermissionsAsync();
  }, []);


  const openUrl = (url: any) => {
    Linking.openURL(url);
  };


  async function insertAttachment(elt: any) {
    let result = elt.result;
    let order = elt.order;
    let filename = elt.name;

    let localUri = (!result) ? null : result.uri ?? (result.assets ? result.assets[0].uri : null);
    const type = (!result) ? null : (result.mimeType ?? (result.assets ? result.assets[0].type ?? result.assets[0].mimeType : null));
    let width = (!result) ? 1000 : result.width ?? (result.assets ? result.assets[0].width : 1000);
    let height = (!result) ? 1000 : result.height ?? (result.assets ? result.assets[0].height : 1000);

    setIsSaving(true);
    const updatedAttachments = [...attachments];
    if (localUri && localUri.includes("file://")) {
      try {
        setIsLoading(true);
        if (type && (type.toLowerCase().includes('image') || type.toLowerCase().includes('img'))) {
          const imageSize: any = await getImageSize(localUri);

          if (imageSize && imageSize >= 1) {
            const dimensions: any = await getImageDimensions(localUri);
            width = width ?? dimensions.width;
            height = height ?? dimensions.height;
            const manipResult = await ImageManipulator.manipulateAsync(
              localUri,
              [{ resize: { width: width, height: height } }],
              { compress: image_compress(imageSize) }
            );
            localUri = manipResult.uri;
          }


        }

        updatedAttachments[order] = {
          ...updatedAttachments[order],
          name: filename,
          localUri: localUri,
          url: localUri,
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
            description: t('news_attachments_component.file_not_on_device'),
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
            {t('news_attachments_component.add_attachment_button')}
          </Button>
          <View style={styles.iconButtonStyle}>
            <IconButton icon="camera" size={24} onPress={props.onPressTakePicture} />
          </View>
        </View>
      </>
    );
  }


  const ItemAttachment = ({ item, onPress }: { item: any; onPress: () => void; }) => {

    if ((item.url)) {
      return (
        <TouchableOpacity
          onPress={onPress}
          key={item.order ?? item.id}
          style={{
            borderColor: item.url.includes('file://') ? 'red' : 'green',
            borderWidth: 5,
            height: height + 4,
            width: width + 4,
            marginVertical: 20,
            marginHorizontal: 3,
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
              height: height,
              width: width,
              alignSelf: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setSelectedAttachment(item);
                setAttachmentToDeleteLoaded(true);
              }}
              style={{
                alignItems: 'center',
                padding: 2,
                backgroundColor: 'rgba(255, 1, 1, 1)',
              }}
            >
              <Text style={{ color: 'white' }}>X</Text>
            </TouchableOpacity>
          </ImageBackground>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={onPress}
        key={`${item.order ?? item.id}_${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}`}
        style={{}}
      >
        <ImageBackground
          key={`${item.id}_${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}`}
          source={require('../../assets/illustrations/plus.png')}
          style={{
            height: height,
            width: width,
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
                    count++;
                  } else if (response.file) {
                    toast.show({
                      description: response.file[0],
                      duration: 5000
                    });
                  } else {
                    toast.show({
                      description: t('news_attachments_component.attachment_maybe_not_found', { name: elt.name }),
                      duration: 5000
                    });
                  }
                  let parameter = {
                    ...elt,
                    username: JSON.parse(await getData('username')),
                    user_email: JSON.parse(await getData('email')),
                    password: JSON.parse(await getData('password'))
                  };


                  await new NewsFilesAPI()
                    .save_new_file(parameter)
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
                        url: elt?.url
                      };
                      count++;
                    })
                    .catch(error => {
                      console.error(error);
                      error = true;
                    });





                } catch (e) {
                  console.error("e");
                  console.error(e);
                }
              }

            } catch (e) {
              setIsSyncing(false);
              toast.show({
                description: t('news_attachments_component.attachment_not_found', { name: elt.name }),
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
            description: t('news_attachments_component.attachment_synced_success'),
          });
        } else {
          toast.show({
            description: t('news_attachments_component.attachments_synced_success'),
          });
        }

      } else {
        if (error) {
          toast.show({
            description: t('news_attachments_component.no_sync_done'),
          });
        }
      }

    } catch (e) {
      setIsSyncing(false);
      toast.show({
        description: t('news_attachments_component.please_add_all_attachments'),
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
          description: t('news_attachments_component.file_deleted_success'),
        });
        setAttachmentToDeleteLoaded(false);
      } else {
        await new NewsFilesAPI()
          .delete_new_file({
            url: item.url,
            username: JSON.parse(await getData('username')),
            password: JSON.parse(await getData('password'))
          })
          .then(async (reponse: any) => {
            removeItemOnAttachment(item);
            setAttachmentToDeleteLoaded(false);
            if (reponse.error) {
              toast.show({
                description: t('news_attachments_component.error_try_later'),
              });
              return;
            }
            toast.show({
              description: t('news_attachments_component.file_deleted_success'),
            });
          })
          .catch(error => {
            console.error(error);
          });
      }
    } else {
      toast.show({
        description: t('news_attachments_component.file_not_found'),
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
      let elt = { ...selectedAttachment, result: result, url: result?.uri ?? (result.assets ? result.assets[0].uri : null), order: order, name: moment().format('YYYY-MM-DD HH:mm:ss.SSS'), file_type: null };
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
        type: ["image/*"],
        multiple: false,
      }) as any;
      if (!result.canceled && (result?.uri || (result.assets && result.assets.length))) {
        let elt = { ...selectedAttachment, result: result, url: result?.uri ?? (result.assets ? result.assets[0].uri : null), order: order, name: moment().format('YYYY-MM-DD HH:mm:ss.SSS'), file_type: null };
        setSelectedAttachment(elt);
        saveAttachment(elt);
        setAttachmentLoaded(true);
      }

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
                ? t('news_attachments_component.attachment_details_title')
                : t('news_attachments_component.select_file_source_title')
            }
          </Modal.Header>

          <Modal.Body>
            <VStack space="sm">
              <Text>
                {
                  (selectedAttachment && selectedAttachment?.url)
                    ? t('news_attachments_component.file_name_label', { name: selectedAttachment.name })
                    : t('news_attachments_component.file_default_label')
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


                    {
                      (!(selectedAttachment && selectedAttachment?.url && (selectedAttachment?.url.includes('http') || selectedAttachment?.url.includes('https')))) ?
                        <>
                          <Button mt={1} mb={2}
                            rounded="xl"
                            onPress={() => { uploadImages(selectedAttachment.order); }}
                            isLoading={isSyncing}
                            isLoadingText={t('news_attachments_component.syncing_in_progress')}
                            isDisabled={selectedAttachment && selectedAttachment?.url && (selectedAttachment?.url.includes('http') || selectedAttachment?.url.includes('https'))}
                          >
                            {t('news_attachments_component.sync_button')}
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
                              {t('common:delete')}
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
                          {t('common:delete')}
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
                {t('common:cancel')}
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
                ? t('news_attachments_component.confirm_delete_file_title')
                : t('news_attachments_component.file_source_not_found_title')
            }
          </Modal.Header>

          <Modal.Body>
            <VStack space="sm">
              <Button mt={1} mb={2}
                rounded="xl"
                onPress={() => { deleteImage(selectedAttachment); }}
                isLoading={isDeleting}
                isLoadingText={t('news_attachments_component.deleting_in_progress')}
                isDisabled={!(selectedAttachment && selectedAttachment?.url) || isSyncing}
                bgColor={'red.500'}
              >
                {t('common:delete')}
              </Button>

              <Button
                style={{ backgroundColor: '#dcdcdc' }}

                color="#ffffff"
                rounded="xl"
                onPress={() => {
                  setAttachmentToDeleteLoaded(false);
                }}
              >
                {t('common:cancel')}
              </Button>
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      {/* End Delete Modal */}


      {/* LIST ATTACHMENT */}
      <SafeAreaView style={{}}>
        <View style={{ flexDirection: 'row' }}>

          <ScrollView horizontal={true} style={styles.scrollViewcontainer}>

            {/* {[1, 2, 3, 4, 5].map((e, index) => (
            <View key={index} style={styles.item}>
              <Text>{e}</Text>
            </View>
          ))} */}

            <ItemAttachment
              key={`attachments.lengt0h`}
              item={{ order: ([null, undefined].includes(attachments)) ? 0 : attachments.length }}
              onPress={() => {
                setSelectedAttachment({ order: ([null, undefined].includes(attachments)) ? 0 : attachments.length });
                setAttachmentLoaded(true);
              }}
            />


            {attachments && attachments.map((elt: any, index: number) => itemAttachments(elt, index))}


          </ScrollView>
        </View>

      </SafeAreaView>
      {/* END LIST ATTACHMENT */}



      {/* END MANAGEMENT ATTACHMENT */}

      <LoadingScreen visible={isLoading} />
    </View >
  );
};
export default NewsAttachmentsComponent;

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
  scrollViewcontainer: {
    // flexDirection: 'row', // Affichage en ligne
    // padding: 10,
    // width: '100%',
    // alignContent: 'center',
    // alignSelf: 'center'
  },
  item: {
    marginRight: 10,
    padding: 20,
    backgroundColor: '#ccc',
  },
});