import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Modal, Text, Image, RefreshControl,
    ScrollView, TouchableOpacity, StyleSheet,
    StatusBar, SafeAreaView, ProgressBarAndroid
} from 'react-native';
import { Heading, HStack, Pressable, Box, useToast } from 'native-base';
import { 
    ActivityIndicator, Snackbar, 
    Portal, Dialog, Paragraph, Button, Checkbox 
} from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { EXPO_PUBLIC_ANDROID_VERSION_CODE, EXPO_PUBLIC_PACKAGE } from '../../../services/env'
import { getData } from '../../../utils/storageManager';
import { StoreProject } from '../../../models/storeapp/StoreProject';
import SearchBar from "../../../components/SearchBar";
import { PressableCard } from '../../../components/common/PressableCard';
import { LocalDatabaseADL } from '../../../utils/databaseManager';
import LocalDatabase, { SyncToRemoteDatabase } from '../../../utils/databaseManager';
import CustomGreenButton from '../../../components/CustomGreenButton/CustomGreenButton';
import API from '../../../services/API';
import { Layout } from '../../../components/common/Layout';
import { colors } from '../../../utils/colors';

const theme = {
    roundness: 12,
    colors: {
        ...colors,
        background: 'white',
        placeholder: '#dedede',
        text: '#707070',
    },
};

function GeoOthers({ navigation }: { navigation: any; }) {
    var navigation: any = useNavigation();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [errorVisible, setErrorVisible] = React.useState(false);
    const [errorMessage, setErrorMessage] = useState("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
    const [connected, setConnected] = useState(true);
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);
    const [villages, setVillages] = useState([]);
    const [geolocation, setGeolocation]: any = useState({});
    const [othersDisplay, setOthersDisplay]: any = useState([]);

    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);

    const onDismissSnackBar = () => setErrorVisible(false);

    const [yesDeleteOther, setYesDeleteOther] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteOther, setDeleteOther] = useState(false);
    const [itemOtherToDelete, setItemOtherToDelete]: any = useState(null);
    const _showDeleteOtherDialog = () => setDeleteOther(true);
    const _hideDeleteOtherDialog = () => setDeleteOther(false);
    

    const check_network = async () => {
        NetInfo.fetch().then((state) => {
            if (!state.isConnected) {
                setErrorMessage("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
                setErrorVisible(true);
                setConnected(false);
            }
        });
    }


    const get_others = async () => {
        setLoading(true);

        LocalDatabase.find({
            selector: { type: 'geolocation' }
        }).then((response: any) => {
            let geolocation_facilitator = response?.docs ?? [];
            let _geolocation = geolocation_facilitator.find((elt: any) => elt.type === 'geolocation')
            setGeolocation(_geolocation);

            if (_geolocation) {
                if (_geolocation.others) {
                    setOthersDisplay(_geolocation.others);
                }
                if (_geolocation.synced == false) {
                    setErrorMessage("Veuillez synchroniser les coordonnées enregistrées récemment");
                    setErrorVisible(true);
                }
            }

            setLoading(false);

        }).catch((err: any) => {
            console.log("Error1 : " + err);
            setLoading(false);
        });
        setLoading(false);

    }

    const delete_other_location = async (item: any) => {
        setDeleting(true);
        await LocalDatabase.upsert(geolocation._id, function (doc: any) {
            doc = geolocation;
            doc.others = geolocation.others.filter((elt: any) => elt.id !== item.id);

            doc.synced = false;

            return doc;
        })
            .then(function (res: any) {
                setDeleting(false);
                setYesDeleteOther(false);
                setItemOtherToDelete(null);
                _hideDeleteOtherDialog();
                toast.show({
                    description: "Coordonnées supprimées avec succès",
                });
                get_others();
            })
            .catch(function (err: any) {
                // console.log('Error', err);
            });
    }

    useEffect(() => {
        get_others();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            get_others();
        });

        return unsubscribe;
    }, [navigation]);


    const sync = async () => {
        let succes = false;
        let _success = false;
        setSyncing(true);
        setConnected(true);
        await check_network();
        if (connected) {
            try {
                await LocalDatabase.find({
                    selector: { type: { $in: ['geolocation', 'facilitator'] } },
                })
                    .then(async (result) => {
                        let tasks_facilitator = result?.docs ?? [];
                        let facilitator = tasks_facilitator.find(elt => elt.type === 'facilitator');
                        let geolocations = tasks_facilitator.find(elt => elt.type === 'geolocation');

                        await new API()
                            .sync_geolocation_datas({ tasks: [geolocations, geolocations], facilitator: facilitator })
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
                                console.log(error);
                                setErrorVisible(true);
                            });

                    })
                    .catch((err) => {
                        console.log("Error1 : " + err);
                        setErrorVisible(true);
                    });
            } catch (e) {
                console.log("Error1 : " + e);
                setErrorVisible(true);
            }

            if (_success) {
                LocalDatabase.upsert(geolocation._id, function (doc: any) {
                    doc = geolocation;
                    doc.synced = true;
                    return doc;
                })
                    .then(function (res: any) {
                    })
                    .catch(function (err: any) {
                        // console.log('Error', err);
                    });
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
        if (geolocation && geolocation.others) {
            if (searchPhraseCopy.trim()) {
                setOthersDisplay([]);
                let othersDisplaySearch = [];
                let _ = [...geolocation.others];
                let elt: any;
                let searchPhraseSplit = searchPhraseCopy.toUpperCase().trim().split(" "); //.replace(/\s/g, "").split(" ");
                for (let i = 0; i < _.length; i++) {
                    elt = _[i];
                    if (elt && elt.name && (
                        check_character(searchPhraseSplit, elt.name) || check_character(searchPhraseSplit, elt.description)
                    )) {
                        othersDisplaySearch.push(elt);
                    }
                }
                setOthersDisplay(othersDisplaySearch);
            } else {
                setOthersDisplay(geolocation.others);
            }
        }
    };
    //End Search


    function Item({ item, onPress, backgroundColor, textColor, key_propos }: {
        item: any; onPress?: () => void; backgroundColor: any; textColor: any; key_propos: any;
    }) {
        return (
            <PressableCard shadow="0" key={key_propos} style={{ ...styles.item, backgroundColor: "#008b8b" }}>
                <TouchableOpacity onPress={onPress} key={key_propos} 
                    onLongPress={() => {
                        setItemOtherToDelete(item);
                        _showDeleteOtherDialog();
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Box rounded="sm" style={{ flexDirection: 'row', width: '95%' }}>
                            {/* <Image
                                resizeMode="stretch"
                                style={{ width: 25, height: 30 }}
                                source={require('../../../../assets/illustrations/location.png')}
                            /> */}

                            <Text style={{ marginLeft: 7 }}>
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
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Text style={{ marginLeft: 7, fontSize: 7 }}>
                            {item.description?.length > 40
                                ? `${item.description.substring(0, 40)}...`
                                : item.description}
                        </Text>
                    </View>
                </TouchableOpacity>
            </PressableCard>
        );
    }

    const renderItem = (item: any, i: number) => { //= ({ item }: {item: any}) => {
        const backgroundColor = '#f9c2ff';
        const color = 'black';
        return (
            <Item
                key={`${item.id}${i}`}
                key_propos={`${item.id}${i}`}
                item={item}
                onPress={() => navigation.navigate('TakeOtherGeolocation', {
                    geolocation: geolocation,
                    other: item,
                    name: item.name.length > 25 ? null : `Lieu - ${item.name}`
                })}
                backgroundColor={{ backgroundColor }}
                textColor={{ color }}
            />
        );
    };



    const onRefresh = () => {
        setRefreshing(true);
        get_others();
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
                                onPress={() => navigation.navigate('TakeOtherGeolocation', {
                                    geolocation: geolocation,
                                    other: null
                                })}
                                style={{ width: '90%', marginRight: 15 }}
                            >
                                <MaterialCommunityIcons name="plus" size={55} color={'#24c38b'} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {!geolocation && <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text fontSize="10" color="blue">
                            Récupération en cours... <ProgressBarAndroid styleAttr="Horizontal" color="primary.500" />
                        </Text>
                    </View>}

                    {geolocation && geolocation.synced == false && <>{syncing ? (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <ActivityIndicator size="large" color="#24c38b" />
                            <Text style={{ fontSize: 18, marginTop: 12 }} color="#000000">Synchronisation en cours...{'\n'}Ceci peut prendre quelques secondes!</Text>
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

                    {othersDisplay && othersDisplay.map((t: any, i: any) => renderItem(t, i))}


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


                    <Portal>
                        <Dialog visible={deleteOther} onDismiss={_hideDeleteOtherDialog}>
                            <Dialog.Content>

                                <Paragraph>Souhaitez-vous vraiment supprimer ce lieu {itemOtherToDelete ? `(${itemOtherToDelete.name}: ${itemOtherToDelete.description})`: ''} ?</Paragraph>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        paddingHorizontal: 5,
                                        paddingBottom: 10,
                                        alignItems: 'center',
                                        marginTop: 14
                                    }}
                                >
                                    <Checkbox.Android
                                        color={colors.primary}
                                        status={yesDeleteOther ? 'checked' : 'unchecked'}
                                        onPress={() => {
                                            setYesDeleteOther(!yesDeleteOther);
                                        }}
                                    />
                                    <Text style={[styles.title]}>OUI</Text>
                                </View>

                            </Dialog.Content>

                            <Dialog.Actions>
                                <Button
                                    theme={theme}
                                    style={{ alignSelf: 'center', backgroundColor: '#d4d4d4' }}
                                    labelStyle={{ color: 'white', fontFamily: 'Poppins_500Medium' }}
                                    mode="contained"
                                    onPress={_hideDeleteOtherDialog}
                                >
                                    Quitter
                                </Button>
                                <Button
                                    disabled={!yesDeleteOther || !itemOtherToDelete}
                                    theme={theme}
                                    style={{ alignSelf: 'center', marginHorizontal: 24, backgroundColor: (!yesDeleteOther || !itemOtherToDelete) ? '#d4d4d4' : 'red' }}
                                    labelStyle={{ color: 'white', fontFamily: 'Poppins_500Medium' }}
                                    mode="contained"
                                    onPress={() => {
                                        if(itemOtherToDelete){
                                            delete_other_location(itemOtherToDelete);
                                        }
                                    }}
                                >
                                    {deleting ? "Suppression en cours..." : "Confirmer"}
                                </Button>
                            </Dialog.Actions>

                        </Dialog>
                    </Portal>



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


export default GeoOthers;
