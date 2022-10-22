// returns the lowest unused number
// copied from: https://stackoverflow.com/questions/30672861/find-the-lowest-unused-number-in-an-array-using-javascript
const getFreeId = (sequence, startingFrom = 0) => {
    const arr = sequence.slice(0);
    arr.sort((a, b) => a - b);

    return arr.reduce((lowest, num, i) => {
        const seqIndex = i + startingFrom;
        return num !== seqIndex && seqIndex < lowest ? seqIndex : lowest;
    }, arr.length + startingFrom);
};
export default getFreeId;
