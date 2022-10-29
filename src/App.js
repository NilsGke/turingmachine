import autoAnimate from "@formkit/auto-animate";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.scss";
import Cell from "./components/Cell";
import State from "./components/State";
import Step from "./components/Step";
import getFreeId from "./helpers/getFreeId";

// icons
import { GrEdit, GrCheckmark, GrPowerReset } from "react-icons/gr";
import {
    BsFillPlayFill,
    BsPauseFill,
    BsFillSkipForwardFill,
} from "react-icons/bs";
import { VscDebugStepOver } from "react-icons/vsc";
import { BiImport, BiExport } from "react-icons/bi";
import { AiOutlineCloudUpload, AiOutlineCloudDownload } from "react-icons/ai";
import { instantCalculator, stepFun } from "./helpers/step";
import LoadProgramModal from "./components/LoadProgramModal";

function App() {
    const intervalTime = 200; // ms

    const [strip, setStrip] = useState([
        { id: 0, letter: "A" },
        { id: 1, letter: "B" },
        { id: 2, letter: "B" },
        { id: 3, letter: "A" },
        { id: 4, letter: "B" },
        { id: 5, letter: "A" },
        { id: 6, letter: "A" },
        { id: 7, letter: "B" },
        { id: 8, letter: "A" },
        { id: 9, letter: "B" },
    ]);
    const [states, setStates] = useState([
        { id: 0, letter: "a", note: "" },
        { id: 1, letter: "b", note: "" },
    ]);

    const [program, setProgram] = useState([
        {
            id: 0,
            state: 0,
            condition: "A",
            new: {
                state: 0,
                letter: "B",
                direction: "R",
            },
            note: "",
        },
        {
            id: 1,
            state: 0,
            condition: "B",
            new: {
                state: 0,
                letter: "A",
                direction: "R",
            },
            note: "",
        },
    ]);

    const [loadProgramModal, setLoadProgramModal] = useState(false);

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

    const headRef = useRef(null);

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
    }, [program, states, imported]);

    // control functions
    // step
    console.log("rerender");
    const step = () => {
        setDoOneStep(true);
    };
    useEffect(() => {
        if (!doOneStep) return;
        setDoOneStep(false);
        const res = stepFun(
            strip,
            program,
            currentState,
            states,
            pointerPos,
            toast
        );
        console.log(res);
        if (res.error !== undefined) {
            setRunning(false);
            return;
        }
        if (res.halt) {
            setHalt(true);
            return;
        }

        setStrip(res.strip);
        setCurrentState(res.currentState);
        setPointerPos(res.pointerPos);
        // disable missing dependencies because it slowed down the program
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [doOneStep]);

    useEffect(() => {
        clearInterval(clock);
        if (halt || !running || doOneStep) {
            console.warn(
                "something went wrong (or not, because the dependencies)",
                { halt, running, doOneStep }
            );
            return;
        }
        const newInterval = setInterval(() => {
            if (halt || !running || doOneStep) {
            } else {
                step();
            }
        }, intervalTime);
        setClock(newInterval);
        return () => clearInterval(clock);
        // disable errors due to missing dependencies, because those dependencies slowed down the program so much
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [running]);

    useEffect(() => {
        if (halt) {
            setRunning(false);
            toast.success("program finished");
        }
        setHalt(false);
    }, [halt]);

    useLayoutEffect(() => {
        if (stripRef.current === null || headRef.current === null) return;

        const head = headRef.current;

        const currentElement = [...stripRef.current.children]
            .filter((e) => !e.classList.contains("button"))
            .at(pointerPos);

        const { left, top, width, height } =
            currentElement.getBoundingClientRect();

        const topMargin = 15 + (editMode ? 30 : 0);

        const { width: headWidth } = head.getBoundingClientRect();

        const keyframes = [
            {
                top: top + height + topMargin + "px",
                left: left + width / 2 - headWidth / 2 + "px",
            },
        ];

        head.animate(keyframes, {
            duration: intervalTime,
            easing: "ease-out",
            fillMode: "forwards",
            fill: "forwards",
        });
    }, [stripRef, headRef, strip, pointerPos, currentState, editMode]);

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

    const exportProgram = () => {
        // TODO: wirte export function that exports the program (and strip?) like the import function takes it (see example program)
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
                    <div id="head" ref={headRef}></div>
                </div>

                <div id="program">
                    <h2>Program</h2>
                    <div id="list" ref={programRef}>
                        {program.map((step, index) => (
                            <Step
                                canMove={{
                                    up: index !== 0,
                                    down: index + 1 !== program.length,
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
                        <div className="step add">
                            <button
                                onClick={() => {
                                    const newProgram = program.slice();
                                    let id = 0;
                                    while (
                                        newProgram.map((i) => i.id).includes(id)
                                    )
                                        id++;
                                    newProgram.push({
                                        id,
                                        state: 0,
                                        condition: "_",
                                        new: {
                                            state: 0,
                                            letter: "_",
                                            direction: "R",
                                        },
                                        note: "",
                                    });
                                    setProgram(newProgram);
                                }}
                            >
                                +
                            </button>
                        </div>
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
                        <button
                            onClick={() => {
                                const final = instantCalculator(
                                    strip,
                                    program,
                                    currentState,
                                    states,
                                    pointerPos,
                                    toast
                                );

                                if (final.error) return;
                                console.log(final);
                                setStrip(final.strip);
                                setCurrentState(final.currentState);
                                setPointerPos(final.pointerPos);
                            }}
                        >
                            <BsFillSkipForwardFill />
                        </button>
                        <button>
                            <GrPowerReset />
                        </button>
                    </div>
                    <div>
                        <div className="importExport">
                            <h3>import / export</h3>
                            <div className="buttons">
                                <button onClick={importProgram}>
                                    <BiImport />
                                </button>
                                <button onClick={exportProgram}>
                                    <BiExport />
                                </button>
                            </div>
                        </div>
                        <div className="saveLoad">
                            <h3>save / load</h3>
                            <div className="buttons">
                                <button
                                    onClick={() => {
                                        const name = prompt("enter name: ");
                                        console.log(name);
                                    }}
                                >
                                    <AiOutlineCloudUpload />
                                </button>
                                <button
                                    onClick={() => setLoadProgramModal(true)}
                                >
                                    <AiOutlineCloudDownload />
                                </button>
                            </div>
                        </div>
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
            {loadProgramModal ? (
                <LoadProgramModal close={() => setLoadProgramModal(false)} />
            ) : (
                ""
            )}
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
