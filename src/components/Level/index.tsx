import { TouchableOpacity, TouchableOpacityProps, Text, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated'

import { THEME } from '../../styles/theme';
import { styles } from './styles';

const TYPE_COLORS = {
  EASY: THEME.COLORS.BRAND_LIGHT,
  HARD: THEME.COLORS.DANGER_LIGHT,
  MEDIUM: THEME.COLORS.WARNING_LIGHT,
}

type Props = TouchableOpacityProps & {
  title: string;
  isChecked?: boolean;
  type?: keyof typeof TYPE_COLORS;
}

export function Level({ title, type = 'EASY', isChecked = false, ...rest }: Props) {
  const scale = useSharedValue(1); //criar variável para guardar conteúdo para usar nas animações

  const COLOR = TYPE_COLORS[type];

  const animatedContainerStyle = useAnimatedStyle(() => { //useAnimatedStyle é uma estilização reativa ao useSharedValues
    return { // Temos que usar o useAnimatedStyle para definir quais as propriedades a gente quer animar da estilização do componente
      transform: [{ scale: scale.value }] // sacle.value -> é no value que está o conteúdo definido no useSharedValues
    }
  })

  return (
    <TouchableOpacity {...rest}>
      <Animated.View style={ // A gente só pode usar um componente animado em um componente que aceite o componente animado nesse acaso Animated.View
        // Se eu utilizasse uma View normal do react native ela não ia aceitar as props de animção que eu fiz
        [
          styles.container,
          animatedContainerStyle, // utilizando o animatedStyle
          { borderColor: COLOR, backgroundColor: isChecked ? COLOR : 'transparent' }
        ]
      }>
        <Text style={
          [
            styles.title,
            { color: isChecked ? THEME.COLORS.GREY_100 : COLOR }
          ]}>
          {title}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}