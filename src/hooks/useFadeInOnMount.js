import { useState, useEffect } from "react";

// from grepper: SamuraiR4cc00n
const useFadeOnMount = () => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (!show) {
            setShow(true);
        }
    }, [show]);

    const fadeProps = {
        transition: `opacity 0.4s ease-in-out`,
        opacity: show ? 1 : 0,
    };

    return [fadeProps];
};

export default useFadeOnMount;
