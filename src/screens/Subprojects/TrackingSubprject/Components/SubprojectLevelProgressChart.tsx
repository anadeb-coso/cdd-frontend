import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Timeline from 'react-native-timeline-flatlist'
import { Image, TouchableOpacity, StatusBar, StyleSheet, ScrollView } from 'react-native';
import { Text, View, useToast } from 'native-base';
import { AntDesign } from '@expo/vector-icons';
import { Button, Dialog, Paragraph, Portal, TextInput } from 'react-native-paper';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
// import NetInfo from '@react-native-community/netinfo';
import { Step } from '../../../../models/subprojects/Step';
import { SubprojectStep } from '../../../../models/subprojects/SubprojectStep';
import { Subproject } from '../../../../models/subprojects/Subproject';
import { Level } from '../../../../models/subprojects/Level';
import { colors } from '../../../../utils/colors';
import SubprojectTrackingAPI from '../../../../services/subprojects/subprojects_tracking';
import { return_numbers_only } from '../../../../utils/functions';
import AttachmentsComponent from "../../../../components/AttachmentsComponent";
import { getData } from '../../../../utils/storageManager';
// import { FileComment } from '../../../../models/subprojects/FileComment';
// import SubprojectFileAPI from '../../../../services/subprojects/file';
// import LoadingScreen from '../../../../components/LoadingScreen';

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

const SubprojectLevelProgressChart = ({ subproject_levels, subproject, step, onRefresh, showAddAttachment, enableToUpdateSteps }: { subproject_levels: Array<Level>, subproject: Subproject, step: SubprojectStep, onRefresh: () => void, showAddAttachment: boolean, enableToUpdateSteps: boolean; }) => {
  const { t } = useTranslation(['subprojects', 'common']);
  const subproject_id = subproject.id;
  const [subprojectLevels, setSubprojectLevels] = useState(subproject_levels);
  const [data, setData]: any = useState([]);
  const [subprojectStepDate, setSubprojectStepDate]: any = useState(step?.begin);
  const [currentSubprojectLvelDate, setCurrentSubprojectLevelDate]: any = useState(undefined);
  const [stepDialog, setStepDialog]: any = useState(false);
  const [dialogSession, setDialogSession] = useState(0);
  const [subprojectLevelObject, setSubprojectLevelObject]: any = useState(new Level());
  const [stepObject, setStepObject]: any = useState(new Step());
  const [date, setDate]: any = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  // const [fileComments, setFileComments] = useState<FileComment[]>([]);
  // const [isLoading, setLoading] = useState(false);
  // const [errorMessage, setErrorMessage] = useState("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
  // const [connected, setConnected] = useState(true);
  // const [errorVisible, setErrorVisible] = React.useState(false);
  // const onDismissSnackBar = () => setErrorVisible(false);
  
  // const check_network = async () => {
  //     NetInfo.fetch().then((state) => {
  //         if (!state.isConnected) {
  //             setErrorMessage("Vous n'êtes pas connecté à aucun réseau. Veuillez activer votre donnée mobile ou connecter vous à un wifi.");
  //             setErrorVisible(true);
  //             setConnected(false);
  //         }else if(!state.isInternetReachable){
  //             setErrorMessage("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
  //             setErrorVisible(true);
  //             setConnected(false);
  //         }
  //     });
  // }

  const _howLevelDialog = (id?: number) => {
    let _subprojectLevel: any = subproject_levels.find((elt: any) => elt.id == id) as Level ?? new Level();
    setSubprojectLevelObject(_subprojectLevel);
    setDialogSession(session => session + 1);

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
          percent: subprojectLevels[i].percent,
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
    // _data = _data.reverse()
    setData(_data);
    if(_data && _data.length > 0){
      setCurrentSubprojectLevelDate(_data[0]?.time);
    }
    
  }

  useEffect(() => {

    timeline_datas();
  }, []);
  //}, [lastElementSetDate]);

  // const get_file_comments = async (file_id: number) => {
  //     setFileComments([]);
  //     setLoading(true);
  //     setConnected(true);
  //     await check_network();
  //     //Get Subproject
  //     await new SubprojectFileAPI()
  //         .get_file_comments(
  //             {
  //                 username: JSON.parse(await getData('username')),
  //                 password: JSON.parse(await getData('password')), 
  //                 user: {
  //                     username: JSON.parse(await getData('username')),
  //                     email: JSON.parse(await getData('email'))
  //                 }
  //             }, JSON.parse(await getData('access')), file_id)
  //         .then(async (reponse: any) => {
  //             setLoading(false);
  //             if (reponse.error) {
  //                 return;
  //             }
  //             setFileComments(reponse as FileComment[]);

  //         })
  //         .catch(error => {
  //             setFileComments([]);
  //             setLoading(false);
  //             console.error(error);
  //         });
  //     //End Get Subproject

  //   };


  const renderDetail = useCallback((rowData: any, sectionID: any, rowID: any) => {

    return (
      <View style={{ flex: 1, flexDirection: 'column', }}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => { _howLevelDialog(rowData.id); }} key={sectionID} style={{ flex: 7 }} disabled={!enableToUpdateSteps}>
            <View style={{ flex: 1 }}>
              <View style={{ flex: 1, flexDirection: 'row', }}>
                <View >
                  <Text>
                    {rowData.title} {rowData.percent && <Text style={{ fontSize: 12, color: 'gray' }}>{rowData.percent ?? 0}%</Text>}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', justifyContent: 'flex-end', marginLeft: 15 }}>
                  <AntDesign
                    style={{ marginRight: 5 }}
                    name="rightsquare"
                    size={35}
                    color={rowData.circleColor} //#eeeeee
                  />
                </View>
              </View>
              <View >
                {rowData.description && <Text style={{ fontSize: 12, color: 'gray' }}>{rowData.description}</Text>}
              </View>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }}>
          <AttachmentsComponent
            showAdd={showAddAttachment}
            attachmentsParams={rowData.object.files}
            object={rowData.object}
            type_object={'Level'}
            subproject={subproject}
            showListBeforeAddIcon={true}
            // get_file_comments={get_file_comments}
            // fileComments={fileComments}
          />
        </View>
      </View>
    )
  }, [enableToUpdateSteps, showAddAttachment, subproject]);

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
    if (!subprojectLevelObject.wording) {
      toast.show({
        description: t('subproject_level_progress_chart.wording_required'),
      });
    } else if (!subprojectLevelObject.percent) {
      toast.show({
        description: t('subproject_level_progress_chart.percent_required'),
      });
    }
    else if (!subprojectLevelObject.begin) {
      toast.show({
        description: t('shared.date_required'),
      });
    } else {
      try {
        subprojectLevelObject.subproject_step = step.id;
        subprojectLevelObject.begin = subprojectLevelObject.begin ? subprojectLevelObject.begin.toISOString().split('T')[0] : undefined;
        subprojectLevelObject.ranking = subprojectLevels.length;
      } catch (e) {
        //Nothing
      }

      await new SubprojectTrackingAPI().save_subproject_level({
        ...subprojectLevelObject,
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
    }
    setIsSaving(false);

  }

  // Memoized so typing into the dialog's TextInputs (which only changes
  // subprojectLevelObject/stepDialog state) doesn't force this FlatList-backed
  // Timeline to re-render on every keystroke.
  const timelineElement = useMemo(() => (
    <Timeline
      data={data}
      circleSize={20}
      circleColor='rgb(45,156,219)'
      lineColor='rgb(45,156,219)'
      timeContainerStyle={{ minWidth: 52, marginTop: 10 }}
      timeStyle={{ textAlign: 'center', backgroundColor: '#ff9797', color: 'white', padding: 5, borderRadius: 13 }}
      descriptionStyle={{ color: 'gray' }}
      // options={{
      //   style: { paddingTop: 5 }
      // }}
      separatorStyle={{ backgroundColor: 'black' }}
      separator={true}
      isUsingFlatlist={true}
      renderDetail={renderDetail}
    />
  ), [data, renderDetail]);

  // Identifies the current dialog editing session (changes every time a level
  // is opened), used to key the uncontrolled TextInputs below so they always
  // remount with fresh data instead of keeping stale unsaved keystrokes.
  const stepDialogKey = dialogSession;

  return (
    <View>

      <View>
        <Button
          style={{ borderColor: '#34c134', borderWidth: 3, backgroundColor: 'white' }}
          textColor='#34c134'
          onPress={() => { _howLevelDialog(); }}
        >
          <AntDesign
            style={{ fontWeight: 'bold' }}
            name="plus"
            size={15}
            color={'#34c134'}
          /> {t('subproject_level_progress_chart.add_level_button')}
        </Button>
      </View>
      <Text></Text>

      {timelineElement}



      {/* Modal */}
      <Portal>
        <Dialog visible={stepDialog} onDismiss={() => { setStepDialog(false); }} style={{ maxHeight: '85%' }}>
          <Dialog.ScrollArea>
          <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
          <Dialog.Content>
            <Text style={styles.title}>{subprojectLevelObject.id ? (
              <Paragraph>{t('subproject_level_progress_chart.edit_level_title', { wording: subprojectLevelObject?.wording })}</Paragraph>
            ) : (
              <Paragraph>{t('subproject_level_progress_chart.mark_level_title')}</Paragraph>
            )}</Text>

            <Text style={{ ...styles.subTitle, marginTop: 25 }}>{t('shared.label_field')}</Text>
            <TextInput
              key={`wording-${stepDialogKey}`}
              // style={{ marginTop: 10 }}
              mode="outlined"
              theme={theme}
              onChangeText={handle_wording}
              defaultValue={subprojectLevelObject.wording}
              placeholder={t('shared.label_field')}
            />
            <Text></Text>

            <Text style={{ ...styles.subTitle }}>{t('shared.percent_label')}</Text>
            <TextInput
              key={`percent-${stepDialogKey}`}
              onChangeText={handle_percent}
              defaultValue={subprojectLevelObject?.percent != null ? String(subprojectLevelObject.percent) : ''}
              keyboardType="numeric"
              placeholder={t('shared.percent_placeholder')}
              theme={theme}
              mode="outlined"
            />
            <Text></Text>

            <Text style={{ ...styles.subTitle }}>{t('subproject_level_progress_chart.ranking_label')}</Text>
            <TextInput
              disabled={true}
              onChangeText={handle_ranking}
              value={subprojectLevelObject?.ranking ? subprojectLevelObject?.ranking?.toString() : subprojectLevels.length?.toString()}
              keyboardType="numeric"
              placeholder={t('subproject_level_progress_chart.ranking_label')}
              theme={theme}
              mode="outlined"
            />
            <Text></Text>

            <Text style={{ ...styles.subTitle }}>{t('subproject_level_progress_chart.begin_label')}</Text>
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
                {subprojectLevelObject.begin ? moment(subprojectLevelObject.begin).format('DD-MMMM-YY') : t('subproject_level_progress_chart.begin_date_button')}
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
                {t('shared.today')}
              </Button>
            </View>

            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              maximumDate={new Date()}
              minimumDate={(currentSubprojectLvelDate && !subprojectLevelObject?.id) ? new Date(currentSubprojectLvelDate) : (subprojectStepDate ? new Date(subprojectStepDate) : undefined)}
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}

              date={subprojectLevelObject.begin ? new Date(subprojectLevelObject.begin) : undefined}// (lastElementSetDate ? new Date(lastElementSetDate) : undefined)}
            />
            <Text></Text>

            <Text style={{ ...styles.subTitle }}>{t('shared.description_field')}</Text>
            <TextInput
              key={`description-${stepDialogKey}`}
              multiline
              // style={{ marginTop: 10 }}
              mode="outlined"
              theme={theme}
              onChangeText={handle_description}
              defaultValue={subprojectLevelObject.description}
              placeholder={t('shared.description_field')}
            />
            <Text></Text>

            <Text style={{ ...styles.subTitle }}>{t('subproject_level_progress_chart.amount_spent_label')}</Text>
            <TextInput
              key={`amount-spent-${stepDialogKey}`}
              onChangeText={handle_amount_spent_at_this_step}
              defaultValue={subprojectLevelObject.amount_spent_at_this_step != null ? String(subprojectLevelObject.amount_spent_at_this_step) : ''}
              keyboardType="numeric"
              placeholder={t('subproject_level_progress_chart.amount_spent_placeholder')}
              theme={theme}
              mode="outlined"
            />
            <Text></Text>

          </Dialog.Content>
          </ScrollView>
          </Dialog.ScrollArea>

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
              {t('shared.exit')}
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
              {isSaving ? t('shared.saving_in_progress') : t('common:save')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      {/* End Modal */}
    </View>
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