import { useEffect, useState } from 'react';
import { Alert, Text, View, BackHandler } from 'react-native';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  interpolate,
  Easing,
  useAnimatedScrollHandler,
  Extrapolate,
  runOnJS
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Audio } from 'expo-av'
import * as Haptics from 'expo-haptics'

import { useNavigation, useRoute } from '@react-navigation/native';

import { styles } from './styles';
import { THEME } from '../../styles/theme';

import { QUIZ } from '../../data/quiz';
import { historyAdd } from '../../storage/quizHistoryStorage';

import { Loading } from '../../components/Loading';
import { Question } from '../../components/Question';
import { QuizHeader } from '../../components/QuizHeader';
import { ConfirmButton } from '../../components/ConfirmButton';
import { OutlineButton } from '../../components/OutlineButton';
import { ProgressBar } from '../../components/ProgressBar';
import { OverlayFeedaback } from '../../components/OverlayFeedback';

interface Params {
  id: string;
}

type QuizProps = typeof QUIZ[0];

const CARD_INCLINATION = 10;
const CARD_SKIP_AREA = (-200);

export function Quiz() {
  const [points, setPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quiz, setQuiz] = useState<QuizProps>({} as QuizProps);
  const [alternativeSelected, setAlternativeSelected] = useState<null | number>(null);

  const [statusReply, setStatusReply] = useState(0);

  const shake = useSharedValue(0); // criando o useSharedValue
  const scrollY = useSharedValue(0); // criando o useSharedValue
  const cardPosition = useSharedValue(0);

  const { navigate } = useNavigation();

  const route = useRoute();
  const { id } = route.params as Params;

  async function playSound(isCorrect: boolean) {
    const file = isCorrect ? require('../../assets/correct.mp3') : require('../../assets/wrong.mp3')
    const { sound } = await Audio.Sound.createAsync(file, { shouldPlay: true })

    await sound.setPositionAsync(0) // deixas o som no tempo 0 (no começo)
    await sound.playAsync();
  }

  function handleSkipConfirm() {
    Alert.alert('Pular', 'Deseja realmente pular a questão?', [
      { text: 'Sim', onPress: () => handleNextQuestion() },
      { text: 'Não', onPress: () => { } }
    ]);
  }

  async function handleFinished() {
    await historyAdd({
      id: new Date().getTime().toString(),
      title: quiz.title,
      level: quiz.level,
      points,
      questions: quiz.questions.length
    });

    navigate('finish', {
      points: String(points),
      total: String(quiz.questions.length),
    });
  }

  function handleNextQuestion() {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prevState => prevState + 1)
    } else {
      handleFinished();
    }
  }

  async function handleConfirm() {
    if (alternativeSelected === null) {
      return handleSkipConfirm();
    }

    if (quiz.questions[currentQuestion].correct === alternativeSelected) {
      setPoints(prevState => prevState + 1);

      await playSound(true);
      setStatusReply(1);
    } else { // se o usuário errar a pergunta cai no else
      await playSound(false);
      setStatusReply(2);
      shakeAnimation(); // chamando animação de shake
    }

    setAlternativeSelected(null);
  }

  function handleStop() {
    Alert.alert('Parar', 'Deseja parar agora?', [
      {
        text: 'Não',
        style: 'cancel',
      },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: () => navigate('home')
      },
    ]);

    return true;
  }

  async function shakeAnimation() { // criando animação para tremer a tela
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); // fazer o celular vibrar
    shake.value = withSequence( // sequencia de valores
      withTiming(3, { duration: 400, easing: Easing.bounce }),
      withTiming(0, undefined, (finished) => { // função de callback para quando o withSequence terminar
        'worklet'; // para chamar uma função javascript no reanimated temos que chamar o worklet e o runOnJS
        if (finished) {
          runOnJS(handleNextQuestion)();
        }
      })
    );
  }

  const shakeStyleAnimated = useAnimatedStyle(() => {
    return {
      transform: [{
        translateX: interpolate( //usando o interpolate para deixar a dinamica da tremida de tela mais fluída
          shake.value, // o shake.value começa de 0, vai para 3 e volta para 0 -> nesse intervalo vamos definir o valor de translateX
          [0, 0.5, 1, 1.5, 2, 2.5, 3], // intervalos de 0 a 3
          [0, -15, 0, 15, 0, -15, 0] // valores de translateX
        )
      }] // translateX trabalhando na horizontal
    }
  })

  const scrollHandler = useAnimatedScrollHandler({ // lidar com a scrollview
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y // pegando o valor do scroll Y (Vertical)
    }
  })

  const headerStyles = useAnimatedStyle(() => { // utilizando no header (fazendo ele esconder quando o usuario arrasta para baixo)
    return {
      opacity: interpolate(scrollY.value, [60, 90], [1, 0], Extrapolate.CLAMP)
    }
  })

  const fixedProgressBarStyles = useAnimatedStyle(() => { // estilização da barra de animação fixa(quando o usuario rolar a tela para baixo e a animação das perguntas sumir)
    return {
      position: 'absolute',
      zIndex: 1,
      paddingTop: 50,
      backgroundColor: THEME.COLORS.GREY_500,
      width: '110%',
      left: '-5%',
      opacity: interpolate(
        scrollY.value,
        [50, 90], // quando o valor de scrollY for 50 e 90 
        [0, 1],  // deixar a opacidade 0 quando o scrollY for 50, e 1 quando o scrollY for 90
        Extrapolate.CLAMP, // garantir que a animação seja trabalha no intervalo definido(50, 90)
      ),
      transform: [ // fazer um efeito de deslizar na tela
        {
          translateY: interpolate(
            scrollY.value,
            [50, 100], // colocando 10 a mais para ele sair da tela
            [-40, 0],
            Extrapolate.CLAMP
          )
        }
      ]
    }
  })

  const onPan = Gesture // salva os movimentos que o usuario faz na tela (pinça, segurar o dedo na tela, movimentos na horizontal e vertical)
    .Pan() // movimentos horizontais e verticais
    .activateAfterLongPress(200) // ativar o gesto depois de 200msegundos
    .onUpdate((event) => {
      const moveLeft = event.translationX < 0;
      if (moveLeft) {
        cardPosition.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (event.translationX < CARD_SKIP_AREA) {
        runOnJS(handleSkipConfirm)(); // chamando uma função javacript dentro de uma animação
      }
      cardPosition.value = withTiming(0) // voltar para 0 de forma fluída
    });

  const dragStyles = useAnimatedStyle(() => { // utilizando no header (fazendo ele esconder quando o usuario arrasta para baixo)
    const rotateZ = cardPosition.value / CARD_INCLINATION; // fazendo o card girar

    return {
      transform: [
        { translateX: cardPosition.value }, // movendo o card na horizontal
        { rotateZ: `${rotateZ}deg` } // fazendo o cardd girar
      ]
    }
  })

  useEffect(() => {
    const quizSelected = QUIZ.filter(item => item.id === id)[0];
    setQuiz(quizSelected);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (quiz.questions) {
      handleNextQuestion();
    }
  }, [points]);

  useEffect(() => { // quando clicar no botão voltar do android, ao invés de só voltar ele vai chamar a função de confirmação
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleStop);

    return () => backHandler.remove();
  }, [])

  if (isLoading) {
    return <Loading />
  }

  return (
    <View style={styles.container}>
      <OverlayFeedaback
        status={statusReply}
      />
      <Animated.View style={fixedProgressBarStyles}>
        <Text style={styles.title}>
          {quiz.title}
        </Text>

        <ProgressBar
          total={quiz.questions.length}
          current={currentQuestion + 1}
        />
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.question}
        onScroll={scrollHandler}
        scrollEventThrottle={16} // deixar a rolagem no IOS mais suave
      >
        <Animated.View style={[styles.header, headerStyles]}>
          <QuizHeader
            title={quiz.title}
            currentQuestion={currentQuestion + 1}
            totalOfQuestions={quiz.questions.length}
          />
        </Animated.View>

        <GestureDetector // passar de pergunta quando arrastar o card para esquerda  
          gesture={onPan}
        >
          <Animated.View // componente animado (tremer o card quando a resposta for errada)
            style={[shakeStyleAnimated, dragStyles]}
          >
            <Question
              key={quiz.questions[currentQuestion].title}
              question={quiz.questions[currentQuestion]}
              alternativeSelected={alternativeSelected}
              setAlternativeSelected={setAlternativeSelected}
              onUnmount={() => setStatusReply(0)}
            />
          </Animated.View>
        </GestureDetector>

        <View style={styles.footer}>
          <OutlineButton title="Parar" onPress={handleStop} />
          <ConfirmButton onPress={handleConfirm} />
        </View>
      </Animated.ScrollView>
    </View >
  );
}