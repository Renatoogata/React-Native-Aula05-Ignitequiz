import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { styles } from './styles';

interface Props {
  total: number;
  current: number;
}

export function ProgressBar({ total, current }: Props) {
  //Math.round para não ter número quebrado
  const percentage = Math.round((current / total) * 100); // pegando o total de perguntas pela pergunta q a pessoa esta respondendo no momento e multiplicando por 100 para ter o valor em porcentagem 

  const sharedProgress = useSharedValue(percentage);

  const styleAnimated = useAnimatedStyle(() => {
    return {
      width: `${sharedProgress.value}%`
    }
  })

  useEffect(() => {
    sharedProgress.value = withTiming(percentage, { duration: 700 });
  }, [current]) // current é a pergunta que o usuário está ou seja, sempre que o usuário passar para próxima pergunta o useEffect será disparado

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.progress, styleAnimated]} />
    </View>
  );
}