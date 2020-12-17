import { Component, OnInit, ViewChild } from '@angular/core';
import * as _ from 'underscore';
import { MatTableDataSource, MatPaginator, MatSort} from '@angular/material'
import {MatDialog, MatDialogConfig} from "@angular/material";
import { EntryResultComponent } from '../entry-result/entry-result.component';
import { EntryPlayerComponent } from '../entry-player/entry-player.component';
import * as moment from 'moment';
import * as  dataJSON  from  '../../assets/data.json';
import * as  playersJSON  from  '../../assets/players.json';
import * as  gamesJSON  from  '../../assets/games.json';

export interface ScoreElement {
  name: string;
  position: number;
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  scored: number;
  conceded: number;
  winRate: string;
}

export interface GamesElement {
  id: number;
  name: string;
  display: string;
}

export interface Players {
  id: number;
  name: string;
}

export interface Logos {
  id: number;
  src: string;
  width: number;
  height: number;
}

export interface DialogData {
  nameHome: string;
  nameAway: string;
  scoreHome: number;
  scoreAway: number;
}


//inicjalne zmienne do pobrania danych
let selectedGame  = ""
let SCORES        = [];
let PLAYERS: Players[]
let GAMES_TABLE: GamesElement[]
let LOGO_GAMES: Logos[]

const mapScoreTable = function(scoreTable) {
  scoreTable.sort(function (a, b) {
      return a.points - b.points || a.scored - b.scored;
  }).reverse();

  _.each(scoreTable, function(v, idx) {
    let winRate = 0
    winRate = ((v.wins / v.matches) * 100)
    v.position = idx + 1
    v.winRate = parseFloat(winRate.toFixed(2)) + "%"
    
  })
  return scoreTable
}

let getAllData = function() {
  SCORES = (dataJSON as any).default;
  PLAYERS = (playersJSON as any).default
  GAMES_TABLE = (gamesJSON as any).default;

  LOGO_GAMES = [
    {id: 1, src: "../../assets/fifa21-logo-25.png", "width": 300, "height": 150},
    {id: 2, src: '../../assets/fifa-20-mono-logo.png', "width": 200, "height": 130},
    {id: 3, src: '../../assets/ufc4-logo.png', "width": 300, "height": 110}
  ];
  
  selectedGame = _.first(GAMES_TABLE).id
}
getAllData()

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss']
})
export class MainViewComponent implements OnInit {
  @ViewChild(MatPaginator, null) paginator: MatPaginator;
  @ViewChild(MatSort, null) sort: MatSort;
 
  // initial variables
  searchValue   = ""
  idInterval    = null
  timestamp     = moment().format('YYYY.MM.DD HH:mm:ss')

  logo          = LOGO_GAMES[0]
  logosSource   = LOGO_GAMES;

  gamesSource   = GAMES_TABLE;
  selectedGame  = selectedGame;
  initSelectedGameName = _.findWhere(this.gamesSource, {id: selectedGame})

  //definicja kolumn dla tabeli z wynikami oraz init gry na fifa21
  initialGame = mapScoreTable(SCORES['fifa21'])

  displayedColumns: string[] = ['position', 'name', 'matches', 'wins', 'losses', 'draws', 'winRate', 'points', 'scored', 'conceded'];
  fullDataSource = JSON.parse(JSON.stringify(this.initialGame))
  dataSource = new MatTableDataSource<ScoreElement>(this.initialGame);
  namesToFilter = _.pluck(this.initialGame, 'name')

  constructor( public dialog: MatDialog) {}

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.idInterval = setInterval(() => {
      this.timestamp = moment(this.timestamp, 'YYYY.MM.DD HH:mm:ss').add(1, 's').format('YYYY.MM.DD HH:mm:ss')
    }, 1000);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy() {
    if (this.idInterval) {
      clearInterval(this.idInterval);
    }
  }

  filterPlayers(value) {
    let filtered = _.filter(this.fullDataSource, function(v) { return v.name.toLowerCase().indexOf(value.toLowerCase()) != -1})
    this.dataSource = new MatTableDataSource<ScoreElement>(filtered);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  updateScoreTable(scoretable) {
    let gameDataSource = mapScoreTable(scoretable)
    this.fullDataSource = JSON.parse(JSON.stringify(gameDataSource))
    this.dataSource = new MatTableDataSource<ScoreElement>(gameDataSource); 
    this.namesToFilter = _.pluck(gameDataSource, 'name')
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  gameChanged(val) {
    this.logo = _.findWhere(this.logosSource, {id: val})
    let name = _.findWhere(this.gamesSource, {id: val}).name
    let gameDataSource = mapScoreTable(SCORES[name])
    this.fullDataSource = JSON.parse(JSON.stringify(gameDataSource))
    this.dataSource = new MatTableDataSource<ScoreElement>(gameDataSource); 
    this.namesToFilter = _.pluck(gameDataSource, 'name')
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  addScore(score) {
    let rawData = this.dataSource.filteredData

    if (score.player1Score > score.player2Score) {
      let winner = _.findWhere(rawData, {name: score.player1})
      winner.matches = winner.matches + 1
      winner.wins = winner.wins + 1
      winner.points = winner.points + 3
      winner.scored = winner.scored + score.player1Score
      winner.conceded = winner.conceded + score.player2Score

      let looser = _.findWhere(rawData, {name: score.player2})
      looser.matches = looser.matches + 1
      looser.losses = looser.losses + 1
      looser.scored = looser.scored + score.player2Score
      looser.conceded = looser.conceded + score.player1Score

    } else if (score.player1Score < score.player2Score) {
      let winner = _.findWhere(rawData, {name: score.player2})
      winner.matches = winner.matches + 1
      winner.wins = winner.wins + 1
      winner.points = winner.points + 3
      winner.scored = winner.scored + score.player2Score
      winner.conceded = winner.conceded + score.player1Score

      let looser = _.findWhere(rawData, {name: score.player1})
      looser.matches = looser.matches + 1
      looser.losses = looser.losses + 1
      looser.scored = looser.scored + score.player1Score
      looser.conceded = looser.conceded + score.player2Score
    } else if (score.player1Score === score.player2Score) {
      let player1 = _.findWhere(rawData, {name: score.player1})
      player1.matches = player1.matches + 1
      player1.draws = player1.draws + 1
      player1.points = player1.points + 1
      player1.scored = player1.scored + score.player1Score
      player1.conceded = player1.conceded + score.player2Score

      let player2 = _.findWhere(rawData, {name: score.player2})
      player2.matches = player2.matches + 1
      player2.draws = player2.draws + 1
      player2.points = player2.points + 1
      player2.scored = player2.scored + score.player2Score
      player2.conceded = player2.conceded + score.player1Score

    }
    this.updateScoreTable(rawData)

  }

  openEntryScoreModal(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.minWidth = '700px';
    dialogConfig.position = {
      top: '15%',
      left: '35%'
    };
    dialogConfig.data = {
      'game': _.findWhere(this.gamesSource, {id: this.selectedGame}),
      'playerList': _.pluck(PLAYERS, 'name'),
      'dataScore': {}
    }

    
    const dialogRef = this.dialog.open(EntryResultComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.addScore(data.dataScore)
      }
    });
  }

  openEntryPlayerModal(): void {
    const dialogConfig = new MatDialogConfig();
  
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.minWidth = '1200px';
    dialogConfig.position = {
      top: '15%',
      left: '20%'
    };
    dialogConfig.data = {
      'dataPlayer': {}
    }
  
    
    const dialogRef = this.dialog.open(EntryPlayerComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(data => {
      console.log('data', data)
    });
  }
  
}

