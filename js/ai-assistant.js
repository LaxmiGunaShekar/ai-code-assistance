/**
 * AI Code Assistant
 * This file handles the AI assistant functionality for code analysis, optimization,
 * explanation, and debugging.
 */

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get references to UI elements
    const analyzeBtn = document.getElementById('analyze-btn');
    const optimizeBtn = document.getElementById('optimize-btn');
    const explainBtn = document.getElementById('explain-btn');
    const debugBtn = document.getElementById('debug-btn');
    const outputContent = document.getElementById('output-content');
    
    // Add event listeners to buttons
    analyzeBtn.addEventListener('click', analyzeCode);
    optimizeBtn.addEventListener('click', optimizeCode);
    explainBtn.addEventListener('click', explainCode);
    debugBtn.addEventListener('click', debugCode);
    
    /**
     * Analyze the code for potential issues and best practices
     */
    function analyzeCode() {
        const code = getCodeFromEditor();
        const language = getSelectedLanguage();
        
        if (!code || code.trim() === '') {
            displayOutput('<p class="error">Please enter some code to analyze.</p>');
            return;
        }
        
        showLoading();
        
        // Call the real AI API endpoint
        fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code, language })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const formattedAnalysis = formatAIResponse(data.analysis, 'Analysis Results');
                displayOutput(formattedAnalysis);
            } else {
                displayOutput(`<p class="error">Error: ${data.error}</p>`);
            }
        })
        .catch(error => {
            displayOutput(`<p class="error">Error: ${error.message}</p>`);
        });
    }
    
    /**
     * Optimize the code for better performance or readability
     */
    function optimizeCode() {
        const code = getCodeFromEditor();
        const language = getSelectedLanguage();
        
        if (!code || code.trim() === '') {
            displayOutput('<p class="error">Please enter some code to optimize.</p>');
            return;
        }
        
        showLoading();
        
        // Call the real AI API endpoint
        fetch('/api/optimize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code, language })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const formattedOptimization = formatAIResponse(data.optimized, 'Optimized Code');
                displayOutput(formattedOptimization);
            } else {
                displayOutput(`<p class="error">Error: ${data.error}</p>`);
            }
        })
        .catch(error => {
            displayOutput(`<p class="error">Error: ${error.message}</p>`);
        });
    }
    
    /**
     * Explain the code in plain English
     */
    function explainCode() {
        const code = getCodeFromEditor();
        const language = getSelectedLanguage();
        
        if (!code || code.trim() === '') {
            displayOutput('<p class="error">Please enter some code to explain.</p>');
            return;
        }
        
        showLoading();
        
        // Call the real AI API endpoint
        fetch('/api/explain', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code, language })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const formattedExplanation = formatAIResponse(data.explanation, 'Code Explanation');
                displayOutput(formattedExplanation);
            } else {
                displayOutput(`<p class="error">Error: ${data.error}</p>`);
            }
        })
        .catch(error => {
            displayOutput(`<p class="error">Error: ${error.message}</p>`);
        });
    }
    
    /**
     * Debug the code and find potential errors
     */
    function debugCode() {
        const code = getCodeFromEditor();
        const language = getSelectedLanguage();
        
        if (!code || code.trim() === '') {
            displayOutput('<p class="error">Please enter some code to debug.</p>');
            return;
        }
        
        showLoading();
        
        // Call the real AI API endpoint
        fetch('/api/debug', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code, language })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const formattedDebug = formatAIResponse(data.debug_results, 'Debugging Results');
                displayOutput(formattedDebug);
            } else {
                displayOutput(`<p class="error">Error: ${data.error}</p>`);
            }
        })
        .catch(error => {
            displayOutput(`<p class="error">Error: ${error.message}</p>`);
        });
    }
    
    /**
     * Get the code from the CodeMirror editor
     */
    function getCodeFromEditor() {
        // Access the CodeMirror instance
        const editor = document.querySelector('.CodeMirror').CodeMirror;
        return editor.getValue();
    }
    
    /**
     * Get the currently selected programming language
     */
    function getSelectedLanguage() {
        return document.getElementById('language-select').value;
    }
    
    /**
     * Display loading indicator
     */
    function showLoading() {
        outputContent.innerHTML = '<p class="loading">Processing your code with AI <span class="spinner"></span></p>';
    }
    
    /**
     * Display output in the assistant output area
     */
    function displayOutput(content) {
        outputContent.innerHTML = content;
    }
    
    /**
     * Translate code from one language to another
     */
    function translateCode() {
        const code = getCodeFromEditor();
        const fromLanguage = getSelectedLanguage();
        const toLanguageSelect = document.getElementById('target-language-select');
        
        if (!toLanguageSelect) {
            displayOutput('<p class="error">Target language selection not available.</p>');
            return;
        }
        
        const toLanguage = toLanguageSelect.value;
        
        if (!code || code.trim() === '') {
            displayOutput('<p class="error">Please enter some code to translate.</p>');
            return;
        }
        
        if (fromLanguage === toLanguage) {
            displayOutput('<p class="warning">Source and target languages are the same. Please select different languages.</p>');
            return;
        }
        
        showLoading();
        
        // Call the real AI API endpoint
        fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code, fromLanguage, toLanguage })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const formattedTranslation = formatAIResponse(data.translated_code, `Translated Code (${fromLanguage} → ${toLanguage})`);
                displayOutput(formattedTranslation);
            } else {
                displayOutput(`<p class="error">Error: ${data.error}</p>`);
            }
        })
        .catch(error => {
            displayOutput(`<p class="error">Error: ${error.message}</p>`);
        });
    }
    
    /**
     * Format AI response with proper styling and structure
     */
    function formatAIResponse(text, title) {
        // Escape HTML to prevent XSS
        const escapeHtml = (unsafe) => {
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        };
        
        // Process code blocks
        let formattedText = escapeHtml(text);
        
        // Replace markdown code blocks with HTML
        formattedText = formattedText.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
        
        // Replace single backticks with inline code
        formattedText = formattedText.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Convert line breaks to <br>
        formattedText = formattedText.replace(/\n/g, '<br>');
        
        return `<h4>${title}</h4><div class="ai-response">${formattedText}</div>`;
    }
    
    // Add event listener for translate button and target language selection
    const translateBtn = document.getElementById('translate-btn');
    const translationOptions = document.getElementById('translation-options');
    const targetLanguageSelect = document.getElementById('target-language-select');
    const translateConfirmBtn = document.getElementById('translate-confirm-btn');
    
    if (translateBtn && translationOptions) {
        // Show translation options when translate button is clicked
        translateBtn.addEventListener('click', function() {
            if (translationOptions.style.display === 'none') {
                translationOptions.style.display = 'block';
                // Don't call translate function immediately, wait for confirmation
            } else {
                translationOptions.style.display = 'none';
            }
        });
        
        // Add event listener for the translate confirm button
        if (translateConfirmBtn) {
            translateConfirmBtn.addEventListener('click', translateCode);
        }
    }
    
    // Legacy simulation functions (kept for fallback)
    
    function simulateCodeAnalysis(code, language) {
        let result = '<h4>🔍 Code Analysis Results</h4>';
        
        if (code.length < 10) {
            result += '<p class="warning">⚠️ Your code sample is very short. Please provide a more complete example for better analysis.</p>';
            return result;
        }
        
        result += '<div class="analysis-summary">';
        result += '<p>I\'ve analyzed your ' + language + ' code and found the following:</p>';
        result += '</div>';
        
        result += '<ul>';
        
        // Language-specific analysis
        if (language === 'javascript') {
            if (code.includes('var ')) {
                result += '<li class="issue">⚠️ <strong>Use of var:</strong> Consider using let/const instead of var for better variable scoping and to avoid potential hoisting issues.</li>';
            }
            
            if (!code.includes('use strict')) {
                result += '<li class="suggestion">💡 <strong>Strict Mode:</strong> Adding "use strict" can help catch common coding mistakes and prevent the use of deprecated features.</li>';
            }
            
            if (code.includes('==') && !code.includes('===')) {
                result += '<li class="issue">⚠️ <strong>Loose Equality:</strong> Using == instead of === can lead to unexpected type coercion. Consider using strict equality.</li>';
            }
            
            if (code.includes('console.log')) {
                result += '<li class="suggestion">💡 <strong>Console Statements:</strong> Remember to remove console.log statements before production deployment.</li>';
            }
            
            if (code.includes('function') && !code.includes('=>')) {
                result += '<li class="suggestion">💡 <strong>Modern Syntax:</strong> Consider using arrow functions for cleaner syntax and lexical this binding.</li>';
            }
        } 
        else if (language === 'python') {
            if (code.includes('print ') && !code.includes('print(')) {
                result += '<li class="issue">⚠️ <strong>Print Syntax:</strong> Use print() function syntax for Python 3 compatibility.</li>';
            }
            
            if (!code.includes('if __name__ == "__main__"') && code.includes('def ')) {
                result += '<li class="suggestion">💡 <strong>Main Guard:</strong> Consider adding an if __name__ == "__main__": guard to make your script both importable and executable.</li>';
            }
            
            if (code.includes('except:') && !code.includes('except ')) {
                result += '<li class="issue">⚠️ <strong>Bare Except:</strong> Using bare except clauses is not recommended. Specify the exceptions you want to catch.</li>';
            }
            
            if (code.includes('global ')) {
                result += '<li class="suggestion">💡 <strong>Global Variables:</strong> Using global variables can make code harder to understand and maintain. Consider alternative approaches.</li>';
            }
        }
        else if (language === 'java') {
            if (code.includes('public static void main')) {
                result += '<li class="positive">✅ <strong>Entry Point:</strong> Your code includes a main method, which is required for Java applications.</li>';
            }
            
            if (code.includes('System.out.print')) {
                result += '<li class="suggestion">💡 <strong>Logging:</strong> For production code, consider using a proper logging framework instead of System.out.</li>';
            }
            
            if (code.includes('catch (Exception ')) {
                result += '<li class="issue">⚠️ <strong>Exception Handling:</strong> Catching generic Exception is not recommended. Catch specific exceptions instead.</li>';
            }
        }
        else if (language === 'csharp') {
            if (code.includes('Console.Write')) {
                result += '<li class="suggestion">💡 <strong>Logging:</strong> For production code, consider using a proper logging framework instead of Console methods.</li>';
            }
            
            if (code.includes('var ')) {
                result += '<li class="positive">✅ <strong>Type Inference:</strong> Using var for implicit typing can make your code more readable.</li>';
            }
            
            if (code.includes('catch (Exception ')) {
                result += '<li class="issue">⚠️ <strong>Exception Handling:</strong> Catching generic Exception is not recommended. Catch specific exceptions instead.</li>';
            }
        }
        
        // General code quality checks
        if (code.split('\n').length > 5) {
            const indentationConsistent = !/^\s+\w+.*\n^[^\s]/.test(code);
            if (!indentationConsistent) {
                result += '<li class="issue">⚠️ <strong>Inconsistent Indentation:</strong> Your code appears to have inconsistent indentation which can affect readability.</li>';
            } else {
                result += '<li class="positive">✅ <strong>Indentation:</strong> Your code has consistent indentation, which improves readability.</li>';
            }
            
            // Check for comments
            if (!code.includes('//') && !code.includes('/*') && !code.includes('#')) {
                result += '<li class="suggestion">💡 <strong>Documentation:</strong> Consider adding comments to explain complex logic or important decisions.</li>';
            } else {
                result += '<li class="positive">✅ <strong>Documentation:</strong> Your code includes comments, which helps with maintainability.</li>';
            }
        }
        
        result += '<li class="positive">✅ <strong>Overall Structure:</strong> Your code structure looks generally good.</li>';
        result += '</ul>';
        
        result += '<p class="analysis-conclusion">These suggestions are based on common best practices and common issues in ' + language + ' code. Always consider the specific context of your application when applying these suggestions.</p>';
        
        return result;
    }
});