# BPMN-lite Constructor

## Запуск локально

```bash
npm install
npm run dev
```

## Деплой на GitHub Pages (обязательно)

> Для Vite/React проектa **нельзя** использовать «Развертывание из ветки», иначе браузер получит `src/main.jsx` с MIME `text/jsx` и будет белый экран.

1. Откройте репозиторий → **Settings** → **Pages**.
2. В **Build and deployment → Source** выберите **GitHub Actions**.
3. Убедитесь, что во вкладке **Actions** workflow `Deploy Vite app to GitHub Pages` завершился зелёным.
4. После успешного деплоя откройте сайт: `https://<user>.github.io/BPMN/`.
