import { useEffect } from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import {
  Canvas,
  Skia,
  Path,
  useValue,
  runTiming,
  BlurMask,
  Circle,
  Easing,
} from '@shopify/react-native-skia'

import { styles } from './styles';
import { THEME } from '../../styles/theme';

type Props = TouchableOpacityProps & {
  checked: boolean;
  title: string;
}

const CHECK_SIZE = 16;
const CHECK_STROKE = 2;

export function Option({ checked, title, ...rest }: Props) {

  const percentage = useValue(0); // é como se fosse o useSharedValue ou seja uma variável que o skia vai entender
  const circle = useValue(0);

  const RADIUS = CHECK_SIZE - CHECK_STROKE / 2;
  const CENTER_CIRCLE = RADIUS / 2

  const path = Skia.Path.Make(); // fazendo um desenho
  path.addCircle(CHECK_SIZE, CHECK_SIZE, RADIUS);

  useEffect(() => {
    if (checked) {
      runTiming( // runTimin é um modificador de transição como se fosse o withTiming do reanimated
        percentage, // variável que quer modificar
        1, // valor que vai ser atribuído
        { duration: 700 }); // modificadores

      runTiming( // bolinha no meio
        circle,
        CENTER_CIRCLE,
        { easing: Easing.bounce, duration: 1500 });
    } else {
      runTiming( // runTimin é um modificador de transição como se fosse o withTiming do reanimated
        percentage, // variável que quer modificar
        0, // valor que vai ser atribuído
        { duration: 700 }); // modificadores
    }
  }, [checked])

  return (
    <TouchableOpacity
      style={
        [
          styles.container,
          checked && styles.checked
        ]
      }
      {...rest}
    >
      <Text style={styles.title}>
        {title}
      </Text>

      <Canvas
        style={{ height: CHECK_SIZE * 2, width: CHECK_SIZE * 2 }}
      >
        <Path // esse primeiro Path é como se fosse um placeholder fixo
          path={path}
          color={THEME.COLORS.GREY_500}
          style="stroke" // deixar vazado
          strokeWidth={CHECK_STROKE}
        />

        <Path // aqui ja é parte da animação a cor verde preenchendo o círculo
          path={path}
          color={THEME.COLORS.BRAND_LIGHT}
          style="stroke" // deixar vazado
          strokeWidth={CHECK_STROKE}
          start={0}
          end={percentage}
        >
          <BlurMask
            blur={1}
            style='solid'
          />
        </Path>

        <Circle
          cx={CHECK_SIZE}
          cy={CHECK_SIZE}
          r={circle}
          color={THEME.COLORS.BRAND_LIGHT}
        >
          <BlurMask
            blur={4}
            style='solid'
          />
        </Circle>
      </Canvas>
    </TouchableOpacity>
  );
}