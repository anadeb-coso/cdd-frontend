import { Text } from 'native-base';
import React from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Box } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { getTaskStatusColor } from '../../../utils/colors'
// import moment from 'moment';


function Content({ task }) {
  
  const navigation = useNavigation();
  
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
        <Text style={styles.statisticsText}>Phase : {task.phase_name}</Text>
        <Text style={styles.statisticsText}>Activité : {task.activity_name}</Text>
        <Text style={{...styles.statisticsText, borderBottomWidth: 1, marginBottom: 5}}>Tâche : {task.name}</Text>
        <Text style={styles.statisticsText}>Achevée : {task.completed ? "Oui" : "Non"}</Text>
        {
          ![null, undefined, "0000-00-00 00:00:00"].includes(task.last_updated) 
            ? <Text style={styles.statisticsText}>Dernière mise à jour : {task.last_updated}</Text> 
            : <></> 
        }
        
        {
          task.completed 
            ? <>
                <Text style={styles.statisticsText}>Date d'achèvement : {task.completed_date}</Text>
                {task.validated == true 
                  ? <>
                      <Text style={styles.statisticsText}>validée : Oui</Text>
                      <Text style={styles.statisticsText}>Date de validation : {task.date_validated}</Text>
                    </>
                  : (task.validated == false 
                    ? <Text style={styles.statisticsText}>validée : Non</Text> 
                    : <Text style={styles.statisticsText}>validée : Non vue</Text> 
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
              {task.cvd ? task.cvd.name : "Non trouvée"}
            </Text>
          </Box>
        </View>
        
      </View>

      <TouchableOpacity
              onPress={async () => {
                navigation.navigate('TaskDetail', {
                  task,
                  currentPage: 0,
                  onTaskComplete: () => {},
                  cvd_name: task?.administrative_level_name
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
                <Text fontWeight="bold" fontSize="xs" color="white">Ouvrir la tâche</Text>
              </Box>
            </TouchableOpacity>


        
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
            {task.actions_by ? "Historique de validation de la tâche" : "Aucun historique trouvé"}
          </Text>
        </View>
        {task.actions_by && task.actions_by.map((t: any, i: any) => renderItemHistory(t, i))}
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
});



export default Content;
