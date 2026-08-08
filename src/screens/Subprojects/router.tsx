import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PrivateStackParamList } from 'types/navigation';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import ListSubprojects from './ListSubprojects/ListSubprojects';

const SubprojectStack = createNativeStackNavigator<PrivateStackParamList>();

const iconConfig = {
  focused: {
    x: 0,
    transition: { type: 'tween', ease: 'linear' },
  },
  unfocused: { x: 0 },
};

const customHeaderOptions = (label: any): NativeStackNavigationOptions => ({
  // headerBackTitle: () => null,
  headerBackTitleVisible: false,
  headerTintColor: '#00bc82',
  headerTitle: label,
  // headerTitleAllowFontScaling: true,
  headerTitleAlign: 'center',
  headerTitleStyle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 20,
    fontWeight: '500',
    // fontStyle: 'normal',
    // letterSpacing: 0,
    // textAlign: 'left',
    color: '#373737',
  },
});


function SubprojectRouter() {
  const { t } = useTranslation(['subprojects', 'common']);

  return (
    <SubprojectStack.Navigator>
      <SubprojectStack.Screen
        name="ListSubprojects"
        component={ListSubprojects}
        options={({ navigation, route }) => customHeaderOptions(t('shared.subprojects_title'))}
      />
    </SubprojectStack.Navigator>
  );
}


export default SubprojectRouter;
