try {
    module.exports = Promise
} catch (e) {}

function Promise(executor) {
    var self = this;
    self.status = "pending";    //Promise当前状态
    self.data = undefined;  //Promise的值
    self.onResolvedCallback = [];   //Promise resolve时的回调集,因为Promise结束之前可能有多个回调添加在它上面
    self.onRejectedCallback = [];   //Promise reject时的回调集,因为Promise结束之前可能有多个回调添加在它上面
    
    function resolve(value) {
        if(value instanceof Promise){
            return value.then(resolve, reject);
        }
        setTimeout(function () {
            if (self.status === "pending") {
                self.status = "resolved";
                self.data = value;
                for( var i = 0; i < self.onResolvedCallback.length; i++){
                    self.onResolvedCallback[i](value);
                }
            }
        });
    }

    function reject(reason) {
        setTimeout(function() {
            if (self.status === "pending") {
                self.status = "rejected";
                self.data = reason;
                for (var i = 0; i < self.onRejectedCallback.length; i++) {
                    self.onRejectedCallback[i](reason);
                }
            }
        });
    }
    try{    //考虑到executor执行过程中可能会出错,所以使用try/catch包起来,如果出错,reject这个promise
        executor(resolve, reject);
    } catch (e){
        reject(e);
    }
}
/*
* resolvePromise:一个根据x的值来决定promise2状态的函数
* x是onResolved或者onRejected的返回值
* `resolve`和`reject`是`promise2`的`executor`的两个实参，因为很难挂在其它的地方，所以一并传进来。
* */
function resolvePromise(promise2, x, resolve, reject) {
    var then;
    var thenCalledOrThrow = false;
    // 2.3.1 If promise and x refer to the same object, reject promise with a TypeError as the reason.
    if (promise2 === x) {
        return reject(new TypeError("Chaining cycle detected for promise!"));
    }
    if( x instanceof Promise){  //规范2.3.2
        if (x.status === "pending"){    //规范2.3.2.1
            x.then(function (value) {
                resolvePromise(promise2, value, resolve, reject);
            },reject);
        }else{  //规范2.3.2.2 & 2.3.2.3
            x.then(resolve, reject);
        }
        return;
    }
    //2.3.3 Otherwise, if x is an object or function
    if (x != null && (typeof x === "object" || typeof x === "function") ){
        try{
            then = x.then //because x.then could be a getter
            if (typeof then === 'function') {
                then.call(x, function rs(y) {
                    if (thenCalledOrThrow) return;
                    thenCalledOrThrow = true;
                    return resolvePromise(promise2, y, resolve, reject)
                }, function rj(r) {
                    if (thenCalledOrThrow) return;
                    thenCalledOrThrow = true;
                    return reject(r);
                })
            } else {
                resolve(x);
            }
        }catch (e) {    //2.3.3.2 If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.
            if (thenCalledOrThrow) { return;}   //2.3.3.3.3 If both resolvePromise and rejectPromise are called, or multiple calls to the same argument are made, the first call takes precedence, and any further calls are ignored.
            thenCalledOrThrow = true;
            return reject(e);
        }
    }else{
    //2.3.4 If x is not an object or function, fulfill promise with x.
        resolve(x);
    }
}

//then方法接受两个参数,onResolved onRejected分别是Promise成功和失败后的回调
Promise.prototype.then = function (onResolved, onRejected) {
    var self = this;
    var promise2;

    //根据标准,如果then的参数不是function,则我们需要忽略它,此处处理方式如下
    onResolved = typeof onResolved === "function" ? onResolved : function (value) { return value};
    onRejected = typeof onRejected === "function" ? onRejected : function (reason) { throw reason};

    if (self.status === "resolved") {
        //如果promise1(此处即为this/self)的状态已经确定并且是resolved,我们调用onResolved
        //因为考虑到可能有throw,所以我们将其包在try/catch中
        promise2 = new Promise(function (resolve, reject) {
            setTimeout(function () {
                try {
                    var x = onResolved(self.data);
                    resolvePromise(promise2, x, resolve, reject)
                } catch (e) {
                    reject(e);
                }
            });
        })
        return promise2;
    }

    if (self.status === "rejected"){
        promise2 = new Promise(function (resolve, reject) {
            setTimeout(function () {
                try {
                    var x = onRejected(self.data);
                    resolvePromise(promise2, x, resolve, reject)
                } catch (e) {
                    reject(e);
                }
            });
        });
        return promise2;
    }
    if(self.status === "pending") {
        //如果当前Promise还处于pending状态,我们不能确定调用onResolved还是onRejected,
        //只能等到Promise的状态确定后,才能确定如何处理。
        //所以,需要把两种情况的处理逻辑作为callback放入promise1(此处指self/this)的回调数组里
        //逻辑本身与self.status === "resolved"快内的if几乎一致
        promise2 = new Promise(function (resolve, reject) {

            var onResolvedCondition = function (value) {
                try {
                    var x = onResolved(self.data);
                    resolvePromise(promise2, x, resolve, reject)
                } catch (e) {
                    reject(e);
                }
            };
            self.onResolvedCallback.push(onResolvedCondition);

            var onRejectedCondition = function (reason) {
                try {
                    var x = onRejected(self.data);
                    resolvePromise(promise2, x, resolve, reject)
                } catch (e){
                    reject(e);
                }
            };
            self.onRejectedCallback.push(onRejectedCondition);
        });
        return promise2;
    }
}

Promise.prototype.catch = function(onRejected) {
    return this.then(null, onRejected)
}

Promise.deferred = Promise.defer = function() {
    var dfd = {}
    dfd.promise = new Promise(function(resolve, reject) {
        dfd.resolve = resolve
        dfd.reject = reject
    })
    return dfd
}
