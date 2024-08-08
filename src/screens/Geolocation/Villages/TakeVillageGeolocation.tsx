import React, { useEffect, useState } from 'react';
import { Heading, HStack, Pressable, ScrollView, View, Box, useToast } from 'native-base';
import { RefreshControl, Text, StyleSheet, TouchableOpacity, ProgressBarAndroid } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SmallCard from 'components/SmallCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Snackbar, Button } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import * as Location from 'expo-location';
import moment from 'moment';
import { Layout } from '../../../components/common/Layout';
import { PrivateStackParamList } from '../../../types/navigation';
import { moneyFormat } from '../../../utils/functions';
import SubprojectAPI from '../../../services/subprojects/subprojects';
import { getData } from '../../../utils/storageManager';
import { Subproject } from '../../../models/subprojects/Subproject';
import { colors } from '../../../utils/colors';
import LoadingScreen from '../../../components/LoadingScreen';
import ViewGeolocation from '../../Subprojects/Geolocation/ViewGeolocation';
// import LocalDatabase from '../../../utils/databaseManager';
import { getDocumentsByAttributes, updateDocument } from '../../../utils/coucdb_call';
import { handleStorageError } from '../../../utils/pouchdb_call';

const theme = {
    roundness: 12,
    colors: {
        ...colors,
        background: 'white',
        placeholder: '#dedede',
        text: '#707070',
    },
};

function TakeVillageGeolocation({ route }: { route: any }) {
    const navigation =
        useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
    const { village: villageParam, geolocation } = route.params;
    const toast = useToast();
    const [village, setVillage] = useState(villageParam);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
    const [connected, setConnected] = useState(true);
    const [errorVisible, setErrorVisible] = React.useState(false);
    const onDismissSnackBar = () => setErrorVisible(false);
    const [dataChanged, setDataChanged]: any = useState(false);
    const [errorMsg, setErrorMsg]: any = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const check_network = async () => {
        NetInfo.fetch().then((state) => {
            if (!state.isConnected) {
                setErrorMessage("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
                setErrorVisible(true);
                setConnected(false);
            }
        });
    }


    const get_geo_location = async () => {
        setConnected(true);
        await check_network();
        setIsLoading(true);
        setDataChanged(false);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setVillage({
            ...village,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
        });
        setDataChanged(true);
        setIsLoading(false);
    };


    const onRefresh = async () => {
        setIsLoading(false);
        setRefreshing(true);
        setConnected(true);
        await check_network();
        //Get Village
        try {
            // await LocalDatabase.find({
            //     selector: { type: 'geolocation' }
            // })
            await getDocumentsByAttributes({ type: 'geolocation' })
            .then((response: any) => {
                if (response.docs && response.docs[0] && response.docs[0].administrativelevels) {
                    let _village = response.docs[0].administrativelevels.find((elt: any) => elt.id === village.id);
                    if (_village && _village.longitude && _village.latitude) {
                        setVillage({
                            ...village,
                            latitude: _village.latitude,
                            longitude: _village.longitude
                        });
                    }
                }
                setRefreshing(false);
            }).catch((err: any) => {
                handleStorageError(err);
                console.log("Error1 : " + err);
                setRefreshing(false);
            });
        } catch (error) {
            handleStorageError(error);
        }

        //End Get Village
        setDataChanged(false);

    };

    const saveVillageGeoLocation = async () => {
        setIsSaving(true);
        if (village.latitude && village.longitude) {
            try {
                // await LocalDatabase.upsert
                await updateDocument(geolocation._id, function (doc: any) {
                    doc = geolocation;
                    let _village = geolocation.administrativelevels.find((elt: any) => elt.id === village.id);
                    doc.administrativelevels = geolocation.administrativelevels.filter((elt: any) => elt.id !== village.id);
                    let v: any = {
                        id: village.id,
                        name: village.name,
                        latitude: village.latitude,
                        longitude: village.longitude,
                        coords_updated: moment()
                    }
                    if (_village) {
                        v.coords_created = _village.coords_created;
                    } else {
                        v.coords_created = moment();
                    }
                    doc.administrativelevels.push(v);
                    doc.synced = false;

                    return doc;
                })
                    .then(function (res: any) {
                        if(res){
                            toast.show({
                                description: "Coordonnées enrégistrées avec succès",
                            });
                            setIsSaving(false);
                            setDataChanged(false);
                        }

                        // compactDatabase(LocalDatabase);
                    })
                    .catch(function (err: any) {
                        handleStorageError(err);
                        // console.log('Error', err);
                    });
            } catch (error) {
                handleStorageError(error);
            }
        } else {
            toast.show({
                description: "Veuillez charge les coordonnées de la localité",
            });
        }

        setDataChanged(false);
        setIsSaving(false);
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
                            <Text style={styles.text_title}>Localité : </Text>
                            <Text>{village.name ?? 'Non trouvée'}</Text>
                        </Text>
                    </Pressable>
                </HStack>
                <Heading fontSize={24} mt={4} my={3} size="md">
                    Localisation
                </Heading>
                <View style={{ marginBottom: 3 }}>
                    <Text style={{ color: 'red' }}>Veuillez vous assurer que vous êtes sur le lieu (ou dans la localité) avant de cliquer sur le bouton de la localisation.</Text>
                </View>
                <View >
                    <Text>
                        <Text style={styles.text_title}>Latitude : </Text>
                        <Text>{village.latitude ?? " - "}</Text>
                    </Text>
                    <Text>
                        <Text style={styles.text_title}>Longitude : </Text>
                        <Text>{village.longitude ?? " - "}</Text>
                    </Text>
                </View>


                <View style={{
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }} >
                    {
                        isLoading && (<><Text>Veuillez recliquer si ça prend du temps</Text><ProgressBarAndroid styleAttr="Horizontal" color="primary.500" style={{ height: 25, width: '100%' }} /></>)
                    }
                    <TouchableOpacity onPress={get_geo_location} style={{
                        margin: 'auto',
                    }}
                    // disabled={isLoading}
                    >
                        <Box rounded="lg" p={3} mt={3} bg="white" shadow={1} margin={'auto'}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <MaterialCommunityIcons
                                    style={{ color: 'green' }}
                                    // style={{ color: isLoading ? 'grey' : 'green' }} 
                                    name="map-marker-circle" size={75} color={'#24c38b'}
                                />
                            </View>
                        </Box>
                    </TouchableOpacity>
                </View>


                {dataChanged && <Button
                    theme={theme}
                    style={{ alignSelf: 'center', margin: 24 }}
                    labelStyle={{ color: 'white', fontFamily: 'Poppins_500Medium' }}
                    mode="contained"
                    onPress={() => { saveVillageGeoLocation(); }}
                    loading={isSaving}
                    disabled={isSaving}
                >
                    {isSaving ? 'Enregistrement en cours' : `Sauvegarder`}
                </Button>}

                {(village && village.latitude && village.longitude) && <ViewGeolocation route={{ ...route, params: { ...route.params, name: "Géolocalisation" } }}
                    locationData={[
                        { latitude: village.latitude, longitude: village.longitude }
                    ]}
                    width={'100%'}
                    height={500}
                />}
            </ScrollView>


            {/* <LoadingScreen visible={isLoading} /> */}
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
export default TakeVillageGeolocation;
