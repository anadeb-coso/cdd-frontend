import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PrivateStackParamList } from 'types/navigation';
import ListSubprojects from './ListSubprojects/ListSubprojects';

const SubprojectStack = createNativeStackNavigator<PrivateStackParamList>();

const iconConfig = {
  focused: {
    x: 0,
    transition: { type: 'tween', ease: 'linear' },
  },
  unfocused: { x: 0 },
};

const customHeaderOptions = (label: any) => ({
  headerBackTitle: () => null,
  headerTintColor: '#00bc82',
  headerTitle: label,
  headerTitleAllowFontScaling: true,
  headerTitleAlign: 'center',
  headerTitleStyle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 20,
    fontWeight: '500',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#373737',
  },
});


function SubprojectRouter() {

  return (
    <SubprojectStack.Navigator>
      <SubprojectStack.Screen
        name="ListSubprojects"
        component={ListSubprojects}
        options={({ navigation, route }) => customHeaderOptions('Sous-projets')}
      />
    </SubprojectStack.Navigator>
  );
}


export default SubprojectRouter;
