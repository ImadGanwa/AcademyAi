"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processNamedItems = void 0;
/**
 * Generate a consistent ID from a string
 * @param text The string to generate an ID from
 * @returns A unique ID based on the input string
 */
function generateConsistentId(text) {
    // Simple implementation - generate a random ID prefixed with text-derived hash
    const hash = Math.abs(text.split('').reduce((hash, char) => {
        return ((hash << 5) - hash) + char.charCodeAt(0);
    }, 0)).toString(16).substring(0, 8);
    return hash + '-' + Math.random().toString(36).substring(2, 10);
}
/**
 * Processes an array of skills or languages, ensuring each item has a consistent ID.
 *
 * If items are provided as simple strings, they will be converted to objects with generated IDs.
 * If items are provided as objects, missing IDs will be generated based on the name.
 *
 * @param items Array of skill/language names (strings) or objects with name and optional id
 * @returns Array of properly formatted items with consistent IDs
 */
const processNamedItems = (items) => {
    console.log('Processing named items - input:', JSON.stringify(items));
    if (!items || !Array.isArray(items)) {
        console.log('Items is not an array, returning empty array');
        return [];
    }
    // Handle the case where a JSON string might be passed
    if (items.length === 1 && typeof items[0] === 'string') {
        try {
            const parsedItem = JSON.parse(items[0]);
            if (Array.isArray(parsedItem)) {
                console.log('Found a JSON string array in items[0], parsing it:', parsedItem);
                items = parsedItem;
            }
        }
        catch (e) {
            // Not a JSON string, continue with original items
            console.log('Item[0] is not a JSON string:', items[0]);
        }
    }
    const result = items.map(item => {
        // If item is a string, convert to object with generated ID
        if (typeof item === 'string') {
            console.log(`Processing string item: "${item}"`);
            const name = item.trim();
            return {
                id: generateConsistentId(name),
                name
            };
        }
        // If item is an object
        if (typeof item === 'object' && item !== null) {
            console.log(`Processing object item:`, JSON.stringify(item));
            // Ensure the name is a string
            let name = '';
            if (item.name && typeof item.name === 'string') {
                name = item.name.trim();
            }
            else {
                console.log('Item has invalid or missing name property:', item);
                return null;
            }
            // If name is empty, skip this item
            if (!name) {
                console.log('Item has empty name after trimming, skipping');
                return null;
            }
            // Use existing ID if valid, otherwise generate one
            const id = item.id || generateConsistentId(name);
            console.log(`Generated/used ID for "${name}": ${id}`);
            return {
                id,
                name
            };
        }
        console.log('Item is neither string nor object, skipping:', item);
        return null;
    }).filter(Boolean); // Filter out null items
    console.log('Final processed items:', JSON.stringify(result));
    return result;
};
exports.processNamedItems = processNamedItems;
