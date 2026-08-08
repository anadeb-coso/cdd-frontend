import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heading, HStack, Pressable, ScrollView, View, Box } from 'native-base';
import { RefreshControl, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SmallCard from 'components/SmallCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import { Layout } from '../../../components/common/Layout';
import { PrivateStackParamList } from '../../../types/navigation';
import { moneyFormat } from '../../../utils/functions';
import SubprojectAPI from '../../../services/subprojects/subprojects';
import { getData } from '../../../utils/storageManager';
import { Subproject } from '../../../models/subprojects/Subproject';
import { ModuleItem } from '../../../utils/nativeBase';
import moment from 'moment';

const colors = ['primary.600', 'orange', 'lightblue', 'purple'];

function ListModulesInfrastructure({ route }: { route: any }) {
    const { t } = useTranslation(['subprojects', 'common']);
    const navigation =
        useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
    const { subproject: subprojectParams } = route.params;
    const { subprojectParent } = route.params;
    const [subproject, setSubproject] = useState(subprojectParams);
    const village = route.params?.village;
    const [totalEstimatedCost, setTotalEstimatedCost] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState(t('common:no_internet'));
    const [connected, setConnected] = useState(true);
    const [errorVisible, setErrorVisible] = React.useState(false);
    const [geoLocationSeted, setGeoLocationSeted] = useState(false);
    const onDismissSnackBar = () => setErrorVisible(false);

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

    const modules: ModuleItem[] = [
        {
            'url': 'TrackingSubprject',
            'name': t('list_modules_infrastructure.tracking_title')
        },
        {
            'url': 'TakeGeolocation',
            'name': t('list_modules_infrastructure.geolocation_title')
        },
        {
            'url': 'CompaniesDetails',
            'name': t('list_modules.technical_company_details')
        },
        {
            'url': 'SocialAuditDetails',
            'name': t('list_modules.social_audit_details')
        },
        {
            'url': 'SubprojectDetails',
            'name': t('list_modules.more_details')
        },
        {
            'url': 'Images',
            'name': `${t('list_modules.files_title')} ${subproject?.files_invalidated_count && subproject?.files_invalidated_count > 0 ? `(${t(subproject.files_invalidated_count > 1 ? 'list_modules.files_invalidated_count_other' : 'list_modules.files_invalidated_count_one', { count: subproject.files_invalidated_count })})` : ''}`
        }
    ]

    const total_cost = (_subproject = subproject) => {
        if (_subproject.subprojects_linked) {
            let cost = _subproject.estimated_cost;
            _subproject.subprojects_linked.forEach((elt: any) => {
                cost += elt.estimated_cost;
            });
            setTotalEstimatedCost(cost);
        }
    }

    const geo_location_check = (_subproject = subproject) => {
        if ([undefined, null, 0, 0.0].includes(_subproject.latitude) && subprojectParent && subprojectParent.latitude && subprojectParent.longitude){
            setSubproject({
                ..._subproject,
                latitude: subprojectParent.latitude,
                longitude: subprojectParent.longitude
            });
            setGeoLocationSeted(true);
        }
    };

    useEffect(() => {
        geo_location_check();
        total_cost();
    }, [subproject]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            onRefresh();
        });

        return unsubscribe;
    }, [navigation]);

    const onRefresh = async () => {
        setRefreshing(true);
        setConnected(true);
        await check_network();
        //Get Subproject
        await new SubprojectAPI()
            .get_subproject(
                {
                    username: JSON.parse(await getData('username')),
                    password: JSON.parse(await getData('password')), 
                    user: {
                        username: JSON.parse(await getData('username')),
                        email: JSON.parse(await getData('email'))
                    }
                }, JSON.parse(await getData('access')), subproject.id)
            .then(async (reponse: any) => {
                if (reponse.error) {
                    setRefreshing(false);
                    return;
                }
                setSubproject(reponse as Subproject);
                geo_location_check(reponse as Subproject);
                total_cost(reponse as Subproject);
                setRefreshing(false);

            })
            .catch(error => {
                setRefreshing(false);
                console.error(error);
            });
        //End Get Subproject
        
    };


    if(refreshing){
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
                            <Text  style={styles.text_title}>{t('shared.subproject_label')}</Text>
                            <Text>{subproject.full_title_of_approved_subproject}{subproject.component ? ` [${subproject.component?.name}]` : ''}</Text>
                        </Text>
                        {
                            totalEstimatedCost ?
                                (
                                    <>
                                        <Text>
                                            <Text style={styles.text_title}>{t('shared.structure_label')}</Text>
                                            <Text>{subproject.type_of_subproject}</Text>
                                        </Text>
                                        <Text>
                                            <Text style={styles.text_title}>{t('shared.estimated_cost_label')}</Text>
                                            <Text>{moneyFormat(subproject.estimated_cost)}</Text>
                                        </Text>
                                        <Text>
                                            <Text style={styles.text_title}>{t('shared.id_label')}</Text>
                                            <Text>{subproject.projects && subproject.projects.length > 0 ? subproject.projects.map((o: any) => o.name).join(".") : 0}.{subproject.joint_subproject_number ?? 0}.{subproject.number ?? 0}</Text>
                                        </Text>
                                        {
                                            subproject.subprojects_linked.map((item: any, i: number) => {
                                                return (
                                                    <Text key={`${item.type_of_subproject}_${i}`}>
                                                        <Text style={{ ...styles.text_title, fontSize: 11 }}>{t('shared.cost_of_label', { type: item.type_of_subproject, id: `${item.projects && item.projects.length > 0 ? item.projects.map((o: any) => o.name).join(".") : 0}.${item.joint_subproject_number ?? 0}.${item.number ?? 0}` })}</Text>
                                                        <Text style={{fontSize: 11}}>{moneyFormat(item.estimated_cost)}</Text>
                                                    </Text>
                                                );
                                            })
                                        }
                                        <Text>
                                            <Text style={styles.text_title}>{t('shared.total_estimated_cost_label')}</Text>
                                            <Text>{moneyFormat(totalEstimatedCost)}</Text>
                                        </Text>
                                    </>
                                )
                                :
                                (
                                    <>
                                        <Text>
                                            <Text style={styles.text_title}>{t('shared.estimated_cost_label')}</Text>
                                            <Text>{moneyFormat(subproject.estimated_cost)}</Text>
                                        </Text>
                                        <Text>
                                            <Text style={styles.text_title}>{t('shared.structure_label')}</Text>
                                            <Text>{subproject.type_of_subproject}</Text>
                                        </Text>
                                        <Text>
                                            <Text style={styles.text_title}>{t('shared.id_label')}</Text>
                                            <Text>{subproject.projects && subproject.projects.length > 0 ? subproject.projects.map((o: any) => o.name).join(".") : 0}.{subproject.joint_subproject_number ?? 0}.{subproject.number ?? 0}</Text>
                                        </Text>
                                    </>
                                )
                        }
                        <Text>
                            <Text style={styles.text_title}>{t('shared.step_label')}</Text>
                            <Text>{subproject.current_subproject_step_and_level ?? " - "}</Text>
                        </Text>
                        <Text>
                            <Text style={styles.text_title}>{t('shared.approval_date_label')}</Text>
                            <Text>{subproject.approval_date_cora ? moment(subproject.approval_date_cora).format('DD-MMM-YYYY') : " - "}</Text>
                        </Text>
                        <Text>
                            <Text style={styles.text_title}>{t('shared.company_in_charge_label')}</Text>
                            <Text>{subproject.name_of_the_awarded_company_works_companies ?? " - "}</Text>
                        </Text>
                        {(subproject && ![undefined, null, 0, 0.0].includes(subproject.latitude) && ![undefined, null, 0, 0.0].includes(subproject.longitude)) && <Text>
                            <Text style={styles.text_title}>{t('shared.map_view_label')}</Text>
                            <View style={{
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }} >
                                <TouchableOpacity onPress={() => {
                                    navigation.navigate("TakeGeolocation", {
                                        name: subproject.link_to_subproject ? t('list_modules_infrastructure.geolocation_title') : t('list_modules.geolocation_subproject'),
                                        subproject: subproject,
                                            administrativelevel_id: null,
                                            cvd_id: null
                                    })
                                }} style={{
                                    margin: 'auto'
                                }} >
                                    <Box rounded="lg" p={1} bg="white" shadow={1} margin={'auto'}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <MaterialCommunityIcons name="map-marker" size={20} color={'#24c38b'}
                                            />
                                        </View>
                                    </Box>
                                </TouchableOpacity>
                            </View>
                        </Text>}

                        {geoLocationSeted && <Text>
                            <Text>{t('list_modules_infrastructure.geolocation_fallback_notice')}</Text>
                        </Text>}




                        <Text></Text>
                        <Text>
                            <Text style={styles.text_title}>{t('shared.locality_label')}</Text>
                            <Text>
                                {
                                    subproject.location_subproject_realized ?
                                        subproject.location_subproject_realized.name
                                        : subproject.canton ?
                                            subproject.canton.name
                                            : subproject.cvd ?
                                                subproject.cvd.name
                                                : t('common:not_found')
                                }
                            </Text>
                        </Text>
                    </Pressable>
                </HStack>
                <Heading fontSize={24} mt={4} my={3} size="md">
                    {t('shared.submodules_heading')}
                </Heading>
                {/* TODO: Change to FlatList */}
                {modules.map((item, i) => {
                    if (i % 2 !== 0) {
                        return null;
                    }
                    return (
                        <HStack
                            key={`${item.name}`}
                            mb={5}
                            space="5"
                            justifyContent="space-between"
                        >
                            <SmallCard
                                key={`${item.name}.${i}`}
                                id={`${item.name}.${i}`}
                                onPress={() => {
                                    if (modules[i].url) {
                                        return navigation.navigate(modules[i].url, {
                                            subproject: subproject,
                                            administrativelevel_id: null,
                                            cvd_id: null,
                                            name: modules[i].url == 'ListInfrastructures' ? t('shared.infrastructures_title') : modules[i].name
                                        });
                                    }
                                }}
                                title={modules[i].name}
                            />
                            <SmallCard
                                key={`${i}.${item.name}`}
                                id={`${i}.${item.name}`}
                                onPress={() => {
                                    if (modules[i + 1].url) {
                                        return navigation.navigate(modules[i + 1].url, {
                                            subproject: subproject,
                                            administrativelevel_id: null,
                                            cvd_id: null,
                                            name: modules[i + 1].url == 'ListInfrastructures' ? t('shared.infrastructures_title') : modules[i + 1].name
                                        });
                                    }
                                }}
                                title={modules[i + 1]?.name}
                                bg={
                                    modules[i + 1]
                                        ? require('../../../../assets/backgrounds/orange-cube.png')
                                        : 'transparent'
                                }
                            />
                        </HStack>
                    );
                })}
            </ScrollView>
        </Layout>
    );
}

const styles = StyleSheet.create({
    text_title: {
        fontSize: 16,
        // fontFamily="body"
        fontWeight: 'bold',
        color: "black",
    }
});
export default ListModulesInfrastructure;
