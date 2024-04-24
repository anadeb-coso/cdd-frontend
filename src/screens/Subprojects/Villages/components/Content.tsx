import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Box } from 'native-base';
import { 
  StatusBar, StyleSheet, Text, TouchableOpacity, 
  View, ActivityIndicator, ScrollView, Image, SafeAreaView 
} from 'react-native';
import { ToggleButton } from 'react-native-paper';
import SearchBar from "../../../../components/SearchBar";
import { PressableCard } from '../../../../components/common/PressableCard';

function Content({administrativelevels}:{administrativelevels:any}) {
  const navigation = useNavigation();
  const [_administrativelevels, setAdministrativelevels] = useState(administrativelevels ?? []);


    //Search
    const [searchPhrase, setSearchPhrase] = useState("");
    const [clicked, setClicked] = useState(false);
  
    const check_character = (liste: any, elt: string) => {
      let l;
      let eltUpper = elt.toUpperCase();
      for(let i=0; i<liste.length; i++){
        l = liste[i];
        if(l && eltUpper.includes(l)){
          return true;
        }
      }
      return false;
    };
  
    const onChangeSearchFunction = (searchPhraseCopy:string = searchPhrase) => {
      if(searchPhraseCopy.trim()){
        setAdministrativelevels([]);
        let administrativelevelsSearch = [];
        let _ = [...administrativelevels];
        let elt: any;
        let searchPhraseSplit = searchPhraseCopy.toUpperCase().trim().split(" "); //.replace(/\s/g, "").split(" ");
        for(let i=0; i<_.length; i++){
          elt = _[i];
          if(elt && elt.name && check_character(searchPhraseSplit, elt.name)){
            administrativelevelsSearch.push(elt);
          }
        }
        setAdministrativelevels(administrativelevelsSearch);
      }else{
        setAdministrativelevels(administrativelevels);
      }
    };
    //End Search

  
  function Item({ item, onPress, backgroundColor, textColor, key_propos }: {
    item: any; onPress?: () => void; backgroundColor: any; textColor: any; key_propos:any;
  }) {
    return (
      <PressableCard bgColor="white" shadow="0" key={key_propos} style={[styles.item]} >
        <TouchableOpacity onPress={onPress} key={key_propos}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box rounded="sm" style={{flexDirection:'row', width: '95%'}}>
            <Image
              resizeMode="stretch"
              style={{ width: 25, height: 30 }}
              source={require('../../../../../assets/illustrations/location.png')}
            />
            
            <Text style={{marginTop: 8, marginLeft: 7}}>
              {item.name?.length > 40
                ? `${item.name.substring(0, 40)}...`
                : item.name}
            </Text>
          </Box>
          <Text style={{...styles.subTitle, marginTop: 8, marginRight: 3}}>{item?.number_subprojects ?? 0}/{item?.number_infrastructures ?? 0}</Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box rounded="sm" style={{flexDirection:'row'}}>
            <Text style={{...styles.subTitle, marginTop: 8, marginLeft: 2}}>
              {item?.cvd?.name?.length > 40
                ? `${item?.cvd?.name.substring(0, 40)}...`
                : item?.cvd?.name}
              {'/'}
              {item?.parent?.parent?.parent?.parent?.name?.length > 40
                ? `${item?.parent?.parent?.parent?.parent?.name.substring(0, 40)}...`
                : item?.parent?.parent?.parent?.parent?.name}
            </Text>
          </Box>
          <MaterialCommunityIcons name="chevron-right-circle" size={24} color={'#24c38b'} />
        </View>
        
      </TouchableOpacity>
    </PressableCard>
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
        onPress={() =>  navigation.navigate('ListSubprojects', {
          administrativelevel_id: item.id,
          cvd_id: null,
          name: item.name.length > 18 ? null : `Sous-projets de : ${item.name}`
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

        {_administrativelevels.map((t: any, i: any) => renderItem(t, i))}
      </ScrollView>

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

export default Content;
