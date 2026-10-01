fetch("https://randomuser.me/api/")
.then((response)=>{
    return response.json();
})
.then((data)=>{
    console.log(data);
    return  data.results[0].gender;
})
.then((data)=>{
    console.log(data)}
);



