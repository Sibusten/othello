import React from 'react';
import whiteToken from './white.png';
import blackToken from './black.png';
import './OthelloApp.scss';

const TOKEN_TYPE = {
  "EMPTY": 1,
  "WHITE": 2,
  "BLACK": 3
};

const PLAYER = {
  "WHITE": 1,
  "BLACK": 2
}

const PLAYER_NAMES = {
  [PLAYER.WHITE]: "White",
  [PLAYER.BLACK]: "Black"
}

class OthelloToken extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {tokenType: props.tokenType};
  }

  componentWillReceiveProps(props)
  {
    this.setState({tokenType: props.tokenType});
  }

  render()
  {
    let token;

    switch (this.state.tokenType)
    {
      case TOKEN_TYPE.EMPTY:
        token = <span />;
        break;
      case TOKEN_TYPE.WHITE:
        token = <img src={whiteToken} alt="W" />;
        break;
      case TOKEN_TYPE.BLACK:
        token = <img src={blackToken} alt="B" />;
        break;
    }

    return token;
  }
}

class OthelloBoard extends React.Component
{
  constructor(props)
  {
    super(props);
    this.boardSize = props.boardSize;

    this.board = [];
    this.curPlayer = PLAYER.WHITE;

    // Generate possible directions to check
    this.directions = [];
    for (let i = -1; i <= 1; i++)
    {
      for (let j = -1; j <= 1; j++)
      {
        if (i === 0 && j === 0)
          continue;

        this.directions.push([i, j]);
      }
    }

    // Create empty board
    for (let row = 0; row < this.boardSize; row++)
    {
      let boardRow = [];

      for (let col = 0; col < this.boardSize; col++)
      {
        boardRow.push(TOKEN_TYPE.EMPTY);
      }

      this.board.push(boardRow);
    }

    // Set initial pieces
    this.board[(this.boardSize/2)-1][(this.boardSize/2)-1] = TOKEN_TYPE.WHITE;
    this.board[(this.boardSize/2)-1][(this.boardSize/2)] = TOKEN_TYPE.BLACK;
    this.board[(this.boardSize/2)][(this.boardSize/2)-1] = TOKEN_TYPE.BLACK;
    this.board[(this.boardSize/2)][(this.boardSize/2)] = TOKEN_TYPE.WHITE;

    this.state = {
      board: this.board,
      curPlayer: PLAYER_NAMES[this.curPlayer],
      scoreWhite: 2,
      scoreBlack: 2
    };

    // Bind callbacks
    this.tileClicked = this.tileClicked.bind(this);
  }

  tileClicked(row, col, e)
  {
    if (this.board[row][col] != TOKEN_TYPE.EMPTY)
    {
      // Tile already taken
      return;
    }

    let curToken;
    let otherToken;
    let nextPlayer;

    if (this.curPlayer == PLAYER.WHITE)
    {
      curToken = TOKEN_TYPE.WHITE;
      otherToken = TOKEN_TYPE.BLACK;
      nextPlayer = PLAYER.BLACK;
    }
    else
    {
      curToken = TOKEN_TYPE.BLACK;
      otherToken = TOKEN_TYPE.WHITE;
      nextPlayer = PLAYER.WHITE;
    }

    let validMove = false;

    let numChangedTokens = 0;

    // Check each direction
    this.directions.forEach(function(dir) {
      let curRow = row + dir[0];
      let curCol = col + dir[1];

      // Loop until out of bounds, an empty tile is found, or another of the
      // current players tokens are found
      while (true)
      {
        if (curRow < 0 || curRow >= this.boardSize || curCol < 0 || curCol >= this.boardSize ||
            this.board[curRow][curCol] == TOKEN_TYPE.EMPTY)
        {
          // This direction can't be flipped
          return;
        }

        if (this.board[curRow][curCol] == curToken)
        {
          // This direction can be flipped
          break;
        }

        curRow += dir[0];
        curCol += dir[1];
      }

      // Invert the direction to go back
      let invDir = [dir[0] * -1, dir[1] * -1];

      curRow += invDir[0];
      curCol += invDir[1];

      // flip tokens
      while (!(curRow == row && curCol == col))
      {
        this.board[curRow][curCol] = curToken;

        numChangedTokens++;
        validMove = true;

        curRow += invDir[0];
        curCol += invDir[1];
      }
    }, this);

    if (validMove)
    {
      // Place the token
      this.board[row][col] = curToken;

      // Update score
      let newScoreWhite = this.state.scoreWhite;
      let newScoreBlack = this.state.scoreBlack;
      if (this.curPlayer == PLAYER.WHITE)
      {
        newScoreWhite += numChangedTokens + 1;
        newScoreBlack -= numChangedTokens;
      }
      else
      {
        newScoreBlack += numChangedTokens + 1;
        newScoreWhite -= numChangedTokens;
      }

      // Swap turns
      this.curPlayer = nextPlayer;

      // Update state
      this.setState({
        board: this.board,
        curPlayer: PLAYER_NAMES[nextPlayer],
        scoreWhite: newScoreWhite,
        scoreBlack: newScoreBlack
      });
    }
  }

  render()
  {
    let tiles = [];
    for (let row = 0; row < this.boardSize; row++)
    {
      for (let col = 0; col < this.boardSize; col++)
      {
        tiles.push(
          <button className="OthelloBoard-tile" onClick={(e) => this.tileClicked(row, col, e)}>
            <OthelloToken tokenType={this.state.board[row][col]} />
          </button>
        );
      }
    }

    return (
      <div className="OthelloBoard">
        <div className="OthelloBoard-grid">
          {tiles}
        </div>
        <div className="current-player">Current player: {this.state.curPlayer}</div>
        <div className="scorebox">
          <span className="score-white">White: {this.state.scoreWhite}</span>
          -
          <span className="score-black">Black: {this.state.scoreBlack}</span>
        </div>
      </div>
    );
  }
}

function OthelloApp() {
  return (
    <div className="OthelloApp">
      <header className="OthelloApp-header">
        <h1>
          Othello
        </h1>
      </header>
      <OthelloBoard boardSize={8} />
    </div>
  );
}

export default OthelloApp;
