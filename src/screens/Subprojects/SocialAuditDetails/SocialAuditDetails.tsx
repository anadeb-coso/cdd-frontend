import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heading, HStack, Pressable, ScrollView, View } from 'native-base';
import { RefreshControl, Text, StyleSheet } from 'react-native';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import { Layout } from '../../../components/common/Layout';
import { Subproject } from '../../../models/subprojects/Subproject';
import SubprojectAPI from '../../../services/subprojects/subprojects';
import { getData } from '../../../utils/storageManager';
import NetInfo from '@react-native-community/netinfo';
import Content from './Components/Content';


function SocialAuditDetails({ route }: { route: any }) {
    const { t } = useTranslation(['subprojects', 'common']);
    const [loading, setLoading] = useState(false);
    const [errorVisible, setErrorVisible] = React.useState(false);
    const [errorMessage, setErrorMessage] = useState(t('common:no_internet'));
    const [connected, setConnected] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const { subproject: subprojectParam } = route.params;
    const [subproject, setSubproject] = useState(subprojectParam as Subproject);
    const [enableToUpdate, setEnableToUpdate] = useState(false);

    const onDismissSnackBar = () => setErrorVisible(false);

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

    const get_subproject = async () => {
        //Get Subproject
        setLoading(true);
        setConnected(true);
        await check_network();
        if (connected) {
            await new SubprojectAPI()
                .get_subproject(
                    {
                        username: JSON.parse(await getData('username')),
                        password: JSON.parse(await getData('password')), 
                        user: {
                            username: JSON.parse(await getData('username')),
                            email: JSON.parse(await getData('email'))
                        }
                    }, JSON.parse(await getData('access')), subprojectParam.id)
                .then(async (reponse: any) => {
                    if (reponse.error) {
                        setLoading(false);
                        return;
                    }
                    setSubproject(reponse as Subproject);
                    setLoading(false);
                })
                .catch(error => {
                    console.error(error);
                    setLoading(false);
                });
            setLoading(false);
            //End Get Subproject
        }
    }


    const get_groups_infos = async () => {
              
        // Verify if one group exists on groups
        let groups = JSON.parse(await getData('groups'));
        setEnableToUpdate(() => {
            if (groups && groups?.length > 0 && (
                    groups.includes('Facilitator') || 
                    groups.includes('CommunityFacilitator') || 
                    groups.includes('TechnicalFacilitator') || 
                    groups.includes('Superuser') || 
                    groups.includes('FullStack') || 
                    groups.includes('Infra') || 
                    groups.includes('Admin') || 
                    groups.includes('Evaluator') || 
                    groups.includes('EnableToUpdate')
                )){
                return true;
            }
            return false;
        });

    }

    useEffect(() => {
        get_groups_infos();
        
    }, []);


    const onRefresh = () => {
        setRefreshing(true);
        get_groups_infos();
        get_subproject();
        setRefreshing(false);
    };

    if (loading) {
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
        <Layout disablePadding>
            <HStack mb={3} space="5" justifyContent="space-between"
                style={{
                    position: 'relative',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 30,
                    zIndex: 2,
                    backgroundColor: 'white',
                    elevation: 8
                }}
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
                        <Text>{subproject.full_title_of_approved_subproject}</Text>
                        <Text>{'\n'}</Text>
                        <Text>
                            <Text style={styles.text_title}>{t('shared.structure_label')}</Text>
                            <Text>{subproject.type_of_subproject}</Text>
                        </Text>
                        <Text>{'\n'}</Text>
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
                    </Text>


                </Pressable>
            </HStack>
            <ScrollView _contentContainerStyle={{ px: 5 }}
                nestedScrollEnabled={true}
                style={{ zIndex: 1 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }>

                <Content 
                    enableToUpdate={enableToUpdate}
                    subproject={subproject} onRefresh={onRefresh} />

                <Snackbar visible={errorVisible} duration={3000} onDismiss={onDismissSnackBar}>
                    {errorMessage}
                </Snackbar>

            </ScrollView>
        </Layout>
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

export default SocialAuditDetails;
