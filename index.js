function Promise(fn) {
    let value;
    let state = 'pending';
    let deffered;
    function resolve(v) {
        value = v;
        state = 'resolved';
        if(deffered){
            handle(deffered);
        }
    }
    function reject(e) {
        value = e;
        state = 'rejected';
        if(deffered){
            handle(deffered);
        }
    }
    function handle(handler) {
        if(state === 'pending'){
            deffered = handler;
            return;
        }
        if(state === 'resolved'){
            handlerCallback = handler.onResolved;
        }else{
            handlerCallback = handler.onRejected;
        }

        // callback is optional
        if(!handlerCallback){
            if(state === 'resolved'){
                handler.resolve(value);
            }else{
                handler.reject(value);
            }
            return;
        }

        var result = handlerCallback(value);
        handler.resolve(result);
    }
    this.then = function (onResolved, onRejected) {

        return new Promise(function (resolve,reject) {
            handle({
                onResolved,
                onRejected,
                resolve,
                reject,
            })
        })
    }
    fn(resolve, reject);
}
module.exports = Promise;