import React, { useEffect, useState } from 'react';
import { Heading, HStack, Pressable, View, Box } from 'native-base';
import {
    RefreshControl, Text, StyleSheet, TouchableOpacity,
    Dimensions, Image, ScrollView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SmallCard from 'components/SmallCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import * as Linking from 'expo-linking';
import { EXPO_PUBLIC_ANDROID_VERSION_CODE } from '@env'
import { Layout } from '../../../components/common/Layout';
import { PrivateStackParamList } from '../../../types/navigation';
import { moneyFormat } from '../../../utils/functions';
import SubprojectAPI from '../../../services/subprojects/subprojects';
import { getData } from '../../../utils/storageManager';
import { Subproject } from '../../../models/subprojects/Subproject';
import moment from 'moment';

const colors = ['primary.600', 'orange', 'lightblue', 'purple'];

function AppDetail({ route }: { route: any }) {
    const navigation =
        useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
    const { storeProject: storeProjectParam } = route.params;
    const [storeProject, setStoreProject] = useState(storeProjectParam);
    const village = route.params?.village;
    const [totalEstimatedCost, setTotalEstimatedCost] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
    const [connected, setConnected] = useState(true);
    const [errorVisible, setErrorVisible] = React.useState(false);
    const onDismissSnackBar = () => setErrorVisible(false);

    const check_network = async () => {
        NetInfo.fetch().then((state) => {
            if (!state.isConnected) {
                setErrorMessage("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
                setErrorVisible(true);
                setConnected(false);
            }
        });
    }


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

    return (
        <Layout disablePadding style={{ backgroundColor: 'white' }}>
            <ScrollView _contentContainerStyle={{ pt: 7, px: 5 }}
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
                                <Text style={{ fontWeight: "bold" }} fontSize="2xs" color="white">
                                    {storeProject.name}
                                </Text>
                                <Text fontWeight="bold" fontSize="2xs" color="white">
                                    {storeProject.package}
                                </Text>
                            </Box>
                            <Box
                                style={{ alignSelf: 'flex-end', justifyContent: 'flex-end' }}
                                px={3}
                                mt={3}
                                bg={
                                    (storeProject.app && storeProject.app.version_code > EXPO_PUBLIC_ANDROID_VERSION_CODE)
                                        ? 'primary.500'
                                        : 'grey'
                                }
                                rounded="xl"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Text fontWeight="bold" fontSize="2xs" color="white" style={{ color: 'white' }} >
                                    {
                                        (storeProject.app && storeProject.app.version_code > EXPO_PUBLIC_ANDROID_VERSION_CODE)
                                            ? 'Mettre à jour'
                                            : 'A jour'
                                    }
                                </Text>
                            </Box>
                        </View>
                    </View>

                    <View>
                        <TouchableOpacity
                            style={{ width: '60%', marginLeft: 'auto', marginRight: 'auto' }}
                            onPress={() => {
                                if (storeProject.app && storeProject.app.version_code > EXPO_PUBLIC_ANDROID_VERSION_CODE) {
                                    Linking.openURL(`${storeProject.app.apk_aws_s3_url.split("?")[0]}`)
                                } else {
                                    //
                                }
                            }} disabled={!(storeProject.app && storeProject.app.version_code > EXPO_PUBLIC_ANDROID_VERSION_CODE)}>
                            <Box
                                px={3}
                                mt={3}
                                bg={
                                    (storeProject.app && storeProject.app.version_code > EXPO_PUBLIC_ANDROID_VERSION_CODE)
                                        ? 'primary.500'
                                        : 'grey'
                                }
                                rounded="xl"
                                fontWeight={'bold'}
                            >
                                <Text style={{ color: 'white', marginLeft: 'auto', marginRight: 'auto', fontWeight: 'bold', fontSize: 20 }}>
                                    {
                                        (storeProject.app && storeProject.app.version_code > EXPO_PUBLIC_ANDROID_VERSION_CODE)
                                            ? 'Mettre à jour'
                                            : 'A jour'
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
                            Description
                        </Text>
                        <Text>
                            {storeProject.description}
                        </Text>
                    </View>

                    <View style={{ padding: 20 }}>
                        {
                            (storeProject.app)
                            && <View>
                                <Text>Version : {storeProject.app.app_version}</Text>
                                {storeProject.app.apk_aws_s3_url && <Text>url :
                                    <TouchableOpacity onPress={() => Linking.openURL(`${storeProject.app.apk_aws_s3_url.split("?")[0]}`)}>
                                        <Text style={{width: Dimensions.get('window').width - 50 }}>{storeProject.app.apk_aws_s3_url}</Text>
                                    </TouchableOpacity>
                                </Text>}
                            </View>
                        }
                    </View>


                </View>

            </ScrollView>
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
