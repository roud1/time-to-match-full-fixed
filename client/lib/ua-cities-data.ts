/**
 * Ukraine cities for profile / discover geo (coords ≈ city center).
 * Users can still enter any city manually via CUSTOM_CITY_ID.
 */
export const UA_CITIES = [
  // —— Major & regional centers ——
  { id: "kyiv", lat: 50.4501, lng: 30.5234, ru: "Киев", uk: "Київ", en: "Kyiv" },
  { id: "kharkiv", lat: 49.9935, lng: 36.2304, ru: "Харьков", uk: "Харків", en: "Kharkiv" },
  { id: "odesa", lat: 46.4825, lng: 30.7233, ru: "Одесса", uk: "Одеса", en: "Odesa" },
  { id: "dnipro", lat: 48.4647, lng: 35.0462, ru: "Днепр", uk: "Дніпро", en: "Dnipro" },
  { id: "lviv", lat: 49.8397, lng: 24.0297, ru: "Львов", uk: "Львів", en: "Lviv" },
  { id: "zaporizhzhia", lat: 47.8388, lng: 35.1396, ru: "Запорожье", uk: "Запоріжжя", en: "Zaporizhzhia" },
  { id: "kryvyi-rih", lat: 47.9105, lng: 33.3918, ru: "Кривой Рог", uk: "Кривий Ріг", en: "Kryvyi Rih" },
  { id: "mykolaiv", lat: 46.975, lng: 31.9946, ru: "Николаев", uk: "Миколаїв", en: "Mykolaiv" },
  { id: "vinnytsia", lat: 49.2331, lng: 28.4682, ru: "Винница", uk: "Вінниця", en: "Vinnytsia" },
  { id: "poltava", lat: 49.5883, lng: 34.5514, ru: "Полтава", uk: "Полтава", en: "Poltava" },
  { id: "chernihiv", lat: 51.4982, lng: 31.2893, ru: "Чернигов", uk: "Чернігів", en: "Chernihiv" },
  { id: "cherkasy", lat: 49.4444, lng: 32.0598, ru: "Черкассы", uk: "Черкаси", en: "Cherkasy" },
  { id: "zhytomyr", lat: 50.2547, lng: 28.6587, ru: "Житомир", uk: "Житомир", en: "Zhytomyr" },
  { id: "sumy", lat: 50.9077, lng: 34.7981, ru: "Сумы", uk: "Суми", en: "Sumy" },
  { id: "khmelnytskyi", lat: 49.4229, lng: 26.9871, ru: "Хмельницкий", uk: "Хмельницький", en: "Khmelnytskyi" },
  { id: "rivne", lat: 50.6199, lng: 26.2516, ru: "Ровно", uk: "Рівне", en: "Rivne" },
  { id: "kropyvnytskyi", lat: 48.5079, lng: 32.2623, ru: "Кропивницкий", uk: "Кропивницький", en: "Kropyvnytskyi" },
  { id: "ivano-frankivsk", lat: 48.9226, lng: 24.7111, ru: "Ивано-Франковск", uk: "Івано-Франківськ", en: "Ivano-Frankivsk" },
  { id: "ternopil", lat: 49.5535, lng: 25.5948, ru: "Тернополь", uk: "Тернопіль", en: "Ternopil" },
  { id: "lutsk", lat: 50.7472, lng: 25.3254, ru: "Луцк", uk: "Луцьк", en: "Lutsk" },
  { id: "uzhhorod", lat: 48.6208, lng: 22.2879, ru: "Ужгород", uk: "Ужгород", en: "Uzhhorod" },
  { id: "chernivtsi", lat: 48.2915, lng: 25.9403, ru: "Черновцы", uk: "Чернівці", en: "Chernivtsi" },
  { id: "kherson", lat: 46.6354, lng: 32.6169, ru: "Херсон", uk: "Херсон", en: "Kherson" },

  // —— Kyiv region ——
  { id: "bila-tserkva", lat: 49.8094, lng: 30.1121, ru: "Белая Церковь", uk: "Біла Церква", en: "Bila Tserkva" },
  { id: "brovary", lat: 50.5111, lng: 30.7909, ru: "Бровары", uk: "Бровари", en: "Brovary" },
  { id: "irpin", lat: 50.5218, lng: 30.2506, ru: "Ирпень", uk: "Ірпінь", en: "Irpin" },
  { id: "bucha", lat: 50.5432, lng: 30.212, ru: "Буча", uk: "Буча", en: "Bucha" },
  { id: "fastiv", lat: 50.0769, lng: 29.9173, ru: "Фастов", uk: "Фастів", en: "Fastiv" },
  { id: "vyshhorod", lat: 50.5849, lng: 30.4898, ru: "Вышгород", uk: "Вишгород", en: "Vyshhorod" },
  { id: "uman", lat: 48.75, lng: 30.2219, ru: "Умань", uk: "Умань", en: "Uman" },

  // —— Dnipropetrovsk oblast ——
  { id: "nikopol", lat: 47.5681, lng: 34.3962, ru: "Никополь", uk: "Нікополь", en: "Nikopol" },
  { id: "kamianske", lat: 48.5167, lng: 34.6131, ru: "Каменское", uk: "Кам'янське", en: "Kamianske" },
  { id: "pavlohrad", lat: 48.5342, lng: 35.8708, ru: "Павлоград", uk: "Павлоград", en: "Pavlohrad" },
  { id: "novomoskovsk", lat: 48.638, lng: 35.2398, ru: "Новомосковск", uk: "Новомосковськ", en: "Novomoskovsk" },
  { id: "zhovti-vody", lat: 48.3575, lng: 33.5032, ru: "Жёлтые Воды", uk: "Жовті Води", en: "Zhovti Vody" },
  { id: "marhanets", lat: 47.8319, lng: 34.6198, ru: "Марганец", uk: "Марганець", en: "Marhanets" },
  { id: "pokrov", lat: 48.4747, lng: 36.3536, ru: "Покров", uk: "Покров", en: "Pokrov" },
  { id: "synelnykove", lat: 48.3203, lng: 35.5219, ru: "Синельниково", uk: "Синельникове", en: "Synelnykove" },
  { id: "pershotravensk", lat: 48.3547, lng: 36.4011, ru: "Першотравенск", uk: "Першотравенськ", en: "Pershotravensk" },
  { id: "ternivka", lat: 48.5236, lng: 36.083, ru: "Терновка", uk: "Тернівка", en: "Ternivka" },

  // —— Zaporizhzhia oblast ——
  { id: "melitopol", lat: 46.8489, lng: 35.3653, ru: "Мелитополь", uk: "Мелітополь", en: "Melitopol" },
  { id: "berdiansk", lat: 46.7547, lng: 36.7987, ru: "Бердянск", uk: "Бердянськ", en: "Berdiansk" },
  { id: "enerhodar", lat: 47.4987, lng: 34.6562, ru: "Энергодар", uk: "Енергодар", en: "Enerhodar" },
  { id: "tokmak", lat: 47.2552, lng: 35.7084, ru: "Токмак", uk: "Токмак", en: "Tokmak" },
  { id: "polohy", lat: 47.4826, lng: 36.2537, ru: "Пологи", uk: "Пологи", en: "Polohy" },
  { id: "orikhiv", lat: 47.5678, lng: 35.7858, ru: "Орехов", uk: "Оріхів", en: "Orikhiv" },

  // —— Donetsk oblast (cities; users may still pick) ——
  { id: "mariupol", lat: 47.0951, lng: 37.5498, ru: "Мариуполь", uk: "Маріуполь", en: "Mariupol" },
  { id: "kramatorsk", lat: 48.7231, lng: 37.5563, ru: "Краматорск", uk: "Краматорськ", en: "Kramatorsk" },
  { id: "sloviansk", lat: 48.8575, lng: 37.6084, ru: "Славянск", uk: "Слов'янськ", en: "Sloviansk" },
  { id: "bakhmut", lat: 48.5954, lng: 38.0002, ru: "Бахмут", uk: "Бахмут", en: "Bakhmut" },
  { id: "kostiantynivka", lat: 48.5273, lng: 37.7077, ru: "Константиновка", uk: "Костянтинівка", en: "Kostiantynivka" },
  { id: "pokrovsk", lat: 48.2849, lng: 37.1758, ru: "Покровск", uk: "Покровськ", en: "Pokrovsk" },
  { id: "druzhkivka", lat: 48.6299, lng: 37.5166, ru: "Дружковка", uk: "Дружківка", en: "Druzhkivka" },

  // —— Kharkiv oblast ——
  { id: "izium", lat: 49.1896, lng: 37.2835, ru: "Изюм", uk: "Ізюм", en: "Izium" },
  { id: "kupiansk", lat: 49.7105, lng: 37.6131, ru: "Купянск", uk: "Куп'янськ", en: "Kupiansk" },
  { id: "chuhuiv", lat: 49.8356, lng: 36.6566, ru: "Чугуев", uk: "Чугуїв", en: "Chuhuiv" },
  { id: "lozova", lat: 48.8894, lng: 36.3176, ru: "Лозовая", uk: "Лозова", en: "Lozova" },
  { id: "liubotyn", lat: 49.9469, lng: 35.9291, ru: "Люботин", uk: "Люботин", en: "Liubotyn" },

  // —— Luhansk oblast ——
  { id: "severodonetsk", lat: 48.9482, lng: 38.4879, ru: "Северодонецк", uk: "Сєвєродонецьк", en: "Sievierodonetsk" },
  { id: "lysychansk", lat: 48.9048, lng: 38.442, ru: "Лисичанск", uk: "Лисичанськ", en: "Lysychansk" },
  { id: "rubizhne", lat: 49.012, lng: 38.379, ru: "Рубежное", uk: "Рубіжне", en: "Rubizhne" },

  // —— Poltava oblast ——
  { id: "kremenchuk", lat: 49.0685, lng: 33.4104, ru: "Кременчуг", uk: "Кременчук", en: "Kremenchuk" },
  { id: "lubny", lat: 50.016, lng: 33.0006, ru: "Лубны", uk: "Лубни", en: "Lubny" },
  { id: "myrhorod", lat: 49.9685, lng: 33.6085, ru: "Миргород", uk: "Миргород", en: "Myrhorod" },
  { id: "horishni-plavni", lat: 49.0167, lng: 33.65, ru: "Горишние Плавни", uk: "Горішні Плавні", en: "Horishni Plavni" },

  // —— Cherkasy oblast ——
  { id: "smila", lat: 49.2244, lng: 31.8883, ru: "Смела", uk: "Сміла", en: "Smila" },
  { id: "zolotonosha", lat: 49.6681, lng: 32.0469, ru: "Золотоноша", uk: "Золотоноша", en: "Zolotonosha" },
  { id: "kaniv", lat: 49.752, lng: 31.47, ru: "Канев", uk: "Канів", en: "Kaniv" },

  // —— Vinnytsia oblast ——
  { id: "zhmerynka", lat: 49.0386, lng: 28.1086, ru: "Жмеринка", uk: "Жмеринка", en: "Zhmerynka" },
  { id: "khmilnyk", lat: 49.5586, lng: 27.9565, ru: "Хмельник", uk: "Хмільник", en: "Khmilnyk" },
  { id: "bar", lat: 49.0775, lng: 27.6828, ru: "Бар", uk: "Бар", en: "Bar" },

  // —— Odesa oblast ——
  { id: "izmail", lat: 45.3517, lng: 28.8364, ru: "Измаил", uk: "Ізмаїл", en: "Izmail" },
  { id: "chornomorsk", lat: 46.3013, lng: 30.6551, ru: "Черноморск", uk: "Чорноморськ", en: "Chornomorsk" },
  { id: "podilsk", lat: 47.7467, lng: 29.5283, ru: "Подольск", uk: "Подільськ", en: "Podilsk" },
  { id: "bilhorod-dnistrovskyi", lat: 46.2018, lng: 30.343, ru: "Белгород-Днестровский", uk: "Білгород-Дністровський", en: "Bilhorod-Dnistrovskyi" },
  { id: "yuzhne", lat: 46.6221, lng: 31.1013, ru: "Южное", uk: "Южне", en: "Yuzhne" },

  // —— Mykolaiv oblast ——
  { id: "pervomaisk", lat: 48.0449, lng: 30.8507, ru: "Первомайск", uk: "Первомайськ", en: "Pervomaisk" },
  { id: "vosnesensk", lat: 47.0119, lng: 31.6572, ru: "Вознесенск", uk: "Вознесенськ", en: "Vosnesensk" },
  { id: "oleksandriia", lat: 48.6769, lng: 33.116, ru: "Александрия", uk: "Олександрія", en: "Oleksandriia" },

  // —— Kherson oblast ——
  { id: "kakhovka", lat: 46.8137, lng: 33.523, ru: "Каховка", uk: "Каховка", en: "Kakhovka" },
  { id: "nova-kakhovka", lat: 46.7547, lng: 33.369, ru: "Новая Каховка", uk: "Нова Каховка", en: "Nova Kakhovka" },
  { id: "henichesk", lat: 46.177, lng: 34.8034, ru: "Геническ", uk: "Генічеськ", en: "Henichesk" },

  // —— Sumy oblast ——
  { id: "konotop", lat: 51.2403, lng: 33.2029, ru: "Конотоп", uk: "Конотоп", en: "Konotop" },
  { id: "shostka", lat: 51.8568, lng: 33.4718, ru: "Шостка", uk: "Шостка", en: "Shostka" },
  { id: "okhtyrka", lat: 50.3104, lng: 34.8983, ru: "Ахтырка", uk: "Охтирка", en: "Okhtyrka" },
  { id: "romny", lat: 50.7484, lng: 33.4767, ru: "Ромны", uk: "Ромни", en: "Romny" },
  { id: "lebedyn", lat: 50.5852, lng: 34.4849, ru: "Лебедин", uk: "Лебедин", en: "Lebedyn" },

  // —— Chernihiv oblast ——
  { id: "nizhyn", lat: 51.048, lng: 31.8867, ru: "Нежин", uk: "Ніжин", en: "Nizhyn" },
  { id: "pryluky", lat: 50.5942, lng: 32.3866, ru: "Прилуки", uk: "Прилуки", en: "Pryluky" },

  // —— Zhytomyr oblast ——
  { id: "korosten", lat: 50.9583, lng: 28.6386, ru: "Коростень", uk: "Коростень", en: "Korosten" },
  { id: "berdychiv", lat: 49.8994, lng: 28.6024, ru: "Бердичев", uk: "Бердичів", en: "Berdychiv" },
  { id: "novohrad-volynskyi", lat: 50.592, lng: 27.616, ru: "Новоград-Волынский", uk: "Новоград-Волинський", en: "Novohrad-Volynskyi" },

  // —— Kirovohrad oblast ——
  { id: "svitlovodsk", lat: 49.0489, lng: 33.2411, ru: "Светловодск", uk: "Світловодськ", en: "Svitlovodsk" },
  { id: "znamianka", lat: 48.7208, lng: 32.6675, ru: "Знаменка", uk: "Знам'янка", en: "Znamianka" },

  // —— Volyn & Rivne oblast ——
  { id: "kovel", lat: 51.2089, lng: 24.7097, ru: "Ковель", uk: "Ковель", en: "Kovel" },
  { id: "novovolynsk", lat: 50.834, lng: 24.1647, ru: "Нововолынск", uk: "Нововолинськ", en: "Novovolynsk" },
  { id: "varash", lat: 51.7453, lng: 25.7798, ru: "Вараш", uk: "Вараш", en: "Varash" },
  { id: "dubno", lat: 50.4167, lng: 25.75, ru: "Дубно", uk: "Дубно", en: "Dubno" },

  // —— Lviv oblast ——
  { id: "drohobych", lat: 49.3497, lng: 23.5055, ru: "Дрогобыч", uk: "Дрогобич", en: "Drohobych" },
  { id: "stryi", lat: 49.262, lng: 23.8561, ru: "Стрый", uk: "Стрий", en: "Stryi" },
  { id: "chervonohrad", lat: 50.391, lng: 24.235, ru: "Червоноград", uk: "Червоноград", en: "Chervonohrad" },
  { id: "sambir", lat: 49.5159, lng: 23.202, ru: "Самбор", uk: "Самбір", en: "Sambir" },
  { id: "boryslav", lat: 49.2867, lng: 23.434, ru: "Борислав", uk: "Борислав", en: "Boryslav" },

  // —— Ivano-Frankivsk oblast ——
  { id: "kalush", lat: 49.0236, lng: 24.3722, ru: "Калуш", uk: "Калуш", en: "Kalush" },
  { id: "kolomyia", lat: 49.53, lng: 25.0413, ru: "Коломыя", uk: "Коломия", en: "Kolomyia" },
  { id: "yaremche", lat: 48.4556, lng: 24.5547, ru: "Яремче", uk: "Яремче", en: "Yaremche" },

  // —— Ternopil oblast ——
  { id: "chortkiv", lat: 49.017, lng: 25.798, ru: "Чертков", uk: "Чортків", en: "Chortkiv" },
  { id: "kremenets", lat: 50.0981, lng: 25.7243, ru: "Кременец", uk: "Кременець", en: "Kremenets" },

  // —— Zakarpattia ——
  { id: "mukachevo", lat: 48.4432, lng: 22.7179, ru: "Мукачево", uk: "Мукачево", en: "Mukachevo" },
  { id: "khust", lat: 48.1792, lng: 23.2994, ru: "Хуст", uk: "Хуст", en: "Khust" },
  { id: "berehove", lat: 48.2056, lng: 22.6447, ru: "Берегово", uk: "Берегове", en: "Berehove" },

  // —— Khmelnytskyi oblast ——
  { id: "kamianets-podilskyi", lat: 48.6845, lng: 26.5858, ru: "Каменец-Подольский", uk: "Кам'янець-Подільський", en: "Kamianets-Podilskyi" },
  { id: "shepetivka", lat: 50.185, lng: 27.067, ru: "Шепетовка", uk: "Шепетівка", en: "Shepetivka" },
  { id: "netishyn", lat: 50.833, lng: 26.641, ru: "Нетешин", uk: "Нетішин", en: "Netishyn" },

  // —— Chernivtsi oblast ——
  { id: "storozhynets", lat: 48.1633, lng: 25.7186, ru: "Сторожинец", uk: "Сторожинець", en: "Storozhynets" },
] as const
