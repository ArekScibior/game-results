import { Component, OnInit, ViewChild } from '@angular/core';
import * as _ from 'underscore';
import { MatTableDataSource, MatPaginator, MatSort} from '@angular/material'
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
  display: string;
}

export interface Logos {
  id: number;
  src: string;
}



// SCORE_TABLE = _.chain(SCORE_TABLE).sortBy('points').reverse().each(function(el, idx) {
//   el.position = idx + 1
// }).value()

let scores = {
  'fifa20': 
    [{position: 1, name: 'Hydrogen', points: 15, scored: 15, conceded: 15},
    {position: 2, name: 'Helium', points: 9, scored: 15, conceded: 15},
    {position: 3, name: 'Lithium', points: 9, scored: 15, conceded: 15},
    {position: 4, name: 'Beryllium', points: 5, scored: 15, conceded: 15},
    {position: 2, name: 'Helium', points: 9, scored: 15, conceded: 15},
    {position: 3, name: 'Lithium', points: 9, scored: 15, conceded: 15},
    {position: 4, name: 'Beryllium', points: 5, scored: 15, conceded: 15}],
  'fifa21': 
    [{position: 1, name: 'Hydrogen', points: 15, scored: 15, conceded: 15},
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
    {position: 10, name: 'Neon', points: 21, scored: 15, conceded: 15}],
  'ufc4': 
    [{position: 1, name: 'Hydrogen', points: 15, scored: 15, conceded: 15},
    {position: 2, name: 'Helium', points: 9, scored: 15, conceded: 15},
    {position: 3, name: 'Lithium', points: 9, scored: 15, conceded: 15},
    {position: 4, name: 'Beryllium', points: 5, scored: 15, conceded: 15}]
  
}

const updatePositionAndSort = function(sorted) {
  sorted = _.sortBy(sorted, 'points').reverse()
  _.each(sorted, function(v, idx) {
    v.position = idx + 1
  })
  return sorted
}

const GAMES_TABLE: GamesElement[] = [
  {id: 1, display: 'FIFA 21', name:'fifa21'},
  {id: 2, display: 'FIFA 20', name:'fifa20'},
  {id: 3, display: 'UFC 4', name:'ufc4'},
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
  initialGame = updatePositionAndSort(scores['fifa21'])

  displayedColumns: string[] = ['position', 'name', 'points', 'scored', 'conceded'];
  fullDataSource = JSON.parse(JSON.stringify(this.initialGame))
  dataSource = new MatTableDataSource<ScoreElement>(this.initialGame);
  namesToFilter = _.pluck(this.initialGame, 'name')

  constructor() {}

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
    let gameDataSource = updatePositionAndSort(scores[name])
    this.fullDataSource = JSON.parse(JSON.stringify(gameDataSource))
    this.dataSource = new MatTableDataSource<ScoreElement>(gameDataSource); 
    this.namesToFilter = _.pluck(gameDataSource, 'name')
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
