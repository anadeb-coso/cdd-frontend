import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Box } from 'native-base';
import { 
  StatusBar, StyleSheet, Text, TouchableOpacity, 
  View, ActivityIndicator, ScrollView, Image, SafeAreaView 
} from 'react-native';
import { ToggleButton } from 'react-native-paper';
import ListHeader from '../components/ListHeader';
import { getTaskStatusColor } from '../../../utils/colors'
import SearchBar from "../../../components/SearchBar";

function Content({tasks, cvds}:{tasks:any, cvds:any}) {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('uncompleted');
  const [statusLabel, setStatusLabel] = useState('Inachevées');
  const [filteredTasks, setFilteredTasks] = useState({
    completed: [], uncompleted: [], validated: [], invalidated: [], unsee: []
  });
  const [_tasks, setTasks] = useState([]);
  const [tasksCopy, setTasksCopy] = useState([]);

  //Search
  const [searchPhrase, setSearchPhrase] = useState("");
  const [clicked, setClicked] = useState(false);

  const check_character = (liste: any, elt: string) => {
    let l;
    let eltUpper = elt.toUpperCase();
    for(let i=0; i<liste.length; i++){
      l = liste[i];
      if(l && eltUpper.includes(l)){
        return true;
      }
    }
    return false;
  };

  const onChangeSearchFunction = (searchPhraseCopy:string =searchPhrase) => {
    if(searchPhraseCopy.trim()){
      setLoading(true);
      setTasks([]);
      let tasksSearch = [];
      let _ = [...tasksCopy];
      let elt: any;
      let searchPhraseSplit = searchPhraseCopy.toUpperCase().trim().split(" "); //.replace(/\s/g, "").split(" ");
      for(let i=0; i<_.length; i++){
        elt = _[i];
        if(elt && elt.name && check_character(searchPhraseSplit, elt.name)){
          tasksSearch.push(elt);
        }else if(elt && elt.administrative_level_name && check_character(searchPhraseSplit, elt.administrative_level_name)){
          tasksSearch.push(elt);
        }else if(elt && elt.activity_name && check_character(searchPhraseSplit, elt.activity_name)){
          tasksSearch.push(elt);
        }else if(elt && elt.phase_name && check_character(searchPhraseSplit, elt.phase_name)){
          tasksSearch.push(elt);
        }else if(elt && elt.cvd && elt.cvd.name && check_character(searchPhraseSplit, elt.cvd.name)){
          tasksSearch.push(elt);
        }
      }
      getTasksReferences(tasksSearch);
    }
  };
  //End Search

  const getTaskCVD = (task: any) => {
    let c = cvds.find((elt:any) => (elt.villages.find((i:any) => i.id == task.administrative_level_id)));
    return c;
  };

  useEffect(() => {
    setTasks(tasks);
    setTasksCopy(tasks);
  }, []);

  const getTasksReferences = (tasksParams: any = tasks) => {
    setLoading(true);
    const filteredTasksCopy = { ...tasksParams };
    filteredTasksCopy.completed = []
    filteredTasksCopy.uncompleted = []
    filteredTasksCopy.validated = []
    filteredTasksCopy.invalidated = []
    filteredTasksCopy.unsee = []
    let elt;
    for(let i=0; i<tasksParams.length; i++){
      elt = tasksParams[i];
      elt.cvd = getTaskCVD(elt);
      if(elt.completed){
        filteredTasksCopy.completed.push(elt);
      }
      if(!elt.completed){
        filteredTasksCopy.uncompleted.push(elt);
      }
      if(elt.validated){
        filteredTasksCopy.validated.push(elt);
      }
      if(elt.validated === false){
        filteredTasksCopy.invalidated.push(elt);
      }
      if([null, undefined].includes(elt.validated) && elt.completed){
        filteredTasksCopy.unsee.push(elt);
      }
    }

    setFilteredTasks(filteredTasksCopy);

    let selectedTabTasks: any;
    switch (status) {
      case 'completed':
        selectedTabTasks = filteredTasksCopy.completed;
        setStatusLabel("Achevées")
        break;
      case 'uncompleted':
        selectedTabTasks = filteredTasksCopy.uncompleted;
        setStatusLabel("Inachevées")
        break;
      case 'validated':
        selectedTabTasks = filteredTasksCopy.validated;
        setStatusLabel("Validées")
        break;
      case 'invalidated':
        selectedTabTasks = filteredTasksCopy.invalidated;
        setStatusLabel("Invalidées")
        break;
      case 'unsee':
        selectedTabTasks = filteredTasksCopy.unsee;
        setStatusLabel("Non-vues")
        break;
      default:
        selectedTabTasks = _tasks.map((task: any) => task);
    }
    
    setTasks(selectedTabTasks);
    setLoading(false);
  };
  
  useEffect(() => {
    if(searchPhrase.trim()){
      onChangeSearchFunction(searchPhrase);
    }else{
      getTasksReferences();
    }
  }, [status]);


  function Item({ item, onPress, backgroundColor, textColor, key_propos }: {
    item: any; onPress?: () => void; backgroundColor: any; textColor: any; key_propos:any;
  }) {
    return (
      <TouchableOpacity onPress={onPress} style={[styles.item]} key={key_propos}>
        <Text >
          {item.name?.length > 40
            ? `${item.name.substring(0, 40)}...`
            : item.name}
        </Text>
        <Text style={[styles.subTitle, { flexShrink: 1 }]}>
          {item.phase_name?.length > 20
            ? `${item.phase_name.substring(0, 20)}...`
            : item.phase_name} {' > '} {item.activity_name?.length > 20
              ? `${item.activity_name.substring(0, 20)}...`
              : item.activity_name}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box rounded="sm" style={{flexDirection:'row'}}>
            <Image
              resizeMode="stretch"
              style={{ width: 25, height: 30 }}
              source={require('../../../../assets/illustrations/location.png')}
            />
            <Text style={{...styles.subTitle, marginTop: 8, marginLeft: 2}}>
            {item.cvd ? (item.cvd.name?.length > 35
              ? `${item.cvd.name.substring(0, 35)}...`
              : item.cvd.name) : "Non trouvée"}
          </Text>
          </Box>
          


          <MaterialCommunityIcons name="chevron-right-circle" size={24} color={getTaskStatusColor(item)} />
        </View>
      </TouchableOpacity>
    );
  }

  const renderItem = (item: any, i: number) => { //= ({ item }: {item: any}) => {
    const backgroundColor = '#f9c2ff';
    const color = 'black';

    return (
      <Item
        key={`${item._id}${i}`}
        key_propos={`${item._id}${i}`}
        item={item}
        onPress={() =>  navigation.navigate('TaskStatusDetail', {
          _id: item._id, cvd: item.cvd
        })}
        backgroundColor={{ backgroundColor }}
        textColor={{ color }}
      />
    );
  };


  const renderHeader = () => (
    <ListHeader
      completed={filteredTasks?.completed?.length || 0}
      uncompleted={filteredTasks?.uncompleted?.length || 0}
      validated={filteredTasks?.validated?.length || 0}
      invalidated={filteredTasks?.invalidated?.length || 0}
      unsee={filteredTasks?.unsee?.length || 0}
      statusLabel={statusLabel}
    />
  );


  if (loading) return(<ActivityIndicator style={{ marginTop: 50 }} size="small" />);
  return (
    <>
      <ToggleButton.Row
        style={{ justifyContent: 'space-between' }}
        onValueChange={(value: any) => {
          setStatus(value);
          // toggleTasks(value);
        }}
        value={status}
      >
        <ToggleButton
          style={{ flex: 1 }}
          icon={() => (
            <View>
              <Text>Achevées</Text>
            </View>
          )}
          value="completed"
        />
        <ToggleButton
          style={{ flex: 1 }}
          icon={() => (
            <View>
              <Text>Inachevées</Text>
            </View>
          )}
          value="uncompleted"
        />
        <ToggleButton
          style={{ flex: 1 }}
          icon={() => (
            <View>
              <Text>Validées</Text>
            </View>
          )}
          value="validated"
        />
        <ToggleButton
          style={{ flex: 1 }}
          icon={() => (
            <View>
              <Text>Invalidées</Text>
            </View>
          )}
          value="invalidated"
        />
        <ToggleButton
          style={{ flex: 1 }}
          icon={() => (
            <View>
              <Text>Non vues</Text>
            </View>
          )}
          value="unsee"
        />
      </ToggleButton.Row>
      {/* <FlatList
        style={{ flex: 1 }}
        data={tasks}
        renderItem={renderItem}
        // ListHeaderComponent={renderHeader}
        keyExtractor={(item) => item._id}
        extraData={selectedId}
      /> */}




      <ScrollView _contentContainerStyle={{ pt: 7, px: 5 }}>
        {renderHeader()}

        <SafeAreaView style={styles.root}>
          <SearchBar
            searchPhrase={searchPhrase}
            setSearchPhrase={setSearchPhrase}
            clicked={clicked}
            setClicked={setClicked}
            onChangeFunction={onChangeSearchFunction}
          />
        </SafeAreaView>

        {_tasks.map((t: any, i: any) => renderItem(t, i))}
      </ScrollView>

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    flex: 1,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 23,
    borderBottomWidth: 1,
    borderColor: '#f6f6f6',
  },
  title: {
    fontFamily: 'Poppins_500Medium',
    // fontSize: 12,
    fontWeight: 'normal',
    fontStyle: 'normal',
    // lineHeight: 10,
    letterSpacing: 0,
    // textAlign: "left",
    color: '#707070',
  },
  subTitle: {
    fontFamily: 'Poppins_300Light',
    fontSize: 12,
    fontWeight: 'normal',
    fontStyle: 'normal',
    // lineHeight: 10,
    letterSpacing: 0,
    // textAlign: "left",
    color: '#707070',
  },
  statisticsText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    fontWeight: 'bold',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#707070',
  },
  root: {
    justifyContent: "center",
    alignItems: "center",
  },
  titleSearch: {
    width: "100%",
    marginTop: 20,
    fontSize: 25,
    fontWeight: "bold",
    marginLeft: "10%",
  },
});

export default Content;
