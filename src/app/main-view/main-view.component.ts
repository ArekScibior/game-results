import { Component, OnInit, ViewChild, Inject, HostListener } from '@angular/core';
import { forkJoin } from 'rxjs';
import * as _ from 'underscore';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material'
import { MatDialog, MatDialogConfig } from "@angular/material";
import { EntryResultComponent } from '../entry-result/entry-result.component';
import { EntryPlayerComponent } from '../entry-player/entry-player.component';
import { H2HComponent } from '../h2h/h2h.component';
import { DataproviderService } from '../common/dataprovider.service';
import { StorageCommonsService } from '../common/storage-commons.service';
import { ConfirmModalComponent } from '../common/confirm-modal/confirm-modal.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

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
  winRate: number;
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
let selectedGame = ""
let LOGO_GAMES: Logos[]

const mapScoreTable = (scoreTable) => {
  scoreTable.sort((a, b) => {
    return a.points - b.points || a.scored - b.scored;
  }).reverse();

  _.each(scoreTable, (v, idx) => {
    let winRate = 0
    if (v.matches == 0) {
      winRate = 0
    } else {
      winRate = ((v.wins / v.matches) * 100)
    }
    v.position = idx + 1
    v.winRate = parseFloat(winRate.toFixed(2))

  })
  return scoreTable
}

LOGO_GAMES = [
  { id: 1, src: "../../assets/fifa21-logo-25-white.png", "width": 270, "height": 75 },
  { id: 2, src: '../../assets/fifa-20-mono-logo-white.png', "width": 270, "height": 75 }
];

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss']
})
export class MainViewComponent implements OnInit {
  //dla wtajemniczonych
  cheatIndex = 0;
  cheat = [105, 100, 100, 113, 100];
  timeoutPromise
  bodyKeypress = (event) => {
    this.timeoutPromise = setTimeout(() => { _.identity, 0 });
    if (event.which === this.cheat[this.cheatIndex]) {
      clearTimeout(this.timeoutPromise);
      this.timeoutPromise = setTimeout(() => { this.cheatIndex = 0; }, 3000);
      this.cheatIndex = this.cheatIndex + 1;
      if (this.cheatIndex === this.cheat.length) {
        this.invisible = true;
      }
    } else {
      clearTimeout(this.timeoutPromise);
      this.cheatIndex = 0;
    }
  }

  @ViewChild(MatPaginator, null) paginator: MatPaginator;
  @ViewChild(MatSort, null) sort: MatSort;
  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.bodyKeypress(event)
  }
  constructor(
    breakpointObserver: BreakpointObserver,
    public toastr: ToastrService,
    public dataprovider: DataproviderService,
    public dialog: MatDialog,
    public store: StorageCommonsService
  ) {
    breakpointObserver.observe([
      Breakpoints.HandsetLandscape,
      Breakpoints.HandsetPortrait
    ]).subscribe(result => {
      if (result.matches) {
        this.displayedColumns = ['position', 'name', 'points'];
      }
    });
  }
  // initial variables
  searchValue = ""
  idInterval = null
  timestamp = moment().format('YYYY.MM.DD HH:mm:ss')
  loading = false;
  invisible = false;

  logo = LOGO_GAMES[0]
  logosSource = LOGO_GAMES;
  gamesSource = [];
  selectedGame = selectedGame;
  initSelectedGameName = _.findWhere(this.gamesSource, { id: selectedGame })

  //definicja kolumn dla tabeli z wynikami oraz init gry na fifa21
  initialGame = {}
  scores = [];
  players = [];
  displayedColumns: string[] = ['position', 'name', 'matches', 'wins', 'losses', 'draws', 'winRate', 'points', 'scored', 'conceded'];
  fullDataSource = [];
  dataSource = new MatTableDataSource<ScoreElement>();
  namesToFilter = []

  dataLoadedCallback(data) {
    if (data.players) { this.players = data.players }
    this.scores = data.scores

    let updateAllData = this.store.get('allData')
    updateAllData[0] = this.scores
    updateAllData[2] = this.players
    this.store.set('allData', updateAllData)
    this.store.set('players', this.players)

    let initialGame = mapScoreTable(this.scores['fifa21'])
    this.store.set('score', this.scores)
    this.fullDataSource = JSON.parse(JSON.stringify(this.initialGame))
    this.namesToFilter = _.pluck(this.initialGame, 'name')
    this.dataSource = new MatTableDataSource<ScoreElement>(initialGame);
    console.log(this.dataSource)
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.loading = false
  }

  getData = () => {
    let callback = (data) => {
      this.scores = data[0]
      this.gamesSource = data[1]
      this.players = data[2]
      this.selectedGame = _.first(this.gamesSource).id
      let datas = {
        scores: this.scores,
        games: this.gamesSource
      }
      this.dataLoadedCallback(datas)
    }
    if (this.store.get('allData')) {
      callback(this.store.get('allData'))
    } else {
      let promises = [this.dataprovider.getScoreData(), this.dataprovider.getGamesData(), this.dataprovider.getPlayersData()]
      forkJoin(promises).subscribe(data => {
        this.store.set('allData', data)
        callback(data)

      })
    }
  }

  ngOnInit() {
    this.loading = true
    this.getData()
    this.idInterval = setInterval(() => {
      this.timestamp = moment(this.timestamp, 'YYYY.MM.DD HH:mm:ss').add(1, 's').format('YYYY.MM.DD HH:mm:ss')
    }, 1000);
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    if (this.idInterval) {
      clearInterval(this.idInterval);
    }
  }

  filterPlayers(value) {
    if (_.isEmpty(this.fullDataSource)) {
      this.fullDataSource = JSON.parse(JSON.stringify(this.dataSource.filteredData))
    }
    let filtered = _.filter(this.fullDataSource, (v) => v.name.toLowerCase().indexOf(value.toLowerCase()) != -1 )
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
    this.logo = _.findWhere(this.logosSource, { id: val })
    let name = _.findWhere(this.gamesSource, { id: val }).name
    let gameDataSource = mapScoreTable(this.scores[name])
    this.fullDataSource = JSON.parse(JSON.stringify(gameDataSource))
    this.dataSource = new MatTableDataSource<ScoreElement>(gameDataSource);
    this.namesToFilter = _.pluck(gameDataSource, 'name')
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  addScore(data) {
    let payload = {
      score: data.dataScore,
      game: data.game.name
    }
    this.dataprovider.setScoreData(payload).subscribe(response => {
      if (response.status.status_code == "S") {
        this.toastr.success(response.status.status, "")
      } else {
        this.toastr.error(response.status.status, "")
        return
      }

      let data = {
        scores: response.dataScore
      }
      this.store.set('matches', undefined)
      this.dataLoadedCallback(data)
    });
  }

  openEntryScoreModal(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '700px';
    dialogConfig.position = {
      top: "5%"
    };
    dialogConfig.data = {
      'game': _.findWhere(this.gamesSource, { id: this.selectedGame }),
      'playerList': _.pluck(this.players, 'name'),
      'dataScore': {}
    }


    const dialogRef = this.dialog.open(EntryResultComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.loading = true
        this.addScore(data)
      }
    });
  }

  openEntryPlayerModal(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '700px';
    dialogConfig.position = {
      top: "5%"
    }
    dialogConfig.data = {
      'dataPlayer': {}
    }

    const dialogRef = this.dialog.open(EntryPlayerComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.loading = true
        this.dataprovider.setPlayerData(data).subscribe(response => {
          if (response.status.status_code == "S") {
            this.toastr.success(response.status.status, "")
          } else {
            this.toastr.error(response.status.status, "")
            this.loading = false
            return
          }

          let data = {
            scores: response.dataScore,
            players: response.dataPlayers
          }
          this.dataLoadedCallback(data)

        });
      }
    });
  }

  openH2HModal(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '1000px';
    dialogConfig.position = {
      top: "5%"
    }
    dialogConfig.data = {
      'game': _.findWhere(this.gamesSource, { id: this.selectedGame }),
      'playerList': _.pluck(this.players, 'name'),
    }


    const dialogRef = this.dialog.open(H2HComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(data => {
      if (data) {

      }
    });
  }

  openConfirmModal(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.minWidth = '700px';
    dialogConfig.maxHeight = '200px';
    dialogConfig.position = {
      top: "5%"
    };
    dialogConfig.data = {
      'game': _.findWhere(this.gamesSource, { id: this.selectedGame }),
      'messsage': "Czy napewno chcesz usunąć wszystkie dane? Zostaną one bezpowrotnie usunięte.",
      'title': "Potwierdzenie usunięcia."
    }


    const dialogRef = this.dialog.open(ConfirmModalComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.loading = true;
        this.dataprovider.deleteData({ game: _.findWhere(this.gamesSource, { id: this.selectedGame }) }).subscribe(response => {
          if (response.status.status_code == "S") {
            this.toastr.success(response.status.status, "")
          } else {
            this.toastr.error(response.status.status, "")
            return
          }

          let data = {
            scores: response.dataScore
          }
          this.dataLoadedCallback(data)
        });
      }
    });
  }

}

