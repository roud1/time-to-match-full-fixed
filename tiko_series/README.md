# Tiko — The Origami Explorer · производственная система сериала

Оригинальный детский 3D-мультсериал для YouTube Shorts (1080×1920, 30 fps, 20 с, английский язык).
Первая серия (финальный мастер) хранится отдельно и не меняется: `../tiko_shorts_001/`.

## Структура

```
tiko_series/
  tiko/                         Python-пакет (общий для всех серий)
    config.py                   формат выпуска, палитра Тико, голос, пресеты рендера
    anim/                       анимация на чистом Python (без Blender)
      pose.py                   «контракт» позы: каналы тела и лица
      expressions.py            библиотека выражений лица (16 шт.)
      motions.py                библиотека движений (17 шт.)
      timeline.py               сборка серии: путь, клипы движений, выражения, моргание, липсинк,
                                вторичная анимация ушей/хвоста (пружины), реквизит, искры, события звука
      camera.py                 планы камеры: follow, two_shot, closeup, orbit, static (+ плавные переходы)
      curves.py                 интерполяция, easing, пружины
    blender/                    сборка сцены в Blender 5.3
      character.py              ПОСТОЯННАЯ модель Тико: build / load / apply_pose
      materials.py              бумага (волокна, складки, мягкий блеск), золото, глаза, рот
      meshes.py                 построение мешей + «оригами-отделка» (тона граней, светлые фаски сгибов)
      sets/meadow.py            окружение «Бумажный луг» с параметрами (seed, длина, клумбы, плотность)
      props.py                  реквизит: яблоко, бумажный кораблик, звёздочка
      scene.py                  свет (sunrise/day/sunset), камера, пресеты Cycles/Eevee, запекание анимации
    audio/
      voice.py                  голос Тико (Kokoro-82M, фиксированные настройки) + огибающая для липсинка
      music.py                  аранжировщик партитуры -> MIDI -> FluidSynth + FluidR3 GM (MIT)
      sfx.py                    библиотека оригинальных звуковых эффектов (синтез)
      mix.py                    сведение: голос сверху, приглушение музыки под репликами
    post.py                     субтитры SRT/ASS и финальная сборка MP4
  episodes/
    _template/episode.py        шаблон сценария новой серии
    ep001_flying_apple/         серия 1 в новом формате (эталон-пример)
    ep002_dancing_star/         черновик серии 2 (на согласование)
  tools/
    make_episode.py             конвейер серии (стадии voice → blend → audio → subs → animatic → final)
    build_character.py          собирает постоянный ассет Тико: assets/character/tiko_character.blend
    character_sheet.py          листы согласования: повороты, выражения, движения
    bench_engines.py            сравнение Eevee и Cycles на одинаковых кадрах
  assets/
    character/                  tiko_character.blend + листы согласования
    fonts/                      Fredoka (SIL OFL)
  docs/                         отчёты (бенчмарк движков и т.д.)
```

## Как сделать новую серию

1. `cp -r episodes/_template episodes/ep003_my_story` и описать в `episode.py` реплики, движения, выражения, камеру, музыку.
2. `python3 tools/make_episode.py episodes/ep003_my_story --stage preview`
   → голос, сцена `.blend`, музыка+звук, субтитры и **аниматик** (низкое разрешение, ~10–15 мин).
3. Просмотреть `build/ep003_animatic.mp4`, поправить сценарий, повторить шаг 2.
4. После утверждения: создать пустой файл `episodes/ep003_my_story/APPROVED`.
5. `python3 tools/make_episode.py episodes/ep003_my_story --stage final`
   → полный рендер + `build/Tiko_EP003.mp4` (1080×1920, 30 fps, H.264 + AAC, −14 LUFS, субтитры вшиты).

Без файла `APPROVED` финальные пресеты рендера не запускаются — массовый рендер невозможно начать случайно.

## Библиотеки

**Движения** (`tiko/anim/motions.py`): idle, walk, run, jump, land, fall, takeoff, fly, surprise, laugh, dance,
wave, spin, look, shake_head, ride, sit. Каждое движение задаёт позу тела/лица и звуковые события
(шаги, «бойнг», шорох бумаги, взмахи…), поэтому звук расставляется автоматически.

**Выражения** (`tiko/anim/expressions.py`): neutral, happy, joy (^^), giggle, surprised, shocked, curious, excited,
sleepy, wink, determined, worried, sad, dizzy, proud, oops.

**Лицо**: верхние и нижние веки (раздельно для каждого глаза), брови (подъём + наклон), зрачки (размер, взгляд),
блики, румянец, рот на shape keys (closed smile / open D / O / frown / wide).

## Лицензии

| Компонент | Источник | Лицензия |
|---|---|---|
| Blender 5.3 (`bpy`) | PyPI | GPL (инструмент; результаты рендера принадлежат автору) |
| Голос: Kokoro-82M | github.com/thewh1teagle/kokoro-onnx | Apache-2.0 — коммерческое использование разрешено |
| Инструменты: FluidR3 GM | пакет Ubuntu `fluid-soundfont-gm` | MIT (`/usr/share/doc/fluid-soundfont-gm/copyright`) |
| Музыка (композиция) и звуковые эффекты | созданы в этом проекте | оригинальные |
| Шрифт Fredoka | npm `@expo-google-fonts/fredoka` | SIL OFL 1.1 (`assets/fonts/OFL_Fredoka.txt`) |
