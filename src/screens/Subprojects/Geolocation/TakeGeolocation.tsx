import React, { useEffect, useState } from 'react';
import { Heading, HStack, Pressable, ScrollView, View, Box } from 'native-base';
import { RefreshControl, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SmallCard from 'components/SmallCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Snackbar, Button } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import * as Location from 'expo-location';
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
                setDataChanged(true);
            });
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
                            <Text style={styles.text_title}>Sous-projet : </Text>
                            <Text>{subproject.full_title_of_approved_subproject}</Text>
                        </Text>
                        <Text>
                            <Text style={styles.text_title}>Type : </Text>
                            <Text>{subproject.type_of_subproject}</Text>
                        </Text>
                        <Text>
                            <Text style={styles.text_title}>Etape : </Text>
                            <Text>{subproject.current_subproject_step_and_level ?? " - "}</Text>
                        </Text>
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


                <View style={{
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }} >
                    <TouchableOpacity onPress={get_geo_location} style={{
                        margin: 'auto', 
                    }} disabled={isLoading}>
                        <Box rounded="lg" p={3} mt={3} bg="white" shadow={1} margin={'auto'}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <MaterialCommunityIcons style={{color: isLoading ? 'grey' : 'green'}} name="map-marker-circle" size={75} color={'#24c38b'}
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
    }
});
export default TakeGeolocation;
