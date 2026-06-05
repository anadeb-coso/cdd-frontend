import React, { useEffect, useState } from 'react';
import { Heading, HStack, Pressable, ScrollView, View } from 'native-base';
import { RefreshControl, Text, StyleSheet } from 'react-native';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import { Layout } from '../../../components/common/Layout';
import { Subproject } from '../../../models/subprojects/Subproject';
import SubprojectAPI from '../../../services/subprojects/subprojects';
import { getData } from '../../../utils/storageManager';
import NetInfo from '@react-native-community/netinfo';
import Content from './Components/Content';
import AdministrativelevlsAPI from '../../../services/administrativelevls/administrativelevls';
import { AdministrativeLevel } from '../../../models/administrativelevels/AdministrativeLevel';

function CompaniesDetails({ route }: { route: any }) {
    const [loading, setLoading] = useState(false);
    const [errorVisible, setErrorVisible] = React.useState(false);
    const [errorMessage, setErrorMessage] = useState("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
    const [connected, setConnected] = useState(true);
    const [administrativelevels, setAdministrativelevels] = useState(Array<AdministrativeLevel>());
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const { subproject: subprojectParam } = route.params;
    const [subproject, setSubproject] = useState(subprojectParam as Subproject);
    const [enableToUpdate, setEnableToUpdate] = useState(false);

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

    const check_is_its_fields = (elements: Array<string>) => {
        return elements.findIndex((item: string) => {
            return (subprojectParam.type_of_subproject ?? "").startsWith(item);
        }) != -1;
    };

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

    const get_administrativelevls = async () => {

        setLoading(true);
        setConnected(true);
        await check_network();
        if (connected) {
            try {
                await new AdministrativelevlsAPI()
                    .get_administrativelevels(
                        {
                            username: JSON.parse(await getData('username')),
                            password: JSON.parse(await getData('password'))
                        }, "Village", null, page, 1000)
                    .then(async (response: any) => {
                        if (response.error) {
                            setLoading(false);
                            return;
                        }
                        // "count": 3,
                        // "next": null,
                        // "previous": null,
                        // results
                        setAdministrativelevels(response.results as Array<AdministrativeLevel>);
                        setPage(1);
                        setLoading(false);
                    })
                    .catch(error => {
                        setLoading(false);
                        console.error(error);
                    });

            } catch (e) {
                console.log("Error1 : " + e);
                setErrorVisible(true);
            }

        }
        setLoading(false);

    };

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

        if (check_is_its_fields(["Extension réseau ", "Lampadaires ", "Piste/OF"])) {
            get_administrativelevls();
        }
    }, []);


    const onRefresh = () => {
        setRefreshing(true);
        get_groups_infos();
        get_subproject();
        if (check_is_its_fields(["Extension réseau ", "Lampadaires ", "Piste/OF"])) {
            get_administrativelevls();
        }
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
                        <Text style={styles.text_title}>Sous-projet : </Text>
                        <Text>{subproject.full_title_of_approved_subproject}</Text>
                        <Text>{'\n'}</Text>
                        <Text>
                            <Text style={styles.text_title}>Ouvrage : </Text>
                            <Text>{subproject.type_of_subproject}</Text>
                        </Text>
                        <Text>{'\n'}</Text>
                        <Text>
                            <Text style={styles.text_title}>Localité : </Text>
                            <Text>
                                {
                                    subproject.location_subproject_realized ?
                                        subproject.location_subproject_realized.name
                                        : subproject.canton ?
                                            subproject.canton.name
                                            : subproject.cvd ?
                                                subproject.cvd.name
                                                : 'Non trouvée'
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
                    subproject={subproject} administrativelevels={administrativelevels} onRefresh={onRefresh} />

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

export default CompaniesDetails;
