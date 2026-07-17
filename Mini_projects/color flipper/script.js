
let text = document.createElement('p');
let btn = document.createElement('button');


text.innerHTML="HI";
btn.innerHTML="click me";

document.body.appendChild(text);
document.body.appendChild(btn);

btn.addEventListener("click",()=>{
    let color="#";
    let code="0123456789ABCDEF";

    // Math.random() gives random decimal value between 0 to 0.9999,so we have to multiply with value
    for(let i=1;i<=6;i++){
      color += code[Math.floor(Math.random()*code.length)];
    }
    
    document.body.style.backgroundColor= color;

    // console.log(typeof code);
   
    // console.log(code.length);
    // console.log(Math.floor(0.12));
    // console.log(Math.floor(0.89));
    // console.log(Math.floor(0.999));
    // console.log(code[5]);
    // console.log(code[7]);
    
});
