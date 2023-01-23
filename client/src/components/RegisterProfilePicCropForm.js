import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import Cropper from "react-easy-crop";
import styled from "styled-components";
import { getCroppedImg, urlToFile } from "../utils";
import { updateProfilePic } from "../reducers/loginSlice";

const CropContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 80px;
`;

const RegisterProfilePicCropFormWrapper = styled.div`
    width: 500px;
    height: 500px;
    // width: 50vw;
    // height: 50vh;
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

const StyledCropper = styled(Cropper)`
    // width: 80%;
    // height: 80%;
`; 

const StyledCropContainer = styled(CropContainer)`
    // width: 100%;
    // height: 100%;
`;

    
function RegisterProfilePicCropForm() {
    const photo = useSelector((state) => state.login.photo);
    const [crop, setCrop] = useState({x: 0, y: 0});
    const [zoom, setZoom] = useState(1);
    const [aspect, setAspect] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const userId = useSelector((state) => state.login.userId);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleCropComplete = useCallback((croppedArea, croppedAreaPixelsArg) => {
        setCroppedAreaPixels(croppedAreaPixelsArg);
    }, []);

    const saveCroppedImage = useCallback(async () => {
        try {
            const croppedImage = await getCroppedImg(
                photo,
                croppedAreaPixels,
                rotation
            );
            console.log("donee", { croppedImage });
            console.log(croppedImage);
            console.log(typeof croppedImage);
            console.log(croppedImage instanceof Blob);
            const fileFromURL = urlToFile(croppedImage);

            dispatch(updateProfilePic({userId: userId, photo: fileFromURL}))
                .then(() => {
                    navigate("/register/join-groups");
                });
          
        } catch (e) {
          console.error(e);
        }
      }, [croppedAreaPixels, rotation, photo]);

    return (
        <RegisterProfilePicCropFormWrapper>
            <StyledCropContainer>
                <StyledCropper 
                    image={photo}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspect}
                    rotation={rotation}
                    cropShape="round"
                    zoomWithScroll={true}
                    cropSize={{height: 175, width: 175}}
                    onCropChange={setCrop}
                    onCropComplete={handleCropComplete}
                    onZoomChange={setZoom}
                    onRotation={setRotation}
                />
            </StyledCropContainer>
            <ControlsWrapper>
                <label htmlFor="size-slider">Size</label>
                <input type="range" min={.01} max={3} step={0.01} value={zoom} className="slider" onChange={(evt) => setZoom(evt.target.value)} />
                <label htmlFor="rotation-slider">Rotation</label>
                <input type="range" id="rotation-slider" min={0} max={360} step={1} value={rotation} className="slider" onChange={(evt) => setRotation(evt.target.value)} />
                <button onClick={saveCroppedImage}>Crop and Save</button>
            </ControlsWrapper>
        </RegisterProfilePicCropFormWrapper>
    )
}

export default RegisterProfilePicCropForm;