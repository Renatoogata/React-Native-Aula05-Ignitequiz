import { useEffect } from "react";
import Animated, {
    Easing,
    useSharedValue,
    withSequence, // definir uma sequencia de animação
    withTiming, // criar uma animação linear
    useAnimatedStyle
}
    from "react-native-reanimated";
import { useWindowDimensions } from "react-native";
import { Canvas, Rect, BlurMask } from '@shopify/react-native-skia'
import { THEME } from "../../styles/theme";

const STATUS = ['transparent', THEME.COLORS.BRAND_LIGHT, THEME.COLORS.DANGER_LIGHT];

type Props = {
    status: number;
}

export function OverlayFeedaback({ status = 0 }: Props) {
    const opacity = useSharedValue(0);

    const color = STATUS[status]
    const { height, width } = useWindowDimensions() // hook para pegar informações de dimensão da tela

    const styleAnimated = useAnimatedStyle(() => {
        return {
            opacity: opacity.value
        }
    })

    useEffect(() => {
        opacity.value = withSequence(
            withTiming(1, { duration: 400, easing: Easing.bounce }), // primeira animação
            withTiming(0), // segunda animação
        )
    }, [status])
    return (
        <Animated.View style={[{ height, width, position: 'absolute' }, styleAnimated]}>
            <Canvas style={{ flex: 1 }}>
                <Rect
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                    color={color}
                >
                    <BlurMask
                        blur={50}
                        style="inner"
                    />
                </Rect>
            </Canvas>
        </Animated.View>
    )
}