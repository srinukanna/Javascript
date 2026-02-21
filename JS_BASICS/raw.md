Hoisting is a core JavaScript behavior where declarations of variables, functions, and classes are conceptually moved to the top of their containing scope during the compilation phase, before the code is executed. 
It's important to note that the code isn't physically moved; rather, the JavaScript engine processes the declarations in advance, allocating memory for them. 
How Hoisting Works by Declaration Type
The behavior of hoisting differs depending on how an identifier (variable, function, or class) is declared: 
var:
The declaration is hoisted to the top of its function or global scope.
It is automatically initialized with the value undefined.
Assignments are not hoisted and occur when the execution flow reaches that line of code.
javascript
console.log(x); // Output: undefined
var x = 5;
console.log(x); // Output: 5
let and const:
Declarations are also hoisted, but only to the top of their block scope.
They are not initialized with a default value like var.
Accessing a let or const variable before the line of its actual declaration results in a ReferenceError because it is in a state known as the Temporal Dead Zone (TDZ).
javascript
// console.log(y); // Throws ReferenceError: Cannot access 'y' before initialization
let y = 10;
Function Declarations:
The entire function declaration, including its body (logic), is hoisted to the top of its scope.
This allows you to call a function before it appears in the code.
javascript
sayHello(); // Output: "Hello!"

function sayHello() {
  console.log("Hello!");
}
Function Expressions/Arrow Functions:
These are treated as variable declarations (var, let, or const).
Only the variable declaration part is hoisted, not the function assignment. Calling them before the assignment line will result in a TypeError (if var is used, because the value is undefined) or ReferenceError (if let/const is used, due to the TDZ). 
Best Practices
To avoid confusion and potential bugs related to hoisting, it is generally recommended to: 
Always declare variables and functions at the beginning of their scope.
Use let and const instead of var in modern JavaScript to leverage block-scoping and the safety of the Temporal Dead Zone, which prevents accidental use before declaration.
Refer to style guides, such as the Airbnb JavaScript Style Guide, for consistent code organization. 