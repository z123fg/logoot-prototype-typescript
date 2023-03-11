import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { generateId } from "./generateId";
import ControlledInput, { Atom } from "./components/ControlledInput";
import { init } from "./Tree";
//const output = generateId([{position:1, siteId:1}], [{position:1, siteId:1},{position:3, siteId:4}],6);
const siteIds = [1, 2];
 export interface Message {
  type:"insert" | "delete",
  atom: Atom;
}
interface MessageBox  {
  [siteId: number]:Message|null
}

function App() {
    const [messageBox, setMessageBox] = useState<MessageBox>(Object.fromEntries(siteIds.map(siteId=>[siteId, null])));

    const emit = (newMessage: Message, siteId:number) => {
      console.log("newMessage", newMessage)
      const curSiteId = siteId
      const entries =  Object.entries(messageBox).map(([siteId, message])=>{
        if(+siteId !== curSiteId){
          return [siteId, {...newMessage}]
        }
        return [siteId, message]
      });
      setMessageBox(Object.fromEntries(entries));
    }

    const nullifyMessage = (siteId: number) => {
      setMessageBox(prev=>({...prev, [siteId]: null}))
    }
    return (
        <div className="App">
            {siteIds.map((siteId) => (
                <ControlledInput key={siteId} siteId={siteId} message={messageBox[siteId]} emit={emit} nullifyMessage={nullifyMessage}/>
            ))}
        </div>
    );
}

export default App;
