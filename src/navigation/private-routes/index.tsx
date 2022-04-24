import * as React from 'react';
import { Button, View } from 'react-native';
import {
  Box,
  Center,
  Container,
  Heading,
  ITheme,
  Text,
  useTheme,
  ZStack,
} from 'native-base';
import { createDrawerNavigator } from '@react-navigation/drawer';
// eslint-disable-next-line import/no-extraneous-dependencies
import { HeaderTitleProps } from '@react-navigation/elements';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from 'screens/Home';

type PrivateStackParamList = {
  Home: undefined; // undefined because you aren't passing any params to the home screen
  Notifications: { name: string };
};

function NotificationsScreen() {
  return (
    <Center flex={1} bg="white">
      <Container centerContent>
        <Heading textAlign="center">
          A screen for the
          <Text color="primary.500">Notifications</Text>
        </Heading>
        <Box mt="-32">
          <ZStack mt="3" ml={-50}>
            <Box bg="primary.700" size="20" rounded="lg" shadow={3} />
            <Box
              bg="primary.500"
              mt="5"
              ml="5"
              size="20"
              rounded="lg"
              shadow={5}
            />
            <Box
              bg="primary.300"
              mt="10"
              ml="10"
              size="20"
              rounded="lg"
              shadow={7}
            />
          </ZStack>
        </Box>
      </Container>
    </Center>
  );
}

const Drawer = createDrawerNavigator<PrivateStackParamList>();

function getHeaderTitle(theme: ITheme) {
  return function ({ children }: HeaderTitleProps) {
    return (
      <Heading size="md" fontWeight={700} color={theme.colors.primary[500]}>
        {children}
      </Heading>
    );
  };
}

export default function PrivateRoutes(): JSX.Element {
  const theme = useTheme();

  return (
    <Drawer.Navigator
      screenOptions={{
        headerTintColor: theme.colors.gray[500],
        drawerActiveTintColor: theme.colors.primary[500],
        headerTitleAlign: 'center',
        headerTitle: getHeaderTitle(theme),
      }}
      initialRouteName="Home"
    >
      <Drawer.Screen
        name="Home"
        options={{ title: 'CDD App', headerShadowVisible: false }}
        component={HomeScreen}
      />
      <Drawer.Screen name="Notifications" component={NotificationsScreen} />
    </Drawer.Navigator>
  );
}
