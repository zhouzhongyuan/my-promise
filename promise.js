function Promise(fn) {
    var state = 'pending',
        value = null,
        deferreds = [];

    this.then = function (onFulfilled) {
        return new Promise(function (resolve) {
            handle({
                onFulfilled: onFulfilled || null,
                resolve: resolve
            });
        });
    };

    function handle(deferred) {
        if (state === 'pending') {
            deferreds.push(deferred);
            return;
        }

        var ret = deferred.onFulfilled(value);
        deferred.resolve(ret);
    }

    function resolve(newValue) {
        value = newValue;
        state = 'fulfilled';
        setTimeout(function () {
            deferreds.forEach(function (deferred) {
                deferred(value);
            });
        }, 0);
    }

    fn(resolve);
}