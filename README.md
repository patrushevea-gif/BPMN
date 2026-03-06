# BPMN-lite Constructor

## Локальный запуск

```bash
npm install
npm run dev
```

## Публикация в GitHub Pages

1. Откройте **Settings → Pages**.
2. В **Build and deployment → Source** выберите **GitHub Actions**.
3. Во вкладке **Actions** дождитесь успешного workflow:
   - `Deploy Vite app to GitHub Pages` или
   - `Deploy static content to Pages`.
4. Откройте: `https://<user>.github.io/BPMN/`.

> Если видите белый экран и ошибку MIME `text/jsx`, значит в Pages публикуются исходники, а не собранный `dist`.
