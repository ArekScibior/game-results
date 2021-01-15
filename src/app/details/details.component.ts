import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { StorageCommonsService } from '../common/storage-commons.service';
import { DataproviderService } from '../common/dataprovider.service';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material'
import * as _ from 'underscore';
import { ToastrService } from 'ngx-toastr';

export interface LAST_GAMESH2H {
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

	currentPlayer = { id: null, name: "", age: "", favouriteClub: "" }
	playerScores = []
	players = []
	player2 = ""
	loading = false
	wins = {}
	draws = 0;
	hideTable = true
	fifa21Score = {}

	displayedColumns: string[] = ['date', 'player1', 'player2', 'result'];
	dataSource = new MatTableDataSource<LAST_GAMESH2H>();
	dataSourceH2H = new MatTableDataSource<LAST_GAMESH2H>();

	ngOnInit(): void {
		this.getPlayer();
		this.getLastMatches();
	}

	getPlayer(): void {
		const allScores = this.store.get('score')
		const allPlayers = this.store.get('players')
		this.players = _.pluck(allPlayers, 'name')
		const id = +this.route.snapshot.paramMap.get('id');
		if (_.isUndefined(allScores) || _.isUndefined(allPlayers)) {
			this.toastr.error('Przepraszamy, dane dot. graczy nie są kompletne.')
			return
		} else {
			_.each(allScores, (v, idx) => {
				let currentPlayerScore = _.find(v, function (player) { return player.idPlayer == id })
				if (currentPlayerScore) { this.playerScores[idx] = currentPlayerScore }
			})
			this.currentPlayer = _.find(allPlayers, (v) => v.id == id)
			this.players = _.filter(this.players, (v) => v !== this.currentPlayer.name)
			this.fifa21Score = this.playerScores['fifa21']
		}
	}

	getMatchesH2H() {
		this.hideTable = true;
		this.loading = true;
		this.dataprovider.getMatches({ player1: this.currentPlayer.name, player2: this.player2, game: 'fifa21' }).subscribe(response => {
			if (!_.isEmpty(response)) {
				let matches = []
				let player1 = this.currentPlayer.name
				let wins = {
					player1: 0,
					player2: 0
				}
				let draws = 0;
				_.each(response, function (v) {
					let firstPlayerScore = ""
					let secondPlayerScore = ""

					if (v.player1 == player1) {
						firstPlayerScore = v.player1Score
						secondPlayerScore = v.player2Score
					} else {
						firstPlayerScore = v.player2Score
						secondPlayerScore = v.player1Score
					}

					if (firstPlayerScore > secondPlayerScore) {
						wins.player1++
					} else if (secondPlayerScore > firstPlayerScore) {
						wins.player2++
					} else if (firstPlayerScore == secondPlayerScore) {
						draws++
					}

					let mappedObject = {
						date: v.date,
						player1: v.player1,
						player2: v.player2,
						result: v.player1Score + " - " + v.player2Score
					}
					matches.push(mappedObject)
				})
				matches = _.sortBy(matches, 'date').reverse()
				this.wins = wins
				this.draws = draws
				this.dataSourceH2H = new MatTableDataSource<LAST_GAMESH2H>(matches)
				this.dataSourceH2H.paginator = this.paginator;
				this.dataSourceH2H.sort = this.sort;
				this.hideTable = false;
				this.loading = false;
			} else {
				this.toastr.error('Brak danych dla wybranych graczy.')
				this.loading = false;
				return;
			}
		});
	}

	getLastMatches() {
		let callback = (response) => {
			if (!_.isEmpty(response)) {
				let matches = []
				matches = response
				_.each(matches, (match) => {
					match.result = match.player1Score + " - " + match.player2Score
				})
				this.dataSource = new MatTableDataSource<LAST_GAMESH2H>(matches)
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
		if (_.isEmpty(this.currentPlayer)) {
			this.toastr.error('Brak danych dot. wybranego gracza. Proszę spróbować ponownie uruchomić aplikację.')
			return
		} else {
			if (this.store.get('matches') && this.store.get('playerData') == this.currentPlayer.name) {
				callback(this.store.get('matches'))
			} else {
				this.dataprovider.getLastMatches({ player1: this.currentPlayer.name, game: 'fifa21', numberMatches: 5 }).subscribe(response => {
					this.store.set('matches', response)
					this.store.set('playerData', this.currentPlayer.name)
					callback(response)
				});
			}
		}


	}

}
