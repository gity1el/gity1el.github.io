const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3005;

const BASE_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`收到请求: ${req.method} ${req.url}`);
    
    let filePath = req.url === '/' ? '/index.html' : req.url;
    const fullPath = path.join(BASE_DIR, filePath);
    
    console.log(`完整路径: ${fullPath}`);
    console.log(`文件是否存在: ${fs.existsSync(fullPath)}`);

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(fullPath, (error, content) => {
        if (error) {
            console.log(`错误: ${error.code} - ${error.message}`);
            if (error.code == 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>404 - 文件未找到</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('服务器错误: ' + error.code);
            }
        } else {
            console.log(`成功返回文件: ${filePath}`);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`工作目录: ${BASE_DIR}`);
    console.log(`按 Ctrl+C 停止服务器`);
});
