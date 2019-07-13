var neataptic = require('./libs/neataptic');
var Game = require('./js/game');
var Evolution = require('./js/evolution');
var Player = require('./js/player');

var evo;

var readline = require('readline');

/** Setup the canvas */
function setup(interactive, limit, generationsPerRun){
    var rl;
    if (interactive) {
        console.log('\n'.repeat(process.stdout.rows));
        console.log('\033[2J');
        rl = readline.createInterface(process.stdin, process.stdout);
        rl.setPrompt(
            '┏'+'━'.repeat(maxLogLength)+'┓'+"\n"+
            prepareLog(' c', 'continue')+"\n"+
            prepareLog(' w', 'write log')+"\n"+
            prepareLog(' x,q', 'quit')+"\n"+
            '┗'+'━'.repeat(maxLogLength)+'┛'+"\n"+
            'What do you want to do?> ');
        rl.on('line', function(line) {
            console.log('\n'.repeat(process.stdout.rows));
            console.log('\033[2J');
            switch(line){
                case 'c':
                    evo.tick();
                break;
                case 'w':
                    evo.saveEvolution();
                    console.log('Evolution saved');
                break;
                case 'x':
                case 'q':
                    console.log('ByBy');
                    process.exit(0);
                break;
                default:
                    console.log('invalid input');
                break;
            }
            rl.prompt();
        }).on('close',function(){
            process.exit(0);
        });
    }
    // setup evolution
    evo = new Evolution(interactive, limit, generationsPerRun);
    evo.startEvaluation();
    if (interactive) {
        // start point
        rl.prompt();
    } else {
        endlessRun();
    }
}

function endlessRun() {
    // if it's done
    if(evo.tick()) {
        evo.saveEvolution();
    } else {
        endlessRun();
    }
}

var maxLogCol1Length = 30;
var maxLogLength = 100;
function log(str1, str2) {
    console.log(prepareLog(str1,str2?str2:''));
}
function prepareLog(str1,str2){
    if (str2=='') {
        return "┃"+str1+" ".repeat(maxLogLength-str1.length)+"┃";
    }
    return "┃"+str1 + " ".repeat(maxLogCol1Length-str1.length)+ ' '+str2+' '.repeat(maxLogLength-maxLogCol1Length-1-str2.length)+'┃';
}

var cmd = process.argv[2] ? process.argv[2] : '';
var limit = process.argv[3] ? process.argv[3] : '';
var generationsPerRun = process.argv[4] ? process.argv[4] : '';
generationsPerRun = (generationsPerRun && generationsPerRun!='' && generationsPerRun!='0' && !isNaN(generationsPerRun*1)) ? generationsPerRun*1 : 100;
switch(cmd) {
    case 'i':
    case 'intercative':
        setup(true, false, generationsPerRun);
    break;
    case 'e':
    case 'endless':
        limit = (limit && limit!='' && limit!='0' && !isNaN(limit*1)) ? limit*1 : false;
        setup(false, limit, generationsPerRun);
    break;
    case 'h':
    case 'help':
    default:
        console.log('┏'+'━'.repeat(maxLogLength)+'┓');
        log("Available commands:","");
        console.log('┠'+'─'.repeat(maxLogLength)+'┨');
        log("help, h", 'this screen');
        log("intercative, i", 'intercative mode where you go line by line');
        log("endless, e", 'where it goes forever');
        console.log('┠'+'─'.repeat(maxLogLength)+'┨');
        log("Options (in this order)","");
        console.log('┠'+'─'.repeat(maxLogLength)+'┨');
        log("number of max iterations","0 or empty for infinit");
        log("number of generations/run","default 100 - total = iterations * generations");
        console.log('┣'+'━'.repeat(maxLogLength)+'┫');
        console.log('┣'+'━'.repeat(maxLogLength)+'┫');
        log("Examples","");
        console.log('┠'+'─'.repeat(maxLogLength)+'┨');
        log("node index.js help","");
        log("node index.js interactive","");
        log("node index.js endless 100","");
        log("node index.js endless 100 100","");
        console.log('┗'+'━'.repeat(maxLogLength)+'┛');
    break;
}
