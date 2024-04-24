import React, { useEffect, useState } from 'react';
import { Heading, HStack, Pressable, ScrollView, View } from 'native-base';
import { RefreshControl, Text, StyleSheet } from 'react-native';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrivateStackParamList } from '../../../types/navigation';
import { Layout } from '../../../components/common/Layout';
import { Subproject } from '../../../models/subprojects/Subproject';
import { SubprojectStep } from '../../../models/subprojects/SubprojectStep';
import { Step } from '../../../models/subprojects/Step';
import SubprojectAPI from '../../../services/subprojects/subprojects';
import SubprojectTrackingAPI from '../../../services/subprojects/subprojects_tracking';
import { getData } from '../../../utils/storageManager';
import NetInfo from '@react-native-community/netinfo';
import SubprojectProgressChart from './Components/SubprojectProgressChart';

const colors = ['primary.600', 'orange', 'lightblue', 'purple'];

function TrackingSubprject({ route }: { route: any }) {
    const navigation =
        useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
    const [loading, setLoading] = useState(false);
    const [errorVisible, setErrorVisible] = React.useState(false);
    const [errorMessage, setErrorMessage] = useState("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
    const [connected, setConnected] = useState(true);
    const [subprojectSteps, setSubprojectSteps] = useState(Array<SubprojectStep>());
    const [steps, setSteps] = useState(Array<Step>());
    const [refreshing, setRefreshing] = useState(false);

    const { subproject: subprojectParam } = route.params;
    const [subproject, setSubproject] = useState(subprojectParam as Subproject);

    const onDismissSnackBar = () => setErrorVisible(false);

    const check_network = async () => {
        NetInfo.fetch().then((state) => {
            if (!state.isConnected) {
                setErrorMessage("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
                setErrorVisible(true);
                setConnected(false);
            }
        });
    }


    const get_subproject_steps = async () => {

        setLoading(true);
        setConnected(true);
        await check_network();
        if (connected) {
            try {
                // await new SubprojectAPI()
                //     .get_subproject(
                //         {
                //             username: JSON.parse(await getData('username')),
                //             password: JSON.parse(await getData('password'))
                //         }, subproject_id)
                //     .then(async (response: any) => {
                //         if (response.error) {
                //             setLoading(false);
                //             return;
                //         }
                //         setSubproject(response as Subproject);
                        
                        
                        //Steps
                        await new SubprojectTrackingAPI()
                            .get_steps(
                                {
                                    username: JSON.parse(await getData('username')),
                                    password: JSON.parse(await getData('password'))
                                }, 1, 1000)
                            .then(async (response_steps: any) => {
                                if (response_steps.error) {
                                    setLoading(false);
                                    return;
                                }
                                setSteps(response_steps as Array<Step>);
                                
                                
                                //Subproject Steps
                                await new SubprojectTrackingAPI()
                                    .get_subproject_steps(
                                        {
                                            username: JSON.parse(await getData('username')),
                                            password: JSON.parse(await getData('password'))
                                        }, subproject.id ?? 0, 1, 1000)
                                    .then(async (response_subproject_steps: any) => {
                                        if (response_subproject_steps.error) {
                                            setLoading(false);
                                            return;
                                        }
                                        setSubprojectSteps(response_subproject_steps as Array<SubprojectStep>);
                                        setLoading(false);

                                    })
                                    .catch(error => {
                                        setLoading(false);
                                        console.error(error);
                                    });
                                //End Subproject Steps

                            })
                            .catch(error => {
                                setLoading(false);
                                console.error(error);
                            });
                        //End Steps

                    // })
                    // .catch(error => {
                    //     setLoading(false);
                    //     console.error(error);
                    // });

            } catch (e) {
                console.log("Error1 : " + e);
                setErrorVisible(true);
            }

        }
        setLoading(false);

    };

    useEffect(() => {
        get_subproject_steps();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            onRefresh();
        });

        return unsubscribe;
    }, [navigation]);


    const onRefresh = () => {
        setRefreshing(true);
        get_subproject_steps();
        setRefreshing(false);
    };

    if(loading){
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
            <HStack mb={3} space="5" justifyContent="space-between" 
                    style={{position: 'relative',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 30,
                    zIndex: 2,
                    backgroundColor: 'white',
                    elevation: 8}}
                >
                    <Pressable
                        p={3}
                        flex={1}
                        bg="light"
                        rounded="xl"
                        shadow={3}
                        onPress={() => console.log('pressed')}
                    >
                        <Text>
                            <Text
                                style={styles.text_title}
                                fontSize={16}
                                fontWeight={700}
                                color="black">Sous-projet : </Text>
                            <Text>{ subproject.full_title_of_approved_subproject }</Text>
                            <Text>{'\n'}</Text>
                            <Text>
                                <Text style={styles.text_title}>Ouvrage : </Text>
                                <Text>{subproject.type_of_subproject}</Text>
                            </Text>
                            <Text>{'\n'}</Text>
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
                        </Text>


                    </Pressable>
                </HStack>
            <ScrollView _contentContainerStyle={{ px: 5 }}
                style={{ zIndex: 1}}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }>

                <SubprojectProgressChart steps={steps} subproject_steps={subprojectSteps} subproject={subproject} componentTitle={route.params.name} onRefresh={onRefresh} />

                <Snackbar visible={errorVisible} duration={3000} onDismiss={onDismissSnackBar}>
                    {errorMessage}
                </Snackbar>

            </ScrollView>
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

export default TrackingSubprject;
