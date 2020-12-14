import { Component, OnInit, ViewChild } from '@angular/core';
import * as _ from 'underscore';
import { MatTableDataSource, MatPaginator } from '@angular/material'
import { interval } from 'rxjs';
import * as moment from 'moment';

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
}

export interface Logos {
  id: number;
  src: string;
}

let SCORE_TABLE: ScoreElement[] = [
  {position: 1, name: 'Hydrogen', points: 15, scored: 15, conceded: 15},
  {position: 2, name: 'Helium', points: 9, scored: 15, conceded: 15},
  {position: 3, name: 'Lithium', points: 9, scored: 15, conceded: 15},
  {position: 4, name: 'Beryllium', points: 5, scored: 15, conceded: 15},
  {position: 5, name: 'Boron', points: 0, scored: 15, conceded: 15},
  {position: 6, name: 'Carbon', points: 11, scored: 15, conceded: 15},
  {position: 7, name: 'Nitrogen', points: 23, scored: 15, conceded: 15},
  {position: 8, name: 'Oxygen', points: 13, scored: 15, conceded: 15},
  {position: 9, name: 'Fluorine', points: 28, scored: 15, conceded: 15},
  {position: 10, name: 'Neon', points: 21, scored: 15, conceded: 15},
  {position: 1, name: 'Hydrogen', points: 15, scored: 15, conceded: 15},
  {position: 2, name: 'Helium', points: 9, scored: 15, conceded: 15},
  {position: 3, name: 'Lithium', points: 9, scored: 15, conceded: 15},
  {position: 4, name: 'Beryllium', points: 5, scored: 15, conceded: 15},
  {position: 5, name: 'Boron', points: 0, scored: 15, conceded: 15},
  {position: 6, name: 'Carbon', points: 11, scored: 15, conceded: 15},
  {position: 7, name: 'Nitrogen', points: 23, scored: 15, conceded: 15},
  {position: 8, name: 'Oxygen', points: 13, scored: 15, conceded: 15},
  {position: 9, name: 'Fluorine', points: 28, scored: 15, conceded: 15},
  {position: 10, name: 'Neon', points: 21, scored: 15, conceded: 15},
];

SCORE_TABLE = _.chain(SCORE_TABLE).sortBy('points').reverse().each(function(el, idx) {
  el.position = idx + 1
}).value()

const GAMES_TABLE: GamesElement[] = [
  {id: 1, name: 'FIFA 21'},
  {id: 2, name: 'FIFA 20'},
  {id: 3, name: 'UFC 4'},
];

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
  // initial variables
  idInterval    = null
  timestamp     = moment().format('YYYY.MM.DD HH:mm:ss')

  fifa21Logo    = LOGO_GAMES[0]
  fifa20Logo    = LOGO_GAMES[1]
  ufc4Logo      = LOGO_GAMES[2]
  logosSource   = LOGO_GAMES;

  gamesSource   = GAMES_TABLE;
  selectedGame  = selectedGame;

  //definicja kolumn dla tabeli z wynikami
  displayedColumns: string[] = ['position', 'name', 'points', 'scored', 'conceded'];
  fullDataSource = JSON.parse(JSON.stringify(SCORE_TABLE))
  dataSource = new MatTableDataSource<ScoreElement>(SCORE_TABLE); 
  namesToFilter = _.pluck(SCORE_TABLE, 'name')

  constructor() {}

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.idInterval = setInterval(() => {
      this.timestamp = moment(this.timestamp, 'YYYY.MM.DD HH:mm:ss').add(1, 's').format('YYYY.MM.DD HH:mm:ss')
    }, 1000);
  }
  
  ngOnDestroy() {
    if (this.idInterval) {
      clearInterval(this.idInterval);
    }
  }

  filterPlayers(value) {
    this.dataSource = _.filter(this.fullDataSource, function(v) { return v.name.toLowerCase().indexOf(value.toLowerCase()) != -1})
    console.log('filtered players: ', this.dataSource)
  }
}
