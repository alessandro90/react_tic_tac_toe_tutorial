import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function Square(props) {
    const className = props.isWinner ? "square winner" : "square";
    return(
        <button className={className} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        let isWinner = false;
        if (this.props.winnerSquares) {
            isWinner = this.props.winnerSquares.some(val => val === i);
        }
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                key={i}
                isWinner={isWinner}
            />
        );
    }

    renderRow(j) {
        let row = [];
        for (let i = 0; i < 3; i++) {
            row = row.concat([this.renderSquare(i + j * 3)]);
        }
        return row;
    }

    render() {
        let squares = [];
        for (let i = 0; i < 3; i++) {
            squares = squares.concat([
                <div className="board-row" key={i}>{this.renderRow(i)}</div>
            ]);
        }

        return (
            <div>{squares}</div>
        );
    }
}

function Switch(props) {
    return (
        <label className="toggle">
            <input
                checked={props.checked}
                type="checkbox"
                onChange={props.onChange}
            />
            <span className="slider"></span>
        </label>
    );
}

function Reset(props) {
    return (
        <button className="reset" onClick={props.onClick}>Reset</button>
    );
}

const baseState = {
    history: [{
        squares: Array(9).fill(null),
        lastMove: null,
    }],
    stepNumber: 0,
    xIsNext: true,
    revertOrder: false,
    checkedSwitch: false,
};

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = baseState;
    }

    resetGame = () => {
        this.setState(baseState);
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (squares[i] || calculateWinner(squares)) return;
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        const lastMove = `${squares[i]} - (${i % 3}, ${Math.trunc(i / 3)})`;
        
        this.setState({
            history: history.concat([{squares: squares, lastMove: lastMove}]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    jumpToMove = (step) => {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    handleToggleSwitch = () => {
        this.setState((prevState, _) => ({
            checkedSwitch: !prevState.checkedSwitch,
            revertOrder: !prevState.revertOrder
        }));
    }

    render() {
        const history = this.state.history.slice();
        const current = history[this.state.stepNumber];
        const winnerData = calculateWinner(current.squares);

        const moves = history.map((mStep, mMove, his) => {
            let move, step;
            if (this.state.revertOrder) {
                step = his[his.length - 1 - mMove];
                move = his.length - 1 - mMove;
            } else {
                step = mStep;
                move = mMove;
            }
            const desc = move > 0 ?
                `Go to move #${move}` :
                'Go to game start';
            
            const weight = move === this.state.stepNumber ?
                'bold' : 'normal';
            
            return (
                <li style={{fontWeight: weight}} key={move}>
                    <button
                        style={{fontWeight: weight}}
                        className="stepButton"
                        onClick={() => this.jumpToMove(move)}>{desc}</button>
                    <ul>{step.lastMove}</ul>
                </li>
            );
        });

        let status;
        let winnerSquares;
        if (winnerData) {
            status = `Winner ${winnerData.winner}`;
            winnerSquares = winnerData.squares;
        } else {
            if (history.length === 10) status = "It's a TIE";
            else status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;
        }
        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={i => this.handleClick(i)}
                        winnerSquares={winnerSquares}
                    />
                    <div>
                        <Switch
                            checked={this.state.checkedSwitch}
                            onChange={this.handleToggleSwitch}/>
                    </div>
                    <Reset onClick={() => this.resetGame()}/>
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (const [a, b, c] of lines) {
        if (squares[a]
            && squares[a] === squares[b]
            && squares[a] === squares[c]) {
            return {winner: squares[a], squares: [a, b, c]};
        }
    }
    return null;
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
