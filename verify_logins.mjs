import http from 'http';

function login(email, password) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ email, password });
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, success: !!json.token });
        } catch (e) {
          resolve({ status: res.statusCode, success: false });
        }
      });
    });

    req.on('error', (e) => resolve({ status: 'ERR', success: false }));
    req.write(data);
    req.end();
  });
}

async function run() {
  const admin = await login('admin@company.com', 'admin123');
  console.log(`admin@company.com: HTTP ${admin.status}, success: ${admin.success}`);
  const client = await login('client@ecotech.com', 'client123');
  console.log(`client@ecotech.com: HTTP ${client.status}, success: ${client.success}`);
}

run();
