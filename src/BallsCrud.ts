import { BallProps, GroupProps } from './react-types';
import { CRUDRenderer, Instance } from './CrudHost';

declare class Polygon {
    constructor(points: Point[]);
    setColor(red: number, green: number, blue: number): void;
}

declare class Point {
    constructor(
        x: number,
        y: number,
        z: number)
}

type Position = {
    x: number,
    y: number,
};

declare type Canvas = {
    addShape(shape: Polygon): void;
    removeShape(shape: Polygon): void;
    render(): void;
    setMouseClickCallback(callback: (pos: Position) => void): void
};

declare var canvas: Canvas;

const delta = 0.1;

const shapes = new Map<number, Polygon>();

export function createCircle(props: BallProps): Polygon {
    const { x, y, radius, color } = props;
    const points = new Array<Point>();
    for (let theta = 0; theta < 2 * Math.PI; theta += delta) {
        points.push(new Point(x + radius * Math.cos(theta), y + radius * Math.sin(theta), 0));
    }
    let circle = new Polygon(points);
    
    const [red, green, blue] = color;
    circle.setColor(red, green, blue);
    return circle;
}

const ifCanvasDefined: boolean = global.hasOwnProperty('canvas');
const addToCanvas = (shape: Polygon): void => canvas.addShape(shape);
const removeFromCanvas = (shape: Polygon): void => canvas.removeShape(shape);
export const renderCanvas = () => {
    if (ifCanvasDefined) {
        canvas.render();
    }
};

// tslint:disable-next-line:no-any
// tslint:disable-next-line:no-console
export const log = (...args: {}[]) => console.log(...args);
// tslint:disable-next-line:no-any
function formatValue(val: any): string {
    if (typeof val === 'number') {
        return val.toFixed(3);
    }

    if (Array.isArray(val)) {
        // tslint:disable-next-line:no-any
        return `[ ${val.reduce((str: string, el: any) => str + formatValue(el) + ' ', '')}]`;
    }

    return val;
}

// tslint:disable-next-line:no-any
const formatProperty = (key: string, val: any): string => `${key}:${formatValue(val)}`;

export const formatProps = (props: Object) => Object.keys(props)
    .filter((key) => key !== 'children')
    .map(key => [key, props[key]])
    .reduce((str, [key, val]) => str + formatProperty(key, val) + ' ', ' - { ') + '}';

export const formatInstance = (indent: string, child: Instance): string => (
    `${indent}-  ${child.type}#${child.id} ${formatProps(child.prop || {})}`);

function check<T>(val: T | null | undefined): T {
    if (val) { return val; }

    log(' obj is null');
    throw Error('null object');
}

function error(err: string): never {
    log(' Exception:' + err);
    throw new Error(err);
}

function addBall(id: number, props: BallProps): void {
    log(`addBall id:${id} ${formatProps(props) || {}}`);

    if (!ifCanvasDefined) { return; }

    const shape = createCircle(props);
    shapes.set(id, shape);
    addToCanvas(shape);
}

function removeBall(id: number): void {
    log('remove ball:' + id);

    if (!ifCanvasDefined) { return; }

    const shape = check(shapes.get(id));
    removeFromCanvas(shape);
    shapes.delete(id);
}

function addChild(
    child: Instance): void {
    log(`add instance ${formatInstance('', child)}`);
    switch (child.type) {
        case 'ball': addBall(child.id, <BallProps> child.prop); break;
        case 'group': check(child.children).forEach(el => addChild(el)); break;
        default: error('unsupported type ' + child.type);
    }
}

function update(
    instance: Instance,
    type: string,
    oldProps: Object,
    newProps: Object): void {
    log('udpdate ', type);
    switch (type) {
        case 'ball': {
            removeBall(instance.id);
            addBall(instance.id, <BallProps> newProps); break;
        }
        case 'group': { 
            remove(instance);
            const children = <Instance[]> check((<GroupProps> newProps).children);
            addChild({...instance, children});
            break;
        }

        default: error('unsupported update type ' + type);
    }
}

function remove(child: Instance): void {
        log(`remove instance ${formatInstance('', child)}`);
        switch (child.type) {
            case 'ball': removeBall(child.id); break;
            case 'group': check(child.children).forEach(el => remove(el)); break;
            default: error('unsupported type ' + child.type);
        }
    }

export const ballsCrud: CRUDRenderer = {
    addChild: (parent, child) => addChild(child),
    update,
    remove: (parent, child) => remove(child),
};

// create a dropping ball where the mouse clicks on the canvas

// canvas.setMouseClickCallback((pos) => {
//     // tslint:disable-next-line:no-console
//     console.log(`on click x:${pos.x}, y:${pos.y}`);
//     const props: BallProps = {
//         x: pos.x,
//         y: pos.y,
//         color: [Math.random(), Math.random(), Math.random()],
//         radius: 0.1
//     };

//     addToCanvas(createCircle(props));
// });

// class Ball {
    //     constructor(center, radius, color) {
        //         this.center = center;
        //         this.radius = radius;
        //         this.color = color;
        //         this.velocity = 0;
        //         this.timestamp = Date.now();
        //         this.circle = this.createCircle(this.center, this.radius, this.color);      // the ball
        //         canvas.addShape(this.circle);
        //     }
        
        // create a circle - a polygon with a lot of vertices in OpenGL
        
        // // update the circle's current position and velocity
        // update() {
            //     // update only if the ball has not stopped on the ground
            //     if ((Math.abs(this.center.y - this.radius - groundLevel) > epislon) ||
            // (Math.abs(this.velocity > epislon))) {
                //         // remove the old circle
                //         canvas.removeShape(this.circle);
                //         // approximate the circle's current position and velocity at this time
                //         let newTimestamp = Date.now();
                //         let timeElapsed = newTimestamp - this.timestamp;
                //         this.velocity += timeElapsed / 1000 * acceleration;
                //         this.center.y += this.velocity * timeElapsed;
                //         // handle collision with ground
    //         if (this.center.y < this.radius + groundLevel) {
    //             this.center.y = this.radius + groundLevel;
    //             this.velocity = -this.velocity * (1 - collisionVelocityLose);
    //             this.color = [Math.random(), Math.random(), Math.random()];
    //         }
    //         this.circle = this.createCircle(this.center, this.radius, this.color);
    //         // add the new circle
    //         canvas.addShape(this.circle);
    //         this.timestamp = newTimestamp;
    //     }
    // }
// }

// let balls = [];

// create a dropping ball where the mouse clicks on the canvas
// canvas.setMouseClickCallback((pos) => {
//     let center = pos;
//     center.z = 0.0;
//     balls.push(new Ball(center, ballRadius, ballColor));
// });

// draw a frame of all balls
// function mainloop() {
//     for (let ball of balls) {
//         ball.update();
//     }
//     canvas.render();
// }

// setInterval(mainloop, 0);