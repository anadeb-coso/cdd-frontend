import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Box } from 'native-base';
import { 
  StatusBar, StyleSheet, Text, TouchableOpacity, 
  View, ActivityIndicator, ScrollView, Image, SafeAreaView 
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrivateStackParamList } from '../../../../types/navigation';
import SearchBar from "../../../../components/SearchBar";
import { PressableCard } from '../../../../components/common/PressableCard';
import { Subproject } from 'models/subprojects/Subproject';

function Content({subprojects}:{subprojects:any}) {
  const { t } = useTranslation('common');
  const navigation = useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
  const [_subprojects, setSubprojects] = useState(subprojects ?? []);

  
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
        setSubprojects([]);
        let subprojectsSearch = [];
        let _ = [...subprojects];
        let elt: any;
        let searchPhraseSplit = searchPhraseCopy.toUpperCase().trim().split(" ");
        for(let i=0; i<_.length; i++){
          elt = _[i];
          if(elt && 
              (elt.full_title_of_approved_subproject && check_character(searchPhraseSplit, elt.full_title_of_approved_subproject)) || 
              (elt.location_subproject_realized && elt.location_subproject_realized.name && check_character(searchPhraseSplit, elt.location_subproject_realized.name)) || 
              (elt.canton && elt.canton.name && check_character(searchPhraseSplit, elt.canton.name)) || 
              (elt.cvd && elt.cvd.name && check_character(searchPhraseSplit, elt.cvd.name))){
            subprojectsSearch.push(elt);
          }
        }
        setSubprojects(subprojectsSearch);
      }else{
        setSubprojects(subprojects);
      }
    };
    //End Search

  
  function Item({ item, onPress, backgroundColor, textColor, key_propos }: {
    item: Subproject; onPress?: () => void; backgroundColor: any; textColor: any; key_propos:any;
  }) {
    const files_invalidated_count = Subproject.get_files_invalidated_count(item);
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
          <Box rounded="sm" style={{flexDirection:'row', width: '90%',}}>
            <Text style={{marginTop: 8, marginLeft: 7, fontSize: 12}}>
              {item.full_title_of_approved_subproject}{item.component ? ` [${item.component?.name}]` : ''}
            </Text>
          </Box>
          <Text style={{...styles.subTitle, marginTop: 8, width: '10%', textAlign: 'right'}}>{item?.subprojects_linked ? item?.subprojects_linked.length : 0}</Text>
        </View>


        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 10
          }}
        >
          <Box rounded="sm" style={{flexDirection:'row', marginVertical: 'auto', width: '60%'}}>
            <Image
              resizeMode="stretch"
              style={{ width: 13, height: 20, marginVertical: 'auto', }}
              source={require('../../../../../assets/illustrations/location.png')}
            />
            
            <Text style={{marginTop: 8, marginLeft: 7, fontSize: 11, marginVertical: 'auto'}}>
              {
                item.location_subproject_realized ?
                  item.location_subproject_realized.name
                : item.canton ?
                    item.canton.name
                  : item.cvd ?
                      item.cvd.name
                    : t('not_found')
              }
            </Text>
          </Box>
          <Text style={{color: 'grey', width: '25%', marginVertical: 'auto', fontSize: 11}}>{item.current_subproject_step_and_level ?? " - "}</Text>
          <View style={{flexDirection: 'column', alignItems: 'flex-end', width: '15%'}}>
            {(item?.files && item?.files.length > 0) ? <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{fontSize: 11}}>{item?.files.length}</Text>
              <MaterialCommunityIcons name="file" size={10} />
            </View> : <></>}
            {(files_invalidated_count && files_invalidated_count > 0) ? <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{color: 'red', fontSize: 11}}>{files_invalidated_count}</Text>
              <MaterialCommunityIcons name="file" size={10} color={'red'} />
            </View> : <></>}
            <MaterialCommunityIcons name="chevron-right-circle" size={17} color={'#24c38b'} />
          </View>
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
        onPress={() =>  navigation.navigate('ListModules', {
          subproject: item
        })}
        backgroundColor={{ backgroundColor }}
        textColor={{ color }}
      />
    );
  };

  return (
    <>
      <ScrollView contentContainerStyle={{ paddingTop: 7, paddingHorizontal: 5 }}>
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

        {_subprojects.map((item: any, i: any) => renderItem(item, i))}
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
