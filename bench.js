function formatXML(text) {
    try {
        let formatted = text;
        formatted = formatted.replace(/>\s*</g, '><');
        let indent = 0;
        const lines = [];
        const parts = formatted.split(/(<[^>]+>)/g);

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (!part || part.trim() === '') continue;

            if (part.startsWith('<')) {
                if (part.startsWith('</')) {
                    indent = Math.max(0, indent - 1);
                    lines.push('  '.repeat(indent) + part);
                }
                else if (part.endsWith('/>') || part.match(/<\w+[^>]*\/>/)) {
                    lines.push('  '.repeat(indent) + part);
                }
                else if (part.startsWith('<?')) {
                    lines.push(part);
                }
                else if (part.startsWith('<!')) {
                    lines.push('  '.repeat(indent) + part);
                }
                else {
                    lines.push('  '.repeat(indent) + part);
                    indent++;
                }
            }
            else {
                const trimmed = part.trim();
                if (trimmed) {
                    lines.push('  '.repeat(indent) + trimmed);
                }
            }
        }

        return lines.join('\n');
    } catch (error) {
        throw error;
    }
}

// Generate 1MB XML
let xml = '<root>';
for (let i = 0; i < 5000; i++) {
    xml += `<item id="${i}"><name>Item ${i}</name><value>${Math.random()}</value></item>`;
}
xml += '</root>';

console.log('XML Size:', xml.length / 1024, 'KB');

const start = performance.now();
const res = formatXML(xml);
const end = performance.now();

console.log('Format Time:', (end - start).toFixed(2), 'ms');
