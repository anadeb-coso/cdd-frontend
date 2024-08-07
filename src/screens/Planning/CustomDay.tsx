import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { isToday } from '../../utils/functions'
import XDate from 'xdate';

const CustomDay = ({ props, selectedDate, setSelectedDate, onDayPress }) => {
  const { date, marking, dayComponent, markingType, state, onPress } = props;
  const markers = marking ? marking.datas ? marking.datas : [] : [];
  let views = [];
  let marker;

  const _is_today = isToday(new XDate(date.dateString));
  const _is_selected = selectedDate == date.dateString;

  const styles = StyleSheet.create({
    container: {
      alignItems: 'flex-start',
      borderColor: _is_selected ? 'green' : (_is_today ? 'red' : 'gray'),
      borderWidth: _is_today || _is_selected ? 2 : 0.17,
      width: 50,
      height: 50
    },
    dateText: {
      fontSize: 11,
      fontWeight: 'bold',
      marginLeft: 5,
    },

    containerBarCheck: {
      flexDirection: 'row',
      marginVertical: 1
    },
    marker: {
      // width: 35,
      flex: 0.8,
      height: 7,
      borderRadius: 4,
    },
    check: {
      flex: 0.2,
      marginLeft: 2
    }
  });


  for (let index = 0; index < markers.length; index++) {
    marker = markers[index];
    if (index < 3)
      views.push(
        <View style={styles.containerBarCheck} key={`${date.dateString}-${index}`}>
          <View  key={`${date.dateString}_${index}`} style={[styles.marker, { backgroundColor: marker.backgroundColor }]} />
          <View style={styles.check}>
            <FontAwesome
              name={(marker?.completed || marker?.is_another) ? "check-circle-o" : "circle-o"}
              size={7}
              color={(marker?.completed || marker?.is_another) ? "#63D3AC" : "black"} />
          </View>
        </View>
      )
  }

  return (
    <TouchableOpacity
      onPress={() => {
        setSelectedDate(date.dateString);
        onDayPress(date);
      }}
    >
      <View style={styles.container}>
        <Text style={[styles.dateText, state === 'disabled' && { color: 'gray', fontWeight: '300' }]}>{date.day}</Text>
        {views.map(elt => elt)}
      </View>
    </TouchableOpacity>
  );
};


export default CustomDay;
