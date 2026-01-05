const k = '*';

const r = [];

let result = " ";

for (i = 0; i <= 8; i++) {
    r.push(k);
}

console.log(r);

for (const it of r) {
    result = result + "\n" + r;
}

console.log(result);