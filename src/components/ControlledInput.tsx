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
        console.log("tobeinsert", message.atom, newModel);
        //@ts-ignore
        newModel.binaryInsert(message.atom, false, compareAtoms);
        console.log("afterinsert", newModel);
        //console.log("from siteId insert", model);
        return newModel;
    } else if (message.type === "delete") {
        //@ts-ignore
        let removeIndex = newModel.binarySearch(message.atom, compareAtoms);
        removeIndex = removeIndex < 0 ? -1 : removeIndex;
        console.log("toberemoved", removeIndex, message.atom, newModel);
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

const ControlledInput = ({
    siteId,
    emit,
    message,
    nullifyMessage,
    reportValue
}: {
    siteId: number;
    emit: Function;
    message: Message | null;
    nullifyMessage: Function;
    reportValue:Function
}) => {
    const [model, setModel] = useState<Atom[]>([head, tail]);
    const [value, setValue] = useState<string>("");
    const [curKey, setCurKey] = useState("");
    const [curCaret, setCurCaret] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const prettyPrintRef = useRef<HTMLDivElement>(null);
    const lamportClock = useRef<number>(0);
    const messageCache = useRef<Message[]>([]);

    useEffect(() => {
        if (message !== null) {
            let newModel = [...model];
            const curClock = message.atom.clock;
            if (curClock - lamportClock.current > 1) {
                console.log(
                    "cache",
                    "siteId"+
                    siteId,
                    "type:",
                    message.type,
                    "data:",
                    message.atom.data,
                    "atomclock:",
                    message.atom.clock,
                    "clock:",
                    lamportClock.current
                );
                //@ts-ignore
                messageCache.current.binaryInsert(message, true, compareMessageClock);
            } else {
                console.log(
                    "non cache",
                    "siteId"+
                    siteId,
                    "type:",
                    message.type,
                    "data:",
                    message.atom.data,
                    "atomclock:",
                    message.atom.clock,
                    "clock:",
                    lamportClock.current
                );
                lamportClock.current = Math.max(lamportClock.current, curClock);
                newModel = applyMessage(newModel, message);
                messageCache.current = messageCache.current.filter((curMessage) => {
                    if (curMessage.atom.clock - lamportClock.current <= 1) {
                        console.log(
                            "popCache",
                            siteId,
                            "type:",
                            curMessage.type,
                            "data:",
                            curMessage.atom.data,
                            "atomclock:",
                            curMessage.atom.clock,
                            "clock:",
                            lamportClock.current
                        );
                        newModel = applyMessage(newModel, curMessage);
                        lamportClock.current = Math.max(lamportClock.current, curMessage.atom.clock);
                        return false;
                    }
                    return true;
                });

                setModel(newModel);
            }

            nullifyMessage(siteId);
        }
    }, [message, model]);

    useEffect(() => {
        setValue(
            model
                .slice(1, model.length - 1)
                .map((atom) => atom.data)
                .join("")
        );
        prettyPrint(
            prettyPrintRef.current!,
            model.map((atom) => [atom.data, ...atom.pid.map((digit) => Object.values(digit))]),
            messageCache
        );
    }, [model, messageCache.current]);

    useEffect(() => {
        inputRef.current!.selectionStart = curCaret;
        inputRef.current!.selectionEnd = curCaret;
    }, [value, curCaret]);

    useEffect(()=>{
        reportValue(siteId, value)
    },[value])

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        let caret: number;
        const inputEl = e.target;
        if (curKey === "Backspace") {
            caret = inputEl.selectionStart as number;
            const position = caret + 1;
            setCurCaret(inputEl.selectionStart as number);
            console.log("backspace", "siteId"+siteId, position, model)
            setModel((prev) => [...prev.slice(0, position), ...prev.slice(position + 1)]);
            lamportClock.current++;
            const deleteAtom = { ...model[position], clock: lamportClock.current };
            const message = {
                type: "delete",
                atom: deleteAtom,
            };
            emit(message, siteId);
        } else {
            caret = (inputEl.selectionStart as number) - 1;
            setCurCaret(inputEl.selectionStart as number);
            const position = caret + 1;
            lamportClock.current++;
            const newAtom = {
                data: curKey,
                pid: generateId(model[position - 1].pid, model[position].pid, siteId),
                clock: lamportClock.current,
            };
            const message = {
                type: "insert",
                atom: newAtom,
            };
            emit(message, siteId);

            setModel((prev) => [...prev.slice(0, position), newAtom, ...prev.slice(position)]);
        }
    };
    const handleKeydown = (e: KeyboardEvent) => {
        setCurKey((prev) => e.key);
    };
    return (
        <div className="doc">
            <input ref={inputRef} onChange={handleChange} onKeyDown={handleKeydown} value={value} />
            <span className="inspect" ref={prettyPrintRef}></span>
        </div>
    );
};

export default ControlledInput;
