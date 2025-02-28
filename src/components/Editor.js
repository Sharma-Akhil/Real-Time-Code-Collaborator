import React, { useEffect, useRef } from "react";
import Codemirror from "codemirror";

// Import CodeMirror styles & theme
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";

// Import required addons
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";

// ✅ Import JavaScript mode
import "codemirror/mode/javascript/javascript.js";

import ACTIONS from "../Actions"; // Import socket actions

const Editor = ({ socketRef, roomId }) => {
    const editorRef = useRef(null);
    const codeRef = useRef(""); // Store last known code to prevent overwrites

    useEffect(() => {
        if (!editorRef.current) {
            const editor = Codemirror.fromTextArea(
                document.getElementById("realtimeEditor"),
                {
                    mode: "javascript",
                    theme: "dracula",
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                }
            );

            editorRef.current = editor;

            // Emit code changes to server
            editor.on("change", (instance) => {
                const code = instance.getValue();
                if (socketRef.current && roomId && code !== codeRef.current) {
                    codeRef.current = code; // Update last known code
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
                }
            });
        }
    }, []);

    useEffect(() => {
        if (!socketRef.current) return;

        // 🔹 Receive code changes from other users
        socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
            if (editorRef.current && typeof code === "string" && code !== codeRef.current) {
                codeRef.current = code; // Update last known code
                editorRef.current.setValue(code);
            }
        });

        // 🔹 Handle sync code request (send code to new user)
        socketRef.current.on(ACTIONS.SYNC_CODE, ({ socketId }) => {
            socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                roomId,
                code: codeRef.current, // Send current code to new user
            });
        });

        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
            socketRef.current.off(ACTIONS.SYNC_CODE);
        };
    }, [socketRef.current]);

    return <textarea id="realtimeEditor"></textarea>;
};

export default Editor;
