import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, FlatList } from 'react-native';
import { Divider } from 'react-native-paper';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';
import { styles } from './Content.styles';

function Content({ comments }: { comments: any }) {
  const { t } = useTranslation('planning');

  const renderItem = (item: any, index: number) => (
    <View key={`${index}-${item.created_date}`}>
      <View key={`${index}-${index}-${item.created_date}`} style={styles.commentCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
          <View style={styles.greenCircle} />
          <View>
            <Text style={styles.radioLabel}>{item?.user_name ?? (item?.user ? `${item?.user?.last_name ?? ''} ${item?.user?.first_name ?? ''}`: item?.facilitator?.name)}{item?.type != "comment" ? <>
              <Text>{'('}<Text style={{ color: item?.validated ? 'green' : 'red' }}>{item?.validated ? t('content.validation_action_label') : t('content.invalidation_action_label')}</Text>{')'}</Text>
            </> : ""}</Text>
            <Text style={styles.radioLabel}>{moment(item.created_date).format('DD-MMM-YYYY HH:mm')}</Text>
          </View>
        </View>
        <Text style={styles.stepNote}>{item.comment}</Text>
      </View>
      <Divider />
    </View>
  );



  const dividerItem = () => <Divider />;
  return (
    <View style={styles.container}>
      {comments && comments?.length > 0 && <Text style={[styles.title, {marginTop: 35}]}>{t('content.comments_title')}</Text>}
      {comments && comments?.length > 0 && (
        comments.map((item: any, i: number) => renderItem(item, i))
      )}
    </View>
  );
}

export default Content;
