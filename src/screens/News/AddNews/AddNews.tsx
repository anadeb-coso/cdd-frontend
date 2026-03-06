import React, { useEffect, useState } from 'react';
import { Heading, HStack, Pressable, ScrollView, View, useToast } from 'native-base';
import { RefreshControl, Text, StyleSheet, Alert, TouchableOpacity, Button } from 'react-native';
import { ActivityIndicator, Snackbar, TextInput, Checkbox, Button as ButtonPaper } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import { Controller, useForm } from 'react-hook-form';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import SectionedMultiSelectCustom from '../../../components/SectionedMultiSelectCustom';
import SectionedOneSelectCustom from '../../../components/SectionedOneSelectCustom';
import AdministrativelevlsAPI from '../../../services/administrativelevls/administrativelevls';
import NewsAPI from '../../../services/news/news';
import MESSAGES from '../../../utils/formErrorMessages';
import { News } from '../../../models/news/News';
import { getData } from '../../../utils/storageManager';
import NewsAttachmentsComponent from '../../../components/NewsAttachmentsComponent';
import { return_numbers_only } from '../../../utils/functions';

const colors = ['primary.600', 'orange', 'lightblue', 'purple'];
const theme = {
    roundness: 12,
    colors: {
        ...colors,
        background: 'white',
        placeholder: '#dedede',
        text: '#707070',
    },
};

function AddNews({ navigation, route }: { navigation: any, route: any }) {
    const { tags, categories, projects, news, newsFilesNoNews } = route.params;

    const [newsObject, setNewsObject]: any = useState(news ? news : new News());

    const { control, handleSubmit, errors } = useForm({
        criteriaMode: 'all',
    });
    const toast = useToast();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorVisible, setErrorVisible] = React.useState(false);
    const [errorMessage, setErrorMessage] = useState("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
    const [connected, setConnected] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const onDismissSnackBar = () => setErrorVisible(false);


    const [attachments, setAttachments]: any = useState(newsFilesNoNews ?? []);
    const [newsCategoryS, setNewsCategoryS]: any = useState(news?.category ?? null);
    const [tagsS, setTagsS]: any = useState((news?.tags && news?.tags?.length != 0) ? news?.tags?.map((t: any) => t.id) : []);
    const [villages, setVillages]: any = useState(null);
    const [cantonsS, setCantonsS]: any = useState((news?.administrative_levels && news?.administrative_levels?.length != 0) ? news?.administrative_levels?.filter((t: any) => t.type == 'Canton').map((e: any) => e.id) : []);
    const [cantonsSelected, setCantonsSelected]: any = useState((news?.administrative_levels && news?.administrative_levels?.length != 0) ? news?.administrative_levels?.filter((t: any) => t.type == 'Canton').map((e: any) => { return { name: e.name, id: e.id, parent: e.parent, type: e.type } }) : []);
    const [villagesS, setVillagesS]: any = useState((news?.administrative_levels && news?.administrative_levels?.length != 0) ? news?.administrative_levels?.filter((t: any) => t.type == 'Village').map((e: any) => e.id) : []);
    const [villagesSelected, setVillagesSelected]: any = useState((news?.administrative_levels && news?.administrative_levels?.length != 0) ? news?.administrative_levels?.filter((t: any) => t.type == 'Village').map((e: any) => { return { name: e.name, id: e.id, parent: e.parent, type: e.type } }) : []);
    const [cantons, setCantons]: any = useState(null);

    const [coordinates, setCoordinates]: any = useState((news && news?.latitude) ? { latitude: news.latitude, longitude: news.longitude } : null);

    const [projectsS, setProjectsS]: any = useState((news?.projects && news?.projects?.length != 0) ? news?.projects?.map((t: any) => t.name) : ["COSO"]);
    const [publish, setPublish] = useState(news?.publish ?? false);


    const [isDateVisibleEvent, setisDateVisibleEvent] = useState(false);
    const handleConfirmEvent = (_date: any) => {
        setNewsObject({ ...newsObject, event_date: _date });
        hideDatePickerEvent();
    };
    const hideDatePickerEvent = () => {
        setisDateVisibleEvent(false);
    }; const showDatePickerEvent = () => {
        setisDateVisibleEvent(true);
    };

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

    const get_villages_by_cantons_id = async (parents_id: any, villages_selected_id: any = [], villages_selected: any = []) => {
        if(parents_id && parents_id.length != 0){
          await new AdministrativelevlsAPI().get_simple_administrativelevels({types: ["Village"], parents_id: parents_id}, 1, 1000).then((r:any)=>{
            let results = r?.results ?? [];
            setVillages(results);
            if(villages_selected_id && villages_selected_id.length != 0 && villages_selected && villages_selected.length != 0){
              let vs_id_s = villages_selected_id.filter((v_id:any)=>results.find((a:any)=>a.id==v_id));
              setVillagesS(vs_id_s);
              setVillagesSelected(villages_selected.filter((v:any)=>vs_id_s.includes(v.id)));
            }
          });
        }else{
          setVillages([]);
          setVillagesS([]);
          setVillagesSelected([]);
        }
      }

    const getAdministrativeLevels = async () => {
        NetInfo.fetch().then((state) => {
            if (!state.isConnected || !state.isInternetReachable) {
                Alert.alert('Not intervent', '', [{ text: 'OK' }], {
                    cancelable: false,
                });
            }
        });
        setLoading(true);
        if(connected){
            await new AdministrativelevlsAPI().get_simple_administrativelevels({types: ["Canton"]}, 1, 1000).then((r:any)=>{
                setCantons(r?.results ?? [])
              });
            
              if(news?.id){
                await get_villages_by_cantons_id(cantonsS ?? [], villagesS ?? [], villagesSelected ?? []);
              }
        }else{

        }
        setLoading(false);

        
    };

    useEffect(() => {
        setConnected(true);
        check_network();
        getAdministrativeLevels();

    }, []);


    const onSavePress = async (data: any) => {
        // files?: Array<NewsFile>

        setSaving(true);
        if (attachments.find((e: any) => e.url.includes("file://"))) {
            setSaving(false);
            toast.show({
                description: `Veuillez synchoniser tous les fichiers ou suppimer les fichiers non synchronisés`,
            });
        } else if (!newsCategoryS) {
            setSaving(false);
            toast.show({
                description: `Veuillez sélectionner une catégorie`,
            });
        } else if (!tagsS || (tagsS && tagsS.length == 0)) {
            setSaving(false);
            toast.show({
                description: `Veuillez choix au moins un tag`,
            });
        } else if (!cantonsS || (cantonsS && cantonsS.length == 0)) {
            setSaving(false);
            toast.show({
                description: `Veuillez choix au moins un canton`,
            });
        } else if (!newsObject?.title) {
            setSaving(false);
            toast.show({
                description: `Veuillez mentionner le titre`,
            });
        } else if (!newsObject?.description) {
            setSaving(false);
            toast.show({
                description: `Veuillez mentionner la description`,
            });
        } else if(!newsObject?.event_date){
            setSaving(false);
            toast.show({
                description: `Veuillez mentionner la date de l'événément`,
            });
        } else {
            
            try {
                newsObject.event_date = newsObject.event_date ? newsObject.event_date.toISOString().split('T')[0] : undefined;
              } catch (e) {
                //Nothing
              }

            let n = {
                ...newsObject,
                category: newsCategoryS.id,
                tags: tagsS,
                projects: projects.filter((e: any) => projectsS.includes(e.name)),
                administrative_levels: [
                    ...(
                        (cantonsSelected && cantonsSelected.length) ?
                            cantonsSelected.map((e: any) => { return { name: e.name, id: e.id, parent: e.parent, type: e.type } }) : []
                    ),
                    ...(
                        (villagesSelected && villagesSelected.length) ?
                            villagesSelected.map((e: any) => { return { name: e.name, id: e.id, parent: e.parent, type: e.type } }) : []
                    )
                ],
                facilitator: newsObject.facilitator ? newsObject.facilitator.id : null,
                user: newsObject.user ? newsObject.user.id : null,
                username: JSON.parse(await getData('username')),
                email: JSON.parse(await getData('email')),
                files: attachments,
            };
            setNewsObject(n);

            new NewsAPI()
                .save_new({
                    ...n,
                    password: JSON.parse(await getData('password')),
                })
                .then((result: any) => {
                    setSaving(false);
                    // route.params.onRefresh();
                    navigation.goBack();

                }).catch((error) => {
                    setSaving(false);
                    console.log(error);
                    Alert.alert('Warning', error?.toString(), [{ text: 'OK' }], {
                        cancelable: false,
                    });
                });

        }
    }

    const takeCoordinates = (newCoordinates: any) => {
        setCoordinates(newCoordinates);
        setNewsObject({
            ...newsObject,
            latitude: newCoordinates?.latitude,
            longitude: newCoordinates?.longitude
        })
    };

    const onRefresh = () => {
        setRefreshing(true);

        setConnected(true);
        check_network();

        setRefreshing(false);
    };

    if (loading || refreshing) {
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
        <>

            <ScrollView _contentContainerStyle={{ px: 5 }}
                nestedScrollEnabled={true}
                style={{ zIndex: 1 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }>

                <View>

                    <View style={{ flex: 1 }}>
                        <NewsAttachmentsComponent
                            attachments={attachments}
                            setAttachments={setAttachments}
                        />
                    </View>

                    <Button
                        title={(coordinates && coordinates?.longitude) ? `Lng : ${coordinates?.longitude} \nLat : ${coordinates?.latitude}` : "Ajouter les coordonnées"}
                        onPress={() => navigation.navigate('TakePosition', {
                            onTakeCoordinates: takeCoordinates,
                            coordinates: coordinates,
                            editMap: true,
                        })}
                    />

                    <View style={styles.fieldContainer}>
                        {/* {news ?  */}
                        <TextInput
                            placeholder="Titre"
                            style={[styles.textInputStyle, {
                                flex: 1, color: 'black'
                            }]}
                            onChangeText={value => {
                                setNewsObject({ ...newsObject, title: value });
                            }}
                            autoCapitalize="none"
                            value={newsObject?.title}
                            theme={theme}
                            mode="outlined"

                        />
                        
                    </View>

                    <View style={styles.fieldContainer}>
                        {/* {news ?  */}
                        <TextInput
                            placeholder="Description"
                            style={{
                                flex: 1, color: 'black'
                            }}
                            onChangeText={value => {
                                setNewsObject({ ...newsObject, description: value });
                            }}
                            autoCapitalize="none"
                            value={newsObject?.description}
                            theme={theme}
                            mode="outlined"
                            multiline
                        />
                        
                    </View>

                    <View style={styles.fieldContainer}>
                        <View style={{ flex: 1 }}>

                            <SectionedOneSelectCustom
                                id={"id"}
                                K_OPTIONS={categories}
                                items={categories}
                                itemSelected={newsCategoryS}
                                setItemSelected={setNewsCategoryS}
                                otherStyles={{
                                    borderRadius: 5,
                                    padding: 5,
                                    paddingVertical: 12,
                                }} title={"Choisissez une catégorie"} searchText={"Rechercher une catégorie"}
                            />
                        </View>
                    </View>

                    <View>
                        <View style={styles.fieldContainer}>
                            <View style={{ flex: 1 }}>
                                <SectionedMultiSelectCustom
                                    id={"id"}
                                    K_OPTIONS={tags}
                                    items={tags}
                                    itemsSelected={tagsS}
                                    setItemsSelected={setTagsS}
                                    otherStyles={{
                                        borderRadius: 5,
                                        padding: 5,
                                        paddingVertical: 12,
                                    }} title={"Choisissez un ou plusieurs Tag(s)"} searchText={"Rechercher un Tag"}
                                // marginEndChevronIcon={'-10%'}
                                />
                            </View>
                        </View>
                    </View>



                    <View>
                        <View>
                            <Text style={{ ...styles.subTitle }}>Nombre d'hommes plus de 35 ans présents</Text>
                            <TextInput
                                onChangeText={(v: any) => {
                                    let n_v = return_numbers_only(v);
                                    setNewsObject({
                                        ...newsObject,
                                        total_men_present_over_35: n_v,
                                        total_people_present_over_35: (
                                            (n_v ?? 0) + (newsObject?.total_women_present_over_35 ?? 0)
                                        ),
                                        total_people_present: (
                                            (newsObject?.total_men_present_under_35 ?? 0) + (newsObject?.total_women_present_under_35 ?? 0) +
                                            (newsObject?.total_women_present_over_35 ?? 0) + (n_v ?? 0)
                                        )
                                    });
                                }}
                                value={newsObject?.total_men_present_over_35?.toString()}
                                keyboardType="numeric"
                                placeholder="Total hommes > 35 ans"
                                theme={theme}
                                mode="outlined"
                            />
                            <Text></Text>
                        </View>
                        <View>
                            <Text style={{ ...styles.subTitle }}>Nombre de femmes plus de 35 ans présentes</Text>
                            <TextInput
                                onChangeText={(v: any) => {
                                    let n_v = return_numbers_only(v);
                                    setNewsObject({
                                        ...newsObject,
                                        total_women_present_over_35: n_v,
                                        total_people_present_over_35: (
                                            (newsObject?.total_men_present_over_35 ?? 0) + (n_v ?? 0)
                                        ),
                                        total_people_present: (
                                            (newsObject?.total_men_present_under_35 ?? 0) + (newsObject?.total_women_present_under_35 ?? 0) +
                                            (newsObject?.total_men_present_over_35 ?? 0) + (n_v ?? 0)
                                        )
                                    });
                                }}
                                value={newsObject?.total_women_present_over_35?.toString()}
                                keyboardType="numeric"
                                placeholder="Total femmes > 35 ans"
                                theme={theme}
                                mode="outlined"
                            />
                            <Text></Text>
                        </View>
                        <View>
                            <Text style={{ ...styles.subTitle }}>Total personnes plus de 35 ans présentes</Text>
                            <TextInput
                                disabled={true}
                                value={newsObject?.total_people_present_over_35?.toString()}
                                keyboardType="numeric"
                                placeholder="Total personnes > 35 ans"
                                theme={theme}
                                mode="outlined"
                            />
                            <Text></Text>
                        </View>


                        <View>
                            <Text style={{ ...styles.subTitle }}>Nombre d'hommes de 35 ans et moins de 35 ans présents</Text>
                            <TextInput
                                onChangeText={(v: any) => {
                                    let n_v = return_numbers_only(v);
                                    setNewsObject({
                                        ...newsObject,
                                        total_men_present_under_35: n_v,
                                        total_people_present_under_35: (
                                            (n_v ?? 0) + (newsObject?.total_women_present_under_35 ?? 0)
                                        ),
                                        total_people_present: (
                                            (newsObject?.total_men_present_over_35 ?? 0) + (newsObject?.total_women_present_over_35 ?? 0) +
                                            (newsObject?.total_women_present_under_35 ?? 0) + (n_v ?? 0)
                                        )
                                    });
                                }}
                                value={newsObject?.total_men_present_under_35?.toString()}
                                keyboardType="numeric"
                                placeholder="Total hommes <= 35 ans"
                                theme={theme}
                                mode="outlined"
                            />
                            <Text></Text>
                        </View>
                        <View>
                            <Text style={{ ...styles.subTitle }}>Nombre de femmes de 35 ans et moins de 35 ans présentes</Text>
                            <TextInput
                                onChangeText={(v: any) => {
                                    let n_v = return_numbers_only(v);
                                    setNewsObject({
                                        ...newsObject,
                                        total_women_present_under_35: n_v,
                                        total_people_present_under_35: (
                                            (newsObject?.total_men_present_under_35 ?? 0) + (n_v ?? 0)
                                        ),
                                        total_people_present: (
                                            (newsObject?.total_men_present_over_35 ?? 0) + (newsObject?.total_women_present_over_35 ?? 0) +
                                            (newsObject?.total_men_present_under_35 ?? 0) + (n_v ?? 0)
                                        )
                                    });
                                }}
                                value={newsObject?.total_women_present_under_35?.toString()}
                                keyboardType="numeric"
                                placeholder="Total femmes <= 35 ans"
                                theme={theme}
                                mode="outlined"
                            />
                            <Text></Text>
                        </View>
                        <View>
                            <Text style={{ ...styles.subTitle }}>Total personnes de 35 ans et moins de 35 ans présentes</Text>
                            <TextInput
                                disabled={true}
                                value={newsObject?.total_people_present_under_35?.toString()}
                                keyboardType="numeric"
                                placeholder="Total personnes <= 35 ans"
                                theme={theme}
                                mode="outlined"
                            />
                            <Text></Text>
                        </View>
                        <View>
                            <Text style={{ ...styles.subTitle }}>Total personnes présentes</Text>
                            <TextInput
                                disabled={true}
                                value={newsObject?.total_people_present?.toString()}
                                keyboardType="numeric"
                                placeholder="Total personnes <= 35 ans"
                                theme={theme}
                                mode="outlined"
                            />
                            <Text></Text>
                        </View>

                    </View>


                    {newsCategoryS && categories && categories.find((e: any) => e.id == newsCategoryS.id && ["Attaques Terroristes et Réponses"].includes(newsCategoryS.name)) &&
                        <View>


                            <View>
                                <View>
                                    <Text style={{ ...styles.subTitle }}>Nombre d'hommes plus de 35 ans blessés</Text>
                                    <TextInput
                                        onChangeText={(v: any) => {
                                            let n_v = return_numbers_only(v);
                                            setNewsObject({
                                                ...newsObject,
                                                total_men_over_35_injured: n_v,
                                                total_people_over_35_injured: (
                                                    (n_v ?? 0) + (newsObject?.total_women_over_35_injured ?? 0)
                                                ),
                                                total_people_injured: (
                                                    (newsObject?.total_men_between_10_35_injured ?? 0) + (newsObject?.total_women_between_10_35_injured ?? 0) +
                                                    (newsObject?.total_men_under_10_injured ?? 0) + (newsObject?.total_women_under_10_injured ?? 0) +
                                                    (newsObject?.total_women_over_35_injured ?? 0) + (n_v ?? 0)
                                                ),
                                                total_people_by_the_event: (
                                                    (n_v ?? 0) + (newsObject?.total_women_over_35_injured ?? 0) +
                                                    (newsObject?.total_men_between_10_35_injured ?? 0) + (newsObject?.total_women_between_10_35_injured ?? 0) +
                                                    (newsObject?.total_men_under_10_injured ?? 0) + (newsObject?.total_women_under_10_injured ?? 0) +
                                                    (newsObject?.total_men_over_35_died ?? 0) + (newsObject?.total_women_over_35_died ?? 0) +
                                                    (newsObject?.total_men_between_10_35_died ?? 0) + (newsObject?.total_women_between_10_35_died ?? 0) +
                                                    (newsObject?.total_men_under_10_died ?? 0) + (newsObject?.total_women_under_10_died ?? 0)
                                                )
                                            });
                                        }}
                                        value={newsObject?.total_men_over_35_injured?.toString()}
                                        keyboardType="numeric"
                                        placeholder="Total hommes > 35 ans"
                                        theme={theme}
                                        mode="outlined"
                                    />
                                    <Text></Text>
                                </View>
                                <View>
                                    <Text style={{ ...styles.subTitle }}>Nombre de femmes plus de 35 ans blessées</Text>
                                    <TextInput
                                        onChangeText={(v: any) => {
                                            let n_v = return_numbers_only(v);
                                            setNewsObject({
                                                ...newsObject,
                                                total_women_over_35_injured: n_v,
                                                total_people_over_35_injured: (
                                                    (n_v ?? 0) + (newsObject?.total_men_over_35_injured ?? 0)
                                                ),
                                                total_people_injured: (
                                                    (newsObject?.total_men_between_10_35_injured ?? 0) + (newsObject?.total_women_between_10_35_injured ?? 0) +
                                                    (newsObject?.total_men_under_10_injured ?? 0) + (newsObject?.total_women_under_10_injured ?? 0) +
                                                    (newsObject?.total_men_over_35_injured ?? 0) + (n_v ?? 0)
                                                ),
                                                total_people_by_the_event: (
                                                    (newsObject?.total_men_over_35_injured ?? 0) + (n_v ?? 0) +
                                                    (newsObject?.total_men_between_10_35_injured ?? 0) + (newsObject?.total_women_between_10_35_injured ?? 0) +
                                                    (newsObject?.total_men_under_10_injured ?? 0) + (newsObject?.total_women_under_10_injured ?? 0) +
                                                    (newsObject?.total_men_over_35_died ?? 0) + (newsObject?.total_women_over_35_died ?? 0) +
                                                    (newsObject?.total_men_between_10_35_died ?? 0) + (newsObject?.total_women_between_10_35_died ?? 0) +
                                                    (newsObject?.total_men_under_10_died ?? 0) + (newsObject?.total_women_under_10_died ?? 0)
                                                )
                                            });
                                        }}
                                        value={newsObject?.total_women_over_35_injured?.toString()}
                                        keyboardType="numeric"
                                        placeholder="Total femmes > 35 ans"
                                        theme={theme}
                                        mode="outlined"
                                    />
                                    <Text></Text>
                                </View>
                                <View>
                                    <Text style={{ ...styles.subTitle }}>Total personnes plus de 35 ans blessées</Text>
                                    <TextInput
                                        disabled={true}
                                        value={newsObject?.total_people_over_35_injured?.toString()}
                                        keyboardType="numeric"
                                        placeholder="Total personnes > 35 ans"
                                        theme={theme}
                                        mode="outlined"
                                    />
                                    <Text></Text>
                                </View>


                                <View>
                                    <Text style={{ ...styles.subTitle }}>Nombre d'hommes entre 10 ans et 35 ans blessés</Text>
                                    <TextInput
                                        onChangeText={(v: any) => {
                                            let n_v = return_numbers_only(v);
                                            setNewsObject({
                                                ...newsObject,
                                                total_men_between_10_35_injured: n_v,
                                                total_people_between_10_35_injured: (
                                                    (n_v ?? 0) + (newsObject?.total_women_between_10_35_injured ?? 0)
                                                ),
                                                total_people_injured: (
                                                    (newsObject?.total_men_over_35_injured ?? 0) + (newsObject?.total_women_over_35_injured ?? 0) +
                                                    (newsObject?.total_men_under_10_injured ?? 0) + (newsObject?.total_women_under_10_injured ?? 0) +
                                                    (newsObject?.total_women_between_10_35_injured ?? 0) + (n_v ?? 0)
                                                ),
                                                total_people_by_the_event: (
                                                    (newsObject?.total_men_over_35_injured ?? 0) + (newsObject?.total_women_over_35_injured ?? 0) +
                                                    (n_v ?? 0) + (newsObject?.total_women_between_10_35_injured ?? 0) +
                                                    (newsObject?.total_men_under_10_injured ?? 0) + (newsObject?.total_women_under_10_injured ?? 0) +
                                                    (newsObject?.total_men_over_35_died ?? 0) + (newsObject?.total_women_over_35_died ?? 0) +
                                                    (newsObject?.total_men_between_10_35_died ?? 0) + (newsObject?.total_women_between_10_35_died ?? 0) +
                                                    (newsObject?.total_men_under_10_died ?? 0) + (newsObject?.total_women_under_10_died ?? 0)
                                                )
                                            });
                                        }}
                                        value={newsObject?.total_men_between_10_35_injured?.toString()}
                                        keyboardType="numeric"
                                        placeholder="Total hommes entre 10 et 35 ans"
                                        theme={theme}
                                        mode="outlined"
                                    />
                                    <Text></Text>
                                </View>
                                <View>
                                    <Text style={{ ...styles.subTitle }}>Nombre de femmes entre 10 ans et 35 ans blessées</Text>
                                    <TextInput
                                        onChangeText={(v: any) => {
                                            let n_v = return_numbers_only(v);
                                            setNewsObject({
                                                ...newsObject,
                                                total_women_between_10_35_injured: n_v,
                                                total_people_between_10_35_injured: (
                                                    (newsObject?.total_men_between_10_35_injured ?? 0) + (n_v ?? 0)
                                                ),
                                                total_people_injured: (
                                                    (newsObject?.total_men_over_35_injured ?? 0) + (newsObject?.total_women_over_35_injured ?? 0) +
                                                    (newsObject?.total_men_under_10_injured ?? 0) + (newsObject?.total_women_under_10_injured ?? 0) +
                                                    (newsObject?.total_men_between_10_35_injured ?? 0) + (n_v ?? 0)
                                                ),
                                                total_people_by_the_event: (
                                                    (newsObject?.total_men_over_35_injured ?? 0) + (newsObject?.total_women_over_35_injured ?? 0) +
                                                    (newsObject?.total_men_between_10_35_injured ?? 0) + (n_v ?? 0) +
                                                    (newsObject?.total_men_under_10_injured ?? 0) + (newsObject?.total_women_under_10_injured ?? 0) +
                                                    (newsObject?.total_men_over_35_died ?? 0) + (newsObject?.total_women_over_35_died ?? 0) +
                                                    (newsObject?.total_men_between_10_35_died ?? 0) + (newsObject?.total_women_between_10_35_died ?? 0) +
                                                    (newsObject?.total_men_under_10_died ?? 0) + (newsObject?.total_women_under_10_died ?? 0)
                                                )
                                            });
                                        }}
                                        value={newsObject?.total_women_between_10_35_injured?.toString()}
                                        keyboardType="numeric"
                                        placeholder="Total femmes entre 10 et 35 ans"
                                        theme={theme}
                                        mode="outlined"
                                    />
                                    <Text></Text>
                                </View>
                                <View>
                                    <Text style={{ ...styles.subTitle }}>Total personnes entre 10 ans et 35 ans blessées</Text>
                                    <TextInput
                                        disabled={true}
                                        value={newsObject?.total_people_between_10_35_injured?.toString()}
                                        keyboardType="numeric"
                                        placeholder="Total personnes entre 10 et 35 ans"
                                        theme={theme}
                                        mode="outlined"
                                    />
                                    <Text></Text>
                                </View>


                                <View>
                                    <Text style={{ ...styles.subTitle }}>Nombre de garcons de 10 ans et moins de 10 ans blessés</Text>
                                    <TextInput
                                        onChangeText={(v: any) => {
                                            let n_v = return_numbers_only(v);
                                            setNewsObject({
                                                ...newsObject,
                                                total_men_under_10_injured: n_v,
                                                total_people_under_10_injured: (
                                                    (n_v ?? 0) + (newsObject?.total_women_under_10_injured ?? 0)
                                                ),
                                                total_people_injured: (
                                                    (newsObject?.total_men_over_35_injured ?? 0) + (newsObject?.total_women_over_35_injured ?? 0) +
                                                    (newsObject?.total_men_between_10_35_injured ?? 0) + (newsObject?.total_women_between_10_35_injured ?? 0) +
                                                    (newsObject?.total_women_under_10_injured ?? 0) + (n_v ?? 0)
                                                ),
                                                total_people_by_the_event: (
                                                    (newsObject?.total_men_over_35_injured ?? 0) + (newsObject?.total_women_over_35_injured ?? 0) +
                                                    (newsObject?.total_men_between_10_35_injured ?? 0) + (newsObject?.total_women_between_10_35_injured ?? 0) +
                                                    (n_v ?? 0) + (newsObject?.total_women_under_10_injured ?? 0) +
                                                    (newsObject?.total_men_over_35_died ?? 0) + (newsObject?.total_women_over_35_died ?? 0) +
                                                    (newsObject?.total_men_between_10_35_died ?? 0) + (newsObject?.total_women_between_10_35_died ?? 0) +
                                                    (newsObject?.total_men_under_10_died ?? 0) + (newsObject?.total_women_under_10_died ?? 0)
                                                )
                                            });
                                        }}
                                        value={newsObject?.total_men_under_10_injured?.toString()}
                                        keyboardType="numeric"
                                        placeholder="Total garcons <= 10 ans"
                                        theme={theme}
                                        mode="outlined"
                                    />
                                    <Text></Text>
                                </View>
                                <View>
                                    <Text style={{ ...styles.subTitle }}>Nombre de filles de 10 ans et moins de 10 ans blessées</Text>
                                    <TextInput
                                        onChangeText={(v: any) => {
                                            let n_v = return_numbers_only(v);
                                            setNewsObject({
                                                ...newsObject,
                                                total_women_under_10_injured: n_v,
                                                total_people_under_10_injured: (
                                                    (newsObject?.total_men_under_10_injured ?? 0) + (n_v ?? 0)
                                                ),
                                                total_people_injured: (
                                                    (newsObject?.total_men_over_35_injured ?? 0) + (newsObject?.total_women_over_35_injured ?? 0) +
                                                    (newsObject?.total_men_between_10_35_injured ?? 0) + (newsObject?.total_women_between_10_35_injured ?? 0) +
                                                    (newsObject?.total_men_under_10_injured ?? 0) + (n_v ?? 0)
                                                ),
                                                total_people_by_the_event: (
                                                    (newsObject?.total_men_over_35_injured ?? 0) + (newsObject?.total_women_over_35_injured ?? 0) +
                                                    (newsObject?.total_men_between_10_35_injured ?? 0) + (newsObject?.total_women_between_10_35_injured ?? 0) +
                                                    (newsObject?.total_men_under_10_injured ?? 0) + (n_v ?? 0) +
                                                    (newsObject?.total_men_over_35_died ?? 0) + (newsObject?.total_women_over_35_died ?? 0) +
                                                    (newsObject?.total_men_between_10_35_died ?? 0) + (newsObject?.total_women_between_10_35_died ?? 0) +
                                                    (newsObject?.total_men_under_10_died ?? 0) + (newsObject?.total_women_under_10_died ?? 0)
                                                )
                                            });
                                        }}
                                        value={newsObject?.total_women_under_10_injured?.toString()}
                                        keyboardType="numeric"
                                        placeholder="Total filles <= 10 ans"
                                        theme={theme}
                                        mode="outlined"
                                    />
                                    <Text></Text>
                                </View>
                                <View>
                                    <Text style={{ ...styles.subTitle }}>Total d'enfants de 10 ans et moins de 10 ans blessées</Text>
                                    <TextInput
                                        disabled={true}
                                        value={newsObject?.total_people_under_10_injured?.toString()}
                                        keyboardType="numeric"
                                        placeholder="Total enfants <= 10 ans"
                                        theme={theme}
                                        mode="outlined"
                                    />
                                    <Text></Text>
                                </View>

                                <View>
                                    <Text style={{ ...styles.subTitle }}>Total personnes blessées</Text>
                                    <TextInput
                                        disabled={true}
                                        value={newsObject?.total_people_injured?.toString()}
                                        keyboardType="numeric"
                                        placeholder="Total personnes blessées"
                                        theme={theme}
                                        mode="outlined"
                                    />
                                    <Text></Text>
                                </View>
                            </View>



                            <View>
                                <View>
                                    <Text style={{ ...styles.subTitle }}>Nombre d'hommes plus de 35 ans morts</Text>
                                    <TextInput
                                        onChangeText={(v: any) => {
                                            let n_v = return_numbers_only(v);
                                            setNewsObject({
                                                ...newsObject,
                                                total_men_over_35_died: n_v,
                                                total_people_over_35_died: (
                                                    (n_v ?? 0) + (newsObject?.total_women_over_35_died ?? 0)
                                                ),
                                                total_people_died: (
                                                    (newsObject?.total_men_between_10_35_died ?? 0) + (newsObject?.total_women_between_10_35_died ?? 0) +
                                                    (newsObject?.total_men_under_10_died ?? 0) + (newsObject?.total_women_under_10_died ?? 0) +
                                                    (newsObject?.total_women_over_35_died ?? 0) + (n_v ?? 0)
                                                ),
                                                total_people_by_the_event: (
                                                    (newsObject?.total_men_over_35_injured ?? 0) + (newsObject?.total_women_over_35_injured ?? 0) +
                                                    (newsObject?.total_men_between_10_35_injured ?? 0) + (newsObject?.total_women_between_10_35_injured ?? 0) +
                                                    (newsObject?.total_men_under_10_injured ?? 0) + (newsObject?.total_women_under_10_injured ?? 0) +
                                                    (n_v ?? 0) + (newsObject?.total_women_over_35_died ?? 0) +
                                                    (newsObject?.total_men_between_10_35_died ?? 0) + (newsObject?.total_women_between_10_35_died ?? 0) +
                                                    (newsObject?.total_men_under_10_died ?? 0) + (newsObject?.total_women_under_10_died ?? 0)
                                                )
                                            });
                                        }}
                                        value={newsObject?.total_men_over_35_died?.toString()}
                                        keyboardType="numeric"
                                        placeholder="Total hommes > 35 ans"
                                        theme={theme}
                                        mode="outlined"
                                    />
                                    <Text></Text>
                                </View>
                                <View>
                                    <Text style={{ ...styles.subTitle }}>Nombre de femmes plus de 35 ans mortes</Text>
                                    <TextInput
                                        onChangeText={(v: any) => {
                                            let n_v = return_numbers_only(v);
                                            setNewsObject({
                                                ...newsObject,
                                                total_women_over_35_died: n_v,
                                                total_people_over_35_died: (
                                                    (n_v ?? 0) + (newsObject?.total_men_over_35_died ?? 0)
                                                ),
                                                total_people_died: (
                                                    (newsObject?.total_men_between_10_35_died ?? 0) + (newsObject?.total_women_between_10_35_died ?? 0) +
                                                    (newsObject?.total_men_under_10_died ?? 0) + (newsObject?.total_women_under_10_died ?? 0) +
                                                    (newsObject?.total_men_over_35_died ?? 0) + (n_v ?? 0)
                                                ),
                                                total_people_by_the_event: (
                                                    (newsObject?.total_men_over_35_injured ?? 0) + (newsObject?.total_women_over_35_injured ?? 0) +
                                                    (newsObject?.total_men_between_10_35_injured ?? 0) + (newsObject?.total_women_between_10_35_injured ?? 0) +
                                                    (newsObject?.total_men_under_10_injured ?? 0) + (newsObject?.total_women_under_10_injured ?? 0) +
                                                    (newsObject?.total_men_over_35_died ?? 0) + (n_v ?? 0) +
                                                    (newsObject?.total_men_between_10_35_died ?? 0) + (newsObject?.total_women_between_10_35_died ?? 0) +
                                                    (newsObject?.total_men_under_10_died ?? 0) + (newsObject?.total_women_under_10_died ?? 0)
                                                )
                                            });
                                        }}
                                        value={newsObject?.total_women_over_35_died?.toString()}
                                        keyboardType="numeric"
                                        placeholder="Total femmes > 35 ans"
                                        theme={theme}
                                        mode="outlined"
                                    />
                                    <Text></Text>
                                </View>
                                <View>
                                    <Text style={{ ...styles.subTitle }}>Total personnes plus de 35 ans mortes</Text>
                                    <TextInput
                                        disabled={true}
                                        value={newsObject?.total_people_over_35_died?.toString()}
                                        keyboardType="numeric"
                                        placeholder="Total personnes > 35 ans"
                                        theme={theme}
                                        mode="outlined"
                                    />
                                    <Text></Text>
                                </View>


                                <View>
                                    <Text style={{ ...styles.subTitle }}>Nombre d'hommes entre 10 ans et 35 ans morts</Text>
                                    <TextInput
                                        onChangeText={(v: any) => {
                                            let n_v = return_numbers_only(v);
                                            setNewsObject({
                                                ...newsObject,
                                                total_men_between_10_35_died: n_v,
                                                total_people_between_10_35_died: (
                                                    (n_v ?? 0) + (newsObject?.total_women_between_10_35_died ?? 0)
                                                ),
                                                total_people_died: (
                                                    (newsObject?.total_men_over_35_died ?? 0) + (newsObject?.total_women_over_35_died ?? 0) +
                                                    (newsObject?.total_men_under_10_died ?? 0) + (newsObject?.total_women_under_10_died ?? 0) +
                                                    (newsObject?.total_women_between_10_35_died ?? 0) + (n_v ?? 0)
                                                ),
                                                total_people_by_the_event: (
                                                    (newsObject?.total_men_over_35_injured ?? 0) + (newsObject?.total_women_over_35_injured ?? 0) +
                                                    (newsObject?.total_men_between_10_35_injured ?? 0) + (newsObject?.total_women_between_10_35_injured ?? 0) +
                                                    (newsObject?.total_men_under_10_injured ?? 0) + (newsObject?.total_women_under_10_injured ?? 0) +
                                                    (newsObject?.total_men_over_35_died ?? 0) + (newsObject?.total_women_over_35_died ?? 0) +
                                                    (n_v ?? 0) + (newsObject?.total_women_between_10_35_died ?? 0) +
                                                    (newsObject?.total_men_under_10_died ?? 0) + (newsObject?.total_women_under_10_died ?? 0)
                                                )
                                            });
                                        }}
                                        value={newsObject?.total_men_between_10_35_died?.toString()}
                                        keyboardType="numeric"
                                        placeholder="Total hommes entre 10 et 35 ans"
                                        theme={theme}
                                        mode="outlined"
                                    />
                                    <Text></Text>
                                </View>
                                <View>
                                    <Text style={{ ...styles.subTitle }}>Nombre de femmes entre 10 ans et 35 ans mortes</Text>
                                    <TextInput
                                        onChangeText={(v: any) => {
                                            let n_v = return_numbers_only(v);
                                            setNewsObject({
                                                ...newsObject,
                                                total_women_between_10_35_died: n_v,
                                                total_people_between_10_35_died: (
                                                    (newsObject?.total_men_between_10_35_died ?? 0) + (n_v ?? 0)
                                                ),
                                                total_people_died: (
                                                    (newsObject?.total_men_over_35_died ?? 0) + (newsObject?.total_women_over_35_died ?? 0) +
                                                    (newsObject?.total_men_under_10_died ?? 0) + (newsObject?.total_women_under_10_died ?? 0) +
                                                    (newsObject?.total_men_between_10_35_died ?? 0) + (n_v ?? 0)
                                                ),
                                                total_people_by_the_event: (
                                                    (newsObject?.total_men_over_35_injured ?? 0) + (newsObject?.total_women_over_35_injured ?? 0) +
                                                    (newsObject?.total_men_between_10_35_injured ?? 0) + (newsObject?.total_women_between_10_35_injured ?? 0) +
                                                    (newsObject?.total_men_under_10_injured ?? 0) + (newsObject?.total_women_under_10_injured ?? 0) +
                                                    (newsObject?.total_men_over_35_died ?? 0) + (newsObject?.total_women_over_35_died ?? 0) +
                                                    (newsObject?.total_men_between_10_35_died ?? 0) + (n_v ?? 0) +
                                                    (newsObject?.total_men_under_10_died ?? 0) + (newsObject?.total_women_under_10_died ?? 0)
                                                )
                                            });
                                        }}
                                        value={newsObject?.total_women_between_10_35_died?.toString()}
                                        keyboardType="numeric"
                                        placeholder="Total femmes entre 10 et 35 ans"
                                        theme={theme}
                                        mode="outlined"
                                    />
                                    <Text></Text>
                                </View>
                                <View>
                                    <Text style={{ ...styles.subTitle }}>Total personnes entre 10 ans et 35 ans mortes</Text>
                                    <TextInput
                                        disabled={true}
                                        value={newsObject?.total_people_between_10_35_died?.toString()}
                                        keyboardType="numeric"
                                        placeholder="Total personnes entre 10 et 35 ans"
                                        theme={theme}
                                        mode="outlined"
                                    />
                                    <Text></Text>
                                </View>


                                <View>
                                    <Text style={{ ...styles.subTitle }}>Nombre de garcons de 10 ans et moins de 10 ans morts</Text>
                                    <TextInput
                                        onChangeText={(v: any) => {
                                            let n_v = return_numbers_only(v);
                                            setNewsObject({
                                                ...newsObject,
                                                total_men_under_10_died: n_v,
                                                total_people_under_10_died: (
                                                    (n_v ?? 0) + (newsObject?.total_women_under_10_died ?? 0)
                                                ),
                                                total_people_died: (
                                                    (newsObject?.total_men_over_35_died ?? 0) + (newsObject?.total_women_over_35_died ?? 0) +
                                                    (newsObject?.total_men_between_10_35_died ?? 0) + (newsObject?.total_women_between_10_35_died ?? 0) +
                                                    (newsObject?.total_women_under_10_died ?? 0) + (n_v ?? 0)
                                                ),
                                                total_people_by_the_event: (
                                                    (newsObject?.total_men_over_35_injured ?? 0) + (newsObject?.total_women_over_35_injured ?? 0) +
                                                    (newsObject?.total_men_between_10_35_injured ?? 0) + (newsObject?.total_women_between_10_35_injured ?? 0) +
                                                    (newsObject?.total_men_under_10_injured ?? 0) + (newsObject?.total_women_under_10_injured ?? 0) +
                                                    (newsObject?.total_men_over_35_died ?? 0) + (newsObject?.total_women_over_35_died ?? 0) +
                                                    (newsObject?.total_men_between_10_35_died ?? 0) + (newsObject?.total_women_between_10_35_died ?? 0) +
                                                    (n_v ?? 0) + (newsObject?.total_women_under_10_died ?? 0)
                                                )
                                            });
                                        }}
                                        value={newsObject?.total_men_under_10_died?.toString()}
                                        keyboardType="numeric"
                                        placeholder="Total garcons <= 10 ans"
                                        theme={theme}
                                        mode="outlined"
                                    />
                                    <Text></Text>
                                </View>
                                <View>
                                    <Text style={{ ...styles.subTitle }}>Nombre de filles de 10 ans et moins de 10 ans mortes</Text>
                                    <TextInput
                                        onChangeText={(v: any) => {
                                            let n_v = return_numbers_only(v);
                                            setNewsObject({
                                                ...newsObject,
                                                total_women_under_10_died: n_v,
                                                total_people_under_10_died: (
                                                    (newsObject?.total_men_under_10_died ?? 0) + (n_v ?? 0)
                                                ),
                                                total_people_died: (
                                                    (newsObject?.total_men_over_35_died ?? 0) + (newsObject?.total_women_over_35_died ?? 0) +
                                                    (newsObject?.total_men_between_10_35_died ?? 0) + (newsObject?.total_women_between_10_35_died ?? 0) +
                                                    (newsObject?.total_men_under_10_died ?? 0) + (n_v ?? 0)
                                                ),
                                                total_people_by_the_event: (
                                                    (newsObject?.total_men_over_35_injured ?? 0) + (newsObject?.total_women_over_35_injured ?? 0) +
                                                    (newsObject?.total_men_between_10_35_injured ?? 0) + (newsObject?.total_women_between_10_35_injured ?? 0) +
                                                    (newsObject?.total_men_under_10_injured ?? 0) + (newsObject?.total_women_under_10_injured ?? 0) +
                                                    (newsObject?.total_men_over_35_died ?? 0) + (newsObject?.total_women_over_35_died ?? 0) +
                                                    (newsObject?.total_men_between_10_35_died ?? 0) + (newsObject?.total_women_between_10_35_died ?? 0) +
                                                    (newsObject?.total_men_under_10_died ?? 0) + (n_v ?? 0)
                                                )
                                            });
                                        }}
                                        value={newsObject?.total_women_under_10_died?.toString()}
                                        keyboardType="numeric"
                                        placeholder="Total filles <= 10 ans"
                                        theme={theme}
                                        mode="outlined"
                                    />
                                    <Text></Text>
                                </View>
                                <View>
                                    <Text style={{ ...styles.subTitle }}>Total d'enfants de 10 ans et moins de 10 ans mortes</Text>
                                    <TextInput
                                        disabled={true}
                                        value={newsObject?.total_people_under_10_died?.toString()}
                                        keyboardType="numeric"
                                        placeholder="Total enfants <= 10 ans"
                                        theme={theme}
                                        mode="outlined"
                                    />
                                    <Text></Text>
                                </View>

                                <View>
                                    <Text style={{ ...styles.subTitle }}>Total personnes mortes</Text>
                                    <TextInput
                                        disabled={true}
                                        value={newsObject?.total_people_died?.toString()}
                                        keyboardType="numeric"
                                        placeholder="Total personnes mortes"
                                        theme={theme}
                                        mode="outlined"
                                    />
                                    <Text></Text>
                                </View>
                            </View>


                            <View>
                                <Text style={{ ...styles.subTitle }}>Total personnes touchées par l'événément</Text>
                                <TextInput
                                    disabled={true}
                                    value={newsObject?.total_people_by_the_event?.toString()}
                                    keyboardType="numeric"
                                    placeholder="Total personnes touchées par l'événément"
                                    theme={theme}
                                    mode="outlined"
                                />
                                <Text></Text>
                            </View>


                        </View>
                    }

                    <View>
                        <View style={styles.fieldContainer}>
                            <View style={{ flex: 1 }}>
                                <SectionedMultiSelectCustom
                                    id={"id"}
                                    K_OPTIONS={cantons}
                                    items={cantons}
                                    itemsSelected={cantonsS}
                                    setItemsSelected={(v: any) => {
                                        setCantonsS(v);
                                        setCantonsSelected(cantons.filter((e: any) => v.includes(e.id) ?? []));
                                    }}
                                    onConfirm={() =>{
                                        get_villages_by_cantons_id(cantonsS)
                                      }}
                                    otherStyles={{
                                        borderRadius: 5,
                                        padding: 5,
                                        paddingVertical: 12,
                                    }} title={"Choisissez un ou plusieurs canton(s)"} searchText={"Rechercher un canton"}
                                // marginEndChevronIcon={'-10%'}
                                />
                            </View>
                        </View>
                    </View>

                    {(cantonsS && cantonsS.length != 0) && <View>
                        <View style={styles.fieldContainer}>
                            <View style={{ flex: 1 }}>
                                <SectionedMultiSelectCustom
                                    id={"id"}
                                    K_OPTIONS={villages}
                                    items={villages}
                                    itemsSelected={villagesS}
                                    setItemsSelected={(v: any) => {
                                        setVillagesS(v);

                                        let vs = villages.filter((e: any) => v.includes(e.id) ?? []);
                                        setVillagesSelected(vs);
                                    }}
                                    otherStyles={{
                                        borderRadius: 5,
                                        padding: 5,
                                        paddingVertical: 12,
                                    }} title={"Choisissez un ou plusieurs village(s)"} searchText={"Rechercher un village"}
                                // marginEndChevronIcon={'-10%'}
                                />
                            </View>
                        </View>
                    </View>}

                    <View>
                        <View style={styles.fieldContainer}>
                            <View style={{ flex: 1 }}>
                                <SectionedMultiSelectCustom
                                    id={"name"}
                                    K_OPTIONS={projects}
                                    items={projects}
                                    itemsSelected={projectsS}
                                    setItemsSelected={setProjectsS}
                                    otherStyles={{
                                        borderRadius: 5,
                                        padding: 5,
                                        paddingVertical: 12,
                                    }} title={"Choisissez un ou plusieurs projet(s)"} searchText={"Rechercher un projet"}
                                // marginEndChevronIcon={'-10%'}
                                />
                            </View>
                        </View>
                    </View>


                    <View
                        style={{
                            flexDirection: 'row',
                            paddingHorizontal: 5,
                            paddingBottom: 10,
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ ...styles.subTitle }}>Date de l'événément</Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                            }}
                        >
                            <ButtonPaper
                                theme={{ ...theme, colors: { ...theme.colors, primary: 'white' } }}
                                icon="calendar"
                                compact
                                style={{ ...styles.dateBtn }}
                                uppercase={false}
                                labelStyle={{ ...styles.dateBtnLabelStyle }}
                                mode="contained"
                                onPress={showDatePickerEvent}
                            >
                                {newsObject.event_date ? moment(newsObject.event_date).format('DD-MMMM-YY') : "Date de l'événément"}
                            </ButtonPaper>
                            <ButtonPaper
                                compact
                                theme={theme}
                                labelStyle={{ ...styles.dateBtnLabelStyleToday }}
                                mode="contained"
                                uppercase={false}
                                onPress={() => handleConfirmEvent(new Date())}
                            >
                                {"Aujourd'hui"}
                            </ButtonPaper>
                        </View>
                        <DateTimePickerModal
                            isVisible={isDateVisibleEvent}
                            mode="date"
                            onConfirm={handleConfirmEvent}
                            onCancel={hideDatePickerEvent}
                            date={newsObject.event_date ? new Date(newsObject.event_date) : undefined}
                            maximumDate={new Date()}
                        />
                    </View>


                    <View
                        style={{
                            flexDirection: 'row',
                            paddingHorizontal: 5,
                            paddingBottom: 10,
                            alignItems: 'center',
                        }}
                    >
                        <Checkbox.Android
                            theme={theme}
                            status={publish ? 'checked' : 'unchecked'}
                            onPress={() => {
                                setNewsObject({ ...newsObject, publish: !publish });
                                setPublish(!publish);
                            }}
                        />
                        <Text style={[styles.title, { flex: 1 }]}>Publier</Text>
                    </View>


                    <View style={styles.fieldContainer}>

                        <TouchableOpacity
                            style={{
                                height: 42,
                                borderRadius: 7,
                                backgroundColor: '#24c38b',
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                                paddingHorizontal: 20,
                            }}
                            onPress={() => {
                                onSavePress(null);
                            }}
                        >
                            {saving ? (
                                <View style={{ flexDirection: 'row' }}>
                                    <ActivityIndicator color="white" />
                                    <Text style={{ color: 'white' }}>ENREGISTREMENT EN COURS</Text>
                                </View>
                            ) : (
                                <Text style={{ color: 'white' }}>ENREGISTRER</Text>
                            )}
                        </TouchableOpacity>

                    </View>



                </View>

                <Snackbar visible={errorVisible} duration={3000} onDismiss={onDismissSnackBar}>
                    {errorMessage}
                </Snackbar>

            </ScrollView >
        </>
    );
}

const styles = StyleSheet.create({
    text_title: {
        fontSize: 16,
        // fontFamily: "body",
        fontWeight: 'bold',
        color: "black",
    },
    loginInputContainer: {
        borderRadius: 10,
        height: 40,
        alignItems: 'center',
        paddingHorizontal: 10,
        backgroundColor: '#ffffff',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#d9d9d9',
        width: '100%',
    },
    errorText: {
        color: 'red',
        paddingLeft: 15,
        marginBottom: 10,
    },
    fieldContainer: {
        flexDirection: 'row',
        marginVertical: 11,
    },
    textInputStyle: {
        borderWidth: 0
    },
    title: {
        fontFamily: 'Poppins_500Medium',
        fontWeight: 'normal',
        fontStyle: 'normal',
        letterSpacing: 0,
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
    dateBtn: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 3,
        flex: 1,
        marginHorizontal: 10,
    },
    dateBtnLabelStyle: {
        color: 'primary.600',
        fontFamily: 'Poppins_400Regular',
        fontSize: 13,
    },
    dateBtnLabelStyleToday: {
        color: 'white',
        fontFamily: 'Poppins_400Regular',
        fontSize: 12,
    },
});

export default AddNews;
