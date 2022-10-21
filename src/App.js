import autoAnimate from "@formkit/auto-animate";
import { useEffect, useRef, useState } from "react";
import "./App.scss";
import Cell from "./components/Cell";
import State from "./components/State";
import Step from "./components/Step";

function App() {
    const [strip, setStrip] = useState(["a", "s", "d", "f", ""]);
    const [pointerPos, setPointerPos] = useState(0);
    const [states, setStates] = useState([
        { id: 0, letter: "a", note: "" },
        { id: 1, letter: "b", note: "" },
        { id: 2, letter: "c", note: "" },
    ]);
    const [program, setProgram] = useState([
        {
            state: 0,
            condition: "s",
            new: {
                state: 1,
                character: "o",
                direction: 1,
            },
        },
        {
            state: 1,
            condition: "a",
            new: {
                state: 1,
                character: "o",
                direction: -1,
            },
        },
        {
            state: 1,
            condition: "a",
            new: {
                state: 2,
                character: "o",
                direction: "H",
            },
        },
    ]);

    const stripRef = useRef(null);
    const programRef = useRef(null);
    const stateRef = useRef(null);

    useEffect(() => {
        stripRef.current && autoAnimate(stripRef.current);
    }, [stripRef]);
    useEffect(() => {
        programRef.current && autoAnimate(programRef.current);
    }, [programRef]);
    useEffect(() => {
        stateRef.current && autoAnimate(stateRef.current);
    }, [stateRef]);

    const addState = (letter) => {
        const newStates = states.slice();
        newStates.push({ letter, note: "" });
        setStates(newStates);
    };

    return (
        <div className="App">
            <h2>Strip</h2>
            <div id="strip" ref={stripRef}>
                {strip.map((cell, index) => (
                    <Cell
                        active={pointerPos === index}
                        className="cell"
                        content={cell}
                        change={(newContent) => {
                            const newStrip = strip.slice();
                            newStrip[index] = newContent;
                            setStrip(newStrip);
                        }}
                    />
                ))}
            </div>

            <div id="program">
                <h2>Program</h2>
                <div id="list" ref={programRef}>
                    {program.map((step, index) => (
                        <Step
                            data={step}
                            states={states}
                            change={(newStep) => {
                                console.log(newStep);
                                const newSteps = program.slice();
                                newSteps[index] = newStep;
                                setProgram(newSteps);
                            }}
                        />
                    ))}
                </div>
            </div>

            <div id="states">
                <h2>States</h2>
                <div id="list" ref={programRef}>
                    {states.map((state, index) => (
                        <State
                            data={state}
                            change={(newState) => {
                                const newStates = states.slice();
                                newStates[index] = newState;
                                setStates(newStates);
                            }}
                        />
                    ))}
                </div>
                <button
                    onClick={() => {
                        // find letter that is not yet used
                        const newLetter =
                            [..."abcdefghijklmnopqrstuvwxyz"].find(
                                (letter) =>
                                    !states
                                        .map((s) => s.letter)
                                        .includes(letter)
                            ) || "ranOutOfNames";

                        // find not yet used id
                        let id = 0;
                        while (states.map((state) => state.id).includes(id))
                            id++;

                        const newStates = states.slice();
                        newStates.push({ id, letter: newLetter, note: "" });
                        setStates(newStates);
                    }}
                >
                    Add State
                </button>
            </div>
        </div>
    );
}

export default App;
