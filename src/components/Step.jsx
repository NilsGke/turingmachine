import { BsArrowRight } from "react-icons/bs";
import { AiFillDelete, AiOutlineUp, AiOutlineDown } from "react-icons/ai";

const Step = ({
    data,
    change,
    states,
    current,
    delete: deleteFun,
    move,
    canMove,
}) => {
    const StateSelect = ({ change: changeFun, name, selected }) => (
        <select
            name={name || "select"}
            defaultValue={selected}
            onChange={(e) => changeFun(parseInt(e.target.value))}
        >
            {states.map((state) => (
                <option value={state.id}>{state.letter}</option>
            ))}
        </select>
    );

    return (
        <div className={"step" + (current ? " current" : "")}>
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
                    value={data.condition}
                    onChange={(e) =>
                        change({ ...data, condition: e.target.value })
                    }
                />
            </div>
            <BsArrowRight />
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
                    defaultValue={data.new.letter}
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
            <textarea
                name=""
                id=""
                cols="20"
                rows="1"
                defaultValue={data.note}
                className={data.note.length >= 1 ? "big" : "small"}
                onChange={(e) =>
                    change({
                        ...data,
                        note: e.target.value,
                    })
                }
            ></textarea>
            <div className="buttons">
                {canMove.up ? (
                    <button className="move top" onClick={() => move(-1)}>
                        <AiOutlineUp />
                    </button>
                ) : (
                    ""
                )}
                <button className="delete" onClick={deleteFun}>
                    <AiFillDelete />
                </button>
                {canMove.down ? (
                    <button className="move down" onClick={() => move(1)}>
                        <AiOutlineDown />
                    </button>
                ) : (
                    ""
                )}
            </div>
        </div>
    );
};

export default Step;
