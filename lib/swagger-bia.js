module.exports = function(app, params) {    
    const swaggerUi = require('swagger-ui-express')
    const config = require('./config');
    const fs = require('fs')
    //..######...#######..##.....##.########..####.##....##.########
    //.##....##.##.....##.###...###.##.....##..##..###...##.##......
    //.##.......##.....##.####.####.##.....##..##..####..##.##......
    //.##.......##.....##.##.###.##.########...##..##.##.##.######.. REFS
    //.##.......##.....##.##.....##.##.....##..##..##..####.##......
    //.##....##.##.....##.##.....##.##.....##..##..##...###.##......
    //..######...#######..##.....##.########..####.##....##.########

    //let startYaml = config.swaggerBia.apiDocsPath + '/' + config.swaggerBia.startYaml
    
    //let combineFile = fs.readFileSync(config.swaggerBia.apiDocsPath + '/' + config.swaggerBia.combineYaml, {encoding: 'utf-8'})

    let swaggerDocs
    switch(params.type){
        case 'json':
            //.##....##....###....##.....##.##...............##..........##..######...#######..##....##
            //..##..##....##.##...###...###.##................##.........##.##....##.##.....##.###...##
            //...####....##...##..####.####.##.................##........##.##.......##.....##.####..##
            //....##....##.....##.##.###.##.##.......#######....##.......##..######..##.....##.##.##.##
            //....##....#########.##.....##.##.................##..##....##.......##.##.....##.##..####
            //....##....##.....##.##.....##.##................##...##....##.##....##.##.....##.##...###
            //....##....##.....##.##.....##.########.........##.....######...######...#######..##....##
            let inputfile = config.swaggerBia.apiDocsPath + '/' + config.swaggerBia.startYaml
            //var outputfile = config.swaggerBia.apiDocsPath + '/' + config.swaggerBia.endJson,
            yaml = require('js-yaml'),
            
            swaggerJson = yaml.load(fs.readFileSync(inputfile, {encoding: 'utf-8'}));
            // * this code if you want to save
            // TODO: nodemon add ignore file
            //fs.writeFileSync(outputfile, JSON.stringify(swaggerJson, null, 2));
            swaggerDocs = swaggerJson
        break;
        default:
            //.......##..######..########...#######...######.
            //.......##.##....##.##.....##.##.....##.##....##
            //.......##.##.......##.....##.##.....##.##......
            //.......##..######..##.....##.##.....##.##......
            //.##....##.......##.##.....##.##.....##.##......
            //.##....##.##....##.##.....##.##.....##.##....##
            //..######...######..########...#######...######.
            const swaggerJsDoc = require('swagger-jsdoc')
            swaggerDocs = swaggerJsDoc(config.swagerOptions)
    }
    function replaceRef(input){
        fs.readFileSync(inputfile, {encoding: 'utf-8'})
      }
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, config))
    return app
  };
