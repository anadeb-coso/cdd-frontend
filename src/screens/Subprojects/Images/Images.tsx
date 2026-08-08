import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heading, HStack, Pressable, ScrollView, View, Box } from 'native-base';
import { RefreshControl, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import { Layout } from '../../../components/common/Layout';
import { PrivateStackParamList } from '../../../types/navigation';
import { moneyFormat } from '../../../utils/functions';
import SubprojectAPI from '../../../services/subprojects/subprojects';
import SubprojectFileAPI from '../../../services/subprojects/file';
import { getData } from '../../../utils/storageManager';
import { Subproject } from '../../../models/subprojects/Subproject';
import { FileComment } from '../../../models/subprojects/FileComment';
import moment from 'moment';
import AttachmentsComponent from "../../../components/AttachmentsComponent";
import LoadingScreen from '../../../components/LoadingScreen';

const colors = ['primary.600', 'orange', 'lightblue', 'purple'];

function Images({ route }: { route: any }) {
    const { t } = useTranslation(['subprojects', 'common']);
    const navigation =
        useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
    const { subproject: subprojectParam } = route.params;
    const [subproject, setSubproject] = useState(subprojectParam);
    // const [fileComments, setFileComments] = useState<FileComment[]>([]);
    const village = route.params?.village;
    const [totalEstimatedCost, setTotalEstimatedCost] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState(t('common:no_internet'));
    const [connected, setConnected] = useState(true);
    const [errorVisible, setErrorVisible] = React.useState(false);
    const onDismissSnackBar = () => setErrorVisible(false);
    const [isLoading, setLoading] = useState(false);
    const [showAddAttachment, setShowAddAttachment] = useState(false);
    
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

    const modules = [
        {
            'url': 'TrackingSubprject',
            'name': t('list_modules.tracking_subproject')
        },
        {
            'url': 'TakeGeolocation',
            'name': subproject.link_to_subproject ? t('list_modules_infrastructure.geolocation_title') : t('list_modules.geolocation_subproject')
        }
    ]
    if (subproject?.subprojects_linked) {
        modules.push({
            'url': 'ListInfrastructures',
            'name': t('list_modules.manage_linked_infrastructures')
        });
    }
    modules.push({
        'url': 'ListInfrastructures',
        'name': t('list_modules.files_title')
    });

    const get_groups_infos = async () => {
        
        // Verify if one group exists on groups
        let groups = JSON.parse(await getData('groups'));
        setShowAddAttachment(() => {
            if (groups && groups?.length > 0) {
                return true;
            }
            return false;
        });

    }

    const total_cost = async () => {

        if (subproject.subprojects_linked) {
            let cost = subproject.estimated_cost;
            subproject.subprojects_linked.forEach((elt: any) => {
                cost += elt.estimated_cost;
            });
            setTotalEstimatedCost(cost);
        }
    }

    useEffect(() => {
        get_groups_infos();
        total_cost();
    }, [subproject]);



    const onRefresh = async () => {
        setRefreshing(true);
        await get_groups_infos();
        setConnected(true);
        await check_network();
        //Get Subproject
        await new SubprojectAPI()
            .get_subproject(
                {
                    username: JSON.parse(await getData('username')),
                    password: JSON.parse(await getData('password')), 
                    user: {
                        username: JSON.parse(await getData('username')),
                        email: JSON.parse(await getData('email'))
                    }
                }, JSON.parse(await getData('access')), subproject.id)
            .then(async (reponse: any) => {
                if (reponse.error) {
                    setRefreshing(false);
                    return;
                }
                setSubproject(reponse as Subproject);
                total_cost();
                setRefreshing(false);

            })
            .catch(error => {
                setRefreshing(false);
                console.error(error);
            });
        //End Get Subproject

    };


    // const get_file_comments = async (file_id: number) => {
    //     setFileComments([]);
    //     setLoading(true);
    //     setConnected(true);
    //     await check_network();
    //     //Get Subproject
    //     await new SubprojectFileAPI()
    //         .get_file_comments(
    //             {
    //                 username: JSON.parse(await getData('username')),
    //                 password: JSON.parse(await getData('password')), 
    //                 user: {
    //                     username: JSON.parse(await getData('username')),
    //                     email: JSON.parse(await getData('email'))
    //                 }
    //             }, JSON.parse(await getData('access')), file_id)
    //         .then(async (reponse: any) => {
    //             setLoading(false);
    //             if (reponse.error) {
    //                 return;
    //             }
    //             setFileComments(reponse as FileComment[]);

    //         })
    //         .catch(error => {
    //             setFileComments([]);
    //             setLoading(false);
    //             console.error(error);
    //         });
    //     //End Get Subproject

    // };


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
        <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
          <HStack mb={3} space="5" justifyContent="space-between" 
                    style={{position: 'relative',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 30,
                    zIndex: 2,
                    backgroundColor: 'white',
                    elevation: 8}}
                >
                    <Pressable
                        p={3}
                        flex={1}
                        bg="light"
                        rounded="xl"
                        shadow={3}
                        onPress={() => console.log('pressed')}
                    >
                        <Text>
                            <Text style={styles.text_title}>{t('shared.subproject_label')}</Text>
                            <Text>{ subproject.full_title_of_approved_subproject }</Text>
                        </Text>
                        <Text>
                            <Text style={styles.text_title}>{t('shared.structure_label')}</Text>
                            <Text>{subproject.type_of_subproject}</Text>
                        </Text>
                        <Text>
                            <Text style={styles.text_title}>{t('shared.locality_label')}</Text>
                            <Text>
                                {
                                    subproject.location_subproject_realized ?
                                        subproject.location_subproject_realized.name
                                        : subproject.canton ?
                                            subproject.canton.name
                                            : subproject.cvd ?
                                                subproject.cvd.name
                                                : t('common:not_found')
                                }
                            </Text>
                        </Text>


                    </Pressable>
                </HStack>


        <View style={{ flex: 1 }}>

            <AttachmentsComponent 
                showAdd={showAddAttachment}
                attachmentsParams={subproject.files ?? []}
                object={subproject}
                type_object={null}
                subproject={subproject}
                width={Dimensions.get('window').width/2}
                height={200}
                // get_file_comments={get_file_comments}
                // fileComments={fileComments}
            />

            {(!subproject.files || (subproject.files && subproject.files.length == 0)) && <Text style={{textAlign: 'center', marginTop: 50}}>{t('images.no_image_available')}</Text>}

            <Snackbar visible={errorVisible} duration={3000} onDismiss={onDismissSnackBar}>
                {errorMessage}
            </Snackbar>
        </View>
        
        <LoadingScreen visible={isLoading} />

    </ScrollView>
    );
}

const styles = StyleSheet.create({
    text_title: {
        fontSize: 16,
        // fontFamily: "body",
        fontWeight: 'bold',
        color: "black",
    }
});
export default Images;
