const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// 配置中间件
app.use(cors());
app.use(bodyParser.json());

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

// API端点：获取所有留言
app.get('/api/messages', (req, res) => {
    try {
        const messages = readMessages();
        res.status(200).json({
            success: true,
            data: messages,
            message: '获取留言成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取留言失败',
            error: error.message
        });
    }
});

// API端点：创建新留言
app.post('/api/messages', (req, res) => {
    try {
        const { author, content } = req.body;
        
        if (!author || !content) {
            return res.status(400).json({
                success: false,
                message: '作者和内容不能为空'
            });
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
        
        res.status(201).json({
            success: true,
            data: newMessage,
            message: '留言创建成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '留言创建失败',
            error: error.message
        });
    }
});

// 静态文件服务（如果需要部署前端）
app.use(express.static(path.join(__dirname, '../')));

// 健康检查端点
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: '服务器运行正常',
        timestamp: new Date().toISOString()
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`API端点: http://localhost:${PORT}/api/messages`);
    console.log(`健康检查: http://localhost:${PORT}/api/health`);
});
