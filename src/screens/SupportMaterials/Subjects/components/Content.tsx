import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Box } from 'native-base';
import {
  StatusBar, StyleSheet, Text, TouchableOpacity,
  View, ActivityIndicator, ScrollView, Image, SafeAreaView
} from 'react-native';
import Icon from '@expo/vector-icons';
import { ToggleButton, List, useTheme } from 'react-native-paper';
import SearchBar from "../../../../components/SearchBar";
import { PressableCard } from '../../../../components/common/PressableCard';

function Content({ subjects }: { subjects: any }) {
  const navigation: any = useNavigation();
  const [_subjects, setSubjects] = useState(subjects ?? []);
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
    if (searchPhrase && searchPhraseCopy.trim()) {
      setSubjects([]);
      let subjectsSearch = [];
      let _ = [...subjects];
      let elt: any;
      let searchPhraseSplit = searchPhraseCopy.toUpperCase().trim().split(" "); //.replace(/\s/g, "").split(" ");
      for (let i = 0; i < _.length; i++) {
        elt = _[i];
        if (elt && elt.name && check_character(searchPhraseSplit, elt.name)) {
          subjectsSearch.push(elt);
        }
      }
      setSubjects(subjectsSearch);
    } else {
      setSubjects(subjects);
    }
  };
  //End Search


  function Item({ item, onPress, backgroundColor, textColor, key_propos }: {
    item: any; onPress?: () => void; backgroundColor: any; textColor: any; key_propos: any;
  }) {
    if (item.subjects && item.subjects.length != 0) {
      return (<List.Accordion
        title={`${item.name}`} id={`${key_propos}`} 
      style={{ ...styles.accordionStyle }}
        titleStyle={styles.titleStyle}
        descriptionStyle={styles.descriptionStyle}
        left={props => <List.Icon {...props} icon="folder" />}
        right={props => <List.Icon {...props} color='green' style={{ zIndex: 99, height: '150%', shadowColor: 'green' }} icon={props.isExpanded ? 'chevron-up' : 'chevron-down'} />}
      >
        {item.subjects.map((t: any, i: any) => renderItem(t, i))}
      </List.Accordion>);
    } else if (!item.parent) {
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
    return (
      <View key={key_propos}
        style={{ ...styles.accordionStyle, ...styles.subItem }}   >
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
        onPress={() => navigation.navigate('Lessons', {
          subject: item
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

        <SafeAreaView style={styles.root}>
          <SearchBar
            searchPhrase={searchPhrase}
            setSearchPhrase={setSearchPhrase}
            clicked={clicked}
            setClicked={setClicked}
            onChangeFunction={onChangeSearchFunction}
          />

        </SafeAreaView>

        < List.AccordionGroup >
          {_subjects.map((t: any, i: any) => (
            renderItem(t, i)
          ))}
        </List.AccordionGroup>
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
  root: {
    justifyContent: "center",
    alignItems: "center",
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
});

export default Content;
