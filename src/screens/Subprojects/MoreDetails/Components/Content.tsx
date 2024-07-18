import React, { useEffect, useState } from 'react';
import Timeline from 'react-native-timeline-flatlist'
import { Image, TouchableOpacity, StatusBar, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, View, useToast } from 'native-base';
import { AntDesign } from '@expo/vector-icons';
import { Button, Dialog, Paragraph, Portal, TextInput, RadioButton, Checkbox } from 'react-native-paper';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useNavigation } from '@react-navigation/native';
import SelectBox from 'react-native-multi-selectbox'
import { xorBy } from 'lodash'
import moment from 'moment';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Subproject } from '../../../../models/subprojects/Subproject';
import { colors } from '../../../../utils/colors';
import CustomDropDownPickerWithRender from '../../../../components/CustomDropDownPicker/CustomDropDownPickerWithRender';
import SubprojectAPI from '../../../../services/subprojects/subprojects';
import { return_numbers_only, convert_object_to_id } from '../../../../utils/functions';
import AttachmentsComponent from "../../../../components/AttachmentsComponent";
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

const Content = ({ subproject, priorities, administrativelevels, onRefresh }: { subproject: Subproject, priorities: any, administrativelevels: Array<AdministrativeLevel>, onRefresh: () => void; }) => {
  const [subprojectObject, setSubprojectObject]: any = useState(subproject);
  const [donations, setDonations] = useState(DONATIONS ?? []);
  const K_OPTIONS = administrativelevels.map((item: AdministrativeLevel) => {
    return { name: `${item.name} (${item.parent?.name})`, id: item.id }
  });

  const navigation = useNavigation();
  const toast = useToast();
  const [pickerDonation, setPickerDonation] = useState(subproject.level_of_achievement_donation_certificate ?
    subproject.level_of_achievement_donation_certificate
    : null);

  const [hasLatrineBlocs, setHasLatrineBlocs] = useState(subproject.has_latrine_blocs ?? false);
  const [hasFences, setHasFences] = useState(subproject.has_fence ?? false);
  const [womenGroup, setWomenGroup] = useState(subproject.women_s_group ?? false);
  const [youthGroup, setYouthGroup] = useState(subproject.youth_group ?? false);
  const [breedersFarmersGroup, setBreedersFarmersGroup] = useState(subproject.breeders_farmers_group ?? false);
  const [ethnicMinorityGroup, setEthnicMinorityGroup] = useState(subproject.ethnic_minority_group ?? false);
  const [selectedItems, setSelectedItems]: any = useState(subproject.list_of_villages_crossed_by_the_track_or_electrification ? subproject.list_of_villages_crossed_by_the_track_or_electrification.map((item: any) => item.id) : []);

  const [isSaving, setIsSaving] = useState(false);

  const [priority, setPriority]: any = useState(null);
  const [K_OPTIONS_PRIORITES, set_K_OPTIONS_PRIORITES]: any = useState(priorities.map((item: any, index: any) => {
    return { name: `${item.priorite} (${moneyFormat(item.coutEstime)})`, id: item.priorite }
  }));

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

  const handle_distance_covered_by_streetlights = (text: any) => {
    setSubprojectObject({ ...subprojectObject, distance_covered_by_streetlights: return_numbers_only(text) });
  };

  const handle_number_of_streetlights = (text: any) => {
    setSubprojectObject({ ...subprojectObject, number_of_streetlights: return_numbers_only(text) });
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

  const handle_full_title_of_approved_subproject = (text: any) => {
    setSubprojectObject({ ...subprojectObject, full_title_of_approved_subproject: text });
  };


  const check_is_its_fields = (elements: Array<string>) => {
    return elements.findIndex((item: string) => {
      return (subproject.type_of_subproject ?? "").startsWith(item);
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
      level_of_achievement_donation_certificate: pickerDonation,
      priority: priority
    });

    subprojectObject.list_of_villages_crossed_by_the_track_or_electrification = adls;
    subprojectObject.level_of_achievement_donation_certificate = pickerDonation;
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
      password: JSON.parse(await getData('password'))
    })
      .then(async (reponse: any) => {
        if (reponse.error) {
          return;
        }
        onRefresh();
      });

    setIsSaving(false);


  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null}>

        <View>

          <View>
            <View style={{ ...stylesCustomDropDow.dropdownWrapper, zIndex: 1000 }}>
              <Text style={{ ...styles.subTitle }}>Priorité reliant au sous-projet</Text>
              <SectionedMultiSelect
                single={true}
                items={K_OPTIONS_PRIORITES}
                IconRenderer={Icon}
                uniqueKey="id"
                selectedItems={priority ? [priority.priorite] : []}
                onSelectedItemsChange={(val: any) => {
                  let l = priorities.find((elt: any) => val && elt.priorite === val[0]);
                  setPriority(l);
                }}
                renderSelectText={() => {
                  return (
                    <View>
                      <Text style={{ ...styles.subTitle, color: 'black' }}>
                        {(priority) ? `${priority.priorite} (${moneyFormat(priority.coutEstime)})` : `Choisissez la priorité reliant à ce sous-projet`}
                      </Text>
                    </View>
                  );
                }}

                selectToggleIconComponent={() => (
                  <MaterialCommunityIcons name="chevron-down-circle" size={24} color={colors.primary} />
                )}
                searchPlaceholderText="Rechercher un lieu..."
                confirmText="Confirmer"
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
          </View>



          <View>
            <Text style={{ ...styles.subTitle }}>Intitulé du sous-projet (Ceci doit décrire exactement l'intitulé du sous-projet pas celui de l'ouvrage seulement)</Text>
            <TextInput
              onChangeText={handle_full_title_of_approved_subproject}
              value={subprojectObject?.full_title_of_approved_subproject}
              placeholder="Intitulé du sous-projet"
              theme={theme}
              mode="outlined"
              multiline
            />
            <Text></Text>
          </View>


          {/* Forage */}
          {(check_is_its_fields(["Forage Photovoltaïque", "Pompe à motricité humaine"])) && <View>
            <View>
              <Text style={{ ...styles.subTitle }}>Profondeur du forage (m)</Text>
              <TextInput
                onChangeText={handle_depth_of_drilling}
                value={subprojectObject?.depth_of_drilling?.toString()}
                keyboardType="numeric"
                placeholder="Profondeur du forage (m)"
                theme={theme}
                mode="outlined"
              />
              <Text></Text>
            </View>

            <View>
              <Text style={{ ...styles.subTitle }}>Débit du forage (m3)</Text>
              <TextInput
                onChangeText={handle_drilling_flow_rate}
                value={subprojectObject?.drilling_flow_rate?.toString()}
                keyboardType="numeric"
                placeholder="Débit du forage (m3)"
                theme={theme}
                mode="outlined"
              />
              <Text></Text>
            </View>
          </View>}
          {/* End Forage */}

          {/* School */}
          {(check_is_its_fields(["Bâtiment Scolaire"])) && <View>
            <View>
              <Text style={{ ...styles.subTitle }}>Nombre de salle de classes</Text>
              <TextInput
                onChangeText={handle_number_of_classrooms}
                value={subprojectObject?.number_of_classrooms?.toString()}
                keyboardType="numeric"
                placeholder="Nombre de salle de classes"
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
              <Text style={{ ...styles.subTitle }}>Capacité de stockage (Tonne)</Text>
              <TextInput
                onChangeText={handle_storage_capacity}
                value={subprojectObject?.storage_capacity?.toString()}
                keyboardType="numeric"
                placeholder="Capacité de stockage (Tonne)"
                theme={theme}
                mode="outlined"
              />
              <Text></Text>
            </View>
          </View>}
          {/* End Magasin */}

          {/* Track */}
          {(check_is_its_fields(["Piste/OF"])) && <View>
            <View>
              <Text style={{ ...styles.subTitle }}>Longueur de la piste (km)</Text>
              <TextInput
                onChangeText={handle_length_of_the_track}
                value={subprojectObject?.length_of_the_track?.toString()}
                keyboardType="numeric"
                placeholder="Longueur de la piste (km)"
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
              <Text style={{ ...styles.subTitle }}>Longueur de l'extension (km)</Text>
              <TextInput
                onChangeText={handle_extension_length}
                value={subprojectObject?.extension_length?.toString()}
                keyboardType="numeric"
                placeholder="Longueur de l'extension (km)"
                theme={theme}
                mode="outlined"
              />
              <Text></Text>
            </View>
          </View>}
          {/* End Extension */}

          {/* Streetlights */}
          {(check_is_its_fields(["Lampadaires "])) && <View>
            <View>
              <Text style={{ ...styles.subTitle }}>Distance couverte par les lampadaires (km)</Text>
              <TextInput
                onChangeText={handle_distance_covered_by_streetlights}
                value={subprojectObject?.distance_covered_by_streetlights?.toString()}
                keyboardType="numeric"
                placeholder="Distance couverte par les lampadaires (km)"
                theme={theme}
                mode="outlined"
              />
              <Text></Text>
            </View>

            <View>
              <Text style={{ ...styles.subTitle }}>Nombre de lampadaires installés</Text>
              <TextInput
                onChangeText={handle_number_of_streetlights}
                value={subprojectObject?.number_of_streetlights?.toString()}
                keyboardType="numeric"
                placeholder="Nombre de lampadaires installés"
                theme={theme}
                mode="outlined"
              />
              <Text></Text>
            </View>
          </View>}
          {/* End Streetlights */}

          {/* Block latrines */}
          {/* {(check_is_its_fields(["Maison des jeunes", "Centre Communautaire", "Bâtiment Scolaire ", "CMS", "CHP", "USP", "Pharmacie", "Pédiatrie", "Laboratoire", "Salle de réunion", "Terrain de Foot"])) && <View>
            <View
              style={{
                flexDirection: 'row',
                paddingHorizontal: 5,
                paddingBottom: 10,
                alignItems: 'center',
              }}
            >
              <Checkbox.Android
                color={colors.primary}
                status={hasLatrineBlocs ? 'checked' : 'unchecked'}
                onPress={() => {
                  if (hasLatrineBlocs) {
                    setSubprojectObject({
                      ...subprojectObject,
                      number_of_latrine_blocks: null,
                      has_latrine_blocs: null
                    });
                  } else {
                    setSubprojectObject({ ...subprojectObject, has_latrine_blocs: !hasLatrineBlocs });
                  }
                  setHasLatrineBlocs(!hasLatrineBlocs);
                }}
              />
              <Text style={[styles.title, { flex: 1 }]}>Cet ouvrage dispose-t-il de blocs latrine ?</Text>
            </View>

            {hasLatrineBlocs && <View>
              <Text style={{ ...styles.subTitle }}>Nombre de blocs latrine (de 3 cabines)</Text>
              <TextInput
                onChangeText={handle_number_of_latrine_blocks}
                value={subprojectObject?.number_of_latrine_blocks?.toString()}
                keyboardType="numeric"
                placeholder="Nombre de blocs latrine (de 3 cabines)"
                theme={theme}
                mode="outlined"
              />
              <Text></Text>
            </View>}
          </View>} */}
          {(check_is_its_fields(["Blocs de latrines dans les établissements scolaires"])) && <View>

            {hasLatrineBlocs && <View>
              <Text style={{ ...styles.subTitle }}>Nombre de blocs latrine (de 3 cabines)</Text>
              <TextInput
                onChangeText={handle_number_of_latrine_blocks}
                value={subprojectObject?.number_of_latrine_blocks?.toString()}
                keyboardType="numeric"
                placeholder="Nombre de blocs latrine (de 3 cabines)"
                theme={theme}
                mode="outlined"
              />
              <Text></Text>
            </View>}
          </View>}
          {/* End Block latrines */}

          {/* Block Fences */}
          {/* {(check_is_its_fields(["Maison des jeunes", "Centre Communautaire", "Bâtiment Scolaire ", "CMS", "CHP", "USP", "Pharmacie", "Pédiatrie", "Laboratoire", "Salle de réunion", "Terrain de Foot"])) && <View>
            <View
              style={{
                flexDirection: 'row',
                paddingHorizontal: 5,
                paddingBottom: 10,
                alignItems: 'center',
              }}
            >
              <Checkbox.Android
                color={colors.primary}
                status={hasFences ? 'checked' : 'unchecked'}
                onPress={() => {
                  setSubprojectObject({ ...subprojectObject, has_fence: !hasFences });
                  setHasFences(!hasFences);
                }}
              />
              <Text style={[styles.title, { flex: 1 }]}>Cet ouvrage est-il clôturé ?</Text>
            </View>
          </View>} */}
          {/* End Fences */}


          <View>
            <Text style={{ ...styles.subTitle }}>Niveau d'obtention de l'attestation de donation</Text>
            <View style={{ zIndex: 1000 }}>
              <CustomDropDownPickerWithRender
                schema={{
                  id: 'label',
                  label: 'label',
                  value: 'value',
                }}
                // renderItem={renderItem}
                placeholder={"Niveau d'obtention de l'attestation de donation"}
                value={pickerDonation}
                items={donations}
                setPickerValue={setPickerDonation}
                setItems={setDonations}

              />
            </View>
          </View>


          {/* Villages crossed by the structure */}
          {(check_is_its_fields(["Extension réseau ", "Lampadaires ", "Piste/OF"])) && <View>
            <View style={{ ...stylesCustomDropDow.dropdownWrapper, zIndex: 1000 }}>
              <SectionedMultiSelect
                items={K_OPTIONS}
                IconRenderer={Icon}
                uniqueKey="id"
                onSelectedItemsChange={setSelectedItems}
                selectedItems={selectedItems}
                renderSelectText={() => {
                  return (
                    <View>
                      <Text style={{ ...styles.subTitle, color: 'black' }}>
                        Choisissez les villages traversés par l'ouvrage {selectedItems.length != 0 ? `(${selectedItems.length} sélectionné${selectedItems.length != 1 ? 's' : ''})` : ''}
                      </Text>
                    </View>
                  );
                }}

                selectToggleIconComponent={() => (
                  <MaterialCommunityIcons name="chevron-down-circle" size={24} color={colors.primary} />
                )}
                searchPlaceholderText="Rechercher des villages..."
                confirmText="Confirmer"
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
              <Text style={{ ...styles.subTitle }}>Nombre de villages traversés par l'ouvrage</Text>
              <TextInput
                disabled={true}
                value={selectedItems.length != 0 ? String(selectedItems.length) : ''}
                keyboardType="numeric"
                placeholder="Nombre de villages traversés par l'ouvrage"
                theme={theme}
                mode="outlined"
              />
              <Text></Text>
            </View>
          </View>}
          {/* End Villages crossed by the structure */}


          {/* Groups who are choose this subproject */}
          <View>
            <Text style={[styles.title, { flex: 1 }]}>Cet ouvrage est-il choisi par les groupes suivants ?</Text>
            <View
              style={{
                marginLeft: 11,
              }}
            >

              <View
                style={{
                  flexDirection: 'row',
                  paddingHorizontal: 5,
                  paddingBottom: 10,
                  alignItems: 'center',
                }}
              >
                <Checkbox.Android
                  color={colors.primary}
                  status={womenGroup ? 'checked' : 'unchecked'}
                  onPress={() => {
                    setSubprojectObject({ ...subprojectObject, women_s_group: !womenGroup });
                    setWomenGroup(!womenGroup);
                  }}
                />
                <Text style={[styles.title, { flex: 1 }]}>Groupe des femmes ?</Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  paddingHorizontal: 5,
                  paddingBottom: 10,
                  alignItems: 'center',
                }}
              >
                <Checkbox.Android
                  color={colors.primary}
                  status={youthGroup ? 'checked' : 'unchecked'}
                  onPress={() => {
                    setSubprojectObject({ ...subprojectObject, youth_group: !youthGroup });
                    setYouthGroup(!youthGroup);
                  }}
                />
                <Text style={[styles.title, { flex: 1 }]}>Groupe des jeunes</Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  paddingHorizontal: 5,
                  paddingBottom: 10,
                  alignItems: 'center',
                }}
              >
                <Checkbox.Android
                  color={colors.primary}
                  status={breedersFarmersGroup ? 'checked' : 'unchecked'}
                  onPress={() => {
                    setSubprojectObject({ ...subprojectObject, breeders_farmers_group: !breedersFarmersGroup });
                    setBreedersFarmersGroup(!breedersFarmersGroup);
                  }}
                />
                <Text style={[styles.title, { flex: 1 }]}>Groupe des éleveurs/Agriculteurs</Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  paddingHorizontal: 5,
                  paddingBottom: 10,
                  alignItems: 'center',
                }}
              >
                <Checkbox.Android
                  color={colors.primary}
                  status={ethnicMinorityGroup ? 'checked' : 'unchecked'}
                  onPress={() => {
                    setSubprojectObject({ ...subprojectObject, ethnic_minority_group: !ethnicMinorityGroup });
                    setEthnicMinorityGroup(!ethnicMinorityGroup);
                  }}
                />
                <Text style={[styles.title, { flex: 1 }]}>Groupe des minorités ethniques</Text>
              </View>

            </View>

          </View>
          {/* End Groups who are choose this subproject */}

          <View>
            <Button
              // disabled={escalateComment === ''}
              theme={theme}
              style={{ alignSelf: 'center', marginBottom: 35 }}
              labelStyle={{ color: 'white', fontFamily: 'Poppins_500Medium' }}
              mode="contained"
              onPress={() => { saveSubproject(); }}
              loading={isSaving}
              disabled={isSaving}
            >
              {isSaving ? 'Enregistrement en cours' : `Sauvegarder`}
            </Button>
          </View>



          <View>
            <Text style={[styles.title, { flex: 1 }]}>Informations liées aux entreprises</Text>
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
                  <Text style={{ ...styles.subTitle }}>N° du contrat de l'entreprise de travaux (ET)</Text>
                  <TextInput
                    mode="outlined"
                    theme={theme}
                    onChangeText={handle_contract_number_of_work_companies}
                    value={subprojectObject.contract_number_of_work_companies}
                    placeholder="N° contrat entreprises de travaux (ET)"
                  />
                  <Text></Text>

                  <Text style={{ ...styles.subTitle }}>Nom de l'entreprise attributaire (Entreprise de travaux (ET))</Text>
                  <TextInput
                    mode="outlined"
                    theme={theme}
                    onChangeText={handle_name_of_the_awarded_company_works_companies}
                    value={subprojectObject.name_of_the_awarded_company_works_companies}
                    placeholder="Nom de l'entreprise"
                  />
                  <Text></Text>

                  <View>
                    <Text style={{ ...styles.subTitle }}>Montant du contrat (Entreprise de travaux (ET))</Text>
                    <TextInput
                      onChangeText={handle_contract_amount_work_companies}
                      value={subprojectObject?.contract_amount_work_companies?.toString()}
                      keyboardType="numeric"
                      placeholder="Montant du contrat"
                      theme={theme}
                      mode="outlined"
                    />
                  </View>
                  <Text></Text>

                  <View>
                    <Text style={{ ...styles.subTitle }}>Durée prevue de realisation des travaux (mois)</Text>
                    <TextInput
                      onChangeText={handle_expected_duration_of_the_work}
                      value={subprojectObject?.expected_duration_of_the_work?.toString()}
                      keyboardType="numeric"
                      placeholder="Durée prevue"
                      theme={theme}
                      mode="outlined"
                    />
                  </View>
                  <Text></Text>

                  <Text style={{ ...styles.subTitle }}>Date de signature du contrat (Entreprise de travaux (ET))</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Button
                      theme={{ ...theme, colors: { ...theme.colors, primary: 'white' } }}
                      icon="calendar"
                      compact
                      style={{ ...styles.dateBtn }}
                      uppercase={false}
                      labelStyle={{ ...styles.dateBtnLabelStyle }}
                      mode="contained"
                      onPress={showDatePickerContractWorkCompanies}
                    >
                      {subprojectObject.date_signature_contract_work_companies ? moment(subprojectObject.date_signature_contract_work_companies).format('DD-MMMM-YY') : "Date signature contrat"}
                    </Button>
                    <Button
                      compact
                      theme={theme}
                      labelStyle={{ ...styles.dateBtnLabelStyleToday }}
                      mode="contained"
                      uppercase={false}
                      onPress={() => handleConfirmContractWorkCompanies(new Date())}
                    >
                      {"Aujourd'hui"}
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

                  <Text style={{ ...styles.subTitle }}>Date prevue de fin du contrat (Entreprise de travaux (ET))</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Button
                      theme={{ ...theme, colors: { ...theme.colors, primary: 'white' } }}
                      icon="calendar"
                      compact
                      style={{ ...styles.dateBtn }}
                      uppercase={false}
                      labelStyle={{ ...styles.dateBtnLabelStyle }}
                      mode="contained"
                      onPress={showDatePickerEndContract}
                    >
                      {subprojectObject.expected_end_date_of_the_contract ? moment(subprojectObject.expected_end_date_of_the_contract).format('DD-MMMM-YY') : "Date prevue de fin du contrat"}
                    </Button>
                    <Button
                      compact
                      theme={theme}
                      labelStyle={{ ...styles.dateBtnLabelStyleToday }}
                      mode="contained"
                      uppercase={false}
                      onPress={() => handleConfirmEndContract(new Date())}
                    >
                      {"Aujourd'hui"}
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
                  <Text style={{ ...styles.subTitle }}>Nom de l'entreprise attributaire (Entreprise de fourniture de mobiliers et equipements (EFME))</Text>
                  <TextInput
                    mode="outlined"
                    theme={theme}
                    onChangeText={handle_name_of_company_awarded_efme}
                    value={subprojectObject.name_of_company_awarded_efme}
                    placeholder="Nom de l'entreprise"
                  />
                  <Text></Text>

                  <View>
                    <Text style={{ ...styles.subTitle }}>Montant du contrat (Entreprise de fourniture de mobiliers et equipements (EFME))</Text>
                    <TextInput
                      onChangeText={handle_contract_companies_amount_for_efme}
                      value={subprojectObject?.contract_companies_amount_for_efme?.toString()}
                      keyboardType="numeric"
                      placeholder="Montant du contrat"
                      theme={theme}
                      mode="outlined"
                    />
                  </View>
                  <Text></Text>

                  <Text style={{ ...styles.subTitle }}>Date de signature du contrat (Entreprise de fourniture de mobiliers et equipements (EFME))</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Button
                      theme={{ ...theme, colors: { ...theme.colors, primary: 'white' } }}
                      icon="calendar"
                      compact
                      style={{ ...styles.dateBtn }}
                      uppercase={false}
                      labelStyle={{ ...styles.dateBtnLabelStyle }}
                      mode="contained"
                      onPress={showDatePickerContract_efme}
                    >
                      {subprojectObject.date_signature_contract_efme ? moment(subprojectObject.date_signature_contract_efme).format('DD-MMMM-YY') : "Date signature contrat"}
                    </Button>
                    <Button
                      compact
                      theme={theme}
                      labelStyle={{ ...styles.dateBtnLabelStyleToday }}
                      mode="contained"
                      uppercase={false}
                      onPress={() => handleConfirmContract_efme(new Date())}
                    >
                      {"Aujourd'hui"}
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
                <Text style={{ ...styles.subTitle }}>Date de signature du contrat (Controleurs de travaux BTP (CT))</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Button
                    theme={{ ...theme, colors: { ...theme.colors, primary: 'white' } }}
                    icon="calendar"
                    compact
                    style={{ ...styles.dateBtn }}
                    uppercase={false}
                    labelStyle={{ ...styles.dateBtnLabelStyle }}
                    mode="contained"
                    onPress={showDatePickerSupervisorsBTP}
                  >
                    {subprojectObject.date_of_signature_of_contract_for_construction_supervisors ? moment(subprojectObject.date_of_signature_of_contract_for_construction_supervisors).format('DD-MMMM-YY') : "Date signature contrat"}
                  </Button>
                  <Button
                    compact
                    theme={theme}
                    labelStyle={{ ...styles.dateBtnLabelStyleToday }}
                    mode="contained"
                    uppercase={false}
                    onPress={() => handleConfirmSupervisorsBTP(new Date())}
                  >
                    {"Aujourd'hui"}
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

                <Text style={{ ...styles.subTitle }}>Date de signature du contrat (Controleurs en SES (CSES))</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Button
                    theme={{ ...theme, colors: { ...theme.colors, primary: 'white' } }}
                    icon="calendar"
                    compact
                    style={{ ...styles.dateBtn }}
                    uppercase={false}
                    labelStyle={{ ...styles.dateBtnLabelStyle }}
                    mode="contained"
                    onPress={showDatePickerSupervisorsSES}
                  >
                    {subprojectObject.date_signature_contract_controllers_in_SES ? moment(subprojectObject.date_signature_contract_controllers_in_SES).format('DD-MMMM-YY') : "Date signature contrat"}
                  </Button>
                  <Button
                    compact
                    theme={theme}
                    labelStyle={{ ...styles.dateBtnLabelStyleToday }}
                    mode="contained"
                    uppercase={false}
                    onPress={() => handleConfirmSupervisorsSES(new Date())}
                  >
                    {"Aujourd'hui"}
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

                <Text style={{ ...styles.subTitle }}>Date de lancement du chantier dans le village (date notification de l'ordre de service)</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Button
                    theme={{ ...theme, colors: { ...theme.colors, primary: 'white' } }}
                    icon="calendar"
                    compact
                    style={{ ...styles.dateBtn }}
                    uppercase={false}
                    labelStyle={{ ...styles.dateBtnLabelStyle }}
                    mode="contained"
                    onPress={showDatePickerLaunchSite}
                  >
                    {subprojectObject.launch_date_of_the_construction_site_in_the_village ? moment(subprojectObject.launch_date_of_the_construction_site_in_the_village).format('DD-MMMM-YY') : "Date signature contrat"}
                  </Button>
                  <Button
                    compact
                    theme={theme}
                    labelStyle={{ ...styles.dateBtnLabelStyleToday }}
                    mode="contained"
                    uppercase={false}
                    onPress={() => handleConfirmLaunchSite(new Date())}
                  >
                    {"Aujourd'hui"}
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
              disabled={isSaving}
            >
              {isSaving ? 'Enregistrement en cours' : `Sauvegarder`}
            </Button>
          </View>
        </View>

      </KeyboardAvoidingView>
    </ScrollView>
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