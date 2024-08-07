import React from 'react';
import { Modal, View, StyleSheet, ActivityIndicator, Text } from 'react-native';

const LoadingScreen = ({ visible }) => {
    return (
        <Modal transparent animationType="none" visible={visible}>
        <View style={styles.modalBackground}>
            <View style={styles.activityIndicatorWrapper}>
            <ActivityIndicator size="large" color="white" />
            <Text>Patientez...</Text>
            </View>
        </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  activityIndicatorWrapper: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    padding: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LoadingScreen;