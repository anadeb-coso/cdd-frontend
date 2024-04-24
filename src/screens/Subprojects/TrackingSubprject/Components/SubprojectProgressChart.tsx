import React, { useEffect, useState } from 'react';
import Timeline from 'react-native-timeline-flatlist'
import { Image, TouchableOpacity, StatusBar, StyleSheet, ScrollView } from 'react-native';
import { Text, View, useToast } from 'native-base';
import { AntDesign } from '@expo/vector-icons';
import { Button, Dialog, Paragraph, Portal, TextInput } from 'react-native-paper';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { Step } from '../../../../models/subprojects/Step';
import { Subproject } from '../../../../models/subprojects/Subproject';
import { SubprojectStep } from '../../../../models/subprojects/SubprojectStep';
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

const SubprojectProgressChart = ({ steps, subproject_steps, subproject, componentTitle, onRefresh }: { steps: Array<Step>, subproject_steps: Array<SubprojectStep>, subproject: Subproject, componentTitle: string, onRefresh: () => void; }) => {
  const subproject_id = subproject.id;
  const navigation = useNavigation();
  const [subprojectSteps, setSubprojectSteps] = useState(subproject_steps);
  const [data, setData]: any = useState([]);
  const [lastElementSetDate, setLastElementSetDate]: any = useState(undefined);
  const [stepDialog, setStepDialog]: any = useState(false);
  const [subprojectStepObject, setSubprojectStepObject]: any = useState(new SubprojectStep());
  const [stepObject, setStepObject]: any = useState(new Step());
  const [date, setDate]: any = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  const _howStepDialog = (id?: number, wording?: number) => {
    let _subprojectStep: any = subprojectSteps.find(elt => elt.wording == wording) as SubprojectStep ?? new SubprojectStep();
    setSubprojectStepObject(_subprojectStep);
    let _step: any = steps.find(elt => elt.wording == wording) as Step ?? new Step();
    setStepObject(_step);
    if (!_subprojectStep.id) {
      setSubprojectStepObject({
        ..._step,
        id: null,
        updated_date: null,
        created_date: null,
        has_levels: null,
        subproject: subproject_id,
        step: _step.id
      } as SubprojectStep);
    }
    setStepDialog(true);
  }

  const pop_last_element_on_list_if_it_not_set_but_the_previous_is_it = (datas: any, step?: SubprojectStep): any => {
    if (step?.begin && datas.length > 0 && datas[datas.length - 1]?.time == '-') {
      datas.pop();
      return pop_last_element_on_list_if_it_not_set_but_the_previous_is_it(datas, step);
    }
    return datas;
  }

  const add_item = (liste: any, item: any) => {
    let i = liste.find((elt: any) => elt.ranking == item.ranking);
    if (!i) {
      liste.push(item);
    }
  }

  const remove_item = (liste: any, item: any) => {
    return liste.filter((elt: any) => elt.ranking != item.ranking);
  }

  const timeline_datas = () => {
    let _data = [];
    let step = null;
    let color = null;
    setData([]);
    for (let i = 0; i < steps.length; i++) {
      step = subprojectSteps.find(elt => elt.wording == steps[i].wording);
      // if(step?.begin && i>0 && _data[i-1]?.time == '-'){
      //   _data.pop();
      // }
      _data = pop_last_element_on_list_if_it_not_set_but_the_previous_is_it(_data, step);
      color = step ? (problems_steps.includes(step?.wording?.toLowerCase() ?? "") ? 'red' : '#24c38b') : 'white';
      _data.push(
        {
          id: step?.id,
          time: step?.begin ?? "-",
          title: steps[i].wording,
          description: step?.description,
          ranking: steps[i].ranking,
          lineColor: color,
          circleColor: color,
          object: step
          // icon: require('../../../../../assets/illustrations/location.png'),
          // imageUrl: ''
        }
      );
    }
    let __data: any = [];
    for (let i = 0; i < _data.length - 1; i++) {
      if (_data[i].time != "-" && _data[i + 1].time == "-") {
        add_item(__data, _data[i]);
        setLastElementSetDate(_data[i].time);
        if (_data[i].ranking == 1) {
          add_item(__data, _data[i + 1]);
          add_item(__data, _data[i + 2]);
        } else if (_data[i].ranking == 8) {
          add_item(__data, _data[i + 1]);
          add_item(__data, _data[i + 2]);
          add_item(__data, _data[i + 3]);
        } else {
          add_item(__data, _data[i + 1]);
        }
        break;
      } else {
        add_item(__data, _data[i]);
      }
    }

    let ___data: any = [];
    for (let i = 0; i < __data.length; i++) {
      if ((__data[i].ranking == 2 && __data[i].time != "-") && (__data.length == 2 || (__data.length > 2 && __data[i + 1].time == "-"))) {
        add_item(___data, __data[i]);
        break;
      }
      add_item(___data, __data[i]);
    }

    setData(___data.reverse());
  }

  useEffect(() => {

    timeline_datas();
  }, []);
  //}, [lastElementSetDate]);

  // const data = [
  //   {
  //     time: '09:00',
  //     title: 'Archery Training',
  //     description: 'The Beginner Archery and Beginner Crossbow course does not require you to bring any equipment, since everything you need will be provided for the course. ',
  //     lineColor:'#000000',
  //     circleColor: '#000000',
  //     icon: require('../../../../../assets/illustrations/location.png'),
  //     imageUrl: 'https://cloud.githubusercontent.com/assets/21040043/24240340/c0f96b3a-0fe3-11e7-8964-fe66e4d9be7a.jpg'
  //   }
  // ];

  const renderDetail = (rowData: any, sectionID: any, rowID: any) => {
    let title = <Text>{rowData.title}</Text>
    var desc = null;
    if (rowData.description)
      desc = (
        <View >
          {/* <Image resizeMode="stretch"
                style={{ width: 25, height: 30 }} source={{uri: rowData.imageUrl}} alt={rowData.title} /> */}
          {/* <Image
                resizeMode="stretch"
                style={{ width: 25, height: 30 }}
                source={require('../../../../../assets/illustrations/location.png')}
              /> */}
          <Text >{rowData.description}</Text>
        </View>
      )

    return (
      <View style={{ flex: 1, flexDirection: 'column', }}>
      <View style={{ flex: 1, flexDirection: 'row', }} key={rowData.ranking} >
        <TouchableOpacity onPress={() => { _howStepDialog(rowData.id, rowData.title); }} key={rowData.title} style={{ flex: 7 }}>
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1, flexDirection: 'row', }}>
              <Text>{title}</Text>
              <View style={{ alignItems: 'flex-end', justifyContent: 'flex-end', marginLeft: 15 }}>
                <AntDesign
                  style={{ marginRight: 5 }}
                  name="rightsquare"
                  size={30}
                  color={rowData.circleColor} //#eeeeee
                />
              </View>
            </View>
            {desc}
          </View>
        </TouchableOpacity>
        {rowData.object && rowData.ranking && rowData.ranking == 8 &&
        <View style={{ alignItems: 'flex-end', justifyContent: 'flex-end', flex: 3, marginTop: 0 }}>
          <TouchableOpacity onPress={() =>  navigation.navigate('TrackingSubprjectLevel', {
              subproject: subproject,
              step: rowData.object,
              name: componentTitle
            })
          } key={`${sectionID}.${rowData.ranking}`}>
            <View style={{ alignItems: 'flex-end', justifyContent: 'flex-end', marginLeft: 15 }}>
              <AntDesign
                style={{ marginRight: 5, fontWeight: 'bold' }}
                name="plus"
                size={27}
                color={rowData.circleColor} //#eeeeee
              />
            </View>
          </TouchableOpacity>
        </View>}
      </View>
      {rowData.object && rowData.ranking && <View>
        <Text style={{fontSize: 12, color: 'gray'}}>{
          rowData.ranking == 4 ? 
            "Veuillez joindre ici la fiche publiée" : (
              rowData.ranking == 6 ? (
                "Veuillez joindre ici la fiche du contrat signé"
              ): ""
            )
        }</Text>
      </View>}
      
      {rowData.object && <View style={{ flex: 1 }}>
        <AttachmentsComponent 
              attachmentsParams={rowData.object.files}
              object={rowData.object}
              type_object={'SubprojectStep'}
              subproject={subproject}
            />
        </View>}

      </View>
    )
  }

  const handle_amount_spent_at_this_step = (text: any) => {
    setSubprojectStepObject({ ...subprojectStepObject, amount_spent_at_this_step: return_numbers_only(text) });
  };
  const handle_total_amount_spent = (text: any) => {
    setSubprojectStepObject({ ...subprojectStepObject, total_amount_spent: return_numbers_only(text) });
  };
  const handle_percent = (text: any) => {
    setSubprojectStepObject({ ...subprojectStepObject, percent: return_numbers_only(text) });
  };
  const handle_description = (text: any) => {
    // subprojectStepObject.description = text;
    setSubprojectStepObject({ ...subprojectStepObject, description: text });
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (_date: any) => {
    setDate(_date);
    setSubprojectStepObject({ ...subprojectStepObject, begin: _date });
    hideDatePicker();
  };

  const saveSubprojectStep = async () => {
    setIsSaving(true);
    if(!subprojectStepObject.begin){
      toast.show({
        description: "La date est obligatoire",
      });
    }else{
      try {
        subprojectStepObject.begin = subprojectStepObject.begin ? subprojectStepObject.begin.toISOString().split('T')[0] : undefined;
      } catch (e) {
        //Nothing
      }
  
      await new SubprojectTrackingAPI().save_subproject_step(subprojectStepObject)
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
              <Text style={styles.title}>{subprojectStepObject.id ? (
                <Paragraph>Editer l'étape "{subprojectStepObject?.wording}"</Paragraph>
              ) : (
                <Paragraph>Marquer l'étape "{stepObject?.wording}"</Paragraph>
              )}</Text>

              {/* <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 23,
            paddingBottom: 10,
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
            {date ? moment(date).format('DD-MMMM-YY') : t('step_2_select_date')}
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
            onPress={() => setDate(new Date())}
          >
            Aujourd'hui
          </Button>
        </View>
<DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          maximumDate={new Date()}
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        /> */}

              <Text style={{ ...styles.subTitle, marginTop: 25 }}>Libellé</Text>
              <TextInput
                // style={{ marginTop: 10 }}
                mode="outlined"
                theme={theme}
                onChangeText={(text:any)=>{subprojectStepObject.wording=text}}
                value={stepObject.wording}
                disabled={true}
                placeholder="Libellé"
              />
              <Text></Text>

              <Text style={{ ...styles.subTitle }}>Date "{subprojectStepObject.id ? subprojectStepObject?.wording : stepObject?.wording}"</Text>
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
                  {subprojectStepObject.begin ? moment(subprojectStepObject.begin).format('DD-MMMM-YY') : `Date "${subprojectStepObject.id ? subprojectStepObject?.wording : stepObject?.wording}"`}
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
                // maximumDate={new Date()}
                // minimumDate={lastElementSetDate ? new Date(lastElementSetDate) : undefined}
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}

                date={subprojectStepObject.begin ? new Date(subprojectStepObject.begin) : undefined} //(lastElementSetDate ? new Date(lastElementSetDate) : undefined)}
              />
              <Text></Text>

              <Text style={{ ...styles.subTitle }}>Description</Text>
              <TextInput
                multiline
                // style={{ marginTop: 10 }}
                mode="outlined"
                theme={theme}
                onChangeText={handle_description}
                value={subprojectStepObject.description}
                placeholder="Description"
              />
              <Text></Text>

              {/* <Text style={{ ...styles.subTitle }}>Montant dépensé à cette étape</Text>
              <TextInput
                onChangeText={handle_amount_spent_at_this_step}
                value={subprojectStepObject.amount_spent_at_this_step}
                keyboardType="numeric"
                placeholder="Enter a Montant dépensé à cette étape"
                theme={theme}
                mode="outlined"
              />
              <Text></Text> */}

              {(stepObject?.wording == "Achevé" || stepObject?.ranking == 11) && <><Text style={{ ...styles.subTitle }}>Montant global dépensé sur l'infrastructure</Text>
              <TextInput
                onChangeText={handle_total_amount_spent}
                value={subprojectStepObject.total_amount_spent}
                keyboardType="numeric"
                placeholder="Montant global dépensé"
                theme={theme}
                mode="outlined"
              />
              <Text></Text></>}

              {(stepObject?.wording == "Achevé" || stepObject?.ranking >= 11) && <><Text style={{ ...styles.subTitle }}>Pourcentage d'implémentation</Text>
              <TextInput
                onChangeText={handle_percent}
                value={subprojectStepObject?.percent?.toString()}
                disabled={true}
                keyboardType="numeric"
                placeholder={"Pourcentage"}
                theme={theme}
                mode="outlined"
              /></>}
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
                onPress={() => { saveSubprojectStep(); }}
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

export default SubprojectProgressChart;