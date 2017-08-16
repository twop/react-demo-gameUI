import { formatInstance, formatProps, log } from './BallsCrud';
export type Container = { rootID: string, children: Array<Instance> };
// tslint:disable-next-line:no-any
export type Props = { prop: Object, hidden?: boolean, children?: any[] };
export type Instance = {
    type: string,
    id: number,
    children: Array<Instance>,
    prop: Object,
};

export interface CRUDRenderer {
    addChild(
        parentInstance: Instance | Container,
        child: Instance): void;
    remove(
        parentInstance: Instance | Container,
        child: Instance): void;
    update(
        instance: Instance,
        type: string,
        oldProps: Props,
        newProps: Props): void;
}

const emptyObject = {};
let instanceCounter = 0;
const UPDATE_SIGNAL = {};
const TIME_REMAINING = 10;

function shallowEqualObjects(objA: Object, objB: Object): boolean {
    if (objA === objB) {
        return true;
    }

    var aKeys = Object.keys(objA);
    var bKeys = Object.keys(objB);
    var len = aKeys.length;

    if (bKeys.length !== len) {
        return false;
    }

    for (var i = 0; i < len; i++) {
        var key = aKeys[i];

        if (objA[key] !== objB[key]) {
            return false;
        }
    }

    return true;
}

export function createHost({ addChild, update, remove }: CRUDRenderer): Object {
    function appendChild(
        parentInstance: Instance | Container,
        child: Instance,
    ): void {
        log(`append child ${formatInstance('', child)} `, parentInstance);
        const index = parentInstance.children.indexOf(child);
        if (index !== -1) {
            parentInstance.children.splice(index, 1);
        }
        parentInstance.children.push(child);

        addChild(parentInstance, child);
    }

    function insertBefore(
        parentInstance: Instance | Container,
        child: Instance,
        beforeChild: Instance,
    ): void {
        log(`insert before child=${formatInstance('', child)} `, parentInstance);
        const index = parentInstance.children.indexOf(child);
        if (index !== -1) {
            parentInstance.children.splice(index, 1);
        }
        const beforeIndex = parentInstance.children.indexOf(beforeChild);
        parentInstance.children.splice(beforeIndex, 0, child);
    }

    function removeChild(
        parentInstance: Instance | Container,
        child: Instance,
    ): void {
        log(`removeChild ${formatInstance('', child)} from`, parentInstance);
        const index = parentInstance.children.indexOf(child);
        parentInstance.children.splice(index, 1);
        remove(parentInstance, child);
    }

    const hostConfig = {
        getRootHostContext: () => emptyObject,

        getChildHostContext: () => emptyObject,

        getPublicInstance: (instance: Instance) => instance,

        createInstance: (type: string, props: Props): Instance => {
            log(`createInstance ${type} ${formatProps(props)}`);
            return {
                id: instanceCounter++,
                type: type,
                children: [],
                prop: props,
            };
        },

        appendInitialChild(
            parentInstance: Instance,
            child: Instance,
        ): void {
            log(`appendInitialChild child=${formatInstance('', child)} parent=${parentInstance.type}`);
            parentInstance.children.push(child);
            addChild(parentInstance, child);
        },

        finalizeInitialChildren(
            domElement: Instance,
            type: string,
            props: Props,
        ): boolean {
            return false;
        },

        prepareUpdate(
            instance: Instance,
            type: string,
            oldProps: Props,
            newProps: Props,
        ): null | {} {
            return shallowEqualObjects(oldProps, newProps) ? null : UPDATE_SIGNAL;
        },

        commitMount(instance: Instance, type: string, newProps: Props): void {
            // Noop
        },

        commitUpdate(
            instance: Instance,
            updatePayload: Object,
            type: string,
            oldProps: Props,
            newProps: Props,
        ): void {
            log('commitUpdate',
                'instance',
                instance,
                'type',
                type,
                'oldProps',
                oldProps,
                'newProps',
                newProps);

            instance.prop = newProps;
            update(instance, type, oldProps, newProps);
        },

        shouldSetTextContent: (type: string, props: Props): boolean => false,

        // tslint:disable-next-line:no-empty
        resetTextContent(instance: Instance): void { },

        shouldDeprioritizeSubtree(type: string, props: Props): boolean {
            return !!props.hidden;
        },

        createTextInstance(
            text: string,
            rootContainerInstance: Container,
            hostContext: Object,
            internalInstanceHandle: Object,
        ): Object {
            return { text: text, id: instanceCounter++ };
        },

        commitTextUpdate(
            textInstance: Object,
            oldText: string,
            newText: string,
        ): void {
            // textInstance.text = newText;
        },

        appendChild: appendChild,
        appendChildToContainer: appendChild,
        insertBefore: insertBefore,
        insertInContainerBefore: insertBefore,
        removeChild: removeChild,
        removeChildFromContainer: removeChild,

        // tslint:disable-next-line:no-empty
        prepareForCommit(): void { },

        // tslint:disable-next-line:no-empty
        resetAfterCommit(): void { },

        scheduleAnimationCallback: (callback: FrameRequestCallback) => {
            log('requested animation callback ' + callback.toString());
            requestAnimationFrame(callback);
        },

        scheduleDeferredCallback: (fn: Function) => {
            log('requested callback');
            setTimeout(
            () => {
                log('deferredCallback ' + fn.toString());
                fn({ timeRemaining: () => TIME_REMAINING });
            },
            TIME_REMAINING);
        },
    };

    return hostConfig;
}
