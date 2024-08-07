import React, { useEffect, useState } from 'react';
import { Heading, HStack, Pressable, ScrollView, View, Box, useToast } from 'native-base';
import { RefreshControl, Text, StyleSheet, TouchableOpacity, ProgressBarAndroid } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SmallCard from 'components/SmallCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Snackbar, Button, TextInput } from 'react-native-paper';
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
import ViewGeolocation from '../../../screens/Subprojects/Geolocation/ViewGeolocation';
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

function TakeOtherGeolocation({ route }: { route: any }) {
    const navigation =
        useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
    const { other: otherParam, geolocation } = route.params;
    const toast = useToast();
    const [other, setOther] = useState(otherParam ?? {});
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

    const handle_description = (text: any) => {
        setOther({ ...other, description: text });
        setDataChanged(true);
    };
    const handle_name = (text: any) => {
        setOther({ ...other, name: text });
        setDataChanged(true);
    };


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
        setOther({
            ...other,
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
        //Get Other
        try {
            // await LocalDatabase.find({
            //     selector: { type: 'geolocation' }
            // })
            getDocumentsByAttributes({ type: 'geolocation' })
            .then((response: any) => {
                if (response.docs && response.docs[0] && response.docs[0].others) {
                    let _other = response.docs[0].others.find((elt: any) => elt.id === other.id);
                    if (_other && _other.longitude && _other.latitude) {
                        setOther({
                            ...other,
                            latitude: _other.latitude,
                            longitude: _other.longitude
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

        //End Get Other
        setDataChanged(false);

    };

    const saveOtherGeoLocation = async () => {
        setIsSaving(true);
        if (other.latitude && other.longitude && other.name) {
            try {
                // await LocalDatabase.upsert
                await updateDocument(geolocation._id, function (doc: any) {
                    doc = geolocation;
                    let _other = geolocation.others.find((elt: any) => elt.id === other.id);
                    doc.others = geolocation.others.filter((elt: any) => elt.id !== other.id);
                    let o: any = {
                        id: other.id,
                        name: other.name,
                        description: other.description,
                        latitude: other.latitude,
                        longitude: other.longitude,
                        coords_updated: moment()
                    }
                    if (_other) {
                        o.coords_created = _other.coords_created;
                    } else {
                        o.id = moment();
                        o.coords_created = moment();
                    }
                    doc.others.push(o);
                    doc.synced = false;

                    setOther({ ...o });

                    return doc;
                })
                    .then(function (res: any) {
                        toast.show({
                            description: "Coordonnées enrégistrées avec succès",
                        });
                        setIsSaving(false);
                        setDataChanged(false);

                        // compactDatabase(LocalDatabase);
                    })
                    .catch(function (err: any) {
                        handleStorageError(err);
                        // console.log('Error', err);
                    });
            } catch (error) {
                handleStorageError(error);
            }

            setDataChanged(false);
        } else if (!other.name) {
            toast.show({
                description: "Veuillez renseigner le lieu (Libellé)",
            });
        } else {
            toast.show({
                description: "Veuillez charger les coordonnées de la localité",
            });
        }
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
                        <Text style={{ ...styles.subTitle, marginTop: 5 }}>Lieu (Libellé)</Text>
                        <TextInput
                            style={{ marginBottom: 5 }}
                            mode="outlined"
                            theme={theme}
                            onChangeText={handle_name}
                            value={other.name}
                            placeholder="Lieu"
                        />

                        <Text style={{ ...styles.subTitle }}>Description</Text>
                        <TextInput
                            multiline
                            mode="outlined"
                            theme={theme}
                            onChangeText={handle_description}
                            value={other.description}
                            placeholder="Description"
                        />

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
                        <Text>{other.latitude ?? " - "}</Text>
                    </Text>
                    <Text>
                        <Text style={styles.text_title}>Longitude : </Text>
                        <Text>{other.longitude ?? " - "}</Text>
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
                    onPress={() => { saveOtherGeoLocation(); }}
                    loading={isSaving}
                    disabled={isSaving}
                >
                    {isSaving ? 'Enregistrement en cours' : `Sauvegarder`}
                </Button>}

                {(other && other.latitude && other.longitude) && <ViewGeolocation route={{ ...route, params: { ...route.params, name: "Géolocalisation" } }}
                    locationData={[
                        { latitude: other.latitude, longitude: other.longitude }
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
    },
    subTitle: {
        fontFamily: 'Poppins_300Light',
        fontSize: 12,
        fontWeight: 'normal',
        fontStyle: 'normal',
        // lineHeight: 10,
        letterSpacing: 0,
        // textAlign: "left",
        color: '#707070',
    }
});
export default TakeOtherGeolocation;
