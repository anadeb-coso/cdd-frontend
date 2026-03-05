import React from "react";
import { ScrollView, Image, Dimensions } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

export default function ImageViewerCustomer({ route }: {route: any}) {
  const { uri } = route.params;
  return (
    <ImageViewer
              imageUrls={[{ url: uri ? uri.split("?")[0] : "" }]}
              enableSwipeDown
              onSwipeDown={() => {}}
              onCancel={() => {}}
            />

  );
}
