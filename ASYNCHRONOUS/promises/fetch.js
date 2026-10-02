const div = document.querySelector('.img');

fetch("https://randomuser.me/api/")
.then((response)=>{
    return response.json();
})
.then((data)=>{
    console.log(data);
    const Random_data = data.results[0];
    return div.innerHTML=`
    <img src = "${Random_data.picture.large}">
    <p>Name :${Random_data.name.first} ${Random_data.name.last}</p>
    <p>Mail:${Random_data.email}</p>`;
})
.then((data)=>{
    console.log(data)}
).catch((error)=>{
    console.log("the error is:",error);
})




