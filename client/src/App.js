import React, { Component } from "react";
import ReactJson from 'react-json-view'
const axios = require('axios');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spread: 'Spread',
      spreads: ['Moneyline', 'Spread'],
      sports: ['NFL', 'NBA', 'MLB', 'NCAAF', 'NHL', 'UFC', 'Politics', 'NCAAB', 'BOXING', 'CFL', 'WNBA', 'Golf'],
      sport: 'Select Sports...',
      progress: false,
      result: {},
      url: '',
    };
    this.changeSport = this.changeSport.bind(this)
    this.startScraping = this.startScraping.bind(this)
    this.changeSpread = this.changeSpread.bind(this)
  }

  changeSport(e) {
    this.setState({
      sport: e.target.innerText
    })
  }

  changeSpread(e) {
    this.setState({
      spread: e.target.innerText
    })
  }

  startScraping() {
    this.setState({
      progress: true,
      result: {},
      url: ''
    })
    axios.post('http://localhost:5000/scraping', {
      sport: this.state.sport,
      spread: this.state.spread
    })
    .then((response) => {
      this.setState({
        result: response.data.json,
        url: response.data.url
      })
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      this.setState({
        progress: false
      })
    })
  }

  render() {
    const {spread, spreads, sport, sports, result, url} = this.state
    return (
      <div className="app-container container">
        <div className="row mt-4">
          <div className="col-12 col-md-4 border">
            <div className="mb-3 pt-2">
              <h3 className="header pb-1">Settings</h3>
            </div>
            <div className="select-sports mb-3">
              <div className="dropdown">
                <button className="btn btn-secondary dropdown-toggle w-100" type="button" id="dropdownMenuButtonSpread" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  {spread}
                </button>
                <div className="dropdown-menu w-100" aria-labelledby="dropdownMenuButtonSpread">
                  {
                    spreads.map((item, index) => {
                      return (
                        <div className="dropdown-item cursor-hover" value={item} key={index} onClick={(e) => this.changeSpread(e)}>{item}</div>
                      )
                    })
                  }
                </div>
              </div>
            </div>
            <div className="select-sports mb-3">
              <div className="dropdown">
                <button className="btn btn-secondary dropdown-toggle w-100" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  {sport}
                </button>
                <div className="dropdown-menu w-100" aria-labelledby="dropdownMenuButton">
                  {
                    sports.map((item, index) => {
                      return (
                        <div className="dropdown-item cursor-hover" value={item} key={index} onClick={(e) => this.changeSport(e)}>{item}</div>
                      )
                    })
                  }
                </div>
              </div>
            </div>
            <div className="mb-3">
              <button disabled={sport === 'Select Sports...'} type="button" className="w-100 btn btn-success d-flex scraping" onClick={this.startScraping}>
                Scraping 
                {
                  this.state.progress && 
                  <div className="ml-3 spinner-border spinner-border-sm white" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                }
              </button>
            </div>
          </div>
          <div className="col-12 col-md-8 border">
            <div className="mb-3 pt-2">
              <div>
                <h3 className="header pb-1">Results</h3>
              </div>
              <div className="mb-3">
                <div className="mb-2">
                  <a className="" href={url} target="_blank">{url}</a>
                </div>
                <ReactJson 
                  src={result} 
                  displayDataTypes={false}
                  displayObjectSize={false}
                  indentWidth={2}
                  collapsed={1}
                  name={'Json'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default App;
