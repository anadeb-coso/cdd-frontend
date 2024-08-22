import * as React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Avatar, Button, Card, Text } from 'react-native-paper';
import { chunkArray } from '../../../../utils/functions';
import moment from 'moment';

let height = Dimensions.get('window').height;
let width = Dimensions.get('window').width;

const LeftContent = (props: any) => <Avatar.Icon {...props} icon="folder" />

const FilesComponent = ({ item }: { item: any }) => (
  <View key={`${item?.files?.length}_url_contanier_${item?.files?.length}_${moment().format()}`}>
    {!item.files || (item.files && item.files.length == 0) ? (
      <></>
    ) : (
      item.files.length < 6 ? (
        item.files.map((e: any) => <Card.Cover key={e.url} source={{ uri: e.url.split('?')[0] }} style={styles.card_cover} />)
      ) : (

        <View style={{  }}>
          <Card.Cover source={{ uri: item.files[0].url.split('?')[0] }} style={[styles.card_cover, { flex: 0.5 }]} />
          {
                chunkArray(item.files.filter((e: any, i: number) => i != 0), 3).map((arr: any) => <View key={`${arr.length}_url_${arr.length}`} style={{ flexDirection: 'row'}}>
                    {arr.map((e:any) => <Card.Cover key={e.url} source={{ uri: e.url.split('?')[0] }} style={[styles.card_cover, {flex: 1/(3)}]} />)}
                  </View>)
              }
        </View>

      )
    )}
  </View>
);

export default FilesComponent;

const styles = StyleSheet.create({
  card_cover: {
    borderRadius: 0,
    height: 225
  }
});