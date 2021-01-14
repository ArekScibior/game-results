import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { StorageCommonsService } from '../common/storage-commons.service';
import * as _ from 'underscore';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    public store: StorageCommonsService,
    public toastr: ToastrService,
    ) { }

  currentPlayer = {}
  playerScores = []
  ngOnInit(): void {
    this.getPlayer();
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
      console.log('currentPlayer',this.currentPlayer, this.playerScores)
    }
  }

}
