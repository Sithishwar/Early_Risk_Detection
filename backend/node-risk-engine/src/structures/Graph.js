class Graph {
  constructor() {
    this.adjList = new Map();
  }

  addNode(node) {
    if (!this.adjList.has(node)) {
      this.adjList.set(node, new Map());
    }
  }

  addEdge(from, to, weight = 1) {
    this.addNode(from);
    this.addNode(to);
    this.adjList.get(from).set(to, weight);
  }

  getNeighbors(node) {
    return this.adjList.get(node) || new Map();
  }
}

module.exports = Graph;
