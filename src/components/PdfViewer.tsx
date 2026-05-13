import React from "react";
import { View, Dimensions } from 'react-native';
import Pdf from 'react-native-pdf';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

export default function PdfViewer({ route }: {route: any}) {
  const { uri } = route.params;
  return (
    <View style={{ flex: 1 }}>
      <Pdf
        source={{ uri: uri ? uri.split("?")[0] : "" }}
        style={{ width: WIDTH, height: HEIGHT }}
        trustAllCerts={false}
      />
    </View>
  );
}