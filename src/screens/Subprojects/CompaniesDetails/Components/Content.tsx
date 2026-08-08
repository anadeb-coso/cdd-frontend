import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, TouchableOpacity, StatusBar, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, View, useToast } from 'native-base';
import { Button, Dialog, Paragraph, Portal, TextInput, RadioButton, Checkbox } from 'react-native-paper';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Subproject } from '../../../../models/subprojects/Subproject';
import { colors } from '../../../../utils/colors';
import CustomDropDownPickerWithRender from '../../../../components/CustomDropDownPicker/CustomDropDownPickerWithRender';
import SubprojectAPI from '../../../../services/subprojects/subprojects';
import { return_numbers_only, convert_object_to_id } from '../../../../utils/functions';
import { DONATIONS } from '../../../../utils/constants';
import { getData } from '../../../../utils/storageManager';
import { AdministrativeLevel } from '../../../../models/administrativelevels/AdministrativeLevel';
import { styles as stylesCustomDropDow } from '../../../../components/CustomDropDownPicker/CustomDropDownPicker.style';
import { moneyFormat } from '../../../../utils/functions';

const problems_steps = [
  "abandon", "interrompu", "non approuvé"
]
const theme = {
  roundness: 12,
  colors: {
    ...colors,
    background: 'white',
    placeholder: '#dedede',
    text: '#707070',
  },
};

const Content = ({ subproject, administrativelevels, onRefresh, enableToUpdate }: { subproject: Subproject, administrativelevels: Array<AdministrativeLevel>, onRefresh: () => void; enableToUpdate: boolean }) => {
  const { t } = useTranslation(['subprojects', 'common']);
  const [subprojectObject, setSubprojectObject]: any = useState(subproject);
  const [donations, setDonations] = useState(DONATIONS ?? []);
  const K_OPTIONS = administrativelevels.map((item: AdministrativeLevel) => {
    return { name: `${item.name} (${item.parent?.name})`, id: item.id }
  });

  // const navigation = useNavigation();
  // const toast = useToast();
  const [pickerDonation, setPickerDonation] = useState(subproject.level_of_achievement_donation_certificate ?
    subproject.level_of_achievement_donation_certificate
    : null);

  const [hasLatrineBlocs, setHasLatrineBlocs] = useState(subproject.has_latrine_blocs ?? false);
  const [selectedItems, setSelectedItems]: any = useState(subproject.list_of_villages_crossed_by_the_track_or_electrification ? subproject.list_of_villages_crossed_by_the_track_or_electrification.map((item: any) => item.id) : []);

  const [isSaving, setIsSaving] = useState(false);

  // Date
  const [isDateVisibleSupervisorsBTP, setIsDateVisibleSupervisorsBTP] = useState(false);
  const handleConfirmSupervisorsBTP = (_date: any) => {
    setSubprojectObject({ ...subprojectObject, date_of_signature_of_contract_for_construction_supervisors: _date });
    hideDatePickerSupervisorsBTP();
  };
  const hideDatePickerSupervisorsBTP = () => {
    setIsDateVisibleSupervisorsBTP(false);
  }; const showDatePickerSupervisorsBTP = () => {
    setIsDateVisibleSupervisorsBTP(true);
  };

  const [isDateVisibleSupervisorsSES, setIsDateVisibleSupervisorsSES] = useState(false);
  const handleConfirmSupervisorsSES = (_date: any) => {
    setSubprojectObject({ ...subprojectObject, date_signature_contract_controllers_in_SES: _date });
    hideDatePickerSupervisorsSES();
  };
  const hideDatePickerSupervisorsSES = () => {
    setIsDateVisibleSupervisorsSES(false);
  }; const showDatePickerSupervisorsSES = () => {
    setIsDateVisibleSupervisorsSES(true);
  };

  const [isDateVisibleContractWorkCompanies, setIsDateVisibleContractWorkCompanies] = useState(false);
  const handleConfirmContractWorkCompanies = (_date: any) => {
    setSubprojectObject({ ...subprojectObject, date_signature_contract_work_companies: _date });
    hideDatePickerContractWorkCompanies();
  };
  const hideDatePickerContractWorkCompanies = () => {
    setIsDateVisibleContractWorkCompanies(false);
  }; const showDatePickerContractWorkCompanies = () => {
    setIsDateVisibleContractWorkCompanies(true);
  };

  const [isDateVisibleContract_efme, setIsDateVisibleContract_efme] = useState(false);
  const handleConfirmContract_efme = (_date: any) => {
    setSubprojectObject({ ...subprojectObject, date_signature_contract_efme: _date });
    hideDatePickerContract_efme();
  };
  const hideDatePickerContract_efme = () => {
    setIsDateVisibleContract_efme(false);
  }; const showDatePickerContract_efme = () => {
    setIsDateVisibleContract_efme(true);
  };

  const [isDateVisibleLaunchSite, setIsDateVisibleLaunchSite] = useState(false);
  const handleConfirmLaunchSite = (_date: any) => {
    setSubprojectObject({ ...subprojectObject, launch_date_of_the_construction_site_in_the_village: _date });
    hideDatePickerLaunchSite();
  };
  const hideDatePickerLaunchSite = () => {
    setIsDateVisibleLaunchSite(false);
  }; const showDatePickerLaunchSite = () => {
    setIsDateVisibleLaunchSite(true);
  };

  const [isDateVisibleEndContract, setIsDateVisibleEndContract] = useState(false);
  const handleConfirmEndContract = (_date: any) => {
    setSubprojectObject({ ...subprojectObject, expected_end_date_of_the_contract: _date });
    hideDatePickerEndContract();
  };
  const hideDatePickerEndContract = () => {
    setIsDateVisibleEndContract(false);
  }; const showDatePickerEndContract = () => {
    setIsDateVisibleEndContract(true);
  };


  // End Date


  const handle_length_of_the_track = (text: any) => {
    setSubprojectObject({ ...subprojectObject, length_of_the_track: return_numbers_only(text) });
  };

  const handle_depth_of_drilling = (text: any) => {
    setSubprojectObject({ ...subprojectObject, depth_of_drilling: return_numbers_only(text) });
  };

  const handle_drilling_flow_rate = (text: any) => {
    setSubprojectObject({ ...subprojectObject, drilling_flow_rate: return_numbers_only(text) });
  };

  const handle_number_of_latrine_blocks = (text: any) => {
    setSubprojectObject({ ...subprojectObject, number_of_latrine_blocks: return_numbers_only(text) });
  };

  const handle_number_of_classrooms = (text: any) => {
    setSubprojectObject({ ...subprojectObject, number_of_classrooms: return_numbers_only(text) });
  };

  const handle_storage_capacity = (text: any) => {
    setSubprojectObject({ ...subprojectObject, storage_capacity: return_numbers_only(text) });
  };

  const handle_extension_length = (text: any) => {
    setSubprojectObject({ ...subprojectObject, extension_length: return_numbers_only(text) });
  };

  const handle_number_of_sections_of_track_developed = (text: any) => {
    setSubprojectObject({ ...subprojectObject, number_of_sections_of_track_developed: return_numbers_only(text) });
  };

  const handle_distance_covered_by_streetlights = (text: any) => {
    setSubprojectObject({ ...subprojectObject, distance_covered_by_streetlights: return_numbers_only(text) });
  };

  const handle_number_of_streetlights = (text: any) => {
    setSubprojectObject({ ...subprojectObject, number_of_streetlights: return_numbers_only(text) });
  };

  const handle_number_of_drinking_fountains = (text: any) => {
    setSubprojectObject({ ...subprojectObject, number_of_drinking_fountains: return_numbers_only(text) });
  };

  const handle_contract_amount_work_companies = (text: any) => {
    setSubprojectObject({ ...subprojectObject, contract_amount_work_companies: return_numbers_only(text) });
  };

  const handle_expected_duration_of_the_work = (text: any) => {
    setSubprojectObject({ ...subprojectObject, expected_duration_of_the_work: return_numbers_only(text) });
  };

  const handle_contract_companies_amount_for_efme = (text: any) => {
    setSubprojectObject({ ...subprojectObject, contract_companies_amount_for_efme: return_numbers_only(text) });
  };

  const handle_contract_number_of_work_companies = (text: any) => {
    setSubprojectObject({ ...subprojectObject, contract_number_of_work_companies: text });
  };

  const handle_name_of_the_awarded_company_works_companies = (text: any) => {
    setSubprojectObject({ ...subprojectObject, name_of_the_awarded_company_works_companies: text });
  };

  const handle_name_of_company_awarded_efme = (text: any) => {
    setSubprojectObject({ ...subprojectObject, name_of_company_awarded_efme: text });
  };

  const check_is_its_fields = (elements: Array<string>) => {
    return elements.findIndex((item: string) => {
      return (subproject.type_of_subproject ?? "").toLowerCase().startsWith(item.toLowerCase());
    }) != -1;
  };

  useEffect(() => {

  }, []);


  const saveSubproject = async () => {
    setIsSaving(true);
    let adls = administrativelevels.filter(elt => selectedItems.findIndex((item: any) => item == elt.id) != -1);

    setSubprojectObject({
      ...subprojectObject,
      list_of_villages_crossed_by_the_track_or_electrification: adls,
      level_of_achievement_donation_certificate: pickerDonation
    });

    if (adls) subprojectObject.list_of_villages_crossed_by_the_track_or_electrification = adls;
    if (pickerDonation) subprojectObject.level_of_achievement_donation_certificate = pickerDonation;

    try {
      subprojectObject.date_of_signature_of_contract_for_construction_supervisors = subprojectObject.date_of_signature_of_contract_for_construction_supervisors ? subprojectObject.date_of_signature_of_contract_for_construction_supervisors.toISOString().split('T')[0] : undefined;
    } catch (e) {
      //Nothing
    }
    try {
      subprojectObject.date_signature_contract_controllers_in_SES = subprojectObject.date_signature_contract_controllers_in_SES ? subprojectObject.date_signature_contract_controllers_in_SES.toISOString().split('T')[0] : undefined;
    } catch (e) {
      //Nothing
    }
    try {
      subprojectObject.date_signature_contract_work_companies = subprojectObject.date_signature_contract_work_companies ? subprojectObject.date_signature_contract_work_companies.toISOString().split('T')[0] : undefined;
    } catch (e) {
      //Nothing
    }
    try {
      subprojectObject.date_signature_contract_efme = subprojectObject.date_signature_contract_efme ? subprojectObject.date_signature_contract_efme.toISOString().split('T')[0] : undefined;
    } catch (e) {
      //Nothing
    }
    try {
      subprojectObject.launch_date_of_the_construction_site_in_the_village = subprojectObject.launch_date_of_the_construction_site_in_the_village ? subprojectObject.launch_date_of_the_construction_site_in_the_village.toISOString().split('T')[0] : undefined;
    } catch (e) {
      //Nothing
    }
    try {
      subprojectObject.expected_end_date_of_the_contract = subprojectObject.expected_end_date_of_the_contract ? subprojectObject.expected_end_date_of_the_contract.toISOString().split('T')[0] : undefined;
    } catch (e) {
      //Nothing
    }

    await new SubprojectAPI().save_subproject({
      ...convert_object_to_id(subprojectObject),
      username: JSON.parse(await getData('username')),
      password: JSON.parse(await getData('password')),
      user: {
        username: JSON.parse(await getData('username')),
        email: JSON.parse(await getData('email'))
      }
    }, JSON.parse(await getData('access')))
      .then(async (reponse: any) => {
        if (reponse.error) {
          return;
        }
        onRefresh();
      });

    setIsSaving(false);


  }

  return (
    // <ScrollView showsVerticalScrollIndicator={false}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      <View>

        

        <View>
          <Text style={{ ...styles.subTitle }}>{t('companies_details.donation_level_label')}</Text>
          <View style={{ zIndex: 1000 }}>
            <CustomDropDownPickerWithRender
              disabled={!enableToUpdate}
              schema={{
                id: 'label',
                label: 'label',
                value: 'value',
              }}
              // renderItem={renderItem}
              placeholder={t('companies_details.donation_level_label')}
              value={pickerDonation}
              items={donations}
              setPickerValue={setPickerDonation}
              setItems={setDonations}

            />
          </View>
        </View>

        {/* Forage */}
        {(check_is_its_fields(["Forage ", "Forages ", "Forage Photovoltaïque", "Pompe à motricité humaine", "PMH"])) && <View>
          <View>
            <Text style={{ ...styles.subTitle }}>{t('companies_details.drilling_depth_label')}</Text>
            <TextInput
              disabled={!enableToUpdate}
              onChangeText={handle_depth_of_drilling}
              value={subprojectObject?.depth_of_drilling?.toString()}
              keyboardType="numeric"
              placeholder={t('companies_details.drilling_depth_label')}
              theme={theme}
              mode="outlined"
            />
            <Text></Text>
          </View>

          <View>
            <Text style={{ ...styles.subTitle }}>{t('companies_details.drilling_flow_label')}</Text>
            <TextInput
              disabled={!enableToUpdate}
              onChangeText={handle_drilling_flow_rate}
              value={subprojectObject?.drilling_flow_rate?.toString()}
              keyboardType="numeric"
              placeholder={t('companies_details.drilling_flow_label')}
              theme={theme}
              mode="outlined"
            />
            <Text></Text>
          </View>

          <View>
            <Text style={{ ...styles.subTitle }}>{t('companies_details.drinking_fountains_count_label')}</Text>
            <TextInput
              disabled={!enableToUpdate}
              onChangeText={handle_number_of_drinking_fountains}
              value={subprojectObject?.number_of_drinking_fountains?.toString()}
              keyboardType="numeric"
              placeholder={t('companies_details.drinking_fountains_count_label')}
              theme={theme}
              mode="outlined"
            />
            <Text></Text>
          </View>
        </View>}
        {/* End Forage */}

        {/* School */}
        {(check_is_its_fields(["Bâtiment Scolaire", "Batiment Scolaire", "Bâtiments Scolaires", "Batiments Scolaires"])) && <View>
          <View>
            <Text style={{ ...styles.subTitle }}>{t('companies_details.classrooms_count_label')}</Text>
            <TextInput
              disabled={!enableToUpdate}
              onChangeText={handle_number_of_classrooms}
              value={subprojectObject?.number_of_classrooms?.toString()}
              keyboardType="numeric"
              placeholder={t('companies_details.classrooms_count_label')}
              theme={theme}
              mode="outlined"
            />
            <Text></Text>
          </View>
        </View>}
        {/* End School */}


        {/* Magasin */}
        {(check_is_its_fields(["Magasin De Stockage"])) && <View>
          <View>
            <Text style={{ ...styles.subTitle }}>{t('companies_details.storage_capacity_label')}</Text>
            <TextInput
              disabled={!enableToUpdate}
              onChangeText={handle_storage_capacity}
              value={subprojectObject?.storage_capacity?.toString()}
              keyboardType="numeric"
              placeholder={t('companies_details.storage_capacity_label')}
              theme={theme}
              mode="outlined"
            />
            <Text></Text>
          </View>
        </View>}
        {/* End Magasin */}

        {/* Track */}
        {(check_is_its_fields(["Piste/OF", "Aménagement de piste", "Ouvrage de franchissement"])) && <View>
          <View>
            <Text style={{ ...styles.subTitle }}>{t('companies_details.track_length_label')}</Text>
            <TextInput
              disabled={!enableToUpdate}
              onChangeText={handle_length_of_the_track}
              value={subprojectObject?.length_of_the_track?.toString()}
              keyboardType="numeric"
              placeholder={t('companies_details.track_length_label')}
              theme={theme}
              mode="outlined"
            />
            <Text></Text>
          </View>

          <View>
            <Text style={{ ...styles.subTitle }}>{t('companies_details.track_sections_count_label')}</Text>
            <TextInput
              disabled={!enableToUpdate}
              onChangeText={handle_number_of_sections_of_track_developed}
              value={subprojectObject?.number_of_sections_of_track_developed?.toString()}
              keyboardType="numeric"
              placeholder={t('companies_details.track_sections_count_label')}
              theme={theme}
              mode="outlined"
            />
            <Text></Text>
          </View>
        </View>}
        {/* End Track */}


        {/* Extension */}
        {(check_is_its_fields(["Extension "])) && <View>
          <View>
            <Text style={{ ...styles.subTitle }}>{t('companies_details.extension_length_label')}</Text>
            <TextInput
              disabled={!enableToUpdate}
              onChangeText={handle_extension_length}
              value={subprojectObject?.extension_length?.toString()}
              keyboardType="numeric"
              placeholder={t('companies_details.extension_length_label')}
              theme={theme}
              mode="outlined"
            />
            <Text></Text>
          </View>
        </View>}
        {/* End Extension */}

        {/* Streetlights */}
        {(check_is_its_fields(["Lampadaires", "Electrification hors réseau "])) && <View>
          <View>
            <Text style={{ ...styles.subTitle }}>{t('companies_details.streetlights_distance_label')}</Text>
            <TextInput
              disabled={!enableToUpdate}
              onChangeText={handle_distance_covered_by_streetlights}
              value={subprojectObject?.distance_covered_by_streetlights?.toString()}
              keyboardType="numeric"
              placeholder={t('companies_details.streetlights_distance_label')}
              theme={theme}
              mode="outlined"
            />
            <Text></Text>
          </View>

          <View>
            <Text style={{ ...styles.subTitle }}>{t('companies_details.streetlights_count_label')}</Text>
            <TextInput
              disabled={!enableToUpdate}
              onChangeText={handle_number_of_streetlights}
              value={subprojectObject?.number_of_streetlights?.toString()}
              keyboardType="numeric"
              placeholder={t('companies_details.streetlights_count_label')}
              theme={theme}
              mode="outlined"
            />
            <Text></Text>
          </View>
        </View>}
        {/* End Streetlights */}

        {/* Block latrines */}
        {(check_is_its_fields(["Blocs de latrines dans les établissements scolaires", "Blocs de latrines", "Bloc de latrine"])) && <View>

          {hasLatrineBlocs && <View>
            <Text style={{ ...styles.subTitle }}>{t('companies_details.latrine_blocks_count_label')}</Text>
            <TextInput
              disabled={!enableToUpdate}
              onChangeText={handle_number_of_latrine_blocks}
              value={subprojectObject?.number_of_latrine_blocks?.toString()}
              keyboardType="numeric"
              placeholder={t('companies_details.latrine_blocks_count_label')}
              theme={theme}
              mode="outlined"
            />
            <Text></Text>
          </View>}
        </View>}
        {/* End Block latrines */}


        {/* Villages crossed by the structure */}
        {(check_is_its_fields(["Extension réseau ", "Extension du réseau ", "Lampadaires ", "Electrification hors réseau ", "Piste/OF", "Aménagement de piste", "Ouvrage de franchissement"])) && <View>
          <View style={{ ...stylesCustomDropDow.dropdownWrapper, zIndex: 1000 }}>
            <SectionedMultiSelect
              disabled={!enableToUpdate}
              items={K_OPTIONS}
              IconRenderer={Icon as any}
              uniqueKey="id"
              onSelectedItemsChange={setSelectedItems}
              selectedItems={selectedItems}
              renderSelectText={() => {
                return (
                  <View>
                    <Text style={{ ...styles.subTitle, color: 'black' }}>
                      {t('companies_details.choose_villages_crossed')} {selectedItems.length != 0 ? `(${t(selectedItems.length != 1 ? 'companies_details.selected_count_other' : 'companies_details.selected_count_one', { count: selectedItems.length })})` : ''}
                    </Text>
                  </View>
                );
              }}

              selectToggleIconComponent={
                <MaterialCommunityIcons name="chevron-down-circle" size={24} color={colors.primary} />
              }
              searchPlaceholderText={t('companies_details.search_villages_placeholder')}
              confirmText={t('shared.confirm')}
              showCancelButton={true}
              styles={{
                chipContainer: { backgroundColor: 'rgba(144, 238, 144, 0.5)' },
                chipText: { color: 'black' },
                selectToggle: {
                  ...stylesCustomDropDow.dropdownStyle,
                  padding: 15, alignContent: 'center', justifyContent: 'center'
                },
                selectToggleText: { ...styles.subTitle, display: 'flex', color: 'black' },
                cancelButton: { backgroundColor: 'red' },
                button: { backgroundColor: '#406b12' }

              }}
            />
            <Text></Text>
          </View>

          <View>
            <Text style={{ ...styles.subTitle }}>{t('companies_details.villages_crossed_count_label')}</Text>
            <TextInput
              disabled={true}
              value={selectedItems.length != 0 ? String(selectedItems.length) : ''}
              keyboardType="numeric"
              placeholder={t('companies_details.villages_crossed_count_label')}
              theme={theme}
              mode="outlined"
            />
            <Text></Text>
          </View>
        </View>}
        {/* End Villages crossed by the structure */}


        


        <View>
          <Text style={[styles.title, { flex: 1 }]}>{t('companies_details.companies_info_title')}</Text>
          <View
            style={{
              borderColor: 'black',
              borderWidth: 1,
              padding: 11
            }}
          >
            {/* Entreprise */}
            <View>

              <View>
                <Text style={{ ...styles.subTitle }}>{t('companies_details.works_company_contract_number_label')}</Text>
                <TextInput
                  disabled={!enableToUpdate}
                  mode="outlined"
                  theme={theme}
                  onChangeText={handle_contract_number_of_work_companies}
                  value={subprojectObject.contract_number_of_work_companies}
                  placeholder={t('companies_details.works_company_contract_number_placeholder')}
                />
                <Text></Text>

                <Text style={{ ...styles.subTitle }}>{t('companies_details.works_company_name_label')}</Text>
                <TextInput
                  disabled={!enableToUpdate}
                  mode="outlined"
                  theme={theme}
                  onChangeText={handle_name_of_the_awarded_company_works_companies}
                  value={subprojectObject.name_of_the_awarded_company_works_companies}
                  placeholder={t('companies_details.company_name_placeholder')}
                />
                <Text></Text>

                <View>
                  <Text style={{ ...styles.subTitle }}>{t('companies_details.works_company_contract_amount_label')}</Text>
                  <TextInput
                    disabled={!enableToUpdate}
                    onChangeText={handle_contract_amount_work_companies}
                    value={subprojectObject?.contract_amount_work_companies?.toString()}
                    keyboardType="numeric"
                    placeholder={t('companies_details.contract_amount_placeholder')}
                    theme={theme}
                    mode="outlined"
                  />
                </View>
                <Text></Text>

                <View>
                  <Text style={{ ...styles.subTitle }}>{t('companies_details.expected_duration_label')}</Text>
                  <TextInput
                    disabled={!enableToUpdate}
                    onChangeText={handle_expected_duration_of_the_work}
                    value={subprojectObject?.expected_duration_of_the_work?.toString()}
                    keyboardType="numeric"
                    placeholder={t('companies_details.expected_duration_placeholder')}
                    theme={theme}
                    mode="outlined"
                  />
                </View>
                <Text></Text>

                <Text style={{ ...styles.subTitle }}>{t('companies_details.works_company_contract_date_label')}</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Button
                    disabled={!enableToUpdate}
                    theme={{ ...theme, colors: { ...theme.colors, primary: 'white' } }}
                    icon="calendar"
                    compact
                    style={{ ...styles.dateBtn }}
                    uppercase={false}
                    labelStyle={{ ...styles.dateBtnLabelStyle }}
                    mode="contained"
                    onPress={showDatePickerContractWorkCompanies}
                  >
                    {subprojectObject.date_signature_contract_work_companies ? moment(subprojectObject.date_signature_contract_work_companies).format('DD-MMMM-YY') : t('companies_details.contract_signature_date_button')}
                  </Button>
                  <Button 
                    compact
                    disabled={!enableToUpdate}
                    theme={theme}
                    labelStyle={{ ...styles.dateBtnLabelStyleToday }}
                    mode="contained"
                    uppercase={false}
                    onPress={() => handleConfirmContractWorkCompanies(new Date())}
                  >
                    {t('shared.today')}
                  </Button>
                </View>
                <DateTimePickerModal
                  isVisible={isDateVisibleContractWorkCompanies}
                  mode="date"
                  onConfirm={handleConfirmContractWorkCompanies}
                  onCancel={hideDatePickerContractWorkCompanies}
                  date={subprojectObject.date_signature_contract_work_companies ? new Date(subprojectObject.date_signature_contract_work_companies) : undefined}
                />
                <Text></Text>

                <Text style={{ ...styles.subTitle }}>{t('companies_details.expected_end_date_label')}</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Button
                    disabled={!enableToUpdate}
                    theme={{ ...theme, colors: { ...theme.colors, primary: 'white' } }}
                    icon="calendar"
                    compact
                    style={{ ...styles.dateBtn }}
                    uppercase={false}
                    labelStyle={{ ...styles.dateBtnLabelStyle }}
                    mode="contained"
                    onPress={showDatePickerEndContract}
                  >
                    {subprojectObject.expected_end_date_of_the_contract ? moment(subprojectObject.expected_end_date_of_the_contract).format('DD-MMMM-YY') : t('companies_details.expected_end_date_button')}
                  </Button>
                  <Button
                    compact
                    disabled={!enableToUpdate}
                    theme={theme}
                    labelStyle={{ ...styles.dateBtnLabelStyleToday }}
                    mode="contained"
                    uppercase={false}
                    onPress={() => handleConfirmEndContract(new Date())}
                  >
                    {t('shared.today')}
                  </Button>
                </View>
                <DateTimePickerModal
                  isVisible={isDateVisibleEndContract}
                  mode="date"
                  onConfirm={handleConfirmEndContract}
                  onCancel={hideDatePickerEndContract}
                  date={subprojectObject.expected_end_date_of_the_contract ? new Date(subprojectObject.expected_end_date_of_the_contract) : undefined}
                />
                <Text></Text>
              </View>


              <View>
                <Text style={{ ...styles.subTitle }}>{t('companies_details.efme_company_name_label')}</Text>
                <TextInput
                  disabled={!enableToUpdate}
                  mode="outlined"
                  theme={theme}
                  onChangeText={handle_name_of_company_awarded_efme}
                  value={subprojectObject.name_of_company_awarded_efme}
                  placeholder={t('companies_details.company_name_placeholder')}
                />
                <Text></Text>

                <View>
                  <Text style={{ ...styles.subTitle }}>{t('companies_details.efme_contract_amount_label')}</Text>
                  <TextInput
                    disabled={!enableToUpdate}
                    onChangeText={handle_contract_companies_amount_for_efme}
                    value={subprojectObject?.contract_companies_amount_for_efme?.toString()}
                    keyboardType="numeric"
                    placeholder={t('companies_details.contract_amount_placeholder')}
                    theme={theme}
                    mode="outlined"
                  />
                </View>
                <Text></Text>

                <Text style={{ ...styles.subTitle }}>{t('companies_details.efme_contract_date_label')}</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Button
                    disabled={!enableToUpdate}
                    theme={{ ...theme, colors: { ...theme.colors, primary: 'white' } }}
                    icon="calendar"
                    compact
                    style={{ ...styles.dateBtn }}
                    uppercase={false}
                    labelStyle={{ ...styles.dateBtnLabelStyle }}
                    mode="contained"
                    onPress={showDatePickerContract_efme}
                  >
                    {subprojectObject.date_signature_contract_efme ? moment(subprojectObject.date_signature_contract_efme).format('DD-MMMM-YY') : t('companies_details.contract_signature_date_button')}
                  </Button>
                  <Button
                    compact
                    disabled={!enableToUpdate}
                    theme={theme}
                    labelStyle={{ ...styles.dateBtnLabelStyleToday }}
                    mode="contained"
                    uppercase={false}
                    onPress={() => handleConfirmContract_efme(new Date())}
                  >
                    {t('shared.today')}
                  </Button>
                </View>
                <DateTimePickerModal
                  isVisible={isDateVisibleContract_efme}
                  mode="date"
                  onConfirm={handleConfirmContract_efme}
                  onCancel={hideDatePickerContract_efme}
                  date={subprojectObject.date_signature_contract_efme ? new Date(subprojectObject.date_signature_contract_efme) : undefined}
                />
                <Text></Text>
              </View>

            </View>
            {/* End Entreprise */}

            {/* SUPPLEMENTAIRE */}
            <View>
              <Text style={{ ...styles.subTitle }}>{t('companies_details.btp_supervisors_contract_date_label')}</Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Button
                  disabled={!enableToUpdate}
                  theme={{ ...theme, colors: { ...theme.colors, primary: 'white' } }}
                  icon="calendar"
                  compact
                  style={{ ...styles.dateBtn }}
                  uppercase={false}
                  labelStyle={{ ...styles.dateBtnLabelStyle }}
                  mode="contained"
                  onPress={showDatePickerSupervisorsBTP}
                >
                  {subprojectObject.date_of_signature_of_contract_for_construction_supervisors ? moment(subprojectObject.date_of_signature_of_contract_for_construction_supervisors).format('DD-MMMM-YY') : t('companies_details.contract_signature_date_button')}
                </Button>
                <Button
                  compact
                  disabled={!enableToUpdate}
                  theme={theme}
                  labelStyle={{ ...styles.dateBtnLabelStyleToday }}
                  mode="contained"
                  uppercase={false}
                  onPress={() => handleConfirmSupervisorsBTP(new Date())}
                >
                  {t('shared.today')}
                </Button>
              </View>
              <DateTimePickerModal
                isVisible={isDateVisibleSupervisorsBTP}
                mode="date"
                onConfirm={handleConfirmSupervisorsBTP}
                onCancel={hideDatePickerSupervisorsBTP}
                date={subprojectObject.date_of_signature_of_contract_for_construction_supervisors ? new Date(subprojectObject.date_of_signature_of_contract_for_construction_supervisors) : undefined}
              />
              <Text></Text>

              <Text style={{ ...styles.subTitle }}>{t('companies_details.ses_supervisors_contract_date_label')}</Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Button
                  disabled={!enableToUpdate}
                  theme={{ ...theme, colors: { ...theme.colors, primary: 'white' } }}
                  icon="calendar"
                  compact
                  style={{ ...styles.dateBtn }}
                  uppercase={false}
                  labelStyle={{ ...styles.dateBtnLabelStyle }}
                  mode="contained"
                  onPress={showDatePickerSupervisorsSES}
                >
                  {subprojectObject.date_signature_contract_controllers_in_SES ? moment(subprojectObject.date_signature_contract_controllers_in_SES).format('DD-MMMM-YY') : t('companies_details.contract_signature_date_button')}
                </Button>
                <Button
                  compact
                  disabled={!enableToUpdate}
                  theme={theme}
                  labelStyle={{ ...styles.dateBtnLabelStyleToday }}
                  mode="contained"
                  uppercase={false}
                  onPress={() => handleConfirmSupervisorsSES(new Date())}
                >
                  {t('shared.today')}
                </Button>
              </View>
              <DateTimePickerModal
                isVisible={isDateVisibleSupervisorsSES}
                mode="date"
                onConfirm={handleConfirmSupervisorsSES}
                onCancel={hideDatePickerSupervisorsSES}
                date={subprojectObject.date_signature_contract_controllers_in_SES ? new Date(subprojectObject.date_signature_contract_controllers_in_SES) : undefined}
              />
              <Text></Text>

              <Text style={{ ...styles.subTitle }}>{t('companies_details.site_launch_date_label')}</Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Button
                  disabled={!enableToUpdate}
                  theme={{ ...theme, colors: { ...theme.colors, primary: 'white' } }}
                  icon="calendar"
                  compact
                  style={{ ...styles.dateBtn }}
                  uppercase={false}
                  labelStyle={{ ...styles.dateBtnLabelStyle }}
                  mode="contained"
                  onPress={showDatePickerLaunchSite}
                >
                  {subprojectObject.launch_date_of_the_construction_site_in_the_village ? moment(subprojectObject.launch_date_of_the_construction_site_in_the_village).format('DD-MMMM-YY') : t('companies_details.contract_signature_date_button')}
                </Button>
                <Button
                  compact
                  disabled={!enableToUpdate}
                  theme={theme}
                  labelStyle={{ ...styles.dateBtnLabelStyleToday }}
                  mode="contained"
                  uppercase={false}
                  onPress={() => handleConfirmLaunchSite(new Date())}
                >
                  {t('shared.today')}
                </Button>
              </View>
              <DateTimePickerModal
                isVisible={isDateVisibleLaunchSite}
                mode="date"
                onConfirm={handleConfirmLaunchSite}
                onCancel={hideDatePickerLaunchSite}
                date={subprojectObject.launch_date_of_the_construction_site_in_the_village ? new Date(subprojectObject.launch_date_of_the_construction_site_in_the_village) : undefined}
              />
              <Text></Text>

            </View>
            {/* End SUPPLEMENTAIRE */}
          </View>
        </View>

        <View>
          <Button
            // disabled={escalateComment === ''}
            theme={theme}
            style={{ alignSelf: 'center', margin: 24 }}
            labelStyle={{ color: 'white', fontFamily: 'Poppins_500Medium' }}
            mode="contained"
            onPress={() => { saveSubproject(); }}
            loading={isSaving}
            disabled={isSaving || !enableToUpdate}
          >
            {isSaving ? t('shared.saving_in_progress') : t('common:save')}
          </Button>
        </View>


      </View>

    </KeyboardAvoidingView>
    // </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    flex: 1,
    padding: 1,
    marginVertical: 8,
    marginHorizontal: 23,
    borderBottomWidth: 1,
    borderColor: '#f6f6f6',
  },
  title: {
    fontFamily: 'Poppins_500Medium',
    // fontSize: 12,
    fontWeight: 'normal',
    fontStyle: 'normal',
    // lineHeight: 10,
    letterSpacing: 0,
    // textAlign: "left",
    color: '#707070',
  },
  subTitle: {
    fontFamily: 'Poppins_300Light',
    fontSize: 12,
    fontWeight: 'normal',
    fontStyle: 'normal',
    // lineHeight: 10,
    letterSpacing: 0,
    // textAlign: "left",
    color: '#707070',
  },
  statisticsText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    fontWeight: 'bold',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#707070',
  },
  root: {
    justifyContent: "center",
    alignItems: "center",
  },
  titleSearch: {
    width: "100%",
    marginTop: 20,
    fontSize: 25,
    fontWeight: "bold",
    marginLeft: "10%",
  },
  radioLabel: {
    fontFamily: "Poppins_400Regular",
    fontWeight: "normal",
    fontStyle: "normal",
    lineHeight: 18,
    letterSpacing: 0,
    textAlign: "left",
    color: "#707070",
  },
  stepNote: {
    fontFamily: "Poppins_400Regular",
    marginVertical: 5,
    fontSize: 10,
    fontWeight: "normal",
    fontStyle: "normal",
    lineHeight: 14,
    letterSpacing: 0,
    textAlign: "left",
    color: "#707070",
  },
  dateBtn: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
    flex: 1,
    marginHorizontal: 10,
  },
  dateBtnLabelStyle: {
    color: colors.primary,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
  },
  dateBtnLabelStyleToday: {
    color: 'white',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
  }
});

export default Content;