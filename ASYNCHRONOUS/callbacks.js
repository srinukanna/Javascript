function greet(callback){
    callback("hello");
}

function sayhello(name){
    console.log(name);
}

greet(sayhello);