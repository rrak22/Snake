import React, { Component } from 'react';
import './Game.css';

const BODY = 1, FOOD = 2;
const KEYS = { left: 37, up: 38, right: 39, down: 40 };
const DIRS = { 37: true, 38: true, 39: true, 40: true };

class Game extends Component {
  constructor(props) {
    super(props);
    
    let start = this.props.startIndex || 21;
    let board = [];
    board[start] = BODY;

    this.state = {
     snake: [start],
     board: board,
     growth: 0,
     paused: true,
     gameOver: false,
     directions: KEYS.right,
    };

    this.board = React.createRef();
  }

  componentDidMount() {
    this.resume();
  }

  reset = () => {
    let start = this.props.startIndex || 21;
    let board = []
    board[start] = BODY;

    this.setState({
     snake: [start],
     board: board,
     growth: 0,
     paused: true,
     gameOver: false,
     directions: KEYS.right,
    });

    this.resume();
  };

  pause = () => {
    if (this.state.gameOver || this.state.paused) { return; }
    this.setState({ paused: true });
  };

  resume = () => {
    if (this.state.gameOver || !this.state.paused) { return; }
    this.setState({ paused: false });
    this.board.current.focus();
    this.tick();
  };

  getNextIndex = (head, direction, numRows, numCols) => {
    let x = head % numCols;
    let y = Math.floor(head / numCols);

    switch (direction) {
      case KEYS.up: y = y <= 0 ? numRows - 1 : y - 1;
      break;
      case KEYS.down: y = y >= numRows - 1 ? 0 : y + 1;
      break;
      case KEYS.left: x = x <= 0 ? numCols - 1 : x - 1;
      break;
      case KEYS.right: x = x >= numCols - 1 ? 0 : x + 1;
      break;
      default: return;
    }
      
    return (numCols * y) + x;
  }

  tick = () => {
    if (this.state.paused) return;
    let { snake, board, growth, direction } = this.state;
    let numRows = this.props.numRows || 20;
    let numCols = this.props.numCols || 20;
    let head = this.getNextIndex(snake[0], direction, numRows, numCols);

    if (snake.indexOf(head) !== -1) {
      this.setState({ gameOver: true });
      return;
    }

    let needsFood = board[head] === FOOD || snake.length === 1;
    
    if (needsFood) {
      let ii, numCells = numRows * numCols;
      
      do {
        ii = Math.floor(Math.random() * numCells);
      } while (board[ii]);
      
      board[ii] = FOOD;
      growth += 1;

      } else if (growth) {
        growth -= 1;
      
      } else {
        board[snake.pop()] = null;
      }

      snake.unshift(head);
      board[head] = BODY;

      if (this.nextDirection) {
        direction = this.nextDirection;
        this.nextDirection = null;
      }

      this.setState({
        snake: snake,
        board: board,
        growth: growth,
        direction: direction
      });

      setTimeout(this.tick, 100);
    };

    handleKey = (event) => {
      let direction = event.nativeEvent.keyCode;
      let difference = Math.abs(this.state.direction - direction);
      if (DIRS[direction] && difference !== 0 && difference !== 2) {
        this.nextDirection = direction;
      }
    };

  render() {
    let cells = [];
    let numRows = this.props.numRows || 20;
    let numCols = this.props.numCols || 20;
    let cellSize = this.props.cellSize || 30;

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        let code = this.state.board[numCols * row + col];
        let type = code === BODY ? 'body' : code === FOOD ? 'food' : 'empty';
        cells.push(<div className={type + '-cell'} />);
      }
    }

    return (
      <div className="game">
        <h1 className="score">Score: {this.state.snake.length}</h1>
        <div 
          ref={this.board}
          className={'board' + (this.state.gameOver ? ' game-over' : '')}
          tabIndex={0}
          onBlur={this.pause}
          onFocus={this.resume}
          onKeyDown={this.handleKey}
          style={{width: numCols * cellSize, height: numRows * cellSize}}>
          {cells}
        </div>
        <div className="controls">
          {this.state.paused ? <button onClick={this.resume}>Resume</button> : null}
          {this.state.gameOver ? <button onClick={this.reset}>New Game</button> : null}
        </div>
      </div>
    );
  }

}

export default Game;
