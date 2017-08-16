import { ReactNode } from 'react';

export interface WRootProps extends React.Attributes {
    parentProp: string;
}

export interface WChildProps extends React.Attributes {
    text: string;
    x: number;
}

export interface BallProps extends React.Attributes {
    radius: number;
    color: number[];
    x: number;
    y: number;
}

export interface GroupProps extends React.Attributes {
    children?: ReactNode;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            wroot: WRootProps;
            wchild: WChildProps;
            ball: BallProps;
            group: GroupProps;
        }
    }
}
