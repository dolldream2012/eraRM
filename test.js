var obj1 = { "a": 1, "b": 5 };
var obj2 = { "a": 3, "b": 4 };

for (var key in obj2) {
    if (obj1[key]) {
        obj1[key] = Math.max(obj1[key], obj2[key]);
    }
}

console.log(obj1);