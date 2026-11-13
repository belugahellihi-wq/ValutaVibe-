<p align="center"><img src="branding/wordmark.svg" alt="ValutaVibe" width="680" /></p>

[![Build Android APK](https://github.com/belugahellihi-wq/ValutaVibe-/actions/workflows/android-apk.yml/badge.svg)](https://github.com/belugahellihi-wq/ValutaVibe-/actions/workflows/android-apk.yml)

## Скачать APK с телефона или планшета

1. Открой [Build Android APK](https://github.com/belugahellihi-wq/ValutaVibe-/actions/workflows/android-apk.yml) в браузере и войди в GitHub.
2. Выбери последний успешный запуск с зелёной галочкой.
3. Внизу в **Artifacts** нажми **ValutaVibe-Android-APK** и скачай ZIP.
4. Распакуй ZIP встроенным файловым менеджером. Открой `ValutaVibe-1.0.0-preview.apk` и разреши установку из выбранного источника, если Android попросит.

Для новой сборки нажми **Run workflow → Run workflow**. Если кнопка не видна в мобильной версии, включи «Версия для ПК» в браузере. Компьютер и Android Studio на телефоне не нужны: сборка выполняется в GitHub Actions. Изменения кода в `main` тоже запускают сборку автоматически.

Артефакты хранятся 30 дней; после истечения срока запусти сборку заново. Preview APK подписывается тестовым debug-ключом. При конфликте подписи со старой preview-сборкой её придётся удалить перед установкой новой; избранное и кэш при удалении пропадут. Для обновляемого публичного релиза используй постоянный приватный release keystore.

Логотипы находятся в [`branding/`](branding/README.md). Приложение только показывает курсы и считает эквивалент: финансовых операций нет.

---

# ValutaVibe 1.0

Мобильное Android-приложение для просмотра справочных курсов, истории и расчёта валютного эквивалента. React + TypeScript + Vite + Tailwind CSS + Framer Motion + Lucide + Capacitor 8.

**В приложении нет покупки, продажи, обмена, переводов, банковских счетов или платёжных интеграций.** Конвертер только умножает сумму на справочный курс. Регистрация, API-ключ и собственный backend не нужны.

## Быстрый запуск из этого архива

1. Распакуй папку `ValutaVibe` и открой её в VS Code.
2. Установи Node.js 22.12+ (подойдёт Node.js 24 LTS).
3. Открой терминал **в папке с package.json**:

```bash
npm ci
npm run dev
```

Открой адрес Vite из терминала. Для имитации телефона включи Device Toolbar в инструментах разработчика. Это только предпросмотр: в APK браузерной адресной строки не будет.

Для production-сборки:

```bash
npm run build
npm run preview
```

Статические файлы появятся в `dist/`. Не открывай `dist/index.html` двойным кликом: используй сервер предпросмотра или Capacitor.

## Что реализовано

- OLED-палитра, стеклянная карточка, emerald/rose-индикация изменения курса.
- Четыре экрана: обзор, валюты, расчёт, избранное. Нижняя навигация учитывает системные отступы.
- Анимации переходов, пружинное нажатие карточек, анимированный график и модальные панели.
- Лёгкий нативный haptic feedback на поддерживаемом устройстве. Системное уменьшение движения учитывается.
- Реальные временные ряды за 7, 30, 90 и 365 календарных дней. Проведение по графику показывает дату и значение; с клавиатуры работают стрелки.
- Минимум, максимум, количество точек и изменение за выбранный период. Одна доступная точка отображается без выдуманного тренда.
- USD, EUR, KGS, GBP, RUB, KZT, CNY, JPY, CHF; любую из них можно выбрать базовой.
- Сом KGS — базовая валюта по умолчанию. Например, карточка USD показывает стоимость **1 USD в KGS**.
- Поиск по коду и русскому названию, локальное избранное, сохранение базовой валюты.
- Конвертер с десятичной запятой/точкой, сменой направления и проверкой ввода.
- Кэш успешных запросов, включая доступ на следующий день офлайн, явная дата сохранения, повторная загрузка и отмена устаревших запросов.
- Обработка сетевых ошибок, ответа 429, пустого ответа, тайм-аута 15 секунд и повреждённого кэша.
- Android Back закрывает панель, затем возвращает на обзор; на обзоре закрывает приложение.
- Собственная векторная марка V, Android launcher icons, тёмная заставка.
- У модальных панелей есть фокус-ловушка, закрытие по Escape, кнопке, фону или свайпу вниз за верхнюю ручку. Основное содержимое становится `inert`.

## Структура

| Путь | Назначение |
| --- | --- |
| `src/main.tsx` | Запуск React и настройка системных панелей |
| `src/App.tsx` | Экраны, навигация, избранное, конвертер |
| `src/styles.css` | Тема, mobile-first layout, safe areas и Tailwind |
| `src/components/Chart.tsx` | Интерактивный SVG-график с градиентом и клавиатурным управлением |
| `src/components/Sheet.tsx` | Анимированная нижняя панель и управление фокусом |
| `src/hooks/useRates.ts` | Загрузка, отмена запросов, ошибки и кэш |
| `src/hooks/useConnection.ts` | Сеть, восстановление активности и обновление |
| `src/lib/api.ts` | Frankfurter API, проверка ответа и валютная математика |
| `src/lib/currencies.ts` | Валюты и форматирование |
| `src/lib/storage.ts` | Безопасная работа с localStorage, лимит кэша |
| `src/lib/native.ts` | Haptics и SystemBars |
| `public/icon.svg` | Векторный логотип |
| `capacitor.config.ts` | App ID, имя, `webDir`, native configuration |
| `vite.config.ts` | Vite, React, Tailwind |
| `package.json`, `package-lock.json` | Зависимости с закреплёнными версиями |
| `tests/rates.test.ts` | Расчёты, формат ввода, направление курсов и кэш |
| `tests/app.test.tsx` | Навигация, поиск, конвертер и сетевые ошибки в DOM |
| `android/` | Уже созданный нативный Android-проект с Gradle wrapper |
| `android/app/src/main/java/com/valutavibe/app/MainActivity.java` | Native entry point и EdgeToEdge |
| `android/app/src/main/AndroidManifest.xml` | Манифест, HTTPS-only, параметры клавиатуры |
| `android/app/src/main/res/` | Иконки, заставка, темы и имя приложения |
| `android/variables.gradle` | minSdk 24, compileSdk/targetSdk 36 |

`node_modules/`, `dist/`, SDK, keystore и локальные Gradle build directories в архив не включены; они устанавливаются или генерируются командами ниже.

## Откуда данные и как считаются значения

Используется публичный **Frankfurter v2** без ключа. Пример запроса:

```text
https://api.frankfurter.dev/v2/rates?base=USD&quotes=KGS&from=2026-10-14&to=2026-11-13
```

Даты в приложении формируются автоматически в UTC, это не фиксированный диапазон. Ответ — массив `{ date, base, quote, rate }`.

Для списка приложение получает общий базис, например `base=KGS`, затем переворачивает каждый курс: если API сообщает KGS→USD, карточка USD показывает `1 / rate`, то есть KGS за один USD. Это же направление используется при расчёте изменения.

Для конвертера:

```text
результат = сумма × стоимость исходной валюты в базовой / стоимость целевой в базовой
```

Для графика запрашивается выбранная пара напрямую. Небольшие расхождения с инверсией возможны из-за округления у источника. Процент рядом с большой ценой сравнивает последние две доступные даты; процент под графиком — первую и последнюю точку выбранного периода. Это разные показатели. Emerald/rose означает рост/снижение отображаемого курса, а не оценку выгодности покупки.

Frankfurter возвращает справочные данные из официальных источников, не поток биржевых тиков. Даты валют могут различаться. Интерфейс показывает даты и отмечает разные даты исходных данных конвертера. Банковский спред и комиссии не моделируются. Если нужной валюты/истории нет, приложение показывает отсутствие данных, а не заменяет их демонстрационными значениями.

Последние успешные ответы сохраняются только на устройстве, до 28 наборов. История для ещё не загруженной пары или периода офлайн недоступна. Кэш может быть очищен системой или пользователем. При первом запуске без сети нет курса — будет состояние ошибки с повторной загрузкой. В APK интерфейс загружается локально даже без интернета; браузерная PWA с service worker в этот проект не входит.

## Сборка Android APK из архива

### 1. Установи инструменты

- Android Studio **2025.2.1 или новее**, совместимую с Capacitor 8.
- В **Tools → SDK Manager → SDK Platforms** установи **Android SDK Platform 36**.
- В **SDK Tools** установи Android SDK Build-Tools 36, Platform-Tools и Command-line Tools. Для эмулятора дополнительно Android Emulator и system image.
- Используй **JDK 21**. Android Studio поставляется с JDK; проверь Gradle JDK в **Settings → Build, Execution, Deployment → Build Tools → Gradle**.
- Для запуска нужен Android 7+ с достаточно новым Android System WebView/Chrome (в проекте минимум WebView 111). На старых Android обнови WebView из магазина, если доступно.

### 2. Подготовь web-часть и синхронизируй её

В папке `ValutaVibe`:

```bash
npm ci
npm run android:sync
npm run android:open
```

`android:sync` выполняет `npm run build` и `npx cap sync android`. `android:open` открывает Android Studio.

**В архиве уже есть `capacitor.config.ts` и `android/`: повторно `cap init` и `cap add android` запускать не нужно.**

Дождись завершения Gradle Sync в Android Studio. При первом открытии потребуются интернет и загрузка зависимостей. Android Studio создаст `android/local.properties` с путём к твоему SDK. Этот файл нельзя переносить с другого компьютера.

### 3. Получи тестовый APK через Android Studio

1. Выбери build variant `debug`.
2. Открой **Build → Generate App Bundles or APKs → Generate APKs**. В некоторых версиях меню называется **Build Bundle(s) / APK(s) → Build APK(s)**.
3. После сборки нажми **locate** в уведомлении.

Файл:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Его можно передать на телефон и установить, разрешив установку APK из выбранного файлового менеджера. Это debug APK для проверки, а не подписанный релиз для магазина.

### 4. Или собери APK из терминала

Сначала выполни из корня проекта:

```bash
npm run android:sync
cd android
```

Windows PowerShell:

```powershell
.\gradlew.bat assembleDebug
```

macOS / Linux:

```bash
chmod +x gradlew
./gradlew assembleDebug
```

Путь к APK тот же. Если Gradle не находит Java, установи `JAVA_HOME` на каталог JDK 21 (не на `bin`) и добавь его `bin` в PATH. Если не найден SDK, открой проект в Android Studio или создай `android/local.properties` с `sdk.dir`, например:

```properties
sdk.dir=C:/Users/YourName/AppData/Local/Android/Sdk
```

Linux-пример: `sdk.dir=/home/yourname/Android/Sdk`.

### 5. Установка через USB

Включи на телефоне режим разработчика и USB debugging, подключи его и подтверди запрос устройства.

Из папки `android`:

```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

Либо из корня проекта после синхронизации:

```bash
npx cap run android
```

### 6. Подписанный релиз

В Android Studio выбери **Build → Generate Signed App Bundle / APK → APK**. Создай свой keystore, выбери `release` и собери приложение. Сохрани keystore и пароли отдельно: для обновления этого же приложения нужна та же подпись. Секреты и keystore не должны попадать в git.

Для Google Play в этом же мастере выбирай Android App Bundle. Для прямой установки — APK. В этом архиве нет чужого или общего release signing key.

### 7. После изменения React-кода

```bash
npm run android:sync
```

Затем снова собери APK. Один `cap sync` без `npm run build` может скопировать старую web-сборку; готовый npm-скрипт всегда делает оба шага.

## Инициализация Capacitor с нуля

Этот раздел для нового проекта **без** конфига и папки `android`, а не для повторного выполнения поверх архива:

```bash
npm install @capacitor/core@8.6.2 @capacitor/android@8.6.2
npm install -D @capacitor/cli@8.6.2
npx cap init ValutaVibe com.valutavibe.app --web-dir dist
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

Можно выполнить просто `npx cap init` и ответить на вопросы: App name `ValutaVibe`, App ID `com.valutavibe.app`, Web directory `dist`. Для функциональности этого проекта также нужны плагины из `package.json` и настройки/ресурсы из предоставленного `android/`. После создания платформы перенеси `MainActivity.java`, тему, иконки и изменения манифеста из архива; обычный `cap add android` создаёт стандартный шаблон, а не эти доработки.

`com.valutavibe.app` — начальный идентификатор проекта. Если меняешь его перед первым релизом, измени также `applicationId`/`namespace` в `android/app/build.gradle`, пакет Java, путь `MainActivity.java` и соответствующие strings. После публикации идентификатор приложения обычно сохраняют.

## Safe area и нативное поведение

`index.html` содержит `viewport-fit=cover`. Верхний отступ, нижняя навигация и модальная панель используют `env(safe-area-inset-top)` и `env(safe-area-inset-bottom)`; учтены боковые вырезы. Нельзя просто прибавлять постоянные 24/48 px: вырезы и режимы навигации устройств различаются.

В Capacitor 8 включён встроенный `SystemBars` с `insetsHandling: 'native'`. На старых WebView он применяет нативные отступы и обнуляет CSS env, на новых — передаёт корректные safe-area значения. Это предотвращает двойной отступ. `MainActivity` включает `EdgeToEdge`, системные значки светлые. Для Android 15/16 нельзя рассчитывать на старый `StatusBar.setOverlaysWebView(false)`; этот проект от него не зависит.

Навигационная панель Android остаётся системной, приложение не прячет её принудительно. Собственная нижняя навигация располагается над ней. На планшете контент ограничен 520 px и центрирован; это сознательно мобильный интерфейс, не настольный финансовый терминал.

## Проверки и ограничения

```bash
npm test
npm run build
```

На этапе подготовки исходников выполнены TypeScript/Vite production build, тесты валютной математики и поведения React, `cap add android` и `cap sync android`. Реальный запрос Frankfurter для восьми валют относительно KGS проверен. В тестах используются отдельные контролируемые примеры; они не попадают в приложение.

Первый preview APK успешно собран в [GitHub Actions](https://github.com/belugahellihi-wq/ValutaVibe-/actions/runs/43503014376): прошли 9 тестов, TypeScript/Vite build, Capacitor sync, Gradle assembleDebug и проверка подписи apksigner. [Скачать APK-архив](https://github.com/belugahellihi-wq/ValutaVibe-/actions/runs/43503014376/artifacts/14075077442) (нужен вход в GitHub; срок хранения — 30 дней).

Запуск на реальном телефоне ещё не проверен. Автоматический визуальный прогон Chromium в среде подготовки был недоступен. DOM-тесты и успешная компиляция не заменяют проверку Android WebView.

Перед своим релизом проверь установленный APK: вырез экрана, жестовую и трёхкнопочную навигацию, открытие клавиатуры, Android Back, смену сети, первый запуск без сети и повторный офлайн-запуск. Посмотри узкий экран 320 px и увеличенный системный шрифт. При ошибке Gradle сначала сверь JDK 21 / SDK 36 и запусти Sync.

В исходниках нет платёжных SDK, аналитических трекеров, API-секретов или загрузки удалённого исполняемого кода. API-запросы идут по HTTPS, HTTP для приложения отключён. Разрешения плагинов относятся к интернету, состоянию сети и вибрации. Это не обещание отсутствия любых уязвимостей: зависимости и Android/WebView нужно поддерживать актуальными.

## Документация источников

- Frankfurter API: https://frankfurter.dev/
- Capacitor setup: https://capacitorjs.com/docs/getting-started/environment-setup
- Capacitor initialization: https://capacitorjs.com/docs/getting-started
- Android: https://capacitorjs.com/docs/android
- SystemBars и safe area: https://capacitorjs.com/docs/apis/system-bars

