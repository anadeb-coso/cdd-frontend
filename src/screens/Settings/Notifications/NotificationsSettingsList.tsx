import React, { useEffect, useState } from 'react';
import {
    SafeAreaView, ToastAndroid, RefreshControl, ScrollView,
    TouchableOpacity, StyleSheet, Text, View, Switch, Alert
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
import SubscriptionAPI from '../../../services/news/subscription';


function NotificationsSettingsList() {
    const navigation =
        useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();

    const subscription_message = "Nous n'arrivons pas à vous abonner à toutes les catégories de publications.\n Veuillez contacter l'administrateur du système.";
    const unsubscription_message = "Nous n'arrivons pas à vous desabonner à toutes les catégories de publications.\n Veuillez contacter l'administrateur du système.";

    const [newsCategories, setNewsCategories]: any = useState(null);
    const [subscriptions, setSubscriptions]: any = useState(null);

    const [isEnabled, setIsEnabled] = useState(false);

    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
    const [connected, setConnected] = useState(true);
    const [errorVisible, setErrorVisible] = React.useState(false);
    const onDismissSnackBar = () => setErrorVisible(false);

    const load = async () => {

        new SubscriptionAPI()
            .get_subscriptions({
                username: JSON.parse(await getData('username')),
                password: JSON.parse(await getData('password')),
            })
            .then((result_s: any) => {
                setSubscriptions(result_s);


                new CategoryAPI()
                    .get_categories({})
                    .then((result: any) => {
                        setNewsCategories(result);

                        if(result){
                            setIsEnabled(true);
                            for(let i=0; i<result.length; i++) {
                                let c = result[i];
                                if(!result_s.find((s: any) => s.category.id == c.id)){
                                    setIsEnabled(false);
                                    break;
                                }
                            }
                        }
                        
                    }).catch((err) => {
                        console.error(`Unable to retrieve categories. ${JSON.stringify(err)}`);
                    });


            }).catch((err) => {
                console.error(`Unable to retrieve categories. ${JSON.stringify(err)}`);
            });


    };
    useEffect(() => {

        load();

    }, []);



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
    const onRefresh = async () => {
        setRefreshing(true);
        setConnected(true);

        load();

        await check_network();

        setRefreshing(false);

    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            onRefresh();
        });

        return unsubscribe;
    }, [navigation]);


    if (refreshing || !newsCategories)
        return <ActivityIndicator style={{ marginTop: 50 }} color={colors.primary} size="small" />;

    return (
        <>
            <ScrollView contentContainerStyle={{ paddingTop: 7, paddingHorizontal: 5 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }>
                <SafeAreaView>

                    <View>
                        {newsCategories &&
                            <>
                                <PressableCard shadow="0" key={`toutes_settings`} style={{ ...styles.item, backgroundColor: "white", flexDirection: 'row' }}>
                                    <Text style={{ marginLeft: 7, flex: 0.8 }}>
                                        Toutes
                                    </Text>
                                    <Switch
                                        style={{ alignSelf: 'flex-end', flex: 0.2 }}
                                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                                        thumbColor={isEnabled ? "blue" : "#f4f3f4"}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={async (v: boolean) => {
                                            if (v == false) {
                                                await new SubscriptionAPI()
                                                    .delete_subscription({
                                                        username: JSON.parse(await getData('username')),
                                                        password: JSON.parse(await getData('password')),
                                                        delete: 'all',
                                                        ids: subscriptions.map((s: any) => s.id)
                                                    })
                                                    .then(async (result: any) => {
                                                        if (result.success) {
                                                            setIsEnabled(v);
                                                            await load();
                                                        } else {
                                                            Alert.alert('Alert', unsubscription_message, [{ text: 'OK' }], {
                                                                cancelable: false,
                                                            });
                                                        }

                                                    }).catch((err) => {
                                                        Alert.alert('Alert', unsubscription_message, [{ text: 'OK' }], {
                                                            cancelable: false,
                                                        });
                                                    });
                                            } else {
                                                await new SubscriptionAPI()
                                                    .subscription({
                                                        username: JSON.parse(await getData('username')),
                                                        password: JSON.parse(await getData('password')),
                                                        save: 'all',
                                                    })
                                                    .then(async (result: any) => {
                                                        if (result.success) {
                                                            setIsEnabled(v);
                                                            await load();
                                                        } else {
                                                            Alert.alert('Alert', subscription_message, [{ text: 'OK' }], {
                                                                cancelable: false,
                                                            });
                                                        }

                                                    }).catch((err) => {
                                                        Alert.alert('Alert', subscription_message, [{ text: 'OK' }], {
                                                            cancelable: false,
                                                        });
                                                    });
                                            }


                                        }}
                                        value={isEnabled}
                                    />
                                </PressableCard>

                                {
                                    newsCategories.map((item: any) => <View>
                                        <PressableCard shadow="0" key={`${item.name}_settings`} style={{ ...styles.item, backgroundColor: "white", flexDirection: 'row' }}>
                                            <Text style={{ marginLeft: 7, flex: 0.8 }}>
                                                {item.name}
                                            </Text>
                                            <Switch
                                                style={{ alignSelf: 'flex-end', flex: 0.2 }}
                                                trackColor={{ false: "#767577", true: "#81b0ff" }}
                                                thumbColor={subscriptions.find((s: any) => s.category.id == item.id) ? "blue" : "#f4f3f4"}
                                                ios_backgroundColor="#3e3e3e"
                                                onValueChange={async (v: boolean) => {
                                                    if (v == false) {
                                                        await new SubscriptionAPI()
                                                            .delete_subscription({
                                                                username: JSON.parse(await getData('username')),
                                                                password: JSON.parse(await getData('password')),
                                                                id: subscriptions.find((s: any) => s.category.id == item.id)?.id ?? null
                                                            })
                                                            .then(async (result: any) => {
                                                                if (result.success) {
                                                                    setIsEnabled(v);
                                                                    await load();
                                                                } else {
                                                                    Alert.alert('Alert', unsubscription_message, [{ text: 'OK' }], {
                                                                        cancelable: false,
                                                                    });
                                                                }

                                                            }).catch((err) => {
                                                                Alert.alert('Alert', unsubscription_message, [{ text: 'OK' }], {
                                                                    cancelable: false,
                                                                });
                                                            });
                                                    } else {
                                                        await new SubscriptionAPI()
                                                            .subscription({
                                                                username: JSON.parse(await getData('username')),
                                                                password: JSON.parse(await getData('password')),
                                                                category: item.id
                                                            })
                                                            .then(async (result: any) => {
                                                                if (!result.error) {
                                                                    await load();
                                                                } else {
                                                                    Alert.alert('Alert', subscription_message, [{ text: 'OK' }], {
                                                                        cancelable: false,
                                                                    });
                                                                }

                                                            }).catch((err) => {
                                                                Alert.alert('Alert', subscription_message, [{ text: 'OK' }], {
                                                                    cancelable: false,
                                                                });
                                                            });
                                                    }


                                                }}
                                                value={subscriptions.find((s: any) => s.category.id == item.id) ? true : false}
                                            />
                                        </PressableCard>
                                    </View>)
                                }
                            </>
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

export default NotificationsSettingsList;
