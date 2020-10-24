const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const cors = require('cors')
const puppeteer = require('puppeteer');

const browserOptions = {
  headless: true,
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

const spreadSselector = '.op-customization-wrapper .dropdown__list .dropdown__list-item:nth-child(nthChild)'
const setting = {
  type: {
    Moneyline: 1, 
    Spread: 2,
  }
}

function NFL(type) {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();
    const url = 'https://www.oddsshark.com/nfl/odds'
    
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 0
    });

    const spread_selector = spreadSselector.replace('nthChild', type)
    await page.waitForSelector(spread_selector);
    await page.evaluate((spread_selector) => document.querySelector(spread_selector).click(), spread_selector); 

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

    resolve({
      results: results,
      url: url
    })
    
  })
}

function NBA(type) {
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

    resolve({
      results: results,
      url: url
    })
  })
}

function MLB(type) {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();
    const url = 'https://www.oddsshark.com/mlb/odds'
    
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 0
    });

    const spread_selector = spreadSselector.replace('nthChild', type)
    await page.waitForSelector(spread_selector);
    await page.evaluate((spread_selector) => document.querySelector(spread_selector).click(), spread_selector); 

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

    resolve({
      results: results,
      url: url
    })
  })
}

function NCAAF(type) {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();
    const url = 'https://www.oddsshark.com/ncaaf/odds'
    
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 0
    });

    const spread_selector = spreadSselector.replace('nthChild', type)
    await page.waitForSelector(spread_selector);
    await page.evaluate((spread_selector) => document.querySelector(spread_selector).click(), spread_selector); 

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

    resolve({
      results: results,
      url: url
    })
  })
}

function NHL(type) {
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

    resolve({
      results: results,
      url: url
    })
  })
}

function UFC(type) {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();
    const url = 'https://www.oddsshark.com/ufc/odds'
    
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 0
    });

    // const spread_selector = spreadSselector.replace('nthChild', type)
    // await page.waitForSelector(spread_selector);
    // await page.evaluate((spread_selector) => document.querySelector(spread_selector).click(), spread_selector); 

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

    resolve({
      results: results,
      url: url
    })
  })
}

function Politics(type) {
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

    resolve({
      results: results,
      url: url
    })
  })
}

function NCAAB(type) {
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

    resolve({
      results: results,
      url: url
    })
  })
}

function BOXING(type) {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();
    const url = 'https://www.oddsshark.com/boxing/odds'
    
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 0
    });

    // const spread_selector = spreadSselector.replace('nthChild', type)
    // await page.waitForSelector(spread_selector);
    // await page.evaluate((spread_selector) => document.querySelector(spread_selector).click(), spread_selector); 

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

    resolve({
      results: results,
      url: url
    })
  })
}

function CFL(type) {
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

    resolve({
      results: results,
      url: url
    })
  })
}

function WNBA(type) {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();
    const url = 'https://www.oddsshark.com/wnba/odds'
    
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 0
    });

    const spread_selector = spreadSselector.replace('nthChild', type)
    await page.waitForSelector(spread_selector);
    await page.evaluate((spread_selector) => document.querySelector(spread_selector).click(), spread_selector); 

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

    resolve({
      results: results,
      url: url
    })
  })
}

function Golf(type) {
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

    resolve({
      results: results,
      url: url
    })
  })
}

app.post('/scraping', async (req, res) => {
  try {
    const { sport, spread } = req.body;
    const type = setting.type[spread]
    const Res = await eval(sport + `(${type})`)
    const result = Res.results
    const url = Res.url
    let json = {}
    for (let i = 0 ; i < result.length ; i += 1) {
      json[i+1] = result[i]
    }
    res.send({
      success: 1,
      json: json,
      url: url
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