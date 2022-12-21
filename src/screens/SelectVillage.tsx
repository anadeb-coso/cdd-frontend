import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Center,
  FlatList,
  Heading,
  HStack,
  Progress,
  Text,
} from 'native-base';
import {View, StyleSheet, ProgressBarAndroid} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Layout } from '../components/common/Layout';
import { PressableCard } from '../components/common/PressableCard';
import { PrivateStackParamList } from '../types/navigation';
import LocalDatabase from '../utils/databaseManager';

function SelectVillage() {
  const navigation =
    useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
  const [villages, setVillages] = useState([]);

  useEffect(() => {
    LocalDatabase.find({
      selector: { type: 'facilitator' },
      // fields: ["_id", "commune", "phases"],
    })
      .then((result: any) => {
        const villagesResult = result?.docs[0]?.administrative_levels ?? [];
        villagesResult.forEach((element_village: any, index_village: number) => {
          villagesResult[index_village].value_progess_bar = 0;

          if(villagesResult.length == (index_village+1)){
            setVillages(villagesResult);
          }
        });

        let total_tasks_completed = 0;
        let total_tasks = 0; //Total tasks of the activities

        //Find the phases and calcul the progression bar
        villagesResult.forEach((element_village: any, index_village: number) => {

          LocalDatabase.find({
            selector: { type: 'phase', administrative_level_id: element_village.id },
          })
            .then((result_phases: any) => {
              const phasesResult = result_phases?.docs ?? [];
              let ids_ohases = [];
              phasesResult.forEach((element_phase: any) => {
                ids_ohases.push(element_phase._id);
              });

              LocalDatabase.find({
                selector: { type: 'task', phase_id: {$in: ids_ohases} },
              })
                .then((result_tasks: any) => {
                  const tasksResults = result_tasks?.docs ?? [];
    
                  const _completedTasks = tasksResults.filter(i => i.completed).length;
                  total_tasks += tasksResults.length;
                  total_tasks_completed += _completedTasks;
                  villagesResult[index_village].value_progess_bar = total_tasks != 0 ? ((total_tasks_completed / total_tasks) * 100) : 0;
                  
                  if(villagesResult.length == (index_village+1)){
                    setVillages([]);
                    setVillages(villagesResult);
                  }
                })
                .catch((err: any) => {
                  console.log(err);
                  return [];
                });

              //Find the phases
              // phasesResult.forEach((element_phase: any, index_phase: number) => {
                
              //     LocalDatabase.find({
              //       selector: { type: 'task', phase_id: element_phase._id },
              //     })
              //       .then((result_tasks: any) => {
              //         const tasksResults = result_tasks?.docs ?? [];
        
              //         const _completedTasks = tasksResults.filter(i => i.completed).length;
              //         total_tasks += tasksResults.length;
              //         total_tasks_completed += _completedTasks;
              //         villagesResult[index_village].value_progess_bar = total_tasks != 0 ? ((total_tasks_completed / total_tasks) * 100) : 0;
                      
              //         if(villagesResult.length == (index_village+1) && phasesResult.length == (index_phase+1)){
              //           setVillages([]);
              //           setVillages(villagesResult);
              //         }
              //       })
              //       .catch((err: any) => {
              //         console.log(err);
              //         return [];
              //       });

              // });
              //End for phases


            })
            .catch((err: any) => {
              console.log(err);
              return [];
            });
            
            total_tasks_completed = 0;
            total_tasks = 0;
            
        });
        //End for phases


        // setVillages(villagesResult);

      })
      .catch((err: any) => {
        console.log(err);
        setVillages([]);
      });
  }, []);

  return (
    <Layout disablePadding>
      <FlatList
        flex={1}
        _contentContainerStyle={{ px: 3 }}
        data={villages}
        keyExtractor={(item, index) => `${item.name}_${index}`}
        renderItem={({ item, index }) => (
          <PressableCard bgColor="white" shadow="0" my={4}>
            <Text fontWeight={400} fontSize={20}>
              {item.name}
            </Text>
            <Heading mt={2} fontSize={16}>
              {item.description}
            </Heading>
            <HStack mt={5} alignItems="center">
              <Box w="70%" >
                {item.value_progess_bar ? (
                <>
                <View style={{ alignItems: 'center' }}>
                  <Text>{`${(item.value_progess_bar).toFixed(2)}%`}</Text>
                </View>
                <Progress
                  rounded={5}
                  size="xl"
                  _filledTrack={{
                    rounded: 2,
                    bg: 'primary.500',
                  }}
                  value={(item.value_progess_bar).toFixed(2)}
                  mr="4"
                  
                >
                  <Text style={{ fontSize: 10, color: 'white' }}>{`${(item.value_progess_bar).toFixed(2)}%`}</Text>
                </Progress></>) : <ProgressBarAndroid 
                  styleAttr="Horizontal" color="primary.500" />}
              </Box>
              <Button
                bgColor="primary.500"
                onPress={() =>
                  navigation.navigate('VillageDetail', { village: item })
                }
                w="30%"
              >
                Ouvrir
              </Button>
            </HStack>
          </PressableCard>
        )}
      />

{/* <View style={styles.container}>
      <View style={styles.example}>
        <Text>Circle Progress Indicator</Text>
        <ProgressBarAndroid />
      </View>
      <View style={styles.example}>
        <Text>Horizontal Progress Indicator</Text>
        <ProgressBarAndroid styleAttr="Horizontal" />
      </View>
      <View style={styles.example}>
        <Text>Colored Progress Indicator</Text>
        <ProgressBarAndroid styleAttr="Horizontal" color="#2196F3" />
      </View>
      <View style={styles.example}>
        <Text>Fixed Progress Value</Text>
        <ProgressBarAndroid
          styleAttr="Horizontal"
          indeterminate={false}
          progress={0.5}
        />
      </View>
    </View> */}

    </Layout>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  example: {
    marginVertical: 24,
  },
});

export default SelectVillage;
