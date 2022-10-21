// {
//     state: 0,
//     condition: "s",
//     new: {
//         state: 1,
//         character: "o",
//         direction: 1,
//     },
// },

const Step = ({ data, change, states }) => {
    console.log(data.state, states);
    const StateSelect = ({ change: changeFun, name, selected }) => (
        <select
            name={name || "select"}
            value={selected}
            onChange={(e) => changeFun(e.target.value)}
        >
            {states.map((state) => (
                <option value={state.id}>{state.letter}</option>
            ))}
        </select>
    );

    return (
        <div className="step">
            <div className="current">
                <StateSelect
                    name="currentStateSelector"
                    selected={data.state}
                    change={(id) => {
                        change({
                            ...data,
                            state: id,
                        });
                    }}
                />
                <input
                    type="text"
                    name="condition"
                    placeholder="condition"
                    onChange={(e) =>
                        change({ ...data, condition: e.target.value })
                    }
                />
            </div>
            <div className="new">
                <StateSelect
                    name="newStateSelector"
                    selected={data.new.state}
                    change={(id) => {
                        change({
                            ...data,
                            new: { ...data.new, state: id },
                        });
                    }}
                />
                <input
                    type="text"
                    placeholder="new letter"
                    onChange={(e) =>
                        change({
                            ...data,
                            new: { ...data.new, character: e.target.value },
                        })
                    }
                />
                <select
                    name="directionSelector"
                    id="directionSelect"
                    defaultValue={data.new.direction}
                    onChange={(e) =>
                        change({
                            ...data,
                            new: { ...data.new, direction: e.target.value },
                        })
                    }
                >
                    <option value="L">L</option>
                    <option value="R">R</option>
                    <option value="H">H</option>
                </select>
            </div>
        </div>
    );
};

export default Step;
