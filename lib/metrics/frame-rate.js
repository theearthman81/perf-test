export function startMeasureFPS(client) {
  return function() {
    return client.execute(function() {
      window.__frameRateHelper =  {
        start() {
          this._frames = 0;
          this._cancelled = false;
          this._startTime = window.performance.now();
          this._loop();
        },

        _loop() {
          if (this._cancelled) {
            return;
          }

          this._frames++;
          window.requestAnimationFrame(() => this._loop());
        },

        end() {
          this._cancelled = true;
          let durationInSeconds = (window.performance.now() - this._startTime) / 1000;
          return Math.floor(this._frames / durationInSeconds);
        }
      };

      window.__frameRateHelper.start();
    });
  }
};

export function endMeasureFPS(client) {
  return function() {
    return client.execute(function() {
      return window.__frameRateHelper.end();
    });
  };
};
