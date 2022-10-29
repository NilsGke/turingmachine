import autoAnimate from "@formkit/auto-animate";
import { useEffect, useRef, useState } from "react";
import useFadeOnMount from "../hooks/useFadeInOnMount";

import { AiFillDelete } from "react-icons/ai";

const LoadProgramModal = ({ close }) => {
    useEffect(() => {
        const escapeHandler = (e) => {
            if (e.keyCode === 27) close();
        };
        document.addEventListener("keydown", escapeHandler);
        return () => {
            document.removeEventListener("keydown", escapeHandler);
        };
    });

    const [programs, setPrograms] = useState(null);
    const programsRef = useRef(null);
    useEffect(() => {
        if (programsRef.current !== null) autoAnimate(programsRef.current);
    }, [programsRef]);

    useEffect(() => {
        const programs = localStorage.getItem("turingmachineprograms");
        if (programs === null) {
            localStorage.setItem("turingmachineprograms", JSON.stringify([]));
            setPrograms([]);
        } else {
            setPrograms(JSON.parse(programs));
        }
    }, []);

    const [fadeProps] = useFadeOnMount();

    const Program = ({ data }) => (
        <div className="program">
            <span className="name">{truncate(data.name, 30)}</span>
            <span className="strip">{truncate(data.strip)}</span>
            <button
                className="delete"
                onClick={() => {
                    // TODO:
                }}
            >
                <AiFillDelete />
            </button>
        </div>
    );

    return (
        <div
            style={fadeProps}
            className="container loadProgramModal"
            id="loadProgramModal"
        >
            <div className="modal">
                <button className="close" onClick={close}>
                    ✖
                </button>
                <h2>Load Program</h2>
                {programs === null ? (
                    "loading..."
                ) : (
                    <div className="programs" ref={programsRef}>
                        {programs.length === 0
                            ? "no programs"
                            : programs.map((p) => <Program data={p} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

const truncate = (str, n) =>
    str.length > n ? str.slice(0, n - 1) + "&hellip;" : str;

export default LoadProgramModal;
