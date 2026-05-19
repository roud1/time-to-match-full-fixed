"use client"

import { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from "react"
import { useUserLocation, type LocationStatus } from "@/hooks/use-user-location"
import {
  PROFILE_CITY_COORDS,
  distanceKm,
  formatDistance,
  type GeoPosition,
} from "@/lib/geo"

export type Locale = "ru" | "uk" | "en"

export const translations = {
  ru: {
    // Navbar
    login: "Войти",
    register: "Регистрация",
    
    // Hero
    badge: "ВРЕМЯ ИСТЕКАЕТ",
    heroTitle: "У тебя всего",
    heroHighlight: "72 часа.",
    heroSubtitle: "Каждый профиль исчезает через 72 часа. Не теряй время — найди того, кто изменит твою жизнь, пока не стало слишком поздно.",
    startSearch: "Начать поиск",
    learnMore: "Узнать больше",
    hours: "Часов",
    minutes: "Минут",
    seconds: "Секунд",
    untilDisappear: "до исчезновения профилей",
    heroUrgent: "Время уходит",
    heroTimeRunning: "Каждый профиль исчезает через 72 часа",
    profileOnline: "Онлайн",
    profileExpiresIn: "Исчезнет через",
    profileLastChance: "Последний шанс",
    onboard1Title: "Ваш профиль живёт только 72 часа",
    onboard1Sub: "Срочность создаёт настоящие знакомства — без бесконечных переписок.",
    onboard2Title: "Каждый матч имеет значение",
    onboard2Sub: "Взаимная симпатия открывает чат. Не тратьте время на пустые свайпы.",
    onboard3Title: "Не упустите свой шанс",
    onboard3Sub: "Пока таймер тикает — вы в центре внимания. Успейте познакомиться.",
    onboardContinue: "Далее",
    onboardSkip: "Пропустить",
    onboardStart: "Создать профиль",
    chatTyping: "печатает…",
    chatOnline: "в сети",
    chatExpires: "Матч исчезнет через",
    chatVoiceHint: "Голосовое",
    chatReact: "Реакция",
    
    // Profiles section
    profilesBadge: "Профили",
    profilesTitle: "Они могут",
    profilesHighlight: "исчезнуть",
    profilesTitleEnd: "навсегда",
    profilesSubtitle: "Каждый профиль уникален. Каждое решение важно. Время идёт.",
    profileDistances: ["2 км", "5 км", "1 км", "8 км"],
    
    // Swipe UI
    swipeTitle: "Найди свою судьбу",
    swipeSubtitle: "Свайп вправо — шанс. Свайп влево — навсегда потерян.",
    remaining: "Осталось:",
    like: "ЛАЙК",
    nope: "НЕЕЕ",
    noMoreProfiles: "Больше профилей скоро появятся",
    
    // Profile data
    profiles: [
      {
        name: "Алиса",
        location: "Киев",
        bio: "Люблю путешествия и хороший кофе",
        interests: ["Путешествия", "Кофе", "Фотография"],
      },
      {
        name: "Максим",
        location: "Львов",
        bio: "Фотограф. Ищу свою музу",
        interests: ["Фотография", "Искусство", "Музыка"],
      },
      {
        name: "Виктория",
        location: "Одесса",
        bio: "Архитектор с любовью к искусству",
        interests: ["Архитектура", "Дизайн", "Йога"],
      },
      {
        name: "Дмитрий",
        location: "Харьков",
        bio: "Предприниматель. Ценю искренность",
        interests: ["Бизнес", "Спорт", "Путешествия"],
      },
    ],
    
    // How it works
    howBadge: "Как это работает",
    howTitle: "Три шага до",
    howTitleHighlight: "встречи",
    howSubtitle: "Три простых шага к встрече с тем, кто может изменить твою жизнь",
    step1Title: "Создай профиль",
    step1Desc: "Загрузи фото и расскажи о себе. У тебя есть 72 часа, чтобы произвести впечатление.",
    step2Title: "Свайпай",
    step2Desc: "Смотри профили и принимай решения. Каждый выбор имеет значение — второго шанса не будет.",
    step3Title: "Общайся",
    step3Desc: "Если симпатия взаимна — начни разговор. Время идёт, не упусти момент.",
    
    // CTA
    ctaBadge: "Начни сейчас",
    ctaTitle: "Время",
    ctaTitleHighlight: "уходит",
    ctaSubtitle: "Не жди идеального момента. Идеальный момент — сейчас. Кто-то ждёт именно тебя.",
    ctaButton: "Создать профиль",
    ctaDisclaimer: "Бесплатно. Без обязательств. Только 72 часа.",
    
    // Footer
    footerTagline: "72 часа. Одна возможность. Твоя судьба.",
    contacts: "Контакты",
    product: "Продукт",
    howItWorks: "Как это работает",
    pricing: "Тарифы",
    faq: "FAQ",
    company: "Компания",
    about: "О нас",
    blog: "Блог",
    careers: "Карьера",
    legal: "Правовая информация",
    privacy: "Конфиденциальность",
    terms: "Условия",
    cookies: "Cookies",
    copyright: "Time to Match. Все права защищены.",

    // Geolocation
    locationLoading: "Определяем...",
    locationEnable: "Включить",
    locationDenied: "Геолокация выкл.",
    locationUnsupported: "Недоступно",
    locationBannerText: "Включите геолокацию, чтобы видеть расстояния до профилей рядом с вами.",

    // Registration
    regPageTitle: "Создать профиль",
    regPageSubtitle: "72 часа начнутся сразу после регистрации",
    regStepAccount: "Аккаунт",
    regStepProfile: "О себе",
    regStepFinish: "Финал",
    regName: "Имя",
    regNamePlaceholder: "Как тебя зовут?",
    regEmail: "Email",
    regEmailPlaceholder: "you@example.com",
    regPassword: "Пароль",
    regPasswordPlaceholder: "Минимум 8 символов",
    regConfirmPassword: "Подтвердите пароль",
    regBirthdate: "Дата рождения",
    regGender: "Я",
    regGenderMale: "Мужчина",
    regGenderFemale: "Женщина",
    regGenderOther: "Другое",
    regLookingFor: "Ищу",
    regLookingMen: "Мужчин",
    regLookingWomen: "Женщин",
    regLookingAll: "Всех",
    regCity: "Город",
    regCityPlaceholder: "Ваш город",
    regCitySelect: "Выберите город",
    regCityOther: "Другой город",
    regCityManual: "Ввести город вручную",
    regCityFromList: "Выбрать из списка",
    regInterests: "Интересы",
    regInterestsHint: "Выберите от 3 до 8 интересов",
    regInterestsMin: "Ещё {n} или больше",
    regErrorInterests: "Выберите минимум 3 интереса",
    regBio: "О себе",
    regBioPlaceholder: "Расскажи о себе — это увидят другие...",
    regPhoto: "Фото профиля",
    regPhotosHint: "Добавьте до {n} фото — первое будет главным",
    regPhotosAdd: "Добавить фото",
    regPhotosMax: "Максимум {n} фото",
    regPhotoHint: "Загрузи лучшие фото — у тебя 72 часа произвести впечатление",
    regPhotoUpload: "Выбрать фото",
    regAgreeTerms: "Я принимаю",
    regTerms: "условия использования",
    regAnd: "и",
    regPrivacy: "политику конфиденциальности",
    regNext: "Далее",
    regBack: "Назад",
    regSubmit: "Создать профиль",
    regHasAccount: "Уже есть аккаунт?",
    regSignIn: "Войти",
    regSuccessTitle: "Профиль создан!",
    regSuccessSubtitle: "Твой 72-часовой таймер запущен. Не упусти шанс найти свою пару.",
    regGoHome: "Начать поиск",
    regErrorRequired: "Заполните это поле",
    regErrorEmail: "Введите корректный email",
    regErrorPassword: "Пароль должен быть не менее 8 символов",
    regErrorPasswordMatch: "Пароли не совпадают",
    regErrorAge: "Вам должно быть не менее 18 лет",
    regErrorTerms: "Примите условия для продолжения",

    // Login
    loginPageTitle: "Вход",
    loginPageSubtitle: "С возвращением — продолжай поиск",
    loginForgotPassword: "Забыли пароль?",
    loginRemember: "Запомнить меня",
    loginSubmit: "Войти",
    loginNoAccount: "Нет аккаунта?",
    loginSignUp: "Регистрация",
    loginLoading: "Входим...",
    loginErrorNoAccount: "Аккаунт не найден. Сначала зарегистрируйтесь.",
    loginErrorInvalid: "Неверный email или пароль",

    welcomeBadge: "Профиль активен",
    welcomeTitle: "Добро пожаловать",
    welcomeSubtitle: "Твой профиль уже в ленте. У тебя 72 часа, чтобы найти свою пару.",
    welcomeTimerLabel: "До исчезновения профиля",
    welcomeYourCity: "Ваш город",
    welcomeTip1: "Свайпай вправо — если интересно, влево — если нет",
    welcomeTip2: "Профили исчезают через 72 часа — не откладывай",
    welcomeTip3: "Взаимная симпатия открывает чат",
    welcomeStart: "Начать свайпать",
    welcomeBrowse: "На главную",
    welcomeInterests: "Ваши интересы",
    welcomeViewProfile: "Мой профиль",

    navProfile: "Профиль",
    profilePageTitle: "Мой профиль",
    profilePageSubtitle: "Управляйте профилем, пока идёт 72-часовой таймер",
    profileEdit: "Редактировать",
    profileSave: "Сохранить",
    profileCancel: "Отмена",
    profileLogout: "Выйти",
    profileEmail: "Email",
    profileAge: "Возраст",
    profileYears: "лет",
    profileGender: "Я",
    profileLookingFor: "Ищу",
    profileCity: "Город",
    profileBio: "О себе",
    profileInterests: "Интересы",
    profileMemberSince: "Профиль создан",
    profileTimerLabel: "До исчезновения",
    profileProgress: "Осталось времени",
    profileActive: "Активен",
    profileExpired: "Время вышло",
    profileStartSwipe: "Начать свайпать",
    profileSaved: "Изменения сохранены",
    profileChangePhoto: "Сменить фото",
    profilePhotos: "Фото",
    profilePhotoPrimary: "Главное",
    profilePhotoMakePrimary: "Сделать главным",
    profilePhotoRemove: "Удалить фото",
    profileTabProfile: "Профиль",
    profileTabPremium: "Премиум",
    premiumTitle: "Premium",
    premiumSubtitle: "Больше совпадений за 72 часа",
    premiumPitch: "Подключите премиум, чтобы выделиться в ленте и не пропустить тех, кому вы понравились.",
    premiumActiveBadge: "Премиум активен",
    premiumTimeLeft: "Осталось {days} дн. {hours} ч.",
    premiumFeatureBoost: "Буст профиля — вас видят чаще в ленте",
    premiumFeatureLikes: "Список всех, кто лайкнул вас",
    premiumFeatureMap: "Приоритет на карте «рядом»",
    premiumFeatureTimer: "+24 часа к таймеру профиля",
    premiumPrice: "299 ₽",
    premiumPricePeriod: "7 дней",
    premiumPriceNote: "Можно отменить в любой момент",
    premiumActivate: "Попробовать 7 дней бесплатно",
    premiumAlreadyActive: "Премиум уже подключён",
    premiumDemoNote: "Демо-режим: без реальной оплаты, только для прототипа",

    tabDiscover: "Анкеты",
    tabLikes: "Лайки",
    tabChat: "Чат",
    tabMap: "Карта",
    likesSubtitle: "Кто лайкнул ваш профиль",
    likesEmpty: "Пока никого — продолжайте свайпать",
    likesLikedYou: "Лайкнул(а) вас",
    likesLikeBack: "Ответить лайком",
    chatSubtitle: "Диалоги после взаимной симпатии",
    chatEmpty: "Пока нет чатов — найдите взаимный лайк",
    chatPlaceholder: "Сообщение...",
    chatSend: "Отправить",
    mapSubtitle: "Люди рядом с вами на карте",
    mapYou: "Вы здесь",
    mapHint: "Нажмите на метку, чтобы увидеть анкету",
    matchFlash: "Это матч с",
    navApp: "Лента",
  },
  uk: {
    // Navbar
    login: "Увійти",
    register: "Реєстрація",
    
    // Hero
    badge: "ЧАС СПЛИВАЄ",
    heroTitle: "У тебе лише",
    heroHighlight: "72 години.",
    heroSubtitle: "Кожен профіль зникає через 72 години. Не гай часу — знайди того, хто змінить твоє життя, поки не стало надто пізно.",
    startSearch: "Почати пошук",
    learnMore: "Дізнатись більше",
    hours: "Годин",
    minutes: "Хвилин",
    seconds: "Секунд",
    untilDisappear: "до зникнення профілів",
    heroUrgent: "Час минає",
    heroTimeRunning: "Кожен профіль зникає за 72 години",
    profileOnline: "Онлайн",
    profileExpiresIn: "Зникне через",
    profileLastChance: "Останній шанс",
    onboard1Title: "Ваш профіль живе лише 72 години",
    onboard1Sub: "Терміновість створює справжні знайомства — без нескінченних переписок.",
    onboard2Title: "Кожен матч має значення",
    onboard2Sub: "Взаємна симпатія відкриває чат. Не витрачайте час на порожні свайпи.",
    onboard3Title: "Не втратьте свій шанс",
    onboard3Sub: "Поки таймер тікає — ви в центрі уваги. Встигніть познайомитися.",
    onboardContinue: "Далі",
    onboardSkip: "Пропустити",
    onboardStart: "Створити профіль",
    chatTyping: "друкує…",
    chatOnline: "в мережі",
    chatExpires: "Матч зникне через",
    chatVoiceHint: "Голосове",
    chatReact: "Реакція",
    
    // Profiles section
    profilesBadge: "Профілі",
    profilesTitle: "Вони можуть",
    profilesHighlight: "зникнути",
    profilesTitleEnd: "назавжди",
    profilesSubtitle: "Кожен профіль унікальний. Кожне рішення важливе. Час іде.",
    profileDistances: ["2 км", "5 км", "1 км", "8 км"],
    
    // Swipe UI
    swipeTitle: "Знайди свою долю",
    swipeSubtitle: "Свайп вправо — шанс. Свайп вліво — назавжди втрачено.",
    remaining: "Залишилось:",
    like: "ЛАЙК",
    nope: "НІ",
    noMoreProfiles: "Більше профілів з'являться незабаром",
    
    // Profile data
    profiles: [
      {
        name: "Аліса",
        location: "Київ",
        bio: "Люблю подорожі та гарну каву",
        interests: ["Подорожі", "Кава", "Фотографія"],
      },
      {
        name: "Максим",
        location: "Львів",
        bio: "Фотограф. Шукаю свою музу",
        interests: ["Фотографія", "Мистецтво", "Музика"],
      },
      {
        name: "Вікторія",
        location: "Одеса",
        bio: "Архітектор з любов'ю до мистецтва",
        interests: ["Архітектура", "Дизайн", "Йога"],
      },
      {
        name: "Дмитро",
        location: "Харків",
        bio: "Підприємець. Ціную щирість",
        interests: ["Бізнес", "Спорт", "Подорожі"],
      },
    ],
    
    // How it works
    howBadge: "Як це працює",
    howTitle: "Три кроки до",
    howTitleHighlight: "зустрічі",
    howSubtitle: "Три прості кроки до зустрічі з тим, хто може змінити твоє життя",
    step1Title: "Створи профіль",
    step1Desc: "Завантаж фото та розкажи про себе. У тебе є 72 години, щоб справити враження.",
    step2Title: "Свайпай",
    step2Desc: "Дивись профілі та приймай рішення. Кожен вибір має значення — другого шансу не буде.",
    step3Title: "Спілкуйся",
    step3Desc: "Якщо симпатія взаємна — почни розмову. Час іде, не втрать момент.",
    
    // CTA
    ctaBadge: "Почни зараз",
    ctaTitle: "Час",
    ctaTitleHighlight: "спливає",
    ctaSubtitle: "Не чекай ідеального моменту. Ідеальний момент — зараз. Хтось чекає саме на тебе.",
    ctaButton: "Створити профіль",
    ctaDisclaimer: "Безкоштовно. Без зобов'язань. Лише 72 години.",
    
    // Footer
    footerTagline: "72 години. Одна можливість. Твоя доля.",
    contacts: "Контакти",
    product: "Продукт",
    howItWorks: "Як це працює",
    pricing: "Тарифи",
    faq: "FAQ",
    company: "Компанія",
    about: "Про нас",
    blog: "Блог",
    careers: "Кар'єра",
    legal: "Правова інформація",
    privacy: "Конфіденційність",
    terms: "Умови",
    cookies: "Cookies",
    copyright: "Time to Match. Всі права захищені.",

    locationLoading: "Визначаємо...",
    locationEnable: "Увімкнути",
    locationDenied: "Геолокація вимк.",
    locationUnsupported: "Недоступно",
    locationBannerText: "Увімкніть геолокацію, щоб бачити відстані до профілів поруч із вами.",

    regPageTitle: "Створити профіль",
    regPageSubtitle: "72 години почнуться одразу після реєстрації",
    regStepAccount: "Акаунт",
    regStepProfile: "Про себе",
    regStepFinish: "Фінал",
    regName: "Ім'я",
    regNamePlaceholder: "Як тебе звати?",
    regEmail: "Email",
    regEmailPlaceholder: "you@example.com",
    regPassword: "Пароль",
    regPasswordPlaceholder: "Мінімум 8 символів",
    regConfirmPassword: "Підтвердіть пароль",
    regBirthdate: "Дата народження",
    regGender: "Я",
    regGenderMale: "Чоловік",
    regGenderFemale: "Жінка",
    regGenderOther: "Інше",
    regLookingFor: "Шукаю",
    regLookingMen: "Чоловіків",
    regLookingWomen: "Жінок",
    regLookingAll: "Усіх",
    regCity: "Місто",
    regCityPlaceholder: "Ваше місто",
    regCitySelect: "Оберіть місто",
    regCityOther: "Інше місто",
    regCityManual: "Ввести місто вручну",
    regCityFromList: "Обрати зі списку",
    regInterests: "Інтереси",
    regInterestsHint: "Оберіть від 3 до 8 інтересів",
    regInterestsMin: "Ще {n} або більше",
    regErrorInterests: "Оберіть мінімум 3 інтереси",
    regBio: "Про себе",
    regBioPlaceholder: "Розкажи про себе — це побачать інші...",
    regPhoto: "Фото профілю",
    regPhotosHint: "Додайте до {n} фото — перше буде головним",
    regPhotosAdd: "Додати фото",
    regPhotosMax: "Максимум {n} фото",
    regPhotoHint: "Завантаж найкращі фото — у тебе 72 години справити враження",
    regPhotoUpload: "Обрати фото",
    regAgreeTerms: "Я приймаю",
    regTerms: "умови використання",
    regAnd: "та",
    regPrivacy: "політику конфіденційності",
    regNext: "Далі",
    regBack: "Назад",
    regSubmit: "Створити профіль",
    regHasAccount: "Вже є акаунт?",
    regSignIn: "Увійти",
    regSuccessTitle: "Профіль створено!",
    regSuccessSubtitle: "Твій 72-годинний таймер запущено. Не втрать шанс знайти свою пару.",
    regGoHome: "Почати пошук",
    regErrorRequired: "Заповніть це поле",
    regErrorEmail: "Введіть коректний email",
    regErrorPassword: "Пароль має бути не менше 8 символів",
    regErrorPasswordMatch: "Паролі не збігаються",
    regErrorAge: "Вам має бути не менше 18 років",
    regErrorTerms: "Прийміть умови для продовження",

    loginPageTitle: "Вхід",
    loginPageSubtitle: "З поверненням — продовжуй пошук",
    loginForgotPassword: "Забули пароль?",
    loginRemember: "Запам'ятати мене",
    loginSubmit: "Увійти",
    loginNoAccount: "Немає акаунта?",
    loginSignUp: "Реєстрація",
    loginLoading: "Входимо...",
    loginErrorNoAccount: "Акаунт не знайдено. Спочатку зареєструйтесь.",
    loginErrorInvalid: "Невірний email або пароль",

    welcomeBadge: "Профіль активний",
    welcomeTitle: "Ласкаво просимо",
    welcomeSubtitle: "Твій профіль уже в стрічці. У тебе 72 години, щоб знайти свою пару.",
    welcomeTimerLabel: "До зникнення профілю",
    welcomeYourCity: "Ваше місто",
    welcomeTip1: "Свайп вправо — якщо цікаво, вліво — якщо ні",
    welcomeTip2: "Профілі зникають через 72 години — не відкладай",
    welcomeTip3: "Взаємна симпатія відкриває чат",
    welcomeStart: "Почати свайпати",
    welcomeBrowse: "На головну",
    welcomeInterests: "Ваші інтереси",
    welcomeViewProfile: "Мій профіль",

    navProfile: "Профіль",
    profilePageTitle: "Мій профіль",
    profilePageSubtitle: "Керуйте профілем, поки триває 72-годинний таймер",
    profileEdit: "Редагувати",
    profileSave: "Зберегти",
    profileCancel: "Скасувати",
    profileLogout: "Вийти",
    profileEmail: "Email",
    profileAge: "Вік",
    profileYears: "років",
    profileGender: "Я",
    profileLookingFor: "Шукаю",
    profileCity: "Місто",
    profileBio: "Про себе",
    profileInterests: "Інтереси",
    profileMemberSince: "Профіль створено",
    profileTimerLabel: "До зникнення",
    profileProgress: "Залишилось часу",
    profileActive: "Активний",
    profileExpired: "Час вийшов",
    profileStartSwipe: "Почати свайпати",
    profileSaved: "Зміни збережено",
    profileChangePhoto: "Змінити фото",
    profilePhotos: "Фото",
    profilePhotoPrimary: "Головне",
    profilePhotoMakePrimary: "Зробити головним",
    profilePhotoRemove: "Видалити фото",
    profileTabProfile: "Профіль",
    profileTabPremium: "Преміум",
    premiumTitle: "Premium",
    premiumSubtitle: "Більше збігів за 72 години",
    premiumPitch: "Підключіть преміум, щоб виділитися в стрічці й не пропустити тих, кому ви сподобалися.",
    premiumActiveBadge: "Преміум активний",
    premiumTimeLeft: "Залишилось {days} дн. {hours} год.",
    premiumFeatureBoost: "Буст профілю — вас частіше бачать у стрічці",
    premiumFeatureLikes: "Список усіх, хто лайкнув вас",
    premiumFeatureMap: "Пріоритет на карті «поруч»",
    premiumFeatureTimer: "+24 години до таймера профілю",
    premiumPrice: "299 ₴",
    premiumPricePeriod: "7 днів",
    premiumPriceNote: "Можна скасувати будь-коли",
    premiumActivate: "Спробувати 7 днів безкоштовно",
    premiumAlreadyActive: "Преміум уже підключено",
    premiumDemoNote: "Демо-режим: без реальної оплати, лише для прототипу",

    tabDiscover: "Анкети",
    tabLikes: "Лайки",
    tabChat: "Чат",
    tabMap: "Карта",
    likesSubtitle: "Хто лайкнув ваш профіль",
    likesEmpty: "Поки нікого — продовжуйте свайпати",
    likesLikedYou: "Лайкнув(ла) вас",
    likesLikeBack: "Відповісти лайком",
    chatSubtitle: "Діалоги після взаємної симпатії",
    chatEmpty: "Поки немає чатів — знайдіть взаємний лайк",
    chatPlaceholder: "Повідомлення...",
    chatSend: "Надіслати",
    mapSubtitle: "Люди поруч із вами на карті",
    mapYou: "Ви тут",
    mapHint: "Натисніть на мітку, щоб побачити анкету",
    matchFlash: "Це матч з",
    navApp: "Стрічка",
  },
  en: {
    // Navbar
    login: "Sign In",
    register: "Sign Up",
    
    // Hero
    badge: "TIME IS RUNNING OUT",
    heroTitle: "You only have",
    heroHighlight: "72 hours.",
    heroSubtitle: "Every profile disappears after 72 hours. Don't waste time — find the one who will change your life before it's too late.",
    startSearch: "Start Search",
    learnMore: "Learn More",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    untilDisappear: "until profiles disappear",
    heroUrgent: "Time is running out",
    heroTimeRunning: "Every profile disappears in 72 hours",
    profileOnline: "Online",
    profileExpiresIn: "Expires in",
    profileLastChance: "Last chance",
    onboard1Title: "Your profile lives only 72 hours",
    onboard1Sub: "Urgency creates real connections — no endless small talk.",
    onboard2Title: "Every match matters",
    onboard2Sub: "Mutual likes open the chat. Don't waste time on empty swipes.",
    onboard3Title: "Don't waste your chance",
    onboard3Sub: "While the timer ticks, you're in the spotlight. Meet someone now.",
    onboardContinue: "Continue",
    onboardSkip: "Skip",
    onboardStart: "Create profile",
    chatTyping: "typing…",
    chatOnline: "online",
    chatExpires: "Match expires in",
    chatVoiceHint: "Voice",
    chatReact: "React",
    
    // Profiles section
    profilesBadge: "Profiles",
    profilesTitle: "They could",
    profilesHighlight: "disappear",
    profilesTitleEnd: "forever",
    profilesSubtitle: "Every profile is unique. Every choice matters. Time is ticking.",
    profileDistances: ["2 km", "5 km", "1 km", "8 km"],
    
    // Swipe UI
    swipeTitle: "Find Your Destiny",
    swipeSubtitle: "Swipe right — a chance. Swipe left — lost forever.",
    remaining: "Remaining:",
    like: "LIKE",
    nope: "NOPE",
    noMoreProfiles: "More profiles coming soon",
    
    // Profile data
    profiles: [
      {
        name: "Alice",
        location: "Kyiv",
        bio: "Love traveling and good coffee",
        interests: ["Travel", "Coffee", "Photography"],
      },
      {
        name: "Max",
        location: "Lviv",
        bio: "Photographer. Looking for my muse",
        interests: ["Photography", "Art", "Music"],
      },
      {
        name: "Victoria",
        location: "Odesa",
        bio: "Architect with a love for art",
        interests: ["Architecture", "Design", "Yoga"],
      },
      {
        name: "Dmitry",
        location: "Kharkiv",
        bio: "Entrepreneur. Value sincerity",
        interests: ["Business", "Sports", "Travel"],
      },
    ],
    
    // How it works
    howBadge: "How It Works",
    howTitle: "Three steps to",
    howTitleHighlight: "a match",
    howSubtitle: "Three simple steps to meet someone who could change your life",
    step1Title: "Create Profile",
    step1Desc: "Upload photos and tell about yourself. You have 72 hours to make an impression.",
    step2Title: "Swipe",
    step2Desc: "Browse profiles and make decisions. Every choice matters — there's no second chance.",
    step3Title: "Connect",
    step3Desc: "If it's mutual — start a conversation. Time is ticking, don't miss the moment.",
    
    // CTA
    ctaBadge: "Start now",
    ctaTitle: "Time is",
    ctaTitleHighlight: "running out",
    ctaSubtitle: "Don't wait for the perfect moment. The perfect moment is now. Someone is waiting for you.",
    ctaButton: "Create Profile",
    ctaDisclaimer: "Free. No commitment. Just 72 hours.",
    
    // Footer
    footerTagline: "72 hours. One chance. Your destiny.",
    contacts: "Contact",
    product: "Product",
    howItWorks: "How it Works",
    pricing: "Pricing",
    faq: "FAQ",
    company: "Company",
    about: "About",
    blog: "Blog",
    careers: "Careers",
    legal: "Legal",
    privacy: "Privacy",
    terms: "Terms",
    cookies: "Cookies",
    copyright: "Time to Match. All rights reserved.",

    locationLoading: "Locating...",
    locationEnable: "Enable",
    locationDenied: "Location off",
    locationUnsupported: "Unavailable",
    locationBannerText: "Enable location to see distances to nearby profiles.",

    regPageTitle: "Create Profile",
    regPageSubtitle: "Your 72 hours start right after sign-up",
    regStepAccount: "Account",
    regStepProfile: "About you",
    regStepFinish: "Finish",
    regName: "Name",
    regNamePlaceholder: "What should we call you?",
    regEmail: "Email",
    regEmailPlaceholder: "you@example.com",
    regPassword: "Password",
    regPasswordPlaceholder: "At least 8 characters",
    regConfirmPassword: "Confirm password",
    regBirthdate: "Date of birth",
    regGender: "I am",
    regGenderMale: "Man",
    regGenderFemale: "Woman",
    regGenderOther: "Other",
    regLookingFor: "Looking for",
    regLookingMen: "Men",
    regLookingWomen: "Women",
    regLookingAll: "Everyone",
    regCity: "City",
    regCityPlaceholder: "Your city",
    regCitySelect: "Select a city",
    regCityOther: "Other city",
    regCityManual: "Enter city manually",
    regCityFromList: "Choose from list",
    regInterests: "Interests",
    regInterestsHint: "Pick 3 to 8 interests",
    regInterestsMin: "{n} more needed",
    regErrorInterests: "Select at least 3 interests",
    regBio: "Bio",
    regBioPlaceholder: "Tell others about yourself...",
    regPhoto: "Profile photo",
    regPhotosHint: "Add up to {n} photos — the first one is your main photo",
    regPhotosAdd: "Add photos",
    regPhotosMax: "Maximum {n} photos",
    regPhotoHint: "Upload your best photos — you have 72 hours to make an impression",
    regPhotoUpload: "Choose photo",
    regAgreeTerms: "I agree to the",
    regTerms: "Terms of Use",
    regAnd: "and",
    regPrivacy: "Privacy Policy",
    regNext: "Next",
    regBack: "Back",
    regSubmit: "Create Profile",
    regHasAccount: "Already have an account?",
    regSignIn: "Sign In",
    regSuccessTitle: "Profile created!",
    regSuccessSubtitle: "Your 72-hour timer has started. Don't miss your chance to find a match.",
    regGoHome: "Start searching",
    regErrorRequired: "This field is required",
    regErrorEmail: "Enter a valid email",
    regErrorPassword: "Password must be at least 8 characters",
    regErrorPasswordMatch: "Passwords do not match",
    regErrorAge: "You must be at least 18 years old",
    regErrorTerms: "Please accept the terms to continue",

    loginPageTitle: "Sign In",
    loginPageSubtitle: "Welcome back — continue your search",
    loginForgotPassword: "Forgot password?",
    loginRemember: "Remember me",
    loginSubmit: "Sign In",
    loginNoAccount: "Don't have an account?",
    loginSignUp: "Sign Up",
    loginLoading: "Signing in...",
    loginErrorNoAccount: "No account found. Please sign up first.",
    loginErrorInvalid: "Incorrect email or password",

    welcomeBadge: "Profile active",
    welcomeTitle: "Welcome",
    welcomeSubtitle: "Your profile is live. You have 72 hours to find your match.",
    welcomeTimerLabel: "Until your profile disappears",
    welcomeYourCity: "Your city",
    welcomeTip1: "Swipe right if you're interested, left if not",
    welcomeTip2: "Profiles disappear in 72 hours — don't wait",
    welcomeTip3: "A mutual like opens the chat",
    welcomeStart: "Start swiping",
    welcomeBrowse: "Back to home",
    welcomeInterests: "Your interests",
    welcomeViewProfile: "My profile",

    navProfile: "Profile",
    profilePageTitle: "My profile",
    profilePageSubtitle: "Manage your profile while the 72-hour timer is running",
    profileEdit: "Edit",
    profileSave: "Save",
    profileCancel: "Cancel",
    profileLogout: "Sign out",
    profileEmail: "Email",
    profileAge: "Age",
    profileYears: "years old",
    profileGender: "I am",
    profileLookingFor: "Looking for",
    profileCity: "City",
    profileBio: "About me",
    profileInterests: "Interests",
    profileMemberSince: "Profile created",
    profileTimerLabel: "Until disappearance",
    profileProgress: "Time remaining",
    profileActive: "Active",
    profileExpired: "Time's up",
    profileStartSwipe: "Start swiping",
    profileSaved: "Changes saved",
    profileChangePhoto: "Change photo",
    profilePhotos: "Photos",
    profilePhotoPrimary: "Main",
    profilePhotoMakePrimary: "Set as main",
    profilePhotoRemove: "Remove photo",
    profileTabProfile: "Profile",
    profileTabPremium: "Premium",
    premiumTitle: "Premium",
    premiumSubtitle: "More matches in your 72 hours",
    premiumPitch: "Unlock premium to stand out in the feed and see everyone who liked you.",
    premiumActiveBadge: "Premium active",
    premiumTimeLeft: "{days}d {hours}h remaining",
    premiumFeatureBoost: "Profile boost — shown more often in the feed",
    premiumFeatureLikes: "See everyone who liked you",
    premiumFeatureMap: "Priority on the nearby map",
    premiumFeatureTimer: "+24 hours on your profile timer",
    premiumPrice: "$4.99",
    premiumPricePeriod: "7 days",
    premiumPriceNote: "Cancel anytime",
    premiumActivate: "Try 7 days free",
    premiumAlreadyActive: "Premium is already active",
    premiumDemoNote: "Demo only — no real payment in this prototype",

    tabDiscover: "Discover",
    tabLikes: "Likes",
    tabChat: "Chat",
    tabMap: "Map",
    likesSubtitle: "People who liked your profile",
    likesEmpty: "No likes yet — keep swiping",
    likesLikedYou: "Liked you",
    likesLikeBack: "Like back",
    chatSubtitle: "Chats after a mutual match",
    chatEmpty: "No chats yet — get a mutual like",
    chatPlaceholder: "Message...",
    chatSend: "Send",
    mapSubtitle: "People near you on the map",
    mapYou: "You are here",
    mapHint: "Tap a pin to see a profile",
    matchFlash: "It's a match with",
    navApp: "Feed",
  },
}

type TranslationKey = keyof typeof translations.ru
type ProfileTranslation = (typeof translations.ru.profiles)[number]

const PROFILE_AGES = [25, 28, 27, 26] as const
const PROFILE_TIMERS = ["23:45:12", "47:22:08", "12:15:33", "68:30:45"] as const

export function buildProfileCards(
  locale: Locale,
  userPosition?: GeoPosition | null
) {
  const dict = translations[locale]
  return dict.profiles.map((profile, index) => {
    const distance =
      userPosition != null
        ? formatDistance(
            locale,
            distanceKm(userPosition, PROFILE_CITY_COORDS[index])
          )
        : dict.profileDistances[index]

    return {
      id: index + 1,
      ...profile,
      age: PROFILE_AGES[index],
      distance,
      image: `/images/profile-${index + 1}.jpg`,
      timeLeft: PROFILE_TIMERS[index],
    }
  })
}

interface LocationContextValue {
  status: LocationStatus
  city: string | null
  position: GeoPosition | null
  countryCode: string | null
  requestLocation: () => void
}

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
  profiles: ProfileTranslation[]
  profileCards: ReturnType<typeof buildProfileCards>
  location: LocationContextValue
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ru")
  
  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale
    if (saved && ["ru", "uk", "en"].includes(saved)) {
      setLocale(saved)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale === "uk" ? "uk" : locale
  }, [locale])
  
  const handleSetLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale)
    localStorage.setItem("locale", newLocale)
  }, [])

  const {
    status: locationStatus,
    position: userPosition,
    city: userCity,
    countryCode: userCountryCode,
    requestLocation,
  } = useUserLocation({
    locale,
    onLocaleSuggestion: handleSetLocale,
  })
  
  const t = (key: TranslationKey) => {
    const value = translations[locale][key]
    return typeof value === "string" ? value : ""
  }

  const profileCards = useMemo(
    () => buildProfileCards(locale, userPosition),
    [locale, userPosition]
  )

  const location = useMemo(
    () => ({
      status: locationStatus,
      city: userCity,
      position: userPosition,
      countryCode: userCountryCode,
      requestLocation,
    }),
    [locationStatus, userCity, userPosition, userCountryCode, requestLocation]
  )
  
  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale: handleSetLocale,
        t,
        profiles: translations[locale].profiles,
        profileCards,
        location,
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider")
  }
  return context
}

export const localeNames: Record<Locale, string> = {
  ru: "RU",
  uk: "UA",
  en: "EN",
}
