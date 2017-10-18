import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import Track from './TrackSimple';

import logo from '../../images/disco-chat-logo.png'

import { fetchPlaylist } from '../actions/musicActions'
import { fetchAccount } from '../actions/accountActions'
import { fetchConfig } from '../actions/configActions'

const select = function(store, ownProps) {
  const { account, music, config } = store

  return {
    account,
    music,
    config
  }
}

class Demand extends Component {
  constructor(props) {
    super(props)
    this.displayNumber = false
    this.fetchingComplete = false
    this.removeTrack = this.removeTrack.bind(this)

    // get config
    props.fetchConfig()
  }

  componentDidMount() {
    this.timeout = setInterval(() => this.handleDisplayNumber(), 3000)
  }

  componentWillReceiveProps(nextProps) {
    if (!this.fetchingComplete && nextProps.config.fetched) {
      this.fetchingComplete = true
      // console.log(this.props.config.config.apiUrl)
      // Fetch user info
      const accountUrl = `${nextProps.config.config.apiUrl}/api/disco_registration`
      console.log(accountUrl)
      this.props.fetchAccount(accountUrl)

      // Fetch playlist
      const playlistUrl = `${nextProps.config.config.apiUrl}/api/spotify_playlist`
      this.props.fetchPlaylist(playlistUrl)
      this.playlistFetchTimer = setInterval(() => {
        this.props.fetchPlaylist(playlistUrl)
        if(this.props.music.music.tracks.items.length > 0) {
          this.displayNumber = false
        }
      }, 5000)
    }
  }

  componentWillUnmount() {
    // Stop timer that triggers continuous playlist re-fetch
    clearInterval(this.playlistFetchTimer)
    clearInterval(this.timeout)
  }
  
  handleDisplayNumber() {
    if(this.props.config.fetched && this.props.music.music.tracks.items.length <= 0) {
      this.displayNumber = false
    }
  }

  removeTrack(track) {
    alert(`Remove ${track.name}`)
    console.log(track)
  } 

  render() {
    let phone_number
    if (this.props.account.fetched) {
      ({ phone_number } = this.props.account.account)
    }

    let trackItems, tracks
    if (this.props.music.fetched) {
      trackItems = this.props.music.music.tracks.items

      tracks = _.map(trackItems, (track) => {
        return <Track removeTrack={this.removeTrack} key={track.track.id + track.added_at} track={track.track} />
      }).reverse()
    }

    return (
      <div className='main demo'>
        <header>
          <a href='#' className='logo'>
            <img src={ logo } alt='Smiley face'/>
            <h1>Heroku <strong>DJ</strong></h1>
          </a>
          <p className='byline'>a demo app running on <a href='https://www.heroku.com/' className='logo-salesforce-heroku'>Salesforce Heroku</a></p>
        </header>

        <div className='playlist-container'>
          <div className='playlist demand'>
            <ol className='tracks'>
              { tracks }
            </ol>
            <footer>
              <div className='track-count'><span>{ (trackItems && trackItems.length) || 0 }</span> tracks</div>
              <div className='request-track'>
                <div className='sms-number'>
                  <span className='sms-number-title'>Text a track to </span>
                  <strong>{ phone_number || '(---) --- ---' }</strong>
                </div>
              </div>
            </footer>
          </div>
        </div>
      <div className={`demand big-number ${this.displayNumber ? 'display-big-number' : ''}`}>
          <span>Text a track to </span>
          <strong>{ phone_number || '(---) --- ---' }</strong>
        </div>
      </div>
    )
  }
}

export default connect(select, { fetchPlaylist, fetchAccount, fetchConfig })(Demand);