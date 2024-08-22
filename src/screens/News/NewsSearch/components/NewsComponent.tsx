import * as React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Avatar, Button, Card, Text } from 'react-native-paper';
import moment from 'moment';
import { substring } from '../../../../utils/functions';

let height = Dimensions.get('window').height;
let width = Dimensions.get('window').width;

const LeftContent = (props: any) => <Avatar.Icon {...props} icon="folder" />

const NewsComponent = (
  { navigation, item, tags, categories, projects, username, email }:
    { navigation: any, item: any, tags: any; categories: any, projects: any, username: any, email: any }
) => (
  <Card key={`${item?.files?.length}_url_contanier_${item?.files?.length}_${moment().format()}`}>
    {!item.files || (item.files && item.files.length == 0) ? (
      <></>
    ) : (<Card.Content style={{ height: 250 }}>
      {
        item.files.length < 2 ? (
          <Card.Cover key={item.files[0].url} source={{ uri: item.files[0].url.split('?')[0] }} style={styles.card_cover} />
        ) : (

          <View style={{ flexDirection: 'row' }}>
            <Card.Cover key={item.files[0].url} source={{ uri: item.files[0].url.split('?')[0] }} style={[styles.card_cover, { flex: 0.5 }]} />
            <View style={{ flexDirection: 'column', flex: 0.5 }}>
              {item.files.filter((e: any, i: number) => i != 0).map((e: any) => <Card.Cover key={e.url} source={{ uri: e.url.split('?')[0] }} style={[styles.card_cover, { flex: 1 / (item.files.length - 1) }]} />)}
            </View>
          </View>

        )
      }
    </Card.Content>)}
    <Card.Content>
      <Text variant="titleLarge">
        {item.title}
        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
            {
              item.projects && item.projects.map((p: any) => <Text style={{ paddingVertical: 4, paddingHorizontal: 9, backgroundColor: 'rgba(0, 255, 0, 0.5)', borderRadius: 11, marginHorizontal: 3, fontSize: 10 }}>{p?.name}</Text>)
              
            }

          </View>
      </Text>
      <Text variant="bodyMedium">{substring(item.description, 250)}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <View style={{ flexDirection: 'column', flex: 0.4, flexWrap: 'wrap' }}>
          <Text style={{ paddingVertical: 4, paddingHorizontal: 9, backgroundColor: 'rgba(0, 255, 0, 0.5)', borderRadius: 11, marginBottom: 2, fontSize: 9 }}>{item?.category?.name}</Text>
          <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
            {
              item.tags && item.tags.map((t: any) => <Text style={{ paddingVertical: 4, paddingHorizontal: 9, backgroundColor: 'rgba(255, 100, 200, 0.5)', borderRadius: 11, fontSize: 8 }}>{t?.name}</Text>)
              
            }
          </View>
        </View>
        <View style={{ flex: 0.6 }}>
          <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
            {
              item.administrative_levels && item.administrative_levels.filter((a:any)=> a.type=="Canton").map((ad: any) => <Text style={{ paddingVertical: 4, paddingHorizontal: 9, backgroundColor: 'rgba(100, 155, 111, 0.5)', borderRadius: 11, fontSize: 10 }}>{ad?.name}</Text>)
              
            }
          </View>
        </View>
      </View>
    </Card.Content>
    <Card.Actions>
      {/* <Button>Cancel</Button> */}
      {((item.facilitator ?? item.user) && ((item.facilitator ?? item.user).email == email || (item.facilitator ?? item.user).username == username)) && <Button onPress={() => {
        navigation.navigate('AddNews', {
          news: item,
          name: item.title,
          categories: categories,
          tags: tags,
          projects: projects,
          newsFilesNoNews: item?.files ?? []
        })
      }}>Modifier</Button>}
    </Card.Actions>
  </Card>
);

export default NewsComponent;

const styles = StyleSheet.create({
  card_cover: {
    borderRadius: 0,
    height: 225
  }
});