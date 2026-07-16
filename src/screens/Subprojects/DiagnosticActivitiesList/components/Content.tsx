import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Box } from 'native-base';
import {
  StyleSheet, Text, TouchableOpacity,
  View, ScrollView, Image, SafeAreaView
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrivateStackParamList } from '../../../../types/navigation';
import SearchBar from "../../../../components/SearchBar";
import { PressableCard } from '../../../../components/common/PressableCard';
import { Subproject } from 'models/subprojects/Subproject';

function Content({ subprojects }: { subprojects: any }) {
  const navigation = useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
  const [_subprojects, setSubprojects] = useState(subprojects ?? []);

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
      setSubprojects([]);
      let subprojectsSearch = [];
      let _ = [...subprojects];
      let elt: any;
      let searchPhraseSplit = searchPhraseCopy.toUpperCase().trim().split(" ");
      for (let i = 0; i < _.length; i++) {
        elt = _[i];
        if (elt && elt.full_title_of_approved_subproject && check_character(searchPhraseSplit, elt.full_title_of_approved_subproject)) {
          subprojectsSearch.push(elt);
        }
      }
      setSubprojects(subprojectsSearch);
    } else {
      setSubprojects(subprojects);
    }
  };
  //End Search

  function Item({ item, onPress, key_propos }: {
    item: Subproject; onPress?: () => void; key_propos: any;
  }) {
    const files_invalidated_count = Subproject.get_files_invalidated_count(item);
    return (
      <PressableCard bgColor="white" shadow="0" key={key_propos} style={[styles.item]}>
        <TouchableOpacity onPress={onPress} key={key_propos}>
          <Box rounded="sm" style={{ width: '100%' }}>
            <Text style={{ marginTop: 8, marginLeft: 7, fontWeight: 'bold' }} numberOfLines={2}>
              {item.full_title_of_approved_subproject}
            </Text>
            <Text style={{ marginLeft: 7, fontSize: 11, color: 'grey' }}>
              {item.type_of_subproject}
            </Text>
          </Box>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 10
            }}
          >
            <Box rounded="sm" style={{ flexDirection: 'row', marginVertical: 'auto', width: '60%' }}>
              <Image
                resizeMode="stretch"
                style={{ width: 13, height: 20, marginVertical: 'auto', }}
                source={require('../../../../../assets/illustrations/location.png')}
              />

              <Text style={{ marginTop: 8, marginLeft: 7, fontSize: 11, marginVertical: 'auto' }}>
                {
                  item.location_subproject_realized ?
                    item.location_subproject_realized.name
                    : item.canton ?
                      item.canton.name
                      : item.cvd ?
                        item.cvd.name
                        : 'Non trouvée'
                }
              </Text>
            </Box>
            <Text style={{ color: 'grey', width: '25%', marginVertical: 'auto', fontSize: 11 }}>{item.current_subproject_step_and_level ?? " - "}</Text>
            <View style={{ flexDirection: 'column', alignItems: 'flex-end', width: '15%' }}>
              {(item?.files && item?.files.length > 0) ? <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 11 }}>{item?.files.length}</Text>
                <MaterialCommunityIcons name="file" size={10} />
              </View> : <></>}
              {(files_invalidated_count && files_invalidated_count > 0) ? <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: 'red', fontSize: 11 }}>{files_invalidated_count}</Text>
                <MaterialCommunityIcons name="file" size={10} color={'red'} />
              </View> : <></>}
              <MaterialCommunityIcons name="chevron-right-circle" size={17} color={'#24c38b'} />
            </View>
          </View>

        </TouchableOpacity>
      </PressableCard>
    );
  }

  const renderItem = (item: any, i: number) => {
    return (
      <Item
        key={`${item.id}${i}`}
        key_propos={`${item.id}${i}`}
        item={item}
        onPress={() => navigation.navigate('ListModulesInfrastructure', {
          subproject: item,
          subprojectParent: item.link_to_subproject ?? null
        })}
      />
    );
  };

  return (
    <>
      <ScrollView contentContainerStyle={{ paddingTop: 7, paddingHorizontal: 5 }}>
        <SafeAreaView style={styles.root}>
          <SearchBar
            searchPhrase={searchPhrase}
            setSearchPhrase={setSearchPhrase}
            clicked={clicked}
            setClicked={setClicked}
            onChangeFunction={onChangeSearchFunction}
          />
        </SafeAreaView>

        {_subprojects.map((t: any, i: any) => renderItem(t, i))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  item: {
    flex: 1,
    padding: 1,
    marginVertical: 8,
    marginHorizontal: 23,
    borderBottomWidth: 1,
    borderColor: '#f6f6f6',
  },
  root: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Content;
