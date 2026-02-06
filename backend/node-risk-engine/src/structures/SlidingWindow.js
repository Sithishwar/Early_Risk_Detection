class SlidingWindow {
  constructor(size) {
    this.size = size;
    this.queue = [];
  }

  push(value) {
    this.queue.push(value);
    if (this.queue.length > this.size) {
      this.queue.shift();
    }
  }

  getValues() {
    return [...this.queue];
  }

  average() {
    if (this.queue.length === 0) return 0;
    const sum = this.queue.reduce((a, b) => a + b, 0);
    return sum / this.queue.length;
  }
}

module.exports = SlidingWindow;
