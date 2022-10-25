const characters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','1','2','3','4','5','6','7','8','9','!','@','#','$','%','&','=','?'];

export const generateJoinCode = () => {
    let code = [];
    while (code.length < 12) {
        code += characters[Math.floor(Math.random() * characters.length)];
    }
    return code;
}

const getRandomCardType = num => {
    if(num < .33) {
        return "multiple-choice"
    } else if(num < .66) {
        return "true-false"
    } else {
        return "flash"
    }
}

export default getRandomCardType;