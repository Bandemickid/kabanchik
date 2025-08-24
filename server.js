const path = require('path');
const express = require('express');

const app  = express();
const root = __dirname;

// 1) Віддаємо статичні файли (index.html, style.css, images/, pages/ тощо)
app.use(express.static(root, { extensions: ['html'] }));

// 2) SPA-fallback ТІЛЬКИ для головної та /ru і всього під ним
//    (без зірочок — використовуємо звичайний RegExp)
app.get(/^\/(?:ru(?:\/.*)?)?$/, (req, res) => {
  res.sendFile(path.join(root, 'index.html'));
});

// 3) Запуск
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`▶ http://localhost:${PORT}`));
