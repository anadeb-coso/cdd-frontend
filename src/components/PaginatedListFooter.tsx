import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

/**
 * Bas d'une liste paginée : nombre d'éléments chargés sur le total, chargement de la suite en cours, ou bouton
 * « Charger la suite » / « Réessayer » (la suite se charge aussi seule quand on approche de la fin de la liste).
 */
function PaginatedListFooter({
  loaded, count, hasMore, loadingMore, error, onLoadMore, onRetry,
}: {
  loaded: number;
  count: number | null;
  hasMore: boolean;
  loadingMore: boolean;
  error?: any;
  onLoadMore: () => void;
  onRetry: () => void;
}) {
  const { t } = useTranslation('common');
  if (!hasMore && !loadingMore) {
    return count && count > 0 ? (
      <Text style={{ textAlign: 'center', color: 'grey', fontSize: 11, marginVertical: 12 }}>
        {t('loaded_count', { loaded, count })}
      </Text>
    ) : null;
  }
  return (
    <View style={{ alignItems: 'center', marginVertical: 14 }}>
      {loadingMore ? (
        <>
          <ActivityIndicator size="small" color="#24c38b" />
          <Text style={{ color: 'grey', fontSize: 11, marginTop: 6 }}>{t('loading_more')}</Text>
        </>
      ) : (
        <TouchableOpacity
          onPress={error ? onRetry : onLoadMore}
          style={{ borderColor: '#24c38b', borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 6 }}
        >
          <Text style={{ color: '#24c38b' }}>{error ? t('retry') : t('load_more')}</Text>
        </TouchableOpacity>
      )}
      {count !== null && (
        <Text style={{ color: 'grey', fontSize: 11, marginTop: 6 }}>{t('loaded_count', { loaded, count })}</Text>
      )}
    </View>
  );
}

export default PaginatedListFooter;
