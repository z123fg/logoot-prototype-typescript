import React, { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { generateId, prettyPrintId } from "../generateId";
import { compareAtoms, compareIds } from "../Tree";
import { Message } from "../App";
import { prettyPrint } from "prettier-print";
export interface Atom {
    data: string;
    pid: positionDigit[];
    clock: number;
}

export type positionDigit = { position: number; siteId: number };
const BASE = 100;
const head = { data: "head", pid: [{ position: 0, siteId: -Infinity }], clock: 1 };
const tail = { data: "tail", pid: [{ position: BASE, siteId: Infinity }], clock: 1 };

const applyMessage = (model: Atom[], message: Message) => {
    const newModel = [...model];
    if (message.type === "insert") {
        //console.log("tobeinsert", message.atom, newModel);
        //@ts-ignore
        newModel.binaryInsert(message.atom, false, compareAtoms);
        //console.log("afterinsert", newModel);
        //console.log("from siteId insert", model);
        return newModel;
    } else if (message.type === "delete") {
        //@ts-ignore
        let removeIndex = newModel.binarySearch(message.atom, compareAtoms);
        removeIndex = removeIndex < 0 ? -1 : removeIndex;
        //console.log("toberemoved", removeIndex, message.atom, newModel);
        return newModel.filter((item, index) => {
            return index !== removeIndex;
        });
    }
    throw Error("invalid message");
};

const compareMessageClock = (message1: Message, message2: Message) => {
    const clock1 = message1.atom.clock;
    const clock2 = message2.atom.clock;
    if (clock1 > clock2) {
        return 1;
    } else if (clock1 < clock2) {
        return -1;
    } else {
        return 0;
    }
};

const tick = performance.now();

const ControlledInput = ({
    siteId,
    emit,
    messageQueue,
    reportValue,
    popMessage,
}: {
    siteId: number;
    emit: Function;
    messageQueue: Message[];
    reportValue: Function;
    popMessage: Function;
}) => {
    const [model, setModel] = useState<Atom[]>([head, tail]);
    const [value, setValue] = useState<string>("");
    const [curKey, setCurKey] = useState("");
    const [curCaret, setCurCaret] = useState(0);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const prettyPrintRef = useRef<HTMLDivElement>(null);
    const localClock = useRef<number>(0);
    const remoteClock = useRef<{ [siteId: number]: number }>({});
    const scheduledMessages = useRef<{ [siteId: number]: Message[] }>({});
    const messageListForPrint = useRef<Message[]>([]);

    const [trigger, forceUpdate] = useState({});

    useEffect(() => {
        if (messageQueue.length === 0) return;
        popMessage(siteId, (message: Message) => {
            console.log("pop?");
            const messageClock = message.atom.clock;
            const messageSiteId = message.siteId;
            console.log(
                "onReceiveMessage",
                siteId,
                message.atom.clock,
                message.atom.data,
                remoteClock.current[messageSiteId],
                performance.now() - tick
            );

            if (!(messageSiteId in scheduledMessages.current)) {
                scheduledMessages.current[messageSiteId] = [];
            }
            if (remoteClock.current[messageSiteId] === undefined) {
                remoteClock.current[messageSiteId] = 0;
            }
            if (messageClock > remoteClock.current[messageSiteId] + 1) {
                //@ts-ignore
                scheduledMessages.current[messageSiteId].binaryInsert(message, false, compareMessageClock);
                return;
            } else if (messageClock === remoteClock.current[messageSiteId] + 1) {
                remoteClock.current[messageSiteId]++;
            } else {
                console.log("old received");
                return;
            }
            setModel((prev) => {
                let nextModel: Atom[];
                nextModel = applyMessage(prev, message);
                scheduledMessages.current[messageSiteId] = scheduledMessages.current[messageSiteId].filter(
                    (futureMessage) => {
                        if (futureMessage.atom.clock === remoteClock.current[messageSiteId] + 1) {
                            remoteClock.current[messageSiteId]++;
                            nextModel = applyMessage(nextModel, futureMessage);
                            return false;
                        }
                        return true;
                    }
                );
                //nullifyMessage(siteId);
                return nextModel;
            });
        });
    }, [messageQueue]);

    useEffect(() => {}, [model]);

    useEffect(() => {
        setValue(
            model
                .slice(1, model.length - 1)
                .map((atom) => atom.data)
                .join("")
        );
        //@ts-ignore
        //if (message !== null) messageListForPrint.current.binaryInsert(message, false, compareMessageClock);
        /*  prettyPrint(
            prettyPrintRef.current!,
            model.map((atom) => [atom.data, ...atom.pid.map((digit) => Object.values(digit))]),
            scheduledMessages.current,
            remoteClock.current,
            messageListForPrint.current
        ); */
    }, [model, scheduledMessages.current, trigger, messageQueue]);

    useEffect(() => {
        inputRef.current!.selectionStart = curCaret;
        inputRef.current!.selectionEnd = curCaret;
    }, [value, curCaret]);

    useEffect(() => {
        reportValue(siteId, value);
    }, [value]);

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        let caret: number;
        const inputEl = e.target;
        if (curKey === "Backspace") {
            caret = inputEl.selectionStart as number;
            const position = caret + 1;
            setCurCaret(inputEl.selectionStart as number);
            //console.log("backspace", "siteId" + siteId, position, model);
            setModel((prev) => [...prev.slice(0, position), ...prev.slice(position + 1)]);

            localClock.current++;

            const deleteAtom: Atom = { ...model[position], clock: localClock.current };
            console.log("onChange", deleteAtom.clock, deleteAtom.data);
            const message: Message = {
                type: "delete",
                atom: deleteAtom,
                siteId,
            };

            emit(message, siteId);
        } else {
            caret = (inputEl.selectionStart as number) - 1;
            setCurCaret(inputEl.selectionStart as number);
            const position = caret + 1;
            /* let counter = 0;
            console.log("counter1");
            while (counter < 1000000000) {
                counter++;
            }
            console.log("counter2"); */
            setModel((prev) => {
                localClock.current++;

                const newAtom: Atom = {
                    data: curKey,
                    pid: generateId(prev[position - 1].pid, prev[position].pid, siteId),
                    clock: localClock.current,
                };
                //console.log("onChange", newAtom.clock, newAtom.data);
                const message: Message = {
                    type: "insert",
                    atom: newAtom,
                    siteId,
                };
                emit(message, siteId);
                return [...prev.slice(0, position), newAtom, ...prev.slice(position)];
            });
        }
    };
    const handleKeydown = (e: KeyboardEvent) => {
        setCurKey((prev) => e.key);
    };
    return (
        <div className="doc">
            <textarea ref={inputRef} onChange={handleChange} onKeyDown={handleKeydown} value={value}/>
            <span className="inspect" ref={prettyPrintRef}></span>
        </div>
    );
};

export default ControlledInput;
