import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { ToggleButton, ActivityIndicator } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrivateStackParamList } from '../../../../types/navigation';
import { colors } from '../../../../utils/colors';
import SearchBar from "../../../../components/SearchBar";
import SectionedMultiSelectCustom from '../../../../components/SectionedMultiSelectCustom';
import NewsComponent from '../components/NewsComponent';
import FilesComponent from '../components/FilesComponent';
import { substring } from '../../../../utils/functions';
import moment from 'moment';

let height = Dimensions.get('window').height

function Content(
  {
    news, setNews, tags, newsCategories, newsFilesWithNews, newsFilesNoNews,
    projects, username, email, page, setPage, loadMoreData, loading, setLoading,
    hasMore, setHasMore, newsMyPublish, newsMyUnpublish
  }:
    {
      news: any; setNews: (i: any) => void; tags: any; newsCategories: any, newsFilesWithNews: any,
      newsFilesNoNews: any, projects: any, username: any, email: any, page?: any, setPage?: (i: any) => void,
      loadMoreData?: (i: any) => void, loading?: any, setLoading?: (i: any) => void,
      hasMore?: any, setHasMore?: (i: any) => void; newsMyPublish?: any; newsMyUnpublish?: any; 
    }
) {
  const { t } = useTranslation('news');
  const navigation = useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
  const [selectedId, setSelectedId] = useState(null);
  const [status, setStatus] = useState('publish');
  const [_news, set_News] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState({});
  const [__news, set__News] = useState([]);

  const [newsCategoriesS, setNewsCategoriesS] = useState([]);

  const [tagsS, setTagsS] = useState([]);

  // useEffect(() => {
  //   set_News(news);
  // }, []);

  useEffect(() => {
    set__News([]);
    if (status == "my_files") {

    } else {
      const filteredNewsCopy = { ...news };

      filteredNewsCopy.my_unpublish = newsMyUnpublish ?? [];
      filteredNewsCopy.my_publish = newsMyPublish ?? [];
      filteredNewsCopy.publish = news.filter((n: any) => n.publish == true);

      setFilteredIssues(filteredNewsCopy);

      let selectedTabNews;
      
      if (status == "my_unpublish") {
        selectedTabNews = filteredNewsCopy.my_unpublish;
      } else if (status == "my_publish") {
        selectedTabNews = filteredNewsCopy.my_publish;
      } else if (status == "publish") {
        selectedTabNews = filteredNewsCopy.publish;
      } else {
        selectedTabNews = _news;
      }
      set_News(selectedTabNews);
      set__News(selectedTabNews);
    }

  }, [status, news]);

  function Item({ item, onPress, backgroundColor, textColor }: { item: any; onPress: any; backgroundColor: any; textColor: any; }) {
    return (
      <TouchableOpacity onPress={onPress} style={[styles.item]} key={`${item.id}_${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}`}>
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

    if (status == 'my_files' && (!item || (item && (!item.files || (item.files && item.files.length == 0))))) {
      return (
        <></>
      );
    }

    return (
      <Item
        key={`${item.id}_${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}`}
        item={item}
        onPress={() => {
          navigation.navigate('DetailNews', {
            item: item,
            name: substring(item.title, 22),
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


  function FileItem({ item, onPress, backgroundColor, textColor }: { item: any; onPress: any; backgroundColor: any; textColor: any; }) {
    return (
      <TouchableOpacity onPress={onPress} style={[styles.item]} key={`${item.files.length}_${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}`}>
        <FilesComponent item={item} />
      </TouchableOpacity>
    );
  }

  const renderFileItem = ({ item }: { item: any }) => {
    const backgroundColor = item.files.length === selectedId ? '#6e3b6e' : '#f9c2ff';
    const color = item.files.length === selectedId ? 'white' : 'black';

    if (status == 'my_files' && (!item || (item && (!item.files || (item.files && item.files.length == 0))))) {
      return (
        <></>
      );
    }

    return (
      <FileItem
        key={`${item.files.length}_${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}`}
        item={item}
        onPress={() => {
          navigation.navigate('DetailNews', {
            item: item,
            name: substring(item.title, 22),
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


  //Search
  const [searchPhrase, setSearchPhrase] = useState("");
  const [clicked, setClicked] = useState(false);

  const check_character = (liste: any, elt: any) => {
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
    let newsSearch: any = [];
    if (searchPhrase && searchPhraseCopy.trim()) {
      set__News([]);
      let _ = [..._news];
      let elt: any;
      let searchPhraseSplit = [searchPhraseCopy.toUpperCase().trim()] //.split(" "); //.replace(/\s/g, "").split(" ");

      for (let i = 0; i < _.length; i++) {
        elt = _[i];
        if (
          (elt && elt.title && check_character(searchPhraseSplit, elt.title)) ||
          (elt && elt.description && check_character(searchPhraseSplit, elt.description)) ||
          (elt && elt.category && elt.category.name && check_character(searchPhraseSplit, elt.category.name))
        ) {
          newsSearch.push(elt);
        }
      }
      set__News(newsSearch);
    } else {
      set__News(_news);
      newsSearch = _news;
    }
    return newsSearch;
  };

  const onSearchIssuesByCategories = async (_newsCategoriesS: any = newsCategoriesS) => {
    let newsSearch = await onChangeSearchFunction();
    if (_newsCategoriesS && _newsCategoriesS.length != 0) {
      let _ = [...newsSearch];
      newsSearch = _.filter(n => _newsCategoriesS.find((cId: any) => (cId == n.category.id || cId == n.id)));
    }
    set__News(newsSearch)
  }

  const onSearchIssuesByTags = async (_tagsS: any = tagsS) => {
    let newsSearch = await onChangeSearchFunction();
    if (_tagsS && _tagsS.length != 0) {
      let _ = [...newsSearch];
      newsSearch = _.filter(n => _tagsS.find((tId: any) => (n.tags.find((tag: any) => tag.id == tId) || n.tags.find((tag: any) => tag == tId))));
    }
    set__News(newsSearch)
  }

  const onSearchIssuesByAdministrativeLevels = async (_adlsS: any) => {
    let newsSearch = await onChangeSearchFunction();
    if (_adlsS && _adlsS.length != 0) {
      let _ = [...newsSearch];
      newsSearch = _.filter(n => _adlsS.find((adId: any) => (n.administrative_levels.find((ad: any) => ad.id == adId))));
    }
    set__News(newsSearch)
  }

  const onSearchIssuesByUser = async (_usersS: any) => {
    let newsSearch = await onChangeSearchFunction();
    if (_usersS && _usersS.length != 0) {
      let _ = [...newsSearch];
      newsSearch = _.filter(n => _usersS.find((userName: any) => (userName == n?.facilitator?.username || userName == n?.user?.username)));
    }
    set__News(newsSearch)
  }
  //End Search


  return (
    <View style={{}}>
      {(username && username != "undefined") && <ToggleButton.Row
        style={{ justifyContent: 'space-between' }}
        onValueChange={(value) => setStatus(value)}
        value={status}
      >
        <ToggleButton
          style={{ flex: 1, backgroundColor: status == 'my_unpublish' ? colors.primary : 'white' }}
          icon={() => (
            <View>
              <Text style={{ color: status == 'my_unpublish' ? 'white' : colors.primary }}>{t('news_search_content.tab_unpublished')}</Text>
            </View>
          )}
          value="my_unpublish"
        />
        <ToggleButton
          style={{ flex: 1, backgroundColor: status == 'my_publish' ? colors.primary : 'white' }}
          icon={() => (
            <View>
              <Text style={{ color: status == 'my_publish' ? 'white' : colors.primary }}>{t('news_search_content.tab_for_me')}</Text>
            </View>
          )}
          value="my_publish"
        />
        <ToggleButton
          style={{ flex: 1, backgroundColor: status == 'publish' ? colors.primary : 'white' }}
          icon={() => (
            <View>
              <Text style={{ color: status == 'publish' ? 'white' : colors.primary }}>{t('news_search_content.tab_publications')}</Text>
            </View>
          )}
          value="publish"
        />
        <ToggleButton
          style={{ flex: 1, backgroundColor: status == 'my_files' ? colors.primary : 'white' }}
          icon={() => (
            <View>
              <Text style={{ color: status == 'my_files' ? 'white' : colors.primary }}>{t('news_search_content.tab_files')}</Text>
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
              setItemsSelected={(val: any) => {
                setTagsS(val);
                onSearchIssuesByTags(val);
              }}
              otherStyles={{
                borderRadius: 5,
                padding: 5,
                marginTop: 7,
              }} title={t('news_search_content.filter_by_tag_title')} searchText={t('news_search_content.search_tag')}
              marginEndChevronIcon={'-10%'}
            />
          </View>
          <View style={{ flex: 0.5 }}>

            <SectionedMultiSelectCustom
              id={"id"}
              K_OPTIONS={newsCategories}
              items={newsCategories}
              itemsSelected={newsCategoriesS}
              setItemsSelected={(val: any) => {
                setNewsCategoriesS(val);
                onSearchIssuesByCategories(val);
              }}
              otherStyles={{
                borderRadius: 5,
                padding: 5,
                marginTop: 7,
              }} title={t('news_search_content.filter_by_category_title')} searchText={t('news_search_content.search_category')}
              marginEndChevronIcon={'-10%'}
            />
          </View>
        </View>
      </View>


      {status == "my_files" ? <FlatList
        style={{ flex: 1 }}
        data={[{ files: newsFilesWithNews ?? [] }, { files: newsFilesNoNews ?? [] }]}
        renderItem={renderFileItem}
        keyExtractor={(item) => `${item.files.length}_${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}`}
        extraData={selectedId}
      /> : <FlatList
        style={{ flex: 1 }}
        data={__news}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.id}_${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}`}
        extraData={selectedId}

      // onEndReached={loadMoreData}
      // onEndReachedThreshold={0.5}
      // ListFooterComponent={loading ? <ActivityIndicator size="large" /> : null}
      />}

      {(status == "publish") && <>{loading ? <ActivityIndicator size="large" color='#63D3AC' /> : <>{hasMore && <TouchableOpacity
        style={{
          backgroundColor: '#63D3AC', marginHorizontal: 'auto', alignItems: 'center',
          justifyContent: 'center',
          alignContent: 'center',
          alignSelf: 'center',
          elevation: 8,
          zIndex: 9, borderRadius: 5, paddingHorizontal: 15, paddingVertical: 2
        }}
        onPress={loadMoreData}
      >
        <Text style={{ color: 'white' }}>{t('news_search_content.load_more')}</Text>
      </TouchableOpacity>}</>}</>}

      <View style={{ marginBottom: height / 10 }}></View>

    </View>
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
