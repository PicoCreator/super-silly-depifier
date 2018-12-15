const get = require('get');
const const_y_equals_2 = require('const_y_equals_2');
const var_x_equals_1_plus_y = require('var_x_equals_1_plus_y');
const x_plusequals_2 = require('x_plusequals_2');
const x_equals_x_plus_3 = require('x_equals_x_plus_3');
const x_lesser_10 = require('x_lesser_10');
const xplusplus = require('xplusplus');
const i_equals_0 = require('i_equals_0');
const i_lesser_10 = require('i_lesser_10');
const iplusplus = require('iplusplus');
const i_plusequals_y = require('i_plusequals_y');
const x_greaterequals_10 = require('x_greaterequals_10');
const x_plus_1 = require('x_plus_1');

const context = [{}];

const_y_equals_2(context);
var_x_equals_1_plus_y(context);
x_plusequals_2(context);
x_equals_x_plus_3(context);
while (x_lesser_10(context))
{
xplusplus(context);

}
for (i_equals_0(context);i_lesser_10(context);iplusplus(context)){
i_plusequals_y(context);

}
if (x_greaterequals_10(context))
{
console.log(get(context, 'x').x);
}
function f(x) {
context.unshift({})
get(context, 'x').x = x;
retval = undefined

retval = x_plus_1(context);
context.shift();
return retval;

}
get(context, 'f').f = f;console.log(get(context, 'f').f(get(context, 'x').x + 1)
);