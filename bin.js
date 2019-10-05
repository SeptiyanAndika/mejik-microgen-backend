const program = require('commander');
const generate = require('index.js');

program
    .command('generate') // sub-command name
    .alias('gen') // alternative sub-command is `al`
    .description('Generate project') // command description

    // function to execute when command is uses
    .action(function () {
        generate();
    });

program
    .command('version') // sub-command name
    .alias('-v') // alternative sub-command is `al`
    .description('Version') // command description

    // function to execute when command is uses
    .action(function () {
        console.log('0.0.1')
    });


// allow commander to parse `process.argv`
program.parse(process.argv);