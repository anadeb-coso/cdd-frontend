import { Image, Box, Heading, Stack, Pressable, HStack } from 'native-base';
import React from 'react';
import { ImageSourcePropType } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrivateStackParamList } from '../types/navigation';

export default function HomeCard({
  title,
  backgroundImage,
  backgroundImageIcon,
  goesTo,
  index,
}: {
  title: string;
  backgroundImage: ImageSourcePropType;
  backgroundImageIcon: ImageSourcePropType;
  goesTo: any;
  index: number;
}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
  return (
    <Pressable
      w="50%"
      mb={5}
      onPress={() => navigation.navigate(goesTo.route, goesTo.params)}
    >
      {({ isPressed }) => {
        return (
          <Box
            flex={1}
            rounded="xl"
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
              size="2xl"
              rounded="xl"
              source={backgroundImage}
              alt="image"
            />
            <HStack p={4} position="absolute" top="0" space={2}>
              <Heading fontSize={15} color="white" size="md">
                {title}
              </Heading>
              <Image
                size={4}
                source={require('../../assets/right_arrow.png')}
                alt="image"
              />
            </HStack>
            <Stack position="absolute" bottom="0">
              <Image source={backgroundImageIcon} alt="image" />
            </Stack>
          </Box>
        );
      }}
    </Pressable>
  );
}
