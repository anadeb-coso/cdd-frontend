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

        let total_tasks_completed = 0;
        let total_tasks = 0; //Total tasks of the activities

        //Find the phases and calcul the progression bar
        villagesResult.forEach((element_village: any, index_village: number) => {
          villagesResult[index_village].value_progess_bar = 0;
          LocalDatabase.find({
            selector: { type: 'phase', administrative_level_id: element_village.id },
          })
            .then((result_phases: any) => {
              const phasesResult = result_phases?.docs ?? [];

              //Find the phases
              phasesResult.forEach((element_phase: any, index_phase: number) => {
                
                  LocalDatabase.find({
                    selector: { type: 'task', phase_id: element_phase._id },
                  })
                    .then((result_tasks: any) => {
                      const tasksResults = result_tasks?.docs ?? [];
        
                      const _completedTasks = tasksResults.filter(i => i.completed).length;
                      total_tasks += tasksResults.length;
                      total_tasks_completed += _completedTasks;
                      villagesResult[index_village].value_progess_bar = total_tasks != 0 ? ((total_tasks_completed / total_tasks) * 100) : 0;
                      
                      if(villagesResult.length == (index_village+1) && phasesResult.length == (index_phase+1)){
                        setVillages(villagesResult);
                      }
                    })
                    .catch((err: any) => {
                      console.log(err);
                      return [];
                    });

              });
              //End for phases


              if(phasesResult.length == 0){
                setVillages(villagesResult);
              }

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
                  {`${(item.value_progess_bar).toFixed(2)}%`}
                </Progress>
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
    </Layout>
  );
}

export default SelectVillage;
