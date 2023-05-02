import { useEffect } from 'react';
import { Pressable, PressableProps, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolateColor
} from 'react-native-reanimated'

import { THEME } from '../../styles/theme';
import { styles } from './styles';

const TYPE_COLORS = {
  EASY: THEME.COLORS.BRAND_LIGHT,
  HARD: THEME.COLORS.DANGER_LIGHT,
  MEDIUM: THEME.COLORS.WARNING_LIGHT,
}

type Props = PressableProps & {
  title: string;
  isChecked?: boolean;
  type?: keyof typeof TYPE_COLORS;
}

export function Level({ title, type = 'EASY', isChecked = false, ...rest }: Props) {
  const scale = useSharedValue(1); //criar variável para guardar conteúdo para usar nas animações
  const checked = useSharedValue(1); // temo que criar uma propriedade que o reanimated vai conseguir etender(criamos os cheked para obter a informação do isCheked)

  const COLOR = TYPE_COLORS[type];

  const animatedContainerStyle = useAnimatedStyle(() => { //useAnimatedStyle é uma estilização reativa ao useSharedValues
    return { // Temos que usar o useAnimatedStyle para definir quais as propriedades a gente quer animar da estilização do componente
      transform: [{ scale: scale.value }], // sacle.value -> é no value que está o conteúdo definido no useSharedValues
      backgroundColor: interpolateColor(
        checked.value,
        [0, 1], // valores possíveis
        ['transparent', COLOR] // valores para quando for 0 ou 1
      )
    }
  })

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        checked.value,
        [0, 1], // valores possíveis
        [COLOR, THEME.COLORS.GREY_100] // valores para quando for 0 ou 1
      )
    }
  })

  function onPressIn() { // quando o usuário pressionar
    scale.value = withTiming(1.1, { easing: Easing.bounce, duration: 300 }); // mudando a escala withTiming(modificador)
  }

  function onPressOut() { // quando o usuário soltar
    scale.value = withTiming(1, { easing: Easing.bounce, duration: 300 }); // mudando a escala withTiming(modificador)
  }

  useEffect(() => { // criando um useEffect para atualizar o valor de checked
    checked.value = withTiming(isChecked ? 1 : 0, { duration: 100 });
  }, [isChecked])

  return (
    <Pressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      {...rest}
    >
      <Animated.View style={ // A gente só pode usar um componente animado em um componente que aceite o componente animado nesse acaso Animated.View
        // Se eu utilizasse uma View normal do react native ela não ia aceitar as props de animção que eu fiz
        [
          styles.container,
          { borderColor: COLOR },
          animatedContainerStyle, // utilizando o animatedStyle
        ]
      }>
        <Animated.Text style={
          [
            styles.title,
            animatedTextStyle,
          ]}
        >
          {title}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}