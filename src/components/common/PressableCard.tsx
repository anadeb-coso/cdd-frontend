/* eslint-disable react/jsx-props-no-spreading */

import { IStackProps, Pressable, Stack } from 'native-base';
import React from 'react';

interface Props extends IStackProps {
  onPress?: () => void;
}

export const PressableCard: React.FC<Props> = ({
  children,
  onPress,
  ...rest
}) => {
  return (
    <Pressable onPress={onPress}>
      <Stack
        space={3}
        borderRadius="md"
        padding={4}
        backgroundColor="white"
        {...rest}
      >
        {children}
      </Stack>
    </Pressable>
  );
};

PressableCard.defaultProps = {
  onPress: () => null,
};
/* eslint-enable react/jsx-props-no-spreading */
