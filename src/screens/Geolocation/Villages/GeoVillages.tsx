import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Modal, Text, Image, RefreshControl,
    ScrollView, TouchableOpacity, StyleSheet,
    StatusBar, SafeAreaView, 
    Alert
} from 'react-native';
import { ProgressBar } from '@react-native-community/progress-bar-android';
import { Heading, HStack, Pressable, Box } from 'native-base';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { EXPO_PUBLIC_ANDROID_VERSION_CODE, EXPO_PUBLIC_PACKAGE } from '../../../services/env'
import { getData } from '../../../utils/storageManager';
import { StoreProject } from '../../../models/storeapp/StoreProject';
import SearchBar from "../../../components/SearchBar";
import { PressableCard } from '../../../components/common/PressableCard';
// import { LocalDatabaseADL } from '../../../utils/databaseManager';
// import LocalDatabase, { SyncToRemoteDatabase } from '../../../utils/databaseManager';
import { SyncToRemoteDatabase } from '../../../utils/databaseManager';
import { getDocumentsByAttributes, updateDocument } from '../../../utils/coucdb_call';
import { getEadlByEmail } from '../../../services/facilitators/eadl';
import CustomGreenButton from '../../../components/CustomGreenButton/CustomGreenButton';
import API from '../../../services/API';
import { Layout } from '../../../components/common/Layout';
import { handleStorageError } from '../../../utils/pouchdb_call';
import FacilitatorsAPI from "../../../services/facilitators/facilitators";
import { clear_duplicate_on_liste } from '../../../utils/functions';


function GeoVillages({ navigation }: { navigation: any; }) {
    var navigation: any = useNavigation();
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [errorVisible, setErrorVisible] = React.useState(false);
    const [errorMessage, setErrorMessage] = useState("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
    const [connected, setConnected] = useState(true);
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);
    const [villages, setVillages] = useState([]);
    const [geolocation, setGeolocation]: any = useState(null);
    const [villagesDisplay, setVillagesDisplay]: any = useState([]);

    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);

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

    const get_village_geolocated = (village: any) => {
        return geolocation?.administrativelevels?.find((elt: any) => elt.id === village.id);
    };   

    const get_villages = async () => {
        setRefreshing(true);
        let my_no_sql_db_name = JSON.parse(await getData('my_no_sql_db_name'));

        if (my_no_sql_db_name) {
            try {
                let villagesResult: any = [];
                let stabilize_villages_id: any = [];
                let response: any = await getEadlByEmail(JSON.parse(await getData('email')) ?? null);
                if (response.docs && response.docs[0] && response.docs[0].administrative_regions_objects) {
                    response.docs[0].administrative_regions_objects.forEach((elt: any) => {
                        if (elt.villages) villagesResult = villagesResult.concat(elt.villages.map((elt: any) => {
                            stabilize_villages_id.push(String(elt.id));
                            elt.id = String(elt.id);
                            elt.my_village = true;
                            return elt;
                        }));
                    });
                }
                villagesResult = clear_duplicate_on_liste(villagesResult);


                let _facilitator = ((await getDocumentsByAttributes({ type: 'facilitator' }, 2, 0, my_no_sql_db_name))?.docs ?? [{}])[0];
                let _geolocation = ((await getDocumentsByAttributes({ type: 'geolocation' }, 2, 0, my_no_sql_db_name))?.docs ?? [{}])[0];
                
                if(_geolocation){
                    setGeolocation(_geolocation);

                    if (_facilitator && _facilitator.administrative_levels) {
                        villagesResult = villagesResult.concat((_facilitator.administrative_levels ?? []).map((elt: any) => {
                            elt.facilitator_name = _facilitator.name;
                            elt.my_village = stabilize_villages_id.indexOf(elt.id) !== -1;
                            return elt;
                        }));
                    }
                    
                    villagesResult = clear_duplicate_on_liste(villagesResult);

                    setVillages(villagesResult);
                    setVillagesDisplay(villagesResult);
                }else{
                        Alert.alert(
                            "Alert", 
                            "Nous n'arrivons pas à récupérer vos informations dans cette section. Veuillez contacter l’administrateur du système pour une mesure corrective.", 
                            [
                                {
                                    text: "Ok", onPress: async () => {
                            
                                    }
                                },
                            ]
                        );
                }
                

                setRefreshing(false);
                 
            } catch (e) {
                console.log("Error1 : " + e);
                setRefreshing(false);
            }
        } else{
            setRefreshing(false);
        }

    };


    useEffect(() => {
        get_villages();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            get_villages();
        });

        return unsubscribe;
    }, [navigation]);

    const sync = async () => {
        let my_no_sql_db_name = JSON.parse(await getData('my_no_sql_db_name'));

        let succes = false;
        let _success = false;
        setSyncing(true);
        setConnected(true);
        await check_network();
        if (connected) {
            try {
                // await LocalDatabase.find({
                //     selector: { type: { $in: ['geolocation', 'facilitator'] } },
                // })
                
                let _facilitator = ((await getDocumentsByAttributes({ type: 'facilitator' }, 2, 0, my_no_sql_db_name))?.docs ?? [{}])[0];
                let _geolocation = ((await getDocumentsByAttributes({ type: 'geolocation' }, 2, 0, my_no_sql_db_name))?.docs ?? [{}])[0];

                await new API()
                    .sync_geolocation_datas({ tasks: [_geolocation], facilitator: _facilitator })
                    .then(response => {
                        if (!response.status || response.status != 'ok') {
                            console.error(response.error);
                            setErrorVisible(true);
                        } else if (response.has_error) {
                            succes = true;
                            setErrorMessage("Certaines de vos données n'ont pas pu été synchronisées avec succès.");
                            console.error(response.error);
                            setErrorVisible(true);
                        } else if (response.status && response.status == 'ok') {
                            _success = true;
                        }
                    })
                    .catch(error => {
                        console.error(error);
                        setErrorVisible(true);
                    });

            } catch (e) {
                console.log("Error1 : " + e);
                setErrorVisible(true);
                handleStorageError(e);
            }

            if (_success) {
                try {
                    // LocalDatabase.upsert
                    updateDocument(geolocation._id, function (doc: any) {
                        doc = geolocation;
                        doc.synced = true;
                        return doc;
                    }, my_no_sql_db_name)
                        .then(function (res: any) {
                            // compactDatabase(LocalDatabase);
                        })
                        .catch(function (err: any) {
                            handleStorageError(err);
                            // console.log('Error', err);
                        });
                } catch (error) {
                    handleStorageError(error);
                }
            }
            if (succes || _success) {
                setSuccessModal(true);
            } else {
                setErrorModal(true);
            }
        }
        setSyncing(false);

    };



    //Search
    const [searchPhrase, setSearchPhrase] = useState("");
    const [clicked, setClicked] = useState(false);

    const check_character = (liste: any, elt: string) => {
        let l;
        let eltUpper = elt.toUpperCase();
        for (let i = 0; i < liste.length; i++) {
            l = liste[i];
            if (l && eltUpper.includes(l)) {
                return true;
            }
        }
        return false;
    };
    const onChangeSearchFunction = (searchPhraseCopy: string = searchPhrase) => {
        if (searchPhraseCopy.trim()) {
            setVillagesDisplay([]);
            let villagesDisplaySearch = [];
            let _ = [...villages];
            let elt: any;
            let searchPhraseSplit = searchPhraseCopy.toUpperCase().trim().split(" "); //.replace(/\s/g, "").split(" ");
            for (let i = 0; i < _.length; i++) {
                elt = _[i];
                if (elt && elt.name && check_character(searchPhraseSplit, elt.name)) {
                    villagesDisplaySearch.push(elt);
                }
            }
            setVillagesDisplay(villagesDisplaySearch);
        } else {
            setVillagesDisplay(villages);
        }
    };
    //End Search


    function Item({ item, village_geolocated, onPress, backgroundColor, textColor, key_propos }: {
        item: any; village_geolocated: any; onPress?: () => void; backgroundColor: any; textColor: any; key_propos: any;
    }) {
        // item = village_geolocated ?? item;
        return (
            <PressableCard shadow="0" key={key_propos} style={{ ...styles.item, backgroundColor: village_geolocated ? "#008b8b" : "white" }}>
                <TouchableOpacity onPress={onPress} key={key_propos}>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Box rounded="sm" style={{ flexDirection: 'row', width: '95%' }}>
                            
                            {item.my_village && <MaterialCommunityIcons name="flag" size={24} color={village_geolocated ? 'white' : 'red'} />}

                            <Text style={{ marginTop: 8, marginLeft: 7 }}>
                                {item.name?.length > 40
                                    ? `${item.name.substring(0, 40)}...`
                                    : item.name}
                            </Text>
                        </Box>
                        <View
                            style={{
                            }}
                        >
                            <MaterialCommunityIcons name="chevron-right-circle" size={24} color={'#24c38b'} />
                        </View>
                    </View>
                </TouchableOpacity>
            </PressableCard>
        );
    }

    const renderItem = (item: any, i: number) => { //= ({ item }: {item: any}) => {
        const backgroundColor = '#f9c2ff';
        const color = 'black';
        let village_geolocated = get_village_geolocated(item);
        return (
            <Item
                key={`${item.id}${i}`}
                key_propos={`${item.id}${i}`}
                item={item}
                village_geolocated={village_geolocated}
                onPress={() => navigation.navigate('TakeVillageGeolocation', {
                    village: village_geolocated ?? item,
                    geolocation: geolocation,
                    name: item.name.length > 18 ? null : `${item.name}`
                })}
                backgroundColor={{ backgroundColor }}
                textColor={{ color }}
            />
        );
    };



    const onRefresh = () => {
        setRefreshing(true);
        get_villages();
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
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }>
                <View style={{ flex: 1 }}>



                    <View style={{ flexDirection: 'row' }}>
                        <SafeAreaView style={{ ...styles.root, flex: 0.8 }}>
                            <SearchBar
                                searchPhrase={searchPhrase}
                                setSearchPhrase={setSearchPhrase}
                                clicked={clicked}
                                setClicked={setClicked}
                                onChangeFunction={onChangeSearchFunction}
                            />
                        </SafeAreaView>
                        <View style={{ ...styles.root, flex: 0.2 }}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('GeoOthers', {
                                })}
                                style={{ width: '90%', marginRight: 15 }}
                            >
                                <Image
                                    style={{ height: 45, width: 35, margin: 'auto' }}
                                    resizeMode="stretch"
                                    source={require('../../../../assets/illustrations/location.png')}
                                    alt="image"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {geolocation == null && <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text>
                            Récupération en cours... <ProgressBar styleAttr="Horizontal" color="primary.500" />
                        </Text>
                    </View>}

                    {geolocation && geolocation.synced == false && <>{syncing ? (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <ActivityIndicator size="large" color="#24c38b" />
                            <Text style={{ fontSize: 18, marginTop: 12, color: "#000000" }}>Synchronisation en cours...{'\n'}Ceci peut prendre quelques secondes!</Text>
                        </View>
                    ) : (
                        <View>
                            <CustomGreenButton
                                onPress={sync}
                                buttonStyle={{
                                    height: 36,
                                    borderRadius: 7,
                                    marginHorizontal: '5%',
                                    width: '90%',
                                    marginBottom: 10,
                                }}
                                textStyle={{
                                    fontFamily: 'Poppins_500Medium',
                                    fontSize: 14,
                                    lineHeight: 21,
                                    letterSpacing: 0,
                                    textAlign: 'right',
                                    color: '#ffffff',
                                }}
                            >
                                Sync
                            </CustomGreenButton>
                        </View>
                    )}</>}

                    {villagesDisplay && villagesDisplay.map((t: any, i: any) => renderItem(t, i))}


                    <Modal animationType="slide" style={{ flex: 1 }} visible={successModal}>
                        <View
                            style={{
                                flex: 1,
                                padding: 20,
                                alignItems: 'center',
                                justifyContent: 'space-around',
                            }}
                        >
                            <View style={{ alignItems: 'center', marginTop: '20%' }}>
                                <Image
                                    style={{ height: 82, width: 82, margin: 'auto' }}
                                    resizeMode="stretch"
                                    source={require('../../../../assets/illustrations/check-circle.png')}
                                    alt="image"
                                />
                                <Text
                                    style={{
                                        marginVertical: 25,
                                        fontFamily: 'Poppins_700Bold',
                                        fontSize: 20,
                                        fontWeight: 'bold',
                                        fontStyle: 'normal',
                                        lineHeight: 25,
                                        letterSpacing: 0,
                                        textAlign: 'center',
                                        color: '#707070',
                                    }}
                                >
                                    Synchronisation {'\n'} Réussie!
                                </Text>
                            </View>
                            <Image
                                style={{ height: 279.236, width: 222.51, margin: 'auto' }}
                                resizeMode="stretch"
                                source={require('../../../../assets/illustrations/sync-image.png')}
                                alt="image"
                            />
                            <CustomGreenButton
                                onPress={() => { setSuccessModal(false) }}
                                buttonStyle={{
                                    width: '100%',
                                    height: 36,
                                    borderRadius: 7,
                                }}
                                textStyle={{
                                    fontFamily: 'Poppins_500Medium',
                                    fontSize: 14,
                                    lineHeight: 21,
                                    letterSpacing: 0,
                                    textAlign: 'right',
                                    color: '#ffffff',
                                }}
                            >
                                DONE
                            </CustomGreenButton>
                        </View>
                    </Modal>



                </View>
            </ScrollView>

            <Snackbar visible={errorVisible} duration={5000} onDismiss={onDismissSnackBar}>
                {errorMessage}
            </Snackbar>

        </Layout>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: StatusBar.currentHeight || 0,
    },
    item: {
        flex: 1,
        padding: 1,
        marginVertical: 8,
        marginHorizontal: 23,
        borderBottomWidth: 1,
        borderColor: '#f6f6f6',
    },
    title: {
        fontFamily: 'Poppins_500Medium',
        // fontSize: 12,
        fontWeight: 'normal',
        fontStyle: 'normal',
        // lineHeight: 10,
        letterSpacing: 0,
        // textAlign: "left",
        color: '#707070',
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
    },
    statisticsText: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 11,
        fontWeight: 'bold',
        fontStyle: 'normal',
        letterSpacing: 0,
        textAlign: 'left',
        color: '#707070',
    },
    root: {
        justifyContent: "center",
        alignItems: "center",
    },
    titleSearch: {
        width: "100%",
        marginTop: 20,
        fontSize: 25,
        fontWeight: "bold",
        marginLeft: "10%",
    },
});


export default GeoVillages;
