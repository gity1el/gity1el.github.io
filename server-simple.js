const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3002;

// 留言数据文件路径
const MESSAGES_FILE = path.join(__dirname, 'data', 'messages.json');

// 确保数据目录存在
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// 确保留言文件存在
if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify([]), 'utf8');
}

// 读取所有留言
const readMessages = () => {
    const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
    return JSON.parse(data);
};

// 写入留言
const writeMessages = (messages) => {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf8');
};

// 解析请求体
const parseBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (error) {
                reject(new Error('Invalid JSON'));
            }
        });
        req.on('error', reject);
    });
};

// 发送文件
const sendFile = (res, filePath, contentType = 'text/plain') => {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify({
                success: false,
                message: '文件不存在'
            }));
            return;
        }
        res.setHeader('Content-Type', contentType);
        res.writeHead(200);
        res.end(data);
    });
};

// 创建HTTP服务器
const server = http.createServer(async (req, res) => {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理OPTIONS请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // 根路径返回前端页面
    if (pathname === '/' && req.method === 'GET') {
        const htmlPath = path.join(__dirname, '../', '冬至祝福留言板.html');
        sendFile(res, htmlPath, 'text/html; charset=utf-8');
        return;
    }

    // API端点：获取所有留言
    if (pathname === '/api/messages' && req.method === 'GET') {
        try {
            const messages = readMessages();
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.writeHead(200);
            res.end(JSON.stringify({
                success: true,
                data: messages,
                message: '获取留言成功'
            }));
        } catch (error) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.writeHead(500);
            res.end(JSON.stringify({
                success: false,
                message: '获取留言失败',
                error: error.message
            }));
        }
    }
    // API端点：创建新留言
    else if (pathname === '/api/messages' && req.method === 'POST') {
        try {
            const body = await parseBody(req);
            const { author, content } = body;

            if (!author || !content) {
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.writeHead(400);
                res.end(JSON.stringify({
                    success: false,
                    message: '作者和内容不能为空'
                }));
                return;
            }

            const now = new Date();
            const newMessage = {
                id: Date.now().toString(),
                author,
                content,
                time: now.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                createdAt: now.toISOString()
            };

            const messages = readMessages();
            messages.push(newMessage);
            writeMessages(messages);

            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.writeHead(201);
            res.end(JSON.stringify({
                success: true,
                data: newMessage,
                message: '留言创建成功'
            }));
        } catch (error) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.writeHead(500);
            res.end(JSON.stringify({
                success: false,
                message: '留言创建失败',
                error: error.message
            }));
        }
    }
    // API端点：健康检查
    else if (pathname === '/api/health' && req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.writeHead(200);
        res.end(JSON.stringify({
            success: true,
            message: '服务器运行正常',
            timestamp: new Date().toISOString()
        }));
    }
    // 404 - 未找到
    else {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.writeHead(404);
        res.end(JSON.stringify({
            success: false,
            message: '接口不存在'
        }));
    }
});

// 启动服务器
server.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`API端点: http://localhost:${PORT}/api/messages`);
    console.log(`健康检查: http://localhost:${PORT}/api/health`);
});
