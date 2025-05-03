# Kahootomatic

Kahootomatic — це додаток, який автоматично зчитує запитання і варіанти відповідей на сторінці Kahoot!, відправляє їх у Google Gemini API, отримує правильні відповіді і самостійно клікає на них!

[https://www.youtube.com/watch?v=THajbRgu-vI](https://www.youtube.com/watch?v=THajbRgu-vI)


<img src="/images/readme.png" alt="Kahootomatic Demo" width="800"/>

## 🚀 Функціонал
Завантаження налаштувань із chrome.storage.

Зчитування запитання і відповідей зі сторінки.

Генерація промта для Google Gemini API.

Отримання правильних відповідей у вигляді JSON (answer-0, answer-1...).

Автоматичне натискання на правильні варіанти відповідей.

Логування результатів у консоль для зручності дебагу.

## ⚙️ Налаштування
Встанови API ключ для Google Gemini у Chrome Storage:

```
apiKey

questionSelector

answerSelectorPrefix
```


Приклад об'єкта в chrome.storage.local:

```json
{
"apiKey": "YOUR_API_KEY",
"questionSelector": "data-functional-selector=\"question\"",
"answerSelectorPrefix": "data-functional-selector=\"answer-{i}\""
}
```

## 📦 Структура відповіді від API
Відповідь має вигляд:

```json
{
"answer-0": false,
"answer-1": true,
"answer-2": true,
"answer-3": false,
"explanation": "Пояснення вибору."
}
```

Після отримання правильних відповідей скрипт автоматично натискає на потрібні елементи.

## 🛠 Технології
```
JavaScript

Google Gemini API

Chrome Extension Storage
```
