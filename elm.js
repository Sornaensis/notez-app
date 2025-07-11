(function(scope){
'use strict';

function F(arity, fun, wrapper) {
  wrapper.a = arity;
  wrapper.f = fun;
  return wrapper;
}

function F2(fun) {
  return F(2, fun, function(a) { return function(b) { return fun(a,b); }; })
}
function F3(fun) {
  return F(3, fun, function(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  });
}
function F4(fun) {
  return F(4, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  });
}
function F5(fun) {
  return F(5, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  });
}
function F6(fun) {
  return F(6, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  });
}
function F7(fun) {
  return F(7, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  });
}
function F8(fun) {
  return F(8, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  });
}
function F9(fun) {
  return F(9, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  });
}

function A2(fun, a, b) {
  return fun.a === 2 ? fun.f(a, b) : fun(a)(b);
}
function A3(fun, a, b, c) {
  return fun.a === 3 ? fun.f(a, b, c) : fun(a)(b)(c);
}
function A4(fun, a, b, c, d) {
  return fun.a === 4 ? fun.f(a, b, c, d) : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e) {
  return fun.a === 5 ? fun.f(a, b, c, d, e) : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f) {
  return fun.a === 6 ? fun.f(a, b, c, d, e, f) : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g) {
  return fun.a === 7 ? fun.f(a, b, c, d, e, f, g) : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h) {
  return fun.a === 8 ? fun.f(a, b, c, d, e, f, g, h) : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i) {
  return fun.a === 9 ? fun.f(a, b, c, d, e, f, g, h, i) : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}




// EQUALITY

function _Utils_eq(x, y)
{
	for (
		var pair, stack = [], isEqual = _Utils_eqHelp(x, y, 0, stack);
		isEqual && (pair = stack.pop());
		isEqual = _Utils_eqHelp(pair.a, pair.b, 0, stack)
		)
	{}

	return isEqual;
}

function _Utils_eqHelp(x, y, depth, stack)
{
	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object' || x === null || y === null)
	{
		typeof x === 'function' && _Debug_crash(5);
		return false;
	}

	if (depth > 100)
	{
		stack.push(_Utils_Tuple2(x,y));
		return true;
	}

	/**_UNUSED/
	if (x.$ === 'Set_elm_builtin')
	{
		x = $elm$core$Set$toList(x);
		y = $elm$core$Set$toList(y);
	}
	if (x.$ === 'RBNode_elm_builtin' || x.$ === 'RBEmpty_elm_builtin')
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	/**/
	if (x.$ < 0)
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	for (var key in x)
	{
		if (!_Utils_eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

var _Utils_equal = F2(_Utils_eq);
var _Utils_notEqual = F2(function(a, b) { return !_Utils_eq(a,b); });



// COMPARISONS

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

function _Utils_cmp(x, y, ord)
{
	if (typeof x !== 'object')
	{
		return x === y ? /*EQ*/ 0 : x < y ? /*LT*/ -1 : /*GT*/ 1;
	}

	/**_UNUSED/
	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? 0 : a < b ? -1 : 1;
	}
	//*/

	/**/
	if (typeof x.$ === 'undefined')
	//*/
	/**_UNUSED/
	if (x.$[0] === '#')
	//*/
	{
		return (ord = _Utils_cmp(x.a, y.a))
			? ord
			: (ord = _Utils_cmp(x.b, y.b))
				? ord
				: _Utils_cmp(x.c, y.c);
	}

	// traverse conses until end of a list or a mismatch
	for (; x.b && y.b && !(ord = _Utils_cmp(x.a, y.a)); x = x.b, y = y.b) {} // WHILE_CONSES
	return ord || (x.b ? /*GT*/ 1 : y.b ? /*LT*/ -1 : /*EQ*/ 0);
}

var _Utils_lt = F2(function(a, b) { return _Utils_cmp(a, b) < 0; });
var _Utils_le = F2(function(a, b) { return _Utils_cmp(a, b) < 1; });
var _Utils_gt = F2(function(a, b) { return _Utils_cmp(a, b) > 0; });
var _Utils_ge = F2(function(a, b) { return _Utils_cmp(a, b) >= 0; });

var _Utils_compare = F2(function(x, y)
{
	var n = _Utils_cmp(x, y);
	return n < 0 ? $elm$core$Basics$LT : n ? $elm$core$Basics$GT : $elm$core$Basics$EQ;
});


// COMMON VALUES

var _Utils_Tuple0 = 0;
var _Utils_Tuple0_UNUSED = { $: '#0' };

function _Utils_Tuple2(a, b) { return { a: a, b: b }; }
function _Utils_Tuple2_UNUSED(a, b) { return { $: '#2', a: a, b: b }; }

function _Utils_Tuple3(a, b, c) { return { a: a, b: b, c: c }; }
function _Utils_Tuple3_UNUSED(a, b, c) { return { $: '#3', a: a, b: b, c: c }; }

function _Utils_chr(c) { return c; }
function _Utils_chr_UNUSED(c) { return new String(c); }


// RECORDS

function _Utils_update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


// APPEND

var _Utils_append = F2(_Utils_ap);

function _Utils_ap(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (!xs.b)
	{
		return ys;
	}
	var root = _List_Cons(xs.a, ys);
	xs = xs.b
	for (var curr = root; xs.b; xs = xs.b) // WHILE_CONS
	{
		curr = curr.b = _List_Cons(xs.a, ys);
	}
	return root;
}



var _List_Nil = { $: 0 };
var _List_Nil_UNUSED = { $: '[]' };

function _List_Cons(hd, tl) { return { $: 1, a: hd, b: tl }; }
function _List_Cons_UNUSED(hd, tl) { return { $: '::', a: hd, b: tl }; }


var _List_cons = F2(_List_Cons);

function _List_fromArray(arr)
{
	var out = _List_Nil;
	for (var i = arr.length; i--; )
	{
		out = _List_Cons(arr[i], out);
	}
	return out;
}

function _List_toArray(xs)
{
	for (var out = []; xs.b; xs = xs.b) // WHILE_CONS
	{
		out.push(xs.a);
	}
	return out;
}

var _List_map2 = F3(function(f, xs, ys)
{
	for (var arr = []; xs.b && ys.b; xs = xs.b, ys = ys.b) // WHILE_CONSES
	{
		arr.push(A2(f, xs.a, ys.a));
	}
	return _List_fromArray(arr);
});

var _List_map3 = F4(function(f, xs, ys, zs)
{
	for (var arr = []; xs.b && ys.b && zs.b; xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A3(f, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map4 = F5(function(f, ws, xs, ys, zs)
{
	for (var arr = []; ws.b && xs.b && ys.b && zs.b; ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A4(f, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map5 = F6(function(f, vs, ws, xs, ys, zs)
{
	for (var arr = []; vs.b && ws.b && xs.b && ys.b && zs.b; vs = vs.b, ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A5(f, vs.a, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_sortBy = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		return _Utils_cmp(f(a), f(b));
	}));
});

var _List_sortWith = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		var ord = A2(f, a, b);
		return ord === $elm$core$Basics$EQ ? 0 : ord === $elm$core$Basics$LT ? -1 : 1;
	}));
});



var _JsArray_empty = [];

function _JsArray_singleton(value)
{
    return [value];
}

function _JsArray_length(array)
{
    return array.length;
}

var _JsArray_initialize = F3(function(size, offset, func)
{
    var result = new Array(size);

    for (var i = 0; i < size; i++)
    {
        result[i] = func(offset + i);
    }

    return result;
});

var _JsArray_initializeFromList = F2(function (max, ls)
{
    var result = new Array(max);

    for (var i = 0; i < max && ls.b; i++)
    {
        result[i] = ls.a;
        ls = ls.b;
    }

    result.length = i;
    return _Utils_Tuple2(result, ls);
});

var _JsArray_unsafeGet = F2(function(index, array)
{
    return array[index];
});

var _JsArray_unsafeSet = F3(function(index, value, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[index] = value;
    return result;
});

var _JsArray_push = F2(function(value, array)
{
    var length = array.length;
    var result = new Array(length + 1);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[length] = value;
    return result;
});

var _JsArray_foldl = F3(function(func, acc, array)
{
    var length = array.length;

    for (var i = 0; i < length; i++)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_foldr = F3(function(func, acc, array)
{
    for (var i = array.length - 1; i >= 0; i--)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_map = F2(function(func, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = func(array[i]);
    }

    return result;
});

var _JsArray_indexedMap = F3(function(func, offset, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = A2(func, offset + i, array[i]);
    }

    return result;
});

var _JsArray_slice = F3(function(from, to, array)
{
    return array.slice(from, to);
});

var _JsArray_appendN = F3(function(n, dest, source)
{
    var destLen = dest.length;
    var itemsToCopy = n - destLen;

    if (itemsToCopy > source.length)
    {
        itemsToCopy = source.length;
    }

    var size = destLen + itemsToCopy;
    var result = new Array(size);

    for (var i = 0; i < destLen; i++)
    {
        result[i] = dest[i];
    }

    for (var i = 0; i < itemsToCopy; i++)
    {
        result[i + destLen] = source[i];
    }

    return result;
});



// LOG

var _Debug_log = F2(function(tag, value)
{
	return value;
});

var _Debug_log_UNUSED = F2(function(tag, value)
{
	console.log(tag + ': ' + _Debug_toString(value));
	return value;
});


// TODOS

function _Debug_todo(moduleName, region)
{
	return function(message) {
		_Debug_crash(8, moduleName, region, message);
	};
}

function _Debug_todoCase(moduleName, region, value)
{
	return function(message) {
		_Debug_crash(9, moduleName, region, value, message);
	};
}


// TO STRING

function _Debug_toString(value)
{
	return '<internals>';
}

function _Debug_toString_UNUSED(value)
{
	return _Debug_toAnsiString(false, value);
}

function _Debug_toAnsiString(ansi, value)
{
	if (typeof value === 'function')
	{
		return _Debug_internalColor(ansi, '<function>');
	}

	if (typeof value === 'boolean')
	{
		return _Debug_ctorColor(ansi, value ? 'True' : 'False');
	}

	if (typeof value === 'number')
	{
		return _Debug_numberColor(ansi, value + '');
	}

	if (value instanceof String)
	{
		return _Debug_charColor(ansi, "'" + _Debug_addSlashes(value, true) + "'");
	}

	if (typeof value === 'string')
	{
		return _Debug_stringColor(ansi, '"' + _Debug_addSlashes(value, false) + '"');
	}

	if (typeof value === 'object' && '$' in value)
	{
		var tag = value.$;

		if (typeof tag === 'number')
		{
			return _Debug_internalColor(ansi, '<internals>');
		}

		if (tag[0] === '#')
		{
			var output = [];
			for (var k in value)
			{
				if (k === '$') continue;
				output.push(_Debug_toAnsiString(ansi, value[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (tag === 'Set_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Set')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Set$toList(value));
		}

		if (tag === 'RBNode_elm_builtin' || tag === 'RBEmpty_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Dict')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Dict$toList(value));
		}

		if (tag === 'Array_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Array')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Array$toList(value));
		}

		if (tag === '::' || tag === '[]')
		{
			var output = '[';

			value.b && (output += _Debug_toAnsiString(ansi, value.a), value = value.b)

			for (; value.b; value = value.b) // WHILE_CONS
			{
				output += ',' + _Debug_toAnsiString(ansi, value.a);
			}
			return output + ']';
		}

		var output = '';
		for (var i in value)
		{
			if (i === '$') continue;
			var str = _Debug_toAnsiString(ansi, value[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '[' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return _Debug_ctorColor(ansi, tag) + output;
	}

	if (typeof DataView === 'function' && value instanceof DataView)
	{
		return _Debug_stringColor(ansi, '<' + value.byteLength + ' bytes>');
	}

	if (typeof File !== 'undefined' && value instanceof File)
	{
		return _Debug_internalColor(ansi, '<' + value.name + '>');
	}

	if (typeof value === 'object')
	{
		var output = [];
		for (var key in value)
		{
			var field = key[0] === '_' ? key.slice(1) : key;
			output.push(_Debug_fadeColor(ansi, field) + ' = ' + _Debug_toAnsiString(ansi, value[key]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return _Debug_internalColor(ansi, '<internals>');
}

function _Debug_addSlashes(str, isChar)
{
	var s = str
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/\t/g, '\\t')
		.replace(/\r/g, '\\r')
		.replace(/\v/g, '\\v')
		.replace(/\0/g, '\\0');

	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}

function _Debug_ctorColor(ansi, string)
{
	return ansi ? '\x1b[96m' + string + '\x1b[0m' : string;
}

function _Debug_numberColor(ansi, string)
{
	return ansi ? '\x1b[95m' + string + '\x1b[0m' : string;
}

function _Debug_stringColor(ansi, string)
{
	return ansi ? '\x1b[93m' + string + '\x1b[0m' : string;
}

function _Debug_charColor(ansi, string)
{
	return ansi ? '\x1b[92m' + string + '\x1b[0m' : string;
}

function _Debug_fadeColor(ansi, string)
{
	return ansi ? '\x1b[37m' + string + '\x1b[0m' : string;
}

function _Debug_internalColor(ansi, string)
{
	return ansi ? '\x1b[36m' + string + '\x1b[0m' : string;
}

function _Debug_toHexDigit(n)
{
	return String.fromCharCode(n < 10 ? 48 + n : 55 + n);
}


// CRASH


function _Debug_crash(identifier)
{
	throw new Error('https://github.com/elm/core/blob/1.0.0/hints/' + identifier + '.md');
}


function _Debug_crash_UNUSED(identifier, fact1, fact2, fact3, fact4)
{
	switch(identifier)
	{
		case 0:
			throw new Error('What node should I take over? In JavaScript I need something like:\n\n    Elm.Main.init({\n        node: document.getElementById("elm-node")\n    })\n\nYou need to do this with any Browser.sandbox or Browser.element program.');

		case 1:
			throw new Error('Browser.application programs cannot handle URLs like this:\n\n    ' + document.location.href + '\n\nWhat is the root? The root of your file system? Try looking at this program with `elm reactor` or some other server.');

		case 2:
			var jsonErrorString = fact1;
			throw new Error('Problem with the flags given to your Elm program on initialization.\n\n' + jsonErrorString);

		case 3:
			var portName = fact1;
			throw new Error('There can only be one port named `' + portName + '`, but your program has multiple.');

		case 4:
			var portName = fact1;
			var problem = fact2;
			throw new Error('Trying to send an unexpected type of value through port `' + portName + '`:\n' + problem);

		case 5:
			throw new Error('Trying to use `(==)` on functions.\nThere is no way to know if functions are "the same" in the Elm sense.\nRead more about this at https://package.elm-lang.org/packages/elm/core/latest/Basics#== which describes why it is this way and what the better version will look like.');

		case 6:
			var moduleName = fact1;
			throw new Error('Your page is loading multiple Elm scripts with a module named ' + moduleName + '. Maybe a duplicate script is getting loaded accidentally? If not, rename one of them so I know which is which!');

		case 8:
			var moduleName = fact1;
			var region = fact2;
			var message = fact3;
			throw new Error('TODO in module `' + moduleName + '` ' + _Debug_regionToString(region) + '\n\n' + message);

		case 9:
			var moduleName = fact1;
			var region = fact2;
			var value = fact3;
			var message = fact4;
			throw new Error(
				'TODO in module `' + moduleName + '` from the `case` expression '
				+ _Debug_regionToString(region) + '\n\nIt received the following value:\n\n    '
				+ _Debug_toString(value).replace('\n', '\n    ')
				+ '\n\nBut the branch that handles it says:\n\n    ' + message.replace('\n', '\n    ')
			);

		case 10:
			throw new Error('Bug in https://github.com/elm/virtual-dom/issues');

		case 11:
			throw new Error('Cannot perform mod 0. Division by zero error.');
	}
}

function _Debug_regionToString(region)
{
	if (region.bC.a2 === region.bS.a2)
	{
		return 'on line ' + region.bC.a2;
	}
	return 'on lines ' + region.bC.a2 + ' through ' + region.bS.a2;
}



// MATH

var _Basics_add = F2(function(a, b) { return a + b; });
var _Basics_sub = F2(function(a, b) { return a - b; });
var _Basics_mul = F2(function(a, b) { return a * b; });
var _Basics_fdiv = F2(function(a, b) { return a / b; });
var _Basics_idiv = F2(function(a, b) { return (a / b) | 0; });
var _Basics_pow = F2(Math.pow);

var _Basics_remainderBy = F2(function(b, a) { return a % b; });

// https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/divmodnote-letter.pdf
var _Basics_modBy = F2(function(modulus, x)
{
	var answer = x % modulus;
	return modulus === 0
		? _Debug_crash(11)
		:
	((answer > 0 && modulus < 0) || (answer < 0 && modulus > 0))
		? answer + modulus
		: answer;
});


// TRIGONOMETRY

var _Basics_pi = Math.PI;
var _Basics_e = Math.E;
var _Basics_cos = Math.cos;
var _Basics_sin = Math.sin;
var _Basics_tan = Math.tan;
var _Basics_acos = Math.acos;
var _Basics_asin = Math.asin;
var _Basics_atan = Math.atan;
var _Basics_atan2 = F2(Math.atan2);


// MORE MATH

function _Basics_toFloat(x) { return x; }
function _Basics_truncate(n) { return n | 0; }
function _Basics_isInfinite(n) { return n === Infinity || n === -Infinity; }

var _Basics_ceiling = Math.ceil;
var _Basics_floor = Math.floor;
var _Basics_round = Math.round;
var _Basics_sqrt = Math.sqrt;
var _Basics_log = Math.log;
var _Basics_isNaN = isNaN;


// BOOLEANS

function _Basics_not(bool) { return !bool; }
var _Basics_and = F2(function(a, b) { return a && b; });
var _Basics_or  = F2(function(a, b) { return a || b; });
var _Basics_xor = F2(function(a, b) { return a !== b; });



var _String_cons = F2(function(chr, str)
{
	return chr + str;
});

function _String_uncons(string)
{
	var word = string.charCodeAt(0);
	return !isNaN(word)
		? $elm$core$Maybe$Just(
			0xD800 <= word && word <= 0xDBFF
				? _Utils_Tuple2(_Utils_chr(string[0] + string[1]), string.slice(2))
				: _Utils_Tuple2(_Utils_chr(string[0]), string.slice(1))
		)
		: $elm$core$Maybe$Nothing;
}

var _String_append = F2(function(a, b)
{
	return a + b;
});

function _String_length(str)
{
	return str.length;
}

var _String_map = F2(function(func, string)
{
	var len = string.length;
	var array = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = string.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			array[i] = func(_Utils_chr(string[i] + string[i+1]));
			i += 2;
			continue;
		}
		array[i] = func(_Utils_chr(string[i]));
		i++;
	}
	return array.join('');
});

var _String_filter = F2(function(isGood, str)
{
	var arr = [];
	var len = str.length;
	var i = 0;
	while (i < len)
	{
		var char = str[i];
		var word = str.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += str[i];
			i++;
		}

		if (isGood(_Utils_chr(char)))
		{
			arr.push(char);
		}
	}
	return arr.join('');
});

function _String_reverse(str)
{
	var len = str.length;
	var arr = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = str.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			arr[len - i] = str[i + 1];
			i++;
			arr[len - i] = str[i - 1];
			i++;
		}
		else
		{
			arr[len - i] = str[i];
			i++;
		}
	}
	return arr.join('');
}

var _String_foldl = F3(function(func, state, string)
{
	var len = string.length;
	var i = 0;
	while (i < len)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += string[i];
			i++;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_foldr = F3(function(func, state, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_split = F2(function(sep, str)
{
	return str.split(sep);
});

var _String_join = F2(function(sep, strs)
{
	return strs.join(sep);
});

var _String_slice = F3(function(start, end, str) {
	return str.slice(start, end);
});

function _String_trim(str)
{
	return str.trim();
}

function _String_trimLeft(str)
{
	return str.replace(/^\s+/, '');
}

function _String_trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function _String_words(str)
{
	return _List_fromArray(str.trim().split(/\s+/g));
}

function _String_lines(str)
{
	return _List_fromArray(str.split(/\r\n|\r|\n/g));
}

function _String_toUpper(str)
{
	return str.toUpperCase();
}

function _String_toLower(str)
{
	return str.toLowerCase();
}

var _String_any = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (isGood(_Utils_chr(char)))
		{
			return true;
		}
	}
	return false;
});

var _String_all = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (!isGood(_Utils_chr(char)))
		{
			return false;
		}
	}
	return true;
});

var _String_contains = F2(function(sub, str)
{
	return str.indexOf(sub) > -1;
});

var _String_startsWith = F2(function(sub, str)
{
	return str.indexOf(sub) === 0;
});

var _String_endsWith = F2(function(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
});

var _String_indexes = F2(function(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _List_Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _List_fromArray(is);
});


// TO STRING

function _String_fromNumber(number)
{
	return number + '';
}


// INT CONVERSIONS

function _String_toInt(str)
{
	var total = 0;
	var code0 = str.charCodeAt(0);
	var start = code0 == 0x2B /* + */ || code0 == 0x2D /* - */ ? 1 : 0;

	for (var i = start; i < str.length; ++i)
	{
		var code = str.charCodeAt(i);
		if (code < 0x30 || 0x39 < code)
		{
			return $elm$core$Maybe$Nothing;
		}
		total = 10 * total + code - 0x30;
	}

	return i == start
		? $elm$core$Maybe$Nothing
		: $elm$core$Maybe$Just(code0 == 0x2D ? -total : total);
}


// FLOAT CONVERSIONS

function _String_toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return $elm$core$Maybe$Nothing;
	}
	var n = +s;
	// faster isNaN check
	return n === n ? $elm$core$Maybe$Just(n) : $elm$core$Maybe$Nothing;
}

function _String_fromList(chars)
{
	return _List_toArray(chars).join('');
}




function _Char_toCode(char)
{
	var code = char.charCodeAt(0);
	if (0xD800 <= code && code <= 0xDBFF)
	{
		return (code - 0xD800) * 0x400 + char.charCodeAt(1) - 0xDC00 + 0x10000
	}
	return code;
}

function _Char_fromCode(code)
{
	return _Utils_chr(
		(code < 0 || 0x10FFFF < code)
			? '\uFFFD'
			:
		(code <= 0xFFFF)
			? String.fromCharCode(code)
			:
		(code -= 0x10000,
			String.fromCharCode(Math.floor(code / 0x400) + 0xD800, code % 0x400 + 0xDC00)
		)
	);
}

function _Char_toUpper(char)
{
	return _Utils_chr(char.toUpperCase());
}

function _Char_toLower(char)
{
	return _Utils_chr(char.toLowerCase());
}

function _Char_toLocaleUpper(char)
{
	return _Utils_chr(char.toLocaleUpperCase());
}

function _Char_toLocaleLower(char)
{
	return _Utils_chr(char.toLocaleLowerCase());
}



/**_UNUSED/
function _Json_errorToString(error)
{
	return $elm$json$Json$Decode$errorToString(error);
}
//*/


// CORE DECODERS

function _Json_succeed(msg)
{
	return {
		$: 0,
		a: msg
	};
}

function _Json_fail(msg)
{
	return {
		$: 1,
		a: msg
	};
}

function _Json_decodePrim(decoder)
{
	return { $: 2, b: decoder };
}

var _Json_decodeInt = _Json_decodePrim(function(value) {
	return (typeof value !== 'number')
		? _Json_expecting('an INT', value)
		:
	(-2147483647 < value && value < 2147483647 && (value | 0) === value)
		? $elm$core$Result$Ok(value)
		:
	(isFinite(value) && !(value % 1))
		? $elm$core$Result$Ok(value)
		: _Json_expecting('an INT', value);
});

var _Json_decodeBool = _Json_decodePrim(function(value) {
	return (typeof value === 'boolean')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a BOOL', value);
});

var _Json_decodeFloat = _Json_decodePrim(function(value) {
	return (typeof value === 'number')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a FLOAT', value);
});

var _Json_decodeValue = _Json_decodePrim(function(value) {
	return $elm$core$Result$Ok(_Json_wrap(value));
});

var _Json_decodeString = _Json_decodePrim(function(value) {
	return (typeof value === 'string')
		? $elm$core$Result$Ok(value)
		: (value instanceof String)
			? $elm$core$Result$Ok(value + '')
			: _Json_expecting('a STRING', value);
});

function _Json_decodeList(decoder) { return { $: 3, b: decoder }; }
function _Json_decodeArray(decoder) { return { $: 4, b: decoder }; }

function _Json_decodeNull(value) { return { $: 5, c: value }; }

var _Json_decodeField = F2(function(field, decoder)
{
	return {
		$: 6,
		d: field,
		b: decoder
	};
});

var _Json_decodeIndex = F2(function(index, decoder)
{
	return {
		$: 7,
		e: index,
		b: decoder
	};
});

function _Json_decodeKeyValuePairs(decoder)
{
	return {
		$: 8,
		b: decoder
	};
}

function _Json_mapMany(f, decoders)
{
	return {
		$: 9,
		f: f,
		g: decoders
	};
}

var _Json_andThen = F2(function(callback, decoder)
{
	return {
		$: 10,
		b: decoder,
		h: callback
	};
});

function _Json_oneOf(decoders)
{
	return {
		$: 11,
		g: decoders
	};
}


// DECODING OBJECTS

var _Json_map1 = F2(function(f, d1)
{
	return _Json_mapMany(f, [d1]);
});

var _Json_map2 = F3(function(f, d1, d2)
{
	return _Json_mapMany(f, [d1, d2]);
});

var _Json_map3 = F4(function(f, d1, d2, d3)
{
	return _Json_mapMany(f, [d1, d2, d3]);
});

var _Json_map4 = F5(function(f, d1, d2, d3, d4)
{
	return _Json_mapMany(f, [d1, d2, d3, d4]);
});

var _Json_map5 = F6(function(f, d1, d2, d3, d4, d5)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5]);
});

var _Json_map6 = F7(function(f, d1, d2, d3, d4, d5, d6)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6]);
});

var _Json_map7 = F8(function(f, d1, d2, d3, d4, d5, d6, d7)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
});

var _Json_map8 = F9(function(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
});


// DECODE

var _Json_runOnString = F2(function(decoder, string)
{
	try
	{
		var value = JSON.parse(string);
		return _Json_runHelp(decoder, value);
	}
	catch (e)
	{
		return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'This is not valid JSON! ' + e.message, _Json_wrap(string)));
	}
});

var _Json_run = F2(function(decoder, value)
{
	return _Json_runHelp(decoder, _Json_unwrap(value));
});

function _Json_runHelp(decoder, value)
{
	switch (decoder.$)
	{
		case 2:
			return decoder.b(value);

		case 5:
			return (value === null)
				? $elm$core$Result$Ok(decoder.c)
				: _Json_expecting('null', value);

		case 3:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('a LIST', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _List_fromArray);

		case 4:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _Json_toElmArray);

		case 6:
			var field = decoder.d;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return _Json_expecting('an OBJECT with a field named `' + field + '`', value);
			}
			var result = _Json_runHelp(decoder.b, value[field]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, field, result.a));

		case 7:
			var index = decoder.e;
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			if (index >= value.length)
			{
				return _Json_expecting('a LONGER array. Need index ' + index + ' but only see ' + value.length + ' entries', value);
			}
			var result = _Json_runHelp(decoder.b, value[index]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, index, result.a));

		case 8:
			if (typeof value !== 'object' || value === null || _Json_isArray(value))
			{
				return _Json_expecting('an OBJECT', value);
			}

			var keyValuePairs = _List_Nil;
			// TODO test perf of Object.keys and switch when support is good enough
			for (var key in value)
			{
				if (value.hasOwnProperty(key))
				{
					var result = _Json_runHelp(decoder.b, value[key]);
					if (!$elm$core$Result$isOk(result))
					{
						return $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, key, result.a));
					}
					keyValuePairs = _List_Cons(_Utils_Tuple2(key, result.a), keyValuePairs);
				}
			}
			return $elm$core$Result$Ok($elm$core$List$reverse(keyValuePairs));

		case 9:
			var answer = decoder.f;
			var decoders = decoder.g;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = _Json_runHelp(decoders[i], value);
				if (!$elm$core$Result$isOk(result))
				{
					return result;
				}
				answer = answer(result.a);
			}
			return $elm$core$Result$Ok(answer);

		case 10:
			var result = _Json_runHelp(decoder.b, value);
			return (!$elm$core$Result$isOk(result))
				? result
				: _Json_runHelp(decoder.h(result.a), value);

		case 11:
			var errors = _List_Nil;
			for (var temp = decoder.g; temp.b; temp = temp.b) // WHILE_CONS
			{
				var result = _Json_runHelp(temp.a, value);
				if ($elm$core$Result$isOk(result))
				{
					return result;
				}
				errors = _List_Cons(result.a, errors);
			}
			return $elm$core$Result$Err($elm$json$Json$Decode$OneOf($elm$core$List$reverse(errors)));

		case 1:
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, decoder.a, _Json_wrap(value)));

		case 0:
			return $elm$core$Result$Ok(decoder.a);
	}
}

function _Json_runArrayDecoder(decoder, value, toElmValue)
{
	var len = value.length;
	var array = new Array(len);
	for (var i = 0; i < len; i++)
	{
		var result = _Json_runHelp(decoder, value[i]);
		if (!$elm$core$Result$isOk(result))
		{
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, i, result.a));
		}
		array[i] = result.a;
	}
	return $elm$core$Result$Ok(toElmValue(array));
}

function _Json_isArray(value)
{
	return Array.isArray(value) || (typeof FileList !== 'undefined' && value instanceof FileList);
}

function _Json_toElmArray(array)
{
	return A2($elm$core$Array$initialize, array.length, function(i) { return array[i]; });
}

function _Json_expecting(type, value)
{
	return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'Expecting ' + type, _Json_wrap(value)));
}


// EQUALITY

function _Json_equality(x, y)
{
	if (x === y)
	{
		return true;
	}

	if (x.$ !== y.$)
	{
		return false;
	}

	switch (x.$)
	{
		case 0:
		case 1:
			return x.a === y.a;

		case 2:
			return x.b === y.b;

		case 5:
			return x.c === y.c;

		case 3:
		case 4:
		case 8:
			return _Json_equality(x.b, y.b);

		case 6:
			return x.d === y.d && _Json_equality(x.b, y.b);

		case 7:
			return x.e === y.e && _Json_equality(x.b, y.b);

		case 9:
			return x.f === y.f && _Json_listEquality(x.g, y.g);

		case 10:
			return x.h === y.h && _Json_equality(x.b, y.b);

		case 11:
			return _Json_listEquality(x.g, y.g);
	}
}

function _Json_listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!_Json_equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

var _Json_encode = F2(function(indentLevel, value)
{
	return JSON.stringify(_Json_unwrap(value), null, indentLevel) + '';
});

function _Json_wrap_UNUSED(value) { return { $: 0, a: value }; }
function _Json_unwrap_UNUSED(value) { return value.a; }

function _Json_wrap(value) { return value; }
function _Json_unwrap(value) { return value; }

function _Json_emptyArray() { return []; }
function _Json_emptyObject() { return {}; }

var _Json_addField = F3(function(key, value, object)
{
	object[key] = _Json_unwrap(value);
	return object;
});

function _Json_addEntry(func)
{
	return F2(function(entry, array)
	{
		array.push(_Json_unwrap(func(entry)));
		return array;
	});
}

var _Json_encodeNull = _Json_wrap(null);



// TASKS

function _Scheduler_succeed(value)
{
	return {
		$: 0,
		a: value
	};
}

function _Scheduler_fail(error)
{
	return {
		$: 1,
		a: error
	};
}

function _Scheduler_binding(callback)
{
	return {
		$: 2,
		b: callback,
		c: null
	};
}

var _Scheduler_andThen = F2(function(callback, task)
{
	return {
		$: 3,
		b: callback,
		d: task
	};
});

var _Scheduler_onError = F2(function(callback, task)
{
	return {
		$: 4,
		b: callback,
		d: task
	};
});

function _Scheduler_receive(callback)
{
	return {
		$: 5,
		b: callback
	};
}


// PROCESSES

var _Scheduler_guid = 0;

function _Scheduler_rawSpawn(task)
{
	var proc = {
		$: 0,
		e: _Scheduler_guid++,
		f: task,
		g: null,
		h: []
	};

	_Scheduler_enqueue(proc);

	return proc;
}

function _Scheduler_spawn(task)
{
	return _Scheduler_binding(function(callback) {
		callback(_Scheduler_succeed(_Scheduler_rawSpawn(task)));
	});
}

function _Scheduler_rawSend(proc, msg)
{
	proc.h.push(msg);
	_Scheduler_enqueue(proc);
}

var _Scheduler_send = F2(function(proc, msg)
{
	return _Scheduler_binding(function(callback) {
		_Scheduler_rawSend(proc, msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});

function _Scheduler_kill(proc)
{
	return _Scheduler_binding(function(callback) {
		var task = proc.f;
		if (task.$ === 2 && task.c)
		{
			task.c();
		}

		proc.f = null;

		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
}


/* STEP PROCESSES

type alias Process =
  { $ : tag
  , id : unique_id
  , root : Task
  , stack : null | { $: SUCCEED | FAIL, a: callback, b: stack }
  , mailbox : [msg]
  }

*/


var _Scheduler_working = false;
var _Scheduler_queue = [];


function _Scheduler_enqueue(proc)
{
	_Scheduler_queue.push(proc);
	if (_Scheduler_working)
	{
		return;
	}
	_Scheduler_working = true;
	while (proc = _Scheduler_queue.shift())
	{
		_Scheduler_step(proc);
	}
	_Scheduler_working = false;
}


function _Scheduler_step(proc)
{
	while (proc.f)
	{
		var rootTag = proc.f.$;
		if (rootTag === 0 || rootTag === 1)
		{
			while (proc.g && proc.g.$ !== rootTag)
			{
				proc.g = proc.g.i;
			}
			if (!proc.g)
			{
				return;
			}
			proc.f = proc.g.b(proc.f.a);
			proc.g = proc.g.i;
		}
		else if (rootTag === 2)
		{
			proc.f.c = proc.f.b(function(newRoot) {
				proc.f = newRoot;
				_Scheduler_enqueue(proc);
			});
			return;
		}
		else if (rootTag === 5)
		{
			if (proc.h.length === 0)
			{
				return;
			}
			proc.f = proc.f.b(proc.h.shift());
		}
		else // if (rootTag === 3 || rootTag === 4)
		{
			proc.g = {
				$: rootTag === 3 ? 0 : 1,
				b: proc.f.b,
				i: proc.g
			};
			proc.f = proc.f.d;
		}
	}
}



function _Process_sleep(time)
{
	return _Scheduler_binding(function(callback) {
		var id = setTimeout(function() {
			callback(_Scheduler_succeed(_Utils_Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}




// PROGRAMS


var _Platform_worker = F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.c6,
		impl.dE,
		impl.dA,
		function() { return function() {} }
	);
});



// INITIALIZE A PROGRAM


function _Platform_initialize(flagDecoder, args, init, update, subscriptions, stepperBuilder)
{
	var result = A2(_Json_run, flagDecoder, _Json_wrap(args ? args['flags'] : undefined));
	$elm$core$Result$isOk(result) || _Debug_crash(2 /**_UNUSED/, _Json_errorToString(result.a) /**/);
	var managers = {};
	var initPair = init(result.a);
	var model = initPair.a;
	var stepper = stepperBuilder(sendToApp, model);
	var ports = _Platform_setupEffects(managers, sendToApp);

	function sendToApp(msg, viewMetadata)
	{
		var pair = A2(update, msg, model);
		stepper(model = pair.a, viewMetadata);
		_Platform_enqueueEffects(managers, pair.b, subscriptions(model));
	}

	_Platform_enqueueEffects(managers, initPair.b, subscriptions(model));

	return ports ? { ports: ports } : {};
}



// TRACK PRELOADS
//
// This is used by code in elm/browser and elm/http
// to register any HTTP requests that are triggered by init.
//


var _Platform_preload;


function _Platform_registerPreload(url)
{
	_Platform_preload.add(url);
}



// EFFECT MANAGERS


var _Platform_effectManagers = {};


function _Platform_setupEffects(managers, sendToApp)
{
	var ports;

	// setup all necessary effect managers
	for (var key in _Platform_effectManagers)
	{
		var manager = _Platform_effectManagers[key];

		if (manager.a)
		{
			ports = ports || {};
			ports[key] = manager.a(key, sendToApp);
		}

		managers[key] = _Platform_instantiateManager(manager, sendToApp);
	}

	return ports;
}


function _Platform_createManager(init, onEffects, onSelfMsg, cmdMap, subMap)
{
	return {
		b: init,
		c: onEffects,
		d: onSelfMsg,
		e: cmdMap,
		f: subMap
	};
}


function _Platform_instantiateManager(info, sendToApp)
{
	var router = {
		g: sendToApp,
		h: undefined
	};

	var onEffects = info.c;
	var onSelfMsg = info.d;
	var cmdMap = info.e;
	var subMap = info.f;

	function loop(state)
	{
		return A2(_Scheduler_andThen, loop, _Scheduler_receive(function(msg)
		{
			var value = msg.a;

			if (msg.$ === 0)
			{
				return A3(onSelfMsg, router, value, state);
			}

			return cmdMap && subMap
				? A4(onEffects, router, value.i, value.j, state)
				: A3(onEffects, router, cmdMap ? value.i : value.j, state);
		}));
	}

	return router.h = _Scheduler_rawSpawn(A2(_Scheduler_andThen, loop, info.b));
}



// ROUTING


var _Platform_sendToApp = F2(function(router, msg)
{
	return _Scheduler_binding(function(callback)
	{
		router.g(msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});


var _Platform_sendToSelf = F2(function(router, msg)
{
	return A2(_Scheduler_send, router.h, {
		$: 0,
		a: msg
	});
});



// BAGS


function _Platform_leaf(home)
{
	return function(value)
	{
		return {
			$: 1,
			k: home,
			l: value
		};
	};
}


function _Platform_batch(list)
{
	return {
		$: 2,
		m: list
	};
}


var _Platform_map = F2(function(tagger, bag)
{
	return {
		$: 3,
		n: tagger,
		o: bag
	}
});



// PIPE BAGS INTO EFFECT MANAGERS
//
// Effects must be queued!
//
// Say your init contains a synchronous command, like Time.now or Time.here
//
//   - This will produce a batch of effects (FX_1)
//   - The synchronous task triggers the subsequent `update` call
//   - This will produce a batch of effects (FX_2)
//
// If we just start dispatching FX_2, subscriptions from FX_2 can be processed
// before subscriptions from FX_1. No good! Earlier versions of this code had
// this problem, leading to these reports:
//
//   https://github.com/elm/core/issues/980
//   https://github.com/elm/core/pull/981
//   https://github.com/elm/compiler/issues/1776
//
// The queue is necessary to avoid ordering issues for synchronous commands.


// Why use true/false here? Why not just check the length of the queue?
// The goal is to detect "are we currently dispatching effects?" If we
// are, we need to bail and let the ongoing while loop handle things.
//
// Now say the queue has 1 element. When we dequeue the final element,
// the queue will be empty, but we are still actively dispatching effects.
// So you could get queue jumping in a really tricky category of cases.
//
var _Platform_effectsQueue = [];
var _Platform_effectsActive = false;


function _Platform_enqueueEffects(managers, cmdBag, subBag)
{
	_Platform_effectsQueue.push({ p: managers, q: cmdBag, r: subBag });

	if (_Platform_effectsActive) return;

	_Platform_effectsActive = true;
	for (var fx; fx = _Platform_effectsQueue.shift(); )
	{
		_Platform_dispatchEffects(fx.p, fx.q, fx.r);
	}
	_Platform_effectsActive = false;
}


function _Platform_dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	_Platform_gatherEffects(true, cmdBag, effectsDict, null);
	_Platform_gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		_Scheduler_rawSend(managers[home], {
			$: 'fx',
			a: effectsDict[home] || { i: _List_Nil, j: _List_Nil }
		});
	}
}


function _Platform_gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.$)
	{
		case 1:
			var home = bag.k;
			var effect = _Platform_toEffect(isCmd, home, taggers, bag.l);
			effectsDict[home] = _Platform_insert(isCmd, effect, effectsDict[home]);
			return;

		case 2:
			for (var list = bag.m; list.b; list = list.b) // WHILE_CONS
			{
				_Platform_gatherEffects(isCmd, list.a, effectsDict, taggers);
			}
			return;

		case 3:
			_Platform_gatherEffects(isCmd, bag.o, effectsDict, {
				s: bag.n,
				t: taggers
			});
			return;
	}
}


function _Platform_toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		for (var temp = taggers; temp; temp = temp.t)
		{
			x = temp.s(x);
		}
		return x;
	}

	var map = isCmd
		? _Platform_effectManagers[home].e
		: _Platform_effectManagers[home].f;

	return A2(map, applyTaggers, value)
}


function _Platform_insert(isCmd, newEffect, effects)
{
	effects = effects || { i: _List_Nil, j: _List_Nil };

	isCmd
		? (effects.i = _List_Cons(newEffect, effects.i))
		: (effects.j = _List_Cons(newEffect, effects.j));

	return effects;
}



// PORTS


function _Platform_checkPortName(name)
{
	if (_Platform_effectManagers[name])
	{
		_Debug_crash(3, name)
	}
}



// OUTGOING PORTS


function _Platform_outgoingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		e: _Platform_outgoingPortMap,
		u: converter,
		a: _Platform_setupOutgoingPort
	};
	return _Platform_leaf(name);
}


var _Platform_outgoingPortMap = F2(function(tagger, value) { return value; });


function _Platform_setupOutgoingPort(name)
{
	var subs = [];
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Process_sleep(0);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, cmdList, state)
	{
		for ( ; cmdList.b; cmdList = cmdList.b) // WHILE_CONS
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = _Json_unwrap(converter(cmdList.a));
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
		}
		return init;
	});

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}



// INCOMING PORTS


function _Platform_incomingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		f: _Platform_incomingPortMap,
		u: converter,
		a: _Platform_setupIncomingPort
	};
	return _Platform_leaf(name);
}


var _Platform_incomingPortMap = F2(function(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});


function _Platform_setupIncomingPort(name, sendToApp)
{
	var subs = _List_Nil;
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Scheduler_succeed(null);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, subList, state)
	{
		subs = subList;
		return init;
	});

	// PUBLIC API

	function send(incomingValue)
	{
		var result = A2(_Json_run, converter, _Json_wrap(incomingValue));

		$elm$core$Result$isOk(result) || _Debug_crash(4, name, result.a);

		var value = result.a;
		for (var temp = subs; temp.b; temp = temp.b) // WHILE_CONS
		{
			sendToApp(temp.a(value));
		}
	}

	return { send: send };
}



// EXPORT ELM MODULES
//
// Have DEBUG and PROD versions so that we can (1) give nicer errors in
// debug mode and (2) not pay for the bits needed for that in prod mode.
//


function _Platform_export(exports)
{
	scope['Elm']
		? _Platform_mergeExportsProd(scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsProd(obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6)
				: _Platform_mergeExportsProd(obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}


function _Platform_export_UNUSED(exports)
{
	scope['Elm']
		? _Platform_mergeExportsDebug('Elm', scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsDebug(moduleName, obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6, moduleName)
				: _Platform_mergeExportsDebug(moduleName + '.' + name, obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}




// HELPERS


var _VirtualDom_divertHrefToApp;

var _VirtualDom_doc = typeof document !== 'undefined' ? document : {};


function _VirtualDom_appendChild(parent, child)
{
	parent.appendChild(child);
}

var _VirtualDom_init = F4(function(virtualNode, flagDecoder, debugMetadata, args)
{
	// NOTE: this function needs _Platform_export available to work

	/**/
	var node = args['node'];
	//*/
	/**_UNUSED/
	var node = args && args['node'] ? args['node'] : _Debug_crash(0);
	//*/

	node.parentNode.replaceChild(
		_VirtualDom_render(virtualNode, function() {}),
		node
	);

	return {};
});



// TEXT


function _VirtualDom_text(string)
{
	return {
		$: 0,
		a: string
	};
}



// NODE


var _VirtualDom_nodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 1,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_node = _VirtualDom_nodeNS(undefined);



// KEYED NODE


var _VirtualDom_keyedNodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 2,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_keyedNode = _VirtualDom_keyedNodeNS(undefined);



// CUSTOM


function _VirtualDom_custom(factList, model, render, diff)
{
	return {
		$: 3,
		d: _VirtualDom_organizeFacts(factList),
		g: model,
		h: render,
		i: diff
	};
}



// MAP


var _VirtualDom_map = F2(function(tagger, node)
{
	return {
		$: 4,
		j: tagger,
		k: node,
		b: 1 + (node.b || 0)
	};
});



// LAZY


function _VirtualDom_thunk(refs, thunk)
{
	return {
		$: 5,
		l: refs,
		m: thunk,
		k: undefined
	};
}

var _VirtualDom_lazy = F2(function(func, a)
{
	return _VirtualDom_thunk([func, a], function() {
		return func(a);
	});
});

var _VirtualDom_lazy2 = F3(function(func, a, b)
{
	return _VirtualDom_thunk([func, a, b], function() {
		return A2(func, a, b);
	});
});

var _VirtualDom_lazy3 = F4(function(func, a, b, c)
{
	return _VirtualDom_thunk([func, a, b, c], function() {
		return A3(func, a, b, c);
	});
});

var _VirtualDom_lazy4 = F5(function(func, a, b, c, d)
{
	return _VirtualDom_thunk([func, a, b, c, d], function() {
		return A4(func, a, b, c, d);
	});
});

var _VirtualDom_lazy5 = F6(function(func, a, b, c, d, e)
{
	return _VirtualDom_thunk([func, a, b, c, d, e], function() {
		return A5(func, a, b, c, d, e);
	});
});

var _VirtualDom_lazy6 = F7(function(func, a, b, c, d, e, f)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f], function() {
		return A6(func, a, b, c, d, e, f);
	});
});

var _VirtualDom_lazy7 = F8(function(func, a, b, c, d, e, f, g)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g], function() {
		return A7(func, a, b, c, d, e, f, g);
	});
});

var _VirtualDom_lazy8 = F9(function(func, a, b, c, d, e, f, g, h)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g, h], function() {
		return A8(func, a, b, c, d, e, f, g, h);
	});
});



// FACTS


var _VirtualDom_on = F2(function(key, handler)
{
	return {
		$: 'a0',
		n: key,
		o: handler
	};
});
var _VirtualDom_style = F2(function(key, value)
{
	return {
		$: 'a1',
		n: key,
		o: value
	};
});
var _VirtualDom_property = F2(function(key, value)
{
	return {
		$: 'a2',
		n: key,
		o: value
	};
});
var _VirtualDom_attribute = F2(function(key, value)
{
	return {
		$: 'a3',
		n: key,
		o: value
	};
});
var _VirtualDom_attributeNS = F3(function(namespace, key, value)
{
	return {
		$: 'a4',
		n: key,
		o: { f: namespace, o: value }
	};
});



// XSS ATTACK VECTOR CHECKS
//
// For some reason, tabs can appear in href protocols and it still works.
// So '\tjava\tSCRIPT:alert("!!!")' and 'javascript:alert("!!!")' are the same
// in practice. That is why _VirtualDom_RE_js and _VirtualDom_RE_js_html look
// so freaky.
//
// Pulling the regular expressions out to the top level gives a slight speed
// boost in small benchmarks (4-10%) but hoisting values to reduce allocation
// can be unpredictable in large programs where JIT may have a harder time with
// functions are not fully self-contained. The benefit is more that the js and
// js_html ones are so weird that I prefer to see them near each other.


var _VirtualDom_RE_script = /^script$/i;
var _VirtualDom_RE_on_formAction = /^(on|formAction$)/i;
var _VirtualDom_RE_js = /^\s*j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/i;
var _VirtualDom_RE_js_html = /^\s*(j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:|d\s*a\s*t\s*a\s*:\s*t\s*e\s*x\s*t\s*\/\s*h\s*t\s*m\s*l\s*(,|;))/i;


function _VirtualDom_noScript(tag)
{
	return _VirtualDom_RE_script.test(tag) ? 'p' : tag;
}

function _VirtualDom_noOnOrFormAction(key)
{
	return _VirtualDom_RE_on_formAction.test(key) ? 'data-' + key : key;
}

function _VirtualDom_noInnerHtmlOrFormAction(key)
{
	return key == 'innerHTML' || key == 'formAction' ? 'data-' + key : key;
}

function _VirtualDom_noJavaScriptUri(value)
{
	return _VirtualDom_RE_js.test(value)
		? /**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlUri(value)
{
	return _VirtualDom_RE_js_html.test(value)
		? /**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlJson(value)
{
	return (typeof _Json_unwrap(value) === 'string' && _VirtualDom_RE_js_html.test(_Json_unwrap(value)))
		? _Json_wrap(
			/**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		) : value;
}



// MAP FACTS


var _VirtualDom_mapAttribute = F2(function(func, attr)
{
	return (attr.$ === 'a0')
		? A2(_VirtualDom_on, attr.n, _VirtualDom_mapHandler(func, attr.o))
		: attr;
});

function _VirtualDom_mapHandler(func, handler)
{
	var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

	// 0 = Normal
	// 1 = MayStopPropagation
	// 2 = MayPreventDefault
	// 3 = Custom

	return {
		$: handler.$,
		a:
			!tag
				? A2($elm$json$Json$Decode$map, func, handler.a)
				:
			A3($elm$json$Json$Decode$map2,
				tag < 3
					? _VirtualDom_mapEventTuple
					: _VirtualDom_mapEventRecord,
				$elm$json$Json$Decode$succeed(func),
				handler.a
			)
	};
}

var _VirtualDom_mapEventTuple = F2(function(func, tuple)
{
	return _Utils_Tuple2(func(tuple.a), tuple.b);
});

var _VirtualDom_mapEventRecord = F2(function(func, record)
{
	return {
		da: func(record.da),
		bD: record.bD,
		by: record.by
	}
});



// ORGANIZE FACTS


function _VirtualDom_organizeFacts(factList)
{
	for (var facts = {}; factList.b; factList = factList.b) // WHILE_CONS
	{
		var entry = factList.a;

		var tag = entry.$;
		var key = entry.n;
		var value = entry.o;

		if (tag === 'a2')
		{
			(key === 'className')
				? _VirtualDom_addClass(facts, key, _Json_unwrap(value))
				: facts[key] = _Json_unwrap(value);

			continue;
		}

		var subFacts = facts[tag] || (facts[tag] = {});
		(tag === 'a3' && key === 'class')
			? _VirtualDom_addClass(subFacts, key, value)
			: subFacts[key] = value;
	}

	return facts;
}

function _VirtualDom_addClass(object, key, newClass)
{
	var classes = object[key];
	object[key] = classes ? classes + ' ' + newClass : newClass;
}



// RENDER


function _VirtualDom_render(vNode, eventNode)
{
	var tag = vNode.$;

	if (tag === 5)
	{
		return _VirtualDom_render(vNode.k || (vNode.k = vNode.m()), eventNode);
	}

	if (tag === 0)
	{
		return _VirtualDom_doc.createTextNode(vNode.a);
	}

	if (tag === 4)
	{
		var subNode = vNode.k;
		var tagger = vNode.j;

		while (subNode.$ === 4)
		{
			typeof tagger !== 'object'
				? tagger = [tagger, subNode.j]
				: tagger.push(subNode.j);

			subNode = subNode.k;
		}

		var subEventRoot = { j: tagger, p: eventNode };
		var domNode = _VirtualDom_render(subNode, subEventRoot);
		domNode.elm_event_node_ref = subEventRoot;
		return domNode;
	}

	if (tag === 3)
	{
		var domNode = vNode.h(vNode.g);
		_VirtualDom_applyFacts(domNode, eventNode, vNode.d);
		return domNode;
	}

	// at this point `tag` must be 1 or 2

	var domNode = vNode.f
		? _VirtualDom_doc.createElementNS(vNode.f, vNode.c)
		: _VirtualDom_doc.createElement(vNode.c);

	if (_VirtualDom_divertHrefToApp && vNode.c == 'a')
	{
		domNode.addEventListener('click', _VirtualDom_divertHrefToApp(domNode));
	}

	_VirtualDom_applyFacts(domNode, eventNode, vNode.d);

	for (var kids = vNode.e, i = 0; i < kids.length; i++)
	{
		_VirtualDom_appendChild(domNode, _VirtualDom_render(tag === 1 ? kids[i] : kids[i].b, eventNode));
	}

	return domNode;
}



// APPLY FACTS


function _VirtualDom_applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		key === 'a1'
			? _VirtualDom_applyStyles(domNode, value)
			:
		key === 'a0'
			? _VirtualDom_applyEvents(domNode, eventNode, value)
			:
		key === 'a3'
			? _VirtualDom_applyAttrs(domNode, value)
			:
		key === 'a4'
			? _VirtualDom_applyAttrsNS(domNode, value)
			:
		((key !== 'value' && key !== 'checked') || domNode[key] !== value) && (domNode[key] = value);
	}
}



// APPLY STYLES


function _VirtualDom_applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}



// APPLY ATTRS


function _VirtualDom_applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		typeof value !== 'undefined'
			? domNode.setAttribute(key, value)
			: domNode.removeAttribute(key);
	}
}



// APPLY NAMESPACED ATTRS


function _VirtualDom_applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.f;
		var value = pair.o;

		typeof value !== 'undefined'
			? domNode.setAttributeNS(namespace, key, value)
			: domNode.removeAttributeNS(namespace, key);
	}
}



// APPLY EVENTS


function _VirtualDom_applyEvents(domNode, eventNode, events)
{
	var allCallbacks = domNode.elmFs || (domNode.elmFs = {});

	for (var key in events)
	{
		var newHandler = events[key];
		var oldCallback = allCallbacks[key];

		if (!newHandler)
		{
			domNode.removeEventListener(key, oldCallback);
			allCallbacks[key] = undefined;
			continue;
		}

		if (oldCallback)
		{
			var oldHandler = oldCallback.q;
			if (oldHandler.$ === newHandler.$)
			{
				oldCallback.q = newHandler;
				continue;
			}
			domNode.removeEventListener(key, oldCallback);
		}

		oldCallback = _VirtualDom_makeCallback(eventNode, newHandler);
		domNode.addEventListener(key, oldCallback,
			_VirtualDom_passiveSupported
			&& { passive: $elm$virtual_dom$VirtualDom$toHandlerInt(newHandler) < 2 }
		);
		allCallbacks[key] = oldCallback;
	}
}



// PASSIVE EVENTS


var _VirtualDom_passiveSupported;

try
{
	window.addEventListener('t', null, Object.defineProperty({}, 'passive', {
		get: function() { _VirtualDom_passiveSupported = true; }
	}));
}
catch(e) {}



// EVENT HANDLERS


function _VirtualDom_makeCallback(eventNode, initialHandler)
{
	function callback(event)
	{
		var handler = callback.q;
		var result = _Json_runHelp(handler.a, event);

		if (!$elm$core$Result$isOk(result))
		{
			return;
		}

		var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

		// 0 = Normal
		// 1 = MayStopPropagation
		// 2 = MayPreventDefault
		// 3 = Custom

		var value = result.a;
		var message = !tag ? value : tag < 3 ? value.a : value.da;
		var stopPropagation = tag == 1 ? value.b : tag == 3 && value.bD;
		var currentEventNode = (
			stopPropagation && event.stopPropagation(),
			(tag == 2 ? value.b : tag == 3 && value.by) && event.preventDefault(),
			eventNode
		);
		var tagger;
		var i;
		while (tagger = currentEventNode.j)
		{
			if (typeof tagger == 'function')
			{
				message = tagger(message);
			}
			else
			{
				for (var i = tagger.length; i--; )
				{
					message = tagger[i](message);
				}
			}
			currentEventNode = currentEventNode.p;
		}
		currentEventNode(message, stopPropagation); // stopPropagation implies isSync
	}

	callback.q = initialHandler;

	return callback;
}

function _VirtualDom_equalEvents(x, y)
{
	return x.$ == y.$ && _Json_equality(x.a, y.a);
}



// DIFF


// TODO: Should we do patches like in iOS?
//
// type Patch
//   = At Int Patch
//   | Batch (List Patch)
//   | Change ...
//
// How could it not be better?
//
function _VirtualDom_diff(x, y)
{
	var patches = [];
	_VirtualDom_diffHelp(x, y, patches, 0);
	return patches;
}


function _VirtualDom_pushPatch(patches, type, index, data)
{
	var patch = {
		$: type,
		r: index,
		s: data,
		t: undefined,
		u: undefined
	};
	patches.push(patch);
	return patch;
}


function _VirtualDom_diffHelp(x, y, patches, index)
{
	if (x === y)
	{
		return;
	}

	var xType = x.$;
	var yType = y.$;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (xType !== yType)
	{
		if (xType === 1 && yType === 2)
		{
			y = _VirtualDom_dekey(y);
			yType = 1;
		}
		else
		{
			_VirtualDom_pushPatch(patches, 0, index, y);
			return;
		}
	}

	// Now we know that both nodes are the same $.
	switch (yType)
	{
		case 5:
			var xRefs = x.l;
			var yRefs = y.l;
			var i = xRefs.length;
			var same = i === yRefs.length;
			while (same && i--)
			{
				same = xRefs[i] === yRefs[i];
			}
			if (same)
			{
				y.k = x.k;
				return;
			}
			y.k = y.m();
			var subPatches = [];
			_VirtualDom_diffHelp(x.k, y.k, subPatches, 0);
			subPatches.length > 0 && _VirtualDom_pushPatch(patches, 1, index, subPatches);
			return;

		case 4:
			// gather nested taggers
			var xTaggers = x.j;
			var yTaggers = y.j;
			var nesting = false;

			var xSubNode = x.k;
			while (xSubNode.$ === 4)
			{
				nesting = true;

				typeof xTaggers !== 'object'
					? xTaggers = [xTaggers, xSubNode.j]
					: xTaggers.push(xSubNode.j);

				xSubNode = xSubNode.k;
			}

			var ySubNode = y.k;
			while (ySubNode.$ === 4)
			{
				nesting = true;

				typeof yTaggers !== 'object'
					? yTaggers = [yTaggers, ySubNode.j]
					: yTaggers.push(ySubNode.j);

				ySubNode = ySubNode.k;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && xTaggers.length !== yTaggers.length)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !_VirtualDom_pairwiseRefEqual(xTaggers, yTaggers) : xTaggers !== yTaggers)
			{
				_VirtualDom_pushPatch(patches, 2, index, yTaggers);
			}

			// diff everything below the taggers
			_VirtualDom_diffHelp(xSubNode, ySubNode, patches, index + 1);
			return;

		case 0:
			if (x.a !== y.a)
			{
				_VirtualDom_pushPatch(patches, 3, index, y.a);
			}
			return;

		case 1:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKids);
			return;

		case 2:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKeyedKids);
			return;

		case 3:
			if (x.h !== y.h)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
			factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

			var patch = y.i(x.g, y.g);
			patch && _VirtualDom_pushPatch(patches, 5, index, patch);

			return;
	}
}

// assumes the incoming arrays are the same length
function _VirtualDom_pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}

function _VirtualDom_diffNodes(x, y, patches, index, diffKids)
{
	// Bail if obvious indicators have changed. Implies more serious
	// structural changes such that it's not worth it to diff.
	if (x.c !== y.c || x.f !== y.f)
	{
		_VirtualDom_pushPatch(patches, 0, index, y);
		return;
	}

	var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
	factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

	diffKids(x, y, patches, index);
}



// DIFF FACTS


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function _VirtualDom_diffFacts(x, y, category)
{
	var diff;

	// look for changes and removals
	for (var xKey in x)
	{
		if (xKey === 'a1' || xKey === 'a0' || xKey === 'a3' || xKey === 'a4')
		{
			var subDiff = _VirtualDom_diffFacts(x[xKey], y[xKey] || {}, xKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[xKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(xKey in y))
		{
			diff = diff || {};
			diff[xKey] =
				!category
					? (typeof x[xKey] === 'string' ? '' : null)
					:
				(category === 'a1')
					? ''
					:
				(category === 'a0' || category === 'a3')
					? undefined
					:
				{ f: x[xKey].f, o: undefined };

			continue;
		}

		var xValue = x[xKey];
		var yValue = y[xKey];

		// reference equal, so don't worry about it
		if (xValue === yValue && xKey !== 'value' && xKey !== 'checked'
			|| category === 'a0' && _VirtualDom_equalEvents(xValue, yValue))
		{
			continue;
		}

		diff = diff || {};
		diff[xKey] = yValue;
	}

	// add new stuff
	for (var yKey in y)
	{
		if (!(yKey in x))
		{
			diff = diff || {};
			diff[yKey] = y[yKey];
		}
	}

	return diff;
}



// DIFF KIDS


function _VirtualDom_diffKids(xParent, yParent, patches, index)
{
	var xKids = xParent.e;
	var yKids = yParent.e;

	var xLen = xKids.length;
	var yLen = yKids.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (xLen > yLen)
	{
		_VirtualDom_pushPatch(patches, 6, index, {
			v: yLen,
			i: xLen - yLen
		});
	}
	else if (xLen < yLen)
	{
		_VirtualDom_pushPatch(patches, 7, index, {
			v: xLen,
			e: yKids
		});
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	for (var minLen = xLen < yLen ? xLen : yLen, i = 0; i < minLen; i++)
	{
		var xKid = xKids[i];
		_VirtualDom_diffHelp(xKid, yKids[i], patches, ++index);
		index += xKid.b || 0;
	}
}



// KEYED DIFF


function _VirtualDom_diffKeyedKids(xParent, yParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var xKids = xParent.e;
	var yKids = yParent.e;
	var xLen = xKids.length;
	var yLen = yKids.length;
	var xIndex = 0;
	var yIndex = 0;

	var index = rootIndex;

	while (xIndex < xLen && yIndex < yLen)
	{
		var x = xKids[xIndex];
		var y = yKids[yIndex];

		var xKey = x.a;
		var yKey = y.a;
		var xNode = x.b;
		var yNode = y.b;

		var newMatch = undefined;
		var oldMatch = undefined;

		// check if keys match

		if (xKey === yKey)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNode, localPatches, index);
			index += xNode.b || 0;

			xIndex++;
			yIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var xNext = xKids[xIndex + 1];
		var yNext = yKids[yIndex + 1];

		if (xNext)
		{
			var xNextKey = xNext.a;
			var xNextNode = xNext.b;
			oldMatch = yKey === xNextKey;
		}

		if (yNext)
		{
			var yNextKey = yNext.a;
			var yNextNode = yNext.b;
			newMatch = xKey === yNextKey;
		}


		// swap x and y
		if (newMatch && oldMatch)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			_VirtualDom_insertNode(changes, localPatches, xKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNextNode, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		// insert y
		if (newMatch)
		{
			index++;
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			index += xNode.b || 0;

			xIndex += 1;
			yIndex += 2;
			continue;
		}

		// remove x
		if (oldMatch)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 1;
			continue;
		}

		// remove x, insert y
		if (xNext && xNextKey === yNextKey)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNextNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (xIndex < xLen)
	{
		index++;
		var x = xKids[xIndex];
		var xNode = x.b;
		_VirtualDom_removeNode(changes, localPatches, x.a, xNode, index);
		index += xNode.b || 0;
		xIndex++;
	}

	while (yIndex < yLen)
	{
		var endInserts = endInserts || [];
		var y = yKids[yIndex];
		_VirtualDom_insertNode(changes, localPatches, y.a, y.b, undefined, endInserts);
		yIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || endInserts)
	{
		_VirtualDom_pushPatch(patches, 8, rootIndex, {
			w: localPatches,
			x: inserts,
			y: endInserts
		});
	}
}



// CHANGES FROM KEYED DIFF


var _VirtualDom_POSTFIX = '_elmW6BL';


function _VirtualDom_insertNode(changes, localPatches, key, vnode, yIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		entry = {
			c: 0,
			z: vnode,
			r: yIndex,
			s: undefined
		};

		inserts.push({ r: yIndex, A: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.c === 1)
	{
		inserts.push({ r: yIndex, A: entry });

		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(entry.z, vnode, subPatches, entry.r);
		entry.r = yIndex;
		entry.s.s = {
			w: subPatches,
			A: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	_VirtualDom_insertNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, yIndex, inserts);
}


function _VirtualDom_removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		var patch = _VirtualDom_pushPatch(localPatches, 9, index, undefined);

		changes[key] = {
			c: 1,
			z: vnode,
			r: index,
			s: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.c === 0)
	{
		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(vnode, entry.z, subPatches, index);

		_VirtualDom_pushPatch(localPatches, 9, index, {
			w: subPatches,
			A: entry
		});

		return;
	}

	// this key has already been removed or moved, a duplicate!
	_VirtualDom_removeNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, index);
}



// ADD DOM NODES
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function _VirtualDom_addDomNodes(domNode, vNode, patches, eventNode)
{
	_VirtualDom_addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.b, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function _VirtualDom_addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.r;

	while (index === low)
	{
		var patchType = patch.$;

		if (patchType === 1)
		{
			_VirtualDom_addDomNodes(domNode, vNode.k, patch.s, eventNode);
		}
		else if (patchType === 8)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var subPatches = patch.s.w;
			if (subPatches.length > 0)
			{
				_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 9)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var data = patch.s;
			if (data)
			{
				data.A.s = domNode;
				var subPatches = data.w;
				if (subPatches.length > 0)
				{
					_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.t = domNode;
			patch.u = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.r) > high)
		{
			return i;
		}
	}

	var tag = vNode.$;

	if (tag === 4)
	{
		var subNode = vNode.k;

		while (subNode.$ === 4)
		{
			subNode = subNode.k;
		}

		return _VirtualDom_addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);
	}

	// tag must be 1 or 2 at this point

	var vKids = vNode.e;
	var childNodes = domNode.childNodes;
	for (var j = 0; j < vKids.length; j++)
	{
		low++;
		var vKid = tag === 1 ? vKids[j] : vKids[j].b;
		var nextLow = low + (vKid.b || 0);
		if (low <= index && index <= nextLow)
		{
			i = _VirtualDom_addDomNodesHelp(childNodes[j], vKid, patches, i, low, nextLow, eventNode);
			if (!(patch = patches[i]) || (index = patch.r) > high)
			{
				return i;
			}
		}
		low = nextLow;
	}
	return i;
}



// APPLY PATCHES


function _VirtualDom_applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	_VirtualDom_addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return _VirtualDom_applyPatchesHelp(rootDomNode, patches);
}

function _VirtualDom_applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.t
		var newNode = _VirtualDom_applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function _VirtualDom_applyPatch(domNode, patch)
{
	switch (patch.$)
	{
		case 0:
			return _VirtualDom_applyPatchRedraw(domNode, patch.s, patch.u);

		case 4:
			_VirtualDom_applyFacts(domNode, patch.u, patch.s);
			return domNode;

		case 3:
			domNode.replaceData(0, domNode.length, patch.s);
			return domNode;

		case 1:
			return _VirtualDom_applyPatchesHelp(domNode, patch.s);

		case 2:
			if (domNode.elm_event_node_ref)
			{
				domNode.elm_event_node_ref.j = patch.s;
			}
			else
			{
				domNode.elm_event_node_ref = { j: patch.s, p: patch.u };
			}
			return domNode;

		case 6:
			var data = patch.s;
			for (var i = 0; i < data.i; i++)
			{
				domNode.removeChild(domNode.childNodes[data.v]);
			}
			return domNode;

		case 7:
			var data = patch.s;
			var kids = data.e;
			var i = data.v;
			var theEnd = domNode.childNodes[i];
			for (; i < kids.length; i++)
			{
				domNode.insertBefore(_VirtualDom_render(kids[i], patch.u), theEnd);
			}
			return domNode;

		case 9:
			var data = patch.s;
			if (!data)
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.A;
			if (typeof entry.r !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.s = _VirtualDom_applyPatchesHelp(domNode, data.w);
			return domNode;

		case 8:
			return _VirtualDom_applyPatchReorder(domNode, patch);

		case 5:
			return patch.s(domNode);

		default:
			_Debug_crash(10); // 'Ran into an unknown patch!'
	}
}


function _VirtualDom_applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = _VirtualDom_render(vNode, eventNode);

	if (!newNode.elm_event_node_ref)
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function _VirtualDom_applyPatchReorder(domNode, patch)
{
	var data = patch.s;

	// remove end inserts
	var frag = _VirtualDom_applyPatchReorderEndInsertsHelp(data.y, patch);

	// removals
	domNode = _VirtualDom_applyPatchesHelp(domNode, data.w);

	// inserts
	var inserts = data.x;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.A;
		var node = entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u);
		domNode.insertBefore(node, domNode.childNodes[insert.r]);
	}

	// add end inserts
	if (frag)
	{
		_VirtualDom_appendChild(domNode, frag);
	}

	return domNode;
}


function _VirtualDom_applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (!endInserts)
	{
		return;
	}

	var frag = _VirtualDom_doc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.A;
		_VirtualDom_appendChild(frag, entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u)
		);
	}
	return frag;
}


function _VirtualDom_virtualize(node)
{
	// TEXT NODES

	if (node.nodeType === 3)
	{
		return _VirtualDom_text(node.textContent);
	}


	// WEIRD NODES

	if (node.nodeType !== 1)
	{
		return _VirtualDom_text('');
	}


	// ELEMENT NODES

	var attrList = _List_Nil;
	var attrs = node.attributes;
	for (var i = attrs.length; i--; )
	{
		var attr = attrs[i];
		var name = attr.name;
		var value = attr.value;
		attrList = _List_Cons( A2(_VirtualDom_attribute, name, value), attrList );
	}

	var tag = node.tagName.toLowerCase();
	var kidList = _List_Nil;
	var kids = node.childNodes;

	for (var i = kids.length; i--; )
	{
		kidList = _List_Cons(_VirtualDom_virtualize(kids[i]), kidList);
	}
	return A3(_VirtualDom_node, tag, attrList, kidList);
}

function _VirtualDom_dekey(keyedNode)
{
	var keyedKids = keyedNode.e;
	var len = keyedKids.length;
	var kids = new Array(len);
	for (var i = 0; i < len; i++)
	{
		kids[i] = keyedKids[i].b;
	}

	return {
		$: 1,
		c: keyedNode.c,
		d: keyedNode.d,
		e: kids,
		f: keyedNode.f,
		b: keyedNode.b
	};
}




// ELEMENT


var _Debugger_element;

var _Browser_element = _Debugger_element || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.c6,
		impl.dE,
		impl.dA,
		function(sendToApp, initialModel) {
			var view = impl.dF;
			/**/
			var domNode = args['node'];
			//*/
			/**_UNUSED/
			var domNode = args && args['node'] ? args['node'] : _Debug_crash(0);
			//*/
			var currNode = _VirtualDom_virtualize(domNode);

			return _Browser_makeAnimator(initialModel, function(model)
			{
				var nextNode = view(model);
				var patches = _VirtualDom_diff(currNode, nextNode);
				domNode = _VirtualDom_applyPatches(domNode, currNode, patches, sendToApp);
				currNode = nextNode;
			});
		}
	);
});



// DOCUMENT


var _Debugger_document;

var _Browser_document = _Debugger_document || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.c6,
		impl.dE,
		impl.dA,
		function(sendToApp, initialModel) {
			var divertHrefToApp = impl.bA && impl.bA(sendToApp)
			var view = impl.dF;
			var title = _VirtualDom_doc.title;
			var bodyNode = _VirtualDom_doc.body;
			var currNode = _VirtualDom_virtualize(bodyNode);
			return _Browser_makeAnimator(initialModel, function(model)
			{
				_VirtualDom_divertHrefToApp = divertHrefToApp;
				var doc = view(model);
				var nextNode = _VirtualDom_node('body')(_List_Nil)(doc.au);
				var patches = _VirtualDom_diff(currNode, nextNode);
				bodyNode = _VirtualDom_applyPatches(bodyNode, currNode, patches, sendToApp);
				currNode = nextNode;
				_VirtualDom_divertHrefToApp = 0;
				(title !== doc.x) && (_VirtualDom_doc.title = title = doc.x);
			});
		}
	);
});



// ANIMATION


var _Browser_cancelAnimationFrame =
	typeof cancelAnimationFrame !== 'undefined'
		? cancelAnimationFrame
		: function(id) { clearTimeout(id); };

var _Browser_requestAnimationFrame =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { return setTimeout(callback, 1000 / 60); };


function _Browser_makeAnimator(model, draw)
{
	draw(model);

	var state = 0;

	function updateIfNeeded()
	{
		state = state === 1
			? 0
			: ( _Browser_requestAnimationFrame(updateIfNeeded), draw(model), 1 );
	}

	return function(nextModel, isSync)
	{
		model = nextModel;

		isSync
			? ( draw(model),
				state === 2 && (state = 1)
				)
			: ( state === 0 && _Browser_requestAnimationFrame(updateIfNeeded),
				state = 2
				);
	};
}



// APPLICATION


function _Browser_application(impl)
{
	var onUrlChange = impl.dl;
	var onUrlRequest = impl.dm;
	var key = function() { key.a(onUrlChange(_Browser_getUrl())); };

	return _Browser_document({
		bA: function(sendToApp)
		{
			key.a = sendToApp;
			_Browser_window.addEventListener('popstate', key);
			_Browser_window.navigator.userAgent.indexOf('Trident') < 0 || _Browser_window.addEventListener('hashchange', key);

			return F2(function(domNode, event)
			{
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button < 1 && !domNode.target && !domNode.hasAttribute('download'))
				{
					event.preventDefault();
					var href = domNode.href;
					var curr = _Browser_getUrl();
					var next = $elm$url$Url$fromString(href).a;
					sendToApp(onUrlRequest(
						(next
							&& curr.cj === next.cj
							&& curr.b_ === next.b_
							&& curr.cg.a === next.cg.a
						)
							? $elm$browser$Browser$Internal(next)
							: $elm$browser$Browser$External(href)
					));
				}
			});
		},
		c6: function(flags)
		{
			return A3(impl.c6, flags, _Browser_getUrl(), key);
		},
		dF: impl.dF,
		dE: impl.dE,
		dA: impl.dA
	});
}

function _Browser_getUrl()
{
	return $elm$url$Url$fromString(_VirtualDom_doc.location.href).a || _Debug_crash(1);
}

var _Browser_go = F2(function(key, n)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		n && history.go(n);
		key();
	}));
});

var _Browser_pushUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.pushState({}, '', url);
		key();
	}));
});

var _Browser_replaceUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.replaceState({}, '', url);
		key();
	}));
});



// GLOBAL EVENTS


var _Browser_fakeNode = { addEventListener: function() {}, removeEventListener: function() {} };
var _Browser_doc = typeof document !== 'undefined' ? document : _Browser_fakeNode;
var _Browser_window = typeof window !== 'undefined' ? window : _Browser_fakeNode;

var _Browser_on = F3(function(node, eventName, sendToSelf)
{
	return _Scheduler_spawn(_Scheduler_binding(function(callback)
	{
		function handler(event)	{ _Scheduler_rawSpawn(sendToSelf(event)); }
		node.addEventListener(eventName, handler, _VirtualDom_passiveSupported && { passive: true });
		return function() { node.removeEventListener(eventName, handler); };
	}));
});

var _Browser_decodeEvent = F2(function(decoder, event)
{
	var result = _Json_runHelp(decoder, event);
	return $elm$core$Result$isOk(result) ? $elm$core$Maybe$Just(result.a) : $elm$core$Maybe$Nothing;
});



// PAGE VISIBILITY


function _Browser_visibilityInfo()
{
	return (typeof _VirtualDom_doc.hidden !== 'undefined')
		? { c3: 'hidden', cO: 'visibilitychange' }
		:
	(typeof _VirtualDom_doc.mozHidden !== 'undefined')
		? { c3: 'mozHidden', cO: 'mozvisibilitychange' }
		:
	(typeof _VirtualDom_doc.msHidden !== 'undefined')
		? { c3: 'msHidden', cO: 'msvisibilitychange' }
		:
	(typeof _VirtualDom_doc.webkitHidden !== 'undefined')
		? { c3: 'webkitHidden', cO: 'webkitvisibilitychange' }
		: { c3: 'hidden', cO: 'visibilitychange' };
}



// ANIMATION FRAMES


function _Browser_rAF()
{
	return _Scheduler_binding(function(callback)
	{
		var id = _Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(Date.now()));
		});

		return function() {
			_Browser_cancelAnimationFrame(id);
		};
	});
}


function _Browser_now()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(Date.now()));
	});
}



// DOM STUFF


function _Browser_withNode(id, doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			var node = document.getElementById(id);
			callback(node
				? _Scheduler_succeed(doStuff(node))
				: _Scheduler_fail($elm$browser$Browser$Dom$NotFound(id))
			);
		});
	});
}


function _Browser_withWindow(doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(doStuff()));
		});
	});
}


// FOCUS and BLUR


var _Browser_call = F2(function(functionName, id)
{
	return _Browser_withNode(id, function(node) {
		node[functionName]();
		return _Utils_Tuple0;
	});
});



// WINDOW VIEWPORT


function _Browser_getViewport()
{
	return {
		cq: _Browser_getScene(),
		cA: {
			cD: _Browser_window.pageXOffset,
			cE: _Browser_window.pageYOffset,
			cC: _Browser_doc.documentElement.clientWidth,
			bZ: _Browser_doc.documentElement.clientHeight
		}
	};
}

function _Browser_getScene()
{
	var body = _Browser_doc.body;
	var elem = _Browser_doc.documentElement;
	return {
		cC: Math.max(body.scrollWidth, body.offsetWidth, elem.scrollWidth, elem.offsetWidth, elem.clientWidth),
		bZ: Math.max(body.scrollHeight, body.offsetHeight, elem.scrollHeight, elem.offsetHeight, elem.clientHeight)
	};
}

var _Browser_setViewport = F2(function(x, y)
{
	return _Browser_withWindow(function()
	{
		_Browser_window.scroll(x, y);
		return _Utils_Tuple0;
	});
});



// ELEMENT VIEWPORT


function _Browser_getViewportOf(id)
{
	return _Browser_withNode(id, function(node)
	{
		return {
			cq: {
				cC: node.scrollWidth,
				bZ: node.scrollHeight
			},
			cA: {
				cD: node.scrollLeft,
				cE: node.scrollTop,
				cC: node.clientWidth,
				bZ: node.clientHeight
			}
		};
	});
}


var _Browser_setViewportOf = F3(function(id, x, y)
{
	return _Browser_withNode(id, function(node)
	{
		node.scrollLeft = x;
		node.scrollTop = y;
		return _Utils_Tuple0;
	});
});



// ELEMENT


function _Browser_getElement(id)
{
	return _Browser_withNode(id, function(node)
	{
		var rect = node.getBoundingClientRect();
		var x = _Browser_window.pageXOffset;
		var y = _Browser_window.pageYOffset;
		return {
			cq: _Browser_getScene(),
			cA: {
				cD: x,
				cE: y,
				cC: _Browser_doc.documentElement.clientWidth,
				bZ: _Browser_doc.documentElement.clientHeight
			},
			cW: {
				cD: x + rect.left,
				cE: y + rect.top,
				cC: rect.width,
				bZ: rect.height
			}
		};
	});
}



// LOAD and RELOAD


function _Browser_reload(skipCache)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		_VirtualDom_doc.location.reload(skipCache);
	}));
}

function _Browser_load(url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		try
		{
			_Browser_window.location = url;
		}
		catch(err)
		{
			// Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
			// Other browsers reload the page, so let's be consistent about that.
			_VirtualDom_doc.location.reload(false);
		}
	}));
}



function _Time_now(millisToPosix)
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(millisToPosix(Date.now())));
	});
}

var _Time_setInterval = F2(function(interval, task)
{
	return _Scheduler_binding(function(callback)
	{
		var id = setInterval(function() { _Scheduler_rawSpawn(task); }, interval);
		return function() { clearInterval(id); };
	});
});

function _Time_here()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(
			A2($elm$time$Time$customZone, -(new Date().getTimezoneOffset()), _List_Nil)
		));
	});
}


function _Time_getZoneName()
{
	return _Scheduler_binding(function(callback)
	{
		try
		{
			var name = $elm$time$Time$Name(Intl.DateTimeFormat().resolvedOptions().timeZone);
		}
		catch (e)
		{
			var name = $elm$time$Time$Offset(new Date().getTimezoneOffset());
		}
		callback(_Scheduler_succeed(name));
	});
}



// SEND REQUEST

var _Http_toTask = F3(function(router, toTask, request)
{
	return _Scheduler_binding(function(callback)
	{
		function done(response) {
			callback(toTask(request.aw.a(response)));
		}

		var xhr = new XMLHttpRequest();
		xhr.addEventListener('error', function() { done($elm$http$Http$NetworkError_); });
		xhr.addEventListener('timeout', function() { done($elm$http$Http$Timeout_); });
		xhr.addEventListener('load', function() { done(_Http_toResponse(request.aw.b, xhr)); });
		$elm$core$Maybe$isJust(request.aJ) && _Http_track(router, xhr, request.aJ.a);

		try {
			xhr.open(request.aB, request.aL, true);
		} catch (e) {
			return done($elm$http$Http$BadUrl_(request.aL));
		}

		_Http_configureRequest(xhr, request);

		request.au.a && xhr.setRequestHeader('Content-Type', request.au.a);
		xhr.send(request.au.b);

		return function() { xhr.c = true; xhr.abort(); };
	});
});


// CONFIGURE

function _Http_configureRequest(xhr, request)
{
	for (var headers = request.az; headers.b; headers = headers.b) // WHILE_CONS
	{
		xhr.setRequestHeader(headers.a.a, headers.a.b);
	}
	xhr.timeout = request.aI.a || 0;
	xhr.responseType = request.aw.d;
	xhr.withCredentials = request.cH;
}


// RESPONSES

function _Http_toResponse(toBody, xhr)
{
	return A2(
		200 <= xhr.status && xhr.status < 300 ? $elm$http$Http$GoodStatus_ : $elm$http$Http$BadStatus_,
		_Http_toMetadata(xhr),
		toBody(xhr.response)
	);
}


// METADATA

function _Http_toMetadata(xhr)
{
	return {
		aL: xhr.responseURL,
		dy: xhr.status,
		dz: xhr.statusText,
		az: _Http_parseHeaders(xhr.getAllResponseHeaders())
	};
}


// HEADERS

function _Http_parseHeaders(rawHeaders)
{
	if (!rawHeaders)
	{
		return $elm$core$Dict$empty;
	}

	var headers = $elm$core$Dict$empty;
	var headerPairs = rawHeaders.split('\r\n');
	for (var i = headerPairs.length; i--; )
	{
		var headerPair = headerPairs[i];
		var index = headerPair.indexOf(': ');
		if (index > 0)
		{
			var key = headerPair.substring(0, index);
			var value = headerPair.substring(index + 2);

			headers = A3($elm$core$Dict$update, key, function(oldValue) {
				return $elm$core$Maybe$Just($elm$core$Maybe$isJust(oldValue)
					? value + ', ' + oldValue.a
					: value
				);
			}, headers);
		}
	}
	return headers;
}


// EXPECT

var _Http_expect = F3(function(type, toBody, toValue)
{
	return {
		$: 0,
		d: type,
		b: toBody,
		a: toValue
	};
});

var _Http_mapExpect = F2(function(func, expect)
{
	return {
		$: 0,
		d: expect.d,
		b: expect.b,
		a: function(x) { return func(expect.a(x)); }
	};
});

function _Http_toDataView(arrayBuffer)
{
	return new DataView(arrayBuffer);
}


// BODY and PARTS

var _Http_emptyBody = { $: 0 };
var _Http_pair = F2(function(a, b) { return { $: 0, a: a, b: b }; });

function _Http_toFormData(parts)
{
	for (var formData = new FormData(); parts.b; parts = parts.b) // WHILE_CONS
	{
		var part = parts.a;
		formData.append(part.a, part.b);
	}
	return formData;
}

var _Http_bytesToBlob = F2(function(mime, bytes)
{
	return new Blob([bytes], { type: mime });
});


// PROGRESS

function _Http_track(router, xhr, tracker)
{
	// TODO check out lengthComputable on loadstart event

	xhr.upload.addEventListener('progress', function(event) {
		if (xhr.c) { return; }
		_Scheduler_rawSpawn(A2($elm$core$Platform$sendToSelf, router, _Utils_Tuple2(tracker, $elm$http$Http$Sending({
			dw: event.loaded,
			cs: event.total
		}))));
	});
	xhr.addEventListener('progress', function(event) {
		if (xhr.c) { return; }
		_Scheduler_rawSpawn(A2($elm$core$Platform$sendToSelf, router, _Utils_Tuple2(tracker, $elm$http$Http$Receiving({
			dq: event.loaded,
			cs: event.lengthComputable ? $elm$core$Maybe$Just(event.total) : $elm$core$Maybe$Nothing
		}))));
	});
}var $elm$core$Basics$EQ = 1;
var $elm$core$Basics$GT = 2;
var $elm$core$Basics$LT = 0;
var $elm$core$List$cons = _List_cons;
var $elm$core$Dict$foldr = F3(
	function (func, acc, t) {
		foldr:
		while (true) {
			if (t.$ === -2) {
				return acc;
			} else {
				var key = t.b;
				var value = t.c;
				var left = t.d;
				var right = t.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldr, func, acc, right)),
					$temp$t = left;
				func = $temp$func;
				acc = $temp$acc;
				t = $temp$t;
				continue foldr;
			}
		}
	});
var $elm$core$Dict$toList = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return A2(
					$elm$core$List$cons,
					_Utils_Tuple2(key, value),
					list);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Dict$keys = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return A2($elm$core$List$cons, key, keyList);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Set$toList = function (_v0) {
	var dict = _v0;
	return $elm$core$Dict$keys(dict);
};
var $elm$core$Elm$JsArray$foldr = _JsArray_foldr;
var $elm$core$Array$foldr = F3(
	function (func, baseCase, _v0) {
		var tree = _v0.c;
		var tail = _v0.d;
		var helper = F2(
			function (node, acc) {
				if (!node.$) {
					var subTree = node.a;
					return A3($elm$core$Elm$JsArray$foldr, helper, acc, subTree);
				} else {
					var values = node.a;
					return A3($elm$core$Elm$JsArray$foldr, func, acc, values);
				}
			});
		return A3(
			$elm$core$Elm$JsArray$foldr,
			helper,
			A3($elm$core$Elm$JsArray$foldr, func, baseCase, tail),
			tree);
	});
var $elm$core$Array$toList = function (array) {
	return A3($elm$core$Array$foldr, $elm$core$List$cons, _List_Nil, array);
};
var $elm$core$Result$Err = function (a) {
	return {$: 1, a: a};
};
var $elm$json$Json$Decode$Failure = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $elm$json$Json$Decode$Field = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$json$Json$Decode$Index = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $elm$core$Result$Ok = function (a) {
	return {$: 0, a: a};
};
var $elm$json$Json$Decode$OneOf = function (a) {
	return {$: 2, a: a};
};
var $elm$core$Basics$False = 1;
var $elm$core$Basics$add = _Basics_add;
var $elm$core$Maybe$Just = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Maybe$Nothing = {$: 1};
var $elm$core$String$all = _String_all;
var $elm$core$Basics$and = _Basics_and;
var $elm$core$Basics$append = _Utils_append;
var $elm$json$Json$Encode$encode = _Json_encode;
var $elm$core$String$fromInt = _String_fromNumber;
var $elm$core$String$join = F2(
	function (sep, chunks) {
		return A2(
			_String_join,
			sep,
			_List_toArray(chunks));
	});
var $elm$core$String$split = F2(
	function (sep, string) {
		return _List_fromArray(
			A2(_String_split, sep, string));
	});
var $elm$json$Json$Decode$indent = function (str) {
	return A2(
		$elm$core$String$join,
		'\n    ',
		A2($elm$core$String$split, '\n', str));
};
var $elm$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			if (!list.b) {
				return acc;
			} else {
				var x = list.a;
				var xs = list.b;
				var $temp$func = func,
					$temp$acc = A2(func, x, acc),
					$temp$list = xs;
				func = $temp$func;
				acc = $temp$acc;
				list = $temp$list;
				continue foldl;
			}
		}
	});
var $elm$core$List$length = function (xs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, i) {
				return i + 1;
			}),
		0,
		xs);
};
var $elm$core$List$map2 = _List_map2;
var $elm$core$Basics$le = _Utils_le;
var $elm$core$Basics$sub = _Basics_sub;
var $elm$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_Utils_cmp(lo, hi) < 1) {
				var $temp$lo = lo,
					$temp$hi = hi - 1,
					$temp$list = A2($elm$core$List$cons, hi, list);
				lo = $temp$lo;
				hi = $temp$hi;
				list = $temp$list;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var $elm$core$List$range = F2(
	function (lo, hi) {
		return A3($elm$core$List$rangeHelp, lo, hi, _List_Nil);
	});
var $elm$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$map2,
			f,
			A2(
				$elm$core$List$range,
				0,
				$elm$core$List$length(xs) - 1),
			xs);
	});
var $elm$core$Char$toCode = _Char_toCode;
var $elm$core$Char$isLower = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (97 <= code) && (code <= 122);
};
var $elm$core$Char$isUpper = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 90) && (65 <= code);
};
var $elm$core$Basics$or = _Basics_or;
var $elm$core$Char$isAlpha = function (_char) {
	return $elm$core$Char$isLower(_char) || $elm$core$Char$isUpper(_char);
};
var $elm$core$Char$isDigit = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 57) && (48 <= code);
};
var $elm$core$Char$isAlphaNum = function (_char) {
	return $elm$core$Char$isLower(_char) || ($elm$core$Char$isUpper(_char) || $elm$core$Char$isDigit(_char));
};
var $elm$core$List$reverse = function (list) {
	return A3($elm$core$List$foldl, $elm$core$List$cons, _List_Nil, list);
};
var $elm$core$String$uncons = _String_uncons;
var $elm$json$Json$Decode$errorOneOf = F2(
	function (i, error) {
		return '\n\n(' + ($elm$core$String$fromInt(i + 1) + (') ' + $elm$json$Json$Decode$indent(
			$elm$json$Json$Decode$errorToString(error))));
	});
var $elm$json$Json$Decode$errorToString = function (error) {
	return A2($elm$json$Json$Decode$errorToStringHelp, error, _List_Nil);
};
var $elm$json$Json$Decode$errorToStringHelp = F2(
	function (error, context) {
		errorToStringHelp:
		while (true) {
			switch (error.$) {
				case 0:
					var f = error.a;
					var err = error.b;
					var isSimple = function () {
						var _v1 = $elm$core$String$uncons(f);
						if (_v1.$ === 1) {
							return false;
						} else {
							var _v2 = _v1.a;
							var _char = _v2.a;
							var rest = _v2.b;
							return $elm$core$Char$isAlpha(_char) && A2($elm$core$String$all, $elm$core$Char$isAlphaNum, rest);
						}
					}();
					var fieldName = isSimple ? ('.' + f) : ('[\'' + (f + '\']'));
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, fieldName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 1:
					var i = error.a;
					var err = error.b;
					var indexName = '[' + ($elm$core$String$fromInt(i) + ']');
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, indexName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 2:
					var errors = error.a;
					if (!errors.b) {
						return 'Ran into a Json.Decode.oneOf with no possibilities' + function () {
							if (!context.b) {
								return '!';
							} else {
								return ' at json' + A2(
									$elm$core$String$join,
									'',
									$elm$core$List$reverse(context));
							}
						}();
					} else {
						if (!errors.b.b) {
							var err = errors.a;
							var $temp$error = err,
								$temp$context = context;
							error = $temp$error;
							context = $temp$context;
							continue errorToStringHelp;
						} else {
							var starter = function () {
								if (!context.b) {
									return 'Json.Decode.oneOf';
								} else {
									return 'The Json.Decode.oneOf at json' + A2(
										$elm$core$String$join,
										'',
										$elm$core$List$reverse(context));
								}
							}();
							var introduction = starter + (' failed in the following ' + ($elm$core$String$fromInt(
								$elm$core$List$length(errors)) + ' ways:'));
							return A2(
								$elm$core$String$join,
								'\n\n',
								A2(
									$elm$core$List$cons,
									introduction,
									A2($elm$core$List$indexedMap, $elm$json$Json$Decode$errorOneOf, errors)));
						}
					}
				default:
					var msg = error.a;
					var json = error.b;
					var introduction = function () {
						if (!context.b) {
							return 'Problem with the given value:\n\n';
						} else {
							return 'Problem with the value at json' + (A2(
								$elm$core$String$join,
								'',
								$elm$core$List$reverse(context)) + ':\n\n    ');
						}
					}();
					return introduction + ($elm$json$Json$Decode$indent(
						A2($elm$json$Json$Encode$encode, 4, json)) + ('\n\n' + msg));
			}
		}
	});
var $elm$core$Array$branchFactor = 32;
var $elm$core$Array$Array_elm_builtin = F4(
	function (a, b, c, d) {
		return {$: 0, a: a, b: b, c: c, d: d};
	});
var $elm$core$Elm$JsArray$empty = _JsArray_empty;
var $elm$core$Basics$ceiling = _Basics_ceiling;
var $elm$core$Basics$fdiv = _Basics_fdiv;
var $elm$core$Basics$logBase = F2(
	function (base, number) {
		return _Basics_log(number) / _Basics_log(base);
	});
var $elm$core$Basics$toFloat = _Basics_toFloat;
var $elm$core$Array$shiftStep = $elm$core$Basics$ceiling(
	A2($elm$core$Basics$logBase, 2, $elm$core$Array$branchFactor));
var $elm$core$Array$empty = A4($elm$core$Array$Array_elm_builtin, 0, $elm$core$Array$shiftStep, $elm$core$Elm$JsArray$empty, $elm$core$Elm$JsArray$empty);
var $elm$core$Elm$JsArray$initialize = _JsArray_initialize;
var $elm$core$Array$Leaf = function (a) {
	return {$: 1, a: a};
};
var $elm$core$Basics$apL = F2(
	function (f, x) {
		return f(x);
	});
var $elm$core$Basics$apR = F2(
	function (x, f) {
		return f(x);
	});
var $elm$core$Basics$eq = _Utils_equal;
var $elm$core$Basics$floor = _Basics_floor;
var $elm$core$Elm$JsArray$length = _JsArray_length;
var $elm$core$Basics$gt = _Utils_gt;
var $elm$core$Basics$max = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) > 0) ? x : y;
	});
var $elm$core$Basics$mul = _Basics_mul;
var $elm$core$Array$SubTree = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Elm$JsArray$initializeFromList = _JsArray_initializeFromList;
var $elm$core$Array$compressNodes = F2(
	function (nodes, acc) {
		compressNodes:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodes);
			var node = _v0.a;
			var remainingNodes = _v0.b;
			var newAcc = A2(
				$elm$core$List$cons,
				$elm$core$Array$SubTree(node),
				acc);
			if (!remainingNodes.b) {
				return $elm$core$List$reverse(newAcc);
			} else {
				var $temp$nodes = remainingNodes,
					$temp$acc = newAcc;
				nodes = $temp$nodes;
				acc = $temp$acc;
				continue compressNodes;
			}
		}
	});
var $elm$core$Tuple$first = function (_v0) {
	var x = _v0.a;
	return x;
};
var $elm$core$Array$treeFromBuilder = F2(
	function (nodeList, nodeListSize) {
		treeFromBuilder:
		while (true) {
			var newNodeSize = $elm$core$Basics$ceiling(nodeListSize / $elm$core$Array$branchFactor);
			if (newNodeSize === 1) {
				return A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodeList).a;
			} else {
				var $temp$nodeList = A2($elm$core$Array$compressNodes, nodeList, _List_Nil),
					$temp$nodeListSize = newNodeSize;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue treeFromBuilder;
			}
		}
	});
var $elm$core$Array$builderToArray = F2(
	function (reverseNodeList, builder) {
		if (!builder.p) {
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.s),
				$elm$core$Array$shiftStep,
				$elm$core$Elm$JsArray$empty,
				builder.s);
		} else {
			var treeLen = builder.p * $elm$core$Array$branchFactor;
			var depth = $elm$core$Basics$floor(
				A2($elm$core$Basics$logBase, $elm$core$Array$branchFactor, treeLen - 1));
			var correctNodeList = reverseNodeList ? $elm$core$List$reverse(builder.t) : builder.t;
			var tree = A2($elm$core$Array$treeFromBuilder, correctNodeList, builder.p);
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.s) + treeLen,
				A2($elm$core$Basics$max, 5, depth * $elm$core$Array$shiftStep),
				tree,
				builder.s);
		}
	});
var $elm$core$Basics$idiv = _Basics_idiv;
var $elm$core$Basics$lt = _Utils_lt;
var $elm$core$Array$initializeHelp = F5(
	function (fn, fromIndex, len, nodeList, tail) {
		initializeHelp:
		while (true) {
			if (fromIndex < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					false,
					{t: nodeList, p: (len / $elm$core$Array$branchFactor) | 0, s: tail});
			} else {
				var leaf = $elm$core$Array$Leaf(
					A3($elm$core$Elm$JsArray$initialize, $elm$core$Array$branchFactor, fromIndex, fn));
				var $temp$fn = fn,
					$temp$fromIndex = fromIndex - $elm$core$Array$branchFactor,
					$temp$len = len,
					$temp$nodeList = A2($elm$core$List$cons, leaf, nodeList),
					$temp$tail = tail;
				fn = $temp$fn;
				fromIndex = $temp$fromIndex;
				len = $temp$len;
				nodeList = $temp$nodeList;
				tail = $temp$tail;
				continue initializeHelp;
			}
		}
	});
var $elm$core$Basics$remainderBy = _Basics_remainderBy;
var $elm$core$Array$initialize = F2(
	function (len, fn) {
		if (len <= 0) {
			return $elm$core$Array$empty;
		} else {
			var tailLen = len % $elm$core$Array$branchFactor;
			var tail = A3($elm$core$Elm$JsArray$initialize, tailLen, len - tailLen, fn);
			var initialFromIndex = (len - tailLen) - $elm$core$Array$branchFactor;
			return A5($elm$core$Array$initializeHelp, fn, initialFromIndex, len, _List_Nil, tail);
		}
	});
var $elm$core$Basics$True = 0;
var $elm$core$Result$isOk = function (result) {
	if (!result.$) {
		return true;
	} else {
		return false;
	}
};
var $elm$json$Json$Decode$map = _Json_map1;
var $elm$json$Json$Decode$map2 = _Json_map2;
var $elm$json$Json$Decode$succeed = _Json_succeed;
var $elm$virtual_dom$VirtualDom$toHandlerInt = function (handler) {
	switch (handler.$) {
		case 0:
			return 0;
		case 1:
			return 1;
		case 2:
			return 2;
		default:
			return 3;
	}
};
var $elm$browser$Browser$External = function (a) {
	return {$: 1, a: a};
};
var $elm$browser$Browser$Internal = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Basics$identity = function (x) {
	return x;
};
var $elm$browser$Browser$Dom$NotFound = $elm$core$Basics$identity;
var $elm$url$Url$Http = 0;
var $elm$url$Url$Https = 1;
var $elm$url$Url$Url = F6(
	function (protocol, host, port_, path, query, fragment) {
		return {bV: fragment, b_: host, dp: path, cg: port_, cj: protocol, ck: query};
	});
var $elm$core$String$contains = _String_contains;
var $elm$core$String$length = _String_length;
var $elm$core$String$slice = _String_slice;
var $elm$core$String$dropLeft = F2(
	function (n, string) {
		return (n < 1) ? string : A3(
			$elm$core$String$slice,
			n,
			$elm$core$String$length(string),
			string);
	});
var $elm$core$String$indexes = _String_indexes;
var $elm$core$String$isEmpty = function (string) {
	return string === '';
};
var $elm$core$String$left = F2(
	function (n, string) {
		return (n < 1) ? '' : A3($elm$core$String$slice, 0, n, string);
	});
var $elm$core$String$toInt = _String_toInt;
var $elm$url$Url$chompBeforePath = F5(
	function (protocol, path, params, frag, str) {
		if ($elm$core$String$isEmpty(str) || A2($elm$core$String$contains, '@', str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, ':', str);
			if (!_v0.b) {
				return $elm$core$Maybe$Just(
					A6($elm$url$Url$Url, protocol, str, $elm$core$Maybe$Nothing, path, params, frag));
			} else {
				if (!_v0.b.b) {
					var i = _v0.a;
					var _v1 = $elm$core$String$toInt(
						A2($elm$core$String$dropLeft, i + 1, str));
					if (_v1.$ === 1) {
						return $elm$core$Maybe$Nothing;
					} else {
						var port_ = _v1;
						return $elm$core$Maybe$Just(
							A6(
								$elm$url$Url$Url,
								protocol,
								A2($elm$core$String$left, i, str),
								port_,
								path,
								params,
								frag));
					}
				} else {
					return $elm$core$Maybe$Nothing;
				}
			}
		}
	});
var $elm$url$Url$chompBeforeQuery = F4(
	function (protocol, params, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '/', str);
			if (!_v0.b) {
				return A5($elm$url$Url$chompBeforePath, protocol, '/', params, frag, str);
			} else {
				var i = _v0.a;
				return A5(
					$elm$url$Url$chompBeforePath,
					protocol,
					A2($elm$core$String$dropLeft, i, str),
					params,
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompBeforeFragment = F3(
	function (protocol, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '?', str);
			if (!_v0.b) {
				return A4($elm$url$Url$chompBeforeQuery, protocol, $elm$core$Maybe$Nothing, frag, str);
			} else {
				var i = _v0.a;
				return A4(
					$elm$url$Url$chompBeforeQuery,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompAfterProtocol = F2(
	function (protocol, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '#', str);
			if (!_v0.b) {
				return A3($elm$url$Url$chompBeforeFragment, protocol, $elm$core$Maybe$Nothing, str);
			} else {
				var i = _v0.a;
				return A3(
					$elm$url$Url$chompBeforeFragment,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$core$String$startsWith = _String_startsWith;
var $elm$url$Url$fromString = function (str) {
	return A2($elm$core$String$startsWith, 'http://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		0,
		A2($elm$core$String$dropLeft, 7, str)) : (A2($elm$core$String$startsWith, 'https://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		1,
		A2($elm$core$String$dropLeft, 8, str)) : $elm$core$Maybe$Nothing);
};
var $elm$core$Basics$never = function (_v0) {
	never:
	while (true) {
		var nvr = _v0;
		var $temp$_v0 = nvr;
		_v0 = $temp$_v0;
		continue never;
	}
};
var $elm$core$Task$Perform = $elm$core$Basics$identity;
var $elm$core$Task$succeed = _Scheduler_succeed;
var $elm$core$Task$init = $elm$core$Task$succeed(0);
var $elm$core$List$foldrHelper = F4(
	function (fn, acc, ctr, ls) {
		if (!ls.b) {
			return acc;
		} else {
			var a = ls.a;
			var r1 = ls.b;
			if (!r1.b) {
				return A2(fn, a, acc);
			} else {
				var b = r1.a;
				var r2 = r1.b;
				if (!r2.b) {
					return A2(
						fn,
						a,
						A2(fn, b, acc));
				} else {
					var c = r2.a;
					var r3 = r2.b;
					if (!r3.b) {
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(fn, c, acc)));
					} else {
						var d = r3.a;
						var r4 = r3.b;
						var res = (ctr > 500) ? A3(
							$elm$core$List$foldl,
							fn,
							acc,
							$elm$core$List$reverse(r4)) : A4($elm$core$List$foldrHelper, fn, acc, ctr + 1, r4);
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(
									fn,
									c,
									A2(fn, d, res))));
					}
				}
			}
		}
	});
var $elm$core$List$foldr = F3(
	function (fn, acc, ls) {
		return A4($elm$core$List$foldrHelper, fn, acc, 0, ls);
	});
var $elm$core$List$map = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, acc) {
					return A2(
						$elm$core$List$cons,
						f(x),
						acc);
				}),
			_List_Nil,
			xs);
	});
var $elm$core$Task$andThen = _Scheduler_andThen;
var $elm$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return $elm$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var $elm$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return A2(
					$elm$core$Task$andThen,
					function (b) {
						return $elm$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var $elm$core$Task$sequence = function (tasks) {
	return A3(
		$elm$core$List$foldr,
		$elm$core$Task$map2($elm$core$List$cons),
		$elm$core$Task$succeed(_List_Nil),
		tasks);
};
var $elm$core$Platform$sendToApp = _Platform_sendToApp;
var $elm$core$Task$spawnCmd = F2(
	function (router, _v0) {
		var task = _v0;
		return _Scheduler_spawn(
			A2(
				$elm$core$Task$andThen,
				$elm$core$Platform$sendToApp(router),
				task));
	});
var $elm$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			$elm$core$Task$map,
			function (_v0) {
				return 0;
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Task$spawnCmd(router),
					commands)));
	});
var $elm$core$Task$onSelfMsg = F3(
	function (_v0, _v1, _v2) {
		return $elm$core$Task$succeed(0);
	});
var $elm$core$Task$cmdMap = F2(
	function (tagger, _v0) {
		var task = _v0;
		return A2($elm$core$Task$map, tagger, task);
	});
_Platform_effectManagers['Task'] = _Platform_createManager($elm$core$Task$init, $elm$core$Task$onEffects, $elm$core$Task$onSelfMsg, $elm$core$Task$cmdMap);
var $elm$core$Task$command = _Platform_leaf('Task');
var $elm$core$Task$perform = F2(
	function (toMessage, task) {
		return $elm$core$Task$command(
			A2($elm$core$Task$map, toMessage, task));
	});
var $elm$browser$Browser$element = _Browser_element;
var $author$project$Messages$GotTime = function (a) {
	return {$: 25, a: a};
};
var $author$project$GitHub$NotConfigured = {$: 0};
var $author$project$Types$StartupVerification = 0;
var $elm$core$Platform$Cmd$batch = _Platform_batch;
var $elm$json$Json$Encode$null = _Json_encodeNull;
var $author$project$Main$detectMobileViewport = _Platform_outgoingPort(
	'detectMobileViewport',
	function ($) {
		return $elm$json$Json$Encode$null;
	});
var $author$project$Main$loadActionCount = _Platform_outgoingPort(
	'loadActionCount',
	function ($) {
		return $elm$json$Json$Encode$null;
	});
var $author$project$Main$loadActionEvents = _Platform_outgoingPort(
	'loadActionEvents',
	function ($) {
		return $elm$json$Json$Encode$null;
	});
var $author$project$Main$loadGitHubConfig = _Platform_outgoingPort(
	'loadGitHubConfig',
	function ($) {
		return $elm$json$Json$Encode$null;
	});
var $author$project$Main$loadLastOpenNote = _Platform_outgoingPort(
	'loadLastOpenNote',
	function ($) {
		return $elm$json$Json$Encode$null;
	});
var $author$project$Main$loadNotes = _Platform_outgoingPort(
	'loadNotes',
	function ($) {
		return $elm$json$Json$Encode$null;
	});
var $author$project$Main$loadTags = _Platform_outgoingPort(
	'loadTags',
	function ($) {
		return $elm$json$Json$Encode$null;
	});
var $elm$time$Time$Name = function (a) {
	return {$: 0, a: a};
};
var $elm$time$Time$Offset = function (a) {
	return {$: 1, a: a};
};
var $elm$time$Time$Zone = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$time$Time$customZone = $elm$time$Time$Zone;
var $elm$time$Time$Posix = $elm$core$Basics$identity;
var $elm$time$Time$millisToPosix = $elm$core$Basics$identity;
var $elm$time$Time$now = _Time_now($elm$time$Time$millisToPosix);
var $author$project$Main$init = function (_v0) {
	return _Utils_Tuple2(
		{C: 0, W: _List_Nil, F: '', aj: '', m: '', bm: $elm$core$Maybe$Nothing, ak: '', l: 0, r: '', al: $elm$core$Maybe$Nothing, h: 0, av: $elm$core$Maybe$Nothing, z: $elm$core$Maybe$Nothing, H: _List_Nil, D: _List_Nil, aQ: false, R: '', c: $elm$core$Maybe$Nothing, X: '', Y: '', ay: '', aR: false, I: false, aS: false, v: false, N: false, aT: 1, ad: '', e: _List_Nil, ae: '', af: _List_Nil, ag: '', P: '', f: false, aD: false, a4: '', w: 0, k: _List_Nil, ap: false, aU: false, aF: false, a5: false, U: false, aq: false, aG: false, aV: false, a6: false, aH: false, ar: true, V: '', b: $author$project$GitHub$NotConfigured, a7: $elm$core$Maybe$Nothing, g: _List_Nil},
		$elm$core$Platform$Cmd$batch(
			_List_fromArray(
				[
					$author$project$Main$loadNotes(0),
					$author$project$Main$loadTags(0),
					$author$project$Main$loadGitHubConfig(0),
					$author$project$Main$loadActionCount(0),
					$author$project$Main$loadActionEvents(0),
					$author$project$Main$loadLastOpenNote(0),
					$author$project$Main$detectMobileViewport(0),
					A2($elm$core$Task$perform, $author$project$Messages$GotTime, $elm$time$Time$now)
				])));
};
var $author$project$Messages$ActionCountLoaded = function (a) {
	return {$: 65, a: a};
};
var $author$project$Messages$ActionEventsLoaded = function (a) {
	return {$: 67, a: a};
};
var $author$project$Messages$CheckRemoteUpdates = {$: 73};
var $author$project$Messages$ClearDataCompleted = function (a) {
	return {$: 83, a: a};
};
var $author$project$Messages$ConfigExported = function (a) {
	return {$: 85, a: a};
};
var $author$project$Messages$ConfigImported = function (a) {
	return {$: 89, a: a};
};
var $author$project$Messages$DecryptionCompleted = function (a) {
	return {$: 44, a: a};
};
var $author$project$Messages$EncryptionCompleted = function (a) {
	return {$: 43, a: a};
};
var $author$project$Messages$GitHubConfigLoaded = function (a) {
	return {$: 37, a: a};
};
var $author$project$Messages$LastOpenNoteLoaded = function (a) {
	return {$: 69, a: a};
};
var $author$project$Messages$NoteUpdatedDuringSync = function (a) {
	return {$: 72, a: a};
};
var $author$project$Messages$NotesLoaded = function (a) {
	return {$: 12, a: a};
};
var $author$project$Messages$PostSyncNotesLoaded = function (a) {
	return {$: 51, a: a};
};
var $author$project$Messages$SetMobileView = function (a) {
	return {$: 29, a: a};
};
var $author$project$Messages$StartupPassphraseVerified = function (a) {
	return {$: 78, a: a};
};
var $author$project$Messages$SyncCompleted = function (a) {
	return {$: 48, a: a};
};
var $author$project$Messages$SyncFailed = function (a) {
	return {$: 49, a: a};
};
var $author$project$Messages$TagsLoaded = function (a) {
	return {$: 19, a: a};
};
var $elm$json$Json$Decode$value = _Json_decodeValue;
var $author$project$Main$actionCountLoaded = _Platform_incomingPort('actionCountLoaded', $elm$json$Json$Decode$value);
var $author$project$Main$actionEventsLoaded = _Platform_incomingPort('actionEventsLoaded', $elm$json$Json$Decode$value);
var $elm$core$Platform$Sub$batch = _Platform_batch;
var $author$project$Main$clearDataCompleted = _Platform_incomingPort('clearDataCompleted', $elm$json$Json$Decode$value);
var $elm$core$Basics$composeR = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var $author$project$Main$configExported = _Platform_incomingPort('configExported', $elm$json$Json$Decode$value);
var $author$project$Main$configImported = _Platform_incomingPort('configImported', $elm$json$Json$Decode$value);
var $elm$json$Json$Decode$bool = _Json_decodeBool;
var $elm$json$Json$Decode$decodeValue = _Json_run;
var $elm$json$Json$Decode$field = _Json_decodeField;
var $elm$json$Json$Decode$oneOf = _Json_oneOf;
var $elm$json$Json$Decode$string = _Json_decodeString;
var $author$project$Main$decodeEncryptionResult = function (jsonValue) {
	var decoder = A3(
		$elm$json$Json$Decode$map2,
		F2(
			function (success, result) {
				return _Utils_Tuple2(success, result);
			}),
		A2($elm$json$Json$Decode$field, 'success', $elm$json$Json$Decode$bool),
		$elm$json$Json$Decode$oneOf(
			_List_fromArray(
				[
					A2($elm$json$Json$Decode$field, 'result', $elm$json$Json$Decode$string),
					A2($elm$json$Json$Decode$field, 'error', $elm$json$Json$Decode$string)
				])));
	var _v0 = A2($elm$json$Json$Decode$decodeValue, decoder, jsonValue);
	if (!_v0.$) {
		if (_v0.a.a) {
			var _v1 = _v0.a;
			var result = _v1.b;
			return $elm$core$Result$Ok(result);
		} else {
			var _v2 = _v0.a;
			var error = _v2.b;
			return $elm$core$Result$Err(error);
		}
	} else {
		var decodeError = _v0.a;
		return $elm$core$Result$Err(
			'Failed to decode encryption result: ' + $elm$json$Json$Decode$errorToString(decodeError));
	}
};
var $author$project$Main$decodeDecryptionResult = function (jsonValue) {
	return $author$project$Main$decodeEncryptionResult(jsonValue);
};
var $author$project$Main$decryptionCompleted = _Platform_incomingPort('decryptionCompleted', $elm$json$Json$Decode$value);
var $author$project$Main$encryptionCompleted = _Platform_incomingPort('encryptionCompleted', $elm$json$Json$Decode$value);
var $elm$time$Time$Every = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$time$Time$State = F2(
	function (taggers, processes) {
		return {ci: processes, cx: taggers};
	});
var $elm$core$Dict$RBEmpty_elm_builtin = {$: -2};
var $elm$core$Dict$empty = $elm$core$Dict$RBEmpty_elm_builtin;
var $elm$time$Time$init = $elm$core$Task$succeed(
	A2($elm$time$Time$State, $elm$core$Dict$empty, $elm$core$Dict$empty));
var $elm$core$Basics$compare = _Utils_compare;
var $elm$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			if (dict.$ === -2) {
				return $elm$core$Maybe$Nothing;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var _v1 = A2($elm$core$Basics$compare, targetKey, key);
				switch (_v1) {
					case 0:
						var $temp$targetKey = targetKey,
							$temp$dict = left;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
					case 1:
						return $elm$core$Maybe$Just(value);
					default:
						var $temp$targetKey = targetKey,
							$temp$dict = right;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
				}
			}
		}
	});
var $elm$core$Dict$Black = 1;
var $elm$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {$: -1, a: a, b: b, c: c, d: d, e: e};
	});
var $elm$core$Dict$Red = 0;
var $elm$core$Dict$balance = F5(
	function (color, key, value, left, right) {
		if ((right.$ === -1) && (!right.a)) {
			var _v1 = right.a;
			var rK = right.b;
			var rV = right.c;
			var rLeft = right.d;
			var rRight = right.e;
			if ((left.$ === -1) && (!left.a)) {
				var _v3 = left.a;
				var lK = left.b;
				var lV = left.c;
				var lLeft = left.d;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					key,
					value,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					rK,
					rV,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, left, rLeft),
					rRight);
			}
		} else {
			if ((((left.$ === -1) && (!left.a)) && (left.d.$ === -1)) && (!left.d.a)) {
				var _v5 = left.a;
				var lK = left.b;
				var lV = left.c;
				var _v6 = left.d;
				var _v7 = _v6.a;
				var llK = _v6.b;
				var llV = _v6.c;
				var llLeft = _v6.d;
				var llRight = _v6.e;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					lK,
					lV,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, key, value, lRight, right));
			} else {
				return A5($elm$core$Dict$RBNode_elm_builtin, color, key, value, left, right);
			}
		}
	});
var $elm$core$Dict$insertHelp = F3(
	function (key, value, dict) {
		if (dict.$ === -2) {
			return A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, $elm$core$Dict$RBEmpty_elm_builtin, $elm$core$Dict$RBEmpty_elm_builtin);
		} else {
			var nColor = dict.a;
			var nKey = dict.b;
			var nValue = dict.c;
			var nLeft = dict.d;
			var nRight = dict.e;
			var _v1 = A2($elm$core$Basics$compare, key, nKey);
			switch (_v1) {
				case 0:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						A3($elm$core$Dict$insertHelp, key, value, nLeft),
						nRight);
				case 1:
					return A5($elm$core$Dict$RBNode_elm_builtin, nColor, nKey, value, nLeft, nRight);
				default:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						nLeft,
						A3($elm$core$Dict$insertHelp, key, value, nRight));
			}
		}
	});
var $elm$core$Dict$insert = F3(
	function (key, value, dict) {
		var _v0 = A3($elm$core$Dict$insertHelp, key, value, dict);
		if ((_v0.$ === -1) && (!_v0.a)) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$time$Time$addMySub = F2(
	function (_v0, state) {
		var interval = _v0.a;
		var tagger = _v0.b;
		var _v1 = A2($elm$core$Dict$get, interval, state);
		if (_v1.$ === 1) {
			return A3(
				$elm$core$Dict$insert,
				interval,
				_List_fromArray(
					[tagger]),
				state);
		} else {
			var taggers = _v1.a;
			return A3(
				$elm$core$Dict$insert,
				interval,
				A2($elm$core$List$cons, tagger, taggers),
				state);
		}
	});
var $elm$core$Process$kill = _Scheduler_kill;
var $elm$core$Dict$foldl = F3(
	function (func, acc, dict) {
		foldl:
		while (true) {
			if (dict.$ === -2) {
				return acc;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldl, func, acc, left)),
					$temp$dict = right;
				func = $temp$func;
				acc = $temp$acc;
				dict = $temp$dict;
				continue foldl;
			}
		}
	});
var $elm$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _v0) {
				stepState:
				while (true) {
					var list = _v0.a;
					var result = _v0.b;
					if (!list.b) {
						return _Utils_Tuple2(
							list,
							A3(rightStep, rKey, rValue, result));
					} else {
						var _v2 = list.a;
						var lKey = _v2.a;
						var lValue = _v2.b;
						var rest = list.b;
						if (_Utils_cmp(lKey, rKey) < 0) {
							var $temp$rKey = rKey,
								$temp$rValue = rValue,
								$temp$_v0 = _Utils_Tuple2(
								rest,
								A3(leftStep, lKey, lValue, result));
							rKey = $temp$rKey;
							rValue = $temp$rValue;
							_v0 = $temp$_v0;
							continue stepState;
						} else {
							if (_Utils_cmp(lKey, rKey) > 0) {
								return _Utils_Tuple2(
									list,
									A3(rightStep, rKey, rValue, result));
							} else {
								return _Utils_Tuple2(
									rest,
									A4(bothStep, lKey, lValue, rValue, result));
							}
						}
					}
				}
			});
		var _v3 = A3(
			$elm$core$Dict$foldl,
			stepState,
			_Utils_Tuple2(
				$elm$core$Dict$toList(leftDict),
				initialResult),
			rightDict);
		var leftovers = _v3.a;
		var intermediateResult = _v3.b;
		return A3(
			$elm$core$List$foldl,
			F2(
				function (_v4, result) {
					var k = _v4.a;
					var v = _v4.b;
					return A3(leftStep, k, v, result);
				}),
			intermediateResult,
			leftovers);
	});
var $elm$core$Platform$sendToSelf = _Platform_sendToSelf;
var $elm$time$Time$setInterval = _Time_setInterval;
var $elm$core$Process$spawn = _Scheduler_spawn;
var $elm$time$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		if (!intervals.b) {
			return $elm$core$Task$succeed(processes);
		} else {
			var interval = intervals.a;
			var rest = intervals.b;
			var spawnTimer = $elm$core$Process$spawn(
				A2(
					$elm$time$Time$setInterval,
					interval,
					A2($elm$core$Platform$sendToSelf, router, interval)));
			var spawnRest = function (id) {
				return A3(
					$elm$time$Time$spawnHelp,
					router,
					rest,
					A3($elm$core$Dict$insert, interval, id, processes));
			};
			return A2($elm$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var $elm$time$Time$onEffects = F3(
	function (router, subs, _v0) {
		var processes = _v0.ci;
		var rightStep = F3(
			function (_v6, id, _v7) {
				var spawns = _v7.a;
				var existing = _v7.b;
				var kills = _v7.c;
				return _Utils_Tuple3(
					spawns,
					existing,
					A2(
						$elm$core$Task$andThen,
						function (_v5) {
							return kills;
						},
						$elm$core$Process$kill(id)));
			});
		var newTaggers = A3($elm$core$List$foldl, $elm$time$Time$addMySub, $elm$core$Dict$empty, subs);
		var leftStep = F3(
			function (interval, taggers, _v4) {
				var spawns = _v4.a;
				var existing = _v4.b;
				var kills = _v4.c;
				return _Utils_Tuple3(
					A2($elm$core$List$cons, interval, spawns),
					existing,
					kills);
			});
		var bothStep = F4(
			function (interval, taggers, id, _v3) {
				var spawns = _v3.a;
				var existing = _v3.b;
				var kills = _v3.c;
				return _Utils_Tuple3(
					spawns,
					A3($elm$core$Dict$insert, interval, id, existing),
					kills);
			});
		var _v1 = A6(
			$elm$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			processes,
			_Utils_Tuple3(
				_List_Nil,
				$elm$core$Dict$empty,
				$elm$core$Task$succeed(0)));
		var spawnList = _v1.a;
		var existingDict = _v1.b;
		var killTask = _v1.c;
		return A2(
			$elm$core$Task$andThen,
			function (newProcesses) {
				return $elm$core$Task$succeed(
					A2($elm$time$Time$State, newTaggers, newProcesses));
			},
			A2(
				$elm$core$Task$andThen,
				function (_v2) {
					return A3($elm$time$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var $elm$time$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _v0 = A2($elm$core$Dict$get, interval, state.cx);
		if (_v0.$ === 1) {
			return $elm$core$Task$succeed(state);
		} else {
			var taggers = _v0.a;
			var tellTaggers = function (time) {
				return $elm$core$Task$sequence(
					A2(
						$elm$core$List$map,
						function (tagger) {
							return A2(
								$elm$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						taggers));
			};
			return A2(
				$elm$core$Task$andThen,
				function (_v1) {
					return $elm$core$Task$succeed(state);
				},
				A2($elm$core$Task$andThen, tellTaggers, $elm$time$Time$now));
		}
	});
var $elm$core$Basics$composeL = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var $elm$time$Time$subMap = F2(
	function (f, _v0) {
		var interval = _v0.a;
		var tagger = _v0.b;
		return A2(
			$elm$time$Time$Every,
			interval,
			A2($elm$core$Basics$composeL, f, tagger));
	});
_Platform_effectManagers['Time'] = _Platform_createManager($elm$time$Time$init, $elm$time$Time$onEffects, $elm$time$Time$onSelfMsg, 0, $elm$time$Time$subMap);
var $elm$time$Time$subscription = _Platform_leaf('Time');
var $elm$time$Time$every = F2(
	function (interval, tagger) {
		return $elm$time$Time$subscription(
			A2($elm$time$Time$Every, interval, tagger));
	});
var $author$project$Main$gitHubConfigLoaded = _Platform_incomingPort('gitHubConfigLoaded', $elm$json$Json$Decode$value);
var $author$project$Main$lastOpenNoteLoaded = _Platform_incomingPort('lastOpenNoteLoaded', $elm$json$Json$Decode$value);
var $author$project$Main$mobileViewportChanged = _Platform_incomingPort('mobileViewportChanged', $elm$json$Json$Decode$bool);
var $elm$core$Basics$neq = _Utils_notEqual;
var $elm$core$Platform$Sub$none = $elm$core$Platform$Sub$batch(_List_Nil);
var $author$project$Main$noteUpdatedDuringSync = _Platform_incomingPort('noteUpdatedDuringSync', $elm$json$Json$Decode$value);
var $author$project$Main$notesLoaded = _Platform_incomingPort('notesLoaded', $elm$json$Json$Decode$value);
var $author$project$Main$notesLoadedForSync = _Platform_incomingPort('notesLoadedForSync', $elm$json$Json$Decode$value);
var $author$project$Main$syncCompleted = _Platform_incomingPort('syncCompleted', $elm$json$Json$Decode$value);
var $author$project$Main$syncFailed = _Platform_incomingPort('syncFailed', $elm$json$Json$Decode$value);
var $author$project$Main$tagsLoaded = _Platform_incomingPort('tagsLoaded', $elm$json$Json$Decode$value);
var $author$project$Main$subscriptions = function (model) {
	return $elm$core$Platform$Sub$batch(
		_List_fromArray(
			[
				$author$project$Main$notesLoaded($author$project$Messages$NotesLoaded),
				$author$project$Main$notesLoadedForSync($author$project$Messages$PostSyncNotesLoaded),
				$author$project$Main$tagsLoaded($author$project$Messages$TagsLoaded),
				$author$project$Main$gitHubConfigLoaded($author$project$Messages$GitHubConfigLoaded),
				$author$project$Main$syncCompleted($author$project$Messages$SyncCompleted),
				$author$project$Main$syncFailed($author$project$Messages$SyncFailed),
				$author$project$Main$encryptionCompleted(
				A2($elm$core$Basics$composeR, $author$project$Main$decodeEncryptionResult, $author$project$Messages$EncryptionCompleted)),
				$author$project$Main$decryptionCompleted(
				function (result) {
					var _v0 = model.h;
					switch (_v0) {
						case 0:
							return model.f ? $author$project$Messages$StartupPassphraseVerified(
								$author$project$Main$decodeDecryptionResult(result)) : $author$project$Messages$DecryptionCompleted(
								$author$project$Main$decodeDecryptionResult(result));
						case 4:
							return $author$project$Messages$DecryptionCompleted(
								$author$project$Main$decodeDecryptionResult(result));
						case 5:
							return $author$project$Messages$DecryptionCompleted(
								$author$project$Main$decodeDecryptionResult(result));
						default:
							return model.f ? $author$project$Messages$StartupPassphraseVerified(
								$author$project$Main$decodeDecryptionResult(result)) : $author$project$Messages$DecryptionCompleted(
								$author$project$Main$decodeDecryptionResult(result));
					}
				}),
				$author$project$Main$actionCountLoaded($author$project$Messages$ActionCountLoaded),
				$author$project$Main$actionEventsLoaded($author$project$Messages$ActionEventsLoaded),
				$author$project$Main$lastOpenNoteLoaded($author$project$Messages$LastOpenNoteLoaded),
				$author$project$Main$mobileViewportChanged($author$project$Messages$SetMobileView),
				$author$project$Main$noteUpdatedDuringSync($author$project$Messages$NoteUpdatedDuringSync),
				$author$project$Main$clearDataCompleted(
				A2($elm$core$Basics$composeR, $author$project$Main$decodeEncryptionResult, $author$project$Messages$ClearDataCompleted)),
				$author$project$Main$configExported(
				A2($elm$core$Basics$composeR, $author$project$Main$decodeEncryptionResult, $author$project$Messages$ConfigExported)),
				$author$project$Main$configImported(
				A2($elm$core$Basics$composeR, $author$project$Main$decodeEncryptionResult, $author$project$Messages$ConfigImported)),
				((!_Utils_eq(model.c, $elm$core$Maybe$Nothing)) && (!_Utils_eq(model.al, $elm$core$Maybe$Nothing))) ? A2(
				$elm$time$Time$every,
				60 * 1000,
				function (_v1) {
					return $author$project$Messages$CheckRemoteUpdates;
				}) : $elm$core$Platform$Sub$none
			]));
};
var $author$project$Types$ClearDataVerification = 4;
var $author$project$Types$ConfigSaveVerification = 5;
var $author$project$GitHub$Disabled = {$: 1};
var $author$project$GitHub$Error = function (a) {
	return {$: 5, a: a};
};
var $author$project$Types$ForcePull = 2;
var $author$project$GitHub$Idle = {$: 2};
var $author$project$Messages$InitialHeadRefReceived = function (a) {
	return {$: 47, a: a};
};
var $author$project$Types$NoteAdded = 0;
var $author$project$Messages$NoteDeletedFromGitHub = F2(
	function (a, b) {
		return {$: 56, a: a, b: b};
	});
var $author$project$Messages$NoteFileInfoReceived = F2(
	function (a, b) {
		return {$: 55, a: a, b: b};
	});
var $author$project$Types$NoteUpdated = 1;
var $author$project$Types$RegularSync = 1;
var $author$project$Types$RemoteCheck = 3;
var $author$project$Messages$RemoteRefReceived = function (a) {
	return {$: 46, a: a};
};
var $author$project$Messages$RemoteUpdateCheckReceived = function (a) {
	return {$: 74, a: a};
};
var $author$project$Messages$SaveNoteWithTimestamp = F5(
	function (a, b, c, d, e) {
		return {$: 5, a: a, b: b, c: c, d: d, e: e};
	});
var $author$project$GitHub$Success = function (a) {
	return {$: 4, a: a};
};
var $author$project$GitHub$Syncing = {$: 3};
var $author$project$Types$ActionEvent = F6(
	function (id, actionType, noteId, noteTitle, timestamp, oldFilename) {
		return {bF: actionType, b$: id, cb: noteId, cc: noteTitle, ce: oldFilename, cy: timestamp};
	});
var $author$project$Types$NoteDeleted = 2;
var $author$project$Types$NoteRenamed = 3;
var $elm$json$Json$Decode$andThen = _Json_andThen;
var $elm$json$Json$Decode$fail = _Json_fail;
var $author$project$Types$actionTypeDecoder = A2(
	$elm$json$Json$Decode$andThen,
	function (str) {
		switch (str) {
			case 'added':
				return $elm$json$Json$Decode$succeed(0);
			case 'updated':
				return $elm$json$Json$Decode$succeed(1);
			case 'deleted':
				return $elm$json$Json$Decode$succeed(2);
			case 'renamed':
				return $elm$json$Json$Decode$succeed(3);
			default:
				return $elm$json$Json$Decode$fail('Unknown action type: ' + str);
		}
	},
	$elm$json$Json$Decode$string);
var $elm$json$Json$Decode$int = _Json_decodeInt;
var $elm$json$Json$Decode$map6 = _Json_map6;
var $elm$json$Json$Decode$maybe = function (decoder) {
	return $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2($elm$json$Json$Decode$map, $elm$core$Maybe$Just, decoder),
				$elm$json$Json$Decode$succeed($elm$core$Maybe$Nothing)
			]));
};
var $author$project$Types$actionEventDecoder = A7(
	$elm$json$Json$Decode$map6,
	$author$project$Types$ActionEvent,
	A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'actionType', $author$project$Types$actionTypeDecoder),
	A2($elm$json$Json$Decode$field, 'noteId', $elm$json$Json$Decode$int),
	A2($elm$json$Json$Decode$field, 'noteTitle', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'timestamp', $elm$json$Json$Decode$int),
	$elm$json$Json$Decode$maybe(
		A2($elm$json$Json$Decode$field, 'oldFilename', $elm$json$Json$Decode$string)));
var $elm$json$Json$Decode$list = _Json_decodeList;
var $author$project$Action$actionEventsDecoder = $elm$json$Json$Decode$list($author$project$Types$actionEventDecoder);
var $elm$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			if (!list.b) {
				return false;
			} else {
				var x = list.a;
				var xs = list.b;
				if (isOkay(x)) {
					return true;
				} else {
					var $temp$isOkay = isOkay,
						$temp$list = xs;
					isOkay = $temp$isOkay;
					list = $temp$list;
					continue any;
				}
			}
		}
	});
var $author$project$Main$clearActionEvents = _Platform_outgoingPort(
	'clearActionEvents',
	function ($) {
		return $elm$json$Json$Encode$null;
	});
var $author$project$Main$clearAllData = _Platform_outgoingPort(
	'clearAllData',
	function ($) {
		return $elm$json$Json$Encode$null;
	});
var $author$project$Main$clearMermaidDiagrams = _Platform_outgoingPort(
	'clearMermaidDiagrams',
	function ($) {
		return $elm$json$Json$Encode$null;
	});
var $elm$core$String$trim = _String_trim;
var $author$project$GitHub$createGitHubConfig = F2(
	function (repoUrl, token) {
		return {
			bo: false,
			br: '',
			bs: 0,
			bx: $elm$core$String$trim(token),
			bz: $elm$core$String$trim(repoUrl)
		};
	});
var $author$project$Note$createNoteWithTime = F4(
	function (id, title, content, currentTime) {
		return {
			cS: content,
			bd: currentTime,
			aN: currentTime,
			b$: id,
			g: _List_Nil,
			x: ($elm$core$String$trim(title) === '') ? 'Untitled' : title
		};
	});
var $elm$core$String$toLower = _String_toLower;
var $author$project$Tag$createTag = function (name) {
	return {
		bu: $elm$core$String$toLower(
			$elm$core$String$trim(name))
	};
};
var $author$project$Main$decodeResultFromJson = function (jsonValue) {
	var decoder = A3(
		$elm$json$Json$Decode$map2,
		F2(
			function (tag, contents) {
				return _Utils_Tuple2(tag, contents);
			}),
		A2($elm$json$Json$Decode$field, 'tag', $elm$json$Json$Decode$string),
		A2($elm$json$Json$Decode$field, 'contents', $elm$json$Json$Decode$string));
	var _v0 = A2($elm$json$Json$Decode$decodeValue, decoder, jsonValue);
	if (!_v0.$) {
		switch (_v0.a.a) {
			case 'Ok':
				var _v1 = _v0.a;
				var message = _v1.b;
				return $elm$core$Result$Ok(message);
			case 'Err':
				var _v2 = _v0.a;
				var error = _v2.b;
				return $elm$core$Result$Err(error);
			default:
				var _v3 = _v0.a;
				var tag = _v3.a;
				return $elm$core$Result$Err('Unknown result tag: ' + tag);
		}
	} else {
		var decodeError = _v0.a;
		return $elm$core$Result$Err(
			'Failed to decode sync result: ' + $elm$json$Json$Decode$errorToString(decodeError));
	}
};
var $elm$json$Json$Decode$decodeString = _Json_runOnString;
var $author$project$Types$SyncResult = F4(
	function (message, commitSha, forcePull, headRef) {
		return {bL: commitSha, c1: forcePull, c2: headRef, da: message};
	});
var $elm$json$Json$Decode$map4 = _Json_map4;
var $elm$json$Json$Decode$null = _Json_decodeNull;
var $elm$json$Json$Decode$nullable = function (decoder) {
	return $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				$elm$json$Json$Decode$null($elm$core$Maybe$Nothing),
				A2($elm$json$Json$Decode$map, $elm$core$Maybe$Just, decoder)
			]));
};
var $author$project$Main$decodeSyncResult = A5(
	$elm$json$Json$Decode$map4,
	$author$project$Types$SyncResult,
	A2($elm$json$Json$Decode$field, 'message', $elm$json$Json$Decode$string),
	A2(
		$elm$json$Json$Decode$field,
		'commitSha',
		$elm$json$Json$Decode$nullable($elm$json$Json$Decode$string)),
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2(
				$elm$json$Json$Decode$field,
				'forcePull',
				$elm$json$Json$Decode$nullable($elm$json$Json$Decode$bool)),
				$elm$json$Json$Decode$succeed($elm$core$Maybe$Nothing)
			])),
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2(
				$elm$json$Json$Decode$field,
				'headRef',
				$elm$json$Json$Decode$nullable($elm$json$Json$Decode$string)),
				$elm$json$Json$Decode$succeed($elm$core$Maybe$Nothing)
			])));
var $elm$json$Json$Encode$object = function (pairs) {
	return _Json_wrap(
		A3(
			$elm$core$List$foldl,
			F2(
				function (_v0, obj) {
					var k = _v0.a;
					var v = _v0.b;
					return A3(_Json_addField, k, v, obj);
				}),
			_Json_emptyObject(0),
			pairs));
};
var $elm$json$Json$Encode$string = _Json_wrap;
var $author$project$Main$decryptWithPassphrase = _Platform_outgoingPort(
	'decryptWithPassphrase',
	function ($) {
		return $elm$json$Json$Encode$object(
			_List_fromArray(
				[
					_Utils_Tuple2(
					'encryptedText',
					$elm$json$Json$Encode$string($.am)),
					_Utils_Tuple2(
					'passphrase',
					$elm$json$Json$Encode$string($.O))
				]));
	});
var $elm$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (n <= 0) {
				return list;
			} else {
				if (!list.b) {
					return list;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs;
					n = $temp$n;
					list = $temp$list;
					continue drop;
				}
			}
		}
	});
var $elm$http$Http$BadStatus_ = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $elm$http$Http$BadUrl_ = function (a) {
	return {$: 0, a: a};
};
var $elm$http$Http$GoodStatus_ = F2(
	function (a, b) {
		return {$: 4, a: a, b: b};
	});
var $elm$http$Http$NetworkError_ = {$: 2};
var $elm$http$Http$Receiving = function (a) {
	return {$: 1, a: a};
};
var $elm$http$Http$Sending = function (a) {
	return {$: 0, a: a};
};
var $elm$http$Http$Timeout_ = {$: 1};
var $elm$core$Maybe$isJust = function (maybe) {
	if (!maybe.$) {
		return true;
	} else {
		return false;
	}
};
var $elm$core$Dict$getMin = function (dict) {
	getMin:
	while (true) {
		if ((dict.$ === -1) && (dict.d.$ === -1)) {
			var left = dict.d;
			var $temp$dict = left;
			dict = $temp$dict;
			continue getMin;
		} else {
			return dict;
		}
	}
};
var $elm$core$Dict$moveRedLeft = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.e.d.$ === -1) && (!dict.e.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var lLeft = _v1.d;
			var lRight = _v1.e;
			var _v2 = dict.e;
			var rClr = _v2.a;
			var rK = _v2.b;
			var rV = _v2.c;
			var rLeft = _v2.d;
			var _v3 = rLeft.a;
			var rlK = rLeft.b;
			var rlV = rLeft.c;
			var rlL = rLeft.d;
			var rlR = rLeft.e;
			var rRight = _v2.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				0,
				rlK,
				rlV,
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					rlL),
				A5($elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rlR, rRight));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v4 = dict.d;
			var lClr = _v4.a;
			var lK = _v4.b;
			var lV = _v4.c;
			var lLeft = _v4.d;
			var lRight = _v4.e;
			var _v5 = dict.e;
			var rClr = _v5.a;
			var rK = _v5.b;
			var rV = _v5.c;
			var rLeft = _v5.d;
			var rRight = _v5.e;
			if (clr === 1) {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$moveRedRight = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.d.d.$ === -1) && (!dict.d.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var _v2 = _v1.d;
			var _v3 = _v2.a;
			var llK = _v2.b;
			var llV = _v2.c;
			var llLeft = _v2.d;
			var llRight = _v2.e;
			var lRight = _v1.e;
			var _v4 = dict.e;
			var rClr = _v4.a;
			var rK = _v4.b;
			var rV = _v4.c;
			var rLeft = _v4.d;
			var rRight = _v4.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				0,
				lK,
				lV,
				A5($elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					lRight,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight)));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v5 = dict.d;
			var lClr = _v5.a;
			var lK = _v5.b;
			var lV = _v5.c;
			var lLeft = _v5.d;
			var lRight = _v5.e;
			var _v6 = dict.e;
			var rClr = _v6.a;
			var rK = _v6.b;
			var rV = _v6.c;
			var rLeft = _v6.d;
			var rRight = _v6.e;
			if (clr === 1) {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$removeHelpPrepEQGT = F7(
	function (targetKey, dict, color, key, value, left, right) {
		if ((left.$ === -1) && (!left.a)) {
			var _v1 = left.a;
			var lK = left.b;
			var lV = left.c;
			var lLeft = left.d;
			var lRight = left.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				lK,
				lV,
				lLeft,
				A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, lRight, right));
		} else {
			_v2$2:
			while (true) {
				if ((right.$ === -1) && (right.a === 1)) {
					if (right.d.$ === -1) {
						if (right.d.a === 1) {
							var _v3 = right.a;
							var _v4 = right.d;
							var _v5 = _v4.a;
							return $elm$core$Dict$moveRedRight(dict);
						} else {
							break _v2$2;
						}
					} else {
						var _v6 = right.a;
						var _v7 = right.d;
						return $elm$core$Dict$moveRedRight(dict);
					}
				} else {
					break _v2$2;
				}
			}
			return dict;
		}
	});
var $elm$core$Dict$removeMin = function (dict) {
	if ((dict.$ === -1) && (dict.d.$ === -1)) {
		var color = dict.a;
		var key = dict.b;
		var value = dict.c;
		var left = dict.d;
		var lColor = left.a;
		var lLeft = left.d;
		var right = dict.e;
		if (lColor === 1) {
			if ((lLeft.$ === -1) && (!lLeft.a)) {
				var _v3 = lLeft.a;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					key,
					value,
					$elm$core$Dict$removeMin(left),
					right);
			} else {
				var _v4 = $elm$core$Dict$moveRedLeft(dict);
				if (_v4.$ === -1) {
					var nColor = _v4.a;
					var nKey = _v4.b;
					var nValue = _v4.c;
					var nLeft = _v4.d;
					var nRight = _v4.e;
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						$elm$core$Dict$removeMin(nLeft),
						nRight);
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			}
		} else {
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				key,
				value,
				$elm$core$Dict$removeMin(left),
				right);
		}
	} else {
		return $elm$core$Dict$RBEmpty_elm_builtin;
	}
};
var $elm$core$Dict$removeHelp = F2(
	function (targetKey, dict) {
		if (dict.$ === -2) {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		} else {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_cmp(targetKey, key) < 0) {
				if ((left.$ === -1) && (left.a === 1)) {
					var _v4 = left.a;
					var lLeft = left.d;
					if ((lLeft.$ === -1) && (!lLeft.a)) {
						var _v6 = lLeft.a;
						return A5(
							$elm$core$Dict$RBNode_elm_builtin,
							color,
							key,
							value,
							A2($elm$core$Dict$removeHelp, targetKey, left),
							right);
					} else {
						var _v7 = $elm$core$Dict$moveRedLeft(dict);
						if (_v7.$ === -1) {
							var nColor = _v7.a;
							var nKey = _v7.b;
							var nValue = _v7.c;
							var nLeft = _v7.d;
							var nRight = _v7.e;
							return A5(
								$elm$core$Dict$balance,
								nColor,
								nKey,
								nValue,
								A2($elm$core$Dict$removeHelp, targetKey, nLeft),
								nRight);
						} else {
							return $elm$core$Dict$RBEmpty_elm_builtin;
						}
					}
				} else {
					return A5(
						$elm$core$Dict$RBNode_elm_builtin,
						color,
						key,
						value,
						A2($elm$core$Dict$removeHelp, targetKey, left),
						right);
				}
			} else {
				return A2(
					$elm$core$Dict$removeHelpEQGT,
					targetKey,
					A7($elm$core$Dict$removeHelpPrepEQGT, targetKey, dict, color, key, value, left, right));
			}
		}
	});
var $elm$core$Dict$removeHelpEQGT = F2(
	function (targetKey, dict) {
		if (dict.$ === -1) {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_eq(targetKey, key)) {
				var _v1 = $elm$core$Dict$getMin(right);
				if (_v1.$ === -1) {
					var minKey = _v1.b;
					var minValue = _v1.c;
					return A5(
						$elm$core$Dict$balance,
						color,
						minKey,
						minValue,
						left,
						$elm$core$Dict$removeMin(right));
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			} else {
				return A5(
					$elm$core$Dict$balance,
					color,
					key,
					value,
					left,
					A2($elm$core$Dict$removeHelp, targetKey, right));
			}
		} else {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		}
	});
var $elm$core$Dict$remove = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$removeHelp, key, dict);
		if ((_v0.$ === -1) && (!_v0.a)) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$update = F3(
	function (targetKey, alter, dictionary) {
		var _v0 = alter(
			A2($elm$core$Dict$get, targetKey, dictionary));
		if (!_v0.$) {
			var value = _v0.a;
			return A3($elm$core$Dict$insert, targetKey, value, dictionary);
		} else {
			return A2($elm$core$Dict$remove, targetKey, dictionary);
		}
	});
var $elm$http$Http$expectStringResponse = F2(
	function (toMsg, toResult) {
		return A3(
			_Http_expect,
			'',
			$elm$core$Basics$identity,
			A2($elm$core$Basics$composeR, toResult, toMsg));
	});
var $elm$http$Http$BadBody = function (a) {
	return {$: 4, a: a};
};
var $elm$http$Http$BadStatus = function (a) {
	return {$: 3, a: a};
};
var $elm$http$Http$BadUrl = function (a) {
	return {$: 0, a: a};
};
var $elm$http$Http$NetworkError = {$: 2};
var $elm$http$Http$Timeout = {$: 1};
var $elm$core$Result$mapError = F2(
	function (f, result) {
		if (!result.$) {
			var v = result.a;
			return $elm$core$Result$Ok(v);
		} else {
			var e = result.a;
			return $elm$core$Result$Err(
				f(e));
		}
	});
var $elm$http$Http$resolve = F2(
	function (toResult, response) {
		switch (response.$) {
			case 0:
				var url = response.a;
				return $elm$core$Result$Err(
					$elm$http$Http$BadUrl(url));
			case 1:
				return $elm$core$Result$Err($elm$http$Http$Timeout);
			case 2:
				return $elm$core$Result$Err($elm$http$Http$NetworkError);
			case 3:
				var metadata = response.a;
				return $elm$core$Result$Err(
					$elm$http$Http$BadStatus(metadata.dy));
			default:
				var body = response.b;
				return A2(
					$elm$core$Result$mapError,
					$elm$http$Http$BadBody,
					toResult(body));
		}
	});
var $elm$http$Http$expectString = function (toMsg) {
	return A2(
		$elm$http$Http$expectStringResponse,
		toMsg,
		$elm$http$Http$resolve($elm$core$Result$Ok));
};
var $author$project$GitHubAPI$getAuthorizationHeader = function (token) {
	return A2($elm$core$String$startsWith, 'github_pat_', token) ? ('Bearer ' + token) : ('token ' + token);
};
var $elm$http$Http$Header = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$http$Http$header = $elm$http$Http$Header;
var $elm$http$Http$jsonBody = function (value) {
	return A2(
		_Http_pair,
		'application/json',
		A2($elm$json$Json$Encode$encode, 0, value));
};
var $elm$core$Platform$Cmd$none = $elm$core$Platform$Cmd$batch(_List_Nil);
var $elm$http$Http$Request = function (a) {
	return {$: 1, a: a};
};
var $elm$http$Http$State = F2(
	function (reqs, subs) {
		return {cm: reqs, cw: subs};
	});
var $elm$http$Http$init = $elm$core$Task$succeed(
	A2($elm$http$Http$State, $elm$core$Dict$empty, _List_Nil));
var $elm$http$Http$updateReqs = F3(
	function (router, cmds, reqs) {
		updateReqs:
		while (true) {
			if (!cmds.b) {
				return $elm$core$Task$succeed(reqs);
			} else {
				var cmd = cmds.a;
				var otherCmds = cmds.b;
				if (!cmd.$) {
					var tracker = cmd.a;
					var _v2 = A2($elm$core$Dict$get, tracker, reqs);
					if (_v2.$ === 1) {
						var $temp$router = router,
							$temp$cmds = otherCmds,
							$temp$reqs = reqs;
						router = $temp$router;
						cmds = $temp$cmds;
						reqs = $temp$reqs;
						continue updateReqs;
					} else {
						var pid = _v2.a;
						return A2(
							$elm$core$Task$andThen,
							function (_v3) {
								return A3(
									$elm$http$Http$updateReqs,
									router,
									otherCmds,
									A2($elm$core$Dict$remove, tracker, reqs));
							},
							$elm$core$Process$kill(pid));
					}
				} else {
					var req = cmd.a;
					return A2(
						$elm$core$Task$andThen,
						function (pid) {
							var _v4 = req.aJ;
							if (_v4.$ === 1) {
								return A3($elm$http$Http$updateReqs, router, otherCmds, reqs);
							} else {
								var tracker = _v4.a;
								return A3(
									$elm$http$Http$updateReqs,
									router,
									otherCmds,
									A3($elm$core$Dict$insert, tracker, pid, reqs));
							}
						},
						$elm$core$Process$spawn(
							A3(
								_Http_toTask,
								router,
								$elm$core$Platform$sendToApp(router),
								req)));
				}
			}
		}
	});
var $elm$http$Http$onEffects = F4(
	function (router, cmds, subs, state) {
		return A2(
			$elm$core$Task$andThen,
			function (reqs) {
				return $elm$core$Task$succeed(
					A2($elm$http$Http$State, reqs, subs));
			},
			A3($elm$http$Http$updateReqs, router, cmds, state.cm));
	});
var $elm$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _v0 = f(mx);
		if (!_v0.$) {
			var x = _v0.a;
			return A2($elm$core$List$cons, x, xs);
		} else {
			return xs;
		}
	});
var $elm$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			$elm$core$List$maybeCons(f),
			_List_Nil,
			xs);
	});
var $elm$http$Http$maybeSend = F4(
	function (router, desiredTracker, progress, _v0) {
		var actualTracker = _v0.a;
		var toMsg = _v0.b;
		return _Utils_eq(desiredTracker, actualTracker) ? $elm$core$Maybe$Just(
			A2(
				$elm$core$Platform$sendToApp,
				router,
				toMsg(progress))) : $elm$core$Maybe$Nothing;
	});
var $elm$http$Http$onSelfMsg = F3(
	function (router, _v0, state) {
		var tracker = _v0.a;
		var progress = _v0.b;
		return A2(
			$elm$core$Task$andThen,
			function (_v1) {
				return $elm$core$Task$succeed(state);
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$filterMap,
					A3($elm$http$Http$maybeSend, router, tracker, progress),
					state.cw)));
	});
var $elm$http$Http$Cancel = function (a) {
	return {$: 0, a: a};
};
var $elm$http$Http$cmdMap = F2(
	function (func, cmd) {
		if (!cmd.$) {
			var tracker = cmd.a;
			return $elm$http$Http$Cancel(tracker);
		} else {
			var r = cmd.a;
			return $elm$http$Http$Request(
				{
					cH: r.cH,
					au: r.au,
					aw: A2(_Http_mapExpect, func, r.aw),
					az: r.az,
					aB: r.aB,
					aI: r.aI,
					aJ: r.aJ,
					aL: r.aL
				});
		}
	});
var $elm$http$Http$MySub = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$http$Http$subMap = F2(
	function (func, _v0) {
		var tracker = _v0.a;
		var toMsg = _v0.b;
		return A2(
			$elm$http$Http$MySub,
			tracker,
			A2($elm$core$Basics$composeR, toMsg, func));
	});
_Platform_effectManagers['Http'] = _Platform_createManager($elm$http$Http$init, $elm$http$Http$onEffects, $elm$http$Http$onSelfMsg, $elm$http$Http$cmdMap, $elm$http$Http$subMap);
var $elm$http$Http$command = _Platform_leaf('Http');
var $elm$http$Http$subscription = _Platform_leaf('Http');
var $elm$http$Http$request = function (r) {
	return $elm$http$Http$command(
		$elm$http$Http$Request(
			{cH: false, au: r.au, aw: r.aw, az: r.az, aB: r.aB, aI: r.aI, aJ: r.aJ, aL: r.aL}));
};
var $author$project$GitHubAPI$deleteFile = F6(
	function (repoUrl, token, filePath, fileSha, commitMessage, toMsg) {
		var urlParts = A2($elm$core$String$split, '/', repoUrl);
		var ownerRepo = function () {
			var _v2 = A2($elm$core$List$drop, 3, urlParts);
			if (_v2.b && _v2.b.b) {
				var owner = _v2.a;
				var _v3 = _v2.b;
				var repo = _v3.a;
				return $elm$core$Maybe$Just(
					_Utils_Tuple2(owner, repo));
			} else {
				return $elm$core$Maybe$Nothing;
			}
		}();
		if (!ownerRepo.$) {
			var _v1 = ownerRepo.a;
			var owner = _v1.a;
			var repo = _v1.b;
			var url = 'https://api.github.com/repos/' + (owner + ('/' + (repo + ('/contents/' + filePath))));
			var headers = _List_fromArray(
				[
					A2(
					$elm$http$Http$header,
					'Authorization',
					$author$project$GitHubAPI$getAuthorizationHeader(token)),
					A2($elm$http$Http$header, 'Accept', 'application/vnd.github+json'),
					A2($elm$http$Http$header, 'X-GitHub-Api-Version', '2022-11-28')
				]);
			var body = $elm$http$Http$jsonBody(
				$elm$json$Json$Encode$object(
					_List_fromArray(
						[
							_Utils_Tuple2(
							'message',
							$elm$json$Json$Encode$string(commitMessage)),
							_Utils_Tuple2(
							'sha',
							$elm$json$Json$Encode$string(fileSha))
						])));
			return $elm$http$Http$request(
				{
					au: body,
					aw: $elm$http$Http$expectString(toMsg),
					az: headers,
					aB: 'DELETE',
					aI: $elm$core$Maybe$Nothing,
					aJ: $elm$core$Maybe$Nothing,
					aL: url
				});
		} else {
			return $elm$core$Platform$Cmd$none;
		}
	});
var $elm$core$List$filter = F2(
	function (isGood, list) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, xs) {
					return isGood(x) ? A2($elm$core$List$cons, x, xs) : xs;
				}),
			_List_Nil,
			list);
	});
var $author$project$Note$deleteNoteById = F2(
	function (id, notes) {
		return A2(
			$elm$core$List$filter,
			function (note) {
				return !_Utils_eq(note.b$, id);
			},
			notes);
	});
var $elm$core$List$head = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return $elm$core$Maybe$Just(x);
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $elm$json$Json$Encode$list = F2(
	function (func, entries) {
		return _Json_wrap(
			A3(
				$elm$core$List$foldl,
				_Json_addEntry(func),
				_Json_emptyArray(0),
				entries));
	});
var $elm$json$Json$Encode$int = _Json_wrap;
var $author$project$Tag$tagEncoder = function (tag) {
	return $elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'name',
				$elm$json$Json$Encode$string(tag.bu))
			]));
};
var $author$project$Tag$tagsEncoder = function (tags) {
	return A2($elm$json$Json$Encode$list, $author$project$Tag$tagEncoder, tags);
};
var $author$project$Note$noteEncoder = function (note) {
	return $elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'id',
				$elm$json$Json$Encode$int(note.b$)),
				_Utils_Tuple2(
				'title',
				$elm$json$Json$Encode$string(note.x)),
				_Utils_Tuple2(
				'content',
				$elm$json$Json$Encode$string(note.cS)),
				_Utils_Tuple2(
				'createdAt',
				$elm$json$Json$Encode$int(note.bd)),
				_Utils_Tuple2(
				'editedAt',
				$elm$json$Json$Encode$int(note.aN)),
				_Utils_Tuple2(
				'tags',
				$author$project$Tag$tagsEncoder(note.g))
			]));
};
var $author$project$Note$notesEncoder = function (notes) {
	return A2($elm$json$Json$Encode$list, $author$project$Note$noteEncoder, notes);
};
var $author$project$Types$actionTypeEncoder = function (actionType) {
	switch (actionType) {
		case 0:
			return $elm$json$Json$Encode$string('added');
		case 1:
			return $elm$json$Json$Encode$string('updated');
		case 2:
			return $elm$json$Json$Encode$string('deleted');
		default:
			return $elm$json$Json$Encode$string('renamed');
	}
};
var $author$project$Types$actionEventEncoder = function (event) {
	return $elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'id',
				$elm$json$Json$Encode$string(event.b$)),
				_Utils_Tuple2(
				'actionType',
				$author$project$Types$actionTypeEncoder(event.bF)),
				_Utils_Tuple2(
				'noteId',
				$elm$json$Json$Encode$int(event.cb)),
				_Utils_Tuple2(
				'noteTitle',
				$elm$json$Json$Encode$string(event.cc)),
				_Utils_Tuple2(
				'timestamp',
				$elm$json$Json$Encode$int(event.cy)),
				_Utils_Tuple2(
				'oldFilename',
				function () {
					var _v0 = event.ce;
					if (!_v0.$) {
						var filename = _v0.a;
						return $elm$json$Json$Encode$string(filename);
					} else {
						return $elm$json$Json$Encode$null;
					}
				}())
			]));
};
var $author$project$Action$actionTypeToString = function (actionType) {
	switch (actionType) {
		case 0:
			return 'added';
		case 1:
			return 'updated';
		case 2:
			return 'deleted';
		default:
			return 'renamed';
	}
};
var $author$project$Action$createActionEvent = F4(
	function (actionType, noteId, noteTitle, timestamp) {
		return {
			bF: actionType,
			b$: $elm$core$String$fromInt(timestamp) + ('_' + $elm$core$String$fromInt(noteId)),
			cb: noteId,
			cc: noteTitle,
			ce: $elm$core$Maybe$Nothing,
			cy: timestamp
		};
	});
var $author$project$Main$deduplicateActions = _Platform_outgoingPort('deduplicateActions', $elm$core$Basics$identity);
var $author$project$Main$saveActionCount = _Platform_outgoingPort('saveActionCount', $elm$core$Basics$identity);
var $author$project$Main$recordAction = F5(
	function (actionType, noteId, noteTitle, timestamp, model) {
		var newActionCount = model.C + 1;
		var actionEvent = A4($author$project$Action$createActionEvent, actionType, noteId, noteTitle, timestamp);
		var deduplicationData = $elm$json$Json$Encode$object(
			_List_fromArray(
				[
					_Utils_Tuple2(
					'actionEvent',
					$author$project$Types$actionEventEncoder(actionEvent)),
					_Utils_Tuple2(
					'actionType',
					$elm$json$Json$Encode$string(
						$author$project$Action$actionTypeToString(actionType))),
					_Utils_Tuple2(
					'noteId',
					$elm$json$Json$Encode$int(noteId))
				]));
		return _Utils_Tuple2(
			_Utils_update(
				model,
				{C: newActionCount}),
			$elm$core$Platform$Cmd$batch(
				_List_fromArray(
					[
						$author$project$Main$deduplicateActions(deduplicationData),
						$author$project$Main$saveActionCount(
						$elm$json$Json$Encode$int(newActionCount))
					])));
	});
var $author$project$Main$saveNotes = _Platform_outgoingPort('saveNotes', $elm$core$Basics$identity);
var $elm$core$Tuple$second = function (_v0) {
	var y = _v0.b;
	return y;
};
var $author$project$Main$deleteNoteLocally = F2(
	function (id, model) {
		var updatedNotes = A2($author$project$Note$deleteNoteById, id, model.e);
		var noteToDelete = $elm$core$List$head(
			A2(
				$elm$core$List$filter,
				function (note) {
					return _Utils_eq(note.b$, id);
				},
				model.e));
		var noteTitle = function () {
			if (!noteToDelete.$) {
				var note = noteToDelete.a;
				return note.x;
			} else {
				return 'Unknown Note';
			}
		}();
		var isCurrentlyEditing = _Utils_eq(
			model.z,
			$elm$core$Maybe$Just(id));
		var actionResult = A5($author$project$Main$recordAction, 2, id, noteTitle, model.l, model);
		var updatedModel = isCurrentlyEditing ? _Utils_update(
			model,
			{C: actionResult.a.C, m: '', r: '', av: $elm$core$Maybe$Nothing, z: $elm$core$Maybe$Nothing, e: updatedNotes, ae: '', af: _List_Nil, ag: '', k: _List_Nil}) : _Utils_update(
			model,
			{C: actionResult.a.C, av: $elm$core$Maybe$Nothing, e: updatedNotes});
		return _Utils_Tuple2(
			updatedModel,
			$elm$core$Platform$Cmd$batch(
				_List_fromArray(
					[
						$author$project$Main$saveNotes(
						$author$project$Note$notesEncoder(updatedNotes)),
						actionResult.b
					])));
	});
var $author$project$Tag$deleteTagByName = F2(
	function (name, tags) {
		var lowerName = $elm$core$String$toLower(
			$elm$core$String$trim(name));
		return A2(
			$elm$core$List$filter,
			function (tag) {
				return !_Utils_eq(tag.bu, lowerName);
			},
			tags);
	});
var $elm$core$Basics$negate = function (n) {
	return -n;
};
var $elm$core$String$dropRight = F2(
	function (n, string) {
		return (n < 1) ? string : A3($elm$core$String$slice, 0, -n, string);
	});
var $elm$json$Json$Encode$bool = _Json_wrap;
var $author$project$GitHub$gitHubConfigEncoder = function (config) {
	return $elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'repositoryUrl',
				$elm$json$Json$Encode$string(config.bz)),
				_Utils_Tuple2(
				'personalAccessToken',
				$elm$json$Json$Encode$string(config.bx)),
				_Utils_Tuple2(
				'lastSyncTime',
				$elm$json$Json$Encode$int(config.bs)),
				_Utils_Tuple2(
				'lastSyncRef',
				$elm$json$Json$Encode$string(config.br)),
				_Utils_Tuple2(
				'enabled',
				$elm$json$Json$Encode$bool(config.bo))
			]));
};
var $author$project$Action$encodeSyncData = F2(
	function (config, actionEvents) {
		return $elm$json$Json$Encode$object(
			_List_fromArray(
				[
					_Utils_Tuple2(
					'config',
					$author$project$GitHub$gitHubConfigEncoder(config)),
					_Utils_Tuple2(
					'actionEvents',
					A2($elm$json$Json$Encode$list, $author$project$Types$actionEventEncoder, actionEvents))
				]));
	});
var $author$project$Main$encryptWithPassphrase = _Platform_outgoingPort(
	'encryptWithPassphrase',
	function ($) {
		return $elm$json$Json$Encode$object(
			_List_fromArray(
				[
					_Utils_Tuple2(
					'passphrase',
					$elm$json$Json$Encode$string($.O)),
					_Utils_Tuple2(
					'text',
					$elm$json$Json$Encode$string($.bk))
				]));
	});
var $elm$core$String$endsWith = _String_endsWith;
var $author$project$Main$exportGitHubConfig = _Platform_outgoingPort('exportGitHubConfig', $elm$core$Basics$identity);
var $author$project$Utils$fuzzyMatchScore = F5(
	function (queryChars, textChars, queryIndex, textIndex, matches) {
		fuzzyMatchScore:
		while (true) {
			var _v0 = _Utils_Tuple2(queryChars, textChars);
			if (!_v0.a.b) {
				return matches / $elm$core$List$length(queryChars);
			} else {
				if (!_v0.b.b) {
					return 0.0;
				} else {
					var _v1 = _v0.a;
					var qChar = _v1.a;
					var qRest = _v1.b;
					var _v2 = _v0.b;
					var tChar = _v2.a;
					var tRest = _v2.b;
					if (_Utils_eq(qChar, tChar)) {
						var $temp$queryChars = qRest,
							$temp$textChars = tRest,
							$temp$queryIndex = queryIndex + 1,
							$temp$textIndex = textIndex + 1,
							$temp$matches = matches + 1;
						queryChars = $temp$queryChars;
						textChars = $temp$textChars;
						queryIndex = $temp$queryIndex;
						textIndex = $temp$textIndex;
						matches = $temp$matches;
						continue fuzzyMatchScore;
					} else {
						var $temp$queryChars = queryChars,
							$temp$textChars = tRest,
							$temp$queryIndex = queryIndex,
							$temp$textIndex = textIndex + 1,
							$temp$matches = matches;
						queryChars = $temp$queryChars;
						textChars = $temp$textChars;
						queryIndex = $temp$queryIndex;
						textIndex = $temp$textIndex;
						matches = $temp$matches;
						continue fuzzyMatchScore;
					}
				}
			}
		}
	});
var $elm$core$String$foldr = _String_foldr;
var $elm$core$String$toList = function (string) {
	return A3($elm$core$String$foldr, $elm$core$List$cons, _List_Nil, string);
};
var $author$project$Utils$fuzzyScore = F2(
	function (query, text) {
		var lowerText = $elm$core$String$toLower(text);
		var textChars = $elm$core$String$toList(lowerText);
		var lowerQuery = $elm$core$String$toLower(query);
		var queryChars = $elm$core$String$toList(lowerQuery);
		return $elm$core$String$isEmpty(query) ? 1.0 : (A2($elm$core$String$contains, lowerQuery, lowerText) ? (0.8 + (0.2 * (1.0 - ($elm$core$String$length(query) / $elm$core$String$length(text))))) : A5($author$project$Utils$fuzzyMatchScore, queryChars, textChars, 0, 0, 0));
	});
var $elm$core$List$sortBy = _List_sortBy;
var $author$project$Utils$filterNotes = F2(
	function (query, notes) {
		return $elm$core$String$isEmpty(
			$elm$core$String$trim(query)) ? notes : A2(
			$elm$core$List$map,
			$elm$core$Tuple$first,
			A2(
				$elm$core$List$sortBy,
				function (_v1) {
					var score = _v1.b;
					return -score;
				},
				A2(
					$elm$core$List$filter,
					function (_v0) {
						var score = _v0.b;
						return score > 0.3;
					},
					A2(
						$elm$core$List$map,
						function (note) {
							var titleScore = A2($author$project$Utils$fuzzyScore, query, note.x);
							var contentScore = A2($author$project$Utils$fuzzyScore, query, note.cS);
							var maxScore = A2($elm$core$Basics$max, titleScore, contentScore);
							return _Utils_Tuple2(note, maxScore);
						},
						notes))));
	});
var $author$project$Utils$filterNotesForLinking = F3(
	function (query, notes, editingNoteId) {
		var filteredByEditing = function () {
			if (!editingNoteId.$) {
				var currentId = editingNoteId.a;
				return A2(
					$elm$core$List$filter,
					function (note) {
						return !_Utils_eq(note.b$, currentId);
					},
					notes);
			} else {
				return notes;
			}
		}();
		var searchFiltered = $elm$core$String$isEmpty(
			$elm$core$String$trim(query)) ? filteredByEditing : A2($author$project$Utils$filterNotes, query, filteredByEditing);
		var sortedNotes = A2(
			$elm$core$List$sortBy,
			function (note) {
				return -note.aN;
			},
			searchFiltered);
		return sortedNotes;
	});
var $author$project$Main$forcePullFromGitHub = _Platform_outgoingPort('forcePullFromGitHub', $elm$core$Basics$identity);
var $elm$http$Http$emptyBody = _Http_emptyBody;
var $elm$http$Http$expectJson = F2(
	function (toMsg, decoder) {
		return A2(
			$elm$http$Http$expectStringResponse,
			toMsg,
			$elm$http$Http$resolve(
				function (string) {
					return A2(
						$elm$core$Result$mapError,
						$elm$json$Json$Decode$errorToString,
						A2($elm$json$Json$Decode$decodeString, decoder, string));
				}));
	});
var $author$project$GitHubAPI$GitHubFile = F4(
	function (name, path, content, sha) {
		return {cS: content, bu: name, dp: path, bB: sha};
	});
var $author$project$GitHubAPI$base64Decode = function (input) {
	return input;
};
var $author$project$GitHubAPI$fileDecoder = A5(
	$elm$json$Json$Decode$map4,
	$author$project$GitHubAPI$GitHubFile,
	A2($elm$json$Json$Decode$field, 'name', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'path', $elm$json$Json$Decode$string),
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2(
				$elm$json$Json$Decode$map,
				$author$project$GitHubAPI$base64Decode,
				A2($elm$json$Json$Decode$field, 'content', $elm$json$Json$Decode$string)),
				$elm$json$Json$Decode$succeed('')
			])),
	$elm$json$Json$Decode$maybe(
		A2($elm$json$Json$Decode$field, 'sha', $elm$json$Json$Decode$string)));
var $author$project$GitHubAPI$getFileInfo = F4(
	function (repoUrl, token, filePath, toMsg) {
		var urlParts = A2($elm$core$String$split, '/', repoUrl);
		var ownerRepo = function () {
			var _v2 = A2($elm$core$List$drop, 3, urlParts);
			if (_v2.b && _v2.b.b) {
				var owner = _v2.a;
				var _v3 = _v2.b;
				var repo = _v3.a;
				return $elm$core$Maybe$Just(
					_Utils_Tuple2(owner, repo));
			} else {
				return $elm$core$Maybe$Nothing;
			}
		}();
		if (!ownerRepo.$) {
			var _v1 = ownerRepo.a;
			var owner = _v1.a;
			var repo = _v1.b;
			var url = 'https://api.github.com/repos/' + (owner + ('/' + (repo + ('/contents/' + filePath))));
			var headers = _List_fromArray(
				[
					A2(
					$elm$http$Http$header,
					'Authorization',
					$author$project$GitHubAPI$getAuthorizationHeader(token)),
					A2($elm$http$Http$header, 'Accept', 'application/vnd.github+json'),
					A2($elm$http$Http$header, 'X-GitHub-Api-Version', '2022-11-28')
				]);
			return $elm$http$Http$request(
				{
					au: $elm$http$Http$emptyBody,
					aw: A2($elm$http$Http$expectJson, toMsg, $author$project$GitHubAPI$fileDecoder),
					az: headers,
					aB: 'GET',
					aI: $elm$core$Maybe$Nothing,
					aJ: $elm$core$Maybe$Nothing,
					aL: url
				});
		} else {
			return $elm$core$Platform$Cmd$none;
		}
	});
var $elm$json$Json$Decode$at = F2(
	function (fields, decoder) {
		return A3($elm$core$List$foldr, $elm$json$Json$Decode$field, decoder, fields);
	});
var $author$project$GitHubAPI$refDecoder = A2(
	$elm$json$Json$Decode$at,
	_List_fromArray(
		['object', 'sha']),
	$elm$json$Json$Decode$string);
var $author$project$GitHubAPI$getLatestCommitSha = F4(
	function (repoUrl, token, branch, toMsg) {
		var urlParts = A2($elm$core$String$split, '/', repoUrl);
		var ownerRepo = function () {
			var _v2 = A2($elm$core$List$drop, 3, urlParts);
			if (_v2.b && _v2.b.b) {
				var owner = _v2.a;
				var _v3 = _v2.b;
				var repo = _v3.a;
				return $elm$core$Maybe$Just(
					_Utils_Tuple2(owner, repo));
			} else {
				return $elm$core$Maybe$Nothing;
			}
		}();
		if (!ownerRepo.$) {
			var _v1 = ownerRepo.a;
			var owner = _v1.a;
			var repo = _v1.b;
			var url = 'https://api.github.com/repos/' + (owner + ('/' + (repo + ('/git/refs/heads/' + branch))));
			var headers = _List_fromArray(
				[
					A2(
					$elm$http$Http$header,
					'Authorization',
					$author$project$GitHubAPI$getAuthorizationHeader(token)),
					A2($elm$http$Http$header, 'Accept', 'application/vnd.github+json'),
					A2($elm$http$Http$header, 'X-GitHub-Api-Version', '2022-11-28')
				]);
			return $elm$http$Http$request(
				{
					au: $elm$http$Http$emptyBody,
					aw: A2($elm$http$Http$expectJson, toMsg, $author$project$GitHubAPI$refDecoder),
					az: headers,
					aB: 'GET',
					aI: $elm$core$Maybe$Nothing,
					aJ: $elm$core$Maybe$Nothing,
					aL: url
				});
		} else {
			return $elm$core$Platform$Cmd$none;
		}
	});
var $author$project$GitHub$GitHubConfig = F5(
	function (repositoryUrl, personalAccessToken, lastSyncTime, lastSyncRef, enabled) {
		return {bo: enabled, br: lastSyncRef, bs: lastSyncTime, bx: personalAccessToken, bz: repositoryUrl};
	});
var $elm$json$Json$Decode$map5 = _Json_map5;
var $author$project$GitHub$gitHubConfigDecoder = A6(
	$elm$json$Json$Decode$map5,
	$author$project$GitHub$GitHubConfig,
	A2($elm$json$Json$Decode$field, 'repositoryUrl', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'personalAccessToken', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'lastSyncTime', $elm$json$Json$Decode$int),
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2($elm$json$Json$Decode$field, 'lastSyncRef', $elm$json$Json$Decode$string),
				$elm$json$Json$Decode$succeed('')
			])),
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2($elm$json$Json$Decode$field, 'enabled', $elm$json$Json$Decode$bool),
				$elm$json$Json$Decode$succeed(false)
			])));
var $elm$core$List$sort = function (xs) {
	return A2($elm$core$List$sortBy, $elm$core$Basics$identity, xs);
};
var $author$project$Utils$hasNoteContentChanged = function (model) {
	var _v0 = model.z;
	if (!_v0.$) {
		return ($elm$core$String$trim(model.r) !== '') && ((!_Utils_eq(model.r, model.ag)) || ((!_Utils_eq(model.m, model.ae)) || (!_Utils_eq(
			$elm$core$List$sort(
				A2(
					$elm$core$List$map,
					function ($) {
						return $.bu;
					},
					model.k)),
			$elm$core$List$sort(
				A2(
					$elm$core$List$map,
					function ($) {
						return $.bu;
					},
					model.af))))));
	} else {
		return ($elm$core$String$trim(model.r) !== '') || ($elm$core$String$trim(model.m) !== '');
	}
};
var $author$project$Main$httpErrorToString = function (error) {
	switch (error.$) {
		case 0:
			var url = error.a;
			return 'Invalid URL: ' + url;
		case 1:
			return 'Request timed out. Please check your internet connection and try again.';
		case 2:
			return 'Network error. Please check your internet connection and try again.';
		case 3:
			var status = error.a;
			switch (status) {
				case 401:
					return 'Authentication failed. Your GitHub Personal Access Token may be invalid, expired, or lack the necessary permissions. Please check your token and try again.';
				case 403:
					return 'Access forbidden. Your GitHub Personal Access Token may not have the required permissions for this repository, or you may have hit a rate limit. Please check your token permissions.';
				case 404:
					return 'Repository or resource not found. Please verify the repository URL and ensure your token has access to it.';
				case 422:
					return 'Request failed due to validation errors. Please check your repository configuration and try again.';
				default:
					return 'Server returned error code ' + ($elm$core$String$fromInt(status) + '. Please try again later.');
			}
		default:
			var bodyError = error.a;
			return 'Failed to parse response from GitHub: ' + bodyError;
	}
};
var $author$project$Main$importGitHubConfig = _Platform_outgoingPort('importGitHubConfig', $elm$json$Json$Encode$string);
var $author$project$Main$insertNoteLinkText = _Platform_outgoingPort('insertNoteLinkText', $elm$json$Json$Encode$string);
var $author$project$Main$loadNotesForSync = _Platform_outgoingPort(
	'loadNotesForSync',
	function ($) {
		return $elm$json$Json$Encode$null;
	});
var $elm$core$Maybe$map = F2(
	function (f, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return $elm$core$Maybe$Just(
				f(value));
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $elm$core$List$maximum = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return $elm$core$Maybe$Just(
			A3($elm$core$List$foldl, $elm$core$Basics$max, x, xs));
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $elm$core$List$append = F2(
	function (xs, ys) {
		if (!ys.b) {
			return xs;
		} else {
			return A3($elm$core$List$foldr, $elm$core$List$cons, ys, xs);
		}
	});
var $elm$core$List$concat = function (lists) {
	return A3($elm$core$List$foldr, $elm$core$List$append, _List_Nil, lists);
};
var $elm$core$List$concatMap = F2(
	function (f, list) {
		return $elm$core$List$concat(
			A2($elm$core$List$map, f, list));
	});
var $author$project$Tag$tagExists = F2(
	function (name, tags) {
		var lowerName = $elm$core$String$toLower(
			$elm$core$String$trim(name));
		return A2(
			$elm$core$List$any,
			function (tag) {
				return _Utils_eq(tag.bu, lowerName);
			},
			tags);
	});
var $author$project$Main$removeDuplicateTags = function (tags) {
	return $elm$core$List$reverse(
		A3(
			$elm$core$List$foldl,
			F2(
				function (tag, acc) {
					return A2($author$project$Tag$tagExists, tag.bu, acc) ? acc : A2($elm$core$List$cons, tag, acc);
				}),
			_List_Nil,
			tags));
};
var $author$project$Main$extractTagsFromNotes = function (notes) {
	return $author$project$Main$removeDuplicateTags(
		A2(
			$elm$core$List$map,
			function (tag) {
				return $author$project$Tag$createTag(tag.bu);
			},
			A2(
				$elm$core$List$concatMap,
				function ($) {
					return $.g;
				},
				notes)));
};
var $elm$core$Basics$not = _Basics_not;
var $author$project$Main$mergeTagsFromPulledNotes = F2(
	function (pulledNotes, existingTags) {
		var pulledTags = $author$project$Main$extractTagsFromNotes(pulledNotes);
		var newTags = A2(
			$elm$core$List$filter,
			function (tag) {
				return !A2($author$project$Tag$tagExists, tag.bu, existingTags);
			},
			pulledTags);
		return _Utils_ap(existingTags, newTags);
	});
var $elm$core$String$replace = F3(
	function (before, after, string) {
		return A2(
			$elm$core$String$join,
			after,
			A2($elm$core$String$split, before, string));
	});
var $author$project$Sync$sanitizeFilename = function (input) {
	return function (s) {
		return $elm$core$String$isEmpty(s) ? 'untitled' : s;
	}(
		function (s) {
			return ($elm$core$String$length(s) > 50) ? A2($elm$core$String$left, 50, s) : s;
		}(
			$elm$core$String$trim(
				A3(
					$elm$core$String$replace,
					'\t',
					'_',
					A3(
						$elm$core$String$replace,
						'\u000D',
						'_',
						A3(
							$elm$core$String$replace,
							'\n',
							'_',
							A3(
								$elm$core$String$replace,
								'.',
								'_',
								A3(
									$elm$core$String$replace,
									'|',
									'_',
									A3(
										$elm$core$String$replace,
										'>',
										'_',
										A3(
											$elm$core$String$replace,
											'<',
											'_',
											A3(
												$elm$core$String$replace,
												'\"',
												'_',
												A3(
													$elm$core$String$replace,
													'?',
													'_',
													A3(
														$elm$core$String$replace,
														'*',
														'_',
														A3(
															$elm$core$String$replace,
															':',
															'_',
															A3(
																$elm$core$String$replace,
																'\\',
																'_',
																A3(
																	$elm$core$String$replace,
																	'/',
																	'_',
																	A3(
																		$elm$core$String$replace,
																		' ',
																		'_',
																		$elm$core$String$toLower(input))))))))))))))))));
};
var $author$project$Sync$noteToFilename = function (note) {
	var sanitizedTitle = $author$project$Sync$sanitizeFilename(note.x);
	return sanitizedTitle + ('_' + ($elm$core$String$fromInt(note.b$) + '.md'));
};
var $author$project$Note$Note = F6(
	function (id, title, content, createdAt, editedAt, tags) {
		return {cS: content, bd: createdAt, aN: editedAt, b$: id, g: tags, x: title};
	});
var $author$project$Tag$Tag = function (name) {
	return {bu: name};
};
var $author$project$Tag$tagDecoder = A2(
	$elm$json$Json$Decode$map,
	$author$project$Tag$Tag,
	A2($elm$json$Json$Decode$field, 'name', $elm$json$Json$Decode$string));
var $author$project$Tag$tagsDecoder = $elm$json$Json$Decode$list($author$project$Tag$tagDecoder);
var $author$project$Note$noteDecoder = A7(
	$elm$json$Json$Decode$map6,
	$author$project$Note$Note,
	A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$int),
	A2($elm$json$Json$Decode$field, 'title', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'content', $elm$json$Json$Decode$string),
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2($elm$json$Json$Decode$field, 'createdAt', $elm$json$Json$Decode$int),
				$elm$json$Json$Decode$succeed(0)
			])),
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2($elm$json$Json$Decode$field, 'editedAt', $elm$json$Json$Decode$int),
				A2($elm$json$Json$Decode$field, 'createdAt', $elm$json$Json$Decode$int),
				$elm$json$Json$Decode$succeed(0)
			])),
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2($elm$json$Json$Decode$field, 'tags', $author$project$Tag$tagsDecoder),
				$elm$json$Json$Decode$succeed(_List_Nil)
			])));
var $author$project$Note$notesDecoder = $elm$json$Json$Decode$list($author$project$Note$noteDecoder);
var $elm$time$Time$posixToMillis = function (_v0) {
	var millis = _v0;
	return millis;
};
var $author$project$Main$processMarkdownContent = _Platform_outgoingPort(
	'processMarkdownContent',
	function ($) {
		return $elm$json$Json$Encode$null;
	});
var $author$project$Action$createRenameActionEvent = F4(
	function (noteId, newTitle, oldFilename, timestamp) {
		return {
			bF: 3,
			b$: $elm$core$String$fromInt(timestamp) + ('_' + $elm$core$String$fromInt(noteId)),
			cb: noteId,
			cc: newTitle,
			ce: $elm$core$Maybe$Just(oldFilename),
			cy: timestamp
		};
	});
var $author$project$Main$recordRenameAction = F5(
	function (noteId, newTitle, oldFilename, timestamp, model) {
		var newActionCount = model.C + 1;
		var actionEvent = A4($author$project$Action$createRenameActionEvent, noteId, newTitle, oldFilename, timestamp);
		var deduplicationData = $elm$json$Json$Encode$object(
			_List_fromArray(
				[
					_Utils_Tuple2(
					'actionEvent',
					$author$project$Types$actionEventEncoder(actionEvent)),
					_Utils_Tuple2(
					'actionType',
					$elm$json$Json$Encode$string(
						$author$project$Action$actionTypeToString(3))),
					_Utils_Tuple2(
					'noteId',
					$elm$json$Json$Encode$int(noteId))
				]));
		return _Utils_Tuple2(
			_Utils_update(
				model,
				{C: newActionCount}),
			$elm$core$Platform$Cmd$batch(
				_List_fromArray(
					[
						$author$project$Main$deduplicateActions(deduplicationData),
						$author$project$Main$saveActionCount(
						$elm$json$Json$Encode$int(newActionCount))
					])));
	});
var $author$project$Note$removeTagFromAllNotes = F2(
	function (tagName, notes) {
		return A2(
			$elm$core$List$map,
			function (note) {
				return _Utils_update(
					note,
					{
						g: A2($author$project$Tag$deleteTagByName, tagName, note.g)
					});
			},
			notes);
	});
var $author$project$Main$saveGitHubConfig = _Platform_outgoingPort('saveGitHubConfig', $elm$core$Basics$identity);
var $author$project$Main$saveLastOpenNote = _Platform_outgoingPort('saveLastOpenNote', $elm$json$Json$Encode$int);
var $author$project$Main$saveTags = _Platform_outgoingPort('saveTags', $elm$core$Basics$identity);
var $author$project$Main$startGitHubSync = _Platform_outgoingPort('startGitHubSync', $elm$core$Basics$identity);
var $author$project$Note$updateNoteWithTime = F5(
	function (note, title, content, tags, currentTime) {
		return _Utils_update(
			note,
			{
				cS: content,
				aN: currentTime,
				g: tags,
				x: ($elm$core$String$trim(title) === '') ? 'Untitled' : title
			});
	});
var $elm$core$Maybe$withDefault = F2(
	function (_default, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return value;
		} else {
			return _default;
		}
	});
var $author$project$Main$update = F2(
	function (msg, model) {
		switch (msg.$) {
			case 0:
				return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
			case 1:
				var title = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{r: title}),
					$elm$core$Platform$Cmd$none);
			case 2:
				var content = msg.a;
				var shouldShowModal = (!model.U) && A2($elm$core$String$endsWith, '[[', content);
				var filteredNotes = shouldShowModal ? A3($author$project$Utils$filterNotesForLinking, '', model.e, model.z) : model.D;
				var _v1 = function () {
					if (shouldShowModal) {
						var beforeBrackets = A2($elm$core$String$dropRight, 2, content);
						return _Utils_Tuple2(beforeBrackets, '');
					} else {
						return _Utils_Tuple2(content, model.ad);
					}
				}();
				var updatedContent = _v1.a;
				var modalQuery = _v1.b;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							m: updatedContent,
							D: filteredNotes,
							ad: modalQuery,
							w: shouldShowModal ? 0 : model.w,
							U: shouldShowModal || model.U
						}),
					(model.N || model.v) ? (($elm$core$String$length(updatedContent) > 0) ? $author$project$Main$processMarkdownContent(0) : $elm$core$Platform$Cmd$none) : $elm$core$Platform$Cmd$none);
			case 3:
				var query = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{a4: query}),
					$elm$core$Platform$Cmd$none);
			case 4:
				if (!$author$project$Utils$hasNoteContentChanged(model)) {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				} else {
					var _v2 = model.z;
					if (!_v2.$) {
						var editId = _v2.a;
						var originalNote = $elm$core$List$head(
							A2(
								$elm$core$List$filter,
								function (note) {
									return _Utils_eq(note.b$, editId);
								},
								model.e));
						var currentTimeMs = $elm$time$Time$posixToMillis(
							$elm$time$Time$millisToPosix(model.l));
						var updatedNotes = A2(
							$elm$core$List$map,
							function (note) {
								return _Utils_eq(note.b$, editId) ? A5($author$project$Note$updateNoteWithTime, note, model.r, model.m, model.k, currentTimeMs) : note;
							},
							model.e);
						var actionResult = function () {
							if (!originalNote.$) {
								var origNote = originalNote.a;
								if (!_Utils_eq(origNote.x, model.r)) {
									var oldFilename = $author$project$Sync$noteToFilename(origNote);
									return A5($author$project$Main$recordRenameAction, editId, model.r, oldFilename, currentTimeMs, model);
								} else {
									return A5($author$project$Main$recordAction, 1, editId, model.r, currentTimeMs, model);
								}
							} else {
								return A5($author$project$Main$recordAction, 1, editId, model.r, currentTimeMs, model);
							}
						}();
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{C: actionResult.a.C, e: updatedNotes, ae: model.m, af: model.k, ag: model.r}),
							$elm$core$Platform$Cmd$batch(
								_List_fromArray(
									[
										$author$project$Main$saveNotes(
										$author$project$Note$notesEncoder(updatedNotes)),
										A2($elm$core$Task$perform, $author$project$Messages$GotTime, $elm$time$Time$now),
										actionResult.b
									])));
					} else {
						return (($elm$core$String$trim(model.r) !== '') || ($elm$core$String$trim(model.m) !== '')) ? _Utils_Tuple2(
							model,
							A2(
								$elm$core$Task$perform,
								A4($author$project$Messages$SaveNoteWithTimestamp, model.aT, model.r, model.m, model.k),
								$elm$time$Time$now)) : _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				}
			case 5:
				var noteId = msg.a;
				var title = msg.b;
				var content = msg.c;
				var tags = msg.d;
				var timestamp = msg.e;
				var currentTimeMs = $elm$time$Time$posixToMillis(timestamp);
				var newNote = function (note) {
					return _Utils_update(
						note,
						{g: tags});
				}(
					A4($author$project$Note$createNoteWithTime, noteId, title, content, currentTimeMs));
				var actionResult = A5($author$project$Main$recordAction, 0, noteId, title, currentTimeMs, model);
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							C: actionResult.a.C,
							m: newNote.cS,
							r: newNote.x,
							z: $elm$core$Maybe$Just(noteId),
							aT: model.aT + 1,
							e: A2($elm$core$List$cons, newNote, model.e),
							ae: newNote.cS,
							af: newNote.g,
							ag: newNote.x,
							k: newNote.g
						}),
					$elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								$author$project$Main$saveNotes(
								$author$project$Note$notesEncoder(
									A2($elm$core$List$cons, newNote, model.e))),
								A2($elm$core$Task$perform, $author$project$Messages$GotTime, $elm$time$Time$now),
								actionResult.b
							])));
			case 6:
				var id = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							av: $elm$core$Maybe$Just(id)
						}),
					$elm$core$Platform$Cmd$none);
			case 7:
				var id = msg.a;
				var _v4 = model.c;
				if (!_v4.$) {
					var config = _v4.a;
					if (config.bo) {
						var _v5 = $elm$core$List$head(
							A2(
								$elm$core$List$filter,
								function (note) {
									return _Utils_eq(note.b$, id);
								},
								model.e));
						if (!_v5.$) {
							var note = _v5.a;
							var fileName = $author$project$Sync$noteToFilename(note);
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{b: $author$project$GitHub$Syncing}),
								A4(
									$author$project$GitHubAPI$getFileInfo,
									config.bz,
									config.bx,
									fileName,
									$author$project$Messages$NoteFileInfoReceived(id)));
						} else {
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{av: $elm$core$Maybe$Nothing}),
								$elm$core$Platform$Cmd$none);
						}
					} else {
						return A2($author$project$Main$deleteNoteLocally, id, model);
					}
				} else {
					return A2($author$project$Main$deleteNoteLocally, id, model);
				}
			case 8:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{av: $elm$core$Maybe$Nothing}),
					$elm$core$Platform$Cmd$none);
			case 9:
				var id = msg.a;
				var noteToEdit = $elm$core$List$head(
					A2(
						$elm$core$List$filter,
						function (note) {
							return _Utils_eq(note.b$, id);
						},
						model.e));
				if (!noteToEdit.$) {
					var note = noteToEdit.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								m: note.cS,
								r: note.x,
								z: $elm$core$Maybe$Just(id),
								v: true,
								N: false,
								ae: note.cS,
								af: note.g,
								ag: note.x,
								k: note.g,
								ar: model.aS
							}),
						$elm$core$Platform$Cmd$batch(
							_List_fromArray(
								[
									$author$project$Main$clearMermaidDiagrams(0),
									$author$project$Main$processMarkdownContent(0),
									$author$project$Main$saveLastOpenNote(id)
								])));
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 10:
				return (!$author$project$Utils$hasNoteContentChanged(model)) ? _Utils_Tuple2(model, $elm$core$Platform$Cmd$none) : _Utils_Tuple2(
					_Utils_update(
						model,
						{m: model.ae, r: model.ag, v: false, N: false, k: model.af}),
					$elm$core$Platform$Cmd$none);
			case 11:
				return _Utils_Tuple2(
					model,
					$author$project$Main$loadNotes(0));
			case 12:
				var json = msg.a;
				var _v7 = A2($elm$json$Json$Decode$decodeValue, $author$project$Note$notesDecoder, json);
				if (!_v7.$) {
					var notes = _v7.a;
					var maxId = A2(
						$elm$core$Maybe$withDefault,
						0,
						$elm$core$List$maximum(
							A2(
								$elm$core$List$map,
								function ($) {
									return $.b$;
								},
								notes)));
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{aT: maxId + 1, e: notes}),
						$elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 13:
				var tagName = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{ak: tagName}),
					$elm$core$Platform$Cmd$none);
			case 14:
				if (($elm$core$String$trim(model.ak) !== '') && (!A2($author$project$Tag$tagExists, model.ak, model.g))) {
					var newTag = $author$project$Tag$createTag(model.ak);
					var updatedTags = A2($elm$core$List$cons, newTag, model.g);
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{ak: '', g: updatedTags}),
						$author$project$Main$saveTags(
							$author$project$Tag$tagsEncoder(updatedTags)));
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 15:
				var tagName = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							a7: $elm$core$Maybe$Just(tagName)
						}),
					$elm$core$Platform$Cmd$none);
			case 16:
				var tagName = msg.a;
				var updatedTags = A2($author$project$Tag$deleteTagByName, tagName, model.g);
				var updatedSelectedTags = A2($author$project$Tag$deleteTagByName, tagName, model.k);
				var updatedNotes = A2($author$project$Note$removeTagFromAllNotes, tagName, model.e);
				var updatedFilterTags = A2($author$project$Tag$deleteTagByName, tagName, model.H);
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{H: updatedFilterTags, e: updatedNotes, k: updatedSelectedTags, a7: $elm$core$Maybe$Nothing, g: updatedTags}),
					$elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								$author$project$Main$saveTags(
								$author$project$Tag$tagsEncoder(updatedTags)),
								$author$project$Main$saveNotes(
								$author$project$Note$notesEncoder(updatedNotes))
							])));
			case 17:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{a7: $elm$core$Maybe$Nothing}),
					$elm$core$Platform$Cmd$none);
			case 18:
				return _Utils_Tuple2(
					model,
					$author$project$Main$loadTags(0));
			case 19:
				var json = msg.a;
				var _v8 = A2($elm$json$Json$Decode$decodeValue, $author$project$Tag$tagsDecoder, json);
				if (!_v8.$) {
					var tags = _v8.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{g: tags}),
						$elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 20:
				var tag = msg.a;
				var isSelected = A2(
					$elm$core$List$any,
					function (t) {
						return _Utils_eq(t.bu, tag.bu);
					},
					model.k);
				var updatedSelectedTags = isSelected ? A2(
					$elm$core$List$filter,
					function (t) {
						return !_Utils_eq(t.bu, tag.bu);
					},
					model.k) : A2($elm$core$List$cons, tag, model.k);
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{k: updatedSelectedTags}),
					$elm$core$Platform$Cmd$none);
			case 21:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{k: _List_Nil}),
					$elm$core$Platform$Cmd$none);
			case 22:
				var tag = msg.a;
				var isSelected = A2(
					$elm$core$List$any,
					function (t) {
						return _Utils_eq(t.bu, tag.bu);
					},
					model.H);
				var updatedFilterTags = isSelected ? A2(
					$elm$core$List$filter,
					function (t) {
						return !_Utils_eq(t.bu, tag.bu);
					},
					model.H) : A2($elm$core$List$cons, tag, model.H);
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{H: updatedFilterTags}),
					$elm$core$Platform$Cmd$none);
			case 23:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{H: _List_Nil}),
					$elm$core$Platform$Cmd$none);
			case 24:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{a6: !model.a6}),
					$elm$core$Platform$Cmd$none);
			case 25:
				var time = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							l: $elm$time$Time$posixToMillis(time)
						}),
					$elm$core$Platform$Cmd$none);
			case 26:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{ar: !model.ar}),
					$elm$core$Platform$Cmd$none);
			case 29:
				var isMobile = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{aS: isMobile}),
					$elm$core$Platform$Cmd$none);
			case 27:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							aF: (!model.aH) ? false : model.aF,
							aH: !model.aH
						}),
					$elm$core$Platform$Cmd$none);
			case 28:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							aF: !model.aF,
							aH: (!model.aF) ? false : model.aH
						}),
					$elm$core$Platform$Cmd$none);
			case 30:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{m: '', r: '', z: $elm$core$Maybe$Nothing, v: false, N: false, ae: '', af: _List_Nil, ag: '', k: _List_Nil}),
					$elm$core$Platform$Cmd$none);
			case 31:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{a5: !model.a5}),
					$elm$core$Platform$Cmd$none);
			case 32:
				var url = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{ay: url}),
					$elm$core$Platform$Cmd$none);
			case 33:
				var token = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{Y: token}),
					$elm$core$Platform$Cmd$none);
			case 34:
				var passphrase = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{X: passphrase}),
					$elm$core$Platform$Cmd$none);
			case 39:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{P: '', aq: true}),
					$elm$core$Platform$Cmd$none);
			case 40:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{P: '', aq: false}),
					$elm$core$Platform$Cmd$none);
			case 41:
				var input = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{P: input}),
					$elm$core$Platform$Cmd$none);
			case 42:
				var _v9 = model.c;
				if (!_v9.$) {
					var config = _v9.a;
					return ($elm$core$String$trim(model.P) !== '') ? _Utils_Tuple2(
						_Utils_update(
							model,
							{h: 1}),
						$author$project$Main$decryptWithPassphrase(
							{am: config.bx, O: model.P})) : _Utils_Tuple2(
						_Utils_update(
							model,
							{
								b: $author$project$GitHub$Error('Please enter the passphrase')
							}),
						$elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								b: $author$project$GitHub$Error('No GitHub configuration found')
							}),
						$elm$core$Platform$Cmd$none);
				}
			case 43:
				var result = msg.a;
				if (!result.$) {
					var encryptedToken = result.a;
					var repositoryUrl = model.ay;
					var personalAccessToken = model.Y;
					var config = A2($author$project$GitHub$createGitHubConfig, repositoryUrl, encryptedToken);
					var updatedConfig = _Utils_update(
						config,
						{bo: true});
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								c: $elm$core$Maybe$Just(updatedConfig),
								X: '',
								Y: '',
								ay: '',
								a5: false,
								b: $author$project$GitHub$Syncing
							}),
						A4($author$project$GitHubAPI$getLatestCommitSha, repositoryUrl, personalAccessToken, 'main', $author$project$Messages$InitialHeadRefReceived));
				} else {
					var error = result.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								b: $author$project$GitHub$Error('Encryption failed: ' + error)
							}),
						$elm$core$Platform$Cmd$none);
				}
			case 44:
				var result = msg.a;
				if (!result.$) {
					var decryptedToken = result.a;
					var _v12 = model.h;
					switch (_v12) {
						case 0:
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										al: $elm$core$Maybe$Just(model.V),
										h: 1,
										f: false,
										aV: false,
										V: ''
									}),
								A2(
									$elm$core$Task$perform,
									function (_v13) {
										return $author$project$Messages$CheckRemoteUpdates;
									},
									$elm$core$Task$succeed(0)));
						case 3:
							var _v14 = model.c;
							if (!_v14.$) {
								var config = _v14.a;
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{h: 1}),
									A4($author$project$GitHubAPI$getLatestCommitSha, config.bz, decryptedToken, 'main', $author$project$Messages$RemoteUpdateCheckReceived));
							} else {
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{h: 1}),
									$elm$core$Platform$Cmd$none);
							}
						case 1:
							var _v15 = model.c;
							if (!_v15.$) {
								var config = _v15.a;
								var tempConfigForSync = _Utils_update(
									config,
									{bx: decryptedToken});
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{P: '', aD: false, aq: false, b: $author$project$GitHub$Syncing}),
									$author$project$Main$startGitHubSync(
										A2($author$project$Action$encodeSyncData, tempConfigForSync, model.W)));
							} else {
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{
											I: false,
											aD: false,
											b: $author$project$GitHub$Error('No GitHub configuration found')
										}),
									$elm$core$Platform$Cmd$none);
							}
						case 2:
							var _v16 = model.c;
							if (!_v16.$) {
								var config = _v16.a;
								var tempConfigForSync = _Utils_update(
									config,
									{bx: decryptedToken});
								var shouldFetchAllNotes = $elm$core$String$isEmpty(
									$elm$core$String$trim(tempConfigForSync.br));
								var forcePullConfig = shouldFetchAllNotes ? _Utils_update(
									tempConfigForSync,
									{br: ''}) : tempConfigForSync;
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{I: true, P: '', aD: false, aq: false, b: $author$project$GitHub$Syncing}),
									$author$project$Main$forcePullFromGitHub(
										$author$project$GitHub$gitHubConfigEncoder(forcePullConfig)));
							} else {
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{
											I: false,
											aD: false,
											b: $author$project$GitHub$Error('No GitHub configuration found')
										}),
									$elm$core$Platform$Cmd$none);
							}
						case 4:
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{F: '', h: 1, f: false, ap: false}),
								$author$project$Main$clearAllData(0));
						default:
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{h: 1, f: false, b: $author$project$GitHub$Syncing}),
								$author$project$Main$encryptWithPassphrase(
									{O: model.X, bk: model.Y}));
					}
				} else {
					var error = result.a;
					var _v17 = model.h;
					switch (_v17) {
						case 0:
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										h: 1,
										f: false,
										b: $author$project$GitHub$Error('Invalid passphrase: ' + error)
									}),
								$elm$core$Platform$Cmd$none);
						case 4:
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										F: '',
										h: 1,
										f: false,
										b: $author$project$GitHub$Error('Passphrase verification failed: ' + error)
									}),
								$elm$core$Platform$Cmd$none);
						case 5:
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										h: 1,
										f: false,
										b: $author$project$GitHub$Error('Configuration save failed - invalid passphrase: ' + error)
									}),
								$elm$core$Platform$Cmd$none);
						default:
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										h: 1,
										I: false,
										P: '',
										aD: false,
										aq: false,
										b: $author$project$GitHub$Error('Decryption failed: ' + error)
									}),
								$elm$core$Platform$Cmd$none);
					}
				}
			case 35:
				var _v18 = model.c;
				if (!_v18.$) {
					var existingConfig = _v18.a;
					return (($elm$core$String$trim(model.ay) !== '') && (($elm$core$String$trim(model.Y) !== '') && ($elm$core$String$trim(model.X) !== ''))) ? (($elm$core$String$trim(existingConfig.bx) !== '') ? _Utils_Tuple2(
						_Utils_update(
							model,
							{h: 5, f: true}),
						$author$project$Main$decryptWithPassphrase(
							{am: existingConfig.bx, O: model.X})) : _Utils_Tuple2(
						model,
						$author$project$Main$encryptWithPassphrase(
							{O: model.X, bk: model.Y}))) : _Utils_Tuple2(
						_Utils_update(
							model,
							{
								b: $author$project$GitHub$Error('Please fill in all fields')
							}),
						$elm$core$Platform$Cmd$none);
				} else {
					return (($elm$core$String$trim(model.ay) !== '') && (($elm$core$String$trim(model.Y) !== '') && ($elm$core$String$trim(model.X) !== ''))) ? _Utils_Tuple2(
						model,
						$author$project$Main$encryptWithPassphrase(
							{O: model.X, bk: model.Y})) : _Utils_Tuple2(
						_Utils_update(
							model,
							{
								b: $author$project$GitHub$Error('Please fill in all fields')
							}),
						$elm$core$Platform$Cmd$none);
				}
			case 36:
				return _Utils_Tuple2(
					model,
					$author$project$Main$loadGitHubConfig(0));
			case 37:
				var value = msg.a;
				var _v19 = A2($elm$json$Json$Decode$decodeValue, $author$project$GitHub$gitHubConfigDecoder, value);
				if (!_v19.$) {
					var config = _v19.a;
					var syncStatus = config.bo ? $author$project$GitHub$Idle : (((!$elm$core$String$isEmpty(config.bz)) && (!$elm$core$String$isEmpty(config.bx))) ? $author$project$GitHub$Disabled : $author$project$GitHub$NotConfigured);
					var shouldShowStartupDialog = config.bo && _Utils_eq(model.al, $elm$core$Maybe$Nothing);
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								c: $elm$core$Maybe$Just(config),
								aV: shouldShowStartupDialog,
								b: syncStatus
							}),
						(config.bo && (!_Utils_eq(model.al, $elm$core$Maybe$Nothing))) ? A2(
							$elm$core$Task$perform,
							function (_v20) {
								return $author$project$Messages$CheckRemoteUpdates;
							},
							$elm$core$Task$succeed(0)) : $elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{b: $author$project$GitHub$NotConfigured}),
						$elm$core$Platform$Cmd$none);
				}
			case 64:
				return _Utils_Tuple2(
					model,
					$author$project$Main$loadActionCount(0));
			case 65:
				var json = msg.a;
				var _v21 = A2($elm$json$Json$Decode$decodeValue, $elm$json$Json$Decode$int, json);
				if (!_v21.$) {
					var count = _v21.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{C: count}),
						$elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 66:
				return _Utils_Tuple2(
					model,
					$author$project$Main$loadActionEvents(0));
			case 67:
				var json = msg.a;
				var _v22 = A2($elm$json$Json$Decode$decodeValue, $author$project$Action$actionEventsDecoder, json);
				if (!_v22.$) {
					var events = _v22.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{W: events}),
						$elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 68:
				return _Utils_Tuple2(
					model,
					$author$project$Main$loadLastOpenNote(0));
			case 69:
				var json = msg.a;
				var _v23 = A2($elm$json$Json$Decode$decodeValue, $elm$json$Json$Decode$int, json);
				if (!_v23.$) {
					var noteId = _v23.a;
					var _v24 = $elm$core$List$head(
						A2(
							$elm$core$List$filter,
							function (note) {
								return _Utils_eq(note.b$, noteId);
							},
							model.e));
					if (!_v24.$) {
						var note = _v24.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									m: note.cS,
									r: note.x,
									z: $elm$core$Maybe$Just(note.b$),
									v: true,
									N: false,
									ae: note.cS,
									af: note.g,
									ag: note.x,
									k: note.g
								}),
							$author$project$Main$processMarkdownContent(0));
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 70:
				var newPreviewMode = !model.v;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{v: newPreviewMode, N: false}),
					newPreviewMode ? $author$project$Main$processMarkdownContent(0) : $elm$core$Platform$Cmd$none);
			case 71:
				var newSplitView = !model.N;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{v: false, N: newSplitView}),
					newSplitView ? $author$project$Main$processMarkdownContent(0) : $elm$core$Platform$Cmd$none);
			case 72:
				var value = msg.a;
				var _v25 = A2(
					$elm$json$Json$Decode$decodeValue,
					A2($elm$json$Json$Decode$field, 'noteId', $elm$json$Json$Decode$int),
					value);
				if (!_v25.$) {
					var noteId = _v25.a;
					var _v26 = model.z;
					if (!_v26.$) {
						var editingNoteId = _v26.a;
						if (_Utils_eq(editingNoteId, noteId)) {
							var _v27 = $elm$core$List$head(
								A2(
									$elm$core$List$filter,
									function (note) {
										return _Utils_eq(note.b$, noteId);
									},
									model.e));
							if (!_v27.$) {
								var updatedNote = _v27.a;
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{m: updatedNote.cS, r: updatedNote.x, ae: updatedNote.cS, af: updatedNote.g, ag: updatedNote.x, k: updatedNote.g}),
									$elm$core$Platform$Cmd$none);
							} else {
								return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
							}
						} else {
							return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
						}
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 73:
				var _v28 = model.c;
				if (!_v28.$) {
					var config = _v28.a;
					if (config.bo) {
						var _v29 = model.al;
						if (!_v29.$) {
							var passphrase = _v29.a;
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{h: 3}),
								$author$project$Main$decryptWithPassphrase(
									{am: config.bx, O: passphrase}));
						} else {
							return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
						}
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 74:
				var result = msg.a;
				if (!result.$) {
					var remoteRef = result.a;
					var hasUpdates = function () {
						var _v31 = model.c;
						if (!_v31.$) {
							var config = _v31.a;
							return $elm$core$String$isEmpty(config.br) ? true : (!_Utils_eq(
								$elm$core$String$trim(remoteRef),
								$elm$core$String$trim(config.br)));
						} else {
							return false;
						}
					}();
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								bm: $elm$core$Maybe$Just(remoteRef),
								aR: hasUpdates
							}),
						$elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 75:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{aV: true, V: ''}),
					$elm$core$Platform$Cmd$none);
			case 76:
				var input = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{V: input}),
					$elm$core$Platform$Cmd$none);
			case 77:
				var _v32 = model.c;
				if (!_v32.$) {
					var config = _v32.a;
					return ($elm$core$String$trim(model.V) !== '') ? _Utils_Tuple2(
						_Utils_update(
							model,
							{h: 0, f: true}),
						$author$project$Main$decryptWithPassphrase(
							{am: config.bx, O: model.V})) : _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 78:
				var result = msg.a;
				if (!result.$) {
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								al: $elm$core$Maybe$Just(model.V),
								f: false,
								aV: false,
								V: ''
							}),
						A2(
							$elm$core$Task$perform,
							function (_v34) {
								return $author$project$Messages$CheckRemoteUpdates;
							},
							$elm$core$Task$succeed(0)));
				} else {
					var error = result.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								f: false,
								b: $author$project$GitHub$Error('Invalid passphrase: ' + error)
							}),
						$elm$core$Platform$Cmd$none);
				}
			case 79:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{F: '', ap: true}),
					$elm$core$Platform$Cmd$none);
			case 80:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{F: '', ap: false}),
					$elm$core$Platform$Cmd$none);
			case 81:
				var passphrase = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{F: passphrase}),
					$elm$core$Platform$Cmd$none);
			case 82:
				var _v35 = model.c;
				if (!_v35.$) {
					var config = _v35.a;
					return ($elm$core$String$trim(model.F) !== '') ? (($elm$core$String$trim(config.bx) !== '') ? _Utils_Tuple2(
						_Utils_update(
							model,
							{h: 4, f: true}),
						$author$project$Main$decryptWithPassphrase(
							{am: config.bx, O: model.F})) : _Utils_Tuple2(
						_Utils_update(
							model,
							{F: '', ap: false}),
						$author$project$Main$clearAllData(0))) : _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{F: '', ap: false}),
						$author$project$Main$clearAllData(0));
				}
			case 83:
				var result = msg.a;
				if (!result.$) {
					return $author$project$Main$init(0);
				} else {
					var error = result.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								F: '',
								f: false,
								ap: false,
								b: $author$project$GitHub$Error('Failed to clear data: ' + error)
							}),
						$elm$core$Platform$Cmd$none);
				}
			case 84:
				var _v37 = model.c;
				if (!_v37.$) {
					var config = _v37.a;
					return _Utils_Tuple2(
						model,
						$author$project$Main$exportGitHubConfig(
							$author$project$GitHub$gitHubConfigEncoder(config)));
				} else {
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								b: $author$project$GitHub$Error('No GitHub configuration found to export')
							}),
						$elm$core$Platform$Cmd$none);
				}
			case 85:
				var result = msg.a;
				if (!result.$) {
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								b: $author$project$GitHub$Success(model.l)
							}),
						$elm$core$Platform$Cmd$none);
				} else {
					var error = result.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								b: $author$project$GitHub$Error('Failed to copy configuration: ' + error)
							}),
						$elm$core$Platform$Cmd$none);
				}
			case 86:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{aj: '', aU: !model.aU}),
					$elm$core$Platform$Cmd$none);
			case 87:
				var json = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{aj: json}),
					$elm$core$Platform$Cmd$none);
			case 88:
				return ($elm$core$String$trim(model.aj) !== '') ? _Utils_Tuple2(
					model,
					$author$project$Main$importGitHubConfig(model.aj)) : _Utils_Tuple2(
					_Utils_update(
						model,
						{
							b: $author$project$GitHub$Error('Please paste a valid configuration JSON')
						}),
					$elm$core$Platform$Cmd$none);
			case 89:
				var result = msg.a;
				if (!result.$) {
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								aj: '',
								aU: false,
								aG: true,
								b: $author$project$GitHub$Success(model.l)
							}),
						$elm$core$Platform$Cmd$batch(
							_List_fromArray(
								[
									$author$project$Main$loadGitHubConfig(0),
									$author$project$Main$loadNotes(0)
								])));
				} else {
					var error = result.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								b: $author$project$GitHub$Error('Failed to import configuration: ' + error)
							}),
						$elm$core$Platform$Cmd$none);
				}
			case 90:
				var filteredNotes = A3($author$project$Utils$filterNotesForLinking, '', model.e, model.z);
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{D: filteredNotes, ad: '', w: 0, U: true}),
					$elm$core$Platform$Cmd$none);
			case 91:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{D: _List_Nil, ad: '', w: 0, U: false}),
					$elm$core$Platform$Cmd$none);
			case 92:
				var query = msg.a;
				var filteredNotes = A3($author$project$Utils$filterNotesForLinking, query, model.e, model.z);
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{D: filteredNotes, ad: query, w: 0}),
					$elm$core$Platform$Cmd$none);
			case 93:
				var newIndex = (model.w > 0) ? (model.w - 1) : ($elm$core$List$length(model.D) - 1);
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{w: newIndex}),
					$elm$core$Platform$Cmd$none);
			case 94:
				var newIndex = (_Utils_cmp(
					model.w,
					$elm$core$List$length(model.D) - 1) < 0) ? (model.w + 1) : 0;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{w: newIndex}),
					$elm$core$Platform$Cmd$none);
			case 95:
				var _v40 = $elm$core$List$head(
					A2($elm$core$List$drop, model.w, model.D));
				if (!_v40.$) {
					var selectedNote = _v40.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{D: _List_Nil, ad: '', w: 0, U: false}),
						$author$project$Main$insertNoteLinkText(selectedNote.x));
				} else {
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{U: false}),
						$elm$core$Platform$Cmd$none);
				}
			case 96:
				var noteId = msg.a;
				var _v41 = $elm$core$List$head(
					A2(
						$elm$core$List$filter,
						function (note) {
							return _Utils_eq(note.b$, noteId);
						},
						model.D));
				if (!_v41.$) {
					var selectedNote = _v41.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{D: _List_Nil, ad: '', w: 0, U: false}),
						$author$project$Main$insertNoteLinkText(selectedNote.x));
				} else {
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{U: false}),
						$elm$core$Platform$Cmd$none);
				}
			case 38:
				var _v42 = model.c;
				if (!_v42.$) {
					var config = _v42.a;
					if (config.bo) {
						var _v43 = model.al;
						if (!_v43.$) {
							var passphrase = _v43.a;
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{h: 1, b: $author$project$GitHub$Syncing}),
								$author$project$Main$decryptWithPassphrase(
									{am: config.bx, O: passphrase}));
						} else {
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{P: '', aq: true}),
								$elm$core$Platform$Cmd$none);
						}
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 57:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{aQ: true, R: ''}),
					$elm$core$Platform$Cmd$none);
			case 58:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{aQ: true, R: '', aG: false}),
					$elm$core$Platform$Cmd$none);
			case 59:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{aQ: false, R: ''}),
					$elm$core$Platform$Cmd$none);
			case 60:
				var passphrase = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{R: passphrase}),
					$elm$core$Platform$Cmd$none);
			case 61:
				var _v44 = model.c;
				if (!_v44.$) {
					var config = _v44.a;
					return (config.bo && ($elm$core$String$trim(model.R) !== '')) ? _Utils_Tuple2(
						_Utils_update(
							model,
							{h: 2, aQ: false, R: '', aD: true, b: $author$project$GitHub$Syncing}),
						$author$project$Main$decryptWithPassphrase(
							{am: config.bx, O: model.R})) : (($elm$core$String$trim(model.R) === '') ? _Utils_Tuple2(
						_Utils_update(
							model,
							{
								b: $author$project$GitHub$Error('Please enter the passphrase for force pull')
							}),
						$elm$core$Platform$Cmd$none) : _Utils_Tuple2(model, $elm$core$Platform$Cmd$none));
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 62:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{aG: true}),
					$elm$core$Platform$Cmd$none);
			case 63:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{aG: false}),
					$elm$core$Platform$Cmd$none);
			case 45:
				var _v45 = model.c;
				if (!_v45.$) {
					var config = _v45.a;
					return config.bo ? _Utils_Tuple2(
						model,
						A4($author$project$GitHubAPI$getLatestCommitSha, config.bz, config.bx, 'main', $author$project$Messages$RemoteRefReceived)) : _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 46:
				var result = msg.a;
				if (!result.$) {
					var remoteRef = result.a;
					var _v47 = model.c;
					if (!_v47.$) {
						var config = _v47.a;
						return ($elm$core$String$isEmpty(config.br) || (!_Utils_eq(config.br, remoteRef))) ? _Utils_Tuple2(
							_Utils_update(
								model,
								{b: $author$project$GitHub$Syncing}),
							$author$project$Main$startGitHubSync(
								A2($author$project$Action$encodeSyncData, config, model.W))) : _Utils_Tuple2(
							_Utils_update(
								model,
								{
									b: $author$project$GitHub$Success(model.l)
								}),
							$elm$core$Platform$Cmd$none);
					} else {
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									b: $author$project$GitHub$Error('GitHub config not found')
								}),
							$elm$core$Platform$Cmd$none);
					}
				} else {
					var error = result.a;
					if ((error.$ === 3) && (error.a === 404)) {
						var _v49 = model.c;
						if (!_v49.$) {
							var config = _v49.a;
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{b: $author$project$GitHub$Syncing}),
								$author$project$Main$startGitHubSync(
									A2($author$project$Action$encodeSyncData, config, model.W)));
						} else {
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										b: $author$project$GitHub$Error('GitHub config not found')
									}),
								$elm$core$Platform$Cmd$none);
						}
					} else {
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									b: $author$project$GitHub$Error(
										$author$project$Main$httpErrorToString(error))
								}),
							$elm$core$Platform$Cmd$none);
					}
				}
			case 47:
				var result = msg.a;
				if (!result.$) {
					var headRef = result.a;
					var _v51 = model.c;
					if (!_v51.$) {
						var config = _v51.a;
						var updatedConfig = _Utils_update(
							config,
							{br: headRef, bs: model.l});
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									c: $elm$core$Maybe$Just(updatedConfig),
									aG: true,
									b: $author$project$GitHub$Success(model.l)
								}),
							$author$project$Main$saveGitHubConfig(
								$author$project$GitHub$gitHubConfigEncoder(updatedConfig)));
					} else {
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									b: $author$project$GitHub$Error('GitHub config not found')
								}),
							$elm$core$Platform$Cmd$none);
					}
				} else {
					var error = result.a;
					var _v52 = model.c;
					if (!_v52.$) {
						var config = _v52.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									b: $author$project$GitHub$Error(
										'Failed to verify repository access: ' + $author$project$Main$httpErrorToString(error))
								}),
							$author$project$Main$saveGitHubConfig(
								$author$project$GitHub$gitHubConfigEncoder(config)));
					} else {
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									b: $author$project$GitHub$Error('GitHub config not found')
								}),
							$elm$core$Platform$Cmd$none);
					}
				}
			case 48:
				var jsonValue = msg.a;
				var _v53 = $author$project$Main$decodeResultFromJson(jsonValue);
				if (!_v53.$) {
					var syncResultJson = _v53.a;
					var _v54 = A2($elm$json$Json$Decode$decodeString, $author$project$Main$decodeSyncResult, syncResultJson);
					if (!_v54.$) {
						var syncResult = _v54.a;
						var isForcePull = model.I || A2($elm$core$Maybe$withDefault, false, syncResult.c1);
						var refToUse = function () {
							if (isForcePull) {
								var _v58 = syncResult.c2;
								if (!_v58.$) {
									var headRef = _v58.a;
									return $elm$core$Maybe$Just(headRef);
								} else {
									return syncResult.bL;
								}
							} else {
								return syncResult.bL;
							}
						}();
						if (!refToUse.$) {
							var sha = refToUse.a;
							var updatedConfig = A2(
								$elm$core$Maybe$map,
								function (config) {
									return _Utils_update(
										config,
										{br: sha, bs: model.l});
								},
								model.c);
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										W: _List_Nil,
										bm: $elm$core$Maybe$Just(sha),
										c: updatedConfig,
										aR: false,
										I: false,
										b: $author$project$GitHub$Success(model.l)
									}),
								$elm$core$Platform$Cmd$batch(
									_List_fromArray(
										[
											$author$project$Main$clearActionEvents(0),
											$author$project$Main$loadNotesForSync(0),
											function () {
											if (!updatedConfig.$) {
												var config = updatedConfig.a;
												return $author$project$Main$saveGitHubConfig(
													$author$project$GitHub$gitHubConfigEncoder(config));
											} else {
												return $elm$core$Platform$Cmd$none;
											}
										}()
										])));
						} else {
							var updatedConfig = A2(
								$elm$core$Maybe$map,
								function (config) {
									return _Utils_update(
										config,
										{bs: model.l});
								},
								model.c);
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										W: _List_Nil,
										c: updatedConfig,
										aR: false,
										I: false,
										b: $author$project$GitHub$Success(model.l)
									}),
								$elm$core$Platform$Cmd$batch(
									_List_fromArray(
										[
											$author$project$Main$clearActionEvents(0),
											$author$project$Main$loadNotesForSync(0),
											function () {
											if (!updatedConfig.$) {
												var config = updatedConfig.a;
												return $author$project$Main$saveGitHubConfig(
													$author$project$GitHub$gitHubConfigEncoder(config));
											} else {
												return $elm$core$Platform$Cmd$none;
											}
										}()
										])));
						}
					} else {
						var updatedConfig = A2(
							$elm$core$Maybe$map,
							function (config) {
								return _Utils_update(
									config,
									{bs: model.l});
							},
							model.c);
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									W: _List_Nil,
									c: updatedConfig,
									aR: false,
									I: false,
									b: $author$project$GitHub$Success(model.l)
								}),
							$elm$core$Platform$Cmd$batch(
								_List_fromArray(
									[
										$author$project$Main$clearActionEvents(0),
										$author$project$Main$loadNotesForSync(0),
										function () {
										if (!updatedConfig.$) {
											var config = updatedConfig.a;
											return $author$project$Main$saveGitHubConfig(
												$author$project$GitHub$gitHubConfigEncoder(config));
										} else {
											return $elm$core$Platform$Cmd$none;
										}
									}()
									])));
					}
				} else {
					var error = _v53.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								I: false,
								b: $author$project$GitHub$Error(error)
							}),
						$elm$core$Platform$Cmd$none);
				}
			case 49:
				var jsonValue = msg.a;
				var _v60 = $author$project$Main$decodeResultFromJson(jsonValue);
				if (!_v60.$) {
					var syncErrorJson = _v60.a;
					var _v61 = A2(
						$elm$json$Json$Decode$decodeString,
						A2($elm$json$Json$Decode$field, 'error', $elm$json$Json$Decode$string),
						syncErrorJson);
					if (!_v61.$) {
						var errorMessage = _v61.a;
						var detailedError = (A2($elm$core$String$contains, '401', errorMessage) || (A2($elm$core$String$contains, '403', errorMessage) || (A2($elm$core$String$contains, 'Unauthorized', errorMessage) || A2($elm$core$String$contains, 'Forbidden', errorMessage)))) ? ('Authentication failed: ' + (errorMessage + '. Please check your GitHub Personal Access Token and ensure it has the necessary permissions.')) : ((A2($elm$core$String$contains, '404', errorMessage) || A2($elm$core$String$contains, 'Not Found', errorMessage)) ? ('Repository not found: ' + (errorMessage + '. Please verify the repository URL and ensure your token has access to it.')) : ('Sync failed: ' + errorMessage));
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									I: false,
									b: $author$project$GitHub$Error(detailedError)
								}),
							$elm$core$Platform$Cmd$none);
					} else {
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									I: false,
									b: $author$project$GitHub$Error('Sync failed: ' + syncErrorJson)
								}),
							$elm$core$Platform$Cmd$none);
					}
				} else {
					var error = _v60.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								I: false,
								b: $author$project$GitHub$Error('Sync failed: ' + error)
							}),
						$elm$core$Platform$Cmd$none);
				}
			case 50:
				var result = msg.a;
				if (!result.$) {
					var remoteRef = result.a;
					var updatedConfig = A2(
						$elm$core$Maybe$map,
						function (config) {
							return _Utils_update(
								config,
								{br: remoteRef, bs: model.l});
						},
						model.c);
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{c: updatedConfig}),
						function () {
							if (!updatedConfig.$) {
								var config = updatedConfig.a;
								return $author$project$Main$saveGitHubConfig(
									$author$project$GitHub$gitHubConfigEncoder(config));
							} else {
								return $elm$core$Platform$Cmd$none;
							}
						}());
				} else {
					var error = result.a;
					var updatedConfig = A2(
						$elm$core$Maybe$map,
						function (config) {
							return _Utils_update(
								config,
								{bs: model.l});
						},
						model.c);
					var errorMessage = 'Sync completed but failed to update reference: ' + $author$project$Main$httpErrorToString(error);
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								c: updatedConfig,
								b: $author$project$GitHub$Error(errorMessage)
							}),
						function () {
							if (!updatedConfig.$) {
								var config = updatedConfig.a;
								return $author$project$Main$saveGitHubConfig(
									$author$project$GitHub$gitHubConfigEncoder(config));
							} else {
								return $elm$core$Platform$Cmd$none;
							}
						}());
				}
			case 51:
				var json = msg.a;
				var _v65 = A2($elm$json$Json$Decode$decodeValue, $author$project$Note$notesDecoder, json);
				if (!_v65.$) {
					var notes = _v65.a;
					var updatedTags = A2($author$project$Main$mergeTagsFromPulledNotes, notes, model.g);
					var maxId = A2(
						$elm$core$Maybe$withDefault,
						0,
						$elm$core$List$maximum(
							A2(
								$elm$core$List$map,
								function ($) {
									return $.b$;
								},
								notes)));
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{aT: maxId + 1, e: notes, g: updatedTags}),
						$author$project$Main$saveTags(
							$author$project$Tag$tagsEncoder(updatedTags)));
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 52:
				var updatedConfig = A2(
					$elm$core$Maybe$map,
					function (config) {
						return _Utils_update(
							config,
							{bo: false});
					},
					model.c);
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{c: updatedConfig, b: $author$project$GitHub$Disabled}),
					function () {
						if (!updatedConfig.$) {
							var config = updatedConfig.a;
							return $author$project$Main$saveGitHubConfig(
								$author$project$GitHub$gitHubConfigEncoder(config));
						} else {
							return $elm$core$Platform$Cmd$none;
						}
					}());
			case 53:
				var updatedConfig = A2(
					$elm$core$Maybe$map,
					function (config) {
						return _Utils_update(
							config,
							{bo: true});
					},
					model.c);
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{c: updatedConfig, b: $author$project$GitHub$Idle}),
					function () {
						if (!updatedConfig.$) {
							var config = updatedConfig.a;
							return $author$project$Main$saveGitHubConfig(
								$author$project$GitHub$gitHubConfigEncoder(config));
						} else {
							return $elm$core$Platform$Cmd$none;
						}
					}());
			case 54:
				var noteId = msg.a;
				var fileName = msg.b;
				var _v68 = model.c;
				if (!_v68.$) {
					var config = _v68.a;
					return config.bo ? _Utils_Tuple2(
						_Utils_update(
							model,
							{b: $author$project$GitHub$Syncing}),
						A4(
							$author$project$GitHubAPI$getFileInfo,
							config.bz,
							config.bx,
							fileName,
							$author$project$Messages$NoteFileInfoReceived(noteId))) : A2($author$project$Main$deleteNoteLocally, noteId, model);
				} else {
					return A2($author$project$Main$deleteNoteLocally, noteId, model);
				}
			case 55:
				var noteId = msg.a;
				var result = msg.b;
				if (!result.$) {
					var fileInfo = result.a;
					var _v70 = fileInfo.bB;
					if (!_v70.$) {
						var fileSha = _v70.a;
						var _v71 = model.c;
						if (!_v71.$) {
							var config = _v71.a;
							var fileName = function () {
								var _v72 = $elm$core$List$head(
									A2(
										$elm$core$List$filter,
										function (note) {
											return _Utils_eq(note.b$, noteId);
										},
										model.e));
								if (!_v72.$) {
									var note = _v72.a;
									return $author$project$Sync$noteToFilename(note);
								} else {
									return 'unknown.md';
								}
							}();
							var commitMessage = 'Delete note: ' + fileName;
							return _Utils_Tuple2(
								model,
								A6(
									$author$project$GitHubAPI$deleteFile,
									config.bz,
									config.bx,
									fileName,
									fileSha,
									commitMessage,
									$author$project$Messages$NoteDeletedFromGitHub(noteId)));
						} else {
							return A2($author$project$Main$deleteNoteLocally, noteId, model);
						}
					} else {
						return A2($author$project$Main$deleteNoteLocally, noteId, model);
					}
				} else {
					var error = result.a;
					if ((error.$ === 3) && (error.a === 404)) {
						return A2($author$project$Main$deleteNoteLocally, noteId, model);
					} else {
						var localResult = A2($author$project$Main$deleteNoteLocally, noteId, model);
						var errorMessage = 'Failed to verify note exists on GitHub: ' + $author$project$Main$httpErrorToString(error);
						return _Utils_Tuple2(
							function (m) {
								return _Utils_update(
									m,
									{
										b: $author$project$GitHub$Error(errorMessage)
									});
							}(localResult.a),
							localResult.b);
					}
				}
			default:
				var noteId = msg.a;
				var result = msg.b;
				if (!result.$) {
					var localResult = A2($author$project$Main$deleteNoteLocally, noteId, model);
					return _Utils_Tuple2(
						function (m) {
							return _Utils_update(
								m,
								{
									b: $author$project$GitHub$Success(model.l)
								});
						}(localResult.a),
						localResult.b);
				} else {
					var error = result.a;
					var localResult = A2($author$project$Main$deleteNoteLocally, noteId, model);
					var errorMessage = 'Failed to delete note from GitHub: ' + ($author$project$Main$httpErrorToString(error) + '. Note deleted locally anyway.');
					return _Utils_Tuple2(
						function (m) {
							return _Utils_update(
								m,
								{
									b: $author$project$GitHub$Error(errorMessage)
								});
						}(localResult.a),
						localResult.b);
				}
		}
	});
var $author$project$Messages$CancelDeleteNote = {$: 8};
var $author$project$Messages$CancelDeleteTag = {$: 17};
var $author$project$Messages$CancelEdit = {$: 10};
var $author$project$Messages$CancelForcePull = {$: 59};
var $author$project$Messages$ClearFilterTags = {$: 23};
var $author$project$Messages$ClearSelectedTags = {$: 21};
var $author$project$Messages$ConfirmClearAllData = {$: 82};
var $author$project$Messages$ConfirmDeleteNote = function (a) {
	return {$: 7, a: a};
};
var $author$project$Messages$ConfirmDeleteTag = function (a) {
	return {$: 16, a: a};
};
var $author$project$Messages$ConfirmForcePull = {$: 58};
var $author$project$Messages$ConfirmForcePullWithPassphrase = {$: 61};
var $author$project$Messages$ConfirmPassphrase = {$: 42};
var $author$project$Messages$ConfirmStartupPassphrase = {$: 77};
var $author$project$Messages$DeclinePostConfigForcePull = {$: 63};
var $author$project$Messages$HideClearDataConfirmation = {$: 80};
var $author$project$Messages$HidePassphraseDialog = {$: 40};
var $author$project$Messages$NewNote = {$: 30};
var $author$project$Messages$NoOp = {$: 0};
var $author$project$Messages$SaveNote = {$: 4};
var $author$project$Messages$ToggleGitHubPanel = {$: 28};
var $author$project$Messages$ToggleMarkdownPreview = {$: 70};
var $author$project$Messages$ToggleMarkdownSplitView = {$: 71};
var $author$project$Messages$ToggleSidebar = {$: 26};
var $author$project$Messages$ToggleTagDropdown = {$: 24};
var $author$project$Messages$ToggleTagsPanel = {$: 27};
var $author$project$Messages$UpdateClearDataPassphrase = function (a) {
	return {$: 81, a: a};
};
var $author$project$Messages$UpdateForcePullPassphrase = function (a) {
	return {$: 60, a: a};
};
var $author$project$Messages$UpdateNote = function (a) {
	return {$: 2, a: a};
};
var $author$project$Messages$UpdatePassphraseInput = function (a) {
	return {$: 41, a: a};
};
var $author$project$Messages$UpdateSearch = function (a) {
	return {$: 3, a: a};
};
var $author$project$Messages$UpdateStartupPassphraseInput = function (a) {
	return {$: 76, a: a};
};
var $author$project$Messages$UpdateTitle = function (a) {
	return {$: 1, a: a};
};
var $elm$html$Html$button = _VirtualDom_node('button');
var $elm$html$Html$Attributes$stringProperty = F2(
	function (key, string) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$string(string));
	});
var $elm$html$Html$Attributes$class = $elm$html$Html$Attributes$stringProperty('className');
var $elm$html$Html$Attributes$boolProperty = F2(
	function (key, bool) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$bool(bool));
	});
var $elm$html$Html$Attributes$disabled = $elm$html$Html$Attributes$boolProperty('disabled');
var $elm$html$Html$div = _VirtualDom_node('div');
var $elm$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			$elm$core$List$any,
			A2($elm$core$Basics$composeL, $elm$core$Basics$not, isOkay),
			list);
	});
var $elm$core$List$isEmpty = function (xs) {
	if (!xs.b) {
		return true;
	} else {
		return false;
	}
};
var $author$project$Utils$filterNotesByTags = F2(
	function (filterTags, notes) {
		return $elm$core$List$isEmpty(filterTags) ? notes : A2(
			$elm$core$List$filter,
			function (note) {
				return A2(
					$elm$core$List$all,
					function (filterTag) {
						return A2(
							$elm$core$List$any,
							function (noteTag) {
								return _Utils_eq(noteTag.bu, filterTag.bu);
							},
							note.g);
					},
					filterTags);
			},
			notes);
	});
var $author$project$Utils$filterNotesComplete = F3(
	function (searchQuery, filterTags, notes) {
		return A2(
			$author$project$Utils$filterNotes,
			searchQuery,
			A2($author$project$Utils$filterNotesByTags, filterTags, notes));
	});
var $elm$time$Time$flooredDiv = F2(
	function (numerator, denominator) {
		return $elm$core$Basics$floor(numerator / denominator);
	});
var $elm$time$Time$toAdjustedMinutesHelp = F3(
	function (defaultOffset, posixMinutes, eras) {
		toAdjustedMinutesHelp:
		while (true) {
			if (!eras.b) {
				return posixMinutes + defaultOffset;
			} else {
				var era = eras.a;
				var olderEras = eras.b;
				if (_Utils_cmp(era.bC, posixMinutes) < 0) {
					return posixMinutes + era.cd;
				} else {
					var $temp$defaultOffset = defaultOffset,
						$temp$posixMinutes = posixMinutes,
						$temp$eras = olderEras;
					defaultOffset = $temp$defaultOffset;
					posixMinutes = $temp$posixMinutes;
					eras = $temp$eras;
					continue toAdjustedMinutesHelp;
				}
			}
		}
	});
var $elm$time$Time$toAdjustedMinutes = F2(
	function (_v0, time) {
		var defaultOffset = _v0.a;
		var eras = _v0.b;
		return A3(
			$elm$time$Time$toAdjustedMinutesHelp,
			defaultOffset,
			A2(
				$elm$time$Time$flooredDiv,
				$elm$time$Time$posixToMillis(time),
				60000),
			eras);
	});
var $elm$core$Basics$ge = _Utils_ge;
var $elm$time$Time$toCivil = function (minutes) {
	var rawDay = A2($elm$time$Time$flooredDiv, minutes, 60 * 24) + 719468;
	var era = (((rawDay >= 0) ? rawDay : (rawDay - 146096)) / 146097) | 0;
	var dayOfEra = rawDay - (era * 146097);
	var yearOfEra = ((((dayOfEra - ((dayOfEra / 1460) | 0)) + ((dayOfEra / 36524) | 0)) - ((dayOfEra / 146096) | 0)) / 365) | 0;
	var dayOfYear = dayOfEra - (((365 * yearOfEra) + ((yearOfEra / 4) | 0)) - ((yearOfEra / 100) | 0));
	var mp = (((5 * dayOfYear) + 2) / 153) | 0;
	var month = mp + ((mp < 10) ? 3 : (-9));
	var year = yearOfEra + (era * 400);
	return {
		bO: (dayOfYear - ((((153 * mp) + 2) / 5) | 0)) + 1,
		b6: month,
		cF: year + ((month <= 2) ? 1 : 0)
	};
};
var $elm$time$Time$toDay = F2(
	function (zone, time) {
		return $elm$time$Time$toCivil(
			A2($elm$time$Time$toAdjustedMinutes, zone, time)).bO;
	});
var $elm$core$Basics$modBy = _Basics_modBy;
var $elm$time$Time$toHour = F2(
	function (zone, time) {
		return A2(
			$elm$core$Basics$modBy,
			24,
			A2(
				$elm$time$Time$flooredDiv,
				A2($elm$time$Time$toAdjustedMinutes, zone, time),
				60));
	});
var $elm$time$Time$toMinute = F2(
	function (zone, time) {
		return A2(
			$elm$core$Basics$modBy,
			60,
			A2($elm$time$Time$toAdjustedMinutes, zone, time));
	});
var $elm$time$Time$Apr = 3;
var $elm$time$Time$Aug = 7;
var $elm$time$Time$Dec = 11;
var $elm$time$Time$Feb = 1;
var $elm$time$Time$Jan = 0;
var $elm$time$Time$Jul = 6;
var $elm$time$Time$Jun = 5;
var $elm$time$Time$Mar = 2;
var $elm$time$Time$May = 4;
var $elm$time$Time$Nov = 10;
var $elm$time$Time$Oct = 9;
var $elm$time$Time$Sep = 8;
var $elm$time$Time$toMonth = F2(
	function (zone, time) {
		var _v0 = $elm$time$Time$toCivil(
			A2($elm$time$Time$toAdjustedMinutes, zone, time)).b6;
		switch (_v0) {
			case 1:
				return 0;
			case 2:
				return 1;
			case 3:
				return 2;
			case 4:
				return 3;
			case 5:
				return 4;
			case 6:
				return 5;
			case 7:
				return 6;
			case 8:
				return 7;
			case 9:
				return 8;
			case 10:
				return 9;
			case 11:
				return 10;
			default:
				return 11;
		}
	});
var $elm$time$Time$toSecond = F2(
	function (_v0, time) {
		return A2(
			$elm$core$Basics$modBy,
			60,
			A2(
				$elm$time$Time$flooredDiv,
				$elm$time$Time$posixToMillis(time),
				1000));
	});
var $elm$time$Time$toYear = F2(
	function (zone, time) {
		return $elm$time$Time$toCivil(
			A2($elm$time$Time$toAdjustedMinutes, zone, time)).cF;
	});
var $elm$time$Time$utc = A2($elm$time$Time$Zone, 0, _List_Nil);
var $author$project$Note$formatPosixTime = function (posix) {
	var year = A2($elm$time$Time$toYear, $elm$time$Time$utc, posix);
	var second = A2($elm$time$Time$toSecond, $elm$time$Time$utc, posix);
	var pad = function (n) {
		return (n < 10) ? ('0' + $elm$core$String$fromInt(n)) : $elm$core$String$fromInt(n);
	};
	var month = A2($elm$time$Time$toMonth, $elm$time$Time$utc, posix);
	var monthNumber = function () {
		switch (month) {
			case 0:
				return 1;
			case 1:
				return 2;
			case 2:
				return 3;
			case 3:
				return 4;
			case 4:
				return 5;
			case 5:
				return 6;
			case 6:
				return 7;
			case 7:
				return 8;
			case 8:
				return 9;
			case 9:
				return 10;
			case 10:
				return 11;
			default:
				return 12;
		}
	}();
	var minute = A2($elm$time$Time$toMinute, $elm$time$Time$utc, posix);
	var hour = A2($elm$time$Time$toHour, $elm$time$Time$utc, posix);
	var day = A2($elm$time$Time$toDay, $elm$time$Time$utc, posix);
	return $elm$core$String$fromInt(year) + ('-' + (pad(monthNumber) + ('-' + (pad(day) + (' ' + (pad(hour) + (':' + (pad(minute) + (':' + pad(second))))))))));
};
var $author$project$Note$formatTimestamp = function (timestamp) {
	if (!timestamp) {
		return 'Unknown';
	} else {
		var posix = $elm$time$Time$millisToPosix(timestamp);
		return $author$project$Note$formatPosixTime(posix);
	}
};
var $elm$html$Html$h1 = _VirtualDom_node('h1');
var $elm$html$Html$h3 = _VirtualDom_node('h3');
var $elm$html$Html$input = _VirtualDom_node('input');
var $author$project$Utils$isNewNoteButtonEnabled = function (model) {
	var _v0 = model.z;
	if (!_v0.$) {
		return true;
	} else {
		return false;
	}
};
var $elm$html$Html$li = _VirtualDom_node('li');
var $elm$virtual_dom$VirtualDom$attribute = F2(
	function (key, value) {
		return A2(
			_VirtualDom_attribute,
			_VirtualDom_noOnOrFormAction(key),
			_VirtualDom_noJavaScriptOrHtmlUri(value));
	});
var $elm$html$Html$Attributes$attribute = $elm$virtual_dom$VirtualDom$attribute;
var $elm$html$Html$code = _VirtualDom_node('code');
var $author$project$Markdown$extractCodeBlock = F2(
	function (lines, acc) {
		extractCodeBlock:
		while (true) {
			if (!lines.b) {
				return _Utils_Tuple2(
					$elm$core$List$reverse(acc),
					_List_Nil);
			} else {
				var currentLine = lines.a;
				var remainingLines = lines.b;
				if (A2(
					$elm$core$String$startsWith,
					'```',
					$elm$core$String$trim(currentLine))) {
					return _Utils_Tuple2(
						$elm$core$List$reverse(acc),
						remainingLines);
				} else {
					var $temp$lines = remainingLines,
						$temp$acc = A2($elm$core$List$cons, currentLine, acc);
					lines = $temp$lines;
					acc = $temp$acc;
					continue extractCodeBlock;
				}
			}
		}
	});
var $elm$virtual_dom$VirtualDom$keyedNode = function (tag) {
	return _VirtualDom_keyedNode(
		_VirtualDom_noScript(tag));
};
var $elm$html$Html$Keyed$node = $elm$virtual_dom$VirtualDom$keyedNode;
var $elm$html$Html$blockquote = _VirtualDom_node('blockquote');
var $elm$html$Html$h2 = _VirtualDom_node('h2');
var $elm$html$Html$h4 = _VirtualDom_node('h4');
var $elm$html$Html$h5 = _VirtualDom_node('h5');
var $elm$html$Html$span = _VirtualDom_node('span');
var $elm$html$Html$strong = _VirtualDom_node('strong');
var $elm$virtual_dom$VirtualDom$text = _VirtualDom_text;
var $elm$html$Html$text = $elm$virtual_dom$VirtualDom$text;
var $author$project$Markdown$processBoldText = function (content) {
	var parts = A2($elm$core$String$split, '**', content);
	var processedParts = A2(
		$elm$core$List$indexedMap,
		F2(
			function (index, part) {
				return (A2($elm$core$Basics$modBy, 2, index) === 1) ? A2(
					$elm$html$Html$strong,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text(part)
						])) : $elm$html$Html$text(part);
			}),
		parts);
	return A2($elm$html$Html$span, _List_Nil, processedParts);
};
var $elm$html$Html$em = _VirtualDom_node('em');
var $author$project$Markdown$processItalicText = function (content) {
	var parts = A2($elm$core$String$split, '*', content);
	var processedParts = A2(
		$elm$core$List$indexedMap,
		F2(
			function (index, part) {
				return (A2($elm$core$Basics$modBy, 2, index) === 1) ? A2(
					$elm$html$Html$em,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text(part)
						])) : $elm$html$Html$text(part);
			}),
		parts);
	return A2($elm$html$Html$span, _List_Nil, processedParts);
};
var $elm$html$Html$a = _VirtualDom_node('a');
var $author$project$Markdown$findFirstLink = function (content) {
	var findLinkHelper = F2(
		function (remaining, processed) {
			findLinkHelper:
			while (true) {
				if ($elm$core$String$isEmpty(remaining)) {
					return $elm$core$Maybe$Nothing;
				} else {
					if (A2($elm$core$String$startsWith, '[', remaining)) {
						var afterOpenBracket = A2($elm$core$String$dropLeft, 1, remaining);
						var _v0 = $elm$core$List$head(
							A2($elm$core$String$split, '](', afterOpenBracket));
						if (_v0.$ === 1) {
							var $temp$remaining = A2($elm$core$String$dropLeft, 1, remaining),
								$temp$processed = processed + '[';
							remaining = $temp$remaining;
							processed = $temp$processed;
							continue findLinkHelper;
						} else {
							var possibleLinkText = _v0.a;
							var remainingAfterText = A2(
								$elm$core$String$dropLeft,
								$elm$core$String$length(possibleLinkText) + 2,
								afterOpenBracket);
							var _v1 = $elm$core$List$head(
								A2($elm$core$String$split, ')', remainingAfterText));
							if (_v1.$ === 1) {
								var $temp$remaining = A2($elm$core$String$dropLeft, 1, remaining),
									$temp$processed = processed + '[';
								remaining = $temp$remaining;
								processed = $temp$processed;
								continue findLinkHelper;
							} else {
								var linkUrl = _v1.a;
								var afterUrl = A2(
									$elm$core$String$dropLeft,
									$elm$core$String$length(linkUrl) + 1,
									remainingAfterText);
								if (A2($elm$core$String$contains, '](', possibleLinkText) || A2($elm$core$String$contains, ')', linkUrl)) {
									var $temp$remaining = A2($elm$core$String$dropLeft, 1, remaining),
										$temp$processed = processed + '[';
									remaining = $temp$remaining;
									processed = $temp$processed;
									continue findLinkHelper;
								} else {
									return $elm$core$Maybe$Just(
										{bb: afterUrl, bc: processed, b4: possibleLinkText, b5: linkUrl});
								}
							}
						}
					} else {
						var restRemaining = A2($elm$core$String$dropLeft, 1, remaining);
						var nextChar = A2($elm$core$String$left, 1, remaining);
						var $temp$remaining = restRemaining,
							$temp$processed = _Utils_ap(processed, nextChar);
						remaining = $temp$remaining;
						processed = $temp$processed;
						continue findLinkHelper;
					}
				}
			}
		});
	return A2(findLinkHelper, content, '');
};
var $elm$html$Html$Attributes$href = function (url) {
	return A2(
		$elm$html$Html$Attributes$stringProperty,
		'href',
		_VirtualDom_noJavaScriptUri(url));
};
var $author$project$Markdown$processInlineMarkdownWithoutLinks = F2(
	function (_v0, content) {
		return A2($elm$core$String$contains, '**', content) ? $author$project$Markdown$processBoldText(content) : (A2($elm$core$String$contains, '*', content) ? $author$project$Markdown$processItalicText(content) : $elm$html$Html$text(content));
	});
var $elm$html$Html$Attributes$target = $elm$html$Html$Attributes$stringProperty('target');
var $author$project$Markdown$parseMarkdownLinks = F2(
	function (notes, content) {
		var _v0 = $author$project$Markdown$findFirstLink(content);
		if (_v0.$ === 1) {
			return _List_fromArray(
				[
					A2($author$project$Markdown$processInlineMarkdownWithoutLinks, notes, content)
				]);
		} else {
			var before = _v0.a.bc;
			var linkText = _v0.a.b4;
			var linkUrl = _v0.a.b5;
			var after = _v0.a.bb;
			var linkPart = A2(
				$elm$html$Html$a,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$href(linkUrl),
						$elm$html$Html$Attributes$target('_blank')
					]),
				_List_fromArray(
					[
						A2($author$project$Markdown$processInlineMarkdownWithoutLinks, notes, linkText)
					]));
			var beforeParts = $elm$core$String$isEmpty(before) ? _List_Nil : _List_fromArray(
				[
					A2($author$project$Markdown$processInlineMarkdownWithoutLinks, notes, before)
				]);
			var afterParts = A2($author$project$Markdown$parseMarkdownLinks, notes, after);
			return _Utils_ap(
				beforeParts,
				A2($elm$core$List$cons, linkPart, afterParts));
		}
	});
var $author$project$Markdown$processLinksText = F2(
	function (notes, content) {
		var parts = A2($author$project$Markdown$parseMarkdownLinks, notes, content);
		return A2($elm$html$Html$span, _List_Nil, parts);
	});
var $author$project$Messages$EditNote = function (a) {
	return {$: 9, a: a};
};
var $author$project$Markdown$findFirstNoteLink = function (content) {
	var _v0 = A2($elm$core$String$split, '[[', content);
	if (_v0.b) {
		var before = _v0.a;
		var rest = _v0.b;
		var _v1 = A2(
			$elm$core$String$split,
			']]',
			A2($elm$core$String$join, '[[', rest));
		if (_v1.b) {
			var noteTitle = _v1.a;
			var after = _v1.b;
			return $elm$core$String$isEmpty(noteTitle) ? $elm$core$Maybe$Nothing : $elm$core$Maybe$Just(
				{
					bb: A2($elm$core$String$join, ']]', after),
					bc: before,
					cc: noteTitle
				});
		} else {
			return $elm$core$Maybe$Nothing;
		}
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $author$project$Utils$findNoteByTitle = F2(
	function (title, notes) {
		return $elm$core$String$isEmpty(
			$elm$core$String$trim(title)) ? $elm$core$Maybe$Nothing : A2(
			$elm$core$Maybe$map,
			$elm$core$Tuple$first,
			$elm$core$List$head(
				A2(
					$elm$core$List$sortBy,
					function (_v1) {
						var score = _v1.b;
						return -score;
					},
					A2(
						$elm$core$List$filter,
						function (_v0) {
							var score = _v0.b;
							return score > 0.6;
						},
						A2(
							$elm$core$List$map,
							function (note) {
								var score = A2($author$project$Utils$fuzzyScore, title, note.x);
								return _Utils_Tuple2(note, score);
							},
							notes)))));
	});
var $elm$virtual_dom$VirtualDom$Normal = function (a) {
	return {$: 0, a: a};
};
var $elm$virtual_dom$VirtualDom$on = _VirtualDom_on;
var $elm$html$Html$Events$on = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$Normal(decoder));
	});
var $elm$html$Html$Events$onClick = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'click',
		$elm$json$Json$Decode$succeed(msg));
};
var $author$project$Markdown$processInlineMarkdownWithoutNoteLinks = F2(
	function (notes, content) {
		return A2($elm$core$String$contains, '](', content) ? A2($author$project$Markdown$processLinksText, notes, content) : (A2($elm$core$String$contains, '**', content) ? $author$project$Markdown$processBoldText(content) : (A2($elm$core$String$contains, '*', content) ? $author$project$Markdown$processItalicText(content) : $elm$html$Html$text(content)));
	});
var $elm$html$Html$Attributes$title = $elm$html$Html$Attributes$stringProperty('title');
var $author$project$Markdown$parseNoteLinks = F2(
	function (notes, content) {
		var _v0 = $author$project$Markdown$findFirstNoteLink(content);
		if (_v0.$ === 1) {
			return _List_fromArray(
				[
					A2($author$project$Markdown$processInlineMarkdownWithoutNoteLinks, notes, content)
				]);
		} else {
			var before = _v0.a.bc;
			var noteTitle = _v0.a.cc;
			var after = _v0.a.bb;
			var linkPart = function () {
				var _v1 = A2($author$project$Utils$findNoteByTitle, noteTitle, notes);
				if (!_v1.$) {
					var linkedNote = _v1.a;
					return A2(
						$elm$html$Html$a,
						_List_fromArray(
							[
								$elm$html$Html$Events$onClick(
								$author$project$Messages$EditNote(linkedNote.b$)),
								$elm$html$Html$Attributes$class('note-link'),
								$elm$html$Html$Attributes$title('Open note: ' + linkedNote.x)
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(noteTitle)
							]));
				} else {
					return A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('note-link-missing')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(noteTitle)
							]));
				}
			}();
			var beforeParts = $elm$core$String$isEmpty(before) ? _List_Nil : _List_fromArray(
				[
					A2($author$project$Markdown$processInlineMarkdownWithoutNoteLinks, notes, before)
				]);
			var afterParts = A2($author$project$Markdown$parseNoteLinks, notes, after);
			return _Utils_ap(
				beforeParts,
				A2($elm$core$List$cons, linkPart, afterParts));
		}
	});
var $author$project$Markdown$processNoteLinks = F2(
	function (notes, content) {
		var parts = A2($author$project$Markdown$parseNoteLinks, notes, content);
		return A2($elm$html$Html$span, _List_Nil, parts);
	});
var $author$project$Markdown$processInlineMarkdown = F2(
	function (notes, content) {
		return (A2($elm$core$String$contains, '[[', content) && A2($elm$core$String$contains, ']]', content)) ? A2($author$project$Markdown$processNoteLinks, notes, content) : (A2($elm$core$String$contains, '](', content) ? A2($author$project$Markdown$processLinksText, notes, content) : (A2($elm$core$String$contains, '**', content) ? $author$project$Markdown$processBoldText(content) : (A2($elm$core$String$contains, '*', content) ? $author$project$Markdown$processItalicText(content) : $elm$html$Html$text(content))));
	});
var $elm$html$Html$ul = _VirtualDom_node('ul');
var $author$project$Markdown$processMarkdownLine = F2(
	function (notes, line) {
		var trimmedLine = $elm$core$String$trim(line);
		return A2($elm$core$String$startsWith, '##### ', trimmedLine) ? A2(
			$elm$html$Html$h5,
			_List_Nil,
			_List_fromArray(
				[
					$elm$html$Html$text(
					A2($elm$core$String$dropLeft, 6, trimmedLine))
				])) : (A2($elm$core$String$startsWith, '#### ', trimmedLine) ? A2(
			$elm$html$Html$h4,
			_List_Nil,
			_List_fromArray(
				[
					$elm$html$Html$text(
					A2($elm$core$String$dropLeft, 5, trimmedLine))
				])) : (A2($elm$core$String$startsWith, '### ', trimmedLine) ? A2(
			$elm$html$Html$h3,
			_List_Nil,
			_List_fromArray(
				[
					$elm$html$Html$text(
					A2($elm$core$String$dropLeft, 4, trimmedLine))
				])) : (A2($elm$core$String$startsWith, '## ', trimmedLine) ? A2(
			$elm$html$Html$h2,
			_List_Nil,
			_List_fromArray(
				[
					$elm$html$Html$text(
					A2($elm$core$String$dropLeft, 3, trimmedLine))
				])) : (A2($elm$core$String$startsWith, '# ', trimmedLine) ? A2(
			$elm$html$Html$h1,
			_List_Nil,
			_List_fromArray(
				[
					$elm$html$Html$text(
					A2($elm$core$String$dropLeft, 2, trimmedLine))
				])) : ((A2($elm$core$String$startsWith, '- ', trimmedLine) || A2($elm$core$String$startsWith, '* ', trimmedLine)) ? A2(
			$elm$html$Html$ul,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('markdown-list')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$li,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('markdown-list-item')
						]),
					_List_fromArray(
						[
							A2(
							$author$project$Markdown$processInlineMarkdown,
							notes,
							A2($elm$core$String$dropLeft, 2, trimmedLine))
						]))
				])) : (A2($elm$core$String$startsWith, '> ', trimmedLine) ? A2(
			$elm$html$Html$blockquote,
			_List_Nil,
			_List_fromArray(
				[
					A2(
					$author$project$Markdown$processInlineMarkdown,
					notes,
					A2($elm$core$String$dropLeft, 2, trimmedLine))
				])) : ($elm$core$String$isEmpty(trimmedLine) ? A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('markdown-break')
				]),
			_List_Nil) : A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('markdown-paragraph')
				]),
			_List_fromArray(
				[
					A2($author$project$Markdown$processInlineMarkdown, notes, line)
				])))))))));
	});
var $author$project$Markdown$processMarkdownBlocks = F3(
	function (notes, lines, acc) {
		processMarkdownBlocks:
		while (true) {
			if (!lines.b) {
				return $elm$core$List$reverse(acc);
			} else {
				var currentLine = lines.a;
				var remainingLines = lines.b;
				var trimmedLine = $elm$core$String$trim(currentLine);
				if (A2($elm$core$String$startsWith, '```', trimmedLine)) {
					var language = $elm$core$String$trim(
						A2($elm$core$String$dropLeft, 3, trimmedLine));
					var _v1 = A2($author$project$Markdown$extractCodeBlock, remainingLines, _List_Nil);
					var codeLines = _v1.a;
					var restLines = _v1.b;
					if (language === 'mermaid') {
						var mermaidCode = A2($elm$core$String$join, '\n', codeLines);
						var mermaidBlock = A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('mermaid-diagram'),
									A2($elm$html$Html$Attributes$attribute, 'data-mermaid', mermaidCode),
									A2(
									$elm$html$Html$Attributes$attribute,
									'data-content-hash',
									$elm$core$String$fromInt(
										$elm$core$String$length(mermaidCode) + $elm$core$List$length(
											A2($elm$core$String$split, '\n', mermaidCode))))
								]),
							_List_Nil);
						var $temp$notes = notes,
							$temp$lines = restLines,
							$temp$acc = A2($elm$core$List$cons, mermaidBlock, acc);
						notes = $temp$notes;
						lines = $temp$lines;
						acc = $temp$acc;
						continue processMarkdownBlocks;
					} else {
						var codeContent = A2($elm$core$String$join, '\n', codeLines);
						var codeBlock = A3(
							$elm$html$Html$Keyed$node,
							'pre',
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('code-block')
								]),
							_List_fromArray(
								[
									_Utils_Tuple2(
									codeContent + ('_' + language),
									A2(
										$elm$html$Html$code,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class(
												'language-' + ($elm$core$String$isEmpty(language) ? 'text' : language))
											]),
										_List_fromArray(
											[
												A2(
												$elm$html$Html$span,
												_List_Nil,
												_List_fromArray(
													[
														$elm$html$Html$text(codeContent)
													]))
											])))
								]));
						var $temp$notes = notes,
							$temp$lines = restLines,
							$temp$acc = A2($elm$core$List$cons, codeBlock, acc);
						notes = $temp$notes;
						lines = $temp$lines;
						acc = $temp$acc;
						continue processMarkdownBlocks;
					}
				} else {
					var processedLine = A2($author$project$Markdown$processMarkdownLine, notes, currentLine);
					var $temp$notes = notes,
						$temp$lines = remainingLines,
						$temp$acc = A2($elm$core$List$cons, processedLine, acc);
					notes = $temp$notes;
					lines = $temp$lines;
					acc = $temp$acc;
					continue processMarkdownBlocks;
				}
			}
		}
	});
var $author$project$Markdown$markdownToHtml = F2(
	function (notes, content) {
		var lines = A2($elm$core$String$split, '\n', content);
		var processedContent = A3($author$project$Markdown$processMarkdownBlocks, notes, lines, _List_Nil);
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('markdown-content')
				]),
			processedContent);
	});
var $author$project$Main$markdownToHtml = F2(
	function (notes, content) {
		return A2($author$project$Markdown$markdownToHtml, notes, content);
	});
var $elm$html$Html$Events$alwaysStop = function (x) {
	return _Utils_Tuple2(x, true);
};
var $elm$virtual_dom$VirtualDom$MayStopPropagation = function (a) {
	return {$: 1, a: a};
};
var $elm$html$Html$Events$stopPropagationOn = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$MayStopPropagation(decoder));
	});
var $elm$html$Html$Events$targetValue = A2(
	$elm$json$Json$Decode$at,
	_List_fromArray(
		['target', 'value']),
	$elm$json$Json$Decode$string);
var $elm$html$Html$Events$onInput = function (tagger) {
	return A2(
		$elm$html$Html$Events$stopPropagationOn,
		'input',
		A2(
			$elm$json$Json$Decode$map,
			$elm$html$Html$Events$alwaysStop,
			A2($elm$json$Json$Decode$map, tagger, $elm$html$Html$Events$targetValue)));
};
var $elm$html$Html$Attributes$placeholder = $elm$html$Html$Attributes$stringProperty('placeholder');
var $elm$html$Html$textarea = _VirtualDom_node('textarea');
var $elm$html$Html$Attributes$type_ = $elm$html$Html$Attributes$stringProperty('type');
var $elm$html$Html$Attributes$value = $elm$html$Html$Attributes$stringProperty('value');
var $author$project$Messages$ToggleTagSelection = function (a) {
	return {$: 20, a: a};
};
var $author$project$Main$viewAvailableTag = F2(
	function (selectedTags, tag) {
		var isSelected = A2(
			$elm$core$List$any,
			function (t) {
				return _Utils_eq(t.bu, tag.bu);
			},
			selectedTags);
		return A2(
			$elm$html$Html$span,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(
					isSelected ? 'tag-item selected' : 'tag-item')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('tag-name'),
							$elm$html$Html$Events$onClick(
							$author$project$Messages$ToggleTagSelection(tag))
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(tag.bu)
						]))
				]));
	});
var $author$project$Messages$ToggleFilterTag = function (a) {
	return {$: 22, a: a};
};
var $author$project$Main$viewFilterTag = function (tag) {
	return A2(
		$elm$html$Html$span,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('filter-tag')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('filter-tag-name')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(tag.bu)
					])),
				A2(
				$elm$html$Html$button,
				_List_fromArray(
					[
						$elm$html$Html$Events$onClick(
						$author$project$Messages$ToggleFilterTag(tag)),
						$elm$html$Html$Attributes$class('remove-filter-tag-button')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('×')
					]))
			]));
};
var $author$project$Main$viewFilterableTag = F2(
	function (filterTags, tag) {
		var isSelected = A2(
			$elm$core$List$any,
			function (t) {
				return _Utils_eq(t.bu, tag.bu);
			},
			filterTags);
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Events$onClick(
					$author$project$Messages$ToggleFilterTag(tag)),
					$elm$html$Html$Attributes$class(
					isSelected ? 'filter-tag-option selected' : 'filter-tag-option')
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(tag.bu)
				]));
	});
var $author$project$Messages$EnableGitHubSync = {$: 53};
var $author$project$Messages$StartSync = {$: 38};
var $author$project$Messages$ToggleGitHubSettings = {$: 31};
var $author$project$Note$formatRelativeTime = F2(
	function (currentTime, timestamp) {
		if (!timestamp) {
			return 'Unknown';
		} else {
			var diffMs = currentTime - timestamp;
			var diffSeconds = (diffMs / 1000) | 0;
			var diffMinutes = (diffSeconds / 60) | 0;
			var diffHours = (diffMinutes / 60) | 0;
			var diffDays = (diffHours / 24) | 0;
			var diffMonths = (diffDays / 30) | 0;
			var diffWeeks = (diffDays / 7) | 0;
			var diffYears = (diffDays / 365) | 0;
			return (diffYears > 0) ? ((diffYears === 1) ? '1 year ago' : ($elm$core$String$fromInt(diffYears) + ' years ago')) : ((diffMonths > 0) ? ((diffMonths === 1) ? '1 month ago' : ($elm$core$String$fromInt(diffMonths) + ' months ago')) : ((diffWeeks > 0) ? ((diffWeeks === 1) ? '1 week ago' : ($elm$core$String$fromInt(diffWeeks) + ' weeks ago')) : ((diffDays > 0) ? ((diffDays === 1) ? '1 day ago' : ($elm$core$String$fromInt(diffDays) + ' days ago')) : ((diffHours > 0) ? ((diffHours === 1) ? '1 hour ago' : ($elm$core$String$fromInt(diffHours) + ' hours ago')) : ((diffMinutes > 0) ? ((diffMinutes === 1) ? '1 minute ago' : ($elm$core$String$fromInt(diffMinutes) + ' minutes ago')) : 'Just now')))));
		}
	});
var $author$project$Main$githubCommitUrl = F2(
	function (repoUrl, commitSha) {
		var cleanRepoUrl = A2($elm$core$String$endsWith, '.git', repoUrl) ? A2($elm$core$String$dropRight, 4, repoUrl) : repoUrl;
		return cleanRepoUrl + ('/commit/' + commitSha);
	});
var $author$project$GitHub$syncStatusToString = function (status) {
	switch (status.$) {
		case 0:
			return 'Not configured';
		case 1:
			return 'Disabled';
		case 2:
			return 'Ready to sync';
		case 3:
			return 'Syncing...';
		case 4:
			return 'Sync successful';
		default:
			var message = status.a;
			return 'Error: ' + message;
	}
};
var $author$project$Messages$DisableGitHubSync = {$: 52};
var $author$project$Messages$ExportGitHubConfig = {$: 84};
var $author$project$Messages$ImportGitHubConfig = {$: 88};
var $author$project$Messages$SaveGitHubConfig = {$: 35};
var $author$project$Messages$ShowClearDataConfirmation = {$: 79};
var $author$project$Messages$ToggleConfigImportPanel = {$: 86};
var $author$project$Messages$UpdateConfigImportJson = function (a) {
	return {$: 87, a: a};
};
var $author$project$Messages$UpdateGitHubPassphrase = function (a) {
	return {$: 34, a: a};
};
var $author$project$Messages$UpdateGitHubPersonalAccessToken = function (a) {
	return {$: 33, a: a};
};
var $author$project$Messages$UpdateGitHubRepositoryUrl = function (a) {
	return {$: 32, a: a};
};
var $elm$html$Html$label = _VirtualDom_node('label');
var $author$project$Main$viewGitHubSettings = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('github-settings-panel')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$h3,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text('GitHub Repository Configuration')
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('settings-form')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('form-group')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$label,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('form-label')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Repository URL:')
									])),
								A2(
								$elm$html$Html$input,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$placeholder('https://github.com/username/repository'),
										$elm$html$Html$Attributes$value(model.ay),
										$elm$html$Html$Events$onInput($author$project$Messages$UpdateGitHubRepositoryUrl),
										$elm$html$Html$Attributes$class('settings-input')
									]),
								_List_Nil),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('form-help')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Enter the full URL of your GitHub repository')
									]))
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('form-group')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$label,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('form-label')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Personal Access Token:')
									])),
								A2(
								$elm$html$Html$input,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$placeholder('ghp_xxxxxxxxxxxxxxxxxxxx'),
										$elm$html$Html$Attributes$value(model.Y),
										$elm$html$Html$Events$onInput($author$project$Messages$UpdateGitHubPersonalAccessToken),
										$elm$html$Html$Attributes$class('settings-input'),
										$elm$html$Html$Attributes$type_('password')
									]),
								_List_Nil),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('form-help')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Create a token with \'repo\' permissions at github.com/settings/tokens')
									]))
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('form-group')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$label,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('form-label')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Encryption Passphrase:')
									])),
								A2(
								$elm$html$Html$input,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$placeholder('Enter a secure passphrase...'),
										$elm$html$Html$Attributes$value(model.X),
										$elm$html$Html$Events$onInput($author$project$Messages$UpdateGitHubPassphrase),
										$elm$html$Html$Attributes$class('settings-input'),
										$elm$html$Html$Attributes$type_('password')
									]),
								_List_Nil),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('form-help')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('This passphrase will be used to encrypt your token for local storage'),
										function () {
										var _v0 = model.c;
										if (!_v0.$) {
											return A2(
												$elm$html$Html$div,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('passphrase-verification-note')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text('Note: Your passphrase will be verified against the existing configuration before saving changes.')
													]));
										} else {
											return $elm$html$Html$text('');
										}
									}()
									]))
							]))
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('settings-actions')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Events$onClick($author$project$Messages$SaveGitHubConfig),
								$elm$html$Html$Attributes$class(
								(model.f && (model.h === 5)) ? 'save-button disabled' : 'save-button'),
								$elm$html$Html$Attributes$disabled(model.f && (model.h === 5))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(
								(model.f && (model.h === 5)) ? 'Verifying...' : 'Save Configuration')
							])),
						(model.f && (model.h === 5)) ? A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('verification-message')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Verifying passphrase with existing configuration...')
							])) : $elm$html$Html$text(''),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Events$onClick($author$project$Messages$ToggleGitHubSettings),
								$elm$html$Html$Attributes$class('cancel-button')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Cancel')
							])),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Events$onClick($author$project$Messages$ShowClearDataConfirmation),
								$elm$html$Html$Attributes$class('clear-data-button')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Clear All Data')
							])),
						function () {
						var _v1 = model.c;
						if (!_v1.$) {
							var config = _v1.a;
							return config.bo ? A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('sync-management-buttons')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												$elm$html$Html$Events$onClick($author$project$Messages$DisableGitHubSync),
												$elm$html$Html$Attributes$class('disable-button')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Disable Sync')
											])),
										A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												$elm$html$Html$Events$onClick($author$project$Messages$ConfirmForcePull),
												$elm$html$Html$Attributes$class('force-pull-button')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Force Pull')
											]))
									])) : $elm$html$Html$text('');
						} else {
							return $elm$html$Html$text('');
						}
					}()
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('config-transfer-section')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$h4,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text('Configuration Transfer')
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('config-export')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Events$onClick($author$project$Messages$ExportGitHubConfig),
										$elm$html$Html$Attributes$class('export-button'),
										$elm$html$Html$Attributes$disabled(
										_Utils_eq(model.c, $elm$core$Maybe$Nothing))
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Copy Config to Clipboard')
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('form-help')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Export your GitHub configuration to share or backup')
									]))
							])),
						_Utils_eq(model.c, $elm$core$Maybe$Nothing) ? A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('config-import-toggle')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Events$onClick($author$project$Messages$ToggleConfigImportPanel),
										$elm$html$Html$Attributes$class('import-toggle-button')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(
										model.aU ? 'Hide Import' : 'Import Config')
									]))
							])) : $elm$html$Html$text(''),
						(model.aU && _Utils_eq(model.c, $elm$core$Maybe$Nothing)) ? A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('config-import-panel')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('form-group')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$label,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('form-label')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Paste Configuration JSON:')
											])),
										A2(
										$elm$html$Html$textarea,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$placeholder('Paste your exported configuration JSON here...'),
												$elm$html$Html$Attributes$value(model.aj),
												$elm$html$Html$Events$onInput($author$project$Messages$UpdateConfigImportJson),
												$elm$html$Html$Attributes$class('config-import-textarea')
											]),
										_List_Nil),
										A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('form-help')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Paste a previously exported configuration to import it')
											]))
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('import-actions')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												$elm$html$Html$Events$onClick($author$project$Messages$ImportGitHubConfig),
												$elm$html$Html$Attributes$class('import-button'),
												$elm$html$Html$Attributes$disabled(
												$elm$core$String$trim(model.aj) === '')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Import Configuration')
											])),
										A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												$elm$html$Html$Events$onClick($author$project$Messages$ToggleConfigImportPanel),
												$elm$html$Html$Attributes$class('cancel-button')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Cancel')
											]))
									]))
							])) : $elm$html$Html$text('')
					]))
			]));
};
var $author$project$Main$viewGitHubPanel = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('floating-panel github-panel')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('panel-header')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$h3,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('panel-title')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('GitHub Sync')
							])),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Events$onClick($author$project$Messages$ToggleGitHubPanel),
								$elm$html$Html$Attributes$class('panel-close-button')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('×')
							]))
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('panel-content')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('sync-status')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('sync-status-label')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Status: ')
									])),
								function () {
								var _v0 = model.b;
								if (_v0.$ === 5) {
									var errorMessage = _v0.a;
									return A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('sync-status-error')
											]),
										_List_fromArray(
											[
												A2(
												$elm$html$Html$span,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('sync-status-value error')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text('Error')
													])),
												A2(
												$elm$html$Html$div,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('error-details')
													]),
												_List_fromArray(
													[
														(A2($elm$core$String$contains, 'Authentication failed', errorMessage) || A2($elm$core$String$contains, 'Access forbidden', errorMessage)) ? A2(
														$elm$html$Html$div,
														_List_fromArray(
															[
																$elm$html$Html$Attributes$class('auth-error-help')
															]),
														_List_fromArray(
															[
																A2(
																$elm$html$Html$div,
																_List_fromArray(
																	[
																		$elm$html$Html$Attributes$class('error-message')
																	]),
																_List_fromArray(
																	[
																		$elm$html$Html$text(errorMessage)
																	])),
																A2(
																$elm$html$Html$div,
																_List_fromArray(
																	[
																		$elm$html$Html$Attributes$class('error-help')
																	]),
																_List_fromArray(
																	[
																		$elm$html$Html$text('Possible solutions:'),
																		A2(
																		$elm$html$Html$ul,
																		_List_Nil,
																		_List_fromArray(
																			[
																				A2(
																				$elm$html$Html$li,
																				_List_Nil,
																				_List_fromArray(
																					[
																						$elm$html$Html$text('Verify your Personal Access Token is correct and hasn\'t expired')
																					])),
																				A2(
																				$elm$html$Html$li,
																				_List_Nil,
																				_List_fromArray(
																					[
																						$elm$html$Html$text('Ensure your token has \'repo\' permissions')
																					])),
																				A2(
																				$elm$html$Html$li,
																				_List_Nil,
																				_List_fromArray(
																					[
																						$elm$html$Html$text('Check that the repository URL is correct')
																					])),
																				A2(
																				$elm$html$Html$li,
																				_List_Nil,
																				_List_fromArray(
																					[
																						$elm$html$Html$text('Try regenerating a new token in GitHub Settings')
																					]))
																			]))
																	]))
															])) : A2(
														$elm$html$Html$div,
														_List_fromArray(
															[
																$elm$html$Html$Attributes$class('error-message')
															]),
														_List_fromArray(
															[
																$elm$html$Html$text(errorMessage)
															]))
													]))
											]));
								} else {
									return A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('sync-status-value')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(
												$author$project$GitHub$syncStatusToString(model.b))
											]));
								}
							}()
							])),
						function () {
						var _v1 = model.c;
						if (!_v1.$) {
							var config = _v1.a;
							return (config.bo && (config.bs > 0)) ? A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('last-sync-info-box')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('last-sync-info')
											]),
										_List_fromArray(
											[
												A2(
												$elm$html$Html$span,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('last-sync-label')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text('Last sync: ')
													])),
												A2(
												$elm$html$Html$span,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('last-sync-value')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text(
														A2($author$project$Note$formatRelativeTime, model.l, config.bs))
													])),
												A2(
												$elm$html$Html$span,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('last-sync-timestamp')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text(
														' (' + ($author$project$Note$formatTimestamp(config.bs) + ')'))
													]))
											])),
										(!$elm$core$String$isEmpty(config.br)) ? A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('last-sync-ref')
											]),
										_List_fromArray(
											[
												A2(
												$elm$html$Html$span,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('last-sync-ref-label')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text('Last synced commit: ')
													])),
												A2(
												$elm$html$Html$a,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$href(
														A2($author$project$Main$githubCommitUrl, config.bz, config.br)),
														$elm$html$Html$Attributes$target('_blank'),
														$elm$html$Html$Attributes$class('commit-link')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text(
														A2($elm$core$String$left, 8, config.br))
													]))
											])) : $elm$html$Html$text('')
									])) : $elm$html$Html$text('');
						} else {
							return $elm$html$Html$text('');
						}
					}(),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('sync-controls')
							]),
						_List_fromArray(
							[
								function () {
								var _v2 = _Utils_Tuple2(model.c, model.b);
								if (!_v2.a.$) {
									var config = _v2.a.a;
									return config.bo ? A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('sync-enabled')
											]),
										_List_fromArray(
											[
												A2(
												$elm$html$Html$button,
												_List_fromArray(
													[
														$elm$html$Html$Events$onClick($author$project$Messages$StartSync),
														$elm$html$Html$Attributes$class('sync-button')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text('Sync Now')
													])),
												A2(
												$elm$html$Html$button,
												_List_fromArray(
													[
														$elm$html$Html$Events$onClick($author$project$Messages$ToggleGitHubSettings),
														$elm$html$Html$Attributes$class('settings-button')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text('Settings')
													]))
											])) : A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('sync-disabled')
											]),
										_List_fromArray(
											[
												A2(
												$elm$html$Html$button,
												_List_fromArray(
													[
														$elm$html$Html$Events$onClick($author$project$Messages$EnableGitHubSync),
														$elm$html$Html$Attributes$class('enable-sync-button')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text('Enable Sync')
													])),
												A2(
												$elm$html$Html$div,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('button-spacer')
													]),
												_List_Nil),
												A2(
												$elm$html$Html$button,
												_List_fromArray(
													[
														$elm$html$Html$Events$onClick($author$project$Messages$ToggleGitHubSettings),
														$elm$html$Html$Attributes$class('settings-button')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text('Settings')
													]))
											]));
								} else {
									var _v3 = _v2.a;
									return A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												$elm$html$Html$Events$onClick($author$project$Messages$ToggleGitHubSettings),
												$elm$html$Html$Attributes$class('configure-button')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Configure GitHub')
											]));
								}
							}()
							])),
						model.a5 ? $author$project$Main$viewGitHubSettings(model) : $elm$html$Html$text('')
					]))
			]));
};
var $author$project$Messages$DeleteNote = function (a) {
	return {$: 6, a: a};
};
var $author$project$Utils$hasCreateAction = F2(
	function (actionEvents, noteId) {
		return A2(
			$elm$core$List$any,
			function (event) {
				return _Utils_eq(event.cb, noteId) && (!event.bF);
			},
			actionEvents);
	});
var $author$project$Utils$hasUpdateAction = F2(
	function (actionEvents, noteId) {
		return A2(
			$elm$core$List$any,
			function (event) {
				return _Utils_eq(event.cb, noteId) && (event.bF === 1);
			},
			actionEvents);
	});
var $author$project$Note$notePreview = function (note) {
	var preview = A3($elm$core$String$slice, 0, 100, note.cS);
	return ($elm$core$String$length(note.cS) > 100) ? (preview + '...') : preview;
};
var $author$project$Main$viewNoteTag = function (tag) {
	return A2(
		$elm$html$Html$span,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('note-tag'),
				$elm$html$Html$Events$onClick(
				$author$project$Messages$ToggleFilterTag(tag))
			]),
		_List_fromArray(
			[
				$elm$html$Html$text(tag.bu)
			]));
};
var $author$project$Main$viewNote = F3(
	function (currentTime, actionEvents, note) {
		var noteClasses = 'note-item' + ((A2($author$project$Utils$hasCreateAction, actionEvents, note.b$) ? ' note-has-create-action' : '') + (A2($author$project$Utils$hasUpdateAction, actionEvents, note.b$) ? ' note-has-update-action' : ''));
		return A2(
			$elm$html$Html$li,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(noteClasses),
					$elm$html$Html$Events$onClick(
					$author$project$Messages$EditNote(note.b$))
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('note-header')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$h3,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('note-title')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(note.x)
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('note-actions')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$button,
									_List_fromArray(
										[
											A2(
											$elm$html$Html$Events$stopPropagationOn,
											'click',
											A2(
												$elm$json$Json$Decode$map,
												function (msg) {
													return _Utils_Tuple2(msg, true);
												},
												$elm$json$Json$Decode$succeed(
													$author$project$Messages$DeleteNote(note.b$)))),
											$elm$html$Html$Attributes$class('delete-button')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('×')
										]))
								]))
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('note-content')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							$author$project$Note$notePreview(note))
						])),
					(!$elm$core$List$isEmpty(note.g)) ? A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('note-tags')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('note-tags-label')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Tags: ')
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('note-tags-list')
								]),
							A2($elm$core$List$map, $author$project$Main$viewNoteTag, note.g))
						])) : $elm$html$Html$text(''),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('note-meta')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('note-timestamp')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('created-at')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(
											'Created ' + A2($author$project$Note$formatRelativeTime, currentTime, note.bd))
										])),
									(!_Utils_eq(note.aN, note.bd)) ? A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('edited-at')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(
											'Edited ' + A2($author$project$Note$formatRelativeTime, currentTime, note.aN))
										])) : $elm$html$Html$text('')
								]))
						]))
				]));
	});
var $author$project$Messages$HideNoteLinkModal = {$: 91};
var $author$project$Messages$UpdateNoteLinkQuery = function (a) {
	return {$: 92, a: a};
};
var $elm$html$Html$Attributes$autofocus = $elm$html$Html$Attributes$boolProperty('autofocus');
var $author$project$Messages$ConfirmNoteLink = {$: 95};
var $author$project$Messages$SelectNoteLinkDown = {$: 94};
var $author$project$Messages$SelectNoteLinkUp = {$: 93};
var $author$project$Main$handleNoteLinkKeyDown = function (key) {
	switch (key) {
		case 13:
			return $author$project$Messages$ConfirmNoteLink;
		case 27:
			return $author$project$Messages$HideNoteLinkModal;
		case 38:
			return $author$project$Messages$SelectNoteLinkUp;
		case 40:
			return $author$project$Messages$SelectNoteLinkDown;
		default:
			return $author$project$Messages$NoOp;
	}
};
var $author$project$Main$keyCodeDecoder = A2($elm$json$Json$Decode$field, 'keyCode', $elm$json$Json$Decode$int);
var $author$project$Messages$ClickNoteLink = function (a) {
	return {$: 96, a: a};
};
var $author$project$Main$viewNoteLinkResult = F3(
	function (selectedIndex, currentIndex, note) {
		var isSelected = _Utils_eq(selectedIndex, currentIndex);
		var resultClass = isSelected ? 'note-link-result selected' : 'note-link-result';
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(resultClass),
					$elm$html$Html$Events$onClick(
					$author$project$Messages$ClickNoteLink(note.b$))
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('note-link-title')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(note.x)
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('note-link-preview')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							$author$project$Note$notePreview(note))
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('note-link-date')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							$author$project$Note$formatTimestamp(note.aN))
						]))
				]));
	});
var $author$project$Main$viewNoteLinkModal = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('modal-overlay'),
				$elm$html$Html$Events$onClick($author$project$Messages$HideNoteLinkModal)
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('modal-content note-link-modal'),
						A2(
						$elm$html$Html$Events$stopPropagationOn,
						'click',
						A2(
							$elm$json$Json$Decode$map,
							function (msg) {
								return _Utils_Tuple2(msg, true);
							},
							$elm$json$Json$Decode$succeed($author$project$Messages$NoOp)))
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal-header')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$h3,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal-title')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Link to Note')
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal-close-button'),
										$elm$html$Html$Events$onClick($author$project$Messages$HideNoteLinkModal)
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('×')
									]))
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal-body')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$input,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$type_('text'),
										$elm$html$Html$Attributes$placeholder('Search for a note to link...'),
										$elm$html$Html$Attributes$value(model.ad),
										$elm$html$Html$Events$onInput($author$project$Messages$UpdateNoteLinkQuery),
										A2(
										$elm$html$Html$Events$on,
										'keydown',
										A2($elm$json$Json$Decode$map, $author$project$Main$handleNoteLinkKeyDown, $author$project$Main$keyCodeDecoder)),
										$elm$html$Html$Attributes$class('note-link-search'),
										$elm$html$Html$Attributes$autofocus(true)
									]),
								_List_Nil),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('note-link-results')
									]),
								$elm$core$List$isEmpty(model.D) ? _List_fromArray(
									[
										A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('note-link-no-results')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('No notes found')
											]))
									]) : A2(
									$elm$core$List$indexedMap,
									$author$project$Main$viewNoteLinkResult(model.w),
									model.D))
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal-footer')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('note-link-help')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Use ↑↓ to navigate, Enter to select, Esc to cancel')
									]))
							]))
					]))
			]));
};
var $author$project$Main$viewSelectedTag = function (tag) {
	return A2(
		$elm$html$Html$span,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('selected-tag')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('selected-tag-name'),
						$elm$html$Html$Events$onClick(
						$author$project$Messages$ToggleFilterTag(tag))
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(tag.bu)
					])),
				A2(
				$elm$html$Html$button,
				_List_fromArray(
					[
						$elm$html$Html$Events$onClick(
						$author$project$Messages$ToggleTagSelection(tag)),
						$elm$html$Html$Attributes$class('remove-tag-button')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('×')
					]))
			]));
};
var $author$project$Messages$CreateTag = {$: 14};
var $author$project$Messages$UpdateTag = function (a) {
	return {$: 13, a: a};
};
var $author$project$Utils$filterTagsByInput = F2(
	function (input, tags) {
		if ($elm$core$String$isEmpty(
			$elm$core$String$trim(input))) {
			return tags;
		} else {
			var lowerInput = $elm$core$String$toLower(
				$elm$core$String$trim(input));
			return A2(
				$elm$core$List$filter,
				function (tag) {
					return A2(
						$elm$core$String$contains,
						lowerInput,
						$elm$core$String$toLower(tag.bu));
				},
				tags);
		}
	});
var $author$project$Messages$DeleteTag = function (a) {
	return {$: 15, a: a};
};
var $author$project$Main$viewTag = function (tag) {
	return A2(
		$elm$html$Html$span,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('tag-item')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('tag-name'),
						$elm$html$Html$Events$onClick(
						$author$project$Messages$ToggleFilterTag(tag))
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(tag.bu)
					])),
				A2(
				$elm$html$Html$button,
				_List_fromArray(
					[
						$elm$html$Html$Events$onClick(
						$author$project$Messages$DeleteTag(tag.bu)),
						$elm$html$Html$Attributes$class('tag-delete-button')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('×')
					]))
			]));
};
var $author$project$Main$viewTagsPanel = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('floating-panel tags-panel')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('panel-header')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$h3,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('panel-title')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Tags')
							])),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Events$onClick($author$project$Messages$ToggleTagsPanel),
								$elm$html$Html$Attributes$class('panel-close-button')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('×')
							]))
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('panel-content')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('tag-creator')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$input,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$placeholder('Add new tag...'),
										$elm$html$Html$Attributes$value(model.ak),
										$elm$html$Html$Events$onInput($author$project$Messages$UpdateTag),
										$elm$html$Html$Attributes$class('tag-input')
									]),
								_List_Nil),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Events$onClick($author$project$Messages$CreateTag),
										$elm$html$Html$Attributes$class('create-tag-button')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Add Tag')
									]))
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('tags-list')
							]),
						A2(
							$elm$core$List$map,
							$author$project$Main$viewTag,
							A2($author$project$Utils$filterTagsByInput, model.ak, model.g)))
					]))
			]));
};
var $author$project$Main$view = function (model) {
	var filteredNotes = A2(
		$elm$core$List$sortBy,
		function (note) {
			return -note.aN;
		},
		A3($author$project$Utils$filterNotesComplete, model.a4, model.H, model.e));
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class(
				model.aS ? 'app mobile-view' : 'app')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('top-bar')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('top-bar-left')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Events$onClick($author$project$Messages$ToggleSidebar),
										$elm$html$Html$Attributes$class('top-bar-button')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(
										model.ar ? '☰' : '←')
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('app-title-container')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$h1,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('app-title')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Notez')
											])),
										model.aR ? A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('remote-update-notification'),
												$elm$html$Html$Attributes$title('New updates available from repository')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('!')
											])) : $elm$html$Html$text(''),
										function () {
										var eventCount = $elm$core$List$length(model.W);
										return (eventCount > 0) ? A2(
											$elm$html$Html$div,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('edit-count-badge'),
													$elm$html$Html$Attributes$title(
													$elm$core$String$fromInt(eventCount) + ' unsaved edits')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text(
													$elm$core$String$fromInt(eventCount))
												])) : $elm$html$Html$text('');
									}()
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Events$onClick($author$project$Messages$NewNote),
										$elm$html$Html$Attributes$class(
										$author$project$Utils$isNewNoteButtonEnabled(model) ? 'new-note-button' : 'new-note-button disabled'),
										$elm$html$Html$Attributes$disabled(
										!$author$project$Utils$isNewNoteButtonEnabled(model))
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('+ New Note')
									]))
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('top-bar-center')
							]),
						_List_Nil),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('top-bar-right')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Events$onClick($author$project$Messages$ToggleTagsPanel),
										$elm$html$Html$Attributes$class('top-bar-button')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Tags')
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Events$onClick($author$project$Messages$ToggleGitHubPanel),
										$elm$html$Html$Attributes$class('top-bar-button')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('GitHub Sync')
									]))
							]))
					])),
				(!model.ar) ? A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class(
						model.aS ? (model.ar ? 'notes-list mobile collapsed floating-panel-left' : 'notes-list mobile floating-panel-left') : (model.ar ? 'notes-list collapsed floating-panel-left' : 'notes-list floating-panel-left'))
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('notes-panel-header')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$h3,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('notes-panel-title')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Notes')
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Events$onClick($author$project$Messages$ToggleSidebar),
										$elm$html$Html$Attributes$class('notes-panel-close-button')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('×')
									]))
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('notes-panel-content')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('notes-search-section')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$input,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$placeholder('Search notes...'),
												$elm$html$Html$Attributes$value(model.a4),
												$elm$html$Html$Events$onInput($author$project$Messages$UpdateSearch),
												$elm$html$Html$Attributes$class('search-input')
											]),
										_List_Nil)
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('tag-filter-section')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('tag-filter-dropdown')
											]),
										_List_fromArray(
											[
												A2(
												$elm$html$Html$button,
												_List_fromArray(
													[
														$elm$html$Html$Events$onClick($author$project$Messages$ToggleTagDropdown),
														$elm$html$Html$Attributes$class('tag-filter-button')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text(
														'Filter by tags (' + ($elm$core$String$fromInt(
															$elm$core$List$length(model.H)) + ')')),
														A2(
														$elm$html$Html$span,
														_List_fromArray(
															[
																$elm$html$Html$Attributes$class('dropdown-arrow')
															]),
														_List_fromArray(
															[
																$elm$html$Html$text(
																model.a6 ? '▲' : '▼')
															]))
													])),
												model.a6 ? A2(
												$elm$html$Html$div,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('tag-filter-dropdown-content')
													]),
												_List_fromArray(
													[
														(!$elm$core$List$isEmpty(model.H)) ? A2(
														$elm$html$Html$div,
														_List_fromArray(
															[
																$elm$html$Html$Attributes$class('filter-tags-selected')
															]),
														_List_fromArray(
															[
																A2(
																$elm$html$Html$span,
																_List_fromArray(
																	[
																		$elm$html$Html$Attributes$class('filter-label')
																	]),
																_List_fromArray(
																	[
																		$elm$html$Html$text('Filtering by: ')
																	])),
																A2(
																$elm$html$Html$div,
																_List_fromArray(
																	[
																		$elm$html$Html$Attributes$class('filter-tags-list')
																	]),
																A2($elm$core$List$map, $author$project$Main$viewFilterTag, model.H)),
																A2(
																$elm$html$Html$button,
																_List_fromArray(
																	[
																		$elm$html$Html$Events$onClick($author$project$Messages$ClearFilterTags),
																		$elm$html$Html$Attributes$class('clear-filter-button')
																	]),
																_List_fromArray(
																	[
																		$elm$html$Html$text('Clear All')
																	]))
															])) : A2(
														$elm$html$Html$div,
														_List_fromArray(
															[
																$elm$html$Html$Attributes$class('no-filter-selected')
															]),
														_List_fromArray(
															[
																$elm$html$Html$text('No tag filters selected')
															])),
														A2(
														$elm$html$Html$div,
														_List_fromArray(
															[
																$elm$html$Html$Attributes$class('available-filter-tags')
															]),
														_List_fromArray(
															[
																A2(
																$elm$html$Html$span,
																_List_fromArray(
																	[
																		$elm$html$Html$Attributes$class('filter-label')
																	]),
																_List_fromArray(
																	[
																		$elm$html$Html$text('Available tags:')
																	])),
																A2(
																$elm$html$Html$div,
																_List_fromArray(
																	[
																		$elm$html$Html$Attributes$class('filter-tags-grid')
																	]),
																$elm$core$List$isEmpty(model.g) ? _List_fromArray(
																	[
																		A2(
																		$elm$html$Html$span,
																		_List_fromArray(
																			[
																				$elm$html$Html$Attributes$class('no-tags-message')
																			]),
																		_List_fromArray(
																			[
																				$elm$html$Html$text('No tags available')
																			]))
																	]) : A2(
																	$elm$core$List$map,
																	$author$project$Main$viewFilterableTag(model.H),
																	model.g))
															]))
													])) : $elm$html$Html$text('')
											]))
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('notes-content-scrollable')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$ul,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('notes')
											]),
										A2(
											$elm$core$List$map,
											A2($author$project$Main$viewNote, model.l, model.W),
											filteredNotes)),
										($elm$core$List$isEmpty(filteredNotes) && (!$elm$core$String$isEmpty(model.a4))) ? A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('no-results')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('No notes found matching your search.')
											])) : ($elm$core$List$isEmpty(model.e) ? A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('no-notes')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('No notes yet. Create your first note above!')
											])) : $elm$html$Html$text(''))
									]))
							]))
					])) : $elm$html$Html$text(''),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class(
						model.aS ? 'main-content mobile' : 'main-content')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('center-column')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('note-editor')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('note-content-box')
											]),
										_List_fromArray(
											[
												A2(
												$elm$html$Html$input,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$placeholder('Note title...'),
														$elm$html$Html$Attributes$value(model.r),
														$elm$html$Html$Events$onInput($author$project$Messages$UpdateTitle),
														$elm$html$Html$Attributes$class('title-input')
													]),
												_List_Nil),
												A2(
												$elm$html$Html$div,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('markdown-controls')
													]),
												_List_fromArray(
													[
														A2(
														$elm$html$Html$button,
														_List_fromArray(
															[
																$elm$html$Html$Events$onClick($author$project$Messages$ToggleMarkdownPreview),
																$elm$html$Html$Attributes$class(
																model.v ? 'markdown-mode-button active' : 'markdown-mode-button')
															]),
														_List_fromArray(
															[
																$elm$html$Html$text(
																model.v ? '📝 Edit' : '👁 Preview')
															])),
														A2(
														$elm$html$Html$button,
														_List_fromArray(
															[
																$elm$html$Html$Events$onClick($author$project$Messages$ToggleMarkdownSplitView),
																$elm$html$Html$Attributes$class(
																model.N ? 'markdown-mode-button active' : 'markdown-mode-button')
															]),
														_List_fromArray(
															[
																$elm$html$Html$text(
																model.N ? '📄 Single' : '🔀 Split')
															])),
														A2(
														$elm$html$Html$span,
														_List_fromArray(
															[
																$elm$html$Html$Attributes$class('markdown-help')
															]),
														_List_fromArray(
															[
																$elm$html$Html$text('Supports: # Headers (1-5), **bold**, *italic*, > quotes, - lists, ```code blocks```, ```mermaid diagrams```')
															]))
													])),
												model.N ? A2(
												$elm$html$Html$div,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('markdown-split-container')
													]),
												_List_fromArray(
													[
														A2(
														$elm$html$Html$div,
														_List_fromArray(
															[
																$elm$html$Html$Attributes$class('markdown-editor-pane')
															]),
														_List_fromArray(
															[
																A2(
																$elm$html$Html$textarea,
																_List_fromArray(
																	[
																		$elm$html$Html$Attributes$placeholder('Start writing your note with markdown...'),
																		$elm$html$Html$Attributes$value(model.m),
																		$elm$html$Html$Events$onInput($author$project$Messages$UpdateNote),
																		$elm$html$Html$Attributes$class('note-textarea markdown-editor')
																	]),
																_List_Nil)
															])),
														A2(
														$elm$html$Html$div,
														_List_fromArray(
															[
																$elm$html$Html$Attributes$class('markdown-preview-pane')
															]),
														_List_fromArray(
															[
																$elm$core$String$isEmpty(
																$elm$core$String$trim(model.m)) ? A2(
																$elm$html$Html$div,
																_List_fromArray(
																	[
																		$elm$html$Html$Attributes$class('markdown-preview-empty')
																	]),
																_List_fromArray(
																	[
																		$elm$html$Html$text('Preview will appear here as you type...')
																	])) : A2($author$project$Main$markdownToHtml, model.e, model.m)
															]))
													])) : (model.v ? A2(
												$elm$html$Html$div,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('markdown-preview-container')
													]),
												_List_fromArray(
													[
														$elm$core$String$isEmpty(
														$elm$core$String$trim(model.m)) ? A2(
														$elm$html$Html$div,
														_List_fromArray(
															[
																$elm$html$Html$Attributes$class('markdown-preview-empty')
															]),
														_List_fromArray(
															[
																$elm$html$Html$text('Nothing to preview. Switch to edit mode to add content.')
															])) : A2($author$project$Main$markdownToHtml, model.e, model.m)
													])) : A2(
												$elm$html$Html$textarea,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$placeholder('Start writing your note with markdown...'),
														$elm$html$Html$Attributes$value(model.m),
														$elm$html$Html$Events$onInput($author$project$Messages$UpdateNote),
														$elm$html$Html$Attributes$class('note-textarea')
													]),
												_List_Nil)),
												A2(
												$elm$html$Html$div,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('note-footer')
													]),
												_List_fromArray(
													[
														A2(
														$elm$html$Html$div,
														_List_fromArray(
															[
																$elm$html$Html$Attributes$class('note-action-buttons')
															]),
														_List_fromArray(
															[
																A2(
																$elm$html$Html$div,
																_List_fromArray(
																	[
																		$elm$html$Html$Attributes$class('note-timestamps')
																	]),
																_List_fromArray(
																	[
																		function () {
																		var _v0 = model.z;
																		if (!_v0.$) {
																			var editId = _v0.a;
																			var _v1 = $elm$core$List$head(
																				A2(
																					$elm$core$List$filter,
																					function (note) {
																						return _Utils_eq(note.b$, editId);
																					},
																					model.e));
																			if (!_v1.$) {
																				var note = _v1.a;
																				return A2(
																					$elm$html$Html$div,
																					_List_fromArray(
																						[
																							$elm$html$Html$Attributes$class('editing-timestamps')
																						]),
																					_List_fromArray(
																						[
																							A2(
																							$elm$html$Html$div,
																							_List_fromArray(
																								[
																									$elm$html$Html$Attributes$class('timestamp-row')
																								]),
																							_List_fromArray(
																								[
																									A2(
																									$elm$html$Html$span,
																									_List_fromArray(
																										[
																											$elm$html$Html$Attributes$class('timestamp-label editing-timestamp-label')
																										]),
																									_List_fromArray(
																										[
																											$elm$html$Html$text('Created: ')
																										])),
																									A2(
																									$elm$html$Html$span,
																									_List_fromArray(
																										[
																											$elm$html$Html$Attributes$class('timestamp-value editing-timestamp-value')
																										]),
																									_List_fromArray(
																										[
																											$elm$html$Html$text(
																											$author$project$Note$formatTimestamp(note.bd))
																										]))
																								])),
																							(!_Utils_eq(note.aN, note.bd)) ? A2(
																							$elm$html$Html$div,
																							_List_fromArray(
																								[
																									$elm$html$Html$Attributes$class('timestamp-row')
																								]),
																							_List_fromArray(
																								[
																									A2(
																									$elm$html$Html$span,
																									_List_fromArray(
																										[
																											$elm$html$Html$Attributes$class('timestamp-label editing-timestamp-label')
																										]),
																									_List_fromArray(
																										[
																											$elm$html$Html$text('Last edited: ')
																										])),
																									A2(
																									$elm$html$Html$span,
																									_List_fromArray(
																										[
																											$elm$html$Html$Attributes$class('timestamp-value editing-timestamp-value')
																										]),
																									_List_fromArray(
																										[
																											$elm$html$Html$text(
																											$author$project$Note$formatTimestamp(note.aN))
																										]))
																								])) : $elm$html$Html$text('')
																						]));
																			} else {
																				return $elm$html$Html$text('');
																			}
																		} else {
																			return $elm$html$Html$text('');
																		}
																	}()
																	])),
																A2(
																$elm$html$Html$div,
																_List_fromArray(
																	[
																		$elm$html$Html$Attributes$class('note-buttons-group')
																	]),
																_List_fromArray(
																	[
																		(!_Utils_eq(model.z, $elm$core$Maybe$Nothing)) ? A2(
																		$elm$html$Html$button,
																		_List_fromArray(
																			[
																				$elm$html$Html$Events$onClick($author$project$Messages$CancelEdit),
																				$elm$html$Html$Attributes$class(
																				($author$project$Utils$hasNoteContentChanged(model) && (!model.v)) ? 'cancel-button' : 'cancel-button disabled'),
																				$elm$html$Html$Attributes$disabled(
																				(!$author$project$Utils$hasNoteContentChanged(model)) || model.v)
																			]),
																		_List_fromArray(
																			[
																				$elm$html$Html$text('Cancel')
																			])) : $elm$html$Html$text(''),
																		A2(
																		$elm$html$Html$button,
																		_List_fromArray(
																			[
																				$elm$html$Html$Events$onClick($author$project$Messages$SaveNote),
																				$elm$html$Html$Attributes$class(
																				($author$project$Utils$hasNoteContentChanged(model) && (!model.v)) ? 'save-button' : 'save-button disabled'),
																				$elm$html$Html$Attributes$disabled(
																				(!$author$project$Utils$hasNoteContentChanged(model)) || model.v)
																			]),
																		_List_fromArray(
																			[
																				$elm$html$Html$text(
																				function () {
																					var _v2 = model.z;
																					if (!_v2.$) {
																						return 'Update';
																					} else {
																						return 'Save';
																					}
																				}())
																			]))
																	]))
															]))
													])),
												A2(
												$elm$html$Html$div,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('note-tags-section')
													]),
												_List_fromArray(
													[
														A2(
														$elm$html$Html$div,
														_List_fromArray(
															[
																$elm$html$Html$Attributes$class('selected-tags-section')
															]),
														_List_fromArray(
															[
																A2(
																$elm$html$Html$div,
																_List_fromArray(
																	[
																		$elm$html$Html$Attributes$class('selected-tags-header')
																	]),
																_List_fromArray(
																	[
																		A2(
																		$elm$html$Html$h3,
																		_List_Nil,
																		_List_fromArray(
																			[
																				$elm$html$Html$text('Tags')
																			])),
																		(!$elm$core$List$isEmpty(model.k)) ? A2(
																		$elm$html$Html$button,
																		_List_fromArray(
																			[
																				$elm$html$Html$Events$onClick($author$project$Messages$ClearSelectedTags),
																				$elm$html$Html$Attributes$class('clear-tags-button-red')
																			]),
																		_List_fromArray(
																			[
																				$elm$html$Html$text('Clear All')
																			])) : $elm$html$Html$text('')
																	])),
																A2(
																$elm$html$Html$div,
																_List_fromArray(
																	[
																		$elm$html$Html$Attributes$class('selected-tags')
																	]),
																_List_fromArray(
																	[
																		A2(
																		$elm$html$Html$div,
																		_List_fromArray(
																			[
																				$elm$html$Html$Attributes$class('selected-tags-list')
																			]),
																		$elm$core$List$isEmpty(model.k) ? _List_fromArray(
																			[
																				A2(
																				$elm$html$Html$span,
																				_List_fromArray(
																					[
																						$elm$html$Html$Attributes$class('no-tags-selected')
																					]),
																				_List_fromArray(
																					[
																						$elm$html$Html$text('No tags selected')
																					]))
																			]) : A2($elm$core$List$map, $author$project$Main$viewSelectedTag, model.k))
																	]))
															]))
													]))
											])),
										A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('available-tags-section')
											]),
										_List_fromArray(
											[
												A2(
												$elm$html$Html$div,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('available-tags')
													]),
												_List_fromArray(
													[
														A2(
														$elm$html$Html$div,
														_List_fromArray(
															[
																$elm$html$Html$Attributes$class('available-tags-card')
															]),
														_List_fromArray(
															[
																A2(
																$elm$html$Html$span,
																_List_fromArray(
																	[
																		$elm$html$Html$Attributes$class('available-tags-label')
																	]),
																_List_fromArray(
																	[
																		$elm$html$Html$text('Available Tags')
																	])),
																A2(
																$elm$html$Html$div,
																_List_fromArray(
																	[
																		$elm$html$Html$Attributes$class('available-tags-list')
																	]),
																$elm$core$List$isEmpty(model.g) ? _List_fromArray(
																	[
																		A2(
																		$elm$html$Html$span,
																		_List_fromArray(
																			[
																				$elm$html$Html$Attributes$class('no-tags-available')
																			]),
																		_List_fromArray(
																			[
																				$elm$html$Html$text('No tags available, create some!')
																			]))
																	]) : A2(
																	$elm$core$List$map,
																	$author$project$Main$viewAvailableTag(model.k),
																	model.g))
															]))
													]))
											]))
									]))
							]))
					])),
				model.aH ? $author$project$Main$viewTagsPanel(model) : $elm$html$Html$text(''),
				model.aF ? $author$project$Main$viewGitHubPanel(model) : $elm$html$Html$text(''),
				function () {
				var _v3 = model.av;
				if (!_v3.$) {
					var noteIdToDelete = _v3.a;
					var noteToDelete = $elm$core$List$head(
						A2(
							$elm$core$List$filter,
							function (note) {
								return _Utils_eq(note.b$, noteIdToDelete);
							},
							model.e));
					if (!noteToDelete.$) {
						var note = noteToDelete.a;
						return A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('modal-overlay'),
									$elm$html$Html$Events$onClick($author$project$Messages$CancelDeleteNote)
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('modal-content'),
											A2(
											$elm$html$Html$Events$stopPropagationOn,
											'click',
											A2(
												$elm$json$Json$Decode$map,
												function (msg) {
													return _Utils_Tuple2(msg, true);
												},
												$elm$json$Json$Decode$succeed($author$project$Messages$CancelDeleteNote)))
										]),
									_List_fromArray(
										[
											A2(
											$elm$html$Html$div,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('modal-header')
												]),
											_List_fromArray(
												[
													A2(
													$elm$html$Html$h3,
													_List_fromArray(
														[
															$elm$html$Html$Attributes$class('modal-title')
														]),
													_List_fromArray(
														[
															$elm$html$Html$text('Delete Note')
														])),
													A2(
													$elm$html$Html$button,
													_List_fromArray(
														[
															$elm$html$Html$Attributes$class('modal-close-button'),
															$elm$html$Html$Events$onClick($author$project$Messages$CancelDeleteNote)
														]),
													_List_fromArray(
														[
															$elm$html$Html$text('×')
														]))
												])),
											A2(
											$elm$html$Html$div,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('modal-body')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('Are you sure you want to delete the note \"'),
													A2(
													$elm$html$Html$span,
													_List_fromArray(
														[
															$elm$html$Html$Attributes$class('note-title-highlight')
														]),
													_List_fromArray(
														[
															$elm$html$Html$text(
															$elm$core$String$isEmpty(note.x) ? '(Untitled)' : note.x)
														])),
													$elm$html$Html$text('\"?'),
													A2(
													$elm$html$Html$div,
													_List_fromArray(
														[
															$elm$html$Html$Attributes$class('modal-warning')
														]),
													_List_fromArray(
														[
															$elm$html$Html$text('This action cannot be undone.')
														]))
												])),
											A2(
											$elm$html$Html$div,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('modal-footer')
												]),
											_List_fromArray(
												[
													A2(
													$elm$html$Html$button,
													_List_fromArray(
														[
															$elm$html$Html$Attributes$class('modal-button modal-cancel-button'),
															$elm$html$Html$Events$onClick($author$project$Messages$CancelDeleteNote)
														]),
													_List_fromArray(
														[
															$elm$html$Html$text('Cancel')
														])),
													A2(
													$elm$html$Html$button,
													_List_fromArray(
														[
															$elm$html$Html$Attributes$class('modal-button modal-delete-button'),
															$elm$html$Html$Events$onClick(
															$author$project$Messages$ConfirmDeleteNote(noteIdToDelete))
														]),
													_List_fromArray(
														[
															$elm$html$Html$text('Delete')
														]))
												]))
										]))
								]));
					} else {
						return $elm$html$Html$text('');
					}
				} else {
					return $elm$html$Html$text('');
				}
			}(),
				function () {
				var _v5 = model.a7;
				if (!_v5.$) {
					var tagNameToDelete = _v5.a;
					var tagToDelete = $elm$core$List$head(
						A2(
							$elm$core$List$filter,
							function (tag) {
								return _Utils_eq(tag.bu, tagNameToDelete);
							},
							model.g));
					if (!tagToDelete.$) {
						var tag = tagToDelete.a;
						return A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('modal-overlay'),
									$elm$html$Html$Events$onClick($author$project$Messages$CancelDeleteTag)
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('modal-content'),
											A2(
											$elm$html$Html$Events$stopPropagationOn,
											'click',
											A2(
												$elm$json$Json$Decode$map,
												function (msg) {
													return _Utils_Tuple2(msg, true);
												},
												$elm$json$Json$Decode$succeed($author$project$Messages$CancelDeleteTag)))
										]),
									_List_fromArray(
										[
											A2(
											$elm$html$Html$div,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('modal-header')
												]),
											_List_fromArray(
												[
													A2(
													$elm$html$Html$h3,
													_List_fromArray(
														[
															$elm$html$Html$Attributes$class('modal-title')
														]),
													_List_fromArray(
														[
															$elm$html$Html$text('Delete Tag')
														])),
													A2(
													$elm$html$Html$button,
													_List_fromArray(
														[
															$elm$html$Html$Attributes$class('modal-close-button'),
															$elm$html$Html$Events$onClick($author$project$Messages$CancelDeleteTag)
														]),
													_List_fromArray(
														[
															$elm$html$Html$text('×')
														]))
												])),
											A2(
											$elm$html$Html$div,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('modal-body')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('Are you sure you want to delete the tag \"'),
													A2(
													$elm$html$Html$span,
													_List_fromArray(
														[
															$elm$html$Html$Attributes$class('note-title-highlight')
														]),
													_List_fromArray(
														[
															$elm$html$Html$text(tag.bu)
														])),
													$elm$html$Html$text('\"?'),
													A2(
													$elm$html$Html$div,
													_List_fromArray(
														[
															$elm$html$Html$Attributes$class('modal-warning')
														]),
													_List_fromArray(
														[
															$elm$html$Html$text('This will remove the tag from all notes. This action cannot be undone.')
														]))
												])),
											A2(
											$elm$html$Html$div,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('modal-footer')
												]),
											_List_fromArray(
												[
													A2(
													$elm$html$Html$button,
													_List_fromArray(
														[
															$elm$html$Html$Attributes$class('modal-button modal-cancel-button'),
															$elm$html$Html$Events$onClick($author$project$Messages$CancelDeleteTag)
														]),
													_List_fromArray(
														[
															$elm$html$Html$text('Cancel')
														])),
													A2(
													$elm$html$Html$button,
													_List_fromArray(
														[
															$elm$html$Html$Attributes$class('modal-button modal-delete-button'),
															$elm$html$Html$Events$onClick(
															$author$project$Messages$ConfirmDeleteTag(tagNameToDelete))
														]),
													_List_fromArray(
														[
															$elm$html$Html$text('Delete')
														]))
												]))
										]))
								]));
					} else {
						return $elm$html$Html$text('');
					}
				} else {
					return $elm$html$Html$text('');
				}
			}(),
				model.aQ ? A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('modal-overlay'),
						$elm$html$Html$Events$onClick($author$project$Messages$CancelForcePull)
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal-content'),
								A2(
								$elm$html$Html$Events$stopPropagationOn,
								'click',
								A2(
									$elm$json$Json$Decode$map,
									function (msg) {
										return _Utils_Tuple2(msg, true);
									},
									$elm$json$Json$Decode$succeed($author$project$Messages$NoOp)))
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal-header')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$h3,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('modal-title')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Force Pull Confirmation')
											])),
										A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('modal-close-button'),
												$elm$html$Html$Events$onClick($author$project$Messages$CancelForcePull)
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('×')
											]))
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal-body')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('This will '),
										A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('modal-warning-text')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('delete ALL local notes')
											])),
										$elm$html$Html$text(' and replace them with notes from the GitHub repository.'),
										A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('modal-warning')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('This action cannot be undone. Are you sure you want to continue?')
											])),
										$elm$html$Html$text('Please enter your passphrase to decrypt the GitHub token:'),
										A2(
										$elm$html$Html$input,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$placeholder('Enter passphrase...'),
												$elm$html$Html$Attributes$value(model.R),
												$elm$html$Html$Events$onInput($author$project$Messages$UpdateForcePullPassphrase),
												$elm$html$Html$Attributes$type_('password'),
												$elm$html$Html$Attributes$class('settings-input')
											]),
										_List_Nil)
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal-footer')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('modal-button modal-cancel-button'),
												$elm$html$Html$Events$onClick($author$project$Messages$CancelForcePull)
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Cancel')
											])),
										A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('modal-button modal-delete-button'),
												$elm$html$Html$Events$onClick($author$project$Messages$ConfirmForcePullWithPassphrase),
												$elm$html$Html$Attributes$disabled(
												$elm$core$String$trim(model.R) === '')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Force Pull')
											]))
									]))
							]))
					])) : $elm$html$Html$text(''),
				model.aq ? A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('modal-overlay'),
						$elm$html$Html$Events$onClick($author$project$Messages$HidePassphraseDialog)
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal-content'),
								A2(
								$elm$html$Html$Events$stopPropagationOn,
								'click',
								A2(
									$elm$json$Json$Decode$map,
									function (msg) {
										return _Utils_Tuple2(msg, true);
									},
									$elm$json$Json$Decode$succeed($author$project$Messages$NoOp)))
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal-header')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$h3,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('modal-title')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Enter Passphrase')
											])),
										A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('modal-close-button'),
												$elm$html$Html$Events$onClick($author$project$Messages$HidePassphraseDialog)
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('×')
											]))
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal-body')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Please enter your passphrase to decrypt the GitHub token:'),
										A2(
										$elm$html$Html$input,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$placeholder('Enter passphrase...'),
												$elm$html$Html$Attributes$value(model.P),
												$elm$html$Html$Events$onInput($author$project$Messages$UpdatePassphraseInput),
												$elm$html$Html$Attributes$type_('password'),
												$elm$html$Html$Attributes$class('settings-input')
											]),
										_List_Nil)
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal-footer')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('modal-button modal-cancel-button'),
												$elm$html$Html$Events$onClick($author$project$Messages$HidePassphraseDialog)
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Cancel')
											])),
										A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('modal-button modal-save-button'),
												$elm$html$Html$Events$onClick($author$project$Messages$ConfirmPassphrase),
												$elm$html$Html$Attributes$disabled(
												$elm$core$String$trim(model.P) === '')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Decrypt & Sync')
											]))
									]))
							]))
					])) : $elm$html$Html$text(''),
				model.aV ? A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('modal-overlay')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal-content'),
								A2(
								$elm$html$Html$Events$stopPropagationOn,
								'click',
								A2(
									$elm$json$Json$Decode$map,
									function (msg) {
										return _Utils_Tuple2(msg, true);
									},
									$elm$json$Json$Decode$succeed($author$project$Messages$NoOp)))
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal-header')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$h3,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('modal-title')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Enter GitHub Passphrase')
											]))
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal-body')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('GitHub sync is configured for this app. Please enter your passphrase to enable automatic syncing and update checking:'),
										A2(
										$elm$html$Html$input,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$placeholder('Enter passphrase...'),
												$elm$html$Html$Attributes$value(model.V),
												$elm$html$Html$Events$onInput($author$project$Messages$UpdateStartupPassphraseInput),
												$elm$html$Html$Attributes$type_('password'),
												$elm$html$Html$Attributes$class('settings-input')
											]),
										_List_Nil),
										model.f ? A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('loading-text')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Verifying passphrase...')
											])) : $elm$html$Html$text('')
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal-footer')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('modal-button modal-save-button'),
												$elm$html$Html$Events$onClick($author$project$Messages$ConfirmStartupPassphrase),
												$elm$html$Html$Attributes$disabled(
												($elm$core$String$trim(model.V) === '') || model.f)
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(
												model.f ? 'Verifying...' : 'Confirm')
											]))
									]))
							]))
					])) : $elm$html$Html$text(''),
				model.ap ? A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('modal-overlay'),
						$elm$html$Html$Events$onClick($author$project$Messages$HideClearDataConfirmation)
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal-content'),
								A2(
								$elm$html$Html$Events$stopPropagationOn,
								'click',
								A2(
									$elm$json$Json$Decode$map,
									function (msg) {
										return _Utils_Tuple2(msg, true);
									},
									$elm$json$Json$Decode$succeed($author$project$Messages$NoOp)))
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal-header')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$h3,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('modal-title')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Clear All Data')
											])),
										A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('modal-close-button'),
												$elm$html$Html$Events$onClick($author$project$Messages$HideClearDataConfirmation)
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('×')
											]))
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal-body')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('⚠️ WARNING: This will permanently delete ALL data from the app including:'),
										A2(
										$elm$html$Html$ul,
										_List_Nil,
										_List_fromArray(
											[
												A2(
												$elm$html$Html$li,
												_List_Nil,
												_List_fromArray(
													[
														$elm$html$Html$text('All notes and content')
													])),
												A2(
												$elm$html$Html$li,
												_List_Nil,
												_List_fromArray(
													[
														$elm$html$Html$text('All tags')
													])),
												A2(
												$elm$html$Html$li,
												_List_Nil,
												_List_fromArray(
													[
														$elm$html$Html$text('GitHub configuration')
													])),
												A2(
												$elm$html$Html$li,
												_List_Nil,
												_List_fromArray(
													[
														$elm$html$Html$text('All local storage data')
													]))
											])),
										$elm$html$Html$text('This action cannot be undone.'),
										function () {
										var _v7 = model.c;
										if (!_v7.$) {
											var config = _v7.a;
											return ($elm$core$String$trim(config.bx) !== '') ? A2(
												$elm$html$Html$div,
												_List_Nil,
												_List_fromArray(
													[
														$elm$html$Html$text(' Please enter your passphrase to confirm:'),
														A2(
														$elm$html$Html$input,
														_List_fromArray(
															[
																$elm$html$Html$Attributes$placeholder('Enter passphrase to confirm...'),
																$elm$html$Html$Attributes$value(model.F),
																$elm$html$Html$Events$onInput($author$project$Messages$UpdateClearDataPassphrase),
																$elm$html$Html$Attributes$type_('password'),
																$elm$html$Html$Attributes$class('settings-input')
															]),
														_List_Nil)
													])) : A2(
												$elm$html$Html$div,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('no-passphrase-info')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text(' No GitHub token found - data will be cleared without passphrase verification.')
													]));
										} else {
											return A2(
												$elm$html$Html$div,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('no-passphrase-info')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text(' No GitHub configuration found - data will be cleared without passphrase verification.')
													]));
										}
									}(),
										model.f ? A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('loading-text')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Verifying passphrase...')
											])) : $elm$html$Html$text('')
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal-footer')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('modal-button modal-cancel-button'),
												$elm$html$Html$Events$onClick($author$project$Messages$HideClearDataConfirmation)
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Cancel')
											])),
										A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('modal-button modal-delete-button'),
												$elm$html$Html$Events$onClick($author$project$Messages$ConfirmClearAllData),
												$elm$html$Html$Attributes$disabled(
												function () {
													var _v8 = model.c;
													if (!_v8.$) {
														var config = _v8.a;
														return ($elm$core$String$trim(config.bx) !== '') ? (($elm$core$String$trim(model.F) === '') || model.f) : model.f;
													} else {
														return model.f;
													}
												}())
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(
												model.f ? 'Verifying...' : 'Clear All Data')
											]))
									]))
							]))
					])) : $elm$html$Html$text(''),
				model.aG ? A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('modal-overlay'),
						$elm$html$Html$Events$onClick($author$project$Messages$DeclinePostConfigForcePull)
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal-content'),
								A2(
								$elm$html$Html$Events$stopPropagationOn,
								'click',
								A2(
									$elm$json$Json$Decode$map,
									function (msg) {
										return _Utils_Tuple2(msg, true);
									},
									$elm$json$Json$Decode$succeed($author$project$Messages$NoOp)))
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal-header')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$h3,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('modal-title')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('GitHub Configuration Successful')
											])),
										A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('modal-close-button'),
												$elm$html$Html$Events$onClick($author$project$Messages$DeclinePostConfigForcePull)
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('×')
											]))
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal-body')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Your GitHub configuration has been saved successfully. Would you like to force pull all notes from the repository to sync any existing notes?')
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal-footer')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('modal-button modal-cancel-button'),
												$elm$html$Html$Events$onClick($author$project$Messages$DeclinePostConfigForcePull)
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Skip')
											])),
										A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('modal-button modal-confirm-button'),
												$elm$html$Html$Events$onClick($author$project$Messages$ConfirmForcePull)
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Force Pull Notes')
											]))
									]))
							]))
					])) : $elm$html$Html$text(''),
				model.U ? $author$project$Main$viewNoteLinkModal(model) : $elm$html$Html$text('')
			]));
};
var $author$project$Main$main = $elm$browser$Browser$element(
	{c6: $author$project$Main$init, dA: $author$project$Main$subscriptions, dE: $author$project$Main$update, dF: $author$project$Main$view});
_Platform_export({'Main':{'init':$author$project$Main$main(
	$elm$json$Json$Decode$succeed(0))(0)}});}(this));