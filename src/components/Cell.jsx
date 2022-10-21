const Cell = ({ active, content, change }) => {
    return (
        <div className={"cell" + (active ? " active" : "")}>
            <input
                type="text"
                value={content}
                onChange={(e) => change(e.target.value)}
                maxLength={1}
            />
        </div>
    );
};

export default Cell;
