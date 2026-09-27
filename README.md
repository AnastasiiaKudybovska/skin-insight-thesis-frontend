# Skin Insight AI — фронтенд

React-інтерфейс для класифікації зображень шкіри, перегляду XAI-пояснень та історії.

## Запуск усього PoC через Docker Compose

Потрібні Docker і Docker Compose. Бекенд має лежати поруч із цим каталогом під назвою `skin-insight-thesis-backend`: Compose збирає його з `../skin-insight-thesis-backend`.

Для гостьового аналізу покладіть `resnet_model.h5` у `../skin-insight-thesis-backend/app/classification_models/`. Авторизований звичайний і дослідницький режими використовують реальні checkpoint-и класифікації та сегментації з [переліку бекенду](../skin-insight-thesis-backend/app/classification_models/MODELS.md). Без відповідних ваг конфігурація буде недоступною.

З каталогу фронтенду виконайте:

```bash
docker compose up --build
```

Якщо порт `8000` зайнятий іншим сервісом, задайте інший порт API; фронтенд отримає ту саму адресу автоматично:

```bash
API_PORT=8001 docker compose up --build
```

Відкрийте <http://localhost:3000>. API доступне на <http://localhost:8000>, його документація — на <http://localhost:8000/docs>. Compose запускає фронтенд, API та MongoDB. Перший запуск може бути довгим через ML-залежності; API використовує образ `linux/amd64`, тому на Apple Silicon працює через емуляцію. Фронтенд запускається сервером розробки Create React App; після змін коду для цього сценарію повторно виконайте `docker compose up --build`.

Для локального PoC Compose задає `SECRET_KEY` за замовчуванням. Власне значення можна передати так:

```bash
SECRET_KEY=your-local-secret docker compose up --build
```

Зупинити стек: `docker compose down`. Видалити також дані MongoDB: `docker compose down -v`. Не запускайте паралельно Compose з каталогу бекенду: обидва використовують порт `8000`.

## Локальний запуск без Docker

Після запуску API задайте адресу бекенду для Create React App і встановіть залежності:

```bash
npm ci --legacy-peer-deps
REACT_APP_API_BASE_URL=http://localhost:8000 npm start
```

Фронтенд буде доступний на <http://localhost:3000>.

## Дослідницький режим

Після реєстрації та входу виберіть Research mode у меню після Profile або відкрийте `/diagnostics?mode=research`. Це той самий покроковий екран Diagnostics: на кроці завантаження фото ліворуч є панель вибору кількох класифікаторів і перемикач сегментації. Увімкнений перемикач запускає DeepLabV3+, Otsu, Grad-CAM, U-Net і SegNet на одному фото та показує їхні маски й доступні результати класифікації для порівняння. Вимкнений використовує очищене від волосся зображення без сегментації та ваги `*_original.weights.h5`. Basic запускає лише DeepLabV3+. Basic mode зберігає попередній екран; для авторизованого користувача він використовує DeepLab → Swin з реальних ваг, для гостя — попередній ResNet API. Перед сегментацією та класифікацією волосся автоматично видаляється методом Black Hat + inpainting. В оновленому ноутбуці `REMOVE_HAIR=False`, тому наявні checkpoint-и навчалися на оригінальних зображеннях; ця відмінність може впливати на прогнози. Research показує доступні результати класифікації, сім імовірностей для вибраної конфігурації, карусель етапів обробки, порівняння масок та XAI. **XAI-теплокарти обчислюються з ваг моделей**: Integrated Gradients і Occlusion Sensitivity доступні для всіх; Grad-CAM — для EfficientNetB0; Attention Rollout, Transformer Attribution і Transition Attention Maps — для ViT/DeiT; Swin input attribution — для Swin. Нові результати не додаються до історії. Окремий `/developer` тимчасово доступний як референс під час перенесення інтерфейсу.

Контракт Research API реалізовано на `/api/diagnostics/analyze`, `/api/diagnostics/capabilities` та `/api/diagnostics/explain` і описано в README бекенду.
