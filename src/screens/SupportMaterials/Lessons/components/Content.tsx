import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Box } from 'native-base';
import {
  StatusBar, StyleSheet, Text, TouchableOpacity,
  View, ActivityIndicator, ScrollView, Image, SafeAreaView, Dimensions
} from 'react-native';
import Icon from '@expo/vector-icons';
import { ToggleButton, List, useTheme } from 'react-native-paper';
import SearchBar from "../../../../components/SearchBar";
import { PressableCard } from '../../../../components/common/PressableCard';

function Content({ lessons, subject }: { lessons: any; subject: any; }) {
  const navigation: any = useNavigation();
  const [_lessons, setLessons] = useState(lessons ?? []);
  const theme = useTheme();

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
    if (searchPhraseCopy.trim()) {
      setLessons([]);
      let lessonsSearch = [];
      let _ = [...lessons];
      let elt: any;
      let searchPhraseSplit = searchPhraseCopy.toUpperCase().trim().split(" "); //.replace(/\s/g, "").split(" ");
      for (let i = 0; i < _.length; i++) {
        elt = _[i];
        if (elt && elt.name && check_character(searchPhraseSplit, elt.name)) {
          lessonsSearch.push(elt);
        }
      }
      setLessons(lessonsSearch);
    } else {
      setLessons(lessons);
    }
  };
  //End Search


  function Item({ item, onPress, backgroundColor, textColor, key_propos }: {
    item: any; onPress?: () => void; backgroundColor: any; textColor: any; key_propos: any;
  }) {
    return (
      <View key={key_propos}
        style={{ ...styles.accordionStyle }}   >
        <TouchableOpacity onPress={onPress} key={key_propos}>

          <List.Item title={`${item.name}`}
            left={props => <List.Icon {...props} icon="chevron-right" />} />

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
        onPress={() => navigation.navigate('SupportMaterials', {
          subject: subject,
          lesson: item
        })}
        backgroundColor={{ backgroundColor }}
        textColor={{ color }}
      />
    );
  };

  return (
    <>
      <ScrollView _contentContainerStyle={{ pt: 7, px: 5 }}>
        {/* {renderHeader()} */}

        {/* <SafeAreaView style={styles.root}>
          <SearchBar
            searchPhrase={searchPhrase}
            setSearchPhrase={setSearchPhrase}
            clicked={clicked}
            setClicked={setClicked}
            onChangeFunction={onChangeSearchFunction}
          />

        </SafeAreaView> */}
        <View style={{ backgroundColor: 'white', elevation: 10, height: Dimensions.get('window').height - 75, margin: 10 }}>
          <View style={{ margin: 11 }} >
            <Text
              style={{ flexWrap: 'wrap', flexShrink: 1, marginLeft: 3, marginRight: 3, fontWeight: 'bold', fontSize: 18 }}
            >
              {subject.name}
            </Text>
          </View>
          <View>
            < List.AccordionGroup >
              {_lessons.map((t: any, i: any) => (
                renderItem(t, i)
              ))}
            </List.AccordionGroup>
          </View>
        </View>

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
