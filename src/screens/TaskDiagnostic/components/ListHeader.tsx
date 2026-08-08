import * as PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

export default function ListHeader(props: any) {
  const { t } = useTranslation('core');
  // console.log({ props });
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
          {t('task_diagnostic.completed_label')}: {props.completed ?? '--'}
        </Text>
        <Text style={styles.statisticsText}>
          {t('task_diagnostic.uncompleted_label')}: {props.uncompleted ?? '--'}
        </Text>
        <Text style={styles.statisticsText}>
          {t('task_diagnostic.validated_label')}: {props.validated ?? '--'}
        </Text>
        <Text style={styles.statisticsText}>
          {t('task_diagnostic.invalidated_label')}: {props.invalidated ?? '--'}
        </Text>
        <Text style={styles.statisticsText}>
          {t('task_diagnostic.unseen_label')}: {props.unsee ?? '--'}
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
          {t('task_diagnostic.tasks_status_label', { statusLabel: props.statusLabel })}
        </Text>
      </View>
    </View>
  );
}

ListHeader.propTypes = {
  completed: PropTypes.number.isRequired,
  uncompleted: PropTypes.number.isRequired,
  validated: PropTypes.number.isRequired,
  invalidated: PropTypes.number.isRequired,
  unsee: PropTypes.number.isRequired,
  statusLabel: PropTypes.string.isRequired,
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
