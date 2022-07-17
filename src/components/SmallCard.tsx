import { HStack, Image, Pressable, Text, View } from 'native-base';
import React from 'react';
import { ImageBackground } from 'react-native';

export default function SmallCard({
  id,
  title,
  onPress,
  bg = require('../../assets/backgrounds/lightblue-cube.png'),
}: {
  id: string;
  title: string;
  // eslint-disable-next-line react/require-default-props
  onPress?: () => void;
  bg: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      // h="40"
      flex={1}
      rounded="xl"
      shadow={3}
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
          <View p={6}>
            <Text
              fontSize={14}
              fontFamily="body"
              fontWeight={700}
              color="white"
            >
              {id}
            </Text>
            <Text
              fontSize={
                title?.length > 13 && title.indexOf(' ') === -1 ? 12 : 12
              }
              fontFamily="body"
              fontWeight={700}
              color="white"
            >
              {title}
            </Text>
            <Image
              alignSelf="flex-end"
              size={6}
              source={require('../../assets/right_arrow.png')}
              alt="image"
            />
          </View>
        )}
      </ImageBackground>
    </Pressable>
  );
}
