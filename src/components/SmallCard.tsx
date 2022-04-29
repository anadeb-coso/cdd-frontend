import { HStack, Image, Pressable, Text } from 'native-base';
import React from 'react';

export default function SmallCard({
  id,
  title,
  onPress,
}: {
  id: string;
  title: string;
  // eslint-disable-next-line react/require-default-props
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      p={3}
      h="40"
      flex={1}
      bg="primary.600"
      rounded="md"
      shadow={3}
    >
      <Text fontSize={20} fontFamily="body" fontWeight={700} color="white">
        {id}
      </Text>
      <Text
        lineHeight={25}
        fontSize={20}
        fontFamily="body"
        fontWeight={700}
        color="white"
      >
        {title}
      </Text>
      <HStack justifyContent="flex-end" flex={1} alignItems="flex-end">
        <Image
          size={8}
          source={require('../../assets/right_arrow.png')}
          alt="image"
        />
      </HStack>
    </Pressable>
  );
}
