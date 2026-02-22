import { Level, ChallengeType } from '../game/store';
import { apiClient, Task } from '../../lib/api';

// Pre-import local level images mapped by API level ID for instant loading
// Map API level IDs (e.g., "image-1-easy") to local assets
const LEVEL_IMAGE_ASSETS = {
  // Beginner levels
  'image-1-easy': require('../../../assets/images/level-1-image.png'),
  'image-2-easy': require('../../../assets/images/level-2-image.png'),
  'image-3-easy': require('../../../assets/images/level-3-image.png'),

  // Intermediate levels
  'image-4-medium': require('../../../assets/images/level-4-image.png'),
  'image-5-medium': require('../../../assets/images/level-5-image.png'),
  'image-6-medium': require('../../../assets/images/level-6-image.png'),
  'image-7-medium': require('../../../assets/images/level-7-image.png'),

  // Advanced levels
  'image-8-hard': require('../../../assets/images/level-8-image.png'),
  'image-9-hard': require('../../../assets/images/level-9-image.png'),
  'image-10-hard': require('../../../assets/images/level-10-image.png'),

  // Coding Logic levels
  'code-1-easy': require('../../../assets/images/level-4-image.png'),
  'code-2-easy': require('../../../assets/images/level-5-image.png'),
  'code-3-easy': require('../../../assets/images/level-6-image.png'),
  'code-4-intermediate': require('../../../assets/images/level-7-image.png'),
  'code-5-intermediate': require('../../../assets/images/level-8-image.png'),
  'code-6-advanced': require('../../../assets/images/level-9-image.png'),

  // Copywriting levels
  'copywriting-1-easy': require('../../../assets/images/level-7-image.png'),
  'copywriting-2-easy': require('../../../assets/images/level-8-image.png'),
  'copywriting-3-easy': require('../../../assets/images/level-9-image.png'),
  'copywriting-4-intermediate': require('../../../assets/images/level-1-image.png'),
  'copywriting-5-intermediate': require('../../../assets/images/level-2-image.png'),
  'copywriting-6-advanced': require('../../../assets/images/level-3-image.png'),

  // Alternative ID formats for backward compatibility
  'level-1': require('../../../assets/images/level-1-image.png'),
  'level-2': require('../../../assets/images/level-2-image.png'),
  'level-3': require('../../../assets/images/level-3-image.png'),
  'level-4': require('../../../assets/images/level-4-image.png'),
  'level-5': require('../../../assets/images/level-5-image.png'),
  'level-6': require('../../../assets/images/level-6-image.png'),
  'level-7': require('../../../assets/images/level-7-image.png'),
  'level-8': require('../../../assets/images/level-8-image.png'),
  'level-9': require('../../../assets/images/level-9-image.png'),
  'level-10': require('../../../assets/images/level-10-image.png'),
} as const;

// Helper function to get local image asset for a level ID
function getLocalImageForLevel(levelId: string): any {
  const image = LEVEL_IMAGE_ASSETS[levelId as keyof typeof LEVEL_IMAGE_ASSETS];
  if (!image) {
    console.warn(`[Levels] No local image asset found for level ${levelId}, using fallback`);
    // Return first available image as fallback
    return Object.values(LEVEL_IMAGE_ASSETS)[0] || null;
  }
  return image;
}

// Process API levels to use local assets for images
export function processApiLevelsWithLocalAssets(apiLevels: Level[]): Level[] {
  return apiLevels.map(level => ({
    ...level,
    targetImageUrl: getLocalImageForLevel(level.id), // Override API image with local asset
  }));
}

// Validation helper to ensure we have enough assets for configured levels
function validateLevelAssets(): void {
  const configCount = LEVEL_CONFIGS.length;
  const assetCount = Object.keys(LEVEL_IMAGE_ASSETS).length;

  if (configCount > assetCount) {
    console.warn(`[Levels] More level configs (${configCount}) than image assets (${assetCount}). Some levels will use fallback images.`);
  }
}

/**
 * LEVEL CONFIGURATION - How to Add New Levels
 *
 * 1. Add image asset to: PromptPal/assets/images/level-X-image.png
 * 2. Add entry to levelImages object above with next index
 * 3. Add new config object to LEVEL_CONFIGS array below
 * 4. Update prerequisites of next level (if any)
 *
 * That's it! The system automatically maps configs to assets by index.
 */

// Level configuration for local fallback - matches API level IDs
// These are used when API is unavailable and should match your API level IDs
const LEVEL_CONFIGS = [
  // Image Generation Levels
  {
    id: 'image-1-easy',
    moduleId: 'image-generation',
    type: 'image' as const,
    title: 'Brass Key',
    difficulty: 'beginner' as const,
    hiddenPromptKeywords: ['brass', 'key', 'velvet', 'cushion', 'weathered'] as string[],
    style: 'Realistic',
    passingScore: 75,
    unlocked: true,
    prerequisites: [] as string[],
  },
  {
    id: 'image-2-easy',
    moduleId: 'image-generation',
    type: 'image' as const,
    title: 'Porcelain Teacups',
    difficulty: 'beginner' as const,
    hiddenPromptKeywords: ['porcelain', 'teacups', 'stack', 'marble', 'pedestal'] as string[],
    style: 'Elegant',
    passingScore: 75,
    unlocked: false,
    prerequisites: ['image-1-easy'] as string[],
  },
  {
    id: 'image-3-easy',
    moduleId: 'image-generation',
    type: 'image' as const,
    title: 'Rain Gear',
    difficulty: 'beginner' as const,
    hiddenPromptKeywords: ['yellow', 'raincoat', 'wooden', 'hook', 'umbrella', 'wet'] as string[],
    style: 'Realistic',
    passingScore: 75,
    unlocked: false,
    prerequisites: ['image-2-easy'] as string[],
  },

// Intermediate Image Levels
{
  id: 'image-4-intermediate',
  moduleId: 'image-generation',
  type: 'image' as const,
  title: 'Sunset Beach',
  difficulty: 'intermediate' as const,
  hiddenPromptKeywords: ['sunset', 'beach', 'waves', 'orange', 'sky', 'horizon', 'peaceful', 'golden'] as string[],
  style: 'Photorealistic',
  passingScore: 80,
  unlocked: false,
  prerequisites: ['image-3-easy'] as string[],
  hints: [
    'Focus on the warm color palette of sunset',
    'Include details about the ocean waves and beach texture',
    'Describe the sky gradient from orange to purple'
  ],
},

{
  id: 'image-5-intermediate',
  moduleId: 'image-generation',
  type: 'image' as const,
  title: 'Cyberpunk City',
  difficulty: 'intermediate' as const,
  hiddenPromptKeywords: ['neon', 'rain', 'buildings', 'futuristic', 'night', 'urban', 'glowing', 'dystopian'] as string[],
  style: 'Cyberpunk',
  passingScore: 80,
  unlocked: false,
  prerequisites: ['image-4-intermediate'] as string[],
  hints: [
    'Emphasize neon lighting and vibrant colors',
    'Include rain-soaked streets and reflections',
    'Describe the contrast between dark shadows and bright neon signs'
  ],
},

// Advanced Image Levels
{
  id: 'image-6-advanced',
  moduleId: 'image-generation',
  type: 'image' as const,
  title: 'Ancient Temple',
  difficulty: 'advanced' as const,
  hiddenPromptKeywords: ['ancient', 'temple', 'ruins', 'jungle', 'mysterious', 'stone', 'overgrown', 'archaeological', 'moss'] as string[],
  style: 'Cinematic',
  passingScore: 85,
  unlocked: false,
  prerequisites: ['image-5-intermediate'] as string[],
  hints: [
    'Describe the architectural details and weathered stone',
    'Include jungle vegetation overgrowing the structure',
    'Capture the mysterious and ancient atmosphere with lighting'
  ],
},

  // Coding Logic Levels - Beginner
  {
    id: 'code-1-easy',
    moduleId: 'coding-logic',
    type: 'code' as const,
    title: 'Sum Function',
    difficulty: 'beginner' as const,
    testCases: [
      {
        id: 'sum-1',
        name: 'Basic sum',
        input: [1, 2],
        expectedOutput: 3,
        description: 'Sum of 1 and 2 should be 3'
      },
      {
        id: 'sum-2',
        name: 'Sum with zero',
        input: [0, 5],
        expectedOutput: 5,
        description: 'Sum of 0 and 5 should be 5'
      },
      {
        id: 'sum-3',
        name: 'Negative numbers',
        input: [-1, 3],
        expectedOutput: 2,
        description: 'Sum of -1 and 3 should be 2'
      }
    ] as any,
    functionName: 'sum',
    language: 'javascript',
    passingScore: 75,
    unlocked: false,
    prerequisites: [] as string[],
  },
  {
    id: 'code-2-easy',
    moduleId: 'coding-logic',
    type: 'code' as const,
    title: 'Array Filter',
    difficulty: 'beginner' as const,
    testCases: [
      {
        id: 'filter-1',
        name: 'Filter even numbers',
        input: [[1, 2, 3, 4, 5, 6]],
        expectedOutput: [2, 4, 6],
        description: 'Filter array to keep only even numbers'
      },
      {
        id: 'filter-2',
        name: 'Filter strings longer than 3',
        input: [['a', 'ab', 'abc', 'abcd']],
        expectedOutput: ['abcd'],
        description: 'Filter array to keep strings longer than 3 characters'
      }
    ] as any,
    functionName: 'filterArray',
    language: 'javascript',
    passingScore: 75,
    unlocked: false,
    prerequisites: ['code-1-easy'] as string[],
  },
  {
    id: 'code-3-easy',
    moduleId: 'coding-logic',
    type: 'code' as const,
    title: 'String Reversal',
    difficulty: 'beginner' as const,
    testCases: [
      {
        id: 'reverse-1',
        name: 'Simple reversal',
        input: ['hello'],
        expectedOutput: 'olleh',
        description: 'Reverse the string "hello"'
      },
      {
        id: 'reverse-2',
        name: 'Empty string',
        input: [''],
        expectedOutput: '',
        description: 'Reverse an empty string'
      },
      {
        id: 'reverse-3',
        name: 'Single character',
        input: ['a'],
        expectedOutput: 'a',
        description: 'Reverse a single character string'
      }
    ] as any,
    functionName: 'reverseString',
    language: 'javascript',
    passingScore: 75,
    unlocked: false,
    prerequisites: ['code-2-easy'] as string[],
  },

  // Intermediate Coding Levels
  {
    id: 'code-4-intermediate',
    moduleId: 'coding-logic',
    type: 'code' as const,
    title: 'Array Manipulation',
    difficulty: 'intermediate' as const,
    moduleTitle: 'Advanced Arrays',
    requirementBrief: 'Write a prompt that instructs AI to create functions for array manipulation including filtering, mapping, and reducing arrays of objects.',
    testCases: [
      {
        id: 'array-filter-1',
        name: 'Filter array by condition',
        input: { array: [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}], operation: 'filter' },
        expectedOutput: [{id: 1, name: 'Alice'}],
        description: 'Filter array by condition'
      },
      {
        id: 'array-map-1',
        name: 'Map array values',
        input: { array: [1, 2, 3, 4, 5], operation: 'map' },
        expectedOutput: [2, 4, 6, 8, 10],
        description: 'Map array values'
      },
      {
        id: 'array-reduce-1',
        name: 'Reduce array to sum',
        input: { array: [1, 2, 3, 4, 5], operation: 'reduce' },
        expectedOutput: 15,
        description: 'Reduce array to sum'
      }
    ] as any,
    functionName: 'manipulateArray',
    language: 'javascript',
    passingScore: 80,
    unlocked: false,
    prerequisites: ['code-3-easy'] as string[],
    hints: [
      'Specify the input array structure clearly',
      'List all required operations (filter, map, reduce)',
      'Include edge cases (empty arrays, null values)'
    ],
    estimatedTime: 15,
    points: 150,
    tags: ['arrays', 'functions', 'intermediate'],
  },
  {
    id: 'code-5-intermediate',
    moduleId: 'coding-logic',
    type: 'code' as const,
    title: 'Async Operations',
    difficulty: 'intermediate' as const,
    moduleTitle: 'Async JavaScript',
    requirementBrief: 'Write a prompt that instructs AI to create functions for handling async operations including promises, async/await, and error handling.',
    testCases: [
      {
        id: 'async-promise-1',
        name: 'Chain promises correctly',
        input: { operation: 'promise-chain' },
        expectedOutput: { success: true, value: 'result' },
        description: 'Chain promises correctly'
      },
      {
        id: 'async-await-1',
        name: 'Use async/await pattern',
        input: { operation: 'async-await' },
        expectedOutput: { success: true, value: 'async-result' },
        description: 'Use async/await pattern'
      },
      {
        id: 'async-error-1',
        name: 'Handle errors gracefully',
        input: { operation: 'error-handling' },
        expectedOutput: { success: false, error: 'Invalid input' },
        description: 'Handle errors gracefully'
      }
    ] as any,
    functionName: 'handleAsync',
    language: 'javascript',
    passingScore: 80,
    unlocked: false,
    prerequisites: ['code-4-intermediate'] as string[],
    hints: [
      'Explain promise chaining',
      'Show async/await syntax',
      'Include try/catch for error handling'
    ],
    estimatedTime: 20,
    points: 175,
    tags: ['async', 'promises', 'intermediate'],
  },

  // Advanced Coding Level
  {
    id: 'code-6-advanced',
    moduleId: 'coding-logic',
    type: 'code' as const,
    title: 'Algorithm Design',
    difficulty: 'advanced' as const,
    moduleTitle: 'Advanced Algorithms',
    requirementBrief: 'Write a prompt that instructs AI to implement a binary search algorithm with proper time complexity analysis and edge case handling.',
    testCases: [
      {
        id: 'binary-search-1',
        name: 'Find existing element',
        input: { array: [1, 3, 5, 7, 9, 11], target: 7 },
        expectedOutput: { found: true, index: 3, comparisons: 3 },
        description: 'Find existing element'
      },
      {
        id: 'binary-search-2',
        name: 'Handle non-existent element',
        input: { array: [2, 4, 6, 8, 10], target: 5 },
        expectedOutput: { found: false, index: -1, comparisons: 3 },
        description: 'Handle non-existent element'
      },
      {
        id: 'binary-search-3',
        name: 'Handle single element',
        input: { array: [1], target: 1 },
        expectedOutput: { found: true, index: 0, comparisons: 1 },
        description: 'Handle single element'
      },
      {
        id: 'binary-search-4',
        name: 'Handle empty array',
        input: { array: [], target: 1 },
        expectedOutput: { found: false, index: -1, comparisons: 0 },
        description: 'Handle empty array'
      }
    ] as any,
    functionName: 'binarySearch',
    language: 'javascript',
    passingScore: 80,
    unlocked: false,
    prerequisites: ['code-5-intermediate'] as string[],
    hints: [
      'Specify O(log n) time complexity requirement',
      'Explain divide-and-conquer approach',
      'Include base case handling'
    ],
    estimatedTime: 25,
    points: 200,
    tags: ['algorithms', 'optimization', 'advanced'],
  },

  // Copywriting Levels - Beginner
  {
    id: 'copywriting-1-easy',
    moduleId: 'copywriting',
    type: 'copywriting' as const,
    title: 'Product Description',
    difficulty: 'beginner' as const,
    briefProduct: 'Wireless Bluetooth Headphones',
    briefTarget: 'Tech-savvy millennials aged 25-35',
    briefTone: 'Casual and enthusiastic',
    briefGoal: 'Drive online purchases',
    wordLimit: { min: 50, max: 150 },
    requiredElements: ['comfort', 'battery life', 'sound quality', 'price'],
    passingScore: 75,
    unlocked: false,
    prerequisites: [] as string[],
  },
  {
    id: 'copywriting-2-easy',
    moduleId: 'copywriting',
    type: 'copywriting' as const,
    title: 'Social Media Post',
    difficulty: 'beginner' as const,
    briefProduct: 'Eco-friendly reusable water bottle',
    briefTarget: 'Environmentally conscious young adults',
    briefTone: 'Inspiring and motivational',
    briefGoal: 'Increase brand awareness and engagement',
    wordLimit: { min: 30, max: 100 },
    requiredElements: ['sustainability', 'durability', 'design', 'call to action'],
    passingScore: 75,
    unlocked: false,
    prerequisites: ['copywriting-1-easy'] as string[],
  },
  {
    id: 'copywriting-3-easy',
    moduleId: 'copywriting',
    type: 'copywriting' as const,
    title: 'Email Newsletter',
    difficulty: 'beginner' as const,
    briefProduct: 'Fitness tracking smartwatch',
    briefTarget: 'Health-conscious professionals',
    briefTone: 'Professional yet approachable',
    briefGoal: 'Convert readers to customers',
    wordLimit: { min: 100, max: 200 },
    requiredElements: ['features', 'benefits', 'testimonials', 'limited time offer'],
    passingScore: 75,
    unlocked: false,
    prerequisites: ['copywriting-2-easy'] as string[],
  },

  // Intermediate Copywriting Levels
  {
    id: 'copywriting-4-intermediate',
    moduleId: 'copywriting',
    type: 'copywriting' as const,
    title: 'Email Marketing',
    difficulty: 'intermediate' as const,
    briefTitle: 'SaaS Product Launch Email',
    briefProduct: 'TaskFlow Pro - Project Management Software',
    briefTarget: 'Small Business Owners',
    briefTone: 'Professional yet approachable',
    briefGoal: 'Drive trial signups with limited-time offer',
    wordLimit: { min: 150, max: 250 },
    requiredElements: ['subject line', 'personalization', 'call-to-action', 'urgency'],
    metrics: [
      { name: 'Clarity', target: 8, weight: 0.25 },
      { name: 'Persuasion', target: 8, weight: 0.3 },
      { name: 'Tone Match', target: 8, weight: 0.2 },
      { name: 'CTA Strength', target: 8, weight: 0.25 }
    ] as { name: string; target: number; weight: number }[],
    hints: [
      'Focus on benefits, not features',
      'Use power words in subject line',
      'Personalize with recipient name',
      'Create scarcity with time limit'
    ],
    passingScore: 85,
    unlocked: false,
    prerequisites: ['copywriting-3-easy'] as string[],
    estimatedTime: 20,
    points: 150,
    tags: ['email', 'marketing', 'intermediate'],
  },
  {
    id: 'copywriting-5-intermediate',
    moduleId: 'copywriting',
    type: 'copywriting' as const,
    title: 'Social Media Copy',
    difficulty: 'intermediate' as const,
    briefTitle: 'Product Launch Twitter Campaign',
    briefProduct: 'FitTrack - Fitness App',
    briefTarget: 'Fitness Enthusiasts',
    briefTone: 'Energetic and motivating',
    briefGoal: 'Generate buzz and app downloads',
    wordLimit: { min: 100, max: 180 },
    requiredElements: ['hook', 'hashtags', 'emoji', 'call-to-action'],
    metrics: [
      { name: 'Engagement', target: 8, weight: 0.3 },
      { name: 'Brand Voice', target: 8, weight: 0.25 },
      { name: 'Clarity', target: 8, weight: 0.2 },
      { name: 'Hashtag Quality', target: 8, weight: 0.25 }
    ] as { name: string; target: number; weight: number }[],
    hints: [
      'Start with attention-grabbing hook',
      'Use relevant trending hashtags',
      'Add emoji for personality',
      'Keep it under 280 characters'
    ],
    passingScore: 85,
    unlocked: false,
    prerequisites: ['copywriting-4-intermediate'] as string[],
    estimatedTime: 15,
    points: 175,
    tags: ['social-media', 'twitter', 'intermediate'],
  },

  // Advanced Copywriting Level
  {
    id: 'copywriting-6-advanced',
    moduleId: 'copywriting',
    type: 'copywriting' as const,
    title: 'Long-Form Sales Page',
    difficulty: 'advanced' as const,
    briefTitle: 'Premium Course Sales Page',
    briefProduct: 'AI Mastery Academy - Online Course',
    briefTarget: 'Aspiring AI Professionals',
    briefTone: 'Authoritative and inspiring',
    briefGoal: 'Convert visitors to course enrollees',
    wordLimit: { min: 500, max: 800 },
    requiredElements: ['headline', 'subheadline', 'benefits', 'social-proof', 'guarantee', 'call-to-action'],
    metrics: [
      { name: 'Headline Impact', target: 9, weight: 0.2 },
      { name: 'Benefit Clarity', target: 8, weight: 0.2 },
      { name: 'Persuasion', target: 9, weight: 0.25 },
      { name: 'Trust Building', target: 8, weight: 0.2 },
      { name: 'CTA Conversion', target: 8, weight: 0.15 }
    ] as { name: string; target: number; weight: number }[],
    hints: [
      'Use PAS formula (Problem-Agitation-Solution)',
      'Include specific numbers and statistics',
      'Add testimonials as social proof',
      'Create urgency with limited spots'
    ],
    passingScore: 85,
    unlocked: false,
    prerequisites: ['copywriting-5-intermediate'] as string[],
    estimatedTime: 30,
    points: 200,
    tags: ['sales-page', 'long-form', 'advanced'],
  },
];

// Dynamic level data created from local assets when API is not available
export function createLocalLevelsFromAssets(): Level[] {
  // Validate we have enough assets for the configured levels
  validateLevelAssets();
  
  return LEVEL_CONFIGS.map((config) => {
    const baseLevel: any = {
      ...config,
      targetImageUrl: getLocalImageForLevel(config.id),
    };
    
    // Convert metrics from readonly to mutable array if it exists
    if ('metrics' in config && config.metrics) {
      baseLevel.metrics = [...config.metrics] as { name: string; target: number; weight: number }[];
    }
    
    return baseLevel as Level;
  });
}

// Convert API Task to Level format
function taskToLevel(task: Task, index: number = 0): Level {
  // Use local assets for target images - ignore API image URLs
  // Prefer task.id/documentId from API, fallback to generated ID
  const levelId = task.id || task.documentId || task.name || `task_${index}`;
  const localImageUrl = getLocalImageForLevel(levelId);

  // Determine difficulty based on Day or default to beginner
  let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  if (task.Day) {
    if (task.Day <= 3) difficulty = 'beginner';
    else if (task.Day <= 7) difficulty = 'intermediate';
    else difficulty = 'advanced';
  }

  // Prerequisites: All previous tasks in the sequence
  const prerequisites = index > 0
    ? Array.from({ length: index }, (_, i) => `task_${i}`)
    : [];

  return {
    id: levelId,
    type: 'image', // Default to image type since Task interface doesn't have type
    title: task.name || `Level ${index + 1}`, // Use task name as title
    difficulty,
    targetImageUrl: localImageUrl, // Always use local asset
    hiddenPromptKeywords: task.idealPrompt?.split(',').map(k => k.trim()) || [],
    passingScore: 75, // Default passing score since Task interface doesn't have it
    unlocked: index === 0, // First task is unlocked
    prerequisites,
  };
}

// Fetch levels from API
export async function fetchLevelsFromApi(): Promise<Level[]> {
  try {
    const tasks = await apiClient.getDailyTasks();
    if (tasks && tasks.length > 0) {
      return tasks.map((task, index) => taskToLevel(task, index));
    }
    // If no tasks from API, return empty array (no fallback data)
    return [];
  } catch (error) {
    console.warn('[Levels] Failed to fetch from API:', error);
    return [];
  }
}

// Fetch a single level by ID from API
export async function fetchLevelById(id: string): Promise<Level | undefined> {
  try {
       // Get level from API (returns api.ts Level type)
       const apiLevel = await apiClient.getLevelById(id);
    
       // Destructure metrics to exclude it from the spread
       const { metrics: apiMetrics, ...restApiLevel } = apiLevel;
       
       // Convert to store.ts Level type
       const level: Level = {
         ...restApiLevel,
         type: apiLevel.type as ChallengeType | undefined, // Cast string to ChallengeType
         unlocked: apiLevel.unlocked ?? false, // Ensure boolean
         // Convert metrics from old format to new format if present
         ...(apiMetrics && apiMetrics.length > 0
           ? {
               metrics: apiMetrics.map((m: any) => {
                 // Check if it's old format (label/value) or new format (name/target/weight)
                 if ('label' in m && 'value' in m) {
                   // Convert old format to new format
                   return {
                     name: m.label,
                     target: m.value,
                     weight: 1 / apiMetrics.length, // Equal weight distribution
                   };
                 }
                 // Already in new format
                 return m;
               }) as { name: string; target: number; weight: number }[],
             }
           : {}),
       };
    
    return level;
  } catch (error) {
    console.warn('[Levels] Failed to fetch level from API:', error);
    return getLevelById(id);
  }
}

// Legacy functions for backward compatibility
export function getLevelById(id: string): Level | undefined {
  // First try to find in local configs
  const localLevels = createLocalLevelsFromAssets();
  const localLevel = localLevels.find(level => level.id === id);
  if (localLevel) return localLevel;

  // If not found, return undefined (let API handle it)
  return undefined;
}

export function getLevelsByModuleId(moduleId: string): Level[] {
  // Get levels from local assets when API is not available
  const localLevels = createLocalLevelsFromAssets();
  return localLevels.filter(level => level.moduleId === moduleId);
}

export function getNextLevel(currentId: string): Level | undefined {
  const localLevels = createLocalLevelsFromAssets();
  const currentIndex = localLevels.findIndex(level => level.id === currentId);
  if (currentIndex === -1 || currentIndex === localLevels.length - 1) {
    return undefined;
  }
  return localLevels[currentIndex + 1];
}

export function getUnlockedLevels(): Level[] {
  const localLevels = createLocalLevelsFromAssets();
  return localLevels.filter(level => level.unlocked);
}

/**
 * Checks if a level is unlocked based on its prerequisites
 * @param level - The level to check
 * @param completedLevels - Array of completed level IDs
 * @returns Whether the level is unlocked
 */
export function isLevelUnlocked(level: Level, completedLevels: string[] = []): boolean {
  if (!level.prerequisites || level.prerequisites.length === 0) {
    return level.unlocked;
  }

  const allPrerequisitesMet = level.prerequisites.every(prereqId =>
    completedLevels.includes(prereqId)
  );

  return level.unlocked && allPrerequisitesMet;
}

/**
 * Gets all levels that should be unlocked based on completed levels
 * @param completedLevels - Array of completed level IDs
 * @returns Array of unlocked levels
 */
export function getUnlockedLevelsByProgress(completedLevels: string[]): Level[] {
  const localLevels = createLocalLevelsFromAssets();
  return localLevels.filter(level => isLevelUnlocked(level, completedLevels));
}

/**
 * Gets the next level that should be unlocked after completing a level
 * @param completedLevelId - The ID of the completed level
 * @returns The next level to unlock, or null if none
 */
export function getNextUnlockableLevel(completedLevelId: string): Level | null {
  const localLevels = createLocalLevelsFromAssets();
  const lockedLevels = localLevels.filter(level => !level.unlocked);

  return lockedLevels.find(level =>
    level.prerequisites?.includes(completedLevelId)
  ) || null;
}
// Export LEVELS for components that need it
export const LEVELS = createLocalLevelsFromAssets();