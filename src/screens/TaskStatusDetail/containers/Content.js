import { Text } from 'native-base';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Box } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { getTaskStatusColor } from '../../../utils/colors'
import { getData } from '../../../utils/storageManager';
// import moment from 'moment';


function Content({
  task,
  hide_button,
  currentProjectName = null,
  taskProjectName = null,
  currentDbName = null,
  taskDbName = null,
  projectMismatch = false,
  dbMismatch = false,
  onSwitchToTaskDb = () => {},
}) {
  const { t } = useTranslation(['core', 'common']);
  const navigation = useNavigation();

  const scopeMismatch = projectMismatch || dbMismatch;

  const confirmSwitchToTaskDb = () => {
    Alert.alert(
      t('task_status_detail.scope_warning_title'),
      t('task_status_detail.switch_db_confirm', { db: taskDbName }),
      [
        { text: t('common:yes'), onPress: () => onSwitchToTaskDb() },
        { text: t('common:no') },
      ],
    );
  };
  
  const renderItemHistory = (item, index) => {
  return (
    <View key={index} style={styles.commentCard}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
        {
          item.type == "Invalidated" 
          ? <View style={styles.redCircle} />
          : <View style={styles.greenCircle} />
        }
        
        <View>
          <Text style={styles.radioLabel}>{item.user_first_name} {item.user_last_name}</Text>
          <Text style={styles.radioLabel}>{item.action_date}</Text>
        </View>
      </View>
      {item.comment ? <Text style={styles.stepNote}>{item.comment}</Text> : <></>}
    </View>
  )};

  return (
    <>

      <View
        style={{
          borderRadius: 10,
          backgroundColor: '#ffffff',
          shadowColor: 'rgba(0, 0, 0, 0.05)',
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowRadius: 15,
          shadowOpacity: 1,
          marginLeft: 17,
          marginRight: 17,
          paddingLeft: 10,
          paddingRight: 10,
        }}
      >
        <Text style={styles.statisticsText}>{t('task_status_detail.phase_label')} {task.phase_name}</Text>
        <Text style={styles.statisticsText}>{t('task_status_detail.activity_label')} {task.activity_name}</Text>
        <Text style={{...styles.statisticsText, borderBottomWidth: 1, marginBottom: 5}}>{t('task_status_detail.task_label')} {task.name}</Text>
        <Text style={styles.statisticsText}>{t('task_status_detail.completed_label')} {task.completed ? t('common:yes') : t('common:no')}</Text>
        {
          ![null, undefined, "0000-00-00 00:00:00"].includes(task.last_updated)
            ? <Text style={styles.statisticsText}>{t('task_status_detail.last_update_label')} {task.last_updated}</Text>
            : <></>
        }

        {
          task.completed
            ? <>
                <Text style={styles.statisticsText}>{t('task_status_detail.completion_date_label')} {task.completed_date}</Text>
                {task.validated == true
                  ? <>
                      <Text style={styles.statisticsText}>{t('task_status_detail.validated_label')} {t('common:yes')}</Text>
                      <Text style={styles.statisticsText}>{t('task_status_detail.validation_date_label')} {task.date_validated}</Text>
                    </>
                  : (task.validated == false
                    ? <Text style={styles.statisticsText}>{t('task_status_detail.validated_label')} {t('common:no')}</Text>
                    : <Text style={styles.statisticsText}>{t('task_status_detail.validated_label')} {t('task_status_detail.not_seen_label')}</Text>
                    )
                }
              </>
            : <></>
        }
        
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box rounded="sm" style={{flexDirection:'row'}}>
            <Image
              resizeMode="stretch"
              style={{ width: 25, height: 30 }}
              source={require('../../../../assets/illustrations/location.png')}
            />
            <Text style={{...styles.subTitle, marginTop: 8, marginLeft: 2}}>
              {task.cvd ? task.cvd.name : t('common:not_found')}
            </Text>
          </Box>
        </View>

        <View style={{ borderTopWidth: 1, borderTopColor: '#e0e0e0', marginTop: 5, paddingTop: 5 }}>
          <Text style={{ ...styles.statisticsText, color: projectMismatch ? '#c0392b' : '#707070' }}>
            {t('task_status_detail.current_project_label')}{currentProjectName || t('task_status_detail.not_specified')}
          </Text>
          {projectMismatch && (
            <Text style={{ ...styles.statisticsText, color: '#c0392b' }}>
              {t('task_status_detail.task_project_label')}{taskProjectName || t('task_status_detail.not_specified')}
            </Text>
          )}
          <Text style={{ ...styles.statisticsText, color: dbMismatch ? '#c0392b' : '#707070' }}>
            {t('task_status_detail.current_db_label')}{currentDbName || t('task_status_detail.not_specified')}
          </Text>
          {dbMismatch && (
            <Text style={{ ...styles.statisticsText, color: '#c0392b' }}>
              {t('task_status_detail.task_db_label')}{taskDbName || t('task_status_detail.not_specified')}
            </Text>
          )}
        </View>

      </View>

      {scopeMismatch && (
        <View style={styles.warningBox}>
          {dbMismatch && (
            <Text style={styles.warningText}>{t('task_status_detail.scope_warning_db')}</Text>
          )}
          {projectMismatch && (
            <Text style={{ ...styles.warningText, marginTop: dbMismatch ? 6 : 0 }}>
              {t('task_status_detail.scope_warning_project')}
            </Text>
          )}

          {dbMismatch && (
            <TouchableOpacity onPress={confirmSwitchToTaskDb} style={styles.warningButton}>
              <Text style={styles.warningButtonText}>{t('task_status_detail.switch_db_button')}</Text>
            </TouchableOpacity>
          )}
          {projectMismatch && (
            <TouchableOpacity
              onPress={() => navigation.navigate('ChangeProjectScreen')}
              style={{ ...styles.warningButton, backgroundColor: '#707070' }}
            >
              <Text style={styles.warningButtonText}>{t('task_status_detail.change_project_button')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {!hide_button && !scopeMismatch && <TouchableOpacity
              onPress={async () => {
                navigation.navigate('TaskDetail', {
                  task,
                  currentPage: 0,
                  // onTaskComplete: () => {},
                  cvd_name: task?.administrative_level_name,
                  project: JSON.parse(await getData('project'))
                })
              }}
              style={{ flexDirection: 'row', justifyContent: 'center' }}
            >
              <Box
                py={3}
                px={8}
                mt={6}
                bg={getTaskStatusColor(task)}
                style={{ backgroundColor: getTaskStatusColor(task) }}
                rounded="xl"
                borderWidth={1}
                borderColor={task.completed ? 'yellow.500' : 'primary.500'}
                justifyContent="center"
                alignItems="center"
              >
                <Text fontWeight="bold" fontSize="xs" color="white">{t('task_status_detail.open_task_button')}</Text>
              </Box>
            </TouchableOpacity>}


        
      <ScrollView _contentContainerStyle={{ pt: 7, px: 5 }}>
        <View style={{ padding: 15 }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: 'bold',
              fontStyle: 'normal',
              lineHeight: 18,
              letterSpacing: 0,
              textAlign: 'left',
              color: '#707070',
            }}
          >
            {task.actions_by ? t('task_status_detail.validation_history_title') : t('task_status_detail.no_history_found')}
          </Text>
        </View>
        {task.actions_by && task.actions_by.map((historyItem, i) => renderItemHistory(historyItem, i))}
      </ScrollView>

    </>
  );
}

const styles = StyleSheet.create({
  statisticsText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    fontWeight: 'bold',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#707070',
  },
  commentCard: {
    marginVertical: 5,
    marginHorizontal: 5,
    backgroundColor: 'beige',
    borderWidth: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 5,
  },
  greenCircle: {
    backgroundColor: 'green',
    height: 20,
    width: 20,
    borderRadius: 20,
    marginRight: 10
  },
  redCircle: {
    backgroundColor: 'red',
    height: 20,
    width: 20,
    borderRadius: 20,
    marginRight: 10
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
    fontSize: 12,
    fontWeight: "normal",
    fontStyle: "normal",
    lineHeight: 14,
    letterSpacing: 0,
    textAlign: "left",
    color: "#707070",
  },
  warningBox: {
    marginTop: 12,
    marginHorizontal: 17,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fdecea',
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },
  warningText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#c0392b',
  },
  warningButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#c0392b',
    alignItems: 'center',
  },
  warningButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});



export default Content;
