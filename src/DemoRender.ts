import { ballsCrud, formatInstance, log } from './BallsCrud';
import * as React from 'react';
import { Container, createHost, Instance } from './CrudHost';

const ReactFiberReconciler = require('react-dom/lib/ReactFiberReconciler');

// tslint:disable-next-line:no-console
// console.log(ballsCrud);
var DemoRenderer = ReactFiberReconciler(createHost(ballsCrud));
// var DemoRenderer = ReactFiberReconciler(createHost(emptyCrud));

var rootContainers = new Map();
var roots = new Map();
var DEFAULT_ROOT_ID = '<default>';
const defaultContainer = {};

function logContainer(logF: (s: string) => void, container: Container, depth: number) {
    logF('  '.repeat(depth) + '- [root#' + container.rootID + ']');
    logHostInstances(logF, container.children, depth + 1);
}

function logHostInstances(logF: (s: string) => void, children: Array<Instance>, depth: number) {
    for (var i = 0; i < children.length; i++) {
        // tslint:disable-next-line:no-any
        var child: any = children[i];
        var indent = '  '.repeat(depth);
        if (typeof child.text === 'string') {
            logF(indent + '- ' + child.text);
        } else {
            logF(formatInstance(indent, child));
            logHostInstances(logF, child.children, depth + 1);
        }
    }
}

export const DemoRender = {
    render(
        element: React.ReactElement<{}>,
        callback: Function | null,
        rootID: string = DEFAULT_ROOT_ID,
    ) {
        // tslint:disable-next-line:no-console
        log('render');
        let root = roots.get(rootID);
        if (!root) {
            log('creating root');
            const container = { rootID, children: [] };
            rootContainers.set(rootID, container);
            root = DemoRenderer.createContainer(container);
            roots.set(rootID, root);
        }

        log('update start');
        DemoRenderer.updateContainer(element, root, null, callback);
        log('update end');
    },

    unmountComponentAtNode(container: {}) {
        const containerKey = typeof container === 'undefined' ? defaultContainer : container;
        const root = roots.get(containerKey);
        if (root) {
            DemoRenderer.updateContainer(null, root, null, () => {
                roots.delete(container);
            });
        }
    },

    renderTreeToString(rootID: string = DEFAULT_ROOT_ID): string[] {
        const root = roots.get(rootID);
        const rootContainer = rootContainers.get(rootID);
        if (!root || !rootContainer) {
            return [];
        }

        // tslint:disable-next-line:no-any
        let bufferedLog: string[] = [];
        // tslint:disable-next-line:typedef

        // tslint:disable-next-line:no-any
        function logToBuffer(text: string) {
            bufferedLog.push(text, '\n');
        }

        logToBuffer('TREE');
        logContainer(logToBuffer, rootContainer, 0);

        return bufferedLog;
    },

    // Logs the current state of the tree.
    dumpTree(rootID: string = DEFAULT_ROOT_ID): string[] {
        const root = roots.get(rootID);
        const rootContainer = rootContainers.get(rootID);
        if (!root || !rootContainer) {
            // tslint:disable-next-line:no-console
            console.log('Nothing rendered yet.');
            return [];
        }

        // tslint:disable-next-line:no-any
        let bufferedLog: any[] = [];
        // tslint:disable-next-line:typedef

        // tslint:disable-next-line:no-any
        function log(...args: any[]) {
            bufferedLog.push(...args, '\n');
        }

        function logHostInstances(children: Array<Instance>, depth: number) {
            for (var i = 0; i < children.length; i++) {
                // tslint:disable-next-line:no-any
                var child: any = children[i];
                var indent = '  '.repeat(depth);
                if (typeof child.text === 'string') {
                    log(indent + '- ' + child.text);
                } else {
                    log(formatInstance(indent, child));
                    logHostInstances(child.children, depth + 1);
                }
            }
        }
        function logContainer(container: Container, depth: number) {
            log('  '.repeat(depth) + '- [root#' + container.rootID + ']');
            logHostInstances(container.children, depth + 1);
        }

        // tslint:disable-next-line:no-any
        function logUpdateQueue(updateQueue: any, depth: number) {
            log('  '.repeat(depth + 1) + 'QUEUED UPDATES');
            const firstUpdate = updateQueue.first;
            if (!firstUpdate) {
                return;
            }

            log(
                '  '.repeat(depth + 1) + '~',
                firstUpdate && firstUpdate.partialState,
                firstUpdate.callback ? 'with callback' : '',
                '[' + firstUpdate.priorityLevel + ']',
            );
            var next;
            while ((next = firstUpdate.next)) {
                log(
                    '  '.repeat(depth + 1) + '~',
                    next.partialState,
                    next.callback ? 'with callback' : '',
                    '[' + firstUpdate.priorityLevel + ']',
                );
            }
        }

        // tslint:disable-next-line:no-any
        function logFiber(fiber: any, depth: number) {
            log(
                '  '.repeat(depth) +
                '- ' +
                (fiber.type ? fiber.type.name || fiber.type : '[root]'),
                '[' + fiber.pendingWorkPriority + (fiber.pendingProps ? '*' : '') + ']',
            );
            if (fiber.updateQueue) {
                logUpdateQueue(fiber.updateQueue, depth);
            }

            if (fiber.child) {
                logFiber(fiber.child, depth + 1);
            }
            if (fiber.sibling) {
                logFiber(fiber.sibling, depth);
            }
        }

        log('HOST INSTANCES:');
        logContainer(rootContainer, 0);
        log('FIBERS:');
        logFiber(root.current, 0);

        // tslint:disable-next-line:no-console
        console.log(...bufferedLog);

        return bufferedLog;
    },
};