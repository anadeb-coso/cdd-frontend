import { HStack, Image, Pressable, Text, View } from 'native-base';
import React from 'react';
import { ImageBackground } from 'react-native';

export default function SmallCard({
  id,
  title,
  tasks_number_validated,
  onPress,
  bg = require('../../assets/backgrounds/lightblue-cube.png'),
}: {
  id: string;
  title: string;
  tasks_number_validated: number;
  // eslint-disable-next-line react/require-default-props
  onPress?: () => void;
  bg: string;
}) {
  // console.log(tasks_number_validated)
  return (
    <Pressable
      onPress={onPress}
      // h="40"
      flex={1}
      rounded="xl"
    // shadow={3}
    >
      <ImageBackground
        style={{
          height: 150,
          width: '100%',
          borderRadius: 20,
        }}
        source={bg}
      >
        {title && (
          <View p={6} flex={1} justifyContent={'space-between'}>
            <View style={{flexDirection:'row', justifyContent: 'space-between'}}>
            <View style={{flex: 0.5}}>
              <Text
                
                fontSize={14}
                // fontFamily="body"
                fontWeight={700}
                color="white"
              >
                {id}
              </Text>
              </View>

              <View style={{flex: 0.5, alignItems: 'flex-end', alignContent: 'flex-end' }}>
              {tasks_number_validated ?
                <Text
                  style={{
                    backgroundColor: "red", borderRadius: 8, color: "white",
                    textAlign: 'center', fontSize: 10, width: 25
                  }}
                  alignSelf="flex-end"
                >{tasks_number_validated}</Text> : <></>
              }
              </View>

            </View>

            <Text
              fontSize={
                title?.length > 10 && title.indexOf(' ') === -1 ? 12 : 10
              }
              // fontFamily="body"
              fontWeight={700}
              color="white"
            >
              {title}
            </Text>
            <Image
              mb={1}
              alignSelf="flex-end"
              size={4}
              source={require('../../assets/right_arrow.png')}
              alt="image"
            />
          </View>
        )}
      </ImageBackground>
    </Pressable>
  );
}
