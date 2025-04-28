document.getElementById('saveSettings').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value.trim();
    const questionSelector = document.getElementById('questionSelector').value.trim();
    const answerSelectorPrefix = document.getElementById('answerSelectorPrefix').value.trim();

    if (!apiKey || !questionSelector || !answerSelectorPrefix) {
        alert('Будь ласка, заповніть усі поля!');
        return;
    }

    const settings = {
        apiKey,
        questionSelector,
        answerSelectorPrefix
    };

    chrome.storage.local.set(settings, () => {
        alert('Налаштування збережено!');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['apiKey', 'questionSelector', 'answerSelectorPrefix'], (result) => {
        if (result.apiKey) document.getElementById('apiKey').value = result.apiKey;
        if (result.questionSelector) document.getElementById('questionSelector').value = result.questionSelector;
        if (result.answerSelectorPrefix) document.getElementById('answerSelectorPrefix').value = result.answerSelectorPrefix;
    });
});
