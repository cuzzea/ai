var Player = require('./player');

function Game(p1,p2) {
    this.ended = false;
    this.playerOne = new Player(p1);
    this.playerTwo = new Player(p2);
    this.board=[[0,0,0],
                [0,0,0],
                [0,0,0]];
}
Game.prototype = {
    tick: function(){
        var result = this.playerOne.move(this.playerTwo);
        if (!result || !this.board || !this.board[result[0]]) {
            console.log(this.board,result, this.playerTwo, this.playerOne);
        }
        if (this.board[result[0]][result[1]] != 0) {
            // console.log('illigal move', this.board[result[0]][result[1]]);
            this.playerOne.brain.score = -100;
            this.ended = true;
            return false;
        }
        this.playerOne.brain.score += 5;
        this.board[result[0]][result[1]] = 'X';
        if (this.checkWin('X')) {
            // console.log('player one won');
            this.playerOne.brain.score = 200 - this.playerOne.brain.score;
            this.playerTwo.brain.score-=20;
            this.ended = true;
            return false;
        }
        result = this.playerTwo.move(this.playerOne);
        if (!result || !this.board || !this.board[result[0]]) {
            console.log(this.board,result, this.playerTwo, this.playerOne);
        }
        if (this.board[result[0]][result[1]] != 0) {
            // console.log('illigal move', this.board[result[0]][result[1]]);
            this.playerTwo.brain.score = -100;
            this.ended = true;
            return false;
        }
        this.playerTwo.brain.score += 5;
        this.board[result[0]][result[1]] = 'O';
        if (this.checkWin('O')) {
            // console.log('player two won');
            this.playerTwo.brain.score = 200 - this.playerTwo.brain.score;
            this.playerOne.brain.score-=20;
            this.ended = true;
            return false;
        }
        return true;
    },
    show: function(at) {
        var cell_size = 50;
        var rows = Math.floor(WIDTH / (10+cell_size*4));
        var paddingX = 10 + (at%rows)*cell_size*4;
        var paddingY = 10 + Math.floor(at/rows)*cell_size*4;
        line(
            paddingX                  ,paddingY + cell_size,
            paddingX + 3 * cell_size  ,paddingY + cell_size);
        line(
            paddingX                  ,paddingY + cell_size*2,
            paddingX + 3 * cell_size  ,paddingY + cell_size*2);
        line(
            paddingX + cell_size ,paddingY,
            paddingX + cell_size ,paddingY + cell_size*3);
        line(
            paddingX + cell_size*2 ,paddingY,
            paddingX + cell_size*2 ,paddingY + cell_size*3);
        for (var i=0;i<3;i++) {
            for (var j=0;j<3;j++) {
                if (this.board[j][i]=='O') {
                    ellipse(paddingX + cell_size*i + cell_size/2, paddingY + cell_size*j + cell_size/2, cell_size*0.75, cell_size*0.75);
                }
                if (this.board[j][i]=='X') {
                    line(
                        paddingX + cell_size*i + cell_size*0.25     ,paddingY + cell_size*j + cell_size*0.25,
                        paddingX + cell_size*(i+1) - cell_size*0.25 ,paddingY + cell_size*(j+1) - cell_size*0.25);
                    line(
                        paddingX + cell_size*(i+1) - cell_size*0.25 ,paddingY + cell_size*j + cell_size*0.25,
                        paddingX + cell_size*i + cell_size*0.25     ,paddingY + cell_size*(j+1) - cell_size*0.25);
                }
            }
        }
    },
    checkWin: function(pl) {
        if(
            (this.board[0][0] == this.board[1][1] && this.board[1][1] == this.board[2][2] && this.board[1][1] == pl) || 
            (this.board[0][2] == this.board[1][1] && this.board[0][2] == this.board[2][0] && this.board[0][2] == pl)
        ) {
            return true;
        }
        for (i=0;i<2;i++) {
            if(
                (this.board[i][0] == this.board[i][1] && this.board[i][0] == this.board[i][2] && this.board[i][0] == pl) || 
                (this.board[0][i] == this.board[1][i] && this.board[0][i] == this.board[2][i] && this.board[0][i]== pl)
            ) {
                return true;
            }
        }
        return false;
    }
};

module.exports=Game;