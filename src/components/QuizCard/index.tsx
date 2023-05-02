import { TouchableOpacity, TouchableOpacityProps, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const TouchableOpacityAnimated = Animated.createAnimatedComponent(TouchableOpacity); // criando um touchableOpacity com as props do Animated

import { styles } from './styles';
import { THEME } from '../../styles/theme';

import { LevelBars } from '../LevelBars';
import { QUIZZES } from '../../data/quizzes';

type Props = TouchableOpacityProps & {
  data: typeof QUIZZES[0];
  index: number; // index é cada elemento
}

export function QuizCard({ data, index, ...rest }: Props) {
  const Icon = data.svg;

  return (
    <TouchableOpacityAnimated
      entering={FadeInUp.duration(500).delay(index * 80)} // definindo um delay para cada elemento para que entre 1 por vez
      style={styles.container}
      {...rest}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {Icon && <Icon size={24} color={THEME.COLORS.GREY_100} />}
        </View>

        <LevelBars level={data.level} />
      </View>

      <Text style={styles.title}>
        {data.title}
      </Text>
    </TouchableOpacityAnimated>
  );
}