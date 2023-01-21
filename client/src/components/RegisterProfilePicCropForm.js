import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import Cropper from "react-easy-crop";
import styled from "styled-components";
import useFormInput from "../hooks/useFormInput";


const CropContainer = styled.div`
position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 80px;`;

const RegisterProfilePicCropFormWrapper = styled.div`
    width: 50vw;
    height: 50vh;
`;

const ControlsWrapper = styled.div`
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 50%;
    transform: translateX(-50%);
    height: 80px;
    display: flex;
    align-items: center;
    & input {
        padding: 22px 0px;
        width: 25vw;;
    }
`;

function RegisterProfilePicCropForm() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const photo = useSelector((state) => state.login.photo);
    const [crop, setCrop] = useState({x: 0, y: 0});
    // const [zoom, clearZoom, handleZoomChange] = useFormInput(1);
    const [zoom, setZoom] = useState(3);
    // const [aspect, clearAspect, handleAspectChange] = useFormInput(1)
    const [aspect, setAspect] = useState(1);

    const handleCropChange = (crop) => {
        setCrop({crop});
    }

    const handleCropComplete = (croppedArea, croppedAreaPixels) => {
        console.log(croppedAreaPixels.width / croppedAreaPixels.height);
    }

    // const handleZoomChange = (evt, zoom) => {
    const handleZoomChange = (evt) => {
        // console.log({zoom});
        console.log({evt});
        // setZoom(zoom);
        setZoom(evt.target.value);
    }

    return (
        <RegisterProfilePicCropFormWrapper>
            <CropContainer>
                <Cropper 
                    image={photo}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspect}
                    cropShape="round"
                    showGrid={true}
                    onCropChange={handleCropChange}
                    onCropComplete={handleCropComplete}
                    onZoomChange={handleZoomChange}
                />
            </CropContainer>
            <ControlsWrapper>
                {/* <input type="range" min={1} max={3} step={0.1} value={zoom} className="slider" onChange={(e, zoom) => handleZoomChange(zoom)} /> */}
                {/* <input type="range" min={1} max={3} step={0.1} value={zoom} className="slider" onChange={(evt) => handleZoomChange(evt)} /> */}
                <input type="range" min={1} max={3} step={0.1} value={zoom} className="slider" onChange={handleZoomChange} />
            </ControlsWrapper>
        </RegisterProfilePicCropFormWrapper>
    )
}

export default RegisterProfilePicCropForm;