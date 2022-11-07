import React, { useState } from "react";
import axios from 'axios';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import useFormInput from "../hooks/useFormInput";

const baseURL = 'http://localhost:8000';


function RegisterEmailVerificationForm() {
    const navigate = useNavigate();
    const [verificationCode, clearVerificationCode, handleVerificationCodeChange] = useFormInput("");
    const [verificationResponse, setVerificationResponse] = useState("");
    const userId = useSelector((state) => state.login.userId);

    const checkValidationCode = async (evt) => {
        evt.preventDefault();
        try {
            await axios.patch(`${baseURL}/users/${userId}/verification`, {code: verificationCode});
            clearVerificationCode();
            navigate("/register/identification");
        } catch (err) {
            clearVerificationCode();
            switch(err.response.data.verificationResponse) {
                case "invalid":
                    setVerificationResponse("invalid");
                    break;
                case "expired":
                    setVerificationResponse("expired");
                    break;
                default:
                    setVerificationResponse("");
                    break;
            }
        }
    }

    const displayVerificationError = () => {
        if(verificationResponse === "invalid") {
            return (
                <p>Invalid code</p>
            );
        } else if (verificationResponse === "expired") {
            return (
                <p>Code expired. A new one has been sent to your email.</p>
            );
        }
    }    

    return (
        <form onSubmit={checkValidationCode}>
            <div>
                <label htmlFor="verification-code">Enter the verification code sent to the email you provided</label>
                <input type="text" id="verification-code" name="verification-code" value={verificationCode} onChange={handleVerificationCodeChange} />
                {!verificationResponse || verificationCode.length > 0 ? null : displayVerificationError()}
            </div>
            <button type="submit">Submit</button>
        </form>
    )
}

export default RegisterEmailVerificationForm;