import { Component } from "react";
import { withRouter } from "react-router-dom";
import {
  scrapingService
} from '../service'

const Sports = require('../constant').Sports
const Images = require('../constant').Images

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
    this.renderContent = this.renderContent.bind(this)
    this.jsonView = this.jsonView.bind(this)
  }

  jsonView() {
    this.props.history.push('/json')
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

  renderContent() {
    let day = ''
    let rlt = ''
    const { result } = this.state
    for (var key in result) {
      const item = result[key]
      if (item.day !== day) {
        day = item.day
        rlt += 
        `
          <tr>
            <td colspan="13" class="tr-color"><h3>${day}</h3></td>
          </tr>
        `
      }
      if (item.value !== undefined) {
        let values = ''
        const value = item.value
        for (let i = 0 ; i < value.length ; i += 1) {
          values += `<td>${value[i]}</td>`
        }
        rlt += 
        `
          <tr>
            <td colspan="3">${item.name}</td>
            ${values}
          </tr>
        `
      } else {
        for (let i = 1 ; i <= 2 ; i += 1) {
          let values = ''
          const value = item[i].value
          for (var key1 in value) {
            values += `<td>${value[key1][0]} ${value[key1][1]}</td>`
          }
          let name = item[i].name
          let id = item[i].id
          if (id === undefined) id = ''
          if (i === 1) {
            rlt += 
            `
              <tr>
                <td rowspan="2" class="vertical-align-center">${item.time}</td>
                <td>${id}</td>
                <td>${name}</td>
                ${values}
              </tr>
            `
          } else {
            rlt += 
            `
              <tr>
                <td>${id}</td>
                <td>${name}</td>
                ${values}
              </tr>
            `
          }
        }
        rlt += `<tr><td colspan="13" class="tr-color"></td></tr>`
      }
    }
    return rlt;
  }

  render() {
    const {spread, spreads, sport, sports} = this.state
    return (
      <div className="app-container container">
        <div className="row mt-3">
          <div className="col-12 border p-2">
            <div className="pt-2">
              <div className="dropdown d-flex justify-content-between header pb-2 align-items-center">
                {
                  this.state.progress ?
                  <div className="ml-3 spinner-border white" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  : 
                  <div>
                    <button className="btn btn-secondary" onClick={this.jsonView}>Json View</button>
                  </div>
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
            <div className="table-con position-relative tableFixHead">
              <table className="table table-bordered table-responsive table-sm h-100">
                <thead>
                  <tr>
                    <th colSpan="3">
                      <div className="dropdown">
                        <button className="table-spread-btn btn btn-secondary dropdown-toggle w-100" type="button" id="dropdownMenuButtonSpread" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
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
                    {
                      Images.map((item, index) => {
                        return (
                          <th key={index}>
                            <img alt="thimage" className="t-image" src={item}></img>
                          </th>
                        )
                      })
                    }
                  </tr>
                </thead>
                <tbody dangerouslySetInnerHTML={{ __html: this.renderContent() }} >
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(tableView);
