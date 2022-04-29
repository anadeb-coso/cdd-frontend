import React from 'react';
import { Heading, ITheme, useTheme } from 'native-base';
import HomeScreen from 'screens/Home';
import { createDrawerNavigator } from '@react-navigation/drawer';
// eslint-disable-next-line import/no-extraneous-dependencies
import { HeaderTitleProps } from '@react-navigation/elements';

const Drawer = createDrawerNavigator();

function getHeaderTitle(theme: ITheme) {
  return function ({ children }: HeaderTitleProps) {
    return (
      <Heading size="md" fontWeight={700} color={theme.colors.primary[500]}>
        {children}
      </Heading>
    );
  };
}

function DrawerPages(): JSX.Element {
  const theme = useTheme();

  return (
    <Drawer.Navigator
      screenOptions={{
        headerTintColor: theme.colors.gray[500],
        drawerActiveTintColor: theme.colors.primary[500],
        headerTitleAlign: 'center',
        headerTitle: getHeaderTitle(theme),
        headerShadowVisible: false,
        headerLeftContainerStyle: { paddingHorizontal: theme.sizes['1'] },
        headerRightContainerStyle: { paddingHorizontal: theme.sizes['1'] },
      }}
      initialRouteName="Home"
    >
      <Drawer.Screen
        name="Home"
        options={{ title: 'CDD App' }}
        component={HomeScreen}
      />
      <Drawer.Screen name="Notifications" component={HomeScreen} />
    </Drawer.Navigator>
  );
}

export default DrawerPages;
