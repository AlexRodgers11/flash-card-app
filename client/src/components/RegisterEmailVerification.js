import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import useFormInput from "../hooks/useFormInput";
import { submitVerificationCode } from "../reducers/loginSlice";
import styled from "styled-components";

const FormWrapper = styled.form`
    text-align: left;
    & input {
        width: 100%;
        margin-bottom: .5rem;
    }
    & .form-label {
        font-weight: 500;
        margin-bottom: 1px;
    }
`;

const ButtonContainer = styled.div`
    text-align: center;
    margin-bottom: 2.5rem;
`;

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
        <FormWrapper onSubmit={checkValidationCode}>
            <div>
                <label className="form-label" htmlFor="verification-code">Enter the verification code sent to the email you provided</label>
                <input className="form-control" type="text" placeholder="Enter 6-digit Verification Code" id="verification-code" name="verification-code" value={verificationCode} onChange={handleVerificationCodeChange} />
                {!verificationResponse || verificationCode.length > 0 ? null : displayVerificationError()}
            </div>
            <button className="btn btn-primary" type="submit">Submit</button>
        </FormWrapper>
    )
}

export default RegisterEmailVerificationForm;