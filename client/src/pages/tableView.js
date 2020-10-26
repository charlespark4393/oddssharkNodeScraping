import { Component } from "react";
import {
  scrapingService
} from '../service'

const Sports = require('../constant').Sports

class tableView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spread: '',
      spreads: [],
      sports: [],
      sport: 'Select Sports...',
      result: {},
      progress: false,
    };
    this.changeSport = this.changeSport.bind(this)
    this.changeSpread = this.changeSpread.bind(this)
    this.getResult = this.getResult.bind(this)
  }

  getResult() {
    this.setState({
      progress: true,
      result: {},
    })
    const data = {
      sport: this.state.sport,
      spread: this.state.spread
    }
    scrapingService.scraping(data)
    .then((response) => {
      this.setState({
        result: response.data.json,
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

  changeSpread(e) {
    this.setState({
      spread: e.target.innerText
    })
    setTimeout(() => {
      this.getResult()
    }, 100)
  }

  componentDidMount() {
    let sports = []
    for (var key in Sports) {
      sports.push(key)
    }
    this.setState({
      sports
    })
  }

  changeSport(e) {
    const val = e.target.innerText
    this.setState({
      sport: val
    })
    let spreads = Sports[val]['1']
    let spread = ''
    if (spreads.length > 0) spread = spreads[0]
    this.setState({
      spread,
      spreads
    })
    setTimeout(() => {
      this.getResult()
    }, 100)
  }

  render() {
    const {spread, spreads, sport, sports} = this.state
    return (
      <div className="app-container container">
        <div className="row mt-4">
          <div className="col-12 border pt-2 pb-2">
            <div className="mb-3 pt-2">
              <div className="dropdown d-flex justify-content-between header pb-2">
                {
                  this.state.progress ?
                  <div className="ml-3 spinner-border white" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  : <div></div>
                }
                <button className="table-select-sport btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButtonSpread" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  {sport}
                </button>
                <div className="dropdown-menu" aria-labelledby="dropdownMenuButtonSpread">
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
            <table class="table table-striped table-bordered table-responsive">
              <thead>
                <tr>
                  <th colspan="3">
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
                  </th>
                  <th>
                    <img alt="thimage" className="t-image" src="https://www.oddsshark.com/sites/default/files/images/sportsbook-reviews/logos/sblogo_opening_eng.png"></img>
                  </th>
                  <th>
                    <img alt="thimage" className="t-image" src="https://www.oddsshark.com/sites/default/files/images/sportsbook-reviews/logos/sblogo_bovada.png"></img>
                  </th>
                  <th>
                    <img alt="thimage" className="t-image" src="https://www.oddsshark.com/sites/default/files/images/sportsbook-reviews/logos/sblogo_betonline_0.png"></img>
                  </th>
                  <th>
                    <img alt="thimage" className="t-image" src="https://www.oddsshark.com/sites/default/files/images/sportsbook-reviews/logos/sblogo_intertops.png"></img>
                  </th>
                  <th>
                    <img alt="thimage" className="t-image" src="https://www.oddsshark.com/sites/default/files/images/sportsbook-reviews/logos/sblogo_sportsbetting.png"></img>
                  </th>
                  <th>
                    <img alt="thimage" className="t-image" src="https://www.oddsshark.com/sites/default/files/images/sportsbook-reviews/logos/sblogo_betnow.png"></img>
                  </th>
                  <th>
                    <img alt="thimage" className="t-image" src="https://www.oddsshark.com/sites/default/files/images/sportsbook-reviews/logos/sblogo_gtbets_2.png"></img>
                  </th>
                  <th>
                    <img alt="thimage" className="t-image" src="https://www.oddsshark.com/sites/default/files/images/sportsbook-reviews/logos/sblogo_skybook.png"></img>
                  </th>
                  <th>
                    <img alt="thimage" className="t-image" src="https://www.oddsshark.com/sites/default/files/images/sportsbook-reviews/logos/sblogo_5dimes_0.png"></img>
                  </th>
                  <th>
                    <img alt="thimage" className="t-image" src="https://www.oddsshark.com/sites/default/files/images/sportsbook-reviews/logos/sblogo_sportbet.png"></img>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>John</td>
                  <td>Doe</td>
                  <td>john@example.com</td>
                  <td>John</td>
                  <td>Doe</td>
                  <td>john@example.com</td>
                  <td>John</td>
                  <td>Doe</td>
                  <td>john@example.com</td>
                  <td>John</td>
                  <td>Doe</td>
                  <td>john@example.com</td>
                  <td>john@example.com</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }
}

export default tableView;
