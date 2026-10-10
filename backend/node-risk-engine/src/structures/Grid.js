class Grid {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.grid = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => [])
    );
  }

  clear() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.grid[r][c] = [];
      }
    }
  }

  addPerson(row, col, person) {
    if (!this.isValidCell(row, col)) return;
    this.grid[row][col].push(person);
  }

  getCell(row, col) {
    if (!this.isValidCell(row, col)) return [];
    return this.grid[row][col];
  }

  isValidCell(row, col) {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }
}

module.exports = Grid;
