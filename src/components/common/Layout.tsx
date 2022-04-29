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
    <>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <Stack
        flex={1}
        // backgroundColor="gray.200"
        direction="column"
        space={3}
        px={disablePadding ? 0 : 5}
        {...rest}
      >
        {children}
      </Stack>
    </>
  );
};

Layout.defaultProps = {
  disablePadding: false,
};
/* eslint-enable react/jsx-props-no-spreading */
