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
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import styles from './SelectProject.style';
import ProjectContext from "../../contexts/project";
import ProjectsAPI from "../../services/project/projects";
import {storeData} from "../../utils/storageManager";

async function save(key, value) {
  await SecureStore.setItemAsync(key, JSON.stringify(value));
}

function SelectProjectScreen() {
  const [projects, setProjects] = useState([]);
  const { selectProject } = useContext(ProjectContext);

    const get_projects = async () => {
        try {
            await new ProjectsAPI()
                .get_projects()
                .then(async (response: any) => {
                    if (response.error) {
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
                    console.error(error);
                });
        } catch (e) {
            console.log("Error1 : " + e);
        }

    };

    useEffect(() => {
        get_projects();
    }, []);
;
    const onSelectProject  = async project => {
        await storeData('project', JSON.stringify(project));
        selectProject(project)
    }

  return (
    <ScrollView
      style={{
        backgroundColor: 'white',
        paddingBottom: 30,
        paddingHorizontal: 30,
      }}
      contentContainerStyle={{ flexGrow: 1 }}
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
              Sélectionner un projet
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
                <View style={[styles.formContainer]}>
                  <View
                    style={{
                      borderRadius: 10,
                      marginBottom: 16,
                    }}
                  >
                      { projects.map(project => (
                              <TouchableOpacity
                                  style={{ marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#dedfe4'}}
                                  onPress={() => onSelectProject(project)}
                              >
                                  <Text style={{ color: '#24c38b', fontWeight: 'bold'}}> {project.name} </Text>
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
  );
}

export default SelectProjectScreen;
