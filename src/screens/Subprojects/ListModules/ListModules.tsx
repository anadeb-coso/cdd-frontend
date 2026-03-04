import React, { useEffect, useState } from 'react';
import { Heading, HStack, Pressable, ScrollView, View, Box } from 'native-base';
import { RefreshControl, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SmallCard from 'components/SmallCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import { Layout } from '../../../components/common/Layout';
import { PrivateStackParamList } from '../../../types/navigation';
import { moneyFormat } from '../../../utils/functions';
import SubprojectAPI from '../../../services/subprojects/subprojects';
import { getData } from '../../../utils/storageManager';
import { Subproject } from '../../../models/subprojects/Subproject';
import { ModuleItem } from '../../../utils/nativeBase';
import moment from 'moment';

const colors = ['primary.600', 'orange', 'lightblue', 'purple'];

function ListModules({ route }: { route: any }) {
    const navigation =
        useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
    const { subproject: subprojectParams } = route.params;
    const [subproject, setSubproject] = useState(subprojectParams);
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

    const modules: ModuleItem[] = [
        {
            'url': 'TrackingSubprject',
            'name': subproject?.subprojects_linked ? "Suivi de l'ouvrage principal" : "Suivi du sous-projet"
        },
        {
            'url': 'TakeGeolocation',
            'name': subproject?.subprojects_linked ? "Géolocalisation de l'ouvrage principal" : "Géolocalisation du sous-projet"
        },
        {
            'url': 'SubprojectDetails',
            'name': subproject?.subprojects_linked ? "Plus de détails (ouvrage principal)" : "Plus de détails"
        }
    ]
    if (subproject?.subprojects_linked) {
        modules.push({
            'url': 'ListInfrastructures',
            'name': 'Gestion des infrastructures réliant au sous-projet'
        });
    }
    modules.push({
        'url': 'Images',
        'name': 'Fichiers'
    });

    const total_cost = () => {
        if (subproject.subprojects_linked) {
            let cost = subproject.estimated_cost;
            subproject.subprojects_linked.forEach((elt: any) => {
                cost += elt.estimated_cost;
            });
            setTotalEstimatedCost(cost);
        }
    }

    useEffect(() => {
        total_cost();
    }, [subproject]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            onRefresh();
        });

        return unsubscribe;
    }, [navigation]);



    const onRefresh = async () => {
        setRefreshing(true);
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
        <Layout disablePadding>
            <ScrollView _contentContainerStyle={{ pt: 7, px: 5 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }>
                <HStack mb={3} space="5" justifyContent="space-between">
                    <Pressable
                        p={3}
                        flex={1}
                        bg="light"
                        rounded="xl"
                        shadow={3}
                        onPress={() => console.log('pressed')}
                    >
                        <Text>
                            <Text  style={styles.text_title}>Sous-projet : </Text>
                            <Text>{subproject.full_title_of_approved_subproject}{subproject.component ? ` [${subproject.component?.name}]` : ''}</Text>
                        </Text>
                        {
                            totalEstimatedCost ?
                                (
                                    <>
                                        <Text>
                                            <Text style={styles.text_title}>Ouvrage : </Text>
                                            <Text>{subproject.type_of_subproject}</Text>
                                        </Text>
                                        <Text>
                                            <Text style={styles.text_title}>Coût estimé : </Text>
                                            <Text>{moneyFormat(subproject.estimated_cost)}</Text>
                                        </Text>
                                        {
                                            subproject.subprojects_linked.map((item: any, i: number) => {
                                                return (
                                                    <Text key={`${item.type_of_subproject}_${i}`}>
                                                        <Text style={{ ...styles.text_title, fontSize: 11 }}>Coût ({item.type_of_subproject}) : </Text>
                                                        <Text style={{fontSize: 11}}>{moneyFormat(item.estimated_cost)}</Text>
                                                    </Text>
                                                );
                                            })
                                        }
                                        <Text>
                                            <Text style={styles.text_title}>Coût total estimé : </Text>
                                            <Text>{moneyFormat(totalEstimatedCost)}</Text>
                                        </Text>
                                    </>
                                )
                                :
                                (
                                    <>
                                        <Text>
                                            <Text style={styles.text_title}>Coût estimé : </Text>
                                            <Text>{moneyFormat(subproject.estimated_cost)}</Text>
                                        </Text>
                                        <Text>
                                            <Text style={styles.text_title}>Ouvrage : </Text>
                                            <Text>{subproject.type_of_subproject}</Text>
                                        </Text>
                                    </>
                                )
                        }
                        <Text>
                            <Text style={styles.text_title}>Etape : </Text>
                            <Text>{subproject.current_subproject_step_and_level ?? " - "}</Text>
                        </Text>
                        <Text>
                            <Text style={styles.text_title}>Date d'approbation : </Text>
                            <Text>{subproject.approval_date_cora ? moment(subproject.approval_date_cora).format('DD-MMM-YYYY') : " - "}</Text>
                        </Text>
                        <Text>
                            <Text style={styles.text_title}>Entreprise en Change : </Text>
                            <Text>{subproject.name_of_the_awarded_company_works_companies ?? " - "}</Text>
                        </Text>
                        {(subproject && subproject.latitude) && <Text>
                            <Text style={styles.text_title}>Vue sur Map : </Text>
                            <View style={{
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }} >
                                <TouchableOpacity onPress={() => {
                                    navigation.navigate("TakeGeolocation", {
                                        name: subproject?.subprojects_linked ? "Géolocalisation de l'ouvrage principal" : "Géolocalisation du sous-projet",
                                        subproject: subproject,
                                            administrativelevel_id: null,
                                            cvd_id: null
                                    })
                                }} style={{
                                    margin: 'auto'
                                }} >
                                    <Box rounded="lg" p={1} bg="white" shadow={1} margin={'auto'}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <MaterialCommunityIcons name="map-marker" size={20} color={'#24c38b'}
                                            />
                                        </View>
                                    </Box>
                                </TouchableOpacity>
                            </View>
                        </Text>}




                        <Text></Text>
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
                    </Pressable>
                </HStack>
                <Heading fontSize={24} mt={4} my={3} size="md">
                    Sous modules
                </Heading>
                {/* TODO: Change to FlatList */}
                {modules.map((item, i) => {
                    if (i % 2 !== 0) {
                        return null;
                    }
                    return (
                        <HStack
                            key={`${item.name}`}
                            mb={5}
                            space="5"
                            justifyContent="space-between"
                        >
                            <SmallCard
                                key={`${item.name}.${i}`}
                                id={`${item.name}.${i}`}
                                onPress={() => {
                                    if (modules[i].url) {
                                        return navigation.navigate(modules[i].url, {
                                            subproject: subproject,
                                            administrativelevel_id: null,
                                            cvd_id: null,
                                            name: modules[i].url == 'ListInfrastructures' ? `Infrastructures` : modules[i].name
                                        });
                                    }
                                }}
                                title={modules[i].name}
                            />
                            <SmallCard
                                key={`${i}.${item.name}`}
                                id={`${i}.${item.name}`}
                                onPress={() => {
                                    if (modules[i + 1].url) {
                                        return navigation.navigate(modules[i + 1].url, {
                                            subproject: subproject,
                                            administrativelevel_id: null,
                                            cvd_id: null,
                                            name: modules[i + 1].url == 'ListInfrastructures' ? `Infrastructures` : modules[i + 1].name
                                        });
                                    }
                                }}
                                title={modules[i + 1]?.name}
                                bg={
                                    modules[i + 1]
                                        ? require('../../../../assets/backgrounds/orange-cube.png')
                                        : 'transparent'
                                }
                            />
                        </HStack>
                    );
                })}
            </ScrollView>
        </Layout>
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
export default ListModules;
