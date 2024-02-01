import React, { useState, useEffect } from 'react'; 'native-base';
import { Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { EXPO_PUBLIC_ANDROID_VERSION_CODE, EXPO_PUBLIC_PACKAGE } from '@env'

import StoreProjectsAPI from '../services/storeapp/storeprojects';
import { View, TouchableOpacity } from 'react-native';
import { Text } from 'native-base';


function SnackBarCheckAppVersionComponent() {
  const navigation = useNavigation();
  const [errorVisible, setErrorVisible] = React.useState(false);
  const [errorMessage, setErrorMessage] = useState("Il y a une version plus récente disponible. \nVeuillez mettre à jour l'application!");
  const [storeProject, setStoreProject]: any = useState(null);


  const onDismissSnackBar = () => setErrorVisible(false);


  const get_storeProjects = async () => {
    try {
      await new StoreProjectsAPI()
        .get_storeproject_by_package(EXPO_PUBLIC_PACKAGE)
        .then(async (response: any) => {
          if (response.error) {
            return;
          }
          
          if (response.app && response.app.version_code > EXPO_PUBLIC_ANDROID_VERSION_CODE) {
            setStoreProject(response);
            setErrorMessage("Il y a une version plus récente disponible. \nVeuillez mettre à jour l'application!");
            setErrorVisible(true);
          }
        })
        .catch(error => {
          console.error(error);
        });

    } catch (e) {
      console.log("Error1 : " + e);
    }


  };

  useEffect(() => {
    get_storeProjects();
  }, []);


  return (
    <Snackbar visible={errorVisible} duration={10000} onDismiss={onDismissSnackBar}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 0.8 }}>
          <Text color={'white'}>{errorMessage}</Text>
        </View>
        <View style={{ flex: 0.2, alignContent: 'flex-end' }}>
          <TouchableOpacity onPress={() => navigation.navigate('AppDetail', {
            storeProject: storeProject,
            name: storeProject.name.length > 18 ? null : `${storeProject.name}`
          })}>
            <Text color={'white'} textAlign={'right'}>Voir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Snackbar>
  );
}

export default SnackBarCheckAppVersionComponent;
