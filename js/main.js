// 自动检测API地址，适配局域网访问
const API_BASE = (() => {
    const protocol = window.location.protocol;
    const host = window.location.host;
    return `${protocol}//${host}/api`;
})();
let currentUser = null;
let token = localStorage.getItem('campus_mate_token');

document.addEventListener('DOMContentLoaded', function() {
    initAuth();
    initNavigation();
    initSearch();
    initHomePage();
    initCompetitionPage();
    initMealPage();
    initHobbyPage();
    initProfilePage();
    initPublishModal();
    initContactModal();
    initDeleteModal();
    initBackToTop();
    initProgressBar();
    initAnchorNavigation();
    
    if (token) {
        fetchProfile();
    }
});

async function fetchProfile() {
    try {
        const response = await fetch(`${API_BASE}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
            currentUser = result.user;
            updateUserUI();
            loadDataFromAPI();
        } else {
            token = null;
            localStorage.removeItem('campus_mate_token');
        }
    } catch (error) {
        console.error('获取用户信息失败:', error);
    }
}

function updateUserUI() {
    if (!currentUser) return;
    
    document.getElementById('userAvatar').src = currentUser.avatar;
    document.getElementById('userNickname').textContent = currentUser.nickname;
    
    document.getElementById('userInfo').classList.remove('hidden');
    document.getElementById('loginBtn').classList.add('hidden');
    document.getElementById('registerBtn').classList.add('hidden');
    document.getElementById('logoutBtn').classList.remove('hidden');
    
    document.getElementById('mobileLoginBtn').classList.add('hidden');
    document.getElementById('mobileRegisterBtn').classList.add('hidden');
    document.getElementById('mobileLogoutBtn').classList.remove('hidden');
}

function initAuth() {
    document.getElementById('loginBtn').addEventListener('click', openLoginModal);
    document.getElementById('registerBtn').addEventListener('click', openRegisterModal);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    document.getElementById('mobileLoginBtn').addEventListener('click', function() {
        document.getElementById('mobileMenu').classList.add('hidden');
        openLoginModal();
    });
    document.getElementById('mobileRegisterBtn').addEventListener('click', function() {
        document.getElementById('mobileMenu').classList.add('hidden');
        openRegisterModal();
    });
    document.getElementById('mobileLogoutBtn').addEventListener('click', logout);
    
    document.getElementById('closeLoginModal').addEventListener('click', closeLoginModal);
    document.getElementById('closeRegisterModal').addEventListener('click', closeRegisterModal);
    
    document.getElementById('doLogin').addEventListener('click', doLogin);
    document.getElementById('doRegister').addEventListener('click', doRegister);
    
    document.getElementById('switchToRegister').addEventListener('click', function() {
        closeLoginModal();
        openRegisterModal();
    });
    document.getElementById('switchToLogin').addEventListener('click', function() {
        closeRegisterModal();
        openLoginModal();
    });
}

function openLoginModal() {
    document.getElementById('loginModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.add('hidden');
    document.body.style.overflow = '';
}

function openRegisterModal() {
    document.getElementById('registerModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeRegisterModal() {
    document.getElementById('registerModal').classList.add('hidden');
    document.body.style.overflow = '';
}

async function doLogin() {
    const nickname = document.getElementById('loginNickname').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!nickname || !password) {
        alert('请填写昵称和密码');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname, password })
        });
        const result = await response.json();
        
        if (result.success) {
            token = result.accessToken;
            const refreshToken = result.refreshToken;
            localStorage.setItem('campus_mate_token', token);
            localStorage.setItem('campus_mate_refresh_token', refreshToken);
            currentUser = result.user;
            updateUserUI();
            closeLoginModal();
            loadDataFromAPI();
            alert('登录成功');
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('登录错误:', error);
        alert('登录失败，请检查网络连接');
    }
}

async function doRegister() {
    try {
        const nickname = document.getElementById('registerNickname').value;
        const password = document.getElementById('registerPassword').value;
        const grade = document.getElementById('registerGrade').value;
        const major = document.getElementById('registerMajor').value;
        const bio = document.getElementById('registerBio').value;
        const campus = document.getElementById('registerCampus').value;
        
        
        if (!nickname || !password || !grade || !major) {
            alert('请填写完整信息');
            return;
        }
        
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname, password, grade, major, bio, campus })
        });
        const result = await response.json();
        
        if (result.success) {
            token = result.accessToken;
            const refreshToken = result.refreshToken;
            localStorage.setItem('campus_mate_token', token);
            localStorage.setItem('campus_mate_refresh_token', refreshToken);
            currentUser = result.user;
            updateUserUI();
            closeRegisterModal();
            loadDataFromAPI();
            alert('注册成功');
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('注册错误:', error);
        alert('注册失败，请检查网络连接');
    }
}

function logout() {
    token = null;
    currentUser = null;
    localStorage.removeItem('campus_mate_token');
    
    document.getElementById('userInfo').classList.add('hidden');
    document.getElementById('loginBtn').classList.remove('hidden');
    document.getElementById('registerBtn').classList.remove('hidden');
    document.getElementById('logoutBtn').classList.add('hidden');
    
    document.getElementById('mobileLoginBtn').classList.remove('hidden');
    document.getElementById('mobileRegisterBtn').classList.remove('hidden');
    document.getElementById('mobileLogoutBtn').classList.add('hidden');
    
    initHomePage();
    initCompetitionPage();
    initMealPage();
    initHobbyPage();
    
    alert('已退出登录');
}

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const keyword = this.value.trim().toLowerCase();
        
        if (keyword.length > 0) {
            const results = searchAll(keyword);
            showSearchResults(results);
        } else {
            hideSearchResults();
        }
    });
    
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-results') && !e.target.closest('#searchInput')) {
            hideSearchResults();
        }
    });
}

function searchAll(keyword) {
    const allData = [
        ...mockData.competitions.map(item => ({ ...item, category: 'competition' })),
        ...mockData.mealBuddies.map(item => ({ ...item, category: 'meal' })),
        ...mockData.hobbyBuddies.map(item => ({ ...item, category: 'hobby' }))
    ];
    
    return allData.filter(item => {
        const title = item.title?.toLowerCase() || '';
        const description = item.description || item.note || item.requirements || '';
        const author = item.author?.nickname?.toLowerCase() || '';
        
        return title.includes(keyword) || 
               description.toLowerCase().includes(keyword) || 
               author.includes(keyword);
    });
}

function showSearchResults(results) {
    let resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'searchResults';
        resultsContainer.className = 'fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden';
        document.body.appendChild(resultsContainer);
    }
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="p-8 text-center text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p>未找到相关结果</p>
            </div>
        `;
        resultsContainer.classList.remove('hidden');
        return;
    }
    
    resultsContainer.innerHTML = `
        <div class="p-4 border-b border-gray-100">
            <p class="text-sm text-gray-500">找到 ${results.length} 条结果</p>
        </div>
        <div class="max-h-96 overflow-y-auto">
            ${results.slice(0, 10).map(item => `
                <div class="search-result-item p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0" 
                     data-category="${escapeHtml(item.category)}" data-id="${escapeHtml(item.id)}">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <h4 class="font-medium text-gray-800">${escapeHtml(item.title)}</h4>
                            <p class="text-sm text-gray-500 mt-1">
                                ${item.category === 'competition' ? '竞赛组队' : 
                                  item.category === 'meal' ? '吃饭搭子' : '兴趣搭子'} · 
                                ${escapeHtml(item.author?.nickname || '匿名')}
                            </p>
                        </div>
                        <span class="tag ${getCategoryTagClass(item.category)}">
                            ${item.category === 'competition' ? '竞赛' : 
                              item.category === 'meal' ? '干饭' : '兴趣'}
                        </span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    resultsContainer.classList.remove('hidden');
    
    document.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            if (category === 'competition') {
                showPage('competition');
            } else if (category === 'meal') {
                showPage('meal');
            } else {
                showPage('hobby');
            }
            hideSearchResults();
        });
    });
}

function getCategoryTagClass(category) {
    switch(category) {
        case 'competition': return 'bg-blue-100 text-blue-600';
        case 'meal': return 'bg-orange-100 text-orange-600';
        case 'hobby': return 'bg-green-100 text-green-600';
        default: return 'bg-gray-100 text-gray-600';
    }
}

function hideSearchResults() {
    const resultsContainer = document.getElementById('searchResults');
    if (resultsContainer) {
        resultsContainer.classList.add('hidden');
    }
}

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            showPage(targetId);
        });
    });
    
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-item');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            showPage(targetId);
            document.getElementById('mobileMenu').classList.add('hidden');
        });
    });
    
    document.getElementById('mobileMenuBtn').addEventListener('click', function() {
        document.getElementById('mobileMenu').classList.toggle('hidden');
    });
    
    document.getElementById('publishBtn').addEventListener('click', function() {
        if (!token) {
            openLoginModal();
            return;
        }
        openPublishModal();
    });
    document.getElementById('mobilePublishBtn').addEventListener('click', function() {
        if (!token) {
            openLoginModal();
            return;
        }
        openPublishModal();
    });
}

function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.add('hidden'));
    
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    mobileNavItems.forEach(item => item.classList.remove('active'));
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        document.querySelector(`.nav-item[href="#${pageId}"]`)?.classList.add('active');
        document.querySelector(`.mobile-nav-item[href="#${pageId}"]`)?.classList.add('active');
    }
}

async function loadDataFromAPI() {
    try {
        await Promise.all([
            loadCompetitions(),
            loadMeals(),
            loadHobbies()
        ]);
        initHomePage();
        initCompetitionPage();
        initMealPage();
        initHobbyPage();
    } catch (error) {
        console.error('加载数据失败:', error);
    }
}

async function loadCompetitions() {
    try {
        const response = await fetch(`${API_BASE}/competition`);
        const result = await response.json();
        if (result.success) {
            mockData.competitions = result.data;
        }
    } catch (error) {
        console.error('加载竞赛数据失败:', error);
    }
}

async function loadMeals() {
    try {
        const response = await fetch(`${API_BASE}/meal`);
        const result = await response.json();
        if (result.success) {
            mockData.mealBuddies = result.data;
        }
    } catch (error) {
        console.error('加载吃饭搭子数据失败:', error);
    }
}

async function loadHobbies() {
    try {
        const response = await fetch(`${API_BASE}/hobby`);
        const result = await response.json();
        if (result.success) {
            mockData.hobbyBuddies = result.data;
        }
    } catch (error) {
        console.error('加载兴趣搭子数据失败:', error);
    }
}

function initHomePage() {
    renderHotBuddies();
    renderLatestPosts();
}

function renderHotBuddies() {
    const container = document.getElementById('hotBuddies');
    if (!container) return;
    
    const allData = [
        ...mockData.competitions.slice(0, 2).map(item => ({ ...item, type: 'competition' })),
        ...mockData.mealBuddies.slice(0, 2).map(item => ({ ...item, type: 'meal' })),
        ...mockData.hobbyBuddies.slice(0, 2).map(item => ({ ...item, type: 'hobby' }))
    ];
    
    container.innerHTML = allData.map(item => createCard(item)).join('');
    bindContactButtons();
}

function renderLatestPosts() {
    const container = document.getElementById('latestPosts');
    if (!container) return;
    
    const allData = [
        ...mockData.competitions.map(item => ({ ...item, type: 'competition', createdAt: item.createdAt })),
        ...mockData.mealBuddies.map(item => ({ ...item, type: 'meal', createdAt: item.createdAt })),
        ...mockData.hobbyBuddies.map(item => ({ ...item, type: 'hobby', createdAt: item.createdAt }))
    ];
    
    allData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    container.innerHTML = allData.slice(0, 6).map((item, index) => {
        const card = createCard(item);
        const staggerClass = `stagger-${Math.min(index + 1, 6)}`;
        return `<div class="animate-fade-in-up opacity-0 ${staggerClass}">${card}</div>`;
    }).join('');
    bindContactButtons();
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

function createCard(item) {
    const categories = mockData.categories;
    let categoryInfo;
    let extraInfo = '';
    
    if (item.type === 'competition') {
        categoryInfo = categories.competition[item.type] || { name: '其他竞赛', color: 'bg-gray-100 text-gray-700' };
        extraInfo = `
            <div class="flex items-center text-sm text-gray-500 mt-2">
                <span class="mr-3">👥 ${escapeHtml(item.currentMembers)}/${escapeHtml(item.maxMembers)}人</span>
                <span>⏰ ${escapeHtml(item.deadline)}</span>
            </div>
        `;
    } else if (item.type === 'meal') {
        categoryInfo = categories.meal[item.type] || { name: '其他', color: 'bg-gray-100 text-gray-700' };
        extraInfo = `
            <div class="flex items-center text-sm text-gray-500 mt-2">
                <span class="mr-3">🕐 ${escapeHtml(item.time)}</span>
                <span>📍 ${escapeHtml(item.location)}</span>
            </div>
        `;
    } else {
        categoryInfo = categories.hobby[item.type] || { name: '其他', color: 'bg-gray-100 text-gray-700' };
        extraInfo = `
            <div class="flex items-center text-sm text-gray-500 mt-2">
                <span class="mr-3">🕐 ${escapeHtml(item.time)}</span>
                <span>📍 ${escapeHtml(item.location)}</span>
                <span class="ml-3 px-2 py-0.5 bg-gray-100 rounded text-xs">${escapeHtml(item.duration)}</span>
            </div>
        `;
    }
    
    const urgentBadge = item.urgent ? '<span class="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded">紧急</span>' : '';
    const safeType = escapeHtml(item.type);
    const safeContact = escapeHtml(item.contact);
    
    return `
        <div class="bg-white rounded-xl p-4 card-hover cursor-pointer" data-id="${escapeHtml(item.id)}" data-type="${safeType}">
            <div class="flex items-start justify-between mb-2">
                <span class="tag ${categoryInfo.color}">${escapeHtml(categoryInfo.name)}</span>
                ${urgentBadge}
            </div>
            <h3 class="font-medium text-gray-800 mb-2 line-clamp-2">${escapeHtml(item.title)}</h3>
            ${extraInfo}
            <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div class="flex items-center">
                    <div class="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-500 mr-2">
                        ${escapeHtml(item.author?.nickname?.charAt(0) || '?')}
                    </div>
                    <span class="text-xs text-gray-500">${escapeHtml(item.author?.nickname || '匿名')} · ${escapeHtml(item.author?.grade || '')}</span>
                </div>
                <button class="contact-btn text-primary-500 text-sm hover:text-primary-600" data-contact="${safeContact}">查看联系方式</button>
            </div>
        </div>
    `;
}

function initCompetitionPage() {
    renderCompetitionList(mockData.competitions);
    
    const tags = document.querySelectorAll('#competitionTags .tag-filter');
    tags.forEach(tag => {
        tag.addEventListener('click', function() {
            tags.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const type = this.getAttribute('data-type');
            if (type) {
                const filtered = mockData.competitions.filter(item => item.type === type);
                renderCompetitionList(filtered);
            } else {
                renderCompetitionList(mockData.competitions);
            }
        });
    });
}

function renderCompetitionList(data) {
    const container = document.getElementById('competitionList');
    if (!container) return;
    
    container.innerHTML = data.map((item, index) => {
        const card = createCard({ ...item, type: 'competition' });
        const staggerClass = `stagger-${Math.min(index + 1, 6)}`;
        return `<div class="animate-fade-in-up opacity-0 ${staggerClass}">${card}</div>`;
    }).join('');
    bindContactButtons();
}

function initMealPage() {
    renderMealList(mockData.mealBuddies);
    
    const tags = document.querySelectorAll('#mealTags .tag-filter');
    tags.forEach(tag => {
        tag.addEventListener('click', function() {
            tags.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const type = this.getAttribute('data-type');
            if (type) {
                const filtered = mockData.mealBuddies.filter(item => item.type === type);
                renderMealList(filtered);
            } else {
                renderMealList(mockData.mealBuddies);
            }
        });
    });
}

function renderMealList(data) {
    const container = document.getElementById('mealList');
    if (!container) return;
    
    container.innerHTML = data.map((item, index) => {
        const card = createCard({ ...item, type: 'meal' });
        const staggerClass = `stagger-${Math.min(index + 1, 6)}`;
        return `<div class="animate-fade-in-up opacity-0 ${staggerClass}">${card}</div>`;
    }).join('');
    bindContactButtons();
}

function initHobbyPage() {
    renderHobbyList(mockData.hobbyBuddies);
    
    const tags = document.querySelectorAll('#hobbyTags .tag-filter');
    tags.forEach(tag => {
        tag.addEventListener('click', function() {
            tags.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const type = this.getAttribute('data-type');
            if (type) {
                const filtered = mockData.hobbyBuddies.filter(item => item.type === type);
                renderHobbyList(filtered);
            } else {
                renderHobbyList(mockData.hobbyBuddies);
            }
        });
    });
}

function renderHobbyList(data) {
    const container = document.getElementById('hobbyList');
    if (!container) return;
    
    container.innerHTML = data.map((item, index) => {
        const card = createCard({ ...item, type: 'hobby' });
        const staggerClass = `stagger-${Math.min(index + 1, 6)}`;
        return `<div class="animate-fade-in-up opacity-0 ${staggerClass}">${card}</div>`;
    }).join('');
    bindContactButtons();
}

function bindContactButtons() {
    const contactButtons = document.querySelectorAll('.contact-btn');
    contactButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const contact = this.getAttribute('data-contact');
            openContactModal(contact);
        });
    });
}

function initProfilePage() {
    const navItems = document.querySelectorAll('.profile-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            const targetId = this.getAttribute('href').substring(1);
            showProfileContent(targetId);
        });
    });
    
    document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);
    
    renderMyPosts();
}

function showProfileContent(contentId) {
    const contents = ['profileContent', 'myPostsContent'];
    contents.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
        }
    });
    
    const targetEl = document.getElementById(contentId);
    if (targetEl) {
        targetEl.classList.remove('hidden');
    }
}

function renderMyPosts() {
    const container = document.getElementById('myPostsList');
    if (!container) return;
    
    const myPosts = [
        { id: 1, title: '寻找数学建模队友', type: 'math_modeling', createdAt: '2026-05-20', status: 'active', postType: 'competition' },
        { id: 2, title: '下午图书馆自习搭子', type: 'study', createdAt: '2026-05-19', status: 'active', postType: 'hobby' },
        { id: 3, title: '周末篮球组队', type: 'basketball', createdAt: '2026-05-18', status: 'closed', postType: 'hobby' }
    ];
    
    container.innerHTML = myPosts.map(item => `
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div class="flex-1">
                <h4 class="font-medium text-gray-800">${escapeHtml(item.title)}</h4>
                <p class="text-sm text-gray-500">发布于 ${escapeHtml(item.createdAt)}</p>
            </div>
            <div class="flex items-center gap-2">
                <span class="${item.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'} text-xs px-2 py-1 rounded">${item.status === 'active' ? '进行中' : '已结束'}</span>
                <button class="delete-post-btn text-gray-400 hover:text-red-500 transition-colors" onclick="openDeleteModal(${item.id})">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

function saveProfile() {
    if (!token) {
        alert('请先登录');
        return;
    }
    
    const nickname = document.querySelector('#profileContent input[type="text"]').value;
    const grade = document.querySelector('#profileContent select').value;
    const major = document.querySelectorAll('#profileContent input[type="text"]')[1].value;
    const bio = document.querySelector('#profileContent textarea').value;
    const campus = document.querySelectorAll('#profileContent select')[1].value;
    
    if (!nickname || !major) {
        alert('请填写昵称和专业');
        return;
    }
    
    fetch(`${API_BASE}/user/profile`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nickname, grade, major, bio, campus })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            currentUser = result.user;
            document.getElementById('userNickname').textContent = nickname;
            alert('保存成功');
        } else {
            alert(result.message);
        }
    })
    .catch(error => {
        alert('保存失败，请检查网络连接');
    });
}

function initPublishModal() {
    const typeButtons = document.querySelectorAll('.publish-type-btn');
    typeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            typeButtons.forEach(b => {
                b.classList.remove('active', 'border-primary-500', 'text-primary-500');
                b.classList.add('border-gray-200', 'text-gray-500');
            });
            this.classList.add('active', 'border-primary-500', 'text-primary-500');

            const type = this.textContent.trim();
            if (type === '竞赛组队') {
                document.getElementById('competitionForm').classList.remove('hidden');
                document.getElementById('mealForm').classList.add('hidden');
                document.getElementById('hobbyForm').classList.add('hidden');
            } else if (type === '吃饭搭子') {
                document.getElementById('competitionForm').classList.add('hidden');
                document.getElementById('mealForm').classList.remove('hidden');
                document.getElementById('hobbyForm').classList.add('hidden');
            } else {
                document.getElementById('competitionForm').classList.add('hidden');
                document.getElementById('mealForm').classList.add('hidden');
                document.getElementById('hobbyForm').classList.remove('hidden');
            }
        });
    });

    const publishBtn = document.getElementById('publishSubmitBtn');
    if (publishBtn) {
        publishBtn.addEventListener('click', handlePublish);
    }
}

async function handlePublish() {
    const activeBtn = document.querySelector('.publish-type-btn.active');
    const publishType = activeBtn ? activeBtn.textContent.trim() : '竞赛组队';

    let formData;
    let url;

    if (publishType === '竞赛组队') {
        formData = getFormData('competitionForm');
        url = `${API_BASE}/competition`;
        
        if (!formData.title) { alert('请填写标题'); return; }
        if (!formData.competitionName) { alert('请填写竞赛名称'); return; }
        if (!formData.contact) { alert('请填写联系方式'); return; }

    } else if (publishType === '吃饭搭子') {
        formData = getFormData('mealForm');
        url = `${API_BASE}/meal`;
        
        if (!formData.title) { alert('请填写标题'); return; }
        if (!formData.contact) { alert('请填写联系方式'); return; }

    } else {
        formData = getFormData('hobbyForm');
        url = `${API_BASE}/hobby`;
        
        if (!formData.title) { alert('请填写标题'); return; }
        if (!formData.contact) { alert('请填写联系方式'); return; }
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            await loadDataFromAPI();
            closePublishModal();
            alert('发布成功！');
            resetPublishForms();
        } else {
            alert(result.message || '发布失败');
        }
    } catch (error) {
        alert('发布失败，请检查网络连接');
    }
}

function getFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return {};

    const inputs = form.querySelectorAll('input, textarea, select');
    const data = {};

    inputs.forEach(input => {
        if (input.type === 'radio') {
            if (input.checked) {
                data[input.name] = input.value;
            }
        } else {
            data[input.name || input.id] = input.value;
        }
    });

    const titleInput = form.querySelector('input[placeholder="输入标题"]');
    if (titleInput && !data.title) {
        data.title = titleInput.value;
    }

    return data;
}

function resetPublishForms() {
    const forms = ['competitionForm', 'mealForm', 'hobbyForm'];
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.querySelectorAll('input, textarea').forEach(input => {
                if (input.type === 'radio') {
                    input.checked = input.value === '短期';
                } else {
                    input.value = '';
                }
            });
        }
    });
}

function openPublishModal() {
    document.getElementById('publishModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closePublishModal() {
    document.getElementById('publishModal').classList.add('hidden');
    document.body.style.overflow = '';
}

function initContactModal() {
    document.getElementById('copyContact').addEventListener('click', function() {
        const contact = document.getElementById('contactInfo').textContent;
        navigator.clipboard.writeText(contact).then(() => {
            alert('联系方式已复制到剪贴板');
        });
    });
}

function openContactModal(contact) {
    document.getElementById('contactInfo').textContent = contact;
    document.getElementById('contactModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeContactModal() {
    document.getElementById('contactModal').classList.add('hidden');
    document.body.style.overflow = '';
}

function initDeleteModal() {
    document.getElementById('cancelDelete').addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDelete').addEventListener('click', function() {
        alert('删除成功');
        closeDeleteModal();
    });
}

function openDeleteModal() {
    document.getElementById('deleteModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
    document.body.style.overflow = '';
}

document.addEventListener('click', function(e) {
    if (e.target.id === 'closeModal' || e.target.closest('#closeModal')) {
        closePublishModal();
    }
    
    if (e.target.classList.contains('fixed')) {
        closePublishModal();
        closeContactModal();
        closeDeleteModal();
        closeLoginModal();
        closeRegisterModal();
    }
});

document.addEventListener('click', function(e) {
    const card = e.target.closest('.card-hover');
    if (card && !e.target.classList.contains('contact-btn')) {
        const type = card.getAttribute('data-type');
        if (type === 'competition') {
            showPage('competition');
        } else if (type === 'meal') {
            showPage('meal');
        } else {
            showPage('hobby');
        }
    }
});

function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;
    
    backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
}

function initProgressBar() {
    const progressBar = document.getElementById('progressBar');
    if (!progressBar) return;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        progressBar.style.width = progress + '%';
    });
}

function initAnchorNavigation() {
    document.addEventListener('click', function(e) {
        const anchor = e.target.closest('a[href^="#"]');
        if (anchor) {
            const href = anchor.getAttribute('href');
            if (href.length > 1) {
                if (anchor.classList.contains('profile-nav-item')) {
                    return;
                }
                
                e.preventDefault();
                const targetId = href.substring(1);
                showPage(targetId);
                history.pushState({ page: targetId }, '', href);
            }
        }
    });
    
    window.addEventListener('popstate', function(e) {
        if (e.state && e.state.page) {
            showPage(e.state.page);
        } else {
            showPage('home');
        }
    });
}