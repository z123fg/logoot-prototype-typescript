import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { generateId } from "./generateId";
import ControlledInput, { Atom } from "./components/ControlledInput";
import { init } from "./Tree";
//const output = generateId([{position:1, siteId:1}], [{position:1, siteId:1},{position:3, siteId:4}],6);
const siteIds = [1, 2];
export interface Message {
    type: "insert" | "delete";
    atom: Atom;
    siteId: number;
}
interface MessageBox {
    [siteId: number]: Message[];
}

function App() {
    const [messageBox, setMessageBox] = useState<MessageBox>(
        Object.fromEntries(siteIds.map((siteId) => [siteId, []]))
    );

    const [values, setValues] = useState<{ [siteId: number]: string }>(
        Object.fromEntries(siteIds.map((siteId) => [siteId, ""]))
    );
    const [areSame, setAreSame] = useState<boolean>(true);

    useEffect(() => {
        setAreSame(
            Object.values(values).filter((value, index, array) => value === array[0]).length ===
                siteIds.length
        );
    }, [values]);

    const reportValue = (siteId: number, value: string) => {
        setValues((prev) => ({
            ...prev,
            [siteId]: value,
        }));
    };

    const emit = (newMessage: Message, siteId: number) => {
        console.log("emit", siteId, newMessage.atom.clock, newMessage.atom.data);

        setTimeout(() => {
            const curSiteId = siteId;

            setMessageBox((prev) => {
                const entries = Object.entries(prev).map(([siteId, curMessageQueue]) => {
                    if (+siteId !== curSiteId) {
                        return [siteId, [ newMessage, ...curMessageQueue ]];
                    }
                    return [siteId, curMessageQueue];
                });
                const nextMessageBox = Object.fromEntries(entries);
                //console.log("innerEmit", siteId, newMessage.atom.clock, newMessage.atom.data, nextMessageBox);
                return nextMessageBox;
            });
        }, Math.random() * 2200);
    };

    /* const nullifyMessage = (siteId: number) => {
        setMessageBox((prev) => ({ ...prev, [siteId]: null }));
    }; */
    const popMessage = (siteId: number, cb: Function) => {
        setMessageBox((prev) => {
            const nextMessageBox = { ...prev };
            const recur = () => {
                const curMessage = nextMessageBox[siteId][nextMessageBox[siteId].length - 1];
                console.log("pop1",nextMessageBox[siteId])
                nextMessageBox[siteId] = nextMessageBox[siteId].slice(0, nextMessageBox[siteId].length - 1);
                cb(curMessage);
                if(nextMessageBox[siteId].length > 0){
                    recur()
                }
            };
            recur();

            return nextMessageBox;
        });
    };
    return (
        <div style={{ textAlign: "center" }}>
            <h2>{areSame ? "SAME" : "DIFFERENT"}</h2>
            <div className="app">
                {siteIds.map((siteId) => (
                    <ControlledInput
                        key={siteId}
                        siteId={siteId}
                        messageQueue={messageBox[siteId]}
                        emit={emit}
                        //nullifyMessage={nullifyMessage}
                        popMessage={popMessage}
                        reportValue={reportValue}
                    />
                ))}
            </div>
        </div>
    );
}

export default App;
