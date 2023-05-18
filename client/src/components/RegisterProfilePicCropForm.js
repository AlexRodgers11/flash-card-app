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
    // position: absolute;
    // width: 50vw;
    // height: 50vh;

    


    // width: 500px;
    // height: 500px;
    // min-height: 500px;
    `;

const ControlsWrapper = styled.div`
    position: relative;
    margin-top: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    // bottom: 0;
    // left: 50%; //why? (with the two why properties on it works)
    // width: 50%;
    // transform: translateX(-50%); //why?
    // height: 80px;
    & label {
        font-weight: 500;
        margin-right: 1px;
    }
    & input {
        width: 25vw;
        margin-right: 2px;
    }
    
    max-width: 650px;
    @media (max-width: 850px) {
        max-width: 400px;
    }
    @media (max-width: 650px) {
        max-width: 350px;
        & input {
            width: 20vw;
        }
    }
    @media (max-width: 550px) {
        min-width: 325px;
        & button {
            padding: 0.1875rem 0.375rem;
        }
    }
    @media (max-width: 490px) {
        min-width: 300px;
        & button, label {
            font-size: 0.875rem;
        }
    }
`;

const StyledCropper = styled(Cropper)`
    width: 80%;
    height: 80%;
`; 

const StyledCropContainer = styled(CropContainer)`
    position: relative;

    min-width: 650px;
    min-height: 650px;
    @media (max-width: 850px) {
        min-width: 400px;
        min-height: 400px;
        max-width: 782px;
        max-height: 782px;
    }
    @media (max-width: 650px) {
        min-width: 350px;
        min-height: 350px;
        max-width: 482px;
        max-height: 482px;
    }
    @media (max-width: 550px) {
        min-width: 325px;
        min-height: 325px;
        max-width: 382px;
        max-height: 382px;
    }
    @media (max-width: 490px) {
        min-width: 300px;
        min-height: 300px;
        max-width: 422px;
        max-height: 422px;
    }
    @media (max-width: 450px) {
        max-width: 414px;
        max-height: 414px;
    }
    @media (max-width: 375px) {
        max-width: 355px;
        max-height: 355px;
    }
`;

    
function RegisterProfilePicCropForm(props) {
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
                props.photo || photo,
                croppedAreaPixels,
                rotation
            );
            console.log("donee", { croppedImage });
            console.log(croppedImage);
            console.log(typeof croppedImage);
            console.log(croppedImage instanceof Blob);
            const fileFromURL = urlToFile(croppedImage);

            if(props.saveCrop) {
                props.saveCrop(fileFromURL);
                console.log("should be done here");
            } else {
                dispatch(updateProfilePic({userId: userId, photo: fileFromURL}))
                    .then(() => {
                        navigate("/register/join-groups");
                    });
            }

          
        } catch (e) {
          console.error(e);
        }
      }, [croppedAreaPixels, rotation, photo, props.photo]);

    return (
        <RegisterProfilePicCropFormWrapper className="RegisterProfilePicCropFormWrapper">
            <StyledCropContainer className="StyledCropContainer">
                <StyledCropper 
                    image={props.photo || photo}
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
                <button className="btn btn-primary" onClick={saveCroppedImage}>Crop/Save</button>
            </ControlsWrapper>
        </RegisterProfilePicCropFormWrapper>
    )
}

export default RegisterProfilePicCropForm;