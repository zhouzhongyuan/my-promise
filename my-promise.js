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
        promise2 = new Promise(function (resolve, reject) {
            
        })
        return promise2;
    }

    if (self.status === "rejected"){
        promise2 = new Promise(function (resolve, reject) {

        });
        return promise2;
    }
    if(self.status === "pending") {
        promise2 = new Promise(function (resolve, reject) {

        });
        return promise2;
    }

}