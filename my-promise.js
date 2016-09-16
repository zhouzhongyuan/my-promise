function Promise(executor) {
    var self = this;
    self.status = "pending";    //Promise当前状态
    self.data = undefined;  //Promise的值
    self.onResolvedCallback = [];   //Promise resolve时的回调集,因为Promise结束之前可能有多个回调添加在它上面
    self.onRejectedCallback = [];   //Promise reject时的回调集,因为Promise结束之前可能有多个回调添加在它上面
    executor(resolve, reject);
    
    function resolve(value) {
        //TODO
    }
    function reject(reason) {
        //TODO
    }
    try{    //考虑到executor执行过程中可能会出错,所以使用try/catch包起来,如果出错,reject这个promise
        executor(resolve, reject);

    } catch (e){
        reject(e);
    }
}