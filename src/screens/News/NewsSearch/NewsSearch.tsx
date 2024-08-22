import React, { useEffect, useState } from 'react';
import {
  SafeAreaView, ToastAndroid, RefreshControl, ScrollView,
  TouchableOpacity, StyleSheet, Text, View
} from 'react-native';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
  const [news, setNews]: any = useState(null);
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
    setEmail(JSON.parse(await getData('username')) ?? "undefined");
  }

  useEffect(() => {
    get_user_credentials();

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

  }, []);

  const get_news = async () => {
    setNews([]);

    new NewsAPI()
      .get_news({})
      .then((result: any) => {
        setNews(result.results);
      }).catch((err) => {
        alert(`Unable to retrieve news. ${JSON.stringify(err)}`);
      });

  }
  useEffect(() => {
    get_news();
    get_files_no_sync();
  }, []);


  const check_network = async () => {
    NetInfo.fetch().then((state) => {
      if (!state.isConnected) {
        setErrorMessage("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
        setErrorVisible(true);
        setConnected(false);
      }
    });
  }
  const onRefresh = async () => {
    setRefreshing(true);
    setConnected(true);
    await check_network();

    await get_news();
    await get_files_no_sync();

    setRefreshing(false);

  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onRefresh();
    });

    return unsubscribe;
  }, [navigation]);


  if (!news || refreshing || !tags || !newsCategories || !projects || !newsFilesNoNews || !email || !username)
    return <ActivityIndicator style={{ marginTop: 50 }} color={colors.primary} size="small" />;

  return (
    <>
      <ScrollView _contentContainerStyle={{ pt: 7, px: 5 }} style={customStyles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <SafeAreaView>

          <Content
            news={news} tags={tags} newsCategories={newsCategories}
            projects={projects}
            newsFilesWithNews={newsFilesWithNews} newsFilesNoNews={newsFilesNoNews} 
            username={username} email={email}
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
    </>
  );
}

const styles = StyleSheet.create({
  addButton: {
    position: 'absolute',
    bottom: 25,
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
});

export default NewsSearch;
