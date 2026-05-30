let result = document.getElementById('result');
let name = document.getElementById('name_input');
let btn = document.getElementById('msg');

btn.addEventListener("click",()=>{

    if(name.value === ""){
        alert("please enter your name");
    }
    else{
         result.innerText = "Hello"+" "+name.value;
         result.style.color="green";
    }
    name.value="";

})




