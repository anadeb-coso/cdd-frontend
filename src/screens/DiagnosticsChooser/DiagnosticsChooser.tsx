import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, VStack } from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';

function DiagnosticsChooser({ navigation }: { navigation: any; route: any; }) {
  const { t } = useTranslation(['core', 'common']);

  const options = [
    {
      key: 'subprojects',
      icon: 'domain',
      label: t('home.diagnostics_chooser_subprojects_label'),
      route: 'DiagnosticActivities',
    },
    {
      key: 'investment_cycle',
      icon: 'chart-timeline-variant',
      label: t('home.diagnostics_chooser_investment_cycle_label'),
      route: 'InvestmentCycleDiagnostic',
    },
  ];

  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={styles.card}
          onPress={() => navigation.navigate(option.route)}
        >
          <VStack space={3} alignItems="center">
            <MaterialCommunityIcons name={option.icon as any} size={40} color={colors.primary} />
            <Text style={styles.cardLabel}>{option.label}</Text>
          </VStack>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    paddingVertical: 30,
    marginBottom: 16,
    elevation: 3,
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#373737',
    textAlign: 'center',
  },
});

export default DiagnosticsChooser;
