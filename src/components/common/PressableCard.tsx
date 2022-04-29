/* eslint-disable react/jsx-props-no-spreading */

import { Card, IStackProps, Pressable, Stack } from 'native-base';
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
      <Card
        space={3}
        borderRadius="md"
        padding={4}
        backgroundColor="white"
        {...rest}
      >
        {children}
      </Card>
    </Pressable>
  );
};

PressableCard.defaultProps = {
  onPress: () => null,
};
/* eslint-enable react/jsx-props-no-spreading */
