import React, { useEffect, useState } from 'react';
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
import { getData } from '../../../utils/storageManager';
import { Subproject } from '../../../models/subprojects/Subproject';
import moment from 'moment';
import AttachmentsComponent from "../../../components/AttachmentsComponent";

const colors = ['primary.600', 'orange', 'lightblue', 'purple'];

function Images({ route }: { route: any }) {
    const navigation =
        useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
    const { subproject: subprojectParam } = route.params;
    const [subproject, setSubproject] = useState(subprojectParam);
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

    const modules = [
        {
            'url': 'TrackingSubprject',
            'name': 'Suivi du sous-projet'
        },
        {
            'url': 'TakeGeolocation',
            'name': subproject.link_to_subproject ? "Géolocalisation de l'infrastructure" : "Géolocalisation du sous-projet"
        }
        // ,
        // {
        //     'url': 'ListInfrastructures',
        //     'name': 'Gestion des infrastructures réliant au sous-projet'
        // }
    ]
    if (subproject?.subprojects_linked) {
        modules.push({
            'url': 'ListInfrastructures',
            'name': 'Gestion des infrastructures réliant au sous-projet'
        });
    }
    modules.push({
        'url': 'ListInfrastructures',
        'name': 'Images prises'
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



    const onRefresh = async () => {
        setRefreshing(true);
        setConnected(true);
        await check_network();
        //Get Subproject
        await new SubprojectAPI()
            .get_subproject(
                {
                    username: JSON.parse(await getData('username')),
                    password: JSON.parse(await getData('password'))
                }, subproject.id)
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
                            <Text style={styles.text_title}>Sous-projet : </Text>
                            <Text>{ subproject.full_title_of_approved_subproject }</Text>
                        </Text>
                        <Text>
                            <Text style={styles.text_title}>Ouvrage : </Text>
                            <Text>{subproject.type_of_subproject}</Text>
                        </Text>
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


        <View style={{ flex: 1 }}>


        {(subproject.files && subproject.files.length > 0) ? <AttachmentsComponent 
              attachmentsParams={subproject.files}
              object={subproject}
              type_object={null}
              subproject={subproject}
              width={Dimensions.get('window').width/2}
              height={200}
            /> : <Text style={{textAlign: 'center', marginTop: 50}}>Pas d'image disponible</Text>}

          <Snackbar visible={errorVisible} duration={3000} onDismiss={onDismissSnackBar}>
            {errorMessage}
          </Snackbar>
        </View>
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
