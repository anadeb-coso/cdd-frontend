import React from 'react';
import { Text, ScrollView } from 'react-native';

function Datas() {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', padding: 20 }}
    >
      <Text>
      Nous vous mettons cette page à votre disposition pour vos synchronisations manuelles des données pour éviter les pertes de ces dernières en cas de non-synchronisation de celles-ci.
      </Text>
    </ScrollView>
  );
}

export default React.memo(Datas);
