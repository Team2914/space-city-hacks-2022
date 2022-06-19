import myData from './prompts.json';

export const getPrompt = () => {
    return myData[Math.floor(Math.random()*myData.length)].prompt;
}
