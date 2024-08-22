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
import { copyToClipboard } from '../../../utils/functions_native';


const LeftContent = (props: any) => <Avatar.Icon {...props} icon="folder" />

const DetailNews = (
    { navigation, route }:
        { navigation: any, route: any }
) => {
    const { tags, categories, projects, username, email } = route.params;
    const { item } = route.params;
    const [_item, set_Item] = useState(route.params.item);
    const [currentUrl, setCurrentUrl] = useState(!item.files || (item.files && item.files.length == 0) ? null : item.files[0].url.split('?')[0]);

    const toast = useToast();


    const downloadImage = async () => {
        const hasPermission = await requestWritePermission();
        if (!hasPermission) {
            Alert.alert('Erreur', 'Permission non accordée');
            return;
        }

        const fileName = `${moment().format()}_${currentUrl.split('/')[currentUrl.split('/').length - 1]}`;

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

        return unsubscribe;
    }, [navigation]);


    return (
        <ScrollView _contentContainerStyle={{ pt: 7, px: 5 }} >
            <Card>
                {!currentUrl ? (
                    <></>
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
                            {(_item ?? item).files.map((e: any) => (
                                <TouchableOpacity onLongPress={() => copyUrl()} key={`touch_${e.url}`} onPress={() => { setCurrentUrl(e.url.split('?')[0]) }} style={[styles.imageItem]}>
                                    <Card.Cover key={e.url} source={{ uri: e.url.split('?')[0] }} style={[styles.card_cover_small]} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>}

                    <Text variant="titleLarge" onLongPress={() => copyTitle()}>
                        {(_item ?? item).title} {!(_item ?? item).publish && <FontAwesome name="warning" size={24} color="grey" />}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            {
                                (_item ?? item).projects && (_item ?? item).projects.map((p: any) => <Text onLongPress={() => copyTxt(p?.name)} key={p?.name} style={{ paddingVertical: 4, paddingHorizontal: 9, backgroundColor: 'rgba(0, 255, 0, 0.5)', borderRadius: 11, marginHorizontal: 3, fontSize: 10 }}>{p?.name}</Text>)

                            }
                        </View>
                    </Text>
                    <Text variant="bodyMedium" onLongPress={() => copyDescription()}>{(_item ?? item).description}</Text>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        <View style={{ flexDirection: 'column', flex: 0.4, flexWrap: 'wrap' }}>
                            <Text onLongPress={() => copyTxt((_item ?? item)?.category?.name)} style={{ paddingVertical: 4, paddingHorizontal: 9, backgroundColor: 'rgba(0, 255, 0, 0.5)', borderRadius: 11, marginBottom: 2, fontSize: 9 }}>{(_item ?? item)?.category?.name}</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                {
                                    (_item ?? item).tags && (_item ?? item).tags.map((t: any) => <Text onLongPress={() => copyTxt(t?.name)} key={t?.name} style={{ paddingVertical: 4, paddingHorizontal: 9, backgroundColor: 'rgba(255, 100, 200, 0.5)', borderRadius: 11, fontSize: 8 }}>{t?.name}</Text>)

                                }
                            </View>
                        </View>
                        <View style={{ flex: 0.6 }}>
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
                    </View>
                </Card.Content>
                <Card.Actions>
                    {/* <Button>Cancel</Button> */}
                    {((item.facilitator ?? item.user) && ((item.facilitator ?? item.user).email == email || (item.facilitator ?? item.user).username == username)) && <Button onPress={() => {
                        navigation.navigate('AddNews', {
                            news: (_item ?? item),
                            name: (_item ?? item).title,
                            categories: categories,
                            tags: tags,
                            projects: projects,
                            newsFilesNoNews: (_item ?? item)?.files ?? []
                        })
                    }}>Modifier</Button>}

                    {(item.user && item.user.is_superuser == true) &&
                        <Button onPress={async () => {
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
    }
});