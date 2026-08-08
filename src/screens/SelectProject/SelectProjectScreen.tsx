import React, { useContext, useEffect, useState } from 'react';

import {
  Keyboard,
  Text,
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  RefreshControl,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';
import styles from './SelectProject.style';
import AuthContext from '../../contexts/auth';
import ProjectContext from "../../contexts/project";
import ProjectsAPI from "../../services/project/projects";
import { storeData, getData } from "../../utils/storageManager";

async function save(key: any, value: any) {
  await SecureStore.setItemAsync(key, JSON.stringify(value));
}

function SelectProjectScreen() {
  const { t } = useTranslation(['core', 'common']);
  const [projects, setProjects]: any = useState(null);
  const { selectProject } = useContext(ProjectContext);
  const [refreshing, setRefreshing] = useState(false);
  const { signOut } = useContext(AuthContext);
  const handleSignOut = () => {
    selectProject(null);
    signOut();
  }

  const get_projects = async () => {
    let _project = JSON.parse(await getData('project'));
    if(_project && _project?.name){
      selectProject(_project)
    }else{
      try {
        await new ProjectsAPI()
          .get_projects()
          .then(async (response: any) => {
            if (response.error) {
              setProjects([]);
              return;
            }
            const projects = response as Array<any>;
            if (projects.length == 1) {
              onSelectProject(projects[0]);
              return;
            }
            
            setProjects(projects)
          })
          .catch(error => {
            setProjects([]);
            console.error(error);
          });
      } catch (e) {
        console.log("Error1 : " + e);
      }
    }

  };

  useEffect(() => {
    get_projects();
  }, []);
  ;
  const onSelectProject = async (project: any) => {
    await storeData('project', JSON.stringify(project));
    selectProject(project)
  }

  const onRefresh = async () => {
    setProjects(null);

    setRefreshing(true);
    get_projects();
    setRefreshing(false);

  };

  if (!projects || refreshing)
    // return <ActivityIndicator color={'#24c38b'} size="large" />;
    return(
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={'#24c38b'} size="large" />
        <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 1,
          right: 10,
          width: 26,
          height: 26,
          borderRadius: 25,
          alignItems: 'center',
          justifyContent: 'center',
          alignContent: 'center',
          alignSelf: 'center',
          elevation: 8,
          zIndex: 9,
        }}
        onPress={onRefresh}
      >
        <FontAwesome name="refresh" size={25} color="black" />
      </TouchableOpacity>
      </View>
    )


  return (
    <>
      <ScrollView
        style={{
          backgroundColor: 'white',
          paddingBottom: 30,
          paddingHorizontal: 30,
        }}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <KeyboardAvoidingView
          style={{
            flex: 1,
            backgroundColor: 'white',
            justifyContent: 'space-between',
          }}
          contentContainerStyle={{ flex: 1, justifyContent: 'space-evenly' }}
          behavior="position"
        >
          <View
            style={{
              marginBottom: 50,
              marginTop: 70,
              alignItems: 'center',
              justifyContent: 'flex-end',
              flex: 0.5,
            }}
          >
            <Image
              style={{ height: 230, width: 230, marginBottom: 20 }}
              resizeMode="contain"
              source={require('../../../assets/cdd-logo.png')}
            />
            <Text
              style={{
                fontFamily: 'Poppins_700Bold',
                fontSize: 19,
                lineHeight: 22,
                letterSpacing: 0,
                textAlign: 'center',
                color: '#24c38b',
              }}
            >
              {t('select_project.heading')}
            </Text>
          </View>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1, justifyContent: 'space-between' }}>
              <View
                style={{
                  backgroundColor: 'white',
                }}
              >
                <KeyboardAvoidingView
                  style={{
                    backgroundColor: 'white',
                  }}
                  behavior="padding"
                >
                  <View style={{  }}>
                    <View
                      style={{
                        borderRadius: 10,
                        marginBottom: 16,
                      }}
                    >
                      {projects.map((project: any) => (
                        <TouchableOpacity
                          style={{ marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#dedfe4' }}
                          onPress={() => onSelectProject(project)}
                          key={`${project.name}`}
                        >
                          <Text style={{ color: '#24c38b', fontWeight: 'bold' }}> {project.name} </Text>
                          <Text> {project.description} </Text>
                        </TouchableOpacity>
                      )
                      )}
                    </View>
                  </View>
                </KeyboardAvoidingView>
              </View>
              <View />
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>

      </ScrollView>
      
      <View>
          <TouchableOpacity
            style={{
              position: 'absolute',
              bottom: 1,
              left: 10,
              alignItems: 'center',
              justifyContent: 'center',
              alignContent: 'center',
              alignSelf: 'center',
              elevation: 8,
              zIndex: 9,
            }}
            onPress={handleSignOut}
          >
            <Text>{t('select_project.sign_out')}</Text>
          </TouchableOpacity>

          
          <TouchableOpacity
            style={{
              position: 'absolute',
              bottom: 1,
              right: 10,
              width: 26,
              height: 26,
              borderRadius: 25,
              alignItems: 'center',
              justifyContent: 'center',
              alignContent: 'center',
              alignSelf: 'center',
              elevation: 8,
              zIndex: 9,
            }}
            onPress={onRefresh}
          >
            <FontAwesome name="refresh" size={25} color="black" />
          </TouchableOpacity>
      </View>
      

    </>
  );
}

export default SelectProjectScreen;
