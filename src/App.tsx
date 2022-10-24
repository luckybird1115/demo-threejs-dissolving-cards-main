import './App.css'
import {Canvas, extend, useFrame} from "@react-three/fiber";
import {OrbitControls, shaderMaterial, useTexture} from "@react-three/drei";
import fragment from "./shaders/fragment.glsl?raw";
import vertex from "./shaders/vertex.glsl?raw";
import {Mesh, Vector3, Vector4} from "three";
import {useEffect, useRef, useState} from "react";
import {button, useControls} from "leva";

const ColorMaterial = shaderMaterial(
    {
        uTime: 0,
        uFreq: 5.0,
        uBorder: 0.05,
        uHovered: false,
        uColor: null,
        uTexture: null,
        uNoiseTexture: null,
    },
    vertex,
    fragment
)
extend({ColorMaterial})

function useShaderControls() {
    const {speed, border, color} = useControls({
        color: {
            value: {r: 85, g: 80, b: 67,},
        },
        speed: {
            value: 1.0,
            min: 0.1,
            max: 2.0,
            step: 0.1,
            label: 'speed',
        },
        border: {
            value: 0.15,
            min: 0.01,
            max: 0.40,
            step: 0.05
        }
    })
    return {speed, border, color};
}

interface CardProps {
    texture: string
    position: [number, number, number]
    onDestroyComplete: () => void
}

function Card({texture, position, onDestroyComplete}: CardProps) {
    const ref = useRef<Mesh>(null);
    const {speed, border, color} = useShaderControls();
    const [cardTexture, noiseTexture] = useTexture([`/textures/${texture}`, '/textures/noise.png'])
    const [isHovered, setIsHovered] = useState(false);
    const [isDestroyed, setIsDestroyed] = useState(false);
    const target = new Vector3(...position);
    useEffect(() => {
        document.body.style.cursor = isHovered ? 'pointer' : 'auto'
    }, [isHovered])

    const handleClick = () => {
        // TODO: We should probably make sure that the card can't be clicked again while it's being destroyed
        setIsDestroyed(true)
        setTimeout(() => {
            onDestroyComplete()
            console.log('destroyed complete', texture)
        }, 1000 / speed)
    }

    console.log(position, texture)


    useFrame((state, delta) => {
        if (!ref.current) return

        if (!isDestroyed) {
            ref.current.position.lerp(new Vector3(target.x, target.y, target.z), 0.03)
            return
        }

        // Update shader time
        // @ts-ignore
        ref.current.material.uTime += delta
    })


    return <mesh ref={ref} rotation={[0, 0, 0]} scale={0.5}
                 onPointerEnter={() => setIsHovered(true)}
                 onPointerLeave={() => setIsHovered(false)}
                 onClick={handleClick}
    >
        <planeGeometry attach="geometry" args={[4, 5, 100, 100]}/>
        {/*@ts-ignore                */}
        <colorMaterial key={ColorMaterial.key}
                       uHovered={isHovered}
                       uColor={new Vector4(color.r / 255, color.g / 255, color.b / 255, 1)}
                       uFreq={speed}
                       uBorder={border}
                       uTexture={cardTexture}
                       uNoiseTexture={noiseTexture}
        />
    </mesh>;
}

const initialCards = [
    {texture: '10_small.png'},
    {texture: 'ace_small.png'},
    {texture: 'joker_small.png'},
]

function App() {
    const [cards, setCards] = useState(initialCards);
    useControls({
        reset: button(() => setCards(initialCards)),
    })

    function handleDestroyed(textureId: string) {
        setCards((cards: { texture: string }[]) => {
            return [...cards].filter(card => card.texture !== textureId);
        });
    }

    return (
        <>
            <Canvas>
                <OrbitControls/>

                {cards.map((card, index) => {
                    const x = ((cards.length - 1) / 2 - index) * (2.5)
                    return <Card
                        key={card.texture}
                        texture={card.texture} position={[-x, 0, index * 0.01]}
                        onDestroyComplete={() => handleDestroyed(card.texture)}/>
                })}
            </Canvas>
            <ul className="credits">
                <li>🧛 By <a href="https://twitter.com/Wahlstra">@Wahlstra</a>, using ThreeJS. Source <a href="https://github.com/magnuswahlstrand/demo-threejs-dissolving-cards">here</a></li>
                <li>🃏 Art by <a href="https://opengameart.org/users/minime453">minime453</a> from <a href="https://opengameart.org/content/vintage-playing-cards">OpenGameArt</a></li>
            </ul>
        </>
    )
}

export default App
