import * as PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

export default function ListHeader(props) {
  const { t } = useTranslation();
  return (
    <View>
      <View
        style={{
          borderRadius: 10,
          backgroundColor: '#ffffff',
          shadowColor: 'rgba(0, 0, 0, 0.05)',
          shadowOffset: {
            width: 0,
            height: 3,
          },
          // shadowRadius: 15,
          // shadowOpacity: 1,
          marginHorizontal: 17,
          paddingHorizontal: 10,
        }}
      >
        <Text style={styles.statisticsText}>
            y: u
          </Text>
        
      </View>
    </View>
  );
}

ListHeader.propTypes = {
  overdue: PropTypes.any,
  length: PropTypes.any,
  average: PropTypes.any,
};

const styles = StyleSheet.create({
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
