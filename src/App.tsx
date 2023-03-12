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
}
interface MessageBox {
    [siteId: number]: Message | null;
}

function App() {
    const [messageBox, setMessageBox] = useState<MessageBox>(
        Object.fromEntries(siteIds.map((siteId) => [siteId, null]))
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
        const curSiteId = siteId;
        const entries = Object.entries(messageBox).map(([siteId, message]) => {
            if (+siteId !== curSiteId) {
                return [siteId, { ...newMessage }];
            }
            return [siteId, message];
        });
        setTimeout(() => {
            setMessageBox(Object.fromEntries(entries));
        }, Math.random() * 6000);
    };

    const nullifyMessage = (siteId: number) => {
        setMessageBox((prev) => ({ ...prev, [siteId]: null }));
    };
    return (
        <div style={{textAlign:"center"}}>
            <h2>{areSame ? "SAME" : "DIFFERENT"}</h2>
            <div className="app">
                {siteIds.map((siteId) => (
                    <ControlledInput
                        key={siteId}
                        siteId={siteId}
                        message={messageBox[siteId]}
                        emit={emit}
                        nullifyMessage={nullifyMessage}
                        reportValue={reportValue}
                    />
                ))}
            </div>
        </div>
    );
}

export default App;
