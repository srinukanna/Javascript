let array = ["kanna","kabali","srinu"]
array.push("hero");

let obj = [
    {
     Movie: "lion",
     Number: 1,
     Director:"Kanna"
    },
    {
     Movie: "Kabali",
     Number: 1,
     Director:"Kanna"
    },
    {
     Movie: "Kabali",
     Number: 1,
     Director:"Kanna"
    },
    {
     Movie: "Kabali",
     Number: 1,
     Director:"Kanna"
    },
    {
     Movie: "King",
     Number: 1,
     Director:"kanna"
    }
];


for(const key in obj)
{
  console.log(obj[key]);
}