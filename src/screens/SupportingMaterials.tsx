import React from 'react';
import { Box, Heading, ScrollView, Text, HStack } from 'native-base';
import { Image, TouchableOpacity, View } from 'react-native';
import * as Linking from 'expo-linking';
import { Layout } from '../components/common/Layout';

function SupportingMaterials({ route }) {
  const { title, materials } = route.params || {};

  const openUrl = url => {
    Linking.openURL(url);
  };

  const MaterialRow = ({ material, index }) => {
    const { url } = material;
    const { name } = material;
    // const filename = url.substring(url.lastIndexOf('/') + 1);
    const filename = name;

    return (
      <TouchableOpacity key={index} onPress={() => openUrl(url)}>
        <Box rounded="lg" p={3} mt={3} bg="white" shadow={1}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row' }}>
              <Text
                flexWrap="wrap"
                flexShrink={1}
                ml={3}
                mr={3}
                fontWeight="bold"
                fontSize="xs"
                color="gray.500"
              >
                {filename}
              </Text>
            </View>
          </View>
          <HStack mt={3} justifyContent="flex-end">
            <Text fontSize="sm" color="gray.600">
              View
            </Text>
            <Image
              resizeMode="contain"
              style={{ height: 20, width: 50, alignSelf: 'flex-end' }}
              source={require('../../assets/right_arrow.png')}
              alt="image"
            />
          </HStack>
        </Box>
      </TouchableOpacity>
    );
  };

  return (
    <Layout disablePadding>
      <ScrollView _contentContainerStyle={{ pt: 7, px: 5 }}>
        <Heading my={3} fontWeight="bold" size="sm">
          {title}
        </Heading>
        {/* <Heading my={3} fontWeight="bold" size="sm"> */}
        {/*  {activities.length} activités sur cette phase{' '} */}
        {/* </Heading> */}
        {materials.map((material, i) => (
          <MaterialRow index={i} material={material} />
        ))}
      </ScrollView>
    </Layout>
  );
}

export default SupportingMaterials;
