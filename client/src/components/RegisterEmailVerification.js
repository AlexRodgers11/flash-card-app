import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import useFormInput from "../hooks/useFormInput";
import { submitVerificationCode } from "../reducers/loginSlice";

function RegisterEmailVerificationForm() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [verificationCode, clearVerificationCode, handleVerificationCodeChange] = useFormInput("");
    const [verificationResponse, setVerificationResponse] = useState("");
    const userId = useSelector((state) => state.login.userId);
    const accountSetupStage = useSelector((state) => state.login.accountSetupStage);

    useEffect(() => {
        if(accountSetupStage === "verified") {
            navigate("/register/identification");
        }
    }, [accountSetupStage, navigate]);
    
    const checkValidationCode = async (evt) => {
        evt.preventDefault();
        try {
            dispatch(submitVerificationCode({userId, verificationCode}));
            clearVerificationCode();
        } catch (err) {
            //make sure this works or refactor- probably add error message to login state
            console.log("an error occurred after submitting verification code");
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