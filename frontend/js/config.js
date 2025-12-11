// config.js - 环境配置文件
const Config = {
    // 开发环境配置
    development: {
        apiBaseUrl: 'http://localhost:8080',
        useMockData: false,
        debugMode: true,
        logApiCalls: true
    },
    
    // 生产环境配置（部署后需要修改）
    production: {
        apiBaseUrl: '',  // 留空表示使用相对路径
        useMockData: false,
        debugMode: false,
        logApiCalls: false
    },
    
    // 测试环境配置
    test: {
        apiBaseUrl: 'http://localhost:8080',
        useMockData: true,
        debugMode: true,
        logApiCalls: true
    },
    
    // 获取当前环境配置
    getCurrentConfig() {
        const hostname = window.location.hostname;
        const port = window.location.port;
        
        // 判断环境
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
            // 本地开发环境
            console.log('当前环境: 开发环境');
            return this.development;
        } else if (hostname.includes('test') || hostname.includes('staging')) {
            // 测试环境
            console.log('当前环境: 测试环境');
            return this.test;
        } else {
            // 生产环境
            console.log('当前环境: 生产环境');
            return this.production;
        }
    },
    
    // 获取API基础URL
    getApiBaseUrl() {
        const config = this.getCurrentConfig();
        return config.apiBaseUrl || '';
    },
    
    // 是否启用调试模式
    isDebugMode() {
        const config = this.getCurrentConfig();
        return config.debugMode;
    },
    
    // 是否记录API调用
    shouldLogApiCalls() {
        const config = this.getCurrentConfig();
        return config.logApiCalls;
    },
    
    // 是否使用模拟数据
    shouldUseMockData() {
        const config = this.getCurrentConfig();
        return config.useMockData;
    },
    
    // API端点配置
    endpoints: {
        contacts: '/contacts',
        favorites: '/contacts/favorites',
        exportExcel: '/contacts/export/excel',
        importExcel: '/contacts/import/excel',
        exportJson: '/contacts/export/json',
        importJson: '/contacts/import/json',
        search: '/contacts/search',
        health: '/health',
        test: '/test',
        info: '/info'
    },
    
    // 获取完整的API URL
    getFullUrl(endpoint) {
        const baseUrl = this.getApiBaseUrl();
        const endpointPath = this.endpoints[endpoint] || endpoint;
        
        if (baseUrl && !endpointPath.startsWith('http')) {
            return `${baseUrl}${endpointPath}`;
        }
        
        return endpointPath;
    },
    
    // 模拟数据（用于测试）
    mockData: {
        contacts: [
            {
                id: 1,
                name: "张三",
                phones: ["13800138000"],
                emails: ["zhangsan@example.com"],
                address: "北京市海淀区",
                isFavorite: true,
                tags: ["同事", "重要"],
                notes: "项目经理",
                createdAt: "2024-01-15T10:30:00.000Z",
                lastModified: "2024-01-15T10:30:00.000Z"
            },
            {
                id: 2,
                name: "李四",
                phones: ["13900139000", "13900239000"],
                emails: ["lisi@company.com"],
                address: "上海市浦东新区",
                isFavorite: false,
                tags: ["朋友"],
                notes: "大学同学",
                createdAt: "2024-01-20T14:45:00.000Z",
                lastModified: "2024-01-20T14:45:00.000Z"
            }
        ]
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Config;
}