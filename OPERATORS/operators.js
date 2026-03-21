/*
==,===,!=,!==,<,>,<=,>=
*/

const prompt=require("prompt-sync")() 

const userplay=prompt("do u want to play?")

const condition=userplay.toLowerCase() === "yes"
console.log(condition)

if(condition)
{
    console.log("okay we will play")
}
