// 模拟用户数据
const mockUser = {
    id: 1,
    nickname: '校园小达人',
    grade: '大三',
    major: '计算机科学与技术',
    bio: '热爱编程，喜欢打篮球，寻找志同道合的小伙伴！',
    campus: '东校区',
    avatar: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=young%20college%20student%20avatar%20friendly%20smile%20simple%20style&image_size=square',
    status: 'online'
};

// 竞赛组队数据
const competitionData = [
    {
        id: 1,
        type: 'math_modeling',
        title: '2026数学建模竞赛组队',
        competitionName: '全国大学生数学建模竞赛',
        maxMembers: 3,
        currentMembers: 2,
        skills: ['数学建模', '编程', '论文写作'],
        requirements: '希望队友有数学建模经验，认真负责',
        deadline: '2026-09-15',
        contact: '微信：math_model_2026',
        createdAt: '2026-05-20',
        urgent: true,
        author: {
            nickname: '数模小王子',
            grade: '大二',
            major: '数学与应用数学'
        }
    },
    {
        id: 2,
        type: 'internet_plus',
        title: '互联网+创业大赛项目招募',
        competitionName: '中国国际"互联网+"大学生创新创业大赛',
        maxMembers: 5,
        currentMembers: 3,
        skills: ['产品设计', '前端开发', '市场营销'],
        requirements: '寻找有创业热情的小伙伴，欢迎跨专业组队',
        deadline: '2026-10-01',
        contact: 'QQ群：876543210',
        createdAt: '2026-05-18',
        urgent: false,
        author: {
            nickname: '创业先锋',
            grade: '大三',
            major: '工商管理'
        }
    },
    {
        id: 3,
        type: 'challenge_cup',
        title: '挑战杯科技论文竞赛组队',
        competitionName: '挑战杯全国大学生课外学术科技作品竞赛',
        maxMembers: 4,
        currentMembers: 1,
        skills: ['科研', '论文写作', '数据分析'],
        requirements: '招募科研能力强的队友，已有初步选题',
        deadline: '2026-11-15',
        contact: '微信：challenge_cup_2026',
        createdAt: '2026-05-22',
        urgent: true,
        author: {
            nickname: '科研达人',
            grade: '大四',
            major: '物理学'
        }
    },
    {
        id: 4,
        type: 'programming',
        title: '程序设计竞赛组队训练',
        competitionName: 'ACM-ICPC程序设计竞赛',
        maxMembers: 3,
        currentMembers: 2,
        skills: ['算法', 'C++', '数据结构'],
        requirements: '寻找算法能力强的队友，每周至少训练3次',
        deadline: '长期有效',
        contact: 'QQ：1234567890',
        createdAt: '2026-05-15',
        urgent: false,
        author: {
            nickname: '码农小王',
            grade: '大二',
            major: '软件工程'
        }
    },
    {
        id: 5,
        type: 'big_creation',
        title: '大创项目组队申报',
        competitionName: '国家级大学生创新创业训练计划',
        maxMembers: 5,
        currentMembers: 2,
        skills: ['项目管理', '科研', '财务管理'],
        requirements: '招募认真负责的队友，项目方向已确定',
        deadline: '2026-09-30',
        contact: '微信：dc_project_2026',
        createdAt: '2026-05-21',
        urgent: true,
        author: {
            nickname: '项目负责人',
            grade: '大三',
            major: '机械工程'
        }
    },
    {
        id: 6,
        type: 'english',
        title: '英语竞赛组队练习',
        competitionName: '全国大学生英语竞赛',
        maxMembers: 4,
        currentMembers: 2,
        skills: ['英语口语', '听力', '写作'],
        requirements: '每天一起练习口语，互相督促',
        deadline: '2026-10-20',
        contact: '微信群：english_comp_2026',
        createdAt: '2026-05-19',
        urgent: false,
        author: {
            nickname: '英语爱好者',
            grade: '大二',
            major: '英语'
        }
    }
];

// 吃饭搭子数据
const mealBuddyData = [
    {
        id: 1,
        type: 'canteen',
        title: '中午食堂干饭搭子',
        time: '今天 12:00',
        location: '一食堂二楼',
        preference: '爱吃辣，无忌口',
        note: '随缘搭伴，一起吃饭聊天',
        createdAt: '2026-05-24 11:30',
        author: {
            nickname: '干饭王',
            grade: '大一',
            major: '土木工程'
        },
        contact: '微信：ganfan_king'
    },
    {
        id: 2,
        type: 'restaurant',
        title: '周末探店打卡',
        time: '本周六 18:00',
        location: '学校附近新开的川菜馆',
        preference: '川菜爱好者，能吃辣',
        note: '听说这家店很火，想找人一起去试试',
        createdAt: '2026-05-24 10:00',
        author: {
            nickname: '美食探索者',
            grade: '大二',
            major: '食品科学'
        },
        contact: '微信：food_explorer'
    },
    {
        id: 3,
        type: 'milk_tea',
        title: '下午奶茶拼单',
        time: '今天 15:00',
        location: '蜜雪冰城（校门口）',
        preference: '甜度适中，珍珠奶茶',
        note: '三人拼单更划算，有没有一起的',
        createdAt: '2026-05-24 14:00',
        author: {
            nickname: '奶茶控',
            grade: '大三',
            major: '市场营销'
        },
        contact: 'QQ：9876543210'
    },
    {
        id: 4,
        type: 'supper',
        title: '夜宵约起来',
        time: '今天 22:00',
        location: '校门口烧烤摊',
        preference: '烧烤、啤酒',
        note: '复习累了，出来放松一下',
        createdAt: '2026-05-24 21:00',
        author: {
            nickname: '夜猫子',
            grade: '大四',
            major: '电气工程'
        },
        contact: '微信：night_owl_2026'
    },
    {
        id: 5,
        type: 'weekend',
        title: '周末聚餐AA',
        time: '本周日 12:30',
        location: '学校附近火锅店',
        preference: '火锅，微辣',
        note: '周末放松一下，认识新朋友',
        createdAt: '2026-05-24 09:00',
        author: {
            nickname: '社交达人',
            grade: '大二',
            major: '公共关系'
        },
        contact: '微信：social_star'
    }
];

// 兴趣搭子数据
const hobbyBuddyData = [
    {
        id: 1,
        category: 'sports',
        type: 'basketball',
        title: '下午篮球场组队',
        time: '今天 16:00',
        location: '西校区篮球场',
        duration: '短期',
        description: '寻找篮球搭子，水平不限，重在参与',
        createdAt: '2026-05-24 15:00',
        author: {
            nickname: '篮球少年',
            grade: '大一',
            major: '体育教育'
        },
        contact: '微信：basketball_kid'
    },
    {
        id: 2,
        category: 'sports',
        type: 'running',
        title: '晨跑搭子招募',
        time: '每天 06:30',
        location: '东校区操场',
        duration: '长期',
        description: '寻找晨跑搭子，互相监督，健康生活',
        createdAt: '2026-05-23 22:00',
        author: {
            nickname: '跑步爱好者',
            grade: '大二',
            major: '运动训练'
        },
        contact: '微信：runner_2026'
    },
    {
        id: 3,
        category: 'sports',
        type: 'badminton',
        title: '羽毛球长期搭子',
        time: '每周二、四 18:00',
        location: '体育馆羽毛球馆',
        duration: '长期',
        description: '寻找固定羽毛球搭子，每周一起练习',
        createdAt: '2026-05-23 10:00',
        author: {
            nickname: '运动爱好者',
            grade: '大三',
            major: '生物科学'
        },
        contact: 'QQ：1122334455'
    },
    {
        id: 4,
        category: 'study',
        type: 'study',
        title: '图书馆自习搭子',
        time: '每天 08:30',
        location: '图书馆三楼自习室',
        duration: '长期',
        description: '寻找考研/考公自习搭子，互相监督学习',
        createdAt: '2026-05-22 08:00',
        author: {
            nickname: '考研人',
            grade: '大三',
            major: '法学'
        },
        contact: '微信：kaoyan_2026'
    },
    {
        id: 5,
        category: 'game',
        type: 'game',
        title: 'LOL开黑组队',
        time: '晚上 20:00',
        location: '宿舍',
        duration: '短期',
        description: '寻找LOL队友，段位黄金以上',
        createdAt: '2026-05-24 19:00',
        author: {
            nickname: '电竞小王子',
            grade: '大二',
            major: '计算机'
        },
        contact: '游戏ID：King_of_LoL'
    },
    {
        id: 6,
        category: 'entertainment',
        type: 'movie',
        title: '周末观影会',
        time: '本周六 14:00',
        location: '学校电影院',
        duration: '短期',
        description: '一起看最新上映的电影，看完可以一起讨论',
        createdAt: '2026-05-24 11:00',
        author: {
            nickname: '电影迷',
            grade: '大二',
            major: '广播电视学'
        },
        contact: '微信：movie_fan_2026'
    },
    {
        id: 7,
        category: 'outdoor',
        type: 'ride',
        title: '周末骑行周边游',
        time: '本周日 09:00',
        location: '学校门口集合',
        duration: '短期',
        description: '骑行去附近的湿地公园，大约半天时间',
        createdAt: '2026-05-24 08:30',
        author: {
            nickname: '骑行爱好者',
            grade: '大四',
            major: '环境工程'
        },
        contact: '微信：bike_lover'
    },
    {
        id: 8,
        category: 'creative',
        type: 'handmade',
        title: '手工DIY兴趣小组',
        time: '每周六 10:00',
        location: '大学生活动中心',
        duration: '长期',
        description: '喜欢手工的小伙伴一起来玩，折纸、剪纸、陶艺都可以',
        createdAt: '2026-05-21 14:00',
        author: {
            nickname: '手工达人',
            grade: '大三',
            major: '艺术设计'
        },
        contact: '微信：handmade_master'
    },
    {
        id: 9,
        category: 'study',
        type: 'postgraduate',
        title: '考研自习室固定搭子',
        time: '每天 07:30-22:00',
        location: '考研自习室A区',
        duration: '长期',
        description: '寻找一起考研的小伙伴，互相鼓励，共同进步',
        createdAt: '2026-05-15 07:00',
        author: {
            nickname: '追梦人',
            grade: '大三',
            major: '经济学'
        },
        contact: '微信：dream_chaser_2026'
    }
];

// 分类标签配置
const categoryConfig = {
    competition: {
        math_modeling: { name: '数学建模', color: 'bg-blue-100 text-blue-700' },
        internet_plus: { name: '互联网+', color: 'bg-green-100 text-green-700' },
        challenge_cup: { name: '挑战杯', color: 'bg-purple-100 text-purple-700' },
        big_creation: { name: '大创项目', color: 'bg-orange-100 text-orange-700' },
        programming: { name: '程序竞赛', color: 'bg-red-100 text-red-700' },
        english: { name: '英语竞赛', color: 'bg-pink-100 text-pink-700' },
        sports: { name: '文体赛事', color: 'bg-yellow-100 text-yellow-700' },
        other: { name: '其他竞赛', color: 'bg-gray-100 text-gray-700' }
    },
    meal: {
        canteen: { name: '食堂干饭', color: 'bg-orange-100 text-orange-700' },
        restaurant: { name: '校外探店', color: 'bg-pink-100 text-pink-700' },
        milk_tea: { name: '奶茶拼单', color: 'bg-purple-100 text-purple-700' },
        supper: { name: '夜宵', color: 'bg-indigo-100 text-indigo-700' },
        weekend: { name: '周末干饭', color: 'bg-green-100 text-green-700' }
    },
    hobby: {
        basketball: { name: '篮球', color: 'bg-orange-100 text-orange-700' },
        running: { name: '跑步', color: 'bg-green-100 text-green-700' },
        badminton: { name: '羽毛球', color: 'bg-yellow-100 text-yellow-700' },
        movie: { name: '追剧观影', color: 'bg-purple-100 text-purple-700' },
        study: { name: '读书学习', color: 'bg-blue-100 text-blue-700' },
        game: { name: '游戏搭子', color: 'bg-red-100 text-red-700' },
        photo: { name: '拍照探店', color: 'bg-pink-100 text-pink-700' },
        ride: { name: '骑行散步', color: 'bg-teal-100 text-teal-700' },
        handmade: { name: '手工爱好', color: 'bg-indigo-100 text-indigo-700' },
        postgraduate: { name: '考研自习', color: 'bg-cyan-100 text-cyan-700' }
    }
};

// 导出数据
window.mockData = {
    user: mockUser,
    competitions: competitionData,
    mealBuddies: mealBuddyData,
    hobbyBuddies: hobbyBuddyData,
    categories: categoryConfig
};
