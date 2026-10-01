// function greet(callback){
//     callback("hello");
// }

// function sayhello(name){
//     console.log(name);
// }

// greet(sayhello);

// array destructuring
let arr = [1,2,3,4]
// order willl be same
let [,,thirdNum] = arr;
console.log(thirdNum);

//spread operator

let  arr2=[...arr];
console.log(arr2);

//object destructuring

let obj = {
    id : 101,
    name : "srinu",
    age : 20,
    address:"thummalapalem"
}

//same properties must be assign 

 let {id:orgId,name:myName,age:myAge,myvillage} = obj;
 console.log(orgId);
 console.log(myName);

 let obj1 = {
    id : 102,
    name : "srinukanna",
    age : 20,
    address:"thummalapalem"
}

// unordered datastructure can access with flexible 

let {address:localName,age:userAge} = obj;
console.log(localName,userAge);

//callbacks - function which is used as a parameter to another function
 function orderService(){
    setTimeout(()=>{
        console.log("order succesful");
   },2000);
}

 function paymentService(){
     setTimeout(()=>{
        console.log("payment success")
   },3000);
    
}
async function main(){
    await paymentService();
    await orderService();
}


//promises