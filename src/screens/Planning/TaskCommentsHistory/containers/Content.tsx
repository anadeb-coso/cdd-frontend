import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { Divider } from 'react-native-paper';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';
import { styles } from './Content.styles';

function Content({ comments }: { comments: any }) {

  const renderItem = (item: any, index: number) => (
    <View key={`${index}-${item.created_date}`}>
      <View key={`${index}-${index}-${item.created_date}`} style={styles.commentCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
          <View style={styles.greenCircle} />
          <View>
            <Text style={styles.radioLabel}>{item.user_name}</Text>
            <Text style={styles.radioLabel}>{moment(item.created_date).format('DD-MMM-YYYY HH:mm')}</Text>
          </View>
        </View>
        <Text style={styles.stepNote}>{item.comment}</Text>
      </View>
      <Divider />
    </View>
  );

  const listHeader = () => <Text style={styles.title}>Commentaires</Text>;


  const dividerItem = () => <Divider />;
  return (
    <View style={styles.container}>
      {comments && comments?.length > 0 && <Text style={[styles.title, {marginTop: 35}]}>Commentaires</Text>}
      {comments && comments?.length > 0 && (
        // <FlatList
        //   ItemSeparatorComponent={dividerItem}
        //   ListHeaderComponent={listHeader}
        //   data={comments}
        //   renderItem={renderItem}
        //   keyExtractor={(item) => item.created_date}
        // />
        comments.map((item: any, i: number) => renderItem(item, i))
      )}
    </View>
  );
}

export default Content;
