import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import { useTranslation } from 'react-i18next';
import { styles as stylesCustomDropDow } from '../components/CustomDropDownPicker/CustomDropDownPicker.style';
import { colors } from '../utils/colors';


const SectionedMultiSelectCustom = (
  { id, K_OPTIONS, items, itemsSelected, setItemsSelected, title, searchText, confirmText, onConfirm, otherStyles, disabled, marginEndChevronIcon }: {
    id: any, K_OPTIONS: any, items: any, itemsSelected: any, setItemsSelected: (i: any) => void,
    title?: any | undefined, searchText?: any | undefined, confirmText?: any | undefined, onConfirm?: () => void,
    otherStyles?: any, disabled?: boolean, marginEndChevronIcon?: any,
  }
) => {
  const { t } = useTranslation(['components', 'common']);
  return (
    <SectionedMultiSelect
      single={false}
      items={K_OPTIONS}
      IconRenderer={Icon as any}
      disabled={disabled}
      uniqueKey={id}
      selectedItems={itemsSelected}
      
      onSelectedItemsChange={setItemsSelected}
      renderSelectText={() => {
        return (
          <View style={{ flex: 0.75 }}>
            <Text style={{ ...styles.subTitle, color: 'black' }}>
              {(itemsSelected && itemsSelected.length != 0) ? t('sectioned_multi_select_custom.items_selected', { count: itemsSelected.length, plural: itemsSelected.length > 1 ? "s" : "" }) : (title ? title : t('sectioned_multi_select_custom.choose_item'))}
            </Text>
          </View>
        );
      }}

      selectToggleIconComponent={
        <View style={{ flex: 0.25, marginEnd: marginEndChevronIcon ?? '-17%' }}>
          <MaterialCommunityIcons name="chevron-down-circle" size={24} color={colors.primary} />
        </View>
      }
      searchPlaceholderText={searchText ? searchText : t('sectioned_multi_select_custom.search_placeholder')}
      confirmText={confirmText ? confirmText : t('sectioned_multi_select_custom.confirm')}
      onConfirm={onConfirm}
      showCancelButton={true}
      styles={{
        chipContainer: { backgroundColor: 'rgba(144, 238, 144, 0.5)' },
        chipText: { color: 'black' },
        selectToggle: {
          ...stylesCustomDropDow.dropdownStyle,
          padding: 15,
          alignContent: 'space-between', justifyContent: 'space-between',
          flexDirection: 'row',
          ...(otherStyles ? otherStyles : {}),
        },
        selectToggleText: { ...styles.subTitle, display: 'flex', color: 'black' },
        cancelButton: { backgroundColor: 'red' },
        button: { backgroundColor: '#406b12' }
      }}
      noItemsComponent={
        // () => {
        // return (
          <View style={{ alignItems: 'center', marginTop: 25 }}>
            <Text style={{ ...styles.subTitle, fontWeight: '400' }}>
              {t('sectioned_multi_select_custom.no_data_found')}
            </Text>
          </View>
        // );
      // }
    }
    />
  );
};
export default SectionedMultiSelectCustom;

// styles
const styles = StyleSheet.create({
  subTitle: {
    fontFamily: 'Poppins_300Light',
    fontSize: 12,
    fontWeight: 'normal',
    fontStyle: 'normal',
    // lineHeight: 10,
    letterSpacing: 0,
    // textAlign: "left",
    color: '#707070',
  }
});