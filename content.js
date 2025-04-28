let settings = {
    apiKey: '',
    questionSelector: '',
    answerSelectorPrefix: ''
};

let previousQuestion = '';

function loadSettings() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['apiKey', 'questionSelector', 'answerSelectorPrefix'], (result) => {
            settings.apiKey = result.apiKey || '';
            settings.questionSelector = result.questionSelector || '';
            settings.answerSelectorPrefix = result.answerSelectorPrefix || '';
            resolve();
        });
    });
}

function parseQuestion() {
    const questionElement = document.querySelector(`[${settings.questionSelector}]`);
    if (!questionElement) {
        return null;
    }
    const questionText = questionElement.innerText.trim();
    console.group('🔍 Запитання');
    console.log(questionText);
    console.groupEnd();
    return questionText;
}

function parseAnswers() {
    const answers = [];
    for (let i = 0; i < 4; i++) {
        console.group(`📝 Відповідь ${i}`);
        const answerElement = document.querySelector([`[${settings.answerSelectorPrefix.replace("{i}",i)}]`]);
        if (!answerElement) {
            console.log(`Відповідь ${i} не знайдена`);
            console.groupEnd();
            return [];
        }
        answers.push(answerElement.innerText.trim());
        console.log(`[${settings.answerSelectorPrefix.replace("{i}",i)}]:`, answerElement.innerText.trim());
        console.groupEnd();
    }
    console.group('📝 Варіанти відповідей');
    console.log('Варіанти відповідей:', answers);
    console.groupEnd();
    return answers;
}

async function getCorrectAnswer(prompt) {
    try {
        const url =`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${settings.apiKey}`;
        const answerProperties = Array.from({ length: 4 }, (_, i) => `answer-${i}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "object",
                        properties: Object.fromEntries(
                            answerProperties.map(key => [
                                key,
                                {
                                    type: "boolean",
                                    description: "Вертай true, якщо це правильна відповідь враховуючи умову запитання."
                                }
                            ]).concat([
                                ["explanation", { type: "string", description: "Пояснення вибору" }]
                            ])
                        ),
                        required: [...answerProperties]
                    }
                }
            }),
        });

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
            console.error('Текст відповіді порожній');
            return null;
        }

        const parsed = JSON.parse(rawText);
        console.group('🧠 Розпарсений результат');
        console.log('Розпарсений результат:', parsed);
        console.groupEnd();

        return parsed;
    } catch (error) {
        console.error('Помилка запиту до Gemini API:', error);
        return null;
    }
}

function clickAnswer(correctAnswerKeys) {
    correctAnswerKeys.forEach(key => {
        const element = document.querySelector(`[data-functional-selector="${key}"]`);
        if (element) {
            console.group('✅ Правильна відповідь');
            console.log(`Натискаємо на ${key}:`, element.innerText.trim());
            console.groupEnd();
            element.click();
        } else {
            console.warn(`⚠️ Відповідь ${key} не знайдена`);
        }
    });
}

async function updateQuestionAndAnswers() {
    const question = parseQuestion();

    if (!question || question === previousQuestion) {
        return;
    } else {
        previousQuestion = question;
    }

    const answers = parseAnswers();

    if (answers.length === 0) return;

    const prompt = `
        Запитання: ${question}
        Варіанти відповідей: 
        ${JSON.stringify(answers.map((answer, index)=>`answer-${index}: ${answer}`))}
        Яка відповідь є найбільш правильною?`;

    console.group('⚙️ Промт для Google GenAI');
    console.log('Промт для Google GenAI:', prompt);
    console.groupEnd();
    const result = await getCorrectAnswer(prompt);

    if (result) {
        const correctAnswers = Object.entries(result)
            .filter(([key, value]) => key.startsWith('answer-') && value === true)
            .map(([key]) => key);

        console.group('📈 Результат');
        console.log('Правильна відповідь:', correctAnswers);
        console.log('Пояснення:', result.explanation);
        console.groupEnd();

        clickAnswer(correctAnswers);
    }
}

(async function() {
    await loadSettings();
    setInterval(updateQuestionAndAnswers, 100);
})();
