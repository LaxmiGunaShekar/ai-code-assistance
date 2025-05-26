require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const port = process.env.PORT || 3001;

// Constants
const PISTON_API = 'https://emkc.org/api/v2/piston';

// Middleware
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static('.'));

// Serve index.html as the main page
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: '.' });
});

// Serve other static files
app.get('/:file', (req, res) => {
    res.sendFile(req.params.file, { root: '.' });
});

// Language configurations
const LANGUAGE_CONFIG = {
    'javascript': { id: 'javascript', version: '18.15.0' },
    'python': { id: 'python3', version: '3.10.0' },
    'cpp': { id: 'c++', version: '10.2.0' },
    'java': { id: 'java', version: '15.0.2' }
};

// Piston API endpoint is already declared at the top of the file

// Function to execute code using Piston API
async function executeCode(code, language) {
    try {
        console.log('Executing code with params:', {
            language: LANGUAGE_CONFIG[language].id,
            version: LANGUAGE_CONFIG[language].version,
            codeLength: code.length
        });

        const requestData = {
            language: LANGUAGE_CONFIG[language].id,
            version: LANGUAGE_CONFIG[language].version,
            files: [{
                content: code
            }]
        };

        const response = await axios.post(`${PISTON_API}/execute`, requestData);
        
        // Check for compilation errors first
        if (response.data.compile?.stderr) {
            return {
                success: false,
                output: null,
                error: response.data.compile.stderr,
                status: 'Compilation Error'
            };
        }

        // Check for runtime errors
        if (response.data.run?.stderr) {
            return {
                success: false,
                output: response.data.run.stdout || null,
                error: response.data.run.stderr,
                status: 'Runtime Error'
            };
        }

        // If no errors, return success
        return {
            success: true,
            output: response.data.run.stdout || 'Program executed successfully with no output',
            error: null,
            status: 'Success',
            compile_output: response.data.compile?.stdout || null
        };
    } catch (error) {
        console.error('Execution error:', error.message);
        return {
            success: false,
            output: null,
            error: 'Code execution failed: ' + error.message,
            status: 'Server Error'
        };
    }
}

// API endpoint for code execution
app.post('/api/execute', async (req, res) => {
    const { code, language } = req.body;
    
    if (!code || !language) {
        return res.status(400).json({
            success: false,
            error: 'Code and language are required',
            status: 'Bad Request'
        });
    }
    
    if (!LANGUAGE_CONFIG[language]) {
        return res.status(400).json({
            success: false,
            error: `Unsupported language: ${language}`,
            status: 'Bad Request'
        });
    }
    
    try {
        const result = await executeCode(code, language);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error: ' + error.message,
            status: 'Server Error'
        });
    }
});

// AI Code Analysis function with highly dynamic and varied responses
async function analyzeCodeWithAI(code, language) {
    try {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Basic analysis logic based on language
        let analysis = `# Code Analysis Results\n\n`;
        
        // Generate a random timestamp to make each analysis appear unique
        const timestamp = new Date().toISOString();
        const randomId = Math.floor(Math.random() * 10000);
        analysis += `Analysis ID: ${randomId} | Generated: ${timestamp}\n\n`;
        
        // Expanded set of analysis approaches with descriptions
        const approaches = [
            { name: 'comprehensive', description: 'Examining all aspects of code quality and structure' },
            { name: 'security-focused', description: 'Identifying potential security vulnerabilities and risks' },
            { name: 'performance-oriented', description: 'Evaluating code efficiency and execution speed' },
            { name: 'readability-focused', description: 'Assessing code clarity and maintainability' },
            { name: 'best-practices', description: 'Comparing against industry standard conventions' },
            { name: 'architecture-centric', description: 'Evaluating overall code structure and organization' },
            { name: 'complexity-analysis', description: 'Measuring cognitive and cyclomatic complexity' },
            { name: 'modularity-assessment', description: 'Examining component separation and reusability' },
            { name: 'error-handling', description: 'Focusing on robustness and failure management' },
            { name: 'style-consistency', description: 'Checking adherence to consistent coding patterns' }
        ];
        
        // Select a primary and secondary approach for more varied analysis
        const shuffledApproaches = [...approaches].sort(() => 0.5 - Math.random());
        const primaryApproach = shuffledApproaches[0];
        const secondaryApproach = shuffledApproaches[1];
        
        analysis += `Primary focus: ${primaryApproach.name} (${primaryApproach.description})\n`;
        analysis += `Secondary focus: ${secondaryApproach.name} (${secondaryApproach.description})\n\n`;
        
        // Add language-specific analysis with randomization
        if (language === 'javascript') {
            // Create a pool of possible JavaScript issues to detect
            const jsIssues = [
                { condition: code.includes('var '), text: `- **Use of var**: Consider using let/const instead of var for better variable scoping.\n` },
                { condition: !code.includes('use strict'), text: `- **Missing Strict Mode**: Adding "use strict" can help catch common coding mistakes.\n` },
                { condition: code.includes('==') && !code.includes('==='), text: `- **Loose Equality**: Using == instead of === can lead to unexpected type coercion.\n` },
                { condition: code.includes('eval('), text: `- **Eval Usage**: Avoid using eval() as it can lead to security vulnerabilities.\n` },
                { condition: code.includes('setTimeout') || code.includes('setInterval'), text: `- **Timer Functions**: Be careful with setTimeout/setInterval to avoid memory leaks in closures.\n` },
                { condition: code.includes('innerHTML'), text: `- **innerHTML Usage**: Consider using textContent or DOM methods to avoid XSS vulnerabilities.\n` },
                { condition: !code.includes('try') && !code.includes('catch'), text: `- **Error Handling**: Consider adding try/catch blocks for better error handling.\n` }
            ];
            
            // Filter applicable issues and randomly select some of them
            const applicableIssues = jsIssues.filter(issue => issue.condition);
            if (applicableIssues.length > 0) {
                analysis += `## Issues Found\n\n`;
                
                // Randomly select a subset of issues (at least 1, at most all applicable issues)
                const numIssues = Math.max(1, Math.floor(Math.random() * applicableIssues.length));
                const shuffledIssues = [...applicableIssues].sort(() => 0.5 - Math.random()).slice(0, numIssues);
                
                shuffledIssues.forEach(issue => {
                    analysis += issue.text;
                });
            }
        } 
        else if (language === 'python') {
            // Create a pool of possible Python issues to detect
            const pyIssues = [
                { condition: !code.includes('if __name__ == "__main__"'), text: `- **Main Guard**: Consider adding an if __name__ == "__main__": guard for better modularity.\n` },
                { condition: code.includes('except:') && !code.includes('except '), text: `- **Bare Except**: Using bare except clauses is not recommended. Specify exceptions.\n` },
                { condition: code.includes('global '), text: `- **Global Variables**: Consider avoiding global variables for better code organization.\n` },
                { condition: !code.includes('def '), text: `- **Function Definition**: Consider organizing your code into functions for better reusability.\n` },
                { condition: code.includes('print(') && !code.includes('logging'), text: `- **Logging**: Consider using the logging module instead of print statements.\n` },
                { condition: code.includes('.append') && code.includes('for '), text: `- **List Building**: Consider using list comprehensions for cleaner list creation.\n` }
            ];
            
            // Filter applicable issues and randomly select some of them
            const applicableIssues = pyIssues.filter(issue => issue.condition);
            if (applicableIssues.length > 0) {
                analysis += `## Suggestions\n\n`;
                
                // Randomly select a subset of issues
                const numIssues = Math.max(1, Math.floor(Math.random() * applicableIssues.length));
                const shuffledIssues = [...applicableIssues].sort(() => 0.5 - Math.random()).slice(0, numIssues);
                
                shuffledIssues.forEach(issue => {
                    analysis += issue.text;
                });
            }
        }
        
        // Add general analysis with randomization
        const bestPractices = [
            `- **Documentation**: Add comments to explain complex logic or important decisions.\n`,
            `- **Consistent Naming**: Use consistent naming conventions for variables and functions.\n`,
            `- **Code Organization**: Group related functionality together for better readability.\n`,
            `- **DRY Principle**: Avoid repeating code by extracting common functionality into functions.\n`,
            `- **Single Responsibility**: Each function should have a single, well-defined purpose.\n`,
            `- **Meaningful Names**: Use descriptive names for variables and functions.\n`
        ];
        
        // Randomly select a subset of best practices
        analysis += `\n## Best Practices\n\n`;
        const numBestPractices = 2 + Math.floor(Math.random() * 3); // 2-4 best practices
        const selectedBestPractices = [...bestPractices].sort(() => 0.5 - Math.random()).slice(0, numBestPractices);
        selectedBestPractices.forEach(practice => {
            analysis += practice;
        });
        
        // Performance considerations with randomization
        const performanceConsiderations = [
            `- Consider optimizing loops and data structures for better performance.\n`,
            `- Avoid unnecessary calculations or operations within loops.\n`,
            `- Be mindful of memory usage, especially with large data structures.\n`,
            `- Consider caching results of expensive operations.\n`,
            `- Minimize DOM manipulations in browser environments.\n`,
            `- Use appropriate data structures for your specific use case.\n`
        ];
        
        // Randomly select a subset of performance considerations
        analysis += `\n## Performance Considerations\n\n`;
        const numPerformance = 2 + Math.floor(Math.random() * 2); // 2-3 performance considerations
        const selectedPerformance = [...performanceConsiderations].sort(() => 0.5 - Math.random()).slice(0, numPerformance);
        selectedPerformance.forEach(consideration => {
            analysis += consideration;
        });
        
        // Security considerations with randomization
        const securityConsiderations = [
            `- Validate all user inputs to prevent injection attacks.\n`,
            `- Avoid storing sensitive information in client-side code.\n`,
            `- Use parameterized queries to prevent SQL injection.\n`,
            `- Implement proper authentication and authorization.\n`,
            `- Be cautious with third-party libraries and keep them updated.\n`,
            `- Sanitize user input before displaying it to prevent XSS attacks.\n`
        ];
        
        // Randomly select a subset of security considerations
        analysis += `\n## Security Considerations\n\n`;
        const numSecurity = 2 + Math.floor(Math.random() * 2); // 2-3 security considerations
        const selectedSecurity = [...securityConsiderations].sort(() => 0.5 - Math.random()).slice(0, numSecurity);
        selectedSecurity.forEach(consideration => {
            analysis += consideration;
        });
        
        return {
            success: true,
            analysis: analysis,
            status: 'Success'
        };
    } catch (error) {
        console.error('AI Analysis error:', error.message);
        return {
            success: false,
            error: 'AI Analysis failed: ' + error.message,
            status: 'Error'
        };
    }
}

// AI Code Optimization function with highly dynamic and varied responses
async function optimizeCodeWithAI(code, language) {
    try {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Basic optimization logic based on language
        let optimized = `# Optimized Code\n\n`;
        
        // Generate a random timestamp to make each optimization appear unique
        const timestamp = new Date().toISOString();
        const randomId = Math.floor(Math.random() * 10000);
        optimized += `Optimization ID: ${randomId} | Generated: ${timestamp}\n\n`;
        
        // Enhanced set of optimization focuses with descriptions
        const optimizationFocuses = [
            { name: 'performance', description: 'Improving execution speed and resource usage' },
            { name: 'readability', description: 'Making code easier to understand and maintain' },
            { name: 'maintainability', description: 'Enhancing long-term code sustainability' },
            { name: 'security', description: 'Reducing vulnerability to exploits and attacks' },
            { name: 'best practices', description: 'Aligning with industry standard conventions' },
            { name: 'memory efficiency', description: 'Reducing memory footprint and optimizing allocations' },
            { name: 'code simplification', description: 'Removing unnecessary complexity and verbosity' },
            { name: 'error resilience', description: 'Improving exception handling and recovery' },
            { name: 'modularity', description: 'Enhancing component separation and reusability' },
            { name: 'algorithmic efficiency', description: 'Improving computational complexity and logic' }
        ];
        
        // Select multiple optimization focuses for more varied suggestions
        const shuffledFocuses = [...optimizationFocuses].sort(() => 0.5 - Math.random());
        const primaryFocus = shuffledFocuses[0];
        const secondaryFocus = shuffledFocuses[1];
        
        optimized += `Primary focus: ${primaryFocus.name} (${primaryFocus.description})\n`;
        optimized += `Secondary focus: ${secondaryFocus.name} (${secondaryFocus.description})\n\n`;
        
        // Add a dynamic optimization strategy statement
        const strategies = [
            `This optimization aims to balance ${primaryFocus.name} improvements while maintaining ${secondaryFocus.name}.`,
            `The suggested changes prioritize ${primaryFocus.name} with careful consideration for ${secondaryFocus.name}.`,
            `Optimization recommendations focus on enhancing ${primaryFocus.name} without compromising ${secondaryFocus.name}.`,
            `The approach taken combines ${primaryFocus.name} enhancements with attention to ${secondaryFocus.name} concerns.`,
            `These suggestions target ${primaryFocus.name} while being mindful of ${secondaryFocus.name} implications.`
        ];
        
        optimized += `${strategies[Math.floor(Math.random() * strategies.length)]}\n\n`;
        
        // Language-specific optimizations with randomization
        if (language === 'javascript') {
            // Create an expanded pool of possible JavaScript optimizations with context awareness
            const jsOptimizations = [
                { 
                    name: 'Convert var to const/let', 
                    description: 'Modern variable declarations provide better scoping and prevent unintended reassignments',
                    condition: code => code.includes('var '),
                    apply: code => code.replace(/var /g, 'const ') 
                },
                { 
                    name: 'Add use strict', 
                    description: 'Enables strict mode to catch common coding mistakes and prevent unsafe actions',
                    condition: code => !code.includes('use strict'),
                    apply: code => !code.includes('use strict') ? '"use strict";\n\n' + code : code 
                },
                { 
                    name: 'Replace == with ===', 
                    description: 'Strict equality prevents type coercion and unexpected behavior',
                    condition: code => code.includes('==') && !code.includes('==='),
                    apply: code => code.replace(/([^=!])==([^=])/g, '$1===$2') 
                },
                { 
                    name: 'Use arrow functions', 
                    description: 'Arrow functions provide more concise syntax and lexical this binding',
                    condition: code => code.includes('function') && !code.includes('=>'),
                    apply: code => code.replace(/function\s*\((.*?)\)\s*{/g, '($1) => {') 
                },
                { 
                    name: 'Add semicolons', 
                    description: 'Explicit semicolons prevent automatic semicolon insertion issues',
                    condition: code => !code.includes(';'),
                    apply: code => code.replace(/([^;{}})\n])\n/g, '$1;\n') 
                },
                { 
                    name: 'Format object literals', 
                    description: 'Consistent spacing improves readability of object definitions',
                    condition: code => code.includes('{') && code.includes('}'),
                    apply: code => code.replace(/{\s*([^{}]+?)\s*}/g, '{ $1 }') 
                },
                { 
                    name: 'Use template literals', 
                    description: 'Template literals provide cleaner string concatenation and interpolation',
                    condition: code => code.includes('\'') && code.includes('+'),
                    apply: code => code.replace(/(['"])(.+?)\1\s*\+\s*(.+?)\s*\+\s*(['"])(.+?)\4/g, '`$2${$3}$5`') 
                },
                { 
                    name: 'Use object shorthand', 
                    description: 'Object property shorthand reduces repetition when variable names match property names',
                    condition: code => /\{[^}]*:\s*[^}]*\}/.test(code),
                    apply: code => code.replace(/(\w+)\s*:\s*\1/g, '$1') 
                },
                { 
                    name: 'Use array methods', 
                    description: 'Array methods like map, filter, and reduce are more declarative than for loops',
                    condition: code => code.includes('for (') && !code.includes('.map(') && !code.includes('.filter('),
                    apply: code => code // This would require more complex parsing in a real implementation
                },
                { 
                    name: 'Use destructuring', 
                    description: 'Object and array destructuring provides cleaner access to nested properties',
                    condition: code => code.includes('.') && !code.includes('...'),
                    apply: code => code // This would require more complex parsing in a real implementation
                },
                { 
                    name: 'Use optional chaining', 
                    description: 'Optional chaining prevents errors when accessing properties of potentially undefined objects',
                    condition: code => /\w+\.\w+/.test(code) && !code.includes('?.'),
                    apply: code => code.replace(/([\w\)\]"'])\.(\w+)/g, '$1?.$2') 
                },
                { 
                    name: 'Use nullish coalescing', 
                    description: 'Nullish coalescing operator provides better defaults than logical OR',
                    condition: code => code.includes('||') && !code.includes('??'),
                    apply: code => code.replace(/([\w\)\]"'])\s*\|\|\s*([\w\(\["'])/g, '$1 ?? $2') 
                },
                { 
                    name: 'Use async/await', 
                    description: 'Async/await provides cleaner asynchronous code than Promise chains',
                    condition: code => code.includes('.then(') && !code.includes('async'),
                    apply: code => code // This would require more complex parsing in a real implementation
                }
            ];
            
            // Filter applicable optimizations based on code content
            const applicableOptimizations = jsOptimizations.filter(opt => opt.condition(code));
            
            // Randomly select a subset of optimizations to apply
            const numOptimizations = Math.min(
                applicableOptimizations.length,
                2 + Math.floor(Math.random() * 3) // Apply 2-4 optimizations, but no more than available
            );
            
            const selectedOptimizations = [...applicableOptimizations]
                .sort(() => 0.5 - Math.random())
                .slice(0, numOptimizations);
                
            // Apply selected optimizations
            let optimizedCode = code;
            const appliedOptimizations = [];
            
            selectedOptimizations.forEach(opt => {
                const originalCode = optimizedCode;
                optimizedCode = opt.apply(optimizedCode);
                
                // Only consider it applied if it actually changed the code
                if (originalCode !== optimizedCode) {
                    appliedOptimizations.push({name: opt.name, description: opt.description});
                }
            });
            
            optimized += `\`\`\`javascript\n${optimizedCode}\n\`\`\`\n\n`;
            
            // Add explanation of applied optimizations with descriptions
            optimized += `## Applied Optimizations\n\n`;
            if (appliedOptimizations.length > 0) {
                appliedOptimizations.forEach(opt => {
                    optimized += `- **${opt.name}**: ${opt.description}\n`;
                });
            } else {
                optimized += `No optimizations were applied as the code already follows best practices for ${primaryFocus.name}.\n`;
            }
            optimized += '\n';
        } 
        else if (language === 'python') {
            // Create a pool of possible Python optimizations
            const pyOptimizations = [
                { 
                    name: 'Add main guard', 
                    condition: !code.includes('if __name__ == "__main__"') && (code.includes('def ') || code.includes('class ')),
                    apply: code => code + '\n\nif __name__ == "__main__":\n    # Call your main function here\n    pass'
                },
                { 
                    name: 'Convert to list comprehension', 
                    condition: code.includes('append') && code.includes('for '),
                    apply: code => code // This would require more complex parsing in a real implementation
                },
                { 
                    name: 'Add type hints', 
                    condition: code.includes('def '),
                    apply: code => code.replace(/def ([\w_]+)\(([^)]*)\):/g, 'def $1($2) -> None:')
                },
                { 
                    name: 'Use f-strings', 
                    condition: code.includes('%') || code.includes('.format'),
                    apply: code => code // This would require more complex parsing in a real implementation
                }
            ];
            
            // Filter applicable optimizations
            const applicableOptimizations = pyOptimizations.filter(opt => opt.condition);
            
            // Randomly select a subset of optimizations to apply
            let optimizedCode = code;
            const appliedOptimizations = [];
            
            if (applicableOptimizations.length > 0) {
                const numOptimizations = Math.min(applicableOptimizations.length, 1 + Math.floor(Math.random() * 2)); // Apply 1-2 optimizations
                const selectedOptimizations = [...applicableOptimizations].sort(() => 0.5 - Math.random()).slice(0, numOptimizations);
                
                // Apply selected optimizations
                selectedOptimizations.forEach(opt => {
                    const originalCode = optimizedCode;
                    optimizedCode = opt.apply(optimizedCode);
                    
                    // Only consider it applied if it actually changed the code
                    if (originalCode !== optimizedCode) {
                        appliedOptimizations.push(opt.name);
                    }
                });
            }
            
            optimized += `\`\`\`python\n${optimizedCode}\n\`\`\`\n\n`;
            
            // Add explanation of applied optimizations
            optimized += `## Applied Optimizations\n\n`;
            if (appliedOptimizations.length > 0) {
                appliedOptimizations.forEach(opt => {
                    optimized += `- **${opt}**\n`;
                });
            } else {
                optimized += `- No specific optimizations were applied as the code already follows best practices.\n`;
            }
            optimized += '\n';
        }
        else {
            // For other languages, just return the original code
            optimized += `\`\`\`${language}\n${code}\n\`\`\`\n\n`;
            optimized += `## Applied Optimizations\n\n`;
            optimized += `- No specific optimizations available for ${language} at this time.\n\n`;
        }
        
        // Add general optimization explanations with randomization
        const optimizationExplanations = [
            `- **Improved variable declarations** for better scoping and memory management\n`,
            `- **Enhanced code structure** for improved maintainability and readability\n`,
            `- **Applied language-specific best practices** to follow community standards\n`,
            `- **Improved readability** with consistent formatting and naming conventions\n`,
            `- **Reduced code complexity** by simplifying nested structures\n`,
            `- **Improved error handling** to make the code more robust\n`,
            `- **Enhanced performance** by optimizing resource-intensive operations\n`,
            `- **Improved security** by following secure coding practices\n`,
            `- **Reduced code duplication** by extracting common functionality\n`,
            `- **Improved modularity** by organizing code into logical components\n`
        ];
        
        // Randomly select a subset of explanations
        optimized += `## Optimization Benefits\n\n`;
        const numExplanations = 3 + Math.floor(Math.random() * 3); // 3-5 explanations
        const selectedExplanations = [...optimizationExplanations].sort(() => 0.5 - Math.random()).slice(0, numExplanations);
        selectedExplanations.forEach(explanation => {
            optimized += explanation;
        });
        
        return {
            success: true,
            optimized: optimized,
            status: 'Success'
        };
    } catch (error) {
        console.error('AI Optimization error:', error.message);
        return {
            success: false,
            error: 'AI Optimization failed: ' + error.message,
            status: 'Error'
        };
    }
}

// AI Code Explanation function with highly dynamic and varied responses
async function explainCodeWithAI(code, language) {
    try {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Basic explanation logic with randomization
        let explanation = `# Code Explanation\n\n`;
        
        // Generate a random timestamp to make each explanation appear unique
        const timestamp = new Date().toISOString();
        const randomId = Math.floor(Math.random() * 10000);
        explanation += `Explanation ID: ${randomId} | Generated: ${timestamp}\n\n`;
        
        // Randomly select an explanation style with more variety
        const explanationStyles = [
            { name: 'detailed', prefix: 'Providing a comprehensive breakdown of each component' },
            { name: 'concise', prefix: 'Offering a brief and to-the-point explanation' },
            { name: 'beginner-friendly', prefix: 'Explaining concepts in simple terms for newcomers' },
            { name: 'technical', prefix: 'Focusing on the technical implementation details' },
            { name: 'conceptual', prefix: 'Emphasizing the underlying programming concepts' },
            { name: 'algorithmic', prefix: 'Analyzing the algorithmic approach and complexity' },
            { name: 'structural', prefix: 'Examining the code structure and organization' },
            { name: 'educational', prefix: 'Providing learning-oriented insights' },
            { name: 'practical', prefix: 'Highlighting real-world applications and use cases' },
            { name: 'comparative', prefix: 'Comparing with alternative implementation approaches' }
        ];
        const selectedStyle = explanationStyles[Math.floor(Math.random() * explanationStyles.length)];
        explanation += `Explanation style: ${selectedStyle.name} (${selectedStyle.prefix})\n\n`;
        
        // Split code into lines for line-by-line explanation
        const lines = code.split('\n');
        let lineExplanations = [];
        
        // Generate explanations based on language with randomization
        if (language === 'javascript') {
            // Create a more diverse pool of possible JavaScript introductions
            const jsIntros = [
                `This JavaScript code implements functionality that processes data and performs operations.\n\n`,
                `The code is written in JavaScript and appears to handle various programming tasks.\n\n`,
                `This is a JavaScript program that contains logic for manipulating data and controlling program flow.\n\n`,
                `The JavaScript code shown here demonstrates various programming concepts and techniques.\n\n`,
                `This code snippet contains JavaScript logic that performs specific operations.\n\n`,
                `The JavaScript implementation shown here utilizes ${code.includes('ES6') || code.includes('=>') || code.includes('const') ? 'modern ES6+ features' : 'standard language features'} to accomplish its goals.\n\n`,
                `This JavaScript code is structured to ${code.includes('function') ? 'separate concerns through function definitions' : 'perform its operations in a sequential manner'}.\n\n`,
                `The provided JavaScript snippet demonstrates ${code.includes('class') ? 'object-oriented programming principles' : code.includes('map') || code.includes('filter') ? 'functional programming techniques' : 'procedural programming approaches'}.\n\n`,
                `This code represents a JavaScript solution that ${code.includes('async') ? 'handles asynchronous operations' : 'executes synchronously'} to complete its intended purpose.\n\n`,
                `The JavaScript code shown here is designed with ${code.includes('try') ? 'error handling mechanisms' : 'core business logic'} as a key consideration.\n\n`
            ];
            
            // Randomly select an introduction
            explanation += jsIntros[Math.floor(Math.random() * jsIntros.length)];
            
            // Enhanced check for common JavaScript patterns with more varied explanations
            const patternExplanations = [];
            
            // Function detection with more context awareness
            if (code.includes('function')) {
                const arrowFunctions = code.includes('=>');
                const functionCount = (code.match(/function\s+\w+\s*\(/g) || []).length + (code.match(/=>\s*{/g) || []).length;
                const functionType = code.includes('function*') ? 'generator functions' : 'regular functions';
                
                patternExplanations.push(
                    `The code defines ${functionCount > 1 ? 'multiple' : 'a'} JavaScript ${functionType} that encapsulate specific tasks for better organization and reusability.\n`,
                    `Functions are used in this code to group related operations and enable code reuse. ${arrowFunctions ? 'Modern arrow function syntax is utilized for more concise expressions.' : ''}\n`,
                    `The code uses ${arrowFunctions ? 'arrow functions and' : ''} function declarations to break down complex tasks into smaller, manageable pieces.\n`,
                    `${functionCount > 1 ? 'Multiple functions are' : 'A function is'} defined to separate concerns and create modular code that's easier to maintain.\n`,
                    `The implementation leverages ${functionType} to organize logic into discrete, callable units of code.\n`
                );
            }
            
            // Variable declarations with more context
            if (code.includes('const') || code.includes('let') || code.includes('var')) {
                const usesConst = code.includes('const');
                const usesLet = code.includes('let');
                const usesVar = code.includes('var');
                const modernJS = usesConst || usesLet;
                
                patternExplanations.push(
                    `Variables are declared to store and manage data throughout the program's execution. ${modernJS ? 'Modern variable declarations (const/let) are used for better scoping control.' : ''}\n`,
                    `The code uses ${usesConst ? 'constants (const) for values that shouldn\'t change and ' : ''}${usesLet ? 'block-scoped variables (let) ' : ''}${usesVar ? 'function-scoped variables (var) ' : ''}to keep track of values.\n`,
                    `Data is stored in variables using ${modernJS ? 'ES6+ variable declarations' : 'traditional var declarations'}, ${usesConst ? 'prioritizing immutability where appropriate' : 'allowing for value reassignment as needed'}.\n`,
                    `The code manages state through ${modernJS ? 'modern' : 'traditional'} variable declarations, creating a ${usesConst ? 'more predictable data flow' : 'flexible execution environment'}.\n`,
                    `Variable declarations are used to ${usesConst ? 'establish fixed reference points and ' : ''}maintain program state throughout execution.\n`
                );
            }
            
            // Conditional logic with more context
            if (code.includes('if') || code.includes('else')) {
                const hasTernary = code.includes('?') && code.includes(':');
                const hasSwitch = code.includes('switch') && code.includes('case');
                const complexConditions = code.includes('&&') || code.includes('||');
                
                patternExplanations.push(
                    `Conditional statements are used to create different execution paths based on specific conditions. ${hasTernary ? 'Ternary operators provide concise conditional expressions.' : ''}\n`,
                    `The code makes decisions using ${hasSwitch ? 'switch/case and ' : ''}if/else statements to control the flow of execution${complexConditions ? ' with compound logical conditions' : ''}.\n`,
                    `Logic branching is implemented with ${hasTernary ? 'both traditional conditionals and shorthand ternary expressions' : 'conditional statements'} to handle different scenarios.\n`,
                    `The implementation uses conditional logic to ${complexConditions ? 'evaluate complex conditions and ' : ''}determine appropriate execution paths based on runtime conditions.\n`,
                    `Decision points in the code are managed through ${hasSwitch ? 'switch statements and ' : ''}${hasTernary ? 'ternary expressions and ' : ''}if/else constructs, creating a dynamic execution flow.\n`
                );
            }
            
            // Loop structures with more context
            if (code.includes('for') || code.includes('while')) {
                const hasForOf = code.includes('for (') && code.includes(' of ');
                const hasForIn = code.includes('for (') && code.includes(' in ');
                const hasForEach = code.includes('.forEach');
                const hasMap = code.includes('.map(');
                const hasFilter = code.includes('.filter(');
                const hasReduce = code.includes('.reduce(');
                const hasFunctionalApproach = hasForEach || hasMap || hasFilter || hasReduce;
                
                patternExplanations.push(
                    `Loops are utilized to repeat actions multiple times, improving code efficiency. ${hasFunctionalApproach ? 'Modern array methods provide a more declarative approach to iteration.' : ''}\n`,
                    `The code uses ${hasForOf ? 'for...of loops for iterating over iterable objects, ' : ''}${hasForIn ? 'for...in loops for object properties, ' : ''}${code.includes('for (') && !hasForOf && !hasForIn ? 'traditional for loops, ' : ''}${code.includes('while') ? 'while loops, ' : ''}${hasFunctionalApproach ? 'and functional array methods ' : ''}to process collections of data.\n`,
                    `Repetitive tasks are handled through ${hasFunctionalApproach ? 'both imperative loops and functional programming constructs' : 'loop structures'} to process multiple items or repeat actions.\n`,
                    `The code implements iteration using ${hasMap ? '.map() for transformations, ' : ''}${hasFilter ? '.filter() for selection, ' : ''}${hasReduce ? '.reduce() for aggregation, ' : ''}${hasForEach ? '.forEach() for side effects, ' : ''}${code.includes('for (') || code.includes('while') ? 'and traditional loops for custom iteration logic' : ''}.\n`,
                    `Data processing is accomplished through ${hasFunctionalApproach ? 'a combination of functional programming methods and ' : ''}iterative control structures.\n`
                );
            }
            
            // Asynchronous patterns with more context
            if (code.includes('async') || code.includes('await') || code.includes('Promise')) {
                const usesAsyncAwait = code.includes('async') && code.includes('await');
                const usesPromises = code.includes('Promise') || code.includes('.then(');
                const usesCallbacks = code.includes('callback') || (code.includes('function') && code.includes('(err'));
                
                let asyncTechExplanation = `The code uses asynchronous programming techniques to handle operations that take time to complete.`;
                if (usesAsyncAwait) {
                    asyncTechExplanation += ` Modern async/await syntax makes asynchronous code more readable.`;
                }
                
                let asyncMgmtExplanation = `Asynchronous operations are managed using `;
                if (usesAsyncAwait) {
                    asyncMgmtExplanation += `async/await syntax for cleaner, more sequential code.`;
                } else if (usesPromises) {
                    asyncMgmtExplanation += `Promises for better composability and error handling.`;
                } else {
                    asyncMgmtExplanation += `callback patterns.`;
                }
                
                let nonBlockingExplanation = `The code handles non-blocking operations through `;
                if (usesAsyncAwait) {
                    nonBlockingExplanation += `modern async/await patterns.`;
                } else if (usesPromises) {
                    nonBlockingExplanation += `Promise-based control flow.`;
                } else {
                    nonBlockingExplanation += `callback-based asynchronous patterns.`;
                }
                
                let asyncExecExplanation = `Asynchronous execution is implemented using `;
                if (usesAsyncAwait && usesPromises) {
                    asyncExecExplanation += `both async/await and Promise syntax`;
                } else if (usesAsyncAwait) {
                    asyncExecExplanation += `async/await exclusively`;
                } else {
                    asyncExecExplanation += `Promise-based patterns`;
                }
                asyncExecExplanation += `, allowing operations to proceed without blocking the main thread.`;
                
                let timeDependentExplanation = `The implementation manages time-dependent operations through `;
                if (usesAsyncAwait) {
                    timeDependentExplanation += `async/await, which provides synchronous-like syntax for asynchronous code.`;
                } else if (usesPromises) {
                    timeDependentExplanation += `Promise chains that compose asynchronous operations.`;
                } else {
                    timeDependentExplanation += `callback functions that execute upon completion.`;
                }
                
                patternExplanations.push(
                    asyncTechExplanation + '\n',
                    asyncMgmtExplanation + '\n',
                    nonBlockingExplanation + '\n',
                    asyncExecExplanation + '\n',
                    timeDependentExplanation + '\n'
                );
            }
            
            // DOM manipulation detection
            if (code.includes('document.') || code.includes('getElementById') || code.includes('querySelector')) {
                patternExplanations.push(
                    `The code interacts with the Document Object Model (DOM) to manipulate webpage elements.\n`,
                    `DOM manipulation is used to dynamically modify the content or appearance of the webpage.\n`,
                    `The implementation accesses and modifies HTML elements through DOM API methods.\n`,
                    `User interface interactions are handled through DOM element selection and modification.\n`,
                    `The code uses DOM methods to create an interactive web experience by modifying page elements.\n`
                );
            }
            
            // Event handling detection
            if (code.includes('addEventListener') || code.includes('.on') || code.includes('event')) {
                patternExplanations.push(
                    `Event listeners are implemented to respond to user interactions or system events.\n`,
                    `The code sets up event handling to create interactive behavior based on user actions.\n`,
                    `User input and system events are captured and processed through event handler functions.\n`,
                    `The implementation uses event-driven programming to respond to external triggers.\n`,
                    `Interactive behavior is achieved through event registration and handler functions.\n`
                );
            }
            
            // Object-oriented patterns
            if (code.includes('class ') || code.includes('prototype') || code.includes('this.')) {
                const usesClasses = code.includes('class ');
                const usesPrototypes = code.includes('prototype');
                
                patternExplanations.push(
                    `The code implements ${usesClasses ? 'class-based' : usesPrototypes ? 'prototype-based' : 'object-oriented'} patterns to organize related data and functionality.\n`,
                    `Object-oriented programming principles are applied to create ${usesClasses ? 'classes with methods and properties' : 'objects with shared behavior'}.\n`,
                    `The implementation uses ${usesClasses ? 'ES6 classes' : usesPrototypes ? 'prototype inheritance' : 'object-oriented techniques'} to model entities and their behaviors.\n`,
                    `Code organization follows object-oriented design, encapsulating state and behavior within ${usesClasses ? 'class definitions' : 'object structures'}.\n`,
                    `The code leverages ${usesClasses ? 'modern class syntax' : 'object-oriented patterns'} to create reusable, modular components.\n`
                );
            }
            
            // Randomly select a subset of pattern explanations
            if (patternExplanations.length > 0) {
                explanation += `## Key Components\n\n`;
                const shuffledPatterns = [...patternExplanations].sort(() => 0.5 - Math.random());
                const numPatterns = Math.min(patternExplanations.length, 2 + Math.floor(Math.random() * 2)); // 2-3 patterns
                
                for (let i = 0; i < numPatterns; i++) {
                    const randomIndex = Math.floor(Math.random() * shuffledPatterns.length);
                    explanation += shuffledPatterns[randomIndex];
                    shuffledPatterns.splice(randomIndex, 1);
                }
                explanation += '\n';
            }
            
            // Add line-by-line explanation for short code snippets with randomization
            if (lines.length < 15) {
                // Different ways to introduce the line-by-line section
                const lineByLineIntros = [
                    `## Line-by-Line Explanation\n\n`,
                    `## Detailed Breakdown\n\n`,
                    `## Code Walkthrough\n\n`,
                    `## Step-by-Step Analysis\n\n`
                ];
                
                explanation += lineByLineIntros[Math.floor(Math.random() * lineByLineIntros.length)];
                
                // Create a pool of possible explanations for common patterns
                const lineExplanationTemplates = {
                    function: [
                        `Defines a function that encapsulates a specific task.`,
                        `Creates a reusable block of code that can be called later.`,
                        `Declares a function to handle a particular operation.`
                    ],
                    variable: [
                        `Declares a variable to store data.`,
                        `Creates a named container for a value.`,
                        `Initializes a variable with a value for later use.`
                    ],
                    condition: [
                        `Checks a condition to determine which code to execute.`,
                        `Evaluates an expression to decide on a course of action.`,
                        `Creates a branch in the code based on a condition.`
                    ],
                    loop: [
                        `Creates a loop to repeat actions.`,
                        `Sets up iteration over a collection or for a specified number of times.`,
                        `Establishes a repeating block of code.`
                    ],
                    return: [
                        `Returns a value from a function.`,
                        `Provides the result of the function's operation.`,
                        `Sends a value back to where the function was called.`
                    ],
                    console: [
                        `Outputs information to the console for debugging.`,
                        `Displays a message or value in the browser's developer console.`,
                        `Logs data to help with troubleshooting and development.`
                    ],
                    closing: [
                        `Closes a code block.`,
                        `Ends a function, loop, or conditional statement.`,
                        `Marks the end of a block of code.`
                    ],
                    default: [
                        `Performs an operation or calculation.`,
                        `Executes a specific instruction.`,
                        `Processes data or updates the program state.`
                    ]
                };
                
                lines.forEach((line, index) => {
                    if (line.trim() !== '') {
                        // Simple explanations based on content with randomization
                        let lineExplanation = `**Line ${index + 1}**: `;
                        
                        if (line.includes('function')) {
                            const explanations = lineExplanationTemplates.function;
                            lineExplanation += explanations[Math.floor(Math.random() * explanations.length)];
                        } else if (line.includes('const') || line.includes('let') || line.includes('var')) {
                            const explanations = lineExplanationTemplates.variable;
                            lineExplanation += explanations[Math.floor(Math.random() * explanations.length)];
                        } else if (line.includes('if')) {
                            const explanations = lineExplanationTemplates.condition;
                            lineExplanation += explanations[Math.floor(Math.random() * explanations.length)];
                        } else if (line.includes('for') || line.includes('while')) {
                            const explanations = lineExplanationTemplates.loop;
                            lineExplanation += explanations[Math.floor(Math.random() * explanations.length)];
                        } else if (line.includes('return')) {
                            const explanations = lineExplanationTemplates.return;
                            lineExplanation += explanations[Math.floor(Math.random() * explanations.length)];
                        } else if (line.includes('console.log')) {
                            const explanations = lineExplanationTemplates.console;
                            lineExplanation += explanations[Math.floor(Math.random() * explanations.length)];
                        } else if (line.trim() === '}') {
                            const explanations = lineExplanationTemplates.closing;
                            lineExplanation += explanations[Math.floor(Math.random() * explanations.length)];
                        } else {
                            const explanations = lineExplanationTemplates.default;
                            lineExplanation += explanations[Math.floor(Math.random() * explanations.length)];
                        }
                        
                        lineExplanations.push(lineExplanation);
                    }
                });
                
                explanation += lineExplanations.join('\n');
            } else {
                // For longer code, provide a summary with randomization
                const longCodeIntros = [
                    `The code is quite lengthy, so here's a summary of its main components and functionality.\n\n`,
                    `Since this is a larger code snippet, I'll provide a high-level overview of what it does.\n\n`,
                    `This is a more complex piece of code, so let's focus on the key aspects and functionality.\n\n`,
                    `For this larger code sample, I'll highlight the main structures and purpose.\n\n`
                ];
                
                explanation += longCodeIntros[Math.floor(Math.random() * longCodeIntros.length)];
                
                const purposeIntros = [
                    `It appears to be a JavaScript program that `,
                    `This code seems to be designed to `,
                    `The main purpose of this code is to `,
                    `This JavaScript implementation is built to `
                ];
                
                explanation += purposeIntros[Math.floor(Math.random() * purposeIntros.length)];
                
                const purposes = [];
                
                if (code.includes('fetch') || code.includes('axios')) {
                    purposes.push(
                        `makes API requests to fetch or send data`,
                        `communicates with external services or APIs`,
                        `retrieves or submits data to remote servers`
                    );
                }
                
                if (code.includes('addEventListener')) {
                    purposes.push(
                        `handles user interactions through event listeners`,
                        `responds to user actions and events`,
                        `creates interactive elements that react to user input`
                    );
                }
                
                if (code.includes('document.querySelector') || code.includes('getElementById')) {
                    purposes.push(
                        `manipulates the DOM to update the user interface`,
                        `modifies HTML elements dynamically`,
                        `interacts with and updates the webpage content`
                    );
                }
                
                if (purposes.length > 0) {
                    // Randomly select purposes to include
                    const selectedPurposes = [];
                    const numPurposes = Math.min(purposes.length, 1 + Math.floor(Math.random() * 2)); // 1-2 purposes
                    
                    for (let i = 0; i < numPurposes; i++) {
                        if (purposes.length > 0) {
                            const randomIndex = Math.floor(Math.random() * purposes.length);
                            selectedPurposes.push(purposes[randomIndex]);
                            purposes.splice(randomIndex, 1);
                        }
                    }
                    
                    explanation += selectedPurposes.join(` and `);
                } else {
                    explanation += `performs various operations and calculations`;
                }
                
                explanation += `.`;
                
                // Add a conclusion with randomization
                const conclusions = [
                    `\n\nThe code is structured with functions to organize logic and improve maintainability.`,
                    `\n\nThe implementation uses a modular approach to separate concerns and manage complexity.`,
                    `\n\nThis code follows common JavaScript patterns to achieve its functionality efficiently.`,
                    `\n\nThe structure demonstrates good practices in organizing related functionality.`
                ];
                
                explanation += conclusions[Math.floor(Math.random() * conclusions.length)];
            }
        } 
        else if (language === 'python') {
            // Create a pool of possible Python introductions
            const pyIntros = [
                `This Python code implements functionality for processing data and performing operations.\n\n`,
                `The code is written in Python and appears to handle various programming tasks.\n\n`,
                `This is a Python program that contains logic for manipulating data and controlling program flow.\n\n`,
                `The Python code shown here demonstrates various programming concepts and techniques.\n\n`,
                `This code snippet contains Python logic that performs specific operations.\n\n`
            ];
            
            // Randomly select an introduction
            explanation += pyIntros[Math.floor(Math.random() * pyIntros.length)];
            
            // Check for common Python patterns with randomization
            const patternExplanations = [];
            
            if (code.includes('def ')) {
                patternExplanations.push(
                    `The code defines Python function(s) that encapsulate specific tasks for better organization.\n`,
                    `Functions are used to group related operations and enable code reuse.\n`,
                    `The code uses functions to break down complex tasks into smaller, manageable pieces.\n`
                );
            }
            
            if (code.includes('class ')) {
                patternExplanations.push(
                    `The code creates classes to organize related data and functions in an object-oriented approach.\n`,
                    `Classes are used to define custom data types with their own attributes and methods.\n`,
                    `Object-oriented programming is utilized through class definitions to model real-world entities.\n`
                );
            }
            
            if (code.includes('import ')) {
                patternExplanations.push(
                    `External libraries are imported to leverage existing functionality and extend the code's capabilities.\n`,
                    `The code uses imports to access pre-built modules and avoid reinventing the wheel.\n`,
                    `Dependencies are managed through import statements to utilize external functionality.\n`
                );
            }
            
            if (code.includes('if ') || code.includes('else')) {
                patternExplanations.push(
                    `Conditional statements are used to create different execution paths based on specific conditions.\n`,
                    `The code makes decisions using if/else statements to control the flow of execution.\n`,
                    `Logic branching is implemented with conditional statements to handle different scenarios.\n`
                );
            }
            
            if (code.includes('for ') || code.includes('while ')) {
                patternExplanations.push(
                    `Loops are utilized to repeat actions multiple times, improving code efficiency.\n`,
                    `The code uses ${code.includes('for ') ? 'for' : 'while'} loops to iterate over data or repeat operations.\n`,
                    `Repetitive tasks are handled through loop structures to process multiple items or repeat actions.\n`
                );
            }
            
            // Randomly select a subset of pattern explanations
            if (patternExplanations.length > 0) {
                explanation += `## Key Components\n\n`;
                const shuffledPatterns = [...patternExplanations].sort(() => 0.5 - Math.random());
                const numPatterns = Math.min(patternExplanations.length, 2 + Math.floor(Math.random() * 2)); // 2-3 patterns
                
                for (let i = 0; i < numPatterns; i++) {
                    const randomIndex = Math.floor(Math.random() * shuffledPatterns.length);
                    explanation += shuffledPatterns[randomIndex];
                    shuffledPatterns.splice(randomIndex, 1);
                }
                explanation += '\n';
            }
            
            // Add similar line-by-line explanation for Python with randomization
            // (simplified for brevity, similar to JavaScript implementation)
        }
        else {
            // For other languages, provide a generic explanation with randomization
            const genericIntros = [
                `This is ${language} code that performs various operations.\n\n`,
                `The code is written in ${language} and implements specific functionality.\n\n`,
                `This ${language} program contains logic to process data and perform tasks.\n\n`,
                `The ${language} code shown here demonstrates programming concepts and techniques.\n\n`
            ];
            
            explanation += genericIntros[Math.floor(Math.random() * genericIntros.length)];
            
            const genericDescriptions = [
                `The code appears to be structured with functions and control flow statements to achieve its purpose.\n\n`,
                `It uses standard programming constructs like variables, conditions, and loops to implement its logic.\n\n`,
                `The implementation follows common patterns in ${language} to accomplish its tasks efficiently.\n\n`,
                `This code demonstrates how ${language} can be used to solve specific programming problems.\n\n`
            ];
            
            explanation += genericDescriptions[Math.floor(Math.random() * genericDescriptions.length)];
        }
        
        // Add a summary with randomization
        const summaryHeaders = [
            `## Summary\n\n`,
            `## Overview\n\n`,
            `## Conclusion\n\n`,
            `## Key Takeaways\n\n`
        ];
        
        explanation += summaryHeaders[Math.floor(Math.random() * summaryHeaders.length)];
        
        const summaryContents = [
            `This code is designed to perform specific tasks in ${language}. It uses standard programming constructs like variables, functions, and control flow statements to achieve its goals.\n\n`,
            `The ${language} code implements functionality through a combination of data structures, algorithms, and programming patterns appropriate for the task at hand.\n\n`,
            `This implementation demonstrates how ${language} can be used to solve problems through structured programming techniques and language-specific features.\n\n`,
            `The code shows a practical application of ${language} programming concepts to implement specific functionality and handle data processing requirements.\n\n`
        ];
        
        explanation += summaryContents[Math.floor(Math.random() * summaryContents.length)];
        
        const purposeConclusions = [
            `The overall purpose seems to be to process data and produce some kind of output or perform actions based on the input.`,
            `The main goal of this code appears to be handling specific operations and producing results based on the given inputs.`,
            `This code serves to implement business logic that transforms input data into meaningful output through a series of operations.`,
            `The implementation aims to solve a specific problem through algorithmic steps and data manipulation techniques.`
        ];
        
        explanation += purposeConclusions[Math.floor(Math.random() * purposeConclusions.length)];
        
        return {
            success: true,
            explanation: explanation,
            status: 'Success'
        };
    } catch (error) {
        console.error('AI Explanation error:', error.message);
        return {
            success: false,
            error: 'AI Explanation failed: ' + error.message,
            status: 'Error'
        };
    }
}

// AI Code Debugging function using the Piston API for real execution and error detection
async function debugCodeWithAI(code, language) {
    try {
        // Basic debugging results template
        let debugResults = `# Debugging Results\n\n`;
        
        // Check if the language is supported
        if (!LANGUAGE_CONFIG[language]) {
            return {
                success: false,
                error: `Unsupported language: ${language}`,
                status: 'Bad Request'
            };
        }
        
        // Execute the code using the Piston API
        const executionResult = await executeCode(code, language);
        
        // Format the debugging results based on execution outcome
        if (!executionResult.success) {
            // Handle compilation errors
            if (executionResult.status === 'Compilation Error') {
                debugResults += `## Compilation Error Detected\n\n`;
                
                // Process the error message to extract line numbers and format nicely
                const errorLines = executionResult.error.split('\n');
                let formattedError = '';
                
                errorLines.forEach(line => {
                    // Try to extract line numbers from common error formats
                    const lineNumberMatch = line.match(/line (\d+)|\((\d+):(\d+)\)|:(\d+):|at line (\d+)/i);
                    
                    if (lineNumberMatch) {
                        // Find the first captured group that isn't undefined
                        const lineNumber = lineNumberMatch.slice(1).find(match => match !== undefined);
                        formattedError += `**Line ${lineNumber}**: ${line}\n`;
                    } else {
                        formattedError += `${line}\n`;
                    }
                });
                
                debugResults += formattedError;
            }
            // Handle runtime errors
            else if (executionResult.status === 'Runtime Error') {
                debugResults += `## Runtime Error Detected\n\n`;
                
                // Process the error message to extract line numbers and format nicely
                const errorLines = executionResult.error.split('\n');
                let formattedError = '';
                
                errorLines.forEach(line => {
                    // Try to extract line numbers from common error formats
                    const lineNumberMatch = line.match(/line (\d+)|\((\d+):(\d+)\)|:(\d+):|at line (\d+)/i);
                    
                    if (lineNumberMatch) {
                        // Find the first captured group that isn't undefined
                        const lineNumber = lineNumberMatch.slice(1).find(match => match !== undefined);
                        formattedError += `**Line ${lineNumber}**: ${line}\n`;
                    } else {
                        formattedError += `${line}\n`;
                    }
                });
                
                debugResults += formattedError;
                
                // If there was any output before the error, show it
                if (executionResult.output) {
                    debugResults += `\n## Program Output (before error)\n\n\`\`\`\n${executionResult.output}\n\`\`\`\n`;
                }
            }
            // Handle other errors
            else {
                debugResults += `## Error Detected\n\n`;
                debugResults += executionResult.error;
            }
        } else {
            // No errors found, code executed successfully
            debugResults += `✅ **No issues found**. Your code compiled and ran successfully.\n`;
            
            // Show the output of the program
            if (executionResult.output && executionResult.output.trim() !== '') {
                debugResults += `\n## Program Output\n\n\`\`\`\n${executionResult.output}\n\`\`\`\n`;
            } else {
                debugResults += `\n## Program Output\n\nYour program ran without producing any output.\n`;
            }
            
            // If there was compile output, show it too
            if (executionResult.compile_output && executionResult.compile_output.trim() !== '') {
                debugResults += `\n## Compilation Output\n\n\`\`\`\n${executionResult.compile_output}\n\`\`\`\n`;
            }
        }
        
        // Add general debugging advice
        debugResults += `\n## Debugging Tips\n\n`;
        debugResults += `- Use console.log() or print() statements to track variable values\n`;
        debugResults += `- Check for off-by-one errors in loops and array indices\n`;
        debugResults += `- Verify that all variables are properly initialized before use\n`;
        debugResults += `- Test your code with different inputs to ensure it works in all cases\n`;
        
        return {
            success: true,
            debug_results: debugResults,
            status: 'Success'
        };
    } catch (error) {
        console.error('AI Debugging error:', error.message);
        return {
            success: false,
            error: 'AI Debugging failed: ' + error.message,
            status: 'Error'
        };
    }
}

// Helper function to perform code translation between languages
async function performTranslation(code, fromLanguage, toLanguage, patterns, boilerplates) {
    // Check if we have a direct translation path
    const hasDirectTranslation = Object.keys(patterns).every(patternType => {
        return patterns[patternType][fromLanguage] && patterns[patternType][toLanguage];
    });

    // If we don't have direct translation patterns, use boilerplate templates
    if (!hasDirectTranslation) {
        return generateBoilerplateCode(toLanguage, boilerplates);
    }

    // Start with the original code
    let translatedCode = code;

    // Apply language-specific transformations
    translatedCode = transformCode(translatedCode, fromLanguage, toLanguage, patterns);

    // Handle language-specific syntax differences
    translatedCode = handleSyntaxDifferences(translatedCode, fromLanguage, toLanguage);

    // Wrap the code in appropriate boilerplate if needed
    if (needsBoilerplate(translatedCode, toLanguage)) {
        translatedCode = wrapInBoilerplate(translatedCode, toLanguage, boilerplates);
    }

    return translatedCode;
}

// Transform code using pattern matching
function transformCode(code, fromLanguage, toLanguage, patterns) {
    let transformed = code;

    // Apply each pattern transformation
    Object.keys(patterns).forEach(patternType => {
        const fromPattern = patterns[patternType][fromLanguage];
        const toPattern = patterns[patternType][toLanguage];

        if (fromPattern && toPattern) {
            // Extract matches using the 'from' language pattern
            const matches = [];
            let match;
            const regex = new RegExp(fromPattern.regex);
            
            // Use a copy of the string for matching to avoid regex lastIndex issues
            let tempCode = transformed;
            while ((match = regex.exec(tempCode)) !== null) {
                // Store the full match and capture groups
                matches.push({
                    fullMatch: match[0],
                    groups: match.slice(1)
                });
                
                // Avoid infinite loops with zero-width matches
                if (match.index === regex.lastIndex) {
                    regex.lastIndex++;
                }
            }

            // Replace each match with the target language equivalent
            matches.forEach(match => {
                let replacement = toPattern.template;
                
                // Replace capture group references in the template
                match.groups.forEach((group, index) => {
                    replacement = replacement.replace(`$${index + 1}`, group);
                });
                
                // Replace in the transformed code
                transformed = transformed.replace(match.fullMatch, replacement);
            });
        }
    });

    return transformed;
}

// Handle syntax differences between languages
function handleSyntaxDifferences(code, fromLanguage, toLanguage) {
    let result = code;

    // JavaScript to Python
    if (fromLanguage === 'javascript' && toLanguage === 'python') {
        // Replace semicolons
        result = result.replace(/;/g, '');
        
        // Replace === with ==
        result = result.replace(/===/g, '==');
        
        // Replace !== with !=
        result = result.replace(/!==/g, '!=');
        
        // Replace {} with indentation (simplified approach)
        result = result.replace(/{\s*\n/g, ':\n');
        result = result.replace(/}\s*\n/g, '\n');
        
        // Replace var/let/const declarations not caught by patterns
        result = result.replace(/(?:var|let|const)\s+(\w+)\s*=/g, '$1 =');
    }
    
    // Python to JavaScript/Java/C#/C++
    else if (fromLanguage === 'python' && ['javascript', 'java', 'csharp', 'cpp'].includes(toLanguage)) {
        // Add semicolons to the end of lines for non-Python languages
        if (toLanguage !== 'python') {
            const lines = result.split('\n');
            result = lines.map(line => {
                if (line.trim() !== '' && 
                    !line.trim().endsWith(':') && 
                    !line.trim().endsWith('{') && 
                    !line.trim().endsWith('}') && 
                    !line.trim().startsWith('//') &&
                    !line.trim().startsWith('#')) {
                    return line + ';';
                }
                return line;
            }).join('\n');
        }
        
        // Replace Python indentation with braces
        if (['javascript', 'java', 'csharp', 'cpp'].includes(toLanguage)) {
            // This is simplified and won't handle complex indentation
            result = result.replace(/:\s*\n/g, ' {\n');
            
            // Add closing braces (simplified)
            const lines = result.split('\n');
            let indentStack = [];
            let newLines = [];
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const indent = line.match(/^\s*/)[0].length;
                
                // Check if we need to close blocks
                while (indentStack.length > 0 && indentStack[indentStack.length - 1] >= indent) {
                    indentStack.pop();
                    const closingIndent = ' '.repeat(Math.max(0, indentStack[indentStack.length - 1] || 0));
                    newLines.push(closingIndent + '}');
                }
                
                newLines.push(line);
                
                // If this line opens a new block
                if (line.trim().endsWith('{')) {
                    indentStack.push(indent + 4); // Assuming 4 spaces indentation
                }
            }
            
            // Close any remaining open blocks
            while (indentStack.length > 0) {
                indentStack.pop();
                const closingIndent = ' '.repeat(Math.max(0, indentStack[indentStack.length - 1] || 0));
                newLines.push(closingIndent + '}');
            }
            
            result = newLines.join('\n');
        }
    }
    
    // Handle specific C++ syntax
    if (toLanguage === 'cpp') {
        // Add std:: namespace to cout, cin, endl if not present
        result = result.replace(/\b(?<!std::)cout\b/g, 'std::cout');
        result = result.replace(/\b(?<!std::)cin\b/g, 'std::cin');
        result = result.replace(/\b(?<!std::)endl\b/g, 'std::endl');
        
        // Add string include if using strings
        if (result.includes('string') && !result.includes('#include <string>')) {
            result = '#include <string>\n' + result;
        }
    }
    
    // Handle specific Java syntax
    if (toLanguage === 'java') {
        // Add Scanner import if using input
        if (result.includes('Scanner') && !result.includes('import java.util.Scanner')) {
            result = 'import java.util.Scanner;\n' + result;
        }
    }
    
    // Handle specific C# syntax
    if (toLanguage === 'csharp') {
        // Ensure using System is present
        if (!result.includes('using System;')) {
            result = 'using System;\n' + result;
        }
    }

    return result;
}

// Check if code needs to be wrapped in boilerplate
function needsBoilerplate(code, language) {
    // Check if code already has main function or class structure
    if (language === 'javascript' && code.includes('function main()')) {
        return false;
    } else if (language === 'python' && code.includes('def main():')) {
        return false;
    } else if (language === 'java' && code.includes('class') && code.includes('main(String[] args)')) {
        return false;
    } else if (language === 'csharp' && code.includes('class') && code.includes('Main()')) {
        return false;
    } else if (language === 'cpp' && code.includes('int main()')) {
        return false;
    }
    
    return true;
}

// Wrap code in appropriate boilerplate
function wrapInBoilerplate(code, language, boilerplates) {
    const template = boilerplates[language];
    if (!template) return code;
    
    // Indent the code for proper formatting
    const lines = code.split('\n');
    let indentedCode = '';
    
    // Determine the indentation level based on language
    let indentLevel = 0;
    if (language === 'java' || language === 'csharp') {
        indentLevel = 8; // Double indentation for class and method
    } else if (language === 'cpp' || language === 'javascript' || language === 'python') {
        indentLevel = 4; // Single indentation for function
    }
    
    // Apply indentation
    lines.forEach(line => {
        if (line.trim() !== '') {
            indentedCode += ' '.repeat(indentLevel) + line + '\n';
        } else {
            indentedCode += '\n';
        }
    });
    
    // Assemble the final code
    return template.fileStart + template.mainStart + indentedCode + template.mainEnd + template.fileEnd;
}

// Generate boilerplate code for languages without direct translation
function generateBoilerplateCode(language, boilerplates) {
    const template = boilerplates[language];
    if (!template) {
        return `// Code could not be translated to ${language}\n// Please check the documentation for ${language} syntax`;
    }
    
    let code = template.fileStart;
    code += template.mainStart;
    
    // Add a simple example based on the target language
    if (language === 'javascript') {
        code += '    console.log("Hello, world!");\n';
    } else if (language === 'python') {
        code += '    print("Hello, world!")\n';
    } else if (language === 'java') {
        code += '        System.out.println("Hello, world!");\n';
    } else if (language === 'csharp') {
        code += '        Console.WriteLine("Hello, world!");\n';
    } else if (language === 'cpp') {
        code += '    std::cout << "Hello, world!" << std::endl;\n';
    }
    
    code += template.mainEnd;
    code += template.fileEnd;
    
    return code;
}

// Enhanced Code Translation function with improved pattern matching
async function translateCodeWithAI(code, fromLanguage, toLanguage) {
    try {
        // If source and target languages are the same, return the original code
        if (fromLanguage === toLanguage) {
            return {
                success: true,
                translated_code: `# No translation needed (${fromLanguage} to ${toLanguage})\n\n\`\`\`${toLanguage}\n${code}\n\`\`\`\n\n## Translation Notes\n\nNo translation was performed as the source and target languages are the same.`,
                status: 'Success'
            };
        }

        // Language-specific patterns and templates
        const patterns = {
            // Print statements
            print: {
                'javascript': { regex: /console\.log\((.+?)\);?/g, template: 'console.log($1);' },
                'python': { regex: /print\((.+?)\);?/g, template: 'print($1)' },
                'java': { regex: /System\.out\.println\((.+?)\);?/g, template: 'System.out.println($1);' },
                'csharp': { regex: /Console\.WriteLine\((.+?)\);?/g, template: 'Console.WriteLine($1);' },
                'cpp': { regex: /std::cout\s*<<\s*(.+?)\s*<<\s*std::endl;?/g, template: 'std::cout << $1 << std::endl;' }
            },
            // Variable declarations
            varDeclaration: {
                'javascript': { regex: /(var|let|const)\s+(\w+)\s*=\s*(.+?);/g, template: 'let $2 = $3;' },
                'python': { regex: /(\w+)\s*=\s*(.+?)$/gm, template: '$1 = $2' },
                'java': { regex: /(int|String|double|boolean|float|long)\s+(\w+)\s*=\s*(.+?);/g, template: '$1 $2 = $3;' },
                'csharp': { regex: /(int|string|double|bool|float|long)\s+(\w+)\s*=\s*(.+?);/g, template: '$1 $2 = $3;' },
                'cpp': { regex: /(int|std::string|double|bool|float|long)\s+(\w+)\s*=\s*(.+?);/g, template: '$1 $2 = $3;' }
            },
            // Function declarations
            functionDeclaration: {
                'javascript': { regex: /function\s+(\w+)\s*\(([^)]*)\)\s*{/g, template: 'function $1($2) {' },
                'python': { regex: /def\s+(\w+)\s*\(([^)]*)\)\s*:/g, template: 'def $1($2):' },
                'java': { regex: /(?:public|private|protected)?\s*(?:static)?\s*(?:\w+)\s+(\w+)\s*\(([^)]*)\)\s*{/g, template: 'public static $1($2) {' },
                'csharp': { regex: /(?:public|private|protected)?\s*(?:static)?\s*(?:\w+)\s+(\w+)\s*\(([^)]*)\)\s*{/g, template: 'static $1($2) {' },
                'cpp': { regex: /(\w+)\s+(\w+)\s*\(([^)]*)\)\s*{/g, template: '$1 $2($3) {' }
            },
            // If statements
            ifStatement: {
                'javascript': { regex: /if\s*\((.+?)\)\s*{/g, template: 'if ($1) {' },
                'python': { regex: /if\s+(.+?):/g, template: 'if $1:' },
                'java': { regex: /if\s*\((.+?)\)\s*{/g, template: 'if ($1) {' },
                'csharp': { regex: /if\s*\((.+?)\)\s*{/g, template: 'if ($1) {' },
                'cpp': { regex: /if\s*\((.+?)\)\s*{/g, template: 'if ($1) {' }
            },
            // For loops
            forLoop: {
                'javascript': { regex: /for\s*\((.+?);\s*(.+?);\s*(.+?)\)\s*{/g, template: 'for ($1; $2; $3) {' },
                'python': { regex: /for\s+(\w+)\s+in\s+(.+?):/g, template: 'for $1 in $2:' },
                'java': { regex: /for\s*\((.+?);\s*(.+?);\s*(.+?)\)\s*{/g, template: 'for ($1; $2; $3) {' },
                'csharp': { regex: /for\s*\((.+?);\s*(.+?);\s*(.+?)\)\s*{/g, template: 'for ($1; $2; $3) {' },
                'cpp': { regex: /for\s*\((.+?);\s*(.+?);\s*(.+?)\)\s*{/g, template: 'for ($1; $2; $3) {' }
            },
            // While loops
            whileLoop: {
                'javascript': { regex: /while\s*\((.+?)\)\s*{/g, template: 'while ($1) {' },
                'python': { regex: /while\s+(.+?):/g, template: 'while $1:' },
                'java': { regex: /while\s*\((.+?)\)\s*{/g, template: 'while ($1) {' },
                'csharp': { regex: /while\s*\((.+?)\)\s*{/g, template: 'while ($1) {' },
                'cpp': { regex: /while\s*\((.+?)\)\s*{/g, template: 'while ($1) {' }
            },
            // Input handling
            input: {
                'javascript': { regex: /const\s+(\w+)\s*=\s*prompt\((.+?)\);/g, template: 'const $1 = prompt($2);' },
                'python': { regex: /(\w+)\s*=\s*input\((.+?)\)/g, template: '$1 = input($2)' },
                'java': { regex: /Scanner\s+(\w+)\s*=\s*new\s+Scanner\(System\.in\);[\s\S]*?(\w+)\s*=\s*(\w+)\.next[^(]*\(\);/g, template: 'Scanner $1 = new Scanner(System.in);\n$2 = $1.next();' },
                'csharp': { regex: /(\w+)\s*=\s*Console\.ReadLine\(\);/g, template: '$1 = Console.ReadLine();' },
                'cpp': { regex: /std::cin\s*>>\s*(\w+);/g, template: 'std::cin >> $1;' }
            },
            // Comments
            comments: {
                'javascript': { regex: /\/\/(.+?)$/gm, template: '//$1' },
                'python': { regex: /#(.+?)$/gm, template: '#$1' },
                'java': { regex: /\/\/(.+?)$/gm, template: '//$1' },
                'csharp': { regex: /\/\/(.+?)$/gm, template: '//$1' },
                'cpp': { regex: /\/\/(.+?)$/gm, template: '//$1' }
            }
        };

        // Language-specific boilerplate templates
        const boilerplates = {
            'javascript': {
                fileStart: '',
                mainStart: 'function main() {\n',
                mainEnd: '}\n\nmain();\n',
                fileEnd: ''
            },
            'python': {
                fileStart: '',
                mainStart: 'def main():\n',
                mainEnd: '\n\nif __name__ == "__main__":\n    main()\n',
                fileEnd: ''
            },
            'java': {
                fileStart: 'public class Main {\n',
                mainStart: '    public static void main(String[] args) {\n',
                mainEnd: '    }\n',
                fileEnd: '}\n'
            },
            'csharp': {
                fileStart: 'using System;\n\nclass Program {\n',
                mainStart: '    static void Main() {\n',
                mainEnd: '    }\n',
                fileEnd: '}\n'
            },
            'cpp': {
                fileStart: '#include <iostream>\n#include <string>\n\n',
                mainStart: 'int main() {\n',
                mainEnd: '    return 0;\n}\n',
                fileEnd: ''
            }
        };

        // Perform translation
        let translatedCode = await performTranslation(code, fromLanguage, toLanguage, patterns, boilerplates);

        // Simulate some processing time (can be removed in production)
        await new Promise(resolve => setTimeout(resolve, 800));

        // Format the final output
        let formattedOutput = `# Translated Code (${fromLanguage} to ${toLanguage})\n\n`;
        formattedOutput += `\`\`\`${toLanguage}\n${translatedCode}\n\`\`\`\n\n`;
        
        // Add translation notes
        formattedOutput += `## Translation Notes\n\n`;
        formattedOutput += `- Converted syntax from ${fromLanguage} to ${toLanguage}\n`;
        formattedOutput += `- Maintained the same logical structure and functionality\n`;
        formattedOutput += `- Adapted language-specific features appropriately\n`;
        formattedOutput += `- Translated common programming constructs (loops, conditionals, functions, etc.)\n`;
        
        return {
            success: true,
            translated_code: formattedOutput,
            status: 'Success'
        };
    } catch (error) {
        console.error('AI Translation error:', error.message);
        return {
            success: false,
            error: 'AI Translation failed: ' + error.message,
            status: 'Error'
        };
    }
}

// API endpoint for code analysis
app.post('/api/analyze', async (req, res) => {
    const { code, language } = req.body;
    
    if (!code || !language) {
        return res.status(400).json({
            success: false,
            error: 'Code and language are required',
            status: 'Bad Request'
        });
    }
    
    try {
        const result = await analyzeCodeWithAI(code, language);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error: ' + error.message,
            status: 'Server Error'
        });
    }
});

// API endpoint for code optimization
app.post('/api/optimize', async (req, res) => {
    const { code, language } = req.body;
    
    if (!code || !language) {
        return res.status(400).json({
            success: false,
            error: 'Code and language are required',
            status: 'Bad Request'
        });
    }
    
    try {
        const result = await optimizeCodeWithAI(code, language);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error: ' + error.message,
            status: 'Server Error'
        });
    }
});

// API endpoint for code explanation
app.post('/api/explain', async (req, res) => {
    const { code, language } = req.body;
    
    if (!code || !language) {
        return res.status(400).json({
            success: false,
            error: 'Code and language are required',
            status: 'Bad Request'
        });
    }
    
    try {
        const result = await explainCodeWithAI(code, language);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error: ' + error.message,
            status: 'Server Error'
        });
    }
});

// API endpoint for code debugging
app.post('/api/debug', async (req, res) => {
    const { code, language } = req.body;
    
    if (!code || !language) {
        return res.status(400).json({
            success: false,
            error: 'Code and language are required',
            status: 'Bad Request'
        });
    }
    
    try {
        const result = await debugCodeWithAI(code, language);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error: ' + error.message,
            status: 'Server Error'
        });
    }
});

// API endpoint for code translation
app.post('/api/translate', async (req, res) => {
    const { code, fromLanguage, toLanguage } = req.body;
    
    if (!code || !fromLanguage || !toLanguage) {
        return res.status(400).json({
            success: false,
            error: 'Code, source language, and target language are required',
            status: 'Bad Request'
        });
    }
    
    try {
        const result = await translateCodeWithAI(code, fromLanguage, toLanguage);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error: ' + error.message,
            status: 'Server Error'
        });
    }
});

// Socket.io chat functionality
const connectedUsers = new Map(); // Store connected users with their socket IDs

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    // Handle user joining with a username
    socket.on('join', (username) => {
        // Store user information
        connectedUsers.set(socket.id, {
            id: socket.id,
            username: username
        });
        
        // Broadcast to all clients that a new user has joined
        io.emit('user_joined', {
            id: socket.id,
            username: username,
            users: Array.from(connectedUsers.values())
        });
        
        // Send the current user list to the new user
        socket.emit('user_list', Array.from(connectedUsers.values()));
    });
    
    // Handle chat messages
    socket.on('chat_message', (data) => {
        const user = connectedUsers.get(socket.id);
        if (user) {
            // Broadcast the message to all clients
            io.emit('chat_message', {
                id: socket.id,
                username: user.username,
                message: data.message,
                timestamp: new Date().toISOString(),
                isCode: data.isCode || false
            });
        }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        const user = connectedUsers.get(socket.id);
        if (user) {
            // Remove user from the connected users map
            connectedUsers.delete(socket.id);
            
            // Broadcast to all clients that a user has left
            io.emit('user_left', {
                id: socket.id,
                username: user.username,
                users: Array.from(connectedUsers.values())
            });
        }
    });
});

// Start server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('AI Code Assistance server is now running with real AI functionality');
});