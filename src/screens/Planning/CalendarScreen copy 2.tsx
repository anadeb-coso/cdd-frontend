import React, { useState, useEffect, useContext } from 'react';
import {
  Box, useToast, Modal as ModalBase, Button as ButtonBase, VStack
} from 'native-base';
import {
  View, Text, Modal, TextInput, FlatList, StyleSheet, TouchableOpacity,
  Button, ScrollView, RefreshControl, Dimensions, Image, ImageBackground,
  Alert
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { FontAwesome } from '@expo/vector-icons';
import { Snackbar, Checkbox, TextInput as TextInputPaper, ActivityIndicator, Button as ButtonPaper } from 'react-native-paper';
import XDate from 'xdate';
import moment from 'moment';
import 'moment/locale/fr';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import NetInfo from '@react-native-community/netinfo';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import CustomDay from './CustomDay'; // Import your CustomDay component
import SectionedOneSelectCustom from '../../components/SectionedOneSelectCustom';
import SectionedMultiSelectCustom from '../../components/SectionedMultiSelectCustom';
// import LocalDatabase from '../../utils/databaseManager';
// import { LocalDatabaseADL, LocalDatabaseProcessDesign } from '../../utils/databaseManager';
import { addDocument, getDocumentsByAttributes, updateDocument } from '../../utils/coucdb_call';
import {
  clear_duplicate_on_liste, times_split, capitalizeFirstLetterForEachWord,
  capitalizeFirstLetter, image_compress, isDateTimeInPastOrNow, getDatesBetween
} from '../../utils/functions';
import AuthContext from '../../contexts/auth';
import { VALIDATION_PROCESS_COLORS, TYPES_VACATION, COMPONENTS } from '../../utils/constants';
import { getImageDimensions, getImageSize } from '../../utils/functions_native';
import { uploadFile } from '../../services/upload';
import ActivitiesAPI from '../../services/planning/actitivies';
import ActivityFilesAPI from '../../services/planning/activityfiles';
import { baseURL } from '../../services/API';
import { handleStorageError } from '../../utils/pouchdb_call';
import TaskCommentsHistory from './TaskCommentsHistory/TaskCommentsHistory';
import PlanningAttachmentsComponent from '../../components/PlanningAttachmentsComponent';
import { getData } from '../../utils/storageManager';
import AdministrativelevlsAPI from '../../services/administrativelevls/administrativelevls';
import LoadingScreen from '../../components/LoadingScreen';

moment.locale('fr');
const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

LocaleConfig.locales['fr'] = {
  monthNames: [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre'
  ],
  monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
  dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
  today: "Aujourd'hui"
};

LocaleConfig.defaultLocale = 'fr';

const colors = ['primary.600', 'orange', 'lightblue', 'purple'];
const theme = {
  roundness: 12,
  colors: {
    ...colors,
    background: 'white',
    placeholder: '#dedede',
    text: '#707070',
  },
};

const CalendarScreen = () => {
  const { user, signOut } = useContext(AuthContext);
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisibleSelectOption, setModalVisibleSelectOption] = useState(false);
  const [modalVisibleAddPlan, setModalVisibleAddPlan] = useState(false);
  const [modalVisibleTaskDetail, setModalVisibleTaskDetail] = useState(false);
  const [modalVisibleTaskComments, setModalVisibleTaskComments] = useState(false);
  const [modalVisiblePlanningTaskReporting, setModalVisiblePlanningTaskReporting] = useState(false);
  const [modalVisibleAttachmentLoad, setModalVisibleAttachmentLoad] = useState(false);
  const [isAddExistingTask, setIsAddExistingTask]: any = useState(false);
  const [isAddVacation, setIsAddVacation]: any = useState(false);
  const [villagesSelectedID, setVillagesSelectedID]: any = useState([]);
  const [villagesSelected, setVillagesSelected]: any = useState([]);
  const [cantons, setCantons] = useState([]);
  const [cantonsSelectedID, setCantonsSelectedID] = useState([]);
  const [villages, setVillages] = useState([]);
  const [phase, setPhase]: any = useState(null);
  const [phases, setPhases] = useState([]);
  const [etape, setEtape]: any = useState(null);
  const [activity, setActivity]: any = useState(null);
  const [etapes, setEtapes] = useState([]);
  // const [anotherTache, setAnotherTache]: any = useState(null);
  const [timeStart, setTimeStart]: any = useState({ name: `00:00`, id: 0 });
  const [timeEnd, setTimeEnd]: any = useState(null);
  const [plannedTasks, setPlannedTasks]: any = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [markedDates, setMarkedDates]: any = useState(null);
  const [completed, setCompleted]: any = useState(false);
  const [undo, setUndo]: any = useState(false);
  const [isAnother, setIsAnother]: any = useState(false);
  const [isFreeTask, setIsFreeTask]: any = useState(false);
  const [freeTaskTitle, setFreeTaskTitle]: any = useState(null);
  const [completedComment, setCompletedComment]: any = useState(null);
  const [undoComment, setUndoComment]: any = useState(null);
  const [detailAnother, setDetailAnother]: any = useState(null);
  // const [photoUri, setPhotoUri]: any = useState(false);
  const [isDeleting, setIsDeleting]: any = useState(false);
  const [isSyncing, setIsSyncing]: any = useState(false);
  const [descriptionFreeTask, setDescriptionFreeTask]: any = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments]: any = useState([]);
  const [component, setComponent]: any = useState(null);



  const [newPlan, setNewPlan] = useState(false);
  const [editPlan, setEditPlan] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const [connected, setConnected] = useState(true);
  const [errorMessage, setErrorMessage]: any = useState(null);
  const [errorVisible, setErrorVisible] = React.useState(false);
  const onDismissSnackBar = () => setErrorVisible(false);

  const [vacationTypePrecision, setVacationTypePrecision]: any = useState(null);
  const [vacationType, setVacationType]: any = useState(null);
  const [vacationDateBegin, setVacationDateBegin]: any = useState(null);
  const [isDateVisibleVacationBegin, setisDateVisibleVacationBegin] = useState(false);
  const handleConfirmVacationBegin = (_date: any) => {
    setVacationDateBegin(_date);
    hideDatePickerVacationBegin();
  };
  const hideDatePickerVacationBegin = () => {
    setisDateVisibleVacationBegin(false);
  }; const showDatePickerVacationBegin = () => {
    setisDateVisibleVacationBegin(true);
  };
  const [vacationDateEnd, setVacationDateEnd]: any = useState(null);
  const [isDateVisibleVacationEnd, setisDateVisibleVacationEnd] = useState(false);
  const handleConfirmVacationEnd = (_date: any) => {
    setVacationDateEnd(_date);
    hideDatePickerVacationEnd();
  };
  const hideDatePickerVacationEnd = () => {
    setisDateVisibleVacationEnd(false);
  }; const showDatePickerVacationEnd = () => {
    setisDateVisibleVacationEnd(true);
  };
  const [vacationDateReturn, setVacationDateReturn]: any = useState(null);
  const [isDateVisibleVacationReturn, setisDateVisibleVacationReturn] = useState(false);
  const handleConfirmVacationReturn = (_date: any) => {
    setVacationDateReturn(_date);
    hideDatePickerVacationReturn();
  };
  const hideDatePickerVacationReturn = () => {
    setisDateVisibleVacationReturn(false);
  }; const showDatePickerVacationReturn = () => {
    setisDateVisibleVacationReturn(true);
  };


  const TIMES_H = times_split().map((item: any, index: number) => {
    return { name: `${item}`, id: index }
  });

  const check_network = async () => {
    NetInfo.fetch().then((state) => {
      if (!state.isConnected) {
        setErrorMessage("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
        setErrorVisible(true);
        setConnected(false);
      }
    });
  }

  const put_to_null_attrs = () => {
    setVillagesSelectedID([]);
    setVillagesSelected(null);
    setCantonsSelectedID([]);
    setPhase(null);
    setEtape(null);
    setFreeTaskTitle(null);
    setDescriptionFreeTask(null);
    setTimeStart({ name: `00:00`, id: 0 });
    setTimeEnd(null);

    setCompleted(null);
    setUndo(null);
    setIsAnother(null);
    setIsFreeTask(null);
    setFreeTaskTitle(null);
    setDetailAnother(null);
    // setPhotoUri(null);
    setCompletedComment(null);
    setUndoComment(null);
    // setAnotherTache(null);
    setComponent(null);

    setVacationDateBegin(null);
    setVacationDateEnd(null);
    setVacationDateReturn(null);
    setVacationType(null);
    setVacationTypePrecision(null);
    setIsAddVacation(false);
  }

  const onDayPress = (date: any) => {
    // LocalDatabase.find({
    //   selector: {
    //     type: 'task',
    //     planning_dates: {
    //       $in: [date.dateString],
    //     }
    //   },
    // })
    //   .then((result: any) => {
    //     setPlannedTasks(result?.docs ?? []);
    //   });
  };

  const delete_activity = async (item: any) => {
    Alert.alert(
      "Alert", "Souhaitez vous vraiment supprimer cette activité ?", [
      {
        text: "Oui", onPress: async () => {
          setLoading(true);
          await new ActivitiesAPI()
            .delete_activity({
              id: item.id
            })
            .then(async (reponse: any) => {
              if (reponse.error) {
                if (reponse.error == "validated") {
                  // setErrorMessage(`Cette activité est déjà validée. Vous ne pouvez plus la supprimer!\nVeuillez faire cas à votre superviseur de zone.`);
                  toast.show({
                    description: `Cette activité est déjà validée. Vous ne pouvez plus la supprimer!\nVeuillez faire cas à votre superviseur de zone.`,
                    duration: 15000
                  });
                } else {
                  setErrorMessage('Une erreur est survenue. Probablement vous avez pas accès à supprimer cette activité.');
                  setErrorVisible(true);
                }

              } else {
                setErrorMessage('Activité supprimée avec succès.');
                setErrorVisible(true);
              }
              put_to_null_attrs();
              get_tasks_planned();


            })
            .catch(error => {
              console.error(error);
            });
          setLoading(false);
        }
      },
      {
        text: "Non", onPress: async () => {

        }
      }
    ]);
  };

  const set_datas = (item: any) => {

  };
  const reset_datas = (item: any) => {

  };

  const get_color_status_number = (elt: any) => {
    if(elt.type == "vacation"){
      // return elt.validated != true ? 0 : (isDateTimeInPastOrNow(elt?.vacation_return_datetime) ? 5 : 6);
      return elt.validated != true ? (elt.validated == false ? 2 : 0) : 6;
    }
    return (elt.validated == null ? 0 : (elt.validated == true ? (
      (elt?.completed || elt?.is_another) ? 3 : (
        elt?.undo ? 4 : (
          isDateTimeInPastOrNow(elt?.planned_datetime_end) ? 5 : 1
        )
      )
    ) : 2))
  }

  const get_tasks_planned = async () => {
    try {
      setLoading(true);
      await new ActivitiesAPI().get_activities({

      })
        .then((result: any) => {
          const tasksPlanned: any = result ?? [];
          setPlannedTasks(tasksPlanned);

          let _markedDates: any = {
            // '2024-03-12': {
            //   customStyles: [
            //     { backgroundColor: '#63D3AC' },
            //     { backgroundColor: '#F0788E' },
            //     { backgroundColor: '#F2CD86' },
            //     { backgroundColor: '#9095FF' },
            //     { backgroundColor: '#44967D' },
            //     { backgroundColor: '#BA79B7' },
            //     { backgroundColor: '#E9B9C2' }
            //   ]
            // }
          }

          tasksPlanned.forEach((elt: any) => {
            if(elt.type == "vacation" && elt.planned_datetime_start && elt.planned_datetime_end){
              let elt_dates = getDatesBetween(elt.planned_datetime_start, elt.planned_datetime_end);
              let current_date_elt;
              for(let i=0; i<elt_dates.length; i++){
                current_date_elt = elt_dates[i];
                if (_markedDates[current_date_elt]) {
                  _markedDates[current_date_elt].datas.push({
                    backgroundColor: VALIDATION_PROCESS_COLORS[get_color_status_number(elt)],
                    ...{...elt, planned_date: current_date_elt}
                  });
                } else {
                  _markedDates[current_date_elt] = {
                    datas: [
                      {
                        backgroundColor: VALIDATION_PROCESS_COLORS[get_color_status_number(elt)],
                        ...{...elt, planned_date: current_date_elt}
                      }
                    ]
                  }
                }
              }

            }else{
              if (_markedDates[elt.planned_date]) {
                _markedDates[elt.planned_date].datas.push({
                  backgroundColor: VALIDATION_PROCESS_COLORS[get_color_status_number(elt)],
                  ...elt
                });
              } else {
                _markedDates[elt.planned_date] = {
                  datas: [
                    {
                      backgroundColor: VALIDATION_PROCESS_COLORS[get_color_status_number(elt)],
                      ...elt
                    }
                  ]
                }
              }
            }

            
          });

          Object.keys(_markedDates).forEach(function (key1) {
            Object.keys(_markedDates[key1]).forEach(function (key2) {

              _markedDates[key1][key2].sort((a: any, b: any) => {
                if (a.planned_datetime_start < b.planned_datetime_start) {
                  return -1;
                }
                if (a.planned_datetime_start > b.planned_datetime_start) {
                  return 1;
                }
                return 0;
              });
            });
          });

          setMarkedDates(_markedDates);

        }).catch((err: any) => {
          handleStorageError(err);
          console.log(err);
        });
      setLoading(false);
    } catch (error) {
      handleStorageError(error);
    }

  };

  const handleAddTask = async () => {
    setIsSyncing(true);
    try {
      let is_already_plan_today = false;
      // if (village && selectedDate &&
      if (
        (((!cantonsSelectedID || (cantonsSelectedID && cantonsSelectedID.length == 0)) || (cantonsSelectedID && cantonsSelectedID.length != 0 && villagesSelectedID && villagesSelectedID.length != 0)) && selectedDate &&
          (
            ((editPlan || newPlan) && (
              (etape || freeTaskTitle) && timeStart && timeEnd && component
            ))
            ||
            (reporting && component && (
              (completed && completedComment)
              ||
              (
                (undo && undoComment && !isAnother)
                ||
                (undo && undoComment && completedComment && isAnother && (
                  etape || freeTaskTitle
                ))
              )
            ))
          ))
        ||
        (
          isAddVacation && (vacationType && ((vacationType != "Autre") || (vacationType == "Autre" && vacationTypePrecision))) && vacationDateBegin && vacationDateEnd && vacationDateReturn
        )
      ) {
        if (isAddVacation) {
          taskPlanned = {
            id: activity?.id,
            type: "vacation",
            name: "Congé",
            description: vacationTypePrecision ?? vacationType?.name,
            vacation_type: vacationTypePrecision ?? vacationType?.name,
            planned_datetime_start: `${((vacationDateBegin instanceof Date) ? vacationDateBegin.toISOString() : vacationDateBegin).split('T')[0]}T00:00:00.000000Z`,
            planned_datetime_end: `${((vacationDateEnd instanceof Date) ? vacationDateEnd.toISOString() : vacationDateEnd).split('T')[0]}T00:00:00.000000Z`,
            vacation_return_datetime: `${((vacationDateReturn instanceof Date) ? vacationDateReturn.toISOString() : vacationDateReturn).split('T')[0]}T00:00:00.000000Z`,
            planned_date: null,
          }
        } else {
          var taskPlanned: any;
          if (newPlan) {
            is_already_plan_today = (markedDates[selectedDate]?.datas ?? []).findIndex((elt: any) => elt.name == (etape?.name ? etape?.name : freeTaskTitle) && villagesSelectedID && villagesSelectedID.find((v_id: any) => v_id == elt.administrative_level_id)) != -1;
          } else if (editPlan) {
            is_already_plan_today = (markedDates[selectedDate]?.datas ?? []).filter((elt: any) => elt.name == (etape?.name ? etape?.name : freeTaskTitle) && villagesSelectedID && villagesSelectedID.find((v_id: any) => v_id == elt.administrative_level_id))?.length >= 2;
          }
        }


        if (!is_already_plan_today) {
          setLoading(true);
          try {
            if (isAddVacation) {

            } else {
              if (reporting) {
                let result = await new ActivitiesAPI().get_activity(activity.id);
                if (!result.error) {
                  taskPlanned = {
                    ...result,
                    phase: result?.phase?.id ?? result?.phase,
                    activity: result?.activity?.id ?? result?.activity,
                    facilitator: result?.facilitator?.id ?? null,
                    user: result?.user?.id ?? null,
                  };
                }
                taskPlanned.completed = completed;
                taskPlanned.undo = undo;
                taskPlanned.is_another = isAnother;
                taskPlanned.is_free_task = isFreeTask;

                if (isAnother) {
                  taskPlanned.another_detail = {
                    phase: !isFreeTask ? (phase ?? null) : null,
                    activity: !isFreeTask ? (etape ?? null) : null,
                    name: !isFreeTask ? etape?.name : freeTaskTitle,
                    activty_sql_id: !isFreeTask ? (etape?.id ?? null) : null,
                    component: component ? (component?.name ?? null) : null,

                    administrative_level_ids: villagesSelectedID ? villagesSelectedID.map((v_id: any) => Number(v_id)) : null,
                    administrative_levels: villagesSelected ? villagesSelected.map((v: any) => { return { id: v.id, name: v.name, parent: v?.parent }; }) : null
                  }
                }

                taskPlanned.comment = completedComment;
                taskPlanned.undo_comment = undoComment;
                // taskPlanned.photo_uri = photoUri;
                // taskPlanned.updated_date = moment();
              } else {
                let _etape: any = etapes.find((elt: any) => elt.id == etape?.id);

                taskPlanned = {
                  id: activity?.id,
                  type: isAddExistingTask ? "task" : "free_task",
                  phase: isAddExistingTask ? phase?.id : null,
                  activity: isAddExistingTask ? etape?.id : null,
                  name: isAddExistingTask ? etape?.name : freeTaskTitle,
                  description: (isAddExistingTask && _etape?.id) ? _etape?.description : descriptionFreeTask,
                  administrative_level_ids: villagesSelectedID ? villagesSelectedID.map((v_id: any) => Number(v_id)) : null,
                  administrative_levels: villagesSelected ? villagesSelected.map((v: any) => { return { id: v.id, name: v.name, parent: v?.parent }; }) : null,
                  planned_date: `${selectedDate}`,
                  planned_datetime_start: `${selectedDate}T${timeStart.name}:00.000Z`,
                  planned_datetime_end: `${selectedDate}T${timeEnd.name}:00.000Z`,
                  component: component ? (component?.name ?? null) : null,
                  // created_date: moment(),
                  // updated_date: moment()
                };

                if (activity?.id && activity?.validated == false) {
                  taskPlanned = { ...taskPlanned, edit_after_invalidation: true }
                }
              }
            }
            
            await new ActivitiesAPI().save_activity(
              taskPlanned
            ).then(function (res: any) {
              if (res.error && res.error == "validated") {
                setErrorMessage(`Cette activité est déjà validée. Vous ne pouvez plus la modifier!`);
                setErrorVisible(true);
                return;
              } else {
                setVillagesSelectedID([]);
                setVillagesSelected(null);
                setCantonsSelectedID([]);
                setPhase(null);
                setEtape(null);
                setFreeTaskTitle(null);
                setDescriptionFreeTask(null);
                setTimeStart({ name: `00:00`, id: 0 });
                setTimeEnd(null);

                setCompleted(null);
                setUndo(null);
                setIsAnother(null);
                setIsFreeTask(null);
                setFreeTaskTitle(null);
                setDetailAnother(null);
                // setPhotoUri(null);
                setCompletedComment(null);
                setUndoComment(null);
                // setAnotherTache(null);
                setComponent(null);

                // setSelectedDate('');
                setModalVisibleAddPlan(false);
                setModalVisiblePlanningTaskReporting(false);

                setErrorMessage(`Votre agenda a été mise à jour avec succès`);
                setErrorVisible(true);
                setNewPlan(false);
                setEditPlan(false);
                setReporting(false);

                setVacationDateBegin(null);
                setVacationDateEnd(null);
                setVacationDateReturn(null);
                setVacationType(null);
                setVacationTypePrecision(null);
                setIsAddVacation(false);

                // setPlannedTasks([...plannedTasks, taskPlanned]);
                get_tasks_planned();
              }



              // compactDatabase(LocalDatabase);
            }).catch(function (err: any) {
              handleStorageError(err);
              // if (LocalDatabase._destroyed) {
              //   signOut();
              // }
            });
          } catch (error) {
            handleStorageError(error);
          }

          // });
          setLoading(false);
        } else {
          setErrorMessage(`Cette activité est déjà planifiée sur cette journée dans cette localité!`);
          setErrorVisible(true);
        }
      } else {
        if (isAddVacation) {
          if(!vacationType){
            setErrorMessage(`Veuillez sélectionner le type`);
          }else if(!vacationDateBegin){
            setErrorMessage(`Veuillez mentionner la date de départ`);
          }else if(!vacationDateEnd){
            setErrorMessage(`Veuillez mentionner la date de la fin du congé`);
          }else if(!vacationDateReturn){
            setErrorMessage(`Veuillez mentionner la date de retour`);
          }
        } else {
          if (cantonsSelectedID && cantonsSelectedID.length != 0 && (!villagesSelectedID || (villagesSelectedID && villagesSelectedID.length == 0))) {
            setErrorMessage(`Veuillez sélectionner au moins un lieu`);
          } else if (newPlan || editPlan) {
            if ((!etape || !phase) && isAddExistingTask) {
              setErrorMessage(`Veuillez sélectionner une activité`);
            } else if (!freeTaskTitle && !isAddExistingTask) {
              setErrorMessage(`Veuillez sélectionner l'activité`);
            } else if (!timeEnd) {
              setErrorMessage(`Veuillez définir le temps de l'activité`);
            } else if (!component) {
              setErrorMessage(`Veuillez sélectionner une composante`);
            } else {
              setErrorMessage(`Veuillez remplir tous les champs`);
            }
          }
          else if (reporting) {
            if (completed && !completedComment) {
              setErrorMessage(`Veuillez décrire l'activité éffectuée`);
            } else if (undo && !undoComment) {
              setErrorMessage(`Veuillez mentionner pourquoi l'activité planifiée n'a pas été éffectuée`);
            } else if (undo && isAnother && !isFreeTask && (!etape || !phase)) {
              setErrorMessage(`Veuillez sélectionner une activité`);
            } else if (undo && isAnother && isFreeTask && !freeTaskTitle) {
              setErrorMessage(`Veuillez mentionner l'activité`);
            } else if (!undo && !completed) {
              setErrorMessage(`Veuillez mentionner si l'activité est achevée ou a été défait`);
            } else if (!freeTaskTitle && isFreeTask) {
              setErrorMessage(`Veuillez mentionner l'activité`);
            } else if (!completedComment) {
              setErrorMessage(`Veuillez décrire l'activité éffectuée`);
            } else if (!component) {
              setErrorMessage(`Veuillez sélectionner une composante`);
            } else {
              setErrorMessage(`Veuillez remplir tous les champs`);
            }
          } else {
            setErrorMessage(`Veuillez remplir tous les champs`);
          }
        }
        setErrorVisible(true);
      }
    } catch (e) {
      console.error(e);
    }
    setIsSyncing(false);
  };

  const get_facilitator_couchdb_datas = async () => {
    try {
      // await LocalDatabase.find({
      //   selector: { type: 'facilitator' },
      // })
      /*
      await getDocumentsByAttributes({ type: 'facilitator' }, 250, 0, JSON.parse(await getData('my_no_sql_db_name')))
        .then(async (result: any) => {

          let villagesResult: any = (result?.docs[0]?.administrative_levels ?? []).map((elt: any) => {
            return {
              id: Number(elt.id),
              name: elt.name,
              parent: elt?.parent
            };
          });

          try {
            // await LocalDatabaseADL.find({
            //   selector: { type: 'adl', 'representative.email': result?.docs[0]?.email ?? null }
            // })
            await getDocumentsByAttributes({ type: 'adl', 'representative.email': result?.docs[0]?.email ?? null }, 250, 0, "eadls")
              .then((response: any) => {
                if (response.docs && response.docs[0] && response.docs[0].administrative_regions_objects) {
                  response.docs[0].administrative_regions_objects.forEach((elt: any) => {
                    if (elt.villages) villagesResult = villagesResult.concat(elt.villages.map((elt: any) => {
                      return {
                        id: Number(elt.id),
                        name: elt.name,
                        parent: elt?.parent
                      };
                    }));
                  });
                }
                villagesResult = clear_duplicate_on_liste(villagesResult);
              }).catch((err: any) => {
                console.log("Error1 : " + err);
                handleStorageError(err);
              });
          } catch (error) {
            handleStorageError(error);
          }

          // const v = villagesResult.find((elt: any) => elt.is_headquarters_village);

          setVillages(villagesResult);


        }).catch((err: any) => {
          handleStorageError(err);
          console.log(err);
        });
*/
      setLoading(true);
      await new AdministrativelevlsAPI().get_simple_administrativelevels({ types: ["Canton"] }, 1, 1000).then((r: any) => {
        setCantons(r?.results ?? [])
      });
      setLoading(false);

      try {
        await getDocumentsByAttributes({
          type: {
            $in: ['task', 'activity', 'phase']
          },
        }, 250, 0, "process_design")
          .then((result_2: any) => {
            const result_2_docs = result_2?.docs ?? [];
            let phs: any = result_2_docs.filter((elt: any) => elt.type == 'phase').map((elt: any) => {
              return { name: `${elt.name}`, id: elt.sql_id, description: elt.description }
            });
            let ths: any = result_2_docs.filter((elt: any) => elt.type == 'task').map((elt: any) => {
              return {
                name: `${elt.name}`, id: elt.sql_id, phase_name: elt.phase_name, activity_name: elt.activity_name, description: elt.description
              }
            });
            let ets: any = result_2_docs.filter((elt: any) => elt.type == 'activity').map((elt: any) => {
              return {
                name: `${elt.name}`, id: elt.sql_id, phase_name: ths.find((t: any) => t.activity_name == elt.name).phase_name, description: elt.description
              }
            });

            setPhases(phs);
            setEtapes(ets);


          }).catch((err: any) => {
            handleStorageError(err);
            console.log(err);
          });
      } catch (error) {
        handleStorageError(error);
      }


    } catch (error) {
      handleStorageError(error);
    }
  };

  const get_villages_by_cantons_id = async (parents_id: any, villages_selected_id: any = [], villages_selected: any = []) => {
    
    setLoading(true);
    if (parents_id && parents_id.length != 0) {
      await new AdministrativelevlsAPI().get_simple_administrativelevels({ types: ["Village"], parents_id: parents_id }, 1, 1000).then((r: any) => {
        let results = r?.results ?? [];
        setVillages(results);
        if (villages_selected_id && villages_selected_id.length != 0 && villages_selected && villages_selected.length != 0) {
          let vs_id_s = villages_selected_id.filter((v_id: any) => results.find((a: any) => a.id == v_id));
          setVillagesSelectedID(vs_id_s);
          setVillagesSelected(villages_selected.filter((v: any) => vs_id_s.includes(v.id)));
        }
      });
    } else {
      setVillages([]);
      setVillagesSelectedID([]);
      setVillagesSelected([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    get_tasks_planned();
    get_facilitator_couchdb_datas();
  }, []);

  const renderTaskItem = ({ item }: { item: any }) => {
    let color_index = get_color_status_number(item);
    let is_another_vacation_type = (item?.vacation_type && item?.type == "vacation") ? !TYPES_VACATION.includes(item?.vacation_type) : false;
    
    return (
      <View style={styles.container_hour_task_display}>
        <View style={styles.container_hour_display}>
          <Text key={`p${item.planned_datetime_start}`}
            style={[styles.hour]}>
            {
              (item?.type == "vacation") ? "" : `${moment(item.planned_datetime_start).format('HH:mm')} - ${moment(item.planned_datetime_end).format('HH:mm')}`
            }
          </Text>
        </View>
        <View style={[styles.taskItem, { backgroundColor: VALIDATION_PROCESS_COLORS[color_index] }]}>
          <View style={styles.container_task_display}>
            <View style={styles.container_check}>
              <View style={styles.check}>
                <FontAwesome name={(item.completed || item.is_another) ? "check-circle-o" : "circle-o"} size={24} color="white" />
              </View>
            </View>
            <View style={styles.container_task_adl}>
              <View>
                <Text style={[styles.taskTitle, { color: [5, 6].includes(color_index) ? 'white' : 'black' }]}>{`${item.name}`}{item?.vacation_type ? ` (${item?.vacation_type})` : ''}</Text>
              </View>
              <View>
                <Text style={[styles.adl, { color: [5, 6].includes(color_index) ? 'white' : 'black' }]}>
                  {(item?.administrative_levels && item?.administrative_levels?.length > 0) ? item?.administrative_levels.map((a: any) => a.name).join(", ") : "Lieu non défini"}
                </Text>
              </View>
            </View>
            <View style={styles.container_info_agenda}>
              <View style={styles.subcontainer_info_agenda_comments}>
                <View style={styles.subcontainer_info_agenda}>
                  <View style={styles.container_info}>
                    <TouchableOpacity
                      onPress={async () => {
                        setActivity(item);
                        setAttachments(item?.files);

                        setVillagesSelectedID(item?.administrative_level_ids ?? []);
                        setVillagesSelected(item?.administrative_levels ?? []);
                        setPhase(phases.find((elt: any) => elt.name == item.phase?.name));
                        setEtape(etapes.find((elt: any) => elt.name == item.name));

                        setCompleted(item?.completed ?? null);
                        setUndo(item?.undo ?? null);
                        setIsAnother(item?.is_another ?? null);
                        setIsFreeTask(item?.is_free_task ?? null);
                        setFreeTaskTitle(item?.type == "free_task" ? item?.name : null);
                        setDetailAnother(item?.another_detail ?? null);
                        // setPhotoUri(item?.photo_uri ?? null);
                        setCompletedComment(item?.comment ?? null);
                        setUndoComment(item?.undo_comment ?? null);
                        setComments(item?.comments ?? null);
                        setComponent(item?.component ? {id:item?.component, name:item?.component} : null);

                        setVacationDateBegin(item?.planned_datetime_start ?? null);
                        setVacationDateEnd(item?.planned_datetime_end ?? null);
                        setVacationDateReturn(item?.vacation_return_datetime ?? null);
                        setVacationType(is_another_vacation_type ? {id:"Autre", name:"Autre"} : (item?.vacation_type ? {id:item?.vacation_type, name:item?.vacation_type} : null));
                        setVacationTypePrecision(is_another_vacation_type ? item?.vacation_type : null);
                        setIsAddVacation(item?.type == "vacation");


                        setModalVisibleTaskDetail(true);
                      }}
                    >
                      <FontAwesome name="info-circle" size={22} color="white" />
                    </TouchableOpacity>
                  </View>
                  {(item?.type != "vacation") && <View style={styles.container_agenda}>
                    <TouchableOpacity
                      onPress={async () => {
                        if (item?.validated) {
                          setActivity(item);
                          setAttachments(item?.files);
                          
                          setVillagesSelectedID(item?.another_detail?.administrative_level_ids ?? []);
                          setVillagesSelected(item?.another_detail?.administrative_levels ?? []);
                          setPhase(phases.find((elt: any) => elt.name == item?.another_detail?.phase?.name));
                          setEtape(etapes.find((elt: any) => elt.name == item?.another_detail?.name));

                          setCompleted(item?.completed ?? null);
                          setUndo(item?.undo ?? null);
                          setIsAnother(item?.is_another ?? null);
                          setIsFreeTask(item?.is_free_task ?? null);
                          setDetailAnother(item?.another_detail ?? null);
                          setComponent(item?.component ? {id:item?.component, name:item?.component} : null);
                          // setPhotoUri(item?.photo_uri ?? null);
                          setCompletedComment(item?.comment ?? null);
                          setUndoComment(item?.undo_comment ?? null);
                          setIsAddExistingTask(item?.type == "task");
                          setIsAddVacation(item?.type == "vacation");

                          setFreeTaskTitle(!item?.another_detail?.activty_sql_id ? (item?.another_detail?.name ?? null) : null);
                          // setAnotherTache(etapes.find((elt: any) => elt.id == item?.another_detail?.activty_sql_id) ?? null);


                          // setSelectedDate('');
                          setNewPlan(false);
                          setEditPlan(false);
                          setReporting(true);

                          let c: any = [...new Set((item?.another_detail?.administrative_levels ?? []).filter((v: any) => v.parent).map((v: any) => v.parent))];
                          setCantonsSelectedID(c);
                          await get_villages_by_cantons_id(c, item?.another_detail?.administrative_level_ids ?? [], item?.another_detail?.administrative_levels ?? []);

                          setModalVisiblePlanningTaskReporting(true);
                        } else {
                          // if (item?.completed || item?.is_another) {
                          //   setErrorMessage(`Activité achevée`);
                          // } else {
                          //   setErrorMessage(`En attente de validation...\nCette activité n'est pas encore validée par un supervisoire ou un spécialiste`);
                          // }
                          // setErrorVisible(true);
                          delete_activity(item);
                        }

                      }}
                    >
                      <FontAwesome
                        name={item?.validated ? ((item.completed || item.is_another) ? "calendar-check-o" : "calendar-o") : "trash"}
                        size={20} color={item?.validated ? "white" : ([5, 6].includes(color_index) ? 'white' : 'red')} />
                    </TouchableOpacity>
                  </View>}
                </View>
                <View style={styles.subcontainer_comments}>
                  {(item?.comments && item?.comments?.length > 0) ? <View style={styles.container_info}>
                    <TouchableOpacity
                      onPress={() => {
                        setActivity(item);
                        setAttachments(item?.files);

                        setVillagesSelectedID(item?.administrative_level_ids ?? []);
                        setVillagesSelected(item?.administrative_levels ?? []);
                        setPhase(phases.find((elt: any) => elt.name == item.phase?.name));
                        setEtape(etapes.find((elt: any) => elt.name == item.name));

                        setCompleted(item?.completed ?? null);
                        setUndo(item?.undo ?? null);
                        setIsAnother(item?.is_another ?? null);
                        setIsFreeTask(item?.is_free_task ?? null);
                        setFreeTaskTitle(item?.type == "free_task" ? item?.name : null);
                        setDetailAnother(item?.another_detail ?? null);
                        // setPhotoUri(item?.photo_uri ?? null);
                        setCompletedComment(item?.comment ?? null);
                        setUndoComment(item?.undo_comment ?? null);
                        setComments(item?.comments ?? null);
                        setComponent(item?.component ? {id:item?.component, name:item?.component} : null);

                        setVacationDateBegin(item?.planned_datetime_start ?? null);
                        setVacationDateEnd(item?.planned_datetime_end ?? null);
                        setVacationDateReturn(item?.vacation_return_datetime ?? null);
                        setVacationType(is_another_vacation_type ? {id:"Autre", name:"Autre"} : (item?.vacation_type ? {id:item?.vacation_type, name:item?.vacation_type} : null));
                        setVacationTypePrecision(is_another_vacation_type ? item?.vacation_type : null);
                        setIsAddVacation(item?.type == "vacation");

                        setModalVisibleTaskComments(true);
                      }}
                    >
                      <FontAwesome name="envelope-o" size={20} color="white" />
                      {
                        ![null, undefined, 0].includes(item?.comments?.filter((elt: any) => [undefined, false, null].includes(elt.comment_read))?.length) &&
                        <Text style={styles.messages_length}>{item?.comments?.filter((elt: any) => [undefined, false, null].includes(elt.comment_read))?.length}</Text>
                      }
                    </TouchableOpacity>
                  </View> : <></>}

                  {(!item?.validated) && <View style={styles.container_agenda}>
                    <TouchableOpacity
                      onPress={async () => {
                        setActivity(item);

                        setVillagesSelectedID(item?.administrative_level_ids ?? []);
                        setVillagesSelected(item?.administrative_levels ?? []);
                        setPhase(phases.find((elt: any) => elt.name == item?.phase?.name));
                        setEtape(etapes.find((elt: any) => elt.name == item.name));
                        setComponent(item?.component ? {id:item?.component, name:item?.component} : null);

                        setFreeTaskTitle(item?.type == "task" ? null : item?.name);
                        setDescriptionFreeTask(item?.type == "task" ? null : item?.description);
                        setIsAddExistingTask(item?.type == "task");
                        //"2024-09-24T15:41:01.661035Z"
                        let _start = item?.planned_datetime_start ? item?.planned_datetime_start?.split("T")[1] : null;
                        let _end = item?.planned_datetime_end ? item?.planned_datetime_end?.split("T")[1] : null;
                        setTimeStart(_start ? TIMES_H.find((elt: any) => elt.name == `${_start.split(":")[0]}:${_start.split(":")[1]}`) : { name: `00:00`, id: 0 })
                        setTimeEnd(_end ? TIMES_H.find((elt: any) => elt.name == `${_end.split(":")[0]}:${_end.split(":")[1]}`) : null)


                        setVacationDateBegin(item?.planned_datetime_start ?? null);
                        setVacationDateEnd(item?.planned_datetime_end ?? null);
                        setVacationDateReturn(item?.vacation_return_datetime ?? null);
                        setVacationType(is_another_vacation_type ? {id:"Autre", name:"Autre"} : (item?.vacation_type ? {id:item?.vacation_type, name:item?.vacation_type} : null));
                        setVacationTypePrecision(is_another_vacation_type ? item?.vacation_type : null);
                        setIsAddVacation(item?.type == "vacation");

                        setNewPlan(false);
                        setEditPlan(true);
                        setReporting(false);

                        let c: any = [...new Set((item?.administrative_levels ?? []).filter((v: any) => v.parent).map((v: any) => v.parent))];
                        setCantonsSelectedID(c);
                        await get_villages_by_cantons_id(c, item?.administrative_level_ids ?? [], item?.administrative_levels ?? []);

                        setModalVisibleAddPlan(true);
                      }}
                    >
                      <FontAwesome
                        name="edit"
                        size={20} color="white" />
                    </TouchableOpacity>
                  </View>}

                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

    )
  };

  // const markedDates = plannedTasks.reduce((acc, task) => {
  //   acc[task.date] = {
  //     marked: true,
  //     dotColor: '#FFD700'
  //   };
  //   return acc;
  // }, {});

  // Format date function
  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('fr-FR', options);
  };

  const getPhoto = async () => {
    try {
      const result: any = await DocumentPicker.getDocumentAsync({
        type: ["image/*"],
        multiple: false,
      });
      let localUri = (!result) ? null : result.uri ?? (result.assets ? result.assets[0].uri : null);
      const type = (!result) ? null : (result.mimeType ?? (result.assets ? result.assets[0].type ?? result.assets[0].mimeType : null));
      let width = (!result) ? null : result.width ?? (result.assets ? result.assets[0].width : 1000);
      let height = (!result) ? null : result.height ?? (result.assets ? result.assets[0].height : 1000);

      if (type && type.toLowerCase().includes('image')) {
        const imageSize: any = await getImageSize(localUri);

        if (imageSize && imageSize >= 0.2) {
          const dimensions: any = await getImageDimensions(localUri);
          width = width ?? dimensions.width;
          height = height ?? dimensions.height;

          const manipResult = await ImageManipulator.manipulateAsync(
            localUri,
            [{ resize: { width: width, height: height } }],
            { compress: image_compress(imageSize) }//, format: ImageManipulator.SaveFormat.PNG },
          );
          localUri = manipResult.uri
        }

        // setPhotoUri(localUri);
        setModalVisibleAttachmentLoad(true);

      }


    } catch (err) {
      console.warn(err);
    }
  }

  const uploadImage = async (uri: string) => {
    setIsSyncing(true);
    setConnected(true);
    check_network();
    setLoading(true);
    if (connected) {
      try {
        const response = await uploadFile(
          `${baseURL}attachments/upload-to-issue`,
          {
            ...user,
            url: uri
          }
        );
        if (response.fileUrl) {
          // setPhotoUri(response.fileUrl.split("?")[0]);
          setModalVisibleAttachmentLoad(false);
        } else if (response.file) {
          toast.show({
            description: response.file[0],
            duration: 5000
          });
        } else {
          toast.show({
            description: `Une erreur est survenue! Il pourrait que la pièces jointe est introuvable sur votre portable.`,
            duration: 5000
          });
        }

      } catch (e) {
        console.log(e);
        toast.show({
          description: `Une erreur est survenue! Il pourrait que la pièces jointe est introuvable sur votre portable.`,
          duration: 3000
        });
      }

    }
    setIsSyncing(false);
    setLoading(false);
  };

  const showImage = (uri: string, width: number, height: number) => {
    if (uri) {
      if (uri.includes(".pdf")) {
        return (
          <View>
            <Image
              resizeMode="stretch"
              style={{ width: width, height: height, borderRadius: 10 }}
              source={require('../../../assets/illustrations/pdf.png')}
            />
          </View>
        );
      } else if (uri.includes(".docx") || uri.includes(".doc")) {
        return (
          <View>
            <Image
              resizeMode="stretch"
              style={{ width: width, height: height, borderRadius: 10 }}
              source={require('../../../assets/illustrations/docx.png')}
            />
          </View>
        );
      } else {
        return (
          <View>
            <Image
              source={{ uri: uri.split("?")[0] }}
              style={{ width: width, height: height, borderRadius: 10 }}
            />
          </View>
        );
      }
    }
    return (
      <View>
        <Image
          resizeMode="stretch"
          style={{ width: width, height: height, borderRadius: 10 }}
          source={require('../../../assets/illustrations/file.png')}
        />
      </View>
    );
  }

  const onRefresh = () => {
    setRefreshing(true);
    get_tasks_planned();
    get_facilitator_couchdb_datas();
    setRefreshing(false);
  }

  return (
    <>
      <ScrollView _contentContainerStyle={{ px: 5 }}
        nestedScrollEnabled={true}
        style={{ zIndex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {markedDates != null && <View style={styles.container}>
          <Calendar
            firstDay={1}
            monthHeaderstyle={{
              width: '60%',
              backgroundColor: 'red'
            }}
            monthText={{ color: 'red' }}
            arrowsHitSlop={25}
            // onDayPress={(day: any) => {
            //   setSelectedDate(day.dateString);
            // }}
            markedDates={{
              ...markedDates,
              // [selectedDate]: {
              //   selected: true,
              //   marked: true,
              //   customStyles: {
              //     container: {
              //       backgroundColor: '#00adf5',
              //       borderRadius: 10,
              //     },
              //     text: {
              //       color: 'white',
              //     },
              //   },
              // },
            }}
            markingType={'custom'}
            dayComponent={(props) => {
              return <CustomDay props={props}
                selectedDate={selectedDate} setSelectedDate={setSelectedDate}
                onDayPress={onDayPress} />;
            }}
            customStyles={{
              container: {
                backgroundColor: '#00adf5',
                borderRadius: 10,
              },
              text: {
                color: 'white',
              },
            }}
            theme={{
              calendarBorderColor: 'red',
              calendarBorderWidth: 1,
              weekVerticalMargin: 0,
              calendarBackground: 'white',
              selectedDayBackgroundColor: 'red',
              todayTextColor: '#FF6347',
              dayTextColor: 'black',
              arrowColor: 'green',
              textMonthFontWeight: 'bold',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 16,
              stylesheet: {
                calendar: {
                  header: {
                    header: {
                      color: 'red',
                      backgroundColor: 'red'
                    }

                  }
                }
              },
              current: {
                headerContainer: {
                  backgroundColor: 'red'
                }
              }
            }}
            monthFormat={'MMMM yyyy'}
          />


          {/* Selection Planning Options */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisibleSelectOption}
            onRequestClose={() => {
              setModalVisibleSelectOption(!modalVisibleSelectOption);
              setNewPlan(false);
              setEditPlan(false);
            }}>
            <View style={[styles.modalView, styles.modalViewOptions]}>
              <View style={styles.modalHeader}>
                <View style={styles.containerModalText}>
                  <Text style={styles.modalText}>Actions</Text>
                </View>
                <View style={styles.containerModalHeaderIcon}>
                  <TouchableOpacity
                    onPress={() => setModalVisibleSelectOption(false)} >
                    <FontAwesome name="close" size={24} color="grey" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.conatinerOptionsPlanning}>
                <TouchableOpacity
                  style={styles.optionPlanning}
                  onPress={() => {
                    setModalVisibleSelectOption(false);
                    setModalVisibleAddPlan(true);
                    setIsAddExistingTask(true);
                    setFreeTaskTitle(null);
                    setIsAddVacation(false);
                  }}
                >
                  <Box rounded="lg" p={3} mt={3} bg="white" shadow={1}>
                    <View style={styles.conatinerOptionPlanning}>
                      <View style={styles.conatinerOptionPlanningText}>
                        <Text style={styles.optionPlanningText}>Activité existante</Text>
                      </View>
                      <View style={styles.conatinerOptionPlanningIcon}>
                        <FontAwesome style={styles.optionPlanningIcon} name="chevron-right" size={24} color="black" />
                      </View>
                    </View>
                  </Box>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionPlanning}
                  onPress={() => {
                    setModalVisibleSelectOption(false);
                    setModalVisibleAddPlan(true);
                    setIsAddExistingTask(false);
                    setIsAddVacation(false);
                  }}
                >
                  <Box rounded="lg" p={3} mt={3} bg="white" shadow={1}>
                    <View style={styles.conatinerOptionPlanning}>
                      <View style={styles.conatinerOptionPlanningText}>
                        <Text style={styles.optionPlanningText}>Activité libre</Text>
                      </View>
                      <View style={styles.conatinerOptionPlanningIcon}>
                        <FontAwesome style={styles.optionPlanningIcon} name="chevron-right" size={24} color="black" />
                      </View>
                    </View>
                  </Box>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionPlanning}
                  onPress={() => {
                    setModalVisibleSelectOption(false);
                    setModalVisibleAddPlan(true);
                    setIsAddExistingTask(false);
                    setFreeTaskTitle(null);
                    setIsAddVacation(true);
                  }}
                >
                  <Box rounded="lg" p={3} mt={3} bg="white" shadow={1}>
                    <View style={styles.conatinerOptionPlanning}>
                      <View style={styles.conatinerOptionPlanningText}>
                        <Text style={styles.optionPlanningText}>Congé</Text>
                      </View>
                      <View style={styles.conatinerOptionPlanningIcon}>
                        <FontAwesome style={styles.optionPlanningIcon} name="chevron-right" size={24} color="black" />
                      </View>
                    </View>
                  </Box>
                </TouchableOpacity>

              </View>
            </View>
          </Modal>
          {/* End Selection Planning Options */}



          {/* Planning Task */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisibleAddPlan}
            onRequestClose={() => {
              setModalVisibleAddPlan(!modalVisibleAddPlan);
              setNewPlan(false);
              setEditPlan(false);
              setActivity(null);
            }}>
            <View style={[styles.modalView, styles.modalViewPlanning]}>
              <View style={styles.modalHeader}>
                <View style={styles.containerModalText}>
                  <Text style={styles.modalText}>
                    {isAddVacation ? `Planifier un congé` : (isAddExistingTask ? `Planifier une activité existante` : `Planifier une activité libre`)}
                  </Text>
                </View>
                <View style={styles.containerModalHeaderIcon}>
                  <TouchableOpacity
                    onPress={() => setModalVisibleAddPlan(false)} >
                    <FontAwesome name="close" size={24} color="grey" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.conatinerFieldsPlanning}>
                <ScrollView
                  nestedScrollEnabled={true}
                  style={{ zIndex: 1 }}
                >

                  {isAddVacation ? <>

                    <View style={{ marginTop: 15, flexDirection: 'row', }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ ...styles.subTitle }}>Type d'absence:</Text>
                        <SectionedOneSelectCustom
                          id={"id"}
                          K_OPTIONS={TYPES_VACATION.map((item: any) => {
                            return { name: item, id: item }
                          })}
                          items={TYPES_VACATION.map((item: any) => {
                            return { name: item, id: item }
                          })}
                          itemSelected={vacationType}
                          setItemSelected={(v: any)=>{
                            if(v && v.name != "Autre"){
                              setVacationTypePrecision(null);
                            }
                            setVacationType(v);
                          }}
                          otherStyles={{
                            borderRadius: 1,
                            padding: 10,
                          }} title={"Sélectionner le type d'absence"} searchText={"Rechercher un type"} />
                      </View>
                    </View>

                    {((vacationType && vacationType.name == "Autre")) && <View style={{ marginTop: 15, }}>
                      <Text style={{ ...styles.subTitle }}>Précision de type de congé:</Text>
                      <TextInputPaper
                        style={[
                          styles.grmInput,
                          {
                            borderColor: 'red'
                          }
                        ]}
                        outlineColor="#3e4000"
                        placeholderTextColor="#5f6800"
                        mode="outlined"
                        value={vacationTypePrecision}
                        onChangeText={(text) => setVacationTypePrecision(text)}
                        render={(innerProps) => (
                          <TextInput
                            {...innerProps}
                            style={[
                              innerProps.style,
                              {
                                paddingVertical: 8,
                                borderColor: 'red',
                              },
                            ]}
                          />
                        )}
                      />
                    </View>}

                    <View style={{ marginTop: 15, flexDirection: 'row', }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ ...styles.subTitle }}>Date d'absence:</Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            paddingHorizontal: 5,
                            paddingBottom: 10,
                            alignItems: 'center',
                          }}
                        >
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                            }}
                          >
                            <ButtonPaper
                              theme={{ ...theme, colors: { ...theme.colors, primary: 'white' } }}
                              compact
                              uppercase={false}
                              labelStyle={{ ...styles.dateBtnLabelStyle }}
                              mode="contained"
                              onPress={() => { }}
                            >
                              Du:
                            </ButtonPaper>
                            <ButtonPaper
                              theme={{ ...theme, colors: { ...theme.colors, primary: 'white' } }}
                              icon="calendar"
                              compact
                              style={{ ...styles.dateBtn }}
                              uppercase={false}
                              labelStyle={{ ...styles.dateBtnLabelStyle }}
                              mode="contained"
                              onPress={showDatePickerVacationBegin}
                            >
                              {vacationDateBegin ? moment(vacationDateBegin).format('DD-MMMM-YY') : "Date début du congé"}
                            </ButtonPaper>
                          </View>
                          <DateTimePickerModal
                            isVisible={isDateVisibleVacationBegin}
                            mode="date"
                            onConfirm={handleConfirmVacationBegin}
                            onCancel={hideDatePickerVacationBegin}
                            date={vacationDateBegin ? new Date(vacationDateBegin) : undefined}
                            // minimumDate={new Date()}
                          />
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            paddingHorizontal: 5,
                            paddingBottom: 10,
                            alignItems: 'center',
                          }}
                        >
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                            }}
                          >
                            <ButtonPaper
                              theme={{ ...theme, colors: { ...theme.colors, primary: 'white' } }}
                              compact
                              uppercase={false}
                              labelStyle={{ ...styles.dateBtnLabelStyle }}
                              mode="contained"
                              onPress={() => { }}
                            >
                              Au:
                            </ButtonPaper>
                            <ButtonPaper
                              theme={{ ...theme, colors: { ...theme.colors, primary: 'white' } }}
                              icon="calendar"
                              compact
                              style={{ ...styles.dateBtn }}
                              uppercase={false}
                              labelStyle={{ ...styles.dateBtnLabelStyle }}
                              mode="contained"
                              onPress={showDatePickerVacationEnd}
                            >
                              {vacationDateEnd ? moment(vacationDateEnd).format('DD-MMMM-YY') : "Date fin du congé"}
                            </ButtonPaper>
                          </View>
                          <DateTimePickerModal
                            isVisible={isDateVisibleVacationEnd}
                            mode="date"
                            onConfirm={handleConfirmVacationEnd}
                            onCancel={hideDatePickerVacationEnd}
                            date={vacationDateEnd ? new Date(vacationDateEnd) : undefined}
                            minimumDate={vacationDateBegin ? new Date(vacationDateBegin) : undefined}
                          />
                        </View>
                      </View>
                    </View>



                    <View style={{ marginTop: 15, flexDirection: 'row', }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ ...styles.subTitle }}>Date de retour:</Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            paddingHorizontal: 5,
                            paddingBottom: 10,
                            alignItems: 'center',
                          }}
                        >
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                            }}
                          >
                            <ButtonPaper
                              theme={{ ...theme, colors: { ...theme.colors, primary: 'white' } }}
                              icon="calendar"
                              compact
                              style={{ ...styles.dateBtn }}
                              uppercase={false}
                              labelStyle={{ ...styles.dateBtnLabelStyle }}
                              mode="contained"
                              onPress={showDatePickerVacationReturn}
                            >
                              {vacationDateReturn ? moment(vacationDateReturn).format('DD-MMMM-YY') : "Date de retour du congé"}
                            </ButtonPaper>
                          </View>
                          <DateTimePickerModal
                            isVisible={isDateVisibleVacationReturn}
                            mode="date"
                            onConfirm={handleConfirmVacationReturn}
                            onCancel={hideDatePickerVacationReturn}
                            date={vacationDateReturn ? new Date(vacationDateReturn) : undefined}
                            minimumDate={vacationDateEnd ? new Date(vacationDateEnd) : (vacationDateBegin ? new Date(vacationDateBegin) : undefined)}
                          />
                        </View>
                      </View>
                    </View>



                  </> : <>
                    <View>
                      <Text style={{ ...styles.subTitle }}>Canton(s):</Text>
                      <SectionedMultiSelectCustom
                        id={"id"}
                        K_OPTIONS={cantons.map((item: any) => {
                          return { name: `${item.name}`, id: item.id }
                        })}
                        items={cantons}
                        itemsSelected={cantonsSelectedID}
                        setItemsSelected={setCantonsSelectedID}
                        onConfirm={() => {
                          get_villages_by_cantons_id(cantonsSelectedID)
                        }}
                        otherStyles={{
                          borderRadius: 5,
                          padding: 10,
                        }} title={"Choisissez un ou plusieurs canton(s)"} searchText={"Rechercher un canton"} />
                    </View>

                    <View>
                      <Text style={{ ...styles.subTitle }}>Lieu(x):</Text>
                      <SectionedMultiSelectCustom
                        id={"id"}
                        K_OPTIONS={villages.map((item: any) => {
                          return { name: `${item.name}`, id: item.id }
                        })}
                        items={villages}
                        itemsSelected={villagesSelectedID}
                        setItemsSelected={setVillagesSelectedID}
                        // setItemsSelected={(v: any) => {
                        //   setVillagesSelectedID(v);

                        //   let vs = villages.filter((e: any) => v.includes(e.id) ?? []);
                        //   setVillagesSelected(vs);
                        // }}
                        onConfirm={() => {
                          let vs = villages.filter((e: any) => villagesSelectedID.includes(e.id) ?? []);
                          setVillagesSelected(vs);
                        }}
                        otherStyles={{
                          borderRadius: 5,
                          padding: 10,
                        }} title={"Choisissez un ou plusieurs village(s)"} searchText={"Rechercher un village"} />
                    </View>

                    {!isAddExistingTask && <View style={{ marginTop: 15, }}>
                      <Text style={{ ...styles.subTitle }}>Titre de l'activité:</Text>
                      <TextInputPaper
                        style={[
                          styles.grmInput,
                          {
                            borderColor: 'red'
                          }
                        ]}
                        outlineColor="#3e4000"
                        placeholderTextColor="#5f6800"
                        mode="outlined"
                        value={freeTaskTitle}
                        onChangeText={(text) => setFreeTaskTitle(text)}
                        render={(innerProps) => (
                          <TextInput
                            {...innerProps}
                            style={[
                              innerProps.style,
                              {
                                paddingVertical: 8,
                                borderColor: 'red',
                              },
                            ]}
                          />
                        )}
                      />
                    </View>}

                    {isAddExistingTask && <View style={{ marginTop: 15, flexDirection: 'row', }}>
                      <View style={{ flex: 0.49 }}>
                        <Text style={{ ...styles.subTitle }}>Phase:</Text>
                        <SectionedOneSelectCustom
                          id={"id"}
                          K_OPTIONS={phases}
                          items={phases}
                          itemSelected={phase}
                          setItemSelected={(v: any) => {
                            setPhase(v);
                            setEtape(null);
                          }}
                          otherStyles={{
                            borderRadius: 1,
                            padding: 10,
                          }} title={"Sélectionner la phase"} searchText={"Rechercher une phase"} />
                      </View>
                      <View style={{ flex: 0.02 }}></View>
                      <View style={{ flex: 0.49 }}>
                        <Text style={{ ...styles.subTitle }}>Activité:</Text>
                        <SectionedOneSelectCustom
                          id={"id"}
                          disabled={!(phase && phase.name)}
                          K_OPTIONS={(phase && phase.name) ? etapes.filter((elt: any) => elt.phase_name == phase.name) : etapes}
                          items={(phase && phase.name) ? etapes.filter((elt: any) => elt.phase_name == phase.name) : etapes}
                          itemSelected={etape}
                          setItemSelected={setEtape}
                          otherStyles={{
                            borderRadius: 1,
                            padding: 10,
                            backgroundColor: !(phase && phase.name) ? 'gray' : null,
                          }} title={!(phase && phase.name) ? "---" : "Sélectionner l'étape"} searchText={"Rechercher une étape"} />
                      </View>
                    </View>}


                    {!isAddExistingTask && <View >
                      <TextInputPaper
                        multiline
                        numberOfLines={4}
                        style={[
                          styles.grmInput,
                          {
                            height: 100,
                            justifyContent: 'flex-start',
                            textAlignVertical: 'top',
                            marginVertical: 11
                          },
                        ]}
                        placeholder={"Description de l'activité à éffectuer"}
                        outlineColor="#3e4000"
                        placeholderTextColor="#5f6800"
                        mode="outlined"
                        value={descriptionFreeTask}
                        onChangeText={(text) => setDescriptionFreeTask(text)}
                        render={(innerProps) => (
                          <TextInput
                            {...innerProps}
                            style={[
                              innerProps.style,
                              {
                                paddingTop: 8,
                                paddingBottom: 8,
                                height: 100,
                              },
                            ]}
                          />
                        )}
                      />
                    </View>}

                    <View style={{ marginTop: 15, flexDirection: 'row', }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ ...styles.subTitle }}>Composante:</Text>
                        <SectionedOneSelectCustom
                          id={"id"}
                          K_OPTIONS={COMPONENTS.map((item: any) => {
                            return { name: item, id: item }
                          })}
                          items={COMPONENTS.map((item: any) => {
                            return { name: item, id: item }
                          })}
                          itemSelected={component}
                          setItemSelected={setComponent}
                          otherStyles={{
                            borderRadius: 1,
                            padding: 10,
                          }} title={"Sélectionner la composante"} searchText={"Rechercher une composante"} />
                      </View>
                    </View>

                    <View style={{ marginTop: 15, }}>
                      <Text style={{ ...styles.subTitle }}>Horaire:</Text>
                      <View style={{
                        flexDirection: 'row', width: '80%', marginLeft: 25, alignItems: 'center'
                      }}>
                        <View style={{ flex: 0.4 }}>
                          <SectionedOneSelectCustom
                            id={"id"}
                            K_OPTIONS={TIMES_H}
                            items={TIMES_H}
                            itemSelected={timeStart}
                            setItemSelected={setTimeStart}
                            otherStyles={{
                              shadowColor: 'white',
                              shadowOpacity: 0,
                              shadowRadius: 0,
                              borderWidth: 0,
                              borderColor: 'black',
                              padding: 10,
                            }} searchText={"Rechercher une heure"} />
                        </View>
                        <View style={{ flex: 0.2 }}>
                          <Text style={{ textAlign: 'center' }}>à</Text>
                        </View>
                        <View style={{ flex: 0.4 }}>
                          <SectionedOneSelectCustom
                            id={"id"}
                            K_OPTIONS={TIMES_H.filter((elt: any, index: number) => {
                              if (timeStart.id < index) return elt
                            })}
                            items={TIMES_H}
                            itemSelected={timeEnd}
                            setItemSelected={setTimeEnd}
                            otherStyles={{
                              shadowColor: 'white',
                              shadowOpacity: 0,
                              shadowRadius: 0,
                              borderWidth: 0,
                              borderColor: 'black',
                              padding: 10,
                            }} title={'hh:mm'} searchText={"Rechercher une heure"} />
                        </View>
                      </View>
                    </View></>}

                  <View style={{ marginBottom: 300 }}></View>
                </ScrollView>
              </View>

              <View style={styles.conatinerConfirmBtnPlanning}>
                <View >
                  <TouchableOpacity
                    onPress={handleAddTask}
                    style={styles.confirmBtn}
                    disabled={isSyncing}
                  >
                    <Box
                      py={3}
                      px={8}
                      mt={6}
                      bg={isSyncing ? 'gray.500' : 'primary.500'}
                      rounded="xl"
                      borderWidth={1}
                      borderColor={isSyncing ? 'gray.500' : 'primary.500'}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Text style={{
                        fontWeight: 'bold', color: 'white', fontSize: 15
                      }}>
                        {isSyncing ? 'Enregistrement en cours...' : 'Confirmer'}
                      </Text>
                    </Box>
                  </TouchableOpacity>
                </View>
              </View>


              <Snackbar visible={errorVisible} duration={1000} onDismiss={onDismissSnackBar}>
                {errorMessage}
              </Snackbar>


            </View>
          </Modal>
          {/* End Planning Task */}





          {/* Task Detail */}
          {activity && <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisibleTaskDetail}
            onRequestClose={() => {
              setModalVisibleTaskDetail(!modalVisibleTaskDetail);
              setActivity(null);
              put_to_null_attrs();
            }}>
            <View style={[styles.modalView, styles.modalViewPlanning]}>
              <View style={styles.modalHeader}>
                <View style={[styles.containerModalText, { flexDirection: 'row' }]}>
                  <Text style={[styles.modalDetailText]}>{activity?.name}</Text>
                  {(activity?.completed || activity?.is_another) && <View style={[styles.detail_task_check, { marginLeft: 24 }]}>
                    <FontAwesome name="check-circle-o" size={24} color="#63D3AC" />
                  </View>}
                </View>
                <View style={styles.containerModalHeaderIcon}>
                  <TouchableOpacity
                    onPress={() => setModalVisibleTaskDetail(false)} >
                    <FontAwesome name="close" size={24} color="grey" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.conatinerFieldsPlanning}>
                <ScrollView
                  nestedScrollEnabled={true}
                  style={{ zIndex: 1 }}
                >
                  {activity?.phase?.name && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>Phase: </Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{activity?.phase?.name}</Text>
                    </View>
                  </View>}

                  {(activity?.type != "vacation" && activity?.name) && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>Activité: </Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{activity?.name}</Text>
                    </View>
                  </View>}

                  {(activity?.type != "vacation" && activity?.component) && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>Composante: </Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{activity?.component}</Text>
                    </View>
                  </View>}

                  {(activity?.type != "vacation" && activity?.description) && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>Description de l'activité : </Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{activity?.description ?? "Description non mentionnée"}</Text>
                    </View>
                  </View>}

                  {(activity?.type != "vacation") && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>Activité libre ? : </Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{activity?.type == "free_task" ? 'Oui' : 'Non'}</Text>
                    </View>
                  </View>}

                  {(activity?.type == "vacation" && activity?.vacation_type) && <View style={[styles.container_horizontal, {marginBottom: 25}]}>
                    <View >
                      <Text style={styles.horizontal_title}>Type de congé : </Text>
                    </View>
                    <View >
                      <Text style={styles.horizontal_value}>{activity?.vacation_type}</Text>
                    </View>
                  </View>}

                  {(activity?.administrative_levels && activity?.administrative_levels?.length > 0) && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>Village{activity?.administrative_levels?.length >= 2 ? 's' : ''}: </Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{activity?.administrative_levels.map((a: any) => a?.name).join(", ")}</Text>
                    </View>
                  </View>}

                  {(activity?.planned_date) && <View style={[styles.container_horizontal, { paddingVertical: 7 }]}>
                    <FontAwesome name="calendar" size={20} color={activity?.backgroundColor} />
                    <View style={{ marginLeft: 5 }}>
                      <Text>
                        {capitalizeFirstLetterForEachWord(moment(activity?.planned_date).format('dddd DD, MMMM YYYY'))} {moment(activity?.planned_datetime_start).format('HH:mm')} à {moment(activity?.planned_datetime_end).format('HH:mm')}
                      </Text>
                    </View>
                  </View>}

                  {(activity?.planned_datetime_start) && <View style={[styles.container_horizontal, { paddingVertical: 7 }]}>
                    <FontAwesome name="calendar" size={20} color={activity?.backgroundColor} />
                    <View style={{ marginLeft: 5 }}>
                      <Text>
                        Date d'absence : du {capitalizeFirstLetterForEachWord(moment(activity?.planned_datetime_start).format('dddd DD, MMMM YYYY'))} au {capitalizeFirstLetterForEachWord(moment(activity?.planned_datetime_end).format('dddd DD, MMMM YYYY'))}
                      </Text>
                    </View>
                  </View>}

                  {(activity?.vacation_return_datetime) && <View style={[styles.container_horizontal, { paddingVertical: 7 }]}>
                    <FontAwesome name="calendar" size={20} color={activity?.backgroundColor} />
                    <View style={{ marginLeft: 5 }}>
                      <Text>
                        Date de retour : {capitalizeFirstLetterForEachWord(moment(activity?.vacation_return_datetime).format('dddd DD, MMMM YYYY'))}
                      </Text>
                    </View>
                  </View>}

                  {activity?.undo && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>Activité planifiée non fait (Raison) : </Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{activity?.undo_comment ?? "Raison non mentionnée"}</Text>
                    </View>
                  </View>}


                  {
                    activity?.is_another && <View style={{ marginTop: 11 }}>
                      <Text>Autre activité a été éffectuée à la place de celle qui était planifiée. Ci-dessous les détails de l'activité réalisée</Text>

                      {activity?.another_detail && <View>
                        {activity?.another_detail?.phase && <View style={styles.container_horizontal}>
                          <View style={styles.container_horizontal_title}>
                            <Text style={styles.horizontal_title}>Phase: </Text>
                          </View>
                          <View style={styles.container_horizontal_value}>
                            <Text style={styles.horizontal_value}>{activity?.another_detail?.phase?.name}</Text>
                          </View>
                        </View>}

                        <View style={styles.container_horizontal}>
                          <View style={styles.container_horizontal_title}>
                            <Text style={styles.horizontal_title}>Activité: </Text>
                          </View>
                          <View style={styles.container_horizontal_value}>
                            <Text style={styles.horizontal_value}>{activity?.another_detail?.name}</Text>
                          </View>
                        </View>

                        {(activity?.another_detail?.component) && <View style={styles.container_horizontal}>
                          <View style={styles.container_horizontal_title}>
                            <Text style={styles.horizontal_title}>Composante: </Text>
                          </View>
                          <View style={styles.container_horizontal_value}>
                            <Text style={styles.horizontal_value}>{activity?.another_detail?.component}</Text>
                          </View>
                        </View>}

                        <View style={styles.container_horizontal}>
                          <View style={styles.container_horizontal_title}>
                            <Text style={styles.horizontal_title}>Activité libre ? : </Text>
                          </View>
                          <View style={styles.container_horizontal_value}>
                            <Text style={styles.horizontal_value}>{activity?.is_free_task ? 'Oui' : 'Non'}</Text>
                          </View>
                        </View>

                        {(activity?.another_detail?.administrative_levels && activity?.another_detail?.administrative_levels?.length > 0) && <View style={styles.container_horizontal}>
                          <View style={styles.container_horizontal_title}>
                            <Text style={styles.horizontal_title}>Village{activity?.another_detail?.administrative_levels?.length >= 2 ? 's' : ''}: </Text>
                          </View>
                          <View style={styles.container_horizontal_value}>
                            <Text style={styles.horizontal_value}>{activity?.another_detail?.administrative_levels.map((a: any) => a?.name).join(", ")}</Text>
                          </View>
                        </View>}

                      </View>}

                    </View>
                  }

                  {(activity?.completed || activity?.is_another) && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>Commentaire: </Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{activity?.comment ?? "Commentaire non mentionné"}</Text>
                    </View>
                  </View>}


                  {/* {activity?.photo_uri && <ImageBackground
                    key={activity?.photo_uri}
                    source={{ uri: activity?.photo_uri }}
                    style={{
                      height: 210,
                      width: 210,
                      marginHorizontal: 1,
                      alignSelf: 'flex-start',
                      justifyContent: 'flex-end',
                      marginVertical: 20,
                    }}
                  >

                  </ImageBackground>} */}
                  {(activity?.type != "vacation") && <View style={{ flex: 1 }}>
                    <PlanningAttachmentsComponent
                      activity={activity}
                      attachments={attachments}
                      setAttachments={setAttachments}
                    />
                  </View>}



                  <TaskCommentsHistory
                    comments={comments}
                    commentsRead={activity?.comments?.find((elt: any) => elt.comment_read == false)}
                    selectedDate={selectedDate}
                    setComments={setComments}
                    taskPlanned={activity}
                    onRefresh={onRefresh}
                  />


                  {/* {activity?.planning && activity?.planning?.length == 1 && <View style={styles.detail_task_check}>
                  <FontAwesome
                    name={(activity?.completed || activity?.is_another) ? "check-circle-o" : "circle-o"}
                    size={screenWidth - 30}
                    color={(activity?.completed || activity?.is_another) ? "#63D3AC" : "gray"} />
                </View>} */}


                </ScrollView>
              </View>


            </View>
          </Modal>}
          {/* End Task Detail */}


          {/* Task Reporting */}
          {activity && <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisiblePlanningTaskReporting}
            onRequestClose={() => {
              setModalVisiblePlanningTaskReporting(!modalVisiblePlanningTaskReporting);
              setReporting(false);
              setIsAddVacation(false);
              setActivity(null);
              put_to_null_attrs();
            }}>
            <View style={[styles.modalView, styles.modalViewPlanning]}>
              <View style={styles.modalHeader}>
                <View style={[styles.containerModalText, { flexDirection: 'row' }]}>
                  <Text style={[styles.modalDetailText]}>Rend compte</Text>
                  {(activity?.completed || activity?.is_another) && <View style={[styles.detail_task_check, { marginLeft: 24 }]}>
                    <FontAwesome name="check-circle-o" size={24} color="#63D3AC" />
                  </View>}
                </View>
                <View style={styles.containerModalHeaderIcon}>
                  <TouchableOpacity
                    onPress={() => setModalVisiblePlanningTaskReporting(false)} >
                    <FontAwesome name="close" size={24} color="grey" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.conatinerFieldsPlanning}>
                <ScrollView
                  nestedScrollEnabled={true}
                  style={{ zIndex: 1 }}
                >
                  {activity?.phase?.name && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>Phase: </Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{activity?.phase?.name}</Text>
                    </View>
                  </View>}

                  {activity?.name && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>Activité: </Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{activity?.name}</Text>
                    </View>
                  </View>}

                  {activity?.description && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>Description de l'activité : </Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{activity?.description ?? "Description non mentionnée"}</Text>
                    </View>
                  </View>}

                  {(activity?.administrative_levels && activity?.administrative_levels?.length > 0) && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>Village{activity?.administrative_levels?.length >= 2 ? 's' : ''}: </Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{activity?.administrative_levels.map((a: any) => a.name).join(", ")}</Text>
                    </View>
                  </View>}

                  <View style={[styles.container_horizontal, { paddingVertical: 7 }]}>
                    <FontAwesome name="calendar" size={20} color={activity?.backgroundColor} />
                    <View style={{ marginLeft: 5 }}>
                      <Text>
                        {capitalizeFirstLetterForEachWord(moment(activity?.planned_date).format('dddd DD, MMMM YYYY'))} {moment(activity?.planned_datetime_start).format('HH:mm')} à {moment(activity?.planned_datetime_end).format('HH:mm')}
                      </Text>
                    </View>
                  </View>


                  <>

                    {!undo && <View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <Checkbox.Android
                          color="#63D3AC"
                          status={completed ? 'checked' : 'unchecked'}
                          onPress={() => {
                            // setActivity({ ...activity, completed: !completed });
                            setCompleted(!completed);
                          }}
                        />
                        <Text style={[styles.title, { flex: 1 }]}>Activité achevée</Text>
                      </View>
                    </View>}

                    {!completed && <View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <Checkbox.Android
                          color="#63D3AC"
                          status={undo ? 'checked' : 'unchecked'}
                          onPress={() => {
                            // setActivity({ ...activity, undo: !undo });
                            setUndo(!undo);
                          }}
                        />
                        <Text style={[styles.title, { flex: 1 }]}>Je n'ai pas pu effectuer la tâche</Text>
                      </View>

                      {(undo) && <View >
                        <TextInputPaper
                          multiline
                          numberOfLines={4}
                          style={[
                            styles.grmInput,
                            {
                              height: 100,
                              justifyContent: 'flex-start',
                              textAlignVertical: 'top',
                              marginVertical: 11
                            },
                          ]}
                          placeholder={"Mettez ici la raison du pourquoi vous n'aviez pas pu éffectuer l'activité (ceci est obligatoire)"}
                          outlineColor="#3e4000"
                          placeholderTextColor="#5f6800"
                          mode="outlined"
                          value={undoComment}
                          onChangeText={(text) => setUndoComment(text)}
                          render={(innerProps) => (
                            <TextInput
                              {...innerProps}
                              style={[
                                innerProps.style,
                                {
                                  paddingTop: 8,
                                  paddingBottom: 8,
                                  height: 100,
                                },
                              ]}
                            />
                          )}
                        />
                      </View>}

                    </View>}


                    {undo && <View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <Checkbox.Android
                          color="#63D3AC"
                          status={isAnother ? 'checked' : 'unchecked'}
                          onPress={() => {
                            // setActivity({ ...activity, isAnother: !isAnother });
                            setIsAnother(!isAnother);
                          }}
                        />
                        <Text style={[styles.title, { flex: 1 }]}>J'ai éffectué une autre activité à la place</Text>
                      </View>
                    </View>}

                    {(undo && isAnother) && <View>

                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <Checkbox.Android
                          color="#63D3AC"
                          status={isFreeTask ? 'checked' : 'unchecked'}
                          onPress={() => {
                            setIsFreeTask(!isFreeTask);
                          }}
                        />
                        <Text style={[styles.title, { flex: 1 }]}>L'activité éffectuée est une activité libre ?</Text>
                      </View>


                      <View>
                        <Text style={{ ...styles.subTitle }}>Canton(s):</Text>
                        <SectionedMultiSelectCustom
                          id={"id"}
                          K_OPTIONS={cantons.map((item: any) => {
                            return { name: `${item.name}`, id: item.id }
                          })}
                          items={cantons}
                          itemsSelected={cantonsSelectedID}
                          setItemsSelected={setCantonsSelectedID}
                          onConfirm={() => {
                            get_villages_by_cantons_id(cantonsSelectedID)
                          }}
                          otherStyles={{
                            borderRadius: 5,
                            padding: 10,
                          }} title={"Choisissez un ou plusieurs canton(s)"} searchText={"Rechercher un canton"} />
                      </View>

                      <View>
                        <Text style={{ ...styles.subTitle }}>Lieu(x):</Text>
                        <SectionedMultiSelectCustom
                          id={"id"}
                          K_OPTIONS={villages.map((item: any) => {
                            return { name: `${item.name}`, id: item.id }
                          })}
                          items={villages}
                          itemsSelected={villagesSelectedID}
                          setItemsSelected={setVillagesSelectedID}
                          // setItemsSelected={(v: any) => {
                          //   setVillagesSelectedID(v);

                          //   let vs = villages.filter((e: any) => v.includes(e.id) ?? []);
                          //   setVillagesSelected(vs);
                          // }}
                          onConfirm={() => {
                            let vs = villages.filter((e: any) => villagesSelectedID.includes(e.id) ?? []);
                            setVillagesSelected(vs);
                          }}
                          otherStyles={{
                            borderRadius: 5,
                            padding: 10,
                          }} title={"Choisissez un ou plusieurs village(s)"} searchText={"Rechercher un village"} />
                      </View>

                      {isFreeTask && <View style={{ marginTop: 8 }}>
                        <Text style={{ ...styles.subTitle }}>Titre de l'activité:</Text>
                        <TextInputPaper
                          style={[
                            styles.grmInput,
                            {
                              borderColor: 'red'
                            }
                          ]}
                          // placeholder={"Description de l'activité éffectuée"}
                          outlineColor="#3e4000"
                          placeholderTextColor="#5f6800"
                          mode="outlined"
                          value={freeTaskTitle}
                          onChangeText={(text) => setFreeTaskTitle(text)}
                          render={(innerProps) => (
                            <TextInput
                              {...innerProps}
                              style={[
                                innerProps.style,
                                {
                                  paddingVertical: 8,
                                  borderColor: 'red',
                                },
                              ]}
                            />
                          )}
                        />
                      </View>}

                      {!isFreeTask && <View style={{ marginTop: 15, flexDirection: 'row', }}>
                        <View style={{ flex: 0.49 }}>
                          <Text style={{ ...styles.subTitle }}>Phase:</Text>
                          <SectionedOneSelectCustom
                            id={"id"}
                            K_OPTIONS={phases}
                            items={phases}
                            itemSelected={phase}
                            setItemSelected={(v: any) => {
                              setPhase(v);
                              setEtape(null);
                            }}
                            otherStyles={{
                              borderRadius: 1,
                              padding: 10,
                            }} title={"Sélectionner la phase"} searchText={"Rechercher une phase"} />
                        </View>
                        <View style={{ flex: 0.02 }}></View>
                        <View style={{ flex: 0.49 }}>
                          <Text style={{ ...styles.subTitle }}>Activité:</Text>
                          <SectionedOneSelectCustom
                            id={"id"}
                            disabled={!(phase && phase.name)}
                            K_OPTIONS={(phase && phase.name) ? etapes.filter((elt: any) => elt.phase_name == phase.name) : etapes}
                            items={(phase && phase.name) ? etapes.filter((elt: any) => elt.phase_name == phase.name) : etapes}
                            itemSelected={etape}
                            setItemSelected={setEtape}
                            otherStyles={{
                              borderRadius: 1,
                              padding: 10,
                              backgroundColor: !(phase && phase.name) ? "gray" : null,
                            }} title={!(phase && phase.name) ? "---" : "Sélectionner l'étape"} searchText={"Rechercher une étape"} />
                        </View>
                      </View>}


                    </View>}

                    {(completed || isAnother) && <View >
                      <TextInputPaper
                        multiline
                        numberOfLines={4}
                        style={[
                          styles.grmInput,
                          {
                            height: 100,
                            justifyContent: 'flex-start',
                            textAlignVertical: 'top',
                            marginVertical: 11
                          },
                        ]}
                        placeholder={"Description de l'activité éffectuée/Compte rendu"}
                        outlineColor="#3e4000"
                        placeholderTextColor="#5f6800"
                        mode="outlined"
                        value={completedComment}
                        onChangeText={(text) => setCompletedComment(text)}
                        render={(innerProps) => (
                          <TextInput
                            {...innerProps}
                            style={[
                              innerProps.style,
                              {
                                paddingTop: 8,
                                paddingBottom: 8,
                                height: 100,
                              },
                            ]}
                          />
                        )}
                      />
                    </View>}

                    <View style={{ marginTop: 15, flexDirection: 'row', }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ ...styles.subTitle }}>Composante:</Text>
                        <SectionedOneSelectCustom
                          id={"id"}
                          K_OPTIONS={COMPONENTS.map((item: any) => {
                            return { name: item, id: item }
                          })}
                          items={COMPONENTS.map((item: any) => {
                            return { name: item, id: item }
                          })}
                          itemSelected={component}
                          setItemSelected={setComponent}
                          otherStyles={{
                            borderRadius: 1,
                            padding: 10,
                          }} title={"Sélectionner la composante"} searchText={"Rechercher une composante"} />
                      </View>
                    </View>

                  </>

                  <View style={{ flex: 1 }}>
                    <PlanningAttachmentsComponent
                      activity={activity}
                      attachments={attachments}
                      setAttachments={setAttachments}
                    />
                  </View>


                  {/* {photoUri ? <ImageBackground
                    key={photoUri}
                    source={{ uri: photoUri }}
                    style={{
                      height: 210,
                      width: 210,
                      marginHorizontal: 1,
                      alignSelf: 'flex-start',
                      justifyContent: 'flex-end',
                      marginVertical: 20,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setPhotoUri(null)}
                      style={{
                        alignItems: 'center',
                        padding: 5,
                        backgroundColor: 'rgba(255, 1, 1, 1)',
                      }}
                    >
                      <Text style={{ color: 'white' }}>X</Text>
                    </TouchableOpacity>
                  </ImageBackground>
                    :
                    <TouchableOpacity
                      onPress={getPhoto}
                      key={activity?.name ?? activity?.activty_sql_id}
                      style={{ flexDirection: 'row', justifyContent: 'flex-start' }}
                    >
                      <Box
                        py={1}
                        px={3}
                        mt={8}
                        mb={4}
                        bg={'gray.500'}
                        rounded="xl"
                        borderWidth={1}
                        borderColor={'gray.500'}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Text style={{ fontWeight: "bold", fontSize: 15, color: "white" }}>JOINDRE UNE PHOTO</Text>
                      </Box>
                    </TouchableOpacity>} */}





                  <View style={{ marginBottom: 300 }}></View>
                </ScrollView>
              </View>

              <View style={styles.conatinerConfirmBtnPlanning}>
                <View >
                  <TouchableOpacity
                    onPress={handleAddTask}
                    style={styles.confirmBtn}
                    disabled={isSyncing}
                  >
                    <Box
                      py={3}
                      px={8}
                      mt={6}
                      bg={isSyncing ? 'gray.500' : 'primary.500'}
                      rounded="xl"
                      borderWidth={1}
                      borderColor={isSyncing ? 'gray.500' : 'primary.500'}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Text style={{
                        fontWeight: 'bold', color: 'white', fontSize: 15
                      }}>
                        {isSyncing ? 'Enregistrement en cours...' : 'Confirmer'}
                      </Text>
                    </Box>
                  </TouchableOpacity>
                </View>
              </View>

              <Snackbar visible={errorVisible} duration={1000} onDismiss={onDismissSnackBar}>
                {errorMessage}
              </Snackbar>

            </View>
          </Modal>}
          {/* End Task Reporting */}


          {/* Attachment load */}
          {/* <ModalBase
            isOpen={modalVisibleAttachmentLoad}
            onClose={() => setModalVisibleAttachmentLoad(false)}
            size="lg"
          >
            <ModalBase.Content maxWidth="400px">
              <ModalBase.Header style={{ flexDirection: 'row', justifyContent: 'center' }}>
                PIÈCE JOINTE
              </ModalBase.Header>

              <ModalBase.Body>
                <VStack space="sm">

                  <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    {
                      showImage(photoUri ? photoUri : null, 250, 250)
                    }
                  </View>

                  <View
                    style={{ flexDirection: 'row', alignSelf: 'center', alignItems: 'center', flex: 1, top: -70, width: 250, backgroundColor: 'rgba(52, 52, 52, alpha)' }}>

                    <TouchableOpacity style={{ flex: 0.3, justifyContent: 'center', alignItems: 'center' }}
                      onPress={() => {
                        getPhoto();
                      }} >
                      <Box rounded="lg"   >
                        <Image
                          resizeMode="stretch"
                          style={{ width: 50, height: 50, borderRadius: 50 }}
                          source={require('../../../assets/illustrations/gallery.png')}
                        />
                      </Box>
                    </TouchableOpacity>

                  </View>


                  {
                    (photoUri && !(photoUri.includes('http') || photoUri.includes('https'))) ?
                      <>
                        <ButtonBase mt={1} mb={2}
                          rounded="xl"
                          onPress={() => { uploadImage(photoUri); }}
                          isLoading={isSyncing}
                          isLoadingText={"Synchronisation en cours..."}
                          isDisabled={photoUri && (photoUri.includes('http') || photoUri.includes('https'))}
                        >
                          Synchroniser
                        </ButtonBase>
                        {
                          (photoUri && photoUri.includes('file://')) &&
                          <ButtonBase mt={1} mb={2}
                            rounded="xl"
                            onPress={() => {
                              setIsDeleting(true);
                              setModalVisibleAttachmentLoad(false);
                              setPhotoUri(null);
                              setIsDeleting(false);
                            }}
                            isLoading={isDeleting}
                            isDisabled={!(photoUri) || isSyncing}
                            bgColor={'red.500'}
                          >
                            Supprimer
                          </ButtonBase>
                        }
                      </>
                      :
                      <ButtonBase mt={1} mb={2}
                        rounded="xl"
                        onPress={() => {
                          setIsDeleting(true);
                          setModalVisibleAttachmentLoad(false);
                          setPhotoUri(null);
                          setIsDeleting(false);
                        }}
                        isLoading={isDeleting}
                        isDisabled={!(photoUri) || isSyncing}
                        bgColor={'red.500'}
                      >
                        Supprimer
                      </ButtonBase>
                  }
                </VStack>
              </ModalBase.Body>
            </ModalBase.Content>
          </ModalBase> */}
          {/* End Attachment load */}


          {/* Task Comments */}
          {activity && <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisibleTaskComments}
            onRequestClose={() => {
              setModalVisibleTaskComments(!modalVisibleTaskComments);
            }}>
            <View style={[styles.modalView, styles.modalViewPlanning]}>
              <View style={styles.modalHeader}>
                <View style={[styles.containerModalText, { flexDirection: 'row' }]}>
                  <Text style={[styles.modalDetailText]}>{activity?.name}</Text>
                  {(activity?.completed || activity?.is_another) && <View style={[styles.detail_task_check, { marginLeft: 24 }]}>
                    <FontAwesome name="check-circle-o" size={24} color="#63D3AC" />
                  </View>}
                </View>
                <View style={styles.containerModalHeaderIcon}>
                  <TouchableOpacity
                    onPress={() => setModalVisibleTaskComments(false)} >
                    <FontAwesome name="close" size={24} color="grey" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.conatinerFieldsPlanning}>
                <ScrollView
                  nestedScrollEnabled={true}
                  style={{ zIndex: 1 }}
                >

                  <TaskCommentsHistory
                    comments={comments}
                    commentsRead={activity?.comments?.find((elt: any) => [false, null, undefined].includes(elt.comment_read))}
                    selectedDate={selectedDate}
                    setComments={setComments}
                    taskPlanned={activity}
                    onRefresh={onRefresh}
                  />

                </ScrollView>
              </View>


            </View>
          </Modal>}
          {/* End Task Comments */}



          <View style={styles.taskListContainer}>
            <Text style={styles.taskListDate}>
              {selectedDate ? `${capitalizeFirstLetterForEachWord(moment(selectedDate).format('dddd DD, MMMM YYYY'))}` : 'Sélectionnez une date'}
            </Text>
            {/* <ScrollView
            nestedScrollEnabled={true}
            style={{ zIndex: 1 }}
          > */}
            {markedDates != null ? <FlatList
              data={markedDates[selectedDate]?.datas ?? []}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderTaskItem}
              ListEmptyComponent={<Text style={styles.noTasksText}>Pas de tâches planifiées pour cette date</Text>}
            /> : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="large" color="#24c38b" />
            </View>}
            {/* </ScrollView> */}
          </View>


          <Snackbar visible={errorVisible} duration={3000} onDismiss={onDismissSnackBar}>
            {errorMessage}
          </Snackbar>

        </View>}
      </ScrollView>

      {selectedDate && <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          put_to_null_attrs();

          setActivity(null);
          setNewPlan(true);
          setEditPlan(false);
          setReporting(false);
          setIsAddVacation(false);
          setModalVisibleSelectOption(true);
        }}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>}


      <LoadingScreen visible={isLoading} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 13,
    // alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalViewOptions: {
    marginVertical: '50%',
    marginHorizontal: 20,
  },
  modalViewPlanning: {
    // height: '95%',
    // marginTop: '10%'
    height: screenHeight - 55,
    marginTop: 55
  },
  modalHeader: {
    flexDirection: 'row',
  },
  containerModalText: {
    flex: 0.7
  },
  containerModalHeaderIcon: {
    flex: 0.3,
    alignItems: 'flex-end',
    top: 0
  },
  modalText: {
    textAlign: 'left',
    fontWeight: '500',
    fontSize: 25
  },



  conatinerOptionsPlanning: {
    marginBottom: 5,
    padding: 5
  },
  optionPlanning: {
    elevation: 10
  },
  conatinerOptionPlanning: {
    flexDirection: 'row',
    marginVertical: 1
  },
  conatinerOptionPlanningText: {
    flex: 0.9
  },
  conatinerOptionPlanningIcon: {
    flex: 0.1
  },
  optionPlanningText: {
    fontWeight: '300',
    marginRight: 50,
  },
  optionPlanningIcon: {
    fontWeight: '100',
    alignItems: 'flex-end',
  },


  conatinerFieldsPlanning: {
    padding: 15,
    marginBottom: 137//'37%'
  },

  conatinerConfirmBtnPlanning: {
    position: 'absolute',
    bottom: 0,
    marginBottom: 25,
    alignSelf: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmBtn: {
    justifyContent: 'center'
  },



  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    width: '100%',
    paddingLeft: 10,
  },


  container_hour_task_display: {
    flexDirection: 'row',
  },
  container_hour_display: {
    flex: 0.15,
  },
  hour: {
    color: 'gray',
    borderBottomColor: 'gray',
    borderBottomWidth: 2,
    paddingBottom: 5
  },
  taskItem: {
    flex: 0.85,
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#D9D9D9',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  container_task_display: {
    flexDirection: 'row',

  },
  container_check: {
    flex: 0.1,
  },
  check: {
    alignItems: 'center',
    marginVertical: 11
  },
  container_task_adl: {
    flex: 0.7,
    paddingLeft: 7
  },
  taskTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 7
  },
  adl: {
    fontSize: 10
  },
  container_info_agenda: {
    flex: 0.2,
  },
  subcontainer_info_agenda_comments: {
    flexDirection: 'column',
  },
  subcontainer_info_agenda: {
    flexDirection: 'row',
  },
  container_info: {
    flex: 0.5,
  },
  container_agenda: {
    flex: 0.5,
  },
  subcontainer_comments: {
    flexDirection: 'row',
    flex: 1,
    alignSelf: "flex-end"
  },
  taskSubtitle: {
    fontSize: 14,
    color: 'gray',
    marginLeft: 10,
  },
  messages_length: {
    fontSize: 7,
    backgroundColor: 'red',
    borderRadius: 11,
    width: 15,
    textAlign: 'center',
    color: 'white',
    alignSelf: "flex-end",
    marginTop: -10
  },
  // addButton: {
  //   position: 'absolute',
  //   right: 5,
  //   top: 0,
  //   backgroundColor: 'green',
  //   width: 25,
  //   height: 25,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   elevation: 8
  // },
  addButton: {
    position: 'absolute',
    bottom: 25,
    right: 10,
    // marginBottom: 500,
    backgroundColor: '#63D3AC',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    elevation: 8,
    zIndex: 9,

  },
  addButtonText: {
    color: 'white',
    fontSize: 30,
    lineHeight: 30,
  },
  taskListContainer: {
    padding: 10,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 10,
    flex: 1,
    marginBottom: 70,
  },
  taskListDate: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noTasksText: {
    textAlign: 'center',
    color: 'gray',
  },

  container_horizontal: {
    flexDirection: 'row'
  },
  container_horizontal_title: {
    marginRight: 5,
    flex: 0.3,
  },
  horizontal_title: {
    fontWeight: 'bold',
  },
  container_horizontal_value: {
    marginLeft: 5,
    flex: 0.7,
  },
  horizontal_value: {

  },
  modalDetailText: {
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: 17
  },
  detail_task_check: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  subTitle: {
    fontFamily: 'Poppins_300Light',
    fontSize: 17,
    fontWeight: 'normal',
    fontStyle: 'normal',
    // lineHeight: 10,
    letterSpacing: 0,
    // textAlign: "left",
    color: '#707070',
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
  grmInput: {
    // height: 40,
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    letterSpacing: 0,
    // textAlign: "left",
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
    // marginHorizontal: 10,
    borderColor: 'green',
    borderWidth: 2,
  },
  dateBtnLabelStyle: {
    color: 'primary.600',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
  },
  dateBtnLabelStyleToday: {
    color: 'white',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
  },

});

export default CalendarScreen;
