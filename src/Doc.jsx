
import "./App.css";
import React from "react"
import { useEffect, useRef, useState } from "react";
import prettyPrint from "./prettyPrint";
import {
    Tree,
    allocateId,
    MessageQ,
} from "./Tree1";
/* document.querySelector("body").innerHTML =
    document.querySelector("body").innerHTML + "<div id='inspect'></div>"; */
//const tree = new Tree();

/* const tree1 = getTreeForTesting(); */
/* traverse(tree1, [3, 7, 8], [8, 1], (node, id) => {
    if (node !== undefined) console.log(node.data, id);
}); */
//allocateId(tree1,[3, 7, 8], [8, 1])
/* prettyPrint(tree1); */

//console.log("getNodeWithId",tree.getNodeWithId([]))

function Doc({ siteId, message, emit }) {
    const [doc, setDoc] = useState([
        ["$", [[0, -1]], 0],
        ["#", [[10, Infinity]], 1],
    ]);

    const [messageBuffer, setMessageBuffer] = useState([]);


    const { current: tree } = useRef(new Tree());

    const inspectEl = useRef();
  

    const {
        current: { clock, messageQ, receive },
    } = useRef(MessageQ(siteId));

    useEffect(() => {
        prettyPrint(inspectEl.current, tree, doc);
    }, [doc]);

    useEffect(() => {
        setMessageBuffer(prev=>[...prev, message]);
        console.log("message", siteId)
    }, [message])

    useEffect(() => {
        if (messageBuffer.length > 0) {
           let nextDoc = [...doc]
            messageBuffer.forEach(message=>{
               nextDoc = receive(message,nextDoc, tree);
            })
            setDoc(nextDoc)
            setMessageBuffer([])
        }
    }, [messageBuffer, doc, tree]);

    /*  useEffect(() => {
        //console.log(siteId, message);
        console.log("messageQ", messageQ, clock.current);
        if (messageQ.length > 0) {
            const curMessage = messageQ[0];
            const remoteSiteId = curMessage.atom[1][curMessage.atom[1].length - 1][1];
            const remoteClock = curMessage.atom[2];
            if (remoteClock > clock.current[remoteSiteId] + 1) {
                console.log("wrong order")
                setMessageQ((prev) => [...prev.slice(1), prev[0]]);
                return;
            } else {
                
                setMessageQ((prev) => prev.slice(1));
                if (curMessage?.atom?.length > 0) {
                    if (curMessage.action === "insert") {
                        console.log("insertAtom", siteId, curMessage.atom, doc);
                        const nextDoc = insertRemoteAtom(doc, curMessage.atom, tree);
                        setDoc(nextDoc);
                    } else if (curMessage.action === "delete") {
                        const nextDoc = deleteRemoteAtom(curMessage.atom[1], doc);
                        setDoc(nextDoc);
                    }
                }
            }
        }
    }, [messageQ, doc]); */
    //console.log("clock", siteId, clock, messageQ);
    const handleChange = (e) => {
        const caret = e.target.selectionEnd;
        if (e.nativeEvent.inputType === "deleteContentBackward") {
            e.target.selectionStart = caret;
            e.target.selectionEnd = caret;
            const targetAtom = doc[caret + 1];
            setDoc((prev) => {
                return [
                    prev[0],
                    ...prev.slice(1, doc.length - 1).slice(0, caret),
                    ...prev.slice(1, doc.length - 1).slice(caret + 1, prev.length - 2),
                    prev[prev.length - 1],
                ];
            });
            console.log("deleteAtom", targetAtom);

            emit(siteId, { action: "delete", atom: [...targetAtom.slice(0, 2), ++clock[siteId]] });
        } else {
            const prevId = doc[caret - 1][1];
            const nextId = doc[caret][1];
            //console.log("prevNext", prevId, nextId);
            const targetId = allocateId(tree, prevId, nextId, e.nativeEvent.data);
            setDoc((prev) => {
                return [
                    prev[0],
                    ...prev.slice(1, doc.length - 1).slice(0, caret - 1),
                    [e.nativeEvent.data, targetId.map((id) => [id, siteId])],
                    ...prev.slice(1, doc.length - 1).slice(caret - 1, prev.length - 2),
                    prev[prev.length - 1],
                ];
            });
            
            console.log("insert", siteId)

            emit(siteId, {
                action: "insert",
                atom: [e.nativeEvent.data, targetId.map((id) => [id, siteId]), ++clock[siteId]],
            });
        }

        //traverse()
    };

//console.log("clock", clock)
    return (
        <div className="doc">
            <input
                value={doc
                    .slice(1, doc.length - 1)
                    .map((item) => item[0])
                    .join("")}
                onChange={handleChange}
                //onKeyUp={handleKeyUp}
            />
            <span className="inspect" ref={inspectEl}></span>
        </div>
    );
}

export default Doc;
