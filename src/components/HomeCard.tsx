import {
  Image,
  AspectRatio,
  Box,
  Heading,
  Stack,
  Pressable,
  HStack,
} from 'native-base';
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
}: {
  title: string;
  backgroundImage: ImageSourcePropType;
  backgroundImageIcon: ImageSourcePropType;
  goesTo: any;
}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
  return (
    <Box flex={1 / 2} my={2} alignItems="center">
      <Pressable
        onPress={() => navigation.navigate(goesTo.route, goesTo.params)}
      >
        {({ isPressed }) => {
          return (
            <Box
              style={{
                transform: [
                  {
                    scale: isPressed ? 0.97 : 1,
                  },
                ],
              }}
            >
              <Image source={backgroundImage} alt="image" />
              <HStack p={4} position="absolute" top="0" space={2}>
                <Heading fontSize="md" color="white" size="md" ml="-1">
                  {title}
                </Heading>
                <AspectRatio maxW={1} ratio={1}>
                  <Image
                    size={6}
                    source={require('../../assets/right_arrow.png')}
                    alt="image"
                  />
                </AspectRatio>
              </HStack>
              <Stack position="absolute" bottom="0">
                <Image source={backgroundImageIcon} alt="image" />
              </Stack>
            </Box>
          );
        }}
      </Pressable>
    </Box>
  );
}
