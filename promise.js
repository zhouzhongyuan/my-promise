function Promise(fn) {
    var value = null,
        deferreds = [];

    this.then = function (onFulfilled) {
        deferreds.push(onFulfilled);
    };

    function resolve(value) {
        deferreds.forEach(function (deferred) {
            deferred(value);
        });
    }

    fn(resolve);
}