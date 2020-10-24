const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const cors = require('cors')
const puppeteer = require('puppeteer');

const browserOptions = {
  headless: false,
  defaultViewport: {
    width: 1920,
    height: 1080,
  },
  args: [
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-setuid-sandbox',
    '--no-first-run',
    '--no-sandbox',
    '--no-zygote',
    // '--single-process', // <- this one doesn't works in Windows
  ]
};

const port = 5000
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(cors())

function NFL() {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();
    const url = 'https://www.oddsshark.com/nfl/odds'
    
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 0
    });

    let names = await page.evaluate(({}) => {
      return  Array.from(document.querySelectorAll('.op-team-data-wrapper.not-futures>div'))
      .map(row => {
        const className = row.className
        let rlt = {}
        if (className.indexOf('op-separator-bar') != -1) {
          rlt['day'] = row.querySelector('span').innerHTML.replace(/&nbsp;/gi,'')
        }
        if (className.indexOf('op-matchup-wrapper') != -1) {
          rlt['time'] = row.querySelector('.op-matchup-time').innerHTML
          rlt['1'] = {}
          rlt['2'] = {}
          rlt['1']['id'] = row.querySelector('.op-matchup-rotation.op-matchup-text.op-rotation-top').innerHTML
          rlt['2']['id'] = row.querySelector('.op-matchup-rotation.op-matchup-text.op-rotation-bottom').innerHTML
          rlt['1']['name'] = row.querySelector('.op-matchup-team-wrapper>.op-team-top>a').innerHTML
          rlt['2']['name'] = row.querySelector('.op-matchup-team-wrapper>.op-team-bottom>a').innerHTML
        }
        return rlt;
      })
    },{})

    let values = await page.evaluate(({}) => {
      return  Array.from(document.querySelectorAll('#op-results .op-item-row-wrapper'))
      .map(row => {
        let rlt = {}
        rlt['1'] = {}
        rlt['2'] = {}
        for (let i = 1 ; i <= 10 ; i += 1) {
          rlt['1'][i] = [
            row.querySelector(`.op-item-wrapper:nth-child(${i}) .op-first-row .op-item:nth-child(1)`).innerHTML,
            row.querySelector(`.op-item-wrapper:nth-child(${i}) .op-first-row .op-item:nth-child(2)`).innerHTML
          ]
          rlt['2'][i] = [
            row.querySelector(`.op-item-wrapper:nth-child(${i}) .op-second-row .op-item:nth-child(1)`).innerHTML,
            row.querySelector(`.op-item-wrapper:nth-child(${i}) .op-second-row .op-item:nth-child(2)`).innerHTML
          ]
        }
        return rlt;
      })
    },{})

    let results = []
    let day = '-'
    for (let i = 0 ; i < names.length ; i += 1) {
      let item = names[i]
      if (item.day != undefined) {
        day = item.day
      }
      if (item.time != undefined) {
        item['day'] = day
        results.push(item)
      }
    }

    for (let i = 0 ; i < results.length ; i += 1) {
      results[i]['1']['value'] = values[i]['1']
      results[i]['2']['value'] = values[i]['2']
    }

    await page.close();
    await browser.close();

    resolve(results)
  })
}

function NBA() {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();
    const url = 'https://www.oddsshark.com/nba/odds#futures'
    
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 0
    });

    let names = await page.evaluate(({}) => {
      return  Array.from(document.querySelectorAll('.op-team-data-wrapper.futures>div'))
      .map(row => {
        const className = row.className
        let rlt = {}
        if (className.indexOf('op-separator-bar op-left') != -1) {
          rlt['day'] = row.querySelector('span').innerHTML.replace(/&nbsp;/gi,'')
        } else {
          rlt['name'] = row.innerHTML
        }
        return rlt;
      })
    },{})

    let values = await page.evaluate(({}) => {
      return  Array.from(document.querySelectorAll('#op-future-results .op-item-row-wrapper'))
      .map(row => {
        let rlt = []
        for (let i = 1 ; i <= 10 ; i += 1) {
          rlt.push(row.querySelector(`.op-item:nth-child(${i})`).innerHTML)
        }
        return rlt;
      })
    },{})

    let results = []
    let day = '-'
    for (let i = 0 ; i < names.length ; i += 1) {
      let item = names[i]
      if (item.day != undefined) {
        day = item.day
      }
      if (item.name != undefined) {
        item['day'] = day
        results.push(item)
      }
    }

    for (let i = 0 ; i < results.length ; i += 1) {
      results[i]['value'] = values[i]
    }

    await page.close();
    await browser.close();

    resolve(results)
  })
}

function MLB() {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();
    const url = 'https://www.oddsshark.com/mlb/odds'
    
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 0
    });

    let names = await page.evaluate(({}) => {
      return  Array.from(document.querySelectorAll('.op-team-data-wrapper.not-futures>div'))
      .map(row => {
        const className = row.className
        let rlt = {}
        if (className.indexOf('op-separator-bar') != -1) {
          rlt['day'] = row.querySelector('span').innerHTML.replace(/&nbsp;/gi,'')
        }
        if (className.indexOf('op-matchup-wrapper') != -1) {
          rlt['time'] = row.querySelector('.op-matchup-time').innerHTML
          rlt['1'] = {}
          rlt['2'] = {}
          rlt['1']['id'] = row.querySelector('.op-matchup-rotation.op-matchup-text.op-rotation-top').innerHTML
          rlt['2']['id'] = row.querySelector('.op-matchup-rotation.op-matchup-text.op-rotation-bottom').innerHTML
          rlt['1']['name'] = row.querySelector('.op-matchup-team-wrapper>.op-team-top>a').innerHTML
          rlt['2']['name'] = row.querySelector('.op-matchup-team-wrapper>.op-team-bottom>a').innerHTML
        }
        return rlt;
      })
    },{})

    let values = await page.evaluate(({}) => {
      return  Array.from(document.querySelectorAll('#op-results .op-item-row-wrapper'))
      .map(row => {
        let rlt = {}
        rlt['1'] = {}
        rlt['2'] = {}
        for (let i = 1 ; i <= 10 ; i += 1) {
          rlt['1'][i] = [
            row.querySelector(`.op-item-wrapper:nth-child(${i}) .op-first-row .op-item:nth-child(1)`).innerHTML,
            row.querySelector(`.op-item-wrapper:nth-child(${i}) .op-first-row .op-item:nth-child(2)`).innerHTML
          ]
          rlt['2'][i] = [
            row.querySelector(`.op-item-wrapper:nth-child(${i}) .op-second-row .op-item:nth-child(1)`).innerHTML,
            row.querySelector(`.op-item-wrapper:nth-child(${i}) .op-second-row .op-item:nth-child(2)`).innerHTML
          ]
        }
        return rlt;
      })
    },{})

    let results = []
    let day = '-'
    for (let i = 0 ; i < names.length ; i += 1) {
      let item = names[i]
      if (item.day != undefined) {
        day = item.day
      }
      if (item.time != undefined) {
        item['day'] = day
        results.push(item)
      }
    }

    for (let i = 0 ; i < results.length ; i += 1) {
      results[i]['1']['value'] = values[i]['1']
      results[i]['2']['value'] = values[i]['2']
    }

    await page.close();
    await browser.close();

    resolve(results)
  })
}

function NCAAF() {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();
    const url = 'https://www.oddsshark.com/ncaaf/odds'
    
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 0
    });

    let names = await page.evaluate(({}) => {
      return  Array.from(document.querySelectorAll('.op-team-data-wrapper.not-futures>div'))
      .map(row => {
        const className = row.className
        let rlt = {}
        if (className.indexOf('op-separator-bar') != -1) {
          rlt['day'] = row.querySelector('span').innerHTML.replace(/&nbsp;/gi,'')
        }
        if (className.indexOf('op-matchup-wrapper') != -1) {
          rlt['time'] = row.querySelector('.op-matchup-time').innerHTML
          rlt['1'] = {}
          rlt['2'] = {}
          rlt['1']['id'] = row.querySelector('.op-matchup-rotation.op-matchup-text.op-rotation-top').innerHTML
          rlt['2']['id'] = row.querySelector('.op-matchup-rotation.op-matchup-text.op-rotation-bottom').innerHTML
          rlt['1']['name'] = row.querySelector('.op-matchup-team-wrapper>.op-team-top>a').innerHTML
          rlt['2']['name'] = row.querySelector('.op-matchup-team-wrapper>.op-team-bottom>a').innerHTML
        }
        return rlt;
      })
    },{})

    let values = await page.evaluate(({}) => {
      return  Array.from(document.querySelectorAll('#op-results .op-item-row-wrapper'))
      .map(row => {
        let rlt = {}
        rlt['1'] = {}
        rlt['2'] = {}
        for (let i = 1 ; i <= 10 ; i += 1) {
          rlt['1'][i] = [
            row.querySelector(`.op-item-wrapper:nth-child(${i}) .op-first-row .op-item:nth-child(1)`).innerHTML,
            row.querySelector(`.op-item-wrapper:nth-child(${i}) .op-first-row .op-item:nth-child(2)`).innerHTML
          ]
          rlt['2'][i] = [
            row.querySelector(`.op-item-wrapper:nth-child(${i}) .op-second-row .op-item:nth-child(1)`).innerHTML,
            row.querySelector(`.op-item-wrapper:nth-child(${i}) .op-second-row .op-item:nth-child(2)`).innerHTML
          ]
        }
        return rlt;
      })
    },{})

    let results = []
    let day = '-'
    for (let i = 0 ; i < names.length ; i += 1) {
      let item = names[i]
      if (item.day != undefined) {
        day = item.day
      }
      if (item.time != undefined) {
        item['day'] = day
        results.push(item)
      }
    }

    for (let i = 0 ; i < results.length ; i += 1) {
      results[i]['1']['value'] = values[i]['1']
      results[i]['2']['value'] = values[i]['2']
    }

    await page.close();
    await browser.close();

    resolve(results)
  })
}

function NHL() {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();
    const url = 'https://www.oddsshark.com/nhl/odds#futures'
    
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 0
    });

    let names = await page.evaluate(({}) => {
      return  Array.from(document.querySelectorAll('.op-team-data-wrapper.futures>div'))
      .map(row => {
        const className = row.className
        let rlt = {}
        if (className.indexOf('op-separator-bar op-left') != -1) {
          rlt['day'] = row.querySelector('span').innerHTML.replace(/&nbsp;/gi,'')
        } else {
          rlt['name'] = row.innerHTML
        }
        return rlt;
      })
    },{})

    let values = await page.evaluate(({}) => {
      return  Array.from(document.querySelectorAll('#op-future-results .op-item-row-wrapper'))
      .map(row => {
        let rlt = []
        for (let i = 1 ; i <= 10 ; i += 1) {
          rlt.push(row.querySelector(`.op-item:nth-child(${i})`).innerHTML)
        }
        return rlt;
      })
    },{})

    let results = []
    let day = '-'
    for (let i = 0 ; i < names.length ; i += 1) {
      let item = names[i]
      if (item.day != undefined) {
        day = item.day
      }
      if (item.name != undefined) {
        item['day'] = day
        results.push(item)
      }
    }

    for (let i = 0 ; i < results.length ; i += 1) {
      results[i]['value'] = values[i]
    }

    await page.close();
    await browser.close();

    resolve(results)
  })
}

function UFC() {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();
    const url = 'https://www.oddsshark.com/ufc/odds'
    
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 0
    });

    let names = await page.evaluate(({}) => {
      return  Array.from(document.querySelectorAll('.op-team-data-wrapper.not-futures>div'))
      .map(row => {
        const className = row.className
        let rlt = {}
        if (className.indexOf('op-separator-bar') != -1) {
          rlt['day'] = row.querySelector('span').innerHTML.replace(/&nbsp;/gi,'')
        }
        if (className.indexOf('op-matchup-wrapper') != -1) {
          rlt['time'] = row.querySelector('.op-matchup-time').innerHTML
          rlt['1'] = {}
          rlt['2'] = {}
          rlt['1']['name'] = row.querySelector('.op-matchup-team-wrapper>.op-team-top>span').innerHTML
          rlt['2']['name'] = row.querySelector('.op-matchup-team-wrapper>.op-team-bottom>span').innerHTML
        }
        return rlt;
      })
    },{})

    let values = await page.evaluate(({}) => {
      return  Array.from(document.querySelectorAll('#op-results .op-item-row-wrapper'))
      .map(row => {
        let rlt = {}
        rlt['1'] = {}
        rlt['2'] = {}
        for (let i = 1 ; i <= 10 ; i += 1) {
          rlt['1'][i] = [
            row.querySelector(`.op-item-wrapper:nth-child(${i}) .op-first-row .op-item:nth-child(1)`).innerHTML,
            row.querySelector(`.op-item-wrapper:nth-child(${i}) .op-first-row .op-item:nth-child(2)`).innerHTML
          ]
          rlt['2'][i] = [
            row.querySelector(`.op-item-wrapper:nth-child(${i}) .op-second-row .op-item:nth-child(1)`).innerHTML,
            row.querySelector(`.op-item-wrapper:nth-child(${i}) .op-second-row .op-item:nth-child(2)`).innerHTML
          ]
        }
        return rlt;
      })
    },{})

    let results = []
    let day = '-'
    for (let i = 0 ; i < names.length ; i += 1) {
      let item = names[i]
      if (item.day != undefined) {
        day = item.day
      }
      if (item.time != undefined) {
        item['day'] = day
        results.push(item)
      }
    }

    for (let i = 0 ; i < results.length ; i += 1) {
      results[i]['1']['value'] = values[i]['1']
      results[i]['2']['value'] = values[i]['2']
    }

    await page.close();
    await browser.close();

    resolve(results)
  })
}

function Politics() {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();
    const url = 'https://www.oddsshark.com/politics/odds/futures'
    
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 0
    });

    let names = await page.evaluate(({}) => {
      return  Array.from(document.querySelectorAll('.op-team-data-wrapper.futures>div'))
      .map(row => {
        const className = row.className
        let rlt = {}
        if (className.indexOf('op-separator-bar op-left') != -1) {
          rlt['day'] = row.querySelector('span').innerHTML.replace(/&nbsp;/gi,'')
        } else {
          rlt['name'] = row.innerHTML
        }
        return rlt;
      })
    },{})

    let values = await page.evaluate(({}) => {
      return  Array.from(document.querySelectorAll('#op-future-results .op-item-row-wrapper'))
      .map(row => {
        let rlt = []
        for (let i = 1 ; i <= 10 ; i += 1) {
          rlt.push(row.querySelector(`.op-item:nth-child(${i})`).innerHTML)
        }
        return rlt;
      })
    },{})

    let results = []
    let day = '-'
    for (let i = 0 ; i < names.length ; i += 1) {
      let item = names[i]
      if (item.day != undefined) {
        day = item.day
      }
      if (item.name != undefined) {
        item['day'] = day
        results.push(item)
      }
    }

    for (let i = 0 ; i < results.length ; i += 1) {
      results[i]['value'] = values[i]
    }

    await page.close();
    await browser.close();

    resolve(results)
  })
}

function NCAAB() {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();
    const url = 'https://www.oddsshark.com/ncaab/odds#futures'
    
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 0
    });

    let names = await page.evaluate(({}) => {
      return  Array.from(document.querySelectorAll('.op-team-data-wrapper.futures>div'))
      .map(row => {
        const className = row.className
        let rlt = {}
        if (className.indexOf('op-separator-bar op-left') != -1) {
          rlt['day'] = row.querySelector('span').innerHTML.replace(/&nbsp;/gi,'')
        } else {
          rlt['name'] = row.innerHTML
        }
        return rlt;
      })
    },{})

    let values = await page.evaluate(({}) => {
      return  Array.from(document.querySelectorAll('#op-future-results .op-item-row-wrapper'))
      .map(row => {
        let rlt = []
        for (let i = 1 ; i <= 10 ; i += 1) {
          rlt.push(row.querySelector(`.op-item:nth-child(${i})`).innerHTML)
        }
        return rlt;
      })
    },{})

    let results = []
    let day = '-'
    for (let i = 0 ; i < names.length ; i += 1) {
      let item = names[i]
      if (item.day != undefined) {
        day = item.day
      }
      if (item.name != undefined) {
        item['day'] = day
        results.push(item)
      }
    }

    for (let i = 0 ; i < results.length ; i += 1) {
      results[i]['value'] = values[i]
    }

    await page.close();
    await browser.close();

    resolve(results)
  })
}

function BOXING() {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();
    const url = 'https://www.oddsshark.com/boxing/odds'
    
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 0
    });

    let names = await page.evaluate(({}) => {
      return  Array.from(document.querySelectorAll('.op-team-data-wrapper.not-futures>div'))
      .map(row => {
        const className = row.className
        let rlt = {}
        if (className.indexOf('op-separator-bar') != -1) {
          rlt['day'] = row.querySelector('span').innerHTML.replace(/&nbsp;/gi,'')
        }
        if (className.indexOf('op-matchup-wrapper') != -1) {
          rlt['time'] = row.querySelector('.op-matchup-time').innerHTML
          rlt['1'] = {}
          rlt['2'] = {}
          rlt['1']['name'] = row.querySelector('.op-matchup-team-wrapper>.op-team-top>span').innerHTML
          rlt['2']['name'] = row.querySelector('.op-matchup-team-wrapper>.op-team-bottom>span').innerHTML
        }
        return rlt;
      })
    },{})

    let values = await page.evaluate(({}) => {
      return  Array.from(document.querySelectorAll('#op-results .op-item-row-wrapper'))
      .map(row => {
        let rlt = {}
        rlt['1'] = {}
        rlt['2'] = {}
        for (let i = 1 ; i <= 10 ; i += 1) {
          rlt['1'][i] = [
            row.querySelector(`.op-item-wrapper:nth-child(${i}) .op-first-row .op-item:nth-child(1)`).innerHTML,
            row.querySelector(`.op-item-wrapper:nth-child(${i}) .op-first-row .op-item:nth-child(2)`).innerHTML
          ]
          rlt['2'][i] = [
            row.querySelector(`.op-item-wrapper:nth-child(${i}) .op-second-row .op-item:nth-child(1)`).innerHTML,
            row.querySelector(`.op-item-wrapper:nth-child(${i}) .op-second-row .op-item:nth-child(2)`).innerHTML
          ]
        }
        return rlt;
      })
    },{})

    let results = []
    let day = '-'
    for (let i = 0 ; i < names.length ; i += 1) {
      let item = names[i]
      if (item.day != undefined) {
        day = item.day
      }
      if (item.time != undefined) {
        item['day'] = day
        results.push(item)
      }
    }

    for (let i = 0 ; i < results.length ; i += 1) {
      results[i]['1']['value'] = values[i]['1']
      results[i]['2']['value'] = values[i]['2']
    }

    await page.close();
    await browser.close();

    resolve(results)
  })
}

function CFL() {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();
    const url = 'https://www.oddsshark.com/cfl/odds#futures'
    
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 0
    });

    let names = await page.evaluate(({}) => {
      return  Array.from(document.querySelectorAll('.op-team-data-wrapper.futures>div'))
      .map(row => {
        const className = row.className
        let rlt = {}
        if (className.indexOf('op-separator-bar op-left') != -1) {
          rlt['day'] = row.querySelector('span').innerHTML.replace(/&nbsp;/gi,'')
        } else {
          rlt['name'] = row.innerHTML
        }
        return rlt;
      })
    },{})

    let values = await page.evaluate(({}) => {
      return  Array.from(document.querySelectorAll('#op-future-results .op-item-row-wrapper'))
      .map(row => {
        let rlt = []
        for (let i = 1 ; i <= 10 ; i += 1) {
          rlt.push(row.querySelector(`.op-item:nth-child(${i})`).innerHTML)
        }
        return rlt;
      })
    },{})

    let results = []
    let day = '-'
    for (let i = 0 ; i < names.length ; i += 1) {
      let item = names[i]
      if (item.day != undefined) {
        day = item.day
      }
      if (item.name != undefined) {
        item['day'] = day
        results.push(item)
      }
    }

    for (let i = 0 ; i < results.length ; i += 1) {
      results[i]['value'] = values[i]
    }

    await page.close();
    await browser.close();

    resolve(results)
  })
}

function WNBA() {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();
    const url = 'https://www.oddsshark.com/wnba/odds'
    
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 0
    });

    let names = await page.evaluate(({}) => {
      return  Array.from(document.querySelectorAll('.op-team-data-wrapper.not-futures>div'))
      .map(row => {
        const className = row.className
        let rlt = {}
        if (className.indexOf('op-separator-bar') != -1) {
          rlt['day'] = row.querySelector('span').innerHTML.replace(/&nbsp;/gi,'')
        }
        if (className.indexOf('op-matchup-wrapper') != -1) {
          rlt['time'] = row.querySelector('.op-matchup-time').innerHTML
          rlt['1'] = {}
          rlt['2'] = {}
          rlt['1']['id'] = row.querySelector('.op-matchup-rotation.op-matchup-text.op-rotation-top').innerHTML
          rlt['2']['id'] = row.querySelector('.op-matchup-rotation.op-matchup-text.op-rotation-bottom').innerHTML
          rlt['1']['name'] = row.querySelector('.op-matchup-team-wrapper>.op-team-top>a').innerHTML
          rlt['2']['name'] = row.querySelector('.op-matchup-team-wrapper>.op-team-bottom>a').innerHTML
        }
        return rlt;
      })
    },{})

    let values = await page.evaluate(({}) => {
      return  Array.from(document.querySelectorAll('#op-results .op-item-row-wrapper'))
      .map(row => {
        let rlt = {}
        rlt['1'] = {}
        rlt['2'] = {}
        for (let i = 1 ; i <= 10 ; i += 1) {
          rlt['1'][i] = [
            row.querySelector(`.op-item-wrapper:nth-child(${i}) .op-first-row .op-item:nth-child(1)`).innerHTML,
            row.querySelector(`.op-item-wrapper:nth-child(${i}) .op-first-row .op-item:nth-child(2)`).innerHTML
          ]
          rlt['2'][i] = [
            row.querySelector(`.op-item-wrapper:nth-child(${i}) .op-second-row .op-item:nth-child(1)`).innerHTML,
            row.querySelector(`.op-item-wrapper:nth-child(${i}) .op-second-row .op-item:nth-child(2)`).innerHTML
          ]
        }
        return rlt;
      })
    },{})

    let results = []
    let day = '-'
    for (let i = 0 ; i < names.length ; i += 1) {
      let item = names[i]
      if (item.day != undefined) {
        day = item.day
      }
      if (item.time != undefined) {
        item['day'] = day
        results.push(item)
      }
    }

    for (let i = 0 ; i < results.length ; i += 1) {
      results[i]['1']['value'] = values[i]['1']
      results[i]['2']['value'] = values[i]['2']
    }

    await page.close();
    await browser.close();

    resolve(results)
  })
}

function Golf() {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();
    const url = 'https://www.oddsshark.com/golf/odds/futures'
    
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 0
    });

    let names = await page.evaluate(({}) => {
      return  Array.from(document.querySelectorAll('.op-team-data-wrapper.futures>div'))
      .map(row => {
        const className = row.className
        let rlt = {}
        if (className.indexOf('op-separator-bar op-left') != -1) {
          rlt['day'] = row.querySelector('span').innerHTML.replace(/&nbsp;/gi,'')
        } else {
          rlt['name'] = row.innerHTML
        }
        return rlt;
      })
    },{})

    let values = await page.evaluate(({}) => {
      return  Array.from(document.querySelectorAll('#op-future-results .op-item-row-wrapper'))
      .map(row => {
        let rlt = []
        for (let i = 1 ; i <= 10 ; i += 1) {
          rlt.push(row.querySelector(`.op-item:nth-child(${i})`).innerHTML)
        }
        return rlt;
      })
    },{})

    let results = []
    let day = '-'
    for (let i = 0 ; i < names.length ; i += 1) {
      let item = names[i]
      if (item.day != undefined) {
        day = item.day
      }
      if (item.name != undefined) {
        item['day'] = day
        results.push(item)
      }
    }

    for (let i = 0 ; i < results.length ; i += 1) {
      results[i]['value'] = values[i]
    }

    await page.close();
    await browser.close();

    resolve(results)
  })
}

app.post('/scraping', async (req, res) => {
  try {
    const { sport } = req.body;
    const result = await eval(sport + "()")
    let json = {}
    for (let i = 0 ; i < result.length ; i += 1) {
      json[i+1] = result[i]
    }
    res.send({
      success: 1,
      json: json
    })
  } catch {
    res.send({
      success: 0
    })
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})