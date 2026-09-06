// js/data/locations.js
// ВСЕ ТОЧКИ ПОСЕЛКА (с сохранением оригинальных координат, сдвинуты только дубликаты)

var LOCATIONS = [
    // ==========================================
    // 1. ОТЕЛЬ (СТАРТОВАЯ ТОЧКА)
    // ==========================================
{ 
    id: 1, 
    name: '🏨 Отель', 
    lat: 55.955087, 
    lon: 36.374705, 
    tags: ['hotel', 'walk'],
    description: 'Стартовая точка всех прогулок',
    photo: '',
    locked: false 
},
    // ==========================================
    // 2. КОРОЛЕВСКИЙ ЛЕС (ОЗЕРО)
    // ==========================================
    { 
        id: 2, 
        name: 'Беседка на озере', 
        lat: 55.963172, 
        lon: 36.370024, 
        tags: ['water', 'beauty', 'walk'],
        description: 'Уютная беседка с видом на озеро в Королевском лесу',
        photo: 'images/belvedere_lake.jpg',
        locked: false 
    },
    { 
        id: 3, 
        name: 'Озеро Королевский лес', 
        lat: 55.962631, 
        lon: 36.369925, 
        tags: ['water', 'beauty', 'walk'],
        description: 'Живописное лесное озеро с чистой водой',
        photo: 'images/king_forest_lake.jpg',
        locked: false 
    },
    { 
        id: 4, 
        name: 'Лесная дорожка', 
        lat: 55.962334, 
        lon: 36.372467, 
        tags: ['forest', 'walk', 'beauty'],
        description: 'Тенистая дорожка для прогулок в Королевском лесу',
        photo: 'images/forest_path.jpg',
        locked: false 
    },
    { 
        id: 5, 
        name: 'Озеро с ивами', 
        lat: 55.958481, 
        lon: 36.379405, 
        tags: ['water', 'beauty', 'walk'],
        description: 'Озеро с плакучими ивами — очень живописное место',
        photo: 'images/lake_with_willows.jpg',
        locked: false 
    },

    // ==========================================
    // 3. ЖИРАФ И ПАНТОН
    // ==========================================
    { 
        id: 6, 
        name: 'Жираф', 
        lat: 55.965142, 
        lon: 36.380921, 
        tags: ['kids', 'beauty', 'walk'],
        description: 'Скульптура жирафа — отличное место для фото с детьми',
        photo: 'images/giraffe.jpg',
        locked: false 
    },
    { 
        id: 7, 
        name: 'Пантон', 
        lat: 55.960551, 
        lon: 36.366113, 
        tags: ['water', 'walk', 'beauty'],
        description: 'Пантон на озере — можно постоять и полюбоваться закатом',
        photo: 'images/panton.jpg',
        locked: false 
    },
    { 
        id: 8, 
        name: 'Большое озеро', 
        lat: 55.961266, 
        lon: 36.367217, 
        tags: ['water', 'beauty', 'walk'],
        description: 'Самое большое озеро в поселке с видом на лес',
        photo: 'images/big_lake.jpg',
        locked: false 
    },

    // ==========================================
    // 4. ЛЬВИНОЕ СЕРДЦЕ (ЗАКРЫТАЯ ЗОНА)
    // ==========================================
    { 
        id: 9, 
        name: '🔒 Пляж Львиное Сердце', 
        lat: 55.961717, 
        lon: 36.364334, 
        tags: ['water', 'beauty', 'walk'],
        description: 'Закрытый пляж в элитном квартале. Требуется приглашение.',
        photo: 'images/lion_heart_beach.jpg',
        locked: true 
    },
    { 
        id: 10, 
        name: '🔒 Парящая тропинка над озером', 
        lat: 55.961184, 
        lon: 36.364169, 
        tags: ['beauty', 'walk', 'forest'],
        description: 'Тропинка с панорамным видом на озеро. Доступ по приглашению.',
        photo: 'images/floating_path.jpg',
        locked: true 
    },

    // ==========================================
    // 5. ЦЕНТРАЛЬНАЯ ЗОНА (РЕСТОРАНЫ, РАЗВЛЕЧЕНИЯ)
    // ==========================================
    { 
        id: 11, 
        name: 'Ресторан', 
        lat: 55.956598, 
        lon: 36.374963, 
        tags: ['restaurant', 'walk'],
        description: 'Уютный ресторан с домашней кухней и верандой',
        photo: 'images/restaurant.jpg',
        locked: false 
    },
    { 
        id: 12, 
        name: 'Сыроварня', 
        lat: 55.956699, 
        lon: 36.376112, 
        tags: ['restaurant', 'walk'],
        description: 'Сыроварня с дегустацией и магазином фермерских продуктов',
        photo: 'images/cheese_factory.jpg',
        locked: false 
    },
    { 
        id: 13, 
        name: 'Топиари парк', 
        lat: 55.957200, 
        lon: 36.374875, 
        tags: ['beauty', 'walk', 'kids'],
        description: 'Парк с фигурами из живых растений — красиво в любое время года',
        photo: 'images/topiary_park.jpg',
        locked: false 
    },
    { 
        id: 14, 
        name: 'Карусель', 
        lat: 55.957504, 
        lon: 36.374513, 
        tags: ['kids', 'walk'],
        description: 'Детская карусель в центре поселка',
        photo: 'images/carousel.jpg',
        locked: false 
    },
    { 
        id: 15, 
        name: 'Спорт бар', 
        lat: 55.956621, 
        lon: 36.375460, 
        tags: ['restaurant', 'walk'],
        description: 'Спортивный бар с большими экранами и вкусными закусками',
        photo: 'images/sport_bar.jpg',
        locked: false 
    },

    // ==========================================
    // 6. ДЕТСКАЯ ЗОНА И СПОРТ (тут были дубликаты координат!)
    // ==========================================
    { 
        id: 16, 
        name: 'Детский клуб', 
        lat: 55.956137, 
        lon: 36.374456, 
        tags: ['kids', 'walk'],
        description: 'Детский клуб с аниматорами и играми',
        photo: 'images/kids_club.jpg',
        locked: false 
    },
    // Сдвиг на 0.0004 по долготе (вправо)
    { 
        id: 17, 
        name: 'Каток / Футбольная коробка', 
        lat: 55.956137, 
        lon: 36.374856, 
        tags: ['kids', 'walk', 'run'],
        description: 'Зимой — каток, летом — футбольная коробка',
        photo: 'images/ice_rink_football.jpg',
        locked: false 
    },
    // Сдвиг на 0.0003 по широте (вниз)
    { 
        id: 18, 
        name: 'Теннисный корт', 
        lat: 55.955837, 
        lon: 36.374456, 
        tags: ['kids', 'walk', 'run'],
        description: 'Теннисный корт для любителей активного отдыха',
        photo: 'images/tennis_court.jpg',
        locked: false 
    },
    // Сдвиг на 0.0003 по широте и долготе (диагональ)
    { 
        id: 19, 
        name: 'Тренажеры и детская площадка', 
        lat: 55.955837, 
        lon: 36.374756, 
        tags: ['kids', 'walk', 'run'],
        description: 'Уличные тренажеры и современная детская площадка',
        photo: 'images/gym_playground.jpg',
        locked: false 
    },
    { 
        id: 20, 
        name: 'Трасса для радиоуправляемых машинок', 
        lat: 55.956239, 
        lon: 36.373894, 
        tags: ['kids', 'walk'],
        description: 'Трасса для радиоуправляемых машинок — восторг у детей!',
        photo: 'images/rc_car_track.jpg',
        locked: false 
    },

    // ==========================================
    // 7. ЗООПАРК И МОСТЫ
    // ==========================================
    { 
        id: 21, 
        name: 'Зоопарк', 
        lat: 55.956601, 
        lon: 36.373039, 
        tags: ['kids', 'walk'],
        description: 'Маленький зоопарк с домашними животными и птицами',
        photo: 'images/zoo.jpg',
        locked: false 
    },
    { 
        id: 22, 
        name: 'Лебядиный мост', 
        lat: 55.956286, 
        lon: 36.372998, 
        tags: ['water', 'beauty', 'walk'],
        description: 'Романтичный мост с видом на лебедей',
        photo: 'images/swan_bridge.jpg',
        locked: false 
    },

    // ==========================================
    // 8. БАССЕЙН, ПЛЯЖИ, СПА
    // ==========================================
    { 
        id: 23, 
        name: 'Бассейн', 
        lat: 55.956723, 
        lon: 36.371923, 
        tags: ['spa', 'water', 'walk'],
        description: 'Крытый бассейн с подогревом и зоной отдыха',
        photo: 'images/pool.jpg',
        locked: false 
    },
    { 
        id: 24, 
        name: 'Пляж Динозавров', 
        lat: 55.955290, 
        lon: 36.372216, 
        tags: ['water', 'kids', 'walk'],
        description: 'Пляж с фигурами динозавров — хит у детей и родителей!',
        photo: 'images/dinosaur_beach.jpg',
        locked: false 
    },
    { 
        id: 25, 
        name: 'СПА массажный салон', 
        lat: 55.954934, 
        lon: 36.371079, 
        tags: ['spa', 'walk'],
        description: 'Массажный салон с процедурами для тела и лица',
        photo: 'images/spa_massage.jpg',
        locked: false 
    },

    // ==========================================
    // 9. ТРОПИНКИ И ЗЕЛЕНЫЕ ЗОНЫ
    // ==========================================
    { 
        id: 26, 
        name: 'Тропинка здоровья в лесу', 
        lat: 55.956563, 
        lon: 36.371498, 
        tags: ['forest', 'walk', 'run'],
        description: 'Тропинка для скандинавской ходьбы и пробежек в лесу',
        photo: 'images/health_path.jpg',
        locked: false 
    },
    { 
        id: 27, 
        name: 'Зеленый уголок', 
        lat: 55.955965, 
        lon: 36.371310, 
        tags: ['beauty', 'walk'],
        description: 'Уютный зеленый уголок с лавочками и цветами',
        photo: 'images/green_corner.jpg',
        locked: false 
    },
    { 
        id: 28, 
        name: 'Мельница', 
        lat: 55.957934, 
        lon: 36.373403, 
        tags: ['beauty', 'walk'],
        description: 'Декоративная мельница — красивое место для фото',
        photo: 'images/mill.jpg',
        locked: false 
    },
    { 
        id: 29, 
        name: 'Секретный мост', 
        lat: 55.957727, 
        lon: 36.373491, 
        tags: ['beauty', 'walk'],
        description: 'Маленький мостик в тихом месте, где редко бывают люди',
        photo: 'images/secret_bridge.jpg',
        locked: false 
    },

    // ==========================================
    // 10. КАНЬЕН, СКЕЙТ-ПАРК (тут тоже были дубликаты!)
    // ==========================================
    { 
        id: 30, 
        name: 'Каньон', 
        lat: 55.958308, 
        lon: 36.379090, 
        tags: ['beauty', 'walk'],
        description: 'Живописный каньон с обрывом и видом на озеро',
        photo: 'images/canyon.jpg',
        locked: false 
    },
    // Оригинал: 55.954525, 36.374292 — Скейт-парк (оставляем как есть)
    { 
        id: 31, 
        name: 'Скейт-парк с рампами', 
        lat: 55.954525, 
        lon: 36.374292, 
        tags: ['kids', 'walk', 'run'],
        description: 'Скейт-парк с рампами для роллеров и скейтбордистов',
        photo: 'images/skate_park.jpg',
        locked: false 
    },
    // Сдвиг на 0.0004 по долготе (вправо) — Скелеты динозавров
    { 
        id: 32, 
        name: 'Скелеты динозавров', 
        lat: 55.954525, 
        lon: 36.374692, 
        tags: ['kids', 'beauty', 'walk'],
        description: 'Палеонтологическая зона со скелетами динозавров',
        photo: 'images/dinosaur_skeletons.jpg',
        locked: false 
    },

    // ==========================================
    // 11. ФОНТАНЫ И ПАРКИ (тут тоже дубликаты!)
    // ==========================================
    // Оригинал: 55.956623, 36.374787 — Световой фонтан (оставляем как есть)
    { 
        id: 33, 
        name: 'Световой фонтан', 
        lat: 55.956623, 
        lon: 36.374787, 
        tags: ['water', 'beauty', 'walk'],
        description: 'Красивый светодинамический фонтан с подсветкой',
        photo: 'images/light_fountain.jpg',
        locked: false 
    },
    // Сдвиг на 0.0004 по широте (вверх) — Парк цветов (закрытый)
    { 
        id: 34, 
        name: '🔒 Парк цветов', 
        lat: 55.957023, 
        lon: 36.374787, 
        tags: ['beauty', 'walk'],
        description: 'Цветочный парк с редкими растениями. Доступ по приглашению.',
        photo: 'images/flower_park.jpg',
        locked: true 
    },

    // ==========================================
    // 12. ЛЕСНЫЕ ТРОПЫ (ЗАКРЫТАЯ ЗОНА) — тут были дубликаты координат!
    // ==========================================
    { 
        id: 35, 
        name: '🔒 Лесная тропа', 
        lat: 55.962187, 
        lon: 36.363403, 
        tags: ['forest', 'walk', 'beauty'],
        description: 'Заповедная лесная тропа. Доступ по приглашению.',
        photo: 'images/forest_trail.jpg',
        locked: true 
    },
    // Дубликат 55.962187, 36.363403 — сдвиг на 0.0005 по широте
    { 
        id: 36, 
        name: '🔒 Парк Драконов', 
        lat: 55.962687, 
        lon: 36.363403, 
        tags: ['kids', 'beauty', 'walk'],
        description: 'Парк с фигурами драконов. Только по приглашению.',
        photo: 'images/dragons_park.jpg',
        locked: true 
    },
    { 
        id: 37, 
        name: '🔒 Пейнтбольная зона', 
        lat: 55.956118, 
        lon: 36.361841, 
        tags: ['kids', 'walk', 'run'],
        description: 'Пейнтбольная площадка. Требуется приглашение.',
        photo: 'images/paintball.jpg',
        locked: true 
    },

    // ==========================================
    // 13. СКАЗОЧНАЯ ДЕРЕВНЯ
    // ==========================================
    { 
        id: 38, 
        name: 'Сказочная деревня', 
        lat: 55.957000, 
        lon: 36.374119, 
        tags: ['kids', 'beauty', 'walk'],
        description: 'Домики в сказочном стиле — отличное место для семейных фото',
        photo: 'images/fairy_village.jpg',
        locked: false 
    },
    { 
        id: 39, 
        name: 'Дом Смурфиков', 
        lat: 55.956044, 
        lon: 36.373651, 
        tags: ['kids', 'beauty', 'walk'],
        description: 'Домик в стиле Смурфиков — радость для самых маленьких',
        photo: 'images/smurfs_house.jpg',
        locked: false 
    },

    // ==========================================
    // 14. СКВЕРЫ И ПЛОЩАДКИ
    // ==========================================
    { 
        id: 40, 
        name: 'Сквер', 
        lat: 55.959679, 
        lon: 36.382296, 
        tags: ['beauty', 'walk'],
        description: 'Ухоженный сквер с фонтаном и лавочками',
        photo: 'images/square.jpg',
        locked: false 
    },
    { 
        id: 41, 
        name: 'Детская площадка', 
        lat: 55.961274, 
        lon: 36.377301, 
        tags: ['kids', 'walk'],
        description: 'Современная детская площадка с батутами и горками',
        photo: 'images/playground.jpg',
        locked: false 
    }
];