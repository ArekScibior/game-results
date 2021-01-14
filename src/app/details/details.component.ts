import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { StorageCommonsService } from '../common/storage-commons.service';
import { DataproviderService } from '../common/dataprovider.service';
import { MatTableDataSource, MatPaginator, MatSort} from '@angular/material'
import * as _ from 'underscore';
import { ToastrService } from 'ngx-toastr';

export interface LAST_GAMES {
	date: string;
	player1: string;
	player2: string;
	result: string;
}

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  @ViewChild(MatPaginator, null) paginator: MatPaginator;
  @ViewChild(MatSort, null) sort: MatSort;
  constructor(
    private route: ActivatedRoute,
    public store: StorageCommonsService,
    public toastr: ToastrService,
    public dataprovider: DataproviderService,
    
    ) { }

  currentPlayer = {}
  playerScores = []
  loading = false
  wins = {}
	draws = 0;
	
	displayedColumns: string[] = ['date', 'player1', 'player2', 'result'];
	dataSource = new MatTableDataSource<LAST_GAMES>();

  ngOnInit(): void {
    this.getPlayer();
    this.get10LastMatches();
  }
  
  getPlayer(): void {
    const allScores = this.store.get('score')
    const allPlayers = this.store.get('players')
    const id = +this.route.snapshot.paramMap.get('id');
    if (_.isUndefined(allScores) || _.isUndefined(allPlayers)) {
      this.toastr.error('Przepraszamy, dane dot. graczy nie są kompletne.')
      return
    } else {
      let existPlayerDetails = _.find(allPlayers, (v) => v.id == id)
      _.each(allScores, (v, idx) => {
        let playerScores = {}
        let currentPlayerScore = _.find(v, function(player) { return player.idPlayer })
        if (currentPlayerScore) { this.playerScores[idx] = currentPlayerScore }
      })
      this.currentPlayer = _.find(allPlayers, (v) => v.id == id)
    }
  }

  get10LastMatches() {
    let callback = (response) => {
      if (!_.isEmpty(response)) {
				let matches = []
        matches = _.sortBy(response, 'date').reverse()
        _.each(matches, (match) => {
          match.result = match.player1Score + " - " + match.player2Score
        })
				this.dataSource = new MatTableDataSource<LAST_GAMES>(matches)
				this.dataSource.paginator = this.paginator;
				this.dataSource.sort = this.sort;
				this.loading = false;
			} else {
				this.toastr.error('Brak danych dla wybranych graczy.')
				this.loading = false;
				return;
			}
    }

    this.loading = true;
    if (this.store.get('matches') && this.store.get('playerData') == this.currentPlayer.name) {
      callback(this.store.get('matches'))
    } else {
      this.dataprovider.getLast10Matches({player1: this.currentPlayer.name, game: 'fifa21', numberMatches: 5}).subscribe(response => {
        this.store.set('matches', response)
        this.store.set('playerData', this.currentPlayer.name)
        callback(response)
      });
    }
		
	}

}
