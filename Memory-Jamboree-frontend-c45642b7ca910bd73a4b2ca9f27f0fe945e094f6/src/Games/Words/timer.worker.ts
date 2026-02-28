let interval: any = null;

self.onmessage = function(e: MessageEvent) {
  const { command, time } = e.data;

  if (command === 'start') {
    // Ensure any existing interval is cleared before starting a new one
    if (interval) {
      clearInterval(interval);
    }
    
    let timeLeft = time;
    interval = setInterval(() => {
      timeLeft--;
      // Post a 'tick' message back to the main component
      self.postMessage({ type: 'tick', timeLeft });

      if (timeLeft <= 0) {
        clearInterval(interval);
        interval = null;
        // Post a 'done' message when the timer finishes
        self.postMessage({ type: 'done' });
      }
    }, 1000);
  } else if (command === 'stop') {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }
};

export {};