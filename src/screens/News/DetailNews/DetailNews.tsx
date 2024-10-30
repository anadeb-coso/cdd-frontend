import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert, PermissionsAndroid, Platform } from 'react-native';
import { useToast } from 'native-base';
import { Avatar, Button, Card, Text } from 'react-native-paper';
import RNFS from 'react-native-fs';
import moment from 'moment';
import Clipboard from '@react-native-clipboard/clipboard';
import { FontAwesome } from '@expo/vector-icons';
import NewsAPI from '../../../services/news/news';
import { getData } from '../../../utils/storageManager';
import { requestWritePermission } from '../../../utils/permissions';
import TakePosition from '../AddNews/TakePosition';


const LeftContent = (props: any) => <Avatar.Icon {...props} icon="folder" />

const DetailNews = (
    { navigation, route }:
        { navigation: any, route: any }
) => {
    const { tags, categories, projects, username, email } = route.params;
    const { item } = route.params;
    const [_item, set_Item] = useState(route.params.item);
    const [currentUrl, setCurrentUrl] = useState(!item.files || (item.files && item.files.length == 0) ? null : item.files[0].url.split('?')[0]);

    const [is_superuser, setIs_superuser] = useState(null);
    const toast = useToast();


    const downloadImage = async () => {
        const hasPermission = await requestWritePermission();
        if (!hasPermission) {
            Alert.alert('Erreur', 'Permission non accordée');
            return;
        }

        const fileName = `${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}_${currentUrl.split('/')[currentUrl.split('/').length - 1]}`;

        const downloadDest = Platform.OS === 'android'
            ? `${RNFS.DownloadDirectoryPath}/${fileName}`
            : `${RNFS.DocumentDirectoryPath}/${fileName}`;

        try {
            const download = RNFS.downloadFile({
                fromUrl: currentUrl,
                toFile: downloadDest,
            });

            const result = await download.promise;

            if (result.statusCode === 200) {
                Alert.alert('Succès', 'Image téléchargée dans le dossier Téléchargements');
            } else {
                Alert.alert('Erreur', 'Échec du téléchargement de l\'image');
            }
        } catch (error) {
            Alert.alert('Erreur', 'Une erreur s\'est produite lors du téléchargement de l\'image');
            console.error(error);
        }
    };

    const copyTitle = () => {
        Clipboard.setString((_item ?? item).title);
        toast.show({
            description: 'Titre copié',
        });
    };

    const copyDescription = () => {
        Clipboard.setString((_item ?? item).description);
        toast.show({
            description: 'Description copiée',
        });
    };

    const copyUrl = () => {
        Clipboard.setString(currentUrl);
        toast.show({
            description: "Url de l'image copié",
        });
    };

    const copyTxt = (txt: any) => {
        Clipboard.setString(txt);
        toast.show({
            description: 'Texte copié',
        });
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            new NewsAPI()
                .get_new({}, item.id)
                .then((result: any) => {
                    set_Item(result);
                }).catch((err) => {
                    alert(`Unable to retrieve news. ${JSON.stringify(err)}`);
                });
        });

        (async function () {
            setIs_superuser(JSON.parse(await getData('username')));
        })

        return unsubscribe;
    }, [navigation]);

    const tableData = [
        {
            libelle: 'Présents',
            men_over_35: (_item ?? item).total_men_present_over_35 ?? 0, women_over_35: (_item ?? item).total_women_present_over_35 ?? 0,
            men_under_35: (_item ?? item).total_men_present_under_35 ?? 0, women_under_35: (_item ?? item).total_women_present_under_35 ?? 0,
            men_between_10_35: '-', women_between_10_35: '-',
            men_under_10: '-', women_under_10: '-',
            total: (_item ?? item).total_people_present ?? 0
        },
        {
            libelle: 'Blessés',
            men_over_35: (_item ?? item).total_men_over_35_injured ?? '-', women_over_35: (_item ?? item).total_women_over_35_injured ?? '-',
            men_under_35: (((_item ?? item).total_men_between_10_35_injured ?? 0) + ((_item ?? item).total_men_under_10_injured ?? 0)) ?? 0, women_under_35: (((_item ?? item).total_women_between_10_35_injured ?? 0) + ((_item ?? item).total_women_under_10_injured ?? 0)) ?? 0,
            men_between_10_35: (_item ?? item).total_men_between_10_35_injured ?? 0, women_between_10_35: (_item ?? item).total_women_between_10_35_injured ?? 0,
            men_under_10: (_item ?? item).total_men_under_10_injured ?? 0, women_under_10: (_item ?? item).total_men_under_10_injured ?? 0,
            total: (_item ?? item).total_people_injured ?? 0
        },
        {
            libelle: 'Morts',
            men_over_35: (_item ?? item).total_men_over_35_died ?? '-', women_over_35: (_item ?? item).total_women_over_35_died ?? '-',
            men_under_35: (((_item ?? item).total_men_between_10_35_died ?? 0) + ((_item ?? item).total_men_under_10_died ?? 0)) ?? 0, women_under_35: (((_item ?? item).total_women_between_10_35_died ?? 0) + ((_item ?? item).total_women_under_10_died ?? 0)) ?? 0,
            men_between_10_35: (_item ?? item).total_men_between_10_35_died ?? 0, women_between_10_35: (_item ?? item).total_women_between_10_35_died ?? 0,
            men_under_10: (_item ?? item).total_men_under_10_died ?? 0, women_under_10: (_item ?? item).total_men_under_10_died ?? 0,
            total: (_item ?? item).total_people_died ?? 0
        }
    ];
    return (
        <ScrollView _contentContainerStyle={{ pt: 7, px: 5 }} >
            <Card>
                {!currentUrl ? (
                    <>
                        {
                            (_item ?? item)?.latitude && (_item ?? item)?.longitude && <TakePosition key={`${(_item ?? item)?.longitude}_${(_item ?? item)?.latitude}}`} navigation={null} route={{
                                params: {
                                    coordinates: {
                                        latitude: (_item ?? item)?.latitude, longitude: (_item ?? item)?.longitude
                                    },
                                    // widthContainer, 
                                    heightContainer: 250,
                                    // widthMap, 
                                    heightMap: 250,
                                }
                            }} />
                        }
                    </>
                ) : (<Card.Content style={{ height: 250 }}>
                    <Card.Cover key={currentUrl} source={{ uri: currentUrl }} style={styles.card_cover} />
                    <TouchableOpacity
                        onPress={downloadImage}
                        style={{ alignSelf: 'flex-end', marginTop: -25 }}>
                        <FontAwesome name="download" size={25} color="green" />
                    </TouchableOpacity>

                </Card.Content>)}
                <Card.Content>

                    {currentUrl && <View style={{ flexDirection: 'row' }}>
                        <ScrollView horizontal={true} style={{ flex: 1 }} >
                            {(_item ?? item).files && (_item ?? item).files.map((e: any) => (
                                <TouchableOpacity onLongPress={() => copyUrl()} key={`touch_${e.url}`} onPress={() => { setCurrentUrl(e.url.split('?')[0]) }} style={[styles.imageItem]}>
                                    <Card.Cover key={e.url} source={{ uri: e.url.split('?')[0] }} style={[styles.card_cover_small]} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>}

                    {(_item ?? item).title && <Text variant="titleLarge" onLongPress={() => copyTitle()}>
                        {(_item ?? item).title} {!(_item ?? item).publish && <FontAwesome name="warning" size={24} color="grey" />}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            {
                                (_item ?? item).projects && (_item ?? item).projects.map((p: any) => <Text onLongPress={() => copyTxt(p?.name)} key={p?.name} style={{ paddingVertical: 4, paddingHorizontal: 9, backgroundColor: 'rgba(0, 255, 0, 0.5)', borderRadius: 11, marginHorizontal: 3, fontSize: 10 }}>{p?.name}</Text>)

                            }
                        </View>
                    </Text>}
                    {(_item ?? item).description && <Text variant="bodyMedium" onLongPress={() => copyDescription()}>{(_item ?? item).description}</Text>}

                    {((_item ?? item)?.category || ((_item ?? item).tags && (_item ?? item).tags.length != 0) || ((_item ?? item).administrative_levels && (_item ?? item).administrative_levels.length != 0)) && <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        <View style={{ flexDirection: 'column', flex: 0.4, flexWrap: 'wrap' }}>
                            {(_item ?? item)?.category && <Text onLongPress={() => copyTxt((_item ?? item)?.category?.name)} style={{ paddingVertical: 4, paddingHorizontal: 9, backgroundColor: 'rgba(0, 255, 0, 0.5)', borderRadius: 11, marginBottom: 2, fontSize: 9 }}>{(_item ?? item)?.category?.name}</Text>}
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                {
                                    (_item ?? item).tags && (_item ?? item).tags.map((t: any) => <Text onLongPress={() => copyTxt(t?.name)} key={t?.name} style={{ paddingVertical: 4, paddingHorizontal: 9, backgroundColor: 'rgba(255, 100, 200, 0.5)', borderRadius: 11, fontSize: 8 }}>{t?.name}</Text>)

                                }
                            </View>
                        </View>
                        <View style={{ flex: 0.6, alignItems: 'flex-end' }}>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                {
                                    (_item ?? item).administrative_levels && (_item ?? item).administrative_levels.filter((a: any) => a.type == "Canton").map((ad: any) => <Text onLongPress={() => copyTxt(ad?.name)} key={ad?.name} style={{ paddingVertical: 4, paddingHorizontal: 9, backgroundColor: 'rgba(100, 155, 111, 0.5)', borderRadius: 11, fontSize: 10 }}>{ad?.name}</Text>)

                                }
                            </View>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                {
                                    (_item ?? item).administrative_levels && (_item ?? item).administrative_levels.filter((a: any) => a.type == "Village").map((ad: any) => <Text onLongPress={() => copyTxt(ad?.name)} key={ad?.name} style={{ paddingVertical: 4, paddingHorizontal: 9, backgroundColor: 'rgba(100, 200, 200, 0.5)', borderRadius: 11, fontSize: 10 }}>{ad?.name}</Text>)

                                }
                            </View>
                        </View>
                    </View>}

                    {/* <ScrollView horizontal style={{ flex: 1, width: '100%', backgroundColor: 'red', flexWrap: 'wrap', }}> */}
                    {
                        (((_item ?? item).total_people_present && (_item ?? item).total_people_present != 0) ||
                            ((_item ?? item).total_people_injured && (_item ?? item).total_people_injured != 0) ||
                            ((_item ?? item).total_people_died && (_item ?? item).total_people_died != 0)) &&

                        <View style={styles.table}>
                            <View style={styles.tableRow}>
                                <Text style={[styles.tableHeader, styles.column1H1]}>Libellé</Text>
                                <Text style={[styles.tableHeader, styles.column2H1]}>Homme</Text>
                                <Text style={[styles.tableHeader, styles.column3H1]}>Femme</Text>
                                <Text style={[styles.tableHeader, styles.column4H1]}>Total</Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={[styles.tableHeader2, styles.column1]}>Age</Text>
                                <Text style={[styles.tableHeader2, styles.column2]}>{`<=10`}</Text>
                                <Text style={[styles.tableHeader2, styles.column3]}>{`10<X<=35`}</Text>
                                <Text style={[styles.tableHeader2, styles.column4]}>{`<=35`}</Text>
                                <Text style={[styles.tableHeader2, styles.column5]}>{`>35`}</Text>
                                <Text style={[styles.tableHeader2, styles.column6]}>{`<=10`}</Text>
                                <Text style={[styles.tableHeader2, styles.column7]}>{`10<X<=35`}</Text>
                                <Text style={[styles.tableHeader2, styles.column8]}>{`<=35`}</Text>
                                <Text style={[styles.tableHeader2, styles.column9]}>{`>35`}</Text>
                                <Text style={[styles.tableHeader2, styles.column10]}>Total</Text>
                            </View>

                            {tableData.filter((e: any) => e.total && e.total != 0).map((item, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={[styles.tableCell, styles.column1]}>{item.libelle}</Text>
                                    <Text style={[styles.tableCell, styles.column2]}>{item.men_under_10}</Text>
                                    <Text style={[styles.tableCell, styles.column3]}>{item.men_between_10_35}</Text>
                                    <Text style={[styles.tableCell, styles.column4]}>{item.men_under_35}</Text>
                                    <Text style={[styles.tableCell, styles.column5]}>{item.men_over_35}</Text>
                                    <Text style={[styles.tableCell, styles.column6]}>{item.women_under_10}</Text>
                                    <Text style={[styles.tableCell, styles.column7]}>{item.women_between_10_35}</Text>
                                    <Text style={[styles.tableCell, styles.column8]}>{item.women_under_35}</Text>
                                    <Text style={[styles.tableCell, styles.column9]}>{item.women_over_35}</Text>
                                    <Text style={[styles.tableCell, styles.column10]}>{item.total}</Text>
                                </View>
                            ))}
                        </View>}
                    {/* </ScrollView> */}

                    {currentUrl && (_item ?? item)?.latitude && (_item ?? item)?.longitude && <View style={{ marginVertical: 11 }}>
                        <>
                            {
                                <TakePosition key={`${(_item ?? item)?.longitude}_${(_item ?? item)?.latitude}}`} navigation={null} route={{
                                    params: {
                                        coordinates: {
                                            latitude: (_item ?? item)?.latitude, longitude: (_item ?? item)?.longitude
                                        },
                                        // widthContainer, 
                                        heightContainer: 350,
                                        // widthMap, 
                                        heightMap: 350,
                                    }
                                }} />
                            }
                        </>
                    </View>}

                </Card.Content>
                <Card.Actions>
                    {
                        <View style={{ flex: 1 }}>
                            {((_item ?? item)?.facilitator || (_item ?? item)?.user) && <Text style={{ flexWrap: 'nowrap' }}>
                                <FontAwesome name="user" size={15} /> {((_item ?? item)?.facilitator?.name ? (_item ?? item)?.facilitator?.name : ((_item ?? item)?.user ? `${(_item ?? item)?.user?.last_name ?? ''} ${(_item ?? item)?.user?.first_name ?? ''}` : 'Non défini'))}
                            </Text>}
                            {((_item ?? item)?.event_date || (_item ?? item)?.publication_date) && <Text style={{ flexWrap: 'nowrap', fontSize: 7 }}>
                                {(_item ?? item)?.event_date && <><FontAwesome name="clock-o" size={7} /> {moment((_item ?? item)?.event_date).format('DD-MMMM-YYYY')} {` `}</>} {(_item ?? item)?.publication_date && <><FontAwesome name="calendar-check-o" size={7} /> {moment((_item ?? item).publication_date).format('DD-MMMM-YYYY')}</>}
                            </Text>}
                        </View>
                    }
                    {/* <Button>Cancel</Button> */}
                    {(((_item ?? item)?.facilitator ?? (_item ?? item)?.user) && (((_item ?? item)?.facilitator ?? (_item ?? item)?.user).email == email || ((_item ?? item)?.facilitator ?? (_item ?? item)?.user).username == username)) && <Button onPress={() => {
                        navigation.navigate('AddNews', {
                            news: (_item ?? item),
                            name: (_item ?? item).title,
                            categories: categories,
                            tags: tags,
                            projects: projects,
                            newsFilesNoNews: (_item ?? item)?.files ?? []
                        })
                    }}>Modifier</Button>

                    }

                    {(((item?.facilitator ?? item?.user) && ((item?.facilitator ?? item?.user)?.email == email || (item?.facilitator ?? item?.user)?.username == username)) || (is_superuser == true)) &&
                        <Button onPress={async () => {

                            Alert.alert('Alert', `Voulez vous vraiment supprimer "${item?.title}" ?`, [
                                {
                                    text: "Oui", onPress: async () => {

                                        await new NewsAPI()
                                            .delete_new({
                                                id: item.id,
                                                username: JSON.parse(await getData('username')),
                                                password: JSON.parse(await getData('password'))
                                            })
                                            .then(async (reponse: any) => {
                                                if (reponse.error) {
                                                    toast.show({
                                                        description: 'Une erreur est survenue. Probablement vous avez pas accès à supprimer cette publication.',
                                                    });
                                                    return;
                                                }

                                                toast.show({
                                                    description: 'Publication supprimée avec succès.',
                                                });

                                                navigation.goBack();
                                            })
                                            .catch(error => {
                                                console.error(error);
                                            });

                                        navigation.goBack();

                                    }
                                },
                                {
                                    text: "Non", onPress: async () => {

                                    }
                                }
                            ]);




                        }} style={{ backgroundColor: 'red' }} textColor='white'>Supprimer</Button>
                    }


                </Card.Actions>
            </Card>
        </ScrollView>
    )
};

export default DetailNews;

const styles = StyleSheet.create({
    card_cover: {
        borderRadius: 0,
        height: 225
    },
    card_cover_small: {
        width: 50,
        height: 50,
        borderRadius: 15,
    },
    imageItem: {
        marginHorizontal: 5
    },
    table: {
        flex: 1,
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        marginVertical: 7
    },
    tableRow: {
        flex: 1,
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderColor: '#ddd',
    },
    tableHeader: {
        flex: 1,
        fontWeight: 'bold',
        backgroundColor: '#f8f8f8',
        borderRightWidth: 1,
        borderColor: '#ddd',
    },
    tableHeader2: {
        flex: 1,
        fontWeight: 'bold',
        backgroundColor: '#f8f8f8',
        borderRightWidth: 1,
        paddingVertical: 5,
        borderColor: '#ddd',
        textAlign: 'center',
        justifyContent: 'center',
        fontSize: 6,
    },
    tableCell: {
        flex: 1,
        borderRightWidth: 1,
        textAlign: 'center',
        justifyContent: 'center',
        paddingBottom: 7,
        borderColor: '#ddd',
        fontSize: 11,
    },
    column1H1: {
        flex: 0.2,
    },
    column2H1: {
        flex: 0.35,
    },
    column3H1: {
        flex: 0.35,
    },
    column4H1: {
        flex: 0.1,
    },
    column1: {
        flex: 0.2,
    },
    column2: {
        flex: 0.1,
    },
    column3: {
        flex: 0.1,
    },
    column4: {
        flex: 0.1,
    },
    column5: {
        flex: 0.1,
    },
    column6: {
        flex: 0.1,
    },
    column7: {
        flex: 0.1,
    },
    column8: {
        flex: 0.1,
    },
    column9: {
        flex: 0.1,
    },
    column10: {
        flex: 0.1,
    },
});