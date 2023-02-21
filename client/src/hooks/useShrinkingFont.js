import { useCallback, useEffect, useState } from "react";

//takes starting font in pixels, an array of media-width-breakpoint/font-key-value pairs in ascending order by breakpoint width, a ref to the element text should not overflow out of, a ref to the element holding the text, and a piece of component state that has to load (since width cannot be measured prior to the component rendering the data)
const useShrinkingFont = (startingFontSize, breakpointsAndFonts, containerRef, textElementRef, dataBeingLoaded) => {
    const [fontSize, setFontSize] = useState(startingFontSize);
    const [doneResizing, setDoneResizing] = useState(false);

    //check current sizing of text in the container, shrink to fit where necessary
    const resizeText = useCallback(() => {
        console.log("resizing text");
        const container = containerRef.current;
        const words = containerRef.current.querySelectorAll(".word");
        const textElement = textElementRef.current;

        let needsResizing = false;

        words.forEach((word) => {
            if(word.offsetWidth > container.offsetWidth * .95) {
                needsResizing = true;
            }
        });

        if(textElement.offsetHeight > container.offsetHeight) {
            needsResizing = true;
        }

        if(needsResizing) {
            console.log("needs resizing");
            setTimeout(() => {
                setFontSize(fontSize * .9); 
            }, 0);
        } else {
            setDoneResizing(true);
        }

    }, [containerRef, textElementRef, fontSize]);

    //create event listener to trigger resizing as soon as data has loaded and the necessary elements rendered 
    useEffect(() => {
        if(dataBeingLoaded) {
            resizeText();
        }
    }, [dataBeingLoaded, resizeText]);
    
    //create event listener to check for window resizing
    useEffect(() => {       
        console.log("use effect that adds event listener running");
        let timeoutId;
        
        const handleWindowResize = () => {
            setDoneResizing(false);
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const width = window.innerWidth;
                console.log({width});
                let tempFontSize;
                for(const specs of breakpointsAndFonts) {
                    console.log({width: specs.width, fontSize: specs.fontSize})
                    if(width > specs.width) {
                        tempFontSize = specs.fontSize;
                        console.log("greater than")
                    }
                }
                setFontSize(tempFontSize);
                resizeText();
            }, 300);
        }

        window.addEventListener("resize", handleWindowResize);
        window.addEventListener("load", handleWindowResize);
        
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener("resize", handleWindowResize);
        };
    }, [breakpointsAndFonts, resizeText]);
    

    //fontSize is exported to be added to inline styling of the element holding the text. doneResizing is exported so the opacity of the text can be set to 0 until it is confirmed all text fits
    return [fontSize, doneResizing]
}

export default useShrinkingFont;