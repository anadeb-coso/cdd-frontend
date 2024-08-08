import React, { useState, useEffect, useContext } from 'react';
import {
  Box, useToast, Modal as ModalBase, Button as ButtonBase, VStack
} from 'native-base';
import {
  View, Text, Modal, TextInput, FlatList, StyleSheet, TouchableOpacity,
  Button, ScrollView, RefreshControl, Dimensions, Image, ImageBackground
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { FontAwesome } from '@expo/vector-icons';
import { Snackbar, Checkbox, TextInput as TextInputPaper, ActivityIndicator } from 'react-native-paper';
import XDate from 'xdate';
import moment from 'moment';
import 'moment/locale/fr';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import NetInfo from '@react-native-community/netinfo';
import CustomDay from './CustomDay'; // Import your CustomDay component
import SectionedOneSelectCustom from '../../components/SectionedOneSelectCustom';
// import LocalDatabase from '../../utils/databaseManager';
// import { LocalDatabaseADL, LocalDatabaseProcessDesign } from '../../utils/databaseManager';
import { addDocument, getDocumentsByAttributes, updateDocument } from '../../utils/coucdb_call';
import {
  clear_duplicate_on_liste, times_split, capitalizeFirstLetterForEachWord,
  capitalizeFirstLetter, image_compress
} from '../../utils/functions';
import AuthContext from '../../contexts/auth';
import { PHASES_COLORS, PHASES_WITH_THEIR_NUMBERS } from '../../utils/constants';
import { getImageDimensions, getImageSize } from '../../utils/functions_native';
import { uploadFile } from '../../services/upload';
import { baseURL } from '../../services/API';
import { handleStorageError } from '../../utils/pouchdb_call';

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

const CalendarScreen = () => {
  const { user, signOut } = useContext(AuthContext);
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisibleSelectOption, setModalVisibleSelectOption] = useState(false);
  const [modalVisiblePlanningExistingTask, setModalVisiblePlanningExistingTask] = useState(false);
  const [modalVisibleTaskDetail, setModalVisibleTaskDetail] = useState(false);
  const [modalVisiblePlanningTaskEdit, setModalVisiblePlanningTaskEdit] = useState(false);
  const [modalVisibleAttachmentLoad, setModalVisibleAttachmentLoad] = useState(false);
  const [isAddExistingTask, setIsAddExistingTask]: any = useState(false);
  const [village, setVillage]: any = useState(null);
  const [villages, setVillages] = useState([]);
  const [phase, setPhase]: any = useState(null);
  const [phases, setPhases] = useState([]);
  const [etape, setEtape]: any = useState(null);
  const [etapes, setEtapes] = useState([]);
  const [tache, setTache]: any = useState(null);
  const [anotherTache, setAnotherTache]: any = useState(null);
  const [taches, setTaches] = useState([]);
  const [timeStart, setTimeStart]: any = useState({ name: `00:00`, id: 0 });
  const [timeEnd, setTimeEnd]: any = useState(null);
  const [plannedTasks, setPlannedTasks]: any = useState([]);
  const [detailTask, setDetailTask]: any = useState(null);
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [markedDates, setMarkedDates]: any = useState(null);
  const [completed, setCompleted] = useState(false);
  const [undo, setUndo] = useState(false);
  const [isAnother, setIsAnother] = useState(false);
  const [isFreeTask, setIsFreeTask] = useState(false);
  const [freeTaskTitle, setFreeTaskTitle]: any = useState(null);
  const [completedComment, setCompletedComment]: any = useState(false);
  const [detailAnother, setDetailAnother]: any = useState(null);
  const [photoUri, setPhotoUri]: any = useState(false);
  const [isDeleting, setIsDeleting]: any = useState(false);
  const [isSyncing, setIsSyncing]: any = useState(false);
  const [descriptionFreeTask, setDescriptionFreeTask]: any = useState(null);



  const [newPlan, setNewPlan] = useState(false);
  const [editPlan, setEditPlan] = useState(false);

  const [connected, setConnected] = useState(true);
  const [errorMessage, setErrorMessage]: any = useState(null);
  const [errorVisible, setErrorVisible] = React.useState(false);
  const onDismissSnackBar = () => setErrorVisible(false);

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

  const set_datas = (item: any) => {

  };
  const reset_datas = (item: any) => {

  };

  const get_tasks_planned = () => {
    try {
      // LocalDatabase.find({
      //   selector: {
      //     type: {
      //       $in: ['task', 'free_task']
      //     },
      //     planning_dates: {
      //       $exists: true
      //     }
      //   },
      // })
      getDocumentsByAttributes({
        type: {
          $in: ['task', 'free_task']
        },
        planning_dates: {
          $exists: true
        }
      })
        .then((result: any) => {
          const tasksPlanned: any = result?.docs ?? [];
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
            elt.planning_dates.forEach((elt_planning: any) => {
              if (_markedDates[elt_planning]) {
                let p = elt.planning.filter((p: any) => p.planned_date == elt_planning);
                _markedDates[elt_planning].datas.push({
                  backgroundColor: PHASES_COLORS[PHASES_WITH_THEIR_NUMBERS[elt.phase_name]],
                  task_id: elt._id,
                  task_name: elt.name,
                  task_type: elt.type,
                  activity_description: elt.description,
                  activity_name: elt.activity_name,
                  phase_name: elt.phase_name,
                  administrative_level_id: elt.administrative_level_id,
                  administrative_level_name: elt.administrative_level_name,
                  task_sql_id: elt.sql_id,
                  planning: p,
                  completed: p[0]?.completed,
                  undo: p[0]?.undo,
                  is_another: p[0]?.is_another,
                  is_free_task: p[0]?.is_free_task,
                  another_detail: p[0]?.another_detail,
                  comment: p[0]?.comment,
                  photo_uri: p[0]?.photo_uri,
                });
              } else {
                let p = elt.planning.filter((p: any) => p.planned_date == elt_planning);
                _markedDates[elt_planning] = {
                  datas: [
                    {
                      backgroundColor: PHASES_COLORS[PHASES_WITH_THEIR_NUMBERS[elt.phase_name]],
                      task_id: elt._id,
                      task_name: elt.name,
                      task_type: elt.type,
                      activity_description: elt.description,
                      activity_name: elt.activity_name,
                      phase_name: elt.phase_name,
                      administrative_level_id: elt.administrative_level_id,
                      administrative_level_name: elt.administrative_level_name,
                      task_sql_id: elt.sql_id,
                      planning: p,
                      completed: p[0]?.completed,
                      undo: p[0]?.undo,
                      is_another: p[0]?.is_another,
                      is_free_task: p[0]?.is_free_task,
                      another_detail: p[0]?.another_detail,
                      comment: p[0]?.comment,
                      photo_uri: p[0]?.photo_uri,
                    }
                  ]
                }
              }
            });
          });

          Object.keys(_markedDates).forEach(function (key1) {
            Object.keys(_markedDates[key1]).forEach(function (key2) {

              _markedDates[key1][key2].sort((a: any, b: any) => {
                if (a.planning[0].planned_datetime_start < b.planning[0].planned_datetime_start) {
                  return -1;
                }
                if (a.planning[0].planned_datetime_start > b.planning[0].planned_datetime_start) {
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
    } catch (error) {
      handleStorageError(error);
    }

  };

  const handleAddTask = async () => {
    setIsSyncing(true);
    try {
      let is_already_plan_today = false;
      if (village && selectedDate &&
        (
          (newPlan && (
            (tache || freeTaskTitle) && timeStart && timeEnd
          ))
          ||
          (editPlan && (
            completed
            ||
            undo
            ||
            (isAnother && (
              anotherTache || freeTaskTitle
            ))
          ))
        )
      ) {
        var taskPlanned: any;
        if ((tache && tache.id) || (detailTask && detailTask.task_type == "task")) {
          if (newPlan) {
            is_already_plan_today = (markedDates[selectedDate]?.datas ?? []).findIndex((elt: any) => elt.task_sql_id == tache.id && elt.administrative_level_id == village.id) != -1;
          }
          if (!is_already_plan_today) {
            try {
              // await LocalDatabase.find({
              //   selector: {
              //     type: 'task',
              //     administrative_level_id: village.id,
              //     sql_id: tache?.id ?? detailTask?.task_sql_id
              //   },
              // })
              await getDocumentsByAttributes({
                type: 'task',
                administrative_level_id: village.id,
                sql_id: tache?.id ?? detailTask?.task_sql_id
              })
                .then((result: any) => {
                  taskPlanned = result?.docs[0] ?? {};
                }).catch((err: any) => {
                  handleStorageError(err);
                  console.log(err);
                });
            } catch (error) {
              handleStorageError(error);
            }
          }

        } else {
          if (newPlan) {
            is_already_plan_today = (markedDates[selectedDate]?.datas ?? []).findIndex((elt: any) => elt.task_name == freeTaskTitle && elt.administrative_level_id == village.id) != -1;
            console.log(1)
            if (!is_already_plan_today) {
              try {
                // await LocalDatabase.find({
                //   selector: {
                //     type: 'free_task',
                //     administrative_level_id: village.id,
                //     phase_name: phase.name,
                //     activity_name: etape.name,
                //     name: freeTaskTitle
                //   },
                // })
                await getDocumentsByAttributes({
                  type: 'free_task',
                  administrative_level_id: village.id,
                  phase_name: phase.name,
                  activity_name: etape.name,
                  name: freeTaskTitle
                })
                  .then(async (result: any) => {
                    taskPlanned = result?.docs[0] ?? null;
                    console.log(2)
                    if (!taskPlanned) {
                      try {
                        // await LocalDatabase.post({
                        //   type: 'free_task',
                        //   name: freeTaskTitle,
                        //   phase_name: phase.name,
                        //   activity_name: etape.name,
                        //   description: descriptionFreeTask,
                        //   administrative_level_id: village.id,
                        //   administrative_level_name: village.name,
                        // })
                        await addDocument({
                          type: 'free_task',
                          name: freeTaskTitle,
                          phase_name: phase.name,
                          activity_name: etape.name,
                          description: descriptionFreeTask,
                          administrative_level_id: village.id,
                          administrative_level_name: village.name,
                        })
                          .then(async (result: any) => {
                            console.log(3)
                            try {
                              // await LocalDatabase.find({
                              //   selector: {
                              //     type: 'free_task',
                              //     _id: result.id,
                              //   },
                              // })
                              await getDocumentsByAttributes({
                                type: 'free_task',
                                _id: result.id,
                              })
                                .then((result: any) => {
                                  console.log(4)
                                  taskPlanned = result?.docs[0] ?? {};
                                }).catch((err: any) => {
                                  handleStorageError(err);
                                  console.log(err);
                                });
                            } catch (error) {
                              handleStorageError(error);
                            }

                            // compactDatabase(LocalDatabase);
                          })
                          .catch((err: any) => {
                            handleStorageError(err);
                            console.log(err);
                          });
                      } catch (error) {
                        handleStorageError(error);
                      }
                    }
                  }).catch((err: any) => {
                    handleStorageError(err);
                    console.log(err);
                  });
              } catch (error) {
                handleStorageError(error);
              }
            }

          } else {
            try {
              // await LocalDatabase.find({
              //   selector: {
              //     type: 'free_task',
              //     administrative_level_id: village.id,
              //     phase_name: phase.name,
              //     activity_name: etape.name,
              //     name: detailTask?.task_name
              //   },
              // })
              await getDocumentsByAttributes({
                type: 'free_task',
                administrative_level_id: village.id,
                phase_name: phase.name,
                activity_name: etape.name,
                name: detailTask?.task_name
              })
                .then(async (result: any) => {
                  taskPlanned = result?.docs[0] ?? null;
                }).catch((err: any) => {
                  handleStorageError(err);
                  console.log(err);
                });
            } catch (error) {
              handleStorageError(error);
            }
          }
        }

        if (!is_already_plan_today) {
          // await LocalDatabase.find({
          //   selector: {
          //     type: 'task',
          //     administrative_level_id: village.id,
          //     sql_id: tache.sql_id
          //   },
          // })
          //   .then(async (result: any) => {
          //     const taskPlanned: any = result?.docs[0] ?? {};
          try {
            // await LocalDatabase.upsert
            await updateDocument(taskPlanned._id, function (doc: any) {
              doc = taskPlanned;
              let planning = doc.planning ?? [];
              if (editPlan) {
                let planning_edit = planning.find((elt: any) => elt.planned_date == selectedDate);

                planning_edit.completed = completed;
                planning_edit.undo = undo;
                planning_edit.is_another = isAnother;
                planning_edit.is_free_task = isFreeTask;

                if (isAnother) {
                  planning_edit.another_detail = {
                    phase: phase,
                    activity: etape,
                    task_name: isFreeTask ? freeTaskTitle : anotherTache?.name,
                    task_sql_id: anotherTache?.id ?? null
                  }
                }

                planning_edit.comment = completedComment;
                planning_edit.photo_uri = photoUri;
                planning_edit.updated_date = moment();

                let filter_planning = planning.filter((elt: any) => elt.planned_date != selectedDate);
                filter_planning.push(planning_edit);

                planning = filter_planning;

              } else {
                planning.push({
                  planned_date: `${selectedDate}`,
                  planned_datetime_start: `${selectedDate}T${timeStart.name}:00.000Z`,
                  planned_datetime_end: `${selectedDate}T${timeEnd.name}:00.000Z`,
                  created_date: moment()
                });
              }

              planning.sort((a: any, b: any) => {
                if (a.planned_datetime_start < b.planned_datetime_start) {
                  return -1;
                }
                if (a.planned_datetime_start > b.planned_datetime_start) {
                  return 1;
                }
                return 0;
              });


              doc.planning = planning;
              doc.planning_dates = planning.map((elt: any) => elt.planned_date);

              return doc;
            })
              .then(function (res: any) {


                setVillage(null);
                setPhase(null);
                setEtape(null);
                setTache(null);
                setFreeTaskTitle(null);
                setDescriptionFreeTask(null);
                setTimeStart({ name: `00:00`, id: 0 });
                setTimeEnd(null);

                setCompleted(false);
                setUndo(false);
                setIsAnother(false);
                setIsFreeTask(false);
                setFreeTaskTitle(null);
                setDetailAnother(null);
                setPhotoUri(null);
                setCompletedComment(null);
                setAnotherTache(null);

                // setSelectedDate('');
                setModalVisiblePlanningExistingTask(false);
                setModalVisiblePlanningTaskEdit(false);

                setErrorMessage(`Votre agenda a été mise à jour avec succès`);
                setErrorVisible(true);
                setNewPlan(false);
                setEditPlan(false);

                // setPlannedTasks([...plannedTasks, taskPlanned]);
                get_tasks_planned();

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
        } else {
          setErrorMessage(`Cette tâche est déjà planifiée sur cette journée dans cette localité!`);
          setErrorVisible(true);
        }
      } else {
        if (!village) {
          setErrorMessage(`Veuillez sélectionner un village`);
        } else if (newPlan) {
          if (!tache && isAddExistingTask) {
            setErrorMessage(`Veuillez sélectionner une tâche`);
          } else if (!freeTaskTitle && !isAddExistingTask) {
            setErrorMessage(`Veuillez sélectionner l'activité`);
          } else if (!timeEnd) {
            setErrorMessage(`Veuillez définir le temps de l'activité`);
          } else {
            setErrorMessage(`Veuillez remplir tous les champs`);
          }
        }
        else if (editPlan) {
          if (!anotherTache && !isFreeTask) {
            setErrorMessage(`Veuillez sélectionner une tâche`);
          } else if (!undo && !completed) {
            setErrorMessage(`Veuillez mentionner si la tâche est achevée ou a été défait`);
          } else if (!freeTaskTitle && isFreeTask) {
            setErrorMessage(`Veuillez mentionner l'activité`);
          } else {
            setErrorMessage(`Veuillez remplir tous les champs`);
          }
        } else {
          setErrorMessage(`Veuillez remplir tous les champs`);
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
      await getDocumentsByAttributes({ type: 'facilitator' })
        .then(async (result: any) => {

          let villagesResult: any = result?.docs[0]?.administrative_levels ?? [];

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
                        id: String(elt.id),
                        name: elt.name
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

          const v = villagesResult.find((elt: any) => elt.is_headquarters_village);

          setVillages(villagesResult);

          try {
            // await LocalDatabaseProcessDesign.find({
            //   selector: {
            //     type: {
            //       $in: ['task', 'activity', 'phase']
            //     },
            //     // administrative_level_id: v.id
            //   },
            // })
            await getDocumentsByAttributes({
              type: {
                $in: ['task', 'activity', 'phase']
              },
              // administrative_level_id: v.id
            }, 250, 0, "process_design")
              .then((result_2: any) => {
                const result_2_docs = result_2?.docs ?? [];
                let phs: any = result_2_docs.filter((elt: any) => elt.type == 'phase').map((elt: any) => {
                  return { name: `${elt.name}`, id: elt.sql_id }
                });
                let ths: any = result_2_docs.filter((elt: any) => elt.type == 'task').map((elt: any) => {
                  return {
                    name: `${elt.name}`, id: elt.sql_id, phase_name: elt.phase_name, activity_name: elt.activity_name
                  }
                });
                let ets: any = result_2_docs.filter((elt: any) => elt.type == 'activity').map((elt: any) => {
                  return {
                    name: `${elt.name}`, id: elt.sql_id, phase_name: ths.find((t: any) => t.activity_name == elt.name).phase_name
                  }
                });

                setPhases(phs);
                setEtapes(ets);
                setTaches(ths);

                // result_2_docs.forEach((elt: any) => {
                //   phs.push({ name: `${elt.phase_name}`, id: elt.phase_id });
                //   ets.push({ name: `${elt.activity_name}`, id: elt.activity_id, phase_name: elt.phase_name });
                //   ths.push({ name: `${elt.name}`, id: elt._id, phase_name: elt.phase_name, activity_name: elt.activity_name })
                // });

                // setPhases(clear_duplicate_on_liste(phs));
                // setEtapes(clear_duplicate_on_liste(ets));
                // setTaches(ths);

              }).catch((err: any) => {
                handleStorageError(err);
                console.log(err);
              });
          } catch (error) {
            handleStorageError(error);
          }
        }).catch((err: any) => {
          handleStorageError(err);
          console.log(err);
        });
    } catch (error) {
      handleStorageError(error);
    }
  };

  useEffect(() => {
    get_tasks_planned();
    get_facilitator_couchdb_datas();
  }, []);

  const renderTaskItem = ({ item }: { item: any }) => (
    <View style={styles.container_hour_task_display}>
      <View style={styles.container_hour_display}>
        {
          item.planning.map((p: any) => <Text key={`p${p.planned_datetime_start}`}
            style={[styles.hour, item.planning.length > 1 ? { fontSize: 8 } : {}]}>
            {moment(p.planned_datetime_start).format('HH:mm')} - {moment(p.planned_datetime_end).format('HH:mm')}
          </Text>)
        }
      </View>
      <View style={[styles.taskItem, { backgroundColor: PHASES_COLORS[PHASES_WITH_THEIR_NUMBERS[item.phase_name]] }]}>
        <View style={styles.container_task_display}>
          <View style={styles.container_check}>
            <View style={styles.check}>
              <FontAwesome name={(item.completed || item.is_another) ? "check-circle-o" : "circle-o"} size={24} color="white" />
            </View>
          </View>
          <View style={styles.container_task_adl}>
            <View>
              <Text style={styles.taskTitle}>{`${item.task_name}`}</Text>
            </View>
            <View>
              <Text style={styles.adl}>CVD: {item.administrative_level_name}</Text>
            </View>
          </View>
          <View style={styles.container_info_agenda}>
            <View style={styles.subcontainer_info_agenda}>
              <View style={styles.container_info}>
                <TouchableOpacity
                  onPress={() => {
                    setVillage({ name: item.administrative_level_name, id: item.administrative_level_id });
                    setPhase(phases.find((elt: any) => elt.name == item.phase_name));
                    setEtape(etapes.find((elt: any) => elt.name == item.activity_name));

                    setCompleted(item?.completed ?? null);
                    setUndo(item?.undo ?? null);
                    setIsAnother(item?.is_another ?? null);
                    setIsFreeTask(item?.is_free_task ?? null);
                    setFreeTaskTitle(item?.task_type == "free_task" ? item?.task_name : null);
                    setDetailAnother(item?.another_detail ?? null);
                    setPhotoUri(item?.photo_uri ?? null);
                    setCompletedComment(item?.comment ?? null);

                    setDetailTask(item);
                    setModalVisibleTaskDetail(true);
                  }}
                >
                  <FontAwesome name="info-circle" size={22} color="white" />
                </TouchableOpacity>
              </View>
              <View style={styles.container_agenda}>
                <TouchableOpacity
                  onPress={() => {
                    setVillage({ name: item.administrative_level_name, id: item.administrative_level_id });
                    setPhase(phases.find((elt: any) => elt.name == item.phase_name));
                    setEtape(etapes.find((elt: any) => elt.name == item.activity_name));

                    setCompleted(item?.completed ?? null);
                    setUndo(item?.undo ?? null);
                    setIsAnother(item?.is_another ?? null);
                    setIsFreeTask(item?.is_free_task ?? null);
                    setDetailAnother(item?.another_detail ?? null);
                    setPhotoUri(item?.photo_uri ?? null);
                    setCompletedComment(item?.comment ?? null);

                    setFreeTaskTitle(item?.another_detail?.task_name ?? null);
                    setAnotherTache(taches.find((elt: any) => elt.id == item?.another_detail?.task_sql_id) ?? null);


                    // setSelectedDate('');
                    setNewPlan(false);
                    setEditPlan(true);
                    setDetailTask(item);
                    setModalVisiblePlanningTaskEdit(true);
                  }}
                >
                  <FontAwesome
                    name={(item.completed || item.is_another) ? "calendar-check-o" : "calendar-o"}
                    size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>

  );

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

        setPhotoUri(localUri);
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
          setPhotoUri(response.fileUrl.split("?")[0]);
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
                    setModalVisiblePlanningExistingTask(true);
                    setIsAddExistingTask(true);
                    setFreeTaskTitle(null);
                  }}
                >
                  <Box rounded="lg" p={3} mt={3} bg="white" shadow={1}>
                    <View style={styles.conatinerOptionPlanning}>
                      <View style={styles.conatinerOptionPlanningText}>
                        <Text style={styles.optionPlanningText}>Tâche existante</Text>
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
                    setModalVisiblePlanningExistingTask(true);
                    setIsAddExistingTask(false);
                    setTache(null);
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

              </View>
            </View>
          </Modal>
          {/* End Selection Planning Options */}



          {/* Planning Task */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisiblePlanningExistingTask}
            onRequestClose={() => {
              setModalVisiblePlanningExistingTask(!modalVisiblePlanningExistingTask);
              setNewPlan(false);
            }}>
            <View style={[styles.modalView, styles.modalViewPlanning]}>
              <View style={styles.modalHeader}>
                <View style={styles.containerModalText}>
                  <Text style={styles.modalText}>
                    {isAddExistingTask ? `Planifier une tâche existante` : `Planifier une activité libre`}
                  </Text>
                </View>
                <View style={styles.containerModalHeaderIcon}>
                  <TouchableOpacity
                    onPress={() => setModalVisiblePlanningExistingTask(false)} >
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
                    <Text style={{ ...styles.subTitle }}>village:</Text>
                    <SectionedOneSelectCustom
                      id={"id"}
                      K_OPTIONS={villages.map((item: any) => {
                        return { name: `${item.name}`, id: item.id }
                      })}
                      items={villages}
                      itemSelected={village}
                      setItemSelected={setVillage}
                      otherStyles={{
                        borderRadius: 5,
                        padding: 10,
                      }} title={"Sélectionner le village"} searchText={"Rechercher un village"} />
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

                  <View style={{ marginTop: 15, flexDirection: 'row', }}>
                    <View style={{ flex: 0.49 }}>
                      <Text style={{ ...styles.subTitle }}>Phase:</Text>
                      <SectionedOneSelectCustom
                        id={"id"}
                        K_OPTIONS={phases}
                        items={phases}
                        itemSelected={phase}
                        setItemSelected={setPhase}
                        otherStyles={{
                          borderRadius: 1,
                          padding: 10,
                        }} title={"Sélectionner la phase"} searchText={"Rechercher une phase"} />
                    </View>
                    <View style={{ flex: 0.02 }}></View>
                    <View style={{ flex: 0.49 }}>
                      <Text style={{ ...styles.subTitle }}>Etape:</Text>
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
                  </View>


                  {isAddExistingTask && <View style={{ marginTop: 15, }}>
                    <Text style={{ ...styles.subTitle }}>Tâche:</Text>
                    <SectionedOneSelectCustom
                      id={"id"}
                      disabled={!(phase && phase.name && etape && etape.name)}
                      K_OPTIONS={(phase && phase.name) ? (
                        (etape && etape.name) ? taches.filter((elt: any) => elt.phase_name == phase.name && elt.activity_name == etape.name)
                          : taches.filter((elt: any) => elt.phase_name == phase.name)
                      ) : taches}
                      items={taches}
                      itemSelected={tache}
                      setItemSelected={setTache}
                      otherStyles={{
                        borderRadius: 5,
                        padding: 10,
                        backgroundColor: !(phase && phase.name && etape && etape.name) ? 'gray' : null,
                      }} title={!(phase && phase.name && etape && etape.name) ? "---" : "Sélectionner la tâche"} searchText={"Rechercher uné tâche"} />
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
                      placeholder={"Description de l'activité éffectuée"}
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
          {detailTask && <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisibleTaskDetail}
            onRequestClose={() => {
              setModalVisibleTaskDetail(!modalVisibleTaskDetail);
            }}>
            <View style={[styles.modalView, styles.modalViewPlanning]}>
              <View style={styles.modalHeader}>
                <View style={[styles.containerModalText, { flexDirection: 'row' }]}>
                  <Text style={[styles.modalDetailText]}>{detailTask?.task_name}</Text>
                  {detailTask?.planning && detailTask?.planning?.length == 1 && (detailTask?.completed || detailTask?.is_another) && <View style={[styles.detail_task_check, { marginLeft: 24 }]}>
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
                  {detailTask?.phase_name && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>Phase: </Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{detailTask?.phase_name}</Text>
                    </View>
                  </View>}

                  {detailTask?.activity_name && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>Activité: </Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{detailTask?.activity_name}</Text>
                    </View>
                  </View>}

                  {detailTask?.task_name && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>Tâche: </Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{detailTask?.task_name}</Text>
                    </View>
                  </View>}

                  <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>Tâche libre ? : </Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{detailTask?.task_type == "free_task" ? 'Oui' : 'Non'}</Text>
                    </View>
                  </View>

                  {detailTask?.administrative_level_name && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>Village: </Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{detailTask?.administrative_level_name}</Text>
                    </View>
                  </View>}

                  {detailTask?.planning && detailTask?.planning.map((elt: any) => <View style={[styles.container_horizontal, { paddingVertical: 7 }]}>
                    <FontAwesome name="calendar" size={20} color={detailTask?.backgroundColor} />
                    <View style={{ marginLeft: 5 }}>
                      <Text>
                        {capitalizeFirstLetterForEachWord(moment(elt?.planned_date).format('dddd DD, MMMM YYYY'))} {moment(elt?.planned_date_start).format('HH:mm')} à {moment(elt?.planned_date_end).format('HH:mm')}
                      </Text>
                    </View>
                    {detailTask?.planning?.length > 1 && <View style={[styles.detail_task_check, { marginLeft: 5 }]}>
                      <FontAwesome
                        name={(detailTask?.completed || detailTask?.is_another) ? "check-circle-o" : "circle-o"}
                        size={24}
                        color={(detailTask?.completed || detailTask?.is_another) ? "#63D3AC" : "gray"} />
                    </View>}
                  </View>)}


                  {
                    detailTask?.is_another && <View style={{ marginTop: 11 }}>
                      <Text>Autre activité a été éffectuée à la place de celle qui était planifiée. Ci-dessous les détails de l'activité réalisée</Text>

                      {detailTask?.another_detail && <View>
                        <View style={styles.container_horizontal}>
                          <View style={styles.container_horizontal_title}>
                            <Text style={styles.horizontal_title}>Phase: </Text>
                          </View>
                          <View style={styles.container_horizontal_value}>
                            <Text style={styles.horizontal_value}>{detailTask?.another_detail?.phase.name}</Text>
                          </View>
                        </View>

                        <View style={styles.container_horizontal}>
                          <View style={styles.container_horizontal_title}>
                            <Text style={styles.horizontal_title}>Activité: </Text>
                          </View>
                          <View style={styles.container_horizontal_value}>
                            <Text style={styles.horizontal_value}>{detailTask?.another_detail?.activity.name}</Text>
                          </View>
                        </View>

                        <View style={styles.container_horizontal}>
                          <View style={styles.container_horizontal_title}>
                            <Text style={styles.horizontal_title}>Tâche: </Text>
                          </View>
                          <View style={styles.container_horizontal_value}>
                            <Text style={styles.horizontal_value}>{detailTask?.another_detail?.task_name}</Text>
                          </View>
                        </View>

                        <View style={styles.container_horizontal}>
                          <View style={styles.container_horizontal_title}>
                            <Text style={styles.horizontal_title}>Tâche libre ? : </Text>
                          </View>
                          <View style={styles.container_horizontal_value}>
                            <Text style={styles.horizontal_value}>{detailTask?.is_free_task ? 'Oui' : 'Non'}</Text>
                          </View>
                        </View>

                      </View>}

                    </View>
                  }

                  <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>Commentaire: </Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{detailTask?.comment ?? "Commentaire non mentionné"}</Text>
                    </View>
                  </View>


                  {detailTask?.photo_uri && <ImageBackground
                    key={detailTask?.photo_uri}
                    source={{ uri: detailTask?.photo_uri }}
                    style={{
                      height: 210,
                      width: 210,
                      marginHorizontal: 1,
                      alignSelf: 'flex-start',
                      justifyContent: 'flex-end',
                      marginVertical: 20,
                    }}
                  >

                  </ImageBackground>}



                  {/* {detailTask?.planning && detailTask?.planning?.length == 1 && <View style={styles.detail_task_check}>
                  <FontAwesome
                    name={(detailTask?.completed || detailTask?.is_another) ? "check-circle-o" : "circle-o"}
                    size={screenWidth - 30}
                    color={(detailTask?.completed || detailTask?.is_another) ? "#63D3AC" : "gray"} />
                </View>} */}


                </ScrollView>
              </View>


            </View>
          </Modal>}
          {/* End Task Detail */}


          {/* Task Edit */}
          {detailTask && <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisiblePlanningTaskEdit}
            onRequestClose={() => {
              setModalVisiblePlanningTaskEdit(!modalVisiblePlanningTaskEdit);
              setEditPlan(false);
            }}>
            <View style={[styles.modalView, styles.modalViewPlanning]}>
              <View style={styles.modalHeader}>
                <View style={[styles.containerModalText, { flexDirection: 'row' }]}>
                  <Text style={[styles.modalDetailText]}>Rend compte</Text>
                  {detailTask?.planning && detailTask?.planning?.length == 1 && (detailTask?.completed || detailTask?.is_another) && <View style={[styles.detail_task_check, { marginLeft: 24 }]}>
                    <FontAwesome name="check-circle-o" size={24} color="#63D3AC" />
                  </View>}
                </View>
                <View style={styles.containerModalHeaderIcon}>
                  <TouchableOpacity
                    onPress={() => setModalVisiblePlanningTaskEdit(false)} >
                    <FontAwesome name="close" size={24} color="grey" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.conatinerFieldsPlanning}>
                <ScrollView
                  nestedScrollEnabled={true}
                  style={{ zIndex: 1 }}
                >
                  {detailTask?.phase_name && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>Phase: </Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{detailTask?.phase_name}</Text>
                    </View>
                  </View>}

                  {detailTask?.activity_name && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>Activité: </Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{detailTask?.activity_name}</Text>
                    </View>
                  </View>}

                  {detailTask?.task_name && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>Tâche: </Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{detailTask?.task_name}</Text>
                    </View>
                  </View>}

                  {detailTask?.administrative_level_name && <View style={styles.container_horizontal}>
                    <View style={styles.container_horizontal_title}>
                      <Text style={styles.horizontal_title}>Village: </Text>
                    </View>
                    <View style={styles.container_horizontal_value}>
                      <Text style={styles.horizontal_value}>{detailTask?.administrative_level_name}</Text>
                    </View>
                  </View>}

                  {detailTask?.planning && detailTask?.planning.map((elt: any) => <View style={[styles.container_horizontal, { paddingVertical: 7 }]}>
                    <FontAwesome name="calendar" size={20} color={detailTask?.backgroundColor} />
                    <View style={{ marginLeft: 5 }}>
                      <Text>
                        {capitalizeFirstLetterForEachWord(moment(elt?.planned_date).format('dddd DD, MMMM YYYY'))} {moment(elt?.planned_date_start).format('HH:mm')} à {moment(elt?.planned_date_end).format('HH:mm')}
                      </Text>
                    </View>
                    {detailTask?.planning?.length > 1 && <View style={[styles.detail_task_check, { marginLeft: 5 }]}>
                      <FontAwesome
                        name={(detailTask?.completed || detailTask?.is_another) ? "check-circle-o" : "circle-o"}
                        size={24}
                        color={(detailTask?.completed || detailTask?.is_another) ? "#63D3AC" : "gray"} />
                    </View>}
                  </View>)}


                  {detailTask?.planning && detailTask?.planning?.length == 1 && <>

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
                            // setDetailTask({ ...detailTask, completed: !completed });
                            setCompleted(!completed);
                          }}
                        />
                        <Text style={[styles.title, { flex: 1 }]}>Tâche achevée</Text>
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
                            // setDetailTask({ ...detailTask, undo: !undo });
                            setUndo(!undo);
                          }}
                        />
                        <Text style={[styles.title, { flex: 1 }]}>Je n'ai pas pu effectuer la tâche</Text>
                      </View>
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
                            // setDetailTask({ ...detailTask, isAnother: !isAnother });
                            setIsAnother(!isAnother);
                          }}
                        />
                        <Text style={[styles.title, { flex: 1 }]}>J'ai éffectué une autre tâche à la place</Text>
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
                            // setDetailTask({ ...detailTask, isFreeTask: !isFreeTask });
                            setIsFreeTask(!isFreeTask);
                          }}
                        />
                        <Text style={[styles.title, { flex: 1 }]}>La tâche éffectuée est une tâche libre ?</Text>
                      </View>

                      <View>
                        <Text style={{ ...styles.subTitle }}>village:</Text>
                        <SectionedOneSelectCustom
                          id={"id"}
                          K_OPTIONS={villages.map((item: any) => {
                            return { name: `${item.name}`, id: item.id }
                          })}
                          items={villages}
                          itemSelected={village}
                          setItemSelected={setVillage}
                          otherStyles={{
                            borderRadius: 5,
                            padding: 10,
                          }} title={"Sélectionner le village"} searchText={"Rechercher un village"} />
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

                      <View style={{ marginTop: 15, flexDirection: 'row', }}>
                        <View style={{ flex: 0.49 }}>
                          <Text style={{ ...styles.subTitle }}>Phase:</Text>
                          <SectionedOneSelectCustom
                            id={"id"}
                            K_OPTIONS={phases}
                            items={phases}
                            itemSelected={phase}
                            setItemSelected={setPhase}
                            otherStyles={{
                              borderRadius: 1,
                              padding: 10,
                            }} title={"Sélectionner la phase"} searchText={"Rechercher une phase"} />
                        </View>
                        <View style={{ flex: 0.02 }}></View>
                        <View style={{ flex: 0.49 }}>
                          <Text style={{ ...styles.subTitle }}>Etape:</Text>
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
                      </View>


                      {!isFreeTask && <View style={{ marginTop: 15, }}>
                        <Text style={{ ...styles.subTitle }}>Tâche:</Text>
                        <SectionedOneSelectCustom
                          id={"id"}
                          disabled={!(phase && phase.name && etape && etape.name)}
                          K_OPTIONS={(phase && phase.name) ? (
                            (etape && etape.name) ? taches.filter((elt: any) => elt.phase_name == phase.name && elt.activity_name == etape.name)
                              : taches.filter((elt: any) => elt.phase_name == phase.name)
                          ) : taches}
                          items={taches}
                          itemSelected={anotherTache}
                          setItemSelected={setAnotherTache}
                          otherStyles={{
                            borderRadius: 5,
                            padding: 10,
                            backgroundColor: !(phase && phase.name && etape && etape.name) ? "gray" : null,
                          }} title={!(phase && phase.name && etape && etape.name) ? "---" : "Sélectionner la tâche"} searchText={"Rechercher uné tâche"} />
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
                        placeholder={"Description de l'activité éffectuée"}
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

                  </>}

                  {photoUri ? <ImageBackground
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
                      key={detailTask?.task_name ?? detailTask?.task_sql_id}
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
                    </TouchableOpacity>}





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
          {/* End Task Edit */}


          {/* Attachment load */}
          <ModalBase
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

                  {/* <ButtonBase
                    style={{ backgroundColor: '#dcdcdc' }}

                    color="#ffffff"
                    rounded="xl"
                    onPress={() => {
                      setModalVisibleAttachmentLoad(false);
                    }}
                  >
                    Sortir
                  </ButtonBase> */}
                </VStack>
              </ModalBase.Body>
            </ModalBase.Content>
          </ModalBase>
          {/* End Attachment load */}



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


          <Snackbar visible={errorVisible} duration={1000} onDismiss={onDismissSnackBar}>
            {errorMessage}
          </Snackbar>

        </View>}
      </ScrollView>

      {selectedDate && <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setModalVisibleSelectOption(true);
          setNewPlan(true);
          setEditPlan(false);
        }}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>}

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
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 7
  },
  adl: {

  },
  container_info_agenda: {
    flex: 0.2,
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
  taskSubtitle: {
    fontSize: 14,
    color: 'gray',
    marginLeft: 10,
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

});

export default CalendarScreen;
