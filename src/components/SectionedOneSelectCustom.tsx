import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import { styles as stylesCustomDropDow } from '../components/CustomDropDownPicker/CustomDropDownPicker.style';
import { colors } from '../utils/colors';


const SectionedOneSelectCustom = (
  { id, K_OPTIONS, items, itemSelected, setItemSelected, title, searchText, confirmText, otherStyles, disabled }: {
    id: any, K_OPTIONS: any, items: any, itemSelected: any, setItemSelected: (i: any) => void,
    title?: any | undefined, searchText?: any | undefined, confirmText?: any | undefined,
    otherStyles?: any, disabled?: boolean
  }
) => {
  return (
    <SectionedMultiSelect
      single={true}
      items={K_OPTIONS}
      IconRenderer={Icon}
      disabled={disabled}
      uniqueKey={id}
      selectedItems={itemSelected ? [itemSelected.id] : []}
      onSelectedItemsChange={(val: any) => {
        let l = items.find((elt: any) => val && elt.id === val[0]);
        setItemSelected(l ?? (val ? val[0] : null));
      }}
      renderSelectText={() => {
        return (
          <View style={{ flex: 0.75 }}>
            <Text style={{ ...styles.subTitle, color: 'black' }}>
              {(itemSelected) ? itemSelected.name : (title ? title : `Choisissez un élément`)}
            </Text>
          </View>
        );
      }}

      selectToggleIconComponent={() => (
        <View style={{ flex: 0.25, marginEnd: '-17%' }}>
          <MaterialCommunityIcons name="chevron-down-circle" size={24} color={colors.primary} />
        </View>
      )}
      searchPlaceholderText={searchText ? searchText : "Rechercher un élément..."}
      confirmText={confirmText ? confirmText : "Confirmer"}
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
      noItemsComponent={() => {
        return (
          <View style={{ alignItems: 'center', marginTop: 25 }}>
            <Text style={{ ...styles.subTitle, fontWeight: '400' }}>
              Pas de données trouvées
            </Text>
          </View>
        );
      }}
    />
  );
};
export default SectionedOneSelectCustom;

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