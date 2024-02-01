import React, { useEffect, useState } from 'react';
import { Heading, HStack, Pressable, ScrollView, View } from 'native-base';
import { RefreshControl, Text, StyleSheet } from 'react-native';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import { Layout } from '../../../components/common/Layout';
import { Subproject } from '../../../models/subprojects/Subproject';
import { Level } from '../../../models/subprojects/Level';
import { Step } from '../../../models/subprojects/Step';
import { SubprojectStep } from '../../../models/subprojects/SubprojectStep';
import SubprojectAPI from '../../../services/subprojects/subprojects';
import SubprojectTrackingAPI from '../../../services/subprojects/subprojects_tracking';
import { getData } from '../../../utils/storageManager';
import NetInfo from '@react-native-community/netinfo';
import SubprojectLevelProgressChart from './Components/SubprojectLevelProgressChart';

const colors = ['primary.600', 'orange', 'lightblue', 'purple'];

function TrackingSubprjectLevel({ route }: { route: any }) {
    const [loading, setLoading] = useState(false);
    const [errorVisible, setErrorVisible] = React.useState(false);
    const [errorMessage, setErrorMessage] = useState("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
    const [connected, setConnected] = useState(true);
    const [subprojectLevels, setSubprojectLevels] = useState(Array<Level>());
    const [refreshing, setRefreshing] = useState(false);

    const { subproject: subprojectParam } = route.params;
    const { step: stepParam } = route.params;
    const [subproject, setSubproject] = useState(subprojectParam as Subproject);
    const [subprojectStep, setSubprojectStep] = useState(stepParam as SubprojectStep);

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
                                
                                
                                //Subproject Steps
                                await new SubprojectTrackingAPI()
                                    .get_subproject_levels(
                                        {
                                            username: JSON.parse(await getData('username')),
                                            password: JSON.parse(await getData('password'))
                                        }, subproject.id ?? 0, 1, 1000)
                                    .then(async (response_subproject_levels: any) => {
                                        if (response_subproject_levels.error) {
                                            setLoading(false);
                                            return;
                                        }
                                        setSubprojectLevels(response_subproject_levels as Array<Level>);
                                        setLoading(false);

                                    })
                                    .catch(error => {
                                        setLoading(false);
                                        console.error(error);
                                    });
                                //End Subproject Steps


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
                                // fontFamily="body"
                                fontWeight={700}
                                color="black">Sous-projet : </Text>
                            <Text>{ subproject.full_title_of_approved_subproject } - <Text style={{color: 'green'}}>{subproject.current_subproject_step_and_level ?? " - "}</Text></Text>
                            <Text>{'\n'}</Text>
                            <Text>
                                <Text style={styles.text_title}>Type : </Text>
                                <Text>{subproject.type_of_subproject}</Text>
                            </Text>
                        </Text>


                    </Pressable>
                </HStack>
            <ScrollView _contentContainerStyle={{ px: 5 }}
                style={{ zIndex: 1}}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }>
                



                <SubprojectLevelProgressChart subproject_levels={subprojectLevels} subproject={subproject} step={subprojectStep} onRefresh={onRefresh} />

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

export default TrackingSubprjectLevel;
