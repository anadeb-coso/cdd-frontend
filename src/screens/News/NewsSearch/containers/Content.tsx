import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { ToggleButton } from 'react-native-paper';
import { colors } from '../../../../utils/colors';
import ListHeader from '../components/ListHeader';
import SearchBar from "../../../../components/SearchBar";
import CustomDropDownPickerWithRender from '../../../../components/CustomDropDownPicker/CustomDropDownPickerWithRender';
import SectionedMultiSelectCustom from '../../../../components/SectionedMultiSelectCustom';
import NewsComponent from '../components/NewsComponent';
import FilesComponent from '../components/FilesComponent';

let height = Dimensions.get('window').height

function Content(
  { news, tags, newsCategories, newsFilesWithNews, newsFilesNoNews, projects, username, email }:
    { news: any; tags: any; newsCategories: any, newsFilesWithNews: any, newsFilesNoNews: any, projects: any, username:any, email:any }
) {

  const navigation = useNavigation();
  const [selectedId, setSelectedId] = useState(null);
  const [status, setStatus] = useState('publish');
  const [_news, setNews] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState({});
  const [__news, set_News] = useState([]);

  const [newsCategoriesS, setNewsCategoriesS] = useState([]);

  const [tagsS, setTagsS] = useState([]);

  useEffect(() => {
    setNews(news);
  }, []);

  useEffect(() => {
    const filteredNewsCopy = { ...news };

    filteredNewsCopy.my = news.filter((n: any) => ((n.facilitator ?? n.user) && ((n.facilitator ?? n.user).email == email || (n.facilitator ?? n.user).username == username)));
    filteredNewsCopy.my_unpublish = filteredNewsCopy.my.filter((n: any) => n.publish == false);
    filteredNewsCopy.my_publish = filteredNewsCopy.my.filter((n: any) => n.publish == true);
    filteredNewsCopy.my_files = [{ files: newsFilesWithNews ?? [] }, { files: newsFilesNoNews ?? [] }];
    filteredNewsCopy.publish = news.filter((n: any) => n.publish == true);

    setFilteredIssues(filteredNewsCopy);

    let selectedTabNews;
    switch (status) {
      case 'my_unpublish':
        selectedTabNews = filteredNewsCopy.my_unpublish;
        break;
      case 'my_publish':
        selectedTabNews = filteredNewsCopy.my_publish;
      case 'publish':
          selectedTabNews = filteredNewsCopy.publish;
        break;
      case 'my_files':
        selectedTabNews = filteredNewsCopy.my_files;
        break;
      default:
        selectedTabNews = _news;//.map((new: any) => new);
    }
    setNews(selectedTabNews);
    set_News(selectedTabNews);
  }, [status, news]);

  function Item({ item, onPress, backgroundColor, textColor }) {
    return (
      <TouchableOpacity onPress={onPress} style={[styles.item]}>
        {status == 'my_files' ? <FilesComponent item={item} /> : <NewsComponent
          navigation={navigation}
          item={item}
          tags={tags} 
          categories={newsCategories}
          projects={projects}
          username={username}
          email={email}
        />}
      </TouchableOpacity>
    );
  }

  const renderItem = ({ item }: { item: any }) => {
    const backgroundColor = item.id === selectedId ? '#6e3b6e' : '#f9c2ff';
    const color = item.id === selectedId ? 'white' : 'black';

    return (
      <Item
        item={item}
        onPress={() => {
          navigation.navigate('DetailNews', {
            item: item,
            name: item.title,
            tags: tags, 
            categories: newsCategories, 
            projects: projects,
            username: username,
            email: email
          })
        }
        }
        backgroundColor={{ backgroundColor }}
        textColor={{ color }}
      />
    );
  };

  // console.log({ _issues, eadl });

  const renderHeader = () => (
    <ListHeader
      publish={news.overdue}
    />
  );


  //Search
  const [searchPhrase, setSearchPhrase] = useState("");
  const [clicked, setClicked] = useState(false);

  const check_character = (liste, elt) => {
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

  const onChangeSearchFunction = async (searchPhraseCopy = searchPhrase) => {
    let issuessSearch = [];
    if (searchPhrase && searchPhraseCopy.trim()) {
      set_News([]);
      let _ = [..._issues];
      let elt;
      let searchPhraseSplit = [searchPhraseCopy.toUpperCase().trim()] //.split(" "); //.replace(/\s/g, "").split(" ");

      for (let i = 0; i < _.length; i++) {
        elt = _[i];
        if (
          (elt && elt.tracking_code && check_character(searchPhraseSplit, elt.tracking_code)) ||
          (elt && elt.internal_code && check_character(searchPhraseSplit, elt.internal_code)) ||
          (elt && elt.description && check_character(searchPhraseSplit, elt.description)) ||
          (elt && elt.category && elt.category.name && check_character(searchPhraseSplit, elt.category.name)) ||
          (elt && elt.category && elt.category.id && check_character(searchPhraseSplit, String(elt.category.id))) ||
          (elt && elt.administrative_region && elt.administrative_region.name && check_character(searchPhraseSplit, elt.administrative_region.name))
        ) {
          issuessSearch.push(elt);
        }
      }
      set_News(issuessSearch);
    } else {
      set_News(_issues);
      issuessSearch = _issues;
    }
    return issuessSearch;
  };

  const onSearchIssuesByCategory = async (category) => {
    let issuessSearch = await onChangeSearchFunction();
    let _ = [...issuessSearch];
    issuessSearch = _.filter(issue => issue.category && issue.category.id === category.id);
    set_News(issuessSearch)
  }
  //End Search


  return (
    <>
      {(username && username != "undefined") && <ToggleButton.Row
        style={{ justifyContent: 'space-between' }}
        onValueChange={(value) => setStatus(value)}
        value={status}
      >
        <ToggleButton
          style={{ flex: 1, backgroundColor: status == 'my_unpublish' ? colors.primary : 'white' }}
          icon={() => (
            <View>
              <Text style={{ color: status == 'my_unpublish' ? 'white' : colors.primary }}>Non publiées</Text>
            </View>
          )}
          value="my_unpublish"
        />
        <ToggleButton
          style={{ flex: 1, backgroundColor: status == 'my_publish' ? colors.primary : 'white' }}
          icon={() => (
            <View>
              <Text style={{ color: status == 'my_publish' ? 'white' : colors.primary }}>Pour moi</Text>
            </View>
          )}
          value="my_publish"
        />
        <ToggleButton
          style={{ flex: 1, backgroundColor: status == 'publish' ? colors.primary : 'white' }}
          icon={() => (
            <View>
              <Text style={{ color: status == 'publish' ? 'white' : colors.primary }}>Publications</Text>
            </View>
          )}
          value="publish"
        />
        <ToggleButton
          style={{ flex: 1, backgroundColor: status == 'my_files' ? colors.primary : 'white' }}
          icon={() => (
            <View>
              <Text style={{ color: status == 'my_files' ? 'white' : colors.primary }}>Fichiers</Text>
            </View>
          )}
          value="my_files"
        />
      </ToggleButton.Row>}


      <View style={{ marginBottom: 7 }}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <SearchBar
              searchPhrase={searchPhrase}
              setSearchPhrase={setSearchPhrase}
              clicked={clicked}
              setClicked={setClicked}
              onChangeFunction={(v) => {
                onChangeSearchFunction(v);
              }}
              stylesP={{
                container: { margin: 1, alignSelf: 'center', width: '100%' },
                searchBar__unclicked: { padding: 5 },
                searchBar__clicked: { padding: 5 },
                feather: { marginLeft: 15, marginRight: 10 },
                entypo: { marginRight: 15 }
              }}
              featherSize={15}
              entypoSize={17}
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 0.5 }}>
            <SectionedMultiSelectCustom
              id={"id"}
              K_OPTIONS={tags}
              items={tags}
              itemsSelected={tagsS}
              setItemsSelected={setTagsS}
              otherStyles={{
                borderRadius: 5,
                padding: 5,
                marginTop: 7,
              }} title={"Filtre par Tag"} searchText={"Rechercher un Tag"}
              marginEndChevronIcon={'-10%'}
            />
          </View>
          <View style={{ flex: 0.5 }}>

            <SectionedMultiSelectCustom
              id={"id"}
              K_OPTIONS={newsCategories}
              items={newsCategories}
              itemsSelected={newsCategoriesS}
              setItemsSelected={setNewsCategoriesS}
              otherStyles={{
                borderRadius: 5,
                padding: 5,
                marginTop: 7,
              }} title={"Filtre par catégorie"} searchText={"Rechercher une catégorie"}
              marginEndChevronIcon={'-10%'}
            />
          </View>
        </View>
      </View>


      <FlatList
        style={{ flex: 1, marginBottom: height / 10 }}
        data={__news}
        renderItem={renderItem}
        // ListHeaderComponent={renderHeader}
        keyExtractor={(item) => item.id}
        extraData={selectedId}
      />
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
});

export default Content;
