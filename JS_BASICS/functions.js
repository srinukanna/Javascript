// normal fun
function name_init()
{
    console.log("kanna");
}
name_init();

// arrow function
h=()=>console.log("hello");
h();
f=(a,b)=>
    {
        console.log("add the two numbers");
        let c= a+b;
        console.log(c);
    }
f(5,4);

let a=5,b=10;
function add()
{
  console.log(a+b);
}
add();