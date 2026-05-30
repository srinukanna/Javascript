# Variables
```
let character = "Hello";
let count = 8;
let rows = [];
```

* Declaring a variable with the let keyword allows it to be reassigned. This means you could change character later to be a completely different value.

For this project, you will not want to change these variable values. So instead, you should use const to declare them. const variables are special.

* First, a const variable cannot be reassigned like a let variable. This code would throw an error:

Example Code 1:
```
const firstName = "Naomi";
firstName = "Jessica";
```
A const variable also cannot be uninitialized. This code would throw an error:

Example Code 2:
```
const firstName;
Replace your let keywords with const.
console.log(kanna1);
console.log(kanna);

function kannalegend()
{
    console.log(kanna.length);
}
kannalegend();*/
```

# Hoisting
```
console.log(x); // Output: undefined
var x = 5;
console.log(x); // Output: 5

```

### Variable naming rules

* Your variable names should describe what the data represents. 

For example, instead of using a name like x, a more descriptive name such as age or points makes your code easier to understand.

```
// Bad variable names
let x = 10;
let y = "John";

// Good variable names
let age = 10;

```

* Variables in JavaScript must begin with a letter, an underscore (_), or a dollar sign ($). 

* They cannot start with a number.

```
// Valid variable names
let age;
let _score;
let $total;

// Invalid variable names
let 1stPlace; // starts with a number
```

* Variable names are case-sensitive,
Ex: Age,age both are different

```
let age = 25;
let Age = 30;
console.log(age); // 25
console.log(Age); // 30
```

* camelCase is where the first word is all lowercase and each subsequent word starts with an uppercase letter.

```
let thisIsCamelCase;
let anotherExampleVariable;
let freeCodeCampStudents;
```

* you cannot use as variable names, such as let, const, function, or return,(reserved).

* special characters like exclamation points (!) or at (@) symbols, in your variable names. 

* It is best to keep variable names readable by using letters, numbers, underscores, or dollar signs.


## Declaration of variables
* let
* const
* var

```
let a=10;
let a;// cant redeclare 
let a=40;// not possible (cant be redeclare)
a=40;// only this one is possible (reassign)

var a = 10;
var a; we can do this
var a = 30 or a = 30 // both redeclare and reassign can be possible

const a =40;// fixed value  
const a = 50 or a = 50 // we cant able to do these two or we cant redeclare and reassign or reassign

```