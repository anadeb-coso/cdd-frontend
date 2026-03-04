import React, { useContext, useEffect, useState } from 'react';
import { useToast } from 'native-base';

import {
    Keyboard,
    Text,
    View,
    TouchableWithoutFeedback,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    Image,
    Alert,
    RefreshControl,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import { storeData } from "../../../utils/storageManager";
import { getData } from "../../../utils/storageManager";
import { getDocumentsByAttributes } from '../../../utils/coucdb_call';
import FacilitatorsAPI from "../../../services/facilitators/facilitators";
import { clear_duplicate_on_liste } from '../../../utils/functions';


function ChangeFacilitatorDBScreen({ navigation, route }: { navigation: any, route: any }) {
    const [noSQLDBNameCurrent, setNoSQLDBNameCurrent] = useState(null);
    const [noSQLDBsNames, setNoSQLDBsNames]: any = useState([]);
    const toast = useToast();
    const [refreshing, setRefreshing] = useState(false);

    const get_dbs = async () => {
        setNoSQLDBNameCurrent(null);
        setNoSQLDBsNames([]);
        let my_no_sql_db_name = JSON.parse(await getData('my_no_sql_db_name'));
        if (my_no_sql_db_name) {
            try {
                let villagesResult: any = [];
                let response: any = await getDocumentsByAttributes({ type: 'adl', 'representative.email': JSON.parse(await getData('email')) ?? null }, 250, 0, "eadls" as any);
                if (response.docs && response.docs[0] && response.docs[0].administrative_regions_objects) {
                    response.docs[0].administrative_regions_objects.forEach((elt: any) => {
                        if (elt.villages) villagesResult = villagesResult.concat(elt.villages.map((elt: any) => {
                            return {
                                id: String(elt.id),
                                name: elt.name
                            };
                        }));
                    });
                }
                villagesResult = clear_duplicate_on_liste(villagesResult);

                setNoSQLDBNameCurrent(JSON.parse(await getData('no_sql_db_name')));
                // let dbs = [my_no_sql_db_name, ...(JSON.parse(await getData('no_sql_dbs_names')) ?? [])];
                await new FacilitatorsAPI()
                    .get_no_sql_dbs_names()
                    .then(async (response: any) => {
                        // console.log(response)
                        if (response.error) {
                            return;
                        }
                        let dbs = [my_no_sql_db_name, ...(response ?? [])];
                        const projects = response as Array<any>;

                        let dbs_with_facilitators_name = [];
                        let result;
                        for (let i = 0; i < dbs.length; i++) {
                            result = (await getDocumentsByAttributes({ type: 'facilitator' }, 250, 0, dbs[i]));
                            dbs_with_facilitators_name.push({
                                db: dbs[i],
                                name: result?.docs[0]?.name,
                                email: result?.docs[0]?.email,
                                sex: result?.docs[0]?.sex,
                                my_db: my_no_sql_db_name == dbs[i],
                                project_name: result?.docs[0]?.project_name,
                                headquarters_villages: (result?.docs[0]?.administrative_levels ?? []).filter((elt: any) => (
                                    elt.is_headquarters_village == true && villagesResult && villagesResult.find((v_s: any) => v_s.id == elt.id)
                                ))
                            });
                        }
                        // console.log(dbs_with_facilitators_name)
                        setNoSQLDBsNames(dbs_with_facilitators_name);



                    })
                    .catch(error => {
                        console.error(error);
                    });


            } catch (e) {
                console.log("Error1 : " + e);
            }
        } else {

        }


    };

    useEffect(() => {
        get_dbs();
    }, []);
    ;
    const onSelectDB = async (db: any) => {
        let msg_second_alert = db.project_name ? "" : "Nous vous informons que cette base de données appartient à un autre projet. Vous ne verrez les autres détails/informations que si vous êtes switché vers ce projet!";
        Alert.alert('Alert', noSQLDBNameCurrent ? `Souhaitez vraiment changer de base de données de ${noSQLDBNameCurrent} en ${db.db} ?\n${msg_second_alert}` : `Souhaitez vraiment changer de base de données en ${db.db} ?\n${msg_second_alert}`, [
            {
                text: "Oui", onPress: async () => {
                    await storeData('no_sql_db_name', JSON.stringify(db.db));
                    await storeData('infos_changed', true);

                    if (JSON.parse(await getData('my_no_sql_db_name')) == db.db) {
                        toast.show({
                            description: `Base de données changé en ${db.db} avec succès. Vous utilisez à présent votre propre base de données`, duration: 5000
                        });
                    } else {
                        let info_another_user = db.name ? `Vous utilisez à présent les données de ${db.sex ? db.sex : 'Mr/Mme'} ${db.name}` : `Vous utilisez à présent les données d'un autre utilisateur`;
                        toast.show({
                            description: `Base de données changé en ${db.db} avec succès. ${info_another_user}`, duration: 5000
                        });
                    }


                    navigation.goBack();

                }
            },
            {
                text: "Non", onPress: async () => {

                }
            }
        ]);



    }

    const onRefresh = () => {
        setRefreshing(true);
        get_dbs();
        setRefreshing(false);
    };


    if (!noSQLDBsNames || (noSQLDBsNames && noSQLDBsNames.length == 0) || !noSQLDBNameCurrent)
        return <ActivityIndicator style={{ marginTop: 50 }} color={'#24c38b'} size="small" />;

    return (
        <ScrollView
            style={{
                backgroundColor: 'white',
                paddingBottom: 30,
                paddingHorizontal: 30,
            }}
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <KeyboardAvoidingView
                style={{
                    flex: 1,
                    backgroundColor: 'white',
                    justifyContent: 'space-between',
                }}
                contentContainerStyle={{ flex: 1, justifyContent: 'space-evenly' }}
                behavior="position"
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ flex: 1, justifyContent: 'space-between' }}>
                        <View
                            style={{
                                backgroundColor: 'white',
                            }}
                        >
                            <KeyboardAvoidingView
                                style={{
                                    backgroundColor: 'white',
                                }}
                                behavior="padding"
                            >
                                <View style={{}}>
                                    <View
                                        style={{
                                            borderRadius: 10,
                                            marginBottom: 16,
                                        }}
                                    >
                                        {noSQLDBsNames && noSQLDBsNames.map((db: any) => (
                                            <TouchableOpacity
                                                key={db.db}
                                                style={{ marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#dedfe4', backgroundColor: noSQLDBNameCurrent == db.db ? 'grey' : 'white' }}
                                                onPress={() => onSelectDB(db)}
                                                disabled={noSQLDBNameCurrent == db.db}
                                            >
                                                <Text style={{ color: '#24c38b', fontWeight: 'bold' }}> {`${db.db} ${db?.my_db == true ? "(pour moi)" : ""}`} </Text>
                                                <Text style={{ fontWeight: db?.my_db == true ? 'bold' : 'normal', fontSize: 8 }}> {db.project_name ? `${db.name} (${db.email})` : 'Non trouvé (Probablement cette base de données appartient à un autre projet)'} </Text>
                                                {db.headquarters_villages && <Text style={{ fontSize: 8, color: 'blue' }}> {
                                                    db.headquarters_villages.map((elt:any)=>elt.name).join(", ")
                                                } </Text>}
                                                
                                            </TouchableOpacity>
                                        )
                                        )}
                                    </View>
                                </View>
                            </KeyboardAvoidingView>
                        </View>
                        <View />
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

        </ScrollView>
    );
}

export default ChangeFacilitatorDBScreen;
