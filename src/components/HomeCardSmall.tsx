import { Image, Box, Heading, Stack, Pressable, HStack, Text, View } from 'native-base';
import React from 'react';
import { ImageSourcePropType } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrivateStackParamList } from '../types/navigation';

export default function HomeCard({
  id,
  title,
  backgroundImage,
  goesTo,
  index,
  task_invalid_revised,
  task_invalid,
  task_remain,
}: {
  id: string | number;
  title: string;
  backgroundImage: ImageSourcePropType;
  goesTo: any;
  index: number;
  task_invalid_revised: number;
  task_invalid: number;
  task_remain: number;
}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
  return (
    <Pressable
      key={id}
      w="100%"
      h="43"
      mb={5}
      onPress={() => navigation.navigate(goesTo.route, goesTo.params)}
    >
      {({ isPressed }) => {
        return (
          <Box
            flex={1}
            rounded="xl"
            height="43"
            style={[
              {
                transform: [
                  {
                    scale: isPressed ? 0.97 : 1,
                  },
                ],
              },
              index % 2 === 0 ? { marginRight: 10 } : { marginLeft: 10 },
            ]}
          >
            <Image
              style={{ height: 45 }}
              position={'relative'}
              size="2xl"
              rounded="xl"
              source={backgroundImage}
              alt="image"
            />
            <HStack
              position="absolute"
              top="2"
              px={2}
              space={2}
              style={{
                flex: 1,
                justifyContent: 'space-evenly',
                alignItems: 'center',
              }}
            >
              <Heading
                style={{ flex: 5 }}
                fontSize={13}
                color="white"
              >
                {title}
              </Heading>
              <Stack alignItems="flex-end" flex={5}>
                <View style={{ flexDirection: "row" }} mt={-5} >
                  {(task_remain || task_invalid) ? <></> : <Text style={{ 
                   borderRadius: 8, 
                    paddingLeft: 3, paddingRight: 3, 
                    flex: 1
                  }} >{''}</Text>}
                  {task_remain ? 
                  <Text 
                  fontSize={13}
                  style={{ 
                    backgroundColor: "orange", borderRadius: 8, color: "white", 
                    paddingLeft: 3, paddingRight: 3, textAlign: "center",
                    flex: 4, fontWeight: 'bold',
                  }} 
                  >{task_remain}</Text> : <></>
                  }
                  {task_invalid ? 
                  <Text
                  fontSize={13}
                  style={{ 
                    backgroundColor: "red", borderRadius: 8, color: "white", 
                    paddingLeft: 3, textAlign: "center", fontWeight: 'bold',
                    flex: 6
                  }} 
                  >{`${![0, null, undefined].includes(task_invalid_revised) ? task_invalid_revised + '/': ''}`}{task_invalid}</Text> : <></>
                  }
                </View>
                
                
                <Image
                  size={7}
                  source={require('../../assets/right_arrow.png')}
                  alt="image"
                />
              </Stack>
            </HStack>
          </Box>
        );
      }}
    </Pressable>
  );
}
