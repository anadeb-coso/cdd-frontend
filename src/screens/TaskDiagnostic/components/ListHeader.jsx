import * as PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ListHeader(props) {
  console.log({ props });
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
          shadowRadius: 15,
          shadowOpacity: 1,
          margin: 17,
          padding: 10,
        }}
      >

        <Text style={styles.statisticsText}>
          Achevées: {props.completed ?? '--'}
        </Text>
        <Text style={styles.statisticsText}>
          Inachevées: {props.uncompleted ?? '--'}
        </Text>
        <Text style={styles.statisticsText}>
          Validées: {props.validated ?? '--'}
        </Text>
        <Text style={styles.statisticsText}>
          Invalidées: {props.invalidated ?? '--'}
        </Text>
        <Text style={styles.statisticsText}>
          Non vues: {props.unsee ?? '--'}
        </Text>
      </View>
      <View style={{ padding: 15 }}>
        <Text
          style={{
            fontSize: 17,
            fontWeight: 'bold',
            fontStyle: 'normal',
            lineHeight: 18,
            letterSpacing: 0,
            textAlign: 'left',
            color: '#707070',
          }}
        >
          Tâches {props.statusLabel}:
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
