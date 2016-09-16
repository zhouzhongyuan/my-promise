function Promise(executor) {
    var self = this;
    self.status = "pending";    //Promise当前状态
    self.data = undefined;  //Promise的值
    self.onResolvedCallback = [];   //Promise resolve时的回调集,因为Promise结束之前可能有多个回调添加在它上面
    self.onRejectedCallback = [];   //Promise reject时的回调集,因为Promise结束之前可能有多个回调添加在它上面
    executor(resolve, reject);
    
    function resolve(value) {
        if (self.status === "pending") {
            self.status = "resolved";
            self.data = value;
            for( var i = 0; i < self.onResolvedCallback.length; i++){
                self.onRejectedCallback[i](value);
            }

        }
    }
    function reject(reason) {
        if (self.status === "pending") {
            self.status = "rejected";
            self.data = reason;
            for (var i = 0; i < self.onRejectedCallback.length; i++) {
                self.onRejectedCallback[i](reason);
            }
        }
    }
    try{    //考虑到executor执行过程中可能会出错,所以使用try/catch包起来,如果出错,reject这个promise
        executor(resolve, reject);

    } catch (e){
        reject(e);
    }
}
//then方法接受两个参数,onResolved onRejected分别是Promise成功和失败后的回调
Promise.prototype.then = function (onResolved, onRejected) {
    var self = this;
    var promise2;

    //根据标准,如果then的参数不是function,则我们需要忽略它,此处处理方式如下
    onResolved = typeof onResolved === "function" ? onResolved : function (v) {};
    onRejected = typeof onRejected === "function" ? onRejected : function (r) {};

    if (self.status === "resolved") {
        //如果promise1(此处即为this/self)的状态已经确定并且是resolved,我们调用onResolved
        //因为考虑到可能有throw,所以我们将其包在try/catch中
        promise2 = new Promise(function (resolve, reject) {
            try {
                var x = onResolved(self.data);
                if (x instanceof Promise){  //如果onResolved的返回值是一个Promise对象,直接取它的结果作为promise2的结果
                    x.then(resolve, reject);
                }
                resolve(x); //否则,以它的返回值作为promise2的结果
            } catch (e) {
                reject(e);
            }
        })
        return promise2;
    }

    if (self.status === "rejected"){
        promise2 = new Promise(function (resolve, reject) {
            try {
                var x = onResolved(self.data);
                if(x instanceof Promise){
                    x.then(resolve, reject);
                }
                resolve(x);

            } catch (e) {
                reject(e);
            }
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
                    if(x instanceof Promise){
                        x.then(resolve, reject);
                    }

                } catch (e) {
                    reject(e);
                }

            };
            self.onResolvedCallback.push(onResolvedCondition);

            var onRejectedCondition = function (reason) {
                try {
                    var x = onRejected(self.data);
                } catch (e){
                    reject(e);
                }
            };
            self.onRejectedCallback.push(onRejectedCondition);

        });
        return promise2;
    }

}
// 为了下文方便，我们顺便实现一个catch方法
Promise.prototype.catch = function(onRejected) {
    return this.then(null, onRejected)
}