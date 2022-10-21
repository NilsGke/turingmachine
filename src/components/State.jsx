const State = ({ data, change }) => {
    return (
        <div className="state">
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
        </div>
    );
};

export default State;
