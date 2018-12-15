var get = require('get');
var let_i_equal_2 = require('let_i_equal_2');
var i_times_i_lte_p = require('i_times_i_lte_p');
var i_plusplus = require('i_plusplus');
var p_mod_i_tripleequals_zero = require('p_mod_i_tripleequals_zero');
var let_maybePrime_equal_two = require('let_maybePrime_equal_two');
var let_prime_equal_zero = require('let_prime_equal_zero');
var nth_gte_zero = require('nth_gte_zero');
var nth_minusequal_one = require('nth_minusequal_one');
var prime_equal_maybePrime = require('prime_equal_maybePrime');
var maybePrime_plusequal_one = require('maybePrime_plusequal_one');

const context = [{}];

function isPrime(context, p) {
    context.unshift({});
    get(context, 'p').p = p;
    retval = undefined;

    for (let_i_equal_2(context); i_times_i_lte_p(context); i_plusplus(context)) {
      if (p_mod_i_tripleequals_zero(context)) {
        retval = false;
        context.shift();
        return retval;
      }
    }

    retval = true;
    context.shift();
    return retval;
}

get(context, 'isPrime').isPrime = isPrime;
  
function nthPrime(context, nth) {
    context.unshift({});
    get(context, 'nth').nth = nth;
    retval = undefined;

    let_maybePrime_equal_two(context);
    let_prime_equal_zero(context);
    while (nth_gte_zero(context)) {
        if (get(context, 'isPrime').isPrime(context, get(context, 'maybePrime').maybePrime)) {
            nth_minusequal_one(context);
            prime_equal_maybePrime(context);
        }
        maybePrime_plusequal_one(context);
    }

    retval = get(context, 'prime').prime;
    context.shift();
    return retval;
}

get(context, 'nthPrime').nthPrime = nthPrime;

console.log(get(context, 'nthPrime').nthPrime(context, parseInt(process.argv[2])));
