let input = document.getElementById('input_message');
let add_btn = document.getElementById('add_button');
let clear_btn = document.getElementById('clear_button');

add_btn.addEventListener("click",()=>{
   let body = document.querySelector('body');
   let div=document.createElement('div');
   let p = document.createElement('p');
   p.innerText=input.value;
   console.log(p.innerText);

   body.appendChild(div);

   div.appendChild(p);
   div.appendChild(add_btn);
   div.appendChild(clear_btn);

});

clear_btn.addEventListener("click",()=>{
   p.innerText="";
});


