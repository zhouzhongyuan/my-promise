var Promise = require('../index');




/*
// base
function doSomething() {
    return new Promise(function (resolve) {
        var value = 42;
        resolve(value);
    })
}
doSomething().then(function (result) {
    console.log('first result', result);
    return 88;
})


// base
function doSomething2() {
    return new Promise(function (resolve) {
        var value = 42;
        setTimeout(() => {
            resolve(value);
        },0);
    })
}
doSomething2().then(function (result) {
    console.log('first result', result);
    return 88;
})

// chain
function doSomething3() {
    return new Promise(function (resolve) {
        var value = 42;
        resolve(value);
    })
}
doSomething3().then(function (result) {
    console.log('first result', result);
    return 88;
}).then().then(function (secondResult) {
    console.log('second result', secondResult);
    return 99;
}).then(function (thirdResult) {
    console.log('third result', thirdResult);
});

*/

// reject
function doSomething4() {
    return new Promise(function (resolve,reject) {
        var value = 42;
        reject('I am wrong');
    })
}
doSomething4().then(
    function (result) {
        console.log('first result', result);
        return 88;
    }
)
    .then()
    .then(function (secondResult) {
        console.log('second result', secondResult);
        return 99;
    })
    .then(
        function (thirdResult) {
            console.log('third result', thirdResult);
        },
        function (e) {
            console.log(e);
        }
    );


// order
function doAnOperation() {
    return new Promise(function (resolve,reject) {
        var value = 42;
        resolve('I am wrong');
    })
}
function invokeSomething() {
    console.log('invokeSomething');
}
function invokeSomethingElse() {
    console.log('invokeSomethingElse');
}
function wrapItAllUp() {
    console.log('wrapItAllUp');
}

// If doAnOperation works synchronously, the order is invokeSomething -> wrapItAllUp ->invokeSomethingElse
// If doAnOperation works asynchronously, the order is invokeSomething ->invokeSomethingElse -> wrapItAllUp

var promise = doAnOperation();
invokeSomething();
promise.then(wrapItAllUp);
invokeSomethingElse();