export function collectGarbage(client) {
  return function() {
    return client.execute(function() {
    //  if (typeof window.gc === 'function') {
        window.gc();
    //  }
    });
  };
}
