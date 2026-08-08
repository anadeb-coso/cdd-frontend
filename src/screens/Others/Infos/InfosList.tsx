import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    SafeAreaView, ToastAndroid, RefreshControl, ScrollView,
    TouchableOpacity, StyleSheet, Text, View, Alert
} from 'react-native';
import { Box } from 'native-base';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../../utils/colors';
import { PrivateStackParamList } from '../../../types/navigation';
import { getData } from '../../../utils/storageManager';
import CategoryAPI from '../../../services/news/category';
import { PressableCard } from '../../../components/common/PressableCard';
import { cddBaseURL } from '../../../services/env';


function InfosList() {
    const { t } = useTranslation(['others', 'common']);
    const navigation =
        useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();

    const [newsCategories, setNewsCategories]: any = useState(null);

    const [username, setUserame]: any = useState(null);
    const [email, setEmail]: any = useState(null);

    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState(t('common:no_internet'));
    const [connected, setConnected] = useState(true);
    const [errorVisible, setErrorVisible] = React.useState(false);
    const onDismissSnackBar = () => setErrorVisible(false);


    const get_user_credentials = async () => {
        setUserame(JSON.parse(await getData('username')) ?? "undefined");
        setEmail(JSON.parse(await getData('username')) ?? "undefined");
    }

    const load = async () => {
        new CategoryAPI()
            .get_categories({})
            .then((result: any) => {
                setNewsCategories(result);
            }).catch((err) => {
                console.error(`Unable to retrieve categories. ${JSON.stringify(err)}`);
            });

    };
    useEffect(() => {
        get_user_credentials();


    }, []);



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
    const onRefresh = async () => {
        setRefreshing(true);
        setConnected(true);

        await check_network();

        setRefreshing(false);

    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            onRefresh();
        });

        return unsubscribe;
    }, [navigation]);


    if (refreshing)
        return <ActivityIndicator style={{ marginTop: 50 }} color={colors.primary} size="small" />;

    return (
        <>
            <ScrollView contentContainerStyle={{ paddingTop: 7, paddingHorizontal: 5 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }>
                <SafeAreaView>

                    <View >
                        {
                            [
                                {name: t('infos_list.planning_label'), routeName: 'InfosPlanning'},

                            ].map((item: any) => <View>
                                <PressableCard shadow="0" key={`${item.name}_settings`} style={{ ...styles.item, backgroundColor: "white" }}>
                                    <TouchableOpacity  key={`${item.name}_settings`} onPress={() => {
                                        if(item.routeName){
                                            navigation.navigate(item.routeName)
                                        }else{
                                            Alert.alert(t('others_common.feature_alert_title'), t('common:feature_in_development'), [{ text: t('common:ok') }], {
                                                cancelable: false,
                                            });
                                        }
                                    }}>
                                        <Box  key={`${item.name}_settings`} rounded="sm" style={{ flexDirection: 'row', width: '95%' }}>
                                            <Text style={{ marginLeft: 7 }}>
                                                {item.name}
                                            </Text>
                                        </Box>
                                    </TouchableOpacity>
                                </PressableCard>
                            </View>)
                        }
                    </View>


                    <Snackbar visible={errorVisible} duration={3000} onDismiss={onDismissSnackBar}>
                        {errorMessage}
                    </Snackbar>
                </SafeAreaView>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    addButton: {
        position: 'absolute',
        bottom: 25,
        right: 10,
        // marginBottom: 500,
        backgroundColor: '#63D3AC',
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        alignSelf: 'center',
        elevation: 8,
        zIndex: 9,

    },
    addButtonText: {
        color: 'white',
        fontSize: 30,
        lineHeight: 30,
    },
    item: {
        flex: 1,
        padding: 1,
        borderBottomWidth: 1,
        borderColor: '#f6f6f6',
    },
});

export default InfosList;
