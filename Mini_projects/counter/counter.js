let count=0;
let heading = document.createElement('h1');
heading.innerText=count;

let btn = document.createElement('button');
btn.innerText="click here";

let clr = document.createElement('button');
clr.innerText="clear";

btn.addEventListener("click",(e)=>{
   count++;
   heading.innerText=count;
})

clr.addEventListener("click",()=>{
count=0;
heading.innerText=count;
})


 document.body.appendChild(heading);
 document.body.appendChild(btn);
 document.body.appendChild(clr);


