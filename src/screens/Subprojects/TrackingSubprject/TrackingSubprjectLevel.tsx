import React, { useEffect, useState } from 'react';
import { Heading, HStack, Pressable, View, FlatList } from 'native-base';
import { RefreshControl, Text, StyleSheet } from 'react-native';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import { Layout } from '../../../components/common/Layout';
import { Subproject } from '../../../models/subprojects/Subproject';
import { Level } from '../../../models/subprojects/Level';
import { Step } from '../../../models/subprojects/Step';
import { SubprojectStep } from '../../../models/subprojects/SubprojectStep';
import SubprojectAPI from '../../../services/subprojects/subprojects';
import SubprojectTrackingAPI from '../../../services/subprojects/subprojects_tracking';
import { getData } from '../../../utils/storageManager';
import NetInfo from '@react-native-community/netinfo';
import SubprojectLevelProgressChart from './Components/SubprojectLevelProgressChart';

const colors = ['primary.600', 'orange', 'lightblue', 'purple'];

function TrackingSubprjectLevel({ route }: { route: any }) {
    const [loading, setLoading] = useState(false);
    const [errorVisible, setErrorVisible] = React.useState(false);
    const [errorMessage, setErrorMessage] = useState("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
    const [connected, setConnected] = useState(true);
    const [subprojectLevels, setSubprojectLevels] = useState(Array<Level>());
    const [refreshing, setRefreshing] = useState(false);

    const [showAddAttachment, setShowAddAttachment] = useState(false);
    const [enableToUpdateSteps, setEnableToUpdateSteps] = useState(false);

    const { subproject: subprojectParam } = route.params;
    const { step: stepParam } = route.params;
    const [subproject, setSubproject] = useState(subprojectParam as Subproject);
    const [subprojectStep, setSubprojectStep] = useState(stepParam as SubprojectStep);

    const onDismissSnackBar = () => setErrorVisible(false);

    const check_network = async () => {
        NetInfo.fetch().then((state) => {
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
    const get_groups_infos = async () => {
                   
        // Verify if one group exists on groups
        let groups = JSON.parse(await getData('groups'));
        setShowAddAttachment(() => {
            if (groups && groups?.length > 0) {
                return true;
            }
            return false;
        });
        setEnableToUpdateSteps(() => {
            if (groups && groups?.length > 0 && (
                    groups.includes('Facilitator') || 
                    groups.includes('CommunityFacilitator') || 
                    groups.includes('TechnicalFacilitator') || 
                    groups.includes('Superuser') || 
                    groups.includes('FullStack') || 
                    groups.includes('Infra') || 
                    groups.includes('Admin') || 
                    groups.includes('Evaluator')
                )){
                return true;
            }
            return false;
        });

    }

    const get_subproject_steps = async () => {

        setLoading(true);
        await get_groups_infos();
        setConnected(true);
        await check_network();
        if (connected) {
            try {


                //Subproject Steps
                await new SubprojectTrackingAPI()
                    .get_subproject_levels(
                        {
                            username: JSON.parse(await getData('username')),
                            password: JSON.parse(await getData('password')),
                            user: {
                                username: JSON.parse(await getData('username')),
                                email: JSON.parse(await getData('email'))
                            }
                        }, JSON.parse(await getData('access')), subproject.id ?? 0, 1, 1000)
                    .then(async (response_subproject_levels: any) => {
                        if (response_subproject_levels.error) {
                            setLoading(false);
                            return;
                        }
                        setSubprojectLevels(response_subproject_levels as Array<Level>);
                        setLoading(false);

                    })
                    .catch(error => {
                        setLoading(false);
                        console.error(error);
                    });
                //End Subproject Steps


            } catch (e) {
                console.log("Error1 : " + e);
                setErrorVisible(true);
            }

        }
        setLoading(false);

    };

    useEffect(() => {
        get_subproject_steps();
    }, []);


    const onRefresh = () => {
        setRefreshing(true);
        get_subproject_steps();
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
                        <Text>{subproject.full_title_of_approved_subproject} - <Text style={{ color: 'green' }}>{subproject.current_subproject_step_and_level ?? " - "}</Text></Text>
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

            <FlatList
                data={[{ key: 'content' }]} // fake data
                keyExtractor={(item: any) => item.key}
                renderItem={() => (
                    <>
                        <SubprojectLevelProgressChart 
                            showAddAttachment={showAddAttachment} enableToUpdateSteps={enableToUpdateSteps}
                            subproject_levels={subprojectLevels} subproject={subproject} 
                            step={subprojectStep} onRefresh={onRefresh} />

                        <Snackbar visible={errorVisible} duration={3000} onDismiss={onDismissSnackBar}>
                            {errorMessage}
                        </Snackbar>
                    </>
                )}
                contentContainerStyle={{ paddingHorizontal: 5 }}
                style={{ zIndex: 1 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
            
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

export default TrackingSubprjectLevel;
