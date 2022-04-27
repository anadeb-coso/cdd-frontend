/* eslint-disable react/jsx-props-no-spreading */
import { IStackProps, Stack, StatusBar } from 'native-base';
import React from 'react';
import { SafeAreaView } from 'react-native';

interface Props extends IStackProps {
  disablePadding?: boolean;
}

export const Layout: React.FC<Props> = ({
  disablePadding = false,
  children,
  ...rest
}) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <Stack
        flex={1}
        backgroundColor="gray.200"
        direction="column"
        space={3}
        padding={disablePadding ? 0 : 3}
        {...rest}
      >
        {children}
      </Stack>
    </SafeAreaView>
  );
};

Layout.defaultProps = {
  disablePadding: false,
};
/* eslint-enable react/jsx-props-no-spreading */
