import autoAnimate from "@formkit/auto-animate";
import { useEffect, useRef, useState } from "react";
import "./App.scss";
import Cell from "./components/Cell";
import State from "./components/State";
import Step from "./components/Step";
import getFreeId from "./helpers/getFreeId";

// icons
import { GrEdit, GrCheckmark, GrPowerReset } from "react-icons/gr";
import { BsFillPlayFill, BsPauseFill } from "react-icons/bs";
import { VscDebugStepOver } from "react-icons/vsc";
import { BiImport, BiExport } from "react-icons/bi";
import { AiOutlineSave } from "react-icons/ai";

function App() {
    const [strip, setStrip] = useState([
        { id: 0, letter: "a" },
        { id: 1, letter: "s" },
        { id: 2, letter: "d" },
        { id: 3, letter: "f" },
        { id: 4, letter: "f" },
    ]);
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
                letter: "o",
                direction: "R",
            },
            note: "asdf",
        },
        {
            state: 1,
            condition: "a",
            new: {
                state: 1,
                letter: "o",
                direction: "L",
            },
            note: "asdf",
        },
        {
            state: 1,
            condition: "a",
            new: {
                state: 2,
                letter: "o",
                direction: "H",
            },
            note: "asdf",
        },
    ]);

    const [running, setRunning] = useState(false);

    // for inports and export i have to first clear the current states
    const [imported, setImported] = useState(null);

    const [editMode, setEditMode] = useState(false);

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

    // import program
    // reset current program and states
    useEffect(() => {
        if (imported === null) return;
        else {
            setStates([]);
            setProgram([]);
        }
    }, [imported]);
    // fill program and states with data once they change
    useEffect(() => {
        if (imported !== null) {
            setStates(imported.states);
            setProgram(imported.program);
            setImported(null);
        }
    }, [program, states]);

    const importProgram = () => {
        const programAsText = prompt("paste Program here");

        const instructionsAsText = programAsText
            .split("\n")
            .map((s) => s.replace("\r", "").trim());

        const instructionsSeparated = instructionsAsText.map((s) =>
            s
                .split(") ---> (")
                .map((i) => i.split(")  ["))
                .flat()
        );

        const instructions = instructionsSeparated.map((i) => ({
            stateName: i[0].split(",")[0].replace("(", "").trim(),
            condition: i[0].split(",")[1].trim(),
            new: {
                stateName: i[1].split(",")[0].trim(),
                letter: i[1].split(",")[1].trim(),
                direction: i[1].split(",")[2].trim(),
            },
            note: i[2].replace("]", ""),
        }));

        const newProgram = [];
        const newStates = [];
        instructions.forEach((ins) => {
            if (!newStates.map((s) => s.letter).includes(ins.stateName))
                newStates.push({
                    id: newStates.length,
                    letter: ins.stateName,
                    note: "",
                });

            if (!newStates.map((s) => s.letter).includes(ins.new.stateName))
                newStates.push({
                    id: newStates.length,
                    letter: ins.new.stateName,
                    note: "",
                });
            console.log(newProgram);
            newProgram.push({
                ...ins,
                state: newStates.find((s) => s.letter === ins.stateName).id,
                new: {
                    ...ins.new,
                    state: newStates.find((s) => s.letter === ins.new.stateName)
                        .id,
                },
            });
        });

        console.log(newProgram, newStates);
        setImported({ states: newStates, program: newProgram });
    };

    return (
        <div className="App">
            <div id="stripContainer">
                <h2>Strip</h2>
                <div id="strip" ref={stripRef}>
                    {editMode ? (
                        <div className="cell button">
                            <input
                                type="button"
                                value="+"
                                onClick={() =>
                                    setStrip([
                                        {
                                            letter: "",
                                            id: getFreeId(
                                                strip.map((c) => c.id)
                                            ),
                                        },
                                        ...strip.slice(),
                                    ])
                                }
                            />
                        </div>
                    ) : (
                        ""
                    )}
                    {strip.map((cell, index) => (
                        <Cell
                            canMove={{
                                left: index !== 0,
                                right: index + 1 !== strip.length,
                            }}
                            editMode={editMode}
                            delete={() => {
                                const newStrip = strip.slice();
                                newStrip.splice(index, 1);
                                setStrip(newStrip);
                            }}
                            move={(direction) => {
                                const newStrip = strip.slice();
                                const temp = newStrip[index];
                                newStrip[index] = newStrip[index + direction];
                                newStrip[index + direction] = temp;

                                setStrip(newStrip);
                            }}
                            key={cell.id}
                            active={pointerPos === index}
                            className="cell"
                            data={cell}
                            change={(newContent) => {
                                const newStrip = strip.slice();
                                const index = strip.findIndex(
                                    (c) => c.id === cell.id
                                );
                                newStrip[index] = newContent;
                                setStrip(newStrip);
                            }}
                        />
                    ))}
                    {editMode ? (
                        <div className="cell button">
                            <input
                                type="button"
                                value="+"
                                onClick={() =>
                                    setStrip([
                                        ...strip.slice(),
                                        {
                                            letter: "",
                                            id: getFreeId(
                                                strip.map((c) => c.id)
                                            ),
                                        },
                                    ])
                                }
                            />
                        </div>
                    ) : (
                        ""
                    )}
                    <div className="cell" id="editButtonContainer">
                        <button
                            className="cell"
                            id="editButton"
                            onClick={() => setEditMode(!editMode)}
                        >
                            {editMode ? <GrCheckmark /> : <GrEdit />}
                        </button>
                    </div>
                </div>
            </div>

            <div id="program">
                <h2>Program</h2>
                <div id="list" ref={programRef}>
                    {program.map((step, index) => (
                        <Step
                            current={pointerPos === index}
                            data={step}
                            states={states}
                            change={(newStep) => {
                                const newSteps = program.slice();
                                newSteps[index] = newStep;
                                setProgram(newSteps);
                            }}
                        />
                    ))}
                </div>
            </div>

            <div id="controlsContainer">
                <div id="controls">
                    <button
                        className={running ? "running" : "paused"}
                        onClick={() => setRunning(!running)}
                    >
                        {running ? <BsPauseFill /> : <BsFillPlayFill />}
                    </button>
                    <button disabled={running ? "disabled" : ""}>
                        <VscDebugStepOver />
                    </button>
                    <button>
                        <GrPowerReset />
                    </button>
                </div>
                <div>
                    <button onClick={importProgram}>
                        <BiImport />
                    </button>
                    <button>
                        <BiExport />
                    </button>
                    <button
                        onClick={() => {
                            const name = prompt("enter name: ");
                        }}
                    >
                        <AiOutlineSave />
                    </button>
                </div>
            </div>

            <div id="statesContainer">
                <div id="states">
                    <h2>States</h2>
                    <div id="list" ref={programRef}>
                        {states.map((state, index) => (
                            <State
                                key={state.id}
                                data={state}
                                change={(newState) => {
                                    const newStates = states.slice();
                                    newStates[index] = newState;
                                    setStates(newStates);
                                }}
                                delete={() => {
                                    const newStates = states.slice();
                                    newStates.splice(
                                        states.findIndex(
                                            (s) => s.id === state.id
                                        ),
                                        1
                                    );
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
                        +
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;
