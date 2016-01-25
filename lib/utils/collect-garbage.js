export function collectGarbage(client) {
  return function() {
    return client.execute(function() {
        gc();
    });
  };
}
