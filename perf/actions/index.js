module.exports = {
  bbc(client, results) {
    return client
      .collectGarbage()
      .startMeasureHeap()
      .startMeasureFPS()
      .scroll(0, 300)
      .endMeasureHeap()
      .then((result) => {
        results.memory = result.value / 1000000;
      })
      .endMeasureFPS()
      .then((result) => {
        results.fps = result.value;
      });
  }
};
