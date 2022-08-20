import { useState } from 'react';

const useFormInput = (initialValue) => {
    const [input, setInput] = useState(initialValue);

    const clearInput = () => {
        setInput('');
    }

    const handleChangeInput = evt => {
        setInput(evt.target.value);
    }

    return [input, clearInput, handleChangeInput];
}

export default useFormInput;