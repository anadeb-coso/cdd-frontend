import React, { useContext, useEffect, useState } from 'react';
import { useToast } from 'native-base';

import {
  Keyboard,
  Text,
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import ProjectContext from "../../../contexts/project";
import ProjectsAPI from "../../../services/project/projects";
import { storeData } from "../../../utils/storageManager";
import {getData} from "../../../utils/storageManager";

// async function save(key, value) {
//   await SecureStore.setItemAsync(key, JSON.stringify(value));
// }

function ChangeProjectScreen({ navigation, route }: { navigation: any, route: any }) {
  const [projectCurrent, setProjectCurrent]: any = useState(null);
  const [projects, setProjects]: any = useState([]);
  const { selectProject } = useContext(ProjectContext);
  const toast = useToast();

  const get_projects = async () => {
    try {
      setProjectCurrent(JSON.parse(await getData('project')));
      await new ProjectsAPI()
        .get_projects()
        .then(async (response: any) => {
          if (response.error) {
            return;
          }
          const projects = response as Array<any>;
          if (projects.length == 1) {
            onSelectProject(projects[0], projects.length);
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

  const onSelectProject = async (project: any, projects_length: number) => {
    if(projects_length == 1){
      toast.show({
        description: `Le projet ${project.name} est sélectionné par défaut!`,
      });
    }else{
      Alert.alert('Alert', projectCurrent ? `Souhaitez vraiment changer de projet de ${projectCurrent?.name} en ${project.name} ?` : `Souhaitez vraiment changer de projet en ${project.name} ?`, [
        {
          text: "Oui", onPress: async () => {
            await storeData('project', JSON.stringify(project));
            selectProject(project);
            await storeData('infos_changed', true);
  
            toast.show({
              description: `Projet changé en ${project.name} avec succès`,
            });
  
            navigation.goBack();
  
          }
        },
        {
          text: "Non", onPress: async () => {
  
          }
        }
      ]);
    }


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
                <View style={{}}>
                  <View
                    style={{
                      borderRadius: 10,
                      marginBottom: 16,
                    }}
                  >
                    {projects.map((project: any) => (
                      <TouchableOpacity
                        style={{ marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#dedfe4', backgroundColor: projectCurrent?.name==project.name ? 'grey' : 'white' }}
                        onPress={() => onSelectProject(project, projects.length)}
                        disabled={projectCurrent?.name==project.name}
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
  );
}

export default ChangeProjectScreen;
