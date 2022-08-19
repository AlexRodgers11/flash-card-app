import { useState } from 'react';

function useToggle(initVal = false) {
    const [state, setState] = useState(initVal);
    const toggle = () => {
       setState(!state);
    }
    return [state, toggle];
}

export default useToggle;