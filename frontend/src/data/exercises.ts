import { Exercise } from '../types/exercise';

export const mockExercises: Exercise[] = [
  {
    id: 'ex-1-array-sum',
    title: 'Sum of Array Elements',
    description:
      'Write a function that takes an array of numbers and returns the sum of all elements. This is a fundamental array operation that you will use frequently in programming.',
    difficulty: 'beginner',
    category: 'Arrays',
    estimatedTime: 10,
    language: 'javascript',
    instructions: [
      'Create a function named `sumArray` that accepts an array of numbers as a parameter',
      'Use a loop or array method to iterate through all elements',
      'Calculate and return the sum of all numbers in the array',
      'Handle edge cases like empty arrays (should return 0)',
    ],
    learningObjectives: [
      'Practice working with arrays in JavaScript',
      'Understand array iteration methods',
      'Learn to handle edge cases',
      'Master the reduce() method',
    ],
    tags: ['arrays', 'loops', 'reduce', 'fundamentals'],
    starterCode: `// Write your function here
function sumArray(numbers) {
  // Your code here
}

// Example usage:
// sumArray([1, 2, 3, 4, 5]) should return 15
// sumArray([]) should return 0
`,
    solution: `function sumArray(numbers) {
  // Handle empty array
  if (numbers.length === 0) {
    return 0;
  }

  // Use reduce to sum all elements
  return numbers.reduce((sum, num) => sum + num, 0);
}

// Alternative solution using a for loop:
// function sumArray(numbers) {
//   let sum = 0;
//   for (let i = 0; i < numbers.length; i++) {
//     sum += numbers[i];
//   }
//   return sum;
// }
`,
    testCases: [
      {
        id: 'test-1',
        name: 'Sum of positive numbers',
        input: [[1, 2, 3, 4, 5]],
        expectedOutput: 15,
      },
      {
        id: 'test-2',
        name: 'Sum with negative numbers',
        input: [[-5, 10, -3, 8]],
        expectedOutput: 10,
      },
      {
        id: 'test-3',
        name: 'Empty array',
        input: [[]],
        expectedOutput: 0,
      },
      {
        id: 'test-4',
        name: 'Single element',
        input: [[42]],
        expectedOutput: 42,
      },
      {
        id: 'test-5',
        name: 'Array with zeros',
        input: [[0, 0, 0, 5]],
        expectedOutput: 5,
      },
      {
        id: 'test-6',
        name: 'Large numbers',
        input: [[1000, 2000, 3000]],
        expectedOutput: 6000,
        hidden: true,
      },
    ],
    hints: [
      {
        id: 'hint-1',
        level: 1,
        content:
          'You can use the array reduce() method to accumulate values. It takes a callback function and an initial value.',
      },
      {
        id: 'hint-2',
        level: 2,
        content:
          'The reduce() method signature is: array.reduce((accumulator, currentValue) => accumulator + currentValue, initialValue). The initial value should be 0 for summing.',
      },
      {
        id: 'hint-3',
        level: 3,
        content:
          'Complete solution approach: Check if the array is empty first, then use reduce with 0 as the initial value: return numbers.reduce((sum, num) => sum + num, 0);',
      },
    ],
  },
  {
    id: 'ex-2-palindrome',
    title: 'Palindrome Checker',
    description:
      'Write a function that determines if a given string is a palindrome. A palindrome is a word, phrase, number, or other sequence of characters that reads the same forward and backward (ignoring spaces, punctuation, and capitalization).',
    difficulty: 'beginner',
    category: 'Strings',
    estimatedTime: 15,
    language: 'javascript',
    instructions: [
      'Create a function named `isPalindrome` that accepts a string parameter',
      'Remove all non-alphanumeric characters and convert to lowercase',
      'Check if the cleaned string reads the same forwards and backwards',
      'Return true if it is a palindrome, false otherwise',
    ],
    learningObjectives: [
      'Practice string manipulation in JavaScript',
      'Learn about regular expressions',
      'Understand string comparison techniques',
      'Master the two-pointer technique',
    ],
    tags: ['strings', 'algorithms', 'two-pointers'],
    starterCode: `// Write your function here
function isPalindrome(str) {
  // Your code here
}

// Example usage:
// isPalindrome("racecar") should return true
// isPalindrome("hello") should return false
// isPalindrome("A man, a plan, a canal: Panama") should return true
`,
    solution: `function isPalindrome(str) {
  // Remove non-alphanumeric characters and convert to lowercase
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Compare with reversed string
  const reversed = cleaned.split('').reverse().join('');

  return cleaned === reversed;
}

// Alternative solution using two pointers:
// function isPalindrome(str) {
//   const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
//   let left = 0;
//   let right = cleaned.length - 1;
//
//   while (left < right) {
//     if (cleaned[left] !== cleaned[right]) {
//       return false;
//     }
//     left++;
//     right--;
//   }
//
//   return true;
// }
`,
    testCases: [
      {
        id: 'test-1',
        name: 'Simple palindrome',
        input: ['racecar'],
        expectedOutput: true,
      },
      {
        id: 'test-2',
        name: 'Not a palindrome',
        input: ['hello'],
        expectedOutput: false,
      },
      {
        id: 'test-3',
        name: 'Single character',
        input: ['a'],
        expectedOutput: true,
      },
      {
        id: 'test-4',
        name: 'Palindrome with spaces',
        input: ['race car'],
        expectedOutput: true,
      },
      {
        id: 'test-5',
        name: 'Palindrome with punctuation',
        input: ['A man, a plan, a canal: Panama'],
        expectedOutput: true,
      },
      {
        id: 'test-6',
        name: 'Mixed case palindrome',
        input: ['RaceCar'],
        expectedOutput: true,
      },
      {
        id: 'test-7',
        name: 'Empty string',
        input: [''],
        expectedOutput: true,
        hidden: true,
      },
    ],
    hints: [
      {
        id: 'hint-1',
        level: 1,
        content:
          'First, clean the string by removing spaces, punctuation, and converting to lowercase. You can use the replace() method with a regular expression.',
      },
      {
        id: 'hint-2',
        level: 2,
        content:
          'After cleaning, you can reverse the string and compare it with the original. Use split("").reverse().join("") to reverse a string.',
      },
      {
        id: 'hint-3',
        level: 3,
        content:
          'Use /[^a-z0-9]/g regex to remove non-alphanumeric characters. Then compare: cleaned === cleaned.split("").reverse().join("")',
      },
    ],
  },
  {
    id: 'ex-3-fizzbuzz',
    title: 'FizzBuzz',
    description:
      'Implement the classic FizzBuzz problem. Write a function that returns an array of strings from 1 to n, but for multiples of 3 return "Fizz", for multiples of 5 return "Buzz", and for multiples of both 3 and 5 return "FizzBuzz".',
    difficulty: 'beginner',
    category: 'Logic',
    estimatedTime: 15,
    language: 'javascript',
    instructions: [
      'Create a function named `fizzBuzz` that accepts a number n',
      'Generate an array with n elements',
      'For each position (1 to n): if divisible by 3 and 5, add "FizzBuzz"',
      'If only divisible by 3, add "Fizz"',
      'If only divisible by 5, add "Buzz"',
      'Otherwise, add the number as a string',
    ],
    learningObjectives: [
      'Practice conditional logic',
      'Understand modulo operator',
      'Learn array construction',
      'Master the order of conditions',
    ],
    tags: ['logic', 'conditionals', 'arrays', 'classic-problems'],
    starterCode: `// Write your function here
function fizzBuzz(n) {
  // Your code here
}

// Example usage:
// fizzBuzz(15) should return ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"]
`,
    solution: `function fizzBuzz(n) {
  const result = [];

  for (let i = 1; i <= n; i++) {
    if (i % 3 === 0 && i % 5 === 0) {
      result.push("FizzBuzz");
    } else if (i % 3 === 0) {
      result.push("Fizz");
    } else if (i % 5 === 0) {
      result.push("Buzz");
    } else {
      result.push(String(i));
    }
  }

  return result;
}

// More concise alternative:
// function fizzBuzz(n) {
//   return Array.from({ length: n }, (_, i) => {
//     i++;
//     if (i % 15 === 0) return "FizzBuzz";
//     if (i % 3 === 0) return "Fizz";
//     if (i % 5 === 0) return "Buzz";
//     return String(i);
//   });
// }
`,
    testCases: [
      {
        id: 'test-1',
        name: 'FizzBuzz for 15',
        input: [15],
        expectedOutput: ['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz'],
      },
      {
        id: 'test-2',
        name: 'FizzBuzz for 5',
        input: [5],
        expectedOutput: ['1', '2', 'Fizz', '4', 'Buzz'],
      },
      {
        id: 'test-3',
        name: 'FizzBuzz for 3',
        input: [3],
        expectedOutput: ['1', '2', 'Fizz'],
      },
      {
        id: 'test-4',
        name: 'FizzBuzz for 1',
        input: [1],
        expectedOutput: ['1'],
      },
      {
        id: 'test-5',
        name: 'FizzBuzz for 30 (hidden)',
        input: [30],
        expectedOutput: [
          '1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz',
          '11', 'Fizz', '13', '14', 'FizzBuzz', '16', '17', 'Fizz', '19', 'Buzz',
          'Fizz', '22', '23', 'Fizz', 'Buzz', '26', 'Fizz', '28', '29', 'FizzBuzz'
        ],
        hidden: true,
      },
    ],
    hints: [
      {
        id: 'hint-1',
        level: 1,
        content:
          'Use a for loop from 1 to n. For each number, check divisibility using the modulo operator (%). Remember to check the condition for both 3 AND 5 first!',
      },
      {
        id: 'hint-2',
        level: 2,
        content:
          'The order of conditions matters! Check for divisibility by both 3 and 5 first (i % 3 === 0 && i % 5 === 0), then check for 3 only, then 5 only.',
      },
      {
        id: 'hint-3',
        level: 3,
        content:
          'Tip: A number divisible by both 3 and 5 is divisible by 15. You can check (i % 15 === 0) as a shortcut for the first condition.',
      },
    ],
  },
  {
    id: 'ex-4-find-max',
    title: 'Find Maximum Number',
    description:
      'Write a function that finds the maximum number in an array. Do not use Math.max() or array methods like sort(). Implement the algorithm yourself using a loop.',
    difficulty: 'beginner',
    category: 'Arrays',
    estimatedTime: 10,
    language: 'javascript',
    instructions: [
      'Create a function named `findMax` that accepts an array of numbers',
      'Handle the edge case of an empty array (return null or undefined)',
      'Use a loop to iterate through the array',
      'Keep track of the maximum value found',
      'Return the maximum value',
    ],
    learningObjectives: [
      'Understand array traversal',
      'Practice variable tracking in loops',
      'Learn algorithm implementation',
      'Handle edge cases',
    ],
    tags: ['arrays', 'algorithms', 'loops'],
    starterCode: `// Write your function here
function findMax(numbers) {
  // Your code here
}

// Example usage:
// findMax([3, 1, 4, 1, 5, 9]) should return 9
// findMax([-5, -2, -10]) should return -2
// findMax([]) should return null
`,
    solution: `function findMax(numbers) {
  // Handle empty array
  if (numbers.length === 0) {
    return null;
  }

  // Start with the first element as max
  let max = numbers[0];

  // Iterate through the rest of the array
  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] > max) {
      max = numbers[i];
    }
  }

  return max;
}
`,
    testCases: [
      {
        id: 'test-1',
        name: 'Positive numbers',
        input: [[3, 1, 4, 1, 5, 9]],
        expectedOutput: 9,
      },
      {
        id: 'test-2',
        name: 'Negative numbers',
        input: [[-5, -2, -10, -1]],
        expectedOutput: -1,
      },
      {
        id: 'test-3',
        name: 'Mixed numbers',
        input: [[-5, 0, 5, -10, 3]],
        expectedOutput: 5,
      },
      {
        id: 'test-4',
        name: 'Single element',
        input: [[42]],
        expectedOutput: 42,
      },
      {
        id: 'test-5',
        name: 'Empty array',
        input: [[]],
        expectedOutput: null,
      },
      {
        id: 'test-6',
        name: 'All same values',
        input: [[7, 7, 7, 7]],
        expectedOutput: 7,
        hidden: true,
      },
    ],
    hints: [
      {
        id: 'hint-1',
        level: 1,
        content:
          'Initialize a variable to hold the maximum value. A good starting point is the first element of the array.',
      },
      {
        id: 'hint-2',
        level: 2,
        content:
          'Loop through the array starting from index 1. Compare each element with your max variable and update it if you find a larger number.',
      },
      {
        id: 'hint-3',
        level: 3,
        content:
          'Remember to check if the array is empty at the beginning and return null. Then use: let max = numbers[0]; for (let i = 1; i < numbers.length; i++) { if (numbers[i] > max) max = numbers[i]; }',
      },
    ],
  },
];
