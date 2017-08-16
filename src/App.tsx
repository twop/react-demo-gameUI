import * as React from 'react';
import { Motion, spring } from 'react-motion';

function repeat<T>(times: number, func: (i: number) => T): T[] {
    const arr: T[] = [];

    for (var i = 0; i < times; i++) {
        arr.push(func(i));
    }

    return arr;
}

const ballColor = () => [Math.random(), Math.random(), Math.random()];

const createBall = (id: number) => (
    <ball
        key={id}
        x={Math.random()}
        y={Math.random()}
        radius={Math.random() * 0.2 + 0.05}
        color={ballColor()}
    />
);

const motionColor = ballColor();

export const DemoComponent = () => (
    <group>
        {repeat(4, createBall)}
        <group>
            {repeat(3, createBall)}
            <Motion defaultStyle={{ x: 0 }} style={{ x: spring(1) }}>
                {motion => (
                    <ball
                        x={motion.x}
                        y={0}
                        radius={0.15}
                        color={motionColor}
                    />)}
            </Motion> 
        </group>
    </group>
);
