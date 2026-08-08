import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, ScrollView } from 'react-native';

function Datas() {
  const { t } = useTranslation('core');
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', padding: 20 }}
    >
      <Text>
      {t('sync_datas.content_description')}
      </Text>
    </ScrollView>
  );
}

export default React.memo(Datas);
