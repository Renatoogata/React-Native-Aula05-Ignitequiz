import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming, interpolate, Easing, useAnimatedScrollHandler, Extrapolate } from 'react-native-reanimated';

import { useNavigation, useRoute } from '@react-navigation/native';

import { styles } from './styles';

import { QUIZ } from '../../data/quiz';
import { historyAdd } from '../../storage/quizHistoryStorage';

import { Loading } from '../../components/Loading';
import { Question } from '../../components/Question';
import { QuizHeader } from '../../components/QuizHeader';
import { ConfirmButton } from '../../components/ConfirmButton';
import { OutlineButton } from '../../components/OutlineButton';
import { ProgressBar } from '../../components/ProgressBar';
import { THEME } from '../../styles/theme';

interface Params {
  id: string;
}

type QuizProps = typeof QUIZ[0];

export function Quiz() {
  const [points, setPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quiz, setQuiz] = useState<QuizProps>({} as QuizProps);
  const [alternativeSelected, setAlternativeSelected] = useState<null | number>(null);

  const shake = useSharedValue(0); // criando o useSharedValue
  const scrollY = useSharedValue(0); // criando o useSharedValue

  const { navigate } = useNavigation();

  const route = useRoute();
  const { id } = route.params as Params;

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
    } else { // se o usuário errar a pergunta cai no else
      shakeAnimation(); // chamando animação de shake
      handleNextQuestion();
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

  function shakeAnimation() { // criando animação para tremer a tela
    shake.value = withSequence( // sequencia de valores
      withTiming(3, { duration: 400, easing: Easing.bounce }),
      withTiming(0)
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

  if (isLoading) {
    return <Loading />
  }

  return (
    <View style={styles.container}>
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
        <Animated.View // componente animado
          style={shakeStyleAnimated}
        >
          <Question
            key={quiz.questions[currentQuestion].title}
            question={quiz.questions[currentQuestion]}
            alternativeSelected={alternativeSelected}
            setAlternativeSelected={setAlternativeSelected}
          />
        </Animated.View>

        <View style={styles.footer}>
          <OutlineButton title="Parar" onPress={handleStop} />
          <ConfirmButton onPress={handleConfirm} />
        </View>
      </Animated.ScrollView>
    </View >
  );
}