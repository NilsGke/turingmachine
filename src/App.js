import autoAnimate from "@formkit/auto-animate";
import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
        { id: 0, letter: "1" },
        { id: 1, letter: "1" },
        { id: 2, letter: "1" },
        { id: 3, letter: "1" },
        { id: 4, letter: "1" },
        { id: 5, letter: "1" },
        { id: 6, letter: "1" },
        { id: 7, letter: "1" },
        { id: 8, letter: "1" },
        { id: 9, letter: "0" },
    ]);
    const [states, setStates] = useState([
        { id: 0, letter: "a", note: "" },
        { id: 1, letter: "b", note: "" },
    ]);

    const [program, setProgram] = useState([
        {
            id: 0,
            state: 0,
            condition: "1",
            new: {
                state: 0,
                letter: "0",
                direction: "R",
            },
            note: "",
        },
        {
            id: 1,
            state: 0,
            condition: "0",
            new: {
                state: 0,
                letter: "0",
                direction: "L",
            },
            note: "",
        },
    ]);

    // for inports and export i have to first clear the current states
    const [imported, setImported] = useState(null);

    const [editMode, setEditMode] = useState(false);

    // controls
    const [running, setRunning] = useState(false);
    const [clock, setClock] = useState(null);
    const [doOneStep, setDoOneStep] = useState(false);
    const [pointerPos, setPointerPos] = useState(0);
    const [currentState, setCurrentState] = useState(0);
    const [halt, setHalt] = useState(false);

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

    // control functions
    // step
    useEffect(() => {
        if (!doOneStep) return;
        const letter = strip.at(pointerPos).letter;
        const state = states.find((s) => s.id === currentState);

        const instructionsForState = program.filter(
            (s) => s.state === currentState
        );
        if (instructionsForState.length === 0) {
            toast.error(`no instructions for state: "${state.letter}"`);
            setDoOneStep(false);
            setHalt(true);
            return;
        }

        const instructionsFitCondition = instructionsForState.filter(
            (s) => s.condition === letter
        );
        if (instructionsFitCondition.length === 0) {
            toast.error(`no Step found with condition: "${letter}"`, {});
            setDoOneStep(false);
            setHalt(true);
            return;
        }

        if (instructionsFitCondition.length > 1)
            toast.warn(
                `found multiple instructions that could fulfill this case (condition: ${letter}, state: ${state.letter})`
            );

        const instruction = instructionsFitCondition.at(0);

        const newStrip = strip.slice();
        newStrip[pointerPos].letter = instruction.new.letter;
        console.log(newStrip);
        setStrip(newStrip);
        setCurrentState(instruction.new.state);
        switch (instruction.new.direction) {
            case "L":
                // if pointer is at very left, add new cell
                if (pointerPos === 0) {
                    const newStrip = strip.slice();
                    let id = 0;
                    while (newStrip.map((s) => s.id).includes(id)) id++;
                    newStrip.unshift({ id, letter: "" });
                    setStrip(newStrip);
                } else {
                    setPointerPos(pointerPos - 1);
                }
                break;
            case "R":
                setPointerPos(pointerPos + 1);
                break;
            case "H":
                setHalt(true);
        }

        setDoOneStep(false);
    }, [doOneStep]);

    useEffect(() => {
        clearInterval(clock);
        if (halt || !running || doOneStep) {
            setRunning(false);
            console.warn("something went wrong");
            return;
        }
        const newInterval = setInterval(() => {
            if (halt || !running || doOneStep) {
                setRunning(false);
            }

            step();
        }, 500);
        setClock(newInterval);
        return () => clearInterval(clock);
    }, [running]);

    useEffect(() => {
        if (halt) setRunning(false);
        setHalt(false);
    }, [halt]);

    const step = () => {
        if (!doOneStep) setDoOneStep(true);
    };

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
        instructions.forEach((ins, index) => {
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
            newProgram.push({
                ...ins,
                id: index,
                state: newStates.find((s) => s.letter === ins.stateName).id,
                new: {
                    ...ins.new,
                    state: newStates.find((s) => s.letter === ins.new.stateName)
                        .id,
                },
            });
        });

        setImported({ states: newStates, program: newProgram });
    };

    return (
        <>
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
                                    newStrip[index] =
                                        newStrip[index + direction];
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
                                canMove={{
                                    up: index != 0,
                                    down: index + 1 != program.length,
                                }}
                                key={step.id}
                                current={pointerPos === index}
                                data={step}
                                states={states}
                                change={(newStep) => {
                                    const newSteps = program.slice();
                                    newSteps[index] = newStep;
                                    setProgram(newSteps);
                                }}
                                move={(direction) => {
                                    const newProgram = program.slice();
                                    const temp = newProgram[index];
                                    newProgram[index] =
                                        newProgram[index + direction];
                                    newProgram[index + direction] = temp;

                                    setProgram(newProgram);
                                }}
                                delete={() => {
                                    const newProgram = program.slice();
                                    newProgram.splice(index, 1);
                                    setProgram(newProgram);
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
                        <button
                            disabled={running ? "disabled" : ""}
                            onClick={step}
                        >
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
                        <div id="list" ref={stateRef}>
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
                                    current={state.id === currentState}
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
                                while (
                                    states.map((state) => state.id).includes(id)
                                )
                                    id++;

                                const newStates = states.slice();
                                newStates.push({
                                    id,
                                    letter: newLetter,
                                    note: "",
                                });
                                setStates(newStates);
                            }}
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                theme="dark"
                pauseOnHover
                pauseOnFocusLoss
            />
        </>
    );
}

export default App;
