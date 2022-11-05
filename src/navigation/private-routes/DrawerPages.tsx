import React, { useContext } from 'react';
import { Heading, ITheme, useTheme } from 'native-base';
import HomeScreen from 'screens/Home';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
// eslint-disable-next-line import/no-extraneous-dependencies
import { HeaderTitleProps } from '@react-navigation/elements';
import { View } from 'react-native';
import AuthContext from '../../contexts/auth';

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

function CustomDrawerContent(props): JSX.Element {
  const { signOut } = useContext(AuthContext);

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1, justifyContent: 'space-between' }}
    >
      <View style={{ justifyContent: 'flex-start' }}>
        <DrawerItemList {...props} />
      </View>
      <DrawerItem
        label={() => (
          <Heading size="xs" alignSelf="center">
              Se déconnecter
          </Heading>
        )}
        onPress={() => signOut()}
      />
    </DrawerContentScrollView>
  );
}

function DrawerPages(): JSX.Element {
  const theme = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
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
        options={{ title: 'DCC App' }}
        component={HomeScreen}
      />
      <Drawer.Screen name="Notifications" component={HomeScreen} />
    </Drawer.Navigator>
  );
}

export default DrawerPages;
