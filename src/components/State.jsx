import { AiFillDelete } from "react-icons/ai";

const State = ({ data, change, delete: deleteFun, current }) => {
    return (
        <div className={"state" + (current ? " current" : "")}>
            <input
                type="text"
                // maxLength={1}
                defaultValue={data.letter}
                onChange={(e) => change({ ...data, letter: e.target.value })}
            />
            <textarea
                name="state note"
                id="note"
                cols="10"
                rows="2"
                placeholder="note..."
                onChange={(e) => change({ ...data, note: e.target.value })}
            ></textarea>
            <button className="delete" onClick={deleteFun}>
                <AiFillDelete />
            </button>
        </div>
    );
};

export default State;
