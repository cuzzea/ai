
var Layer   = neataptic.Layer;
var Neat    = neataptic.Neat;
var Methods = neataptic.methods;
var Config  = neataptic.Config;
var Architect = neataptic.architect;

var WIDTH                               = $('#field').width();
var HEIGHT                              = 1200;
var MAX_ROUNDS                          = 100;
var SIMULTANIOUS_GAMES_AMOUNT           = 47;
// Sets the mutation rate. If set to 0.3, 30% of the new population will be mutated. Default is 0.3.
var MUTATION_RATE                       = 0.3;
// Sets the elitism of every evolution loop. Default is 0.
// Elitism involves copying a small proportion of the fittest candidates, unchanged, into the next generation.
var ELITISM_PERCENT                     = 0.1;
// Max iterations, if it takes longer stop it
var ITERATIONS                          = 100;
var START_HIDDEN_SIZE = 5;

var evo;
var paused=false;

/** Setup the canvas */
function setup(){
    console.log('start');
    // on space draw a frame (call draw function)
    $('body').keyup(function(e){
        if(e.keyCode == 32){
            console.log('Starting');
            redraw();
            paused=!paused;
        }
    });
    // setup canvas
    var canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent('field');
    background(255);
    stroke(0);
    fill(255);
    // setup evolution
    evo = new Evolution();
    evo.startEvaluation();

    // pause game
    noLoop();
}
function draw() {
    // console.log('frame');
    evo.tick();
}
function normalize(x) {
    return x>=1?2 : (x<0?0: (Math.floor(x*3)));
}
