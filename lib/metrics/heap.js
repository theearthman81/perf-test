export function startMeasureHeap(client) {
  return function() {
    return client.execute(function() {
      window.__measureHeap = {
        start() {
          this._startHeap = window.performance.memory.usedJSHeapSize;
        },

        end() {
          this._endHeap = window.performance.memory.usedJSHeapSize;
          return this._endHeap - this._startHeap;
        }
      };

      window.__measureHeap.start();
    });
  };
};

export function endMeasureHeap(client) {
  return function() {
    return client.execute(function() {
      return window.__measureHeap.end();
    });
  }
};
