import { LinearGradient } from 'expo-linear-gradient';
import { extendTheme } from 'native-base';
import React from 'react';

const primary = {
  50: '#d3faec',
  100: '#b3f5de',
  200: '#8ce8c8',
  300: '#6ee0b8',
  400: '#40d3a0',
  500: '#24c38b',
  600: '#1aa978',
  700: '#0d7e57',
  800: '#044830',
  900: '#022a1c',
};

export const theme = extendTheme({
  colors: {
    primary,
    trueGray: {
      500: '#707070',
    },
  },
  fontConfig: {
    Poppins: {
      100: {
        normal: 'Poppins_100Thin',
        // italic: 'Roboto-LightItalic',
      },
      200: {
        normal: 'Poppins_200ExtraLight',
        // italic: 'Roboto-LightItalic',
      },
      300: {
        normal: 'Poppins_300Light',
        // italic: 'Roboto-LightItalic',
      },
      400: {
        normal: 'Poppins_400Regular',
        // italic: 'Roboto-Italic',
      },
      500: {
        normal: 'Poppins_500Medium',
      },
      600: {
        normal: 'Poppins_600SemiBold',
        // italic: 'Roboto-MediumItalic',
      },
      700: {
        normal: 'Poppins_700Bold',
        // italic: 'Roboto-MediumItalic',
      },
      800: {
        normal: 'Poppins_800ExtraBold',
        // italic: 'Roboto-MediumItalic',
      },
      900: {
        normal: 'Poppins_900Black',
        // italic: 'Roboto-MediumItalic',
      },
    },
  },

  // Make sure values below matches any of the keys in `fontConfig`
  fonts: {
    heading: 'Poppins',
    body: 'Poppins',
    mono: 'Poppins',
  },

  config: {
    // initialColorMode: "dark",
  },
  components: {
    Button: {
      baseStyle: {
        _text: {
          fontWeight: 'bold',
        },
        borderRadius: 'md',
      },
      defaultProps: {},
      sizes: {},
      variants: {
        outline: {
          _text: {
            color: 'primary.500',
          },
        },
        ghost: {
          _text: {
            color: 'primary.500',
          },
        },
      },
    },
    Toast: {
      defaultProps: {
        placement: 'top',
      },
    },
    Text: {
      baseStyle: {
        color: 'black',
      },
      variants: {
        headerAction: {
          color: 'white',
        },
      },
    },
    Heading: {
      // Can pass also function, giving you access theming tools
      baseStyle: {},
      defaultProps: {
        size: 'lg',
        color: 'trueGray.500',
      },
    },
    Icon: {
      defaultProps: {
        size: 'sm',
      },
      baseStyle: {
        color: 'primary.500',
        textAlign: 'center',
      },
    },
    IconButton: {
      variants: {
        solid: {
          shadow: 3,
        },
      },
    },
    Spinner: {
      baseStyle: {
        color: 'primary.500',
      },
    },
    Box: {},
    VStack: {
      baseStyle: {},
    },

    HStack: {
      baseStyle: {},
    },
    Input: {
      baseStyle: {
        _ios: {
          padding: 3,
        },
        borderRadius: 'md',
      },
    },
    Skeleton: {
      defaultProps: {
        startColor: 'coolGray.500',
      },
      baseStyle: {
        borderRadius: 'md',
      },
    },
    Badge: {
      baseStyle: {},
      defaultProps: {
        borderRadius: 'md',
      },
    },
    FormControlErrorMessage: {
      baseStyle: {},
      defaultProps: {
        margin: 0,
      },
    },
  },
});

type CustomThemeType = typeof theme;

declare module 'native-base' {
  type ICustomTheme = CustomThemeType;
}

export const config = {
  dependencies: {
    'linear-gradient': LinearGradient,
  },
};
