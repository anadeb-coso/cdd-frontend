import React, { useState, useEffect } from 'react';
import {
  View, Modal, Text, Image, RefreshControl,
  ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, SafeAreaView
} from 'react-native';
import { Heading, HStack, Pressable, Box } from 'native-base';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { EXPO_PUBLIC_ANDROID_VERSION_CODE, EXPO_PUBLIC_PACKAGE } from '../../../services/env'
import { getData } from '../../../utils/storageManager';
import StoreProjectsAPI from '../../../services/storeapp/storeprojects';
import { StoreProject } from '../../../models/storeapp/StoreProject';
import SearchBar from "../../../components/SearchBar";
import { PressableCard } from '../../../components/common/PressableCard';


function StoreProjects({ navigation }: { navigation: any; }) {
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = React.useState(false);
  const [errorMessage, setErrorMessage] = useState("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
  const [connected, setConnected] = useState(true);
  const [storeProjects, setStoreProjects] = useState(Array<StoreProject>());
  const [_storeProjects, set_StoreProjects] = useState(Array<StoreProject>());
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);


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


  const get_storeProjects = async () => {
    setLoading(true);
    setConnected(true);
    await check_network();
    if (connected) {
      try {
        await new StoreProjectsAPI()
          .get_storeprojects(page, 1000)
          .then(async (response: any) => {
            if (response.error) {
              setLoading(false);
              return;
            }
            setStoreProjects(response as Array<StoreProject>);
            set_StoreProjects(response as Array<StoreProject>);
            setPage(1);
            setLoading(false);
          })
          .catch(error => {
            setLoading(false);
            console.error(error);
          });

      } catch (e) {
        console.log("Error1 : " + e);
        setErrorVisible(true);
      }

    }
    setLoading(false);

  };

  useEffect(() => {
    get_storeProjects();
  }, []);



  //Search
  const [searchPhrase, setSearchPhrase] = useState("");
  const [clicked, setClicked] = useState(false);

  const check_character = (liste: any, elt: string) => {
    let l;
    let eltUpper = elt.toUpperCase();
    for (let i = 0; i < liste.length; i++) {
      l = liste[i];
      if (l && eltUpper.includes(l)) {
        return true;
      }
    }
    return false;
  };
  const onChangeSearchFunction = (searchPhraseCopy: string = searchPhrase) => {
    if (searchPhrase && searchPhraseCopy.trim()) {
      setStoreProjects([]);
      let storeProjectsSearch = [];
      let _ = [..._storeProjects];
      let elt: any;
      let searchPhraseSplit = searchPhraseCopy.toUpperCase().trim().split(" "); //.replace(/\s/g, "").split(" ");
      for (let i = 0; i < _.length; i++) {
        elt = _[i];
        if (elt && (
          elt.name && check_character(searchPhraseSplit, elt.name) || 
          elt.package && check_character(searchPhraseSplit, elt.package) || 
          elt.description && check_character(searchPhraseSplit, elt.description)
          )) {
          storeProjectsSearch.push(elt);
        }
      }
      setStoreProjects(storeProjectsSearch);
    } else {
      setStoreProjects(_storeProjects);
    }
  };
  //End Search


  const showImage = (uri: string, width: number | string, height: number | string) => {
    if (uri) {
      if (uri.includes(".pdf")) {
        return (
          <View>
            <Image
              resizeMode="stretch"
              style={{ width: width, height: height, borderRadius: 10 }}
              source={require('../../../../assets/illustrations/pdf.png')}
            />
          </View>
        );
      } else if (uri.includes(".docx") || uri.includes(".doc")) {
        return (
          <View>
            <Image
              resizeMode="stretch"
              style={{ width: width, height: height, borderRadius: 10 }}
              source={require('../../../../assets/illustrations/docx.png')}
            />
          </View>
        );
      } else {
        return (
          <View>
            <Image
              source={{ uri: uri.split("?")[0] }}
              style={{ width: width, height: height, borderRadius: 10 }}
            />
          </View>
        );
      }
    }
    return (
      <View>
        <Image
          resizeMode="stretch"
          style={{ width: width, height: height, borderRadius: 10 }}
          source={require('../../../../assets/illustrations/file.png')}
        />
      </View>
    );
  }
  function Item({ item, onPress, backgroundColor, textColor, key_propos }: {
    item: any; onPress?: () => void; backgroundColor: any; textColor: any; key_propos: any;
  }) {
    return (
      <TouchableOpacity
        onPress={onPress}
        key={item.id}
      >
        <Box rounded="lg" p={3} mt={3} bg="white" shadow={1} >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', flex: 1 }}>
              <Box rounded="lg"  p={2} style={{ flex: 0.3, height: 100 }}>
                <View >
                  {
                    showImage(
                      (item.image) ? item.image : null,
                      100, 90)
                  }
                </View>
              </Box>
              <View style={{ flexDirection: 'column', flex: 0.7 }}>
                <View style={{}}>
                  <Text
                    fontSize="sm" color="gray.600" fontWeight="bold" style={{ fontWeight: 'bold' }}
                  >
                    {item.name}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <Box
                    px={3}
                    mt={3}
                    bg="white"
                    rounded="xl"
                    justifyContent="center"
                    alignItems="center"
                    fontWeight={'bold'}
                  >
                    <Text fontWeight="bold" fontSize="2xs" color="white">
                      {item.package}
                    </Text>
                  </Box>
                  <Box
                    style={{ alignSelf: 'flex-end', bottom: -15, justifyContent: 'flex-end' }}
                    px={3}
                    mt={3}
                    bg={
                      (EXPO_PUBLIC_PACKAGE == item.package) ? ((item.app && item.app.version_code > EXPO_PUBLIC_ANDROID_VERSION_CODE)
                        ? 'primary.500'
                        : 'grey') : 'primary.500'
                    }
                    rounded="xl"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Text fontWeight="bold" fontSize="2xs" color="white" style={{ color: 'white' }} >
                      {
                        (EXPO_PUBLIC_PACKAGE == item.package) ? ((item.app && item.app.version_code > EXPO_PUBLIC_ANDROID_VERSION_CODE)
                          ? 'Mettre à jour'
                          : 'A jour') : 'Autre App'
                      }
                    </Text>
                  </Box>
                </View>
              </View>
            </View>
          </View>
        </Box>
      </TouchableOpacity>
    );
  }
  const renderItem = (item: any, i: number) => { //= ({ item }: {item: any}) => {
    const backgroundColor = '#f9c2ff';
    const color = 'black';

    return (
      <Item
        key={`${item.id}${i}`}
        key_propos={`${item.id}${i}`}
        item={item}
        onPress={() => navigation.navigate('AppDetail', {
          storeProject: item,
          name: item.name.length > 18 ? null : `${item.name}`
        })}
        backgroundColor={{ backgroundColor }}
        textColor={{ color }}
      />
    );
  };



  const onRefresh = () => {
    setRefreshing(true);
    get_storeProjects();
    setRefreshing(false);
  };

  if (loading) {
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
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={{ flex: 1 }}>




        <SafeAreaView style={styles.root}>
          <SearchBar
            searchPhrase={searchPhrase}
            setSearchPhrase={setSearchPhrase}
            clicked={clicked}
            setClicked={setClicked}
            onChangeFunction={onChangeSearchFunction}
          />
        </SafeAreaView>

        {storeProjects && storeProjects.map((t: any, i: any) => renderItem(t, i))}



        <Snackbar visible={errorVisible} duration={3000} onDismiss={onDismissSnackBar}>
          {errorMessage}
        </Snackbar>
      </View>
    </ScrollView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    flex: 1,
    padding: 1,
    marginVertical: 8,
    marginHorizontal: 23,
    borderBottomWidth: 1,
    borderColor: '#f6f6f6',
  },
  title: {
    fontFamily: 'Poppins_500Medium',
    // fontSize: 12,
    fontWeight: 'normal',
    fontStyle: 'normal',
    // lineHeight: 10,
    letterSpacing: 0,
    // textAlign: "left",
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
  statisticsText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    fontWeight: 'bold',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#707070',
  },
  root: {
    justifyContent: "center",
    alignItems: "center",
  },
  titleSearch: {
    width: "100%",
    marginTop: 20,
    fontSize: 25,
    fontWeight: "bold",
    marginLeft: "10%",
  },
});


export default StoreProjects;
