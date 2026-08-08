import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDownPicker from '../components/CustomDropDownPicker/CustomDropDownPicker';
import { storeData } from "../utils/storageManager";

function LanguageSelector() {
  const { i18n } = useTranslation();
  const [locale, setLocale] = useState(i18n.language);
  const [items, setItems] = useState([
    { label: 'Français', value: 'fr' },
    { label: 'English', value: 'en' },
  ]);

  return (
    <CustomDropDownPicker
      items={items}
      setItems={setItems}
      value={locale}
      setPickerValue={setLocale}
      placeholder=""
      onChangeValue={() => {}}
      schema={undefined}
      customDropdownWrapperStyle={undefined}
      onSelectItem={(async (item: any) => { 
        i18n.changeLanguage(item.value); 
        await storeData('infos_changed', true);
      }) as any}
    />
  );
}

export default LanguageSelector;
