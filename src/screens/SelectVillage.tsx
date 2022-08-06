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
      .then(result => {
        const villagesResult = result?.docs[0]?.administrative_levels ?? [];
        setVillages(villagesResult);
      })
      .catch(err => {
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
              <Box w="70%">
                <Progress
                  rounded={5}
                  size="xl"
                  _filledTrack={{
                    rounded: 2,
                    bg: 'primary.500',
                  }}
                  value={45}
                  mr="4"
                >
                  45%
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
