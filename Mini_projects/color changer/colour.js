let green_button = document.createElement('button');
green_button.innerText="Green";

let blue_button = document.createElement('button');
blue_button.innerText="Blue";

let black_button = document.createElement('button');
black_button.innerText="black";

green_button.addEventListener("click",()=>{
    document.body.style.backgroundColor="green"; 
    green_button.style.backgroundColor="green";
    green_button.style.color="white";

}) 

black_button.addEventListener("click",()=>{
    document.body.style.backgroundColor="black";
})
blue_button.addEventListener("click",()=>{
    document.body.style.backgroundColor="blue";
})


document.body.appendChild(green_button); // dont keep double quotes
document.body.appendChild(blue_button);
document.body.appendChild(black_button);