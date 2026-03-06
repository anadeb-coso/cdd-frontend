import React, { useEffect, useState } from 'react';
import {
  SafeAreaView, ToastAndroid, RefreshControl, ScrollView,
  TouchableOpacity, StyleSheet, Text, View
} from 'react-native';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesome } from '@expo/vector-icons';
import { colors } from '../../../utils/colors';
import { styles as stylesNewsSearch } from './NewsSearch.style';
import Content from './containers';
import CategoryAPI from '../../../services/news/category';
import NewsAPI from '../../../services/news/news';
import NewsFilesAPI from '../../../services/news/newsfiles';
import TagAPI from '../../../services/news/tags';
import ProjectAPI from '../../../services/news/projects';
import { PrivateStackParamList } from '../../../types/navigation';
import { getData } from '../../../utils/storageManager';


function NewsSearch() {
  const navigation =
    useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();

  const customStyles = stylesNewsSearch();
  const [news, setNews]: any = useState([]);
  const [newsMyUnpublish, setNewsMyUnpublish]: any = useState(null);
  const [newsMyPublish, setNewsMyPublish]: any = useState(null);
  const [tags, setTags]: any = useState(null);
  const [projects, setProjects]: any = useState(null);
  const [newsCategories, setNewsCategories]: any = useState(null);
  const [newsFilesNoNews, setNewsFilesNoNews]: any = useState(null);
  const [newsFilesWithNews, setNewsFilesWithNews]: any = useState(null);

  const [username, setUserame]: any = useState(null);
  const [email, setEmail]: any = useState(null);

  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
  const [connected, setConnected] = useState(true);
  const [errorVisible, setErrorVisible] = React.useState(false);
  const onDismissSnackBar = () => setErrorVisible(false);

  const [loading, setLoading] = useState(false);
  const [page, setPage]: any = useState(1);
  const [pageSize, setPageSize]: any = useState(5);
  const [hasMore, setHasMore] = useState(true);


  const get_files_no_sync = async () => {
    new NewsFilesAPI()
      .search_new_file({
        // news: null,
        username: JSON.parse(await getData('username')),
      })
      .then((result: any) => {
        setNewsFilesNoNews(result.filter((e: any) => e.news == null));
        setNewsFilesWithNews(result.filter((e: any) => e.news != null));
      }).catch((err) => {
        alert(`Unable to retrieve tags. ${JSON.stringify(err)}`);
      });

  }

  const get_user_credentials = async () => {
    setUserame(JSON.parse(await getData('username')) ?? "undefined");
    setEmail(JSON.parse(await getData('email')) ?? "undefined");
  }

  const load = async () => {
    new CategoryAPI()
      .get_categories({})
      .then((result: any) => {
        setNewsCategories(result);
      }).catch((err) => {
        alert(`Unable to retrieve categories. ${JSON.stringify(err)}`);
      });

    new TagAPI()
      .get_tags({})
      .then((result: any) => {
        setTags(result);
      }).catch((err) => {
        alert(`Unable to retrieve tags. ${JSON.stringify(err)}`);
      });

    new ProjectAPI()
      .get_projects({})
      .then((result: any) => {
        setProjects(result);
      }).catch((err) => {
        alert(`Unable to retrieve tags. ${JSON.stringify(err)}`);
      });
  };
  useEffect(() => {
    get_user_credentials();

    load();

  }, []);

  const get_my_news = async () => {
    await new NewsAPI()
      .get_news({}, null, null, 1, 200, 'my_unpublish')
      .then((result: any) => {
        if (result?.results) {
          setNewsMyUnpublish(result.results);
        }
      }).catch((err) => {

      });

    await new NewsAPI()
      .get_news({}, null, null, 1, 200, 'my_publish')
      .then((result: any) => {
        if (result?.results) {
          setNewsMyPublish(result.results);
        }
      }).catch((err) => {

      });
  };

  const get_news = async (_news: any = news, _page: number = page, _page_size: number = pageSize, incrementPage = true) => {
    if ((_news && _news.length != 0 && !incrementPage) && (loading || !hasMore)) return; // Ne pas déclencher la fonction si déjà en chargement ou plus de pages
    setLoading(true);

    await new NewsAPI()
      .get_news({}, null, null, _page, _page_size)
      .then((result: any) => {

        if (result?.results?.length > 0) {
          setNews([...(_news ?? []), ...result.results]);
          if (incrementPage) {
            setPage(page + 1);
          }
        }

        setHasMore(!!result?.next);
        setLoading(false);
      }).catch((err) => {
        setLoading(false);
        alert(`Unable to retrieve news. ${JSON.stringify(err)}`);
      });

  }
  useEffect(() => {
    setNews([]);
    get_my_news();
    get_news([], 1, (news && news?.length != 0) ? news?.length : (pageSize ?? 5), (!page || page == 1));
    get_files_no_sync();
  }, []);


  const check_network = async () => {
    NetInfo.fetch().then((state) => {
      if (!state.isConnected) {
        setErrorMessage("Vous n'êtes pas connecté à aucun réseau. Veuillez activer votre donnée mobile ou connecter vous à un wifi.");
        setErrorVisible(true);
        setConnected(false);
      }else if(!state.isInternetReachable){
        setErrorMessage("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
        setErrorVisible(true);
        setConnected(false);
      }
    });
  }
  const onRefresh = async () => {
    setNews([]);
    setRefreshing(true);
    setConnected(true);

    load();

    await check_network();

    await get_my_news();
    await get_news([], 1, (news && news?.length != 0) ? news?.length : (pageSize ?? 5), false);
    await get_files_no_sync();

    setRefreshing(false);

  };


  const loadMoreData = () => {
    if (!loading && hasMore) {
      get_news(news, page);
    }
  };


  if (!news || refreshing || !tags || !newsCategories || !projects || !newsFilesNoNews || !email || !username || !newsMyUnpublish || !newsMyPublish)
    return <ActivityIndicator style={{ marginTop: 50 }} color={colors.primary} size="small" />;

  return (
    <>
      <ScrollView contentContainerStyle={{ paddingTop: 7, paddingHorizontal: 5 }} style={customStyles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <SafeAreaView>

          <Content
            news={news} tags={tags} newsCategories={newsCategories}
            projects={projects} newsMyPublish={newsMyPublish} newsMyUnpublish={newsMyUnpublish} 
            newsFilesWithNews={newsFilesWithNews} newsFilesNoNews={newsFilesNoNews}
            username={username} email={email} page={page} setPage={setPage} setNews={setNews}
            loadMoreData={loadMoreData} loading={loading} setLoading={setLoading} hasMore={hasMore} setHasMore={setHasMore}
          />

          <Snackbar visible={errorVisible} duration={3000} onDismiss={onDismissSnackBar}>
            {errorMessage}
          </Snackbar>
        </SafeAreaView>
      </ScrollView>

      {(username && username != "undefined") && <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          navigation.navigate('AddNews', {
            categories: newsCategories,
            tags: tags,
            projects: projects,
            newsFilesNoNews: newsFilesNoNews
          })
        }}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>}

      <TouchableOpacity
        style={styles.loadButton}
        onPress={onRefresh}
      >
        <FontAwesome name="refresh" size={25} color="black" />
      </TouchableOpacity>


    </>
  );
}

const styles = StyleSheet.create({
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 10,
    // marginBottom: 500,
    backgroundColor: '#63D3AC',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    elevation: 8,
    zIndex: 9,

  },
  addButtonText: {
    color: 'white',
    fontSize: 30,
    lineHeight: 30,
  },
  loadButton: {
    position: 'absolute',
    bottom: 1,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    elevation: 8,
    zIndex: 9,

  },
});

export default NewsSearch;
