import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heading, HStack, Pressable, View, Box } from 'native-base';
import {
    RefreshControl, Text, StyleSheet, TouchableOpacity,
    Dimensions, Image, ScrollView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Snackbar, List } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import { useToast } from 'native-base';
import { FontAwesome } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import Clipboard from '@react-native-clipboard/clipboard';
import { EXPO_PUBLIC_ANDROID_VERSION_CODE, EXPO_PUBLIC_PACKAGE } from '../../../services/env'
import { Layout } from '../../../components/common/Layout';
import { PrivateStackParamList } from '../../../types/navigation';
import { downloadFile } from '../../../utils/download';
import { requestWriteANdInstallPermissions } from '../../../utils/permissions';

const colors = ['primary.600', 'orange', 'lightblue', 'purple'];

function AppDetail({ route }: { route: any }) {
    const { t } = useTranslation(['store_app', 'common']);
    const navigation =
        useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
    const { storeProject: storeProjectParam } = route.params;
    const [storeProject, setStoreProject] = useState(storeProjectParam);
    const village = route.params?.village;
    const [totalEstimatedCost, setTotalEstimatedCost] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState(t('common:no_internet'));
    const [connected, setConnected] = useState(true);
    const [errorVisible, setErrorVisible] = React.useState(false);
    const onDismissSnackBar = () => setErrorVisible(false);
    const [snackbarVisible, setSnackbarVisible] = React.useState(false);

    const toast = useToast();

    const check_network = async () => {
        NetInfo.fetch().then((state) => {
            if (!state.isConnected) {
                setErrorMessage(t('common:no_network'));
                setErrorVisible(true);
                setConnected(false);
            }else if(!state.isInternetReachable){
                setErrorMessage(t('common:no_internet'));
                setErrorVisible(true);
                setConnected(false);
            }
        });
    }


    
  useEffect(() => {
    requestWriteANdInstallPermissions();
    check_network();
  }, [check_network]);

    const showImage = (uri: string, width: number, height: number) => {
        if (uri) {
            if (uri.includes(".pdf")) {
                return (
                    <View>
                        <Image
                            resizeMode="stretch"
                            style={{ width: width, height: height, borderRadius: 10 }}
                            source={require('../../../../assets/illustrations/pdf.png')}
                        />
                    </View>
                );
            } else if (uri.includes(".docx") || uri.includes(".doc")) {
                return (
                    <View>
                        <Image
                            resizeMode="stretch"
                            style={{ width: width, height: height, borderRadius: 10 }}
                            source={require('../../../../assets/illustrations/docx.png')}
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
                    source={require('../../../../assets/illustrations/file.png')}
                />
            </View>
        );
    }


    if (refreshing) {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#24c38b" />
                </View>
                <Snackbar visible={errorVisible} duration={3000} onDismiss={onDismissSnackBar}>
                    {errorMessage}
                </Snackbar>
            </View>
        );
    }

    const _download = async (_uri: any) => {
        setSnackbarVisible(true);
        await downloadFile(_uri, true);
        setSnackbarVisible(false);
    }

    return (
        <Layout disablePadding style={{ backgroundColor: 'white' }}>
            <ScrollView contentContainerStyle={{ paddingTop: 7, paddingHorizontal: 5 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} />
                }>
                <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 0.3 }}>
                            {
                                showImage(
                                    (storeProject.image) ? storeProject.image : null,
                                    150, 150)
                            }
                        </View>
                        <View style={{ flex: 0.7 }}>
                            <Box
                                px={3}
                                mt={3}
                                bg="white"
                                rounded="xl"
                                fontWeight={'bold'}
                            >
                                <Text style={{ fontWeight: "bold" }} >
                                    {storeProject.name}
                                </Text>
                                <Text>
                                    {storeProject.package}
                                </Text>
                            </Box>
                            <Box
                                style={{ alignSelf: 'flex-end', justifyContent: 'flex-end' }}
                                px={3}
                                mt={3}
                                bg={
                                    (EXPO_PUBLIC_PACKAGE == storeProject.package) ? ((storeProject.app && storeProject.app.version_code > EXPO_PUBLIC_ANDROID_VERSION_CODE)
                                        ? 'primary.500'
                                        : 'grey') : 'primary.500'
                                }
                                rounded="xl"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Text style={{ color: 'white' }} >
                                    {
                                        (EXPO_PUBLIC_PACKAGE == storeProject.package) ? ((storeProject.app && storeProject.app.version_code > EXPO_PUBLIC_ANDROID_VERSION_CODE)
                                            ? t('store_app_common.update_button')
                                            : t('store_app_common.up_to_date')) : t('store_app_common.other_app')
                                    }
                                </Text>
                            </Box>
                        </View>
                    </View>

                    <View>
                        <TouchableOpacity
                            style={{ width: '60%', marginLeft: 'auto', marginRight: 'auto' }}
                            onPress={() => {
                                if (EXPO_PUBLIC_PACKAGE == storeProject.package && storeProject.app && storeProject.app.version_code > EXPO_PUBLIC_ANDROID_VERSION_CODE) {
                                    Linking.openURL(`${storeProject.app.apk_aws_s3_url.split("?")[0]}`)
                                } else if (EXPO_PUBLIC_PACKAGE != storeProject.package) {
                                    Linking.openURL(`${storeProject.app.apk_aws_s3_url.split("?")[0]}`)
                                } else {
                                    //
                                }
                            }}
                            disabled={
                                (() => {
                                    if (EXPO_PUBLIC_PACKAGE == storeProject.package && storeProject.app && storeProject.app.version_code > EXPO_PUBLIC_ANDROID_VERSION_CODE) {
                                        return false;
                                    } else if (EXPO_PUBLIC_PACKAGE != storeProject.package) {
                                        return false;
                                    } else {
                                        return true;
                                    }
                                })()
                            }>
                            <Box
                                px={3}
                                mt={3}
                                p={1}
                                bg={
                                    (EXPO_PUBLIC_PACKAGE == storeProject.package) ? ((storeProject.app && storeProject.app.version_code > EXPO_PUBLIC_ANDROID_VERSION_CODE)
                                        ? 'primary.500'
                                        : 'grey') : 'primary.500'
                                }
                                rounded="xl"
                                fontWeight={'bold'}
                            >
                                <Text style={{ color: 'white', marginLeft: 'auto', marginRight: 'auto', fontWeight: 'bold', fontSize: 20 }}>
                                    {
                                        (EXPO_PUBLIC_PACKAGE == storeProject.package) ? ((storeProject.app && storeProject.app.version_code > EXPO_PUBLIC_ANDROID_VERSION_CODE)
                                            ? <View style={{ flexDirection: 'row' }}>
                                                <View>
                                                    <List.Icon icon={'download'} color={'white'} />
                                                </View>
                                                <View>
                                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>{t('store_app_common.update_button')}</Text>
                                                </View>
                                            </View>
                                            : t('store_app_common.up_to_date')) : <View style={{ flexDirection: 'row' }}>
                                            <View>
                                                <List.Icon icon={'download'} color={'white'} />
                                            </View>
                                            <View>
                                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>{t('store_app_common.download_button')}</Text>
                                            </View>
                                        </View>
                                    }
                                </Text>
                            </Box>
                        </TouchableOpacity>
                    </View>

                    <View style={{ padding: 10 }}>
                        {
                            (storeProject.app && storeProject.app.version_code > EXPO_PUBLIC_ANDROID_VERSION_CODE)
                            && <Text>{storeProject.app.description}</Text>
                        }
                        <Text style={{ fontWeight: 'bold', fontSize: 20 }}>
                            {t('app_detail.description_heading')}
                        </Text>
                        <Text>
                            {storeProject.description}
                        </Text>
                    </View>

                    <View style={{ padding: 20 }}>
                        {
                            (storeProject.app)
                            && <View>
                                <Text>{t('app_detail.version_label', { version: storeProject.app.app_version })}</Text>
                                {storeProject.app.apk_aws_s3_url && <View style={{flexDirection: 'column', }}><Text>{t('app_detail.url_label')}</Text>
                                    <View style={{flexDirection: 'row', }}>
                                    <TouchableOpacity style={{flex: 0.9}}
                                        onPress={() => {
                                            Linking.openURL(`${storeProject.app.apk_aws_s3_url.split("?")[0]}`)
                                        }}
                                        onLongPress={() => {
                                            
                                            Clipboard.setString(`${storeProject.app.apk_aws_s3_url.split("?")[0]}`);
                                            toast.show({
                                                description: t('store_app_common.link_copied'),
                                            });
                                            
                                        }}
                                    >
                                        <Text style={{ width: Dimensions.get('window').width - 50 }}>{storeProject.app.apk_aws_s3_url.split("?")[0]}</Text>
                                    </TouchableOpacity>
                                    <FontAwesome style={{flex: 0.1, alignSelf: 'flex-end', marginEnd: -10, marginBottom: 15 }}
                                        onPress={() => {
                                            
                                            Clipboard.setString(`${storeProject.app.apk_aws_s3_url.split("?")[0]}`);
                                            toast.show({
                                                description: t('store_app_common.link_copied'),
                                            });
                                            
                                        }} name="copy" size={15} color="green" />
                                    </View>
                                </View>}
                                {storeProject.playstore_url && <Text>{t('app_detail.playstore_label')}
                                    <TouchableOpacity onPress={() => {
                                        Linking.openURL(storeProject.playstore_url)
                                    }}>
                                        <Text style={{ width: Dimensions.get('window').width - 50 }}>{storeProject.playstore_url}</Text>
                                    </TouchableOpacity>
                                </Text>}
                            </View>
                        }
                    </View>


                </View>

            </ScrollView>


            <Snackbar visible={snackbarVisible} duration={10000000000}
                style={{ backgroundColor: 'green' }}
                onDismiss={() => { setSnackbarVisible(false); }}>
                <View style={{ flexDirection: 'row', marginTop: 7 }}>
                    <View>
                        <List.Icon icon={'download'} color={'white'} />
                    </View>
                    <View>
                        <Text style={{ color: 'white' }}>{t('store_app_common.downloading_message')}</Text>
                    </View>
                </View>
            </Snackbar>
        </Layout >
    );
}

const styles = StyleSheet.create({
    text_title: {
        fontSize: 16,
        // fontFamily="body"
        fontWeight: 'bold',
        color: "black",
    }
});
export default AppDetail;
