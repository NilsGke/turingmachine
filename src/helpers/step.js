/* eslint-disable no-loop-func */
const instantCalculator = (
    strip,
    program,
    currentState,
    states,
    pointerPos,
    toast
) => {
    while (true) {
        const res = stepFun(
            strip,
            program,
            currentState,
            states,
            pointerPos,
            toast
        );
        console.log(
            res,
            program.filter((i) => i.condition === "#")
        );
        if (res.error !== undefined) return { error: "" };
        if (res.halt) break;
        strip = res.strip;
        currentState = res.currentState;
        pointerPos = res.pointerPos;
    }
    return { strip, currentState, pointerPos };
};

const stepFun = (strip, program, currentState, states, pointerPos, toast) => {
    const letter = strip.at(pointerPos).letter;
    const state = states.find((s) => s.id === currentState);

    const instructionsForState = program.filter(
        (s) => s.state === currentState
    );
    if (instructionsForState.length === 0) {
        toast.error(`no instructions for state: "${state.letter}"`);
        return { error: `no instructions for state: "${state.letter}"` };
    }

    const instructionsFitCondition = instructionsForState.filter(
        (s) => s.condition === letter
    );
    if (instructionsFitCondition.length === 0) {
        toast.error(`no Step found with condition: "${letter}"`);
        return { error: `no Step found with condition: "${letter}"` };
    }

    if (instructionsFitCondition.length > 1)
        toast.warn(
            `found multiple instructions that could fulfill this case (condition: ${letter}, state: ${state.letter})`
        );

    const instruction = instructionsFitCondition.at(0);

    strip[pointerPos].letter = instruction.new.letter;
    currentState = instruction.new.state;

    switch (instruction.new.direction) {
        case "L":
            // if pointer is at very left, add new cell
            if (pointerPos === 0) {
                let id = 0;
                const ids = strip.map((s) => s.id);
                while (ids.includes(id)) id++;
                strip.unshift({ id, letter: "_" });
            } else {
                pointerPos -= 1;
            }
            break;
        case "R":
            // if pointer is at very right, add new cell
            if (pointerPos === strip.length - 1) {
                let id = 0;
                const ids = strip.map((s) => s.id);
                while (ids.includes(id)) id++;
                strip.push({ id, letter: "_" });
            }
            pointerPos += 1;
            break;
        case "H":
            return { halt: true };
        default:
            break;
    }

    return { strip, currentState, pointerPos };
};

export { stepFun, instantCalculator };
