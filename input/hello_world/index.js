const y = 2;
var x = 1 + y;
x += 2;
x = x + 3;

while (x < 10) {
  x++;
}

for (i = 0; i < 10; i++) {
  i += y;
}

if (x >= 10) {
  console.log(x);
}

function f(x) {
  return x + 1;
}

console.log(f(x + 1));
