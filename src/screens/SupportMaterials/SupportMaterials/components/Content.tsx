import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Box } from 'native-base';
import {
  StatusBar, StyleSheet, Text, TouchableOpacity,
  View, ActivityIndicator, ScrollView, Image, SafeAreaView, Dimensions
} from 'react-native';
import * as Linking from 'expo-linking';
import { ToggleButton, List, useTheme, Snackbar } from 'react-native-paper';
import { showImage } from '../../../../components/ShowImage';
import { downloadFile } from '../../../../utils/download';

function Content({ supportingmaterials, lesson, subject, check_network }: { supportingmaterials: any; lesson: any; subject: any; check_network: () => void }) {
  const navigation: any = useNavigation();
  const [_supportingmaterials, setSupportingmaterials] = useState(supportingmaterials ?? []);
  const theme = useTheme();
  const [snackbarVisible, setSnackbarVisible] = React.useState(false);

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
      setSupportingmaterials([]);
      let supportingmaterialsSearch = [];
      let _ = [...supportingmaterials];
      let elt: any;
      let searchPhraseSplit = searchPhraseCopy.toUpperCase().trim().split(" "); //.replace(/\s/g, "").split(" ");
      for (let i = 0; i < _.length; i++) {
        elt = _[i];
        if (elt && elt.name && check_character(searchPhraseSplit, elt.name)) {
          supportingmaterialsSearch.push(elt);
        }
      }
      setSupportingmaterials(supportingmaterialsSearch);
    } else {
      setSupportingmaterials(supportingmaterials);
    }
  };
  //End Search


  function Item({ item, onPress, backgroundColor, textColor, key_propos }: {
    item: any; onPress?: () => void; backgroundColor: any; textColor: any; key_propos: any;
  }) {
    let file_aws_s3_url = (item.file_aws_s3_url) ? item.file_aws_s3_url.split("?")[0] : ""
    return (
      <View key={key_propos}
        style={{ ...styles.accordionStyle }}   >
        <TouchableOpacity onPress={onPress} key={key_propos}>

          <View style={{ flexDirection: 'row' }}>
            <View style={{ flexDirection: 'row', flex: 1 }}>
              <Box rounded="lg" p={2} style={{ flex: 0.2, height: 40 }}>
                <View >
                  {
                    showImage(
                      (file_aws_s3_url) ? file_aws_s3_url : null,
                      40, 40)
                  }
                </View>
              </Box>
              <View style={{ flex: 0.5 }} >
                <Text style={{ fontWeight: 'bold', marginVertical: 17 }}
                >
                  {item.name}
                </Text>
              </View>
              <View style={{ flex: 0.3, justifyContent: 'center', alignItems: 'center' }}>

                <Box
                  style={{ alignSelf: 'center', justifyContent: 'center', flexDirection: 'row' }}
                  px={3}
                  mt={3}
                  rounded="xl"
                  justifyContent="center"
                  alignItems="center"
                >
                  <TouchableOpacity onPress={async () => {
                    check_network();
                    setSnackbarVisible(true);
                    await downloadFile(file_aws_s3_url);
                    setSnackbarVisible(false);
                  }} key={"download_file"}>
                    <List.Icon icon={'download'} color={'green'} />
                  </TouchableOpacity>


                  <TouchableOpacity onPress={() => {
                    openFile(file_aws_s3_url, 100, 100);
                  }} key={"fullscreen_file"} style={{ marginLeft: 7 }}>
                    <List.Icon icon={'fullscreen'} color={'green'} />
                  </TouchableOpacity>


                </Box>
              </View>
            </View>
          </View>

        </TouchableOpacity>
      </View>
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
        onPress={() => { }}
        backgroundColor={{ backgroundColor }}
        textColor={{ color }}
      />
    );
  };

  const openUrl = (url: any) => {
    Linking.openURL(url);
  };
  const openFile = (_uri: string, width: any, height: any) => {
    if (_uri) {
      check_network();
      let uri = _uri.toLowerCase();
      if (uri.includes(".pdf")) {
        return openUrl(_uri);
      } else if (uri.includes(".docx") || uri.includes(".doc")) {
        return openUrl(_uri);
      } else if (uri.includes(".mp4") || uri.includes(".webm") || uri.includes(".gif")) {
        // return showFile(_uri);
      }
      return navigation.navigate('WebViewComponent', {
        uri: _uri
      })
    }

  }

  return (
    <>
      <ScrollView _contentContainerStyle={{ pt: 7, px: 5 }}>
        {/* {renderHeader()} */}

        <View style={{ backgroundColor: 'white', elevation: 10, height: Dimensions.get('window').height - 75, margin: 10 }}>
          <View style={{ margin: 11 }} >
            <Text
              style={{ flexWrap: 'wrap', flexShrink: 1, marginLeft: 3, marginRight: 3, fontWeight: 'bold', fontSize: 18 }}
            >
              {subject.name}
            </Text>
            <Text
              style={{ flexWrap: 'wrap', flexShrink: 1, marginLeft: 3, marginRight: 3, fontSize: 15, color: 'gray' }}
            >
              {lesson.name}
            </Text>
          </View>
          <View>
            < List.AccordionGroup >
              {_supportingmaterials.map((t: any, i: any) => (
                renderItem(t, i)
              ))}
            </List.AccordionGroup>
          </View>
        </View>



        <Snackbar visible={snackbarVisible} duration={10000000000} 
          style={{ backgroundColor: 'green' }}
          onDismiss={() => {setSnackbarVisible(false);}}>
          <View style={{ flexDirection: 'row', marginTop: 7 }}>
            <View>
              <List.Icon icon={'download'} color={'white'} />
            </View>
            <View>
              <Text style={{ color: 'white' }}>Téléchargement en cours... Patientez!</Text>
            </View>
          </View>
        </Snackbar>


      </ScrollView >

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    flex: 1,
    marginVertical: 8,
    marginHorizontal: 0,
    padding: 0,
    borderRadius: 25,
    borderColor: '#f6f6f6',
    textAlign: 'center',
    height: 25,
    margin: 'auto'
  },
  subItem: {
    flex: 1,
    marginVertical: 8,
    marginLeft: 25,
    padding: 0,
    borderRadius: 25,
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
  accordionStyle: {
    // Add your accordion container styles here
    backgroundColor: 'white',
    borderRadius: 10,
    marginVertical: 8,
    width: '95%',
    marginHorizontal: 10,
    height: 50,
    elevation: 10
  },
  titleStyle: {
    // Add your title styles here
    // color: 'gray',
    fontFamily: 'Poppins_300Light',
    fontStyle: 'normal',
    fontSize: 15
  },
  descriptionStyle: {
    // Add your description styles here
    // color: '#333333',
    fontSize: 16,
  },
  iconStyle: {
    // Add your icon styles here
    fontSize: 500,
    marginRight: 10, // Adjust spacing as needed
  },
});

export default Content;
