import { Text, Dimensions } from 'react-native';
import Animated, { Keyframe } from 'react-native-reanimated';

import { Option } from '../Option';
import { styles } from './styles';

type QuestionProps = {
  title: string;
  alternatives: string[];
}

type Props = {
  question: QuestionProps;
  alternativeSelected?: number | null;
  setAlternativeSelected?: (value: number) => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export function Question({ question, alternativeSelected, setAlternativeSelected }: Props) {

  // Definir exatamente em um determinado frame oq fazer
  const enteringKeyframe = new Keyframe({ // montando minha estilização animada
    0: { // no frame 0
      opacity: 0,
      transform: [
        { translateX: SCREEN_WIDTH }, // empurrando o componente para fora da tela
        { rotate: '90deg' } // rotacionando o elemento
      ]
    },
    70: { // no frame 70
      opacity: 0.3,
    },
    100: { // no frame 100 (posição final)
      opacity: 1,
      transform: [
        { translateX: 0 },
        { rotate: '0deg' }
      ]
    }
  })

  // Forma mais resumida (começo e fim)
  const exitingKeyframe = new Keyframe({
    from: { // inicio
      opacity: 1,
      transform: [
        { translateX: 0 },
        { rotate: '0deg' }
      ]
    },
    to: { // fim
      opacity: 0,
      transform: [
        { translateX: SCREEN_WIDTH * (-1) }, // transformando em valor negativo para sair para a esquerda
        { rotate: '-90deg' }
      ]
    },
  })
  return (
    <Animated.View
      style={styles.container}
      entering={enteringKeyframe}
      exiting={exitingKeyframe}
    >
      <Text style={styles.title}>
        {question.title}
      </Text>

      {
        question.alternatives.map((alternative, index) => (
          <Option
            key={index}
            title={alternative}
            checked={alternativeSelected === index}
            onPress={() => setAlternativeSelected && setAlternativeSelected(index)}
          />
        ))
      }
    </Animated.View>
  );
}