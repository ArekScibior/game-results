import { Component, OnInit, ViewChild } from '@angular/core';
import * as _ from 'underscore';
import { MatTableDataSource, MatPaginator, MatSort} from '@angular/material'
import {MatDialog, MatDialogConfig} from "@angular/material";
import { DialogOverviewComponent } from '../dialogOverview/dialogOverview.component';
import * as moment from 'moment';
import * as  dataJSON  from  '../../assets/data.json';
import * as  playersJSON  from  '../../assets/players.json';
import * as  gamesJSON  from  '../../assets/games.json';

export interface ScoreElement {
  name: string;
  position: number;
  points: number;
  scored: number;
  conceded: number;
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
}

export interface DialogData {
  nameHome: string;
  nameAway: string;
  scoreHome: number;
  scoreAway: number;
}

let SCORES = (dataJSON as any).default;

const updatePositionAndSort = function(sorted) {
  sorted = _.sortBy(sorted, 'points').reverse()
  _.each(sorted, function(v, idx) {
    v.position = idx + 1
  })
  return sorted
}

const PLAYERS: Players[] = (playersJSON as any).default
const GAMES_TABLE: GamesElement[] = (gamesJSON as any).default;

const LOGO_GAMES: Logos[] = [
  {id: 1, src: "../../assets/fifa21-logo-25.png"},
  {id: 2, src: '../../assets/fifa-20-mono-logo.png'},
  {id: 3, src: '../../assets/ufc4-logo.png'}
];

let selectedGame = _.first(GAMES_TABLE).id

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss']
})
export class MainViewComponent implements OnInit {
  @ViewChild(MatPaginator, null) paginator: MatPaginator;
  @ViewChild(MatSort, null) sort: MatSort;
 
  // initial variables
  idInterval    = null
  timestamp     = moment().format('YYYY.MM.DD HH:mm:ss')

  fifa21Logo    = LOGO_GAMES[0]
  fifa20Logo    = LOGO_GAMES[1]
  ufc4Logo      = LOGO_GAMES[2]
  logosSource   = LOGO_GAMES;

  gamesSource   = GAMES_TABLE;
  selectedGame  = selectedGame;
  initSelectedGameName = _.findWhere(this.gamesSource, {id: selectedGame})

  //definicja kolumn dla tabeli z wynikami oraz init gry na fifa21
  initialGame = updatePositionAndSort(SCORES['fifa21'])

  displayedColumns: string[] = ['position', 'name', 'points', 'scored', 'conceded'];
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

  gameChanged(val) {
    let name = _.findWhere(this.gamesSource, {id: val}).name
    let gameDataSource = updatePositionAndSort(SCORES[name])
    this.fullDataSource = JSON.parse(JSON.stringify(gameDataSource))
    this.dataSource = new MatTableDataSource<ScoreElement>(gameDataSource); 
    this.namesToFilter = _.pluck(gameDataSource, 'name')
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  openEntryModal(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.minWidth = '700px';
    dialogConfig.position = {
      'top': '15%',
      left: '35%'
    };
    dialogConfig.data = {
      'playerList': _.pluck(PLAYERS, 'name'),
      'dataScore': {}
    }

    const dialogRef = this.dialog.open(DialogOverviewComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(data => {
      console.log('data', data)
    });
}
}
