const http = require('http');

const urls = [
    'http://localhost:3001/api/v1/health',
    'http://localhost:3001/api/v1/demandes',
];

urls.forEach(url => {
    http.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`GET ${url} -> Status: ${res.statusCode}`);
            if (res.statusCode === 200) {
                console.log(`Response: ${data}`);
            } else {
                console.log(`Response Error: ${data.substring(0, 100)}...`);
            }
        });
    }).on('error', err => {
        console.log(`GET ${url} -> Error: ${err.message}`);
    });
});
