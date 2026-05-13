import React from "react";
import { StyleSheet, TextInput, View, Keyboard, TouchableOpacity, Text } from "react-native";
import { Box } from 'native-base';
import { Feather, Entypo } from "@expo/vector-icons";

const SearchBar = (
  { clicked, searchPhrase, setSearchPhrase, setClicked, onChangeFunction, stylesP, featherSize, entypoSize }: {
    clicked?: boolean;
    searchPhrase?: any;
    setSearchPhrase: (i: any) => void;
    setClicked: (i: any) => void;
    onChangeFunction: (i: any) => void;
    stylesP?: any;
    featherSize?: any;
    entypoSize?: any;
  }) => {
  return (
    <View style={[styles.container, stylesP?.container]}>
      <View
        style={[styles.searchBar__clicked, stylesP?.searchBar__clicked]}
      >
        {/* search Icon */}
        <Feather
          name="search"
          size={featherSize ?? 20}
          color="black"
          style={[{ marginLeft: 1 }, stylesP?.feather]}
        />
        {/* Input field */}
        <TextInput
          style={[styles.input, stylesP?.input]}
          placeholder="Rechercher..."
          value={searchPhrase}
          onChangeText={(value) => {
            setSearchPhrase(value);
            onChangeFunction(value);
          }}
          onFocus={() => {
            setClicked(true);
          }}
        />
        {/* cross Icon, depending on whether the search bar is clicked or not */}
        {clicked && (
          <Entypo name="cross" size={entypoSize ?? 20} color="black" style={[{ padding: 1 }, stylesP?.entypo]} onPress={() => {
            setSearchPhrase("");
            onChangeFunction("");
          }} />
        )}
      </View>
      
    </View>
  );
};
export default SearchBar;

// styles
const styles = StyleSheet.create({
  container: {
    margin: 15,
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    width: "90%",

  },
  searchBar__unclicked: {
    padding: 10,
    flexDirection: "row",
    width: "95%",
    backgroundColor: "#d9dbda",
    borderRadius: 15,
    alignItems: "center",
  },
  searchBar__clicked: {
    padding: 10,
    flexDirection: "row",
    // width: "80%",
    width: "100%",
    backgroundColor: "#d9dbda",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  input: {
    fontSize: 20,
    marginLeft: 10,
    width: "90%",
  },
});