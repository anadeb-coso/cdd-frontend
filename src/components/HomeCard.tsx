import { Image, Box, Heading, Stack, Pressable, HStack } from 'native-base';
import { Dimensions, ToastAndroid } from 'react-native';
import React from 'react';
import { ImageSourcePropType } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { PrivateStackParamList } from '../types/navigation';

// Cartes de l'accueil : hauteur réduite (5 modules, COSOCollect compris, sur 2 colonnes).
// Largeur = (écran - marges de la liste 2 x 20 - écart entre colonnes 2 x 10) / 2.
const CARD_HEIGHT = 170;
const CARD_WIDTH = (Dimensions.get('window').width - 40) / 2 - 10;
const ILLUSTRATION_RATIO = 291 / 156; // proportions des illustrations (assets/backgrounds/*.png)
const TITLE_HEIGHT = 48; // titre sur 2 lignes au plus
const ILLUSTRATION_HEIGHT = Math.min((CARD_HEIGHT - TITLE_HEIGHT) / 0.55, CARD_WIDTH * ILLUSTRATION_RATIO);

export default function HomeCard({
  id,
  title,
  backgroundImage,
  backgroundImageIcon,
  goesTo,
  index,
  stats,
  allDocsAre
}: {
  id: string | number;
  title: string;
  backgroundImage: ImageSourcePropType;
  backgroundImageIcon: ImageSourcePropType;
  goesTo: any;
  index: number;
  stats: any;
  allDocsAre: boolean;
}) {
  const { t } = useTranslation(['components', 'common']);
  const navigation =
    useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
  return (
    <Pressable
      w="50%"
      mb={5}
      key={id}
      onPress={() => {
        if(goesTo.route == "SelectVillage" && !stats && allDocsAre){
          ToastAndroid.show(t('home_card.no_task_message'), ToastAndroid.LONG);
        }else if(goesTo.route == "SelectVillage" && !stats){
          ToastAndroid.show(t('home_card.data_loading_message'), ToastAndroid.LONG);
        }else{
          let params = goesTo.params ?? {};
          if(goesTo.route == "SelectVillage" && stats){
            params = {...params, tasks_stats: stats}
          }
          navigation.navigate(goesTo.route, params)
        }
      }}
    >
      {({ isPressed }) => {
        return (
          <Box
            rounded="xl"
            overflow="hidden"
            style={[
              { height: CARD_HEIGHT },
              {
                transform: [
                  {
                    scale: isPressed ? 0.97 : 1,
                  },
                ],
              },
              index % 2 === 0 ? { marginRight: 10 } : { marginLeft: 10 },
            ]}
          >
            <Image
              position="absolute"
              top={0}
              left={0}
              style={{ width: '100%', height: '100%' }}
              resizeMode="stretch"
              source={backgroundImage}
              alt="image"
            />
            {/* Illustration réduite pour tenir sous le titre : le dessin occupe la partie basse (≈ 55 %)
                de l'image, le haut est transparent ; ancrée en bas et centrée. */}
            <Image
              position="absolute"
              bottom={0}
              style={{
                width: ILLUSTRATION_HEIGHT / ILLUSTRATION_RATIO,
                height: ILLUSTRATION_HEIGHT,
                left: (CARD_WIDTH - ILLUSTRATION_HEIGHT / ILLUSTRATION_RATIO) / 2,
              }}
              resizeMode="stretch"
              source={backgroundImageIcon}
              alt="image"
            />
            <HStack
              position="absolute"
              top="2"
              px={2}
              space={2}
              style={{
                flex: 1,
                justifyContent: 'space-evenly',
                alignItems: 'center',
              }}
            >
              <Heading
                style={{ flex: 6 }}
                fontSize={14}
                color="white"
              >
                {title}
              </Heading>
              <Stack alignItems="flex-end" flex={1}>
                <Image
                  size={4}
                  source={require('../../assets/right_arrow.png')}
                  alt="image"
                />
              </Stack>
            </HStack>
          </Box>
        );
      }}
    </Pressable>
  );
}
