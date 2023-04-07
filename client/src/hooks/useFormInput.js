import { useState } from 'react';

const useFormInput = (initialValue, inputType="text") => {
    const [input, setInput] = useState(initialValue);

    const clearInput = () => {
        setInput(inputType === "checkbox" ? false : "");
    }

    const handleChangeInput = evt => {
        setInput(inputType === "checkbox" ? evt.currentTarget.checked : evt.target.value);
    }

    return [input, clearInput, handleChangeInput, setInput];
}

export default useFormInput;