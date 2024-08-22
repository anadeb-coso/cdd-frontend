import React, { useEffect, useState } from 'react';
import { Heading, HStack, Pressable, ScrollView, View, useToast } from 'native-base';
import { RefreshControl, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { ActivityIndicator, Snackbar, TextInput, Checkbox } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import { Controller, useForm } from 'react-hook-form';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SectionedMultiSelectCustom from '../../../components/SectionedMultiSelectCustom';
import SectionedOneSelectCustom from '../../../components/SectionedOneSelectCustom';
import AdministrativelevlsAPI from '../../../services/administrativelevls/administrativelevls';
import NewsAPI from '../../../services/news/news';
import MESSAGES from '../../../utils/formErrorMessages';
import { News } from '../../../models/news/News';
import { getData } from '../../../utils/storageManager';
import NewsAttachmentsComponent from '../../../components/NewsAttachmentsComponent';

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
    const [villagesItems, setVillagesItems]: any = useState(null);
    const [hideCantonField, setHideCantonField]: any = useState(true);
    const [hideVillageField, setHideVillageField]: any = useState(true);
    const [cantons, setCantons]: any = useState(null);
    const [cantonsItems, setCantonsItems]: any = useState(null);

    const [projectsS, setProjectsS]: any = useState((news?.projects && news?.projects?.length != 0) ? news?.projects?.map((t: any) => t.name) : ["COSO"]);
    const [publish, setPublish] = useState(news?.publish ?? false);

    const check_network = async () => {
        NetInfo.fetch().then((state) => {
            if (!state.isConnected) {
                setErrorMessage("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
                setErrorVisible(true);
                setConnected(false);
            }
        });
    }

    const setVillagesInfos = (hideC: any, c: any) => {
        if ((villages && [0, 1].includes(villages.length)) || (hideC == false && c == null)) {
            setHideVillageField(true);
            if (villages && villages.length == 1) {
                setVillagesS(villages);
                setVillagesSelected(villages);
            }
        } else {
            if (villages) {
                setVillagesItems(villages.filter((elt: any) => c.map((e: any) => e.id).includes(elt.parent)) ?? []);
                setHideVillageField(false);
            }
        }
    }

    const getAdministrativeLevels = () => {
        setCantons(null);
        setVillages(null);
        setLoading(true);
        new AdministrativelevlsAPI().administrativeLevelsFilterByAdministrativeRegion(null, "1", {}).then((response) => {
            if (response.error) {
                Alert.alert('Warning', response?.error?.toString(), [{ text: 'OK' }], {
                    cancelable: false,
                });
                return;
            }
            setCantons(response.cantons);
            setVillages(response.villages);

            let d = [];
            if (cantons && villages && cantons.length == 0 && villages.length == 0) {
                setHideCantonField(true);
                setHideVillageField(true);
            } else if (cantons && [0, 1].includes(cantons.length)) {
                setHideCantonField(true);
                setVillagesInfos(true, cantonsSelected);
            } else {
                setHideCantonField(false);
                setVillagesInfos(false, cantonsSelected);
                if (cantons) {
                    setCantonsItems(...cantons);
                }
            }
            if (news && villagesS && villagesS.length != 0) {
                setVillagesInfos(false, cantonsSelected);
                setHideVillageField(false);
            }

            setLoading(false);
        }).catch((error) => {
            setLoading(false);
            console.log(error);
        });

        NetInfo.fetch().then((state) => {
            if (!state.isConnected) {
                Alert.alert('Not intervent', '', [{ text: 'OK' }], {
                    cancelable: false,
                });
            }
        });

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
        } else {
            // let n = {
            //     ...newsObject,
            //     category: newsCategoryS,
            //     tags: tags.filter((e: any) => tagsS.includes(e.id)),
            //     projects: projects.filter((e: any) => projectsS.includes(e.name)),
            //     administrative_levels: (villagesSelected && villagesSelected.length) ?
            //         villagesSelected.map((e: any) => { return { name: e.name, id: e.id, parent: e.parent } }) : (
            //             (cantonsSelected && cantonsSelected.length) ?
            //                 cantonsSelected.map((e: any) => { return { name: e.name, id: e.id, parent: e.parent } }) : null
            //         ),
            //     username: JSON.parse(await getData('username')),
            //     email: JSON.parse(await getData('email')),
            //     files: attachments,
            // };
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
                    navigation.goBack();

                }).catch((error) => {
                    setSaving(false);
                    console.log(error);
                });

        }
    }

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
                        {/* : <><Controller
                                control={control}
                                render={({ onChange, onBlur, value }) => (
                                    <TextInput
                                        placeholder="Titre"
                                        style={[styles.textInputStyle, {
                                            flex: 1, color: 'black'
                                        }]}
                                        onBlur={onBlur}
                                        onChangeText={value => {
                                            setNewsObject({ ...newsObject, title: value });

                                            return onChange(value);
                                        }}
                                        autoCapitalize="none"
                                        value={newsObject?.title}
                                        theme={theme}
                                        mode="outlined"

                                    />
                                )}
                                name="title"
                                rules={{
                                    required: {
                                        value: true,
                                        message: MESSAGES.required,
                                    },
                                }}
                                defaultValue={newsObject?.title}
                            />
                                {errors.title && (
                                    <Text style={styles.errorText}>
                                        {errors.title.message}
                                    </Text>
                                )}</>} */}
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
                        {/* : <><Controller
                            control={control}
                            render={({ onChange, onBlur, value }) => (
                                <TextInput
                                    placeholder="Description"
                                    style={{
                                        flex: 1, color: 'black'
                                    }}
                                    onBlur={onBlur}
                                    onChangeText={value => {
                                        setNewsObject({ ...newsObject, description: value });

                                        return onChange(value);
                                    }}
                                    autoCapitalize="none"
                                    value={newsObject?.description}
                                    theme={theme}
                                    mode="outlined"
                                    multiline
                                />
                            )}
                            name="description"
                            rules={{
                                required: {
                                    value: true,
                                    message: MESSAGES.required,
                                },
                            }}
                            defaultValue={newsObject?.description}
                        />
                            {errors.description && (
                                <Text style={styles.errorText}>
                                    {errors.description.message}
                                </Text>
                            )}</>} */}
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


                    {!hideCantonField && <View>
                        <View style={styles.fieldContainer}>
                            <View style={{ flex: 1 }}>
                                <SectionedMultiSelectCustom
                                    id={"id"}
                                    K_OPTIONS={cantons}
                                    items={cantons}
                                    itemsSelected={cantonsS}
                                    setItemsSelected={(v: any) => {
                                        setCantonsS(v);

                                        let cs = cantons.filter((e: any) => v.includes(e.id) ?? []);

                                        setCantonsSelected(cs);
                                        setVillagesInfos(false, cs);


                                        if (villagesSelected) {
                                            setVillagesSelected(villagesSelected.filter((elt: any) => v.includes(elt.parent)) ?? []);
                                            setVillagesS((villagesSelected.filter((elt: any) => v.includes(elt.parent)) ?? []).map((elt: any) => elt.id));
                                        } else {
                                            setVillagesSelected([]);
                                            setVillagesS([]);
                                        }

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
                    </View>}

                    {!hideVillageField && <View>
                        <View style={styles.fieldContainer}>
                            <View style={{ flex: 1 }}>
                                <SectionedMultiSelectCustom
                                    id={"id"}
                                    K_OPTIONS={villagesItems}
                                    items={villagesItems}
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
});

export default AddNews;
