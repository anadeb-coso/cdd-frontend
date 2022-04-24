import {
  Image,
  AspectRatio,
  Box,
  Center,
  Heading,
  HStack,
  Stack,
  Text,
} from 'native-base';
import React from 'react';

export default function Card({ title }: { title: string }) {
  return (
    <Box flex={1 / 2} my={2} alignItems="center">
      <Box
        maxW="40"
        rounded="lg"
        overflow="hidden"
        borderColor="coolGray.200"
        borderWidth="1"
        _dark={{
          borderColor: 'coolGray.600',
          backgroundColor: 'gray.700',
        }}
        _web={{
          shadow: 2,
          borderWidth: 0,
        }}
        _light={{
          backgroundColor: 'gray.50',
        }}
      >
        <Box>
          <AspectRatio w="100%" ratio={9 / 16}>
            <Image
              source={{
                uri: 'https://www.holidify.com/images/cmsuploads/compressed/Bangalore_citycover_20190613234056.jpg',
              }}
              alt="image"
            />
          </AspectRatio>
          <Stack p={4} position="absolute" top="0" space={2}>
            <Heading fontSize="md" color="white" size="md" ml="-1">
              {title}
            </Heading>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
