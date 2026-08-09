import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
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
import { Snackbar, Checkbox, TextInput as TextInputPaper, ActivityIndicator, Button as ButtonPaper, Divider } from 'react-native-paper';
import XDate from 'xdate';
import moment from 'moment';
import 'moment/locale/fr';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import NetInfo from '@react-native-community/netinfo';
import Geolocation from '@react-native-community/geolocation';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import CustomDay from './CustomDay'; // Import your CustomDay component
import SectionedOneSelectCustom from '../../components/SectionedOneSelectCustom';
import SectionedMultiSelectCustom from '../../components/SectionedMultiSelectCustom';
// import LocalDatabase from '../../utils/databaseManager';
// import { LocalDatabaseADL, LocalDatabaseProcessDesign } from '../../utils/databaseManager';
import { addDocument, getDocumentsByAttributes, updateDocument } from '../../utils/coucdb_call';
import {
  clear_duplicate_on_liste, times_split, capitalizeFirstLetterForEachWord,
  capitalizeFirstLetter, image_compress, isDateTimeInPastOrNow, getDatesBetween,
  construireDatesPhrase, calculerDifferenceEntreDeuxDates, isToday,
  return_numbers_only
} from '../../utils/functions';
import AuthContext from '../../contexts/auth';
import { VALIDATION_PROCESS_COLORS, TYPES_VACATION, COMPONENTS, WORK_ENVIRONMENT } from '../../utils/constants';
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
import WatchPosition from '../../components/Location/WatchPosition';
import LocationPosition from '../../components/Location/LocationPosition';


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
  // today: "Aujourd'hui"
};

LocaleConfig.locales['en'] = {
  monthNames: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  monthNamesShort: ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'],
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
  const { t, i18n } = useTranslation(['planning', 'common']);
  const { user, signOut } = useContext(AuthContext);
  const toast = useToast();

  const WORK_ENVIRONMENT_DICT_TRANSLATED: { [key: string]: string } = {
    'Office': t('calendar_screen.work_environment_office'),
    'Field': t('calendar_screen.work_environment_field'),
    'Hotel/Workshop': t('calendar_screen.work_environment_hotel_workshop'),
    'Remote': t('calendar_screen.work_environment_remote'),
    'Overseas assignment': t('calendar_screen.work_environment_overseas'),
    'Other': t('calendar_screen.work_environment_other'),
  };
  const WORK_ENVIRONMENT_TRANSLATED = WORK_ENVIRONMENT.map((item: any) => ({
    value: item.value,
    label: WORK_ENVIRONMENT_DICT_TRANSLATED[item.value] ?? item.label,
  }));

  useEffect(() => {
    moment.locale(i18n.language);
    LocaleConfig.defaultLocale = i18n.language;
  }, [i18n.language]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisibleSelectOption, setModalVisibleSelectOption] = useState(false);
  const [modalVisibleAddPlan, setModalVisibleAddPlan] = useState(false);
  const [modalVisibleTaskDetail, setModalVisibleTaskDetail] = useState(false);
  const [modalVisibleTaskComments, setModalVisibleTaskComments] = useState(false);
  const [modalVisibleGeolocation, setModalVisibleGeolocation] = useState(false);
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
  const [timeStart, setTimeStart]: any = useState({ name: `00:00`, id: 0 });
  const [timeEnd, setTimeEnd]: any = useState(null);
  const [plannedTasks, setPlannedTasks]: any = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [visibleMonth, setVisibleMonth] = useState(moment().format("YYYY-MM-DD"));
  const [markedDates, setMarkedDates]: any = useState(null);
  const [completed, setCompleted]: any = useState(false);
  const [undo, setUndo]: any = useState(false);
  const [isAnother, setIsAnother]: any = useState(false);
  const [isFreeTask, setIsFreeTask]: any = useState(false);
  const [freeTaskTitle, setFreeTaskTitle]: any = useState(null);
  const [completedComment, setCompletedComment]: any = useState(null);
  const [undoComment, setUndoComment]: any = useState(null);
  const [detailAnother, setDetailAnother]: any = useState(null);
  const [isDeleting, setIsDeleting]: any = useState(false);
  const [isSyncing, setIsSyncing]: any = useState(false);
  const [descriptionFreeTask, setDescriptionFreeTask]: any = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments]: any = useState([]);
  const [component, setComponent]: any = useState(null);
  const [workEnvironment, setWorkEnvironment]: any = useState(null);
  const [isPeriodDates, setIsPeriodDates]: any = useState(false);
  
  const [total_men_present_over_35, setTotal_men_present_over_35]: any = useState(null);
  const [total_women_present_over_35, setTotal_women_present_over_35]: any = useState(null);
  const [total_people_present_over_35, setTotal_people_present_over_35]: any = useState(null);
  const [total_men_present_under_35, setTotal_men_present_under_35]: any = useState(null);
  const [total_women_present_under_35, setTotal_women_present_under_35]: any = useState(null);
  const [total_people_present_under_35, setTotal_people_present_under_35]: any = useState(null);
  const [total_people_present, setTotal_people_present]: any = useState(null);

  const [accuracyGeolocation, setAccuracyGeolocation]: any = useState(null);
  const [locationGet, setLocationGet]: any = useState(null);
  const [geolocations, setGeolocations]: any = useState(null);
  const [errorGeolocation, setErrorGeolocation]: any = useState(null);
  const [takingDateGeolocation, setTakingDateGeolocation]: any = useState(null);
  const [currentGeolocationEnding, setCurrentGeolocationEnding]: any = useState(null);
  const [currentGeolocation, setCurrentGeolocation]: any = useState(null);
  const [successSaved, setSuccessSaved]: any = useState(false);
  const [plageDates, setPlageDates]: any = useState(null);




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


  const [activityDateBegin, setActivityDateBegin]: any = useState(null);
  const [isDateVisibleActivityBegin, setisDateVisibleActivityBegin] = useState(false);
  const handleConfirmActivityBegin = (_date: any) => {
    setActivityDateBegin(_date);
    hideDatePickerActivityBegin();
  };
  const hideDatePickerActivityBegin = () => {
    setisDateVisibleActivityBegin(false);
  }; const showDatePickerActivityBegin = () => {
    setisDateVisibleActivityBegin(true);
  };
  const [activityDateEnd, setActivityDateEnd]: any = useState(null);
  const [isDateVisibleActivityEnd, setisDateVisibleActivityEnd] = useState(false);
  const handleConfirmActivityEnd = (_date: any) => {
    setActivityDateEnd(_date);
    hideDatePickerActivityEnd();
  };
  const hideDatePickerActivityEnd = () => {
    setisDateVisibleActivityEnd(false);
  }; const showDatePickerActivityEnd = () => {
    setisDateVisibleActivityEnd(true);
  };


  const TIMES_H = times_split().map((item: any, index: number) => {
    return { name: `${item}`, id: index }
  });

  const check_network = async () => {
    NetInfo.fetch().then((state) => {
      if (!state.isConnected) {
        setErrorMessage(t('common:no_network'));
        setErrorVisible(true);
        setConnected(false);
      }else if(!state.isInternetReachable){
        setErrorMessage(t('common:no_internet'));
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
    setIsPeriodDates(null);
    setFreeTaskTitle(null);
    setDetailAnother(null);
    // setPhotoUri(null);
    setCompletedComment(null);
    setUndoComment(null);
    // setAnotherTache(null);
    setComponent(null);
    setWorkEnvironment(null);

    setVacationDateBegin(null);
    setVacationDateEnd(null);
    setVacationDateReturn(null);
    setVacationType(null);
    setVacationTypePrecision(null);
    setIsAddVacation(false);

    setActivityDateBegin(null);
    setActivityDateEnd(null);
    
    setTotal_men_present_over_35(null);
    setTotal_women_present_over_35(null);
    setTotal_people_present_over_35(null);
    setTotal_men_present_under_35(null);
    setTotal_women_present_under_35(null);
    setTotal_people_present_under_35(null);
    setTotal_people_present(null);
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
      t('common:alert'), t('calendar_screen.confirm_delete_activity'), [
      {
        text: t('common:yes'), onPress: async () => {
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
                    description: t('calendar_screen.activity_already_validated_delete'),
                    duration: 15000
                  });
                } else {
                  setErrorMessage(t('calendar_screen.delete_activity_permission_error'));
                  setErrorVisible(true);
                }

              } else {
                setErrorMessage(t('calendar_screen.activity_deleted_success'));
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
        text: t('common:no'), onPress: async () => {

        }
      }
    ]);
  };

  const set_datas = (item: any) => {

  };
  const reset_datas = (item: any) => {

  };

  const get_color_status_number = (elt: any) => {
    if (elt.type == "vacation") {
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

  const build_marked_dates = (tasksPlanned: any) => {
    let _markedDates: any = {}

    tasksPlanned.forEach((elt: any) => {
      // if (elt.type == "vacation" && elt.planned_datetime_start && elt.planned_datetime_end) {
      if (
        elt.planned_datetime_start && elt.planned_datetime_end &&
        elt.planned_datetime_start.split("T")[0] != elt.planned_datetime_end.split("T")[0]
      ) {
        let elt_dates = getDatesBetween(elt.planned_datetime_start, elt.planned_datetime_end);
        let current_date_elt;
        for (let i = 0; i < elt_dates.length; i++) {
          current_date_elt = elt_dates[i];
          if (_markedDates[current_date_elt]) {
            _markedDates[current_date_elt].datas.push({
              backgroundColor: VALIDATION_PROCESS_COLORS[get_color_status_number(elt)],
              ...{ ...elt, planned_date: current_date_elt }
            });
          } else {
            _markedDates[current_date_elt] = {
              datas: [
                {
                  backgroundColor: VALIDATION_PROCESS_COLORS[get_color_status_number(elt)],
                  ...{ ...elt, planned_date: current_date_elt }
                }
              ]
            }
          }
        }

      } else {
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

    return _markedDates;
  };

  // Ne charge que les tâches du mois affiché dans le calendrier (avec une marge de 6 jours
  // de part et d'autre pour couvrir les jours des mois voisins visibles dans la grille), au
  // lieu de récupérer tout l'historique. Naviguer via les flèches précédent/suivant du
  // calendrier (onMonthChange) déclenche un nouvel appel pour le mois nouvellement affiché ;
  // les tâches déjà chargées pour d'autres mois sont conservées (fusion par id).
  const get_tasks_planned = async (monthDateString: string = visibleMonth) => {
    try {
      setLoading(true);
      const start_date = moment(monthDateString).startOf('month').subtract(6, 'days').format('YYYY-MM-DD');
      const end_date = moment(monthDateString).endOf('month').add(6, 'days').format('YYYY-MM-DD');

      await new ActivitiesAPI().get_activities({
        start_date,
        end_date,
      })
        .then((result: any) => {
          const tasksFetched: any = result ?? [];

          setPlannedTasks((previousTasks: any) => {
            const merged = [...(previousTasks ?? [])];
            tasksFetched.forEach((elt: any) => {
              const existingIndex = merged.findIndex((m: any) => m.id === elt.id);
              if (existingIndex !== -1) {
                merged[existingIndex] = elt;
              } else {
                merged.push(elt);
              }
            });
            setMarkedDates(build_marked_dates(merged));
            return merged;
          });

        }).catch((err: any) => {
          handleStorageError(err);
          console.log(err);
        });
      setLoading(false);
    } catch (error) {
      handleStorageError(error);
    }

  };

  const onCalendarMonthChange = (month: any) => {
    const newMonth = month?.dateString ?? visibleMonth;
    if (newMonth === visibleMonth) return; // déjà le mois courant (ex: appel initial de react-native-calendars)
    setVisibleMonth(newMonth);
    get_tasks_planned(newMonth);
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
              (etape || (freeTaskTitle && descriptionFreeTask)) && (timeStart || activityDateBegin) && (timeEnd || activityDateEnd) && component && workEnvironment && (!completed || (completed && completedComment && total_men_present_over_35 != null && total_women_present_over_35 != null && total_men_present_under_35 != null && total_women_present_under_35 != null))
            ))
            ||
            (reporting && component && workEnvironment && (
              (completed && completedComment && total_men_present_over_35 != null && total_women_present_over_35 != null && total_men_present_under_35 != null && total_women_present_under_35 != null)
              ||
              (
                (undo && undoComment && !isAnother)
                ||
                (undo && undoComment && completedComment && isAnother && total_men_present_over_35 != null && total_women_present_over_35 != null && total_men_present_under_35 != null && total_women_present_under_35 != null && (
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
            name: t('calendar_screen.leave_option'),
            description: vacationTypePrecision ?? vacationType?.name,
            vacation_type: vacationTypePrecision ?? vacationType?.name,
            planned_datetime_start: `${((vacationDateBegin instanceof Date) ? vacationDateBegin.toISOString() : vacationDateBegin).split('T')[0]}T00:00:00.000000Z`,
            planned_datetime_end: `${((vacationDateEnd instanceof Date) ? vacationDateEnd.toISOString() : vacationDateEnd).split('T')[0]}T23:45:00.000000Z`,
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
                taskPlanned.is_another = completed ? false : isAnother;
                taskPlanned.is_free_task = isFreeTask;

                if (isAnother && !completed) {
                  taskPlanned.another_detail = {
                    phase: !isFreeTask ? (phase ?? null) : null,
                    activity: !isFreeTask ? (etape ?? null) : null,
                    name: !isFreeTask ? etape?.name : freeTaskTitle,
                    activty_sql_id: !isFreeTask ? (etape?.id ?? null) : null,
                    component: component ? (component?.name ?? null) : null,
                    work_environment: workEnvironment ? (workEnvironment?.id ?? null) : null,

                    administrative_level_ids: villagesSelectedID ? villagesSelectedID.map((v_id: any) => Number(v_id)) : null,
                    administrative_levels: villagesSelected ? villagesSelected.map((v: any) => { return { id: v.id, name: v.name, parent: v?.parent }; }) : null
                  }
                }

                taskPlanned.comment = completedComment;
                taskPlanned.undo_comment = undoComment;

                taskPlanned.total_men_present_over_35 = total_men_present_over_35;
                taskPlanned.total_women_present_over_35 = total_women_present_over_35;
                taskPlanned.total_people_present_over_35 = total_people_present_over_35;
                taskPlanned.total_men_present_under_35 = total_men_present_under_35;
                taskPlanned.total_women_present_under_35 = total_women_present_under_35;
                taskPlanned.total_people_present_under_35 = total_people_present_under_35;
                taskPlanned.total_people_present = total_people_present;

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

                  planned_datetime_start: (isPeriodDates && activityDateBegin) ? `${((activityDateBegin instanceof Date) ? activityDateBegin.toISOString() : activityDateBegin).split('T')[0]}T${(timeStart && timeStart.name) ? timeStart.name : "00:00"}:00.000000Z` : `${selectedDate}T${timeStart.name}:00.000000Z`,
                  planned_datetime_end: (isPeriodDates && activityDateEnd) ? `${((activityDateEnd instanceof Date) ? activityDateEnd.toISOString() : activityDateEnd).split('T')[0]}T${(timeEnd && timeEnd.name) ? timeEnd.name : "23:45"}:00.000000Z` : `${selectedDate}T${timeEnd.name}:00.000000Z`,

                  component: component ? (component?.name ?? null) : null,
                  work_environment: workEnvironment ? (workEnvironment?.id ?? null) : null,
                  is_period_dates: isPeriodDates,

                  // created_date: moment(),
                  // updated_date: moment()
                };

                if (completed) {
                  taskPlanned = { 
                    ...taskPlanned, 
                    completed: completed, 
                    comment: completedComment,
                    total_men_present_over_35: total_men_present_over_35,
                    total_women_present_over_35: total_women_present_over_35,
                    total_people_present_over_35: total_people_present_over_35,
                    total_men_present_under_35: total_men_present_under_35,
                    total_women_present_under_35: total_women_present_under_35,
                    total_people_present_under_35: total_people_present_under_35,
                    total_people_present: total_people_present
                  }
                }

                if (activity?.id && activity?.validated == false) {
                  taskPlanned = { ...taskPlanned, edit_after_invalidation: true }
                }
              }
            }

            await new ActivitiesAPI().save_activity(
              taskPlanned
            ).then(function (res: any) {
              if (res.error && res.error == "validated") {
                setErrorMessage(t('calendar_screen.activity_already_validated_modify'));
                setErrorVisible(true);
                return;
              } else if (res.error && res.status && res.status == "error") {
                setErrorMessage(`${res.error}`);
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
                setIsPeriodDates(null);
                setFreeTaskTitle(null);
                setDetailAnother(null);
                // setPhotoUri(null);
                setCompletedComment(null);
                setUndoComment(null);
                // setAnotherTache(null);
                setComponent(null);
                setWorkEnvironment(null);

                // setSelectedDate('');
                setModalVisibleAddPlan(false);
                setModalVisiblePlanningTaskReporting(false);

                setErrorMessage(t('calendar_screen.agenda_updated_success'));
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

                setActivityDateBegin(null);
                setActivityDateEnd(null);
    
                setTotal_men_present_over_35(null);
                setTotal_women_present_over_35(null);
                setTotal_people_present_over_35(null);
                setTotal_men_present_under_35(null);
                setTotal_women_present_under_35(null);
                setTotal_people_present_under_35(null);
                setTotal_people_present(null);

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
          setErrorMessage(t('calendar_screen.activity_already_planned'));
          setErrorVisible(true);
        }
      } else {
        if (isAddVacation) {
          if (!vacationType) {
            setErrorMessage(t('calendar_screen.please_select_type'));
          } else if (!vacationDateBegin) {
            setErrorMessage(t('calendar_screen.please_mention_departure_date'));
          } else if (!vacationDateEnd) {
            setErrorMessage(t('calendar_screen.please_mention_vacation_end_date'));
          } else if (!vacationDateReturn) {
            setErrorMessage(t('calendar_screen.please_mention_return_date'));
          }
        } else {
          if (cantonsSelectedID && cantonsSelectedID.length != 0 && (!villagesSelectedID || (villagesSelectedID && villagesSelectedID.length == 0))) {
            setErrorMessage(t('calendar_screen.please_select_at_least_one_place'));
          } else if (newPlan || editPlan) {
            if (isPeriodDates && !activityDateBegin) {
              setErrorMessage(t('calendar_screen.please_mention_activity_start_date'));
            } else if (isPeriodDates && !activityDateEnd) {
              setErrorMessage(t('calendar_screen.please_mention_activity_end_date'));
            } else if ((!etape || !phase) && isAddExistingTask) {
              setErrorMessage(t('calendar_screen.please_select_activity'));
            } else if (!freeTaskTitle && !isAddExistingTask) {
              setErrorMessage(t('calendar_screen.please_mention_activity'));
            } else if (!descriptionFreeTask && !isAddExistingTask) {
              setErrorMessage(t('calendar_screen.please_mention_activity_description'));
            } else if (!timeEnd) {
              setErrorMessage(t('calendar_screen.please_define_activity_time'));
            } else if (!component) {
              setErrorMessage(t('calendar_screen.please_select_component'));
            } else if (!workEnvironment) {
              setErrorMessage(t('calendar_screen.please_select_work_environment'));
            } else if (completed && !completedComment) {
              setErrorMessage(t('calendar_screen.please_describe_completed_activity'));
            } else if (completed && (!total_men_present_over_35 || !total_women_present_over_35 || !total_men_present_under_35 || !total_women_present_under_35)) {
              setErrorMessage(t('calendar_screen.please_mention_attendance_count'));
            } else {
              setErrorMessage(t('calendar_screen.please_fill_all_fields'));
            }
          }
          else if (reporting) {
            if (completed && !completedComment) {
              setErrorMessage(t('calendar_screen.please_describe_completed_activity'));
            } else if (undo && !undoComment) {
              setErrorMessage(t('calendar_screen.please_mention_why_not_done'));
            } else if (undo && isAnother && !isFreeTask && (!etape || !phase)) {
              setErrorMessage(t('calendar_screen.please_select_activity'));
            } else if (undo && isAnother && isFreeTask && !freeTaskTitle) {
              setErrorMessage(t('calendar_screen.please_mention_activity'));
            } else if (!undo && !completed) {
              setErrorMessage(t('calendar_screen.please_mention_completed_or_undone'));
            } else if (!freeTaskTitle && isFreeTask) {
              setErrorMessage(t('calendar_screen.please_mention_activity'));
            } else if (!completedComment) {
              setErrorMessage(t('calendar_screen.please_describe_completed_activity'));
            } else if (completed && (!total_men_present_over_35 || !total_women_present_over_35 || !total_men_present_under_35 || !total_women_present_under_35)) {
              setErrorMessage(t('calendar_screen.please_mention_attendance_count'));
            } else if (!component) {
              setErrorMessage(t('calendar_screen.please_select_component'));
            } else if (!workEnvironment) {
              setErrorMessage(t('calendar_screen.please_select_work_environment'));
            } else {
              setErrorMessage(t('calendar_screen.please_fill_all_fields'));
            }
          } else {
            setErrorMessage(t('calendar_screen.please_fill_all_fields'));
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
        }, 250, 0, "process_design" as any)
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
                name: `${elt.name}`, id: elt.sql_id, phase_name: ths.find((th: any) => th.activity_name == elt.name).phase_name, description: elt.description
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

  const renderGeolocationItem = ({ item, index }: { item: any, index: number }) => {
    return <View style={{ marginVertical: 11 }}>
      <Divider style={{ height: 7 }} />
      {item?.latitude_start && <View style={{ marginVertical: 4 }}>
        <Text style={styles.title}>{t('calendar_screen.arrival_info_title')} {(plageDates && plageDates.length != 1) ? `(${index + 1})` : ''}</Text>
        <View>
          <Text>{t('calendar_screen.planned_on_label')}{item?.planning_date ? moment(item?.planning_date).format('dddd DD, MMMM YYYY') : 'N/A'}</Text>
          <Text>{t('calendar_screen.latitude_label')}{item?.latitude_start}</Text>
          <Text>{t('calendar_screen.longitude_label')}{item?.longitude_start}</Text>
          <Text>{t('calendar_screen.precision_label')}{item?.geolocation_start?.coords?.accuracy ? `${item?.geolocation_start?.coords?.accuracy.toFixed(2)} ${t('calendar_screen.meters_unit')}` : 'N/A'}</Text>
          <Text>{t('calendar_screen.coords_taken_date_label')}{item?.taking_datetime_start ? t('calendar_screen.date_at_time', { date: moment(item?.taking_datetime_start).format('dddd DD, MMMM YYYY'), time: moment(item?.taking_datetime_start).format('HH:mm') }) : 'N/A'}</Text>
        </View>
      </View>}
      {item?.latitude_end && <View>
        <Text style={styles.title}>{t('calendar_screen.departure_info_title')} {(plageDates && plageDates.length != 1) ? `(${index + 1})` : ''} {`[${construireDatesPhrase(calculerDifferenceEntreDeuxDates(item?.taking_datetime_start, item?.taking_datetime_end))
          }]`}</Text>
        <View>
          <Text>{t('calendar_screen.planned_on_label')}{item?.planning_date ? moment(item?.planning_date).format('dddd DD, MMMM YYYY') : 'N/A'}</Text>
          <Text>{t('calendar_screen.latitude_label')}{item?.latitude_end}</Text>
          <Text>{t('calendar_screen.longitude_label')}{item?.longitude_end}</Text>
          <Text>{t('calendar_screen.precision_label')}{item?.geolocation_end?.coords?.accuracy ? `${item?.geolocation_end?.coords?.accuracy.toFixed(2)} ${t('calendar_screen.meters_unit')}` : 'N/A'}</Text>
          <Text>{t('calendar_screen.coords_taken_date_label')}{item?.taking_datetime_end ? t('calendar_screen.date_at_time', { date: moment(item?.taking_datetime_end).format('dddd DD, MMMM YYYY'), time: moment(item?.taking_datetime_end).format('HH:mm') }) : 'N/A'}</Text>
        </View>
        {(geolocations && geolocations.length == (index + 1)) && <Divider style={{ height: 7 }} />}
      </View>}

    </View>
  }

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
                <FontAwesome name={(item.completed || item.is_another) ? "check-circle-o" : "circle-o"} size={24} color={item?.completed ? "green" : "white"} />
              </View>
            </View>
            <View style={styles.container_task_adl}>
              <View>
                <Text style={[styles.taskTitle, { color: [5, 6].includes(color_index) ? 'white' : 'black' }]}>{`${item.name}`}{item?.vacation_type ? ` (${item?.vacation_type})` : ''}</Text>
              </View>
              <View>
                <Text style={[styles.adl, { color: [5, 6].includes(color_index) ? 'white' : 'black' }]}>
                  {(item?.administrative_levels && item?.administrative_levels?.length > 0) ? item?.administrative_levels.map((a: any) => a.name).join(", ") : t('calendar_screen.location_not_defined')}
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
                        setIsPeriodDates(item?.is_period_dates ?? (item?.planned_datetime_start && item?.planned_datetime_end && item.planned_datetime_start.split("T")[0] != item.planned_datetime_end.split("T")[0]));
                        setFreeTaskTitle(item?.type == "free_task" ? item?.name : null);
                        setDetailAnother(item?.another_detail ?? null);
                        // setPhotoUri(item?.photo_uri ?? null);
                        setCompletedComment(item?.comment ?? null);
                        setUndoComment(item?.undo_comment ?? null);
                        setComments(item?.comments ?? null);
                        setComponent(item?.component ? { id: item?.component, name: item?.component } : null);
                        setWorkEnvironment(item?.work_environment ? { id: item?.work_environment, name: WORK_ENVIRONMENT_DICT_TRANSLATED[item?.work_environment] ?? item?.work_environment } : null);

                        setVacationDateBegin(item?.planned_datetime_start ?? null);
                        setVacationDateEnd(item?.planned_datetime_end ?? null);

                        setActivityDateBegin(item?.planned_datetime_start ?? null);
                        setActivityDateEnd(item?.planned_datetime_end ?? null);

                        setVacationDateReturn(item?.vacation_return_datetime ?? null);
                        setVacationType(is_another_vacation_type ? { id: "Autre", name: "Autre" } : (item?.vacation_type ? { id: item?.vacation_type, name: item?.vacation_type } : null));
                        setVacationTypePrecision(is_another_vacation_type ? item?.vacation_type : null);
                        setIsAddVacation(item?.type == "vacation");

                        
                        setTotal_men_present_over_35(item?.total_men_present_over_35 ?? null);
                        setTotal_women_present_over_35(item?.total_women_present_over_35 ?? null);
                        setTotal_people_present_over_35(item?.total_people_present_over_35 ?? null);
                        setTotal_men_present_under_35(item?.total_men_present_under_35 ?? null);
                        setTotal_women_present_under_35(item?.total_women_present_under_35 ?? null);
                        setTotal_people_present_under_35(item?.total_people_present_under_35 ?? null);
                        setTotal_people_present(item?.total_people_present ?? null);


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
                          setIsPeriodDates(item?.is_period_dates ?? (item?.planned_datetime_start && item?.planned_datetime_end && item.planned_datetime_start.split("T")[0] != item.planned_datetime_end.split("T")[0]));
                          setDetailAnother(item?.another_detail ?? null);
                          setComponent(item?.component ? { id: item?.component, name: item?.component } : null);
                          setWorkEnvironment(item?.work_environment ? { id: item?.work_environment, name: WORK_ENVIRONMENT_DICT_TRANSLATED[item?.work_environment] ?? item?.work_environment } : null);
                          // setPhotoUri(item?.photo_uri ?? null);
                          setCompletedComment(item?.comment ?? null);
                          setUndoComment(item?.undo_comment ?? null);
                          setIsAddExistingTask(item?.type == "task");
                          setIsAddVacation(item?.type == "vacation");
                        
                          setTotal_men_present_over_35(item?.total_men_present_over_35 ?? null);
                          setTotal_women_present_over_35(item?.total_women_present_over_35 ?? null);
                          setTotal_people_present_over_35(item?.total_people_present_over_35 ?? null);
                          setTotal_men_present_under_35(item?.total_men_present_under_35 ?? null);
                          setTotal_women_present_under_35(item?.total_women_present_under_35 ?? null);
                          setTotal_people_present_under_35(item?.total_people_present_under_35 ?? null);
                          setTotal_people_present(item?.total_people_present ?? null);

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

                  <View style={styles.container_info}>
                    <TouchableOpacity
                      onPress={() => {
                        setActivity(item);
                        let plage_dates = [selectedDate];
                        if (
                          item.planned_datetime_start && item.planned_datetime_end &&
                          item.planned_datetime_start.split("T")[0] != item.planned_datetime_end.split("T")[0]
                        ) {
                          plage_dates = getDatesBetween(item.planned_datetime_start, item.planned_datetime_end);
                        }
                        setPlageDates(plage_dates);

                        let current_geolocations = item.geolocations.filter((g: any) => plage_dates.includes(g.planning_date))
                        setGeolocations(current_geolocations);
                        setCurrentGeolocationEnding(current_geolocations.find((g: any) => g.planning_date == selectedDate && g?.latitude_start && !g?.latitude_end));
                        setCurrentGeolocation(current_geolocations.find((g: any) => g.planning_date == selectedDate && g?.latitude_start));

                        setModalVisibleGeolocation(true);
                      }}
                    >
                      <FontAwesome name="location-arrow" size={20} color="white" />
                    </TouchableOpacity>
                  </View>



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
                        setIsPeriodDates(item?.is_period_dates ?? (item?.planned_datetime_start && item?.planned_datetime_end && item.planned_datetime_start.split("T")[0] != item.planned_datetime_end.split("T")[0]));
                        setFreeTaskTitle(item?.type == "free_task" ? item?.name : null);
                        setDetailAnother(item?.another_detail ?? null);
                        // setPhotoUri(item?.photo_uri ?? null);
                        setCompletedComment(item?.comment ?? null);
                        setUndoComment(item?.undo_comment ?? null);
                        setComments(item?.comments ?? null);
                        setComponent(item?.component ? { id: item?.component, name: item?.component } : null);
                        setWorkEnvironment(item?.work_environment ? { id: item?.work_environment, name: WORK_ENVIRONMENT_DICT_TRANSLATED[item?.work_environment] ?? item?.work_environment } : null);

                        setVacationDateBegin(item?.planned_datetime_start ?? null);
                        setVacationDateEnd(item?.planned_datetime_end ?? null);

                        setActivityDateBegin(item?.planned_datetime_start ?? null);
                        setActivityDateEnd(item?.planned_datetime_end ?? null);

                        setVacationDateReturn(item?.vacation_return_datetime ?? null);
                        setVacationType(is_another_vacation_type ? { id: "Autre", name: "Autre" } : (item?.vacation_type ? { id: item?.vacation_type, name: item?.vacation_type } : null));
                        setVacationTypePrecision(is_another_vacation_type ? item?.vacation_type : null);
                        setIsAddVacation(item?.type == "vacation");
                        
                        setTotal_men_present_over_35(item?.total_men_present_over_35 ?? null);
                        setTotal_women_present_over_35(item?.total_women_present_over_35 ?? null);
                        setTotal_people_present_over_35(item?.total_people_present_over_35 ?? null);
                        setTotal_men_present_under_35(item?.total_men_present_under_35 ?? null);
                        setTotal_women_present_under_35(item?.total_women_present_under_35 ?? null);
                        setTotal_people_present_under_35(item?.total_people_present_under_35 ?? null);
                        setTotal_people_present(item?.total_people_present ?? null);

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
                        setComponent(item?.component ? { id: item?.component, name: item?.component } : null);
                        setWorkEnvironment(item?.work_environment ? { id: item?.work_environment, name: WORK_ENVIRONMENT_DICT_TRANSLATED[item?.work_environment] ?? item?.work_environment } : null);

                        setCompleted(item?.completed ?? null);
                        setCompletedComment(item?.comment ?? null);
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

                        setIsPeriodDates(item?.is_period_dates ?? (item?.planned_datetime_start && item?.planned_datetime_end && item.planned_datetime_start.split("T")[0] != item.planned_datetime_end.split("T")[0]));
                        setActivityDateBegin(item?.planned_datetime_start ?? null);
                        setActivityDateEnd(item?.planned_datetime_end ?? null);

                        setVacationDateReturn(item?.vacation_return_datetime ?? null);
                        setVacationType(is_another_vacation_type ? { id: "Autre", name: "Autre" } : (item?.vacation_type ? { id: item?.vacation_type, name: item?.vacation_type } : null));
                        setVacationTypePrecision(is_another_vacation_type ? item?.vacation_type : null);
                        setIsAddVacation(item?.type == "vacation");
                        
                        setTotal_men_present_over_35(item?.total_men_present_over_35 ?? null);
                        setTotal_women_present_over_35(item?.total_women_present_over_35 ?? null);
                        setTotal_people_present_over_35(item?.total_people_present_over_35 ?? null);
                        setTotal_men_present_under_35(item?.total_men_present_under_35 ?? null);
                        setTotal_women_present_under_35(item?.total_women_present_under_35 ?? null);
                        setTotal_people_present_under_35(item?.total_people_present_under_35 ?? null);
                        setTotal_people_present(item?.total_people_present ?? null);

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

  // Format date function
  const formatDate = (date: any) => {
    const options: any = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
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

        if (imageSize && imageSize >= 1) {
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
            description: t('calendar_screen.attachment_upload_error'),
            duration: 5000
          });
        }

      } catch (e) {
        console.log(e);
        toast.show({
          description: t('calendar_screen.attachment_upload_error'),
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
      <ScrollView contentContainerStyle={{ paddingHorizontal: 5 }}
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
            onMonthChange={onCalendarMonthChange}
            markedDates={{
              ...markedDates,
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
              // calendarBorderColor: 'red',
              // calendarBorderWidth: 1,
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
              // current: {
              //   headerContainer: {
              //     backgroundColor: 'red'
              //   }
              // }
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
                  <Text style={styles.modalText}>{t('calendar_screen.actions_modal_title')}</Text>
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
                        <Text style={styles.optionPlanningText}>{t('calendar_screen.existing_activity_option')}</Text>
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
                        <Text style={styles.optionPlanningText}>{t('calendar_screen.free_activity_option')}</Text>
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
                        <Text style={styles.optionPlanningText}>{t('calendar_screen.leave_option')}</Text>
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
                    {isAddVacation ? t('calendar_screen.plan_leave_title') : (isAddExistingTask ? t('calendar_screen.plan_existing_activity_title') : t('calendar_screen.plan_free_activity_title'))}
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
                        <Text style={{ ...styles.subTitle }}>{t('calendar_screen.absence_type_label')}</Text>
                        <SectionedOneSelectCustom
                          id={"id"}
                          K_OPTIONS={TYPES_VACATION.map((item: any) => {
                            return { name: item, id: item }
                          })}
                          items={TYPES_VACATION.map((item: any) => {
                            return { name: item, id: item }
                          })}
                          itemSelected={vacationType}
                          setItemSelected={(v: any) => {
                            if (v && v.name != "Autre") {
                              setVacationTypePrecision(null);
                            }
                            setVacationType(v);
                          }}
                          otherStyles={{
                            borderRadius: 1,
                            padding: 10,
                          }} title={t('calendar_screen.select_absence_type_title')} searchText={t('calendar_screen.search_type_placeholder')} />
                      </View>
                    </View>

                    {((vacationType && vacationType.name == "Autre")) && <View style={{ marginTop: 15, }}>
                      <Text style={{ ...styles.subTitle }}>{t('calendar_screen.leave_precision_label')}</Text>
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
                        <Text style={{ ...styles.subTitle }}>{t('calendar_screen.absence_date_label')}</Text>
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
                              {t('calendar_screen.from_label')}
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
                              {vacationDateBegin ? moment(vacationDateBegin).format('DD-MMMM-YY') : t('calendar_screen.leave_start_date_placeholder')}
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
                              {t('calendar_screen.to_label')}
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
                              {vacationDateEnd ? moment(vacationDateEnd).format('DD-MMMM-YY') : t('calendar_screen.leave_end_date_placeholder')}
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
                        <Text style={{ ...styles.subTitle }}>{t('calendar_screen.return_date_label')}</Text>
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
                              {vacationDateReturn ? moment(vacationDateReturn).format('DD-MMMM-YY') : t('calendar_screen.leave_return_date_placeholder')}
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
                      <Text style={{ ...styles.subTitle }}>{t('calendar_screen.cantons_label')}</Text>
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
                        }} title={t('calendar_screen.choose_cantons_title')} searchText={t('calendar_screen.search_canton_placeholder')} />
                    </View>

                    <View>
                      <Text style={{ ...styles.subTitle }}>{t('calendar_screen.places_label')}</Text>
                      <SectionedMultiSelectCustom
                        id={"id"}
                        K_OPTIONS={villages.map((item: any) => {
                          return { name: `${item.name}`, id: item.id }
                        })}
                        items={villages}
                        itemsSelected={villagesSelectedID}
                        setItemsSelected={setVillagesSelectedID}
                        onConfirm={() => {
                          let vs = villages.filter((e: any) => villagesSelectedID.includes(e.id) ?? []);
                          setVillagesSelected(vs);
                        }}
                        otherStyles={{
                          borderRadius: 5,
                          padding: 10,
                        }} title={t('calendar_screen.choose_villages_title')} searchText={t('calendar_screen.search_village_placeholder')} />
                    </View>


                    <View style={{ marginTop: 15, }}>
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
                            setCompleted(!completed);
                          }}
                        />
                        <Text style={[styles.title, { flex: 1, fontSize: 11 }]}>{t('calendar_screen.activity_already_done_label')}</Text>
                      </View>
                    </View>
                    {completed && <>
                      <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 13 }}>{t('calendar_screen.completed_confirmation_warning')}</Text>
                      <View>

                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                        >
                          <Checkbox.Android
                            color="#63D3AC"
                            status={!isAddExistingTask ? 'checked' : 'unchecked'}
                            onPress={() => {
                              setIsAddExistingTask(!isAddExistingTask);
                            }}
                          />
                          <Text style={[styles.title, { flex: 1 }]}>{t('calendar_screen.is_free_activity_question')}</Text>
                        </View>
                      </View>
                    </>}


                    {!isAddExistingTask && <View style={{ marginTop: 15, }}>
                      <Text style={{ ...styles.subTitle }}>{t('calendar_screen.activity_title_label')}</Text>
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
                        <Text style={{ ...styles.subTitle }}>{t('calendar_screen.phase_label')}</Text>
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
                          }} title={t('calendar_screen.select_phase_title')} searchText={t('calendar_screen.search_phase_placeholder')} />
                      </View>
                      <View style={{ flex: 0.02 }}></View>
                      <View style={{ flex: 0.49 }}>
                        <Text style={{ ...styles.subTitle }}>{t('calendar_screen.activity_select_label')}</Text>
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
                          }} title={!(phase && phase.name) ? "---" : t('calendar_screen.select_step_title')} searchText={t('calendar_screen.search_step_placeholder')} />
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
                        placeholder={t('calendar_screen.activity_description_placeholder')}
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

                    {completed && <View >
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
                        placeholder={t('calendar_screen.completed_activity_description_placeholder')}
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


                      <View style={{ marginTop: 15, }}>
                        <Text style={{ ...styles.subTitle }}>{t('calendar_screen.men_over_35_label')}</Text>
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
                          onChangeText={(v: any) => {
                              let n_v = return_numbers_only(v);
                              setTotal_men_present_over_35(n_v)
                              setTotal_people_present_over_35((n_v ?? 0) + (total_women_present_over_35 ?? 0)),
                              setTotal_people_present((
                                  (total_men_present_under_35 ?? 0) + (total_women_present_under_35 ?? 0) +
                                  (total_women_present_over_35 ?? 0) + (n_v ?? 0)
                              ))
                          }}
                          value={total_men_present_over_35?.toString()}
                          keyboardType="numeric"
                          placeholder={t('calendar_screen.men_over_35_placeholder')}
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
                      </View>
                      <View style={{ marginTop: 15, }}>
                        <Text style={{ ...styles.subTitle }}>{t('calendar_screen.women_over_35_label')}</Text>
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
                          onChangeText={(v: any) => {
                              let n_v = return_numbers_only(v);
                              setTotal_women_present_over_35(n_v)
                              setTotal_people_present_over_35(
                                  (total_men_present_over_35 ?? 0) + (n_v ?? 0)
                              )
                              setTotal_people_present(
                                  (total_men_present_under_35 ?? 0) + (total_women_present_under_35 ?? 0) +
                                  (total_men_present_over_35 ?? 0) + (n_v ?? 0)
                              )
                          }}
                          value={total_women_present_over_35?.toString()}
                          keyboardType="numeric"
                          placeholder={t('calendar_screen.women_over_35_placeholder')}
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
                      </View>
                      <View style={{ marginTop: 15, }}>
                        <Text style={{ ...styles.subTitle }}>{t('calendar_screen.people_over_35_label')}</Text>
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
                          disabled={true}
                          value={total_people_present_over_35?.toString()}
                          keyboardType="numeric"
                          placeholder={t('calendar_screen.people_over_35_placeholder')}
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
                      </View>
                      <View style={{ marginTop: 15, }}>
                        <Text style={{ ...styles.subTitle }}>{t('calendar_screen.men_under_35_label')}</Text>
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
                          onChangeText={(v: any) => {
                              let n_v = return_numbers_only(v);
                              setTotal_men_present_under_35(n_v)
                              setTotal_people_present_under_35(
                                  (n_v ?? 0) + (total_women_present_under_35 ?? 0)
                              )
                              setTotal_people_present(
                                  (total_men_present_over_35 ?? 0) + (total_women_present_over_35 ?? 0) +
                                  (total_women_present_under_35 ?? 0) + (n_v ?? 0)
                              )
                          }}
                          value={total_men_present_under_35?.toString()}
                          keyboardType="numeric"
                          placeholder={t('calendar_screen.men_under_35_placeholder')}
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
                      </View>
                      <View style={{ marginTop: 15, }}>
                        <Text style={{ ...styles.subTitle }}>{t('calendar_screen.women_under_35_label')}</Text>
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
                          onChangeText={(v: any) => {
                              let n_v = return_numbers_only(v);
                              setTotal_women_present_under_35(n_v)
                              setTotal_people_present_under_35(
                                  (total_men_present_under_35 ?? 0) + (n_v ?? 0)
                              ),
                              setTotal_people_present(
                                  (total_men_present_over_35 ?? 0) + (total_women_present_over_35 ?? 0) +
                                  (total_men_present_under_35 ?? 0) + (n_v ?? 0)
                              )
                          }}
                          value={total_women_present_under_35?.toString()}
                          keyboardType="numeric"
                          placeholder={t('calendar_screen.women_under_35_placeholder')}
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
                      </View>
                      <View style={{ marginTop: 15, }}>
                        <Text style={{ ...styles.subTitle }}>{t('calendar_screen.people_under_35_label')}</Text>
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
                          disabled={true}
                          value={total_people_present_under_35?.toString()}
                          keyboardType="numeric"
                          placeholder={t('calendar_screen.people_under_35_placeholder')}
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
                      </View>
                      
                      <View style={{ marginTop: 15, }}>
                        <Text style={{ ...styles.subTitle }}>{t('calendar_screen.total_people_present_label')}</Text>
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
                          disabled={true}
                          value={total_people_present?.toString()}
                          keyboardType="numeric"
                          placeholder={t('calendar_screen.total_people_placeholder')}
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
                      </View>

                    </View>}

                    <View style={{ marginTop: 15, flexDirection: 'row', }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ ...styles.subTitle }}>{t('calendar_screen.component_label')}</Text>
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
                          }} title={t('calendar_screen.select_component_title')} searchText={t('calendar_screen.search_component_placeholder')} />
                      </View>
                    </View>

                    <View style={{ marginTop: 15, flexDirection: 'row', }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ ...styles.subTitle }}>{t('calendar_screen.work_environment_label')}</Text>
                        <SectionedOneSelectCustom
                          id={"id"}
                          K_OPTIONS={WORK_ENVIRONMENT_TRANSLATED.map((item: any) => {
                            return { name: item.label, id: item.value }
                          })}
                          items={WORK_ENVIRONMENT_TRANSLATED.map((item: any) => {
                            return { name: item.label, id: item.value }
                          })}
                          itemSelected={workEnvironment}
                          setItemSelected={setWorkEnvironment}
                          otherStyles={{
                            borderRadius: 1,
                            padding: 10,
                          }} title={t('calendar_screen.select_work_environment_title')} searchText={t('calendar_screen.search_work_environment_placeholder')} />
                      </View>
                    </View>


                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 15,
                      }}
                    >
                      <Checkbox.Android
                        color="#63D3AC"
                        status={isPeriodDates ? 'checked' : 'unchecked'}
                        onPress={() => {
                          setIsPeriodDates(!isPeriodDates);
                        }}
                      />
                      <Text style={[styles.title, { flex: 1 }]}>{t('calendar_screen.define_date_range')}</Text>
                    </View>


                    {isPeriodDates && <View style={{ marginTop: 15, flexDirection: 'row', }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ ...styles.subTitle }}>{t('calendar_screen.activity_period_label')}</Text>
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
                              {t('calendar_screen.from_label')}
                            </ButtonPaper>
                            <ButtonPaper
                              theme={{ ...theme, colors: { ...theme.colors, primary: 'white' } }}
                              icon="calendar"
                              compact
                              style={{ ...styles.dateBtn }}
                              uppercase={false}
                              labelStyle={{ ...styles.dateBtnLabelStyle }}
                              mode="contained"
                              onPress={showDatePickerActivityBegin}
                            >
                              {activityDateBegin ? moment(activityDateBegin).format('DD-MMMM-YY') : t('calendar_screen.activity_start_date_placeholder')}
                            </ButtonPaper>
                          </View>
                          <DateTimePickerModal
                            isVisible={isDateVisibleActivityBegin}
                            mode="date"
                            onConfirm={handleConfirmActivityBegin}
                            onCancel={hideDatePickerActivityBegin}
                            date={activityDateBegin ? new Date(activityDateBegin) : undefined}
                            minimumDate={activityDateBegin ? new Date(activityDateBegin) : undefined}
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
                              {t('calendar_screen.to_label')}
                            </ButtonPaper>
                            <ButtonPaper
                              theme={{ ...theme, colors: { ...theme.colors, primary: 'white' } }}
                              icon="calendar"
                              compact
                              style={{ ...styles.dateBtn }}
                              uppercase={false}
                              labelStyle={{ ...styles.dateBtnLabelStyle }}
                              mode="contained"
                              onPress={showDatePickerActivityEnd}
                            >
                              {activityDateEnd ? moment(activityDateEnd).format('DD-MMMM-YY') : t('calendar_screen.activity_end_date_placeholder')}
                            </ButtonPaper>
                          </View>
                          <DateTimePickerModal
                            isVisible={isDateVisibleActivityEnd}
                            mode="date"
                            onConfirm={handleConfirmActivityEnd}
                            onCancel={hideDatePickerActivityEnd}
                            date={activityDateEnd ? new Date(activityDateEnd) : undefined}
                            minimumDate={activityDateBegin ? new Date(activityDateBegin) : undefined}
                          />
                        </View>
                      </View>
                    </View>}

                    <View style={{ marginTop: 15, }}>
                      <Text style={{ ...styles.subTitle }}>{t('calendar_screen.schedule_label')}</Text>
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
                            }} searchText={t('calendar_screen.search_hour_placeholder')} />
                        </View>
                        <View style={{ flex: 0.2 }}>
                          <Text style={{ textAlign: 'center' }}>{t('calendar_screen.time_at_label')}</Text>
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
                            }} title={'hh:mm'} searchText={t('calendar_screen.search_hour_placeholder')} />
                        </View>
                      </View>
                    </View>

                  </>}

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
                        {isSyncing ? t('calendar_screen.saving_in_progress') : t('calendar_screen.confirm_button')}
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
                      <Text style={styles.horizontal_title}>{t('calendar_screen.phase_detail_label')}</Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{activity?.phase?.name}</Text>
                    </View>
                  </View>}

                  {(activity?.type != "vacation" && activity?.name) && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>{t('calendar_screen.activity_detail_label')}</Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{activity?.name}</Text>
                    </View>
                  </View>}

                  {(activity?.type != "vacation" && activity?.component) && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>{t('calendar_screen.component_detail_label')}</Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{activity?.component}</Text>
                    </View>
                  </View>}

                  {(activity?.type != "vacation" && activity?.work_environment) && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>{t('calendar_screen.work_environment_detail_label')}</Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{WORK_ENVIRONMENT_DICT_TRANSLATED[activity?.work_environment] ?? activity?.work_environment}</Text>
                    </View>
                  </View>}

                  {(activity?.type != "vacation" && activity?.description) && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>{t('calendar_screen.activity_description_detail_label')}</Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{activity?.description ?? t('calendar_screen.description_not_mentioned')}</Text>
                    </View>
                  </View>}

                  {(activity?.type != "vacation") && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>{t('calendar_screen.is_free_activity_detail_label')}</Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{activity?.type == "free_task" ? t('common:yes') : t('common:no')}</Text>
                    </View>
                  </View>}

                  {(activity?.type == "vacation" && activity?.vacation_type) && <View style={[styles.container_horizontal, { marginBottom: 25 }]}>
                    <View >
                      <Text style={styles.horizontal_title}>{t('calendar_screen.leave_type_detail_label')}</Text>
                    </View>
                    <View >
                      <Text style={styles.horizontal_value}>{activity?.vacation_type}</Text>
                    </View>
                  </View>}

                  {(activity?.administrative_levels && activity?.administrative_levels?.length > 0) && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>{t('calendar_screen.villages_label', { plural: activity?.administrative_levels?.length >= 2 ? 's' : '' })}</Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{activity?.administrative_levels.map((a: any) => a?.name).join(", ")}</Text>
                    </View>
                  </View>}

                  {(activity?.planned_date) && <View style={[styles.container_horizontal, { paddingVertical: 7 }]}>
                    <FontAwesome name="calendar" size={20} color={activity?.backgroundColor} />
                    <View style={{ marginLeft: 5 }}>
                      <Text>
                        {t('calendar_screen.planned_time_range', { date: capitalizeFirstLetterForEachWord(moment(activity?.planned_date).format('dddd DD, MMMM YYYY')), startTime: moment(activity?.planned_datetime_start).format('HH:mm'), endTime: moment(activity?.planned_datetime_end).format('HH:mm') })}
                      </Text>
                    </View>
                  </View>}

                  {(activity?.planned_datetime_start && activity?.planned_datetime_end && (activity?.type == "vacation" || activity.planned_datetime_start.split("T")[0] != activity.planned_datetime_end.split("T")[0])) && <View style={[styles.container_horizontal, { paddingVertical: 7 }]}>
                    <FontAwesome name="calendar" size={20} color={activity?.backgroundColor} />
                    <View style={{ marginLeft: 5 }}>
                      <Text>
                        {t('calendar_screen.date_range_with_title', { title: activity?.type == "vacation" ? t('calendar_screen.absence_date_title') : t('calendar_screen.planning_dates_title'), startDate: capitalizeFirstLetterForEachWord(moment(activity?.planned_datetime_start).format('dddd DD, MMMM YYYY')), endDate: capitalizeFirstLetterForEachWord(moment(activity?.planned_datetime_end).format('dddd DD, MMMM YYYY')) })}
                      </Text>
                    </View>
                  </View>}

                  {(activity?.vacation_return_datetime) && <View style={[styles.container_horizontal, { paddingVertical: 7 }]}>
                    <FontAwesome name="calendar" size={20} color={activity?.backgroundColor} />
                    <View style={{ marginLeft: 5 }}>
                      <Text>
                        {t('calendar_screen.return_date_range', { date: capitalizeFirstLetterForEachWord(moment(activity?.vacation_return_datetime).format('dddd DD, MMMM YYYY')) })}
                      </Text>
                    </View>
                  </View>}

                  {activity?.undo && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>{t('calendar_screen.undone_activity_reason_label')}</Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{activity?.undo_comment ?? t('calendar_screen.reason_not_mentioned')}</Text>
                    </View>
                  </View>}


                  {
                    activity?.is_another && <View style={{ marginTop: 11 }}>
                      <Text>{t('calendar_screen.another_activity_performed_notice')}</Text>

                      {activity?.another_detail && <View>
                        {activity?.another_detail?.phase && <View style={styles.container_horizontal}>
                          <View style={styles.container_horizontal_title}>
                            <Text style={styles.horizontal_title}>{t('calendar_screen.phase_detail_label')}</Text>
                          </View>
                          <View style={styles.container_horizontal_value}>
                            <Text style={styles.horizontal_value}>{activity?.another_detail?.phase?.name}</Text>
                          </View>
                        </View>}

                        <View style={styles.container_horizontal}>
                          <View style={styles.container_horizontal_title}>
                            <Text style={styles.horizontal_title}>{t('calendar_screen.activity_detail_label')}</Text>
                          </View>
                          <View style={styles.container_horizontal_value}>
                            <Text style={styles.horizontal_value}>{activity?.another_detail?.name}</Text>
                          </View>
                        </View>

                        {(activity?.another_detail?.component) && <View style={styles.container_horizontal}>
                          <View style={styles.container_horizontal_title}>
                            <Text style={styles.horizontal_title}>{t('calendar_screen.component_detail_label')}</Text>
                          </View>
                          <View style={styles.container_horizontal_value}>
                            <Text style={styles.horizontal_value}>{activity?.another_detail?.component}</Text>
                          </View>
                        </View>}

                        {(activity?.another_detail?.work_environment) && <View style={styles.container_horizontal}>
                          <View style={styles.container_horizontal_title}>
                            <Text style={styles.horizontal_title}>{t('calendar_screen.work_environment_detail_label')}</Text>
                          </View>
                          <View style={styles.container_horizontal_value}>
                            <Text style={styles.horizontal_value}>{WORK_ENVIRONMENT_DICT_TRANSLATED[activity?.another_detail?.work_environment] ?? activity?.another_detail?.work_environment}</Text>
                          </View>
                        </View>}

                        <View style={styles.container_horizontal}>
                          <View style={styles.container_horizontal_title}>
                            <Text style={styles.horizontal_title}>{t('calendar_screen.is_free_activity_detail_label')}</Text>
                          </View>
                          <View style={styles.container_horizontal_value}>
                            <Text style={styles.horizontal_value}>{activity?.is_free_task ? t('common:yes') : t('common:no')}</Text>
                          </View>
                        </View>

                        {(activity?.another_detail?.administrative_levels && activity?.another_detail?.administrative_levels?.length > 0) && <View style={styles.container_horizontal}>
                          <View style={styles.container_horizontal_title}>
                            <Text style={styles.horizontal_title}>{t('calendar_screen.villages_label', { plural: activity?.another_detail?.administrative_levels?.length >= 2 ? 's' : '' })}</Text>
                          </View>
                          <View style={styles.container_horizontal_value}>
                            <Text style={styles.horizontal_value}>{activity?.another_detail?.administrative_levels.map((a: any) => a?.name).join(", ")}</Text>
                          </View>
                        </View>}

                      </View>}

                    </View>
                  }

                  {(activity?.completed || activity?.is_another) && <>
                    <View style={styles.container_horizontal}>
                      <View style={styles.container_horizontal_title}>
                        <Text style={styles.horizontal_title}>{t('calendar_screen.comment_label')}</Text>
                      </View>
                      <View style={styles.container_horizontal_value}>
                        <Text style={styles.horizontal_value}>{activity?.comment ?? t('calendar_screen.comment_not_mentioned')}</Text>
                      </View>
                    </View>
                    {
                        ((activity?.total_people_present && activity?.total_people_present != 0)) &&

                        <View style={styles.table}>
                            <View style={styles.tableRow}>
                                <Text style={[styles.tableHeader, styles.column1H1]}>{t('calendar_screen.table_label_header')}</Text>
                                <Text style={[styles.tableHeader, styles.column2H1]}>{t('calendar_screen.table_men_header')}</Text>
                                <Text style={[styles.tableHeader, styles.column3H1]}>{t('calendar_screen.table_women_header')}</Text>
                                <Text style={[styles.tableHeader, styles.column4H1]}>{t('calendar_screen.table_total_header')}</Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={[styles.tableHeader2, styles.column1]}>{t('calendar_screen.table_age_header')}</Text>
                                <Text style={[styles.tableHeader2, styles.column2]}>{`<=10`}</Text>
                                <Text style={[styles.tableHeader2, styles.column3]}>{`10<X<=35`}</Text>
                                <Text style={[styles.tableHeader2, styles.column4]}>{`<=35`}</Text>
                                <Text style={[styles.tableHeader2, styles.column5]}>{`>35`}</Text>
                                <Text style={[styles.tableHeader2, styles.column6]}>{`<=10`}</Text>
                                <Text style={[styles.tableHeader2, styles.column7]}>{`10<X<=35`}</Text>
                                <Text style={[styles.tableHeader2, styles.column8]}>{`<=35`}</Text>
                                <Text style={[styles.tableHeader2, styles.column9]}>{`>35`}</Text>
                                <Text style={[styles.tableHeader2, styles.column10]}>{t('calendar_screen.table_total_header')}</Text>
                            </View>

                            {[{
                                  libelle: t('calendar_screen.table_present_label'),
                                  men_over_35: activity?.total_men_present_over_35 ?? 0, women_over_35: activity?.total_women_present_over_35 ?? 0,
                                  men_under_35: activity?.total_men_present_under_35 ?? 0, women_under_35: activity?.total_women_present_under_35 ?? 0,
                                  men_between_10_35: '-', women_between_10_35: '-',
                                  men_under_10: '-', women_under_10: '-',
                                  total: activity?.total_people_present ?? 0
                              }].filter((e: any) => e.total && e.total != 0).map((item, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={[styles.tableCell, styles.column1]}>{item.libelle}</Text>
                                    <Text style={[styles.tableCell, styles.column2]}>{item.men_under_10}</Text>
                                    <Text style={[styles.tableCell, styles.column3]}>{item.men_between_10_35}</Text>
                                    <Text style={[styles.tableCell, styles.column4]}>{item.men_under_35}</Text>
                                    <Text style={[styles.tableCell, styles.column5]}>{item.men_over_35}</Text>
                                    <Text style={[styles.tableCell, styles.column6]}>{item.women_under_10}</Text>
                                    <Text style={[styles.tableCell, styles.column7]}>{item.women_between_10_35}</Text>
                                    <Text style={[styles.tableCell, styles.column8]}>{item.women_under_35}</Text>
                                    <Text style={[styles.tableCell, styles.column9]}>{item.women_over_35}</Text>
                                    <Text style={[styles.tableCell, styles.column10]}>{item.total}</Text>
                                </View>
                            ))}
                        </View>}
                  </>}

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
                  <Text style={[styles.modalDetailText]}>{t('calendar_screen.report_modal_title')}</Text>
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
                      <Text style={styles.horizontal_title}>{t('calendar_screen.phase_detail_label')}</Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{activity?.phase?.name}</Text>
                    </View>
                  </View>}

                  {activity?.name && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>{t('calendar_screen.activity_detail_label')}</Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{activity?.name}</Text>
                    </View>
                  </View>}

                  {activity?.description && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>{t('calendar_screen.activity_description_detail_label')}</Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{activity?.description ?? t('calendar_screen.description_not_mentioned')}</Text>
                    </View>
                  </View>}

                  {(activity?.administrative_levels && activity?.administrative_levels?.length > 0) && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>{t('calendar_screen.villages_label', { plural: activity?.administrative_levels?.length >= 2 ? 's' : '' })}</Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{activity?.administrative_levels.map((a: any) => a.name).join(", ")}</Text>
                    </View>
                  </View>}

                  <View style={[styles.container_horizontal, { paddingVertical: 7 }]}>
                    <FontAwesome name="calendar" size={20} color={activity?.backgroundColor} />
                    <View style={{ marginLeft: 5 }}>
                      <Text>
                        {t('calendar_screen.planned_time_range', { date: capitalizeFirstLetterForEachWord(moment(activity?.planned_date).format('dddd DD, MMMM YYYY')), startTime: moment(activity?.planned_datetime_start).format('HH:mm'), endTime: moment(activity?.planned_datetime_end).format('HH:mm') })}
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
                        <Text style={[styles.title, { flex: 1 }]}>{t('calendar_screen.activity_completed_label')}</Text>
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
                        <Text style={[styles.title, { flex: 1 }]}>{t('calendar_screen.could_not_complete_task_label')}</Text>
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
                          placeholder={t('calendar_screen.undo_reason_placeholder')}
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
                        <Text style={[styles.title, { flex: 1 }]}>{t('calendar_screen.performed_another_activity_label')}</Text>
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
                        <Text style={[styles.title, { flex: 1 }]}>{t('calendar_screen.is_free_activity_question')}</Text>
                      </View>


                      <View>
                        <Text style={{ ...styles.subTitle }}>{t('calendar_screen.cantons_label')}</Text>
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
                          }} title={t('calendar_screen.choose_cantons_title')} searchText={t('calendar_screen.search_canton_placeholder')} />
                      </View>

                      <View>
                        <Text style={{ ...styles.subTitle }}>{t('calendar_screen.places_label')}</Text>
                        <SectionedMultiSelectCustom
                          id={"id"}
                          K_OPTIONS={villages.map((item: any) => {
                            return { name: `${item.name}`, id: item.id }
                          })}
                          items={villages}
                          itemsSelected={villagesSelectedID}
                          setItemsSelected={setVillagesSelectedID}
                          onConfirm={() => {
                            let vs = villages.filter((e: any) => villagesSelectedID.includes(e.id) ?? []);
                            setVillagesSelected(vs);
                          }}
                          otherStyles={{
                            borderRadius: 5,
                            padding: 10,
                          }} title={t('calendar_screen.choose_villages_title')} searchText={t('calendar_screen.search_village_placeholder')} />
                      </View>

                      {isFreeTask && <View style={{ marginTop: 8 }}>
                        <Text style={{ ...styles.subTitle }}>{t('calendar_screen.activity_title_label')}</Text>
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
                          <Text style={{ ...styles.subTitle }}>{t('calendar_screen.phase_label')}</Text>
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
                            }} title={t('calendar_screen.select_phase_title')} searchText={t('calendar_screen.search_phase_placeholder')} />
                        </View>
                        <View style={{ flex: 0.02 }}></View>
                        <View style={{ flex: 0.49 }}>
                          <Text style={{ ...styles.subTitle }}>{t('calendar_screen.activity_select_label')}</Text>
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
                            }} title={!(phase && phase.name) ? "---" : t('calendar_screen.select_step_title')} searchText={t('calendar_screen.search_step_placeholder')} />
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
                        placeholder={t('calendar_screen.completed_activity_description_placeholder')}
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


                      <View style={{ marginTop: 15, }}>
                        <Text style={{ ...styles.subTitle }}>{t('calendar_screen.men_over_35_label')}</Text>
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
                          onChangeText={(v: any) => {
                              let n_v = return_numbers_only(v);
                              setTotal_men_present_over_35(n_v)
                              setTotal_people_present_over_35((n_v ?? 0) + (total_women_present_over_35 ?? 0)),
                              setTotal_people_present((
                                  (total_men_present_under_35 ?? 0) + (total_women_present_under_35 ?? 0) +
                                  (total_women_present_over_35 ?? 0) + (n_v ?? 0)
                              ))
                          }}
                          value={total_men_present_over_35?.toString()}
                          keyboardType="numeric"
                          placeholder={t('calendar_screen.men_over_35_placeholder')}
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
                      </View>
                      <View style={{ marginTop: 15, }}>
                        <Text style={{ ...styles.subTitle }}>{t('calendar_screen.women_over_35_label')}</Text>
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
                          onChangeText={(v: any) => {
                              let n_v = return_numbers_only(v);
                              setTotal_women_present_over_35(n_v)
                              setTotal_people_present_over_35(
                                  (total_men_present_over_35 ?? 0) + (n_v ?? 0)
                              )
                              setTotal_people_present(
                                  (total_men_present_under_35 ?? 0) + (total_women_present_under_35 ?? 0) +
                                  (total_men_present_over_35 ?? 0) + (n_v ?? 0)
                              )
                          }}
                          value={total_women_present_over_35?.toString()}
                          keyboardType="numeric"
                          placeholder={t('calendar_screen.women_over_35_placeholder')}
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
                      </View>
                      <View style={{ marginTop: 15, }}>
                        <Text style={{ ...styles.subTitle }}>{t('calendar_screen.people_over_35_label')}</Text>
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
                          disabled={true}
                          value={total_people_present_over_35?.toString()}
                          keyboardType="numeric"
                          placeholder={t('calendar_screen.people_over_35_placeholder')}
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
                      </View>
                      <View style={{ marginTop: 15, }}>
                        <Text style={{ ...styles.subTitle }}>{t('calendar_screen.men_under_35_label')}</Text>
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
                          onChangeText={(v: any) => {
                              let n_v = return_numbers_only(v);
                              setTotal_men_present_under_35(n_v)
                              setTotal_people_present_under_35(
                                  (n_v ?? 0) + (total_women_present_under_35 ?? 0)
                              )
                              setTotal_people_present(
                                  (total_men_present_over_35 ?? 0) + (total_women_present_over_35 ?? 0) +
                                  (total_women_present_under_35 ?? 0) + (n_v ?? 0)
                              )
                          }}
                          value={total_men_present_under_35?.toString()}
                          keyboardType="numeric"
                          placeholder={t('calendar_screen.men_under_35_placeholder')}
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
                      </View>
                      <View style={{ marginTop: 15, }}>
                        <Text style={{ ...styles.subTitle }}>{t('calendar_screen.women_under_35_label')}</Text>
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
                          onChangeText={(v: any) => {
                              let n_v = return_numbers_only(v);
                              setTotal_women_present_under_35(n_v)
                              setTotal_people_present_under_35(
                                  (total_men_present_under_35 ?? 0) + (n_v ?? 0)
                              ),
                              setTotal_people_present(
                                  (total_men_present_over_35 ?? 0) + (total_women_present_over_35 ?? 0) +
                                  (total_men_present_under_35 ?? 0) + (n_v ?? 0)
                              )
                          }}
                          value={total_women_present_under_35?.toString()}
                          keyboardType="numeric"
                          placeholder={t('calendar_screen.women_under_35_placeholder')}
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
                      </View>
                      <View style={{ marginTop: 15, }}>
                        <Text style={{ ...styles.subTitle }}>{t('calendar_screen.people_under_35_label')}</Text>
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
                          disabled={true}
                          value={total_people_present_under_35?.toString()}
                          keyboardType="numeric"
                          placeholder={t('calendar_screen.people_under_35_placeholder')}
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
                      </View>
                      
                      <View style={{ marginTop: 15, }}>
                        <Text style={{ ...styles.subTitle }}>{t('calendar_screen.total_people_present_label')}</Text>
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
                          disabled={true}
                          value={total_people_present?.toString()}
                          keyboardType="numeric"
                          placeholder={t('calendar_screen.total_people_placeholder')}
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
                      </View>

                    </View>}

                    <View style={{ marginTop: 15, flexDirection: 'row', }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ ...styles.subTitle }}>{t('calendar_screen.component_label')}</Text>
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
                          }} title={t('calendar_screen.select_component_title')} searchText={t('calendar_screen.search_component_placeholder')} />
                      </View>
                    </View>

                    <View style={{ marginTop: 15, flexDirection: 'row', }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ ...styles.subTitle }}>{t('calendar_screen.work_environment_label')}</Text>
                        <SectionedOneSelectCustom
                          id={"id"}
                          K_OPTIONS={WORK_ENVIRONMENT_TRANSLATED.map((item: any) => {
                            return { name: item.label, id: item.value }
                          })}
                          items={WORK_ENVIRONMENT_TRANSLATED.map((item: any) => {
                            return { name: item.label, id: item.value }
                          })}
                          itemSelected={workEnvironment}
                          setItemSelected={setWorkEnvironment}
                          otherStyles={{
                            borderRadius: 1,
                            padding: 10,
                          }} title={t('calendar_screen.select_work_environment_title')} searchText={t('calendar_screen.search_work_environment_placeholder')} />
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
                        {isSyncing ? t('calendar_screen.saving_in_progress') : t('calendar_screen.confirm_button')}
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


          {/* Task Geolocation */}
          {activity && <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisibleGeolocation}
            onRequestClose={() => {
              setModalVisibleGeolocation(!modalVisibleGeolocation);
            }}>
            <View style={[styles.modalView, styles.modalViewPlanning]}>
              <View style={styles.modalHeader}>
                <View style={[styles.containerModalText, { flexDirection: 'row' }]}>
                  <Text style={[styles.modalDetailText]}>{activity?.name}</Text>
                </View>
                <View style={styles.containerModalHeaderIcon}>
                  <TouchableOpacity
                    onPress={() => setModalVisibleGeolocation(false)} >
                    <FontAwesome name="close" size={24} color="grey" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.conatinerFieldsPlanning}>
                <ScrollView
                  nestedScrollEnabled={true}
                  style={{ zIndex: 1 }}
                >


                  <View>
                    <View>
                      <Text>
                        {t('calendar_screen.geolocation_instructions_line1')} {'\n'}
                        {t('calendar_screen.geolocation_instructions_line2_prefix')}<Text style={{ fontWeight: 'bold' }}>{t('calendar_screen.arrived_quoted_label')}</Text>{t('calendar_screen.geolocation_instructions_line2_suffix')} {'\n'}
                        {t('calendar_screen.geolocation_instructions_line3_prefix')}<Text style={{ fontWeight: 'bold' }}>{t('calendar_screen.leaving_quoted_label')}</Text>{t('calendar_screen.geolocation_instructions_line3_suffix')} {'\n'}
                        {t('calendar_screen.geolocation_instructions_line4_prefix')}<Text style={{ fontWeight: 'bold' }}>{t('calendar_screen.leaving_quoted_label')}</Text>{t('calendar_screen.geolocation_instructions_line4_suffix')} {'\n'}
                      </Text>
                    </View>


                    <Divider />


                    {geolocations != null && <FlatList
                      data={geolocations ?? []}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={renderGeolocationItem}
                    />}







                    {((!geolocations || !plageDates || currentGeolocationEnding || (
                      !(geolocations && plageDates && geolocations.length == plageDates.length) && !currentGeolocation
                    )) && isToday(new XDate(selectedDate))) && <LocationPosition
                        location={locationGet} setLocation={setLocationGet}
                        accuracy={accuracyGeolocation} setAccuracy={setAccuracyGeolocation}
                        error={errorGeolocation} setError={setErrorGeolocation}
                        setTakingDate={setTakingDateGeolocation} takingDate={takingDateGeolocation}
                        title={currentGeolocationEnding ? t('calendar_screen.departure_info_title') : t('calendar_screen.arrival_info_title')} btnTitle={currentGeolocationEnding ? t('calendar_screen.leaving_button_label') : t('calendar_screen.arrived_button_label')}
                        save={true} setSuccessSaved={setSuccessSaved}
                        activity={activity}
                        currentGeolocationEnding={currentGeolocationEnding} setCurrentGeolocationEnding={setCurrentGeolocationEnding}
                        currentGeolocation={currentGeolocation} setCurrentGeolocation={setCurrentGeolocation}
                        setGeolocations={setGeolocations}
                        selectedDate={selectedDate}
                        showDetails={false}
                        get_tasks_planned={get_tasks_planned}
                        setLoading={setLoading}
                      />}


                  </View>



                </ScrollView>
              </View>


            </View>
          </Modal>}
          {/* End Geolocation */}



          <View style={styles.taskListContainer}>
            <Text style={styles.taskListDate}>
              {selectedDate ? `${capitalizeFirstLetterForEachWord(moment(selectedDate).format('dddd DD, MMMM YYYY'))}` : t('calendar_screen.select_a_date')}
            </Text>
            {/* <ScrollView
            nestedScrollEnabled={true}
            style={{ zIndex: 1 }}
          > */}
            {markedDates != null ? <FlatList
              data={markedDates[selectedDate]?.datas ?? []}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderTaskItem}
              ListEmptyComponent={<Text style={styles.noTasksText}>{t('calendar_screen.no_tasks_planned')}</Text>}
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

          setActivityDateBegin(selectedDate);
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
    marginBottom: '11%',
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
    zIndex: 99,
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

  container_geolocation: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title_geolocation: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text_geolocation: {
    fontSize: 16,
    marginVertical: 5,
  },
  error_geolocation: {
    color: 'red',
    marginTop: 10,
  },
  table: {
      flex: 1,
      width: '100%',
      borderWidth: 1,
      borderColor: '#ddd',
      marginVertical: 7
  },
  tableRow: {
      flex: 1,
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderTopWidth: 1,
      borderColor: '#ddd',
  },
  tableHeader: {
      flex: 1,
      fontWeight: 'bold',
      backgroundColor: '#f8f8f8',
      borderRightWidth: 1,
      borderColor: '#ddd',
  },
  tableHeader2: {
      flex: 1,
      fontWeight: 'bold',
      backgroundColor: '#f8f8f8',
      borderRightWidth: 1,
      paddingVertical: 5,
      borderColor: '#ddd',
      textAlign: 'center',
      justifyContent: 'center',
      fontSize: 6,
  },
  tableCell: {
      flex: 1,
      borderRightWidth: 1,
      textAlign: 'center',
      justifyContent: 'center',
      paddingBottom: 7,
      borderColor: '#ddd',
      fontSize: 11,
  },
  column1H1: {
      flex: 0.2,
  },
  column2H1: {
      flex: 0.35,
  },
  column3H1: {
      flex: 0.35,
  },
  column4H1: {
      flex: 0.1,
  },
  column1: {
      flex: 0.2,
  },
  column2: {
      flex: 0.1,
  },
  column3: {
      flex: 0.1,
  },
  column4: {
      flex: 0.1,
  },
  column5: {
      flex: 0.1,
  },
  column6: {
      flex: 0.1,
  },
  column7: {
      flex: 0.1,
  },
  column8: {
      flex: 0.1,
  },
  column9: {
      flex: 0.1,
  },
  column10: {
      flex: 0.1,
  },

});

export default CalendarScreen;
