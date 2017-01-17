function Promise(fn) {
    var value = null,
        deferreds = [];

    this.then = function (onFulfilled) {
        deferreds.push(onFulfilled);
        return this;
    };

    function resolve(value) {
        setTimeout(function () {
            deferreds.forEach(function (deferred) {
                deferred(value);
            });
        }, 0);
    }

    fn(resolve);
}