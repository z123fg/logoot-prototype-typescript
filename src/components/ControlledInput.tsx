import React, { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { generateId, prettyPrintId } from "../generateId";
import { compareAtoms, compareIds } from "../Tree";
import { Message } from "../App";
export interface Atom {
    data: string;
    pid: positionDigit[];
    clock: number;
}
const siteId = 1;

export type positionDigit = { position: number; siteId: number };
const BASE = 100;
const head = { data: "head", pid: [{ position: 0, siteId: -Infinity }], clock: 1 };
const tail = { data: "tail", pid: [{ position: BASE, siteId: Infinity }], clock: 1 };

const ControlledInput = ({
    siteId,
    emit,
    message,
    nullifyMessage
}: {
    siteId: number;
    emit: Function;
    message: Message | null;
    nullifyMessage:Function
}) => {
    const [model, setModel] = useState<Atom[]>([head, tail]);
    const [value, setValue] = useState<string>("");
    const [curKey, setCurKey] = useState("");
    const [curCaret, setCurCaret] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const newModel = [...model];
        if (message !== null) {
            if (message.type === "insert") {
                //@ts-ignore
                newModel.binaryInsert(message.atom, false, compareAtoms);
                console.log("from siteId insert", model);
                setModel(newModel);
            } else if (message.type === "delete") {
                console.log("from siteId delete", siteId, message, newModel);
                //@ts-ignore
                const removeIndex = newModel.binarySearch(message.atom, compareAtoms);

                setModel(
                    newModel.filter((item, index) => {
                        return index !== removeIndex;
                    })
                );
            }
            nullifyMessage(siteId)
        }
    }, [message, model]);

    useEffect(() => {
        setValue(
            model
                .slice(1, model.length - 1)
                .map((atom) => atom.data)
                .join("")
        );
    }, [model]);

    useEffect(() => {
        inputRef.current!.selectionStart = curCaret;
        inputRef.current!.selectionEnd = curCaret;
    }, [value, curCaret]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        let caret: number;
        const inputEl = e.target;
        if (curKey === "Backspace") {
            caret = inputEl.selectionStart as number;
            const position = caret + 1;
            setCurCaret(inputEl.selectionStart as number);
            setModel((prev) => [...prev.slice(0, position), ...prev.slice(position + 1)]);
            const message = {
                type: "delete",
                atom: model[position],
            };
            emit(message, siteId);
        } else {
            caret = (inputEl.selectionStart as number) - 1;
            setCurCaret(inputEl.selectionStart as number);
            const position = caret + 1;
            const newAtom = {
                data: curKey,
                pid: generateId(model[position - 1].pid, model[position].pid, siteId),
                clock: 1,
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
        setCurKey(prev=>e.key);
    };
    return (
        <div>
            <input ref={inputRef} onChange={handleChange} onKeyDown={handleKeydown} value={value} />
        </div>
    );
};

export default ControlledInput;
