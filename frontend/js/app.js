// Team XP Contact Management System - 完整修复版
// 修复：添加联系人时重复显示的问题

class ContactManager {
    constructor() {
    // API配置
    this.baseUrl = 'http://localhost:8080';
    console.log('ContactManager初始化，baseUrl:', this.baseUrl);
    
    // 应用状态
    this.currentEditId = null;
    this.currentFilter = 'all';
    this.currentSort = 'name-asc';
    this.searchKeyword = '';
    
    // 防重复提交标志
    this.isSubmitting = false;
    this.isLoading = false;
    
    // 事件监听器跟踪
    this.eventListenersBound = false;
    
    console.log('ContactManager 初始化开始');
    this.init();
}
    
    /**
     * 初始化应用
     */
    async init() {
        console.log('初始化开始...');
        
        // 确保DOM完全加载
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }
        
        // 设置UI组件
        this.setupUIComponents();
        
        // 绑定所有事件监听器（确保只绑定一次）
        if (!this.eventListenersBound) {
            this.bindAllEvents();
            this.eventListenersBound = true;
        }
        
        // 加载并显示联系人
        await this.loadAndDisplayContacts();
        
        // 更新统计信息
        await this.updateStatistics();
        
        // 测试API连接
        await this.testAPIConnection();
        
        console.log('ContactManager 初始化完成');
    }
    
    /**
     * 设置UI组件
     */
    setupUIComponents() {
        console.log('设置UI组件...');
        
        // 初始化电话和邮箱字段（确保只初始化一次）
        if (!document.querySelector('.phone-input')) {
            this.addPhoneField();
        }
        if (!document.querySelector('.email-input')) {
            this.addEmailField();
        }
        
        // 设置当前年份
        const footer = document.querySelector('footer');
        if (footer && !footer.querySelector('span:last-child')) {
            const yearSpan = document.createElement('span');
            yearSpan.innerHTML = ` &copy; ${new Date().getFullYear()} Team XP`;
            footer.appendChild(yearSpan);
        }
        
        console.log('UI组件设置完成');
    }
    
    /**
     * 绑定所有事件监听器 - 修复重复绑定问题
     */
    bindAllEvents() {
        console.log('绑定事件监听器...');
        
        // 清除可能存在的旧事件监听器
        this.removeAllEventListeners();
        
        // 绑定表单相关事件（使用一次性绑定）
        this.bindFormEventsOnce();
        
        // 绑定搜索功能
        this.bindSearchEvents();
        
        // 绑定筛选和排序
        this.bindFilterSortEvents();
        
        // 绑定导入导出
        this.bindImportExportEvents();
        
        // 全局点击事件（处理动态生成的元素）
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        
        console.log('事件监听器绑定完成');
    }
    
    /**
     * 移除所有事件监听器（防止重复绑定）
     */
    removeAllEventListeners() {
        console.log('移除旧的事件监听器...');
        
        // 克隆按钮并替换，移除所有事件监听器
        const buttonsToReset = [
            'btnAddPhone', 'btnAddEmail', 'addContactBtn', 
            'cancelEditBtn', 'clearFormBtn', 'clearSearch',
            'btnAllContacts', 'btnFavorites', 'btnRecent',
            'btnExportJSON', 'btnExportExcel', 'btnClearAll',
            'btnRefreshStatus'
        ];
        
        buttonsToReset.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
            }
        });
        
        // 重置输入框的事件
        const inputsToReset = ['searchInput', 'contactName', 'sortSelect'];
        inputsToReset.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                const newInput = input.cloneNode(true);
                input.parentNode.replaceChild(newInput, input);
            }
        });
    }
    
    /**
     * 绑定表单相关事件（确保只绑定一次）
     */
    bindFormEventsOnce() {
        console.log('绑定表单事件（一次性绑定）...');
        
        // 添加电话按钮 - 修复：使用事件委托确保只绑定一次
        document.getElementById('btnAddPhone').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            console.log('点击添加电话按钮');
            this.addPhoneField();
        }, { once: false }); // 注意：这里不能使用{once: true}，因为需要多次点击
        
        // 添加邮箱按钮
        document.getElementById('btnAddEmail').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            console.log('点击添加邮箱按钮');
            this.addEmailField();
        }, { once: false });
        
        // 添加联系人按钮 - 核心修复：防止重复提交
        const addContactBtn = document.getElementById('addContactBtn');
        addContactBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            console.log('点击添加联系人按钮');
            
            // 防止重复点击
            if (this.isSubmitting) {
                console.log('正在提交中，请稍候...');
                this.showMessage('正在处理，请稍候...', 'info');
                return;
            }
            
            this.addContactFromForm();
        }, { once: false });
        
        // 取消编辑按钮
        document.getElementById('cancelEditBtn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.cancelEdit();
        }, { once: false });
        
        // 清除表单按钮
        document.getElementById('clearFormBtn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.clearForm();
        }, { once: false });
        
        // 防止表单意外提交
        const form = document.getElementById('contactForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();
                this.addContactFromForm();
            }, { once: false });
        }
    }
    
    /**
     * 绑定搜索事件
     */
    bindSearchEvents() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            // 使用防抖技术防止频繁搜索
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                this.searchKeyword = e.target.value.trim();
                
                searchTimeout = setTimeout(() => {
                    if (this.searchKeyword) {
                        this.searchContacts(this.searchKeyword);
                    } else {
                        this.loadAndDisplayContacts();
                    }
                }, 300); // 300ms防抖
            }, { once: false });
        }
        
        const clearSearch = document.getElementById('clearSearch');
        if (clearSearch) {
            clearSearch.addEventListener('click', (e) => {
                e.stopImmediatePropagation();
                if (searchInput) searchInput.value = '';
                this.searchKeyword = '';
                this.loadAndDisplayContacts();
            }, { once: false });
        }
    }
    
    /**
     * 绑定筛选和排序事件
     */
    bindFilterSortEvents() {
        // 筛选按钮
        document.getElementById('btnAllContacts').addEventListener('click', (e) => {
            e.stopImmediatePropagation();
            this.showAllContacts();
        }, { once: false });
        
        document.getElementById('btnFavorites').addEventListener('click', (e) => {
            e.stopImmediatePropagation();
            this.showFavorites();
        }, { once: false });
        
        document.getElementById('btnRecent').addEventListener('click', (e) => {
            e.stopImmediatePropagation();
            this.showRecentContacts();
        }, { once: false });
        
        // 排序
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            e.stopImmediatePropagation();
            this.sortContacts(e.target.value);
        }, { once: false });
    }
    
    /**
     * 绑定导入导出事件
     */
    bindImportExportEvents() {
        // 导出按钮
        document.getElementById('btnExportJSON').addEventListener('click', (e) => {
            e.stopImmediatePropagation();
            this.exportToJSON();
        }, { once: false });
        
        document.getElementById('btnExportExcel').addEventListener('click', (e) => {
            e.stopImmediatePropagation();
            this.exportToExcel();
        }, { once: false });
        
        // 导入文件 - 使用事件委托
        document.getElementById('importJSON').addEventListener('change', (e) => {
            e.stopImmediatePropagation();
            this.importFromJSON(e);
        }, { once: false });
        
        document.getElementById('importExcel').addEventListener('change', (e) => {
            e.stopImmediatePropagation();
            this.importFromExcel(e);
        }, { once: false });
        
        // 清除所有数据
        document.getElementById('btnClearAll').addEventListener('click', (e) => {
            e.stopImmediatePropagation();
            this.clearAllContacts();
        }, { once: false });
        
        // 刷新状态按钮
        document.getElementById('btnRefreshStatus').addEventListener('click', (e) => {
            e.stopImmediatePropagation();
            this.testAPIConnection();
        }, { once: false });
    }
    
    /**
     * 处理全局点击事件（用于动态生成的元素）
     */
    handleGlobalClick(e) {
        // 处理删除电话/邮箱按钮
        if (e.target.closest('.btn-remove')) {
            const button = e.target.closest('.btn-remove');
            const inputGroup = button.parentElement;
            
            if (inputGroup.querySelector('.phone-input')) {
                this.removePhoneField(button);
            } else if (inputGroup.querySelector('.email-input')) {
                this.removeEmailField(button);
            }
        }
        
        // 处理收藏按钮
        if (e.target.closest('.favorite-star')) {
            const star = e.target.closest('.favorite-star');
            const contactId = star.getAttribute('data-id');
            if (contactId) {
                this.toggleFavorite(parseInt(contactId));
            }
        }
        
        // 处理编辑按钮
        if (e.target.closest('.btn-edit')) {
            const editBtn = e.target.closest('.btn-edit');
            const contactId = editBtn.closest('.contact-item')?.getAttribute('data-id');
            if (contactId) {
                this.editContact(parseInt(contactId));
            }
        }
        
        // 处理删除联系人按钮
        if (e.target.closest('.btn-delete')) {
            const deleteBtn = e.target.closest('.btn-delete');
            const contactId = deleteBtn.closest('.contact-item')?.getAttribute('data-id');
            if (contactId) {
                this.deleteContact(parseInt(contactId));
            }
        }
    }
    
    /**
     * 添加联系人表单处理 - 修复重复提交问题
     */
    async addContactFromForm() {
        console.log('开始处理添加联系人表单');
        
        // 防止重复提交
        if (this.isSubmitting) {
            console.log('正在提交中，跳过重复请求');
            return;
        }
        
        this.isSubmitting = true;
        this.showLoading();
        
        try {
            // 获取表单数据
            const name = document.getElementById('contactName').value.trim();
            const address = document.getElementById('contactAddress').value.trim();
            const notes = document.getElementById('contactNotes').value.trim();
            const tagsInput = document.getElementById('contactTags').value.trim();
            const isFavorite = document.getElementById('contactFavorite').checked;
            
            // 获取电话
            const phoneInputs = document.querySelectorAll('.phone-input');
            const phones = Array.from(phoneInputs)
                .map(input => input.value.trim())
                .filter(phone => phone.length > 0);
            
            // 获取邮箱
            const emailInputs = document.querySelectorAll('.email-input');
            const emails = Array.from(emailInputs)
                .map(input => input.value.trim())
                .filter(email => email.length > 0);
            
            console.log('表单数据:', { name, phones, emails, isFavorite });
            
            // 验证
            if (!name) {
                this.showMessage('姓名是必填项!', 'error');
                document.getElementById('contactName').focus();
                return;
            }
            
            if (phones.length === 0) {
                this.showMessage('至少需要一个电话号码!', 'error');
                const firstPhoneInput = document.querySelector('.phone-input');
                if (firstPhoneInput) firstPhoneInput.focus();
                return;
            }
            
            // 验证电话号码格式
            for (const phone of phones) {
                if (!this.isValidPhone(phone)) {
                    this.showMessage(`无效的电话号码: ${phone}`, 'error');
                    return;
                }
            }
            
            // 验证邮箱格式
            for (const email of emails) {
                if (email && !this.isValidEmail(email)) {
                    this.showMessage(`无效的邮箱地址: ${email}`, 'error');
                    return;
                }
            }
            
            // 解析标签
            const tags = tagsInput.split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);
            
            // 准备请求数据
            const contactData = {
                name: name,
                phones: phones,
                emails: emails,
                address: address,
                isFavorite: isFavorite,
                tags: tags,
                notes: notes
            };
            
            console.log('准备发送的数据:', contactData);
            
            let result;
            let url = `${this.baseUrl}/contacts`;
            let method = 'POST';
            
            if (this.currentEditId) {
                // 更新现有联系人
                url = `${this.baseUrl}/contacts/${this.currentEditId}`;
                method = 'PUT';
            }
            
            console.log(`发送${method}请求到: ${url}`);
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(contactData)
            });
            
            console.log('API响应状态:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            result = await response.json();
            console.log('API响应数据:', result);
            
            if (this.currentEditId) {
                this.showMessage(`联系人 "${name}" 更新成功!`, 'success');
                this.currentEditId = null;
                
                // 更新按钮文本
                document.getElementById('addContactBtn').innerHTML = '<i class="fas fa-user-plus"></i> 添加联系人';
                document.getElementById('cancelEditBtn').style.display = 'none';
            } else {
                this.showMessage(`联系人 "${name}" 添加成功!`, 'success');
            }
            
            // 清除表单
            this.clearForm();
            
            // 重新加载并显示联系人（只调用一次）
            await this.loadAndDisplayContacts();
            
        } catch (error) {
            console.error('保存联系人失败:', error);
            this.showMessage(`保存失败: ${error.message}`, 'error');
        } finally {
            this.isSubmitting = false;
            this.hideLoading();
        }
    }
    
    /**
     * 显示加载指示器
     */
    showLoading() {
        // 移除现有的加载指示器
        const existingLoader = document.getElementById('global-loader');
        if (existingLoader) existingLoader.remove();
        
        const loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.className = 'loading-overlay';
        loader.innerHTML = `
            <div class="loading-spinner"></div>
            <p>处理中...</p>
        `;
        document.body.appendChild(loader);
    }
    
    /**
     * 隐藏加载指示器
     */
    hideLoading() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                if (loader.parentNode) loader.parentNode.removeChild(loader);
            }, 300);
        }
    }
    
    /**
     * 添加电话字段
     */
    addPhoneField(value = '') {
        console.log('添加电话字段');
        const phoneContainer = document.getElementById('phoneContainer');
        if (!phoneContainer) {
            console.error('电话容器未找到');
            return;
        }
        
        const phoneCount = phoneContainer.children.length;
        const isFirst = phoneCount === 0;
        
        const phoneDiv = document.createElement('div');
        phoneDiv.className = 'input-group';
        phoneDiv.innerHTML = `
            <input type="tel" class="phone-input" placeholder="${isFirst ? '电话 *' : '其他电话'}" value="${value}">
            <button type="button" class="btn btn-remove" title="删除此电话">
                <i class="fas fa-minus"></i>
            </button>
        `;
        
        phoneContainer.appendChild(phoneDiv);
        
        // 更新删除按钮可见性
        this.updateRemoveButtonVisibility('phoneContainer');
        
        // 聚焦到新输入框
        setTimeout(() => {
            const input = phoneDiv.querySelector('.phone-input');
            if (input) input.focus();
        }, 10);
    }
    
    /**
     * 移除电话字段
     */
    removePhoneField(button) {
        const inputGroup = button.parentElement;
        const phoneContainer = document.getElementById('phoneContainer');
        
        if (!phoneContainer || !inputGroup) return;
        
        // 至少保留一个电话字段
        if (phoneContainer.children.length > 1) {
            inputGroup.remove();
            this.updateRemoveButtonVisibility('phoneContainer');
        }
    }
    
    /**
     * 添加邮箱字段
     */
    addEmailField(value = '') {
        console.log('添加邮箱字段');
        const emailContainer = document.getElementById('emailContainer');
        if (!emailContainer) {
            console.error('邮箱容器未找到');
            return;
        }
        
        const emailCount = emailContainer.children.length;
        const isFirst = emailCount === 0;
        
        const emailDiv = document.createElement('div');
        emailDiv.className = 'input-group';
        emailDiv.innerHTML = `
            <input type="email" class="email-input" placeholder="${isFirst ? '邮箱' : '其他邮箱'}" value="${value}">
            <button type="button" class="btn btn-remove" title="删除此邮箱">
                <i class="fas fa-minus"></i>
            </button>
        `;
        
        emailContainer.appendChild(emailDiv);
        
        // 更新删除按钮可见性
        this.updateRemoveButtonVisibility('emailContainer');
        
        // 聚焦到新输入框
        setTimeout(() => {
            const input = emailDiv.querySelector('.email-input');
            if (input) input.focus();
        }, 10);
    }
    
    /**
     * 移除邮箱字段
     */
    removeEmailField(button) {
        const inputGroup = button.parentElement;
        const emailContainer = document.getElementById('emailContainer');
        
        if (!emailContainer || !inputGroup) return;
        
        // 至少保留一个邮箱字段
        if (emailContainer.children.length > 1) {
            inputGroup.remove();
            this.updateRemoveButtonVisibility('emailContainer');
        }
    }
    
    /**
     * 更新删除按钮可见性
     */
    updateRemoveButtonVisibility(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const removeButtons = container.querySelectorAll('.btn-remove');
        
        if (removeButtons.length === 1) {
            removeButtons[0].style.display = 'none';
        } else {
            removeButtons.forEach(btn => {
                if (btn) btn.style.display = 'flex';
            });
        }
    }
    
    /**
     * 清除表单
     */
    clearForm() {
        document.getElementById('contactName').value = '';
        document.getElementById('contactAddress').value = '';
        document.getElementById('contactNotes').value = '';
        document.getElementById('contactTags').value = '';
        document.getElementById('contactFavorite').checked = false;
        
        // 清除电话字段并添加一个默认字段
        const phoneContainer = document.getElementById('phoneContainer');
        phoneContainer.innerHTML = '';
        this.addPhoneField();
        
        // 清除邮箱字段并添加一个默认字段
        const emailContainer = document.getElementById('emailContainer');
        emailContainer.innerHTML = '';
        this.addEmailField();
        
        // 聚焦到姓名字段
        document.getElementById('contactName').focus();
    }
    
    /**
     * 取消编辑
     */
    cancelEdit() {
        this.currentEditId = null;
        this.clearForm();
        document.getElementById('addContactBtn').innerHTML = '<i class="fas fa-user-plus"></i> 添加联系人';
        document.getElementById('cancelEditBtn').style.display = 'none';
        this.showMessage('编辑已取消', 'info');
    }
    
    /**
     * 从API加载联系人并显示
     */
    async loadAndDisplayContacts() {
        // 防止重复加载
        if (this.isLoading) {
            console.log('正在加载联系人，跳过重复请求');
            return;
        }
        
        this.isLoading = true;
        
        try {
            const contacts = await this.apiRequest('/contacts');
            this.displayContacts(contacts);
        } catch (error) {
            console.error('加载联系人失败:', error);
            this.showMessage('无法从服务器加载联系人', 'error');
        } finally {
            this.isLoading = false;
        }
    }
    
    /**
     * API请求辅助方法
     */
    async apiRequest(endpoint, options = {}) {
    try {
        const url = `${this.baseUrl}${endpoint}`;
        console.log(`API请求: ${url}`, options.method || 'GET');
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        const mergedOptions = { ...defaultOptions, ...options };
        
        const response = await fetch(url, mergedOptions);
        console.log(`API响应状态: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorData || response.statusText}`);
        }
        
        // 对于204 No Content响应，返回null
        if (response.status === 204) {
            return null;
        }
        
        // 检查响应内容类型
        const contentType = response.headers.get('content-type') || '';
        console.log('响应Content-Type:', contentType);
        
        // Excel文件处理 - 更宽松的匹配
        if (contentType.includes('excel') || 
            contentType.includes('spreadsheetml') ||
            contentType.includes('octet-stream')) {
            // Excel文件处理
            console.log('检测到Excel响应，返回Blob');
            return await response.blob();
        }
        
        if (contentType.includes('application/json')) {
            return await response.json();
        }
        
        return await response.text();
        
    } catch (error) {
        console.error('API请求失败:', error);
        this.showMessage(`API错误: ${error.message}`, 'error');
        throw error;
    }
}
    
    /**
     * 显示联系人
     */
    displayContacts(contacts = []) {
        const contactsList = document.getElementById('contactsList');
        const displayCount = document.getElementById('displayCount');
        
        // 更新显示数量
        displayCount.textContent = contacts.length;
        
        if (contacts.length === 0) {
            let emptyMessage = '';
            
            switch (this.currentFilter) {
                case 'favorites':
                    emptyMessage = '暂无收藏联系人。点击星形图标将联系人添加到收藏。';
                    break;
                case 'recent':
                    emptyMessage = '暂无最近添加的联系人。最近7天内添加的联系人将显示在这里。';
                    break;
                default:
                    if (this.searchKeyword) {
                        emptyMessage = `未找到匹配 "${this.searchKeyword}" 的联系人。请尝试其他搜索词。`;
                    } else {
                        emptyMessage = '暂无联系人。点击"添加联系人"创建第一个联系人。';
                    }
            }
            
            contactsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-address-book"></i>
                    <h3>暂无联系人</h3>
                    <p>${emptyMessage}</p>
                    <button class="btn btn-primary" onclick="window.contactManager.clearForm()">
                        <i class="fas fa-user-plus"></i> 添加第一个联系人
                    </button>
                </div>
            `;
            
            return;
        }
        
        // 应用排序
        const sortedContacts = this.sortContactsList(contacts);
        
        // 清除现有联系人列表
        contactsList.innerHTML = '';
        
        // 生成HTML并添加
        sortedContacts.forEach(contact => {
            contactsList.innerHTML += this.generateContactHTML(contact);
        });
    }
    
    /**
     * 生成联系人HTML
     */
    generateContactHTML(contact) {
        const favoriteClass = contact.isFavorite ? 'active' : '';
        const favoriteTooltip = contact.isFavorite ? '取消收藏' : '添加到收藏';
        
        // 格式化日期
        const createdDate = new Date(contact.createdAt);
        const formattedDate = createdDate.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const modifiedDate = new Date(contact.lastModified);
        const formattedModified = modifiedDate.toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
        <div class="contact-item ${contact.isFavorite ? 'favorite' : ''}" data-id="${contact.id}">
            <div class="contact-item-header">
                <div class="contact-name-container">
                    <span class="contact-name">${this.escapeHtml(contact.name)}</span>
                    <i class="fas fa-star favorite-star ${favoriteClass}"
                       onclick="window.contactManager.toggleFavorite(${contact.id})"
                       title="${favoriteTooltip}"
                       data-id="${contact.id}"></i>
                    ${contact.isFavorite ? '<span class="favorite-badge">收藏</span>' : ''}
                </div>
                <div class="contact-actions">
                    <button class="btn btn-edit" onclick="window.contactManager.editContact(${contact.id})">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="btn btn-delete" onclick="window.contactManager.deleteContact(${contact.id})">
                        <i class="fas fa-trash-alt"></i> 删除
                    </button>
                </div>
            </div>
            
            ${contact.tags && contact.tags.length > 0 ? `
            <div class="contact-tags">
                ${contact.tags.map(tag => `
                <span class="tag">${this.escapeHtml(tag)}</span>
                `).join('')}
            </div>
            ` : ''}
            
            <div class="contact-details">
                ${contact.phones && contact.phones.length > 0 ? `
                <div class="detail-group">
                    <h4><i class="fas fa-phone"></i> 电话号码</h4>
                    <div class="detail-list">
                        ${contact.phones.map((phone, index) => `
                        <div class="detail-item phone-item">
                            <i class="fas ${index === 0 ? 'fa-phone-alt' : 'fa-phone'}"></i>
                            <span>${this.escapeHtml(phone)}</span>
                            ${index === 0 ? '<span class="badge primary">主要</span>' : ''}
                        </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${contact.emails && contact.emails.length > 0 ? `
                <div class="detail-group">
                    <h4><i class="fas fa-envelope"></i> 邮箱地址</h4>
                    <div class="detail-list">
                        ${contact.emails.map((email, index) => `
                        <div class="detail-item email-item">
                            <i class="fas ${index === 0 ? 'fa-envelope' : 'fa-envelope-open'}"></i>
                            <span>${this.escapeHtml(email)}</span>
                            ${index === 0 ? '<span class="badge primary">主要</span>' : ''}
                        </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${contact.address ? `
                <div class="detail-group">
                    <h4><i class="fas fa-map-marker-alt"></i> 地址</h4>
                    <div class="detail-item">
                        <i class="fas fa-home"></i>
                        <span>${this.escapeHtml(contact.address)}</span>
                    </div>
                </div>
                ` : ''}
                
                ${contact.notes ? `
                <div class="contact-notes">
                    <h4><i class="fas fa-sticky-note"></i> 备注</h4>
                    <p>${this.escapeHtml(contact.notes)}</p>
                </div>
                ` : ''}
            </div>
            
            <div class="contact-meta">
                <span>创建时间: ${formattedDate}</span>
                <span>最后修改: ${formattedModified}</span>
            </div>
        </div>
        `;
    }
    
    /**
     * 排序联系人列表
     */
    sortContactsList(contacts) {
        const sorted = [...contacts];
        
        switch (this.currentSort) {
            case 'name-asc':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                sorted.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'date-newest':
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'date-oldest':
                sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'favorites-first':
                sorted.sort((a, b) => {
                    if (a.isFavorite && !b.isFavorite) return -1;
                    if (!a.isFavorite && b.isFavorite) return 1;
                    return a.name.localeCompare(b.name);
                });
                break;
            default:
                sorted.sort((a, b) => a.name.localeCompare(b.name));
        }
        
        return sorted;
    }
    
    /**
     * 排序联系人
     */
    sortContacts(sortBy) {
        this.currentSort = sortBy;
        this.loadAndDisplayContacts();
        
        this.showMessage(`已按 ${document.getElementById('sortSelect').options[document.getElementById('sortSelect').selectedIndex].text} 排序`, 'info');
    }
    
    /**
     * 显示所有联系人
     */
    async showAllContacts() {
        this.currentFilter = 'all';
        this.updateFilterButtons();
        await this.loadAndDisplayContacts();
    }
    
    /**
     * 显示收藏联系人
     */
    async showFavorites() {
        try {
            const favorites = await this.apiRequest('/contacts/favorites');
            this.displayContacts(favorites);
            this.currentFilter = 'favorites';
            this.updateFilterButtons();
        } catch (error) {
            console.error('获取收藏联系人失败:', error);
        }
    }
    
    /**
     * 显示最近联系人
     */
    async showRecentContacts() {
        try {
            const allContacts = await this.apiRequest('/contacts');
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            
            const recent = allContacts.filter(contact => {
                const contactDate = new Date(contact.createdAt);
                return contactDate >= oneWeekAgo;
            });
            
            this.displayContacts(recent);
            this.currentFilter = 'recent';
            this.updateFilterButtons();
        } catch (error) {
            console.error('获取最近联系人失败:', error);
        }
    }
    
    /**
     * 更新筛选按钮状态
     */
    updateFilterButtons() {
        const buttons = document.querySelectorAll('.btn-filter');
        buttons.forEach(btn => btn.classList.remove('active'));
        
        let activeClass = '';
        switch (this.currentFilter) {
            case 'all': activeClass = '所有联系人'; break;
            case 'favorites': activeClass = '收藏'; break;
            case 'recent': activeClass = '最近'; break;
        }
        
        const activeButton = Array.from(buttons).find(btn => 
            btn.textContent.includes(activeClass)
        );
        
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }
    
    /**
     * 搜索联系人
     */
    async searchContacts(keyword) {
        if (!keyword || keyword.trim() === '') {
            await this.loadAndDisplayContacts();
            return;
        }
        
        try {
            const results = await this.apiRequest(`/contacts/search?keyword=${encodeURIComponent(keyword)}`);
            this.displayContacts(results);
            
            if (results.length === 0) {
                this.showMessage(`未找到匹配 "${keyword}" 的联系人`, 'info');
            } else {
                this.showMessage(`找到 ${results.length} 个匹配 "${keyword}" 的联系人`, 'info');
            }
            
        } catch (error) {
            console.error('搜索失败:', error);
        }
    }
    
    /**
     * 编辑联系人
     */
    async editContact(id) {
        try {
            const contact = await this.apiRequest(`/contacts/${id}`);
            
            // 填充表单
            document.getElementById('contactName').value = contact.name;
            document.getElementById('contactAddress').value = contact.address || '';
            document.getElementById('contactNotes').value = contact.notes || '';
            document.getElementById('contactTags').value = contact.tags.join(', ');
            document.getElementById('contactFavorite').checked = contact.isFavorite;
            
            // 填充电话字段
            const phoneContainer = document.getElementById('phoneContainer');
            phoneContainer.innerHTML = '';
            
            if (contact.phones.length === 0) {
                this.addPhoneField();
            } else {
                contact.phones.forEach((phone, index) => {
                    this.addPhoneField(phone);
                });
            }
            
            // 填充邮箱字段
            const emailContainer = document.getElementById('emailContainer');
            emailContainer.innerHTML = '';
            
            if (contact.emails.length === 0) {
                this.addEmailField();
            } else {
                contact.emails.forEach((email, index) => {
                    this.addEmailField(email);
                });
            }
            
            // 切换到编辑模式
            this.currentEditId = id;
            document.getElementById('addContactBtn').innerHTML = '<i class="fas fa-save"></i> 更新联系人';
            document.getElementById('cancelEditBtn').style.display = 'inline-block';
            
            // 滚动到表单
            document.getElementById('contactForm').scrollIntoView({ behavior: 'smooth' });
            
            // 聚焦到姓名字段
            document.getElementById('contactName').focus();
            
            this.showMessage(`正在编辑联系人: ${contact.name}`, 'info');
            
        } catch (error) {
            console.error('加载联系人失败:', error);
            this.showMessage('无法加载联系人信息', 'error');
        }
    }
    
    /**
     * 切换收藏状态
     */
    async toggleFavorite(id) {
        try {
            const contact = await this.apiRequest(`/contacts/${id}/favorite`, {
                method: 'PATCH'
            });
            
            const status = contact.isFavorite ? '已收藏' : '取消收藏';
            this.showMessage(`联系人 "${contact.name}" ${status}`, 'success');
            
            // 如果当前显示的是收藏列表，则刷新
            if (this.currentFilter === 'favorites') {
                await this.loadAndDisplayContacts();
            } else {
                // 更新当前联系人的显示
                const contactElement = document.querySelector(`.contact-item[data-id="${id}"]`);
                if (contactElement) {
                    const starElement = contactElement.querySelector('.favorite-star');
                    if (starElement) {
                        if (contact.isFavorite) {
                            starElement.classList.add('active');
                            contactElement.classList.add('favorite');
                        } else {
                            starElement.classList.remove('active');
                            contactElement.classList.remove('favorite');
                        }
                    }
                }
            }
            
            // 更新统计信息
            await this.updateStatistics();
            
        } catch (error) {
            console.error('切换收藏状态失败:', error);
        }
    }
    
    /**
     * 删除联系人
     */
    async deleteContact(id) {
        if (!confirm('确定要删除这个联系人吗？此操作无法撤销。')) {
            return;
        }
        
        try {
            await this.apiRequest(`/contacts/${id}`, {
                method: 'DELETE'
            });
            
            this.showMessage('联系人删除成功', 'success');
            await this.loadAndDisplayContacts();
            
        } catch (error) {
            console.error('删除联系人失败:', error);
        }
    }
    
    /**
     * 更新统计信息
     */
    async updateStatistics() {
        try {
            const contacts = await this.apiRequest('/contacts');
            
            // 计算统计
            const totalContacts = contacts.length;
            const favoriteContacts = contacts.filter(c => c.isFavorite).length;
            const totalPhones = contacts.reduce((sum, contact) => sum + (contact.phones ? contact.phones.length : 0), 0);
            const totalEmails = contacts.reduce((sum, contact) => sum + (contact.emails ? contact.emails.length : 0), 0);
            
            // 更新DOM
            document.getElementById('totalContacts').textContent = totalContacts;
            document.getElementById('favoriteContacts').textContent = favoriteContacts;
            document.getElementById('totalPhones').textContent = totalPhones;
            document.getElementById('totalEmails').textContent = totalEmails;
            
        } catch (error) {
            console.error('更新统计信息失败:', error);
        }
    }
    
    /**
     * 导出为JSON
     */
    async exportToJSON() {
        try {
            const jsonData = await this.apiRequest('/contacts/export/json');
            
            // 创建下载链接
            const dataStr = typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = window.URL.createObjectURL(dataBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `contacts_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.showMessage('JSON文件导出成功', 'success');
            
        } catch (error) {
            console.error('导出JSON失败:', error);
        }
    }
    
    /**
     * 导出为Excel
     */
    async exportToExcel() {
    console.log('开始导出Excel...');
    
    // 防止重复点击
    if (this.isSubmitting) {
        console.log('正在处理中，请稍候...');
        return;
    }
    
    this.isSubmitting = true;
    this.showLoading();
    
    try {
        const url = `${this.baseUrl}/contacts/export/excel`;
        console.log('请求URL:', url);
        
        // 直接使用fetch，不经过apiRequest包装
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream'
            },
            credentials: 'same-origin' // 如果有cookie需要发送
        });
        
        console.log('响应状态:', response.status, response.statusText);
        console.log('响应类型:', response.headers.get('content-type'));
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }
        
        // 确保获取到Blob
        const blob = await response.blob();
        console.log('获取到Blob:', {
            size: blob.size,
            type: blob.type,
            isBlob: blob instanceof Blob
        });
        
        if (!blob || blob.size === 0) {
            throw new Error('Excel文件为空或未生成');
        }
        
        // 创建下载链接
        const downloadUrl = window.URL.createObjectURL(blob);
        console.log('创建的ObjectURL:', downloadUrl);
        
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `contacts_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        // 添加到DOM并点击
        document.body.appendChild(a);
        a.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
            console.log('已清理ObjectURL');
        }, 100);
        
        this.showMessage('Excel文件导出成功！正在下载...', 'success');
        console.log('Excel导出完成');
        
    } catch (error) {
        console.error('导出Excel失败:', error);
        this.showMessage(`导出失败: ${error.message}`, 'error');
    } finally {
        this.isSubmitting = false;
        this.hideLoading();
    }
}
    
    /**
     * 导入JSON文件
     */
    async importFromJSON(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.name.toLowerCase().endsWith('.json')) {
            this.showMessage('请选择JSON文件', 'error');
            event.target.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const jsonContent = e.target.result;
                
                const importedContacts = await this.apiRequest('/contacts/import/json', {
                    method: 'POST',
                    body: jsonContent
                });
                
                this.showMessage(`成功导入 ${importedContacts.length} 个联系人`, 'success');
                
                // 重新加载联系人
                await this.loadAndDisplayContacts();
                
            } catch (error) {
                console.error('导入JSON失败:', error);
                this.showMessage(`导入失败: ${error.message}`, 'error');
            }
            
            // 清除文件输入
            event.target.value = '';
        };
        
        reader.onerror = () => {
            this.showMessage('读取文件失败', 'error');
            event.target.value = '';
        };
        
        reader.readAsText(file);
    }
    
    /**
     * 导入Excel文件
     */
    async importFromExcel(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // 检查文件类型
        if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
            this.showMessage('请选择Excel文件 (.xlsx 或 .xls)', 'error');
            event.target.value = '';
            return;
        }
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            // 使用fetch直接发送
            const response = await fetch(`${this.baseUrl}/contacts/import/excel`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`导入失败: ${response.status}`);
            }
            
            const importedContacts = await response.json();
            
            this.showMessage(`成功导入 ${importedContacts.length} 个联系人`, 'success');
            
            // 重新加载联系人
            await this.loadAndDisplayContacts();
            
        } catch (error) {
            console.error('导入Excel失败:', error);
            this.showMessage(`导入失败: ${error.message}`, 'error');
        } finally {
            // 清除文件输入
            event.target.value = '';
        }
    }
    
    /**
     * 清除所有联系人
     */
    async clearAllContacts() {
        try {
            const contacts = await this.apiRequest('/contacts');
            
            if (contacts.length === 0) {
                this.showMessage('没有联系人可清除', 'info');
                return;
            }
            
            if (!confirm(`确定要删除所有 ${contacts.length} 个联系人吗？此操作无法撤销！`)) {
                return;
            }
            
            // 逐个删除所有联系人
            for (const contact of contacts) {
                await this.apiRequest(`/contacts/${contact.id}`, {
                    method: 'DELETE'
                });
            }
            
            this.showMessage('所有联系人已清除', 'success');
            await this.loadAndDisplayContacts();
            
        } catch (error) {
            console.error('清除联系人失败:', error);
            this.showMessage('清除联系人失败', 'error');
        }
    }
    
    /**
     * 测试API连接
     */
    async testAPIConnection() {
        const statusElement = document.getElementById('apiStatus');
        if (!statusElement) return;
        
        try {
            statusElement.textContent = '连接中...';
            statusElement.style.color = 'orange';
            
            const response = await fetch(`${this.baseUrl}/health`);
            
            if (response.ok) {
                statusElement.textContent = '已连接';
                statusElement.style.color = 'green';
            } else {
                statusElement.textContent = '连接失败';
                statusElement.style.color = 'red';
            }
        } catch (error) {
            statusElement.textContent = '连接错误';
            statusElement.style.color = 'red';
            console.error('API连接测试失败:', error);
        }
    }
    
    /**
     * 显示消息
     */
    showMessage(message, type = 'info') {
        // 移除现有消息
        const existingMessages = document.querySelectorAll('#messageArea .message');
        existingMessages.forEach(msg => msg.remove());
        
        // 创建消息元素
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        
        // 根据消息类型添加图标
        let icon = '';
        switch (type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-exclamation-circle"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle"></i>';
                break;
            default:
                icon = '<i class="fas fa-info-circle"></i>';
        }
        
        messageDiv.innerHTML = `${icon} ${message}`;
        
        // 添加到消息区域
        const messageArea = document.getElementById('messageArea');
        if (messageArea) {
            messageArea.appendChild(messageDiv);
        } else {
            // 备用：添加到header之后
            const header = document.querySelector('header');
            header.parentNode.insertBefore(messageDiv, header.nextSibling);
        }
        
        // 5秒后自动移除
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.opacity = '0';
                messageDiv.style.transition = 'opacity 0.5s';
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.remove();
                    }
                }, 500);
            }
        }, 5000);
    }
    
    /**
     * 验证电话号码
     */
    isValidPhone(phone) {
        // 简单验证：至少7位数字
        const digits = phone.replace(/\D/g, '');
        return digits.length >= 7;
    }
    
    /**
     * 验证邮箱地址
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    /**
     * 转义HTML防止XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 全局实例
window.contactManager = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，初始化ContactManager...');
    
    // 确保只初始化一次
    if (!window.contactManager) {
        window.contactManager = new ContactManager();
    }
});// 添加联系人搜索功能优化
