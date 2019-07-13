var fs = require('fs');

var Game = require('./game');

var neataptic = require('../libs/neataptic');
var Layer   = neataptic.Layer;
var Neat    = neataptic.Neat;
var Methods = neataptic.methods;
var Config  = neataptic.Config;
var Architect = neataptic.architect;

var averageScore1 = 0;
var fittestAverageScore1 = 0;
var averageScore2 = 0;
var fittestAverageScore2 = 0;

var SIMULTANIOUS_GAMES_AMOUNT           = 63;
var MAX_GENERATION                      = 100;
var MAX_GENERATION_index                = 0;
// Sets the mutation rate. If set to 0.3, 30% of the new population will be mutated. Default is 0.3.
var MUTATION_RATE                       = 0.3;
// Sets the elitism of every evolution loop. Default is 0.
// Elitism involves copying a small proportion of the fittest candidates, unchanged, into the next generation.
var ELITISM_PERCENT                     = 0.1;

function Evolution(useOutput, maxRounds, generationsPerRun){
    if(generationsPerRun) {
        MAX_GENERATION = generationsPerRun;
    }
    this.isInteractive = !!useOutput;
    this.maxRounds = maxRounds;
    this.round = 0;
    this.useLogs = true;

    // input, output, fitnessFunction, options
    this.neat1 = this.createNeat();
    this.neat2 = this.createNeat();

    // drawGraph(this.neat1.population[0].graph(1000, 1000), '.draw');

    this.games = [];

    // do some random mutations
    this.mutate();
}
Evolution.prototype = {
    saveEvolution: function() {
        fs.writeFile("output/neat_1_"+MAX_GENERATION_index+'.json', JSON.stringify(this.neat1.population.map(function(n) {return n.toJSON();})), function(err) {
            if(err) {
                console.log(err);
                throw(err);
            }                    
        });
        fs.writeFile("output/neat_2_"+MAX_GENERATION_index+'.json', JSON.stringify(this.neat2.population.map(function(n) {return n.toJSON();})), function(err) {
            if(err) {
                console.log(err);
                throw(err);
            }                    
        });
    },
    startEvaluation: function(){
        var pop1 = [];
        var pop2 = [];
        this.games = [];
        for(var genome in this.neat1.population){
            pop1.push(this.neat1.population[genome]);
        }
        for(var genome in this.neat2.population){
            pop2.push(this.neat2.population[genome]);
        }
        for(var i=0;i<pop1.length;i++){
            this.games.push(new Game(pop1[i],pop2[i]));
        }
    },

    /** End the evaluation of the current generation */
    endEvaluation: function (){
        // console.log('endEvaluation');
        
        this.neat1.sort();
        this.neat2.sort();
        averageScore1+=this.neat1.getAverage();
        fittestAverageScore1+=this.neat1.population[0].score;
        averageScore2+=this.neat2.getAverage();
        fittestAverageScore2+=this.neat2.population[0].score;
        var newPopulation1 = [];
        var newPopulation2 = [];
        var i = 0;

        // Elitism
        for(i = 0; i < this.neat1.elitism; i++){
            newPopulation1.push(this.neat1.population[i]);
        }
        for(i = 0; i < this.neat2.elitism; i++){
            newPopulation2.push(this.neat2.population[i]);
        }

        // Breed the next individuals
        for(i = 0; i < this.neat1.popsize - this.neat1.elitism; i++){
            newPopulation1.push(this.neat1.getOffspring());
        }
        for(i = 0; i < this.neat2.popsize - this.neat2.elitism; i++){
            newPopulation2.push(this.neat2.getOffspring());
        }

        // // Replace the old population with the new population
        this.neat1.population = newPopulation1;
        this.neat1.mutate();
        this.neat2.population = newPopulation2;
        this.neat2.mutate();

        this.neat1.generation++;
        this.neat2.generation++;
        this.startEvaluation();
    },
    // return true when done
    tick: function(){
        this.round++;
        if (this.maxRounds>0 && this.round>this.maxRounds) {
            return true;
        }
        MAX_GENERATION_index++;
        var curent_gen = MAX_GENERATION*MAX_GENERATION_index ;
        // while ((!this.run() && this.neat1.generation>=curent_gen) || this.neat1.generation<curent_gen) {
        while ((!this.run(this.neat1.generation>=curent_gen-1) && this.neat1.generation>=curent_gen) || this.neat1.generation<curent_gen) {
            
        }
        // get some output
        console.log(this.round+'/'+this.maxRounds+' X Generation:', this.neat1.generation, '- average score:', Math.round(averageScore1/MAX_GENERATION), '- fittest average score: ', Math.round(fittestAverageScore1/MAX_GENERATION));
        console.log(this.round+'/'+this.maxRounds+' O Generation:', this.neat2.generation, '- average score:', Math.round(averageScore2/MAX_GENERATION), '- fittest average score: ', Math.round(fittestAverageScore2/MAX_GENERATION));
        // reset score tracking
        averageScore1 = 0;
        fittestAverageScore1 = 0;
        averageScore2 = 0;
        fittestAverageScore2 = 0;
        return false;
    },
    run: function(draw){
        // console.log('run');
        // Update and visualise players
        var hadSuccessIteration = false;
        for(var i = 0; i < this.games.length; i++){
            if (!this.games[i].ended) {
                hadSuccessIteration = hadSuccessIteration || this.games[i].tick();
            }
        }
        // Check if evaluation is done
        if(!hadSuccessIteration){
            if(draw) this.draw();
            this.endEvaluation();
            return true;
        }
        return false;
    },
    draw: function(){
        if(this.isInteractive){
            clear();
        }
        var cstr = '';
        for(var ii = 0; ii < this.games.length;){
            var draw_array = ['║ ','║ ','║ ','║ ','║ ','╬═'];
            var str = '';
            for(var jj = ii; jj < ii+15 && jj<this.games.length; jj++){
                for (var i=0;i<3;i++) {
                    str = '';
                    for (var j=0;j<3;j++) {
                        if (this.games[jj].board[j][i]===0) {
                            str+=' ';
                        } else {
                            str+=this.games[jj].board[j][i];
                        }
                        if(j<2) {
                            str+='│';
                        }
                    }
                    draw_array[i*2]+=str;
                }
                draw_array[1]+='─┼─┼─ ║ ';
                draw_array[3]+='─┼─┼─ ║ ';
                draw_array[0]+=' ║ ';
                draw_array[2]+=' ║ ';
                draw_array[4]+=' ║ ';
                draw_array[5]+='══════╬═';
            }
            ii=jj+1;
            if (this.useLogs) {
                cstr = cstr + "\n" + draw_array.join("\n");
            } 
            if(this.isInteractive) {
                console.log(draw_array.join("\n"));
            }
        }
        if (this.useLogs) {
            cstr = '1 X Generation: ' + this.neat1.generation+ ' - average score: ' + Math.round(averageScore1/MAX_GENERATION) + ' - fittest average score: '+ Math.round(fittestAverageScore1/MAX_GENERATION)+"\n"+cstr;
            cstr = '2 X Generation: ' + this.neat2.generation+ ' - average score: ' + Math.round(averageScore2/MAX_GENERATION) + ' - fittest average score: '+ Math.round(fittestAverageScore2/MAX_GENERATION)+"\n"+cstr;
            fs.writeFile("output/run_"+MAX_GENERATION_index+'.log', cstr, function(err) {
                if(err) {
                    console.log(err);
                    throw(err);
                }                    
            });
        }
    },
    // random mutate
    mutate: function(){
        for(var i = 0; i < 100; i++){
            this.neat1.mutate();
            this.neat2.mutate();
        }
    },
    createNeat: function(){
        return new Neat(
            // input 3x3 grid, x/y, represents oponents last move
            2,
            // output 3x3 grid, x/y, represents the move he will make
            2,
            // fitnessFunction
            null,
            {
                mutation: [
                    Methods.mutation.SWAP_NODES,
                    // Methods.mutation.ADD_NODE,
                    // Methods.mutation.SUB_NODE,
                    // Methods.mutation.ADD_CONN,
                    // Methods.mutation.SUB_CONN,
                    Methods.mutation.MOD_WEIGHT,
                    Methods.mutation.MOD_BIAS,
                    Methods.mutation.MOD_ACTIVATION,
                    // Methods.mutation.ADD_GATE,
                    // Methods.mutation.SUB_GATE,
                    // Methods.mutation.ADD_SELF_CONN,
                    // Methods.mutation.SUB_SELF_CONN,
                    // Methods.mutation.ADD_BACK_CONN,
                    // Methods.mutation.SUB_BACK_CONN
                ],
                // how many games to play at the same time
                popsize: SIMULTANIOUS_GAMES_AMOUNT,
                // Sets the mutation rate. If set to 0.3, 30% of the new population will be mutated. Default is 0.3.
                mutationRate: MUTATION_RATE,
                // Sets the elitism of every evolution loop. Default is 0.
                elitism: Math.round(ELITISM_PERCENT * SIMULTANIOUS_GAMES_AMOUNT),
                selection: Methods.selection.FITNESS_PROPORTIONATE,
                // inputSize, hiddenLayers, outputSize, previousInput, previousOutput
                network: this.createNetwork(
                    // inputSize
                    2,
                    // hiddenLayers
                    25,
                    // outputSize
                    2,
                    // previousInput
                    5,// Math.round(Math.round()*20),
                    // previousOutput
                    5// Math.round(Math.round()*20))
                )
                // network: new Architect.Random(
                //     2,
                //     START_HIDDEN_SIZE,
                //     2
                // )
            }
        );
    },
    // new Architect.NARX
    createNetwork: function (inputSize, hiddenLayers, outputSize, previousInput, previousOutput) {
        if (!Array.isArray(hiddenLayers)) {
            hiddenLayers = [hiddenLayers];
        }

        var nodes = [];

        var input = new Layer.Dense(inputSize);
        var inputMemory = new Layer.Memory(inputSize, previousInput);
        var hidden = [];
        var output = new Layer.Dense(outputSize);
        var outputMemory = new Layer.Memory(outputSize, previousOutput);

        nodes.push(input);
        nodes.push(outputMemory);

        for (var i = 0; i < hiddenLayers.length; i++) {
            var hiddenLayer = new Layer.Dense(hiddenLayers[i]);
            hidden.push(hiddenLayer);
            nodes.push(hiddenLayer);
            if (typeof hidden[i - 1] !== 'undefined') {
                hidden[i - 1].connect(hiddenLayer, Methods.connection.ALL_TO_ALL);
            }
        }

        nodes.push(inputMemory);
        nodes.push(output);

        input.connect(hidden[0], Methods.connection.ALL_TO_ALL);
        input.connect(inputMemory, Methods.connection.ONE_TO_ONE, 1);
        inputMemory.connect(hidden[0], Methods.connection.ALL_TO_ALL);
        hidden[hidden.length - 1].connect(output, Methods.connection.ALL_TO_ALL);
        output.connect(outputMemory, Methods.connection.ONE_TO_ONE, 1);
        outputMemory.connect(hidden[0], Methods.connection.ALL_TO_ALL);

        input.set({
            type: 'input'
        });
        output.set({
            type: 'output'
        });

        return Architect.Construct(nodes);
    }
};

module.exports=Evolution;

function clear() {
    console.log('\n'.repeat(process.stdout.rows));
}