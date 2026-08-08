import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heading, HStack, Pressable, ScrollView, View, Box, useToast } from 'native-base';
import { RefreshControl, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ProgressBar } from '@react-native-community/progress-bar-android';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
import { getBestLocation, DEFAULT_DESIRED_ACCURACY_METERS } from 'utils/functions_geolocation';

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
    const { t } = useTranslation(['geolocation', 'common']);
    const navigation =
        useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
    const { other: otherParam, geolocation } = route.params;
    const toast = useToast();
    const [other, setOther] = useState(otherParam ?? {});
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState(t('common:no_internet'));
    const [connected, setConnected] = useState(true);
    const [errorVisible, setErrorVisible] = React.useState(false);
    const onDismissSnackBar = () => setErrorVisible(false);
    const [dataChanged, setDataChanged]: any = useState(false);
    const [errorMsg, setErrorMsg]: any = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [desiredAccuracy, setDesiredAccuracy] = useState(`${DEFAULT_DESIRED_ACCURACY_METERS}`);

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

        let location = await getBestLocation(Number(desiredAccuracy) || DEFAULT_DESIRED_ACCURACY_METERS); /*await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High
        });*/
        if(location){
            setOther({
                ...other,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });
            setDataChanged(true);
        }else{
            setErrorMessage(t('geolocation:permission_denied'));
            setErrorVisible(true);
        }
        
        setIsLoading(false);
    };


    const onRefresh = async () => {
        let my_no_sql_db_name = JSON.parse(await getData('my_no_sql_db_name'));
        
        setIsLoading(false);
        setRefreshing(true);
        setConnected(true);
        await check_network();
        //Get Other
        try {
            // await LocalDatabase.find({
            //     selector: { type: 'geolocation' }
            // })
            getDocumentsByAttributes({ type: 'geolocation' }, 2, 0, my_no_sql_db_name)
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
        let my_no_sql_db_name = JSON.parse(await getData('my_no_sql_db_name'));

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
                    doc.synced = true;

                    setOther({ ...o });

                    return doc;
                }, my_no_sql_db_name)
                    .then(function (res: any) {
                        if(res){
                            toast.show({
                                description: t('common:coordinates_saved'),
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

            setDataChanged(false);
        } else if (!other.name) {
            toast.show({
                description: t('geolocation:please_fill_place_name'),
            });
        } else {
            toast.show({
                description: t('geolocation:please_load_coordinates'),
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
                        <Text style={{ ...styles.subTitle, marginTop: 5 }}>{t('geolocation:place_label')}</Text>
                        <TextInput
                            style={{ marginBottom: 5 }}
                            mode="outlined"
                            theme={theme}
                            onChangeText={handle_name}
                            value={other.name}
                            placeholder={t('geolocation:place_placeholder')}
                        />

                        <Text style={{ ...styles.subTitle }}>{t('geolocation:description_label')}</Text>
                        <TextInput
                            multiline
                            mode="outlined"
                            theme={theme}
                            onChangeText={handle_description}
                            value={other.description}
                            placeholder={t('geolocation:description_placeholder')}
                        />

                    </Pressable>
                </HStack>
                <Heading fontSize={24} mt={4} my={3} size="md">
                    {t('geolocation:localization_heading')}
                </Heading>
                <View style={{ marginBottom: 3 }}>
                    <Text style={{ color: 'red' }}>{t('geolocation:ensure_on_site')}</Text>
                </View>
                <View style={{ marginBottom: 10 }}>
                    <Text style={styles.subTitle}>{t('geolocation:desired_accuracy_label')}</Text>
                    <TextInput
                        mode="outlined"
                        theme={theme}
                        keyboardType="numeric"
                        value={desiredAccuracy}
                        onChangeText={setDesiredAccuracy}
                        placeholder={`${DEFAULT_DESIRED_ACCURACY_METERS}`}
                        style={{ maxWidth: 140 }}
                    />
                </View>
                <View >
                    <Text>
                        <Text style={styles.text_title}>{t('geolocation:latitude_label')}</Text>
                        <Text>{other.latitude ?? " - "}</Text>
                    </Text>
                    <Text>
                        <Text style={styles.text_title}>{t('geolocation:longitude_label')}</Text>
                        <Text>{other.longitude ?? " - "}</Text>
                    </Text>
                </View>


                <View style={{
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }} >
                    {
                        isLoading && (<>{/*<Text>Veuillez recliquer si ça prend du temps</Text>*/}<ProgressBar styleAttr="Horizontal" color="primary.500" style={{ height: 25, width: '100%' }} /></>)
                    }
                    {!isLoading && <TouchableOpacity onPress={get_geo_location} style={{
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
                    </TouchableOpacity>}
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
                    {isSaving ? t('geolocation:saving_in_progress') : t('common:save')}
                </Button>}

                {(other && other.latitude && other.longitude) && <ViewGeolocation route={{ ...route, params: { ...route.params, name: t('geolocation:geolocation_title') } }}
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
