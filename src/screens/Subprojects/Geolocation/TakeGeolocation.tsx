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
import { MaterialIcons as Icon } from '@expo/vector-icons';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import { Layout } from '../../../components/common/Layout';
import { PrivateStackParamList } from '../../../types/navigation';
import { moneyFormat } from '../../../utils/functions';
import SubprojectAPI from '../../../services/subprojects/subprojects';
import { getData } from '../../../utils/storageManager';
import { Subproject } from '../../../models/subprojects/Subproject';
import moment from 'moment';
import { colors } from '../../../utils/colors';
import LoadingScreen from '../../../components/LoadingScreen';
import ViewGeolocation from './ViewGeolocation';
import LocalDatabase from '../../../utils/databaseManager';
import { styles as stylesCustomDropDow } from '../../../components/CustomDropDownPicker/CustomDropDownPicker.style';

const theme = {
    roundness: 12,
    colors: {
        ...colors,
        background: 'white',
        placeholder: '#dedede',
        text: '#707070',
    },
};

function TakeGeolocation({ route }: { route: any }) {
    const navigation =
        useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
    const { subproject: subprojectParam } = route.params;
    const [subproject, setSubproject] = useState(subprojectParam);
    const village = route.params?.village;
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
    const [connected, setConnected] = useState(true);
    const [errorVisible, setErrorVisible] = React.useState(false);
    const onDismissSnackBar = () => setErrorVisible(false);
    const [dataChanged, setDataChanged]: any = useState(false);
    const [errorMsg, setErrorMsg]: any = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [othersGeolocation, setOthersGeolocation]: any = useState([]);
    const [K_OPTIONS, set_K_OPTIONS]: any = useState([]);
    const [otherGeolocation, setOtherGeolocation]: any = useState(null);

    const toast = useToast();

    const check_network = async () => {
        NetInfo.fetch().then((state) => {
            if (!state.isConnected) {
                setErrorMessage("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
                setErrorVisible(true);
                setConnected(false);
            }
        });
    }


    const get_others_locations = async () => {
        setLoading(true);

        LocalDatabase.find({
            selector: { type: 'geolocation' }
        }).then((response: any) => {
            let geolocation_facilitator = response?.docs ?? [];
            let _geolocation = geolocation_facilitator.find((elt: any) => elt.type === 'geolocation')

            if (_geolocation && _geolocation.others) {
                setOthersGeolocation(_geolocation.others);
                setOtherGeolocation((subproject && subproject.latitude && subproject.longitude) ? _geolocation.others.find((elt: any) => elt.latitude == subproject.latitude && elt.longitude == subproject.longitude) : null);
                
                set_K_OPTIONS(_geolocation.others.map((item: any) => {
                    return { name: `${item.name}`, id: item.id }
                }));

            }
            setLoading(false);

        }).catch((err: any) => {
            console.log("Error1 : " + err);
            setLoading(false);
        });
        setLoading(false);

    }

    useEffect(() => {
        get_others_locations();
    }, []);


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
        setSubproject({
            ...subproject,
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

                setRefreshing(false);

            })
            .catch(error => {
                setRefreshing(false);
                console.error(error);
            });
        //End Get Subproject
        setDataChanged(false);

    };

    const saveSubprojectGeoLocation = async () => {
        setIsSaving(true);
        await new SubprojectAPI().save_subproject_geolocation({
            ...subproject,
            username: JSON.parse(await getData('username')),
            password: JSON.parse(await getData('password'))
        }, subproject.id)
            .then(async (reponse: any) => {
                if (reponse.error) {
                    return;
                }
                setSubproject(reponse as Subproject);
                toast.show({
                    description: "Coordonnées enrégistrées avec succès",
                });
                setDataChanged(false);
            });
        setIsSaving(false);
    }


    if (refreshing || loading) {
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
                            <Text style={styles.text_title}>Sous-projet : </Text>
                            <Text>{subproject.full_title_of_approved_subproject}</Text>
                        </Text>
                        <Text>
                            <Text style={styles.text_title}>Ouvrage : </Text>
                            <Text>{subproject.type_of_subproject}</Text>
                        </Text>
                        <Text>
                            <Text style={styles.text_title}>Etape : </Text>
                            <Text>{subproject.current_subproject_step_and_level ?? " - "}</Text>
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
                <Heading fontSize={24} mt={4} my={3} size="md">
                    Localisation
                </Heading>
                <View >
                    <Text>
                        <Text style={styles.text_title}>Latitude : </Text>
                        <Text>{subproject.latitude ?? " - "}</Text>
                    </Text>
                    <Text>
                        <Text style={styles.text_title}>Longitude : </Text>
                        <Text>{subproject.longitude ?? " - "}</Text>
                    </Text>
                </View>

                <View>
                    <View style={{ ...stylesCustomDropDow.dropdownWrapper, zIndex: 1000 }}>
                        <SectionedMultiSelect
                            // label="Choisissez un lieu déjà enrégistré"
                            // options={K_OPTIONS}
                            // value={selectedItem}
                            // onChange={onChange()}
                            // hideInputFilter={false}
                            single={true}
                            items={K_OPTIONS}
                            IconRenderer={Icon}
                            uniqueKey="id"
                            // onSelectedItemsChange={setSelectedItems}
                            selectedItems={otherGeolocation ? [otherGeolocation.id] : []}
                            onSelectedItemsChange={(val: any) => {
                                let l = othersGeolocation.find((elt: any) => val && elt.id === val[0]);
                                setOtherGeolocation(l)

                                setSubproject({
                                    ...subproject,
                                    latitude: l.latitude,
                                    longitude: l.longitude
                                });
                                setDataChanged(true);
                            }}
                            renderSelectText={() => {
                                return (
                                    <View>
                                        <Text style={{ ...styles.subTitle, color: 'black' }}>
                                            {(otherGeolocation) ? otherGeolocation.name : `Choisissez un lieu déjà enrégistré`}
                                        </Text>
                                    </View>
                                );
                            }}

                            selectToggleIconComponent={() => (
                                <MaterialCommunityIcons name="chevron-down-circle" size={24} color={colors.primary} />
                            )}
                            searchPlaceholderText="Rechercher un lieu..."
                            confirmText="Confirmer"
                            showCancelButton={true}
                            styles={{
                                chipContainer: { backgroundColor: 'rgba(144, 238, 144, 0.5)' },
                                chipText: { color: 'black' },
                                selectToggle: {
                                    ...stylesCustomDropDow.dropdownStyle,
                                    padding: 15, alignContent: 'center', justifyContent: 'center'
                                },
                                selectToggleText: { ...styles.subTitle, display: 'flex', color: 'black' },
                                cancelButton: { backgroundColor: 'red' },
                                button: { backgroundColor: '#406b12' }

                            }}
                        />
                        <Text></Text>
                    </View>
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
                    onPress={() => { saveSubprojectGeoLocation(); }}
                    loading={isSaving}
                    disabled={isSaving}
                >
                    {isSaving ? 'Enregistrement en cours' : `Sauvegarder`}
                </Button>}

                {(subproject && subproject.latitude && subproject.longitude) && <ViewGeolocation route={{ ...route, params: { ...route.params, name: "Géolocalisation" } }}
                    locationData={[
                        { latitude: subproject.latitude, longitude: subproject.longitude }
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
export default TakeGeolocation;
