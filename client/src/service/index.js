const axios = require('axios');

axios.defaults.baseURL = 'http://localhost:5000';

function scraping(data) {
  return new Promise((resolve, reject) => {
      axios.post('/scraping', {...data})
      .then((resp) => {
        resolve(resp);
      }).catch((error) => {
        reject(error);
      })
  });
}

export const scrapingService = {
  scraping
};
