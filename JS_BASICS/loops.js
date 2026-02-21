//for in loop
let r=[{
    name : "kanna",
    age :21,
    g:"male"
},{
    name : "srinu",
    age :22,
    g:"male"
    
},{
    name : "ayyappa",
    age :23,
    g:"male"}]

for (const key in r) {
console.log(r[key]);
}

//for of loop, ob = value not an index,console.log(arr[ob]);

let arr=["Hi","hello"];

for(const ob of arr){
  console.log(ob);
}