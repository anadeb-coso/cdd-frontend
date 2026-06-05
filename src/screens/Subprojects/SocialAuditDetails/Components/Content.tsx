import React, { useEffect, useState } from 'react';
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

const Content = ({ subproject, onRefresh, enableToUpdate }: { subproject: Subproject, onRefresh: () => void; enableToUpdate: boolean }) => {
  const [subprojectObject, setSubprojectObject]: any = useState(subproject);

  // const navigation = useNavigation();
  // const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Date

  const [isDateVisibleAuditSocial, setIsDateVisibleAuditSocial] = useState(false);
  const handleConfirmAuditSocial = (_date: any) => {
    setSubprojectObject({ ...subprojectObject, date_of_organization_of_the_social_audit: _date });
    hideDatePickerAuditSocial();
  };
  const hideDatePickerAuditSocial = () => {
    setIsDateVisibleAuditSocial(false);
  }; const showDatePickerAuditSocial = () => {
    setIsDateVisibleAuditSocial(true);
  };

  // End Date


  const handle_number_of_participants_m_in_the_social_audit = (text: any) => {
    let n_v = return_numbers_only(text);
    setSubprojectObject({ 
      ...subprojectObject, 
      number_of_participants_m_in_the_social_audit: n_v,
      number_of_participants_t_in_the_social_audit: n_v + (subprojectObject?.number_of_participants_w_in_the_social_audit ?? 0)
    });
  };

  const handle_number_of_participants_w_in_the_social_audit = (text: any) => {
    let n_v = return_numbers_only(text);
    setSubprojectObject({ 
      ...subprojectObject, 
      number_of_participants_w_in_the_social_audit: n_v,
      number_of_participants_t_in_the_social_audit: n_v + (subprojectObject?.number_of_participants_m_in_the_social_audit ?? 0)
    });
  };

  useEffect(() => {

  }, []);


  const saveSubproject = async () => {
    setIsSaving(true);

    setSubprojectObject({
      ...subprojectObject
    });

    try {
      subprojectObject.date_of_organization_of_the_social_audit = subprojectObject.date_of_organization_of_the_social_audit ? subprojectObject.date_of_organization_of_the_social_audit.toISOString().split('T')[0] : undefined;
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
          <Text style={[styles.title, { flex: 1 }]}>Informations liées au audit social</Text>
          <View
            style={{
              borderColor: 'black',
              borderWidth: 1,
              padding: 11
            }}
          >
            <Text style={{ ...styles.subTitle }}>Date d'organisation de l'audit social</Text>
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
                onPress={showDatePickerAuditSocial}
              >
                {subprojectObject.date_of_organization_of_the_social_audit ? moment(subprojectObject.date_of_organization_of_the_social_audit).format('DD-MMMM-YY') : "Date l'audit social"}
              </Button>
              <Button
                compact
                disabled={!enableToUpdate}
                theme={theme}
                labelStyle={{ ...styles.dateBtnLabelStyleToday }}
                mode="contained"
                uppercase={false}
                onPress={() => handleConfirmAuditSocial(new Date())}
              >
                {"Aujourd'hui"}
              </Button>
            </View>
            <DateTimePickerModal
              isVisible={isDateVisibleAuditSocial}
              mode="date"
              onConfirm={handleConfirmAuditSocial}
              onCancel={hideDatePickerAuditSocial}
              date={subprojectObject.date_of_organization_of_the_social_audit ? new Date(subprojectObject.date_of_organization_of_the_social_audit) : undefined}
            />
            <Text></Text>

            <View>
              <Text style={{ ...styles.subTitle }}>Nombre de participants (H) à l'audit social</Text>
              <TextInput
                disabled={!enableToUpdate}
                onChangeText={handle_number_of_participants_m_in_the_social_audit}
                value={subprojectObject?.number_of_participants_m_in_the_social_audit?.toString()}
                keyboardType="numeric"
                placeholder="Nombre de participants (H) à l'audit social"
                theme={theme}
                mode="outlined"
              />
              <Text></Text>
            </View>

            <View>
              <Text style={{ ...styles.subTitle }}>Nombre de participants (F) à l'audit social</Text>
              <TextInput
                disabled={!enableToUpdate}
                onChangeText={handle_number_of_participants_w_in_the_social_audit}
                value={subprojectObject?.number_of_participants_w_in_the_social_audit?.toString()}
                keyboardType="numeric"
                placeholder="Nombre de participants (F) à l'audit social"
                theme={theme}
                mode="outlined"
              />
              <Text></Text>
            </View>

            <View>
              <Text style={{ ...styles.subTitle }}>Nombre de participants (T) à l'audit social</Text>
              <TextInput
                disabled={true}
                value={subprojectObject?.number_of_participants_t_in_the_social_audit?.toString()}
                keyboardType="numeric"
                placeholder="Nombre de participants (T) à l'audit social"
                theme={theme}
                mode="outlined"
              />
              <Text></Text>
            </View>

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
            {isSaving ? 'Enregistrement en cours' : `Sauvegarder`}
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