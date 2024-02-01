import React, { useState } from 'react';
import { View, Modal, Text, Image } from 'react-native';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import Datas from './components/Content';
import CustomGreenButton from '../../components/CustomGreenButton/CustomGreenButton';
import LocalDatabase, { SyncToRemoteDatabase } from '../../utils/databaseManager';
import API from '../../services/API';
import { getData } from '../../utils/storageManager';
import NetInfo from '@react-native-community/netinfo';


function SyncDatas({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [errorVisible, setErrorVisible] = React.useState(false);
  const [errorMessage, setErrorMessage] = useState("Nous n'avions pas pu synchroniser toutes vos données.");
  const [connected, setConnected] = useState(true);
  

  const onDismissSnackBar = () => setErrorVisible(false);
  
  const check_network = async () => {
    NetInfo.fetch().then((state) => {
      if(!state.isConnected){
        setErrorMessage("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
        setErrorVisible(true);
        setConnected(false);
      }
  });
  }

  const sync = async () => {
    let no_sql_user = JSON.parse(await getData('no_sql_user'));
    let no_sql_pass = JSON.parse(await getData('no_sql_pass'));
    let no_sql_db_name = JSON.parse(await getData('no_sql_db_name'));

    let succes = false;
    setLoading(true);
    setConnected(true);
    await check_network();
    if(connected){
      try {
        await LocalDatabase.find({
          selector: { type: {$in: ['task', 'facilitator']} },
        })
          .then(async (result) => {
            let tasks_facilitator = result?.docs ?? [];
            let facilitator = tasks_facilitator.find(elt => elt.type === 'facilitator');
            let tasks = tasks_facilitator.filter(elt => elt.type === 'task');
            await new API()
              .sync_datas({tasks: tasks, facilitator: facilitator})
              .then(response => {
                console.log(response.status);
                if (!response.status || response.status != 'ok') {
                  console.error(response.error);
                  setErrorVisible(true);
                }else if (response.has_error) {
                  succes = true;
                  setErrorMessage("Certaines de vos données n'ont pas pu été synchronisées avec succès.");
                  console.error(response.error);
                  setErrorVisible(true);
                }else if(response.status && response.status == 'ok') {
                  succes = true;
                }
              })
              .catch(error => {
                console.error(error);
                console.log(error);
                setErrorVisible(true);
              });
  
          })
          .catch((err) => {
            console.log("Error1 : "+err);
            setErrorVisible(true);
          });
      } catch (e) {
        console.log("Error1 : "+e);
        setErrorVisible(true);
      }
      if (succes){
        setSuccessModal(true);
        if(no_sql_user && no_sql_pass && no_sql_db_name){
          SyncToRemoteDatabase({no_sql_user: no_sql_user, no_sql_pass: no_sql_pass, no_sql_db_name: no_sql_db_name});
        }
      }else{
        setErrorModal(true);
      }
    }
    setLoading(false);
    
  };

  return (
    <View style={{ flex: 1 }}>
      <Modal animationType="slide" style={{ flex: 1 }} visible={successModal}>
        <View
          style={{
            flex: 1,
            padding: 20,
            alignItems: 'center',
            justifyContent: 'space-around',
          }}
        >
          <View style={{ alignItems: 'center', marginTop: '20%' }}>
            <Image
                style={{ height: 82, width: 82, margin: 'auto' }}
                resizeMode="stretch"
                source={require('../../../assets/illustrations/check-circle.png')}
                alt="image"
              />
            <Text
              style={{
                marginVertical: 25,
                fontFamily: 'Poppins_700Bold',
                fontSize: 20,
                fontWeight: 'bold',
                fontStyle: 'normal',
                lineHeight: 25,
                letterSpacing: 0,
                textAlign: 'center',
                color: '#707070',
              }}
            >
              Synchronisation {'\n'} Réussie!
            </Text>
          </View>
          <Image
              style={{ height: 279.236, width: 222.51, margin: 'auto' }}
              resizeMode="stretch"
              source={require('../../../assets/illustrations/sync-image.png')}
              alt="image"
            />
          <CustomGreenButton
            onPress={() => navigation.goBack()}
            buttonStyle={{
              width: '100%',
              height: 36,
              borderRadius: 7,
            }}
            textStyle={{
              fontFamily: 'Poppins_500Medium',
              fontSize: 14,
              lineHeight: 21,
              letterSpacing: 0,
              textAlign: 'right',
              color: '#ffffff',
            }}
          >
            DONE
          </CustomGreenButton>
        </View>
      </Modal>


      <Modal animationType="slide" style={{ flex: 1 }} visible={errorModal}>
        <View
          style={{
            flex: 1,
            padding: 20,
            alignItems: 'center',
            justifyContent: 'space-around',
          }}
        >
          <View style={{ alignItems: 'center', marginTop: '20%' }}>
            <Image
                style={{ height: 82, width: 82, margin: 'auto' }}
                resizeMode="stretch"
                source={require('../../../assets/illustrations/cross.png')}
                alt="image"
              />
            <Text
              style={{
                marginVertical: 25,
                fontFamily: 'Poppins_700Bold',
                fontSize: 20,
                fontWeight: 'bold',
                fontStyle: 'normal',
                lineHeight: 25,
                letterSpacing: 0,
                textAlign: 'center',
                color: '#707070',
              }}
            >
              Synchronisation {'\n'} Non réussie!
            </Text>
          </View>
          <Image
              style={{ height: 279.236, width: 222.51, margin: 'auto' }}
              resizeMode="stretch"
              source={require('../../../assets/illustrations/network_failed.png')}
              alt="image"
            />
          <CustomGreenButton
            onPress={() => {setErrorModal(false);}}
            buttonStyle={{
              width: '100%',
              height: 36,
              borderRadius: 7,
            }}
            textStyle={{
              fontFamily: 'Poppins_500Medium',
              fontSize: 14,
              lineHeight: 21,
              letterSpacing: 0,
              textAlign: 'right',
              color: '#ffffff',
            }}
          >
            Sortir
          </CustomGreenButton>
        </View>
      </Modal>




      <Datas />
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#24c38b" />
          <Text style={{ fontSize: 18, marginTop: 12 }} color="#000000">Synchronisation en cours...{'\n'}Ceci peut prendre quelques secondes!</Text>
        </View>
      ) : (
        <View>
          <CustomGreenButton
            onPress={sync}
            buttonStyle={{
              height: 36,
              borderRadius: 7,
              marginHorizontal: '5%',
              width: '90%',
              marginBottom: 10,
            }}
            textStyle={{
              fontFamily: 'Poppins_500Medium',
              fontSize: 14,
              lineHeight: 21,
              letterSpacing: 0,
              textAlign: 'right',
              color: '#ffffff',
            }}
          >
            Sync
          </CustomGreenButton>
        </View>
      )}
      <Snackbar visible={errorVisible} duration={3000} onDismiss={onDismissSnackBar}>
        {errorMessage}
      </Snackbar>
    </View>
  );
}

export default SyncDatas;
