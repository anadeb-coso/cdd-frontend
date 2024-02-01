import React, { useEffect, useState } from 'react';
import Timeline from 'react-native-timeline-flatlist'
import { Image, TouchableOpacity, StatusBar, StyleSheet, ScrollView } from 'react-native';
import { Text, View, useToast } from 'native-base';
import { AntDesign } from '@expo/vector-icons';
import { Button, Dialog, Paragraph, Portal, TextInput } from 'react-native-paper';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { Step } from '../../../../models/subprojects/Step';
import { SubprojectStep } from '../../../../models/subprojects/SubprojectStep';
import { Subproject } from '../../../../models/subprojects/Subproject';
import { Level } from '../../../../models/subprojects/Level';
import { SubprojectFile } from '../../../../models/subprojects/SubprojectFile';
import { colors } from '../../../../utils/colors';
import SubprojectTrackingAPI from '../../../../services/subprojects/subprojects_tracking';
import { return_numbers_only } from '../../../../utils/functions';
import AttachmentsComponent from "../../../../components/AttachmentsComponent";

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

const SubprojectLevelProgressChart = ({ subproject_levels, subproject, step, onRefresh }: { subproject_levels: Array<Level>, subproject: Subproject, step: SubprojectStep, onRefresh: () => void; }) => {
  const subproject_id = subproject.id;
  const [subprojectLevels, setSubprojectLevels] = useState(subproject_levels);
  const [data, setData]: any = useState([]);
  const [lastElementSetDate, setLastElementSetDate]: any = useState(step?.begin);
  const [stepDialog, setStepDialog]: any = useState(false);
  const [subprojectLevelObject, setSubprojectLevelObject]: any = useState(new Level());
  const [stepObject, setStepObject]: any = useState(new Step());
  const [date, setDate]: any = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  const _howLevelDialog = (id?: number) => {
    let _subprojectLevel: any = subproject_levels.find((elt: any) => elt.id == id) as Level ?? new Level();
    setSubprojectLevelObject(_subprojectLevel);

    setStepDialog(true);
  }



  const timeline_datas = () => {
    let _data = [];
    setData([]);
    for (let i = 0; i < subprojectLevels.length; i++) {

      _data.push(
        {
          id: subprojectLevels[i]?.id,
          time: subprojectLevels[i]?.begin ?? "-",
          title: subprojectLevels[i].wording,
          description: subprojectLevels[i]?.description,
          ranking: subprojectLevels[i].ranking,
          lineColor: "#24c38b",
          circleColor: "#24c38b",
          object: subprojectLevels[i]
          // icon: require('../../../../../assets/illustrations/location.png'),
          // imageUrl: ''
        }
      );
    }

    setData(_data.reverse());
  }

  useEffect(() => {

    timeline_datas();

  }, [lastElementSetDate]);

  const renderDetail = (rowData: any, sectionID: any, rowID: any) => {
    let title = <Text>{rowData.title}</Text>
    var desc = null;
    if (rowData.description)
      desc = (
        <View >
          <Text >{rowData.description}</Text>
        </View>
      )

    return (
      <View style={{ flex: 1, flexDirection: 'column', }}>
        <View style={{ flex: 1 }}>
        <TouchableOpacity onPress={() => { _howLevelDialog(rowData.id); }} key={sectionID} style={{ flex: 7 }}>
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1, flexDirection: 'row', }}>
              <Text>{title}</Text>
              <View style={{ alignItems: 'flex-end', justifyContent: 'flex-end', marginLeft: 15 }}>
                <AntDesign
                  style={{ marginRight: 5 }}
                  name="rightsquare"
                  size={35}
                  color={rowData.circleColor} //#eeeeee
                />
              </View>
            </View>
            {desc}
          </View>
        </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }}>
        <AttachmentsComponent 
              attachmentsParams={rowData.object.files}
              object={rowData.object}
              type_object={'Level'}
              subproject={subproject}
            />
        </View>
      </View>
    )
  }

  const handle_amount_spent_at_this_step = (text: any) => {
    setSubprojectLevelObject({ ...subprojectLevelObject, amount_spent_at_this_step: return_numbers_only(text) });
  };
  const handle_total_amount_spent = (text: any) => {
    setSubprojectLevelObject({ ...subprojectLevelObject, total_amount_spent: return_numbers_only(text) });
  };
  const handle_percent = (text: any) => {
    setSubprojectLevelObject({ ...subprojectLevelObject, percent: return_numbers_only(text) });
  };
  const handle_ranking = (text: any) => {
    setSubprojectLevelObject({ ...subprojectLevelObject, ranking: return_numbers_only(text) ?? subprojectLevels.length });
  };
  const handle_description = (text: any) => {
    setSubprojectLevelObject({ ...subprojectLevelObject, description: text });
  };
  const handle_wording = (text: any) => {
    setSubprojectLevelObject({ ...subprojectLevelObject, wording: text });
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (_date: any) => {
    setDate(_date);
    setSubprojectLevelObject({ ...subprojectLevelObject, begin: _date });
    hideDatePicker();
  };

  const saveSubprojectLevel = async () => {
    setIsSaving(true);
    if(!subprojectLevelObject.wording){
      toast.show({
        description: "Le libellé est obligatoire",
      });
    }else if(!subprojectLevelObject.percent){
      toast.show({
        description: "Le pourcentage est obligatoire",
      });
    }
    // else if(!subprojectLevelObject.ranking){
    //   console.log(subprojectLevelObject.ranking);
    //   toast.show({
    //     description: "Le classement est obligatoire",
    //   });
    // }
    else if(!subprojectLevelObject.begin){
      toast.show({
        description: "La date est obligatoire",
      });
    }else{
      try {
        subprojectLevelObject.subproject_step = step.id;
        subprojectLevelObject.begin = subprojectLevelObject.begin ? subprojectLevelObject.begin.toISOString().split('T')[0] : undefined;
        subprojectLevelObject.ranking = subprojectLevels.length;
      } catch (e) {
        //Nothing
      }
  
      await new SubprojectTrackingAPI().save_subproject_level(subprojectLevelObject)
        .then(async (reponse: any) => {
          if (reponse.error) {
            return;
          }
          onRefresh();
        });
    }
    setIsSaving(false);
    
  }

  return (
    <ScrollView>

      <View>
        <Button
          style={{  borderColor: '#34c134', borderWidth: 3, backgroundColor: 'white' }} 
          textColor='#34c134'
          rounded="xl"
          onPress={() => { _howLevelDialog(); }}
        >
        <AntDesign
                  style={{ fontWeight: 'bold' }}
                  name="plus"
                  size={15}
                  color={'#34c134'} 
                /> Niveau d'avancement du chantier
      </Button>
      </View>
      <Text></Text>

      <Timeline

        data={data}
        circleSize={20}
        circleColor='rgb(45,156,219)'
        lineColor='rgb(45,156,219)'
        timeContainerStyle={{ minWidth: 52, marginTop: 10 }}
        timeStyle={{ textAlign: 'center', backgroundColor: '#ff9797', color: 'white', padding: 5, borderRadius: 13 }}
        descriptionStyle={{ color: 'gray' }}
        options={{
          style: { paddingTop: 5 }
        }}
        separatorStyle={{ backgroundColor: 'black' }}
        separator={true}
        isUsingFlatlist={true}
        renderDetail={renderDetail}
      />



      {/* Modal */}
      <Portal>
        <Dialog visible={stepDialog} onDismiss={() => { setStepDialog(false); }}>
          <ScrollView>
            <Dialog.Content>
              <Text style={styles.title}>{subprojectLevelObject.id ? (
                <Paragraph>Editer le niveau "{subprojectLevelObject?.wording}"</Paragraph>
              ) : (
                <Paragraph>Marquer un niveau</Paragraph>
              )}</Text>

              <Text style={{ ...styles.subTitle, marginTop: 25 }}>Libellé</Text>
              <TextInput
                // style={{ marginTop: 10 }}
                mode="outlined"
                theme={theme}
                onChangeText={handle_wording}
                value={stepObject.wording}
                placeholder="Libellé"
              />
              <Text></Text>

<Text style={{ ...styles.subTitle }}>Pourcentage d'implémentation</Text>
<TextInput
  onChangeText={handle_percent}
  value={subprojectLevelObject?.percent?.toString()}
  keyboardType="numeric"
  placeholder={"Pourcentage"}
  theme={theme}
  mode="outlined"
/>
<Text></Text>

<Text style={{ ...styles.subTitle }}>Classement</Text>
<TextInput
  onChangeText={handle_ranking}
  value={subprojectLevelObject?.ranking ? subprojectLevelObject?.ranking?.toString() : subprojectLevels.length?.toString()}
  keyboardType="numeric"
  placeholder={"Classement"}
  theme={theme}
  mode="outlined"
/>
<Text></Text>

              <Text style={{ ...styles.subTitle }}>Début</Text>
              <View
                style={{
                  flexDirection: 'row',
                  // paddingHorizontal: 23,
                  // paddingBottom: 10,
                  justifyContent: 'space-between',
                }}
              >
                <Button
                  theme={{ ...theme, colors: { ...theme.colors, primary: 'white' } }}
                  icon="calendar"
                  compact
                  style={{
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
                  }}
                  uppercase={false}
                  labelStyle={{
                    color: colors.primary,
                    fontFamily: 'Poppins_400Regular',
                    fontSize: 13,
                  }}
                  mode="contained"
                  onPress={showDatePicker}
                >
                  {subprojectLevelObject.begin ? moment(subprojectLevelObject.begin).format('DD-MMMM-YY') : "Date du debut de ce niveau"}
                </Button>
                <Button
                  compact
                  theme={theme}
                  labelStyle={{
                    color: 'white',
                    fontFamily: 'Poppins_400Regular',
                    fontSize: 12,
                  }}
                  mode="contained"
                  uppercase={false}
                  onPress={() => handleConfirm(new Date())}
                >
                  {"Aujourd'hui"}
                </Button>
              </View>

              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                maximumDate={new Date()}
                minimumDate={lastElementSetDate ? new Date(lastElementSetDate) : undefined}
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}

                date={subprojectLevelObject.begin ? new Date(subprojectLevelObject.begin) : (lastElementSetDate ? new Date(lastElementSetDate) : undefined)}
              />
              <Text></Text>

              <Text style={{ ...styles.subTitle }}>Description</Text>
              <TextInput
                multiline
                // style={{ marginTop: 10 }}
                mode="outlined"
                theme={theme}
                onChangeText={handle_description}
                value={subprojectLevelObject.description}
                placeholder="Description"
              />
              <Text></Text>

              <Text style={{ ...styles.subTitle }}>Montant dépensé à cette étape</Text>
              <TextInput
                onChangeText={handle_amount_spent_at_this_step}
                value={subprojectLevelObject.amount_spent_at_this_step}
                keyboardType="numeric"
                placeholder="Enter a Montant dépensé à ce niveau"
                theme={theme}
                mode="outlined"
              />
              <Text></Text>

              {/* <Text style={{ ...styles.subTitle }}>Montant global dépensé sur l'infrastructure</Text>
              <TextInput
                onChangeText={handle_total_amount_spent}
                value={subprojectLevelObject.total_amount_spent}
                keyboardType="numeric"
                placeholder="Montant global dépensé"
                theme={theme}
                mode="outlined"
              />
              <Text></Text> */}
            </Dialog.Content>

            <Dialog.Actions>
              <Button
                theme={theme}
                style={{ alignSelf: 'center', backgroundColor: '#d4d4d4' }}
                labelStyle={{ color: 'white', fontFamily: 'Poppins_500Medium' }}
                mode="contained"
                onPress={() => {
                  setStepDialog(false);
                }}
              >
                Sortir
              </Button>
              <Button
                // disabled={escalateComment === ''}
                theme={theme}
                style={{ alignSelf: 'center', margin: 24 }}
                labelStyle={{ color: 'white', fontFamily: 'Poppins_500Medium' }}
                mode="contained"
                onPress={() => { saveSubprojectLevel(); }}
                loading={isSaving}
                disabled={isSaving}
              >
                {isSaving ? 'Enregistrement en cours' : `Sauvegarder`}
              </Button>
            </Dialog.Actions>
          </ScrollView>
        </Dialog>
      </Portal>
      {/* End Modal */}
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
});

export default SubprojectLevelProgressChart;