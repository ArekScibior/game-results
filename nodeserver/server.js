var http = require('http');
var fs = require('fs');
var _ = require('underscore');
var moment = require('moment')
var url = require('url');
var port = 8081;
var convertToDate = function (date, time) {
    var date = date;
    var time = time;
    var fulldate = date.concat(time)
    var dd = fulldate.slice(0,2)
    var mm = fulldate.slice(3,5)
    mm = Number(mm) - 1
    var yyyy = fulldate.slice(6,10) 
    var h = fulldate.slice(10,12)
    var m = fulldate.slice(13,15)
    var s = fulldate.slice(16,18)

    var currentDate = new Date(yyyy, mm, dd, h, m, s)
    return currentDate;
}

var getFunctionParameter = function (urlStr) {
    return url.parse(urlStr, true).query['FUNCTION'];
};

function getFileData(filename) {
    return JSON.parse(fs.readFileSync(filename, "utf-8"));
}

function saveFile(data, filename,callback) {
    fs.writeFile("" + filename, JSON.stringify(data), function (err) {
        if (err) {
            console.log('error', err);
            if (callback) callback(false);
        } else {
            console.log('save done');
            if (callback) callback(true);
        }
    });
}
function writeResponse(response, result, code) {
    var delay = _.random(0, 1000);
    setTimeout(function() {
        if (!code) code = 200;
        response.writeHeader(code, {'Access-Control-Allow-Origin': '*','Access-Control-Allow-Headers': 'X-PINGOTHER,content-type',
            'Content-Type': "application/json; charset=utf-8"
        });
        if (result) response.write(JSON.stringify(result));
        response.end();
    },delay)
}


function handleRequest(req, body, res) {
    //do stuff and write response
    //console.log('handle request:',body);
    var param = getFunctionParameter(req.url);
    console.log('param', param);
    if (!param) {
        res.write('404');
        res.end();
        return;
    }

    //console.log(data);
    if (handlers[param]) {
        console.log('handler ok', param);

        handlers[param](res, param,body);
    } else {
        console.log('missing handler');
        var filename = param + '.json';
        try {
            var data = getFileData(filename);

            writeResponse(res, data);
        } catch (err) {
            writeResponse(res, err, 404);
        }
    }
}

var server = function (req, response) {
    console.log('**********************************************************');
    var body = [];
    //console.log('response',req);
    if (req.method == "OPTIONS"){
        writeResponse(response,undefined);
        return;
     }
    
    req.on('error', function (err) {
        console.log('response', response)
        response.statusCode = 400;
        response.setHeader('Content-Type', 'application/json');
        response.write(JSON.stringify('{"error":"error"}'));
        console.log('err', err);
        response.end();
    }).on('data', function (chunk) {
        body.push(chunk);
    }).on('end', function () {
        body = Buffer.concat(body).toString();
        try {
            body = JSON.parse(body)
            handleRequest(req, body, response);
        } catch (err) {
            response.statusCode = 400;
            response.setHeader('Content-Type', 'application/json');
            response.write(JSON.stringify('{"error":"bad request"}'));
            console.log('err', err);
            response.end();
        }
    });
};

http.createServer(server).listen(port);
console.log('Node Server running on ', port);

function handleDeleteScore(res, param, body) {
    var filename = "Z_DATA_SCORE_GET" + '.json';
    var dataScore = getFileData(filename).data;
    var data = getFileData(filename);
    var game = body.game.name
    var dataScoreOmited = _.omit(dataScore,[game])
    dataScoreOmited[game] = []
    data.data = dataScoreOmited

    function callback(isOk){
        if (isOk) writeResponse(res, {status:{status_code:"S",status: "Poprawnie usunięto dane dla wybranej gry."}, dataScore: data.data});    
        else writeResponse(res, {status:{status_code:"E",status: "Niestety nie udało się usunąć danych."}});    
    }
    saveFile(data,filename,callback);
}


function handleDataScoreGet(res) {
    var filename = "Z_DATA_SCORE_GET" + '.json';
    var data = getFileData(filename).data;
    writeResponse(res,data);
}

function handleDataScoreSet(res, param, body) {
    var filename = "Z_DATA_SCORE_GET" + '.json';
    var dataScore = getFileData(filename).data;
    var data = getFileData(filename);
    var score = body.score
    var game = body.game
    console.log(score, game)
    if(score) {
        let rawData = _.find(dataScore, function(v, idx) {
            return idx == game
        })
        let clearPlayer1 = {
            "conceded": 0,
            "draws": 0,
            "losses": 0,
            "matches": 0,
            "name": score.player1,
            "points": 0,
            "position": 0,
            "scored": 0,
            "wins": 0
        }
        let clearPlayer2 = {
            "conceded": 0,
            "draws": 0,
            "losses": 0,
            "matches": 0,
            "name": score.player2,
            "points": 0,
            "position": 0,
            "scored": 0,
            "wins": 0
        }

        if (score.player1Score > score.player2Score) {
            let winner = {}
            if (_.isEmpty(rawData)) { 
                winner = clearPlayer1 
            } else {
                if (_.isEmpty(_.findWhere(rawData, {name: score.player1}))) {  winner = clearPlayer1  } else { winner = _.findWhere(rawData, {name: score.player1}) }
            }

            winner.matches = winner.matches + 1
            winner.wins = winner.wins + 1
            winner.points = winner.points + 3
            winner.scored = winner.scored + score.player1Score
            winner.conceded = winner.conceded + score.player2Score

            let looser = {}
            if (_.isEmpty(rawData)) { 
                looser = clearPlayer2 
            } else {
                if (_.isEmpty(_.findWhere(rawData, {name: score.player2}))) {  looser = clearPlayer2  } else { looser = _.findWhere(rawData, {name: score.player2}) }
            }
            looser.matches = looser.matches + 1
            looser.losses = looser.losses + 1
            looser.scored = looser.scored + score.player2Score
            looser.conceded = looser.conceded + score.player1Score

            if (_.isEmpty(_.findWhere(rawData, {name: score.player1}))) { rawData.push(winner)}
            if (_.isEmpty(_.findWhere(rawData, {name: score.player2}))) { rawData.push(looser)}

        } else if (score.player1Score < score.player2Score) {
            let winner = {}
            if (_.isEmpty(rawData)) { 
                winner = clearPlayer2 
            } else {
                if (_.isEmpty(_.findWhere(rawData, {name: score.player2}))) {  winner = clearPlayer2  } else { winner = _.findWhere(rawData, {name: score.player2}) }
            }

            winner.matches = winner.matches + 1
            winner.wins = winner.wins + 1
            winner.points = winner.points + 3
            winner.scored = winner.scored + score.player2Score
            winner.conceded = winner.conceded + score.player1Score

            let looser = {}
            if (_.isEmpty(rawData)) { 
                looser = clearPlayer1 
            } else {
                if (_.isEmpty(_.findWhere(rawData, {name: score.player1}))) {  looser = clearPlayer1  } else { looser = _.findWhere(rawData, {name: score.player1}) }
            }
            looser.matches = looser.matches + 1
            looser.losses = looser.losses + 1
            looser.scored = looser.scored + score.player1Score
            looser.conceded = looser.conceded + score.player2Score

            if (_.isEmpty(_.findWhere(rawData, {name: score.player2}))) { rawData.push(winner)}
            if (_.isEmpty(_.findWhere(rawData, {name: score.player1}))) { rawData.push(looser)}

        } else if (score.player1Score === score.player2Score) {
            let player1 = {}
            if (_.isEmpty(rawData)) { 
                player1 = clearPlayer1 
            } else {
                if (_.isEmpty(_.findWhere(rawData, {name: score.player1}))) {  player1 = clearPlayer1  } else { player1 = _.findWhere(rawData, {name: score.player1}) }
            }
            player1.matches = player1.matches + 1
            player1.draws = player1.draws + 1
            player1.points = player1.points + 1
            player1.scored = player1.scored + score.player1Score
            player1.conceded = player1.conceded + score.player2Score

            let player2 = {}
            if (_.isEmpty(rawData)) { 
                player2 = clearPlayer2
            } else {
                if (_.isEmpty(_.findWhere(rawData, {name: score.player2}))) {  player2 = clearPlayer2  } else { player2 = _.findWhere(rawData, {name: score.player2}) }
            }
            player2.matches = player2.matches + 1
            player2.draws = player2.draws + 1
            player2.points = player2.points + 1
            player2.scored = player2.scored + score.player2Score
            player2.conceded = player2.conceded + score.player1Score

            if (_.isEmpty(_.findWhere(rawData, {name: score.player1}))) { rawData.push(player1)}
            if (_.isEmpty(_.findWhere(rawData, {name: score.player2}))) { rawData.push(player2)}
        }
        var dataScoreOmited = _.omit(dataScore,[game])
        dataScoreOmited[game] = rawData
        data.data = dataScoreOmited
    }
    
    updateMatches = function() {
        var filename = "Z_DATA_MATCHES_GET" + '.json';
        var dataMatches = getFileData(filename)
        var matches = getFileData(filename).data[game];
        var object = {
            date: moment().format('YYYY.MM.DD'),
            player1: score.player1,
            player2: score.player2,
            player1Score: score.player1Score,
            player2Score: score.player2Score
        }
        matches.push(object)
        var dataMatchesOmited = _.omit(getFileData(filename).data,[game])
        dataMatchesOmited[game] = matches
        dataMatches.data = dataMatchesOmited
        console.log('newFile',dataMatches)
        saveFile(dataMatches,filename);
        return dataMatches
    }

    function callback(isOk){
        if (isOk) {
            updateMatches();
            writeResponse(res, {status:{status_code:"S",status: "Poprawnie dodano wynik."}, dataScore: data.data});
        } else {
            writeResponse(res, {status:{status_code:"E",status: "Niestety nie udało się dodać wyniku."}});       
        }
    }
    saveFile(data,filename,callback);
}

function handleDataPlayersGet(res) {
    var filename = 'Z_DATA_PLAYERS_GET' + '.json';
    var data = getFileData(filename).data;
    writeResponse(res,data);
}

function handleDataPlayersSet(res, param, body) {
    var filename = "Z_DATA_PLAYERS_GET" + '.json';
    var dataFile = getFileData(filename);
    var dataPlayers = dataFile.data
    var player = body.dataPlayer
    
    if (player) {
        var exist = _.find(dataPlayers, function(v) {
            return v.name == player.name && v.age == player.age
        })
        if (exist) {
            writeResponse(res, {status:{status_code:"E",status: "Wpisany gracz istnieje już w systemie."}}); 
            return
        }
        playerMapped = {
            id: dataPlayers.length + 1,
            name: player.name,
            age: player.age,
            favouriteClub: player.favouriteClub
        }
        dataPlayers.push(playerMapped)
        var newFile = _.omit(getFileData(filename),'data')
        newFile.data = dataPlayers
        dataFile = newFile
    }

    updateScoreTable = function() {
        var filenameScore = "Z_DATA_SCORE_GET" + '.json';
        var dataScore = getFileData(filenameScore).data;
        _.each(dataScore, function(el) {
            var emptyObject = {
                conceded: 0,
                draws: 0,
                losses: 0,
                matches: 0,
                name: player.name,
                points: 0,
                position: 0,
                scored: 0,
                wins: 0
            }
            el.push(emptyObject)
        })
        var newFile = _.omit(getFileData(filenameScore),'data')
        newFile.data = dataScore
        saveFile(newFile,filenameScore);
        return newFile
    }
    function callback(isOk){
        var filenamePlayers = "Z_DATA_PLAYERS_GET" + '.json';
        var dataPlayers = getFileData(filenamePlayers).data;

        if (isOk) {
            var newFile = updateScoreTable();
            writeResponse(res, {status:{status_code:"S",status: "Poprawnie dodano gracza."}, dataPlayers: dataPlayers, dataScore: newFile.data}); 
        } else {
            writeResponse(res, {status:{status_code:"E",status: "Niestety nie udało się dodać gracza."}}); 
        }   
    }
    saveFile(dataFile,filename,callback);
}

function handleDataGamesGet(res) {
    var filename = 'Z_DATA_GAMES_GET' + '.json';
    var data = getFileData(filename).data;
    console.log(data)
    writeResponse(res,data);
}

var handlers = {
    Z_DATA_SCORE_GET:handleDataScoreGet,
    Z_DATA_SCORE_SET:handleDataScoreSet,
    Z_DATA_PLAYERS_GET:handleDataPlayersGet,
    Z_DATA_PLAYERS_SET:handleDataPlayersSet,
    Z_DATA_GAMES_GET:handleDataGamesGet,
    Z_DELETE_SCORE:handleDeleteScore
};