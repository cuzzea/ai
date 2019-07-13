
function Player(genome) {
    this.brain = genome;
    this.brain.score = 0;
    this.lastMove = [-1,-1];
}
Player.prototype = {
    move: function(opponent) {
        var input = opponent.lastMove;
        var output = this.brain.activate(input);
        this.lastMove = output;
        var resultNormilized = [normalize(output[0]), normalize(output[1])];
        if(isNaN(resultNormilized[0]) || isNaN(resultNormilized[1]) || isNaN(output[0]) || isNaN(output[1])) {
            console.log('isNaN ', input, output, resultNormilized);
        }
        return resultNormilized;
    },
};

function normalize(x) {
    return x>=1?2 : (x<0?0: (Math.floor(x*3)));
}

module.exports=Player;
