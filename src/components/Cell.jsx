import { useEffect, useState } from "react";
import { AiFillDelete, AiOutlineLeft, AiOutlineRight } from "react-icons/ai";

const Cell = ({
    active,
    data,
    change,
    editMode,
    delete: deleteFun,
    canMove,
    move,
}) => {
    const [letter, setLetter] = useState(data.letter);

    useEffect(() => {
        if (letter !== data.letter) change({ ...data, letter });
    }, [letter]);

    return (
        <div className={"cell" + (active ? " active" : "")}>
            {editMode ? (
                <div className="move">
                    {canMove.left ? (
                        <button className="move left" onClick={() => move(-1)}>
                            <AiOutlineLeft />
                        </button>
                    ) : (
                        ""
                    )}
                    {canMove.right ? (
                        <button className="move right" onClick={() => move(1)}>
                            <AiOutlineRight />
                        </button>
                    ) : (
                        ""
                    )}
                </div>
            ) : (
                ""
            )}
            <input
                id={"stripInput" + data.id}
                type="text"
                value={letter}
                onChange={(e) => setLetter(e.target.value)}
                maxLength={1}
            />
            {editMode ? (
                <button className="delete" onClick={deleteFun}>
                    <AiFillDelete />
                </button>
            ) : (
                ""
            )}
        </div>
    );
};
export default Cell;
